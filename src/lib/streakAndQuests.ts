import { createClient } from '@/lib/supabase/client'

export interface DailyQuest {
  id: string
  label: string
  xp: number
  done: boolean
  href: string
}

export interface StreakData {
  streak: number
  lastDate: string
  activeDaysOfWeek: number[] // 0 (Sun) to 6 (Sat) for the current week
  weekKey: string // e.g. "2026-W46"
  monthKey: string // e.g. "2026-11"
}

const STREAK_KEY = 'otwptn_user_streak_v2'
const QUESTS_KEY = 'otwptn_daily_quests_v2'

export function getTodayDateString(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function parseYMD(dateStr: string): { y: number; m: number; d: number } | null {
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return null
  return { y: parts[0], m: parts[1] - 1, d: parts[2] }
}

export function getCalendarDayDifference(fromDateStr: string, toDateStr: string): number {
  const from = parseYMD(fromDateStr)
  const to = parseYMD(toDateStr)
  if (!from || !to) return 999
  const fromUtc = Date.UTC(from.y, from.m, from.d)
  const toUtc = Date.UTC(to.y, to.m, to.d)
  return Math.round((toUtc - fromUtc) / 86400000)
}

export function getWeekKey(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

export function getMonthKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function calculateAndSaveStreak(stored?: { streak?: number; lastDate?: string }): StreakData {
  const now = new Date()
  const todayStr = getTodayDateString(now)
  const currentWeekKey = getWeekKey(now)
  const currentMonthKey = getMonthKey(now)
  const todayDay = now.getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat

  if (typeof window === 'undefined') {
    return {
      streak: 1,
      lastDate: todayStr,
      activeDaysOfWeek: [todayDay],
      weekKey: currentWeekKey,
      monthKey: currentMonthKey,
    }
  }

  let currentStreak = 1
  let lastDate = ''
  let activeDaysOfWeek: number[] = [todayDay]
  let storedWeekKey = ''
  let storedMonthKey = ''

  try {
    const raw = localStorage.getItem(STREAK_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    currentStreak = stored?.streak ?? parsed?.streak ?? 1
    lastDate = stored?.lastDate ?? parsed?.lastDate ?? ''
    storedWeekKey = parsed?.weekKey ?? ''
    storedMonthKey = parsed?.monthKey ?? ''

    // If week has rolled over to a new week, reset weekly active days to current day
    if (storedWeekKey === currentWeekKey && Array.isArray(parsed?.activeDaysOfWeek)) {
      activeDaysOfWeek = parsed.activeDaysOfWeek
    } else {
      activeDaysOfWeek = [todayDay]
    }
  } catch {
    currentStreak = 1
    activeDaysOfWeek = [todayDay]
  }

  if (!lastDate) {
    currentStreak = 1
    lastDate = todayStr
  } else if (lastDate === todayStr) {
    // Already recorded today, maintain ongoing streak
  } else {
    // Calendar-accurate difference across month and year transitions
    const diffDays = getCalendarDayDifference(lastDate, todayStr)

    if (diffDays === 1) {
      // Consecutive day login (even across month end like Oct 31 -> Nov 1)
      currentStreak += 1
    } else if (diffDays > 1) {
      // Missed one or more days, reset streak to 1
      currentStreak = 1
    }
    // If diffDays <= 0 (e.g. system clock adjustment), keep currentStreak unchanged
    lastDate = todayStr
  }

  // Ensure today is always registered in current week's active days
  if (!activeDaysOfWeek.includes(todayDay)) {
    activeDaysOfWeek.push(todayDay)
  }

  const data: StreakData = {
    streak: Math.max(1, currentStreak),
    lastDate,
    activeDaysOfWeek,
    weekKey: currentWeekKey,
    monthKey: currentMonthKey,
  }

  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data))
  } catch {}

  // Sync updated streak to Supabase profiles so leaderboard and stats are live
  try {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .update({
            streak_days: data.streak,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .then(() => {}, () => {})
      }
    }, () => {})
  } catch {}

  return data
}

export function getDailyQuests(profile?: any): DailyQuest[] {
  if (typeof window === 'undefined') {
    return [
      { id: 'q-profile', label: 'Lengkapi profil sekolah & target PTN', xp: 20, done: true, href: '/profil' },
      { id: 'q-ecourse', label: 'Pelajari satu modul belajar hari ini', xp: 25, done: false, href: '/dashboard/ecourse' },
      { id: 'q-latihan', label: 'Asah kemampuan di Arena Latihan PPU & PBM', xp: 25, done: false, href: '/dashboard/latihan' },
    ]
  }

  const todayStr = getTodayDateString()
  let completedIds: string[] = []

  try {
    const raw = localStorage.getItem(QUESTS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.date === todayStr && Array.isArray(parsed.ids)) {
        completedIds = parsed.ids
      }
    }
  } catch {}

  // Check ecourse completion from local storage
  try {
    const ecourseCompleted = JSON.parse(localStorage.getItem('ecourse_v2_completed') || '[]')
    if (ecourseCompleted.length > 0 && !completedIds.includes('q-ecourse')) {
      completedIds.push('q-ecourse')
    }
  } catch {}

  // Check profile completion
  const profileDone = !!(profile?.school || profile?.school_name || profile?.target_ptn_1)
  if (profileDone && !completedIds.includes('q-profile')) {
    completedIds.push('q-profile')
  }

  return [
    {
      id: 'q-profile',
      label: 'Lengkapi profil sekolah & target PTN',
      xp: 20,
      done: completedIds.includes('q-profile'),
      href: '/profil',
    },
    {
      id: 'q-ecourse',
      label: 'Pelajari satu modul belajar hari ini',
      xp: 25,
      done: completedIds.includes('q-ecourse'),
      href: '/dashboard/ecourse',
    },
    {
      id: 'q-latihan',
      label: 'Asah kemampuan di Arena Latihan PPU & PBM',
      xp: 25,
      done: completedIds.includes('q-latihan'),
      href: '/dashboard/latihan',
    },
  ]
}

export function completeDailyQuest(questId: string) {
  if (typeof window === 'undefined') return
  const todayStr = getTodayDateString()
  try {
    let ids: string[] = []
    const raw = localStorage.getItem(QUESTS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.date === todayStr && Array.isArray(parsed.ids)) {
        ids = parsed.ids
      }
    }
    if (!ids.includes(questId)) {
      ids.push(questId)
      localStorage.setItem(QUESTS_KEY, JSON.stringify({ date: todayStr, ids }))
    }
  } catch {}
}
