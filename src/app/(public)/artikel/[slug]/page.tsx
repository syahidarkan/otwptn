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
      canonical: `https://otwptn.com/artikel/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url: `https://otwptn.com/artikel/${article.slug}`,
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
            url: `https://otwptn.com/artikel/${article.slug}`,
            datePublished: '2026-10-28T08:00:00.000Z',
            dateModified: '2026-10-28T10:00:00.000Z',
            author: {
              '@type': 'Person',
              name: article.author.name,
              jobTitle: article.author.role,
            },
            publisher: {
              '@type': 'Organization',
              name: 'otwptn | PT. Lembaga Sains Nasional',
              logo: {
                '@type': 'ImageObject',
                url: 'https://otwptn.com/logo.png',
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
          {slug === 'apa-itu-snbp' ? (
            <>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                1. Pengertian Resmi SNBP (Seleksi Nasional Berdasarkan Prestasi)
              </h2>
              <p>
                SNBP adalah salah satu jalur seleksi nasional penerimaan mahasiswa baru di Perguruan Tinggi Negeri (PTN) yang dikelola oleh Balai Pengelolaan Pengujian Pendidikan (BPPP) Kemendikbudristek. Berbeda dengan SNBT yang menggunakan ujian tertulis berbasis komputer (UTBK), seleksi SNBP 100% dinilai berdasarkan rekam jejak prestasi akademik dan non-akademik siswa selama menempuh pendidikan di SMA, SMK, atau MA.
              </p>

              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                2. Dua Komponen Utama Penilaian SNBP
              </h2>
              <p>Sistem seleksi SNBP menggunakan dua pilar pembobotan utama yang wajib kamu pahami:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-6">
                <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200">
                  <span className="text-xs font-black text-amber-800 uppercase tracking-wider block mb-1">Komponen 1 (Min. 50%)</span>
                  <h4 className="text-base font-bold text-gray-900 mb-2">Rata-Rata Seluruh Nilai Rapor</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Dihitung dari seluruh mata pelajaran dari semester 1 hingga semester 5. Tujuannya memastikan siswa memiliki integritas belajar yang konsisten secara holistik.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-sky-50/80 border border-sky-200">
                  <span className="text-xs font-black text-sky-800 uppercase tracking-wider block mb-1">Komponen 2 (Maks. 50%)</span>
                  <h4 className="text-base font-bold text-gray-900 mb-2">Mapel Pendukung & Prestasi</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Dihitung dari nilai 2 mata pelajaran pendukung prodi pilihan, kurasi maksimal 3 sertifikat prestasi terverifikasi Puspresnas, dan/atau portofolio.
                  </p>
                </div>
              </div>

              <div className="card p-5 rounded-2xl bg-white shadow-2xs border border-amber-100 my-6">
                <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-amber-600" /> Aturan Krusial SNBP:
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  &ldquo;Siswa yang dinyatakan LOLOS SNBP tidak dapat mendaftar UTBK-SNBT dan juga diblokir dari seluruh Jalur Mandiri di seluruh PTN se-Indonesia. Pastikan kamu hanya memilih jurusan yang 100% siap kamu ambil!&rdquo;
                </p>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                3. Strategi Rasionalisasi Rapor & Indeks Sekolah
              </h2>
              <p>
                SNBP bukan semata-mata lomba nilai rapor tinggi. PTN juga memperhitungkan indeks reputasi sekolah asalmu: akreditasi sekolah, rekam jejak IPK alumni di PTN tersebut, dan persebaran kuota. Gunakan fitur kalkulator peluang otwptn untuk memetakan posisimu dibanding teman seangkatan.
              </p>
            </>
          ) : slug === 'jalur-prestasi-2026' ? (
            <>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                1. Apa Saja Jalur Prestasi Mandiri PTN yang Dibuka?
              </h2>
              <p>
                Selain SNBP nasional, hampir seluruh PTN klaster 1 dan 2 membuka jalur mandiri tanpa tes berbasis prestasi (non-CBT). Jalur ini menjadi peluang emas bagi siswa pemilik sertifikat kejuaraan tingkat kota, provinsi, nasional, maupun internasional.
              </p>
              <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
                <li><strong>PPKB & Talent Scouting UI:</strong> Jalur prestasi rapor & esai untuk vokasi dan sarjana di Universitas Indonesia.</li>
                <li><strong>PBUB UGM:</strong> Penelusuran Bibit Unggul Berprestasi (Sains, Olahraga, Seni, dan Kemitraan) di Universitas Gadjah Mada.</li>
                <li><strong>SJP IPB:</strong> Seleksi Jalur Prestasi & Seleksi Khusus Ketua OSIS di IPB University.</li>
                <li><strong>Seleksi Mandiri Prestasi UNAIR & ITS:</strong> Menampung juara OSN, FLS2N, O2SN, hingga penghafal Al-Qur&apos;an.</li>
              </ul>

              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                2. Sertifikat yang Mendapat Poin Tertinggi
              </h2>
              <p>
                Sertifikat yang diselenggarakan atau dikurasi oleh Pusat Prestasi Nasional (Puspresnas) dan BPTI Kemendikbudristek mendapatkan bobot scoring tertinggi. Sertifikat non-kedinasan tetap bernilai apabila diterbitkan oleh lembaga bereputasi dan melampirkan surat keterangan keaslian.
              </p>

              <div className="card p-5 rounded-2xl bg-white shadow-2xs border border-amber-100 my-6">
                <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-amber-600" /> Trik Kurasi Sertifikat:
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Pilihlah sertifikat yang selaras secara linear dengan jurusan yang dituju. Juara OSN Kimia memiliki nilai konversi jauh lebih tinggi untuk Kedokteran/Farmasi dibanding sertifikat juara umum lomba pidato.
                </p>
              </div>
            </>
          ) : slug === 'jalur-essay-2026' ? (
            <>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                1. Mengapa Essay Menjadi Kunci Kelolosan?
              </h2>
              <p>
                Pada jalur seleksi seperti PPKB UI, Talent Scouting, dan program internasional, nilai rapor para pendaftar rata-rata berada pada rentang yang sangat ketat (88-96). Dalam kondisi tersebut, essay motivasi (Personal Statement) adalah satu-satunya instrumen di mana reviewer dapat menilai cara berpikir, kedewasaan, serta orisinalitas motivasimu.
              </p>

              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                2. Struktur Esai yang Disukai Reviewer Kampus
              </h2>
              <p>Gunakan rumus narasi 4 babak:</p>
              <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
                <li><strong>The Trigger / Hook:</strong> Pengalaman nyata atau rasa penasaran spesifik yang memicu ketertarikanmu pada bidang studi tersebut.</li>
                <li><strong>The Evidence:</strong> Kegiatan konkret, proyek sains, organisasi, atau bacaan mandiri yang membuktikan kamu sudah mulai mendalami bidang ini.</li>
                <li><strong>Why This Campus:</strong> Justifikasi mengapa hanya program studi di kampus ini yang dapat membantumu berkembang (sebutkan nama lab, mata kuliah, atau profil dosen).</li>
                <li><strong>The Vision:</strong> Rencana aksi dan kontribusi nyata yang ingin kamu lakukan selama kuliah dan setelah lulus.</li>
              </ul>
            </>
          ) : slug === 'syarat-snbp' ? (
            <>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                1. Kriteria Siswa Eligible SNBP 2026
              </h2>
              <p>
                Siswa eligible adalah siswa kelas 12 yang dinyatakan berhak mendaftar SNBP oleh pihak sekolah. Penentuan jumlah siswa eligible diatur ketat berdasarkan akreditasi sekolah:
              </p>
              <div className="grid grid-cols-3 gap-3 not-prose my-6 text-center">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-2xl font-black text-emerald-700">40%</div>
                  <div className="text-xs font-bold text-gray-700 mt-1">Akreditasi A</div>
                  <div className="text-[10px] text-gray-500">Siswa terbaik sekolah</div>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-2xl font-black text-amber-700">25%</div>
                  <div className="text-xs font-bold text-gray-700 mt-1">Akreditasi B</div>
                  <div className="text-[10px] text-gray-500">Siswa terbaik sekolah</div>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                  <div className="text-2xl font-black text-rose-700">5%</div>
                  <div className="text-xs font-bold text-gray-700 mt-1">Akreditasi C</div>
                  <div className="text-[10px] text-gray-500">Siswa terbaik sekolah</div>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                2. Berkas Persyaratan Administrasi
              </h2>
              <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
                <li>Memiliki NISN aktif dan terdaftar di Dapodik / EMIS.</li>
                <li>Memiliki nilai rapor semester 1 s.d. 5 yang sudah diisikan dan difinalisasi di PDSS oleh pihak sekolah.</li>
                <li>Memiliki portofolio resmi bagi pemilih program studi bidang Seni dan Olahraga.</li>
                <li>Memiliki prestasi akademik maupun non-akademik yang dibuktikan dengan sertifikat kejuaraan.</li>
              </ul>
            </>
          ) : slug === 'cara-daftar-snbp' ? (
            <>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                1. Alur Step-by-Step Pendaftaran SNBP di Portal SNPMB
              </h2>
              <p>Ikuti tahapan resmi pendaftaran agar terhindar dari kendala teknis atau gagal simpan permanen:</p>
              <ol className="space-y-3 list-decimal list-inside text-sm text-gray-700">
                <li><strong>Registrasi Akun SNPMB Siswa:</strong> Buka portal resmi SNPMB, masukkan kombinasi NISN, NPSN, dan tanggal lahir. Lakukan verifikasi email dan simpan password dengan aman.</li>
                <li><strong>Verifikasi dan Validasi Data:</strong> Periksa kesesuaian biodata, pasfoto terbaru dengan background polos, serta data nilai rapor yang tertera di PDSS.</li>
                <li><strong>Pemilihan Program Studi:</strong> Setiap siswa berhak memilih maksimal 2 program studi dari satu PTN atau dua PTN berbeda. Jika memilih dua prodi, salah satu PTN wajib berada di provinsi yang sama dengan sekolah asal.</li>
                <li><strong>Pengunggahan Portofolio & Sertifikat:</strong> Upload portofolio format template resmi dan maksimal 3 sertifikat prestasi terbaik dengan ukuran file sesuai ketentuan sistem.</li>
                <li><strong>Finalisasi & Cetak Kartu:</strong> Periksa kembali seluruh data sebelum menekan tombol Simpan Permanen. Unduh dan cetak Kartu Tanda Peserta SNBP sebagai bukti pendaftaran resmi.</li>
              </ol>
            </>
          ) : slug === 'jalur-tahfidz-quran-ptn' ? (
            <>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                1. Apa Itu Jalur Tahfidz Quran PTN?
              </h2>
              <p>
                Jalur Tahfidz Quran adalah salah satu skema seleksi mandiri prestasi keagamaan di Perguruan Tinggi Negeri (PTN) yang memberikan tiket masuk tanpa ujian tulis/CBT bagi siswa SMA/SMK/MA yang memiliki hafalan Al-Quran mutqin (lancar). Seleksi ini dinilai berdasarkan uji hafalan (tasmi&apos; / sima&apos;an), sertifikat syahadah dari lembaga/kemenag resmi, serta rekam jejak nilai rapor.
              </p>

              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                2. Daftar Kampus Negeri yang Membuka Jalur Tahfidz 2026
              </h2>
              <div className="space-y-4 not-prose my-6">
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                  <h4 className="font-bold text-gray-900 text-sm">Universitas Airlangga (UNAIR) - Golden Ticket & Prestasi</h4>
                  <p className="text-xs text-gray-700 mt-1">Minimal hafalan: 30 Juz (Golden Ticket) atau min. 10 Juz untuk jalur mandiri prestasi. Terbuka untuk banyak program studi favorit.</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                  <h4 className="font-bold text-gray-900 text-sm">Universitas Diponegoro (Undip) - SBUB Keagamaan</h4>
                  <p className="text-xs text-gray-700 mt-1">Minimal hafalan: 20 s.d. 30 Juz untuk poin maksimal. Diuji langsung oleh tim penguji hafalan Quran Undip.</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                  <h4 className="font-bold text-gray-900 text-sm">Universitas Gadjah Mada (UGM) - PBUB Keagamaan</h4>
                  <p className="text-xs text-gray-700 mt-1">Minimal hafalan: 10 Juz ke atas yang dibuktikan dengan sertifikat lembaga terakreditasi dan uji petik tasmi&apos;.</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                  <h4 className="font-bold text-gray-900 text-sm">Institut Teknologi Sepuluh Nopember (ITS) & UNHAS</h4>
                  <p className="text-xs text-gray-700 mt-1">Membuka kuota jalur mandiri prestasi hafidz Quran dengan pembuktian sertifikat Kemenag/LPTQ.</p>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                3. Syarat Berkas yang Wajib Disiapkan
              </h2>
              <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
                <li>Sertifikat atau Ijazah Tahfidz resmi dari Pondok Pesantren, LPTQ, atau Kementerian Agama.</li>
                <li>Rekaman video tasmi&apos; hafalan 1 juz pilihan (jika disyaratkan oleh PTN terkait).</li>
                <li>Transkrip nilai rapor semester 1 s.d. 5 yang telah dilegalisir pihak sekolah.</li>
                <li>Surat rekomendasi kepala sekolah atau pimpinan pondok pesantren.</li>
              </ul>
            </>
          ) : slug === 'jalur-pramuka-garuda-ptn' ? (
            <>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                1. Peluang Emas Anggota Pramuka Garuda Masuk PTN Tanpa Tes
              </h2>
              <p>
                Pramuka Garuda adalah tingkatan tertinggi dalam setiap golongan kepanduan. Beberapa kampus terkemuka di Indonesia, terutama <strong>IPB University</strong>, memiliki komitmen tinggi mengapresiasi dedikasi dan kepemimpinan Pramuka Garuda melalui jalur Seleksi Mandiri Prestasi tanpa tes tulis.
              </p>

              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                2. Kriteria dan Syarat Khusus Jalur Pramuka
              </h2>
              <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
                <li>Berstatus sebagai <strong>Pramuka Penegak Garuda</strong> aktif di gugus depan sekolah.</li>
                <li>Memiliki Surat Keputusan (SK) dan Piagam Penghargaan Pramuka Garuda resmi dari Kwartir Cabang (Kwarcab) atau Kwartir Daerah (Kwarda).</li>
                <li>Portofolio kegiatan kepramukaan: keikutsertaan Raimuna, Perkemahan Wirakarya, Lomba Tingkat, atau kepengurusan Dewan Ambalan.</li>
                <li>Nilai rapor semester 1-5 yang stabil pada mata pelajaran sains/sosial pendukung jurusan tujuan.</li>
              </ul>

              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                3. Tips Menyusun Portofolio Kepramukaan
              </h2>
              <p>
                Jangan hanya mencantumkan piagam sertifikat saja. Buatlah lampiran dokumentasi foto aksi pengabdian masyarakat atau proyek kepemimpinan yang pernah kamu pimpin di ambalan. Reviewer kampus mencari bukti integritas, kemandirian, dan kepedulian sosial yang nyata.
              </p>
            </>
          ) : slug === 'jalur-ketua-osis-kepemimpinan' ? (
            <>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                1. Kenapa Kampus Top Mencari Mantan Ketua OSIS?
              </h2>
              <p>
                Ketua OSIS dinilai memiliki kecerdasan intrapersonal, kepemimpinan (leadership), ketahanan menghadapi tekanan, dan kemampuan komunikasi publik yang matang. Oleh sebab itu, jalur khusus Ketua OSIS dibuka oleh kampus favorit seperti <strong>SJP IPB University</strong>, <strong>SMUP Minat Bakat Unpad</strong>, dan Seleksi Prestasi Kepemimpinan di UNAIR dan UNS.
              </p>

              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                2. Syarat Dokumen Jalur Ketua OSIS
              </h2>
              <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
                <li>Surat Keputusan (SK) Kepala Sekolah tentang pengangkatan pengurus OSIS dengan posisi definitif Ketua OSIS (bukan sekadar anggota seksi).</li>
                <li>Surat Keterangan Berkelakuan Baik dan Rekomendasi Khusus dari Kepala Sekolah.</li>
                <li>Portofolio Program Kerja Unggulan: ringkasan kegiatan, inovasi program, dan dampak positif yang dihasilkan selama masa bakti kepengurusan.</li>
                <li>Esai Kontribusi dan Motivasi: mengapa kepemimpinan di sekolah membuatmu siap berkontribusi untuk almamater kampus impian.</li>
              </ul>
            </>
          ) : slug === 'panduan-masuk-ptn-tanpa-tes-lengkap' ? (
            <>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                1. Klasifikasi Seluruh Jalur Masuk PTN Tanpa Ujian Tulis
              </h2>
              <p>
                Jika kamu tidak ingin bertaruh pada ujian UTBK/CBT yang sangat melelahkan, ada puluhan pintu masuk PTN yang 100% dinilai berdasarkan rekam jejak prestasimu. Di otwptn.com, kami membaginya ke dalam 5 pilar utama:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-6">
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                  <h4 className="font-bold text-gray-900 text-sm">1. Jalur Prestasi Nilai Rapor (SNBP & Mandiri Rapor)</h4>
                  <p className="text-xs text-gray-700 mt-1">Menggunakan rekap nilai rapor semester 1-5 dan indeks akreditasi sekolah. Contoh: SNBP, PPKB UI, SMUP Unpad Rapor.</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                  <h4 className="font-bold text-gray-900 text-sm">2. Jalur Prestasi Lomba & Kejuaraan (Puspresnas)</h4>
                  <p className="text-xs text-gray-700 mt-1">Sertifikat juara sains (OSN), riset (OPSI), olahraga (O2SN/PON), dan seni (FLS2N). Contoh: PBUB UGM, SBUB Undip.</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                  <h4 className="font-bold text-gray-900 text-sm">3. Jalur Kepemimpinan & Organisasi</h4>
                  <p className="text-xs text-gray-700 mt-1">Khusus bagi Ketua OSIS, MPK, dan Pramuka Garuda. Contoh: SJP IPB, SMUP Minat Bakat Unpad.</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                  <h4 className="font-bold text-gray-900 text-sm">4. Jalur Keagamaan & Tahfidz Quran</h4>
                  <p className="text-xs text-gray-700 mt-1">Bagi penghafal Al-Quran min. 5-30 juz atau prestasi keagamaan lain. Contoh: Golden Ticket UNAIR, PBUB UGM.</p>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-gray-900 pt-4">
                2. Strategi Memaksimalkan Peluang di otwptn.com
              </h2>
              <p>
                Setiap jalur memiliki timeline pembukaan yang berbeda-beda mulai dari Januari hingga Juli. Pastikan kamu menggunakan fitur <strong>Tracking Jadwal Jalur Non-Tes</strong> di otwptn.com dan menguji draf berkasmu dengan <strong>Essay AI Review</strong> agar tidak ada poin penilaian yang terlewat.
              </p>
            </>
          ) : (
            <>
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
            </>
          )}
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
