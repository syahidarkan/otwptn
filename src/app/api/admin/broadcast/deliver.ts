import type { SupabaseClient } from '@supabase/supabase-js'
import { sendUniversalEmail } from '@/lib/email/send'
import { renderBroadcastEmail, absoluteCtaUrl } from '@/lib/email/templates/broadcastEmail'
import { normalizePhone, type Recipient } from './audience'

export type Channel = 'in_app' | 'email' | 'whatsapp' | 'banner'

export interface DeliveryPayload {
  broadcastId: string
  title: string
  message: string
  ctaUrl: string | null
}

export interface DeliveryResult {
  sent: number
  failed: number
  note?: string
}

type Progress = (sent: number, failed: number) => Promise<void>

// A send runs inside after() with maxDuration 300s, so each channel is capped to what fits.
export const LIMITS = { email: 1000, whatsapp: 120 }
const DEADLINE_MS = 270_000
const EMAIL_BATCH = 4
const EMAIL_WINDOW_MS = 1100
const WA_GAP_MS = 1800
const INSERT_CHUNK = 500

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY || (!!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD)
}

export function whatsappConfig(): { url: string; token: string } | null {
  const url = process.env.WA_SERVICE_URL?.replace(/\/+$/, '')
  const token = process.env.WA_SERVICE_TOKEN
  if (!url || !token) return null
  return { url, token }
}

export async function whatsappConnected(cfg: { url: string; token: string }): Promise<boolean> {
  try {
    const res = await fetch(`${cfg.url}/status`, {
      headers: { 'x-service-token': cfg.token },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return false
    const data = (await res.json()) as { status?: string }
    return data.status === 'connected'
  } catch {
    return false
  }
}

export function sendableRecipients(channel: Channel, recipients: Recipient[]): Recipient[] {
  if (channel === 'email') return recipients.filter(r => !!r.email?.trim())
  if (channel === 'whatsapp') return recipients.filter(r => normalizePhone(r.phone) !== null)
  return recipients
}

async function deliverInApp(
  db: SupabaseClient,
  payload: DeliveryPayload,
  recipients: Recipient[],
  progress: Progress,
): Promise<DeliveryResult> {
  let sent = 0
  let failed = 0
  let note: string | undefined

  for (let i = 0; i < recipients.length; i += INSERT_CHUNK) {
    const chunk = recipients.slice(i, i + INSERT_CHUNK)
    const { error } = await db.from('notifications').insert(
      chunk.map(r => ({
        user_id: r.id,
        broadcast_id: payload.broadcastId,
        title: payload.title,
        message: payload.message,
        cta_url: payload.ctaUrl,
        kind: 'broadcast',
      })),
    )
    if (error) {
      failed += chunk.length
      note = `Gagal menyimpan notifikasi: ${error.message}`
    } else {
      sent += chunk.length
    }
    await progress(sent, failed)
  }

  return { sent, failed, note }
}

async function deliverEmail(
  payload: DeliveryPayload,
  recipients: Recipient[],
  progress: Progress,
  startedAt: number,
): Promise<DeliveryResult> {
  let sent = 0
  let failed = 0
  let note: string | undefined

  for (let i = 0; i < recipients.length; i += EMAIL_BATCH) {
    if (Date.now() - startedAt > DEADLINE_MS) {
      failed += recipients.length - i
      note = 'Waktu proses habis, sisa penerima belum terkirim. Kirim ulang ke segmen yang lebih kecil.'
      break
    }

    const batchStart = Date.now()
    const batch = recipients.slice(i, i + EMAIL_BATCH)
    const results = await Promise.all(
      batch.map(async r => {
        try {
          const { subject, html } = renderBroadcastEmail({
            title: payload.title,
            message: payload.message,
            ctaUrl: payload.ctaUrl,
            recipientName: r.full_name,
          })
          const res = await sendUniversalEmail({ to: r.email as string, subject, html })
          // The simulator only logs to the console, it never delivers anything.
          return res.success && res.provider !== 'simulator'
        } catch {
          return false
        }
      }),
    )

    for (const ok of results) {
      if (ok) sent++
      else failed++
    }
    await progress(sent, failed)

    const elapsed = Date.now() - batchStart
    if (elapsed < EMAIL_WINDOW_MS && i + EMAIL_BATCH < recipients.length) {
      await sleep(EMAIL_WINDOW_MS - elapsed)
    }
  }

  return { sent, failed, note }
}

async function deliverWhatsapp(
  cfg: { url: string; token: string },
  payload: DeliveryPayload,
  recipients: Recipient[],
  progress: Progress,
  startedAt: number,
): Promise<DeliveryResult> {
  let sent = 0
  let failed = 0
  let note: string | undefined

  const link = absoluteCtaUrl(payload.ctaUrl)
  const text = `*${payload.title}*\n\n${payload.message}${link ? `\n\n${link}` : ''}`

  for (let i = 0; i < recipients.length; i++) {
    if (Date.now() - startedAt > DEADLINE_MS) {
      failed += recipients.length - i
      note = 'Waktu proses habis, sisa penerima belum terkirim.'
      break
    }

    const phone = normalizePhone(recipients[i].phone)
    let ok = false
    if (phone) {
      try {
        const res = await fetch(`${cfg.url}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-service-token': cfg.token },
          body: JSON.stringify({ to: phone, text }),
          signal: AbortSignal.timeout(15000),
        })
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean }
        ok = res.ok && data.ok === true
      } catch {
        ok = false
      }
    }

    if (ok) sent++
    else failed++
    if ((i + 1) % 5 === 0 || i === recipients.length - 1) await progress(sent, failed)
    if (i < recipients.length - 1) await sleep(WA_GAP_MS)
  }

  return { sent, failed, note }
}

export async function deliver(
  db: SupabaseClient,
  channel: Exclude<Channel, 'banner'>,
  payload: DeliveryPayload,
  recipients: Recipient[],
  progress: Progress,
): Promise<DeliveryResult> {
  const startedAt = Date.now()
  if (channel === 'in_app') return deliverInApp(db, payload, recipients, progress)
  if (channel === 'email') return deliverEmail(payload, recipients, progress, startedAt)

  const cfg = whatsappConfig()
  if (!cfg) {
    return { sent: 0, failed: recipients.length, note: 'WhatsApp belum terhubung' }
  }
  return deliverWhatsapp(cfg, payload, recipients, progress, startedAt)
}
