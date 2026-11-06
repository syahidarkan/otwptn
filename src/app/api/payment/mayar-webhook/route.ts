import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { safeEqual } from '@/lib/security'
import { claimOrderPaid, fulfillPaidOrder } from '@/lib/orderFulfillment'

// Mayar fires this when a payment link is paid
// Payload: { event: "payment.received", data: { productId, transactionStatus, customerEmail, ... } }
export async function POST(request: Request) {
  // Fail closed: the shared secret must be configured and must be presented.
  const webhookSecret = process.env.MAYAR_WEBHOOK_SECRET ?? ''
  if (!webhookSecret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[mayar-webhook] MAYAR_WEBHOOK_SECRET is not configured, rejecting')
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }
  } else {
    const raw = request.headers.get('x-callback-token') ?? request.headers.get('authorization') ?? ''
    const incoming = raw.startsWith('Bearer ') ? raw.slice(7) : raw
    if (!incoming || !safeEqual(incoming, webhookSecret)) {
      console.warn('[mayar-webhook] Missing or invalid webhook secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
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
  // Mayar webhook: data.status is boolean (true = paid), data.productId is the payment link ID
  const statusRaw = data.status
  const isPaid = statusRaw === true || statusRaw === 'paid' || (data.transactionStatus as string) === 'paid'
  const productId = (data.productId ?? data.linkId ?? data.id) as string | undefined

  if (!isPaid || !productId || typeof productId !== 'string') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const supabase = createServiceClient()

  // Match by Mayar product ID stored in doku_reference (mutually exclusive with DOKU)
  const { data: order } = await supabase
    .from('orders')
    .select('id, status, amount')
    .eq('doku_reference', productId)
    .eq('payment_method', 'mayar')
    .maybeSingle()

  if (!order) {
    console.warn(`[mayar-webhook] No mayar order found for productId ${productId}`)
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (order.status === 'paid') {
    return NextResponse.json({ ok: true, already_paid: true })
  }

  // If Mayar reports the paid amount, it must cover the order (guards a tampered/cheaper link).
  const paidAmount = Number(data.amount ?? data.totalAmount ?? NaN)
  if (Number.isFinite(paidAmount) && paidAmount < order.amount) {
    console.warn(`[mayar-webhook] Underpaid order ${order.id}: ${paidAmount} < ${order.amount}`)
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 409 })
  }

  const claimed = await claimOrderPaid(supabase, order.id)
  if (!claimed) return NextResponse.json({ ok: true, already_paid: true })

  await fulfillPaidOrder(supabase, claimed)

  console.log(`[mayar-webhook] Order ${claimed.id} paid, user ${claimed.user_id} upgraded to ${claimed.tier}`)
  return NextResponse.json({ ok: true, order_id: claimed.id, tier: claimed.tier })
}
