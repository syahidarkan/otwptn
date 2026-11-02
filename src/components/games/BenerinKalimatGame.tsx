'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  Eraser,
  Check,
  X,
  ArrowDown,
  ArrowRight,
  RotateCcw,
  Clock,
  Sparkles,
  Trophy,
} from 'lucide-react'
import bankSoalData from '@/lib/games/bank-soal-arena-kuis.json'
import { awardXP } from '@/lib/games/gameEngine'
import { playAnswerSound } from '@/lib/games/soundEffects'

interface OptionItem {
  text: string
  benar: boolean
  isDelete?: boolean
}

interface PbmQuestion {
  id: string
  kategori: string
  subjenis: string
  subtopik?: string
  tingkat: string
  waktu_detik: number
  tipe: 'kalimat_hapus' | 'kalimat_ganti'
  kalimat: string
  kata_berlebihan?: string
  kata_salah?: string
  kunci: string
  pembahasan: string
  opsi_jawaban?: Array<{ text: string; benar: boolean }>
}

interface Props {
  onExit?: () => void
}

export default function BenerinKalimatGame({ onExit }: Props) {
  // Filter questions for PBM
  const [questions, setQuestions] = useState<PbmQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<OptionItem | null>(null)
  const [showPembahasan, setShowPembahasan] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20)
  const [isGameOver, setIsGameOver] = useState(false)

  // Initialize questions
  useEffect(() => {
    const rawPbm = (bankSoalData.soal as any[]).filter(s => s.kategori === 'PBM')
    const shuffled = [...rawPbm].sort(() => Math.random() - 0.5).slice(0, 8)
    setQuestions(shuffled as PbmQuestion[])
  }, [])

  const currentQ = questions[currentIdx]

  // Timer countdown per question
  useEffect(() => {
    if (!currentQ || showPembahasan || isGameOver) return

    setTimeLeft(currentQ.waktu_detik || 20)
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          // Timeout counts as incorrect answer
          handleSelectOption({ text: 'Waktu habis', benar: false })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentIdx, showPembahasan, isGameOver, currentQ])

  if (!currentQ && !isGameOver) {
    return (
      <div className="w-full max-w-xl mx-auto rounded-3xl bg-[#10141e] p-8 text-center text-white">
        <p className="text-sm font-semibold">Memuat soal Arena Kuis PBM...</p>
      </div>
    )
  }

  // Build options based on question type
  const getOptions = (q: PbmQuestion): OptionItem[] => {
    if (q.tipe === 'kalimat_hapus') {
      if (q.opsi_jawaban && q.opsi_jawaban.length > 0) {
        return q.opsi_jawaban.map(o => ({
          text: o.text,
          benar: o.benar,
          isDelete: o.text.toLowerCase().includes('hapus'),
        }))
      }
      return [
        { text: 'Ganti jadi "amat"', benar: false },
        { text: 'Ganti jadi "banget"', benar: false },
        { text: 'Biarkan saja', benar: false },
        { text: 'Hapus kata ini', benar: true, isDelete: true },
      ]
    }

    // tipe === 'kalimat_ganti' (Gambar 4 style)
    const kunci = q.kunci
    const kataSalah = q.kata_salah || ''

    // Generate clean plausible distractors
    const joinedDistractor = kataSalah.replace(/-/g, '').replace(/\s+/g, '')
    const separatedDistractor = kataSalah.replace(/-/g, ' ')

    const distractor2 =
      joinedDistractor.toLowerCase() !== kunci.toLowerCase()
        ? joinedDistractor
        : 'di ' + separatedDistractor

    const options: OptionItem[] = [
      { text: kunci, benar: true },
      { text: distractor2, benar: false },
      { text: kataSalah, benar: false },
    ]

    // Distinct and deterministic shuffle per question id
    const unique = options.filter(
      (opt, idx, self) => idx === self.findIndex(o => o.text.toLowerCase() === opt.text.toLowerCase())
    )
    return unique.sort(() => (q.id.charCodeAt(0) % 2 === 0 ? -1 : 1))
  }

  const handleSelectOption = (opt: OptionItem) => {
    if (showPembahasan) return
    setSelectedOption(opt)
    const correct = opt.benar
    setIsCorrect(correct)
    setShowPembahasan(true)

    try {
      playAnswerSound(correct)
    } catch {}

    if (correct) {
      const earned = Math.max(50, timeLeft * 10)
      setScore(prev => prev + earned)
      awardXP(25, 'Arena PBM')
    }
  }

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1)
      setSelectedOption(null)
      setShowPembahasan(false)
    } else {
      setIsGameOver(true)
    }
  }

  const handleRestart = () => {
    const rawPbm = (bankSoalData.soal as any[]).filter(s => s.kategori === 'PBM')
    const shuffled = [...rawPbm].sort(() => Math.random() - 0.5).slice(0, 8)
    setQuestions(shuffled as PbmQuestion[])
    setCurrentIdx(0)
    setSelectedOption(null)
    setShowPembahasan(false)
    setScore(0)
    setIsGameOver(false)
  }

  // Sentence with highlighted target word
  const renderSentenceWithHighlight = (kalimat: string, targetWord?: string) => {
    if (!targetWord || !kalimat.toLowerCase().includes(targetWord.toLowerCase())) {
      return <span>{kalimat}</span>
    }

    const regex = new RegExp(`(${targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i')
    const parts = kalimat.split(regex)

    return (
      <span>
        {parts.map((part, idx) =>
          regex.test(part) ? (
            <span
              key={idx}
              className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold mx-0.5"
            >
              {part}
            </span>
          ) : (
            <span key={idx}>{part}</span>
          )
        )}
      </span>
    )
  }

  // Pembahasan sentence with red strikethrough and corrected form
  const renderCorrectionSentences = (q: PbmQuestion) => {
    const target = q.kata_berlebihan || q.kata_salah || ''
    const kalimat = q.kalimat

    let corrected = kalimat
    if (q.tipe === 'kalimat_hapus' && target) {
      corrected = kalimat.replace(new RegExp(`\\s*${target}\\s*`, 'i'), ' ').replace(/\s+/g, ' ').trim()
    } else if (q.tipe === 'kalimat_ganti' && target) {
      corrected = kalimat.replace(new RegExp(target, 'i'), q.kunci)
    }

    const regex = new RegExp(`(${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i')
    const parts = kalimat.split(regex)

    return (
      <div className="space-y-2 text-xs sm:text-sm">
        <p className="leading-relaxed text-slate-800">
          {parts.map((part, idx) =>
            regex.test(part) ? (
              <del key={idx} className="line-through text-rose-500 font-bold decoration-rose-500 decoration-2 px-0.5">
                {part}
              </del>
            ) : (
              <span key={idx}>{part}</span>
            )
          )}
        </p>

        <div className="flex items-center gap-2 pt-1 text-emerald-600 font-bold">
          <ArrowDown size={17} className="stroke-[2.5]" />
          <p className="text-slate-950 font-bold text-xs sm:text-sm">{corrected}</p>
        </div>
      </div>
    )
  }

  // Final summary screen
  if (isGameOver) {
    return (
      <div className="w-full max-w-xl mx-auto rounded-3xl bg-[#10141e] p-6 sm:p-8 text-center text-white shadow-2xl border border-slate-800 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center mx-auto shadow-lg">
          <Trophy size={32} />
        </div>
        <div>
          <h3 className="text-xl font-black text-amber-400">Arena Kuis PBM Selesai!</h3>
          <p className="text-xs text-slate-400 mt-1">Kamu berhasil menuntaskan 8 soal latihan PBM.</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex justify-around">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Total Skor</p>
            <p className="text-2xl font-black text-amber-400 mt-0.5">{score}</p>
          </div>
          <div className="w-px bg-slate-800" />
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">XP Diperoleh</p>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">+200 XP</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <RotateCcw size={15} /> Main Lagi
          </button>
          {onExit && (
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Keluar ke Menu
            </button>
          )}
        </div>
      </div>
    )
  }

  const targetWord = currentQ.kata_berlebihan || currentQ.kata_salah
  const categoryLabel = `PBM • ${(currentQ.subtopik || currentQ.subjenis || 'Kalimat').toUpperCase()}`
  const options = getOptions(currentQ)
  const isKalimatHapus = currentQ.tipe === 'kalimat_hapus'

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl bg-[#10141e] p-4 sm:p-6 text-white shadow-2xl border border-slate-800/80 transition-all font-sans">
      {/* Top Header Card (Gambar 3, 4, 5 style) */}
      <div className="bg-[#1a202e] border border-slate-700/60 p-3.5 rounded-2xl flex items-center gap-3.5 mb-5 shadow-inner">
        <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center flex-shrink-0 shadow-sm">
          <GraduationCap size={22} strokeWidth={2.4} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black text-white tracking-tight leading-tight">
            {showPembahasan ? 'Layar pembahasan' : 'Arena Kuis PPU & PBM'}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
            {showPembahasan
              ? 'Setelah user menjawab soal'
              : currentQ.subtopik
              ? `Usulan untuk ${currentQ.subtopik.toLowerCase()}`
              : 'Perbaikan ejaan & tata bahasa PBM'}
          </p>
        </div>
      </div>

      {/* Progress & Timer Bar (Gambar 3 & 4 style) */}
      {!showPembahasan && (
        <div className="mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300">
              Soal <strong className="text-amber-400 font-black">#{currentIdx + 1}</strong> dari {questions.length}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-amber-300 text-[11px] font-black flex items-center gap-1 shadow-2xs">
              <Clock size={12} /> {timeLeft}s
            </span>
          </div>

          {/* Yellow Progress Bar */}
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Main White Content Card */}
      <AnimatePresence mode="wait">
        {!showPembahasan ? (
          /* Question Card (Gambar 3 & 4) */
          <motion.div
            key={`q-${currentIdx}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl p-5 sm:p-7 text-slate-900 shadow-xl space-y-5 border border-slate-100"
          >
            {/* Category Tag Badge */}
            <span className="bg-amber-100/90 text-amber-900 font-extrabold text-[10.5px] px-3 py-1 rounded-full uppercase inline-block tracking-wide">
              {categoryLabel}
            </span>

            {/* Instruction Prompt */}
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {isKalimatHapus
                ? 'Kalimat ini punya satu kata yang berlebihan. Pilih kata itu, lalu tentukan perbaikannya:'
                : 'Perbaiki kata yang salah pada kalimat:'}
            </p>

            {/* Sentence with Highlighted Target */}
            <h4 className="text-base sm:text-lg font-bold text-slate-950 leading-relaxed">
              {renderSentenceWithHighlight(currentQ.kalimat, targetWord)}
            </h4>

            {/* Options layout */}
            {isKalimatHapus ? (
              /* 2x2 Grid with Dashed Gold Card (Gambar 3) */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {options.map((opt, oIdx) => {
                  if (opt.isDelete) {
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(opt)}
                        className="col-span-1 border-2 border-dashed border-amber-400 bg-amber-50/70 hover:bg-amber-100 text-amber-950 rounded-2xl p-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 group shadow-xs hover:scale-[1.02]"
                      >
                        <Eraser size={18} className="text-amber-700 group-hover:rotate-12 transition-transform" />
                        <span className="text-xs sm:text-sm font-black leading-tight">Hapus kata ini</span>
                        <span className="text-[10px] text-amber-800/80 font-medium leading-tight">
                          kalimat sudah benar tanpa kata ini
                        </span>
                      </button>
                    )
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(opt)}
                      className="bg-slate-100 hover:bg-slate-200/90 text-slate-800 font-bold p-4 rounded-2xl text-center text-xs sm:text-sm transition-all cursor-pointer shadow-xs hover:scale-[1.01]"
                    >
                      {opt.text}
                    </button>
                  )
                })}
              </div>
            ) : (
              /* Stacked Options (Gambar 4) */
              <div className="space-y-2.5 pt-2">
                {options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(opt)}
                    className="w-full bg-slate-100 hover:bg-slate-200/90 text-slate-800 font-bold py-3.5 px-4 rounded-2xl text-center text-xs sm:text-sm transition-all cursor-pointer shadow-xs hover:scale-[1.01]"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* Layar Pembahasan (Gambar 5) */
          <motion.div
            key={`review-${currentIdx}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl p-5 sm:p-7 text-slate-900 shadow-xl space-y-5 border border-slate-100"
          >
            {/* Header with Title and Result Badge */}
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">
                {currentIdx + 1}. {targetWord || 'KATA'}{' '}
                <span className="text-slate-500 font-bold">
                  ({isKalimatHapus ? 'KATA BERLEBIH' : 'EJAAN SALAH'})
                </span>
              </h4>

              {isCorrect ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center gap-1 shadow-2xs">
                  <Check size={13} className="stroke-[3]" /> Benar
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black flex items-center gap-1 shadow-2xs">
                  <X size={13} className="stroke-[3]" /> Salah
                </span>
              )}
            </div>

            {/* Instruction Text */}
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {isKalimatHapus
                ? 'Kalimat ini punya satu kata yang berlebihan. Pilih kata itu, lalu tentukan perbaikannya.'
                : 'Perbaiki kata yang salah pada kalimat.'}
            </p>

            {/* Gray Solution Box (Gambar 5) */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 sm:p-5 space-y-2">
              <p className="text-[10.5px] font-black uppercase text-slate-500 tracking-wider">
                KUNCI JAWABAN:{' '}
                <span className="text-slate-800">
                  {isKalimatHapus ? `HAPUS KATA "${(targetWord || '').toUpperCase()}"` : `GANTI JADI "${currentQ.kunci.toUpperCase()}"`}
                </span>
              </p>

              {renderCorrectionSentences(currentQ)}
            </div>

            {/* Section PEMBAHASAN */}
            <div className="space-y-1 pt-1">
              <p className="text-[10.5px] font-black uppercase text-slate-400 tracking-wider">
                PEMBAHASAN
              </p>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                {currentQ.pembahasan}
              </p>
            </div>

            {/* Next Button */}
            <div className="pt-2">
              <button
                onClick={handleNext}
                className="w-full py-3.5 rounded-full font-black text-xs sm:text-sm bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <span>{currentIdx < questions.length - 1 ? 'Lanjut ke Soal Berikutnya' : 'Lihat Hasil Akhir'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
