import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, isAdmin: false }
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return { supabase, user, isAdmin: !!profile?.is_admin }
}

export async function GET() {
  const { supabase, isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: applications } = await supabase
    .from('mentor_applications')
    .select('*, profiles!user_id(full_name, email, avatar_url)')
    .order('created_at', { ascending: false })

  // Also get unassigned paid orders (paid, no mentoring record)
  const { data: unassigned } = await supabase
    .from('orders')
    .select('id, tier, amount, created_at, profiles!user_id(id, full_name, school_name, target_ptns)')
    .eq('status', 'paid')
    .is('mentor_name', null)
    .order('created_at', { ascending: false })

  // Get mentee counts per mentor
  const { data: menteeCounts } = await supabase
    .from('mentoring')
    .select('mentor_id')

  const countMap: Record<string, number> = {}
  menteeCounts?.forEach(row => {
    if (row.mentor_id) countMap[row.mentor_id] = (countMap[row.mentor_id] ?? 0) + 1
  })

  // Get mentor payouts
  const { data: payouts } = await supabase
    .from('mentor_payouts')
    .select('mentor_id, amount, status')

  const payoutMap: Record<string, { ready: number; paid: number }> = {}
  payouts?.forEach(p => {
    if (!payoutMap[p.mentor_id]) payoutMap[p.mentor_id] = { ready: 0, paid: 0 }
    if (p.status === 'pending' || p.status === 'cleared') payoutMap[p.mentor_id].ready += p.amount
    if (p.status === 'paid') payoutMap[p.mentor_id].paid += p.amount
  })

  return NextResponse.json({
    applications: applications ?? [],
    unassignedOrders: unassigned ?? [],
    menteeCounts: countMap,
    payouts: payoutMap,
  })
}

export async function POST(request: Request) {
  const { supabase, user, isAdmin } = await requireAdmin()
  if (!isAdmin || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { action, application_id, admin_note } = body

  if (!action || !application_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (action === 'approve') {
    const { error } = await supabase
      .from('mentor_applications')
      .update({
        status: 'approved',
        admin_note: admin_note ?? null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', application_id)

    if (error) return NextResponse.json({ error: 'Gagal approve' }, { status: 500 })

    // Get user_id for this application
    const { data: app } = await supabase
      .from('mentor_applications')
      .select('user_id')
      .eq('id', application_id)
      .single()

    if (app?.user_id) {
      await supabase.from('profiles').update({ role: 'mentor' }).eq('id', app.user_id)
    }

  } else if (action === 'reject') {
    const { error } = await supabase
      .from('mentor_applications')
      .update({
        status: 'rejected',
        admin_note: admin_note ?? null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', application_id)

    if (error) return NextResponse.json({ error: 'Gagal reject' }, { status: 500 })

  } else if (action === 'assign_mentee') {
    // Assign an order (unassigned paid mentee) to a mentor
    const { order_id, mentor_id, mentor_name } = body
    if (!order_id || !mentor_id) return NextResponse.json({ error: 'Missing order_id or mentor_id' }, { status: 400 })

    // Get order details
    const { data: order } = await supabase
      .from('orders')
      .select('user_id, tier, amount')
      .eq('id', order_id)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // Get mentor details
    const { data: mentorProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', mentor_id)
      .single()

    // Update order with mentor
    await supabase.from('orders').update({
      mentor_name: mentor_name ?? mentorProfile?.full_name,
      updated_at: new Date().toISOString(),
    }).eq('id', order_id)

    // Upsert mentoring record
    const tierConfig: Record<string, { zoom: number; revisions: number }> = {
      dokumen: { zoom: 0, revisions: 2 },
      menyeluruh: { zoom: 2, revisions: 5 },
    }
    const cfg = tierConfig[order.tier] ?? { zoom: 0, revisions: 2 }

    await supabase.from('mentoring').upsert({
      user_id: order.user_id,
      order_id: order_id,
      tier: order.tier,
      mentor_id: mentor_id,
      mentor_name: mentorProfile?.full_name ?? mentor_name,
      mentor_email: mentorProfile?.email,
      status: 'active',
      zoom_sessions_total: cfg.zoom,
      zoom_sessions_used: 0,
      revision_count_total: cfg.revisions,
      revision_count_used: 0,
    }, { onConflict: 'user_id' })

    // Create payout record for mentor
    const payoutAmount = order.tier === 'menyeluruh' ? 120000 : 60000
    await supabase.from('mentor_payouts').insert({
      mentor_id: mentor_id,
      mentee_id: order.user_id,
      order_id: order_id,
      tier: order.tier,
      amount: payoutAmount,
      status: 'pending',
    })

  } else if (action === 'mark_payout') {
    const { mentor_id: payoutMentorId } = body
    if (!payoutMentorId) return NextResponse.json({ error: 'Missing mentor_id' }, { status: 400 })

    await supabase.from('mentor_payouts')
      .update({ status: 'paid' })
      .eq('mentor_id', payoutMentorId)
      .in('status', ['pending', 'cleared'])
  }

  return NextResponse.json({ success: true })
}
