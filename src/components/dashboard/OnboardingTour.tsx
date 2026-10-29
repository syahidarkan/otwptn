'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  FileCheck2,
  Calculator,
  Target,
  GraduationCap,
  Crown,
  HelpCircle,
} from 'lucide-react'

interface TourStep {
  title: string
  subtitle: string
  desc: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge: string
  actionUrl?: string
  actionLabel?: string
  illustration: string
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Selamat Datang di otwptn!',
    subtitle: 'Ekosistem Persiapan Masuk PTN Non-Tes',
    desc: 'Platform cerdas pertama yang mendampingi perjuanganmu menembus PTN impian (SNBP, PPKB UI, Prestasi, dan Jalur Mandiri Rapor) tanpa tes tulis.',
    icon: Sparkles,
    badge: 'Langkah 1 dari 6',
    actionUrl: '/dashboard',
    actionLabel: 'Mulai Tur Fitur',
    illustration: '/mascot/top.png',
  },
  {
    title: 'Fitur 1: Essay AI Review',
    subtitle: 'Bedah Esai Kata per Kata',
    desc: 'Unggah draf esaimu untuk dinilai dari 4 dimensi: struktur hook pembuka, relevansi latar belakang, kekuatan argumen, dan keaslian narasi bebas klise.',
    icon: FileCheck2,
    badge: 'Langkah 2 dari 6',
    actionUrl: '/dashboard/essay',
    actionLabel: 'Coba Essay AI',
    illustration: '/mascot/review-draft.png',
  },
  {
    title: 'Fitur 2: Kalkulator Peluang',
    subtitle: 'Rasionalisasi Nilai Rapor 5 Semester',
    desc: 'Masukkan nilai rapor semester 1 s.d. 5 untuk memetakan peluang kelulusan, daya saing sekolah, dan indeks linieritas program studi tujuan.',
    icon: Calculator,
    badge: 'Langkah 3 dari 6',
    actionUrl: '/dashboard/kalkulator',
    actionLabel: 'Buka Kalkulator',
    illustration: '/mascot/chart-pointing.png',
  },
  {
    title: 'Fitur 3: Atur Strategi & Tracking Jalur',
    subtitle: 'Roadmap & Checklist Berkas Lengkap',
    desc: 'Pantau jadwal pembukaan pendaftaran semua universitas negeri dan checklist dokumen persyaratan resmi agar tidak ada berkas yang tertinggal.',
    icon: Target,
    badge: 'Langkah 4 dari 6',
    actionUrl: '/dashboard/tracking-jalur',
    actionLabel: 'Lihat Tracking Jalur',
    illustration: '/mascot/map-pointing.png',
  },
  {
    title: 'Fitur 4: Mentor Alumni PTN',
    subtitle: 'Pendampingan Eksklusif 1-on-1',
    desc: 'Dapatkan bimbingan privat langsung dari mahasiswa & alumni berprestasi UI, ITB, dan UGM yang telah membuktikan kelulusan di jalur non-tes.',
    icon: GraduationCap,
    badge: 'Langkah 5 dari 6',
    actionUrl: '/dashboard/mentor',
    actionLabel: 'Kenalan dengan Mentor',
    illustration: '/mascot/reading-books.png',
  },
  {
    title: 'Upgrade ke Premium & Student Ambassador',
    subtitle: 'Buka 100% Fitur & Raih Komisi Tunai',
    desc: 'Tingkatkan akunmu untuk akses AI dan e-course tanpa batas. Kamu juga bisa bagikan kode referralmu untuk mendapatkan komisi uang tunai jutaan rupiah!',
    icon: Crown,
    badge: 'Langkah 6 dari 6',
    actionUrl: '/upgrade',
    actionLabel: 'Lihat Paket Belajar',
    illustration: '/mascot/trophy-jump.png',
  },
]

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    try {
      const completed = localStorage.getItem('otwptn_tour_completed')
      // Auto open on first visit if not completed
      if (!completed) {
        const timer = setTimeout(() => setIsOpen(true), 1200)
        return () => clearTimeout(timer)
      }
    } catch {}
  }, [])

  function handleClose() {
    setIsOpen(false)
    try {
      localStorage.setItem('otwptn_tour_completed', 'true')
    } catch {}
  }

  function handleNext() {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(s => s + 1)
    } else {
      handleClose()
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1)
    }
  }

  const step = TOUR_STEPS[currentStep]
  const Icon = step.icon

  return (
    <>
      {/* Floating Tour Helper Trigger (Always available in bottom right corner of dashboard) */}
      <button
        onClick={() => {
          setCurrentStep(0)
          setIsOpen(true)
        }}
        title="Buka Panduan Fitur"
        className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-white dark:bg-zinc-800 text-amber-600 shadow-xl hover:scale-110 transition-all flex items-center gap-2 group border-0"
      >
        <HelpCircle size={20} className="text-amber-500" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-black text-gray-900 dark:text-gray-100 pr-1">
          Panduan Fitur
        </span>
      </button>

      {/* Pop-up Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-up">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl relative border-0 space-y-6">
            {/* Top Close Button & Badge */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 shadow-2xs">
                <Icon size={13} className="text-amber-600" />
                {step.badge}
              </span>

              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Illustration / Mascot Banner */}
            <div className="w-full h-36 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 flex items-center justify-center relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={step.illustration}
                alt=""
                className="h-28 w-auto object-contain drop-shadow-md animate-bounce"
                style={{ animationDuration: '3s' }}
                onError={e => {
                  ;(e.currentTarget as HTMLElement).style.display = 'none'
                }}
              />
              <div className="absolute bottom-2 right-3 text-[10px] font-black text-amber-800/60 dark:text-amber-400/60 uppercase">
                otwptn guide
              </div>
            </div>

            {/* Content Text */}
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl font-black text-gray-950 dark:text-gray-50">
                {step.title}
              </h3>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                {step.subtitle}
              </p>
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>

            {/* Step Indicator Dots */}
            <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-2">
              {TOUR_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`h-2 rounded-full transition-all ${
                    currentStep === i
                      ? 'w-6 bg-amber-500'
                      : 'w-2 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800 gap-3">
              <button
                disabled={currentStep === 0}
                onClick={handlePrev}
                className="px-4 py-2 rounded-full text-xs font-bold text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Kembali
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-full text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Lewati
                </button>

                <button
                  onClick={handleNext}
                  className="btn-brand-primary px-6 py-2.5 rounded-full text-xs font-black shadow-md flex items-center gap-1.5"
                >
                  {currentStep === TOUR_STEPS.length - 1 ? (
                    <>Mulai Sekarang <CheckCircle2 size={14} /></>
                  ) : (
                    <>Lanjut <ArrowRight size={14} /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
