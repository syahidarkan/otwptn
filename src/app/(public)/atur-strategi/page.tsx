import type { Metadata } from 'next'
import AturStrategiPublicClient from './AturStrategiPublicClient'

export const metadata: Metadata = {
  title: 'Atur Strategi Masuk PTN - Formasi Pilihan 1 & 2 Anti-Gugur SNBP & Mandiri',
  description:
    'Rancang taktik kelulusan masuk PTN non-tes. Kombinasi pilihan prodi realistis vs impian, pembobotan sertifikat prestasi, dan pencegahan bentrok alumni satu sekolah.',
  keywords: [
    'strategi lolos snbp',
    'aturan pilihan 1 dan 2 snbp',
    'cara pilih jurusan snbp agar lolos',
    'strategi jalur mandiri non tes',
    'sertifikat pendukung snbp',
  ],
  openGraph: {
    title: 'Atur Strategi Masuk PTN - Formasi Pilihan 1 & 2 Anti-Gugur - OtwPTN',
    description:
      'Gunakan generator taktik masuk PTN untuk memaksimalkan peluang lolos tanpa terjebak aturan eliminasi sistemik.',
    url: 'https://otwptn.com/atur-strategi',
    siteName: 'OtwPTN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://otwptn.com/atur-strategi',
  },
}

export default function AturStrategiPage() {
  return <AturStrategiPublicClient />
}
