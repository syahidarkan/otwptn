export interface Article {
  slug: string
  title: string
  excerpt: string
  category: 'SNBP' | 'PPKB UI' | 'SJP IPB' | 'PBUB UGM' | 'Essay & Portofolio' | 'Strategi Rapor' | 'Jalur Khusus & Prestasi' | 'Fitur & Ekosistem' | 'Program & Karir'
  readTime: string
  date: string
  author: {
    name: string
    role: string
    avatar: string
  }
  featured?: boolean
  tags: string[]
  faqs?: { q: string; a: string }[]
}

export const ARTICLES: Article[] = [
  // =========================================================================
  // 1. SNBP 2026 ARTICLES (DITEMPATKAN DI POSISI PALING ATAS SESUAI PERMINTAAN USER)
  // =========================================================================
  {
    slug: 'cara-daftar-snbp',
    title: 'Cara Daftar SNBP 2026: Panduan Alur Resmi Portal SNPMB, Kuota Eligible & Tips Lolos',
    excerpt: 'Panduan lengkap cara daftar SNBP 2026 di portal resmi SNPMB: alur registrasi akun siswa, syarat kuota eligible (akreditasi A 40%, B 25%), pemilihan prodi, upload 3 sertifikat prestasi, hingga simpan permanen.',
    category: 'SNBP',
    readTime: '7 menit baca',
    date: '20 November 2026',
    author: {
      name: 'Kak Nabila FK UI',
      role: 'Mentor Bimbingan SNPMB',
      avatar: '/ptn-logos/ui.png',
    },
    featured: true,
    tags: ['Cara Daftar SNBP', 'Pendaftaran SNBP', 'SNBP 2026', 'Alur SNBP', 'Daftar Akun SNBP', 'Kuota Eligible Akreditasi A', 'Portal SNPMB', 'Finalisasi SNBP', 'Syarat SNBP'],
    faqs: [
      {
        q: 'Bagaimana alur dan cara daftar SNBP 2026 di portal resmi SNPMB?',
        a: 'Alur resmi pendaftaran SNBP 2026 terdiri dari: (1) Registrasi Akun SNPMB Siswa dengan NISN, NPSN, dan tanggal lahir di portal-snpmb.bppp.kemdikbud.go.id; (2) Verifikasi email dan simpan permanen akun SNPMB; (3) Penetapan siswa eligible oleh sekolah sesuai kuota akreditasi; (4) Pengisian dan finalisasi nilai PDSS oleh sekolah; (5) Login siswa ke portal SNBP untuk memilih maksimal 2 program studi; (6) Pengunggahan portofolio seni/olahraga (jika ada) dan maksimal 3 sertifikat prestasi; (7) Finalisasi simpan permanen dan pencetakan Kartu Tanda Peserta SNBP.',
      },
      {
        q: 'Berapa persen kuota siswa eligible SNBP untuk akreditasi A, B, dan C?',
        a: 'Berdasarkan regulasi resmi BPPP SNPMB: Sekolah dengan Akreditasi A berhak mendaftarkan 40% siswa terbaik di jurusannya, Akreditasi B berhak mendaftarkan 25% siswa terbaik, dan Akreditasi C serta lainnya berhak mendaftarkan 5% siswa terbaik berdasarkan nilai rapor semester 1 s.d. 5.',
      },
      {
        q: 'Apakah siswa yang lolos SNBP 2026 boleh ikut UTBK-SNBT atau Seleksi Mandiri?',
        a: 'TIDAK BOLEH. Siswa yang dinyatakan lulus seleksi SNBP 2026 secara otomatis diblokir sistem untuk mendaftar UTBK-SNBT 2026 maupun Jalur Mandiri di seluruh PTN se-Indonesia. Pastikan kamu hanya memilih jurusan yang 100% siap kamu ambil.',
      },
      {
        q: 'Berapa sertifikat prestasi maksimal yang bisa diunggah pada pendaftaran SNBP?',
        a: 'Setiap siswa diperbolehkan mengunggah MAKSIMAL 3 SERTIFIKAT PRESTASI terbaik (tingkat internasional, nasional, provinsi, atau kabupaten/kota dari lembaga kredibel seperti Puspresnas Kemendikbudristek). Pilihlah sertifikat yang paling linear dan relevan dengan program studi yang kamu pilih.',
      },
      {
        q: 'Apa aturan pemilihan program studi dan PTN pada SNBP 2026?',
        a: 'Siswa dapat memilih maksimal 2 program studi dari satu PTN atau dua PTN berbeda. Jika memilih dua program studi, salah satu program studi WAJIB berada di PTN pada provinsi yang sama dengan SMA/SMK/MA asal sekolahmu. Jika hanya memilih satu program studi, bebas memilih PTN di provinsi mana pun di Indonesia.',
      },
      {
        q: 'Kapan jadwal pembuatan akun SNPMB dan pendaftaran SNBP 2026 dibuka?',
        a: 'Registrasi Akun SNPMB Siswa dijadwalkan dibuka mulai awal Januari 2026 hingga pertengahan Februari 2026. Pendaftaran resmi SNBP dibuka pada pertengahan Februari 2026 dan pengumuman hasil kelulusan diumumkan pada akhir Maret 2026.',
      },
    ],
  },
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
    tags: ['SNBP 2026', 'Rapor Semester 1-5', 'Mata Pelajaran Pendukung', 'Peluang Lolos', 'Strategi SNBP'],
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
    featured: true,
    tags: ['Syarat SNBP', 'Siswa Eligible', 'Kuota Eligible Akreditasi A', 'Akreditasi Sekolah', 'Aturan SNBP 2026', 'Mapel Pendukung SNBP'],
    faqs: [
      {
        q: 'Apa saja syarat utama siswa agar bisa mendaftar SNBP 2026?',
        a: 'Syarat utama pendaftaran SNBP 2026 meliputi: (1) Siswa SMA/MA/SMK kelas terakhir (lulusan tahun 2026) dengan prestasi unggul; (2) Memiliki NISN aktif dan terdaftar di Dapodik/EMIS; (3) Memiliki nilai rapor semester 1 s.d. 5 yang telah difinalisasi di PDSS oleh sekolah; (4) Masuk kuota siswa eligible sekolah; (5) Memiliki akun SNPMB Siswa yang sudah disimpan permanen; (6) Mengunggah portofolio resmi bagi pemilih prodi seni atau olahraga.',
      },
      {
        q: 'Bagaimana kriteria pemeringkatan siswa eligible oleh sekolah?',
        a: 'Pemeringkatan siswa eligible dilakukan oleh pihak sekolah dengan memperhitungkan nilai rata-rata semua mata pelajaran semester 1 sampai 5. Jika terdapat nilai yang sama, sekolah berhak menambahkan kriteria kualifikasi lain berupa prestasi lomba akademik maupun non-akademik yang terverifikasi.',
      },
    ],
  },
  {
    slug: 'cara-hitung-rata-rata-nilai-rapor-snbp',
    title: 'Cara Menghitung Rata-Rata Nilai Rapor SNBP 2026: Rumus Komponen 1 & Mapel Pendukung',
    excerpt: 'Simulasi perhitungan nilai rapor semester 1-5 untuk seleksi SNBP 2026: pembobotan 50% seluruh mapel, 50% mapel pendukung prodi, serta konversi skala penilaian sekolah.',
    category: 'SNBP',
    readTime: '6 menit baca',
    date: '20 November 2026',
    author: {
      name: 'Kak Sarah Alumni ITB',
      role: 'Lead Data Analyst otwptn',
      avatar: '/ptn-logos/itb.png',
    },
    featured: true,
    tags: ['Nilai Rapor SNBP', 'Cara Hitung Nilai SNBP', 'Mapel Pendukung SNBP', 'Rumus SNBP', 'Rasionalisasi SNBP'],
    faqs: [
      {
        q: 'Bagaimana rumus pembagian komponen penilaian rapor di SNBP 2026?',
        a: 'Penilaian SNBP 2026 dibagi atas dua komponen utama: Komponen 1 (minimal 50%) dihitung dari rata-rata seluruh mata pelajaran dari semester 1 sampai 5. Komponen 2 (maksimal 50%) dihitung dari nilai 2 mata pelajaran pendukung prodi pilihan, ditambah sertifikat prestasi (maksimal 3) dan/atau portofolio.',
      },
      {
        q: 'Apakah nilai rapor yang naik terus (tren positif) selalu menjamin kelolosan?',
        a: 'Tren nilai positif sangat disukai PTN, namun kelolosan juga dipengaruhi oleh indeks sekolahmu (akreditasi, track record alumni di PTN tersebut), rankingmu di antara sesama pendaftar satu sekolah, dan keketatan daya tampung prodi yang dipilih.',
      },
    ],
  },
  {
    slug: 'sertifikat-yang-bisa-lolos-snbp-puspresnas',
    title: 'Jenis Sertifikat yang Diakui Lolos SNBP 2026: Puspresnas vs Non-Puspresnas & Cara Kurasi 3 Terbaik',
    excerpt: 'Panduan kurasi 3 sertifikat prestasi maksimal SNBP: bobot sertifikat tingkat internasional, nasional (OSN/O2SN/FLS2N), provinsi, serta trik sertifikat kepengurusan organisasi.',
    category: 'SNBP',
    readTime: '7 menit baca',
    date: '20 November 2026',
    author: {
      name: 'Kak Dimas Teknik UGM',
      role: 'Mentor PBUB UGM Medali Sains',
      avatar: '/ptn-logos/ugm.png',
    },
    tags: ['Sertifikat SNBP', 'Sertifikat Puspresnas', 'Prestasi SNBP', 'Kurasi Sertifikat', 'Bobot Sertifikat SNBP'],
    faqs: [
      {
        q: 'Sertifikat lomba apa saja yang memiliki bobot tertinggi di SNBP?',
        a: 'Sertifikat dari ajang resmi Puspresnas / BPTI Kemendikbudristek (seperti OSN, O2SN, FLS2N, OPSI, LDBI, NSDC) menempati prioritas tertinggi. Disusul oleh kejuaraan kedinasan kementerian lain, KONI/PON, dan lomba tingkat universitas terakreditasi.',
      },
      {
        q: 'Apakah sertifikat peserta seminar atau webinar bisa diunggah di SNBP?',
        a: 'Sangat TIDAK disarankan. Sistem SNBP hanya memprioritaskan sertifikat kejuaraan/prestasi (Juara 1, 2, 3 atau Harapan/Finalis). Sertifikat keikutsertaan webinar atau peserta biasa tidak memberikan nilai tambah signifikan dan membuang kuota 3 slot unggahan.',
      },
    ],
  },
  {
    slug: 'kesalahan-fatal-pendaftaran-snbp-gagal-lolos',
    title: '7 Kesalahan Fatal Pendaftaran SNBP yang Sering Bikin Siswa Pintar Gagal Lolos PTN',
    excerpt: 'Hindari kesalahan tabrakan jurusan satu sekolah, salah input NISN/NPSN, salah pilih prodi lintas provinsi, hingga salah unggah format portofolio yang berakibat gugur administrasi.',
    category: 'SNBP',
    readTime: '6 menit baca',
    date: '20 November 2026',
    author: {
      name: 'Kak Rifqi Alumni UI',
      role: 'Mentor Senior Jalur Prestasi UI',
      avatar: '/ptn-logos/ui.png',
    },
    tags: ['Kesalahan SNBP', 'Penyebab Gagal SNBP', 'Tips Lolos SNBP', 'Aturan SNBP 2026', 'Strategi Pilihan Prodi'],
  },
  {
    slug: 'perbedaan-snbp-dan-snbt-2026-panduan-lengkap',
    title: 'Perbedaan SNBP dan SNBT 2026: Syarat, Sistem Seleksi, Aturan Pemblokiran & Kuota PTN',
    excerpt: 'Perbandingan lengkap jalur SNBP vs SNBT 2026: kuota minimal, timeline pendaftaran, biaya seleksi, materi ujian, serta aturan ketat larangan ikut UTBK jika sudah lulus SNBP.',
    category: 'SNBP',
    readTime: '5 menit baca',
    date: '20 November 2026',
    author: {
      name: 'Kak Nabila FK UI',
      role: 'Mentor Bimbingan SNPMB',
      avatar: '/ptn-logos/ui.png',
    },
    tags: ['Perbedaan SNBP dan SNBT', 'SNBP vs SNBT', 'Jalur Masuk PTN', 'SNBT 2026', 'SNPMB 2026'],
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
      avatar: '/avatars/avatar-7.png',
    },
    tags: ['Apa itu SNBP', 'SNBP 2026', 'SNPMB', 'Nilai Rapor', 'Seleksi Nasional'],
  },
  {
    slug: 'komponen-penilaian-snbp-2026-resmi',
    title: 'Penilaian SNBP 2026 Apa Saja? Cek Bobot Rapor, Mapel Pendukung, Portofolio & TKA',
    excerpt: 'Penjelasan lengkap kepanjangan SNBP, komponen penilaian 50% rata-rata rapor + maksimal 50% dua mapel pendukung prodi, syarat akreditasi sekolah, serta cek peluang gratis.',
    category: 'SNBP',
    readTime: '6 menit baca',
    date: '12 November 2026',
    author: {
      name: 'Kak Rifqi Alumni UI',
      role: 'Mentor Senior Jalur Prestasi UI',
      avatar: '/ptn-logos/ui.png',
    },
    tags: ['Penilaian SNBP Apa Saja', 'Kepanjangan SNBP', 'Apa Itu SNBP 2026', 'Persyaratan SNBP 2026'],
  },
  {
    slug: 'cara-buat-akun-snpmb-dan-daftar-snbp-2026',
    title: 'Cara Buat Akun SNPMB 2026 & Daftar SNBP dari Awal Sampai Finalisasi Kartu',
    excerpt: 'Panduan langkah demi langkah registrasi akun portal SNPMB siswa, verifikasi NISN & NPSN, simpan permanen, hingga cara daftar SNBP 2026 tanpa gagal.',
    category: 'SNBP',
    readTime: '6 menit baca',
    date: '12 November 2026',
    author: {
      name: 'Kak Rifqi Alumni UI',
      role: 'Mentor Senior Jalur Prestasi UI',
      avatar: '/ptn-logos/ui.png',
    },
    tags: ['Daftar SNPMB', 'Buat Akun SNPMB', 'Cara Daftar SNBP', 'Portal SNPMB 2026', 'Akun SNBP'],
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

  // =========================================================================
  // 2. JALUR PRESTASI SPESIFIK KAMPUS (UI, IPB, UGM) & ESSAY
  // =========================================================================
  {
    slug: 'sjp-ui-jalur-prestasi-masuk-ui-tanpa-tes',
    title: 'SJP UI (Seleksi Jalur Prestasi UI / Japres UI): Panduan Resmi Masuk UI Tanpa Tes 2026',
    excerpt: 'Kupas tuntas SJP UI (Seleksi Jalur Prestasi UI / Japres UI): jalur mandiri resmi Universitas Indonesia berbasis juara olimpiade sains (OSN), olahraga, seni, dan bakat tanpa ujian tulis.',
    category: 'PPKB UI',
    readTime: '7 menit baca',
    date: '20 November 2026',
    author: {
      name: 'Kak Rifqi Alumni UI',
      role: 'Mentor Senior Jalur Prestasi UI',
      avatar: '/ptn-logos/ui.png',
    },
    tags: ['SJP UI', 'SJP UI 2026', 'Japres UI', 'Seleksi Jalur Prestasi UI', 'Jalur Prestasi UI', 'PPKB UI', 'PIN IPB', 'Masuk UI Tanpa Tes'],
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
    slug: 'pbub-ugm-adalah-syarat-jadwal-tips-lolos',
    title: 'PBUB UGM Adalah: Pengertian, Syarat Sertifikat Juara, Jadwal & Tips Lolos Tanpa Tes',
    excerpt: 'Mengenal Penelusuran Bibit Unggul Berprestasi (PBUB) UGM jalur Iptek, Olahraga, dan Seni. Cek level kejuaraan minimal, nilai rapor KKM, hingga panduan portofolio.',
    category: 'PBUB UGM',
    readTime: '7 menit baca',
    date: '12 November 2026',
    author: {
      name: 'Kak Dimas Teknik UGM',
      role: 'Mentor PBUB UGM Medali Sains',
      avatar: '/ptn-logos/ugm.png',
    },
    tags: ['PBUB Adalah', 'PBUB UGM 2026', 'Jalur Prestasi UGM', 'Sertifikat PBUB'],
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

  // =========================================================================
  // 3. STRATEGI RAPOR & JALUR KHUSUS
  // =========================================================================
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
      avatar: '/avatars/avatar-7.png',
    },
    tags: ['Kalkulator Peluang', 'Indeks Sekolah', 'Daya Tampung PTN', 'Rapor Ideal'],
  },
  {
    slug: 'jalur-nilai-rapor-tanpa-tes-ptn',
    title: 'Daftar Seleksi Mandiri PTN Menggunakan Nilai Rapor Tanpa Tes Tulis 2026',
    excerpt: 'Kumpulan seleksi mandiri PTN yang 100% menggunakan nilai rapor semester 1-5 tanpa ujian tulis: PPKB UI, Talent Scouting, SMUP Unpad Rapor, Seleksi Prestasi Undip, dan Nilai Rapor ITB.',
    category: 'Strategi Rapor',
    readTime: '8 menit baca',
    date: '29 Oktober 2026',
    author: {
      name: 'Kak Rifqi Alumni UI',
      role: 'Mentor Senior Jalur Prestasi UI',
      avatar: '/ptn-logos/ui.png',
    },
    tags: ['Jalur Nilai Rapor', 'Seleksi Mandiri Rapor', 'PPKB UI', 'SMUP Unpad', 'Nilai Rapor ITB'],
  },
  {
    slug: 'panduan-masuk-ptn-tanpa-tes-lengkap',
    title: 'Panduan Terlengkap Masuk PTN Impian Tanpa Ujian: Semua Jalur Non-Tes dari A sampai Z',
    excerpt: 'Masterlist jalur masuk PTN non-tes 2026: SNBP nasional, seleksi prestasi daerah, jalur ketua OSIS, tahfidz quran, pramuka, olimpiade sains, hingga seleksi essay motivasi.',
    category: 'Jalur Khusus & Prestasi',
    readTime: '10 menit baca',
    date: '31 Oktober 2026',
    author: {
      name: 'Tim Riset Akademik otwptn',
      role: 'Spesialis Seleksi Masuk PTN Non-Tes',
      avatar: '/avatars/avatar-7.png',
    },
    tags: ['Masuk PTN Tanpa Tes', 'Jalur Non-Tes PTN', 'SNBP 2026', 'Jalur Prestasi', 'Panduan Lengkap PTN'],
  },
  {
    slug: 'jalur-tahfidz-quran-ptn',
    title: 'Daftar PTN Jalur Tahfidz Quran 2026: Syarat Minimal Hafalan Juz & Kampus Favorit',
    excerpt: 'Ketahui perguruan tinggi negeri yang membuka jalur khusus penghafal Al-Quran (5, 10, 20, hingga 30 juz) seperti UNAIR, Undip, ITS, UGM, dan Unhas tanpa ujian tulis.',
    category: 'Jalur Khusus & Prestasi',
    readTime: '7 menit baca',
    date: '30 Oktober 2026',
    author: {
      name: 'Tim Riset Akademik otwptn',
      role: 'Spesialis Jalur Keagamaan & Prestasi',
      avatar: '/avatars/avatar-7.png',
    },
    tags: ['Jalur Tahfidz', 'Tahfidz Quran PTN', 'Penghafal Quran', 'Masuk PTN Tanpa Tes', 'UNAIR Golden Ticket'],
  },
  {
    slug: 'jalur-pramuka-garuda-ptn',
    title: 'Jalur Masuk PTN Pramuka Garuda 2026: Syarat Sertifikat, Portofolio & Kuota Kampus',
    excerpt: 'Panduan menembus PTN melalui rekam jejak kepanduan Pramuka Garuda. Informasi syarat portofolio tingkatan penegak garuda, surat rekomendasi Kwartir, dan seleksi IPB University.',
    category: 'Jalur Khusus & Prestasi',
    readTime: '6 menit baca',
    date: '30 Oktober 2026',
    author: {
      name: 'Kak Farhan Alumni IPB',
      role: 'Mentor Seleksi Jalur Prestasi IPB',
      avatar: '/ptn-logos/ipb.png',
    },
    tags: ['Jalur Pramuka', 'Pramuka Garuda', 'Jalur Non-Tes IPB', 'Sertifikat Kepanduan'],
  },
  {
    slug: 'daftar-ptn-jalur-pramuka-garuda-2026',
    title: 'Daftar Lengkap PTN Penerima Jalur Pramuka Garuda 2026: Syarat SK Kwartir & Tips Lolos',
    excerpt: 'Punya piagam Pramuka Garuda atau pengalaman Raimuna Nasional? Cek daftar PTN penerima jalur prestasi Pramuka (IPB, UNY, UNS, UNESA, UIN, dll) serta berkas wajibnya.',
    category: 'Jalur Khusus & Prestasi',
    readTime: '7 menit baca',
    date: '12 November 2026',
    author: {
      name: 'Tim Riset Akademik otwptn',
      role: 'Spesialis Seleksi Masuk PTN Non-Tes',
      avatar: '/avatars/avatar-7.png',
    },
    tags: ['Jalur Pramuka Garuda', 'Pramuka Garuda PTN 2026', 'Jalur Prestasi Pramuka', 'SJP IPB', 'SM UNS'],
  },
  {
    slug: 'jalur-ketua-osis-kepemimpinan',
    title: 'Daftar Kampus yang Membuka Jalur Ketua OSIS 2026: Syarat & Tips Portofolio',
    excerpt: 'Daftar lengkap perguruan tinggi negeri yang mengapresiasi jiwa kepemimpinan pelajar: SJP IPB, SMUP Unpad, hingga Seleksi Mandiri Prestasi UNAIR dan UNS.',
    category: 'Jalur Khusus & Prestasi',
    readTime: '6 menit baca',
    date: '30 Oktober 2026',
    author: {
      name: 'Kak Farhan Alumni IPB',
      role: 'Mentor Lulusan SJP IPB',
      avatar: '/ptn-logos/ipb.png',
    },
    tags: ['Jalur Ketua OSIS', 'Kepemimpinan Siswa', 'SJP IPB', 'SMUP Unpad', 'Portofolio OSIS'],
  },
  {
    slug: 'jalur-prestasi-olahraga-seni-fls2n-o2sn',
    title: 'Panduan Lolos Jalur Prestasi Olahraga & Seni PTN 2026: Validasi Sertifikat Puspresnas',
    excerpt: 'Cara memanfaatkan sertifikat juara O2SN, FLS2N, PON, POPNAS, dan kejuaraan nasional untuk menembus prodi impian di UI, UGM, Undip, dan Unair tanpa ujian tulis.',
    category: 'Jalur Khusus & Prestasi',
    readTime: '7 menit baca',
    date: '29 Oktober 2026',
    author: {
      name: 'Kak Dimas Teknik UGM',
      role: 'Mentor PBUB UGM Medali Sains',
      avatar: '/ptn-logos/ugm.png',
    },
    tags: ['Jalur Prestasi Olahraga', 'FLS2N', 'O2SN', 'Seni Budaya', 'PBUB UGM', 'Puspresnas'],
  },

  // =========================================================================
  // 4. FITUR & EKOSISTEM OTWPTN
  // =========================================================================
  {
    slug: 'otbee-tv-belajar-bareng-study-cam-pejuang-ptn',
    title: 'Otbee TV: Fitur Video Call & Study Cam 24 Jam Bareng Pejuang Masuk PTN Se-Indonesia',
    excerpt: 'Lawan rasa malas dan sepi belajar! Fitur Otbee TV hadir sebagai virtual study room dan video matching pejuang SNBP & jalur mandiri prestasi dengan pengawasan aman.',
    category: 'Fitur & Ekosistem',
    readTime: '5 menit baca',
    date: '20 November 2026',
    author: {
      name: 'Tim Produk & Komunitas otwptn',
      role: 'Pengembang Ekosistem Belajar',
      avatar: '/avatars/avatar-4.png',
    },
    tags: ['Otbee TV', 'Study Cam PTN', 'Study With Me', 'Video Call Belajar', 'Komunitas SNBP'],
  },
  {
    slug: 'penyimpanan-dokumen-persiapan-jalur-non-tes-ptn',
    title: 'Penyimpanan Dokumen OtwPTN: Amankan Berkas Rapor, Portofolio & Sertifikat Masuk PTN',
    excerpt: 'Jangan sampai gagal seleksi cuma karena berkas scan rapor tercecer atau sertifikat hilang saat pendaftaran dibuka. Simpan dan kurasi dokumenmu di cloud vault terenkripsi.',
    category: 'Fitur & Ekosistem',
    readTime: '5 menit baca',
    date: '20 November 2026',
    author: {
      name: 'Tim Riset Akademik otwptn',
      role: 'Kurator Portofolio & Dokumen',
      avatar: '/avatars/avatar-7.png',
    },
    tags: ['Penyimpanan Dokumen PTN', 'Upload Sertifikat SNBP', 'Berkas PPKB UI', 'Portofolio Non-Tes'],
  },
  {
    slug: 'tracking-jalur-non-tes-ptn-timeline-kalender-resmi',
    title: 'Tracking Jalur Non-Tes PTN: Kalender & Timeline Pendaftaran SNBP, PPKB UI, PBUB UGM 2026',
    excerpt: 'Pantau lebih dari 50+ jadwal pembukaan jalur prestasi seluruh PTN se-Indonesia. Dapatkan reminder deadline otomatis agar tidak ada satu pun peluang kampus impian yang terlewat.',
    category: 'Fitur & Ekosistem',
    readTime: '6 menit baca',
    date: '20 November 2026',
    author: {
      name: 'Kak Sarah Alumni ITB',
      role: 'Lead Essay Reviewer otwptn',
      avatar: '/ptn-logos/itb.png',
    },
    tags: ['Tracking Jalur PTN', 'Jadwal SNBP 2026', 'Kalender Pendaftaran PTN', 'Timeline Jalur Mandiri'],
  },
  {
    slug: 'game-edukasi-persiapan-ptn-baku-kalimat-padanan-kata',
    title: 'Asah Kemampuan Esai & Literasi dengan Games Interaktif OtwPTN: Baku Atau Nggak & Padanan Kata',
    excerpt: 'Bikin persiapan esai dan verbal jadi seru! Mainkan mini games edukasi Baku Atau Nggak, Benerin Kalimat, dan Padanan Kata untuk mempertajam tata bahasa esai motivasimu.',
    category: 'Fitur & Ekosistem',
    readTime: '5 menit baca',
    date: '20 November 2026',
    author: {
      name: 'Tim Edukasi & Gamifikasi otwptn',
      role: 'Spesialis Literasi Bahasa',
      avatar: '/avatars/avatar-9.png',
    },
    tags: ['Game Belajar PTN', 'Kata Baku Online', 'Latihan Literasi Bahasa', 'Game Edukasi PTN'],
  },
  {
    slug: 'komunitas-pejuang-ptn-non-tes-otwptn',
    title: 'Komunitas Pejuang PTN Non-Tes Indonesia: Ruang Diskusi, Sharing Info Rapor & Saling Semangat',
    excerpt: 'Bergabung dengan ribuan pejuang SNBP dan jalur prestasi dari berbagai kota. Bahas strategi prodi, tukar pengalaman sertifikat juara, dan diskusi langsung dengan mentor alumni.',
    category: 'Fitur & Ekosistem',
    readTime: '5 menit baca',
    date: '20 November 2026',
    author: {
      name: 'Kak Nabila FK UI',
      role: 'Mentor Review Essay PPKB UI',
      avatar: '/ptn-logos/ui.png',
    },
    tags: ['Komunitas Pejuang PTN', 'Grup Diskusi SNBP', 'Forum Masuk PTN', 'Networking Siswa SMA'],
  },

  // =========================================================================
  // 5. PROGRAM & KARIR OTWPTN
  // =========================================================================
  {
    slug: 'program-student-ambassador-otwptn-pelajar-sma',
    title: 'Program Student Ambassador OtwPTN: Peluang Pelajar SMA Berprestasi, Relasi Mentor & Komisi Nyata',
    excerpt: 'Jadilah perwakilan resmi OtwPTN di sekolahmu! Dapatkan sertifikat nasional, akses bimbingan mentor 1-on-1 gratis, komisi referral, dan perkuat CV portofolio kepemimpinanmu.',
    category: 'Program & Karir',
    readTime: '6 menit baca',
    date: '20 November 2026',
    author: {
      name: 'Tim People & Partnership otwptn',
      role: 'Koordinator Program Pelajar',
      avatar: '/avatars/avatar-10.png',
    },
    tags: ['Student Ambassador OtwPTN', 'Duta Pelajar SMA', 'Program Ambassador Pendidikan', 'Portofolio Kepemimpinan'],
  },
  {
    slug: 'program-content-creator-otwptn-dibayar-per-video',
    title: 'Program Content Creator OtwPTN: Bikin Konten Edukasi Masuk PTN, Dibayar per Video & Kerja Remote',
    excerpt: 'Kamu suka bikin konten TikTok atau Reels seputar kehidupan sekolah dan persiapan kuliah? Bergabunglah sebagai content creator resmi OtwPTN, dibayar per video dengan jam kerja fleksibel.',
    category: 'Program & Karir',
    readTime: '6 menit baca',
    date: '20 November 2026',
    author: {
      name: 'Tim Creative & Marketing otwptn',
      role: 'Lead Creator Partnership',
      avatar: '/avatars/avatar-5.png',
    },
    tags: ['Content Creator OtwPTN', 'Lowongan Creator TikTok', 'Kerja Remote Pelajar Mahasiswa', 'Creator Edukasi'],
  },
]
