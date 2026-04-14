import type { JalurStatic, PricingMap, JalurCategory } from '@/types'

export const JALUR_LIST: JalurStatic[] = [
  // ESSAY ONLY
  { id: 'ppkb-ui', name: 'PPKB UI', ptn: 'Universitas Indonesia', category: 'essay_only' },
  { id: 'ssu-tes-tulis-itb', name: 'SSU Jalur Tes Tulis ITB', ptn: 'Institut Teknologi Bandung', category: 'essay_only' },
  { id: 'ssu-rapor-itb', name: 'SSU Jalur Nilai Rapor ITB', ptn: 'Institut Teknologi Bandung', category: 'essay_only' },
  { id: 'ssu-utbk-itb', name: 'SSU Jalur Nilai UTBK ITB', ptn: 'Institut Teknologi Bandung', category: 'essay_only' },
  { id: 'smits-flat-its', name: 'SMITS FLAT ITS', ptn: 'Institut Teknologi Sepuluh Nopember', category: 'essay_only' },

  // PRESTASI ONLY
  { id: 'sjp-ui', name: 'Seleksi Jalur Prestasi (SJP) UI', ptn: 'Universitas Indonesia', category: 'prestasi_only' },
  { id: 'sbub-undip', name: 'SBUB UNDIP', ptn: 'Universitas Diponegoro', category: 'prestasi_only' },
  { id: 'smup-unpad', name: 'SMUP Minat & Bakat UNPAD', ptn: 'Universitas Padjadjaran', category: 'prestasi_only' },
  { id: 'smub-prestasi-ub', name: 'SMUB Prestasi UB', ptn: 'Universitas Brawijaya', category: 'prestasi_only' },
  { id: 'spmb-unsoed', name: 'SPMB Mandiri Non-UTBK UNSOED', ptn: 'Universitas Jenderal Soedirman', category: 'prestasi_only' },
  { id: 'smjki-uns', name: 'SMJKI UNS', ptn: 'Universitas Sebelas Maret', category: 'prestasi_only' },
  { id: 'sima-unand', name: 'SIMA UNAND', ptn: 'Universitas Andalas', category: 'prestasi_only' },
  { id: 'talenta-ipb', name: 'Jalur Talenta IPB', ptn: 'IPB University', category: 'prestasi_only' },
  { id: 'osis-ipb', name: 'Jalur Ketua OSIS IPB', ptn: 'IPB University', category: 'prestasi_only' },
  { id: 'smua-prestasi-unair', name: 'SMUA Jalur Prestasi UNAIR', ptn: 'Universitas Airlangga', category: 'prestasi_only' },
  { id: 'sm-prestasi-unnes', name: 'SM Prestasi UNNES', ptn: 'Universitas Negeri Semarang', category: 'prestasi_only' },

  // HYBRID
  { id: 'ssu-talenta-sains-itb', name: 'SSU Jalur Talenta Sains ITB', ptn: 'Institut Teknologi Bandung', category: 'hybrid' },
  { id: 'ssu-talenta-itb', name: 'SSU Jalur Talenta (Olahraga/Seni/Keagamaan) ITB', ptn: 'Institut Teknologi Bandung', category: 'hybrid' },
]

export const BANK_INFO = {
  bank: 'Aladin Syariah',
  account_number: '50275147652',
  account_name: 'Syahid Arkan Fashihurrohman',
}

export const PRICING: Record<JalurCategory, PricingMap> = {
  essay_only: { review: 65000, dokumen: 129000, menyeluruh: 259000 },
  prestasi_only: { review: 50000, dokumen: 125000, menyeluruh: 249000 },
  hybrid: { review: 75000, dokumen: 149000, menyeluruh: 269000 },
}

export const ADDON_PRICE: Record<JalurCategory, number> = {
  essay_only: 50000,
  prestasi_only: 50000,
  hybrid: 50000,
}

export const CATEGORY_LABEL: Record<JalurCategory, string> = {
  essay_only: 'Essay Only',
  prestasi_only: 'Prestasi Only',
  hybrid: 'Hybrid',
}

export const TIER_LABEL: Record<string, string> = {
  review: 'Review',
  dokumen: 'Bimbingan Terbatas',
  menyeluruh: 'Bimbingan Full',
}

export const TIER_DESCRIPTION: Record<string, string> = {
  review: 'Koreksi & feedback dokumen yang sudah kamu siapkan',
  dokumen: 'Pendampingan dari awal hingga dokumen siap submit',
  menyeluruh: 'Pendampingan penuh + akses mentor langsung',
}

export const TIER_FEATURES: Record<JalurCategory, Record<string, string[]>> = {
  essay_only: {
    review: ['Free konsultasi', 'Cek dokumen', 'Koreksi essay', 'Revisi feedback 2x', 'Via chat WA', 'Tanpa group WA'],
    dokumen: ['Free konsultasi', 'Bimbingan dokumen dari awal', 'Bimbingan essay', 'Revisi feedback 5x', 'Via chat WA', 'Group WA'],
    menyeluruh: ['Free konsultasi', 'Bimbingan dokumen', 'Bimbingan essay', 'Unlimited revisi', 'Chat + Zoom + Offline', 'Group WA', 'Trip ke UI'],
  },
  prestasi_only: {
    review: ['Free konsultasi', 'Koreksi dokumen', 'Revisi draft wawancara', 'Via chat WA', 'Tanpa group WA'],
    dokumen: ['Free konsultasi', 'Bimbingan dokumen', 'Bimbingan wawancara', 'Revisi feedback 5x', 'Via chat WA', 'Group WA'],
    menyeluruh: ['Free konsultasi', 'Bimbingan dokumen', 'Bimbingan essay', 'Unlimited revisi', 'Chat + Zoom + Offline', 'Group WA', 'Trip ke UI'],
  },
  hybrid: {
    review: ['Free konsultasi', 'Cek dokumen', 'Koreksi essay', 'Koreksi draft wawancara', 'Revisi feedback 2x', 'Via chat WA', 'Tanpa group WA'],
    dokumen: ['Free konsultasi', 'Bimbingan dokumen', 'Bimbingan wawancara', 'Bimbingan essay', 'Revisi feedback 5x', 'Via chat WA', 'Group WA'],
    menyeluruh: ['Free konsultasi', 'Bimbingan dokumen', 'Bimbingan essay', 'Bimbingan wawancara', 'Unlimited revisi', 'Chat + Zoom + Offline', 'Group WA', 'Trip ke UI'],
  },
}

export const MENTORS = [
  { id: 'mentor-essay', name: 'Mentor Essay', wa: '6281326197196', label: 'Mentor Essay (Essay Only)' },
  { id: 'mentor-prestasi', name: 'Mentor Prestasi', wa: '6285781099101', label: 'Mentor Prestasi (Prestasi & Hybrid)' },
]

export const STATS = [
  { value: '200+', label: 'Alumni' },
  { value: '30+', label: 'PTN Tujuan' },
  { value: '3', label: 'Kategori Jalur' },
  { value: '98%', label: 'Satisfaction' },
]

export const FAQS = [
  {
    q: 'Apa itu jalur non-test PTN?',
    a: 'Jalur non-test adalah jalur masuk PTN yang tidak tes tulis/CBT. Bisa berbasis essay/motivation letter, prestasi kejuaraan, atau keduanya (hybrid).',
  },
  {
    q: 'Berapa lama proses pendampingan?',
    a: 'Tergantung tier. Review biasanya 3–5 hari kerja. Dokumen 7–10 hari. Menyeluruh mengikuti timeline jalur PTN tujuanmu.',
  },
  {
    q: 'Apakah ada jaminan diterima PTN?',
    a: 'Kami tidak menjanjikan kelulusan karena keputusan akhir ada di tangan PTN. Namun kami memastikan dokumen dan esaimu berkualitas terbaik.',
  },
  {
    q: 'Bagaimana alur setelah mendaftar?',
    a: 'Setelah daftar dan bayar, admin akan verifikasi dalam 1x24 jam. Jika dikonfirmasi, kamu langsung dapat akses grup WhatsApp dan e-course.',
  },
  {
    q: 'Apakah bisa daftar lebih dari satu jalur?',
    a: 'Ya! Kamu bisa tambahkan jalur tambahan sebagai add-on dengan biaya Rp 50.000–75.000 per jalur tergantung kategorinya.',
  },
  {
    q: 'Apa bedanya Essay Only, Prestasi Only, dan Hybrid?',
    a: 'Essay Only fokus pada penulisan motivation letter/esai. Prestasi Only berbasis sertifikat kejuaraan atau status OSIS. Hybrid mensyaratkan keduanya.',
  },
]
