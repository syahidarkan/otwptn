import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import type React from 'react'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

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
  return await transporter.sendMail({
    from: `"otwptn" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  })
}
