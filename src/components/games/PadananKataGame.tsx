'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Timer,
  Zap,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Bot,
  User,
  Users,
  Swords,
  Share2,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import questionsData from '@/lib/games/padanan-kata.json'
import { GameMode, BOT_PROFILES, awardXP, generateRoomCode } from '@/lib/games/gameEngine'

interface Props {
  initialMode?: GameMode
  onExit?: () => void
}

export default function PadananKataGame({ initialMode = 'solo', onExit }: Props) {
  const [mode, setMode] = useState<GameMode>(initialMode)
  const [roomCode, setRoomCode] = useState<string>('')
  const [inputRoomCode, setInputRoomCode] = useState('')
  const [roomState, setRoomState] = useState<'lobby' | 'playing' | 'waiting'>('lobby')
  const [opponentName, setOpponentName] = useState('Lawan')

  // Game Play States
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(12)
  const [isFinished, setIsFinished] = useState(false)
  const [shuffledQuestions, setShuffledQuestions] = useState(questionsData)
  const [earnedXP, setEarnedXP] = useState(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Inisialisasi game
  const startGame = (targetMode: GameMode = mode) => {
    // Acak urutan pertanyaan
    const randomized = [...questionsData].sort(() => Math.random() - 0.5).slice(0, 8)
    setShuffledQuestions(randomized)
    setCurrentIdx(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setOpponentScore(0)
    setStreak(0)
    setIsFinished(false)
    setEarnedXP(0)

    if (targetMode === 'bot') {
      const pickedBot = BOT_PROFILES[Math.floor(Math.random() * BOT_PROFILES.length)]
      setOpponentName(pickedBot.name)
      setRoomState('playing')
    } else if (targetMode === 'room') {
      if (!roomCode) setRoomCode(generateRoomCode())
      setRoomState('lobby')
    } else if (targetMode === 'random') {
      setRoomState('waiting')
      // Simulasi pairing cepat 1.5 detik
      setTimeout(() => {
        setOpponentName('Pejuang PTN (Online)')
        setRoomState('playing')
      }, 1800)
    } else {
      setRoomState('playing')
    }
  }

  useEffect(() => {
    startGame(mode)
  }, [mode])

  const curQ = shuffledQuestions[currentIdx] || shuffledQuestions[0]

  // Timer countdown logic
  useEffect(() => {
    if (isFinished || isAnswered || roomState !== 'playing') return

    setTimeLeft(curQ.timeLimit || 12)

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleTimeOut()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Simulasi bot answer jika mode bot
    if (mode === 'bot') {
      const botDelay = Math.floor(Math.random() * 4000) + 3000
      const botTimeout = setTimeout(() => {
        if (!isAnswered && !isFinished) {
          const isBotCorrect = Math.random() < 0.8
          if (isBotCorrect) {
            setOpponentScore(prev => prev + 100 + Math.floor(Math.random() * 30))
          }
        }
      }, botDelay)
      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
        clearTimeout(botTimeout)
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentIdx, isAnswered, isFinished, roomState])

  const handleTimeOut = () => {
    setIsAnswered(true)
    setStreak(0)
    setTimeout(() => {
      nextQuestion()
    }, 1600)
  }

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return
    if (timerRef.current) clearInterval(timerRef.current)

    setSelectedOption(idx)
    setIsAnswered(true)

    const isCorrect = idx === curQ.correctIndex
    if (isCorrect) {
      const timeBonus = timeLeft * 10
      const basePoints = 100
      const streakBonus = streak * 15
      setScore(prev => prev + basePoints + timeBonus + streakBonus)
      setStreak(prev => prev + 1)
    } else {
      setStreak(0)
    }

    // Auto lanjut ke soal berikutnya setelah delay 1.6 detik
    setTimeout(() => {
      nextQuestion()
    }, 1600)
  }

  const nextQuestion = () => {
    if (currentIdx < shuffledQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      finishGame()
    }
  }

  const finishGame = () => {
    setIsFinished(true)
    let xpGain = 25
    if (mode === 'solo') xpGain = 30
    if (mode === 'bot') xpGain = score > opponentScore ? 60 : 25
    if (mode === 'room' || mode === 'random') xpGain = score > opponentScore ? 100 : 40

    setEarnedXP(xpGain)
    awardXP(xpGain, 'Padanan Kata')
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white shadow-xl border border-amber-100 overflow-hidden">
      {/* Header Bar */}
      <div className="px-6 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-gray-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={22} className="fill-amber-950 text-amber-950" />
          <h3 className="text-base font-black tracking-tight">Arena Padanan Kata</h3>
        </div>

        {/* Mode Selector Pill */}
        <div className="flex items-center gap-1 bg-amber-600/20 p-1 rounded-full text-xs font-bold">
          <button
            onClick={() => setMode('solo')}
            className={`px-3 py-1 rounded-full transition-all ${
              mode === 'solo' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-900 hover:text-black'
            }`}
          >
            Solo
          </button>
          <button
            onClick={() => setMode('bot')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
              mode === 'bot' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-900 hover:text-black'
            }`}
          >
            <Bot size={13} /> Vs Bot
          </button>
          <button
            onClick={() => setMode('room')}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
              mode === 'room' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-900 hover:text-black'
            }`}
          >
            <Users size={13} /> Room
          </button>
        </div>
      </div>

      {/* Mode Room Lobby */}
      {mode === 'room' && roomState === 'lobby' && (
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
            <Swords size={32} />
          </div>
          <div>
            <h4 className="text-lg font-black text-gray-900">Battle Bersama Teman</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Bagikan kode room ini ke teman belajarmu di WhatsApp atau saat Study Cam bareng.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-dashed border-amber-300 max-w-xs mx-auto">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
              Kode Room Battle
            </span>
            <span className="text-3xl font-mono font-black tracking-widest text-gray-900">
              {roomCode}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(roomCode)
                alert(`Kode room ${roomCode} disalin!`)
              }}
              className="btn btn-outline py-2.5 px-4 text-xs font-bold flex items-center gap-1.5"
            >
              <Share2 size={14} /> Salin Kode
            </button>
            <button
              onClick={() => setRoomState('playing')}
              className="btn btn-primary py-2.5 px-6 text-xs font-black"
            >
              Mulai Duel Sekarang
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
            Atau masukkan kode teman:
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
                    setOpponentName(`Teman (${inputRoomCode})`)
                    setRoomState('playing')
                  }
                }}
                className="btn btn-sm bg-gray-900 text-white font-bold"
              >
                Gabung
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode Random Searching */}
      {roomState === 'waiting' && (
        <div className="p-12 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h4 className="text-base font-bold text-gray-900">Mencari Lawan Pejuang PTN...</h4>
          <p className="text-xs text-gray-500">Menghubungkan ke siswa lain yang sedang aktif di arena.</p>
        </div>
      )}

      {/* Main Playing Arena */}
      {roomState === 'playing' && !isFinished && (
        <div className="p-6 md:p-8 space-y-6">
          {/* Progress & Scores */}
          <div className="flex items-center justify-between text-xs font-bold text-gray-600">
            <span>
              Soal <strong className="text-gray-950">{currentIdx + 1}</strong> dari{' '}
              {shuffledQuestions.length}
            </span>

            {/* Battle Scores Indicator */}
            {mode !== 'solo' ? (
              <div className="flex items-center gap-4 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                <span className="flex items-center gap-1 text-emerald-700">
                  <User size={12} /> Kamu: {score}
                </span>
                <span className="text-gray-300">vs</span>
                <span className="flex items-center gap-1 text-rose-700">
                  <Bot size={12} /> {opponentName}: {opponentScore}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-900 bg-amber-100/70 px-3 py-1 rounded-full">
                <Sparkles size={13} className="text-amber-600" />
                <span>Skor: {score}</span>
                {streak > 1 && (
                  <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    +{streak}x Streak!
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Time Progress Bar */}
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${timeLeft <= 3 ? 'bg-rose-500' : 'bg-amber-500'}`}
              animate={{ width: `${(timeLeft / (curQ.timeLimit || 12)) * 100}%` }}
              transition={{ ease: 'linear', duration: 1 }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-bold">
            <span className="uppercase text-[11px] text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md">
              Kategori: {curQ.type}
            </span>
            <span
              className={`flex items-center gap-1 font-mono text-sm ${
                timeLeft <= 3 ? 'text-rose-600 font-black animate-pulse' : 'text-gray-700'
              }`}
            >
              <Timer size={14} /> {timeLeft}s
            </span>
          </div>

          {/* Question Box */}
          <div className="text-center py-4 space-y-2">
            <p className="text-xs md:text-sm font-semibold text-gray-500">{curQ.question}</p>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 inline-block">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-wider font-mono">
                {curQ.prompt}
              </h2>
            </div>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {curQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx
              const isCorrectAnswer = idx === curQ.correctIndex

              let btnStyle =
                'bg-white border-2 border-gray-100 text-gray-800 hover:border-amber-400 hover:bg-amber-50/40'

              if (isAnswered) {
                if (isCorrectAnswer) {
                  btnStyle = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-black shadow-sm'
                } else if (isSelected) {
                  btnStyle = 'bg-rose-50 border-2 border-rose-500 text-rose-950 font-bold'
                } else {
                  btnStyle = 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-2xl text-left text-xs md:text-sm font-semibold transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrectAnswer && (
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrectAnswer && (
                    <XCircle size={16} className="text-rose-500 flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Explanation Banner on Answered */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed"
            >
              <strong className="text-gray-950 font-bold">Penjelasan PPU: </strong>
              {curQ.explanation}
            </motion.div>
          )}
        </div>
      )}

      {/* Finished Summary View */}
      {isFinished && (
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
            <Award size={36} />
          </div>

          <div>
            <h3 className="text-2xl font-black text-gray-950">
              {mode !== 'solo'
                ? score > opponentScore
                  ? 'Kemenangan Telak! 🏆'
                  : score === opponentScore
                  ? 'Hasil Seri! 🤝'
                  : 'Pertarungan Sengit! ⚡'
                : 'Sesi Selesai! 🎉'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Latihan analogi dan kata baku ini langsung mengasah ketajaman kalimat essay motivasimu.
            </p>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-[11px] font-bold text-amber-800 uppercase block">Skor Kamu</span>
              <span className="text-2xl font-black text-gray-950">{score}</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block">Bonus XP</span>
              <span className="text-2xl font-black text-emerald-700">+{earnedXP} XP</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => startGame(mode)}
              className="btn btn-primary py-3 px-6 text-xs font-black flex items-center gap-2"
            >
              <RotateCcw size={14} /> Main Lagi
            </button>
            {onExit && (
              <button onClick={onExit} className="btn btn-outline py-3 px-6 text-xs font-bold">
                Tutup Arena
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
