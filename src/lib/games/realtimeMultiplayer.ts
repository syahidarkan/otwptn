import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export type PowerUpType = 'freeze' | 'blur' | 'steal' | 'shield' | 'fifty_fifty' | 'double_score'

export interface PowerUpCard {
  id: PowerUpType
  name: string
  category: string
  desc: string
  tag: string
  icon: string
  mascot: string
}

export const POWER_UP_CARDS: PowerUpCard[] = [
  {
    id: 'freeze',
    name: 'Layar Freeze Lawan',
    category: 'Sabotase Layar',
    desc: 'Bekukan layar musuh 3.5 detik, tombol terkunci!',
    tag: 'Kunci 3.5s',
    icon: '❄️',
    mascot: '/mascot/confused.png',
  },
  {
    id: 'blur',
    name: 'Semprot Kaca Buram',
    category: 'Gangguan Tinta',
    desc: 'Kabut tinta pekat menutupi soal di layar lawan!',
    tag: 'Tinta 3.5s',
    icon: '🌫️',
    mascot: '/mascot/glasses-writing-desk.png',
  },
  {
    id: 'steal',
    name: 'Rampas Poin Lawan',
    category: 'Pencuri Poin',
    desc: 'Curi 60 poin lawan seketika ke skormu!',
    tag: '+60 Poin',
    icon: '🥷',
    mascot: '/mascot/coin-bag.png',
  },
  {
    id: 'shield',
    name: 'Perisai Anti-Sabotase',
    category: 'Proteksi Kebal',
    desc: 'Tangkal 1 serangan kartu sabotase musuh berikutnya!',
    tag: 'Kebal 1x',
    icon: '🛡️',
    mascot: '/mascot/thumbsup.png',
  },
  {
    id: 'fifty_fifty',
    name: 'Eliminasi 50:50',
    category: 'Bantuan Kuis',
    desc: 'Hapus 2 opsi jawaban yang salah dari layarmu!',
    tag: 'Hapus 2 Opsi',
    icon: '✂️',
    mascot: '/mascot/check-paper-happy.png',
  },
  {
    id: 'double_score',
    name: 'Booster 2X Poin',
    category: 'Pengali Skor',
    desc: 'Poin untuk soal nomor ini berlipat ganda 200%!',
    tag: 'Poin 2X Lipat',
    icon: '⚡',
    mascot: '/mascot/star-sparkle.png',
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
