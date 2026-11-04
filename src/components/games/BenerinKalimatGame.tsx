'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
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
      <div className="w-full max-w-2xl mx-auto rounded-3xl backdrop-blur-2xl bg-white/85 border border-white/90 p-10 text-center shadow-[0_12px_40px_rgba(0,0,0,0.06)] space-y-3">
        <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-gray-700">Memuat bank soal Arena PBM...</p>
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
        { text: 'Hapus kata ini', benar: true, isDelete: true },
        { text: 'Ganti dengan kata lain', benar: false },
        { text: 'Biarkan tetap ada', benar: false },
      ]
    }

    if (q.opsi_jawaban && q.opsi_jawaban.length > 0) {
      return q.opsi_jawaban.map(o => ({ text: o.text, benar: o.benar }))
    }

    const kunci = q.kunci || 'benar'
    const kataSalah = q.kata_salah || 'salah'
    const joinedDistractor = kunci.replace(/\s+/g, '')
    const separatedDistractor = kunci.split('').join(' ')

    const distractor2 =
      joinedDistractor.toLowerCase() !== kunci.toLowerCase()
        ? joinedDistractor
        : 'di ' + separatedDistractor

    const options: OptionItem[] = [
      { text: kunci, benar: true },
      { text: distractor2, benar: false },
      { text: kataSalah, benar: false },
    ]

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
              className="bg-amber-300 text-amber-950 px-2 py-0.5 rounded-lg font-black mx-0.5 shadow-xs"
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
        <p className="leading-relaxed text-gray-800">
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
          <ArrowDown size={16} className="stroke-[2.5]" />
          <p className="text-gray-950 font-black text-xs sm:text-sm">{corrected}</p>
        </div>
      </div>
    )
  }

  if (isGameOver) {
    return (
      <div className="w-full max-w-xl mx-auto rounded-3xl backdrop-blur-2xl bg-white/90 border border-white/90 p-8 text-center text-gray-950 shadow-[0_16px_50px_rgba(0,0,0,0.08)] space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-400/20 border border-amber-400/40 p-2 flex items-center justify-center mx-auto shadow-md">
          <Image
            src="/mascot/trophy-graduate.png"
            alt="Mascot Trophy"
            width={60}
            height={60}
            className="object-contain drop-shadow"
          />
        </div>
        <div>
          <h3 className="text-2xl font-black text-gray-950 tracking-tight">Arena Kuis PBM Selesai!</h3>
          <p className="text-xs text-gray-600 font-semibold mt-1">
            Kamu berhasil menyelesaikan sesi latihan perbaikan kalimat PBM.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-300 flex items-center justify-around">
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase block">Total Skor</span>
            <span className="text-2xl font-black text-gray-950 font-mono">{score}</span>
          </div>
          <div className="h-8 w-px bg-amber-200" />
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase block">Bonus XP</span>
            <span className="text-2xl font-black text-amber-600 font-mono">+25 XP</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <RotateCcw size={15} /> Main Lagi
          </button>
          {onExit && (
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-all cursor-pointer"
            >
              Kembali
            </button>
          )}
        </div>
      </div>
    )
  }

  const isKalimatHapus = currentQ.tipe === 'kalimat_hapus'
  const targetWord = currentQ.kata_berlebihan || currentQ.kata_salah || ''
  const options = getOptions(currentQ)
  const categoryLabel = currentQ.subtopik || (isKalimatHapus ? 'Kalimat Berlebihan' : 'Ejaan & Tata Bahasa')

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl backdrop-blur-2xl bg-white/90 border border-white/90 shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6 sm:p-8 space-y-6">
      {/* Header with Otbee Mascot Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/30 p-1 flex items-center justify-center flex-shrink-0">
            <Image
              src="/mascot/grading-paper.png"
              alt="Otbee Grading"
              width={34}
              height={34}
              className="object-contain"
            />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-gray-950 tracking-tight">
              {showPembahasan ? 'Layar Pembahasan Solusi' : 'Arena Kuis PBM (Benerin Kalimat)'}
            </h3>
            <p className="text-[11px] text-gray-500 font-semibold truncate">
              {showPembahasan
                ? 'Analisis kaidah ejaan & alasan pembetulan'
                : 'Pilih perbaikan kalimat paling efektif sesuai PUEBI'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!showPembahasan && (
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-mono font-black text-xs flex items-center gap-1.5 shadow-2xs">
              <Clock size={13} className="text-amber-600" />
              <span>{timeLeft}s</span>
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {!showPembahasan && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>
              Soal <strong className="text-gray-950 font-black">#{currentIdx + 1}</strong> dari {questions.length}
            </span>
            <span className="font-mono text-gray-700 font-bold">{score} Poin</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
              animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Content Question / Solution Card */}
      <AnimatePresence mode="wait">
        {!showPembahasan ? (
          <motion.div
            key={`q-${currentIdx}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 font-black text-[10.5px] uppercase tracking-wider border border-amber-200">
              {categoryLabel}
            </div>

            <p className="text-xs sm:text-sm text-gray-600 font-semibold leading-relaxed">
              {isKalimatHapus
                ? 'Kalimat di bawah ini memiliki kata yang tidak efektif / berlebihan. Tentukan langkah perbaikannya:'
                : 'Perbaiki kata yang salah eja atau tidak baku pada kalimat di bawah:'}
            </p>

            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80">
              <h4 className="text-base sm:text-lg font-black text-gray-950 leading-relaxed">
                {renderSentenceWithHighlight(currentQ.kalimat, targetWord)}
              </h4>
            </div>

            {/* Options layout */}
            {isKalimatHapus ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {options.map((opt, oIdx) => {
                  if (opt.isDelete) {
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(opt)}
                        className="col-span-1 border-2 border-dashed border-amber-400 bg-amber-50/80 hover:bg-amber-100 text-amber-950 rounded-2xl p-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 group shadow-xs hover:scale-[1.02]"
                      >
                        <Eraser size={20} className="text-amber-700 group-hover:rotate-12 transition-transform" />
                        <span className="text-xs sm:text-sm font-black leading-tight">Hapus kata ini</span>
                        <span className="text-[10px] text-amber-800 font-semibold leading-tight">
                          Kalimat sudah padu & efektif tanpa kata tersebut
                        </span>
                      </button>
                    )
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(opt)}
                      className="bg-white hover:bg-amber-50/60 border border-gray-200 hover:border-amber-400 text-gray-800 font-black p-4 rounded-2xl text-center text-xs sm:text-sm transition-all cursor-pointer shadow-xs hover:scale-[1.01]"
                    >
                      {opt.text}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(opt)}
                    className="w-full bg-white hover:bg-amber-50/60 border border-gray-200 hover:border-amber-400 text-gray-900 font-black py-3.5 px-4 rounded-2xl text-center text-xs sm:text-sm transition-all cursor-pointer shadow-xs hover:scale-[1.01]"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`review-${currentIdx}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-tight">
                {currentIdx + 1}. {targetWord || 'KATA'}{' '}
                <span className="text-gray-500 font-bold">
                  ({isKalimatHapus ? 'KATA BERLEBIH' : 'EJAAN SALAH'})
                </span>
              </h4>

              {isCorrect ? (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1 shadow-xs">
                  <Check size={14} className="stroke-[3]" /> Benar (+{Math.max(50, timeLeft * 10)})
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black flex items-center gap-1 shadow-xs">
                  <X size={14} className="stroke-[3]" /> Kurang Tepat
                </span>
              )}
            </div>

            <div className="bg-gray-50/90 border border-gray-200/80 rounded-2xl p-4 sm:p-5 space-y-2.5">
              <p className="text-[10.5px] font-black uppercase text-gray-500 tracking-wider">
                KUNCI JAWABAN:{' '}
                <span className="text-gray-900 font-black">
                  {isKalimatHapus
                    ? `HAPUS KATA "${(targetWord || '').toUpperCase()}"`
                    : `GANTI JADI "${currentQ.kunci.toUpperCase()}"`}
                </span>
              </p>

              {renderCorrectionSentences(currentQ)}
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
              <p className="text-[10.5px] font-black uppercase text-amber-900 tracking-wider">
                PENJELASAN PUEBI & KAIDAH
              </p>
              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium">
                {currentQ.pembahasan}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleNext}
                className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
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
