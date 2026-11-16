'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Flame,
  Zap,
  HelpCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react'
import AuthGateModal from '@/components/auth/AuthGateModal'

interface QuizQuestion {
  id: number
  question: string
  optionA: string
  optionB: string
  correct: 'A' | 'B'
  explanation: string
}

const SAMPLE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Manakah bentuk kata baku sesuai pedoman KBBI & PUEBI untuk penulisan essay akademis?',
    optionA: 'Analisa',
    optionB: 'Analisis',
    correct: 'B',
    explanation: 'Bentuk baku menurut KBBI adalah "analisis", bukan "analisa" (serapan dari bahasa Belanda).',
  },
  {
    id: 2,
    question: 'Penulisan kata gabung yang tepat untuk seleksi administratif PTN:',
    optionA: 'Tanggung jawab',
    optionB: 'Tanggungjawab',
    correct: 'A',
    explanation: 'Kata majemuk ditulis terpisah ("tanggung jawab") kecuali jika mendapat awalan dan akhiran sekaligus ("pertanggungjawaban").',
  },
  {
    id: 3,
    question: 'Pilihlah ejaan yang baku untuk menyatakan aktivitas yang dilakukan berulang kali:',
    optionA: 'Mempraktekkan',
    optionB: 'Mempraktikkan',
    correct: 'B',
    explanation: 'Bentuk kata dasarnya adalah "praktik", sehingga imbuhan yang tepat adalah "mempraktikkan".',
  },
  {
    id: 4,
    question: 'Manakah penulisan kata baku yang sering keliru dalam esai motivasi:',
    optionA: 'Objektif',
    optionB: 'Obyektif',
    correct: 'A',
    explanation: 'Bentuk baku adalah "objektif" dengan huruf "j", bukan "obyektif".',
  },
  {
    id: 5,
    question: 'Kata penghubung antar-kalimat yang tepat dan formal:',
    optionA: 'Meskipun demikian, ...',
    optionB: 'Walaupun demikian, ...',
    correct: 'A',
    explanation: 'Keduanya digunakan, namun dalam standar uji literasi seleksi akademik PTN, "meskipun demikian" diutamakan sebagai konjungsi formal.',
  },
]

export default function LatihanSeleksiPublicClient() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | null>(null)
  const [score, setScore] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const currentQ = SAMPLE_QUESTIONS[currentIdx]

  const handleSelect = (choice: 'A' | 'B') => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(choice)
    const isCorrect = choice === currentQ.correct
    if (isCorrect) {
      setScore((prev) => prev + 20)
    }
    setAnsweredCount((prev) => prev + 1)
  }

  const handleNext = () => {
    if (currentIdx < SAMPLE_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1)
      setSelectedAnswer(null)
    } else {
      setIsFinished(true)
    }
  }

  const handleFinishAndSave = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'otwptn_pending_latihan',
          JSON.stringify({
            score,
            answeredCount: answeredCount || 5,
            timestamp: new Date().toISOString(),
          })
        )
      }
    } catch (e) {}

    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-amber-300 selection:text-neutral-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-14 px-4 sm:px-6 lg:px-8 border-b border-gray-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/70 via-amber-50/30 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300/80 text-amber-900 text-xs font-black uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            Simulasi & Bank Soal Skrining PTN 2025/2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Latihan Skrining <span className="text-amber-500">PBUBM & Tes Literasi PTN</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Asah ketepatan kosa kata baku, penalaran logika bahasa, dan kesiapan seleksi administrasi portofolio dengan kuis interaktif berstandar kampus top.
          </p>
        </div>
      </section>

      {/* Interactive Quiz Area */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        {!isFinished ? (
          <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-6 sm:p-8">
            {/* Top Bar: Progress & Score */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
                Soal {currentIdx + 1} dari {SAMPLE_QUESTIONS.length}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-black bg-amber-100 border border-amber-300 px-3.5 py-1 rounded-full text-amber-900 shadow-3xs">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                Skor: {score}
              </div>
            </div>

            {/* Progress bar line */}
            <div className="w-full h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-300 rounded-full"
                style={{ width: `${((currentIdx + 1) / SAMPLE_QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-relaxed mb-6">
              {currentQ.question}
            </h2>

            {/* Option Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleSelect('A')}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-2xl border text-left text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                  selectedAnswer === null
                    ? 'bg-gray-50 border-gray-200 hover:border-amber-400 hover:bg-amber-50/50 text-gray-900'
                    : selectedAnswer === 'A'
                      ? currentQ.correct === 'A'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-rose-50 border-rose-500 text-rose-900'
                      : currentQ.correct === 'A'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-gray-50 border-gray-200 opacity-40 text-gray-400'
                }`}
              >
                <span>A. {currentQ.optionA}</span>
                {selectedAnswer !== null && currentQ.correct === 'A' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                )}
                {selectedAnswer === 'A' && currentQ.correct !== 'A' && (
                  <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                )}
              </button>

              <button
                onClick={() => handleSelect('B')}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-2xl border text-left text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                  selectedAnswer === null
                    ? 'bg-gray-50 border-gray-200 hover:border-amber-400 hover:bg-amber-50/50 text-gray-900'
                    : selectedAnswer === 'B'
                      ? currentQ.correct === 'B'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-rose-50 border-rose-500 text-rose-900'
                      : currentQ.correct === 'B'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-gray-50 border-gray-200 opacity-40 text-gray-400'
                }`}
              >
                <span>B. {currentQ.optionB}</span>
                {selectedAnswer !== null && currentQ.correct === 'B' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                )}
                {selectedAnswer === 'B' && currentQ.correct !== 'B' && (
                  <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                )}
              </button>
            </div>

            {/* Explanation card after answering */}
            {selectedAnswer !== null && (
              <div className="mt-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-gray-800 leading-relaxed font-medium">
                <span className="font-bold text-amber-900 block mb-1">Pembahasan:</span>
                {currentQ.explanation}
              </div>
            )}

            {/* Next Button */}
            {selectedAnswer !== null && (
              <div className="mt-6 text-right">
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <span>{currentIdx < SAMPLE_QUESTIONS.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Akhir'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Finished State Screen */
          <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-600 shadow-xs">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <span className="text-xs font-black text-amber-700 uppercase tracking-wider block mb-1">
                Simulasi Selesai!
              </span>
              <h2 className="text-3xl font-black text-gray-900">Skor Akhir: {score} / 100</h2>
              <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto font-medium">
                Keren! Pemahaman literasi akademik kamu sangat potensial untuk lolos seleksi berkas PTN.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <button
                onClick={handleFinishAndSave}
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-base transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
              >
                <Zap className="w-5 h-5 text-neutral-950" />
                <span>Simpan Skor & Buka 500+ Soal Latihan Lengkap</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Auth Gate Modal Handover */}
      <AuthGateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Simpan Hasil Skor Latihan Kamu!"
        subtitle="Skor dan riwayat jawaban latihanmu sudah tersimpan aman. Masuk atau daftar gratis sekarang untuk mengakses arena battle dan bank soal lengkap."
        featureBadge="Simulasi & Latihan Seleksi"
        redirectPath="/dashboard/latihan"
        payloadPreview={[
          { label: 'Skor Latihan', value: `${score} / 100` },
          { label: 'Mode', value: 'Baku Atau Nggak (PBUBM & Skrining)' },
        ]}
      />
    </div>
  )
}
