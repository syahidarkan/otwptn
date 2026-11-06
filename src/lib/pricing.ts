// Single source of truth for the Mode x Track x Tier pricing matrix.
// Imported by both /upgrade (display) and /api/checkout (authoritative charge amount) -
// client-sent amounts are never trusted.

export const MODES = ['individu', 'squad'] as const
export type Mode = (typeof MODES)[number]

export const TRACKS = ['essay', 'prestasi', 'hybrid'] as const
export type Track = (typeof TRACKS)[number]

// Keep these backendKey names unchanged - profiles.tier (premium-gating) depends on them.
export const TIERS = ['web_premium', 'review', 'dokumen', 'menyeluruh'] as const
export type Tier = (typeof TIERS)[number]

export const TIER_LABELS: Record<Tier, string> = {
  web_premium: 'Akun Premium',
  review: 'Nectar',
  dokumen: 'Honeycomb',
  menyeluruh: 'Royal Jelly',
}

export const TIER_TAGLINES: Record<Tier, string> = {
  web_premium: 'Akses penuh semua fitur AI & e-course. Tanpa mentor alumni.',
  review: 'Termasuk Akun Premium. Esai/prestasimu direview tertulis sama mentor alumni.',
  dokumen: 'Termasuk Akun Premium. Review tertulis plus sesi mentoring langsung via Zoom.',
  menyeluruh: 'Termasuk Akun Premium. Pendampingan penuh, beberapa sesi langsung, prioritas jadwal mentor.',
}

export const TIER_PERIOD: Record<Tier, string> = {
  web_premium: 'Sampai jalur mandiri selesai (±5 bln)',
  review: 'Berlaku 1,5 bulan',
  dokumen: 'Berlaku 2,5 bulan',
  menyeluruh: 'Berlaku 3 bulan',
}

export const TIER_BADGE: Partial<Record<Tier, string>> = {
  review: 'Direview Mentor',
  dokumen: 'Paling Banyak Dipilih',
  menyeluruh: 'Paling Lengkap',
}

export const TIER_POPULAR: Tier = 'dokumen'

interface PriceEntry {
  weekly: string
  amount: number
  referralAmount?: number
}

// Squad price is fixed per tier regardless of track ("harga tetap, nggak ikut toggle cakupan").
const SQUAD_PRICES: Record<Tier, PriceEntry> = {
  web_premium: { weekly: 'Rp1.000/minggu', amount: 19000 },
  review: { weekly: 'Rp12.500/minggu', amount: 75000 },
  dokumen: { weekly: 'Rp9.900/minggu', amount: 99000 },
  menyeluruh: { weekly: 'Rp19.200/minggu', amount: 249000 },
}

export const PRICE_MATRIX: Record<Mode, Record<Track, Record<Tier, PriceEntry>>> = {
  individu: {
    essay: {
      web_premium: { weekly: 'Rp1.500/minggu', amount: 29000 },
      review: { weekly: 'Rp14.800/minggu', amount: 89000, referralAmount: 75700 },
      dokumen: { weekly: 'Rp17.900/minggu', amount: 179000, referralAmount: 161100 },
      menyeluruh: { weekly: 'Rp26.800/minggu', amount: 349000, referralAmount: 331600 },
    },
    prestasi: {
      web_premium: { weekly: 'Rp1.500/minggu', amount: 29000 },
      review: { weekly: 'Rp14.800/minggu', amount: 89000, referralAmount: 75700 },
      dokumen: { weekly: 'Rp17.900/minggu', amount: 179000, referralAmount: 161100 },
      menyeluruh: { weekly: 'Rp26.800/minggu', amount: 349000, referralAmount: 331600 },
    },
    hybrid: {
      web_premium: { weekly: 'Rp2.000/minggu', amount: 39000 },
      review: { weekly: 'Rp18.200/minggu', amount: 109000, referralAmount: 92700 },
      dokumen: { weekly: 'Rp21.900/minggu', amount: 219000, referralAmount: 197100 },
      menyeluruh: { weekly: 'Rp30.700/minggu', amount: 399000, referralAmount: 379100 },
    },
  },
  squad: {
    essay: SQUAD_PRICES,
    prestasi: SQUAD_PRICES,
    hybrid: SQUAD_PRICES,
  },
}

export const FEATURES: Record<Track, Record<Tier, string[]>> = {
  essay: {
    web_premium: [
      'Kalkulator peluang masuk (AI)',
      'Roadmap & countdown pendaftaran',
      'Document hub + auto-zip berkas',
    ],
    review: ['Free konsultasi awal', 'Cek dokumen', 'Koreksi essay', '2x putaran revisi', 'Via chat WhatsApp'],
    dokumen: [
      'Free konsultasi awal',
      'Panduan kerangka dokumen',
      'Bimbingan step by step',
      'Strategi pemilihan jurusan',
      '5x putaran revisi',
      '2x sesi mentoring (Zoom)',
      'Akses grup WhatsApp eksklusif',
    ],
    menyeluruh: [
      'Free konsultasi awal',
      'Panduan kerangka dokumen',
      'Bimbingan step by step',
      'Strategi pemilihan jurusan',
      'Revisi unlimited sampai 100% yakin',
      'Fleksibel chat, Zoom & mentoring offline',
      'Akses grup WhatsApp eksklusif',
      'Exclusive trip ke kampus UI',
    ],
  },
  prestasi: {
    web_premium: [
      'Kalkulator peluang masuk (AI)',
      'Roadmap & countdown pendaftaran',
      'Document hub + auto-zip berkas',
    ],
    review: ['Free konsultasi awal', 'Koreksi dokumen', 'Revisi draft wawancara', 'Via chat WhatsApp'],
    dokumen: [
      'Free konsultasi awal',
      'Bimbingan dokumen',
      'Bimbingan wawancara',
      '5x putaran revisi',
      '2x sesi mentoring (Zoom)',
      'Akses grup WhatsApp eksklusif',
    ],
    menyeluruh: [
      'Free konsultasi awal',
      'Bimbingan dokumen',
      'Bimbingan essay',
      'Revisi unlimited sampai 100% yakin',
      'Fleksibel chat, Zoom & mentoring offline',
      'Akses grup WhatsApp eksklusif',
      'Exclusive trip ke kampus UI',
    ],
  },
  hybrid: {
    web_premium: [
      'Kalkulator peluang masuk (AI)',
      'Roadmap & countdown pendaftaran',
      'Document hub + auto-zip berkas',
    ],
    review: [
      'Free konsultasi awal',
      'Cek dokumen',
      'Koreksi essay',
      'Koreksi draft wawancara',
      '2x putaran revisi',
      'Via chat WhatsApp',
    ],
    dokumen: [
      'Free konsultasi awal',
      'Bimbingan dokumen',
      'Bimbingan wawancara',
      'Bimbingan essay',
      '5x putaran revisi',
      '2x sesi mentoring (Zoom)',
      'Akses grup WhatsApp eksklusif',
    ],
    menyeluruh: [
      'Free konsultasi awal',
      'Bimbingan dokumen',
      'Bimbingan essay',
      'Bimbingan wawancara',
      'Revisi unlimited sampai 100% yakin',
      'Fleksibel chat, Zoom & mentoring offline',
      'Akses grup WhatsApp eksklusif',
      'Exclusive trip ke kampus UI',
    ],
  },
}

export function getPrice(mode: Mode, track: Track, tier: Tier): PriceEntry {
  return PRICE_MATRIX[mode][track][tier]
}

export function formatIDR(amount: number): string {
  return `Rp${amount.toLocaleString('id-ID')}`
}

// mentor_applications.track / tier config used by auto mentor-matching and mentoring session quotas.
export const TIER_SESSION_CONFIG: Record<Tier, { zoom: number; revisions: number }> = {
  web_premium: { zoom: 0, revisions: 0 },
  review: { zoom: 0, revisions: 2 },
  dokumen: { zoom: 2, revisions: 5 },
  menyeluruh: { zoom: 999, revisions: 999 },
}

// Flat ambassador commission per mentee, regardless of mode/track (Squad commission is
// calculated per individual mentee order, not split - each of the 3 squad orders pays this
// same amount independently).
export const TIER_COMMISSION: Record<Tier, number> = {
  menyeluruh: 75000,
  dokumen: 35000,
  review: 15000,
  web_premium: 10000,
}

// Addon track prices
export function getAddonPrice(track: Track, isInter?: boolean): number {
  if (isInter) {
    return track === 'hybrid' ? 90000 : 65000
  }
  return track === 'hybrid' ? 75000 : 50000
}

// Surcharge for Main Jalur if it is an International track (only for mentored tiers)
export function getInterSurcharge(tier: Tier): number {
  if (tier === 'web_premium') return 0
  if (tier === 'review') return 25000
  return 50000
}
