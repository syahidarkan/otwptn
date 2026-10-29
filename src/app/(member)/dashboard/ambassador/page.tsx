'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Copy,
  Check,
  Download,
  Share2,
  Play,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Wallet,
  X,
  Sparkles,
  Tag,
  Video,
  FileText,
  TrendingUp,
  Users,
  Award,
  ArrowUpRight,
} from 'lucide-react'
import InteractiveFeatureDemoPlayer from '@/components/dashboard/InteractiveFeatureDemoPlayer'

export default function AmbassadorDashboardPage() {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCaptionId, setCopiedCaptionId] = useState<string | null>(null)
  const [promoFilter, setPromoFilter] = useState<'Semua' | 'Story' | 'Feed' | 'Landscape'>('Semua')
  const [katalogCategory, setKatalogCategory] = useState<'Semua' | 'Nectar' | 'Honeycomb' | 'Queen Bee' | 'Akun Premium'>('Semua')
  const [posterAspect, setPosterAspect] = useState<'Story 9:16' | 'Feed 4:5'>('Story 9:16')
  const [activeDemoVideo, setActiveDemoVideo] = useState<{ title: string; desc: string; duration: string; videoUrl: string; feature: string } | null>(null)

  // Monitoring Stats & Financials
  const [totalReferred] = useState(6)
  const [totalEarnings] = useState(450000)
  const [alreadyWithdrawn] = useState(100000)
  const activeBalance = totalEarnings - alreadyWithdrawn // Rp 350.000

  // Withdrawal Modal State
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState(String(activeBalance))
  const [bankTarget, setBankTarget] = useState('BCA')
  const [accountNumber, setAccountNumber] = useState('8720192831')
  const [accountHolder, setAccountHolder] = useState('ACAN')
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)

  // Referral code format [NAMA]OTW[ANGKA] -> ACANOTW01
  const referralCode = 'ACANOTW01'
  const referralUrl = `https://otwptn.id/r/${referralCode}`

  function handleCopyCode() {
    navigator.clipboard.writeText(referralCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(referralUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  function handleCopyCaption(id: string, text: string) {
    navigator.clipboard.writeText(text)
    setCopiedCaptionId(id)
    setTimeout(() => setCopiedCaptionId(null), 2000)
  }

  function handleDownloadPoster() {
    const link = document.createElement('a')
    link.href = '/mascot/check-paper-happy.png'
    link.download = `katalog-harga-${katalogCategory.toLowerCase()}-${referralCode}.png`
    link.click()
  }

  function handleWithdrawSubmit(e: React.FormEvent) {
    e.preventDefault()
    setWithdrawSuccess(true)
    setTimeout(() => {
      setWithdrawSuccess(false)
      setWithdrawModalOpen(false)
    }, 2000)
  }

  // Screen Record Demos per Feature of otwptn (12 Individual Lightweight 60FPS Video Recordings)
  const screenRecordDemos = [
    {
      id: 'demo-kalkulator',
      slug: 'kalkulator-peluang',
      title: 'Demo: Kalkulator Peluang SNBP (Rasionalisasi AI)',
      feature: 'Kalkulator Peluang',
      category: 'Story',
      duration: '00:15',
      videoUrl: '/promo-demos/kalkulator-peluang.webp',
      previewImg: '/promo-demos/kalkulator-peluang.png',
      desc: 'Screen recording simulasi rasionalisasi nilai rapor 5 semester, perhitungan peluang lolos prodi impian secara real-time.',
      caption: `Mau tahu peluang lolos SNBP kamu di UI, ITB, atau UGM? Tonton demo live kalkulator AI otwptn ini! Cek sekarang pakai kode "${referralCode}" di ${referralUrl}`,
    },
    {
      id: 'demo-essay',
      slug: 'essay-ai-review',
      title: 'Demo: AI Essay Reviewer (Anotasi Real-Time & Export)',
      feature: 'Essay AI Review',
      category: 'Landscape',
      duration: '00:18',
      videoUrl: '/promo-demos/essay-ai-review.webp',
      previewImg: '/promo-demos/essay-ai-review.png',
      desc: 'Screen recording editor esai mirip Google Docs dengan review AI 4 dimensi, deteksi kalimat klise, dan export PDF/Word.',
      caption: `Tulis esai motivasi & prestasi anti-klise bareng AI Reviewer otwptn! Dapatkan feedback instan dengan kode "${referralCode}" di ${referralUrl}`,
    },
    {
      id: 'demo-otbee',
      slug: 'otbee-ai',
      title: 'Demo: Otbee AI Chatbot (Konsultasi Jalur & Portofolio)',
      feature: 'Otbee AI',
      category: 'Story',
      duration: '00:14',
      videoUrl: '/promo-demos/otbee-ai.webp',
      previewImg: '/promo-demos/otbee-ai.png',
      desc: 'Screen recording tanya-jawab interaktif dengan Otbee AI seputar strategi prodi, audit rapor, dan tips lolos seleksi PTN.',
      caption: `Asisten AI pintar 24/7 khusus pejuang PTN non-tes! Tanya apa saja ke Otbee AI di otwptn dengan kode "${referralCode}": ${referralUrl}`,
    },
    {
      id: 'demo-strategi',
      slug: 'atur-strategi',
      title: 'Demo: Atur Strategi Pemilihan Prodi & Prioritas',
      feature: 'Atur Strategi',
      category: 'Landscape',
      duration: '00:16',
      videoUrl: '/promo-demos/atur-strategi.webp',
      previewImg: '/promo-demos/atur-strategi.png',
      desc: 'Screen recording penyusunan strategi prioritas jurusan SNBP, analisis passing grade dan pemetaan saingan sekolah.',
      caption: `Jangan asal pilih jurusan! Susun strategi SNBP & seleksi mandiri berbasis data di otwptn. Kode referral: "${referralCode}" ➔ ${referralUrl}`,
    },
    {
      id: 'demo-ecourse',
      slug: 'modul-video',
      title: 'Demo: Modul & Video E-Course (Skill Path Belajar)',
      feature: 'Modul & Video',
      category: 'Feed',
      duration: '00:15',
      videoUrl: '/promo-demos/modul-video.webp',
      previewImg: '/promo-demos/modul-video.png',
      desc: 'Screen recording materi kurikulum lengkap persiapan PTN, video penjelasan langkah demi langkah, dan rangkuman PDF.',
      caption: `Belajar terstruktur dari dasar sampai mahir dengan E-Course interaktif otwptn. Akses modulnya pakai kode "${referralCode}": ${referralUrl}`,
    },
    {
      id: 'demo-tracking',
      slug: 'tracking-jalur',
      title: 'Demo: Tracking Jalur & Timeline Seleksi 15+ PTN',
      feature: 'Tracking Jalur',
      category: 'Feed',
      duration: '00:16',
      videoUrl: '/promo-demos/tracking-jalur.webp',
      previewImg: '/promo-demos/tracking-jalur.png',
      desc: 'Screen recording pemantauan jadwal buka-tutup pendaftaran jalur non-tes, tahapan berkas, dan notifikasi deadline.',
      caption: `Gak bakal ketinggalan deadline jalur masuk PTN lagi! Pantau timeline seleksi di otwptn pakai kode "${referralCode}": ${referralUrl}`,
    },
    {
      id: 'demo-dokumen',
      slug: 'penyimpanan-dokumen',
      title: 'Demo: Penyimpanan Dokumen & Cloud Checklist',
      feature: 'Penyimpanan Dokumen',
      category: 'Feed',
      duration: '00:12',
      videoUrl: '/promo-demos/penyimpanan-dokumen.webp',
      previewImg: '/promo-demos/penyimpanan-dokumen.png',
      desc: 'Screen recording checklist berkas persyaratan (rapor, piagam prestasi, sertifikat) tersimpan rapi dan aman di cloud.',
      caption: `Simpan dan rapikan semua dokumen pendaftaran PTN kamu di satu tempat aman! Cek otwptn dengan kode "${referralCode}": ${referralUrl}`,
    },
    {
      id: 'demo-teman',
      slug: 'cari-teman-belajar',
      title: 'Demo: Cari Teman Belajar (Omegle Study Buddy)',
      feature: 'Cari Teman Belajar',
      category: 'Landscape',
      duration: '00:15',
      videoUrl: '/promo-demos/cari-teman-belajar.webp',
      previewImg: '/promo-demos/cari-teman-belajar.png',
      desc: 'Screen recording matching sesama pejuang PTN berdasarkan target kampus & jurusan, dilengkapi Pomodoro timer.',
      caption: `Belajar bareng teman se-Indonesia yang punya target kampus sama! Coba fitur Cari Teman Belajar di otwptn: ${referralUrl}`,
    },
    {
      id: 'demo-thread',
      slug: 'komunitas-thread',
      title: 'Demo: Komunitas Pejuang PTN (Feed Thread & Diskusi)',
      feature: 'Komunitas Thread',
      category: 'Feed',
      duration: '00:15',
      videoUrl: '/promo-demos/komunitas-thread.webp',
      previewImg: '/promo-demos/komunitas-thread.png',
      desc: 'Screen recording feed diskusi pejuang PTN, update info kuota, tanya jawab seputar seleksi, dan tips senior.',
      caption: `Gabung komunitas pejuang PTN paling aktif di Indonesia! Diskusi dan tanya tips di otwptn: ${referralUrl}`,
    },
    {
      id: 'demo-group',
      slug: 'komunitas-group',
      title: 'Demo: Komunitas Circle (Group Chat Dark Mode)',
      feature: 'Komunitas Group',
      category: 'Story',
      duration: '00:16',
      videoUrl: '/promo-demos/komunitas-group.webp',
      previewImg: '/promo-demos/komunitas-group.png',
      desc: 'Screen recording room group chat eksklusif per kampus (UI, ITB, UGM) dengan tampilan WhatsApp Web dark mode.',
      caption: `Masuk Circle kampus impianmu dan ngobrol langsung bareng calon maba lain di otwptn! Daftar di ${referralUrl}`,
    },
    {
      id: 'demo-mentor',
      slug: 'mentor-alumni',
      title: 'Demo: Mentor Alumni (1-on-1 Meet & VIP Docs Workspace)',
      feature: 'Mentor Alumni',
      category: 'Landscape',
      duration: '00:18',
      videoUrl: '/promo-demos/mentor-alumni.webp',
      previewImg: '/promo-demos/mentor-alumni.png',
      desc: 'Screen recording direktori mentor alumni resmi UI, ITB, UGM dan simulasi sesi bimbingan personal 1-on-1.',
      caption: `Dibimbing langsung sampai lolos oleh alumni UI, ITB, UGM! Booking mentor pilihanmu dengan kode "${referralCode}" di ${referralUrl}`,
    },
    {
      id: 'demo-ambassador',
      slug: 'student-ambassador',
      title: 'Demo: Student Ambassador (Komisi & Leaderboard)',
      feature: 'Student Ambassador',
      category: 'Story',
      duration: '00:14',
      videoUrl: '/promo-demos/student-ambassador.webp',
      previewImg: '/promo-demos/student-ambassador.png',
      desc: 'Screen recording dashboard ambassador, pelacakan komisi tunai instan, pencairan saldo, dan materi promosi.',
      caption: `Dapat penghasilan jutaan sambil bantu teman lolos PTN impian! Gabung Student Ambassador otwptn sekarang: ${referralUrl}`,
    },
  ]

  const filteredDemos =
    promoFilter === 'Semua'
      ? screenRecordDemos
      : screenRecordDemos.filter(d => d.category === promoFilter)

  // Pricing Catalog Config based on official packages: Nectar, Honeycomb, Queen Bee, and Akun Premium
  const getCatalogData = () => {
    const allItems = [
      {
        name: 'Akun Premium (Fitur Platform)',
        orig: 'Rp 99.000',
        flash: 'Rp 49.000 (flash)',
        codePrice: 'Rp 44.100',
        sub: 'Akses tanpa batas semua fitur platform cerdas (Kalkulator, Otbee, Essay AI, Circle, Modul 100%, Atur Strategi).',
        badge: 'Self-Paced',
      },
      {
        name: 'Paket Nectar (Opsi Review)',
        orig: 'Rp 199.000',
        flash: 'Rp 99.000 (flash)',
        codePrice: 'Rp 89.100',
        sub: 'Termasuk Akun Premium + Free konsultasi awal + Cek berkas + 2x putaran revisi esai via WhatsApp Chat.',
        badge: 'Review Dokumen',
      },
      {
        name: 'Paket Honeycomb (Opsi Reguler)',
        orig: 'Rp 399.000',
        flash: 'Rp 199.000 (flash)',
        codePrice: 'Rp 179.100',
        sub: 'Termasuk Akun Premium + Bimbingan step by step + 5x putaran revisi + 2x Sesi Zoom + Akses Grup WhatsApp Eksklusif.',
        badge: 'Reguler Populer',
      },
      {
        name: 'Paket Queen Bee (Royal Jelly VIP)',
        orig: 'Rp 799.000',
        flash: 'Rp 399.000 (flash)',
        codePrice: 'Rp 359.100',
        sub: 'Termasuk Akun Premium + Unlimited revisi esai + Meet fleksibel + Wajib Dokumen Analisis Pilihan 1 & 2 Mentor + Trip UI.',
        badge: 'Paling Direkomendasikan',
      },
    ]

    switch (katalogCategory) {
      case 'Nectar':
        return {
          title: 'Harga Paket Nectar (Review)',
          items: [
            allItems[1],
            { name: 'Nectar + Add-on Jalur 2', orig: 'Rp 249.000', flash: 'Rp 149.000 (flash)', codePrice: 'Rp 134.100', sub: 'Review 2 jalur pendaftaran sekaligus + Akun Premium' },
            { name: 'Nectar Bundle All-In', orig: 'Rp 349.000', flash: 'Rp 199.000 (flash)', codePrice: 'Rp 179.100', sub: 'Review esai + audit rapor 5 semester lengkap' },
          ],
        }
      case 'Honeycomb':
        return {
          title: 'Harga Paket Honeycomb (Reguler)',
          items: [
            allItems[2],
            { name: 'Honeycomb 2 Jalur PTN', orig: 'Rp 499.000', flash: 'Rp 249.000 (flash)', codePrice: 'Rp 224.100', sub: 'Bimbingan 2 jalur berbeda + 4x Sesi Zoom + Grup WA' },
            { name: 'Honeycomb Garansi Final', orig: 'Rp 699.000', flash: 'Rp 349.000 (flash)', codePrice: 'Rp 314.100', sub: 'Pendampingan sampai hari pengumuman kelulusan resmi' },
          ],
        }
      case 'Queen Bee':
        return {
          title: 'Harga Paket Queen Bee (Royal Jelly VIP)',
          items: [
            allItems[3],
            { name: 'Queen Bee Kedokteran Spesialis', orig: 'Rp 1.199.000', flash: 'Rp 599.000 (flash)', codePrice: 'Rp 539.100', sub: 'Mentor alumni FK UI / UGM + Bedah portofolio kesehatan' },
            { name: 'Queen Bee All PTN Ultimate', orig: 'Rp 1.599.000', flash: 'Rp 799.000 (flash)', codePrice: 'Rp 719.100', sub: 'Pendampingan 4 jalur PTN + Simulasi wawancara tatap muka' },
          ],
        }
      case 'Akun Premium':
        return {
          title: 'Harga Akun Premium (Fitur Only)',
          items: [
            allItems[0],
            { name: 'Premium Pass 6 Bulan', orig: 'Rp 149.000', flash: 'Rp 79.000 (flash)', codePrice: 'Rp 71.100', sub: 'Akses penuh kalkulator & AI selama persiapan 2 semester' },
            { name: 'Premium Lifetime Pass', orig: 'Rp 299.000', flash: 'Rp 129.000 (flash)', codePrice: 'Rp 116.100', sub: 'Akses selamanya ke semua fitur dan modul e-course' },
          ],
        }
      default:
        return {
          title: 'Daftar Harga Seluruh Paket Resmi',
          items: allItems,
        }
    }
  }

  const catalog = getCatalogData()

  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10 space-y-10 max-w-5xl mx-auto">
      {/* 1. HEADER & MONITORING OVERVIEW (BERSIH & ELEGAN) */}
      <div className="p-8 rounded-3xl bg-white shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-black mb-2">
              <Sparkles size={14} className="text-amber-600" /> Program Student Ambassador Resmi otwptn
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight">
              Dashboard Student Ambassador
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Dapatkan komisi uang tunai nyata setiap 1 siswa mendaftar paket menggunakan kodemu.
            </p>
          </div>

          {/* Tarik Saldo Button */}
          <button
            onClick={() => setWithdrawModalOpen(true)}
            className="btn-brand-primary px-6 py-3 rounded-full text-xs font-black shadow-md flex items-center gap-2 self-start sm:self-auto"
          >
            <Wallet size={16} /> Tarik Saldo (Rp {activeBalance.toLocaleString('id-ID')})
          </button>
        </div>

        {/* 4 Cards Monitoring Keuangan & Pendaftar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-gray-50/80 space-y-1">
            <span className="text-[11px] font-bold text-gray-500">Pendaftar Pakai Kodemu</span>
            <p className="text-2xl font-black text-gray-950">{totalReferred} Siswa</p>
            <p className="text-[10px] text-emerald-600 font-bold">● Terverifikasi aktif</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/80 space-y-1">
            <span className="text-[11px] font-bold text-gray-500">Total Komisi Masuk</span>
            <p className="text-2xl font-black text-emerald-600">Rp {totalEarnings.toLocaleString('id-ID')}</p>
            <p className="text-[10px] text-gray-400 font-medium">Akumulasi komisi tunai</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/80 space-y-1">
            <span className="text-[11px] font-bold text-gray-500">Sudah Dicairkan</span>
            <p className="text-2xl font-black text-gray-700">Rp {alreadyWithdrawn.toLocaleString('id-ID')}</p>
            <p className="text-[10px] text-gray-400 font-medium">Masuk ke rekening BCA</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/50 space-y-1">
            <span className="text-[11px] font-bold text-amber-900">Saldo Siap Ditarik</span>
            <p className="text-2xl font-black text-amber-950">Rp {activeBalance.toLocaleString('id-ID')}</p>
            <p className="text-[10px] text-amber-800 font-bold">0 hari penahanan · Langsung cair</p>
          </div>
        </div>

        {/* Skema Komisi Resmi Transparan */}
        <div className="p-4 rounded-2xl bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="font-black text-gray-900">Skema Komisi Uang Tunai Per Pendaftaran:</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white font-bold text-gray-800 shadow-2xs">
              Nectar (Review): <strong className="text-emerald-700">Rp 15.000</strong>/org
            </span>
            <span className="px-3 py-1 rounded-full bg-white font-bold text-gray-800 shadow-2xs">
              Honeycomb (Reguler): <strong className="text-emerald-700">Rp 35.000</strong>/org
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black shadow-2xs">
              Queen Bee (VIP): <strong className="text-black">Rp 75.000</strong>/org
            </span>
          </div>
        </div>
      </div>

      {/* 2. GRID 2 KOLOM ATAS (SESUAI PINTARLY SCREENSHOT 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* KOLOM KIRI (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          {/* CARD 1: KIRIM KODEMU KE SATU TEMAN */}
          <div className="rounded-3xl bg-white p-6 shadow-md space-y-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mascot/otbee-phone.png"
                alt="Otbee"
                className="w-12 h-12 object-contain"
              />
              <h3 className="text-sm font-black text-gray-900">
                Kirim kodemu ke satu teman
              </h3>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-white hover:bg-gray-50 text-gray-800 shadow-xs border border-gray-100 flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 size={14} /> {copiedLink ? 'Link Pendaftaran Berhasil Disalin!' : 'Bagikan link pendaftaran'}
            </button>

            {/* Big Code Box: Format [NAMA]OTW[ANGKA] -> ACANOTW01 */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/90 border border-gray-100">
              <span className="text-lg font-black tracking-widest text-gray-950 font-mono">
                {referralCode}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-xl hover:bg-gray-200 text-gray-600 transition-colors"
                  title="Salin Kode"
                >
                  {copiedCode ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl hover:bg-gray-200 text-gray-600 transition-colors"
                  title="Bagikan"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* CARD 2: LANGKAH BERIKUTNYA */}
          <div className="rounded-3xl bg-white p-6 shadow-md space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Langkah Berikutnya
            </span>

            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mascot/review-draft.png"
                alt="Otbee Draft"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h4 className="text-xs font-black text-gray-900">
                  Bagikan &ldquo;Audit Rapor & Essay Review AI&rdquo;
                </h4>
                <p className="text-[11px] text-gray-500 font-medium">
                  Materi teratas untuk modemu, kodemu sudah tertera.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById('katalog-harga-section')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="w-full btn-brand-primary py-3 rounded-full text-xs font-black shadow-xs"
            >
              Lihat materi & katalog harga
            </button>
          </div>

          {/* CARD 3: MULAI (3 STEPS) */}
          <div className="rounded-3xl bg-white p-6 shadow-md space-y-4">
            <h4 className="text-xs font-black text-gray-900">Mulai</h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 font-bold text-gray-700 flex items-center justify-center text-[11px]">
                  1
                </div>
                <span className="font-semibold text-gray-800">Kode dibagikan ke pejuang PTN</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 font-bold text-gray-700 flex items-center justify-center text-[11px]">
                    2
                  </div>
                  <span className="font-semibold text-gray-800">Teman mendaftar akun pakai kodemu</span>
                </div>
                <span className="font-black text-gray-900">{totalReferred}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 font-bold text-amber-800 flex items-center justify-center text-[11px]">
                    3
                  </div>
                  <span className="font-semibold text-gray-800">Teman berlangganan paket</span>
                </div>
                <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Komisi Tunai s.d Rp 75.000 / org
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (5 COLS): TANGGA KOMISI (SISTEM REWARD PER SISWA MENTOR) */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl bg-white p-6 shadow-md space-y-6">
            <div>
              <h3 className="text-xs font-black text-gray-900">Tangga komisi (Pendaftaran Paket Mentor)</h3>
              <div className="mt-2">
                <span className="text-4xl font-black text-gray-950 font-mono">1</span>
                <p className="text-xs font-bold text-gray-800 leading-snug mt-1">
                  1 Siswa Daftar Mentor = Komisi Tunai Langsung Rp 75.000 Cair
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Komisi uang beneran masuk ke saldo siap tarik</p>
              </div>
            </div>

            {/* Timeline Milestones per Mentor Referral */}
            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {/* Step 1: 1 Siswa Mentor */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-xs z-10 flex-shrink-0">
                  1
                </div>
                <div className="flex-1 flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="font-bold text-gray-900">1 Siswa Mentor</span>
                    <p className="text-[10px] text-gray-400">Pendaftaran pertama</p>
                  </div>
                  <span className="font-black text-emerald-600">Rp 75.000 Cair</span>
                </div>
              </div>

              {/* Step 2: 3 Siswa Mentor */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs shadow-xs z-10 flex-shrink-0">
                  3
                </div>
                <div className="flex-1 flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="font-bold text-gray-900">3 Siswa Mentor</span>
                    <span className="ml-2 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                      Target Saat Ini
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">Rp 225.000</p>
                    <p className="text-[10px] text-amber-700 font-bold">+ Bonus Rp 50.000</p>
                  </div>
                </div>
              </div>

              {/* Step 3: 5 Siswa Mentor */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs z-10 flex-shrink-0">
                  5
                </div>
                <div className="flex-1 flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="font-semibold text-gray-700">5 Siswa Mentor</span>
                    <p className="text-[10px] text-gray-400">Total Rp 375.000</p>
                  </div>
                  <span className="font-black text-amber-800">+ Bonus Rp 100k</span>
                </div>
              </div>

              {/* Step 4: 10 Siswa Mentor */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs z-10 flex-shrink-0">
                  10
                </div>
                <div className="flex-1 flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="font-bold text-gray-900">10 Siswa Mentor</span>
                    <p className="text-[10px] text-gray-400">Total Rp 750.000</p>
                  </div>
                  <span className="font-black text-amber-800">+ Bonus Rp 250k & Merch</span>
                </div>
              </div>

              {/* Step 5: 25 Siswa Mentor */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs z-10 flex-shrink-0">
                  25
                </div>
                <div className="flex-1 flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="font-bold text-gray-900">25 Siswa Mentor</span>
                    <p className="text-[10px] text-gray-400">Total Rp 1.875.000</p>
                  </div>
                  <span className="font-black text-amber-800">+ Jaket Eksklusif</span>
                </div>
              </div>

              {/* Step 6: 50 Siswa Mentor */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs z-10 flex-shrink-0">
                  50
                </div>
                <div className="flex-1 flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="font-bold text-gray-900">50 Siswa Mentor</span>
                    <p className="text-[10px] text-gray-400">Total Rp 3.750.000</p>
                  </div>
                  <span className="font-black text-emerald-700">+ Laptop / Tablet PTN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MATERI PROMOSI (SCREEN RECORD DEMO FITUR-FITUR OTWPTN) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Video size={18} className="text-amber-600" />
          <h2 className="text-lg font-black text-gray-900">Materi Promosi: Demo Fitur otwptn</h2>
        </div>
        <p className="text-xs text-gray-500 font-medium">
          Screen record demo fitur asli otwptn siap posting ke TikTok, Reels, dan WhatsApp Story. Kodemu sudah tercantum di caption.
        </p>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {(['Semua', 'Story', 'Feed', 'Landscape'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setPromoFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-colors ${
                promoFilter === tab
                  ? 'btn-brand-primary'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-2xs'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Screen Record Demo Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredDemos.map(d => (
            <div
              key={d.id}
              className="rounded-3xl bg-white p-4 shadow-md flex flex-col justify-between space-y-3 hover-lift"
            >
              <div className="space-y-3">
                {/* Demo Video Thumbnail with Play Button */}
                <div
                  onClick={() => setActiveDemoVideo({
                    title: d.title,
                    desc: d.desc,
                    duration: d.duration,
                    videoUrl: d.videoUrl,
                    feature: d.feature
                  })}
                  className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 cursor-pointer group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.previewImg}
                    alt={d.title}
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono text-white bg-black/60 px-1.5 py-0.5 rounded-md">
                    {d.duration}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    {d.feature}
                  </span>
                  <h4 className="text-xs font-black text-gray-900 leading-snug mt-1.5">
                    {d.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                    {d.desc}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Unduh, Bagikan, Caption */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-gray-100 text-center">
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = d.videoUrl
                    link.download = `${d.slug}.webp`
                    link.click()
                  }}
                  className="py-1.5 rounded-xl hover:bg-gray-100 text-[11px] font-bold text-gray-700 flex flex-col items-center gap-1 transition-colors"
                >
                  <Download size={14} /> Unduh
                </button>
                <button
                  onClick={handleCopyLink}
                  className="py-1.5 rounded-xl hover:bg-gray-100 text-[11px] font-bold text-gray-700 flex flex-col items-center gap-1 transition-colors"
                >
                  <Share2 size={14} /> Bagikan
                </button>
                <button
                  onClick={() => handleCopyCaption(d.id, d.caption)}
                  className="py-1.5 rounded-xl hover:bg-gray-100 text-[11px] font-bold text-gray-700 flex flex-col items-center gap-1 transition-colors"
                >
                  {copiedCaptionId === d.id ? (
                    <Check size={14} className="text-emerald-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                  Caption
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. KATALOG HARGA (PERSIS SCREENSHOT 3 PINTARLY DENGAN SEMUA VERSI) */}
      <div id="katalog-harga-section" className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Tag size={18} className="text-amber-600" />
          <h2 className="text-lg font-black text-gray-900">Katalog Harga (Semua Mode & Rasio)</h2>
        </div>
        <p className="text-xs text-gray-500 font-medium">
          Gambar daftar harga per mode lengkap dengan harga pakai kodemu. Pilih kategori dan rasio untuk mengunduh poster siap posting.
        </p>

        {/* 5 Kategori Mode + Switcher Rasio */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {[
              { id: 'Semua', label: '🌟 Semua Paket' },
              { id: 'Nectar', label: '🍯 Nectar (Review)' },
              { id: 'Honeycomb', label: '🐝 Honeycomb (Reguler)' },
              { id: 'Queen Bee', label: '👑 Queen Bee (VIP)' },
              { id: 'Akun Premium', label: '⚡ Akun Premium' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setKatalogCategory(cat.id as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-colors ${
                  katalogCategory === cat.id
                    ? 'btn-brand-primary'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-2xs'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {(['Story 9:16', 'Feed 4:5'] as const).map(asp => (
              <button
                key={asp}
                onClick={() => setPosterAspect(asp)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                  posterAspect === asp
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-2xs'
                }`}
              >
                {asp}
              </button>
            ))}
          </div>
        </div>

        {/* POSTER CARD (PERSIS DESAIN SCREENSHOT 3 PINTARLY) */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all ${
              posterAspect === 'Story 9:16' ? 'min-h-[640px]' : 'min-h-[520px]'
            }`}
            style={{
              background: 'linear-gradient(180deg, #dcfce7 0%, #f0fdf4 25%, #ffffff 50%, #fefce8 100%)',
              border: '4px solid #ffffff',
            }}
          >
            {/* Poster Header (Pintarly Style) */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900">
                  OTWPTN
                </span>
                <h3 className="text-2xl font-black text-gray-950 mt-0.5 tracking-tight">
                  {catalog.title}
                </h3>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500 font-semibold">Pakai kode</span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-amber-400 text-amber-950 shadow-2xs font-mono">
                    {referralCode}
                  </span>
                </div>
              </div>

              {/* Otbee Mascot with Cap & Book (Screenshot 3) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mascot/check-paper-happy.png"
                alt="Otbee"
                className="w-18 h-18 object-contain drop-shadow-sm"
              />
            </div>

            {/* Price Cards (5 Rows Matching Pintarly Screenshot 3) */}
            <div className="space-y-3 my-4">
              {catalog.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white shadow-xs border border-gray-100/80 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-900 truncate max-w-[170px]">
                      {item.name}
                    </span>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 uppercase font-bold block">
                        pakai kode
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-black bg-amber-400 text-amber-950 inline-block font-mono">
                        {item.codePrice}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="line-through text-gray-400">{item.orig}</span>
                    <span className="font-bold text-rose-600">{item.flash}</span>
                  </div>

                  {item.sub && (
                    <p className="text-[9px] text-gray-400 font-medium truncate">
                      {item.sub}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Poster Footer (Screenshot 3) */}
            <div className="pt-3 border-t border-gray-200/50 text-center space-y-1">
              <p className="text-[9px] text-gray-500">
                Harga flash: harga akun baru, 72 jam pertama sejak daftar
              </p>
              <p className="text-[11px] font-black text-gray-900 font-mono">
                Daftar di otwptn.id/r/{referralCode}
              </p>
              <p className="text-[9px] text-gray-400">
                Harga per 29 Okt 2026
              </p>
            </div>
          </div>

          {/* Action Buttons Below Poster */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleDownloadPoster}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-white hover:bg-gray-50 text-gray-900 shadow-xs flex items-center gap-1.5"
            >
              <Download size={14} /> Unduh Poster
            </button>
            <button
              onClick={handleCopyLink}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-white hover:bg-gray-50 text-gray-900 shadow-xs flex items-center gap-1.5"
            >
              <Share2 size={14} /> Bagikan
            </button>
            <button
              onClick={() => handleCopyCaption('katalog', `Dapatkan diskon potongan langsung untuk ${catalog.title} di otwptn dengan kode promo "${referralCode}". Akses di ${referralUrl}`)}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-white hover:bg-gray-50 text-gray-900 shadow-xs flex items-center gap-1.5"
            >
              <Copy size={14} /> {copiedCaptionId === 'katalog' ? 'Tersalin!' : 'Salin caption'}
            </button>
          </div>
        </div>
      </div>

      {/* 5. TAUTAN FOOTER (PERSIS PINTARLY) */}
      <div className="rounded-3xl bg-white shadow-md divide-y divide-gray-100 overflow-hidden">
        <a
          href="https://chat.whatsapp.com/sample-ambassador-otwptn"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageCircle size={18} className="text-emerald-600" />
            <span className="text-xs font-black text-gray-900">Grup WhatsApp Student Ambassador</span>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </a>

        <Link
          href="/dashboard/komunitas"
          className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ExternalLink size={18} className="text-amber-600" />
            <span className="text-xs font-black text-gray-900">Lihat halaman temanmu</span>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </Link>

        <button
          onClick={() => alert('Syarat & Ketentuan Student Ambassador otwptn:\n1. Setiap siswa yang mendaftar menggunakan kodemu ACANOTW01 akan mendapatkan potongan diskon langsung 10%.\n2. Kamu berhak atas komisi tunai uang beneran:\n   - Paket Nectar (Review): Rp 15.000/siswa\n   - Paket Honeycomb (Reguler): Rp 35.000/siswa\n   - Paket Queen Bee (VIP): Rp 75.000/siswa\n3. Komisi langsung masuk ke saldo siap tarik tanpa masa tunggu (0 hari penahanan).\n4. Penarikan saldo dapat dilakukan kapan saja tanpa potongan biaya admin.')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-gray-500" />
            <span className="text-xs font-black text-gray-900">Syarat & Ketentuan</span>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </button>
      </div>

      {/* WITHDRAWAL MODAL */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative space-y-5">
            <button
              onClick={() => setWithdrawModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Pencairan Komisi Tunai
              </span>
              <h3 className="text-lg font-black text-gray-900 mt-1">
                Tarik Saldo Komisi ke Rekening
              </h3>
              <p className="text-xs text-gray-500">
                Saldo aktif kamu: <strong>Rp {activeBalance.toLocaleString('id-ID')}</strong>. Bebas biaya admin.
              </p>
            </div>

            {withdrawSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-50 text-emerald-950 text-center space-y-2">
                <p className="text-sm font-black">Permintaan Pencairan Berhasil!</p>
                <p className="text-xs text-emerald-800">
                  Dana sebesar <strong>Rp {Number(withdrawAmount).toLocaleString('id-ID')}</strong> sedang diproses ke {bankTarget} ({accountNumber} a.n {accountHolder}). Estimasi masuk 1–15 menit.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">
                    Jumlah Pencairan (Rp)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    max={activeBalance}
                    min="20000"
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">
                    Bank / E-Wallet Tujuan
                  </label>
                  <select
                    value={bankTarget}
                    onChange={e => setBankTarget(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="BCA">BCA (Bank Central Asia)</option>
                    <option value="Mandiri">Bank Mandiri</option>
                    <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                    <option value="BNI">BNI (Bank Negara Indonesia)</option>
                    <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                    <option value="GoPay">GoPay</option>
                    <option value="OVO">OVO</option>
                    <option value="Dana">DANA</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">
                    Nomor Rekening / Nomor HP
                  </label>
                  <input
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">
                    Nama Pemilik Rekening
                  </label>
                  <input
                    value={accountHolder}
                    onChange={e => setAccountHolder(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 btn-brand-primary py-3 rounded-full text-xs font-black shadow-md"
                  >
                    Konfirmasi Pencairan Dana
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawModalOpen(false)}
                    className="px-5 py-3 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* LIVE ANIMATED DEMO VIDEO MODAL (Pintarly Style) */}
      {activeDemoVideo && (
        <InteractiveFeatureDemoPlayer
          title={activeDemoVideo.title}
          desc={activeDemoVideo.desc}
          feature={activeDemoVideo.feature}
          duration={activeDemoVideo.duration}
          videoUrl={activeDemoVideo.videoUrl}
          onClose={() => setActiveDemoVideo(null)}
        />
      )}
    </div>
  )
}
