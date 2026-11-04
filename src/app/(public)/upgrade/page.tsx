'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Check,
  Sparkles,
  ShieldCheck,
  Star,
  X,
  Loader2,
  Lock,
  Crown,
  Compass,
  User,
  Mail,
  CreditCard,
  QrCode,
  Building2,
  Smartphone,
} from 'lucide-react'
import { LEGAL_ENTITY } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

interface TierPlan {
  id: string
  backendKey: string
  name: string
  subtitle: string
  tagline: string
  price: string
  period: string
  popular?: boolean
  features: string[]
  ctaText: string
  badge?: string
  mentorIncluded: boolean
}

const PLANS: TierPlan[] = [
  {
    id: 'premium_only',
    backendKey: 'web_premium',
    name: 'Akun Premium',
    subtitle: 'Fitur Only · Tanpa Mentor',
    tagline: 'Akses tanpa batas ke seluruh ekosistem cerdas otwptn secara mandiri.',
    price: 'Rp49.000',
    period: 'sekali bayar',
    mentorIncluded: false,
    features: [
      'Kalkulator Peluang Kelulusan Tak Terbatas (Free: 1x/bulan)',
      'Tanya Jawab AI Otbee Unlimited (Free: 3x/hari)',
      'Review Essay AI Analisis Mendalam Unlimited (Free: 1x/bulan)',
      'Akses & buat Circle Komunitas Belajar (Free: hanya join)',
      'Buka 100% Seluruh Modul & Video E-Course (Free: preview)',
      'Buka Fitur Atur Strategi Rasionalisasi Prodi',
    ],
    ctaText: 'Pilih Akun Premium',
  },
  {
    id: 'nectar',
    backendKey: 'review',
    name: 'Paket Nectar',
    subtitle: 'Opsi Review · Termasuk Akun Premium',
    tagline: 'Udah punya draft tapi masih ragu? Nectar poles dokumenmu biar bebas dari blind spot.',
    price: 'Rp99.000',
    period: 'per masa seleksi',
    mentorIncluded: true,
    features: [
      'OTOMATIS SUDAH TERMASUK AKUN PREMIUM (Unlock semua fitur)',
      'Free konsultasi awal perkenalan dokumen',
      'Cek kelengkapan & validasi berkas persyaratan',
      'Koreksi esai mendalam di collaborative workspace',
      '2x Putaran revisi esai bersama mentor alumni',
      'Pendampingan via chat WhatsApp',
      'Review feedback selesai dalam 24 jam',
    ],
    ctaText: 'Pilih Paket Nectar',
  },
  {
    id: 'honeycomb',
    backendKey: 'dokumen',
    name: 'Paket Honeycomb',
    subtitle: 'Opsi Reguler · Termasuk Akun Premium',
    tagline: 'Kami bimbing kamu susun dokumen step-by-step dari kerangka sampai strategi jurusan.',
    price: 'Rp199.000',
    period: 'per masa seleksi',
    mentorIncluded: true,
    features: [
      'OTOMATIS SUDAH TERMASUK AKUN PREMIUM (Unlock semua fitur)',
      'Free konsultasi awal & panduan kerangka dokumen',
      'Bimbingan step-by-step penyusunan berkas & portofolio',
      'Strategi penentuan prodi & analisis kuota',
      '5x Putaran revisi esai terarah sampai solid',
      '2x Sesi Zoom privat (45 menit/sesi) tatap muka',
      'Akses ke Grup WhatsApp Eksklusif (Mentor + Admin + Mentee)',
    ],
    ctaText: 'Pilih Paket Honeycomb',
  },
  {
    id: 'queen_bee',
    backendKey: 'menyeluruh',
    name: 'Paket Queen Bee',
    subtitle: 'Royal Jelly VIP · Termasuk Akun Premium',
    tagline: 'Ratu lebah selalu diprioritaskan. Akses mentor unlimited dan perlakuan paling eksklusif.',
    price: 'Rp399.000',
    period: 'sampai hari pengumuman',
    popular: true,
    badge: 'Paling Direkomendasikan',
    mentorIncluded: true,
    features: [
      'OTOMATIS SUDAH TERMASUK AKUN PREMIUM (Unlock semua fitur)',
      'Unlimited revisi esai & portofolio sampai 100% yakin',
      'Bimbingan fleksibel via chat WhatsApp, Zoom, dan offline',
      'WAJIB: Dokumen Analisis Rasionalisasi Pilihan 1 & 2 dari mentor (berdasar rapor, sertifikat, & esai)',
      'Simulasi wawancara dan uji kesiapan mental',
      'Akses Grup WhatsApp Eksklusif (Mentor + Admin + Mentee)',
      'Exclusive Trip Campus Tour ke Universitas Indonesia (UI)',
      'Garansi pergantian mentor gratis bila kurang cocok',
    ],
    ctaText: 'Ambil Bimbingan Queen Bee',
  },
]

const COMPARISON_ROWS = [
  { feature: 'Kalkulator Peluang Kelulusan', free: '1x / bulan', premium: 'Unlimited', nectar: 'Unlimited', honey: 'Unlimited', queen: 'Unlimited' },
  { feature: 'Tanya Jawab Chat Otbee AI', free: '3x / hari', premium: 'Unlimited', nectar: 'Unlimited', honey: 'Unlimited', queen: 'Unlimited' },
  { feature: 'Essay AI Review Mendalam', free: '1x / bulan', premium: 'Unlimited', nectar: 'Unlimited', honey: 'Unlimited', queen: 'Unlimited' },
  { feature: 'Buat & Kelola Circle Komunitas', free: 'Hanya Join', premium: 'Bebas Buat', nectar: 'Bebas Buat', honey: 'Bebas Buat', queen: 'Bebas Buat' },
  { feature: 'Modul & Video E-Course', free: 'Preview Saja', premium: 'Unlock 100%', nectar: 'Unlock 100%', honey: 'Unlock 100%', queen: 'Unlock 100%' },
  { feature: 'Fitur Atur Strategi Kelulusan', free: 'Terkunci', premium: 'Akses Penuh', nectar: 'Akses Penuh', honey: 'Akses Penuh', queen: 'Akses Penuh' },
  { feature: 'Pendampingan Mentor Alumni', free: '-', premium: '- (Self-Paced)', nectar: '2x Revisi WA', honey: '5x Revisi + 2x Zoom', queen: 'Unlimited + Meet' },
  { feature: 'Grup WhatsApp Khusus (Mentor + Admin + Mentee)', free: '-', premium: '-', nectar: '-', honey: 'Tersedia', queen: 'Tersedia (Prioritas)' },
  { feature: 'Dokumen Analisis Saran Pilihan 1 & 2 (Rapor & Sertif)', free: '-', premium: '-', nectar: '-', honey: '-', queen: 'Wajib dari Mentor' },
  { feature: 'Exclusive Trip Campus Tour ke UI', free: '-', premium: '-', nectar: '-', honey: '-', queen: 'Termasuk Tiket' },
]

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState<TierPlan | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserInfo({
          name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? 'Pengguna',
          email: user.email ?? '',
        })
      }
    })
  }, [])

  async function handleCheckout() {
    if (!selectedPlan) return
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedPlan.backendKey, payment_method: 'mayar' }),
      })
      const data = await res.json()
      if (res.status === 401) {
        window.location.href = `/login?redirect=/upgrade`
        return
      }
      if (!res.ok) {
        setError(data.error ?? 'Gagal memproses. Coba lagi.')
        return
      }
      if (data.payment_url) {
        window.location.href = data.payment_url
      }
    } catch {
      setError('Koneksi gagal. Periksa internet dan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfcfb] pt-24 md:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
            Pilih Paket Persiapan yang Pas untuk Kelulusanmu
          </h1>
          <p className="text-sm sm:text-base font-medium text-gray-500 leading-relaxed">
            Mulai dari akses mandiri semua fitur platform cerdas hingga pendampingan eksklusif 1-on-1 bersama alumni UI, ITB & UGM berprestasi di bawah naungan resmi <strong>{LEGAL_ENTITY.name}</strong>.
          </p>
        </div>

        {/* Important Alert Notice */}
        <div className="max-w-4xl mx-auto mb-12 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-900 font-medium">
          <strong className="font-extrabold text-amber-950">Catatan Penting:</strong> Seluruh paket bimbingan mentor (<span className="font-bold underline">Nectar</span>, <span className="font-bold underline">Honeycomb</span>, dan <span className="font-bold underline">Queen Bee</span>) <strong className="font-extrabold text-amber-950">SUDAH OTOMATIS TERMASUK AKUN PREMIUM</strong> dengan seluruh fitur platform terbuka tanpa batasan!
        </div>

        {/* Pricing Cards Grid (4 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 flex flex-col justify-between transition-all bg-white ${
                plan.popular
                  ? 'shadow-2xl ring-2 ring-amber-400 relative -translate-y-1.5'
                  : 'shadow-md hover-lift border border-gray-100'
              }`}
            >
              <div>
                {plan.badge ? (
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-gray-950 mb-3 shadow-xs">
                    <Star size={11} className="fill-gray-950" /> {plan.badge}
                  </div>
                ) : (
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full mb-3 inline-block">
                    {plan.subtitle}
                  </div>
                )}
                <h3 className="text-xl font-extrabold text-gray-900 mb-0.5">{plan.name}</h3>
                <p className="text-[11px] text-gray-500 font-medium mb-5 min-h-[36px] leading-relaxed">
                  {plan.tagline}
                </p>

                <div className="mb-5 pb-5 border-b border-gray-100">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold ml-1">/{plan.period}</span>
                </div>

                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-gray-700 leading-snug">
                      <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={11} className="stroke-[3]" />
                      </div>
                      <span className={feat.includes('OTOMATIS') ? 'text-amber-800 font-extrabold' : ''}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  setSelectedPlan(plan)
                  setError('')
                }}
                className={`w-full py-3.5 rounded-full text-xs font-extrabold transition-all shadow-md ${
                  plan.popular ? 'btn-brand-primary' : 'bg-gray-900 text-white hover:bg-black'
                }`}
              >
                {plan.ctaText}
              </button>
            </div>
          ))}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="p-7 rounded-3xl bg-white shadow-md mb-16 overflow-hidden border border-gray-100">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-gray-900 mb-1">Perbandingan Lengkap: Akun Free vs Premium vs Paket Mentor</h2>
            <p className="text-xs text-gray-500">Ketahui secara transparan batasan fitur pada akun gratis dibandingkan opsi berbayar.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="py-3 px-3 font-black text-gray-900">Fitur & Layanan</th>
                  <th className="py-3 px-3 font-bold text-center">Akun Free</th>
                  <th className="py-3 px-3 font-bold text-amber-700 text-center bg-amber-50/30">Akun Premium</th>
                  <th className="py-3 px-3 font-bold text-gray-800 text-center">Nectar</th>
                  <th className="py-3 px-3 font-bold text-amber-800 text-center">Honeycomb</th>
                  <th className="py-3 px-3 font-black text-amber-950 text-center bg-amber-100/40 rounded-t-xl">
                    Queen Bee (VIP)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="py-3 px-3 font-semibold text-gray-800">{row.feature}</td>
                    <td className="py-3 px-3 text-center text-gray-500 text-[11px] font-medium">
                      {row.free}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-700 bg-amber-50/30 text-[11px]">
                      {row.premium}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-800 text-[11px] font-semibold">
                      {row.nectar}
                    </td>
                    <td className="py-3 px-3 text-center text-amber-800 text-[11px] font-bold">
                      {row.honey}
                    </td>
                    <td className="py-3 px-3 text-center font-black text-amber-950 bg-amber-100/40 text-[11px]">
                      {row.queen}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              name: 'Siti Sarah',
              univ: 'Lolos Kedokteran UI (PPKB)',
              quote: 'Mentor bener-bener teliti bedah essay motivasiku. Dokumen analisis pilihan 1 & 2 bikin aku mantap memilih prodi.',
            },
            {
              name: 'Rian Pratama',
              univ: 'Lolos STEI ITB (SSU Rapor)',
              quote: 'Simulasi wawancara dan validasi dokumennya ngebantu banget. Aku jadi pede pas submit berkas resmi.',
            },
            {
              name: 'Nathania Aurelia',
              univ: 'Lolos SBM ITB (SNBP)',
              quote: 'Penyusunan portofolio kepemimpinan terarah banget berkat bimbingan intensif Honeycomb.',
            },
          ].map((t, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-white shadow-md flex flex-col justify-between border border-gray-100">
              <p className="text-xs font-medium text-gray-700 leading-relaxed mb-4 italic">
                “{t.quote}”
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center flex-shrink-0">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900">{t.name}</h4>
                  <p className="text-[11px] font-semibold text-emerald-600">{t.univ}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legal Footer Info */}
        <div className="p-6 rounded-2xl bg-gray-50 text-center text-xs text-gray-400 space-y-1">
          <p>© {new Date().getFullYear()} <strong>{LEGAL_ENTITY.brand}</strong> - Dikelola oleh <strong>{LEGAL_ENTITY.name}</strong>.</p>
          <p>Seluruh transaksi pembayaran diproses aman dengan verifikasi otomatis & jaminan uang kembali sesuai ketentuan akademik.</p>
        </div>
      </div>

      {/* Checkout Modal - Detail Konfirmasi */}
      {selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          onClick={e => { if (e.target === e.currentTarget) { setSelectedPlan(null); setError('') } }}
        >
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Konfirmasi Pembelian
                </span>
                <h3 className="text-lg font-extrabold text-gray-900">{selectedPlan.name}</h3>
                <p className="text-xs text-gray-400 font-semibold">{selectedPlan.subtitle}</p>
              </div>
              <button
                onClick={() => { setSelectedPlan(null); setError('') }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 flex-shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

              {/* User info */}
              {userInfo && (
                <div className="rounded-2xl bg-gray-50 p-4 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Data Pemesan</p>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <User size={13} className="text-gray-400 flex-shrink-0" />
                    <span className="font-semibold">{userInfo.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <Mail size={13} className="text-gray-400 flex-shrink-0" />
                    <span className="font-semibold">{userInfo.email}</span>
                  </div>
                </div>
              )}

              {/* Package details */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 mb-3">Paket yang Dibeli</p>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">{selectedPlan.name}</p>
                    <p className="text-[11px] text-gray-500 font-medium">{selectedPlan.tagline}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-lg font-black text-amber-700">{selectedPlan.price}</p>
                    <p className="text-[10px] text-gray-400">/{selectedPlan.period}</p>
                  </div>
                </div>

                {/* Benefits list */}
                <div className="space-y-1.5 pt-3 border-t border-amber-200">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">Yang Kamu Dapatkan:</p>
                  {selectedPlan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={9} className="text-white stroke-[3]" />
                      </div>
                      <span className={feat.includes('OTOMATIS') ? 'font-extrabold text-amber-800' : 'font-medium'}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">Rincian Pembayaran</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>{selectedPlan.name}</span>
                    <span className="font-bold text-gray-900">{selectedPlan.price}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Biaya gateway pembayaran</span>
                    <span className="font-semibold">Ditambahkan saat checkout</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-gray-900 pt-2 border-t border-gray-200 text-sm">
                    <span>Total yang dibayar</span>
                    <span className="text-amber-700">{selectedPlan.price} + fee</span>
                  </div>
                </div>
              </div>

              {/* Payment methods */}
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">Metode Pembayaran</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Building2, label: 'Virtual Account', sub: 'BCA, Mandiri, BNI, BRI, BSI' },
                    { icon: QrCode, label: 'QRIS', sub: 'Semua aplikasi e-wallet' },
                    { icon: Smartphone, label: 'E-Wallet', sub: 'GoPay, OVO, Dana, ShopeePay' },
                    { icon: CreditCard, label: 'Kartu Kredit', sub: 'Visa, Mastercard' },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-100">
                      <Icon size={14} className="text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-gray-800">{label}</p>
                        <p className="text-[10px] text-gray-400">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
              {error && (
                <div className="mb-3 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                  {error}
                </div>
              )}
              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full text-sm font-extrabold btn-brand-primary disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><Loader2 size={15} className="animate-spin" /> Memproses...</>
                ) : (
                  <>Bayar & Aktifkan {selectedPlan.name} →</>
                )}
              </button>
              <p className="text-center text-[11px] text-gray-400 mt-2.5">
                <ShieldCheck size={11} className="inline mr-1 mb-0.5" />
                Aman via Mayar · Akun aktif otomatis setelah bayar · {LEGAL_ENTITY.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
