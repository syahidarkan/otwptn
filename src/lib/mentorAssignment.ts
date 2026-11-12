import type { SupabaseClient } from '@supabase/supabase-js'
import { TIER_SESSION_CONFIG, type Tier, type Track } from '@/lib/pricing'
import {
  findBestMentorForMentee,
  type MenteeMatchProfile,
  type MentorMatchProfile,
} from '@/lib/mentor-matching'
import { getFacultyForMajor } from '@/lib/facultyMajorDirectory'

interface MentorCandidateRow {
  user_id: string
  full_name: string
  university: string | null
  major: string | null
  track: string | null
}

export interface MatchingContext {
  track: Track
  userId?: string
  mainJalur?: string | null
  targetPtn?: string | null
  targetFaculty?: string | null
  targetMajor?: string | null
  tier?: string
  excludeMentorId?: string | null
}

// Auto-matching 5 tahap resmi OtwPTN:
// 1. Kategori Jalur (essay_only, prestasi_only, hybrid, inter_iup, snbp)
// 2. Jalur Spesifik (misal sama-sama ppkb-ui / snbp)
// 3. Rumpun Ilmu (Saintek / Soshum / Vokasi)
// 4. Fakultas
// 5. Jurusan / Prodi + Load Balancing kapasitas mentor aktif
export async function findAvailableMentor(
  supabase: SupabaseClient,
  trackOrCtx: Track | MatchingContext,
): Promise<{ mentor_id: string; mentor_name: string } | null> {
  const ctx: MatchingContext =
    typeof trackOrCtx === 'string' ? { track: trackOrCtx } : trackOrCtx

  const { data: candidates } = await supabase
    .from('mentor_applications')
    .select('user_id, full_name, university, major, track')
    .eq('status', 'approved')

  const candidateRows = (candidates ?? []) as MentorCandidateRow[]
  if (!candidateRows.length) return null

  const mentorIds = candidateRows.map(c => c.user_id).filter(Boolean)

  // Load mentee profile + mentor capacities + current active mentee counts
  const [menteeProfileRes, mentorProfilesRes, loadsRes] = await Promise.all([
    ctx.userId
      ? supabase
          .from('profiles')
          .select('full_name, school_name, target_ptns, target_majors, target_jalurs')
          .eq('id', ctx.userId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('profiles').select('id, mentor_capacity').in('id', mentorIds),
    supabase.from('mentoring').select('mentor_id').in('mentor_id', mentorIds).eq('status', 'active'),
  ])

  const capacityMap = new Map((mentorProfilesRes.data ?? []).map(p => [p.id, p.mentor_capacity ?? 5]))
  const loadMap = new Map<string, number>()
  for (const row of loadsRes.data ?? []) {
    if (!row.mentor_id) continue
    loadMap.set(row.mentor_id, (loadMap.get(row.mentor_id) ?? 0) + 1)
  }

  const mentorPool: MentorMatchProfile[] = candidateRows.map(c => {
    const campus = c.university || ''
    const major = c.major || ''
    const faculty = getFacultyForMajor(major, campus)
    const expertJalur = c.track
      ? c.track.split(/[,;/|]+/).map(s => s.trim()).filter(Boolean)
      : []

    return {
      id: c.user_id,
      fullName: c.full_name,
      campus,
      faculty,
      major,
      expertJalur,
      activeMenteesCount: loadMap.get(c.user_id) ?? 0,
      maxMenteesCapacity: capacityMap.get(c.user_id) ?? 5,
      isAvailable: true,
    }
  })

  const mp = menteeProfileRes.data
  const targetPTN = ctx.targetPtn || mp?.target_ptns?.[0] || ''
  const targetMajor = ctx.targetMajor || mp?.target_majors?.[0] || ''
  const targetFaculty = ctx.targetFaculty || (targetMajor ? getFacultyForMajor(targetMajor, targetPTN) : '')
  const targetJalur = ctx.mainJalur || mp?.target_jalurs?.[0] || ctx.track

  const pkgLabel: MenteeMatchProfile['package'] =
    ctx.tier === 'menyeluruh' || ctx.tier === 'intensif'
      ? 'Queen Bee'
      : ctx.tier === 'dokumen'
        ? 'Honeycomb'
        : 'Nectar'

  const menteeProfile: MenteeMatchProfile = {
    id: ctx.userId || 'mentee',
    name: mp?.full_name || 'Mentee',
    school: mp?.school_name || '',
    targetPTN,
    targetJalur,
    targetTrack: ctx.track,
    targetFaculty,
    targetMajor,
    package: pkgLabel,
  }

  const filteredPool = ctx.excludeMentorId
    ? mentorPool.filter(m => m.id !== ctx.excludeMentorId)
    : mentorPool
  const poolToUse = filteredPool.length > 0 ? filteredPool : mentorPool

  const best = findBestMentorForMentee(menteeProfile, poolToUse)
  if (best) {
    return { mentor_id: best.mentorId, mentor_name: best.mentorName }
  }

  return null
}

interface OrderForAssignment {
  id: string
  user_id: string
  tier: string
  track: string
  squad_group_id?: string | null
  notes?: string | null
  excludeMentorId?: string | null
}

function parseOrderNotes(notes?: string | null): {
  main_jalur?: string | null
  target_ptn?: string | null
  target_faculty?: string | null
  target_major?: string | null
} {
  if (!notes) return {}
  try {
    const parsed = JSON.parse(notes)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

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

// Runs for an Individu order right after payment: 5-stage hierarchical match + assign immediately.
export async function autoAssignIndividuMentor(
  supabase: SupabaseClient,
  order: OrderForAssignment,
): Promise<void> {
  const parsedNotes = parseOrderNotes(order.notes)
  const mentor = await findAvailableMentor(supabase, {
    track: order.track as Track,
    userId: order.user_id,
    mainJalur: parsedNotes.main_jalur ?? null,
    targetPtn: parsedNotes.target_ptn ?? null,
    targetFaculty: parsedNotes.target_faculty ?? null,
    targetMajor: parsedNotes.target_major ?? null,
    tier: order.tier,
    excludeMentorId: order.excludeMentorId ?? null,
  })
  await assignMentorToOrder(supabase, order, mentor)
}

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

  await assignMentorToOrder(supabase, order, null)

  if (squad.status === 'active') {
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

  const parsedNotes = parseOrderNotes(order.notes)
  const mentor = await findAvailableMentor(supabase, {
    track: squad.track as Track,
    userId: order.user_id,
    mainJalur: parsedNotes.main_jalur ?? null,
    targetPtn: parsedNotes.target_ptn ?? null,
    targetFaculty: parsedNotes.target_faculty ?? null,
    targetMajor: parsedNotes.target_major ?? null,
    tier: squad.tier,
  })
  if (!mentor) return

  await supabase
    .from('squads')
    .update({ status: 'active', mentor_id: mentor.mentor_id, mentor_name: mentor.mentor_name, updated_at: new Date().toISOString() })
    .eq('id', squad.id)

  const { data: members } = await supabase
    .from('orders')
    .select('id, user_id, tier, track, squad_group_id')
    .eq('squad_group_id', squad.id)
    .eq('status', 'paid')

  for (const m of members ?? []) {
    await assignMentorToOrder(supabase, m as OrderForAssignment, mentor)
  }
}
