'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Check,
  Sparkles,
  ShieldCheck,
  Star,
  ArrowRight,
  HelpCircle,
  QrCode,
  CreditCard,
  X,
  CheckCircle2,
  Lock,
  Crown,
  Compass,
} from 'lucide-react'
import { LEGAL_ENTITY } from '@/lib/constants'

interface TierPlan {
  id: string
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
  { feature: 'Pendampingan Mentor Alumni', free: '—', premium: '— (Self-Paced)', nectar: '2x Revisi WA', honey: '5x Revisi + 2x Zoom', queen: 'Unlimited + Meet' },
  { feature: 'Grup WhatsApp Khusus (Mentor + Admin + Mentee)', free: '—', premium: '—', nectar: '—', honey: 'Tersedia', queen: 'Tersedia (Prioritas)' },
  { feature: 'Dokumen Analisis Saran Pilihan 1 & 2 (Rapor & Sertif)', free: '—', premium: '—', nectar: '—', honey: '—', queen: 'Wajib dari Mentor' },
  { feature: 'Exclusive Trip Campus Tour ke UI', free: '—', premium: '—', nectar: '—', honey: '—', queen: 'Termasuk Tiket' },
]

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState<TierPlan | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'transfer'>('qris')
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)

  function handleCompletePayment(e: React.FormEvent) {
    e.preventDefault()
    setCheckoutSuccess(true)
  }

  return (
    <div className="min-h-screen bg-[#fcfcfb] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation & Legal Entity Logo */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="otwptn" style={{ height: 32, width: 'auto' }} />
            <span className="hidden sm:inline-block text-xs font-semibold text-gray-400 border-l border-gray-200 pl-3">
              Divisi Konsultasi Akademik · {LEGAL_ENTITY.name}
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-full text-xs font-bold bg-white text-gray-700 shadow-xs hover:bg-gray-50 border border-gray-100"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 mb-4 shadow-2xs">
            <Sparkles size={13} className="text-amber-600" /> Investasi Lolos PTN Non-Tes 2026/2027
          </span>
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
                  setCheckoutSuccess(false)
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
          <p>© {new Date().getFullYear()} <strong>{LEGAL_ENTITY.brand}</strong> — Dikelola oleh <strong>{LEGAL_ENTITY.name}</strong>.</p>
          <p>Seluruh transaksi pembayaran diproses aman dengan verifikasi otomatis & jaminan uang kembali sesuai ketentuan akademik.</p>
        </div>
      </div>

      {/* Checkout Drawer / Modal */}
      {selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl relative">
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X size={16} />
            </button>

            {checkoutSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">Pendaftaran Berhasil!</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-6">
                  Akunmu telah resmi ditingkatkan ke <strong>{selectedPlan.name}</strong> di bawah naungan <strong>{LEGAL_ENTITY.name}</strong>.{' '}
                  {selectedPlan.mentorIncluded
                    ? 'Mentor alumni berprestasi segera ditugaskan ke akunmu dalam 1x24 jam.'
                    : 'Seluruh fitur cerdas platform sekarang terbuka penuh tanpa batas.'}
                </p>
                <Link
                  href="/dashboard"
                  className="btn-brand-primary px-8 py-3 text-xs font-extrabold inline-block"
                >
                  Masuk ke Dashboard Sekarang
                </Link>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full mb-2 inline-block">
                  Konfirmasi Pembayaran Resmi
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 mb-0.5">{selectedPlan.name}</h3>
                <p className="text-xs text-gray-400 font-semibold mb-3">{selectedPlan.subtitle}</p>
                <p className="text-2xl font-black text-gray-900 mb-4">{selectedPlan.price}</p>

                {/* Payment Selector */}
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'qris'
                        ? 'bg-amber-100/70 ring-2 ring-amber-400'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <QrCode size={20} className="text-gray-800" />
                    <span className="text-xs font-bold text-gray-900">QRIS Instan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'transfer'
                        ? 'bg-amber-100/70 ring-2 ring-amber-400'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <CreditCard size={20} className="text-gray-800" />
                    <span className="text-xs font-bold text-gray-900">Bank Transfer</span>
                  </button>
                </div>

                {paymentMethod === 'qris' ? (
                  <div className="p-4 rounded-2xl bg-gray-50 text-center mb-5">
                    <div className="w-36 h-36 bg-white mx-auto rounded-xl p-2 shadow-xs mb-2 flex items-center justify-center border border-gray-100">
                      <QrCode size={120} className="text-gray-900" />
                    </div>
                    <p className="text-[11px] font-bold text-gray-700">Scan via GoPay, OVO, BCA, DANA, dll.</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-gray-50 mb-5 space-y-1.5 text-xs">
                    <p className="text-gray-500 font-medium">Bank Tujuan Rekening PT:</p>
                    <p className="font-extrabold text-gray-900">Bank Mandiri / BSI Syariah</p>
                    <p className="text-gray-500 font-medium mt-2">Nomor Rekening:</p>
                    <p className="font-mono font-black text-amber-700 text-sm">1370019283741</p>
                    <p className="text-gray-500 font-medium">Atas Nama: <span className="font-bold text-gray-900">{LEGAL_ENTITY.name}</span></p>
                  </div>
                )}

                <button
                  onClick={handleCompletePayment}
                  className="w-full py-3.5 rounded-full text-xs font-extrabold btn-brand-primary"
                >
                  Konfirmasi Selesaikan Pembayaran
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
