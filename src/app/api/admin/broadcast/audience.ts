import type { SupabaseClient } from '@supabase/supabase-js'

export const AUDIENCES = [
  'all',
  'paid',
  'premium',
  'nectar',
  'honeycomb',
  'queen_bee',
  'mentors',
  'ambassador',
] as const
export type Audience = (typeof AUDIENCES)[number]

export const AUDIENCE_LABELS: Record<Audience, string> = {
  all: 'Semua siswa',
  paid: 'Siswa paket berbayar',
  premium: 'Akun Premium',
  nectar: 'Paket Nectar',
  honeycomb: 'Paket Honeycomb',
  queen_bee: 'Paket Queen Bee',
  mentors: 'Mentor alumni',
  ambassador: 'Student Ambassador',
}

// profiles.tier values that the payment flow actually writes.
const TIER_BY_AUDIENCE: Partial<Record<Audience, string>> = {
  premium: 'web_premium',
  nectar: 'review',
  honeycomb: 'dokumen',
  queen_bee: 'menyeluruh',
}

export interface Recipient {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
}

export interface AudienceCount {
  total: number
  withEmail: number
  withPhone: number
}

interface ProfileRow extends Recipient {
  tier: string | null
  role: string | null
  is_admin: boolean | null
}

export interface Directory {
  profiles: ProfileRow[]
  mentorIds: Set<string>
  ambassadorIds: Set<string>
}

const PAGE = 1000

async function fetchAll<T>(
  query: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const out: T[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await query(from, from + PAGE - 1)
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) break
    out.push(...data)
    if (data.length < PAGE) break
  }
  return out
}

export async function loadDirectory(db: SupabaseClient): Promise<Directory> {
  const [profiles, mentorApps, commissions] = await Promise.all([
    fetchAll<ProfileRow>((f, t) =>
      db.from('profiles').select('id, full_name, email, phone, tier, role, is_admin').order('id').range(f, t),
    ),
    fetchAll<{ id: string; user_id: string | null }>((f, t) =>
      db.from('mentor_applications').select('id, user_id').eq('status', 'approved').order('id').range(f, t),
    ),
    fetchAll<{ id: string; ambassador_id: string }>((f, t) =>
      db.from('ambassador_commissions').select('id, ambassador_id').order('id').range(f, t),
    ),
  ])

  return {
    profiles,
    mentorIds: new Set(mentorApps.map(m => m.user_id).filter((v): v is string => !!v)),
    ambassadorIds: new Set(commissions.map(c => c.ambassador_id)),
  }
}

function isMentor(dir: Directory, p: ProfileRow): boolean {
  return p.role === 'mentor' || dir.mentorIds.has(p.id)
}

function isStudent(dir: Directory, p: ProfileRow): boolean {
  return !p.is_admin && !isMentor(dir, p)
}

export function filterAudience(dir: Directory, audience: Audience): Recipient[] {
  let rows: ProfileRow[]

  if (audience === 'mentors') {
    rows = dir.profiles.filter(p => isMentor(dir, p))
  } else if (audience === 'ambassador') {
    rows = dir.profiles.filter(p => dir.ambassadorIds.has(p.id))
  } else if (audience === 'paid') {
    rows = dir.profiles.filter(p => isStudent(dir, p) && !!p.tier && p.tier !== 'free')
  } else if (audience === 'all') {
    rows = dir.profiles.filter(p => isStudent(dir, p))
  } else {
    const tier = TIER_BY_AUDIENCE[audience]
    rows = dir.profiles.filter(p => isStudent(dir, p) && p.tier === tier)
  }

  return rows.map(({ id, full_name, email, phone }) => ({ id, full_name, email, phone }))
}

export function countRecipients(list: Recipient[]): AudienceCount {
  return {
    total: list.length,
    withEmail: list.filter(r => !!r.email?.trim()).length,
    withPhone: list.filter(r => normalizePhone(r.phone) !== null).length,
  }
}

export function getAllCounts(dir: Directory): Record<Audience, AudienceCount> {
  const out = {} as Record<Audience, AudienceCount>
  for (const a of AUDIENCES) out[a] = countRecipients(filterAudience(dir, a))
  return out
}

export function selfRecipient(dir: Directory, userId: string): Recipient[] {
  const me = dir.profiles.find(p => p.id === userId)
  return me ? [{ id: me.id, full_name: me.full_name, email: me.email, phone: me.phone }] : []
}

// Indonesian numbers to wa-service format (digits only, country code 62).
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  let digits = raw.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`
  else if (digits.startsWith('8')) digits = `62${digits}`
  if (!digits.startsWith('62') || digits.length < 10 || digits.length > 15) return null
  return digits
}

// Does this single user belong to the audience? Used to decide who sees an active banner.
export async function userMatchesAudience(
  db: SupabaseClient,
  userId: string,
  audience: Audience,
): Promise<boolean> {
  const { data: p } = await db
    .from('profiles')
    .select('id, tier, role, is_admin')
    .eq('id', userId)
    .maybeSingle()
  if (!p) return false

  const mentor = async () => {
    if (p.role === 'mentor') return true
    const { data } = await db
      .from('mentor_applications')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .limit(1)
    return !!data?.length
  }

  if (audience === 'mentors') return mentor()
  if (audience === 'ambassador') {
    const { data } = await db.from('ambassador_commissions').select('id').eq('ambassador_id', userId).limit(1)
    return !!data?.length
  }

  if (p.is_admin || (await mentor())) return false
  if (audience === 'all') return true
  if (audience === 'paid') return !!p.tier && p.tier !== 'free'
  return p.tier === TIER_BY_AUDIENCE[audience]
}
