import type { SupabaseClient } from '@supabase/supabase-js'
import { TIER_SESSION_CONFIG, type Tier, type Track } from '@/lib/pricing'

interface MentorCandidate {
  user_id: string
  full_name: string
  track: string | null
}

// Auto-matching: eligible = approved mentor application whose track matches the requested
// track (or is NULL - a generalist, or 'hybrid' - handles everything), with current active
// mentee load below their configured capacity. Picks the least-loaded eligible mentor
// (simple load balancing, no manual admin step required).
export async function findAvailableMentor(
  supabase: SupabaseClient,
  track: Track,
): Promise<{ mentor_id: string; mentor_name: string } | null> {
  const { data: candidates } = await supabase
    .from('mentor_applications')
    .select('user_id, full_name, track')
    .eq('status', 'approved')

  const eligible = ((candidates ?? []) as MentorCandidate[]).filter(c => {
    if (!c.track) return true
    const t = c.track.toLowerCase().trim()
    if (t === track || t === 'hybrid') return true
    if (track === 'essay' && (t.includes('essay') || t.includes('ppkb') || t.includes('talent') || t.includes('iup') || t.includes('sbm'))) return true
    if (track === 'prestasi' && (t.includes('prestasi') || t.includes('snbp') || t.includes('pbub') || t.includes('sjp') || t.includes('osis') || t.includes('olimpiade') || t.includes('juara'))) return true
    if (track === 'hybrid' && (t.includes('hybrid') || (t.includes('essay') && t.includes('prestasi')))) return true
    return false
  })
  if (!eligible.length) return null

  const mentorIds = eligible.map(c => c.user_id)

  const [{ data: profiles }, { data: loads }] = await Promise.all([
    supabase.from('profiles').select('id, mentor_capacity').in('id', mentorIds),
    supabase.from('mentoring').select('mentor_id').in('mentor_id', mentorIds).eq('status', 'active'),
  ])

  const capacityMap = new Map((profiles ?? []).map(p => [p.id, p.mentor_capacity ?? 5]))
  const loadMap = new Map<string, number>()
  for (const row of loads ?? []) {
    if (!row.mentor_id) continue
    loadMap.set(row.mentor_id, (loadMap.get(row.mentor_id) ?? 0) + 1)
  }

  const ranked = eligible
    .map(c => ({
      mentor_id: c.user_id,
      mentor_name: c.full_name,
      load: loadMap.get(c.user_id) ?? 0,
      capacity: capacityMap.get(c.user_id) ?? 5,
    }))
    .filter(c => c.load < c.capacity)
    .sort((a, b) => a.load - b.load)

  if (!ranked.length) return null
  return { mentor_id: ranked[0].mentor_id, mentor_name: ranked[0].mentor_name }
}

interface OrderForAssignment {
  id: string
  user_id: string
  tier: string
  track: string
  squad_group_id?: string | null
}

// Upserts the mentoring record for one paid order, auto-assigning a mentor when one is
// available. Web Premium has no mentor at all. If no mentor has capacity right now, the
// mentoring row is created in 'pending' status so it still shows up for admin follow-up.
export async function assignMentorToOrder(
  supabase: SupabaseClient,
  order: OrderForAssignment,
  mentor: { mentor_id: string; mentor_name: string } | null,
): Promise<void> {
  if (order.tier === 'web_premium') return

  const cfg = TIER_SESSION_CONFIG[order.tier as Tier] ?? TIER_SESSION_CONFIG.review

  await supabase
    .from('orders')
    .update({ mentor_id: mentor?.mentor_id ?? null, mentor_name: mentor?.mentor_name ?? null })
    .eq('id', order.id)

  await supabase.from('mentoring').upsert(
    {
      user_id: order.user_id,
      order_id: order.id,
      tier: order.tier,
      mentor_id: mentor?.mentor_id ?? null,
      mentor_name: mentor?.mentor_name ?? null,
      squad_group_id: order.squad_group_id ?? null,
      zoom_sessions_total: cfg.zoom,
      revision_count_total: cfg.revisions,
      status: mentor ? 'active' : 'pending',
    },
    { onConflict: 'order_id' },
  )
}

// Runs for an Individu order right after payment: match + assign immediately.
export async function autoAssignIndividuMentor(
  supabase: SupabaseClient,
  order: OrderForAssignment,
): Promise<void> {
  const mentor = await findAvailableMentor(supabase, order.track as Track)
  await assignMentorToOrder(supabase, order, mentor)
}

// Runs for a Squad order right after payment. Squad members only get a mentor once all 3
// seats are paid - one mentor is matched for the whole group and assigned to every paid
// member's order/mentoring row in one go.
export async function handleSquadPayment(
  supabase: SupabaseClient,
  order: OrderForAssignment & { squad_group_id: string },
): Promise<void> {
  const { data: squad } = await supabase
    .from('squads')
    .select('id, track, tier, status, mentor_id, mentor_name')
    .eq('id', order.squad_group_id)
    .single()

  if (!squad) return

  // Create/keep this member's mentoring row as pending until the squad fills up.
  await assignMentorToOrder(supabase, order, null)

  if (squad.status === 'active') {
    // Squad already has a mentor (a later member joining an already-full/active squad,
    // which shouldn't normally happen since /api/checkout blocks joining a full squad, but
    // stay defensive) - just attach them to the existing mentor.
    if (squad.mentor_id) {
      await assignMentorToOrder(supabase, order, { mentor_id: squad.mentor_id, mentor_name: squad.mentor_name })
    }
    return
  }

  const { count: paidCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('squad_group_id', squad.id)
    .eq('status', 'paid')

  if ((paidCount ?? 0) < 3) return

  const mentor = await findAvailableMentor(supabase, squad.track as Track)
  if (!mentor) return // stays 'pending' for every member; admin can retry once a mentor frees up

  await supabase
    .from('squads')
    .update({ status: 'active', mentor_id: mentor.mentor_id, mentor_name: mentor.mentor_name, updated_at: new Date().toISOString() })
    .eq('id', squad.id)

  const { data: members } = await supabase
    .from('orders')
    .select('id, user_id, tier, track, squad_group_id')
    .eq('squad_group_id', squad.id)
    .eq('status', 'paid')

  for (const member of members ?? []) {
    await assignMentorToOrder(supabase, member, mentor)
  }
}
