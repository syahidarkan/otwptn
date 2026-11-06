import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') ?? 'mingguan'

  // Determine date filter for XP gained within period
  let since: string | null = null
  if (period === 'mingguan') {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    since = d.toISOString()
  } else if (period === 'bulanan') {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    since = d.toISOString()
  }

  // For 'sepanjang-masa' we use total XP from profiles
  // For mingguan/bulanan we compute from essay_feedback and usage_quotas activity

  let leaderboardData: { user_id: string; xp: number }[] = []

  if (period === 'sepanjang-masa') {
    const { data } = await supabase
      .from('profiles')
      .select('id, xp')
      .order('xp', { ascending: false })
      .limit(50)

    leaderboardData = (data ?? []).map(p => ({ user_id: p.id, xp: p.xp }))
  } else {
    // Count essay submissions as 50 XP each for the period
    const { data: essays } = await supabase
      .from('essay_feedback')
      .select('essay_id, created_at')
      .gte('created_at', since!)

    // Join to get user_id from essays table
    const essayIds = (essays ?? []).map(e => e.essay_id)
    const xpByUser: Record<string, number> = {}

    if (essayIds.length > 0) {
      const { data: essayUsers } = await supabase
        .from('essays')
        .select('id, user_id')
        .in('id', essayIds)

      for (const e of essayUsers ?? []) {
        xpByUser[e.user_id] = (xpByUser[e.user_id] ?? 0) + 50
      }
    }

    // Count kalkulator sessions as 30 XP each
    const { data: kalcSessions } = await supabase
      .from('kalkulator_sessions')
      .select('user_id, created_at')
      .gte('created_at', since!)

    for (const s of kalcSessions ?? []) {
      xpByUser[s.user_id] = (xpByUser[s.user_id] ?? 0) + 30
    }

    leaderboardData = Object.entries(xpByUser)
      .map(([user_id, xp]) => ({ user_id, xp }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 50)
  }

  if (leaderboardData.length === 0) {
    return NextResponse.json({ entries: [], currentUserRank: null })
  }

  // Fetch profile info for leaderboard users
  const userIds = leaderboardData.map(e => e.user_id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, target_ptns, target_majors, school_name, streak_days')
    .in('id', userIds)

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  const entries = leaderboardData.map((e, i) => {
    const p = profileMap[e.user_id] ?? {}
    const ptn = (p.target_ptns?.[0] ?? '') + (p.target_majors?.[0] ? ` · ${p.target_majors[0]}` : '')
    return {
      rank: i + 1,
      user_id: e.user_id,
      name: p.full_name ?? 'Pejuang PTN',
      school: p.school_name ?? '-',
      targetPTN: ptn || '-',
      xp: e.xp,
      streak: p.streak_days ?? 0,
      avatar: p.avatar_url ?? null,
      isYou: e.user_id === user.id,
    }
  })

  const currentUserRank = entries.find(e => e.isYou) ?? null

  return NextResponse.json({ entries, currentUserRank })
}
