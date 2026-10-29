'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  X,
  Star,
  Check,
  ArrowRight,
  Flame,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react'

export default function CommercialPromoModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [dontShowToday, setDontShowToday] = useState(false)
  const [activeTab, setActiveTab] = useState<'queen_bee' | 'honeycomb' | 'nectar' | 'premium'>('queen_bee')

  // Simulated countdown for urgency
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 43, seconds: 28 })

  useEffect(() => {
    try {
      const dismissedDate = localStorage.getItem('otwptn_promo_dismissed_date')
      const today = new Date().toDateString()
      if (dismissedDate === today) return

      // Delay pop up by 3 seconds for natural commercial feel
      const timer = setTimeout(() => setIsOpen(true), 3500)
      return () => clearTimeout(timer)
    } catch {}
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  function handleClose() {
    setIsOpen(false)
    if (dontShowToday) {
      try {
        localStorage.setItem('otwptn_promo_dismissed_date', new Date().toDateString())
      } catch {}
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-up">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden relative border-0">
        {/* Floating Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors shadow-xs"
        >
          <X size={16} />
        </button>

        {/* Top Header Banner with Flame & Countdown */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-6 text-gray-950 relative overflow-hidden">
          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/15 text-black font-black text-[10px] uppercase tracking-wider">
                <Flame size={12} className="fill-current text-rose-600" />
                Promo Terbatas Seleksi PTN 2026/2027
              </span>

              {/* Countdown badge */}
              <div className="flex items-center gap-1 text-[11px] font-mono font-black bg-black/20 px-2.5 py-0.5 rounded-full text-black">
                <Clock size={12} />
                <span>
                  {String(timeLeft.hours).padStart(2, '0')}:
                  {String(timeLeft.minutes).padStart(2, '0')}:
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              Kunci Kursi PTN Impianmu Lebih Awal!
            </h3>
            <p className="text-xs font-semibold text-gray-900/80">
              Diskon spesial paket bimbingan resmi OtwPTN. Sudah termasuk Akun Premium 100% unlock!
            </p>
          </div>
        </div>

        {/* Package Selector Tabs */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-[11px] font-black">
            {[
              { id: 'queen_bee', label: 'Queen Bee', badge: 'VIP' },
              { id: 'honeycomb', label: 'Honeycomb', badge: '5x Rev' },
              { id: 'nectar', label: 'Nectar', badge: '2x Rev' },
              { id: 'premium', label: 'Premium', badge: 'No Mentor' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 rounded-xl transition-all text-center ${
                  activeTab === tab.id
                    ? 'btn-brand-primary shadow-xs'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900'
                }`}
              >
                <div>{tab.label}</div>
                <div className="text-[9px] opacity-75 font-bold">{tab.badge}</div>
              </button>
            ))}
          </div>

          {/* Active Package Card Presentation */}
          {activeTab === 'queen_bee' && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-400/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                    <Star size={10} className="fill-current" /> Paling Direkomendasikan
                  </span>
                  <h4 className="text-lg font-black text-gray-950 dark:text-gray-100 mt-1">
                    Paket Queen Bee (Royal Jelly VIP)
                  </h4>
                </div>
                <div className="text-right">
                  <span className="line-through text-xs text-gray-400 font-bold">Rp 799.000</span>
                  <div className="text-2xl font-black text-amber-700 dark:text-amber-400">
                    Rp 399.000
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium leading-relaxed">
                Akses mentor unlimited sampai 100% yakin, sesi Meet privat, Exclusive Trip ke Kampus UI, serta <strong>Wajib Dokumen Analisis Pilihan 1 & 2</strong> berdasarkan rapor & sertifikatmu.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-gray-800 dark:text-zinc-200">
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500 stroke-[3]" />
                  <span>Unlimited Revisi Esai</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500 stroke-[3]" />
                  <span>Sesi Meet Tatap Muka</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500 stroke-[3]" />
                  <span>Analisis Pil 1 & 2 Mentor</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500 stroke-[3]" />
                  <span>Otomatis Akun Premium</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'honeycomb' && (
            <div className="p-5 rounded-2xl bg-yellow-500/10 border border-yellow-400/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-950">
                    Paling Populer
                  </span>
                  <h4 className="text-lg font-black text-gray-950 dark:text-gray-100 mt-1">
                    Paket Honeycomb (Reguler)
                  </h4>
                </div>
                <div className="text-right">
                  <span className="line-through text-xs text-gray-400 font-bold">Rp 399.000</span>
                  <div className="text-2xl font-black text-yellow-700 dark:text-yellow-400">
                    Rp 199.000
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium leading-relaxed">
                Bimbingan terstruktur step-by-step penyusunan dokumen, strategi pemilihan jurusan, 5x revisi esai mendalam, 2x Sesi Zoom, dan grup WhatsApp khusus.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold text-gray-800 dark:text-zinc-200">
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500 stroke-[3]" />
                  <span>5x Putaran Revisi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500 stroke-[3]" />
                  <span>2x Sesi Zoom 45 Mnt</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500 stroke-[3]" />
                  <span>Grup WA Eksklusif</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500 stroke-[3]" />
                  <span>Otomatis Akun Premium</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nectar' && (
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-zinc-200">
                    Review Cepat
                  </span>
                  <h4 className="text-lg font-black text-gray-950 dark:text-gray-100 mt-1">
                    Paket Nectar (Review)
                  </h4>
                </div>
                <div className="text-right">
                  <span className="line-through text-xs text-gray-400 font-bold">Rp 199.000</span>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">
                    Rp 99.000
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium leading-relaxed">
                Poles dokumenmu biar bebas dari blind spot. Cek kelengkapan berkas dan 2x putaran revisi esai bersama mentor alumni via WhatsApp chat.
              </p>
            </div>
          )}

          {activeTab === 'premium' && (
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                    Akses Fitur Mandiri
                  </span>
                  <h4 className="text-lg font-black text-gray-950 dark:text-gray-100 mt-1">
                    Akun Premium (Fitur Only)
                  </h4>
                </div>
                <div className="text-right">
                  <span className="line-through text-xs text-gray-400 font-bold">Rp 99.000</span>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">
                    Rp 49.000
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium leading-relaxed">
                Buka 100% seluruh fitur cerdas otwptn: Kalkulator Peluang Unlimited, Chat Otbee AI Unlimited, Essay AI Review Unlimited, Bebas buat Circle, dan Unlock semua modul e-course tanpa mentor alumni.
              </p>
            </div>
          )}

          {/* CTA Button */}
          <Link
            href="/upgrade"
            onClick={handleClose}
            className="w-full py-3.5 rounded-full btn-brand-primary text-xs font-black shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
          >
            Ambil Diskon Paket Sekarang <ArrowRight size={15} />
          </Link>

          {/* Footer Option: Don't show again today */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-gray-700">
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={e => setDontShowToday(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="text-[11px] font-medium">Jangan tampilkan promo ini lagi hari ini</span>
            </label>

            <button
              onClick={handleClose}
              className="text-[11px] font-bold text-gray-400 hover:text-gray-600"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
