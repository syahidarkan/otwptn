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
  activeDaysOfWeek: number[] // 0 (Sun) to 6 (Sat)
}

const STREAK_KEY = 'otwptn_user_streak_v2'
const QUESTS_KEY = 'otwptn_daily_quests_v2'

export function getTodayDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function calculateAndSaveStreak(stored?: { streak?: number; lastDate?: string }): StreakData {
  if (typeof window === 'undefined') {
    return { streak: 1, lastDate: '', activeDaysOfWeek: [new Date().getDay()] }
  }

  const todayStr = getTodayDateString()
  let currentStreak = 1
  let lastDate = ''
  let activeDaysOfWeek: number[] = [new Date().getDay()]

  try {
    const raw = localStorage.getItem(STREAK_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    currentStreak = stored?.streak ?? parsed?.streak ?? 1
    lastDate = stored?.lastDate ?? parsed?.lastDate ?? ''
    activeDaysOfWeek = parsed?.activeDaysOfWeek ?? [new Date().getDay()]
  } catch {
    currentStreak = 1
  }

  if (!lastDate) {
    currentStreak = 1
    lastDate = todayStr
  } else if (lastDate === todayStr) {
    // Already logged in today, keep streak
  } else {
    // Check difference in calendar days
    const last = new Date(lastDate)
    const today = new Date(todayStr)
    const diffTime = Math.abs(today.getTime() - last.getTime())
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      currentStreak += 1
    } else if (diffDays > 1) {
      currentStreak = 1
    }
    lastDate = todayStr
  }

  const todayDay = new Date().getDay()
  if (!activeDaysOfWeek.includes(todayDay)) {
    activeDaysOfWeek.push(todayDay)
  }

  const data: StreakData = {
    streak: Math.max(1, currentStreak),
    lastDate,
    activeDaysOfWeek,
  }

  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data))
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

