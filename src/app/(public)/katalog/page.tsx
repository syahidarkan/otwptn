'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Sparkles,
  Check,
  Star,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Award,
  Users,
  Compass,
} from 'lucide-react'
import { LEGAL_ENTITY } from '@/lib/constants'

interface ProductItem {
  id: string
  name: string
  subtitle: string
  price: string
  priceNum: number
  badge?: string
  popular?: boolean
  image: string
  category: 'mentor' | 'ai'
  description: string
  deliverables: string[]
}

const PRODUCTS: ProductItem[] = [
  {
    id: 'premium',
    name: 'Akun Premium Platform',
    subtitle: 'Fitur Cerdas AI & Seluruh Materi E-Course',
    price: 'Rp 49.000',
    priceNum: 49000,
    category: 'ai',
    image: '/mascot-hd/maskot-upgrade-bintang-emas.png',
    description: 'Akses tanpa batas ke seluruh ekosistem cerdas otwptn secara mandiri untuk persiapan seleksi PTN non-tes.',
    deliverables: [
      'Kalkulator Peluang Kelulusan 5 Semester Rapor Unlimited',
      'Tanya Jawab AI Otbee 24/7 Tanpa Batas',
      'AI Essay Reviewer Analisis Kalimat per Kalimat',
      'Buka 100% Seluruh Modul & Video E-Course SNBP/PPKB/SSU',
      'Akses Fitur Atur Strategi Rasionalisasi Prodi',
      'Bebas Bergabung & Buat Circle Komunitas Belajar',
    ],
  },
  {
    id: 'nectar',
    name: 'Paket Nectar (Review Dokumen)',
    subtitle: 'Opsi Review · Termasuk Akun Premium',
    price: 'Rp 99.000',
    priceNum: 99000,
    category: 'mentor',
    image: '/mascot-hd/review-draft.png',
    description: 'Udah punya draft dokumen tapi masih ragu? Nectar poles dokumen dan esaimu bersama mentor alumni agar bebas dari blind spot.',
    deliverables: [
      'OTOMATIS SUDAH TERMASUK AKUN PREMIUM (Unlock Semua Fitur)',
      'Free Konsultasi Awal Perkenalan Dokumen & Target PTN',
      'Pemeriksaan Kelengkapan & Validasi Berkas Persyaratan',
      'Koreksi Esai Mendalam di Collaborative Workspace',
      '2x Putaran Revisi Esai Bersama Mentor Alumni UI/ITB/UGM',
      'Pendampingan Komunikasi via Chat WhatsApp',
      'Review Feedback Selesai dalam Maksimal 24 Jam',
    ],
  },
  {
    id: 'honeycomb',
    name: 'Paket Honeycomb (Bimbingan Intensif)',
    subtitle: 'Opsi Reguler · Termasuk Akun Premium',
    price: 'Rp 199.000',
    priceNum: 199000,
    badge: 'Paling Diminati',
    popular: true,
    category: 'mentor',
    image: '/mascot-hd/trio-mentor.png',
    description: 'Kami bimbing kamu menyusun dokumen step-by-step dari kerangka ide hingga penentuan strategi jurusan yang rasional.',
    deliverables: [
      'OTOMATIS SUDAH TERMASUK AKUN PREMIUM (Unlock Semua Fitur)',
      'Free Konsultasi Awal & Panduan Kerangka Dokumen',
      'Bimbingan Step-by-Step Penyusunan Berkas & Portofolio',
      'Strategi Penentuan Prodi & Analisis Kuota Daya Tampung',
      '5x Putaran Revisi Esai Terarah Sampai Benar-Benar Solid',
      '2x Sesi Zoom Privat (45 Menit/Sesi) Tatap Muka 1-on-1',
      'Akses ke Grup WhatsApp Eksklusif (Mentor + Siswa)',
    ],
  },
  {
    id: 'queen-bee',
    name: 'Paket Queen Bee (VIP All-In)',
    subtitle: 'Royal Jelly VIP · Termasuk Akun Premium',
    price: 'Rp 399.000',
    priceNum: 399000,
    badge: 'VIP Eksklusif',
    category: 'mentor',
    image: '/mascot-hd/maskot-piala-toga-juara.png',
    description: 'Ratu lebah selalu diprioritaskan. Akses mentor alumni senior tanpa batas dan pendampingan paling eksklusif sampai hari pengumuman.',
    deliverables: [
      'OTOMATIS SUDAH TERMASUK AKUN PREMIUM (Unlock Semua Fitur)',
      'Akses Mentor Alumni Senior Prioritas Utama',
      'Revisi Esai & Berkas Portofolio Unlimited Tanpa Batas',
      'Sesi Konsultasi Zoom Tatap Muka Fleksibel Kapan Saja',
      'Bimbingan Wawancara Khusus (Mock Interview PPKB UI / SJP)',
      'Jaminan Pendampingan Intensif Sampai Hari Pengumuman Resmi',
      'Akses Prioritas Customer Care 24/7',
    ],
  },
]

export default function KatalogPage() {
  const [filter, setFilter] = useState<'all' | 'mentor' | 'ai'>('all')

  const filtered = PRODUCTS.filter(p => {
    if (filter === 'all') return true
    return p.category === filter
  })

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold mb-6 text-gray-500">
          <Link href="/" className="hover:text-amber-600 transition-colors">Beranda</Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">Katalog Layanan & Produk</span>
        </nav>

        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 mb-3 shadow-2xs">
            <Sparkles size={13} className="text-amber-600" /> Katalog Resmi Layanan OtwPTN 2026/2027
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-3">
            Pilih Paket Persiapan Masuk PTN Impianmu
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Daftar lengkap program bimbingan esai, validasi berkas portofolio, dan ekosistem AI terpadu oleh <strong>{LEGAL_ENTITY.name}</strong>. Seluruh transaksi diproses aman melalui Payment Gateway Midtrans.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-amber-400 text-gray-950 shadow-md font-extrabold'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Semua Program ({PRODUCTS.length})
          </button>
          <button
            onClick={() => setFilter('mentor')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filter === 'mentor'
                ? 'bg-amber-400 text-gray-950 shadow-md font-extrabold'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Bimbingan Mentor Alumni
          </button>
          <button
            onClick={() => setFilter('ai')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filter === 'ai'
                ? 'bg-amber-400 text-gray-950 shadow-md font-extrabold'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Akun Fitur AI Mandiri
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {filtered.map(item => (
            <div
              key={item.id}
              className={`rounded-3xl p-6 bg-white flex flex-col justify-between transition-all relative ${
                item.popular
                  ? 'shadow-xl ring-2 ring-amber-400 -translate-y-1'
                  : 'shadow-md border border-gray-100 hover:shadow-lg'
              }`}
            >
              <div>
                {/* Badge if any */}
                <div className="flex items-center justify-between mb-3 min-h-[24px]">
                  {item.badge ? (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-gray-950 shadow-xs">
                      <Star size={10} className="fill-gray-950" /> {item.badge}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {item.category === 'mentor' ? 'Mentoring 1-on-1' : 'Platform AI'}
                    </span>
                  )}
                </div>

                {/* Product Mascot Image */}
                <div className="w-24 h-24 mx-auto mb-4 relative flex items-center justify-center">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="object-contain drop-shadow-md"
                  />
                </div>

                {/* Name & Subtitle */}
                <h3 className="text-lg font-black text-gray-900 mb-1 leading-snug">
                  {item.name}
                </h3>
                <p className="text-[11px] text-gray-500 font-medium mb-4 min-h-[32px] leading-relaxed">
                  {item.subtitle}
                </p>

                {/* Price */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="text-2xl font-black text-gray-900">{item.price}</div>
                  <span className="text-[11px] text-emerald-600 font-semibold">Sekali bayar · Akses penuh</span>
                </div>

                {/* Deliverables snippet */}
                <ul className="space-y-2 mb-6">
                  {item.deliverables.slice(0, 4).map((d, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 leading-snug">
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={9} className="stroke-[3]" />
                      </div>
                      <span className={d.includes('OTOMATIS') ? 'font-bold text-amber-800' : ''}>
                        {d}
                      </span>
                    </li>
                  ))}
                  {item.deliverables.length > 4 && (
                    <li className="text-[11px] text-amber-700 font-bold pl-5">
                      + {item.deliverables.length - 4} benefit lainnya
                    </li>
                  )}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <Link
                  href={`/paket/${item.id}`}
                  className="w-full py-3 rounded-full text-xs font-extrabold text-center block bg-gray-900 text-white hover:bg-black transition-all shadow-sm"
                >
                  Lihat Detail Paket
                </Link>
                <Link
                  href={`/checkout?tier=${item.id}`}
                  className="w-full py-2.5 rounded-full text-xs font-bold text-center block bg-amber-50 text-amber-900 hover:bg-amber-100 transition-all border border-amber-200"
                >
                  Daftar Sekarang →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Security & Guarantee Info Banner for Midtrans Compliance */}
        <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/60 mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-gray-950 flex items-center justify-center flex-shrink-0 shadow-sm">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-gray-900">Jaminan Keamanan Transaksi & Lisensi Resmi</h4>
              <p className="text-xs text-gray-600">
                Semua pembayaran diproses melalui payment gateway berlisensi Bank Indonesia (Midtrans). Aktivasi otomatis dan instan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-700">
            <span>✓ QRIS Terverifikasi</span>
            <span>✓ Virtual Account Otomatis</span>
            <span>✓ Invoice Resmi</span>
          </div>
        </div>

        {/* Entity Footer */}
        <div className="text-center text-xs text-gray-400 pt-6 border-t border-gray-100">
          <p>© {new Date().getFullYear()} {LEGAL_ENTITY.brand} - Diselenggarakan resmi oleh <strong>{LEGAL_ENTITY.name}</strong>.</p>
          <p className="mt-1">Pusat Layanan: {LEGAL_ENTITY.email} | Kebijakan Privasi & Syarat Ketentuan Berlaku.</p>
        </div>
      </div>
    </div>
  )
}

