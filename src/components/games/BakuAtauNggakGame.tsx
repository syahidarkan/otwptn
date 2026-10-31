'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Bot,
  User,
  Users,
  Award,
  Lightbulb,
} from 'lucide-react'
import wordsData from '@/lib/games/baku-atau-nggak.json'
import { GameMode, BOT_PROFILES, awardXP } from '@/lib/games/gameEngine'

interface Props {
  initialMode?: GameMode
  onExit?: () => void
}

export default function BakuAtauNggakGame({ initialMode = 'solo', onExit }: Props) {
  const [mode, setMode] = useState<GameMode>(initialMode)
  const [wordIdx, setWordIdx] = useState(0)
  const [guessInput, setGuessInput] = useState('')
  const [attempts, setAttempts] = useState<string[]>([])
  const [isWon, setIsWon] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [earnedXP, setEarnedXP] = useState(0)

  // Bot states
  const [opponentName] = useState(() => BOT_PROFILES[0].name)
  const [opponentSolved, setOpponentSolved] = useState(false)
  const [opponentAttempts, setOpponentAttempts] = useState(0)

  const curWord = wordsData[wordIdx] || wordsData[0]
  const maxAttempts = 5

  const startNewWord = () => {
    const nextIdx = Math.floor(Math.random() * wordsData.length)
    setWordIdx(nextIdx)
    setGuessInput('')
    setAttempts([])
    setIsWon(false)
    setIsGameOver(false)
    setOpponentSolved(false)
    setOpponentAttempts(0)
  }

  // Simulasi bot tebak kata
  useEffect(() => {
    if (mode === 'bot' && !isWon && !isGameOver) {
      const botDelay = Math.floor(Math.random() * 5000) + 4000
      const timer = setTimeout(() => {
        const botSuccess = Math.random() < 0.75
        setOpponentAttempts(botSuccess ? 2 : 4)
        setOpponentSolved(botSuccess)
      }, botDelay)
      return () => clearTimeout(timer)
    }
  }, [mode, wordIdx, isWon, isGameOver])

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanGuess = guessInput.trim().toUpperCase()
    if (!cleanGuess || isWon || isGameOver) return

    const newAttempts = [...attempts, cleanGuess]
    setAttempts(newAttempts)
    setGuessInput('')

    if (cleanGuess === curWord.targetWord) {
      // Menang!
      setIsWon(true)
      setIsGameOver(true)
      const attemptPenalty = (newAttempts.length - 1) * 80
      const roundScore = Math.max(150, 500 - attemptPenalty)
      setScore(prev => prev + roundScore)

      const xp = Math.max(30, 80 - (newAttempts.length - 1) * 10)
      setEarnedXP(xp)
      awardXP(xp, 'Baku atau Nggak')
    } else if (newAttempts.length >= maxAttempts) {
      // Habis kesempatan
      setIsGameOver(true)
      const xp = 15
      setEarnedXP(xp)
      awardXP(xp, 'Baku atau Nggak')
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white shadow-xl border border-amber-100 overflow-hidden">
      {/* Header Bar */}
      <div className="px-6 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-gray-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={22} className="fill-amber-950 text-amber-950" />
          <h3 className="text-base font-black tracking-tight">Tebak Kata Baku PUEBI</h3>
        </div>

        <div className="flex items-center gap-1 bg-amber-600/20 p-1 rounded-full text-xs font-bold">
          <button
            onClick={() => {
              setMode('solo')
              startNewWord()
            }}
            className={`px-3 py-1 rounded-full transition-all ${
              mode === 'solo' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-900'
            }`}
          >
            Solo
          </button>
          <button
            onClick={() => {
              setMode('bot')
              startNewWord()
            }}
            className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
              mode === 'bot' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-900'
            }`}
          >
            <Bot size={13} /> Vs Bot
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Definition & Hint Overview */}
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full uppercase">
            Definisi KBBI & Konteks Esai
          </span>
          <p className="text-sm md:text-base font-bold text-gray-800 max-w-lg mx-auto">
            &ldquo;{curWord.definition}&rdquo;
          </p>
        </div>

        {/* Word Grid / Letters Placeholder */}
        <div className="flex items-center justify-center gap-2 my-4 flex-wrap">
          {Array.from({ length: curWord.letterCount }).map((_, idx) => {
            const isFirstLetter = idx === 0
            const showLetter = isWon || (isFirstLetter && attempts.length >= 2)

            return (
              <div
                key={idx}
                className={`w-10 h-12 md:w-12 md:h-14 rounded-xl border-2 font-mono font-black text-lg md:text-xl flex items-center justify-center transition-all ${
                  isWon
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : showLetter
                    ? 'bg-amber-50 border-amber-400 text-amber-900'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                {showLetter ? curWord.targetWord[idx] : '_'}
              </div>
            )
          })}
        </div>

        {/* Hints Unlocked based on attempts */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
            <Lightbulb size={13} className="text-amber-500" />
            Petunjuk Terbuka ({attempts.length}/{maxAttempts} Percobaan):
          </span>

          <div className="space-y-2">
            {curWord.hints.slice(0, Math.max(1, attempts.length)).map((hint, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 font-medium flex items-start gap-2"
              >
                <span className="w-4 h-4 rounded-full bg-amber-400 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{hint}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Guess Form */}
        {!isGameOver ? (
          <form onSubmit={handleGuessSubmit} className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={curWord.letterCount + 3}
                placeholder={`Tebak kata baku (${curWord.letterCount} huruf)...`}
                value={guessInput}
                onChange={e => setGuessInput(e.target.value.toUpperCase())}
                className="input input-bordered flex-1 uppercase font-mono font-bold text-sm tracking-widest text-center"
                autoFocus
              />
              <button
                type="submit"
                disabled={!guessInput.trim()}
                className="btn btn-primary px-6 text-xs font-black shadow-md"
              >
                Tebak!
              </button>
            </div>

            {/* Previous Guess History Chips */}
            {attempts.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-gray-400 font-semibold mr-1">Tebakanmu:</span>
                {attempts.map((att, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 line-through"
                  >
                    {att}
                  </span>
                ))}
              </div>
            )}
          </form>
        ) : (
          /* Game Over / Won State */
          <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-white shadow-xs mx-auto flex items-center justify-center text-amber-600">
              {isWon ? <CheckCircle2 size={32} className="text-emerald-500" /> : <XCircle size={32} className="text-rose-500" />}
            </div>

            <div>
              <h4 className="text-lg font-black text-gray-950">
                {isWon ? 'Tebakan Tepat! Kata Baku Terkuak 🎉' : 'Kesempatan Habis! 💡'}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                Bentuk baku yang benar adalah{' '}
                <strong className="text-emerald-700 font-black text-sm">{curWord.targetWord}</strong>{' '}
                (bukan {curWord.commonMistake}).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-amber-200 text-xs text-gray-700 italic">
              &ldquo;{curWord.exampleSentence.replace('___', curWord.targetWord)}&rdquo;
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={startNewWord}
                className="btn btn-primary py-2.5 px-6 text-xs font-black flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Kata Berikutnya
              </button>
              {onExit && (
                <button onClick={onExit} className="btn btn-outline py-2.5 px-5 text-xs font-bold">
                  Kembali
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
