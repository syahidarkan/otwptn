'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Timer,
  Award,
  RotateCcw,
  User,
  Users,
  Swords,
  Share2,
  Sparkles,
  Shield,
  Flame,
  Volume2,
  VolumeX,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  XCircle,
  BookOpen,
} from 'lucide-react'
import Image from 'next/image'
import {
  POWER_UP_CARDS,
  PowerUpCard,
  PowerUpType,
  subscribeToBattleRoom,
} from '@/lib/games/realtimeMultiplayer'
import { getQuizQuestions, QuizQuestion } from '@/lib/games/quizQuestionBank'
import {
  playCountdownBeep,
  playAnswerSound,
  playPowerUpSound,
  playFreezeSound,
} from '@/lib/games/soundEffects'
import { awardXP, generateRoomCode } from '@/lib/games/gameEngine'

export type ModeType = 'solo' | 'matching' | 'room'
export type CategoryType = 'padanan' | 'baku' | 'kalimat' | 'mixed'

interface Props {
  initialMode?: ModeType
  initialCategory?: CategoryType
  initialRoomCode?: string
  opponentPreset?: { name: string; avatar?: string }
  onExit?: () => void
}

export default function PadananKataGame({
  initialMode = 'solo',
  initialCategory = 'padanan',
  initialRoomCode = '',
  opponentPreset,
  onExit,
}: Props) {
  // Mode & Room States
  const [mode, setMode] = useState<ModeType>(opponentPreset ? 'matching' : initialMode)
  const [category, setCategory] = useState<CategoryType>(opponentPreset ? 'mixed' : initialCategory)
  const [roomCode, setRoomCode] = useState(initialRoomCode || '')
  const [inputRoomCode, setInputRoomCode] = useState('')
  const [gameState, setGameState] = useState<'lobby' | 'countdown' | 'playing' | 'finished'>('lobby')
  const [countdown, setCountdown] = useState(3)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Player Identity
  const [myId] = useState(() => 'user_' + Math.random().toString(36).substring(2, 8))
  const [myName] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('otwptn_user_name')
      if (stored) return stored
    }
    return 'Pejuang PTN'
  })

  // Multiplayer Opponent States
  const [opponentName, setOpponentName] = useState(opponentPreset?.name || 'Partner Belajar')
  const [opponentScore, setOpponentScore] = useState(0)
  const [opponentQIdx, setOpponentQIdx] = useState(0)
  const [opponentJoined, setOpponentJoined] = useState(Boolean(opponentPreset))

  // Questions & In-Game Progression
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(12)
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null)
  const [answerStatus, setAnswerStatus] = useState<'none' | 'correct' | 'wrong' | 'timeout'>('none')
  const [eliminatedOpts, setEliminatedOpts] = useState<number[]>([])

  // Power-Up Cards (Only active in Multiplayer modes)
  const [myCards, setMyCards] = useState<PowerUpCard[]>([])
  const [hasShield, setHasShield] = useState(false)
  const [isDoubleScore, setIsDoubleScore] = useState(false)

  // Incoming Sabotage Statuses (Multiplayer only)
  const [isFrozen, setIsFrozen] = useState(false)
  const [isBlurred, setIsBlurred] = useState(false)
  const [attackNotice, setAttackNotice] = useState<string | null>(null)

  // Review & Answer History
  const [answeredHistory, setAnsweredHistory] = useState<
    { qIndex: number; selected: number | null; isCorrect: boolean }[]
  >([])
  const [reviewMode, setReviewMode] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)

  // Refs
  const realtimeRef = useRef<ReturnType<typeof subscribeToBattleRoom> | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Setup / Initialize Game Questions
  const prepareGame = (targetMode: ModeType = mode, targetCategory: CategoryType = category) => {
    // Multiplayer uses mixed question pool automatically
    const catToLoad = targetMode === 'solo' ? targetCategory : 'mixed'
    const loaded = getQuizQuestions(catToLoad, 8)
    setQuestions(loaded)
    setQIndex(0)
    setScore(0)
    setStreak(0)
    setMaxStreak(0)
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
    setOpponentScore(0)
    setOpponentQIdx(0)

    // Give 2 starting power-up cards if in multiplayer mode
    if (targetMode !== 'solo') {
      const shuffledCards = [...POWER_UP_CARDS].sort(() => Math.random() - 0.5)
      setMyCards(shuffledCards.slice(0, 2))
    } else {
      setMyCards([])
    }

    if (targetMode === 'room' && !roomCode) {
      const newCode = generateRoomCode()
      setRoomCode(newCode)
      setupRealtime(newCode)
    } else if (targetMode === 'matching') {
      const matchCode = 'MATCH_' + Math.floor(Math.random() * 900 + 100)
      setRoomCode(matchCode)
      setupRealtime(matchCode)
    }
  }

  // Realtime Supabase Broadcast Connection
  const setupRealtime = (code: string) => {
    if (realtimeRef.current) realtimeRef.current.leave()

    realtimeRef.current = subscribeToBattleRoom(
      code,
      {
        id: myId,
        name: myName,
        avatar: '/mascot/thinking-idea.png',
        score: 0,
        streak: 0,
        hasShield: false,
        currentQIndex: 0,
        isReady: true,
        isFinished: false,
      },
      {
        onPlayerJoin: player => {
          setOpponentName(player.name)
          setOpponentJoined(true)
        },
        onGameStart: () => {
          triggerCountdown()
        },
        onOpponentAnswer: data => {
          setOpponentScore(data.score)
          setOpponentQIdx(data.qIndex)
        },
        onAttacked: ({ powerUp, attackerName }) => {
          if (hasShield) {
            setHasShield(false)
            setAttackNotice(`🛡️ Perisaimu menepis serangan ${powerUp} dari ${attackerName}!`)
            setTimeout(() => setAttackNotice(null), 3000)
            return
          }

          if (powerUp === 'freeze') {
            setIsFrozen(true)
            if (soundEnabled) playFreezeSound()
            setAttackNotice(`❄️ ${attackerName} membekukan layarmu selama 3.5 detik!`)
            setTimeout(() => setIsFrozen(false), 3500)
            setTimeout(() => setAttackNotice(null), 3500)
          } else if (powerUp === 'blur') {
            setIsBlurred(true)
            setAttackNotice(`🌫️ ${attackerName} menyemprotkan kabut tinta ke layarmu!`)
            setTimeout(() => setIsBlurred(false), 3500)
            setTimeout(() => setAttackNotice(null), 3500)
          } else if (powerUp === 'steal') {
            setScore(prev => Math.max(0, prev - 1))
            setAttackNotice(`🥷 ${attackerName} mencuri 1 poin dari skormu!`)
            setTimeout(() => setAttackNotice(null), 3000)
          }
        },
        onOpponentLeave: () => {
          setOpponentJoined(false)
        },
      }
    )
  }

  // Trigger 3... 2... 1... GO! Countdown
  const triggerCountdown = () => {
    setGameState('countdown')
    setCountdown(3)
    if (soundEnabled) playCountdownBeep(false)

    let currentCount = 3
    const interval = setInterval(() => {
      currentCount -= 1
      if (currentCount > 0) {
        setCountdown(currentCount)
        if (soundEnabled) playCountdownBeep(false)
      } else if (currentCount === 0) {
        setCountdown(0)
        if (soundEnabled) playCountdownBeep(true)
      } else {
        clearInterval(interval)
        setGameState('playing')
        setTimeLeft(12)
      }
    }, 1000)
  }

  // Start Button Clicked from Lobby
  const handleStartGame = () => {
    prepareGame(mode, category)
    if (mode === 'solo') {
      triggerCountdown()
    } else {
      if (realtimeRef.current) {
        realtimeRef.current.sendReady()
      }
      triggerCountdown()
    }
  }

  // Timer Countdown per Question during Gameplay
  useEffect(() => {
    if (gameState !== 'playing' || isFrozen) return

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState, qIndex, isFrozen])

  // Handle Timeout: No spoiler, quick advance to next question
  const handleTimeout = () => {
    if (answerStatus !== 'none') return
    setAnswerStatus('timeout')
    if (soundEnabled) playAnswerSound(false)
    setStreak(0)
    setIsDoubleScore(false)

    setAnsweredHistory(prev => [
      ...prev,
      { qIndex, selected: null, isCorrect: false },
    ])

    setTimeout(() => {
      advanceNextQuestion()
    }, 700)
  }

  // Handle Option Click: Quick 0.7s feedback without showing correct answer
  const handleAnswer = (optionIdx: number) => {
    if (answerStatus !== 'none' || isFrozen || eliminatedOpts.includes(optionIdx)) return

    setSelectedOpt(optionIdx)
    const currentQ = questions[qIndex]
    const isCorrect = optionIdx === currentQ.correctIndex

    if (isCorrect) {
      setAnswerStatus('correct')
      if (soundEnabled) playAnswerSound(true)

      const pointsWon = isDoubleScore ? 2 : 1
      const newScore = score + pointsWon
      const newStreak = streak + 1
      setScore(newScore)
      setStreak(newStreak)
      if (newStreak > maxStreak) setMaxStreak(newStreak)

      // Reward a power-up card every 2 correct streak in multiplayer
      if (mode !== 'solo' && newStreak % 2 === 0) {
        const remaining = POWER_UP_CARDS.filter(c => !myCards.some(m => m.id === c.id))
        if (remaining.length > 0) {
          const awardCard = remaining[Math.floor(Math.random() * remaining.length)]
          setMyCards(prev => [...prev, awardCard])
        }
      }

      if (realtimeRef.current && mode !== 'solo') {
        realtimeRef.current.sendAnswer(newScore, qIndex, true)
      }
    } else {
      setAnswerStatus('wrong')
      if (soundEnabled) playAnswerSound(false)
      setStreak(0)

      if (realtimeRef.current && mode !== 'solo') {
        realtimeRef.current.sendAnswer(score, qIndex, false)
      }
    }

    setIsDoubleScore(false)
    setAnsweredHistory(prev => [
      ...prev,
      { qIndex, selected: optionIdx, isCorrect },
    ])

    setTimeout(() => {
      advanceNextQuestion()
    }, 700)
  }

  // Advance to next question or finish game
  const advanceNextQuestion = () => {
    setSelectedOpt(null)
    setAnswerStatus('none')
    setEliminatedOpts([])

    if (qIndex + 1 < questions.length) {
      setQIndex(prev => prev + 1)
      setTimeLeft(12)
    } else {
      finishGame()
    }
  }

  // Finish Game & Award XP (Satuan, min 5 max 25)
  const finishGame = () => {
    setGameState('finished')
    const calculatedXP = Math.min(25, Math.max(5, Math.round(5 + score * 2.5)))
    setEarnedXP(calculatedXP)
    awardXP(calculatedXP, 'Arena Kuis PPU & PBM')
  }

  // Trigger Power-Up Card
  const usePowerUp = (card: PowerUpCard) => {
    if (isFrozen) return
    if (soundEnabled) playPowerUpSound()

    setMyCards(prev => prev.filter(c => c.id !== card.id))

    if (card.id === 'fifty_fifty') {
      const currentQ = questions[qIndex]
      const wrongIndices = currentQ.options
        .map((_, idx) => idx)
        .filter(idx => idx !== currentQ.correctIndex)
      const toEliminate = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2)
      setEliminatedOpts(toEliminate)
    } else if (card.id === 'double_score') {
      setIsDoubleScore(true)
    } else if (card.id === 'shield') {
      setHasShield(true)
    } else {
      // Offensive cards to opponent
      if (realtimeRef.current) {
        realtimeRef.current.sendAttack(card.id)
      }
      if (card.id === 'steal') {
        setScore(prev => prev + 1)
      }
    }
  }

  // Cleanup on Unmount
  useEffect(() => {
    return () => {
      if (realtimeRef.current) realtimeRef.current.leave()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const currentQ = questions[qIndex]

  return (
    <div className="w-full max-w-4xl mx-auto my-4 md:my-8 px-4 sm:px-6">
      <div className="relative rounded-3xl bg-white border border-gray-100 shadow-xl overflow-hidden">
        {/* TOP STATUS BAR */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900 text-white flex items-center justify-between gap-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 p-1 flex items-center justify-center flex-shrink-0">
              <Image
                src="/mascot/thinking-idea.png"
                alt="otwPTN Mascot"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-tight">Arena Kuis PPU & PBM</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-gray-950">
                  {opponentPreset ? 'Duel Study Cam' : mode === 'solo' ? 'Latihan Solo' : mode === 'matching' ? 'Live Match' : 'Battle Room'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                {opponentPreset
                  ? `Bertarung melawan ${opponentPreset.name}`
                  : mode === 'solo'
                  ? 'Fokus mengasah insting dan kecepatan jawab mandiri'
                  : `Bertarung melawan ${opponentName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
              title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            {onExit && (
              <button
                onClick={onExit}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 transition-colors"
              >
                Keluar
              </button>
            )}
          </div>
        </div>

        {/* 1. LOBBY VIEW */}
        {gameState === 'lobby' && (
          opponentPreset ? (
            /* DEDICATED DIRECT DUEL LOBBY (STUDY CAM / OMETV) */
            <div className="p-6 sm:p-10 text-center space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
                <Swords size={14} className="text-amber-600" />
                <span>Duel Langsung di Layar Kamera</span>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                  Tantang {opponentPreset.name}!
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-md mx-auto">
                  Duel 8 soal kuis acak PPU & PBM, 12 detik per soal, lengkap dengan kartu kekuatan sabotase!
                </p>
              </div>

              {/* VS Face-Off Cards */}
              <div className="flex items-center justify-center gap-3 sm:gap-6 py-2">
                {/* You */}
                <div className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-300 text-center w-36 sm:w-44 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-amber-400 text-gray-950 font-black mx-auto flex items-center justify-center mb-2 text-base shadow-inner">
                    {myName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs sm:text-sm font-black text-gray-950 block truncate">{myName}</span>
                  <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Kamu</span>
                </div>

                <div className="w-12 h-12 rounded-full bg-gray-950 text-amber-400 font-black flex items-center justify-center text-sm shadow-lg border-2 border-amber-400/40 animate-pulse">
                  VS
                </div>

                {/* Opponent */}
                <div className="p-4 rounded-3xl bg-gray-50 border-2 border-gray-200 text-center w-36 sm:w-44 shadow-sm">
                  <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-2 border-2 border-gray-300 shadow-inner flex items-center justify-center bg-gray-200">
                    {opponentPreset.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={opponentPreset.avatar} alt={opponentPreset.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base font-black text-gray-700">
                        {opponentPreset.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-black text-gray-950 block truncate">{opponentPreset.name}</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Partner Belajar</span>
                </div>
              </div>

              {/* Ready / Start Battle Button */}
              <div className="pt-2">
                <button
                  onClick={handleStartGame}
                  className="btn-brand-primary text-sm sm:text-base font-black py-4 px-10 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
                >
                  <Swords size={20} /> Mulai Duel Sekarang!
                </button>
                <p className="text-[11px] text-gray-400 mt-2">
                  Format: 8 soal campuran PPU & PBM · Buka kartu sabotase saat streak benar
                </p>
              </div>
            </div>
          ) : (
            /* GENERAL LOBBY: Solo, Matching, Room Code */
            <div className="p-6 sm:p-10 text-center space-y-8">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-24 h-24 mx-auto relative animate-bounce">
                  <Image
                    src="/mascot/thinking-idea.png"
                    alt="Mascot Thinking"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                  Pilih Mode Permainan
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                  Uji kemampuan analogi, kosakata baku PUEBI, dan pembetulan kalimat PBM. Kumpulkan skor dan buka kartu kekuatan!
                </p>
              </div>

              {/* Mode Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {/* Option 1: Solo */}
                <button
                  onClick={() => {
                    setMode('solo')
                    prepareGame('solo', category)
                  }}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    mode === 'solo'
                      ? 'border-amber-400 bg-amber-50/60 shadow-md scale-102'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-gray-950 flex items-center justify-center font-black mb-3">
                    <User size={20} />
                  </div>
                  <h4 className="text-sm font-black text-gray-950">Latihan Sendiri (Solo)</h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Murni latihan mandiri tanpa lawan. Pilih topik bebas dan uji kecepatanmu.
                  </p>
                </button>

                {/* Option 2: Matching */}
                <button
                  onClick={() => {
                    setMode('matching')
                    prepareGame('matching', 'mixed')
                  }}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    mode === 'matching'
                      ? 'border-amber-400 bg-amber-50/60 shadow-md scale-102'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center font-black mb-3">
                    <Sparkles size={20} />
                  </div>
                  <h4 className="text-sm font-black text-gray-950">Cari Lawan (Matching)</h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Bertarung live dengan pejuang PTN lain secara acak dengan kartu power-up.
                  </p>
                </button>

                {/* Option 3: Room Code */}
                <button
                  onClick={() => {
                    setMode('room')
                    prepareGame('room', 'mixed')
                  }}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    mode === 'room'
                      ? 'border-amber-400 bg-amber-50/60 shadow-md scale-102'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black mb-3">
                    <Share2 size={20} />
                  </div>
                  <h4 className="text-sm font-black text-gray-950">Ajak Teman (Kode Room)</h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Bikin room private atau masukkan kode teman belajarmu untuk duel langsung.
                  </p>
                </button>
              </div>

              {/* If Solo Mode: Category Picker */}
              {mode === 'solo' && (
                <div className="max-w-xl mx-auto p-5 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-3">
                  <span className="text-xs font-black text-gray-900 block uppercase tracking-wider">
                    Pilih Materi Kuis Solo:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => {
                        setCategory('padanan')
                        prepareGame('solo', 'padanan')
                      }}
                      className={`p-2.5 rounded-xl text-xs font-black transition-all border ${
                        category === 'padanan'
                          ? 'bg-amber-400 text-gray-950 border-amber-500 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      1. Padanan Kata
                    </button>
                    <button
                      onClick={() => {
                        setCategory('baku')
                        prepareGame('solo', 'baku')
                      }}
                      className={`p-2.5 rounded-xl text-xs font-black transition-all border ${
                        category === 'baku'
                          ? 'bg-amber-400 text-gray-950 border-amber-500 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      2. Kata Baku
                    </button>
                    <button
                      onClick={() => {
                        setCategory('kalimat')
                        prepareGame('solo', 'kalimat')
                      }}
                      className={`p-2.5 rounded-xl text-xs font-black transition-all border ${
                        category === 'kalimat'
                          ? 'bg-amber-400 text-gray-950 border-amber-500 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      3. Benerin Kalimat
                    </button>
                    <button
                      onClick={() => {
                        setCategory('mixed')
                        prepareGame('solo', 'mixed')
                      }}
                      className={`p-2.5 rounded-xl text-xs font-black transition-all border ${
                        category === 'mixed'
                          ? 'bg-amber-400 text-gray-950 border-amber-500 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      🎲 Acak Campuran
                    </button>
                  </div>
                </div>
              )}

              {/* If Room Mode: Room Code Box */}
              {mode === 'room' && (
                <div className="max-w-md mx-auto p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">Kode Room Kamu:</span>
                    <span className="px-3 py-1 rounded-lg bg-amber-400 text-gray-950 font-mono font-black text-sm tracking-widest">
                      {roomCode || 'MEMBUAT...'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputRoomCode}
                      onChange={e => setInputRoomCode(e.target.value.toUpperCase())}
                      placeholder="Masukkan kode room teman..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-mono font-bold uppercase focus:outline-hidden focus:border-amber-400"
                    />
                    <button
                      onClick={() => {
                        if (inputRoomCode.trim()) {
                          setRoomCode(inputRoomCode.trim())
                          setupRealtime(inputRoomCode.trim())
                        }
                      }}
                      className="btn btn-primary text-xs font-bold py-2.5 px-4"
                    >
                      Gabung
                    </button>
                  </div>
                </div>
              )}

              {/* Big Launch Start Button */}
              <div className="pt-2">
                <button
                  onClick={handleStartGame}
                  className="btn-brand-primary text-sm sm:text-base font-black py-4 px-10 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
                >
                  <Swords size={20} /> Mulai Game Sekarang!
                </button>
                <p className="text-[11px] text-gray-400 mt-2">
                  Durasi 8 soal · 12 detik per soal · Kunci jawaban & pembahasan tampil di akhir
                </p>
              </div>
            </div>
          )
        )}

        {/* 2. COUNTDOWN OVERLAY (3... 2... 1... GO!) */}
        {gameState === 'countdown' && (
          <div className="p-16 text-center space-y-6 flex flex-col items-center justify-center min-h-[420px] bg-gradient-to-b from-amber-50/60 to-white">
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-28 h-28 rounded-full bg-amber-400 text-gray-950 font-black text-5xl flex items-center justify-center shadow-xl border-4 border-white"
            >
              {countdown === 0 ? 'GO!' : countdown}
            </motion.div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900">
                {countdown === 0 ? 'Waktunya Duel!' : 'Bersiap di Arena...'}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Jawab cepat dan tepat untuk mengumpulkan skor tertinggi!
              </p>
            </div>

            <div className="w-16 h-16 relative">
              <Image
                src="/mascot/reading-clock.png"
                alt="Countdown mascot"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
          </div>
        )}

        {/* 3. ACTIVE PLAYING VIEW */}
        {gameState === 'playing' && currentQ && (
          <div className="p-5 sm:p-8 space-y-6">
            {/* NOTICE ATTACK BANNER */}
            <AnimatePresence>
              {attackNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-2xl bg-rose-500 text-white font-black text-xs text-center shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} /> {attackNotice}
                </motion.div>
              )}
            </AnimatePresence>

            {/* TOP BAR: SOLO vs MULTIPLAYER */}
            {mode === 'solo' ? (
              /* SOLO TOP BAR: PURELY SOLO (NO OPPONENT) */
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-gray-950 font-black flex items-center justify-center text-xs">
                    <User size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase block">Pemain</span>
                    <span className="text-sm font-black text-gray-950">{myName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {streak >= 2 && (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black animate-pulse">
                      <Flame size={14} className="fill-amber-500 text-amber-500" />
                      <span>{streak} Streak!</span>
                    </div>
                  )}

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-gray-500 uppercase block">Skor Kamu</span>
                    <span className="text-xl font-black text-gray-950 font-mono">{score}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* MULTIPLAYER TOP BAR: YOU vs OPPONENT */
              <div className="grid grid-cols-2 gap-3">
                {/* You */}
                <div className="p-3 sm:p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <div>
                      <span className="text-[10px] font-bold text-amber-900 uppercase block">Kamu</span>
                      <span className="text-xs sm:text-sm font-black text-gray-950 truncate max-w-[100px]">
                        {myName}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-black text-gray-950 font-mono">{score}</span>
                    {hasShield && <span className="text-[9px] text-emerald-700 font-black block">🛡️ Kebal</span>}
                  </div>
                </div>

                {/* Opponent */}
                <div className="p-3 sm:p-4 rounded-2xl bg-gray-50 border-2 border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Lawan</span>
                    <span className="text-xs sm:text-sm font-black text-gray-800 truncate max-w-[100px]">
                      {opponentName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-black text-gray-600 font-mono">
                      {opponentScore}
                    </span>
                    <span className="text-[9px] text-gray-400 block font-medium">
                      Soal #{opponentQIdx + 1}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* PROGRESS & TIMER BAR */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                <span>
                  Soal <strong className="text-gray-950 font-black">#{qIndex + 1}</strong> dari {questions.length}
                </span>
                <span className="flex items-center gap-1.5 font-mono font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  <Timer size={13} /> {timeLeft}s
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  className="h-full bg-amber-400"
                  animate={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* QUESTION CARD (WITH FROZEN & BLUR SABOTAGE OVERLAYS) */}
            <div className="relative rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden min-h-[220px]">
              {/* SABOTAGE OVERLAY: FREEZE */}
              {isFrozen && (
                <div className="absolute inset-0 z-30 bg-cyan-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white animate-pulse">
                  <div className="w-16 h-16 relative mb-2">
                    <Image
                      src="/mascot/confused.png"
                      alt="Frozen mascot"
                      width={64}
                      height={64}
                      className="object-contain animate-bounce"
                    />
                  </div>
                  <h4 className="text-lg font-black text-cyan-200">❄️ Layar Dibekukan!</h4>
                  <p className="text-xs text-cyan-100 max-w-xs mt-0.5">
                    Tombol terkunci sementara selama 3.5 detik akibat kartu sabotase lawan!
                  </p>
                </div>
              )}

              {/* SABOTAGE OVERLAY: BLUR */}
              {isBlurred && (
                <div className="absolute inset-0 z-20 backdrop-blur-md bg-purple-950/40 flex items-center justify-center">
                  <div className="p-3 rounded-2xl bg-black/70 text-purple-200 text-xs font-black shadow-lg">
                    🌫️ Efek Kaca Buram Aktif!
                  </div>
                </div>
              )}

              {/* QUESTION CONTENT */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/70 px-3 py-1 rounded-full">
                    {currentQ.category}
                  </span>
                  {isDoubleScore && (
                    <span className="text-[11px] font-black text-yellow-900 bg-yellow-300 px-3 py-1 rounded-full animate-bounce">
                      ⚡ 2X Poin Aktif!
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-500">{currentQ.prompt}</h4>
                  <p className="text-base sm:text-lg font-black text-gray-950 leading-snug">
                    {currentQ.question}
                  </p>
                </div>

                {/* OPTIONS GRID (NO SPOILER WHEN CLICKED OR TIMEOUT) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                  {currentQ.options.map((opt, idx) => {
                    const isEliminated = eliminatedOpts.includes(idx)
                    const isChosen = selectedOpt === idx

                    let btnStyle = 'bg-gray-50 border-gray-200 text-gray-800 hover:border-amber-400 hover:bg-amber-50/50'

                    if (isChosen) {
                      if (answerStatus === 'correct') {
                        btnStyle = 'bg-emerald-500 text-white border-emerald-600 scale-102 shadow-md'
                      } else if (answerStatus === 'wrong') {
                        btnStyle = 'bg-rose-500 text-white border-rose-600 scale-98 shadow-md'
                      }
                    } else if (answerStatus === 'timeout') {
                      btnStyle = 'bg-gray-100 text-gray-400 border-gray-200 opacity-60'
                    }

                    if (isEliminated) {
                      btnStyle = 'opacity-20 line-through cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400'
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={answerStatus !== 'none' || isFrozen || isEliminated}
                        className={`p-4 rounded-2xl border-2 text-left text-xs sm:text-sm font-extrabold transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                      >
                        <span className="flex-1">{opt}</span>
                        {isChosen && answerStatus === 'correct' && <CheckCircle2 size={18} />}
                        {isChosen && answerStatus === 'wrong' && <XCircle size={18} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* POWER-UP CARDS HAND (MATCHES OTWPTN NECTAR CARD DESIGN) */}
            {mode !== 'solo' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
                      Kartu Kekuatan Sabotase ({myCards.length})
                    </h4>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">
                    Jawab benar beruntun untuk mendapatkan kartu baru
                  </span>
                </div>

                {myCards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {myCards.map((card, idx) => (
                      <button
                        key={idx}
                        onClick={() => usePowerUp(card)}
                        disabled={isFrozen || answerStatus !== 'none'}
                        className={`w-full text-left relative rounded-3xl bg-[#0c2b4e] hover:bg-[#09223e] border border-[#163a66] p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-98 transition-all overflow-hidden flex flex-col justify-between min-h-[175px] group ${
                          isFrozen ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        {/* Top Badge Row */}
                        <div className="flex items-center justify-between gap-2 mb-2 w-full">
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold">
                            <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs">
                              {card.icon}
                            </span>
                            <span className="text-[11px] sm:text-xs">{card.category}</span>
                          </div>

                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-gray-950 group-hover:scale-105 shadow-sm transition-transform">
                            TAP UNTUK PAKAI
                          </span>
                        </div>

                        {/* Middle Content + Mascot Illustration */}
                        <div className="flex items-center justify-between gap-3 my-1 w-full">
                          <div className="space-y-1 flex-1 pr-2">
                            <h5 className="text-base sm:text-lg font-black text-white leading-tight">
                              {card.name}
                            </h5>
                            <p className="text-xs text-slate-300 font-medium line-clamp-1">
                              {card.desc}
                            </p>
                          </div>

                          <div className="w-20 h-20 sm:w-24 sm:h-24 relative flex-shrink-0 -mr-2 -mb-2">
                            <Image
                              src={card.mascot}
                              alt={card.name}
                              width={96}
                              height={96}
                              className="object-contain filter drop-shadow-md group-hover:scale-110 transition-transform"
                            />
                          </div>
                        </div>

                        {/* Bottom Row: oleh otwptn + Tag Badge */}
                        <div className="flex items-center gap-3 pt-2 mt-auto w-full">
                          <span className="text-xs text-slate-300 font-medium">oleh otwptn</span>
                          <span className="px-3 py-0.5 rounded-full bg-[#f59e0b] text-gray-950 font-black text-xs shadow-xs">
                            {card.tag}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-3xl bg-gray-50 border border-dashed border-gray-300 text-center space-y-1">
                    <p className="text-xs font-bold text-gray-600">
                      Tanganmu Masih Kosong
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Cetak 2 jawaban benar beruntun untuk membuka kartu kekuatan baru!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. FINISHED / RESULTS SUMMARY VIEW */}
        {gameState === 'finished' && (
          <div className="p-8 sm:p-12 text-center space-y-8">
            <div className="w-24 h-24 mx-auto relative animate-bounce">
              <Image
                src={
                  mode === 'solo'
                    ? '/mascot/medal.png'
                    : score >= opponentScore
                    ? '/mascot/trophy-jump.png'
                    : '/mascot/sign-pejuang.png'
                }
                alt="Results mascot"
                width={96}
                height={96}
                className="object-contain"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-gray-950">
                {mode === 'solo'
                  ? 'Sesi Latihan Selesai! 🎉'
                  : score > opponentScore
                  ? 'Kemenangan Telak! 🏆'
                  : score === opponentScore
                  ? 'Hasil Seri! 🤝'
                  : 'Pertarungan Sengit! ⚔️'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                {mode === 'solo'
                  ? 'Kemampuan kosakata, ketelitian PUEBI, dan penalaran PPU-mu semakin terasah.'
                  : score > opponentScore
                  ? `Hebat! Kamu berhasil mengungguli ${opponentName} di arena duel.`
                  : `${opponentName} menang tipis. Balas di ronde berikutnya!`}
              </p>
            </div>

            {/* Score Comparison Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[11px] font-bold text-amber-800 uppercase block">Skor Kamu</span>
                <span className="text-2xl font-black text-gray-950 font-mono">{score}</span>
              </div>

              {mode !== 'solo' ? (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center">
                  <span className="text-[11px] font-bold text-gray-500 uppercase block">Skor {opponentName}</span>
                  <span className="text-2xl font-black text-gray-700 font-mono">{opponentScore}</span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                  <span className="text-[11px] font-bold text-blue-800 uppercase block">Max Streak</span>
                  <span className="text-2xl font-black text-blue-900 font-mono">{maxStreak}</span>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">Bonus XP</span>
                <span className="text-2xl font-black text-emerald-700 font-mono">+{earnedXP} XP</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleStartGame()}
                className="btn btn-primary py-3 px-6 text-xs font-black flex items-center gap-2"
              >
                <RotateCcw size={14} /> Main Lagi
              </button>

              <button
                onClick={() => setReviewMode(!reviewMode)}
                className="btn btn-outline py-3 px-6 text-xs font-black flex items-center gap-2"
              >
                <BookOpen size={14} /> {reviewMode ? 'Tutup Kunci Jawaban' : 'Review Kunci Jawaban'}
              </button>

              <button
                onClick={() => setGameState('lobby')}
                className="btn py-3 px-6 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full"
              >
                Ganti Mode
              </button>
            </div>

            {/* REVIEW KUNCI JAWABAN & PEMBAHASAN (HANYA MUNCUL DI AKHIR GAME) */}
            {reviewMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-left space-y-4 pt-6 border-t border-gray-100 max-h-96 overflow-y-auto pr-2"
              >
                <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <BookOpen size={16} className="text-amber-500" />
                  Kunci Jawaban & Pembahasan Lengkap PPU/PBM:
                </h4>

                {questions.map((q, idx) => {
                  const history = answeredHistory[idx]
                  const isCorrect = history?.isCorrect
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-gray-900">
                          {idx + 1}. {q.prompt}
                        </span>
                        {isCorrect ? (
                          <span className="text-emerald-600 font-black flex items-center gap-1">
                            ✓ Benar
                          </span>
                        ) : (
                          <span className="text-rose-500 font-black flex items-center gap-1">
                            ✗ Salah / Waktu Habis
                          </span>
                        )}
                      </div>

                      <p className="text-gray-700 font-medium">{q.question}</p>

                      <div className="p-2.5 rounded-xl bg-white border border-gray-200 space-y-1">
                        <p className="text-emerald-700 font-black">
                          Kunci Jawaban: {q.options[q.correctIndex]}
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                          <strong>Pembahasan:</strong> {q.explanation}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
