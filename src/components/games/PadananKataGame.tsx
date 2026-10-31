'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Timer,
  Zap,
  Award,
  RotateCcw,
  Bot,
  User,
  Users,
  Swords,
  Share2,
  Sparkles,
  Shield,
  Flame,
  Volume2,
  CheckCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react'
import questionsData from '@/lib/games/padanan-kata.json'
import {
  GameMode,
  BOT_PROFILES,
  awardXP,
  generateRoomCode,
} from '@/lib/games/gameEngine'
import {
  POWER_UP_CARDS,
  PowerUpCard,
  PowerUpType,
  subscribeToBattleRoom,
} from '@/lib/games/realtimeMultiplayer'

interface Props {
  initialMode?: GameMode
  initialRoomCode?: string
  opponentPreset?: { name: string; avatar?: string }
  onExit?: () => void
}

export default function PadananKataGame({
  initialMode = 'solo',
  initialRoomCode = '',
  opponentPreset,
  onExit,
}: Props) {
  const [mode, setMode] = useState<GameMode>(initialMode)
  const [roomCode, setRoomCode] = useState(initialRoomCode || '')
  const [inputRoomCode, setInputRoomCode] = useState('')
  const [gameState, setGameState] = useState<'lobby' | 'countdown' | 'playing' | 'finished'>('lobby')
  const [countdown, setCountdown] = useState(3)

  // Player States
  const [myId] = useState(() => 'user_' + Math.random().toString(36).substring(2, 8))
  const [myName] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('otwptn_user_name')
      if (stored) return stored
    }
    return 'Pejuang PTN'
  })

  // Opponent States
  const [opponentName, setOpponentName] = useState(opponentPreset?.name || 'Lawan')
  const [opponentScore, setOpponentScore] = useState(0)
  const [opponentQIdx, setOpponentQIdx] = useState(0)

  // Game Progress States
  const [qIndex, setQIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(12)
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null)
  const [answerStatus, setAnswerStatus] = useState<'none' | 'correct' | 'wrong' | 'timeout'>('none')
  const [eliminatedOpts, setEliminatedOpts] = useState<number[]>([])

  // Power-Up Cards System
  const [myCards, setMyCards] = useState<PowerUpCard[]>([])
  const [hasShield, setHasShield] = useState(false)
  const [isDoubleScore, setIsDoubleScore] = useState(false)

  // Status Efek Serangan Lawan di Layar Kita
  const [isFrozen, setIsFrozen] = useState(false)
  const [isBlurred, setIsBlurred] = useState(false)
  const [attackNotice, setAttackNotice] = useState<string | null>(null)

  // Review Answers State at End
  const [reviewMode, setReviewMode] = useState(false)
  const [answeredHistory, setAnsweredHistory] = useState<
    { qIndex: number; selected: number | null; isCorrect: boolean }[]
  >([])

  // Realtime Channel Ref
  const realtimeRef = useRef<ReturnType<typeof subscribeToBattleRoom> | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Initial Questions Set (8 Soal per sesi)
  const [activeQuestions, setActiveQuestions] = useState(questionsData.slice(0, 8))

  // Inisialisasi Game & Kartu Awal
  const initGame = (targetMode: GameMode = mode, code = roomCode) => {
    const randomized = [...questionsData].sort(() => Math.random() - 0.5).slice(0, 8)
    setActiveQuestions(randomized)
    setQIndex(0)
    setScore(0)
    setOpponentScore(0)
    setOpponentQIdx(0)
    setStreak(0)
    setSelectedOpt(null)
    setAnswerStatus('none')
    setEliminatedOpts([])
    setIsFrozen(false)
    setIsBlurred(false)
    setHasShield(false)
    setIsDoubleScore(false)
    setAttackNotice(null)
    setAnsweredHistory([])
    setReviewMode(false)

    // Beri 2 kartu powerup acak di awal game
    const shuffledCards = [...POWER_UP_CARDS].sort(() => Math.random() - 0.5)
    setMyCards(shuffledCards.slice(0, 2))

    if (targetMode === 'solo') {
      setGameState('playing')
    } else if (targetMode === 'bot') {
      const pickedBot = BOT_PROFILES[Math.floor(Math.random() * BOT_PROFILES.length)]
      setOpponentName(opponentPreset?.name || pickedBot.name)
      setGameState('playing')
    } else if (targetMode === 'room' || targetMode === 'random') {
      const finalCode = code || generateRoomCode()
      setRoomCode(finalCode)
      setGameState('lobby')
      setupRealtime(finalCode)
    }
  }

  // Setup Supabase Realtime WebSocket Connection
  const setupRealtime = (code: string) => {
    if (realtimeRef.current) realtimeRef.current.leave()

    realtimeRef.current = subscribeToBattleRoom(
      code,
      {
        id: myId,
        name: myName,
        avatar: '/mascot-hd/kalkulator-peluang.png',
        score: 0,
        streak: 0,
        hasShield: false,
        currentQIndex: 0,
        isReady: false,
        isFinished: false,
      },
      {
        onPlayerJoin: player => {
          setOpponentName(player.name)
        },
        onGameStart: () => {
          startCountdown()
        },
        onOpponentAnswer: data => {
          setOpponentScore(data.score)
          setOpponentQIdx(data.qIndex + 1)
        },
        onAttacked: data => {
          handleIncomingAttack(data.powerUp, data.attackerName)
        },
        onOpponentLeave: () => {
          setAttackNotice('Lawan meninggalkan room.')
        },
      }
    )
  }

  const startCountdown = () => {
    setGameState('countdown')
    setCountdown(3)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setGameState('playing')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Menerima Serangan Sabotase dari Lawan
  const handleIncomingAttack = (powerUp: PowerUpType, attacker: string) => {
    if (hasShield) {
      setHasShield(false)
      setAttackNotice(`🛡️ Perisaimu menangkis serangan ${powerUp.toUpperCase()} dari ${attacker}!`)
      setTimeout(() => setAttackNotice(null), 3000)
      return
    }

    if (powerUp === 'freeze') {
      setIsFrozen(true)
      setAttackNotice(`❄️ LAYAR HANG! ${attacker} membekukan tokomu selama 3.5 detik!`)
      setTimeout(() => {
        setIsFrozen(false)
        setAttackNotice(null)
      }, 3500)
    } else if (powerUp === 'blur') {
      setIsBlurred(true)
      setAttackNotice(`🌫️ KACA BURAM! ${attacker} menyemprotkan tinta selama 3.5 detik!`)
      setTimeout(() => {
        setIsBlurred(false)
        setAttackNotice(null)
      }, 3500)
    } else if (powerUp === 'steal') {
      setScore(prev => Math.max(0, prev - 60))
      setOpponentScore(prev => prev + 60)
      setAttackNotice(`🥷 ${attacker} mencuri 60 poinmu!`)
      setTimeout(() => setAttackNotice(null), 3000)
    }
  }

  // Menggunakan Kartu Powerup Sendiri
  const usePowerUp = (card: PowerUpCard) => {
    // Hapus kartu dari inventory
    setMyCards(prev => prev.filter(c => c !== card))

    if (card.id === 'shield') {
      setHasShield(true)
      setAttackNotice('🛡️ Perisai aktif! Kebal dari 1 serangan lawan berikutnya.')
      setTimeout(() => setAttackNotice(null), 3000)
    } else if (card.id === 'double_score') {
      setIsDoubleScore(true)
      setAttackNotice('⚡ Booster 2X aktif untuk soal ini!')
      setTimeout(() => setAttackNotice(null), 3000)
    } else if (card.id === 'fifty_fifty') {
      // Hapus 2 opsi salah dari soal saat ini
      const cur = activeQuestions[qIndex]
      const wrongIndices = cur.options
        .map((_, i) => i)
        .filter(i => i !== cur.correctIndex)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
      setEliminatedOpts(wrongIndices)
      setAttackNotice('✂️ 2 opsi salah berhasil dieliminasi!')
      setTimeout(() => setAttackNotice(null), 3000)
    } else {
      // Serangan ke lawan (freeze, blur, steal)
      if (mode === 'room' && realtimeRef.current) {
        realtimeRef.current.sendAttack(card.id)
        setAttackNotice(`🚀 Kamu menyerang ${opponentName} dengan kartu ${card.name}!`)
      } else if (mode === 'bot') {
        // Simulasi bot terkena dampak
        if (card.id === 'steal') {
          setScore(prev => prev + 60)
          setOpponentScore(prev => Math.max(0, prev - 60))
        }
        setAttackNotice(`🚀 Kartu ${card.name} berhasil menyerang ${opponentName}!`)
      }
      setTimeout(() => setAttackNotice(null), 3000)
    }
  }

  useEffect(() => {
    initGame(mode)
    return () => {
      if (realtimeRef.current) realtimeRef.current.leave()
    }
  }, [mode])

  const curQ = activeQuestions[qIndex] || activeQuestions[0]

  // Timer Soal (Countdown Mundur)
  useEffect(() => {
    if (gameState !== 'playing' || answerStatus !== 'none' || isFrozen) return

    setTimeLeft(12)

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Simulasi respons bot jika mode bot
    if (mode === 'bot') {
      const botDelay = Math.floor(Math.random() * 4500) + 3500
      const botAction = setTimeout(() => {
        const isBotRight = Math.random() < 0.8
        if (isBotRight) {
          setOpponentScore(prev => prev + 100 + Math.floor(Math.random() * 20))
        }
        setOpponentQIdx(prev => prev + 1)
      }, botDelay)

      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
        clearTimeout(botAction)
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [qIndex, gameState, answerStatus, isFrozen])

  // Saat Waktu Habis: LANGSUNG LANJUT! (TIDAK BOCORKAN JAWABAN)
  const handleTimeout = () => {
    setAnswerStatus('timeout')
    setStreak(0)
    setAnsweredHistory(prev => [
      ...prev,
      { qIndex, selected: null, isCorrect: false },
    ])

    // Jeda kilat 0.7s lalu langsung lompat ke soal berikutnya!
    setTimeout(() => {
      advanceNextQuestion()
    }, 700)
  }

  // Saat Pemain Memilih Opsi Jawaban
  const handleAnswer = (optIdx: number) => {
    if (answerStatus !== 'none' || isFrozen) return
    if (timerRef.current) clearInterval(timerRef.current)

    setSelectedOpt(optIdx)
    const isCorrect = optIdx === curQ.correctIndex

    setAnsweredHistory(prev => [
      ...prev,
      { qIndex, selected: optIdx, isCorrect },
    ])

    let newScore = score
    if (isCorrect) {
      setAnswerStatus('correct')
      let gained = 100 + timeLeft * 10 + streak * 15
      if (isDoubleScore) gained *= 2
      newScore += gained
      setScore(newScore)

      const newStreak = streak + 1
      setStreak(newStreak)

      // Hadiah kartu jika streak 2x
      if (newStreak % 2 === 0 && myCards.length < 3) {
        const randomCard = POWER_UP_CARDS[Math.floor(Math.random() * POWER_UP_CARDS.length)]
        setMyCards(prev => [...prev, randomCard])
        setAttackNotice(`🎁 STREAK 2X! Kamu dapat kartu baru: ${randomCard.name}!`)
        setTimeout(() => setAttackNotice(null), 2500)
      }
    } else {
      setAnswerStatus('wrong')
      setStreak(0)
    }

    // Broadcast jawaban kita ke lawan jika mode room
    if (mode === 'room' && realtimeRef.current) {
      realtimeRef.current.sendAnswer(newScore, qIndex, isCorrect)
    }

    // JEDA KILAT 0.7 DETIK LANGSUNG LANJUT KE SOAL BERIKUTNYA (TANPA SPOILER JAWABAN!)
    setTimeout(() => {
      advanceNextQuestion()
    }, 700)
  }

  const advanceNextQuestion = () => {
    setSelectedOpt(null)
    setAnswerStatus('none')
    setEliminatedOpts([])
    setIsDoubleScore(false)

    if (qIndex < activeQuestions.length - 1) {
      setQIndex(prev => prev + 1)
    } else {
      finishMatch()
    }
  }

  const finishMatch = () => {
    setGameState('finished')
    const won = score > opponentScore
    const xpGain = mode === 'solo' ? 35 : won ? 120 : 50
    awardXP(xpGain, 'Battle PPU')
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white shadow-2xl border-2 border-amber-300 overflow-hidden relative">
      {/* Visual Attack Overlays */}
      <AnimatePresence>
        {isFrozen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-cyan-900/40 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 border-4 border-cyan-400 animate-pulse pointer-events-auto"
          >
            <div className="text-6xl mb-2">❄️</div>
            <h3 className="text-2xl font-black text-cyan-200 tracking-wider">LAYAR NGE-FREEZE!</h3>
            <p className="text-xs text-cyan-100 font-bold mt-1">
              Kamu sedang disabotase oleh {opponentName}! Tunggu es mencair...
            </p>
          </motion.div>
        )}

        {isBlurred && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-purple-950/20 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6"
          >
            <div className="text-6xl mb-2">🌫️</div>
            <h3 className="text-2xl font-black text-purple-300">KACA DISERANG TINTA!</h3>
            <p className="text-xs text-purple-100 font-bold mt-1">
              Layar soalmu kabur selama beberapa detik!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="px-6 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-gray-950 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Swords size={22} className="text-amber-950" />
          <div>
            <h3 className="text-base font-black tracking-tight leading-none">Battle Arena PPU & PBM</h3>
            <span className="text-[10px] font-bold text-amber-900 uppercase">Wayground & Quizizz Style</span>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-amber-600/20 p-1 rounded-full text-xs font-bold">
          <button
            onClick={() => setMode('solo')}
            className={`px-3 py-1 rounded-full transition-all ${
              mode === 'solo' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-900'
            }`}
          >
            Solo
          </button>
          <button
            onClick={() => setMode('bot')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
              mode === 'bot' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-900'
            }`}
          >
            <Bot size={13} /> Bot
          </button>
          <button
            onClick={() => setMode('room')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
              mode === 'room' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-900'
            }`}
          >
            <Users size={13} /> Battle Room
          </button>
        </div>
      </div>

      {/* Global Attack Notice Toast */}
      {attackNotice && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-gray-950 text-white text-xs font-black py-2 px-4 text-center border-b border-amber-400"
        >
          {attackNotice}
        </motion.div>
      )}

      {/* LOBBY ROOM VIEW */}
      {mode === 'room' && gameState === 'lobby' && (
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
            <Swords size={32} />
          </div>
          <div>
            <h4 className="text-xl font-black text-gray-900">Battle Room Multiplayer</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Bagikan kode 6 digit ini ke temanmu di Study Cam atau WhatsApp. Dua pemain akan menjawab soal yang sama secara realtime!
            </p>
          </div>

          <div className="p-4 rounded-3xl bg-amber-50 border-2 border-dashed border-amber-400 max-w-xs mx-auto">
            <span className="text-[11px] font-bold text-amber-800 uppercase block mb-1">
              KODE ROOM ANDA
            </span>
            <span className="text-4xl font-mono font-black tracking-widest text-gray-950">
              {roomCode}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(roomCode)
                alert(`Kode room ${roomCode} disalin! Kirimkan ke temanmu.`)
              }}
              className="btn btn-outline py-2.5 px-4 text-xs font-bold flex items-center gap-1.5"
            >
              <Share2 size={14} /> Salin Kode
            </button>
            <button
              onClick={() => {
                if (realtimeRef.current) realtimeRef.current.sendReady()
                startCountdown()
              }}
              className="btn btn-primary py-2.5 px-6 text-xs font-black shadow-md"
            >
              Mulai Duel
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
            Punya kode dari teman?
            <div className="flex items-center justify-center gap-2 mt-2">
              <input
                type="text"
                placeholder="KODE ROOM"
                value={inputRoomCode}
                onChange={e => setInputRoomCode(e.target.value.toUpperCase())}
                className="input input-sm max-w-[140px] text-center font-mono font-bold uppercase"
              />
              <button
                onClick={() => {
                  if (inputRoomCode.length >= 4) {
                    setRoomCode(inputRoomCode)
                    setupRealtime(inputRoomCode)
                    setOpponentName('Host Teman')
                    startCountdown()
                  }
                }}
                className="btn btn-sm bg-gray-900 text-white font-bold"
              >
                Gabung Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COUNTDOWN VIEW */}
      {gameState === 'countdown' && (
        <div className="p-16 text-center space-y-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
            DUEL DIMULAI DALAM
          </span>
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            className="text-7xl font-black text-amber-500 font-mono"
          >
            {countdown}
          </motion.div>
          <p className="text-xs text-gray-600 font-bold">
            {myName} vs {opponentName}
          </p>
        </div>
      )}

      {/* PLAYING VIEW */}
      {gameState === 'playing' && (
        <div className="p-6 md:p-8 space-y-5">
          {/* Live Battle Scoreboard Header */}
          <div className="p-3 rounded-2xl bg-gray-900 text-white flex items-center justify-between px-5 shadow-md">
            {/* My Score */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-gray-950 font-black flex items-center justify-center text-xs">
                Kamu
              </div>
              <div>
                <span className="text-xs font-extrabold text-amber-400 block">{score} Poin</span>
                <span className="text-[10px] text-gray-400">Soal {qIndex + 1}/{activeQuestions.length}</span>
              </div>
            </div>

            <div className="text-xs font-black text-amber-300 bg-white/10 px-3 py-1 rounded-full">
              VS
            </div>

            {/* Opponent Score */}
            <div className="flex items-center gap-2.5 text-right">
              <div>
                <span className="text-xs font-extrabold text-rose-400 block">{opponentScore} Poin</span>
                <span className="text-[10px] text-gray-400">{opponentName}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white font-black flex items-center justify-center text-xs">
                Lawan
              </div>
            </div>
          </div>

          {/* Timer Countdown Bar */}
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${timeLeft <= 3 ? 'bg-rose-500' : 'bg-amber-500'}`}
              animate={{ width: `${(timeLeft / 12) * 100}%` }}
              transition={{ ease: 'linear', duration: 1 }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span className="uppercase text-[11px] text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md">
              Kategori: {curQ.type}
            </span>
            <span className={`font-mono text-sm ${timeLeft <= 3 ? 'text-rose-600 font-black' : 'text-gray-700'}`}>
              ⏱️ {timeLeft}s
            </span>
          </div>

          {/* Flash Feedback Alert: CEFAT & TANPA SPOILER JAWABAN */}
          <AnimatePresence>
            {answerStatus === 'correct' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-2.5 rounded-xl bg-emerald-500 text-white font-black text-center text-sm shadow-md"
              >
                BENAR! +{100 + timeLeft * 10} POIN 🔥
              </motion.div>
            )}
            {answerStatus === 'wrong' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-2.5 rounded-xl bg-rose-500 text-white font-black text-center text-sm shadow-md"
              >
                SALAH! TETAP SEMANGAT ❌
              </motion.div>
            )}
            {answerStatus === 'timeout' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-2.5 rounded-xl bg-gray-800 text-amber-400 font-black text-center text-sm shadow-md"
              >
                WAKTU HABIS! ⏱️
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question Prompt */}
          <div className="text-center py-2 space-y-2">
            <p className="text-xs md:text-sm font-semibold text-gray-500">{curQ.question}</p>
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 inline-block">
              <h2 className="text-xl md:text-2xl font-black text-gray-950 font-mono tracking-wider">
                {curQ.prompt}
              </h2>
            </div>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {curQ.options.map((opt, idx) => {
              const isEliminated = eliminatedOpts.includes(idx)
              const isSelected = selectedOpt === idx

              let btnStyle =
                'bg-white border-2 border-gray-100 text-gray-800 hover:border-amber-400 hover:bg-amber-50/50'

              if (isEliminated) {
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gray-100 border border-gray-200 text-gray-300 font-medium line-through select-none"
                  >
                    (Opsi Dieliminasi)
                  </div>
                )
              }

              if (answerStatus !== 'none') {
                if (isSelected) {
                  btnStyle =
                    answerStatus === 'correct'
                      ? 'bg-emerald-500 text-white border-emerald-600 font-black'
                      : 'bg-rose-500 text-white border-rose-600 font-bold'
                } else {
                  btnStyle = 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'
                }
              }

              return (
                <button
                  key={idx}
                  disabled={answerStatus !== 'none' || isFrozen}
                  onClick={() => handleAnswer(idx)}
                  className={`p-4 rounded-2xl text-left text-xs md:text-sm font-semibold transition-all shadow-xs ${btnStyle}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>

          {/* POWER-UP DECK TRAY (KARTU GANGGU LAWAN & BUFF) */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-gray-900 flex items-center gap-1">
                <Sparkles size={14} className="text-amber-500" />
                Kartu Sabotase & Power-Up ({myCards.length}/3):
              </span>
              {hasShield && (
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Shield size={10} /> Shield Aktif
                </span>
              )}
            </div>

            {myCards.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {myCards.map((card, i) => (
                  <button
                    key={i}
                    onClick={() => usePowerUp(card)}
                    disabled={isFrozen || answerStatus !== 'none'}
                    className={`p-2.5 rounded-2xl bg-gradient-to-r ${card.color} text-white font-bold text-xs text-left shadow-sm hover:scale-102 active:scale-98 transition-all flex items-start gap-2`}
                  >
                    <span className="text-xl flex-shrink-0">{card.icon}</span>
                    <div>
                      <span className="font-black block leading-tight text-[11px]">{card.name}</span>
                      <span className="text-[9px] opacity-90 line-clamp-1">{card.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 italic">
                Jawab benar 2 soal beruntun (Streak) untuk mendapatkan kartu kekuatan baru!
              </p>
            )}
          </div>
        </div>
      )}

      {/* FINISHED / RESULTS VIEW */}
      {gameState === 'finished' && (
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
            <Award size={36} />
          </div>

          <div>
            <h3 className="text-2xl font-black text-gray-950">
              {score > opponentScore
                ? 'Kemenangan Telak! 🏆'
                : score === opponentScore
                ? 'Hasil Seri! 🤝'
                : 'Pertarungan Sengit! ⚡'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {score > opponentScore
                ? `Selamat! Kamu berhasil mengungguli ${opponentName}.`
                : `${opponentName} menang tipis. Balas di ronde berikutnya!`}
            </p>
          </div>

          {/* Scores comparison */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-[11px] font-bold text-amber-800 uppercase block">Skor Kamu</span>
              <span className="text-2xl font-black text-gray-950 font-mono">{score}</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <span className="text-[11px] font-bold text-gray-500 uppercase block">Skor {opponentName}</span>
              <span className="text-2xl font-black text-gray-700 font-mono">{opponentScore}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => initGame(mode)}
              className="btn btn-primary py-3 px-6 text-xs font-black flex items-center gap-2"
            >
              <RotateCcw size={14} /> Main Lagi
            </button>

            <button
              onClick={() => setReviewMode(!reviewMode)}
              className="btn btn-outline py-3 px-6 text-xs font-bold"
            >
              {reviewMode ? 'Tutup Kunci Jawaban' : '📖 Review Kunci Jawaban'}
            </button>
          </div>

          {/* REVIEW MODE: PEMBAHASAN HANYA DI AKHIR GAME! */}
          {reviewMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-left space-y-4 pt-6 border-t border-gray-100 max-h-96 overflow-y-auto pr-2"
            >
              <h4 className="text-sm font-black text-gray-900">Pembahasan & Kaidah Lengkap PPU/PBM:</h4>
              {activeQuestions.map((q, idx) => {
                const ans = answeredHistory[idx]
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-gray-900">
                        {idx + 1}. {q.prompt}
                      </span>
                      {ans?.isCorrect ? (
                        <span className="text-emerald-600 font-bold">✓ Benar</span>
                      ) : (
                        <span className="text-rose-500 font-bold">✗ Salah</span>
                      )}
                    </div>
                    <p className="text-gray-600">{q.question}</p>
                    <p className="text-emerald-700 font-bold">
                      Kunci: {q.options[q.correctIndex]}
                    </p>
                    <p className="text-gray-700 bg-white p-2 rounded-xl border border-gray-100">
                      <strong>Penjelasan:</strong> {q.explanation}
                    </p>
                  </div>
                )
              })}
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
