'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Play,
  ShieldCheck,
  Target,
  Users,
  Award,
  ArrowRight,
  CheckCircle2,
  Zap,
  Heart,
  TrendingUp,
  FileText,
  Calculator,
  UserCheck,
  MapPin,
  HelpCircle,
  Clock,
} from 'lucide-react'

const STATS = [
  { label: 'Pejuang PTN Bergabung', value: '15.000+', icon: Users },
  { label: 'Tingkat Kelulusan Alumni', value: '94.8%', icon: TrendingUp },
  { label: 'Direktori Jalur Non-Tes', value: '25+ PTN', icon: MapPin },
  { label: 'Mentor Alumni UI, ITB, UGM', value: '120+', icon: UserCheck },
]

const PILLARS = [
  {
    id: 'essay-ai',
    title: 'Essay Review AI + Kurasi Mentor',
    icon: FileText,
    badge: 'Teknologi Cerdas',
    short: 'Validasi struktur narasi, metode STAR, dan esensi cerita kamu 24/7.',
    desc: 'Kami menggabungkan ketajaman analisis AI yang terlatih pada ribuan esai lolos PTN dengan sentuhan manusiawi mentor alumni. Dapatkan revisi mendalam yang menyentuh hati penguji tanpa kehilangan jati dirimu.',
    highlights: [
      'Pemeriksaan kaidah metode STAR (Situation, Task, Action, Result)',
      'Deteksi kalimat klise dan saran padanan kata persuasif',
      'Feedback personal dari Mentor Alumni kampus target',
    ],
  },
  {
    id: 'kalkulator',
    title: 'Kalkulator Peluang SNBP & Jalur Rapor',
    icon: Calculator,
    badge: 'Analisis Data Akurat',
    short: 'Rasionalisasi peluang riil berdasarkan rekam jejak alumni & passing grade.',
    desc: 'Bukan sekadar tebak-tebakan nilai rata-rata rapor. Sistem rasionalisasi kami mengalkulasi indeks konsistensi semester 1-5, akreditasi sekolah, rekam jejak kuota alumni di prodi target, hingga bobot mata pelajaran pendukung.',
    highlights: [
      'Skor rasionalisasi berbasis statistik angkatan sebelumnya',
      'Rekomendasi prodi alternatif realistis untuk pilihan ke-2',
      'Optimasi portofolio sertifikat prestasi (OSN/O2SN/FLS2N)',
    ],
  },
  {
    id: 'mentoring',
    title: 'Bimbingan 1-on-1 Alumni Top PTN',
    icon: Users,
    badge: 'Pengalaman Nyata',
    short: 'Mentor yang benar-benar pernah ada di posisimu dan lolos jalur non-tes.',
    desc: 'Bukan guru privat atau pengajar bimbel umum. Mentor OTWPTN adalah mahasiswa dan alumni UI, ITB, UGM, Unair, ITS yang sukses menembus SNBP, PPKB UI, SNB, PBUD, dan Talent Scouting. Mereka membagikan rahasia dapur yang tidak diajarkan di sekolah.',
    highlights: [
      'Sesi tatap muka virtual privat 1-on-1 via Google Meet / Zoom',
      'Review dokumen portofolio & simulasi wawancara (jika ada)',
      'Grup WhatsApp privat untuk konsultasi hingga pengumuman final',
    ],
  },
  {
    id: 'direktori',
    title: 'Direktori 25+ Jalur Mandiri Non-Tes',
    icon: MapPin,
    badge: 'Informasi Terpusat',
    short: 'Panduan lengkap & timeline deadline jalur prestasi se-Indonesia.',
    desc: 'Banyak siswa kehilangan peluang emas hanya karena tidak tahu ada jalur prestasi rapor dan bakat di kampus impian mereka. Kami merangkum syarat berkas, kuota, biaya, dan kalender pendaftaran secara real-time.',
    highlights: [
      'Update timeline & syarat pendaftaran tanpa ujian tertulis',
      'Filter prodi & PTN berdasarkan minat dan kategori prestasi',
      'Notifikasi pengingat deadline agar berkas tidak terlewat',
    ],
  },
]

const COMPARISONS = [
  {
    topic: 'Informasi Jalur Masuk',
    oldWay: 'Mencari sendiri di puluhan website kampus yang membingungkan dan sering kadaluarsa.',
    otwptnWay: 'Direktori terpusat 25+ jalur non-tes nasional dengan syarat & deadline terverifikasi.',
  },
  {
    topic: 'Pembuatan Essay & Personal Statement',
    oldWay: 'Tulis sendiri tanpa arah, tidak tahu salahnya di mana, dan berisiko ditolak penguji.',
    otwptnWay: 'Review mendalam kombinasi AI instan + bedah esai langsung bersama Mentor Alumni PTN.',
  },
  {
    topic: 'Penentuan Pilihan Prodi SNBP',
    oldWay: 'Hanya bermodal feeling atau saran guru BK umum yang kurang paham persaingan antar-sekolah.',
    otwptnWay: 'Kalkulator rasionalisasi berbasis data riil kuota alumni & bobot mata pelajaran pendukung.',
  },
  {
    topic: 'Pendampingan & Moral Support',
    oldWay: 'Berjuang sendirian dalam tekanan, bingung saat ada kendala upload berkas.',
    otwptnWay: 'Didampingi Mentor Alumni 1-on-1 dan komunitas pejuang PTN se-Indonesia yang saling dukung.',
  },
]

const VALUES = [
  {
    icon: Target,
    title: 'Fokus & Spesifik Non-Tes',
    desc: 'Kami tidak membuka bimbel ujian tulis umum. Kami mendedikasikan 100% fokus untuk menjadi yang terlengkap dan terdalam dalam persiapan jalur non-tes, rapor, dan prestasi di Indonesia.',
  },
  {
    icon: ShieldCheck,
    title: 'Integritas & Transparansi Data',
    desc: 'Kami tidak menjual janji manis kelulusan instan. Kami memberikan analisis probabilitas jujur berbasis data dan membimbingmu menyusun dokumen terbaik semaksimal mungkin.',
  },
  {
    icon: Heart,
    title: 'Empati Mentor Seperjuangan',
    desc: 'Semua mentor kami pernah merasakan cemas dan ketidakpastian yang sama. Itulah mengapa bimbingan di OTWPTN terasa hangat, suportif, dan seperti didampingi kakak kandung.',
  },
  {
    icon: Zap,
    title: 'Sinergi AI & Sentuhan Manusia',
    desc: 'Kecerdasan buatan memberikan kecepatan dan analisis pola tak terbatas, sementara kebijaksanaan mentor memastikan esaimu tetap memiliki jiwa, rasa, dan keaslian cerita.',
  },
]

export default function TentangPage() {
  const [activePillar, setActivePillar] = useState(0)

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background text-foreground transition-colors">
      {/* ── 1. Hero Section ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Mengenal Lebih Dekat OTWPTN
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.18] mb-6">
            Platform Persiapan Masuk PTN{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500">
              Jalur Non-Tes #1
            </span>{' '}
            di Indonesia
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Membantu siswa pejuang PTN menembus kampus impian tanpa harus pusing ujian tertulis - melalui optimasi esai, rasionalisasi rapor SNBP, dan bimbingan 1-on-1 bersama mentor alumni UI, ITB, & UGM.
          </p>
        </div>
      </section>

      {/* ── 2. Official Video Showcase ──────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 mb-20">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-3xl sm:rounded-[32px] blur-xl opacity-30 group-hover:opacity-45 transition duration-700 pointer-events-none" />
          
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-black border border-amber-500/30">
            <div className="relative aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/nLaq2c4v3yU?si=0wrXzzSin4bXIIXJ"
                title="Official Launching OTWPTN Video Player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full block"
              />
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1.5 font-medium">
          <Play className="w-3.5 h-3.5 text-amber-500" />
          Video Launching Resmi OTWPTN: Visi & Misi Kami Membantu Pejuang PTN
        </p>
      </section>

      {/* ── 3. Quick Stats ──────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-card border border-border rounded-2xl p-5 text-center shadow-xs hover:border-amber-400/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-foreground mb-1">{value}</p>
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Interactive 4 Pillars of OTWPTN ─────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 mb-24">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Ekosistem Komprehensif
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-1">
            4 Pilar Pendampingan OTWPTN
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mt-2">
            Klik pilar di bawah untuk melihat bagaimana OTWPTN mempersiapkan setiap aspek seleksi berkas kamu secara terintegrasi.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon
            const isActive = activePillar === idx
            return (
              <button
                key={pillar.id}
                onClick={() => setActivePillar(idx)}
                className={`flex flex-col items-center sm:items-start text-center sm:text-left p-3.5 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-xs ring-1 ring-amber-500/20'
                    : 'bg-card border-border hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                    isActive ? 'bg-amber-500 text-white' : 'bg-muted text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-bold leading-snug ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {pillar.title.split('+')[0]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Pillar Card */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-3">
                {PILLARS[activePillar].badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground mb-3">
                {PILLARS[activePillar].title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                {PILLARS[activePillar].desc}
              </p>

              <div className="space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Yang Kamu Dapatkan:
                </p>
                {PILLARS[activePillar].highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full md:w-72 bg-muted/40 rounded-2xl p-5 border border-border flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Mengapa Ini Penting?
                </p>
                <p className="text-xs leading-relaxed text-foreground/90 font-medium">
                  {PILLARS[activePillar].short}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <Link
                  href="/register"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-xs"
                >
                  Coba Fitur Ini Sekarang
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Comparison: Cara Lama vs Cara OTWPTN ─────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 mb-24">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Perbandingan Nyata
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-1">
            Mengapa Pejuang PTN Memilih OTWPTN?
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mt-2">
            Perbedaan signifikan antara berjuang tanpa arah vs berjuang dengan strategi terstruktur.
          </p>
        </div>

        <div className="overflow-hidden bg-card border border-border rounded-3xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Kolom Kiri: Cara Lama */}
            <div className="p-6 sm:p-8 bg-red-500/5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <h3 className="text-base font-black text-red-600 dark:text-red-400">
                  Cara Lama (Tanpa OTWPTN)
                </h3>
              </div>
              <div className="space-y-6">
                {COMPARISONS.map((c, i) => (
                  <div key={i}>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      {c.topic}
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{c.oldWay}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Kolom Kanan: Cara OTWPTN */}
            <div className="p-6 sm:p-8 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <h3 className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  Cara OTWPTN (Terarah & Terbukti)
                </h3>
              </div>
              <div className="space-y-6">
                {COMPARISONS.map((c, i) => (
                  <div key={i}>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                      {c.topic}
                    </p>
                    <p className="text-sm text-foreground font-semibold leading-relaxed">
                      {c.otwptnWay}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Kisah Kami & Nilai-Nilai ─────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 mb-20">
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 mb-12 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground mb-4">
            <Heart className="w-3.5 h-3.5 text-red-500" />
            Cerita di Balik OTWPTN
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-4">
            Lahir dari Kebingungan yang Pernah Kami Alami Sendiri
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Beberapa tahun lalu, kami adalah siswa SMA yang bermimpi kuliah di kampus top seperti Universitas Indonesia, ITB, dan UGM. Kami memiliki rekam jejak rapor dan sertifikat lomba, namun tidak tahu bagaimana cara mengemasnya.
            </p>
            <p>
              Informasi mengenai jalur PPKB UI, SNBP, SNB, dan jalur mandiri prestasi sangat simpang siur. Guru BK di sekolah kewalahan mengurus ratusan siswa, sementara bimbel konvensional di luar sana hanya fokus pada drill soal UTBK/SNBT semata.
            </p>
            <p>
              Setelah berhasil menembus PTN impian lewat jalur non-tes, kami bertekad menciptakan platform yang dulu sangat kami butuhkan: panduan transparan, kurasi esai berstandar tinggi, dan pendampingan mentor sebaya yang tulus.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <h3 className="text-xl font-black text-center text-foreground mb-6">
          Nilai-Nilai yang Kami Pegang Teguh
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-2xl p-5 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-foreground mb-1.5">{title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Call To Action ───────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="rounded-3xl p-8 sm:p-12 border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-4 shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
            Siap Menjadi Bagian dari Alumni Lolos PTN Selanjutnya?
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
            Mulai langkah awalmu hari ini. Coba kalkulator peluang gratis atau upload draft esai pertamamu untuk dianalisis oleh AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-black bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-white" />
              Mulai Belajar Gratis
            </Link>
            <Link
              href="/dashboard/kalkulator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-card border border-border hover:bg-muted text-foreground transition-all"
            >
              Simulasi Peluang Rapor
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
