import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { safeEqual } from '@/lib/security'
import { claimOrderPaid, fulfillPaidOrder } from '@/lib/orderFulfillment'

// Called by Google Apps Script when it detects a Jago transfer email
// POST body: { amount: number, secret: string }
export async function POST(request: Request) {
  let body: { amount?: number; secret?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Shared secret (constant-time compare); fail closed when not configured.
  const expectedSecret = process.env.JAGO_NOTIFY_SECRET ?? ''
  if (!expectedSecret || typeof body.secret !== 'string' || !safeEqual(body.secret, expectedSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const amount = Number(body.amount)
  if (!Number.isInteger(amount) || amount < 1000) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Match a pending transfer order by its exact (unique-suffix) amount. If more than one
  // order shares the amount we cannot tell who paid: never guess, leave it for manual review.
  const { data: candidates } = await supabase
    .from('orders')
    .select('id')
    .eq('amount', amount)
    .eq('status', 'pending')
    .eq('payment_method', 'transfer')
    .limit(2)

  if (!candidates || candidates.length === 0) {
    console.warn(`[jago-notify] No pending transfer order found for amount ${amount}`)
    return NextResponse.json({ error: 'No matching order found' }, { status: 404 })
  }
  if (candidates.length > 1) {
    console.warn(`[jago-notify] Ambiguous: multiple pending orders for amount ${amount}, manual confirmation required`)
    return NextResponse.json({ error: 'Ambiguous amount, manual confirmation required' }, { status: 409 })
  }

  const claimed = await claimOrderPaid(supabase, candidates[0].id)
  if (!claimed) return NextResponse.json({ ok: true, already_paid: true })

  await fulfillPaidOrder(supabase, claimed)

  console.log(`[jago-notify] Order ${claimed.id} confirmed for user ${claimed.user_id}, tier ${claimed.tier}`)
  return NextResponse.json({ ok: true, order_id: claimed.id, tier: claimed.tier })
}
