import type { SupabaseClient } from '@supabase/supabase-js'
import { TIER_COMMISSION, type Tier } from '@/lib/pricing'

export function getCommissionAmount(tier: string): number {
  return TIER_COMMISSION[tier as Tier] ?? TIER_COMMISSION.web_premium
}

interface OrderForCommission {
  id: string
  user_id: string
  tier: string
  referral_code?: string | null
}

// Shared by every payment webhook (Mayar, DOKU, Jago transfer). Each paying order — including
// every member of a Squad, since they're each their own `orders` row — independently credits
// its own ambassador commission; there is no splitting across squad members.
export async function creditAmbassadorCommission(
  supabase: SupabaseClient,
  order: OrderForCommission,
): Promise<void> {
  if (!order.referral_code) return

  const { data: ambassador } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', order.referral_code)
    .maybeSingle()

  if (!ambassador) return

  await supabase.from('ambassador_commissions').insert({
    ambassador_id: ambassador.id,
    referred_user_id: order.user_id,
    order_id: order.id,
    amount: getCommissionAmount(order.tier),
    tier_purchased: order.tier,
    status: 'cleared',
  })
}
