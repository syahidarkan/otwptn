'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  X, Check, Sparkles, Bot, UploadCloud, FolderCheck,
  TrendingUp, FileEdit, GraduationCap, Users, Share2,
  Video, Award, Compass, HeartHandshake, ShieldCheck
} from 'lucide-react'

interface TierOption {
  id: 'premium_only' | 'nectar' | 'honeycomb' | 'queen_bee'
  name: string
  badge?: string
  oldPrice: string
  price: string
  period: string
  totalPrice: string
  perDay: string
  desc: string
}

const TIERS: TierOption[] = [
  {
    id: 'premium_only',
    name: 'Akun Premium',
    badge: 'Fitur Only',
    oldPrice: 'Rp 149.000',
    price: 'Rp 49.000',
    period: 'sekali bayar',
    totalPrice: 'Rp 49.000 total',
    perDay: 'Rp 544 per hari',
    desc: 'Semua tools AI & e-course mandiri',
  },
  {
    id: 'nectar',
    name: 'Paket Nectar',
    badge: 'Review Esai',
    oldPrice: 'Rp 299.000',
    price: 'Rp 99.000',
    period: 'masa seleksi',
    totalPrice: 'Rp 99.000 total',
    perDay: 'Rp 1.100 per hari',
    desc: 'Akun Premium + 2x review esai mentor',
  },
  {
    id: 'honeycomb',
    name: 'Paket Honeycomb',
    badge: 'Reguler Populer',
    oldPrice: 'Rp 499.000',
    price: 'Rp 199.000',
    period: 'masa seleksi',
    totalPrice: 'Rp 199.000 total',
    perDay: 'Rp 2.211 per hari',
    desc: '5x revisi esai + 2x Zoom privat + WA',
  },
  {
    id: 'queen_bee',
    name: 'Royal Jelly VIP',
    badge: 'VIP Maksimal',
    oldPrice: 'Rp 999.000',
    price: 'Rp 399.000',
    period: 'sampai lolos',
    totalPrice: 'Rp 399.000 total',
    perDay: 'Rp 3.325 per hari',
    desc: 'Unlimited mentor + berkas + Tour UI',
  },
]

const SLIDES = [
  {
    title: 'Rasionalisasi Rapor & Peluang Prodi Berdasarkan Data Riil',
    mascot: '/mascot-hd/kalkulator-peluang.png',
    bg: '#eaf4fe',
  },
  {
    title: 'Review Essay Personal & AI Mendalam Bersama Mentor Alumni',
    mascot: '/mascot-hd/maskot-fitur-essay-ai-review.png',
    bg: '#fef3c7',
  },
  {
    title: 'Kurasi Prestasi & Bedah Sertifikat Lolos Puspresnas / BPTI',
    mascot: '/mascot-hd/maskot-medali-emas-prestasi.png',
    bg: '#dcfce7',
  },
  {
    title: 'Bimbingan 1-on-1 Privat Tatap Muka Zoom & WhatsApp',
    mascot: '/mascot-hd/trio-mentor.png',
    bg: '#f3e8ff',
  },
]

export default function DailyPromoModal() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<TierOption['id']>('honeycomb')
  const [activeSlide, setActiveSlide] = useState(0)

  // Auto slide carousel in top-right card every 3.5 seconds
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % SLIDES.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [isOpen])

  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const lastShown = localStorage.getItem('otwptn_daily_promo_date')
      if (lastShown === today) return

      const isTourDone = localStorage.getItem('otwptn_tour_completed') === 'true'

      // Case 1: Tour already completed previously -> show promo after smooth 1.5s delay
      if (isTourDone) {
        const timer = setTimeout(() => {
          setIsOpen(true)
        }, 1500)
        return () => clearTimeout(timer)
      }

      // Case 2: First time user (tour is active or about to start) -> DO NOT show promo.
      // Wait until tour finishes or is skipped by the user!
      const handleTourEnd = () => {
        setTimeout(() => {
          setIsOpen(true)
        }, 1200)
      }

      const handleClosePromo = () => setIsOpen(false)

      window.addEventListener('otwptn_tour_finished', handleTourEnd)
      window.addEventListener('otwptn_close_promo', handleClosePromo)

      return () => {
        window.removeEventListener('otwptn_tour_finished', handleTourEnd)
        window.removeEventListener('otwptn_close_promo', handleClosePromo)
      }
    } catch {}
  }, [])

  const handleDismiss = () => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      localStorage.setItem('otwptn_daily_promo_date', today)
    } catch {}
    setIsOpen(false)
  }

  const currentTier = TIERS.find(t => t.id === selectedPlan) || TIERS[2]

  const handleMintaOrtu = () => {
    const parentMsg = encodeURIComponent(
      `Halo Ayah / Bunda! 🌟\n\nAku lagi giat persiapan seleksi masuk PTN impian lewat jalur non-tes (SNBP & Mandiri Prestasi) di otwptn.\n\nBiar persiapanku makin mantap dan peluang lolosnya makin tinggi, aku mau minta tolong dibayarin ${currentTier.name} (${currentTier.price}) ya! 🙏\n\nDetail paket & pembayarannya bisa langsung dibuka di sini:\nhttps://otwptn.com/checkout/${currentTier.id}\n\nMakasih banyak ya Ayah/Bunda! ❤️`
    )
    window.open(`https://wa.me/?text=${parentMsg}`, '_blank')
    handleDismiss()
  }

  const handleBayarSendiri = () => {
    handleDismiss()
    router.push(`/checkout/${currentTier.id}`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
        style={{ maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Top Header Banner: Green Pill matching design */}
        <div className="w-full bg-[#c3f08c] text-[#225010] py-2.5 px-6 flex items-center justify-between font-black text-sm tracking-wide">
          <div className="w-6" /> {/* spacer */}
          <span className="text-center font-extrabold text-sm">Paket Bimbingan & Akun Premium</span>
          <button
            onClick={handleDismiss}
            aria-label="Tutup"
            className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-[#225010] transition-colors"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Left Column: Heading, Plans & CTA */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                Biar persiapan PTN-nya lancar sampai hari H.
              </h2>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden border-2 border-amber-300">
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
            </div>

            <p className="text-xs font-semibold text-gray-500 mb-4">
              12.500+ pelajar udah belajar bareng otwptn
            </p>

            {/* Plan Selector: 4 Official Packages (Akun Premium s/d Royal Jelly) */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {TIERS.map(tier => {
                const isSelected = selectedPlan === tier.id
                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedPlan(tier.id)}
                    className={`relative p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-gray-950 bg-amber-50/20 shadow-md ring-1 ring-gray-950'
                        : 'border-gray-200 bg-gray-50/60 hover:border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-black text-gray-900 leading-tight">
                        {tier.name}
                      </span>
                    </div>
                    {tier.badge && (
                      <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-md inline-block mb-1">
                        {tier.badge}
                      </span>
                    )}
                    <div className="text-[10px] text-gray-400 line-through leading-none">
                      {tier.oldPrice}
                    </div>
                    <div className="text-sm sm:text-base font-black text-gray-950 leading-tight">
                      {tier.price}
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                      {tier.totalPrice}
                    </div>
                    <div className="text-[10px] font-bold text-sky-600 mt-0.5">
                      {tier.perDay}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Buttons: Minta dibayarin orang tua & Bayar sendiri */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleMintaOrtu}
                className="w-full py-3 px-4 rounded-full bg-[#fed45b] hover:bg-[#facb40] active:scale-[0.99] font-black text-[#583e00] text-sm shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                Minta dibayarin orang tua
              </button>

              <button
                onClick={handleBayarSendiri}
                className="w-full py-2.5 px-4 rounded-full border-2 border-gray-900 hover:bg-gray-50 font-black text-gray-950 text-sm transition-all"
              >
                Bayar sendiri ({currentTier.price})
              </button>

              <button
                onClick={handleDismiss}
                className="w-full py-1 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Nanti dulu
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-3 text-xs font-bold text-emerald-700">
              <Check size={14} strokeWidth={3} className="text-emerald-600" />
              <span>Premium aktif begitu pembayaran masuk</span>
            </div>
          </div>

          {/* Right Column: Auto-Sliding Card & Non-Tes Features Checklist */}
          <div className="flex flex-col">
            {/* Auto-sliding top card */}
            <div
              className="rounded-2xl p-4 flex items-center justify-between relative overflow-hidden mb-5 border transition-colors duration-500 min-h-[110px]"
              style={{
                backgroundColor: SLIDES[activeSlide].bg,
                borderColor: 'rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex-1 pr-3">
                <h4 className="text-sm font-black text-gray-900 leading-snug min-h-[42px] flex items-center">
                  {SLIDES[activeSlide].title}
                </h4>
                {/* Dots with click to navigate */}
                <div className="flex items-center gap-1.5 mt-3">
                  {SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`transition-all duration-300 ${
                        activeSlide === i
                          ? 'w-4 h-1.5 rounded-full bg-gray-900'
                          : 'w-1.5 h-1.5 rounded-full bg-gray-400 hover:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={SLIDES[activeSlide].mascot}
                  alt="Mascot Belajar"
                  className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 hover:scale-105"
                  onError={e => {
                    ;(e.currentTarget as HTMLImageElement).src = '/mascot-hd/maskot-kepala-logo-avatar.png'
                  }}
                />
              </div>
            </div>

            {/* "Yang kamu dapat di otwptn:" */}
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-3">
              Yang kamu dapat di ekosistem otwptn:
            </h4>

            {/* Checklist items in 2 columns (100% relevant to PTN Non-Tes & SNBP) */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-[11px] font-semibold text-gray-700">
              <div className="flex items-start gap-2">
                <Sparkles size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Kalkulator Peluang Rapor AI Unlimited</span>
              </div>
              <div className="flex items-start gap-2">
                <FileEdit size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Review Essay Personal & AI Mendalam</span>
              </div>

              <div className="flex items-start gap-2">
                <Bot size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Tanya Jawab AI Otbee 24/7 Tanpa Limit</span>
              </div>
              <div className="flex items-start gap-2">
                <Award size={14} className="text-teal-600 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Kurasi Sertifikat Juara Puspresnas/BPTI</span>
              </div>

              <div className="flex items-start gap-2">
                <FolderCheck size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Tracking Dokumen & Checklist Otomatis</span>
              </div>
              <div className="flex items-start gap-2">
                <GraduationCap size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Akses 100% Seluruh Modul & E-Course</span>
              </div>

              <div className="flex items-start gap-2">
                <Compass size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Fitur Atur Strategi Pilihan 1 & 2</span>
              </div>
              <div className="flex items-start gap-2">
                <Users size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Circle Komunitas & Kampus Impian</span>
              </div>

              <div className="flex items-start gap-2">
                <HeartHandshake size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Review Esai Mentor Alumni (Nectar+)</span>
              </div>
              <div className="flex items-start gap-2">
                <Video size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Sesi Privat Zoom 1-on-1 (Honeycomb+)</span>
              </div>

              <div className="flex items-start gap-2">
                <TrendingUp size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Dokumen Analisis Mentor (Queen Bee)</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Campus Tour ke Kampus UI (Queen Bee)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
