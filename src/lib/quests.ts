/**
 * GAMIFICATION QUEST SYSTEM HELPER
 */

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
    title: 'Tonton atau Baca 1 Modul E-Course Strategi Non-Tes',
    rewardXP: 30,
    rewardCoins: 25,
    actionUrl: '/dashboard/ecourse',
    isCompleted: false,
    isClaimed: false,
  },
]

export function getQuests(): QuestItem[] {
  if (typeof window === 'undefined') return DEFAULT_QUESTS
  try {
    const stored = localStorage.getItem('otwptn_quests')
    if (stored) {
      return JSON.parse(stored)
    }
    localStorage.setItem('otwptn_quests', JSON.stringify(DEFAULT_QUESTS))
    return DEFAULT_QUESTS
  } catch {
    return DEFAULT_QUESTS
  }
}

/**
 * Menyelesaikan misi harian secara instan dan memicu sinkronisasi state
 */
export function completeQuest(questId: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const quests = getQuests()
    let found = false
    const updated = quests.map(q => {
      if (q.id === questId && !q.isCompleted) {
        found = true
        return { ...q, isCompleted: true }
      }
      return q
    })

    if (found) {
      localStorage.setItem('otwptn_quests', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('otwptn_quest_completed', { detail: { questId } }))
      return true
    }
  } catch (err) {
    console.error('Failed to complete quest:', err)
  }
  return false
}
