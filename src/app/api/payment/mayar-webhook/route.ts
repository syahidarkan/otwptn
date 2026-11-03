import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Mayar fires this when a payment link is paid
// Payload: { event: "payment.received", data: { productId, transactionStatus, customerEmail, ... } }
export async function POST(request: Request) {
  // Verify Mayar webhook secret header
  const webhookSecret = process.env.MAYAR_WEBHOOK_SECRET ?? ''
  const incoming = request.headers.get('x-callback-token') ?? request.headers.get('authorization') ?? ''
  if (webhookSecret && incoming && incoming !== webhookSecret && incoming !== `Bearer ${webhookSecret}`) {
    console.warn('[mayar-webhook] Invalid webhook secret')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { event?: string; data?: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.event !== 'payment.received') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const data = body.data ?? {}
  const transactionStatus = data.transactionStatus as string | undefined
  const productId = data.productId as string | undefined

  if (transactionStatus !== 'paid' || !productId) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const supabase = await createClient()

  // Match by Mayar product ID stored in doku_reference (mutually exclusive with DOKU)
  const { data: order } = await supabase
    .from('orders')
    .select('id, user_id, tier, referral_code, status')
    .eq('doku_reference', productId)
    .eq('payment_method', 'mayar')
    .maybeSingle()

  if (!order) {
    console.warn(`[mayar-webhook] No pending mayar order found for productId ${productId}`)
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (order.status === 'paid') {
    return NextResponse.json({ ok: true, already_paid: true })
  }

  await Promise.all([
    supabase.from('orders').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', order.id),
    supabase.from('profiles').update({ tier: order.tier }).eq('id', order.user_id),
  ])

  // Credit ambassador commission if applicable
  if (order.referral_code) {
    const { data: ambassador } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', order.referral_code)
      .maybeSingle()

    if (ambassador) {
      const commissionRate =
        order.tier === 'menyeluruh' ? 75000 :
        order.tier === 'dokumen' ? 35000 :
        order.tier === 'review' ? 15000 : 10000

      await supabase.from('ambassador_commissions').insert({
        ambassador_id: ambassador.id,
        referred_user_id: order.user_id,
        order_id: order.id,
        amount: commissionRate,
        tier_purchased: order.tier,
        status: 'cleared',
      })
    }
  }

  console.log(`[mayar-webhook] Order ${order.id} paid, user ${order.user_id} upgraded to ${order.tier}`)
  return NextResponse.json({ ok: true, order_id: order.id, tier: order.tier })
}
