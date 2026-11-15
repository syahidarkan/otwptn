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

  // Get all users who have ambassador_commissions
  const { data: commissions } = await supabase
    .from('ambassador_commissions')
    .select('ambassador_id, amount, status, tier_purchased')

  const { data: withdrawals } = await supabase
    .from('withdrawal_requests')
    .select('user_id, amount, status, bank_name, account_number, account_holder')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, school_name, referral_code')

  if (!commissions) return NextResponse.json({ ambassadors: [] })

  // Group by ambassador
  const ambassadorIds = [...new Set(commissions.map(c => c.ambassador_id))]

  const ambassadors = ambassadorIds.map(id => {
    const profile = profiles?.find(p => p.id === id)
    const myCommissions = commissions.filter(c => c.ambassador_id === id)
    const myWithdrawals = withdrawals?.filter(w => w.user_id === id) ?? []

    const totalCommission = myCommissions.reduce((s, c) => s + c.amount, 0)
    const withdrawnCommission = myWithdrawals.filter(w => w.status === 'paid').reduce((s, w) => s + w.amount, 0)
    const pendingWithdraw = myWithdrawals.filter(w => w.status === 'pending').reduce((s, w) => s + w.amount, 0)

    const latestWithdrawal = myWithdrawals.length > 0 ? myWithdrawals[myWithdrawals.length - 1] : null
    const bankInfo = latestWithdrawal
      ? `${latestWithdrawal.bank_name} - ${latestWithdrawal.account_number} a.n ${latestWithdrawal.account_holder}`
      : '-'

    const breakdown = {
      review: myCommissions.filter(c => c.tier_purchased === 'dokumen').length,
      reguler: 0,
      vip: myCommissions.filter(c => c.tier_purchased === 'menyeluruh').length,
    }

    return {
      id,
      fullName: profile?.full_name ?? 'Unknown',
      email: profile?.email ?? '',
      phone: profile?.phone ?? '',
      school: profile?.school_name ?? '-',
      referralCode: profile?.referral_code ?? '',
      totalInvited: myCommissions.length,
      paidInvited: myCommissions.filter(c => c.status !== 'pending').length,
      breakdown,
      totalCommission,
      withdrawnCommission,
      pendingWithdraw,
      bankInfo,
      status: 'active' as const,
    }
  })

  return NextResponse.json({ ambassadors })
}

export async function POST(request: Request) {
  const { supabase, isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { action, user_id, withdrawal_id } = body

  if (action === 'approve_withdrawal') {
    let pendingQuery = supabase
      .from('withdrawal_requests')
      .select('id, amount')
      .eq('user_id', user_id)
      .eq('status', 'pending')

    if (withdrawal_id) {
      pendingQuery = pendingQuery.eq('id', withdrawal_id)
    }

    const { data: pendingReqs } = await pendingQuery
    const targetReq = pendingReqs?.[0]
    if (!targetReq) {
      return NextResponse.json({ error: 'Tidak ada permintaan penarikan pending untuk pengguna ini' }, { status: 404 })
    }

    // Mark pending withdrawal as paid
    await supabase
      .from('withdrawal_requests')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', targetReq.id)

    // Mark related commissions as paid up to the withdrawal amount
    const { data: clearedComms } = await supabase
      .from('ambassador_commissions')
      .select('id, amount')
      .eq('ambassador_id', user_id)
      .eq('status', 'cleared')
      .order('created_at', { ascending: true })

    let remainingToMark = targetReq.amount
    const commIdsToMark: string[] = []
    for (const c of clearedComms ?? []) {
      if (remainingToMark <= 0) break
      commIdsToMark.push(c.id)
      remainingToMark -= c.amount
    }

    if (commIdsToMark.length > 0) {
      await supabase
        .from('ambassador_commissions')
        .update({ status: 'paid' })
        .in('id', commIdsToMark)
    }

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
