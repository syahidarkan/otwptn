import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { creditAmbassadorCommission } from '@/lib/commission'
import { autoAssignIndividuMentor, handleSquadPayment } from '@/lib/mentorAssignment'

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

  const supabase = await createAdminClient()

  // Find a pending transfer order matching this exact unique amount
  const { data: order } = await supabase
    .from('orders')
    .select('id, user_id, tier, referral_code, mode, track, squad_group_id')
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

  await creditAmbassadorCommission(supabase, order)

  if (order.mode === 'squad' && order.squad_group_id) {
    await handleSquadPayment(supabase, { ...order, squad_group_id: order.squad_group_id })
  } else {
    await autoAssignIndividuMentor(supabase, order)
  }

  console.log(`[jago-notify] Order ${order.id} confirmed for user ${order.user_id}, tier ${order.tier}`)
  return NextResponse.json({ ok: true, order_id: order.id, tier: order.tier })
}
