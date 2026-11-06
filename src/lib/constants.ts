import type { JalurStatic, PricingMap, JalurCategory } from '@/types'
import { PRICE_MATRIX, type Track } from '@/lib/pricing'

export const JALUR_LIST: JalurStatic[] = [
  // SNBP - jalur nasional berbasis rapor & peringkat sekolah, bukan per-PTN
  { id: 'snbp', name: 'SNBP', ptn: 'Seluruh PTN Negeri', category: 'snbp' },

  // ESSAY ONLY
  { id: 'ppkb-ui', name: 'PPKB UI', ptn: 'Universitas Indonesia', category: 'essay_only' },
  { id: 'ssu-tes-tulis-itb', name: 'SSU Jalur Tes Tulis ITB', ptn: 'Institut Teknologi Bandung', category: 'essay_only' },
  { id: 'ssu-rapor-itb', name: 'SSU Jalur Nilai Rapor ITB', ptn: 'Institut Teknologi Bandung', category: 'essay_only' },
  { id: 'ssu-utbk-itb', name: 'SSU Jalur Nilai UTBK ITB', ptn: 'Institut Teknologi Bandung', category: 'essay_only' },
  { id: 'smits-flat-its', name: 'SMITS FLAT ITS', ptn: 'Institut Teknologi Sepuluh Nopember', category: 'essay_only' },

  // PRESTASI ONLY
  { id: 'sjp-ui', name: 'Seleksi Jalur Prestasi (SJP) UI', ptn: 'Universitas Indonesia', category: 'prestasi_only', closed: true },
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

// Harga diturunkan dari src/lib/pricing.ts (sumber tunggal). Jangan hardcode angka di sini.
const CATEGORY_TRACK: Record<JalurCategory, Track> = {
  essay_only: 'essay',
  prestasi_only: 'prestasi',
  hybrid: 'hybrid',
}

function buildPricing(category: JalurCategory): PricingMap {
  const row = PRICE_MATRIX.individu[CATEGORY_TRACK[category]]
  return {
    review: row.review.amount,
    dokumen: row.dokumen.amount,
    menyeluruh: row.menyeluruh.amount,
  }
}

export const PRICING: Record<JalurCategory, PricingMap> = {
  essay_only: buildPricing('essay_only'),
  prestasi_only: buildPricing('prestasi_only'),
  hybrid: buildPricing('hybrid'),
}

export const WEB_PREMIUM_PRICE: Record<JalurCategory, number> = {
  essay_only: PRICE_MATRIX.individu.essay.web_premium.amount,
  prestasi_only: PRICE_MATRIX.individu.prestasi.web_premium.amount,
  hybrid: PRICE_MATRIX.individu.hybrid.web_premium.amount,
}

// Harga akhir dengan kode referral (hanya tier bermentor, mode Individu)
export const REFERRAL_PRICING: Record<JalurCategory, Partial<Record<keyof PricingMap, number>>> = {
  essay_only: {
    review: PRICE_MATRIX.individu.essay.review.referralAmount,
    dokumen: PRICE_MATRIX.individu.essay.dokumen.referralAmount,
    menyeluruh: PRICE_MATRIX.individu.essay.menyeluruh.referralAmount,
  },
  prestasi_only: {
    review: PRICE_MATRIX.individu.prestasi.review.referralAmount,
    dokumen: PRICE_MATRIX.individu.prestasi.dokumen.referralAmount,
    menyeluruh: PRICE_MATRIX.individu.prestasi.menyeluruh.referralAmount,
  },
  hybrid: {
    review: PRICE_MATRIX.individu.hybrid.review.referralAmount,
    dokumen: PRICE_MATRIX.individu.hybrid.dokumen.referralAmount,
    menyeluruh: PRICE_MATRIX.individu.hybrid.menyeluruh.referralAmount,
  },
}

export const ADDON_PRICE: Record<JalurCategory, number> = {
  essay_only: 50000,
  prestasi_only: 50000,
  hybrid: 50000,
}

export const CATEGORY_LABEL: Record<JalurCategory | 'snbp', string> = {
  snbp: 'SNBP',
  essay_only: 'Essay Only',
  prestasi_only: 'Prestasi Only',
  hybrid: 'Hybrid',
}

export const LEGAL_ENTITY = {
  name: 'PT. Lembaga Sains Nasional',
  brand: 'otwptn',
  email: 'otwptn.com@gmail.com',
}

export const TIER_LABEL: Record<string, string> = {
  web_premium: 'Web Premium (Self-Service)',
  review: 'Paket Review (Async)',
  dokumen: 'Paket Reguler',
  menyeluruh: 'Paket Intensif (VIP)',
  premium: 'Akun Premium (Fitur Only)',
}

export const TIER_DESCRIPTION: Record<string, string> = {
  review: 'Udah punya draft tapi masih ragu? Nectar itu bahan dasar tiap madu, di sini kami review dan poles dokumenmu biar bebas dari blind spot dan siap buat langkah berikutnya.',
  dokumen: 'Honeycomb itu struktur rapi tempat madu terbentuk. Kami bimbing kamu susun dokumen step-by-step, dari kerangka sampai strategi jurusan, sampai hasilnya benar-benar solid.',
  menyeluruh: 'Ratu lebah selalu diprioritaskan sama seluruh sarang. Paket Queen Bee (Royal Jelly) kasih kamu akses mentor unlimited, revisi tanpa batas, dan perlakuan paling eksklusif sampai kamu 100% yakin.',
  premium: 'Akses tanpa batas ke seluruh fitur kecerdasan buatan dan materi otwptn: AI Essay Reviewer, Kalkulator Peluang 5 Semester Rapor, Chat Otbee AI, Bebas buat Circle, dan Atur Strategi (tanpa mentor alumni).',
}

export const TIER_FEATURES: Record<JalurCategory, Record<string, string[]>> = {
  essay_only: {
    review: ['Free konsultasi awal', 'Cek dokumen', 'Koreksi essay', '2x putaran revisi', 'Via chat WhatsApp', 'Belum termasuk akses grup WhatsApp'],
    dokumen: ['Free konsultasi awal', 'Panduan kerangka dokumen', 'Bimbingan step by step', 'Strategi pemilihan jurusan', '5x putaran revisi', '2x Sesi Zoom', 'Via chat WhatsApp', 'Akses grup WhatsApp eksklusif'],
    menyeluruh: ['Free konsultasi awal', 'Panduan kerangka dokumen', 'Bimbingan step by step', 'Strategi pemilihan jurusan', 'Unlimited revisi sampai 100% yakin', 'Fleksibel via chat WhatsApp, sesi zoom, dan mentoring offline', 'Akses grup WhatsApp eksklusif', 'Exclusive Trip ke UI'],
  },
  prestasi_only: {
    review: ['Free konsultasi', 'Koreksi dokumen', 'Revisi draft wawancara', 'Via chat WA', 'Tanpa group WA'],
    dokumen: ['Free konsultasi', 'Bimbingan dokumen', 'Bimbingan wawancara', 'Revisi feedback 5x', '2x Sesi Zoom', 'Via chat WA', 'Group WA'],
    menyeluruh: ['Free konsultasi', 'Bimbingan dokumen', 'Bimbingan essay', 'Unlimited revisi', 'Chat + Zoom + Offline', 'Group WA', 'Trip ke UI'],
  },
  hybrid: {
    review: ['Free konsultasi', 'Cek dokumen', 'Koreksi essay', 'Koreksi draft wawancara', 'Revisi feedback 2x', 'Via chat WA', 'Tanpa group WA'],
    dokumen: ['Free konsultasi', 'Bimbingan dokumen', 'Bimbingan wawancara', 'Bimbingan essay', 'Revisi feedback 5x', 'Via chat WA', 'Group WA'],
    menyeluruh: ['Free konsultasi', 'Bimbingan dokumen', 'Bimbingan essay', 'Bimbingan wawancara', 'Unlimited revisi', 'Chat + Zoom + Offline', 'Group WA', 'Trip ke UI'],
  },
}

export const WA_GROUPS: Record<string, string> = {
  essay_only: 'https://chat.whatsapp.com/GwyVB7iiZys0A5LhAj6l6w',
  prestasi_only: 'https://chat.whatsapp.com/J0tnTGbTZeTALrUfATGJOY',
  hybrid: 'https://chat.whatsapp.com/FDxX2V7thsiEQyLYZa39Bk',
  all: 'https://chat.whatsapp.com/HtkVuPwenyPDB8iVxGrvHv',
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
    a: 'Jalur non-test adalah jalur masuk PTN yang tidak ada tes tulis/CBT. Bisa berbasis essay/motivation letter, prestasi kejuaraan, atau keduanya (hybrid).',
  },
  {
    q: 'Berapa lama proses pendampingan?',
    a: 'Tergantung paket. Review (Nectar) biasanya 3-5 hari kerja, Reguler (Honeycomb) 7-10 hari, dan Intensif (Queen Bee) mengikuti timeline jalur PTN tujuanmu.',
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
    a: 'Ya! Kamu bisa tambahkan jalur tambahan sebagai add-on dengan biaya Rp 50.000 sampai Rp 75.000 per jalur tergantung kategorinya.',
  },
  {
    q: 'Apa bedanya Essay Only, Prestasi Only, dan Hybrid?',
    a: 'Essay Only fokus pada penulisan motivation letter/esai. Prestasi Only berbasis sertifikat kejuaraan dan wawancara. Hybrid mensyaratkan keduanya.',
  },
]
