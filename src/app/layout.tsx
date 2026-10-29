import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { LEGAL_ENTITY } from '@/lib/constants'
import ThemeHydrator from '@/components/ThemeHydrator'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://otwptn.id'),
  title: {
    default: 'otwptn — Platform #1 Lolos Masuk PTN Jalur Non-Tes | Bimbingan Mentor UI ITB UGM',
    template: '%s | otwptn — Masuk PTN Tanpa Tes',
  },
  description:
    'Platform bimbingan persiapan masuk PTN jalur non-tes (SNBP, PPKB UI, PBUB UGM, SJP IPB, Golden Ticket UNAIR). Dilengkapi kalkulator peluang rasionalisasi rapor, AI essay review instan, dan mentor alumni resmi PT. Lembaga Sains Nasional.',
  keywords: [
    'jalur non tes',
    'masuk ptn non tes',
    'mentor ptn',
    'ppkb ui',
    'ppkb',
    'sjp ipb',
    'sjp',
    'pbub ugm',
    'snbp 2027',
    'snbp',
    'masuk ptn tanpa tes',
    'bimbingan snbp',
    'kalkulator peluang snbp',
    'kalkulator peluang ptn',
    'essay snbp',
    'review essay ptn',
    'golden ticket unair',
    'smitb peminatan',
    'bimbel jalur prestasi',
    'rasionalisasi snbp',
    'konsultasi jurusan ptn',
    'otwptn',
    'pt lembaga sains nasional',
  ],
  authors: [{ name: 'PT. Lembaga Sains Nasional', url: 'https://otwptn.id' }],
  creator: 'otwptn',
  publisher: 'PT. Lembaga Sains Nasional',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'otwptn — Lolos PTN Non-Tes, Bukan Keberuntungan',
    description:
      'Solusi persiapan jalur non-tes PTN: kalkulator peluang nilai rapor, AI essay review, dan 1-on-1 bersama mentor alumni UI, ITB, & UGM.',
    url: 'https://otwptn.id',
    siteName: 'otwptn',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'otwptn - Platform Masuk PTN Non-Tes',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'otwptn — Lolos PTN Non-Tes, Bukan Keberuntungan',
    description: 'Bimbingan intensif seleksi non-tes PTN bersama mentor alumni dan teknologi AI.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://otwptn.id',
  },
  icons: {
    icon: [
      { url: '/favicon.png?v=3', type: 'image/png' },
      { url: '/favicon.ico?v=3', sizes: 'any' },
    ],
    shortcut: '/favicon.png?v=3',
    apple: '/favicon.png?v=3',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Google Sitelinks & Structured Data JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://otwptn.id/#website',
        url: 'https://otwptn.id',
        name: 'otwptn',
        description:
          'Platform #1 Lolos Masuk PTN Jalur Non-Tes (SNBP, PPKB UI, PBUB UGM, SJP IPB) dengan AI & Mentor Alumni',
        publisher: {
          '@id': 'https://otwptn.id/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://otwptn.id/jalur?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'EducationalOrganization',
        '@id': 'https://otwptn.id/#organization',
        name: LEGAL_ENTITY.name,
        alternateName: ['otwptn', 'OtwPTN Indonesia'],
        url: 'https://otwptn.id',
        logo: 'https://otwptn.id/logo.png',
        sameAs: [
          'https://instagram.com/otwptn',
          'https://tiktok.com/@otwptn',
        ],
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Kalkulator Peluang SNBP & Non-Tes',
        description: 'Simulasi rasionalisasi nilai rapor 5 semester dan sertifikat prestasi untuk hitung peluang lolos PTN.',
        url: 'https://otwptn.id/dashboard/kalkulator',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Essay AI Review & Kurasi Mandiri',
        description: 'Review instan draf esai motivasi seleksi non-tes dengan AI validator dan masukan mentor alumni.',
        url: 'https://otwptn.id/dashboard/essay',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Mentor Alumni UI ITB & UGM',
        description: 'Bimbingan 1-on-1 intensif dan review esai langsung bersama kakak mentor alumni jalur non-tes.',
        url: 'https://otwptn.id/dashboard/mentor',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Direktori & Tracking Jalur Non-Tes',
        description: 'Jadwal dan syarat lengkap PPKB UI, PBUB UGM, SJP IPB, Golden Ticket UNAIR, SNBP.',
        url: 'https://otwptn.id/jalur',
      },
    ],
  }

  return (
    <html
      lang="id"
      data-theme="light"
      suppressHydrationWarning
      className={`${outfit.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.png?v=3" type="image/png" />
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="shortcut icon" href="/favicon.png?v=3" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png?v=3" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-bg text-fg font-sans">
        <ThemeHydrator />
        {children}
      </body>
    </html>
  )
}
