import type { Metadata } from 'next'
import KalkulatorPublicClient from './KalkulatorPublicClient'

export const metadata: Metadata = {
  title: 'Kalkulator Peluang SNBP 2025/2026 - Rasionalisasi Nilai Rapor PTN',
  description:
    'Hitung peluang lolos SNBP dan jalur rapor PTN impianmu secara gratis. Analisis nilai rapor semester 1-5, akreditasi sekolah, rekam jejak alumni, dan sertifikat prestasi.',
  keywords: [
    'kalkulator peluang snbp',
    'rasionalisasi nilai snbp',
    'prediksi lolos snbp',
    'cek peluang snbp gratis',
    'cara hitung nilai rapor snbp',
    'peluang lolos ui itb ugm unair',
  ],
  openGraph: {
    title: 'Kalkulator Peluang SNBP 2025/2026 - Rasionalisasi Nilai Rapor PTN',
    description:
      'Cek peluang kelulusanmu ke 80+ PTN se-Indonesia dengan algoritma rasionalisasi nilai rapor dan indeks sekolah terlengkap.',
    url: 'https://otwptn.com/kalkulator',
    siteName: 'OtwPTN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://otwptn.com/kalkulator',
  },
}

export default function KalkulatorPage() {
  return <KalkulatorPublicClient />
}
