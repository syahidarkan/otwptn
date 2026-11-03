import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Called by Google Apps Script when it detects a Jago transfer email
// POST body: { amount: number, secret: string }
export async function POST(request: Request) {
  let body: { amount?: number; secret?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Simple shared secret to prevent random POSTs
  const expectedSecret = process.env.JAGO_NOTIFY_SECRET ?? ''
  if (!expectedSecret || body.secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const amount = Number(body.amount)
  if (!amount || amount < 1000) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const supabase = await createClient()

  // Find a pending transfer order matching this exact unique amount
  const { data: order } = await supabase
    .from('orders')
    .select('id, user_id, tier, referral_code')
    .eq('amount', amount)
    .eq('status', 'pending')
    .eq('payment_method', 'transfer')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!order) {
    console.warn(`[jago-notify] No pending transfer order found for amount ${amount}`)
    return NextResponse.json({ error: 'No matching order found' }, { status: 404 })
  }

  // Mark order as paid and update user tier
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

  console.log(`[jago-notify] Order ${order.id} confirmed for user ${order.user_id}, tier ${order.tier}`)
  return NextResponse.json({ ok: true, order_id: order.id, tier: order.tier })
}
