'use client'

import { useState, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Check,
  Star,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  Users,
  BookOpen,
  FileText,
  HelpCircle,
  Award,
  ChevronRight,
  ShoppingCart,
  X,
  Trash2,
  CheckCircle2,
} from 'lucide-react'
import { LEGAL_ENTITY } from '@/lib/constants'

interface ProductData {
  id: string
  name: string
  tagline: string
  price: string
  originalPrice: string
  priceNum: number
  badge: string
  image: string
  rating: number
  reviewCount: number
  category: string
  syllabus: { step: string; title: string; desc: string }[]
  deliverables: string[]
  mentorSpecs: string[]
}

const PRODUCTS_MAP: Record<string, ProductData> = {
  'premium': {
    id: 'premium',
    name: 'Akun Premium Platform Cerdas OtwPTN',
    tagline: 'Akses tanpa batas ke seluruh ekosistem AI dan modul pembelajaran video secara mandiri.',
    price: 'Rp 49.000',
    originalPrice: 'Rp 99.000',
    priceNum: 49000,
    badge: 'Akses Mandiri AI',
    image: '/mascot-hd/maskot-upgrade-bintang-emas.png',
    rating: 4.9,
    reviewCount: 342,
    category: 'Platform Digital & E-Course',
    syllabus: [
      { step: 'Tahap 1', title: 'Kalkulator Rasionalisasi 5 Semester', desc: 'Simulasi peluang kelulusan nilai rapor ke seluruh prodi PTN se-Indonesia dengan algoritma prediktif.' },
      { step: 'Tahap 2', title: 'AI Essay Reviewer Real-time', desc: 'Pemeriksaan tata bahasa, koherensi argumen, dan pembobotan poin motivasi esai secara instan.' },
      { step: 'Tahap 3', title: 'E-Course Video Modul Lengkap', desc: 'Akses 10 tahap materi video eksklusif bedah jalur SNBP, PPKB UI, SSU ITB, dan SJP IPB.' },
    ],
    deliverables: [
      'Kalkulator Peluang Kelulusan 5 Semester Rapor Tanpa Batas',
      'Tanya Jawab AI Otbee 24/7 Unlimited',
      'AI Essay Reviewer Analisis Kalimat per Kalimat',
      'Buka 100% Seluruh Modul & Video E-Course SNBP/PPKB/SSU',
      'Akses Fitur Atur Strategi Rasionalisasi Prodi',
      'Bebas Bergabung & Buat Circle Komunitas Belajar Siswa',
    ],
    mentorSpecs: [
      'Didukung database kelulusan 12.500+ pejuang PTN',
      'Akses langsung aktif setelah pembayaran terverifikasi Midtrans',
    ],
  },
  'nectar': {
    id: 'nectar',
    name: 'Paket Nectar: Review Dokumen & Esai PTN',
    tagline: 'Poles draft esai dan berkas pendaftaranmu bersama mentor alumni PTN terverifikasi agar bebas dari blind spot.',
    price: 'Rp 99.000',
    originalPrice: 'Rp 199.000',
    priceNum: 99000,
    badge: 'Termasuk Akun Premium',
    image: '/mascot-hd/review-draft.png',
    rating: 4.95,
    reviewCount: 518,
    category: 'Mentoring & Review Dokumen',
    syllabus: [
      { step: 'Tahap 1', title: 'Audit Awal & Validasi Berkas Persyaratan', desc: 'Pemeriksaan kesesuaian berkas identitas, rapor, sertifikat prestasi, dan format esai sesuai pedoman resmi PTN tujuan.' },
      { step: 'Tahap 2', title: 'Bedah Esai Motivasi & Personal Statement', desc: 'Koreksi terstruktur pada struktur pembuka, penjabaran visi akademik, dan korelasi prestasi siswa dengan program studi pilihan.' },
      { step: 'Tahap 3', title: '2x Putaran Revisi Mendalam', desc: 'Feedback tertulis detail baris demi baris via workspace kolaboratif dan chat WhatsApp pendampingan hingga draft siap diunggah.' },
    ],
    deliverables: [
      'OTOMATIS SUDAH TERMASUK AKUN PREMIUM (Unlock Semua Fitur)',
      'Free Konsultasi Awal Perkenalan Dokumen & Target PTN',
      'Pemeriksaan Kelengkapan & Validasi Berkas Persyaratan',
      'Koreksi Esai Mendalam di Collaborative Workspace',
      '2x Putaran Revisi Esai Bersama Mentor Alumni UI/ITB/UGM',
      'Pendampingan Komunikasi via Chat WhatsApp',
      'Review Feedback Selesai dalam Maksimal 24 Jam Kerja',
    ],
    mentorSpecs: [
      'Dibimbing alumni UI, ITB, dan UGM penerima beasiswa prestasi',
      'Review terverifikasi bebas plagiasi dan ramah sistem seleksi PTN',
      'Garansi pengerjaan cepat dan tepat waktu',
    ],
  },
  'honeycomb': {
    id: 'honeycomb',
    name: 'Paket Honeycomb: Bimbingan Intensif Reguler',
    tagline: 'Pendampingan terarah step-by-step penyusunan dokumen, esai, dan strategi jurusan bersama mentor alumni via Zoom.',
    price: 'Rp 199.000',
    originalPrice: 'Rp 399.000',
    priceNum: 199000,
    badge: 'Paling Diminati Siswa',
    image: '/mascot-hd/trio-mentor.png',
    rating: 5.0,
    reviewCount: 420,
    category: 'Mentoring Intensif 1-on-1',
    syllabus: [
      { step: 'Tahap 1', title: 'Sesi Zoom 1: Pemetaan Karakter & Ide Esai', desc: 'Sesi tatap muka 45 menit untuk menggali keunikan profil siswa, prestasi non-akademik, dan menentukan sudut pandang esai yang kuat.' },
      { step: 'Tahap 2', title: 'Penyusunan Berkas & Strategi Pilihan 1 dan 2', desc: 'Bimbingan rasionalisasi pilihan program studi berdasarkan kuota daya tampung dan rekam jejak sekolah.' },
      { step: 'Tahap 3', title: '5x Putaran Revisi Esai & Sesi Zoom 2', desc: 'Pemantapan esai akhir, evaluasi kelayakan dokumen, dan simulasi kesiapan submit berkas.' },
    ],
    deliverables: [
      'OTOMATIS SUDAH TERMASUK AKUN PREMIUM (Unlock Semua Fitur)',
      'Free Konsultasi Awal & Panduan Kerangka Dokumen',
      'Bimbingan Step-by-Step Penyusunan Berkas & Portofolio',
      'Strategi Penentuan Prodi & Analisis Kuota Daya Tampung',
      '5x Putaran Revisi Esai Terarah Sampai Benar-Benar Solid',
      '2x Sesi Zoom Privat (45 Menit/Sesi) Tatap Muka 1-on-1',
      'Akses ke Grup WhatsApp Eksklusif (Mentor + Siswa)',
    ],
    mentorSpecs: [
      '1 Mentor mendampingi maksimal 5 siswa agar fokus',
      'Jadwal fleksibel disesuaikan dengan waktu belajar siswa',
      'Dukungan penuh sampai berkas resmi disubmit',
    ],
  },
  'queen-bee': {
    id: 'queen-bee',
    name: 'Paket Queen Bee: VIP All-In & Prioritas Mentor',
    tagline: 'Layanan VIP terlengkap dengan pendampingan mentor alumni senior tanpa batas hingga hari pengumuman resmi.',
    price: 'Rp 399.000',
    originalPrice: 'Rp 799.000',
    priceNum: 399000,
    badge: 'VIP Eksklusif All-In',
    image: '/mascot-hd/maskot-piala-toga-juara.png',
    rating: 5.0,
    reviewCount: 189,
    category: 'VIP Mentoring Eksklusif',
    syllabus: [
      { step: 'Tahap 1', title: 'Comprehensive Diagnostic & Goal Setting', desc: 'Pemetaan menyeluruh profil siswa bersama Mentor Senior untuk menyusun strategi jangka panjang lolos PTN impian.' },
      { step: 'Tahap 2', title: 'Mentoring Dokumen & Esai Tanpa Batas', desc: 'Revisi esai dan berkas portofolio unlimited dengan sesi Zoom tatap muka yang bisa dijadwalkan kapan saja.' },
      { step: 'Tahap 3', title: 'Simulasi Wawancara (Mock Interview)', desc: 'Latihan wawancara tatap muka interaktif untuk jalur yang mensyaratkan tes wawancara (PPKB UI, SJP IPB, Mandiri Prestasi).' },
    ],
    deliverables: [
      'OTOMATIS SUDAH TERMASUK AKUN PREMIUM (Unlock Semua Fitur)',
      'Akses Mentor Alumni Senior Prioritas Utama',
      'Revisi Esai & Berkas Portofolio Unlimited Tanpa Batas',
      'Sesi Konsultasi Zoom Tatap Muka Fleksibel Kapan Saja',
      'Bimbingan Wawancara Khusus (Mock Interview PPKB UI / SJP)',
      'Jaminan Pendampingan Intensif Sampai Hari Pengumuman Resmi',
      'Akses Prioritas Customer Care 24/7',
    ],
    mentorSpecs: [
      'Dipandu langsung oleh alumni terbaik dan peraih beasiswa bergengsi',
      'Prioritas slot mentor tercepat dan tanggapan instan',
    ],
  },
}

export default function ProductDetailClient({ id = "nectar", initialCartOpen = false }: { id?: string; initialCartOpen?: boolean }) {
  const router = useRouter()

  const product = PRODUCTS_MAP[id] || PRODUCTS_MAP['nectar']
  const [selectedVariant, setSelectedVariant] = useState('PPKB UI')
  const [quantity, setQuantity] = useState(1)
  const [showCartModal, setShowCartModal] = useState(initialCartOpen)

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold mb-6 text-gray-500">
          <Link href="/" className="hover:text-amber-600 transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/katalog" className="hover:text-amber-600 transition-colors">Katalog Layanan</Link>
          <span>/</span>
          <span className="text-gray-900 font-bold truncate">{product.name}</span>
        </nav>

        {/* Main Product Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Column: Product Image & Highlights (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="rounded-3xl p-8 bg-white border border-gray-100 shadow-md flex flex-col items-center justify-center text-center relative overflow-hidden">
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-gray-950 shadow-xs">
                {product.badge}
              </span>
              <div className="w-48 h-48 relative my-4 flex items-center justify-center">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={192}
                  height={192}
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
              <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs font-bold text-gray-700 ml-1.5">
                  {product.rating} ({product.reviewCount} siswa terbantu)
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">Kategori: {product.category}</p>
            </div>

            {/* Mentor & Security Highlights */}
            <div className="rounded-2xl p-5 bg-amber-50/70 border border-amber-200/50 space-y-2.5">
              <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">Spesifikasi Layanan:</h4>
              <ul className="space-y-1.5">
                {product.mentorSpecs.map((spec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-amber-900 font-medium">
                    <Check size={13} className="text-amber-600 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Pricing & Purchase Card (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="rounded-3xl p-6 sm:p-8 bg-white border border-gray-100 shadow-md">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full mb-3 inline-block">
                Program Resmi Angkatan 2026/2027
              </span>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 leading-tight">
                {product.name}
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 font-medium mb-6 leading-relaxed">
                {product.tagline}
              </p>

              {/* Price Tag with Promo */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-6 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 line-through mr-2 font-medium">
                    {product.originalPrice}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-gray-900">
                    {product.price}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 block mt-0.5">
                    ✓ Sekali Bayar · Tanpa Biaya Tersembunyi
                  </span>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700">
                    Hemat 50%
                  </span>
                </div>
              </div>

              {/* Options & Variants Selector */}
              <div className="space-y-4 mb-6 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">Pilihan Target Seleksi / Varian Jalur:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['PPKB UI', 'SNBP 2026', 'SSU ITB'].map(variant => (
                      <button
                        key={variant}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                          selectedVariant === variant
                            ? 'border-amber-400 bg-amber-50 text-gray-950 shadow-xs'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                    <span className="text-gray-400 block font-medium">Jumlah Pesanan:</span>
                    <span className="font-extrabold text-gray-900">{quantity} Paket Peserta</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                    <span className="text-gray-400 block font-medium">Masa Pendampingan:</span>
                    <span className="font-extrabold text-gray-900">Sampai Pengumuman</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Add to Cart & Proceed to Checkout */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => setShowCartModal(true)}
                  className="w-full py-4 rounded-full text-sm font-black text-center flex items-center justify-center gap-2 bg-amber-400 text-gray-950 hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/30 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <ShoppingCart size={18} />
                  Add to Shopping Cart (Tambah ke Pesanan)
                </button>

                <Link
                  href={`/checkout?tier=${product.id}`}
                  className="w-full py-3.5 rounded-full text-xs font-extrabold text-center block bg-gray-900 text-white hover:bg-black transition-all shadow-sm"
                >
                  Proceed to Checkout (Beli Sekarang) →
                </Link>

                <p className="text-center text-[11px] text-gray-500 font-medium">
                  🔒 Pembayaran instan aman dan terenkripsi melalui <strong>Midtrans Payment Gateway</strong>
                </p>
              </div>

              {/* Key Deliverables Checkpoints */}
              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-xs font-extrabold text-gray-900 mb-3 uppercase tracking-wider">
                  Benefit & Fasilitas yang Kamu Dapatkan:
                </h4>
                <ul className="space-y-2.5">
                  {product.deliverables.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-700">
                      <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={11} className="stroke-[3]" />
                      </div>
                      <span className={item.includes('OTOMATIS') ? 'font-black text-amber-900' : 'font-medium'}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Syllabus / Curriculum Accordion Section */}
        <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-md mb-12">
          <div className="max-w-2xl mb-6">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full mb-2 inline-block">
              Alur Pelaksanaan Bimbingan
            </span>
            <h3 className="text-xl font-black text-gray-900">
              Silabus & Tahapan Pengerjaan Dokumen
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Setiap proses dipandu secara terstruktur agar dokumenmu memenuhi standar penilaian seleksi PTN non-tes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {product.syllabus.map((item, index) => (
              <div key={index} className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider mb-2 block">
                    {item.step}
                  </span>
                  <h4 className="text-sm font-extrabold text-gray-900 mb-1.5">{item.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legal & Compliance Notice */}
        <div className="p-6 rounded-2xl bg-gray-50 text-center text-xs text-gray-400 space-y-1">
          <p>© {new Date().getFullYear()} {LEGAL_ENTITY.brand} - Diselenggarakan oleh <strong>{LEGAL_ENTITY.name}</strong>.</p>
          <p>
            Metode pembayaran terverifikasi otomatis: BCA VA, Mandiri VA, BNI VA, BRI VA, Permata VA, QRIS, GoPay, dan Kartu Kredit.
          </p>
        </div>

        {/* SHOPPING CART DRAWER / MODAL (MATCHING REFERENCE PDF PAGE 3, STEP 6) */}
        {showCartModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl relative border border-gray-100">
              <button
                type="button"
                onClick={() => setShowCartModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>

              <button
                type="button"
                onClick={() => setShowCartModal(false)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 mb-4 inline-flex items-center gap-1"
              >
                ← Continue shopping
              </button>

              <h2 className="text-xl font-black text-gray-900 mb-1">Shopping cart</h2>
              <p className="text-xs text-gray-400 mb-4">1 item</p>

              {/* Success Notification Banner */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold mb-5 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>1 product has been added to the shopping cart.</span>
              </div>

              {/* Cart Item Row */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3.5 mb-5">
                <div className="w-14 h-14 rounded-xl bg-white p-1 border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-gray-900 truncate">1x {product.name}</h4>
                  <p className="text-[11px] text-gray-500">Varian: {selectedVariant}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-gray-900">{product.price}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">{product.price}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping costs (Digital Delivery)</span>
                  <span className="font-bold text-emerald-600">IDR 0</span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                  <span className="font-black text-gray-900">Total Tagihan</span>
                  <span className="text-lg font-black text-amber-600">{product.price}</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <div className="space-y-2.5">
                <Link
                  href={`/checkout?tier=${product.id}`}
                  className="w-full py-4 rounded-full text-xs font-black text-center block bg-amber-400 text-gray-950 hover:bg-amber-300 transition-all shadow-md"
                >
                  Proceed To Checkout
                </Link>
                <button
                  type="button"
                  onClick={() => setShowCartModal(false)}
                  className="w-full py-2.5 rounded-full text-xs font-bold text-center block text-gray-500 hover:text-gray-800"
                >
                  Go To Shopping Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

