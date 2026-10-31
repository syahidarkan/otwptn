export type GameMode = 'solo' | 'bot' | 'room' | 'random'
export type GameType = 'padanan-kata' | 'baku-atau-nggak' | 'benerin-kalimat'

export interface LeaderboardEntry {
  id: string
  name: string
  avatar: string
  school: string
  score: number
  gamesPlayed: number
  winRate: number
  tier: string
}

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lead-1',
    name: 'Nabila Azzahra',
    avatar: '/ptn-logos/ui.png',
    school: 'SMAN 8 Jakarta',
    score: 1840,
    gamesPlayed: 24,
    winRate: 88,
    tier: 'Master PPU',
  },
  {
    id: 'lead-2',
    name: 'Rifqi Pratama',
    avatar: '/ptn-logos/itb.png',
    school: 'SMAN 3 Bandung',
    score: 1690,
    gamesPlayed: 21,
    winRate: 81,
    tier: 'Pakar PBM',
  },
  {
    id: 'lead-3',
    name: 'Dimas Suryo',
    avatar: '/ptn-logos/ugm.png',
    school: 'SMAN 1 Yogyakarta',
    score: 1520,
    gamesPlayed: 19,
    winRate: 74,
    tier: 'Pejuang SNBP',
  },
  {
    id: 'lead-4',
    name: 'Keisha Putri',
    avatar: '/ptn-logos/unair.png',
    school: 'MAN 2 Surabaya',
    score: 1380,
    gamesPlayed: 16,
    winRate: 69,
    tier: 'Pejuang SNBP',
  },
  {
    id: 'lead-5',
    name: 'Farhan Dwi',
    avatar: '/ptn-logos/ipb.png',
    school: 'SMAN 1 Bogor',
    score: 1210,
    gamesPlayed: 14,
    winRate: 64,
    tier: 'Ksatria Ejaan',
  },
]

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Simulasi bot cerdas pejuang PTN
export interface BotProfile {
  name: string
  school: string
  targetPTN: string
  accuracy: number
  avatar: string
}

export const BOT_PROFILES: BotProfile[] = [
  {
    name: 'Bot Otbee Juara',
    school: 'SMA Labschool Rawamangun',
    targetPTN: 'FK UI',
    accuracy: 0.85,
    avatar: '/mascot-hd/kalkulator-peluang.png',
  },
  {
    name: 'Bot Si Pejuang Rapor',
    school: 'SMAN 5 Surabaya',
    targetPTN: 'STEI ITB',
    accuracy: 0.80,
    avatar: '/ptn-logos/itb.png',
  },
  {
    name: 'Bot Ambis SNBP',
    school: 'SMAN 1 Teladan Yogyakarta',
    targetPTN: 'Hukum UGM',
    accuracy: 0.75,
    avatar: '/ptn-logos/ugm.png',
  },
]

export function awardXP(amount: number, gameTitle: string) {
  if (typeof window === 'undefined') return
  try {
    const curXP = parseInt(localStorage.getItem('otwptn_user_xp') || '250', 10)
    const newXP = curXP + amount
    localStorage.setItem('otwptn_user_xp', String(newXP))

    // Dispatch global event agar widget XP di header/dashboard langsung bertambah
    window.dispatchEvent(
      new CustomEvent('otwptn_xp_awarded', {
        detail: { amount, newXP, gameTitle },
      })
    )
  } catch {}
}
