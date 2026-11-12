import type { SupabaseClient } from '@supabase/supabase-js'
import { creditAmbassadorCommission } from '@/lib/commission'
import { autoAssignIndividuMentor, handleSquadPayment } from '@/lib/mentorAssignment'

const TIER_RANK: Record<string, number> = { free: 0, web_premium: 1, review: 2, dokumen: 3, menyeluruh: 4, intensif: 4 }

interface PaidOrder {
  id: string
  user_id: string
  tier: string
  amount: number
  referral_code: string | null
  mode: string | null
  track: string | null
  squad_group_id: string | null
  notes?: string | null
}

// Atomically flips pending -> paid. Only the request that wins the flip gets the row back,
// so a replayed or concurrent webhook can never credit commission / assign a mentor twice.
export async function claimOrderPaid(db: SupabaseClient, orderId: string): Promise<PaidOrder | null> {
  const { data } = await db
    .from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', orderId)
    .in('status', ['pending', 'expired'])
    .select('id, user_id, tier, amount, referral_code, mode, track, squad_group_id, notes')
    .maybeSingle()
  return (data as PaidOrder | null) ?? null
}

// Everything that must happen once a payment is confirmed (shared by all payment webhooks).
export async function fulfillPaidOrder(db: SupabaseClient, order: PaidOrder): Promise<void> {
  // Never downgrade: buying Web Premium after Reguler must not wipe the higher tier.
  const { data: current } = await db.from('profiles').select('tier, tier_expires_at').eq('id', order.user_id).maybeSingle()
  if ((TIER_RANK[order.tier] ?? 0) >= (TIER_RANK[current?.tier ?? 'free'] ?? 0)) {
    const daysByTier: Record<string, number> = {
      web_premium: 150, // 5 bulan
      review: 45,       // 1.5 bulan
      dokumen: 75,      // 2.5 bulan
      menyeluruh: 90,   // 3 bulan
      intensif: 90,     // 3 bulan
    }
    const days = daysByTier[order.tier] ?? 90
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

    await db.from('profiles').update({
      tier: order.tier,
      tier_expires_at: expiresAt,
    }).eq('id', order.user_id)
  }

  await creditAmbassadorCommission(db, order)

  const assignable = { ...order, track: order.track ?? 'essay' }
  if (order.mode === 'squad' && order.squad_group_id) {
    await handleSquadPayment(db, { ...assignable, squad_group_id: order.squad_group_id })
  } else {
    await autoAssignIndividuMentor(db, assignable)
  }
}
