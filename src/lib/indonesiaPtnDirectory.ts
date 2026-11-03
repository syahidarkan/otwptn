// Direktori Lengkap Seluruh PTN dan Jurusan / Program Studi di Indonesia

export interface PtnItem {
  id: string
  name: string
  shortName: string
  city: string
  province: string
  cluster: 'Universitas' | 'Institut' | 'Politeknik' | 'UIN'
}

export const INDONESIA_PTN_LIST: PtnItem[] = [
  // Jawa
  { id: 'ui', name: 'Universitas Indonesia', shortName: 'UI', city: 'Depok / Jakarta', province: 'DKI Jakarta / Jawa Barat', cluster: 'Universitas' },
  { id: 'itb', name: 'Institut Teknologi Bandung', shortName: 'ITB', city: 'Bandung', province: 'Jawa Barat', cluster: 'Institut' },
  { id: 'ugm', name: 'Universitas Gadjah Mada', shortName: 'UGM', city: 'Yogyakarta', province: 'D.I. Yogyakarta', cluster: 'Universitas' },
  { id: 'its', name: 'Institut Teknologi Sepuluh Nopember', shortName: 'ITS', city: 'Surabaya', province: 'Jawa Timur', cluster: 'Institut' },
  { id: 'unpad', name: 'Universitas Padjadjaran', shortName: 'UNPAD', city: 'Sumedang / Bandung', province: 'Jawa Barat', cluster: 'Universitas' },
  { id: 'unair', name: 'Universitas Airlangga', shortName: 'UNAIR', city: 'Surabaya', province: 'Jawa Timur', cluster: 'Universitas' },
  { id: 'undip', name: 'Universitas Diponegoro', shortName: 'UNDIP', city: 'Semarang', province: 'Jawa Tengah', cluster: 'Universitas' },
  { id: 'ub', name: 'Universitas Brawijaya', shortName: 'UB', city: 'Malang', province: 'Jawa Timur', cluster: 'Universitas' },
  { id: 'ipb', name: 'IPB University', shortName: 'IPB', city: 'Bogor', province: 'Jawa Barat', cluster: 'Institut' },
  { id: 'uns', name: 'Universitas Sebelas Maret', shortName: 'UNS', city: 'Surakarta', province: 'Jawa Tengah', cluster: 'Universitas' },
  { id: 'upi', name: 'Universitas Pendidikan Indonesia', shortName: 'UPI', city: 'Bandung', province: 'Jawa Barat', cluster: 'Universitas' },
  { id: 'uny', name: 'Universitas Negeri Yogyakarta', shortName: 'UNY', city: 'Yogyakarta', province: 'D.I. Yogyakarta', cluster: 'Universitas' },
  { id: 'unesa', name: 'Universitas Negeri Surabaya', shortName: 'UNESA', city: 'Surabaya', province: 'Jawa Timur', cluster: 'Universitas' },
  { id: 'um', name: 'Universitas Negeri Malang', shortName: 'UM', city: 'Malang', province: 'Jawa Timur', cluster: 'Universitas' },
  { id: 'unnes', name: 'Universitas Negeri Semarang', shortName: 'UNNES', city: 'Semarang', province: 'Jawa Tengah', cluster: 'Universitas' },
  { id: 'unj', name: 'Universitas Negeri Jakarta', shortName: 'UNJ', city: 'Jakarta Timur', province: 'DKI Jakarta', cluster: 'Universitas' },
  { id: 'upnvj', name: 'UPN Veteran Jakarta', shortName: 'UPNVJ', city: 'Jakarta Selatan', province: 'DKI Jakarta', cluster: 'Universitas' },
  { id: 'upnvy', name: 'UPN Veteran Yogyakarta', shortName: 'UPNVY', city: 'Sleman', province: 'D.I. Yogyakarta', cluster: 'Universitas' },
  { id: 'upnvjt', name: 'UPN Veteran Jawa Timur', shortName: 'UPNVJT', city: 'Surabaya', province: 'Jawa Timur', cluster: 'Universitas' },
  { id: 'unsoed', name: 'Universitas Jenderal Soedirman', shortName: 'UNSOED', city: 'Purwokerto', province: 'Jawa Tengah', cluster: 'Universitas' },
  { id: 'unej', name: 'Universitas Jember', shortName: 'UNEJ', city: 'Jember', province: 'Jawa Timur', cluster: 'Universitas' },
  { id: 'untirta', name: 'Universitas Sultan Ageng Tirtayasa', shortName: 'UNTIRTA', city: 'Serang', province: 'Banten', cluster: 'Universitas' },
  { id: 'unsil', name: 'Universitas Siliwangi', shortName: 'UNSIL', city: 'Tasikmalaya', province: 'Jawa Barat', cluster: 'Universitas' },
  { id: 'utm', name: 'Universitas Trunojoyo Madura', shortName: 'UTM', city: 'Bangkalan', province: 'Jawa Timur', cluster: 'Universitas' },
  { id: 'uin-jkt', name: 'UIN Syarif Hidayatullah Jakarta', shortName: 'UIN JKT', city: 'Tangerang Selatan', province: 'Banten', cluster: 'UIN' },
  { id: 'uin-yk', name: 'UIN Sunan Kalijaga', shortName: 'UIN YK', city: 'Yogyakarta', province: 'D.I. Yogyakarta', cluster: 'UIN' },
  { id: 'uin-mlg', name: 'UIN Maulana Malik Ibrahim Malang', shortName: 'UIN MLG', city: 'Malang', province: 'Jawa Timur', cluster: 'UIN' },
  { id: 'uin-bdg', name: 'UIN Sunan Gunung Djati', shortName: 'UIN SGD', city: 'Bandung', province: 'Jawa Barat', cluster: 'UIN' },
  { id: 'polman', name: 'Politeknik Manufaktur Negeri Bandung', shortName: 'POLMAN', city: 'Bandung', province: 'Jawa Barat', cluster: 'Politeknik' },
  { id: 'pnj', name: 'Politeknik Negeri Jakarta', shortName: 'PNJ', city: 'Depok', province: 'Jawa Barat', cluster: 'Politeknik' },
  { id: 'polban', name: 'Politeknik Negeri Bandung', shortName: 'POLBAN', city: 'Bandung', province: 'Jawa Barat', cluster: 'Politeknik' },
  { id: 'polinema', name: 'Politeknik Negeri Malang', shortName: 'POLINEMA', city: 'Malang', province: 'Jawa Timur', cluster: 'Politeknik' },
  { id: 'pens', name: 'Politeknik Elektronika Negeri Surabaya', shortName: 'PENS', city: 'Surabaya', province: 'Jawa Timur', cluster: 'Politeknik' },

  // Sumatera
  { id: 'usk', name: 'Universitas Syiah Kuala', shortName: 'USK', city: 'Banda Aceh', province: 'Aceh', cluster: 'Universitas' },
  { id: 'unimal', name: 'Universitas Malikussaleh', shortName: 'UNIMAL', city: 'Lhokseumawe', province: 'Aceh', cluster: 'Universitas' },
  { id: 'usu', name: 'Universitas Sumatera Utara', shortName: 'USU', city: 'Medan', province: 'Sumatera Utara', cluster: 'Universitas' },
  { id: 'unimed', name: 'Universitas Negeri Medan', shortName: 'UNIMED', city: 'Medan', province: 'Sumatera Utara', cluster: 'Universitas' },
  { id: 'unand', name: 'Universitas Andalas', shortName: 'UNAND', city: 'Padang', province: 'Sumatera Barat', cluster: 'Universitas' },
  { id: 'unp', name: 'Universitas Negeri Padang', shortName: 'UNP', city: 'Padang', province: 'Sumatera Barat', cluster: 'Universitas' },
  { id: 'unri', name: 'Universitas Riau', shortName: 'UNRI', city: 'Pekanbaru', province: 'Riau', cluster: 'Universitas' },
  { id: 'umrah', name: 'Universitas Maritim Raja Ali Haji', shortName: 'UMRAH', city: 'Tanjungpinang', province: 'Kepulauan Riau', cluster: 'Universitas' },
  { id: 'unja', name: 'Universitas Jambi', shortName: 'UNJA', city: 'Jambi', province: 'Jambi', cluster: 'Universitas' },
  { id: 'unsri', name: 'Universitas Sriwijaya', shortName: 'UNSRI', city: 'Palembang / Indralaya', province: 'Sumatera Selatan', cluster: 'Universitas' },
  { id: 'unib', name: 'Universitas Bengkulu', shortName: 'UNIB', city: 'Bengkulu', province: 'Bengkulu', cluster: 'Universitas' },
  { id: 'unila', name: 'Universitas Lampung', shortName: 'UNILA', city: 'Bandar Lampung', province: 'Lampung', cluster: 'Universitas' },
  { id: 'itera', name: 'Institut Teknologi Sumatera', shortName: 'ITERA', city: 'Lampung Selatan', province: 'Lampung', cluster: 'Institut' },
  { id: 'ubb', name: 'Universitas Bangka Belitung', shortName: 'UBB', city: 'Bangka', province: 'Bangka Belitung', cluster: 'Universitas' },

  // Bali & Nusa Tenggara
  { id: 'unud', name: 'Universitas Udayana', shortName: 'UNUD', city: 'Denpasar / Jimbaran', province: 'Bali', cluster: 'Universitas' },
  { id: 'undiksha', name: 'Universitas Pendidikan Ganesha', shortName: 'UNDIKSHA', city: 'Singaraja', province: 'Bali', cluster: 'Universitas' },
  { id: 'unram', name: 'Universitas Mataram', shortName: 'UNRAM', city: 'Mataram', province: 'Nusa Tenggara Barat', cluster: 'Universitas' },
  { id: 'undana', name: 'Universitas Nusa Cendana', shortName: 'UNDANA', city: 'Kupang', province: 'Nusa Tenggara Timur', cluster: 'Universitas' },

  // Kalimantan
  { id: 'untan', name: 'Universitas Tanjungpura', shortName: 'UNTAN', city: 'Pontianak', province: 'Kalimantan Barat', cluster: 'Universitas' },
  { id: 'upr', name: 'Universitas Palangka Raya', shortName: 'UPR', city: 'Palangka Raya', province: 'Kalimantan Tengah', cluster: 'Universitas' },
  { id: 'ulm', name: 'Universitas Lambung Mangkurat', shortName: 'ULM', city: 'Banjarmasin', province: 'Kalimantan Selatan', cluster: 'Universitas' },
  { id: 'unmul', name: 'Universitas Mulawarman', shortName: 'UNMUL', city: 'Samarinda', province: 'Kalimantan Timur', cluster: 'Universitas' },
  { id: 'itk', name: 'Institut Teknologi Kalimantan', shortName: 'ITK', city: 'Balikpapan', province: 'Kalimantan Timur', cluster: 'Institut' },
  { id: 'ubt', name: 'Universitas Borneo Tarakan', shortName: 'UBT', city: 'Tarakan', province: 'Kalimantan Utara', cluster: 'Universitas' },

  // Sulawesi
  { id: 'unhas', name: 'Universitas Hasanuddin', shortName: 'UNHAS', city: 'Makassar', province: 'Sulawesi Selatan', cluster: 'Universitas' },
  { id: 'unm', name: 'Universitas Negeri Makassar', shortName: 'UNM', city: 'Makassar', province: 'Sulawesi Selatan', cluster: 'Universitas' },
  { id: 'unsrat', name: 'Universitas Sam Ratulangi', shortName: 'UNSRAT', city: 'Manado', province: 'Sulawesi Utara', cluster: 'Universitas' },
  { id: 'unima', name: 'Universitas Negeri Manado', shortName: 'UNIMA', city: 'Tondano', province: 'Sulawesi Utara', cluster: 'Universitas' },
  { id: 'untad', name: 'Universitas Tadulako', shortName: 'UNTAD', city: 'Palu', province: 'Sulawesi Tengah', cluster: 'Universitas' },
  { id: 'uho', name: 'Universitas Halu Oleo', shortName: 'UHO', city: 'Kendari', province: 'Sulawesi Tenggara', cluster: 'Universitas' },
  { id: 'ung', name: 'Universitas Negeri Gorontalo', shortName: 'UNG', city: 'Gorontalo', province: 'Gorontalo', cluster: 'Universitas' },
  { id: 'unsulbar', name: 'Universitas Sulawesi Barat', shortName: 'UNSULBAR', city: 'Majene', province: 'Sulawesi Barat', cluster: 'Universitas' },

  // Maluku & Papua
  { id: 'unpatti', name: 'Universitas Pattimura', shortName: 'UNPATTI', city: 'Ambon', province: 'Maluku', cluster: 'Universitas' },
  { id: 'unkhair', name: 'Universitas Khairun', shortName: 'UNKHAIR', city: 'Ternate', province: 'Maluku Utara', cluster: 'Universitas' },
  { id: 'uncen', name: 'Universitas Cenderawasih', shortName: 'UNCEN', city: 'Jayapura', province: 'Papua', cluster: 'Universitas' },
  { id: 'unipa', name: 'Universitas Papua', shortName: 'UNIPA', city: 'Manokwari', province: 'Papua Barat', cluster: 'Universitas' },
  { id: 'unmus', name: 'Universitas Musamus Merauke', shortName: 'UNMUS', city: 'Merauke', province: 'Papua Selatan', cluster: 'Universitas' },
]

export const INDONESIA_JURUSAN_LIST = [
  // Medis & Kesehatan
  'Kedokteran',
  'Kedokteran Gigi',
  'Farmasi',
  'Keperawatan',
  'Gizi / Ilmu Gizi',
  'Kesehatan Masyarakat',
  'Kebidanan',
  'Fisioterapi',
  'Kedokteran Hewan',
  'Radiologi',
  'Teknologi Laboratorium Medis',
  'Manajemen Informasi Kesehatan',
  'Biomedis / Teknik Biomedik',

  // Komputer & Teknologi Digital
  'Ilmu Komputer',
  'Teknik Informatika',
  'Sistem Informasi',
  'Teknologi Informasi',
  'Kecerdasan Buatan / Artifisial (AI)',
  'Sains Data / Data Science',
  'Rekayasa Perangkat Lunak',
  'Teknik Komputer',
  'Keamanan Siber / Cyber Security',
  'Sistem Komputer',

  // Teknik & Rekayasa
  'Teknik Sipil',
  'Teknik Mesin',
  'Teknik Elektro',
  'Teknik Kimia',
  'Teknik Industri',
  'Arsitektur',
  'Teknik Lingkungan',
  'Perencanaan Wilayah dan Kota (PWK)',
  'Teknik Pertambangan',
  'Teknik Perminyakan',
  'Teknik Geologi',
  'Teknik Geodesi dan Geomatika',
  'Teknik Perkapalan',
  'Teknik Kelautan',
  'Teknik Penerbangan / Kedirgantaraan',
  'Teknik Nuklir',
  'Teknik Metalurgi dan Material',
  'Teknik Fisika',
  'Teknik Otomotif',

  // MIPA & Sains Murni
  'Matematika',
  'Fisika',
  'Kimia',
  'Biologi',
  'Statistika',
  'Aktuaria / Ilmu Aktuaria',
  'Geofisika',
  'Astronomi',
  'Oseanografi',
  'Meteorologi',
  'Bioteknologi',
  'Ilmu Kelautan',

  // Pertanian & Kehutanan
  'Agribisnis',
  'Agroteknologi / Agroekoteknologi',
  'Teknologi Pangan / Hasil Pertanian',
  'Ilmu Tanah',
  'Kehutanan',
  'Peternakan',
  'Perikanan / Akuakultur',
  'Teknik Pertanian dan Biosistem',

  // Ekonomi & Bisnis
  'Manajemen',
  'Akuntansi',
  'Ilmu Ekonomi / Ekonomi Pembangunan',
  'Bisnis Digital',
  'Kewirausahaan / Bisnis',
  'Ekonomi Islam / Perbankan Syariah',
  'Keuangan dan Perbankan',
  'Manajemen Logistik',
  'Pemasaran Digital',

  // Hukum & Sosial Humaniora
  'Ilmu Hukum',
  'Hubungan Internasional (HI)',
  'Ilmu Komunikasi',
  'Psikologi',
  'Ilmu Administrasi Publik / Negara',
  'Ilmu Administrasi Bisnis / Niaga',
  'Ilmu Politik / Pemerintahan',
  'Sosiologi',
  'Kriminologi',
  'Antropologi Budaya',
  'Ilmu Kesejahteraan Sosial',
  'Jurnalistik',
  'Hubungan Masyarakat / PR',

  // Bahasa & Sastra
  'Sastra Inggris / Bahasa Inggris',
  'Sastra Indonesia / Bahasa Indonesia',
  'Sastra Jepang',
  'Sastra Arab',
  'Sastra Korea',
  'Sastra Mandarin / Cina',
  'Sastra Prancis',
  'Sastra Jerman',
  'Ilmu Sejarah',
  'Arkeologi',
  'Filsafat',
  'Ilmu Perpustakaan',

  // Seni, Desain & Media
  'Desain Komunikasi Visual (DKV)',
  'Desain Produk',
  'Desain Interior',
  'Seni Rupa Murni',
  'Film dan Televisi',
  'Animasi',
  'Fotografi',
  'Tata Kelola Seni',
  'Seni Musik',
  'Seni Tari',

  // Pendidikan & Keguruan
  'Pendidikan Guru Sekolah Dasar (PGSD)',
  'Pendidikan Guru PAUD (PGPAUD)',
  'Pendidikan Matematika',
  'Pendidikan Bahasa Inggris',
  'Pendidikan Bahasa Indonesia',
  'Pendidikan Biologi',
  'Pendidikan Fisika',
  'Pendidikan Kimia',
  'Pendidikan Sejarah',
  'Pendidikan Geografi',
  'Pendidikan Ekonomi',
  'Pendidikan Jasmani dan Olahraga (PJKR)',
  'Bimbingan dan Konseling (BK)',
]

