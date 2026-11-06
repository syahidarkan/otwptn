/**
 * Direktori Lengkap Fakultas & Jurusan PTN se-Indonesia
 * Mendukung Onboarding 4 Pilihan dan Auto-Match Engine OtwPTN.
 * 
 * Aturan Hierarki Auto-Match:
 * 1. Jalur Target Sama (SNBP, PPKB, Prestasi, IUP, dsb)
 * 2. Fakultas Sama (FK, FT, FEB, Fasilkom/STEI, FH, FISIP, dll)
 * 3. Jurusan / Program Studi Sama
 * 4. Workload Balancing (Beban Mentee Aktif)
 */

export interface FacultyData {
  name: string
  majors: string[]
}

export interface PtnDirectory {
  code: string
  name: string
  faculties: FacultyData[]
}

// ── Standard Fallback Faculties (Berlaku untuk semua PTN) ───────────────────
export const STANDARD_FACULTIES: FacultyData[] = [
  {
    name: 'Fakultas Kedokteran',
    majors: ['Pendidikan Dokter / Kedokteran Umum', 'Ilmu Gizi', 'Fisioterapi', 'Kebidanan', 'Radiologi'],
  },
  {
    name: 'Fakultas Kedokteran Gigi',
    majors: ['Pendidikan Dokter Gigi', 'Higiene Gigi'],
  },
  {
    name: 'Fakultas Farmasi',
    majors: ['Farmasi Klinis & Komunitas', 'Farmasi Bahan Alam & Industri'],
  },
  {
    name: 'Fakultas Ilmu Komputer / Teknologi Informasi',
    majors: [
      'Ilmu Komputer',
      'Teknik Informatika',
      'Sistem Informasi',
      'Teknik Komputer',
      'Teknologi Informasi',
      'Sains Data',
      'Rekayasa Perangkat Lunak',
    ],
  },
  {
    name: 'Fakultas Teknik',
    majors: [
      'Teknik Sipil',
      'Teknik Mesin',
      'Teknik Elektro',
      'Teknik Kimia',
      'Teknik Industri',
      'Teknik Lingkungan',
      'Arsitektur',
      'Perencanaan Wilayah dan Kota (PWK)',
      'Teknik Metalurgi & Material',
      'Teknik Geodesi & Geomatika',
      'Teknik Perminyakan',
      'Teknik Pertambangan',
      'Teknik Perkapalan',
      'Teknik Biomedik',
      'Teknik Nuklir',
    ],
  },
  {
    name: 'Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA)',
    majors: [
      'Matematika',
      'Statistika',
      'Sains Aktuaria',
      'Fisika',
      'Kimia',
      'Biologi',
      'Geofisika',
      'Astronomi',
      'Bioteknologi',
    ],
  },
  {
    name: 'Fakultas Ekonomi dan Bisnis (FEB)',
    majors: [
      'Manajemen',
      'Akuntansi',
      'Ilmu Ekonomi / Ekonomi Pembangunan',
      'Bisnis Digital',
      'Ekonomi Islam / Perbankan Syariah',
      'Kewirausahaan',
      'Keuangan & Perbankan',
    ],
  },
  {
    name: 'Fakultas Hukum',
    majors: ['Ilmu Hukum', 'Hukum Bisnis', 'Hukum Internasional'],
  },
  {
    name: 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP)',
    majors: [
      'Ilmu Hubungan Internasional',
      'Ilmu Komunikasi',
      'Ilmu Politik',
      'Ilmu Administrasi Publik / Negara',
      'Ilmu Administrasi Bisnis / Niaga',
      'Sosiologi',
      'Kriminologi',
      'Ilmu Kesejahteraan Sosial',
      'Antropologi Sosial',
    ],
  },
  {
    name: 'Fakultas Psikologi',
    majors: ['Psikologi'],
  },
  {
    name: 'Fakultas Ilmu Budaya / Sastra',
    majors: [
      'Sastra Indonesia',
      'Sastra Inggris',
      'Sastra Jepang',
      'Sastra Arab',
      'Sastra Perancis',
      'Sastra Jerman',
      'Sastra Korea',
      'Sastra Mandarin',
      'Ilmu Sejarah',
      'Arkeologi',
      'Filsafat',
      'Ilmu Perpustakaan',
    ],
  },
  {
    name: 'Fakultas Kesehatan Masyarakat',
    majors: ['Kesehatan Masyarakat', 'Keselamatan dan Kesehatan Kerja (K3)', 'Kesehatan Lingkungan'],
  },
  {
    name: 'Fakultas Ilmu Keperawatan',
    majors: ['Ilmu Keperawatan'],
  },
  {
    name: 'Fakultas Seni Rupa dan Desain (FSRD)',
    majors: [
      'Desain Komunikasi Visual (DKV)',
      'Desain Produk',
      'Desain Interior',
      'Seni Rupa Murni',
      'Kriya Seni',
      'Film & Televisi',
      'Animasi',
    ],
  },
  {
    name: 'Fakultas Pertanian',
    majors: [
      'Agroteknologi / Agronomi',
      'Agribisnis / Sosial Ekonomi Pertanian',
      'Ilmu Tanah',
      'Proteksi Tanaman / Hama & Penyakit',
      'Teknologi Industri Pertanian',
    ],
  },
  {
    name: 'Fakultas Peternakan',
    majors: ['Ilmu dan Industri Peternakan', 'Nutrisi dan Teknologi Pakan'],
  },
  {
    name: 'Fakultas Perikanan dan Ilmu Kelautan',
    majors: [
      'Akuakultur / Budidaya Perairan',
      'Manajemen Sumberdaya Perairan',
      'Teknologi Hasil Perikanan',
      'Pemanfaatan Sumberdaya Perikanan',
      'Oseanografi / Ilmu Kelautan',
    ],
  },
  {
    name: 'Fakultas Kehutanan',
    majors: ['Kehutanan', 'Konservasi Sumberdaya Hutan & Ekowisata'],
  },
  {
    name: 'Fakultas Keguruan dan Ilmu Pendidikan (FKIP / FIP)',
    majors: [
      'Pendidikan Guru SD (PGSD)',
      'Pendidikan Bahasa Inggris',
      'Pendidikan Bahasa Indonesia',
      'Pendidikan Matematika',
      'Pendidikan Biologi',
      'Pendidikan Fisika',
      'Pendidikan Kimia',
      'Pendidikan Sejarah',
      'Bimbingan & Konseling',
      'Teknologi Pendidikan',
    ],
  },
  {
    name: 'Sekolah Vokasi / Pendidikan Terapan',
    majors: [
      'Manajemen Bisnis Terapan',
      'Akuntansi Sektor Publik',
      'Teknologi Rekayasa Perangkat Lunak',
      'Teknologi Rekayasa Sipil & Bangunan Gedung',
      'Perbankan Terapan',
      'Administrasi Perpajakan',
    ],
  },
]

// ── Direktori Spesifik per PTN Unggulan ──────────────────────────────────────
export const PTN_DIRECTORY: Record<string, FacultyData[]> = {
  'Universitas Indonesia': [
    {
      name: 'Fakultas Kedokteran (FK UI)',
      majors: ['Pendidikan Dokter', 'Ilmu Gizi', 'Fisioterapi', 'Kedokteran Kelas Internasional (IUP)'],
    },
    {
      name: 'Fakultas Kedokteran Gigi (FKG UI)',
      majors: ['Pendidikan Dokter Gigi', 'Kedokteran Gigi Kelas Internasional (IUP)'],
    },
    {
      name: 'Fakultas Farmasi (FF UI)',
      majors: ['Farmasi'],
    },
    {
      name: 'Fakultas Ilmu Keperawatan (FIK UI)',
      majors: ['Ilmu Keperawatan'],
    },
    {
      name: 'Fakultas Kesehatan Masyarakat (FKM UI)',
      majors: ['Kesehatan Masyarakat', 'Ilmu Gizi Kesehatan', 'Keselamatan & Kesehatan Kerja (K3)', 'Kesehatan Lingkungan'],
    },
    {
      name: 'Fakultas Ilmu Komputer (Fasilkom UI)',
      majors: ['Ilmu Komputer', 'Sistem Informasi', 'Ilmu Komputer Kelas Internasional (IUP)'],
    },
    {
      name: 'Fakultas Teknik (FT UI)',
      majors: [
        'Teknik Sipil',
        'Teknik Mesin',
        'Teknik Elektro',
        'Teknik Metalurgi & Material',
        'Arsitektur',
        'Teknik Kimia',
        'Teknik Industri',
        'Teknik Lingkungan',
        'Teknik Perkapalan',
        'Teknik Komputer',
        'Teknik Biomedik',
        'Arsitektur Interior',
        'Teknik Sipil Kelas Internasional (IUP)',
        'Teknik Mesin Kelas Internasional (IUP)',
        'Teknik Elektro Kelas Internasional (IUP)',
        'Teknik Metalurgi Kelas Internasional (IUP)',
        'Arsitektur Kelas Internasional (IUP)',
        'Teknik Kimia Kelas Internasional (IUP)',
        'Teknik Industri Kelas Internasional (IUP)',
        'Teknik Biomedik Kelas Internasional (IUP)',
      ],
    },
    {
      name: 'Fakultas Matematika dan IPA (FMIPA UI)',
      majors: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Geofisika', 'Geografi', 'Statistika', 'Ilmu Aktuaria'],
    },
    {
      name: 'Fakultas Hukum (FH UI)',
      majors: ['Ilmu Hukum', 'Ilmu Hukum Kelas Internasional (IUP)'],
    },
    {
      name: 'Fakultas Ekonomi dan Bisnis (FEB UI)',
      majors: [
        'Ilmu Ekonomi',
        'Manajemen',
        'Akuntansi',
        'Bisnis Islam',
        'Ilmu Ekonomi Islam',
        'Ilmu Ekonomi Kelas Internasional (IUP)',
        'Manajemen Kelas Internasional (IUP)',
        'Akuntansi Kelas Internasional (IUP)',
      ],
    },
    {
      name: 'Fakultas Psikologi (FPsi UI)',
      majors: ['Psikologi', 'Psikologi Kelas Internasional (IUP)'],
    },
    {
      name: 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP UI)',
      majors: [
        'Ilmu Komunikasi',
        'Ilmu Politik',
        'Sosiologi',
        'Kriminologi',
        'Ilmu Kesejahteraan Sosial',
        'Antropologi Sosial',
        'Ilmu Hubungan Internasional',
        'Ilmu Komunikasi Kelas Internasional (IUP)',
      ],
    },
    {
      name: 'Fakultas Ilmu Pengetahuan Budaya (FIB UI)',
      majors: [
        'Arkeologi',
        'Ilmu Sejarah',
        'Ilmu Perpustakaan',
        'Filsafat',
        'Sastra Indonesia',
        'Sastra Daerah (Jawa)',
        'Sastra Inggris',
        'Sastra Cina',
        'Sastra Jepang',
        'Sastra Arab',
        'Sastra Perancis',
        'Sastra Jerman',
        'Sastra Rusia',
      ],
    },
    {
      name: 'Fakultas Ilmu Administrasi (FIA UI)',
      majors: ['Ilmu Administrasi Publik', 'Ilmu Administrasi Bisnis', 'Ilmu Administrasi Fiskal'],
    },
    {
      name: 'Program Pendidikan Vokasi UI',
      majors: [
        'Administrasi Perpajakan',
        'Administrasi Perkantoran & Sekretari',
        'Akuntansi Terapan',
        'Hubungan Masyarakat',
        'Periklanan Kreatif',
        'Penyiaran Multimedia',
        'Manajemen Rekod & Arsip',
        'Perbankan Terapan',
        'Fisioterapi Terapan',
        'Okupasi Terapi',
        'Manajemen Rumah Sakit',
      ],
    },
  ],

  'Institut Teknologi Bandung': [
    {
      name: 'Sekolah Teknik Elektro dan Informatika (STEI ITB)',
      majors: [
        'Teknik Informatika',
        'Sistem dan Teknologi Informasi',
        'Teknik Elektro',
        'Teknik Tenaga Listrik',
        'Teknik Telekomunikasi',
        'Teknik Biomedis',
        'Informatika IUP',
        'Teknik Elektro IUP',
      ],
    },
    {
      name: 'Sekolah Bisnis dan Manajemen (SBM ITB)',
      majors: ['Manajemen', 'Kewirausahaan', 'Manajemen IUP'],
    },
    {
      name: 'Fakultas Teknik Mesin dan Dirgantara (FTMD ITB)',
      majors: ['Teknik Mesin', 'Teknik Dirgantara (Aeronautika & Astronautika)', 'Teknik Material', 'Teknik Mesin IUP', 'Teknik Dirgantara IUP'],
    },
    {
      name: 'Fakultas Teknik Sipil dan Lingkungan (FTSL ITB)',
      majors: ['Teknik Sipil', 'Teknik Lingkungan', 'Rekayasa Infrastruktur Lingkungan', 'Teknik Kelautan', 'Rekayasa Sumber Air', 'Teknik Sipil IUP', 'Teknik Lingkungan IUP'],
    },
    {
      name: 'Fakultas Teknik Pertambangan dan Perminyakan (FTTM ITB)',
      majors: ['Teknik Pertambangan', 'Teknik Perminyakan', 'Teknik Metalurgi', 'Teknik Geofisika', 'Teknik Perminyakan IUP', 'Teknik Pertambangan IUP'],
    },
    {
      name: 'Fakultas Teknologi Industri (FTI ITB)',
      majors: ['Teknik Industri', 'Teknik Kimia', 'Manajemen Rekayasa Industri', 'Teknik Pangan', 'Teknik Bioenergi & Kemurgi', 'Teknik Industri IUP', 'Teknik Kimia IUP'],
    },
    {
      name: 'Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan (SAPPK ITB)',
      majors: ['Arsitektur', 'Perencanaan Wilayah dan Kota (PWK)', 'Arsitektur IUP', 'Perencanaan Wilayah dan Kota IUP'],
    },
    {
      name: 'Fakultas Seni Rupa dan Desain (FSRD ITB)',
      majors: ['Desain Komunikasi Visual (DKV)', 'Desain Interior', 'Desain Produk', 'Seni Rupa Murni', 'Kriya Seni', 'Desain Komunikasi Visual IUP'],
    },
    {
      name: 'Fakultas Matematika dan IPA (FMIPA ITB)',
      majors: ['Matematika', 'Fisika', 'Kimia', 'Astronomi', 'Aktuaria'],
    },
    {
      name: 'Sekolah Ilmu dan Teknologi Hayati (SITH ITB)',
      majors: ['Biologi', 'Mikrobiologi', 'Rekayasa Hayati', 'Rekayasa Pertanian', 'Rekayasa Kehutanan', 'Teknologi Pasca Panen'],
    },
    {
      name: 'Sekolah Farmasi (SF ITB)',
      majors: ['Sains dan Teknologi Farmasi', 'Farmasi Klinik dan Komunitas', 'Farmasi IUP'],
    },
    {
      name: 'Fakultas Ilmu dan Teknologi Kebumian (FITB ITB)',
      majors: ['Teknik Geologi', 'Teknik Geodesi dan Geomatika', 'Meteorologi', 'Oseanografi'],
    },
  ],

  'Universitas Gadjah Mada': [
    {
      name: 'Fakultas Kedokteran, Kesehatan Masyarakat, dan Keperawatan (FK-KMK UGM)',
      majors: ['Kedokteran', 'Gizi Kesehatan', 'Ilmu Keperawatan', 'Kedokteran IUP'],
    },
    {
      name: 'Fakultas Kedokteran Gigi (FKG UGM)',
      majors: ['Kedokteran Gigi', 'Higiene Gigi', 'Kedokteran Gigi IUP'],
    },
    {
      name: 'Fakultas Kedokteran Hewan (FKH UGM)',
      majors: ['Kedokteran Hewan', 'Kedokteran Hewan IUP'],
    },
    {
      name: 'Fakultas Farmasi (FF UGM)',
      majors: ['Farmasi', 'Farmasi IUP'],
    },
    {
      name: 'Fakultas Ekonomika dan Bisnis (FEB UGM)',
      majors: ['Akuntansi', 'Ilmu Ekonomi', 'Manajemen', 'Akuntansi IUP', 'Manajemen IUP', 'Ilmu Ekonomi IUP'],
    },
    {
      name: 'Fakultas Hukum (FH UGM)',
      majors: ['Ilmu Hukum', 'Ilmu Hukum IUP'],
    },
    {
      name: 'Fakultas Teknik (FT UGM)',
      majors: [
        'Teknik Sipil',
        'Teknik Mesin',
        'Teknik Elektro',
        'Teknik Kimia',
        'Teknik Industri',
        'Arsitektur',
        'Perencanaan Wilayah dan Kota',
        'Teknik Geodesi',
        'Teknik Geologi',
        'Teknik Nuklir',
        'Teknik Fisika',
        'Teknologi Informasi',
        'Teknik Biomedis',
        'Teknik Sipil IUP',
        'Teknik Industri IUP',
        'Teknik Kimia IUP',
        'Teknologi Informasi IUP',
      ],
    },
    {
      name: 'Fakultas MIPA (FMIPA UGM)',
      majors: [
        'Ilmu Komputer',
        'Elektronika dan Instrumentasi (Elins)',
        'Statistika',
        'Matematika',
        'Fisika',
        'Geofisika',
        'Kimia',
        'Ilmu Komputer IUP',
      ],
    },
    {
      name: 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIPOL UGM)',
      majors: [
        'Ilmu Hubungan Internasional',
        'Ilmu Komunikasi',
        'Manajemen dan Kebijakan Publik',
        'Politik dan Pemerintahan',
        'Pembangunan Sosial dan Kesejahteraan',
        'Sosiologi',
        'Ilmu Hubungan Internasional IUP',
        'Ilmu Komunikasi IUP',
        'Manajemen dan Kebijakan Publik IUP',
      ],
    },
    {
      name: 'Fakultas Psikologi (FPsi UGM)',
      majors: ['Psikologi', 'Psikologi IUP'],
    },
    {
      name: 'Fakultas Ilmu Budaya (FIB UGM)',
      majors: [
        'Sastra Inggris',
        'Sastra Indonesia',
        'Sastra Jepang',
        'Sastra Arab',
        'Sastra Perancis',
        'Bahasa dan Kebudayaan Korea',
        'Arkeologi',
        'Sejarah',
        'Antropologi Budaya',
        'Pariwisata',
      ],
    },
    {
      name: 'Fakultas Geografi (FG UGM)',
      majors: ['Geografi Lingkungan', 'Kartografi dan Penginderaan Jauh', 'Pembangunan Wilayah'],
    },
    {
      name: 'Fakultas Pertanian (Faperta UGM)',
      majors: ['Agronomi', 'Akuakultur', 'Ekonomi Pertanian dan Agribisnis', 'Ilmu Tanah', 'Proteksi Tanaman', 'Mikrobiologi Pertanian'],
    },
    {
      name: 'Fakultas Peternakan (Fapet UGM)',
      majors: ['Ilmu dan Industri Peternakan', 'Peternakan IUP'],
    },
    {
      name: 'Fakultas Kehutanan (Fahutan UGM)',
      majors: ['Kehutanan'],
    },
    {
      name: 'Fakultas Teknologi Pertanian (FTP UGM)',
      majors: ['Teknik Pertanian', 'Teknologi Pangan dan Hasil Pertanian', 'Teknologi Industri Pertanian'],
    },
    {
      name: 'Fakultas Biologi (FB UGM)',
      majors: ['Biologi', 'Biologi IUP'],
    },
    {
      name: 'Fakultas Filsafat UGM',
      majors: ['Filsafat'],
    },
    {
      name: 'Sekolah Vokasi UGM',
      majors: [
        'Rekayasa Perangkat Lunak',
        'Teknologi Rekayasa Instrumentasi & Kontrol',
        'Manajemen Informasi Kesehatan',
        'Perbankan Terapan',
        'Bisnis Terapan',
        'Pengelolaan Hutan',
      ],
    },
  ],

  'Institut Teknologi Sepuluh Nopember': [
    {
      name: 'Fakultas Teknologi Elektro dan Informatika Cerdas (FTEIC ITS)',
      majors: ['Teknik Informatika', 'Sistem Informasi', 'Teknologi Informasi', 'Teknik Elektro', 'Teknik Komputer', 'Teknik Biomedik', 'Informatika IUP', 'Sistem Informasi IUP'],
    },
    {
      name: 'Fakultas Teknologi Industri dan Rekayasa Sistem (FTIRS ITS)',
      majors: ['Teknik Mesin', 'Teknik Industri', 'Teknik Kimia', 'Teknik Fisika', 'Teknik Material', 'Teknik Mesin IUP', 'Teknik Kimia IUP', 'Teknik Industri IUP'],
    },
    {
      name: 'Fakultas Teknik Sipil, Perencanaan, dan Kebumian (FTSPK ITS)',
      majors: ['Teknik Sipil', 'Arsitektur', 'Teknik Lingkungan', 'Perencanaan Wilayah dan Kota', 'Teknik Geomatika', 'Teknik Geofisika', 'Teknik Sipil IUP', 'Arsitektur IUP'],
    },
    {
      name: 'Fakultas Teknologi Kelautan (FTK ITS)',
      majors: ['Teknik Perkapalan', 'Teknik Sistem Perkapalan', 'Teknik Kelautan', 'Teknik Transportasi Laut', 'Teknik Lepas Pantai', 'Teknik Sistem Perkapalan IUP'],
    },
    {
      name: 'Fakultas Desain Kreatif dan Bisnis Digital (FDKBD ITS)',
      majors: ['Desain Komunikasi Visual', 'Desain Produk Industri', 'Desain Interior', 'Manajemen Bisnis', 'Studi Pembangunan', 'Manajemen Bisnis IUP'],
    },
    {
      name: 'Fakultas Sains dan Analitika Data (FSAD ITS)',
      majors: ['Statistika', 'Sains Analitika Data', 'Matematika', 'Fisika', 'Kimia', 'Sains Aktuaria', 'Statistika IUP'],
    },
    {
      name: 'Fakultas Kedokteran dan Kesehatan (FKK ITS)',
      majors: ['Kedokteran', 'Teknologi Kedokteran'],
    },
    {
      name: 'Fakultas Vokasi ITS',
      majors: ['Teknik Sipil Bangunan Transportasi', 'Teknik Mesin Terapan', 'Statistika Bisnis Terapan', 'Teknik Instrumentasi'],
    },
  ],

  'Universitas Padjadjaran': [
    {
      name: 'Fakultas Kedokteran (FK UNPAD)',
      majors: ['Kedokteran', 'Kedokteran Hewan', 'Kedokteran IUP'],
    },
    {
      name: 'Fakultas Kedokteran Gigi (FKG UNPAD)',
      majors: ['Pendidikan Dokter Gigi', 'Kedokteran Gigi IUP'],
    },
    {
      name: 'Fakultas Farmasi (FF UNPAD)',
      majors: ['Farmasi', 'Farmasi IUP'],
    },
    {
      name: 'Fakultas Keperawatan (FKep UNPAD)',
      majors: ['Ilmu Keperawatan'],
    },
    {
      name: 'Fakultas Ekonomi dan Bisnis (FEB UNPAD)',
      majors: ['Akuntansi', 'Manajemen', 'Ilmu Ekonomi', 'Bisnis Digital', 'Ekonomi Islam', 'Akuntansi IUP', 'Manajemen IUP', 'Bisnis Digital IUP'],
    },
    {
      name: 'Fakultas Hukum (FH UNPAD)',
      majors: ['Ilmu Hukum', 'Ilmu Hukum IUP'],
    },
    {
      name: 'Fakultas MIPA (FMIPA UNPAD)',
      majors: ['Teknik Informatika', 'Matematika', 'Statistika', 'Sains Aktuaria', 'Kimia', 'Fisika', 'Biologi', 'Geofisika', 'Teknik Elektro', 'Teknik Informatika IUP'],
    },
    {
      name: 'Fakultas Ilmu Komunikasi (Fikom UNPAD)',
      majors: ['Ilmu Komunikasi', 'Hubungan Masyarakat', 'Jurnalistik', 'Manajemen Komunikasi', 'Televisi dan Film', 'Ilmu Perpustakaan', 'Ilmu Komunikasi IUP'],
    },
    {
      name: 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP UNPAD)',
      majors: ['Hubungan Internasional', 'Ilmu Administrasi Publik', 'Ilmu Administrasi Bisnis', 'Ilmu Pemerintahan', 'Ilmu Politik', 'Sosiologi', 'Antropologi', 'Ilmu Kesejahteraan Sosial', 'Hubungan Internasional IUP'],
    },
    {
      name: 'Fakultas Psikologi (FPsi UNPAD)',
      majors: ['Psikologi', 'Psikologi IUP'],
    },
    {
      name: 'Fakultas Ilmu Budaya (FIB UNPAD)',
      majors: ['Sastra Indonesia', 'Sastra Inggris', 'Sastra Jepang', 'Sastra Arab', 'Sastra Perancis', 'Sastra Jerman', 'Sastra Rusia', 'Ilmu Sejarah'],
    },
    {
      name: 'Fakultas Pertanian (Faperta UNPAD)',
      majors: ['Agroteknologi', 'Agribisnis'],
    },
    {
      name: 'Fakultas Peternakan (Fapet UNPAD)',
      majors: ['Peternakan'],
    },
    {
      name: 'Fakultas Perikanan dan Ilmu Kelautan (FPIK UNPAD)',
      majors: ['Perikanan', 'Ilmu Kelautan', 'Pariwisata Bahari'],
    },
    {
      name: 'Fakultas Teknik Geologi (FTG UNPAD)',
      majors: ['Teknik Geologi'],
    },
    {
      name: 'Fakultas Teknologi Industri Pertanian (FTIP UNPAD)',
      majors: ['Teknik Pertanian', 'Teknologi Pangan', 'Teknologi Industri Pertanian'],
    },
  ],

  'Universitas Airlangga': [
    {
      name: 'Fakultas Kedokteran (FK UNAIR)',
      majors: ['Kedokteran', 'Kebidanan', 'Kedokteran IUP'],
    },
    {
      name: 'Fakultas Kedokteran Gigi (FKG UNAIR)',
      majors: ['Kedokteran Gigi', 'Kedokteran Gigi IUP'],
    },
    {
      name: 'Fakultas Farmasi (FF UNAIR)',
      majors: ['Farmasi', 'Farmasi IUP'],
    },
    {
      name: 'Fakultas Kedokteran Hewan (FKH UNAIR)',
      majors: ['Kedokteran Hewan', 'Kedokteran Hewan IUP'],
    },
    {
      name: 'Fakultas Kesehatan Masyarakat (FKM UNAIR)',
      majors: ['Kesehatan Masyarakat', 'Ilmu Gizi'],
    },
    {
      name: 'Fakultas Keperawatan (FKep UNAIR)',
      majors: ['Keperawatan'],
    },
    {
      name: 'Fakultas Ekonomi dan Bisnis (FEB UNAIR)',
      majors: ['Manajemen', 'Akuntansi', 'Ekonomi Pembangunan', 'Ekonomi Islam', 'Manajemen IUP', 'Akuntansi IUP', 'Ekonomi Pembangunan IUP', 'Ekonomi Islam IUP'],
    },
    {
      name: 'Fakultas Hukum (FH UNAIR)',
      majors: ['Ilmu Hukum', 'Ilmu Hukum IUP'],
    },
    {
      name: 'Fakultas Teknologi Maju dan Multidisiplin (FTMM UNAIR)',
      majors: ['Sains Data', 'Teknik Robotika & Kecerdasan Buatan', 'Rekayasa Nanoteknologi', 'Teknik Elektro', 'Teknologi Rekayasa Industri'],
    },
    {
      name: 'Fakultas Sains dan Teknologi (FST UNAIR)',
      majors: ['Sistem Informasi', 'Statistika', 'Matematika', 'Biologi', 'Fisika', 'Kimia', 'Teknik Lingkungan', 'Teknik Biomedis'],
    },
    {
      name: 'Fakultas Psikologi (FPsi UNAIR)',
      majors: ['Psikologi', 'Psikologi IUP'],
    },
    {
      name: 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP UNAIR)',
      majors: ['Ilmu Komunikasi', 'Hubungan Internasional', 'Administrasi Publik', 'Ilmu Informasi & Perpustakaan', 'Sosiologi', 'Ilmu Politik', 'Antropologi', 'Ilmu Komunikasi IUP', 'Hubungan Internasional IUP'],
    },
    {
      name: 'Fakultas Ilmu Budaya (FIB UNAIR)',
      majors: ['Sastra Inggris', 'Sastra Indonesia', 'Sastra Jepang', 'Ilmu Sejarah'],
    },
    {
      name: 'Fakultas Perikanan dan Kelautan (FPK UNAIR)',
      majors: ['Akuakultur', 'Teknologi Hasil Perikanan'],
    },
  ],

  'IPB University': [
    {
      name: 'Fakultas Kedokteran (FK IPB)',
      majors: ['Kedokteran'],
    },
    {
      name: 'Sekolah Kedokteran Hewan dan Biomedis (SKHB IPB)',
      majors: ['Kedokteran Hewan', 'Sains Biomedis', 'Kedokteran Hewan IUP'],
    },
    {
      name: 'Fakultas Matematika dan IPA (FMIPA IPB)',
      majors: ['Ilmu Komputer', 'Statistika dan Sains Data', 'Sains Aktuaria', 'Biokimia', 'Biologi', 'Kimia', 'Matematika', 'Fisika', 'Meteorologi Terapan', 'Ilmu Komputer IUP', 'Statistika IUP'],
    },
    {
      name: 'Fakultas Ekonomi dan Manajemen (FEM IPB)',
      majors: ['Manajemen', 'Ilmu Ekonomi', 'Agribisnis', 'Ekonomi Sumberdaya dan Lingkungan', 'Ekonomi Syariah', 'Manajemen IUP'],
    },
    {
      name: 'Fakultas Teknologi Pertanian (Fateta IPB)',
      majors: ['Teknologi Pangan', 'Teknik Industri Pertanian', 'Teknik Pertanian dan Biosistem', 'Teknik Sipil dan Lingkungan', 'Teknologi Pangan IUP'],
    },
    {
      name: 'Fakultas Pertanian (Faperta IPB)',
      majors: ['Agronomi dan Hortikultura', 'Proteksi Tanaman', 'Arsitektur Lanskap', 'Manajemen Sumberdaya Lahan', 'Agronomi dan Hortikultura IUP'],
    },
    {
      name: 'Fakultas Peternakan (Fapet IPB)',
      majors: ['Teknologi Produksi Ternak', 'Nutrisi dan Teknologi Pakan', 'Teknologi Hasil Ternak'],
    },
    {
      name: 'Fakultas Perikanan dan Ilmu Kelautan (FPIK IPB)',
      majors: ['Teknologi & Manajemen Perikanan Budidaya', 'Ilmu dan Teknologi Kelautan', 'Teknologi Hasil Perairan', 'Manajemen Sumberdaya Perairan', 'Teknologi & Manajemen Perikanan Tangkap'],
    },
    {
      name: 'Fakultas Kehutanan dan Lingkungan (Fahutan IPB)',
      majors: ['Manajemen Hutan', 'Hasil Hutan', 'Konservasi Sumberdaya Hutan & Ekowisata', 'Silvikultur'],
    },
    {
      name: 'Fakultas Ekologi Manusia (Fema IPB)',
      majors: ['Ilmu Gizi', 'Komunikasi dan Pengembangan Masyarakat', 'Ilmu Keluarga dan Konsumen'],
    },
    {
      name: 'Sekolah Vokasi IPB',
      majors: ['Komunikasi Digital dan Media', 'Rekayasa Perangkat Lunak', 'Manajemen Agribisnis', 'Ekowisata', 'Teknologi Industri Benih'],
    },
  ],

  'Universitas Diponegoro': [
    {
      name: 'Fakultas Kedokteran (FK UNDIP)',
      majors: ['Kedokteran', 'Keperawatan', 'Ilmu Gizi', 'Farmasi', 'Kedokteran Gigi', 'Kedokteran IUP'],
    },
    {
      name: 'Fakultas Ekonomika dan Bisnis (FEB UNDIP)',
      majors: ['Manajemen', 'Akuntansi', 'Ilmu Ekonomi', 'Ekonomi Islam', 'Manajemen IUP', 'Akuntansi IUP', 'Ilmu Ekonomi IUP'],
    },
    {
      name: 'Fakultas Hukum (FH UNDIP)',
      majors: ['Ilmu Hukum', 'Ilmu Hukum IUP'],
    },
    {
      name: 'Fakultas Teknik (FT UNDIP)',
      majors: [
        'Teknik Sipil',
        'Arsitektur',
        'Teknik Mesin',
        'Teknik Kimia',
        'Teknik Elektro',
        'Teknik Industri',
        'Teknik Lingkungan',
        'Perencanaan Wilayah dan Kota',
        'Teknik Perkapalan',
        'Teknik Geologi',
        'Teknik Geodesi',
        'Teknik Komputer',
        'Teknik Sipil IUP',
        'Teknik Kimia IUP',
        'Arsitektur IUP',
      ],
    },
    {
      name: 'Fakultas Sains dan Matematika (FSM UNDIP)',
      majors: ['Informatika', 'Statistika', 'Matematika', 'Bioteknologi', 'Fisika', 'Kimia', 'Biologi', 'Informatika IUP'],
    },
    {
      name: 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP UNDIP)',
      majors: ['Ilmu Komunikasi', 'Administrasi Publik', 'Hubungan Internasional', 'Administrasi Bisnis', 'Ilmu Pemerintahan', 'Ilmu Komunikasi IUP', 'Administrasi Publik IUP'],
    },
    {
      name: 'Fakultas Psikologi (FPsi UNDIP)',
      majors: ['Psikologi'],
    },
    {
      name: 'Fakultas Kesehatan Masyarakat (FKM UNDIP)',
      majors: ['Kesehatan Masyarakat', 'Keselamatan dan Kesehatan Kerja'],
    },
    {
      name: 'Fakultas Ilmu Budaya (FIB UNDIP)',
      majors: ['Sastra Inggris', 'Sastra Indonesia', 'Sejarah', 'Ilmu Perpustakaan', 'Bahasa dan Kebudayaan Jepang'],
    },
    {
      name: 'Fakultas Perikanan dan Ilmu Kelautan (FPIK UNDIP)',
      majors: ['Oseanografi', 'Ilmu Kelautan', 'Akuakultur', 'Manajemen Sumberdaya Perairan', 'Teknologi Hasil Perikanan', 'Oseanografi IUP'],
    },
    {
      name: 'Fakultas Peternakan dan Pertanian (FPP UNDIP)',
      majors: ['Peternakan', 'Agroteknologi', 'Agribisnis', 'Teknologi Pangan'],
    },
  ],

  'Universitas Brawijaya': [
    {
      name: 'Fakultas Kedokteran (FK UB)',
      majors: ['Kedokteran', 'Farmasi', 'Kebidanan', 'Kedokteran IUP'],
    },
    {
      name: 'Fakultas Kedokteran Gigi (FKG UB)',
      majors: ['Kedokteran Gigi'],
    },
    {
      name: 'Fakultas Kedokteran Hewan (FKH UB)',
      majors: ['Kedokteran Hewan'],
    },
    {
      name: 'Fakultas Ilmu Kesehatan (FIKES UB)',
      majors: ['Ilmu Keperawatan', 'Ilmu Gizi'],
    },
    {
      name: 'Fakultas Ekonomi dan Bisnis (FEB UB)',
      majors: ['Manajemen', 'Akuntansi', 'Ekonomi Pembangunan', 'Ekonomi Islam', 'Kewirausahaan', 'Manajemen IUP', 'Akuntansi IUP', 'Ekonomi Pembangunan IUP'],
    },
    {
      name: 'Fakultas Hukum (FH UB)',
      majors: ['Ilmu Hukum', 'Ilmu Hukum IUP'],
    },
    {
      name: 'Fakultas Ilmu Komputer (FILKOM UB)',
      majors: ['Teknik Informatika', 'Sistem Informasi', 'Teknologi Informasi', 'Teknik Komputer', 'Pendidikan Teknologi Informasi', 'Teknik Informatika IUP'],
    },
    {
      name: 'Fakultas Teknik (FT UB)',
      majors: [
        'Teknik Sipil',
        'Teknik Mesin',
        'Teknik Elektro',
        'Teknik Industri',
        'Arsitektur',
        'Perencanaan Wilayah & Kota',
        'Teknik Kimia',
        'Teknik Pengairan',
        'Teknik Sipil IUP',
      ],
    },
    {
      name: 'Fakultas MIPA (FMIPA UB)',
      majors: ['Statistika', 'Sains Data', 'Matematika', 'Sains Aktuaria', 'Biologi', 'Kimia', 'Fisika', 'Instrumentasi'],
    },
    {
      name: 'Fakultas Ilmu Sosial dan Ilmu Politik (FISIP UB)',
      majors: ['Ilmu Komunikasi', 'Hubungan Internasional', 'Psikologi', 'Sosiologi', 'Ilmu Politik', 'Ilmu Pemerintahan', 'Ilmu Komunikasi IUP', 'Hubungan Internasional IUP'],
    },
    {
      name: 'Fakultas Ilmu Administrasi (FIA UB)',
      majors: ['Administrasi Publik', 'Administrasi Bisnis', 'Perpajakan', 'Pariwisata', 'Ilmu Perpustakaan', 'Administrasi Bisnis IUP'],
    },
    {
      name: 'Fakultas Pertanian (FP UB)',
      majors: ['Agroteknologi', 'Agribisnis'],
    },
    {
      name: 'Fakultas Peternakan (Fapet UB)',
      majors: ['Peternakan'],
    },
    {
      name: 'Fakultas Perikanan dan Ilmu Kelautan (FPIK UB)',
      majors: ['Ilmu Kelautan', 'Manajemen Sumberdaya Perairan', 'Budidaya Perairan', 'Teknologi Hasil Perikanan', 'Agrobisnis Perikanan'],
    },
    {
      name: 'Fakultas Teknologi Pertanian (FTP UB)',
      majors: ['Teknologi Pangan', 'Teknik Pertanian dan Biosistem', 'Teknologi Industri Pertanian', 'Bioteknologi'],
    },
    {
      name: 'Fakultas Ilmu Budaya (FIB UB)',
      majors: ['Sastra Inggris', 'Sastra Jepang', 'Sastra Cina', 'Sastra Perancis', 'Pendidikan Bahasa dan Sastra Indonesia', 'Pendidikan Bahasa Inggris', 'Seni Rupa Murni'],
    },
  ],

  'Universitas Sebelas Maret': [
    {
      name: 'Fakultas Kedokteran (FK UNS)',
      majors: ['Kedokteran', 'Kebidanan', 'Kedokteran IUP'],
    },
    {
      name: 'Fakultas Ekonomi dan Bisnis (FEB UNS)',
      majors: ['Manajemen', 'Akuntansi', 'Ekonomi Pembangunan', 'Bisnis Digital', 'Manajemen IUP', 'Akuntansi IUP'],
    },
    {
      name: 'Fakultas Hukum (FH UNS)',
      majors: ['Ilmu Hukum', 'Ilmu Hukum IUP'],
    },
    {
      name: 'Fakultas Teknik (FT UNS)',
      majors: ['Teknik Sipil', 'Teknik Mesin', 'Teknik Industri', 'Teknik Kimia', 'Teknik Elektro', 'Arsitektur', 'Perencanaan Wilayah dan Kota', 'Teknik Sipil IUP'],
    },
    {
      name: 'Fakultas MIPA (FMIPA UNS)',
      majors: ['Informatika', 'Statistika', 'Sains Data', 'Matematika', 'Fisika', 'Kimia', 'Biologi', 'Farmasi'],
    },
    {
      name: 'Fakultas Ilmu Sosial dan Politik (FISIP UNS)',
      majors: ['Ilmu Komunikasi', 'Hubungan Internasional', 'Ilmu Administrasi Negara', 'Sosiologi', 'Ilmu Komunikasi IUP'],
    },
    {
      name: 'Fakultas Psikologi (FPsi UNS)',
      majors: ['Psikologi'],
    },
    {
      name: 'Fakultas Keguruan dan Ilmu Pendidikan (FKIP UNS)',
      majors: ['Pendidikan Guru SD', 'Pendidikan Bahasa Inggris', 'Pendidikan Matematika', 'Pendidikan Biologi', 'Pendidikan Fisika', 'Pendidikan Kimia', 'Pendidikan Luar Biasa', 'Bimbingan & Konseling'],
    },
  ],
}

/**
 * Mengambil daftar fakultas untuk kampus tertentu.
 * Jika kampus spesifik ada di database, gunakan direktori resmi.
 * Jika tidak ditemukan, fallback ke daftar fakultas standar Indonesia.
 */
export function getFacultiesForPtn(ptnName: string): FacultyData[] {
  if (!ptnName) return STANDARD_FACULTIES

  // Exact match
  if (PTN_DIRECTORY[ptnName]) {
    return PTN_DIRECTORY[ptnName]
  }

  // Fuzzy match (cth: "UI" -> "Universitas Indonesia")
  const lower = ptnName.toLowerCase()
  for (const [key, faculties] of Object.entries(PTN_DIRECTORY)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return faculties
    }
  }

  // Fallback ke standard faculties
  return STANDARD_FACULTIES
}

/**
 * Mengambil nama-nama fakultas saja (array of string)
 */
export function getFacultyNamesForPtn(ptnName: string): string[] {
  return getFacultiesForPtn(ptnName).map(f => f.name)
}

/**
 * Mengambil daftar jurusan untuk PTN dan Fakultas tertentu
 */
export function getMajorsForFaculty(ptnName: string, facultyName: string): string[] {
  const faculties = getFacultiesForPtn(ptnName)
  const found = faculties.find(
    f => f.name.toLowerCase() === facultyName.toLowerCase() ||
         f.name.toLowerCase().includes(facultyName.toLowerCase()) ||
         facultyName.toLowerCase().includes(f.name.toLowerCase())
  )

  if (found) {
    return found.majors
  }

  // Fallback search di standard faculties
  const stdFound = STANDARD_FACULTIES.find(
    f => f.name.toLowerCase() === facultyName.toLowerCase() ||
         f.name.toLowerCase().includes(facultyName.toLowerCase()) ||
         facultyName.toLowerCase().includes(f.name.toLowerCase())
  )

  return stdFound ? stdFound.majors : []
}

/**
 * Mengambil seluruh jurusan yang tersedia di suatu PTN
 */
export function getAllMajorsForPtn(ptnName: string): string[] {
  const faculties = getFacultiesForPtn(ptnName)
  const set = new Set<string>()
  for (const f of faculties) {
    for (const m of f.majors) {
      set.add(m)
    }
  }
  return Array.from(set).sort()
}

/**
 * Menemukan nama fakultas dari suatu nama jurusan (Reverse Lookup)
 */
export function getFacultyForMajor(majorName: string, ptnName?: string): string {
  if (!majorName) return 'Fakultas Terkait'

  const faculties = ptnName ? getFacultiesForPtn(ptnName) : STANDARD_FACULTIES
  const lowerMajor = majorName.toLowerCase()

  for (const f of faculties) {
    for (const m of f.majors) {
      const lowerM = m.toLowerCase()
      if (lowerM === lowerMajor || lowerM.includes(lowerMajor) || lowerMajor.includes(lowerM)) {
        return f.name
      }
    }
  }

  // Heuristik cepat jika tidak ketemu di daftar eksplisit
  if (lowerMajor.includes('dokter gigi') || lowerMajor.includes('gigi')) return 'Fakultas Kedokteran Gigi'
  if (lowerMajor.includes('dokter') || lowerMajor.includes('kedokteran')) return 'Fakultas Kedokteran'
  if (lowerMajor.includes('farmasi')) return 'Fakultas Farmasi'
  if (lowerMajor.includes('informatika') || lowerMajor.includes('komputer') || lowerMajor.includes('sistem informasi')) return 'Fakultas Ilmu Komputer / Teknologi Informasi'
  if (lowerMajor.includes('teknik') || lowerMajor.includes('arsitektur')) return 'Fakultas Teknik'
  if (lowerMajor.includes('manajemen') || lowerMajor.includes('akuntansi') || lowerMajor.includes('ekonomi') || lowerMajor.includes('bisnis')) return 'Fakultas Ekonomi dan Bisnis'
  if (lowerMajor.includes('hukum')) return 'Fakultas Hukum'
  if (lowerMajor.includes('komunikasi') || lowerMajor.includes('politik') || lowerMajor.includes('hubungan internasional') || lowerMajor.includes('sosiologi') || lowerMajor.includes('administrasi')) return 'Fakultas Ilmu Sosial dan Ilmu Politik'
  if (lowerMajor.includes('psikologi')) return 'Fakultas Psikologi'
  if (lowerMajor.includes('sastra') || lowerMajor.includes('sejarah') || lowerMajor.includes('budaya') || lowerMajor.includes('filsafat')) return 'Fakultas Ilmu Budaya / Sastra'
  if (lowerMajor.includes('keperawatan')) return 'Fakultas Ilmu Keperawatan'
  if (lowerMajor.includes('gizi') || lowerMajor.includes('kesehatan masyarakat')) return 'Fakultas Kesehatan Masyarakat'
  if (lowerMajor.includes('pertanian') || lowerMajor.includes('agronomi') || lowerMajor.includes('agribisnis')) return 'Fakultas Pertanian'
  if (lowerMajor.includes('peternakan')) return 'Fakultas Peternakan'
  if (lowerMajor.includes('perikanan') || lowerMajor.includes('kelautan') || lowerMajor.includes('akuakultur')) return 'Fakultas Perikanan dan Ilmu Kelautan'
  if (lowerMajor.includes('kehutanan')) return 'Fakultas Kehutanan'
  if (lowerMajor.includes('pendidikan') || lowerMajor.includes('pgsd')) return 'Fakultas Keguruan dan Ilmu Pendidikan'
  if (lowerMajor.includes('desain') || lowerMajor.includes('seni') || lowerMajor.includes('dkv')) return 'Fakultas Seni Rupa dan Desain'

  return 'Fakultas Terkait'
}

