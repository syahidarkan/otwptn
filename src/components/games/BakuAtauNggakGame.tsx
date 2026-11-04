'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
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
  Check,
  Send,
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
      setIsWon(true)
      setIsGameOver(true)
      const attemptPenalty = (newAttempts.length - 1) * 80
      const roundScore = Math.max(150, 500 - attemptPenalty)
      setScore(prev => prev + roundScore)

      const xp = Math.max(30, 80 - (newAttempts.length - 1) * 10)
      setEarnedXP(xp)
      awardXP(xp, 'Baku atau Nggak')
    } else if (newAttempts.length >= maxAttempts) {
      setIsGameOver(true)
      const xp = 15
      setEarnedXP(xp)
      awardXP(xp, 'Baku atau Nggak')
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl backdrop-blur-2xl bg-white/90 border border-white/90 shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Header Bar with Otbee Mascot */}
      <div className="px-6 py-4 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 text-gray-950 flex items-center justify-between border-b border-amber-300/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/80 p-1 flex items-center justify-center shadow-xs">
            <Image
              src="/mascot/glasses-writing-desk.png"
              alt="Mascot Writing Desk"
              width={34}
              height={34}
              className="object-contain"
            />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black tracking-tight text-gray-950">
              Wordle Baku (Kamus PUEBI)
            </h3>
            <p className="text-[11px] text-gray-800 font-bold">
              Tebak kata baku KBBI yang sering salah ditulis di esai
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white/60 p-1 rounded-2xl text-xs font-black shadow-xs">
          <button
            onClick={() => {
              setMode('solo')
              startNewWord()
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              mode === 'solo' ? 'bg-amber-400 text-gray-950 shadow-xs' : 'text-gray-700 hover:text-gray-950'
            }`}
          >
            Solo
          </button>
          <button
            onClick={() => {
              setMode('bot')
              startNewWord()
            }}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
              mode === 'bot' ? 'bg-amber-400 text-gray-950 shadow-xs' : 'text-gray-700 hover:text-gray-950'
            }`}
          >
            <Bot size={13} /> Vs Bot
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Definition & Hint Overview */}
        <div className="text-center space-y-2 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
          <span className="text-[10px] font-black tracking-wider text-amber-900 uppercase">
            Definisi KBBI & Konteks Esai
          </span>
          <p className="text-sm md:text-base font-black text-gray-900 max-w-lg mx-auto leading-relaxed">
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
                className={`w-11 h-13 sm:w-13 sm:h-15 rounded-2xl border-2 font-mono font-black text-xl sm:text-2xl flex items-center justify-center transition-all shadow-xs ${
                  isWon
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : showLetter
                    ? 'bg-amber-100 border-amber-400 text-amber-950'
                    : 'bg-white border-gray-200 text-gray-300'
                }`}
              >
                {showLetter ? curWord.targetWord[idx] : '_'}
              </div>
            )
          })}
        </div>

        {/* Hints Unlocked based on attempts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span className="flex items-center gap-1.5 font-bold text-gray-700">
              <Lightbulb size={14} className="text-amber-500" />
              Petunjuk Terbuka ({attempts.length}/{maxAttempts} Kesempatan):
            </span>
            <span className="text-amber-800 font-mono font-black">{score} Poin</span>
          </div>

          <div className="space-y-2">
            {curWord.hints.slice(0, Math.max(1, attempts.length)).map((hint, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80 text-xs text-gray-800 font-bold flex items-start gap-2.5"
              >
                <span className="w-4 h-4 rounded-full bg-amber-400 text-[10px] font-black text-gray-950 flex items-center justify-center flex-shrink-0 mt-0.5">
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
                className="flex-1 px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-amber-400 outline-none uppercase font-mono font-black text-sm tracking-widest text-center bg-white shadow-xs transition-colors"
                autoFocus
              />
              <button
                type="submit"
                disabled={!guessInput.trim()}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 font-black text-xs shadow-md transition-all cursor-pointer flex-shrink-0"
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
                    className="px-2.5 py-1 rounded-xl text-xs font-mono font-black bg-rose-50 text-rose-700 border border-rose-200 line-through shadow-2xs"
                  >
                    {att}
                  </span>
                ))}
              </div>
            )}
          </form>
        ) : (
          /* Game Over / Won State */
          <div className="p-6 rounded-3xl bg-amber-50/80 border border-amber-300 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm mx-auto flex items-center justify-center">
              {isWon ? (
                <CheckCircle2 size={36} className="text-emerald-500" />
              ) : (
                <XCircle size={36} className="text-rose-500" />
              )}
            </div>

            <div>
              <h4 className="text-lg font-black text-gray-950">
                {isWon ? 'Tebakan Tepat! Kata Baku Terkuak!' : 'Kesempatan Habis!'}
              </h4>
              <p className="text-xs text-gray-600 font-medium mt-1">
                Bentuk baku yang benar adalah{' '}
                <strong className="text-emerald-700 font-black text-sm">{curWord.targetWord}</strong>{' '}
                (bukan {curWord.commonMistake}).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-amber-200 text-xs text-gray-800 font-semibold italic">
              &ldquo;{curWord.exampleSentence.replace('___', curWord.targetWord)}&rdquo;
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={startNewWord}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <RotateCcw size={14} /> Kata Berikutnya
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="px-5 py-3 rounded-2xl bg-white border border-gray-200 text-gray-800 font-bold text-xs transition-all cursor-pointer"
                >
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
