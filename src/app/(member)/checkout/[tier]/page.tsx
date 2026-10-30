'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Check, ChevronLeft, ChevronRight, Star, Zap, Shield, Users, BookOpen, MessageSquare, Clock } from 'lucide-react'
import Link from 'next/link'

const TIERS = [
  {
    key: 'premium',
    name: 'Akun Premium',
    price: 'Rp49.000',
    priceNum: 49000,
    period: 'sekali bayar',
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.08)',
    highlight: false,
    desc: 'Akses penuh semua fitur platform AI tanpa mentor alumni.',
    feats: [
      'Kalkulator Peluang AI Unlimited',
      'Chat Otbee AI Tanpa Batas',
      'Essay AI Review Unlimited',
      'Unlock 100% Modul E-course',
      'Akses Atur Strategi AI',
      'Bebas buat dan join Circle',
    ],
  },
  {
    key: 'nectar',
    name: 'Nectar',
    price: 'Rp99.000',
    priceNum: 99000,
    period: 'sekali bayar',
    color: '#10b981',
    bgColor: 'rgba(16,185,129,0.08)',
    highlight: false,
    desc: 'Review essay oleh mentor alumni PTN terpercaya.',
    feats: [
      'Semua benefit Akun Premium',
      '2x Revisi Esai via WhatsApp',
      'Validasi Checklist Dokumen',
      'Feedback Esai Tertulis Detail',
      'Akses Grup WA Alumni',
    ],
  },
  {
    key: 'honeycomb',
    name: 'Honeycomb',
    price: 'Rp199.000',
    priceNum: 199000,
    period: 'sekali bayar',
    color: '#6366f1',
    bgColor: 'rgba(99,102,241,0.08)',
    highlight: false,
    desc: 'Bimbingan intensif dengan sesi privat bersama mentor.',
    feats: [
      'Semua benefit Akun Premium',
      '5x Putaran Revisi Esai',
      '2x Sesi Privat via Zoom',
      'Grup WA Eksklusif Mentor',
      'Analisis Peluang Prodi 1 & 2',
      'Template Essay Jalur Spesifik',
    ],
  },
  {
    key: 'queen-bee',
    name: 'Queen Bee',
    badge: 'Royal Jelly',
    price: 'Rp399.000',
    priceNum: 399000,
    period: 'sekali bayar',
    color: '#f43f5e',
    bgColor: 'rgba(244,63,94,0.08)',
    highlight: true,
    desc: 'Paket terlengkap: revisi tanpa batas + kunjungan langsung.',
    feats: [
      'Semua benefit Akun Premium',
      'Revisi Esai Unlimited + Meet',
      'Wajib Analisis Pilihan 1 & 2',
      'Sesi Zoom Unlimited',
      'Exclusive Trip ke UI/ITB/UGM',
      'Jaminan Bimbingan Sampai Lolos',
      'Prioritas Slot Mentor Senior',
    ],
  },
]

const FEATURE_HIGHLIGHTS = [
  { icon: Zap, title: 'Essay AI Review', desc: 'Analisis kalimat per kalimat dengan skor dan saran perbaikan' },
  { icon: BookOpen, title: 'E-course Premium', desc: '10 tahap × 3 materi per jalur SNBP, PPKB, SJP, SSU' },
  { icon: MessageSquare, title: 'Otbee AI Chat', desc: 'Tanya apapun soal PTN non-tes, 24/7 tanpa batas' },
  { icon: Star, title: 'Mentor Alumni', desc: 'Konsultasi 1-on-1 alumni UI, ITB, UGM, IPB terverifikasi' },
  { icon: Shield, title: 'Kalkulator Peluang', desc: 'Estimasi rasional berbasis profil akademik, rapor & jalur' },
  { icon: Users, title: 'Circle Komunitas', desc: 'Diskusi dan berbagi tips sesama pejuang PTN non-tes' },
  { icon: Clock, title: 'Atur Strategi AI', desc: 'Roadmap personal berdasarkan profil dan jalur tujuan' },
]

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const tier = params?.tier as string

  const defaultIdx = Math.max(0, TIERS.findIndex(t => t.key === tier))
  const [selected, setSelected] = useState(defaultIdx)
  const [carouselIdx, setCarouselIdx] = useState(0)
  const [featureIdx, setFeatureIdx] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const featureIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCarouselIdx(i => (i + 1) % TIERS.length)
    }, 3200)
    return () => clearInterval(intervalRef.current!)
  }, [])

  useEffect(() => {
    featureIntervalRef.current = setInterval(() => {
      setFeatureIdx(i => (i + 1) % FEATURE_HIGHLIGHTS.length)
    }, 2800)
    return () => clearInterval(featureIntervalRef.current!)
  }, [])

  const current = TIERS[selected]
  const featured = TIERS[carouselIdx]

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-semibold mb-8 hover:opacity-70 transition-opacity" style={{ color: 'var(--muted)' }}>
          <ChevronLeft size={16} /> Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left: Tier Selector + Details */}
          <div>
            <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--fg)' }}>Upgrade Akun</h1>
            <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Pilih paket yang sesuai dengan kebutuhanmu</p>

            {/* Tier Cards */}
            <div className="space-y-3 mb-8">
              {TIERS.map((t, i) => (
                <button
                  key={t.key}
                  onClick={() => setSelected(i)}
                  className="w-full text-left rounded-2xl p-4 transition-all border-2"
                  style={{
                    background: selected === i ? t.bgColor : 'var(--bg-alt)',
                    borderColor: selected === i ? t.color : 'var(--border)',
                    boxShadow: selected === i ? `0 0 0 3px ${t.color}22` : 'none',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: t.color, background: selected === i ? t.color : 'transparent' }}>
                        {selected === i && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="font-extrabold text-sm" style={{ color: 'var(--fg)' }}>{t.name}</span>
                        {t.badge && (
                          <span className="ml-2 text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: t.color, color: '#fff' }}>{t.badge}</span>
                        )}
                        {t.highlight && (
                          <span className="ml-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">Terpopuler</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-base" style={{ color: t.color }}>{t.price}</span>
                      <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{t.period}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Tier Benefits */}
            <div className="rounded-2xl p-5" style={{ background: current.bgColor, border: `1.5px solid ${current.color}44` }}>
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>Benefit {current.name}:</p>
              <ul className="space-y-2">
                {current.feats.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: current.color }} />
                    <span style={{ color: 'var(--fg)' }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Summary + Carousel + CTA */}
          <div className="flex flex-col gap-5">

            {/* Auto-slide Promo Carousel */}
            <div className="rounded-2xl overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${featured.color}22 0%, ${featured.color}11 100%)`, border: `1.5px solid ${featured.color}44`, minHeight: 120 }}>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full text-white" style={{ background: featured.color }}>
                    {featured.name}
                  </span>
                  <span className="text-xs font-bold" style={{ color: 'var(--muted)' }}>- {featured.price}</span>
                </div>
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--fg)' }}>{featured.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {featured.feats.slice(0, 3).map(f => (
                    <span key={f} className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${featured.color}22`, color: featured.color }}>{f}</span>
                  ))}
                </div>
              </div>
              {/* Dots */}
              <div className="flex items-center justify-center gap-1.5 pb-3">
                {TIERS.map((_, i) => (
                  <button key={i} onClick={() => setCarouselIdx(i)}
                    className="rounded-full transition-all"
                    style={{ width: carouselIdx === i ? 16 : 6, height: 6, background: carouselIdx === i ? featured.color : `${featured.color}44` }}
                  />
                ))}
              </div>
            </div>

            {/* Feature Highlight Carousel */}
            <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'var(--bg-alt)', border: '1.5px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                {(() => { const Icon = FEATURE_HIGHLIGHTS[featureIdx].icon; return <Icon size={18} /> })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold truncate" style={{ color: 'var(--fg)' }}>{FEATURE_HIGHLIGHTS[featureIdx].title}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{FEATURE_HIGHLIGHTS[featureIdx].desc}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setFeatureIdx(i => (i - 1 + FEATURE_HIGHLIGHTS.length) % FEATURE_HIGHLIGHTS.length)} className="w-6 h-6 rounded-full flex items-center justify-center hover:opacity-70" style={{ background: 'var(--border)' }}>
                  <ChevronLeft size={12} />
                </button>
                <button onClick={() => setFeatureIdx(i => (i + 1) % FEATURE_HIGHLIGHTS.length)} className="w-6 h-6 rounded-full flex items-center justify-center hover:opacity-70" style={{ background: 'var(--border)' }}>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-alt)', border: '1.5px solid var(--border)' }}>
              <h3 className="font-extrabold text-sm mb-4" style={{ color: 'var(--fg)' }}>Ringkasan Pesanan</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--muted)' }}>{current.name}</span>
                <span className="text-sm font-bold" style={{ color: 'var(--fg)' }}>{current.price}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>Biaya admin</span>
                <span className="text-xs font-semibold text-emerald-600">Gratis</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }} className="flex items-center justify-between mb-5">
                <span className="font-extrabold text-sm" style={{ color: 'var(--fg)' }}>Total</span>
                <span className="font-extrabold text-lg" style={{ color: current.color }}>{current.price}</span>
              </div>

              <Link
                href={`https://wa.me/6281234567890?text=Halo+saya+ingin+upgrade+ke+paket+${encodeURIComponent(current.name)}+seharga+${encodeURIComponent(current.price)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3.5 rounded-xl font-extrabold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: current.color }}
              >
                Bayar & Aktifkan {current.name} →
              </Link>
              <p className="text-center text-xs mt-3" style={{ color: 'var(--muted)' }}>
                Pembayaran via transfer bank / QRIS · Aktivasi dalam 1×24 jam
              </p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: 'Data Aman', sub: 'Enkripsi penuh' },
                { icon: Users, label: '12.500+ User', sub: 'Aktif' },
                { icon: Star, label: '94.8% Lolos', sub: 'Prodi Pilihan' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                  <Icon size={16} className="mx-auto mb-1" style={{ color: 'var(--accent)' }} />
                  <p className="text-xs font-extrabold" style={{ color: 'var(--fg)' }}>{label}</p>
                  <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
