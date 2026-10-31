import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export type PowerUpType = 'freeze' | 'blur' | 'steal' | 'shield' | 'fifty_fifty' | 'double_score'

export interface PowerUpCard {
  id: PowerUpType
  name: string
  desc: string
  icon: string
  color: string
}

export const POWER_UP_CARDS: PowerUpCard[] = [
  {
    id: 'freeze',
    name: 'Layar Hang / Glitch',
    desc: 'Bikin layar lawan nge-freeze & bergetar 3.5 detik!',
    icon: '❄️',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'blur',
    name: 'Kaca Buram / Tinta',
    desc: 'Bikin soal di layar lawan blur total selama 3.5 detik!',
    icon: '🌫️',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'steal',
    name: 'Pencuri Poin',
    desc: 'Curi 60 poin lawan langsung ke skor kamu!',
    icon: '🥷',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'shield',
    name: 'Perisai Anti-Sabotase',
    desc: 'Kebal dari 1 serangan sabotase lawan berikutnya!',
    icon: '🛡️',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'fifty_fifty',
    name: '50:50 Eliminasi',
    desc: 'Hapus 2 pilihan jawaban salah di layarmu!',
    icon: '✂️',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    id: 'double_score',
    name: 'Booster 2X Poin',
    desc: 'Jika jawaban nomor ini benar, poinmu dikalikan dua!',
    icon: '⚡',
    color: 'from-yellow-400 to-amber-500',
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
