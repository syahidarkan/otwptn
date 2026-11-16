import type { Metadata } from 'next'
import TanyaOtbeePublicClient from './TanyaOtbeePublicClient'

export const metadata: Metadata = {
  title: 'Tanya Otbee - AI Konsultan Masuk PTN Jalur Mandiri & Non-Tes',
  description:
    'Konsultasi gratis persiapan masuk PTN jalur mandiri non-tes, SNBP, PPKB UI, PBUB UGM, dan SJP IPB. Dapatkan panduan syarat nilai rapor dan tips lolos tanpa tes tulis.',
  keywords: [
    'konsultasi jalur mandiri ptn',
    'chat ai masuk ptn',
    'jalur mandiri tanpa uang pangkal',
    'syarat nilai rapor ppkb ui',
    'tanya otbee ptn',
    'biaya ukt jalur mandiri ptn',
  ],
  openGraph: {
    title: 'Tanya Otbee - AI Konsultan Masuk PTN Jalur Mandiri & Non-Tes - OtwPTN',
    description:
      'Tanyakan strategi, syarat seleksi, dan peluang kelulusanmu ke PTN favorit langsung ke AI Otbee.',
    url: 'https://otwptn.com/tanya-otbee',
    siteName: 'OtwPTN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://otwptn.com/tanya-otbee',
  },
}

export default function TanyaOtbeePage() {
  return <TanyaOtbeePublicClient />
}
