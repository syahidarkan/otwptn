import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen, Clock, Calendar, ArrowRight, Sparkles, Target,
  CheckCircle2, Compass, ShieldCheck, ChevronRight
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pusat Artikel & Panduan Masuk PTN Non-Tes | otwptn',
  description: 'Kumpulan artikel, strategi, dan tips lolos seleksi masuk PTN jalur non-tes: SNBP, PPKB UI, SJP IPB, PBUB UGM, dan Seleksi Mandiri Prestasi.',
  alternates: {
    canonical: 'https://otwptn.com/artikel',
  },
}

export { ARTICLES, type Article } from '@/lib/articlesData'
import { ARTICLES } from '@/lib/articlesData'


export default function ArtikelPage() {
  const featured = ARTICLES.filter(a => a.featured)
  const regulars = ARTICLES.filter(a => !a.featured)

  return (
    <div className="w-full min-h-screen pt-28 pb-24" style={{ background: 'var(--bg)' }}>
      {/* Article Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Pusat Artikel & Panduan Masuk PTN Non-Tes | otwptn',
            description: 'Panduan lengkap masuk PTN tanpa tes SNBP, PPKB UI, SJP IPB, PBUB UGM, dan Seleksi Mandiri Prestasi.',
            url: 'https://otwptn.com/artikel',
            hasPart: ARTICLES.map(a => ({
              '@type': 'Article',
              headline: a.title,
              description: a.excerpt,
              url: `https://otwptn.com/artikel/${a.slug}`,
              datePublished: '2026-10-28',
              author: {
                '@type': 'Person',
                name: a.author.name,
              },
            })),
          }),
        }}
      />

      <div className="max-w-6xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold mb-6" style={{ color: 'var(--muted)' }}>
          <Link href="/" className="hover:underline">Beranda</Link>
          <ChevronRight size={12} />
          <span className="text-amber-900 font-bold">Artikel & Panduan</span>
        </div>

        {/* Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full inline-block mb-3">
            Pusat Pengetahuan PTN Non-Tes
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
            Strategi, Trik & Panduan Lolos Masuk PTN Impian
          </h1>
          <p className="text-base text-gray-600 leading-relaxed font-medium">
            Ditulis langsung oleh kakak mentor alumni mahasiswa resmi UI, ITB, IPB, dan UGM yang telah berhasil lolos di jalur non-tes dan berpengalaman membimbing ribuan siswa.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-10" style={{ scrollbarWidth: 'none' }}>
          {['Semua Artikel', 'SNBP', 'PPKB UI', 'SJP IPB', 'PBUB UGM', 'Essay & Portofolio', 'Strategi Rapor'].map((cat, i) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                i === 0
                  ? 'btn-brand-primary'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-2xs'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured 2 Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
          {featured.map(article => (
            <Link
              key={article.slug}
              href={`/artikel/${article.slug}`}
              className="card p-6 md:p-8 flex flex-col justify-between hover-lift group border-0 shadow-md bg-white rounded-3xl"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-xs font-black uppercase text-amber-800 bg-amber-50 px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                    <Clock size={13} /> {article.readTime}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-amber-600 transition-colors leading-snug mb-3">
                  {article.title}
                </h2>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-normal mb-6">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={article.author.avatar} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 leading-none">{article.author.name}</p>
                    <p className="text-[11px] text-gray-500 font-medium leading-none mt-1">{article.author.role}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-black text-amber-700 group-hover:translate-x-1 transition-transform">
                  Baca <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Regular Articles Grid */}
        <div className="mb-14">
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen size={20} className="text-amber-600" /> Artikel Panduan Terbaru
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regulars.map(article => (
              <Link
                key={article.slug}
                href={`/artikel/${article.slug}`}
                className="card p-5 flex flex-col justify-between hover-lift group border-0 shadow-sm bg-white rounded-2xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                      {article.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">{article.readTime}</span>
                  </div>
                  <h3 className="text-sm font-black text-gray-900 group-hover:text-amber-600 transition-colors leading-snug mb-2 line-clamp-3">
                    {article.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-normal line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
                  <span>{article.date}</span>
                  <span className="font-bold text-amber-700 flex items-center gap-0.5">
                    Baca <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Box */}
        <div className="rounded-3xl p-8 md:p-12 text-center text-amber-950 relative overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #fff3b0 0%, #ffe066 100%)' }}>
          <div className="max-w-2xl mx-auto relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/70 text-amber-900 text-xs font-black mb-3">
              <Sparkles size={13} className="text-amber-600" /> Bimbingan Mentor Intensif
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
              Ingin Essay & Portofoliomu Di-Review Mentor Asli?
            </h2>
            <p className="text-xs md:text-sm text-gray-800 font-medium leading-relaxed mb-6">
              Dapatkan pendampingan 1-on-1 bersama kakak mentor lulusan resmi PTN impianmu. Bedah kalimat esai motivasi, rasionalisasi nilai rapor 5 semester, dan bimbingan sampai lolos.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/register" className="btn btn-primary text-xs sm:text-sm px-6 py-3 font-black shadow-md">
                Daftar & Mulai Konsultasi Gratis →
              </Link>
              <Link href="/dashboard/kalkulator" className="btn bg-white hover:bg-gray-50 text-gray-900 text-xs sm:text-sm px-5 py-3 font-bold shadow-2xs">
                Cek Kalkulator Peluang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
