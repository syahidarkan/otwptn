'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
} from 'lucide-react'
import sentencesData from '@/lib/games/benerin-kalimat.json'
import { awardXP } from '@/lib/games/gameEngine'

interface Props {
  onExit?: () => void
}

export default function BenerinKalimatGame({ onExit }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number | null>(null)
  const [selectedFix, setSelectedFix] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [wrongClicks, setWrongClicks] = useState<number[]>([])

  const curData = sentencesData[currentIdx] || sentencesData[0]
  const isTargetWordSelected = selectedTokenIdx === curData.errorIndex

  const handleTokenClick = (idx: number) => {
    if (showExplanation) return
    setSelectedTokenIdx(idx)
    setSelectedFix(null)

    if (idx !== curData.errorIndex) {
      if (!wrongClicks.includes(idx)) {
        setWrongClicks(prev => [...prev, idx])
      }
    }
  }

  const handleFixSubmit = (chosenFix: string) => {
    setSelectedFix(chosenFix)
    setShowExplanation(true)

    if (chosenFix === curData.correctOption) {
      const penalty = wrongClicks.length * 30
      const earned = Math.max(50, 150 - penalty)
      setScore(prev => prev + earned)
      awardXP(35, 'Benerin Kalimat')
    }
  }

  const handleNext = () => {
    if (currentIdx < sentencesData.length - 1) {
      setCurrentIdx(prev => prev + 1)
      setSelectedTokenIdx(null)
      setSelectedFix(null)
      setShowExplanation(false)
      setWrongClicks([])
    } else {
      // Loop or finish
      setCurrentIdx(0)
      setSelectedTokenIdx(null)
      setSelectedFix(null)
      setShowExplanation(false)
      setWrongClicks([])
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white shadow-xl border border-amber-100 overflow-hidden">
      {/* Header Bar */}
      <div className="px-6 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-gray-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={22} className="fill-amber-950 text-amber-950" />
          <h3 className="text-base font-black tracking-tight">Koreksi Kalimat & PUEBI</h3>
        </div>

        <div className="flex items-center gap-2 bg-amber-600/20 px-3 py-1 rounded-full text-xs font-bold">
          <span>Skor: {score}</span>
          <span className="text-amber-900">•</span>
          <span>
            {currentIdx + 1}/{sentencesData.length}
          </span>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full uppercase">
            Instruksi: Cari & Klik Kata yang Salah
          </span>
          <p className="text-xs text-gray-500 mt-1">
            Klik bagian kalimat di bawah yang melanggar ejaan/tata bahasa, lalu pilih perbaikan yang benar.
          </p>
        </div>

        {/* Interactive Sentence Tokens */}
        <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/70 flex flex-wrap gap-2 items-center justify-center leading-relaxed text-sm md:text-base font-medium">
          {curData.tokens.map((token, idx) => {
            const isSelected = selectedTokenIdx === idx
            const isErrorSpot = idx === curData.errorIndex
            const isWrongClick = wrongClicks.includes(idx)

            let chipStyle =
              'hover:bg-amber-100/80 hover:border-amber-300 cursor-pointer bg-white border border-gray-200'

            if (isSelected) {
              chipStyle = isErrorSpot
                ? 'bg-amber-400 text-gray-950 font-black border-amber-500 ring-2 ring-amber-300'
                : 'bg-rose-100 text-rose-900 font-bold border-rose-300'
            } else if (isWrongClick) {
              chipStyle = 'bg-gray-100 text-gray-400 border-gray-200 opacity-60'
            }

            return (
              <button
                key={idx}
                onClick={() => handleTokenClick(idx)}
                className={`px-3 py-1.5 rounded-xl transition-all shadow-xs ${chipStyle}`}
              >
                {token}
              </button>
            )
          })}
        </div>

        {/* Hint if wrong word clicked */}
        {selectedTokenIdx !== null && !isTargetWordSelected && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 text-center font-medium"
          >
            Kata &ldquo;{curData.tokens[selectedTokenIdx]}&rdquo; sudah tepat! Coba cari kata lain yang keliru.
          </motion.div>
        )}

        {/* Fix Options (Unlocked when correct error word clicked) */}
        {isTargetWordSelected && !showExplanation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl bg-white border-2 border-amber-300 shadow-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-900 uppercase tracking-wider">
                Target Ditemukan! Pilih Perbaikan untuk &ldquo;{curData.errorWord}&rdquo;:
              </span>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                Kategori: {curData.category}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {curData.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleFixSubmit(opt)}
                  className="p-3 rounded-xl bg-amber-50 hover:bg-amber-400 hover:text-gray-950 border border-amber-200 text-xs font-bold text-gray-900 transition-all text-center shadow-xs"
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Instant Feedback & PUEBI Explanation */}
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-emerald-50/90 border border-emerald-300 space-y-4"
          >
            <div className="flex items-start gap-3">
              {selectedFix === curData.correctOption ? (
                <CheckCircle2 size={24} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle size={24} className="text-rose-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="text-sm font-black text-gray-950">
                  {selectedFix === curData.correctOption
                    ? 'Tepat Sekali! Perbaikan Sempurna 🎉'
                    : 'Jawaban Kurang Tepat 💡'}
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Bentuk yang benar adalah:{' '}
                  <strong className="text-emerald-800 font-black text-sm">
                    {curData.correctOption}
                  </strong>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-emerald-200 text-xs text-gray-700 leading-relaxed">
              <strong className="text-gray-950 font-bold block mb-0.5">Penjelasan Kaidah PUEBI:</strong>
              {curData.explanation}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={handleNext}
                className="btn btn-primary py-2.5 px-6 text-xs font-black"
              >
                Kalimat Berikutnya →
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
