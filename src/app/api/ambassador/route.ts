import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code, full_name')
    .eq('id', user.id)
    .single()

  const { data: commissions } = await supabase
    .from('ambassador_commissions')
    .select('amount, status, tier_purchased, created_at')
    .eq('ambassador_id', user.id)

  const totalReferred = (commissions ?? []).length
  const totalEarnings = (commissions ?? []).reduce((sum, c) => sum + c.amount, 0)

  const { data: withdrawals } = await supabase
    .from('withdrawal_requests')
    .select('amount, status, created_at')
    .eq('user_id', user.id)

  const alreadyWithdrawn = (withdrawals ?? [])
    .filter(w => w.status === 'paid')
    .reduce((sum, w) => sum + w.amount, 0)

  const pendingWithdrawal = (withdrawals ?? [])
    .filter(w => w.status === 'pending' || w.status === 'approved')
    .reduce((sum, w) => sum + w.amount, 0)

  return NextResponse.json({
    referralCode: profile?.referral_code ?? null,
    totalReferred,
    totalEarnings,
    alreadyWithdrawn,
    pendingWithdrawal,
    activeBalance: totalEarnings - alreadyWithdrawn - pendingWithdrawal,
    recentCommissions: (commissions ?? []).slice(0, 10),
    recentWithdrawals: (withdrawals ?? []).slice(0, 5),
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount, bank_name, account_number, account_holder } = await request.json()

  if (!amount || !bank_name || !account_number || !account_holder) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
  }

  if (typeof amount !== 'number' || amount < 50000) {
    return NextResponse.json({ error: 'Minimal penarikan Rp 50.000' }, { status: 400 })
  }

  // Verify user has enough balance
  const { data: commissions } = await supabase
    .from('ambassador_commissions')
    .select('amount')
    .eq('ambassador_id', user.id)

  const { data: withdrawals } = await supabase
    .from('withdrawal_requests')
    .select('amount, status')
    .eq('user_id', user.id)

  const totalEarnings = (commissions ?? []).reduce((sum, c) => sum + c.amount, 0)
  const usedBalance = (withdrawals ?? [])
    .filter(w => w.status !== 'rejected')
    .reduce((sum, w) => sum + w.amount, 0)

  if (amount > totalEarnings - usedBalance) {
    return NextResponse.json({ error: 'Saldo tidak mencukupi' }, { status: 400 })
  }

  const { data: withdrawal, error } = await supabase
    .from('withdrawal_requests')
    .insert({
      user_id: user.id,
      amount,
      bank_name,
      account_number,
      account_holder,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    console.error('[Ambassador Withdrawal]', error)
    return NextResponse.json({ error: 'Gagal membuat permintaan penarikan' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, withdrawal_id: withdrawal.id })
}
