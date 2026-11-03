import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

const schema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
})

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(request: Request) {
  try {
    const data = schema.parse(await request.json())
    const supabase = await createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminProfile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!adminProfile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Get emails of users who have a paid tier (i.e., are members)
    const { data: members } = await supabase
      .from('profiles')
      .select('email')
      .not('tier', 'eq', 'free')
      .not('email', 'is', null)

    if (!members || members.length === 0) {
      return NextResponse.json({ success: true, sent: 0 })
    }

    let sent = 0
    for (const m of members) {
      if (!m.email) continue
      await transporter.sendMail({
        from: `"otwptn" <${process.env.GMAIL_USER}>`,
        to: m.email,
        subject: data.subject,
        text: data.body,
      })
      sent++
    }

    return NextResponse.json({ success: true, sent })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
