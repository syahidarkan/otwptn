import { NextResponse, after } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from './serviceClient'
import {
  AUDIENCES,
  filterAudience,
  getAllCounts,
  loadDirectory,
  selfRecipient,
} from './audience'
import {
  LIMITS,
  deliver,
  emailConfigured,
  sendableRecipients,
  whatsappConfig,
  whatsappConnected,
} from './deliver'

// Delivery runs in after() so a big send does not hold the admin's request open.
export const maxDuration = 300

const BROADCAST_FIELDS =
  'id, title, message, cta_url, channel, audience, recipient_count, sent_count, failed_count, status, is_test, banner_active, error_note, created_at, completed_at'

async function requireAdmin(): Promise<{ userId: string } | { error: NextResponse }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()
  if (!profile?.is_admin) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { userId: user.id }
}

const ctaSchema = z
  .string()
  .trim()
  .max(500, 'Tautan terlalu panjang')
  .refine(v => v === '' || /^https?:\/\//i.test(v) || (v.startsWith('/') && !v.startsWith('//')), {
    message: 'Tautan harus diawali "/" (halaman OtwPTN) atau "https://"',
  })

const bodySchema = z.object({
  channel: z.enum(['in_app', 'email', 'whatsapp', 'banner']),
  audience: z.enum(AUDIENCES),
  title: z.string().trim().min(3, 'Judul minimal 3 karakter').max(120, 'Judul maksimal 120 karakter'),
  message: z.string().trim().min(3, 'Pesan minimal 3 karakter').max(2000, 'Pesan maksimal 2000 karakter'),
  ctaUrl: ctaSchema.optional().default(''),
  expectedRecipients: z.number().int().min(0),
  idempotencyKey: z.string().min(8).max(100),
  test: z.boolean().optional().default(false),
})

async function expireStaleBroadcasts(db: ReturnType<typeof createServiceClient>) {
  // after() can be cut off by the platform; never leave a row "sending" forever.
  const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const note = 'Proses terhenti sebelum selesai'
  await db
    .from('broadcasts')
    .update({ status: 'partial', error_note: note, completed_at: new Date().toISOString() })
    .eq('status', 'sending')
    .gt('sent_count', 0)
    .lt('created_at', cutoff)
  await db
    .from('broadcasts')
    .update({ status: 'failed', error_note: note, completed_at: new Date().toISOString() })
    .eq('status', 'sending')
    .eq('sent_count', 0)
    .lt('created_at', cutoff)
}

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  try {
    const db = createServiceClient()
    await expireStaleBroadcasts(db)

    const wa = whatsappConfig()
    const [dir, historyRes, waConnected] = await Promise.all([
      loadDirectory(db),
      db.from('broadcasts').select(BROADCAST_FIELDS).order('created_at', { ascending: false }).limit(50),
      wa ? whatsappConnected(wa) : Promise.resolve(false),
    ])

    return NextResponse.json({
      counts: getAllCounts(dir),
      history: historyRes.data ?? [],
      capabilities: {
        email: emailConfigured(),
        whatsapp: !wa ? 'not_configured' : waConnected ? 'connected' : 'disconnected',
      },
      limits: LIMITS,
    })
  } catch (err) {
    console.error('[admin/broadcast] GET failed:', err)
    return NextResponse.json({ error: 'Gagal memuat data broadcast' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid' }, { status: 400 })
  }
  const body = parsed.data
  const ctaUrl = body.ctaUrl || null

  if (body.test && body.channel === 'banner') {
    return NextResponse.json({ error: 'Banner tidak bisa dikirim sebagai tes' }, { status: 400 })
  }

  try {
    const db = createServiceClient()

    // Channel readiness: never accept a send that cannot actually be delivered.
    if (body.channel === 'email' && !emailConfigured()) {
      return NextResponse.json(
        { error: 'Email belum dikonfigurasi (RESEND_API_KEY atau GMAIL_USER dan GMAIL_APP_PASSWORD kosong)' },
        { status: 503 },
      )
    }
    if (body.channel === 'whatsapp') {
      const cfg = whatsappConfig()
      if (!cfg) {
        return NextResponse.json(
          { error: 'WhatsApp belum terhubung (WA_SERVICE_URL atau WA_SERVICE_TOKEN belum diset)' },
          { status: 503 },
        )
      }
      if (!(await whatsappConnected(cfg))) {
        return NextResponse.json(
          { error: 'WhatsApp belum terhubung. Scan QR dulu di menu WhatsApp Admin.' },
          { status: 503 },
        )
      }
    }

    const dir = await loadDirectory(db)
    const audienceList = body.test ? selfRecipient(dir, auth.userId) : filterAudience(dir, body.audience)
    const targets = body.channel === 'banner' ? audienceList : sendableRecipients(body.channel, audienceList)

    if (targets.length === 0) {
      return NextResponse.json({ error: 'Tidak ada penerima yang bisa dijangkau lewat channel ini' }, { status: 400 })
    }
    if (targets.length !== body.expectedRecipients) {
      return NextResponse.json(
        {
          error: `Jumlah penerima berubah dari ${body.expectedRecipients} menjadi ${targets.length}. Periksa lagi lalu kirim ulang.`,
          code: 'RECIPIENT_MISMATCH',
          actual: targets.length,
        },
        { status: 409 },
      )
    }
    if (!body.test && body.channel === 'email' && targets.length > LIMITS.email) {
      return NextResponse.json(
        { error: `Email maksimal ${LIMITS.email} penerima sekali kirim. Pilih segmen yang lebih kecil.` },
        { status: 400 },
      )
    }
    if (!body.test && body.channel === 'whatsapp' && targets.length > LIMITS.whatsapp) {
      return NextResponse.json(
        { error: `WhatsApp maksimal ${LIMITS.whatsapp} penerima sekali kirim supaya nomor aman. Pilih segmen yang lebih kecil.` },
        { status: 400 },
      )
    }

    const skipped = audienceList.length - targets.length
    const skippedNote =
      skipped > 0
        ? `${skipped} penerima dilewati karena tidak punya ${body.channel === 'email' ? 'email' : 'nomor WhatsApp valid'}`
        : null
    const isBanner = body.channel === 'banner'
    const now = new Date().toISOString()

    const { data: row, error: insertError } = await db
      .from('broadcasts')
      .insert({
        title: body.title,
        message: body.message,
        cta_url: ctaUrl,
        channel: body.channel,
        audience: body.test ? 'self' : body.audience,
        recipient_count: targets.length,
        sent_count: isBanner ? targets.length : 0,
        failed_count: 0,
        status: isBanner ? 'sent' : 'sending',
        is_test: body.test,
        banner_active: isBanner,
        idempotency_key: body.idempotencyKey,
        error_note: skippedNote,
        created_by: auth.userId,
        completed_at: isBanner ? now : null,
      })
      .select(BROADCAST_FIELDS)
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        const { data: existing } = await db
          .from('broadcasts')
          .select(BROADCAST_FIELDS)
          .eq('idempotency_key', body.idempotencyKey)
          .maybeSingle()
        return NextResponse.json({ broadcast: existing, duplicate: true })
      }
      console.error('[admin/broadcast] insert failed:', insertError)
      return NextResponse.json({ error: 'Gagal menyimpan broadcast' }, { status: 500 })
    }

    if (body.channel === 'banner') {
      await db.from('broadcasts').update({ banner_active: false }).eq('banner_active', true).neq('id', row.id)
      return NextResponse.json({ broadcast: row }, { status: 201 })
    }

    const channel = body.channel
    after(async () => {
      try {
        const result = await deliver(
          db,
          channel,
          { broadcastId: row.id, title: body.title, message: body.message, ctaUrl },
          targets,
          async (sent, failed) => {
            await db.from('broadcasts').update({ sent_count: sent, failed_count: failed }).eq('id', row.id)
          },
        )
        const status = result.failed === 0 ? 'sent' : result.sent === 0 ? 'failed' : 'partial'
        await db
          .from('broadcasts')
          .update({
            sent_count: result.sent,
            failed_count: result.failed,
            status,
            error_note: [skippedNote, result.note].filter(Boolean).join('. ') || null,
            completed_at: new Date().toISOString(),
          })
          .eq('id', row.id)
      } catch (err) {
        console.error('[admin/broadcast] delivery crashed:', err)
        await db
          .from('broadcasts')
          .update({
            status: 'failed',
            error_note: 'Pengiriman berhenti karena error server',
            completed_at: new Date().toISOString(),
          })
          .eq('id', row.id)
      }
    })

    return NextResponse.json({ broadcast: row }, { status: 202 })
  } catch (err) {
    console.error('[admin/broadcast] POST failed:', err)
    return NextResponse.json({ error: 'Gagal mengirim broadcast' }, { status: 500 })
  }
}

// Turn off an active banner.
export async function DELETE(request: Request) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const id = new URL(request.url).searchParams.get('id')
  if (!id || !z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 })
  }

  try {
    const db = createServiceClient()
    const { error } = await db.from('broadcasts').update({ banner_active: false }).eq('id', id).eq('channel', 'banner')
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/broadcast] DELETE failed:', err)
    return NextResponse.json({ error: 'Gagal menonaktifkan banner' }, { status: 500 })
  }
}
