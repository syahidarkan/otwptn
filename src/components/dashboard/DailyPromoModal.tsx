'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  X, Check, Video, Bot, UploadCloud, Dumbbell, FolderCheck,
  TrendingUp, PlaySquare, Sparkles, Gamepad2, FileEdit,
  GraduationCap, Users, ShieldCheck, Share2
} from 'lucide-react'

export default function DailyPromoModal() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'3bulan' | '1bulan'>('3bulan')
  const [copiedShare, setCopiedShare] = useState(false)

  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const lastShown = localStorage.getItem('otwptn_daily_promo_date')
      // Show once per calendar day
      if (lastShown !== today) {
        // Small delay so dashboard loads smoothly first
        const timer = setTimeout(() => {
          setIsOpen(true)
        }, 800)
        return () => clearTimeout(timer)
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

  const handleMintaOrtu = () => {
    const parentMsg = encodeURIComponent(
      `Halo Ayah / Bunda! 🌟\n\nAku lagi giat persiapan seleksi masuk PTN impian lewat jalur non-tes (SNBP & Mandiri Prestasi) di otwptn.\n\nBiar persiapanku makin mantap dan peluang lolosnya makin tinggi, aku mau minta tolong dibayarin Paket Bimbingan Belajar Premium otwptn ya! 🙏\n\nDetail paket & pembayarannya bisa langsung dibuka di sini:\nhttps://otwptn.com/upgrade\n\nMakasih banyak ya Ayah/Bunda! ❤️`
    )
    window.open(`https://wa.me/?text=${parentMsg}`, '_blank')
    handleDismiss()
  }

  const handleBayarSendiri = () => {
    handleDismiss()
    router.push('/upgrade')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
        style={{ maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Top Header Banner: Green Pill matching Gambar 2 */}
        <div className="w-full bg-[#c3f08c] text-[#225010] py-2.5 px-6 flex items-center justify-between font-black text-sm tracking-wide">
          <div className="w-6" /> {/* spacer */}
          <span className="text-center font-extrabold text-sm">Paket Premium</span>
          <button
            onClick={handleDismiss}
            aria-label="Tutup"
            className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-[#225010] transition-colors"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Heading, Plans & CTA */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                Biar latihan PTN-nya lancar sampai hari H.
              </h2>
              <div className="w-12 h-12 rounded-full bg-sky-100 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden border-2 border-sky-300">
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

            <p className="text-xs font-semibold text-gray-500 mb-5">
              1juta+ pelajar udah belajar bareng otwptn
            </p>

            {/* Plan Selector Cards (Gambar 2 style) */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Option 1: 3 Bulan */}
              <div
                onClick={() => setSelectedPlan('3bulan')}
                className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPlan === '3bulan'
                    ? 'border-gray-900 bg-white shadow-md'
                    : 'border-gray-200 bg-gray-50/60 hover:border-gray-300'
                }`}
              >
                {selectedPlan === '3bulan' && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
                <div className="text-xs font-bold text-gray-600 mb-1">3 Bulan (VIP)</div>
                <div className="text-[11px] text-gray-400 line-through">Rp 999.750</div>
                <div className="text-base font-black text-gray-950 leading-tight">
                  Rp 53.000<span className="text-[10px] font-semibold text-gray-500">/bulan</span>
                </div>
                <div className="text-[10px] text-gray-500 font-medium mt-1">
                  Rp 159.000 total
                </div>
                <div className="text-[10px] font-bold text-sky-600 mt-0.5">
                  Rp 1.742 per hari
                </div>
              </div>

              {/* Option 2: 1 Bulan */}
              <div
                onClick={() => setSelectedPlan('1bulan')}
                className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPlan === '1bulan'
                    ? 'border-gray-900 bg-white shadow-md'
                    : 'border-gray-200 bg-gray-50/60 hover:border-gray-300'
                }`}
              >
                {selectedPlan === '1bulan' && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
                <div className="text-xs font-bold text-gray-600 mb-1">1 Bulan</div>
                <div className="text-[11px] text-gray-400 line-through">Rp 332.500</div>
                <div className="text-base font-black text-gray-950 leading-tight">
                  Rp 79.000<span className="text-[10px] font-semibold text-gray-500">/bulan</span>
                </div>
                <div className="text-[10px] text-gray-500 font-medium mt-1">
                  Rp 79.000 total
                </div>
                <div className="text-[10px] font-bold text-sky-600 mt-0.5">
                  Rp 2.597 per hari
                </div>
              </div>
            </div>

            {/* Buttons: Minta dibayarin orang tua & Bayar sendiri */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleMintaOrtu}
                className="w-full py-3 px-4 rounded-full bg-[#fed45b] hover:bg-[#facb40] active:scale-[0.99] font-black text-[#583e00] text-sm shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                Minta dibayarin orang tua
              </button>

              <button
                onClick={handleBayarSendiri}
                className="w-full py-2.5 px-4 rounded-full border-2 border-gray-300 hover:border-gray-400 font-extrabold text-gray-800 text-sm transition-all"
              >
                Bayar sendiri
              </button>

              <button
                onClick={handleDismiss}
                className="w-full py-1 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Nanti dulu
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs font-bold text-emerald-700">
              <Check size={14} strokeWidth={3} className="text-emerald-600" />
              <span>Premium aktif begitu pembayaran masuk</span>
            </div>
          </div>

          {/* Right Column: Mascot Banner & Checklist Features */}
          <div className="flex flex-col">
            {/* Banner card with cute mascot wearing headphones (Gambar 2) */}
            <div className="rounded-2xl bg-[#eaf4fe] p-4 flex items-center justify-between relative overflow-hidden mb-5 border border-sky-100">
              <div className="flex-1 pr-3">
                <h4 className="text-sm font-black text-gray-900 leading-snug">
                  Pembahasan Video Semua Soal & Bedah Jurusan
                </h4>
                <div className="flex items-center gap-1 mt-3">
                  <div className="w-3.5 h-1.5 rounded-full bg-gray-900" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                </div>
              </div>

              <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/mascot-hd/support-headset.png"
                  alt="Mascot Belajar"
                  className="w-full h-full object-contain filter drop-shadow-sm"
                  onError={e => {
                    ;(e.currentTarget as HTMLImageElement).src = '/mascot-hd/maskot-kepala-logo-avatar.png'
                  }}
                />
              </div>
            </div>

            {/* "Yang kamu dapat di Pro" */}
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-3">
              Yang kamu dapat di Pro:
            </h4>

            {/* Checklist items in 2 columns (exact items from Gambar 2) */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-3 text-[11px] font-semibold text-gray-700">
              <div className="flex items-start gap-2">
                <Video size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Bikin Video Belajar Instan</span>
              </div>
              <div className="flex items-start gap-2">
                <PlaySquare size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Pembahasan Video Semua Soal TKA</span>
              </div>

              <div className="flex items-start gap-2">
                <Bot size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">20.000 Kredit AI tiap bulan buat Otbee</span>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles size={14} className="text-teal-600 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">20.000 Kredit AI per bulan</span>
              </div>

              <div className="flex items-start gap-2">
                <UploadCloud size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Upload Foto & File ke Otbee</span>
              </div>
              <div className="flex items-start gap-2">
                <Gamepad2 size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Game Otbee Kejar Nilai TKA</span>
              </div>

              <div className="flex items-start gap-2">
                <Dumbbell size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Soal Latihan TKA per Mata Pelajaran</span>
              </div>
              <div className="flex items-start gap-2">
                <FileEdit size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Generate Soal AI buat latihan harian</span>
              </div>

              <div className="flex items-start gap-2">
                <FolderCheck size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Akses Fitur Flashcards</span>
              </div>
              <div className="flex items-start gap-2">
                <GraduationCap size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Tryout TKA Full Simulasi</span>
              </div>

              <div className="flex items-start gap-2">
                <TrendingUp size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Analitik Progress per Mata Pelajaran</span>
              </div>
              <div className="flex items-start gap-2">
                <Users size={14} className="text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Akses Circle Premium & Circle Kampus</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
