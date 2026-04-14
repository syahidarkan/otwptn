import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import PembayaranDikonfirmasi from '@/lib/email/templates/PembayaranDikonfirmasi'
import PembayaranDitolak from '@/lib/email/templates/PembayaranDitolak'
import { createElement } from 'react'

const schema = z.object({
  registration_id: z.string().uuid(),
  action: z.enum(['confirm', 'reject']),
  wa_group_link: z.string().url().optional(),
  mentor_name: z.string().optional(),
  is_review: z.boolean().optional(),
  notes: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
    }

    const { registration_id, action, wa_group_link, mentor_name, is_review, notes } = parsed.data
    const supabase = await createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminProfile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (adminProfile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('*, profiles!user_id(full_name, email, id)')
      .eq('id', registration_id)
      .single()

    if (regError || !registration) return NextResponse.json({ error: 'Pendaftaran tidak ditemukan' }, { status: 404 })

    const profile = registration.profiles as { full_name: string; email: string; id: string } | null
    if (!profile) return NextResponse.json({ error: 'Data user tidak ditemukan' }, { status: 404 })

    if (action === 'confirm') {
      if (!wa_group_link) return NextResponse.json({ error: 'Link/kontak wajib diisi' }, { status: 400 })

      await supabase.from('registrations').update({
        status: 'confirmed',
        wa_group_link,
        confirmed_at: new Date().toISOString(),
        confirmed_by: user.id,
        notes: notes ?? null,
        updated_at: new Date().toISOString(),
      }).eq('id', registration_id)

      await supabase.from('profiles')
        .update({ role: 'member', updated_at: new Date().toISOString() })
        .eq('id', profile.id)

      await sendEmail({
        to: profile.email,
        subject: 'Pembayaran Dikonfirmasi — Selamat Bergabung di otwptn!',
        react: createElement(PembayaranDikonfirmasi, {
          full_name: profile.full_name,
          wa_group_link,
          is_review: is_review ?? false,
          mentor_name: mentor_name ?? null,
        }),
      })
    } else {
      await supabase.from('registrations').update({
        status: 'rejected',
        notes: notes ?? null,
        updated_at: new Date().toISOString(),
      }).eq('id', registration_id)

      await sendEmail({
        to: profile.email,
        subject: 'Update Pendaftaran otwptn',
        react: createElement(PembayaranDitolak, { full_name: profile.full_name, notes }),
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
