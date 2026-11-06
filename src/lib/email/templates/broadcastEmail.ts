import { LEGAL_ENTITY } from '@/lib/constants'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function resolveAppUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://otwptn.com'
  return base.replace(/\/+$/, '')
}

// Turns a stored cta_url (relative path or absolute https URL) into an absolute link.
export function absoluteCtaUrl(ctaUrl: string | null | undefined): string | null {
  const value = ctaUrl?.trim()
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/') && !value.startsWith('//')) return `${resolveAppUrl()}${value}`
  return null
}

export function renderBroadcastEmail(params: {
  title: string
  message: string
  ctaUrl?: string | null
  recipientName?: string | null
}): { subject: string; html: string } {
  const { title, message, recipientName } = params
  const link = absoluteCtaUrl(params.ctaUrl)
  const firstName = recipientName?.trim().split(/\s+/)[0]
  const greeting = firstName ? `Halo ${escapeHtml(firstName)},` : 'Halo,'
  const body = escapeHtml(message).replace(/\r?\n/g, '<br />')

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 20px; border: 1px solid #f1f1ef;">
      <div style="margin-bottom: 20px;">
        <span style="color: #b45309; font-size: 22px; font-weight: 900;">otwptn</span>
      </div>
      <h2 style="color: #111827; font-size: 20px; margin: 0 0 12px 0;">${escapeHtml(title)}</h2>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.7; margin: 0 0 8px 0;">${greeting}</p>
      <p style="color: #374151; font-size: 14px; line-height: 1.7; margin: 0 0 20px 0;">${body}</p>
      ${
        link
          ? `<div style="margin: 24px 0;">
        <a href="${escapeHtml(link)}" style="background: #ffd400; color: #111827; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-weight: 800; font-size: 13px; display: inline-block;">Buka tautan</a>
      </div>`
          : ''
      }
      <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; color: #9ca3af; font-size: 11px;">
        Kamu menerima email ini karena terdaftar di otwptn. ${escapeHtml(LEGAL_ENTITY.name)}
      </div>
    </div>
  `

  return { subject: `[otwptn] ${title}`, html }
}
