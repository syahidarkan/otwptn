import type { Metadata } from 'next'
import EssayReviewPublicClient from './EssayReviewPublicClient'

export const metadata: Metadata = {
  title: 'AI Review Essay PTN & Beasiswa - Koreksi Essay PPKB UI, PBUB UGM, SJP IPB',
  description:
    'Review dan koreksi essay motivasi masuk PTN secara instan dengan kecerdasan buatan. Dilengkapi analisis STAR method, deteksi kalimat klise, dan penilaian dewan juri.',
  keywords: [
    'review essay ppkb ui',
    'contoh essay pbub ugm',
    'ai essay review ptn',
    'koreksi essay motivasi',
    'essay sjp ipb lolos',
    'cek essay beasiswa kuliah',
  ],
  openGraph: {
    title: 'AI Review Essay Motivasi PTN & Beasiswa - OtwPTN',
    description:
      'Periksa kualitas essay masuk PTN impianmu dengan rubrik dewan juri universitas ternama. Dapatkan skor, catatan kelemahan, dan saran revisi instan.',
    url: 'https://otwptn.com/essay-review',
    siteName: 'OtwPTN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://otwptn.com/essay-review',
  },
}

export default function EssayReviewPage() {
  return <EssayReviewPublicClient />
}
