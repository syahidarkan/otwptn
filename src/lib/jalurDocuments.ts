import type { JalurCategory } from '@/types'

export type DocConfidence = 'tinggi' | 'sedang' | 'rendah'

export interface JalurDocRequirement {
  documents: string[]
  confidence: DocConfidence
  note?: string
}

// Researched from official PTN admission pages where possible, otherwise secondary
// sources (news/education sites) citing official announcements. Confidence reflects
// how directly verifiable each entry was - "rendah" means the specific jalur's own
// official page could not be confirmed and the list is inferred; always tell users
// to double-check the current year's official announcement before relying on this.
export const JALUR_DOCUMENTS: Record<string, JalurDocRequirement> = {
  'ppkb-ui': {
    confidence: 'tinggi',
    documents: [
      'Scan rapor kelas 10–12 (semester 1–5), dilegalisasi',
      'Surat pernyataan tulisan tangan (motivasi & alasan pilih prodi)',
      'Bukti prestasi akademik (jika ada)',
      'Pas foto berwarna terbaru',
      'Surat keterangan tidak buta warna (untuk prodi tertentu)',
    ],
    note: 'Semua dokumen digabung jadi 1 file PDF, maksimal 10MB.',
  },
  'ssu-tes-tulis-itb': {
    confidence: 'tinggi',
    documents: [
      'SKL / Surat Keterangan Kelas 12 (lulusan tahun berjalan) atau ijazah (lulusan 1–2 tahun sebelumnya)',
      'Rapor SMA semester 1–5',
      'Akta kelahiran (Kartu Keluarga tidak bisa menggantikan)',
      'Pas foto berwarna',
      'Surat bebas buta warna (khusus pendaftar Sekolah Farmasi)',
      'Motivation letter (diisi di portal pendaftaran)',
    ],
  },
  'ssu-rapor-itb': {
    confidence: 'tinggi',
    documents: [
      'SKL / Surat Keterangan Kelas 12 (lulusan tahun berjalan) atau ijazah',
      'Rapor SMA semester 1–5',
      'Akta kelahiran',
      'Pas foto berwarna',
      'Surat bebas buta warna (khusus pendaftar Sekolah Farmasi)',
      'Motivation letter',
      'Portofolio (khusus pendaftar FSRD / SAPPK)',
    ],
    note: 'Syarat peserta: terdaftar SNBP tahun berjalan.',
  },
  'ssu-utbk-itb': {
    confidence: 'tinggi',
    documents: [
      'SKL / Surat Keterangan Kelas 12 atau ijazah',
      'Rapor SMA semester 1–5',
      'Akta kelahiran',
      'Pas foto berwarna',
      'Kartu peserta + nomor peserta UTBK-SNBT tahun berjalan',
      'Surat bebas buta warna (khusus pendaftar Sekolah Farmasi)',
      'Motivation letter',
    ],
  },
  'smits-flat-its': {
    confidence: 'tinggi',
    documents: [
      'NIK + NISN',
      'Pas foto 4x6 (latar biru atau merah)',
      'Rapor semester 1–6 (atau s.d. 5 jika semester 6 belum keluar)',
      'Minimal 1 sertifikat prestasi akademik/non-akademik (maks 3 dokumen)',
      'Deskripsi diri 1 halaman (motivasi & pengalaman) dalam PDF',
      'Portofolio (wajib khusus DKV / Desain Produk / Desain Interior)',
    ],
    note: 'Jalur beasiswa perlu tambahan KIP-K dan/atau surat tidak mampu dari kelurahan.',
  },
  'sjp-ui': {
    confidence: 'sedang',
    documents: [
      'Scan rapor kelas 10–12',
      'Sertifikat prestasi minimal juara 3 / medali perunggu tingkat nasional atau internasional (3 tahun terakhir)',
      'Pas foto berwarna (min. 400x600px)',
      'Surat keterangan memenuhi syarat kesehatan sesuai prodi tujuan',
    ],
    note: 'Status jalur ini ditandai "ditutup" di data kami, tapi ditemukan halaman resmi SIMAK UI untuk siklus TA 2026/2027 - kemungkinan sudah dibuka lagi. Mohon diverifikasi.',
  },
  'sbub-undip': {
    confidence: 'tinggi',
    documents: [
      'Surat keterangan kelas 12 (ditandatangani kepala sekolah + stempel)',
      'Scan rapor asli semester 1–5, dilegalisasi kepala sekolah',
      'Pas foto 4x6 berwarna',
      'Sertifikat prestasi utama (juara 1–3 internasional/nasional, atau juara 1 provinsi)',
      'Sertifikat prestasi pendukung (opsional)',
    ],
    note: 'Syarat nilai: rata-rata rapor minimal 70 (skala 100) per semester.',
  },
  'smup-unpad': {
    confidence: 'tinggi',
    documents: [
      'Nomor peserta / skor SNBT-UTBK tahun berjalan',
      'Portofolio sesuai bidang (riset/inovasi, olahraga, seni budaya, tahfidz, atau keagamaan)',
      'Dokumen bukti prestasi sesuai bidang',
      'Rapor asli semester 1–5 (khusus jalur sains, sebagai bukti peringkat terbaik di kelas)',
      'Sertifikat baca partitur asli (khusus jalur musik)',
    ],
    note: 'Maksimal memilih 4 prodi (2 S1 + 2 D4/Sarjana Terapan).',
  },
  'smub-prestasi-ub': {
    confidence: 'sedang',
    documents: [
      'Rapor semester 1–5 (rata-rata nilai minimal 75 per semester)',
      'Bukti prestasi juara 1–3 tingkat internasional/nasional/provinsi (non-akademik), atau',
      'Sertifikat hafalan Al-Qur’an minimal 5 juz (alternatif prestasi)',
      'Surat keterangan sehat jasmani',
    ],
    note: 'Ada sedikit perbedaan syarat tahun kelulusan antar sumber - cek pengumuman resmi SELMA UB tahun berjalan.',
  },
  'spmb-unsoed': {
    confidence: 'sedang',
    documents: [
      'Rapor semester 1–5 (beberapa sumber menyebut s.d. semester 6 - cek ulang)',
      'Bukti prestasi tingkat kabupaten s.d. internasional (opsional, menambah penilaian)',
      'Bukti pengalaman organisasi/kepanitiaan tingkat kabupaten ke atas (opsional)',
      'Kesediaan membayar IPI (Iuran Pengembangan Institusi) saat registrasi',
    ],
    note: 'Tidak ditemukan halaman resmi dengan daftar dokumen lengkap untuk tahun berjalan - daftar ini disusun dari beberapa sumber berita.',
  },
  'smjki-uns': {
    confidence: 'rendah',
    documents: [
      'Rapor (untuk jalur nilai rapor) atau hasil UTUL UNS (untuk jalur ujian)',
      'Skor TOEFL/IELTS/Duolingo (angka ambang batas tidak konsisten antar sumber)',
      'Mengikuti sesi wawancara',
    ],
    note: 'Tidak ditemukan halaman resmi SPMB UNS yang bisa diverifikasi langsung untuk jalur ini. Harap cek spmb.uns.ac.id sebelum menyiapkan dokumen.',
  },
  'sima-unand': {
    confidence: 'tinggi',
    documents: [
      'Ijazah (lulusan 2 tahun sebelumnya) atau SKL (lulusan tahun berjalan), dilegalisasi',
      'Rapor semester 1–5, dilegalisasi kepala sekolah',
      'Bukti prestasi lomba, atau',
      'Sertifikat non-lomba (hafiz minimal 10 juz, atau SK ketua OSIS)',
    ],
  },
  'talenta-ipb': {
    confidence: 'tinggi',
    documents: [
      'Pas foto (latar merah atau putih)',
      'Sertifikat prestasi nasional/internasional sesuai jalur PIN yang dipilih',
      'Surat rekomendasi kepala sekolah',
      'Sertifikat ekstrakurikuler (maksimal 3, opsional)',
      'Kartu Keluarga',
      'Slip penghasilan orang tua (atau surat keterangan penghasilan dari RT/RW/kelurahan)',
      'Bukti pembayaran listrik 3 bulan terakhir',
      'Formulir komitmen pembayaran BPIF + UKT',
    ],
    note: 'Jalur Pramuka khusus siswa Jawa Barat, perlu tambahan rekomendasi Kwarda Jabar.',
  },
  'osis-ipb': {
    confidence: 'tinggi',
    documents: [
      'Pas foto (latar merah atau putih)',
      'Surat rekomendasi ketua OSIS dari kepala sekolah (template di portal)',
      'SK kepala sekolah tentang pengangkatan sebagai ketua OSIS',
      'Sertifikat ekstrakurikuler (maksimal 3, opsional)',
      'Kartu Keluarga',
      'Slip penghasilan orang tua (atau surat keterangan RT/RW/kelurahan)',
      'Bukti pembayaran listrik 3 bulan terakhir',
      'Surat komitmen pembayaran biaya pendidikan',
    ],
    note: 'Pernah menjabat ketua OSIS minimal 1 periode. Tidak ada ujian, seleksi berbasis dokumen.',
  },
  'smua-prestasi-unair': {
    confidence: 'rendah',
    documents: [
      'Rapor semester 1–5, dilegalisasi',
      'Surat keterangan eligible SNBP tahun berjalan',
      'Sertifikat prestasi',
      'Pas foto & dokumen identitas diri',
    ],
    note: 'Daftar dokumen resmi untuk tahun berjalan tidak ditemukan - harap verifikasi langsung ke ppmb.unair.ac.id sebelum menyiapkan berkas.',
  },
  'sm-prestasi-unnes': {
    confidence: 'tinggi',
    documents: [
      'Sertifikat / surat keterangan prestasi akademik atau non-akademik',
      'Pas foto 3x4',
      'Scan KTP',
      'Scan SKL / ijazah / surat keterangan kelas 12',
      'Surat kesanggupan membayar UKT (bermaterai Rp10.000)',
      'Surat penyetaraan ijazah dari Kemdiktisaintek (khusus lulusan sekolah luar negeri)',
    ],
  },
  'ssu-talenta-sains-itb': {
    confidence: 'tinggi',
    documents: [
      'Sertifikat asli medali OSN atau kompetisi sains internasional',
      'Surat rekomendasi panitia OSN + kepala sekolah',
      'SKL / ijazah',
      'Rapor semester 1–5',
      'Akta kelahiran',
      'Pas foto',
      'Motivation letter',
    ],
  },
  'ssu-talenta-itb': {
    confidence: 'sedang',
    documents: [
      'Portofolio sesuai cabang (olahraga/seni/keagamaan)',
      'Sertifikat prestasi nasional (minimal 2) sesuai cabang - Puspresnas/FLS3N/OMI/KSM/MTQ/MHQ atau setara',
      'Surat keterangan dari pengurus cabang olahraga, atau surat keterangan hafalan minimal 15 juz (jalur keagamaan)',
      'Surat rekomendasi kepala sekolah',
      'Motivation letter',
      'Rapor semester 1–5',
      'SKL / ijazah, akta kelahiran, pas foto',
    ],
    note: 'Hanya ditemukan dari satu sumber non-resmi (cukup rinci) - harap diverifikasi ke admission.itb.ac.id.',
  },
}

// Fallback for any jalur not yet in JALUR_DOCUMENTS above, or for custom jalur.
export const GENERIC_DOCUMENTS: Record<JalurCategory | 'snbp', string[]> = {
  snbp: [
    'KTP / Kartu Keluarga',
    'Rapor semester 1–5, dilegalisasi',
    'SKL atau ijazah',
    'Pas foto berwarna terbaru',
    'Surat keterangan eligible SNBP dari sekolah',
  ],
  essay_only: [
    'KTP / Kartu Keluarga',
    'Rapor semester 1–5, dilegalisasi',
    'SKL atau ijazah',
    'Pas foto berwarna terbaru',
    'Essay / motivation letter',
  ],
  prestasi_only: [
    'KTP / Kartu Keluarga',
    'Rapor semester 1–5, dilegalisasi',
    'SKL atau ijazah',
    'Pas foto berwarna terbaru',
    'Sertifikat prestasi akademik atau non-akademik',
    'Surat rekomendasi kepala sekolah',
  ],
  hybrid: [
    'KTP / Kartu Keluarga',
    'Rapor semester 1–5, dilegalisasi',
    'SKL atau ijazah',
    'Pas foto berwarna terbaru',
    'Sertifikat prestasi sesuai bidang',
    'Portofolio (jika bidang seni/olahraga/sains terapan)',
    'Motivation letter',
  ],
}

export function getJalurDocuments(jalurId: string, category: JalurCategory | 'snbp'): { documents: string[]; confidence: DocConfidence | 'generik'; note?: string } {
  const specific = JALUR_DOCUMENTS[jalurId]
  if (specific) return { ...specific }
  return { documents: GENERIC_DOCUMENTS[category], confidence: 'generik' }
}
