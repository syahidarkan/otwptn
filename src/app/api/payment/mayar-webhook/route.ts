import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { creditAmbassadorCommission } from '@/lib/commission'
import { autoAssignIndividuMentor, handleSquadPayment } from '@/lib/mentorAssignment'

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
  // Mayar webhook: data.status is boolean (true = paid), data.productId is the payment link ID
  const statusRaw = data.status
  const isPaid = statusRaw === true || statusRaw === 'paid' || (data.transactionStatus as string) === 'paid'
  const productId = (data.productId ?? data.linkId ?? data.id) as string | undefined

  console.log('[mayar-webhook] event data:', JSON.stringify({ status: statusRaw, productId, event: body.event }))

  if (!isPaid || !productId) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  // Service-role client: this handler runs unauthenticated (server-to-server) and needs to
  // read/update other users' rows (profiles, mentor_applications, mentoring, squads) across
  // RLS boundaries, the same way /api/konfirmasi already does for manual confirmations.
  const supabase = await createAdminClient()

  // Match by Mayar product ID stored in doku_reference (mutually exclusive with DOKU)
  const { data: order } = await supabase
    .from('orders')
    .select('id, user_id, tier, referral_code, status, mode, track, squad_group_id')
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

  await creditAmbassadorCommission(supabase, order)

  if (order.mode === 'squad' && order.squad_group_id) {
    await handleSquadPayment(supabase, { ...order, squad_group_id: order.squad_group_id })
  } else {
    await autoAssignIndividuMentor(supabase, order)
  }

  console.log(`[mayar-webhook] Order ${order.id} paid, user ${order.user_id} upgraded to ${order.tier}`)
  return NextResponse.json({ ok: true, order_id: order.id, tier: order.tier })
}
