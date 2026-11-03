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
    const pendingWithdraw = myWithdrawals.find(w => w.status === 'pending')?.amount ?? 0

    const bankInfo = myWithdrawals.length > 0
      ? `${myWithdrawals[0].bank_name} - ${myWithdrawals[0].account_number} a.n ${myWithdrawals[0].account_holder}`
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
  const { action, user_id } = body

  if (action === 'approve_withdrawal') {
    // Mark pending withdrawal as paid
    await supabase
      .from('withdrawal_requests')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('user_id', user_id)
      .eq('status', 'pending')

    // Mark related commissions as paid
    await supabase
      .from('ambassador_commissions')
      .update({ status: 'paid' })
      .eq('ambassador_id', user_id)
      .eq('status', 'cleared')

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
