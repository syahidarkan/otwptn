import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Clock, Calendar, User, ArrowLeft, ArrowRight, Share2, Sparkles,
  CheckCircle2, AlertTriangle, BookOpen, ChevronRight, HelpCircle
} from 'lucide-react'
import type { Metadata } from 'next'
import { ARTICLES, type Article } from '../page'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = ARTICLES.find(a => a.slug === slug)
  if (!article) return { title: 'Artikel Tidak Ditemukan | otwptn' }

  return {
    title: `${article.title} | otwptn`,
    description: article.excerpt,
    alternates: {
      canonical: `https://otwptn.id/artikel/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url: `https://otwptn.id/artikel/${article.slug}`,
      publishedTime: '2026-10-28T08:00:00.000Z',
      authors: [article.author.name],
      tags: article.tags,
    },
  }
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = ARTICLES.find(a => a.slug === slug)
  if (!article) notFound()

  const related = ARTICLES.filter(a => a.slug !== slug).slice(0, 3)

  return (
    <div className="w-full min-h-screen pt-28 pb-24" style={{ background: 'var(--bg)' }}>
      {/* Article Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: article.title,
            description: article.excerpt,
            url: `https://otwptn.id/artikel/${article.slug}`,
            datePublished: '2026-10-28T08:00:00.000Z',
            dateModified: '2026-10-28T10:00:00.000Z',
            author: {
              '@type': 'Person',
              name: article.author.name,
              jobTitle: article.author.role,
            },
            publisher: {
              '@type': 'Organization',
              name: 'otwptn — PT. Lembaga Sains Nasional',
              logo: {
                '@type': 'ImageObject',
                url: 'https://otwptn.id/logo.png',
              },
            },
            keywords: article.tags.join(', '),
          }),
        }}
      />

      <article className="max-w-4xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold mb-6 flex-wrap" style={{ color: 'var(--muted)' }}>
          <Link href="/" className="hover:underline">Beranda</Link>
          <ChevronRight size={12} />
          <Link href="/artikel" className="hover:underline">Artikel</Link>
          <ChevronRight size={12} />
          <span className="text-amber-900 font-bold truncate max-w-[240px] md:max-w-md">{article.title}</span>
        </div>

        {/* Back Link */}
        <Link href="/artikel" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 mb-6">
          <ArrowLeft size={14} /> Kembali ke Semua Artikel
        </Link>

        {/* Header */}
        <header className="mb-10">
          <span className="text-xs font-black uppercase text-amber-800 bg-amber-100/90 px-3.5 py-1 rounded-full inline-block mb-4">
            {article.category}
          </span>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-6">
            {article.title}
          </h1>

          <div className="flex items-center justify-between gap-4 py-4 border-y border-gray-100 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 p-1 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={article.author.avatar} alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 leading-none">{article.author.name}</p>
                <p className="text-[11px] text-gray-500 font-medium leading-none mt-1">{article.author.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
              <span className="flex items-center gap-1"><Calendar size={13} /> {article.date}</span>
              <span className="flex items-center gap-1"><Clock size={13} /> {article.readTime}</span>
            </div>
          </div>
        </header>

        {/* Lead Excerpt */}
        <div className="p-6 rounded-2xl bg-amber-50/70 border-l-4 border-amber-400 mb-10 text-sm md:text-base font-semibold text-gray-800 leading-relaxed">
          {article.excerpt}
        </div>

        {/* Rich Article Body Content */}
        <div className="prose prose-sm md:prose-base max-w-none text-gray-800 leading-relaxed space-y-6">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
            1. Mengapa Jalur Non-Tes Bukan Sekadar Faktor Keberuntungan?
          </h2>
          <p>
            Banyak siswa SMA/SMK/MA berasumsi bahwa lolos di jalur seleksi non-tes (seperti SNBP, PPKB UI, SJP IPB, dan PBUB UGM) sepenuhnya adalah faktor &ldquo;hoki&rdquo;. Faktanya, setiap perguruan tinggi negeri memiliki rubrik penilaian objektif dengan pembobotan spesifik antara nilai rapor mata pelajaran pendukung, rekam jejak alumni di sekolah asal, indeks prestasi sekolah, hingga kualitas esai motivasi dan portofolio.
          </p>
          <p>
            Dengan memahami mekanisme scoring tersebut, kamu bisa menyusun strategi pemilihan program studi yang rasional tanpa harus berspekulasi membabi buta.
          </p>

          <div className="card p-5 rounded-2xl bg-white shadow-2xs border border-amber-100 my-6">
            <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-amber-600" /> Tips Emas dari Mentor:
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              &ldquo;Jangan pernah memilih 2 jurusan dengan passing grade tinggi dari sekolah yang sama jika peringkat rapormu bukan yang nomor satu. Diskusikan dengan guru BK dan bandingkan nilai dengan teman satu angkatan.&rdquo;
            </p>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
            2. Tiga Kunci Utama Lolos Penilaian Seleksi Berkas
          </h2>
          <p>Berdasarkan evaluasi terhadap ribuan dokumen mentee tahun lalu, ada 3 aspek penentu yang paling sering menjadi pembeda kelolosan:</p>
          <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
            <li><strong>Konsistensi Nilai Rapor Semester 1 s.d. 5:</strong> Tren nilai yang stabil naik atau bertahan di level tinggi, terutama untuk mata pelajaran yang relevan dengan prodi yang dituju.</li>
            <li><strong>Relevansi Sertifikat & Portofolio Prestasi:</strong> Sertifikat juara yang terverifikasi (Puspresnas, Kemendikbud, atau instansi bereputasi) dengan tingkat minimal kota/provinsi/nasional.</li>
            <li><strong>Ketajaman Esai Diri (Personal Statement):</strong> Narasi yang jelas mengenai alasan memilih prodi, bukti keterlibatan dalam kegiatan relevan, serta visi kontribusi jangka panjang.</li>
          </ul>

          <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
            3. Cara Menghindari Tabrakan Pilihan Satu Sekolah
          </h2>
          <p>
            Salah satu penyebab paling umum siswa berprestasi gugur di jalur non-tes adalah karena mendaftar di jurusan yang sama dengan teman sekelas yang memiliki nilai rapor atau prestasi lebih tinggi. Sebagian besar PTN membatasi kuota penerimaan dari satu sekolah tertentu. Gunakan fitur kalkulator peluang dan konsultasikan pilihanmu dengan mentor alumni untuk mengamankan posisi yang minim persaingan internal sekolah.
          </p>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap pt-8 mt-10 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-400">Topik Terkait:</span>
          {article.tags.map(t => (
            <span key={t} className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              #{t}
            </span>
          ))}
        </div>

        {/* Author Bio Box */}
        <div className="card p-6 rounded-3xl bg-white shadow-sm border border-gray-100 mt-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-amber-100 p-2 flex-shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.author.avatar} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black text-gray-900">{article.author.name}</h3>
            <p className="text-xs text-amber-800 font-bold mb-2">{article.author.role}</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Mahasiswa berprestasi yang lolos melalui jalur non-tes PTN dan aktif memberikan bedah dokumen, review esai, dan simulasi wawancara untuk siswa pejuang kampus impian di seluruh Indonesia.
            </p>
          </div>
        </div>

        {/* CTA Card */}
        <div className="card p-8 rounded-3xl bg-amber-400 text-gray-950 mt-10 text-center shadow-lg">
          <h3 className="text-xl md:text-2xl font-black mb-2">Mau Review Esai & Cek Peluang Kampusmu?</h3>
          <p className="text-xs md:text-sm text-gray-900 max-w-xl mx-auto font-medium mb-6">
            Gunakan Essay AI Review untuk koreksi tata bahasa dan struktur esai dalam 5 detik, atau gunakan Kalkulator Peluang berbasis data historis PTN.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/dashboard/essay" className="btn bg-gray-950 hover:bg-black text-white text-xs sm:text-sm px-6 py-3 font-bold rounded-full">
              Coba Essay AI Review →
            </Link>
            <Link href="/dashboard/kalkulator" className="btn bg-white hover:bg-gray-100 text-gray-900 text-xs sm:text-sm px-5 py-3 font-bold rounded-full">
              Kalkulator Peluang
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-16">
          <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen size={18} className="text-amber-600" /> Artikel Lain yang Perlu Kamu Baca
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map(r => (
              <Link key={r.slug} href={`/artikel/${r.slug}`} className="card p-4 rounded-2xl bg-white shadow-2xs hover-lift group border border-gray-100 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full mb-2 inline-block">
                    {r.category}
                  </span>
                  <h4 className="text-xs font-black text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                    {r.title}
                  </h4>
                </div>
                <div className="text-[11px] text-gray-400 font-medium pt-3 mt-3 border-t border-gray-50 flex items-center justify-between">
                  <span>{r.readTime}</span>
                  <span className="font-bold text-amber-700 flex items-center gap-0.5">Baca <ArrowRight size={10} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </div>
  )
}
