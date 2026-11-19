import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import PembayaranDikonfirmasi from '@/lib/email/templates/PembayaranDikonfirmasi'
import PembayaranDitolak from '@/lib/email/templates/PembayaranDitolak'
import { createElement } from 'react'
import { claimOrderPaid, fulfillPaidOrder } from '@/lib/orderFulfillment'

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
    // Authenticate with the visitor's session, then write with the service client.
    const session = await createClient()
    const { data: { user } } = await session.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminProfile } = await session
      .from('profiles').select('is_admin').eq('id', user.id).single()
    if (!adminProfile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const supabase = createServiceClient()

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

      // Atomically flip pending/expired -> paid (same guard the Mayar webhook uses), so a
      // double-click or a race with the webhook can never fulfil the same order twice.
      const claimed = await claimOrderPaid(supabase, order_id)
      if (!claimed) {
        return NextResponse.json({ error: 'Order sudah dikonfirmasi sebelumnya atau tidak berstatus pending' }, { status: 409 })
      }

      await supabase.from('orders').update({
        notes: notes ?? null,
        confirmed_by: user.id,
        confirmed_at: now,
        updated_at: now,
      }).eq('id', order_id)

      // Shared fulfillment: sets tier / pending_activation the same way the webhook does,
      // credits ambassador commission, and auto-assigns a mentor.
      await fulfillPaidOrder(supabase, claimed)

      // Manual bank-transfer confirmation lets the admin pick the mentor and WA group link by
      // hand (there is no auto-match UI here) - this overrides whatever fulfillPaidOrder's
      // auto-assignment picked, with the admin-provided values.
      await supabase.from('mentoring').upsert({
        user_id: profile.id,
        order_id: order_id,
        tier: claimed.tier,
        wa_group_link: wa_group_link ?? null,
        mentor_name: mentor_name ?? null,
        mentor_id: mentor_id ?? null,
        status: 'active',
      }, { onConflict: 'order_id' })

      await supabase.from('orders').update({
        wa_group_link: wa_group_link ?? null,
        mentor_name: mentor_name ?? null,
        mentor_id: mentor_id ?? null,
      }).eq('id', order_id)

      await sendEmail({
        to: profile.email,
        subject: 'Pembayaran Dikonfirmasi - Selamat Bergabung di otwptn!',
        react: createElement(PembayaranDikonfirmasi, {
          full_name: profile.full_name,
          wa_group_link: wa_group_link ?? 'https://wa.me/6285121659182',
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
