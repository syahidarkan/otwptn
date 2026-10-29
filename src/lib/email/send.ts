import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import type React from 'react'
import { LEGAL_ENTITY } from '@/lib/constants'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

/**
 * Backward-compatible sendEmail for React Email templates
 */
export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: React.ReactElement
}) {
  const html = await render(react)
  return sendUniversalEmail({ to, subject, html })
}

/**
 * Universal Transporter for Gmail App Password SMTP
 */
function getGmailTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) return null

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
}

/**
 * Kirim email secara fleksibel melalui Resend API atau Gmail App Password
 */
export async function sendUniversalEmail(options: SendEmailOptions): Promise<{ success: boolean; provider: string; messageId?: string; error?: string }> {
  const { to, subject, html, text } = options
  const recipients = Array.isArray(to) ? to : [to]
  const fromName = 'OtwPTN Indonesia'
  const fromAddress = process.env.EMAIL_FROM || process.env.GMAIL_USER || 'halo@otwptn.id'

  // 1. Prioritas Pertama: RESEND API (Jika ada API Key)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${fromName} <${fromAddress}>`,
          to: recipients,
          subject,
          html,
          text: text || html.replace(/<[^>]*>?/gm, ''),
        }),
      })

      const data = await res.json()
      if (res.ok) {
        return { success: true, provider: 'resend', messageId: data.id }
      }
      console.warn('Resend API returned error, falling back to Gmail SMTP...', data)
    } catch (err: any) {
      console.warn('Resend API failed, trying Gmail SMTP:', err.message)
    }
  }

  // 2. Prioritas Kedua: GMAIL SMTP APP PASSWORD
  const gmailTransporter = getGmailTransporter()
  if (gmailTransporter) {
    try {
      const info = await gmailTransporter.sendMail({
        from: `"${fromName}" <${process.env.GMAIL_USER}>`,
        to: recipients.join(', '),
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, ''),
      })
      return { success: true, provider: 'gmail_smtp', messageId: info.messageId }
    } catch (err: any) {
      console.error('Gmail SMTP error:', err)
      return { success: false, provider: 'gmail_smtp', error: err.message }
    }
  }

  // 3. Fallback Development Simulator (jika belum mengisi API key di env lokal)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`[SIMULATOR EMAIL OTWPTN] Kepada: ${recipients.join(', ')}`)
  console.log(`Subjek: ${subject}`)
  console.log(`Pengirim: ${LEGAL_ENTITY.name} <${fromAddress}>`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  return { success: true, provider: 'simulator', messageId: `mock-${Date.now()}` }
}

/**
 * 1. Email Konfirmasi Pendaftaran & Pembayaran Berhasil (Invoice)
 */
export async function sendPaymentSuccessEmail({
  email,
  name,
  packageName,
  price,
  invoiceNo,
  targetPTN,
}: {
  email: string
  name: string
  packageName: string
  price: number
  invoiceNo: string
  targetPTN?: string
}) {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 20px; border: 1px solid #f1f1ef;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ffd400; font-size: 28px; margin: 0; font-weight: 900;">otwptn</h1>
        <p style="color: #6b7280; font-size: 12px; margin-top: 4px;">Platform Lolos PTN Non-Tes · ${LEGAL_ENTITY.name}</p>
      </div>

      <div style="background: #fefce8; padding: 20px; border-radius: 16px; margin-bottom: 20px;">
        <h2 style="color: #713f12; font-size: 18px; margin: 0 0 8px 0;">🎉 Pembayaran Berhasil Dikonfirmasi!</h2>
        <p style="color: #854d0e; font-size: 14px; margin: 0; line-height: 1.6;">
          Halo <strong>${name}</strong>, selamat bergabung di <strong>Paket ${packageName}</strong>. Akunmu sekarang sudah aktif dengan akses penuh ke seluruh modul, AI tools, dan mentoring alumni.
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;">Nomor Invoice</td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #111827; border-bottom: 1px solid #f3f4f6;">${invoiceNo}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;">Paket Bimbingan</td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #111827; border-bottom: 1px solid #f3f4f6;">${packageName}</td>
        </tr>
        ${targetPTN ? `
        <tr>
          <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;">Target Kampus / Jalur</td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #111827; border-bottom: 1px solid #f3f4f6;">${targetPTN}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 12px 0; color: #111827; font-weight: bold; font-size: 15px;">Total Terbayar</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 900; color: #b45309; font-size: 17px;">Rp ${price.toLocaleString('id-ID')}</td>
        </tr>
      </table>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://otwptn.id/dashboard" style="background: #ffd400; color: #111827; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 800; font-size: 14px; display: inline-block;">
          Masuk ke Dashboard Siswa →
        </a>
      </div>

      <div style="border-top: 1px solid #f3f4f6; padding-top: 20px; text-align: center; color: #9ca3af; font-size: 11px;">
        © ${new Date().getFullYear()} ${LEGAL_ENTITY.name} · Dukungan WhatsApp: 0812-3456-7890
      </div>
    </div>
  `

  return sendUniversalEmail({
    to: email,
    subject: `[otwptn] Bukti Pembayaran Resmi - Paket ${packageName} (${invoiceNo})`,
    html,
  })
}

/**
 * 2. Email Notifikasi Mentee Dapat Kakak Mentor
 */
export async function sendMentorAssignedEmail({
  menteeEmail,
  menteeName,
  mentorName,
  mentorCampus,
  mentorMajor,
  waLink,
}: {
  menteeEmail: string
  menteeName: string
  mentorName: string
  mentorCampus: string
  mentorMajor: string
  waLink?: string
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 20px;">
      <h2 style="color: #111827; font-size: 20px;">Halo ${menteeName}! Kakak Mentormu Telah Siap 🎓</h2>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
        Kabar gembira! Kamu telah di-assign dengan kakak mentor alumni resmi dari <strong>${mentorCampus}</strong>:
      </p>
      <div style="background: #f9fafb; padding: 16px; border-radius: 14px; margin: 16px 0;">
        <p style="margin: 0; font-weight: bold; color: #111827; font-size: 15px;">${mentorName}</p>
        <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">${mentorCampus} · ${mentorMajor}</p>
      </div>
      <p style="color: #4b5563; font-size: 13px;">Kakak mentor akan membantumu mereview essay, membedah portofolio, dan sesi 1-on-1 Zoom.</p>
      ${waLink ? `
      <div style="margin: 20px 0;">
        <a href="${waLink}" style="background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 99px; font-weight: bold; font-size: 13px; display: inline-block;">
          Hubungi Kakak Mentor di WhatsApp
        </a>
      </div>` : ''}
    </div>
  `

  return sendUniversalEmail({
    to: menteeEmail,
    subject: `[otwptn] Kamu telah dihubungkan dengan Mentor ${mentorName} (${mentorCampus})!`,
    html,
  })
}

/**
 * 3. Email Notifikasi Transfer Honor Mentor Berhasil
 */
export async function sendMentorPayoutEmail({
  mentorEmail,
  mentorName,
  amount,
  bankName,
  accountNo,
}: {
  mentorEmail: string
  mentorName: string
  amount: number
  bankName: string
  accountNo: string
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 20px;">
      <h2 style="color: #111827; font-size: 20px;">Honorarium Mentoring Telah Ditransfer 💸</h2>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
        Halo <strong>${mentorName}</strong>, honorarium mentoring kamu sebesar <strong>Rp ${amount.toLocaleString('id-ID')}</strong> telah berhasil ditransfer oleh tim keuangan <strong>${LEGAL_ENTITY.name}</strong> ke rekening tujuan:
      </p>
      <div style="background: #f0fdf4; padding: 16px; border-radius: 14px; margin: 16px 0; color: #166534;">
        <p style="margin: 0; font-weight: bold;">${bankName} - ${accountNo}</p>
        <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 900;">Nominal: Rp ${amount.toLocaleString('id-ID')}</p>
      </div>
      <p style="color: #6b7280; font-size: 12px;">Terima kasih atas dedikasi membimbing adik-adik pejuang PTN Indonesia!</p>
    </div>
  `

  return sendUniversalEmail({
    to: mentorEmail,
    subject: `[otwptn] Bukti Transfer Honor Mentoring Rp ${amount.toLocaleString('id-ID')}`,
    html,
  })
}
