import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { TIER_LABELS, type Tier } from '@/lib/pricing'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: order } = await supabase
    .from('orders')
    .select('id, tier, mode, track, squad_group_id, paid_at')
    .eq('user_id', user.id)
    .eq('status', 'paid')
    .order('paid_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!order) return NextResponse.json({ order: null })

  let squadInviteCode: string | null = null
  let squadStatus: string | null = null
  if (order.mode === 'squad' && order.squad_group_id) {
    const { data: squad } = await supabase
      .from('squads')
      .select('invite_code, status')
      .eq('id', order.squad_group_id)
      .maybeSingle()
    squadInviteCode = squad?.invite_code ?? null
    squadStatus = squad?.status ?? null
  }

  return NextResponse.json({
    order: {
      tier: order.tier,
      tier_name: TIER_LABELS[order.tier as Tier] ?? order.tier,
      mode: order.mode,
      track: order.track,
      squad_invite_code: squadInviteCode,
      squad_status: squadStatus,
    },
  })
}
