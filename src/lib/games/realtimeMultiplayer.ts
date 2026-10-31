import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export type PowerUpType = 'freeze' | 'blur' | 'steal' | 'shield' | 'fifty_fifty' | 'double_score'

export interface PowerUpCard {
  id: PowerUpType
  name: string
  desc: string
  icon: string
  color: string
  rarity: 'LEGENDARY' | 'EPIC' | 'RARE' | 'SPECIAL'
  borderGlow: string
  badgeBg: string
}

export const POWER_UP_CARDS: PowerUpCard[] = [
  {
    id: 'freeze',
    name: 'Layar Freeze',
    desc: 'Bekukan layar musuh 3.5 detik, tombol jawaban terkunci!',
    icon: '❄️',
    color: 'from-cyan-500 via-sky-600 to-blue-700',
    rarity: 'EPIC',
    borderGlow: 'border-cyan-400 shadow-cyan-500/40',
    badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
  },
  {
    id: 'blur',
    name: 'Kaca Buram',
    desc: 'Semprotkan kabut tinta pekat ke soal musuh selama 3.5 detik!',
    icon: '🌫️',
    color: 'from-purple-500 via-fuchsia-600 to-indigo-700',
    rarity: 'RARE',
    borderGlow: 'border-purple-400 shadow-purple-500/40',
    badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
  },
  {
    id: 'steal',
    name: 'Pencuri Poin',
    desc: 'Rampas 60 poin musuh dan transfer seketika ke skormu!',
    icon: '🥷',
    color: 'from-amber-500 via-orange-600 to-rose-700',
    rarity: 'LEGENDARY',
    borderGlow: 'border-amber-400 shadow-amber-500/50',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
  },
  {
    id: 'shield',
    name: 'Perisai Kebal',
    desc: 'Tangkal dan batalkan 1 serangan sabotase musuh berikutnya!',
    icon: '🛡️',
    color: 'from-emerald-500 via-teal-600 to-green-700',
    rarity: 'SPECIAL',
    borderGlow: 'border-emerald-400 shadow-emerald-500/40',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
  },
  {
    id: 'fifty_fifty',
    name: '50:50 Eliminasi',
    desc: 'Hapus 2 pilihan opsi salah agar peluangmu makin tinggi!',
    icon: '✂️',
    color: 'from-indigo-500 via-blue-600 to-violet-700',
    rarity: 'SPECIAL',
    borderGlow: 'border-indigo-400 shadow-indigo-500/40',
    badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
  },
  {
    id: 'double_score',
    name: 'Booster 2X',
    desc: 'Poin untuk jawaban nomor ini berlipat ganda 200%!',
    icon: '⚡',
    color: 'from-yellow-400 via-amber-500 to-orange-600',
    rarity: 'LEGENDARY',
    borderGlow: 'border-yellow-300 shadow-yellow-500/50',
    badgeBg: 'bg-yellow-950/80 text-yellow-300 border-yellow-500/40',
  },
]

export interface PlayerState {
  id: string
  name: string
  avatar: string
  score: number
  streak: number
  hasShield: boolean
  currentQIndex: number
  isReady: boolean
  isFinished: boolean
}

export function subscribeToBattleRoom(
  roomCode: string,
  myPlayer: PlayerState,
  callbacks: {
    onPlayerJoin: (player: PlayerState) => void
    onGameStart: () => void
    onOpponentAnswer: (data: { score: number; qIndex: number; isCorrect: boolean }) => void
    onAttacked: (data: { powerUp: PowerUpType; attackerName: string }) => void
    onOpponentLeave: () => void
  }
): {
  channel: RealtimeChannel
  sendJoin: () => void
  sendReady: () => void
  sendAnswer: (score: number, qIndex: number, isCorrect: boolean) => void
  sendAttack: (powerUp: PowerUpType) => void
  leave: () => void
} {
  const supabase = createClient()
  const channelName = `battle_quiz_${roomCode.toUpperCase()}`

  const channel = supabase.channel(channelName, {
    config: {
      broadcast: { self: false },
      presence: { key: myPlayer.id },
    },
  })

  channel
    .on('broadcast', { event: 'player_join' }, ({ payload }) => {
      callbacks.onPlayerJoin(payload.player)
    })
    .on('broadcast', { event: 'player_ready' }, () => {
      callbacks.onGameStart()
    })
    .on('broadcast', { event: 'player_answer' }, ({ payload }) => {
      callbacks.onOpponentAnswer(payload)
    })
    .on('broadcast', { event: 'attack' }, ({ payload }) => {
      callbacks.onAttacked(payload)
    })
    .on('presence', { event: 'leave' }, () => {
      callbacks.onOpponentLeave()
    })
    .subscribe(status => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'player_join',
          payload: { player: myPlayer },
        })
      }
    })

  const sendJoin = () => {
    channel.send({
      type: 'broadcast',
      event: 'player_join',
      payload: { player: myPlayer },
    })
  }

  const sendReady = () => {
    channel.send({
      type: 'broadcast',
      event: 'player_ready',
      payload: { playerId: myPlayer.id },
    })
  }

  const sendAnswer = (score: number, qIndex: number, isCorrect: boolean) => {
    channel.send({
      type: 'broadcast',
      event: 'player_answer',
      payload: { score, qIndex, isCorrect },
    })
  }

  const sendAttack = (powerUp: PowerUpType) => {
    channel.send({
      type: 'broadcast',
      event: 'attack',
      payload: { powerUp, attackerName: myPlayer.name },
    })
  }

  const leave = () => {
    supabase.removeChannel(channel)
  }

  return {
    channel,
    sendJoin,
    sendReady,
    sendAnswer,
    sendAttack,
    leave,
  }
}
