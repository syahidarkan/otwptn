import type { Metadata } from 'next'
import TanyaOtbeePublicClient from '../tanya-otbee/TanyaOtbeePublicClient'

export const metadata: Metadata = {
  title: 'Chat AI Konsultan Masuk PTN Jalur Mandiri & SNBP - OtwPTN',
  description:
    'Konsultasi 24 jam persiapan seleksi mandiri PTN non-tes, PPKB UI, PBUB UGM, dan SJP IPB bersama AI Otbee.',
  alternates: {
    canonical: 'https://otwptn.com/tanya-otbee',
  },
}

export default function ChatAiPage() {
  return <TanyaOtbeePublicClient />
}
