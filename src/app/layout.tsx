import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { LEGAL_ENTITY } from '@/lib/constants'
import ThemeHydrator from '@/components/ThemeHydrator'
import CustomerServiceWidget from '@/components/chat/CustomerServiceWidget'

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://otwptn.com'),
  title: {
    default: 'otwptn | Platform #1 Lolos Masuk PTN Jalur Non-Tes | Bimbingan Mentor UI ITB UGM',
    template: '%s | otwptn | Masuk PTN Tanpa Tes',
  },
  description:
    'Platform bimbingan persiapan masuk PTN jalur non-tes (SNBP, PPKB UI, PBUB UGM, SJP IPB, Golden Ticket UNAIR). Dilengkapi kalkulator peluang rasionalisasi rapor, AI essay review instan, dan mentor alumni resmi PT. Lembaga Sains Nasional.',
  keywords: [
    'cara masuk ptn tanpa ujian',
    'masuk ptn impian tanpa tes',
    'strategi lolos snbp 2026',
    'rasionalisasi snbp gratis',
    'kalkulator peluang snbp',
    'kalkulator peluang rapor ptn',
    'review essay ppkb ui',
    'personal statement ppkb ui',
    'syarat sjp ipb ketua osis',
    'jalur prestasi pbub ugm',
    'golden ticket unair',
    'smitb peminatan prestasi',
    'kurasi sertifikat puspresnas bpti',
    'bimbingan mentor alumni ui itb ugm',
    'bimbel jalur non tes ptn',
    'konsultasi jurusan ptn online',
    'otwptn',
    'pt lembaga sains nasional',
  ],
  authors: [{ name: 'PT. Lembaga Sains Nasional', url: 'https://otwptn.com' }],
  creator: 'otwptn',
  publisher: 'PT. Lembaga Sains Nasional',
  applicationName: 'otwptn',
  category: 'education',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'otwptn | Masuk PTN Impianmu Tanpa Ujian - Bimbingan Non-Tes #1',
    description:
      'Solusi persiapan jalur non-tes PTN: kalkulator peluang nilai rapor, AI essay review, dan bimbingan 1-on-1 bersama mentor alumni UI, ITB, & UGM.',
    url: 'https://otwptn.com',
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
    title: 'otwptn | Masuk PTN Impianmu Tanpa Ujian',
    description: 'Bimbingan intensif seleksi non-tes PTN bersama mentor alumni UI ITB UGM dan teknologi AI.',
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
    canonical: 'https://otwptn.com',
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
  // Google Rich Results & Structured Data JSON-LD (E-E-A-T + FAQ + SoftwareApplication)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://otwptn.com/#website',
        url: 'https://otwptn.com',
        name: 'otwptn',
        alternateName: 'OtwPTN - Masuk PTN Tanpa Tes',
        description:
          'Platform #1 Lolos Masuk PTN Jalur Non-Tes (SNBP, PPKB UI, PBUB UGM, SJP IPB) dengan AI & Mentor Alumni UI ITB UGM',
        publisher: {
          '@id': 'https://otwptn.com/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://otwptn.com/jalur?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'EducationalOrganization',
        '@id': 'https://otwptn.com/#organization',
        name: LEGAL_ENTITY.name,
        alternateName: ['otwptn', 'OtwPTN Indonesia'],
        url: 'https://otwptn.com',
        logo: 'https://otwptn.com/logo.png',
        description:
          'Lembaga bimbingan dan platform persiapan seleksi masuk PTN jalur non-tes resmi di Indonesia.',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'ID',
        },
        sameAs: [
          'https://instagram.com/otwptn',
          'https://tiktok.com/@otwptn',
        ],
      },
      {
        '@type': 'WebApplication',
        '@id': 'https://otwptn.com/#app',
        name: 'otwptn AI - Kalkulator Peluang SNBP & Review Essay PTN',
        url: 'https://otwptn.com',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'IDR',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '12500',
          bestRating: '5',
          worstRating: '1',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://otwptn.com/#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Apa itu jalur non-tes PTN dan apa saja contohnya?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Jalur non-tes adalah mekanisme seleksi masuk Perguruan Tinggi Negeri tanpa ujian tulis/CBT. Seleksi murni dinilai berdasarkan rekam jejak akademik (nilai rapor semester 1-5), kurasi prestasi/sertifikat, essay motivasi, dan portofolio. Contohnya: SNBP Nasional, PPKB & Talent Scouting UI, PBUB UGM, SJP IPB (Ketua OSIS), SMUP Prestasi Unpad, dan Mandiri Prestasi ITS/UNAIR.',
            },
          },
          {
            '@type': 'Question',
            name: 'Bagaimana AI otwptn menghitung peluang lolos SNBP & Jalur Prestasi?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'AI kami menganalisis nilai rapor mata pelajaran pendukung prodi, konsistensi tren nilai semester 1-5, akreditasi sekolah, rekam jejak alumni di PTN tujuan, hingga validitas sertifikat juara (Puspresnas/BPTI). Hasilnya memberikan kalkulasi objektif agar kamu tidak bertabrakan dengan teman satu sekolah.',
            },
          },
          {
            '@type': 'Question',
            name: 'Apakah review essay motivasi hanya dari AI atau ada mentor manusia?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Di otwptn kamu mendapatkan keduanya! AI kami menganalisis struktur esai, grammar, kejelasan argumen, dan logika dalam hitungan detik. Di Paket bimbingan mentor, esaimu juga dibedah langsung oleh mentor alumni kampus impian (UI, ITB, UGM) secara tatap muka via Zoom & Google Docs.',
            },
          },
          {
            '@type': 'Question',
            name: 'Sertifikat apa saja yang diakui dan bisa dikurasi di platform?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Semua sertifikat juara lomba akademik (OSN/KSN, OPSI, LKTI), non-akademik (O2SN, FLS2N), kepemimpinan (Ketua OSIS/MPK), hingga kejuaraan internasional yang terkurasi Puspresnas/Kemendikbudristek. Platform kami membantu memilih 3 sertifikat terbaik dengan bobot poin tertinggi.',
            },
          },
          {
            '@type': 'Question',
            name: 'Apakah data nilai rapor, essay motivasi, dan dokumen saya aman?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sangat aman. Seluruh data rapor, draft essay, dan file sertifikatmu disimpan dengan enkripsi tingkat bank di Supabase Storage & Database pribadi kamu. Data tidak pernah disebarluaskan tanpa izin tertulismu.',
            },
          },
        ],
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Kalkulator Peluang SNBP & Non-Tes',
        description: 'Simulasi rasionalisasi nilai rapor 5 semester dan sertifikat prestasi untuk hitung peluang lolos PTN.',
        url: 'https://otwptn.com/dashboard/kalkulator',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Essay AI Review & Kurasi Mandiri',
        description: 'Review instan draf esai motivasi seleksi non-tes dengan AI validator dan masukan mentor alumni.',
        url: 'https://otwptn.com/dashboard/essay',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Mentor Alumni UI ITB & UGM',
        description: 'Bimbingan 1-on-1 intensif dan review esai langsung bersama kakak mentor alumni jalur non-tes.',
        url: 'https://otwptn.com/dashboard/mentor',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Direktori & Tracking Jalur Non-Tes',
        description: 'Jadwal dan syarat lengkap PPKB UI, PBUB UGM, SJP IPB, Golden Ticket UNAIR, SNBP.',
        url: 'https://otwptn.com/jalur',
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
        <CustomerServiceWidget />
      </body>
    </html>
  )
}

