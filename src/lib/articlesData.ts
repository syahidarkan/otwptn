export interface Article {
  slug: string
  title: string
  excerpt: string
  category: 'SNBP' | 'PPKB UI' | 'SJP IPB' | 'PBUB UGM' | 'Essay & Portofolio' | 'Strategi Rapor'
  readTime: string
  date: string
  author: {
    name: string
    role: string
    avatar: string
  }
  featured?: boolean
  tags: string[]
}

export const ARTICLES: Article[] = [
  {
    slug: 'panduan-lolos-snbp-2026-strategi-rapor-dan-prodi',
    title: 'Panduan Lengkap Lolos SNBP 2026: Strategi Nilai Rapor & Trik Pemilihan Jurusan',
    excerpt: 'Pelajari bobot mata pelajaran pendukung prodi, cara rasionalisasi rapor semester 1-5, dan strategi meminimalkan risiko gugur akibat persaingan satu sekolah.',
    category: 'SNBP',
    readTime: '6 menit baca',
    date: '28 Oktober 2026',
    author: {
      name: 'Kak Rifqi Alumni UI',
      role: 'Mentor Senior Jalur Prestasi UI',
      avatar: '/ptn-logos/ui.png',
    },
    featured: true,
    tags: ['SNBP 2026', 'Rapor Semester 1-5', 'Mata Pelajaran Pendukung', 'Peluang Lolos'],
  },
  {
    slug: 'tips-menulis-personal-statement-ppkb-ui',
    title: 'Kupas Tuntas Personal Statement PPKB UI: Format, Struktur & Contoh Kalimat Pembuka',
    excerpt: 'Bedah esai motivasi yang disukai reviewer UI. Dari teknik storytelling profil diri, rekam jejak kegiatan, hingga justifikasi kuat memilih prodi tujuan.',
    category: 'PPKB UI',
    readTime: '8 menit baca',
    date: '26 Oktober 2026',
    author: {
      name: 'Kak Nabila FK UI',
      role: 'Mentor Review Essay PPKB UI',
      avatar: '/ptn-logos/ui.png',
    },
    featured: true,
    tags: ['PPKB UI', 'Personal Statement', 'Essay Motivasi', 'Vokasi & Sarjana'],
  },
  {
    slug: 'jalur-ketua-osis-sjp-ipb-kriteria-portofolio',
    title: 'Jalur Seleksi Ketua OSIS (SJP IPB): Syarat, Kriteria Sertifikat & Wawancara',
    excerpt: 'Punya pengalaman memimpin organisasi sekolah? Simak tata cara penyusunan portofolio kepemimpinan, surat rekomendasi kepala sekolah, dan sesi pembekalan IPB.',
    category: 'SJP IPB',
    readTime: '5 menit baca',
    date: '24 Oktober 2026',
    author: {
      name: 'Kak Farhan Alumni IPB',
      role: 'Mentor Lulusan SJP IPB',
      avatar: '/ptn-logos/ipb.png',
    },
    tags: ['SJP IPB', 'Ketua OSIS', 'Kepemimpinan', 'Jalur Non-Tes IPB'],
  },
  {
    slug: 'pbub-ugm-kategori-prestasi-dan-sertifikat',
    title: 'PBUB UGM: Cara Memaksimalkan Sertifikat Olimpiade, Olahraga, dan Seni Budaya',
    excerpt: 'Panduan memvalidasi sertifikat juara tingkat provinsi/nasional, pengesahan Puspresnas, dan cara mengisi formulir prestasi seleksi bibit unggul UGM.',
    category: 'PBUB UGM',
    readTime: '7 menit baca',
    date: '22 Oktober 2026',
    author: {
      name: 'Kak Dimas Teknik UGM',
      role: 'Mentor PBUB UGM Medali Sains',
      avatar: '/ptn-logos/ugm.png',
    },
    tags: ['PBUB UGM', 'Bibit Unggul', 'Sertifikat Juara', 'Puspresnas'],
  },
  {
    slug: '5-kesalahan-fatal-essay-seleksi-non-tes',
    title: '5 Kesalahan Fatal Saat Membuat Esai Masuk PTN yang Sering Menggugurkan Siswa',
    excerpt: 'Hindari klise berlebihan, paragraf tanpa bukti konkret, serta kurangnya riset kurikulum jurusan yang membuat reviewer langsung mendiskualifikasi berkasmu.',
    category: 'Essay & Portofolio',
    readTime: '6 menit baca',
    date: '20 Oktober 2026',
    author: {
      name: 'Kak Sarah Alumni ITB',
      role: 'Lead Essay Reviewer otwptn',
      avatar: '/ptn-logos/itb.png',
    },
    tags: ['Review Essay', 'Koreksi Esai', 'Struktur Tulisan', 'Review AI'],
  },
  {
    slug: 'apa-itu-snbp',
    title: 'Apa itu SNBP? Panduan Lengkap Seleksi Nasional Berdasarkan Prestasi 2026',
    excerpt: 'Penjelasan resmi skema SNBP 2026: komponen 50% rata-rata nilai rapor seluruh mapel, 50% mapel pendukung prodi, prestasi kurasi Puspresnas, serta aturan baru seleksi nasional.',
    category: 'SNBP',
    readTime: '7 menit baca',
    date: '29 Oktober 2026',
    author: {
      name: 'Tim Riset Akademik otwptn',
      role: 'Spesialis Kebijakan SNPMB',
      avatar: '/mascot-hd/kalkulator-peluang.png',
    },
    featured: true,
    tags: ['Apa itu SNBP', 'SNBP 2026', 'SNPMB', 'Nilai Rapor', 'Seleksi Nasional'],
  },
  {
    slug: 'jalur-prestasi-2026',
    title: 'Daftar Lengkap Jalur Prestasi PTN 2026: Kriteria Sertifikat, Portofolio & Kuota',
    excerpt: 'Kumpulan jalur mandiri prestasi di UI, ITB, UGM, IPB, UNAIR, ITS, Undip, dan Unhas yang menerima sertifikat kejuaraan sains, olahraga, seni, hafalan quran, dan ketua OSIS.',
    category: 'SNBP',
    readTime: '8 menit baca',
    date: '29 Oktober 2026',
    author: {
      name: 'Kak Dimas Teknik UGM',
      role: 'Mentor PBUB UGM Medali Sains',
      avatar: '/ptn-logos/ugm.png',
    },
    tags: ['Jalur Prestasi 2026', 'Sertifikat Juara', 'Puspresnas', 'Prestasi PTN'],
  },
  {
    slug: 'jalur-essay-2026',
    title: 'Jalur Masuk PTN Lewat Essay 2026: Syarat Personal Statement & Kampus Tujuan',
    excerpt: 'Panduan menembus PTN top yang mensyaratkan essay motivasi atau esai komitmen diri seperti PPKB UI, Talent Scouting, IUP UGM, dan Seleksi Mandiri Unair.',
    category: 'Essay & Portofolio',
    readTime: '6 menit baca',
    date: '28 Oktober 2026',
    author: {
      name: 'Kak Sarah Alumni ITB',
      role: 'Lead Essay Reviewer otwptn',
      avatar: '/ptn-logos/itb.png',
    },
    tags: ['Jalur Essay 2026', 'Personal Statement', 'PPKB UI', 'Review Essay'],
  },
  {
    slug: 'syarat-snbp',
    title: 'Syarat Lengkap Siswa Eligible SNBP 2026: Kuota Akreditasi Sekolah & Mapel Pendukung',
    excerpt: 'Ketahui kriteria penetapan kuota siswa eligible (Akreditasi A: 40%, B: 25%, C: 5%), pemeringkatan nilai rapor oleh sekolah, dan persyaratan portofolio bidang seni & olahraga.',
    category: 'SNBP',
    readTime: '5 menit baca',
    date: '27 Oktober 2026',
    author: {
      name: 'Kak Rifqi Alumni UI',
      role: 'Mentor Senior Jalur Prestasi UI',
      avatar: '/ptn-logos/ui.png',
    },
    tags: ['Syarat SNBP', 'Siswa Eligible', 'Akreditasi Sekolah', 'Aturan SNBP'],
  },
  {
    slug: 'cara-daftar-snbp',
    title: 'Cara Daftar SNBP 2026: Panduan Step-by-Step Registrasi Akun SNPMB Hingga Finalisasi',
    excerpt: 'Tutorial lengkap pendaftaran SNBP melalui portal SNPMB: pembuatan akun, verifikasi data PDSS, pemilihan 2 program studi, upload berkas prestasi, dan pencetakan kartu tanda peserta.',
    category: 'SNBP',
    readTime: '7 menit baca',
    date: '27 Oktober 2026',
    author: {
      name: 'Kak Nabila FK UI',
      role: 'Mentor Bimbingan SNPMB',
      avatar: '/ptn-logos/ui.png',
    },
    tags: ['Cara Daftar SNBP', 'Portal SNPMB', 'Finalisasi SNBP', 'Pilihan Prodi'],
  },
  {
    slug: 'cara-hitung-peluang-masuk-ptn-tanpa-tes',
    title: 'Cara Akurat Menghitung Peluang Masuk PTN Tanpa Tes: Faktor Bobot Sekolah & Alumni',
    excerpt: 'Kalkulasi peluang tidak hanya dari nilai rata-rata. Pahami peran indeks sekolah, rekam jejak alumni di PTN tujuan, dan kuota daya tampung terbaru.',
    category: 'Strategi Rapor',
    readTime: '5 menit baca',
    date: '18 Oktober 2026',
    author: {
      name: 'Tim Riset Akademik otwptn',
      role: 'Data Analyst PTN Non-Tes',
      avatar: '/mascot-hd/kalkulator-peluang.png',
    },
    tags: ['Kalkulator Peluang', 'Indeks Sekolah', 'Daya Tampung PTN', 'Rapor Ideal'],
  },
]
