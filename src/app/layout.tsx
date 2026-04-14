import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'otwptn — Bimbingan Jalur Non-Test PTN',
  description: 'Platform bimbingan masuk PTN jalur non-test terpercaya. Essay Only, Prestasi Only, dan Hybrid. Bantu ratusan siswa tembus PTN impian tanpa UTBK.',
  keywords: 'bimbingan PTN, jalur non test, PPKB UI, SJP UI, PBUB UGM, masuk PTN tanpa UTBK',
  openGraph: {
    title: 'otwptn — Masuk PTN Impian. Tanpa Tes.',
    description: 'Bimbingan intensif untuk jalur masuk PTN berbasis essay, prestasi, dan hybrid.',
    siteName: 'otwptn',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={plusJakarta.className}>
      <body className="min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  )
}
