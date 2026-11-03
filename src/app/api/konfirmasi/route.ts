import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import PembayaranDikonfirmasi from '@/lib/email/templates/PembayaranDikonfirmasi'
import PembayaranDitolak from '@/lib/email/templates/PembayaranDitolak'
import { createElement } from 'react'

const schema = z.object({
  order_id: z.string().uuid(),
  action: z.enum(['confirm', 'reject']),
  wa_group_link: z.string().optional(),
  mentor_name: z.string().optional(),
  mentor_id: z.string().uuid().optional(),
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

    const { order_id, action, wa_group_link, mentor_name, mentor_id, is_review, notes } = parsed.data
    const supabase = await createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminProfile } = await supabase
      .from('profiles').select('is_admin').eq('id', user.id).single()
    if (!adminProfile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, profiles!user_id(full_name, email, id)')
      .eq('id', order_id)
      .single()

    if (orderError || !order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })

    const profile = order.profiles as { full_name: string; email: string; id: string } | null
    if (!profile) return NextResponse.json({ error: 'Data user tidak ditemukan' }, { status: 404 })

    if (action === 'confirm') {
      if (!wa_group_link && !is_review) {
        return NextResponse.json({ error: 'Link/kontak wajib diisi' }, { status: 400 })
      }

      const now = new Date().toISOString()

      // Update order
      await supabase.from('orders').update({
        status: 'paid',
        wa_group_link: wa_group_link ?? null,
        mentor_name: mentor_name ?? null,
        notes: notes ?? null,
        confirmed_by: user.id,
        confirmed_at: now,
        updated_at: now,
      }).eq('id', order_id)

      // Update user's tier
      await supabase.from('profiles')
        .update({ tier: order.tier, updated_at: now })
        .eq('id', profile.id)

      // Upsert mentoring record
      const tierConfig: Record<string, { zoom: number; revisions: number }> = {
        dokumen: { zoom: 0, revisions: 2 },
        menyeluruh: { zoom: 2, revisions: 5 },
      }
      const cfg = tierConfig[order.tier] ?? { zoom: 0, revisions: 2 }

      await supabase.from('mentoring').upsert({
        user_id: profile.id,
        order_id: order_id,
        tier: order.tier,
        wa_group_link: wa_group_link ?? null,
        mentor_name: mentor_name ?? null,
        mentor_id: mentor_id ?? null,
        status: 'active',
        zoom_sessions_total: cfg.zoom,
        zoom_sessions_used: 0,
        revision_count_total: cfg.revisions,
        revision_count_used: 0,
      }, { onConflict: 'user_id' })

      await sendEmail({
        to: profile.email,
        subject: 'Pembayaran Dikonfirmasi - Selamat Bergabung di otwptn!',
        react: createElement(PembayaranDikonfirmasi, {
          full_name: profile.full_name,
          wa_group_link: wa_group_link ?? 'https://wa.me/6285156667221',
          is_review: is_review ?? false,
          mentor_name: mentor_name ?? null,
        }),
      })
    } else {
      await supabase.from('orders').update({
        status: 'failed',
        notes: notes ?? null,
        updated_at: new Date().toISOString(),
      }).eq('id', order_id)

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
