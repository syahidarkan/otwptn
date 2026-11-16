import type { Metadata } from 'next'
import LatihanSeleksiPublicClient from './LatihanSeleksiPublicClient'

export const metadata: Metadata = {
  title: 'Latihan Soal Seleksi PBUBM & Skrining PTN - Kuis Literasi & Ejaan Baku',
  description:
    'Asah kemampuan kosakata baku, penalaran bahasa, dan kesiapan administrasi seleksi masuk PTN non-tes. Coba kuis interaktif gratis sekarang.',
  keywords: [
    'latihan soal pbubm',
    'soal tes skrining ptn',
    'kuis kata baku kbbi',
    'simulasi seleksi non tes ptn',
    'bank soal ppkb dan pbub',
  ],
  openGraph: {
    title: 'Latihan Soal Seleksi PBUBM & Skrining PTN - OtwPTN',
    description:
      'Coba simulasi interaktif skrining akademik masuk PTN. Uji ketepatan pemahaman bahasa dan kosa kata baku.',
    url: 'https://otwptn.com/latihan-seleksi',
    siteName: 'OtwPTN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://otwptn.com/latihan-seleksi',
  },
}

export default function LatihanSeleksiPage() {
  return <LatihanSeleksiPublicClient />
}
