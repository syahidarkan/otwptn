import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  Compass,
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Calculator,
  ShieldCheck,
  Award,
} from 'lucide-react'
import { LEGAL_ENTITY } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Panduan Lengkap Masuk PTN Jalur Non-Tes (SNBP, PPKB UI, PBUB UGM, SJP IPB) | otwptn',
  description:
    'Kupas tuntas strategi lolos masuk PTN jalur non-tes tanpa UTBK: seleksi rapor SNBP, PPKB UI, PBUB UGM, SJP IPB, Golden Ticket UNAIR, dan bimbingan mentor alumni.',
  keywords: [
    'jalur non tes',
    'masuk ptn non tes',
    'mentor ptn',
    'ppkb ui',
    'sjp ipb',
    'pbub ugm',
    'snbp 2027',
    'essay snbp',
    'bimbingan ptn non tes',
  ],
}

const ARTICLES = [
  {
    slug: 'jalur-non-tes-ptn',
    category: 'Panduan Utama',
    title: 'Daftar Lengkap Jalur Masuk PTN Non-Tes Se-Indonesia (Update 2026/2027)',
    excerpt: 'Penjelasan menyeluruh mengenai perbedaan SNBP, PPKB UI, PBUB UGM, SJP IPB, dan Golden Ticket beserta syarat kelulusan.',
    readTime: '6 menit baca',
    icon: Compass,
    badgeColor: 'bg-amber-100 text-amber-900',
  },
  {
    slug: 'ppkb-ui',
    category: 'Jalur UI',
    title: 'Strategi Ampuh Lolos PPKB UI (Prestasi dan Pemerataan Kesempatan Belajar)',
    excerpt: 'Bedah kriteria lolos PPKB Vokasi & Sarjana UI: bobot nilai rapor per semester, struktur essay motivasi, dan portofolio pendukung.',
    readTime: '5 menit baca',
    icon: GraduationCap,
    badgeColor: 'bg-yellow-100 text-yellow-900',
  },
  {
    slug: 'pbub-ugm',
    category: 'Jalur UGM',
    title: 'Panduan Lengkap PBUB UGM: Jalur Prestasi Olahraga, Seni, & IPTEK',
    excerpt: 'Cara memaksimalkan sertifikat juara nasional dan regional untuk lolos prodi favorit di Universitas Gadjah Mada.',
    readTime: '5 menit baca',
    icon: Award,
    badgeColor: 'bg-emerald-100 text-emerald-900',
  },
  {
    slug: 'sjp-ipb',
    category: 'Jalur IPB',
    title: 'Jalur Ketua OSIS & SJP IPB University: Kriteria Kepemimpinan & Syarat',
    excerpt: 'Bagaimana jalur Seleksi Talenta Kepemimpinan & SJP IPB menilai rekam jejak organisasi siswa dan kiat menyusun portofolionya.',
    readTime: '4 menit baca',
    icon: ShieldCheck,
    badgeColor: 'bg-sky-100 text-sky-900',
  },
  {
    slug: 'mentor-ptn-terbaik',
    category: 'Mentoring Alumni',
    title: 'Peran Vital Mentor Alumni PTN dalam Merasionalisasi Pilihan Non-Tes',
    excerpt: 'Mengapa bimbingan 1-on-1 dari alumni yang sudah terbukti lolos jalur non-tes meningkatkan probabilitas penerimaan hingga 94.8%.',
    readTime: '4 menit baca',
    icon: Sparkles,
    badgeColor: 'bg-purple-100 text-purple-900',
  },
]

const FAQS = [
  {
    q: 'Apa itu jalur masuk PTN non-tes?',
    a: 'Jalur non-tes adalah mekanisme penerimaan mahasiswa baru di Perguruan Tinggi Negeri (PTN) tanpa melalui ujian tertulis seperti UTBK-SNBT. Seleksi didasarkan pada nilai rapor kumulatif semester 1–5, rekam jejak prestasi, esai motivasi, dan portofolio keahlian (contoh: SNBP, PPKB UI, PBUB UGM, SJP IPB).',
  },
  {
    q: 'Apakah bisa mendaftar beberapa jalur non-tes sekaligus?',
    a: 'Bisa! Kamu bisa mendaftar SNBP sebagai jalur nasional, sekaligus mendaftar jalur mandiri prestasi kampus seperti PPKB UI, PBUB UGM, dan SJP IPB sesuai jadwal masing-masing universitas.',
  },
  {
    q: 'Bagaimana cara otwptn membantu persiapan jalur non-tes?',
    a: 'otwptn menyediakan kalkulator peluang rasionalisasi nilai rapor 5 semester, AI essay review otomatis untuk menyempurnakan struktur tulisan, serta bimbingan 1-on-1 bersama kakak mentor alumni resmi UI, ITB, dan UGM yang terbukti lolos di jalur tersebut.',
  },
]

export default function PanduanSEOPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-bg-alt flex flex-col">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 max-w-5xl mx-auto w-full space-y-12">
        {/* Header Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Pusat Edukasi & Strategi Non-Tes · {LEGAL_ENTITY.name}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight leading-tight">
            Panduan Lengkap Masuk PTN Jalur Non-Tes
          </h1>

          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Kumpulan panduan komprehensif, analisis strategi seleksi rapor, dan kiat lolos prodi impian di UI, ITB, UGM, IPB, & UNAIR tanpa ujian tertulis.
          </p>
        </div>

        {/* Quick Tools CTA Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/kalkulator"
            className="p-5 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all flex items-center justify-between group border-0"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-gray-950 text-sm group-hover:text-amber-600 transition-colors">
                  Kalkulator Peluang SNBP
                </h3>
                <p className="text-xs text-gray-500">Hitung probabilitas lolos prodi favoritmu gratis</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/dashboard/essay"
            className="p-5 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all flex items-center justify-between group border-0"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-gray-950 text-sm group-hover:text-amber-600 transition-colors">
                  AI Essay Review Instan
                </h3>
                <p className="text-xs text-gray-500">Koreksi draf essay motivasi & personal statement</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-950">Artikel & Pembahasan Strategi</h2>

          <div className="grid grid-cols-1 gap-4">
            {ARTICLES.map((art) => {
              const Icon = art.icon
              return (
                <div
                  key={art.slug}
                  className="p-6 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all border-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${art.badgeColor}`}>
                          {art.category}
                        </span>
                        <span className="text-xs text-gray-400 font-semibold">•</span>
                        <span className="text-xs text-gray-400 font-semibold">{art.readTime}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-gray-950 leading-snug">
                        {art.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed max-w-2xl">
                        {art.excerpt}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/jalur`}
                    className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-amber-400 text-gray-800 hover:text-amber-950 font-black text-xs inline-flex items-center justify-center gap-1.5 transition-colors self-start md:self-center shrink-0 border-0"
                  >
                    <span>Pelajari Jalur</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {/* SEO FAQ Accordion Section with Schema */}
        <div className="p-8 rounded-3xl bg-white shadow-sm border-0 space-y-6">
          <div>
            <h2 className="text-xl font-black text-gray-950">Pertanyaan Umum Seputar Jalur Non-Tes (FAQ)</h2>
            <p className="text-xs text-gray-500 font-medium">Informasi penting yang sering ditanyakan siswa dan orang tua.</p>
          </div>

          <div className="divide-y divide-gray-100">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="py-4 space-y-1.5">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-xs text-gray-600 pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 text-amber-950 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 border-0">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Siap Maksimalkan Peluang Masuk PTN?</h2>
            <p className="text-xs sm:text-sm font-semibold opacity-90 mt-1">
              Dapatkan review essay AI, simulasi prodi, dan bimbingan 1-on-1 langsung bersama mentor alumni terverifikasi.
            </p>
          </div>

          <Link
            href="/register"
            className="px-6 py-3.5 rounded-full bg-gray-950 text-white font-extrabold text-sm shadow-md hover:bg-black transition-colors shrink-0"
          >
            Daftar Akun Gratis Sekarang →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
