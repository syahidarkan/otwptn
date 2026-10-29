import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const invoiceNumber = body?.order?.invoice_number
  const status = body?.transaction?.status

  if (!invoiceNumber || !status) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, user_id, tier')
    .eq('invoice_number', invoiceNumber)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  if (status === 'SUCCESS') {
    await Promise.all([
      supabase.from('orders').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', order.id),
      supabase.from('profiles').update({ tier: order.tier }).eq('id', order.user_id),
    ])
  } else if (status === 'FAILED' || status === 'EXPIRED') {
    await supabase.from('orders').update({ status: status.toLowerCase() }).eq('id', order.id)
  }

  return NextResponse.json({ ok: true })
}
