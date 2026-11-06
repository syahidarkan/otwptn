export interface QuestItem {
  id: string
  title: string
  rewardXP: number
  rewardCoins: number
  actionUrl: string
  isCompleted: boolean
  isClaimed: boolean
}

export const DEFAULT_QUESTS: QuestItem[] = [
  {
    id: 'q-login',
    title: 'Login Harian & Buka Dashboard OtwPTN',
    rewardXP: 15,
    rewardCoins: 10,
    actionUrl: '/dashboard',
    isCompleted: true,
    isClaimed: false,
  },
  {
    id: 'q-kalkulator',
    title: 'Simulasikan 1 Prodi di Kalkulator Peluang',
    rewardXP: 25,
    rewardCoins: 20,
    actionUrl: '/dashboard/kalkulator',
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'q-otbee',
    title: 'Kirim Pertanyaan Strategi ke Otbee AI',
    rewardXP: 20,
    rewardCoins: 15,
    actionUrl: '/dashboard/otbee',
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'q-essay',
    title: 'Simpan atau Review 1 Draft Essay Motivasi',
    rewardXP: 40,
    rewardCoins: 30,
    actionUrl: '/dashboard/essay',
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'q-tracking',
    title: 'Cek Kalender Seleksi di Tracking Jalur',
    rewardXP: 20,
    rewardCoins: 15,
    actionUrl: '/dashboard/tracking-jalur',
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'q-ecourse',
    title: 'Pelajari Modul atau Video Strategi Non-Tes',
    rewardXP: 30,
    rewardCoins: 25,
    actionUrl: '/dashboard/ecourse',
    isCompleted: false,
    isClaimed: false,
  },
]

export const EVENT_XP_UPDATED = 'otwptn_xp_updated'
export const EVENT_QUEST_COMPLETED = 'otwptn_quest_completed'

export interface GamificationState {
  xp: number
  level: number
  coins: number
  quests: QuestItem[]
}

export function getUserGamification(): GamificationState {
  if (typeof window === 'undefined') {
    return { xp: 45, level: 1, coins: 50, quests: DEFAULT_QUESTS }
  }

  try {
    const rawXP = localStorage.getItem('otwptn_xp')
    const rawLevel = localStorage.getItem('otwptn_level')
    const rawCoins = localStorage.getItem('otwptn_coins')
    const rawQuests = localStorage.getItem('otwptn_quests')

    const xp = rawXP ? parseInt(rawXP, 10) : 45
    const level = rawLevel ? parseInt(rawLevel, 10) : 1
    const coins = rawCoins ? parseInt(rawCoins, 10) : 50

    let quests = DEFAULT_QUESTS
    if (rawQuests) {
      const parsed = JSON.parse(rawQuests)
      if (Array.isArray(parsed) && parsed.length >= DEFAULT_QUESTS.length) {
        quests = parsed
      }
    }

    return {
      xp: isNaN(xp) ? 45 : xp,
      level: isNaN(level) ? 1 : level,
      coins: isNaN(coins) ? 50 : coins,
      quests,
    }
  } catch {
    return { xp: 45, level: 1, coins: 50, quests: DEFAULT_QUESTS }
  }
}

export function awardPoints(xpToAdd: number, coinsToAdd: number, reason?: string): GamificationState {
  if (typeof window === 'undefined') {
    return { xp: 0, level: 1, coins: 0, quests: DEFAULT_QUESTS }
  }

  const current = getUserGamification()
  let nextXP = current.xp + xpToAdd
  let nextLevel = current.level
  const nextCoins = current.coins + coinsToAdd

  while (nextXP >= 100) {
    nextLevel += 1
    nextXP -= 100
  }

  try {
    localStorage.setItem('otwptn_xp', String(nextXP))
    localStorage.setItem('otwptn_level', String(nextLevel))
    localStorage.setItem('otwptn_coins', String(nextCoins))
    window.dispatchEvent(new CustomEvent(EVENT_XP_UPDATED, {
      detail: { xp: nextXP, level: nextLevel, coins: nextCoins, reason },
    }))
  } catch (err) {
    console.warn('[gamification] Error persisting points:', err)
  }

  return {
    xp: nextXP,
    level: nextLevel,
    coins: nextCoins,
    quests: current.quests,
  }
}

export function completeQuest(questId: string): void {
  if (typeof window === 'undefined') return

  const state = getUserGamification()
  let questUpdated = false

  const updatedQuests = state.quests.map(q => {
    if (q.id === questId && !q.isCompleted) {
      questUpdated = true
      return { ...q, isCompleted: true }
    }
    return q
  })

  if (questUpdated) {
    try {
      localStorage.setItem('otwptn_quests', JSON.stringify(updatedQuests))
      window.dispatchEvent(new CustomEvent(EVENT_QUEST_COMPLETED, { detail: { questId } }))
    } catch (err) {
      console.warn('[gamification] Error completing quest:', err)
    }
  }
}

