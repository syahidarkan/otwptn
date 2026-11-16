import type { Metadata } from 'next'
import TrackingJalurPublicClient from './TrackingJalurPublicClient'

export const metadata: Metadata = {
  title: 'Kalender & Tracking Jalur Non-Tes PTN 2025/2026 - Jadwal SNBP, PPKB, PBUB',
  description:
    'Pantau timeline, deadline pendaftaran, dan kelengkapan dokumen persyaratan 40+ jalur masuk PTN non-tes. Jangan lewatkan kesempatan lolos tanpa ujian tulis.',
  keywords: [
    'jadwal pendaftaran snbp 2026',
    'timeline ppkb ui',
    'jadwal seleksi mandiri prestasi pbub ugm',
    'syarat pendaftaran sjp ipb',
    'deadline jalur non tes ptn',
  ],
  openGraph: {
    title: 'Tracking Jalur Non-Tes PTN 2025/2026 - OtwPTN',
    description:
      'Kelola jadwal, pasang alarm deadline, dan pantau kelengkapan berkas seleksi PTN non-tes secara rapi.',
    url: 'https://otwptn.com/tracking-jalur',
    siteName: 'OtwPTN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://otwptn.com/tracking-jalur',
  },
}

export default function TrackingJalurPage() {
  return <TrackingJalurPublicClient />
}
