'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface TourStep {
  id: string
  targetSelector: string
  title: string
  content: string
  placement?: 'right' | 'bottom' | 'top' | 'center'
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'intro',
    targetSelector: '#nav-beranda',
    title: 'Beranda Pejuang PTN',
    content: 'Hai, aku **Otbee**! Aku yang bakal nemenin kamu siap-siap seleksi PTN. Yuk keliling sebentar, selama tur **fitur premium terbuka** buat kamu intip.',
    placement: 'right',
  },
  {
    id: 'essay',
    targetSelector: '#nav-essay',
    title: 'Essay AI Review',
    content: 'Cek draft essay motivasimu di sini. AI akan menganalisis dari 4 dimensi: **struktur, koherensi, argumen, dan bahasa** lengkap dengan saran perbaikan.',
    placement: 'right',
  },
  {
    id: 'kalkulator',
    targetSelector: '#nav-kalkulator',
    title: 'Kalkulator Peluang PTN',
    content: 'Masukkan nilai rapor 5 semestermu. Algoritma kami membandingkannya dengan **data historis kuota & rasio keketatan** prodi tujuan.',
    placement: 'right',
  },
  {
    id: 'strategi',
    targetSelector: '#nav-strategi',
    title: 'Atur Strategi Pilihan',
    content: 'Petakan pilihan prodi 1 dan 2 agar **tidak bentrok rasio persaingan**, lengkap dengan rekomendasi jalur cadangan terbaik.',
    placement: 'right',
  },
  {
    id: 'otbee',
    targetSelector: '#nav-otbee',
    title: 'Otbee AI 24/7',
    content: 'Tanya apa saja seputar portofolio, sertifikat yang diakui, hingga tips wawancara ke **Otbee AI** kapan pun kamu butuh.',
    placement: 'right',
  },
  {
    id: 'modul',
    targetSelector: '#nav-modul',
    title: 'Modul & Video Materi',
    content: 'Akses ratusan **video e-course dan panduan praktis** persiapan jalur non-tes dari alumni peraih skor tertinggi.',
    placement: 'right',
  },
  {
    id: 'mentor',
    targetSelector: '#nav-mentor',
    title: 'Mentor Alumni 1-on-1',
    content: 'Konsultasi privat langsung via Zoom dengan **kakak tingkat dari UI, ITB, UGM, Unpad** yang sudah lolos di jurusan impianmu.',
    placement: 'right',
  },
  {
    id: 'tracking',
    targetSelector: '#nav-tracking',
    title: 'Tracking Jadwal Jalur',
    content: 'Simpan dan pantau progress pendaftaran berbagai jalur seleksi mandiri & SNBP agar **tidak ada deadline yang terlewat**.',
    placement: 'right',
  },
  {
    id: 'dokumen',
    targetSelector: '#nav-dokumen',
    title: 'Penyimpanan Dokumen',
    content: 'Simpan file scan rapor, sertifikat lomba, dan berkas pentingmu secara **terenkripsi dan rapi** di cloud otwptn.',
    placement: 'right',
  },
  {
    id: 'teman',
    targetSelector: '#nav-teman',
    title: 'Cari Teman Belajar',
    content: 'Temukan teman seperjuangan dengan target kampus yang sama untuk **belajar bareng via on-cam/chat** dan saling memotivasi.',
    placement: 'right',
  },
  {
    id: 'komunitas',
    targetSelector: '#nav-komunitas',
    title: 'Circle Komunitas',
    content: 'Ikuti obrolan feed komunitas pejuang PTN dan gabung ke **group circle jurusan** untuk diskusi info valid & terupdate.',
    placement: 'right',
  },
  {
    id: 'upgrade',
    targetSelector: '#nav-upgrade',
    title: 'Paket Belajar Premium',
    content: 'Upgrade ke **Paket Premium (Nectar, Honeycomb, atau Queen Bee VIP)** untuk buka semua video, mentoring intensif, dan unlimited AI!',
    placement: 'right',
  },
]

export default function SpotlightTour() {
  const [active, setActive] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Check if tour should run on first visit
  useEffect(() => {
    try {
      const tourDone = localStorage.getItem('otwptn_tour_completed')
      if (!tourDone) {
        const timer = setTimeout(() => {
          setActive(true)
        }, 1200)
        return () => clearTimeout(timer)
      }
    } catch {}

    // Expose relaunch function globally
    ;(window as any).startOtbeeTour = () => {
      setStepIdx(0)
      setActive(true)
    }
  }, [])

  // Calculate target element position whenever stepIdx or active changes
  useEffect(() => {
    if (!active) return

    const currentStep = TOUR_STEPS[stepIdx]
    if (!currentStep) return

    const updateRect = () => {
      const el = document.querySelector(currentStep.targetSelector)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        const rect = el.getBoundingClientRect()
        setTargetRect(rect)
      } else {
        setTargetRect(null)
      }
    }

    updateRect()
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect)

    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect)
    }
  }, [active, stepIdx])

  const finishTour = () => {
    try {
      localStorage.setItem('otwptn_tour_completed', 'true')
    } catch {}
    setActive(false)
  }

  const handleNext = () => {
    if (stepIdx < TOUR_STEPS.length - 1) {
      setStepIdx(stepIdx + 1)
    } else {
      finishTour()
    }
  }

  if (!active) return null

  const step = TOUR_STEPS[stepIdx]

  // Calculate Popover coordinates near the highlighted element
  let popoverTop = 100
  let popoverLeft = 280

  if (targetRect) {
    // If element is on the left sidebar (width ~256px), place popover to its right
    popoverTop = Math.max(20, Math.min(window.innerHeight - 300, targetRect.top - 20))
    popoverLeft = targetRect.right + 20

    // If screen is narrow (mobile)
    if (window.innerWidth < 768) {
      popoverLeft = Math.max(16, (window.innerWidth - 320) / 2)
      popoverTop = Math.min(window.innerHeight - 260, targetRect.bottom + 16)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto">
      {/* Darkened backdrop overlay matching Gambar 3 */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity duration-300"
        onClick={finishTour}
      />

      {/* Target Element Spotlight Highlight Box */}
      {targetRect && (
        <div
          className="fixed rounded-2xl pointer-events-none transition-all duration-300 ring-4 ring-amber-400 bg-white/10"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65), 0 0 25px rgba(251, 191, 36, 0.6)',
            zIndex: 10000,
          }}
        />
      )}

      {/* Speech Bubble / Dialogue Card (Persis Gambar 3) */}
      <div
        ref={popoverRef}
        className="fixed z-[10001] w-80 md:w-96 bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 transition-all duration-300 animate-in fade-in zoom-in-95"
        style={{
          top: popoverTop,
          left: popoverLeft,
        }}
      >
        {/* Header: Mascot avatar + "Langkah X dari Y" */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center p-1 border-2 border-emerald-300 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascot-hd/maskot-kepala-logo-avatar.png"
              alt="Otbee"
              className="w-full h-full object-contain"
              onError={e => {
                ;(e.currentTarget as HTMLImageElement).src = '/logo.png'
              }}
            />
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Langkah {stepIdx + 1} dari {TOUR_STEPS.length}
            </span>
            <h4 className="text-sm font-black text-gray-900 leading-tight">
              {step.title}
            </h4>
          </div>
        </div>

        {/* Content text */}
        <div
          className="text-xs text-gray-700 leading-relaxed mb-5"
          dangerouslySetInnerHTML={{
            __html: step.content.replace(
              /\*\*(.*?)\*\*/g,
              '<strong class="font-bold text-gray-950">$1</strong>'
            ),
          }}
        />

        {/* Action buttons (Gambar 3 style) */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleNext}
            className="flex-1 py-2.5 px-4 rounded-full bg-[#fed45b] hover:bg-[#fcc419] active:scale-95 text-[#583e00] font-black text-xs transition-all shadow-xs"
          >
            {stepIdx === 0
              ? 'Ayo mulai'
              : stepIdx === TOUR_STEPS.length - 1
              ? 'Selesai! 🎉'
              : 'Lanjut'}
          </button>

          <button
            onClick={finishTour}
            className="py-2.5 px-3 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors"
          >
            Nanti aja
          </button>
        </div>
      </div>
    </div>
  )
}
