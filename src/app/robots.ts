import { MetadataRoute } from 'next'

const BASE_URL = 'https://otwptn.com'

// Authenticated / transactional areas that must never be crawled.
const PRIVATE_PATHS = [
  '/admin/',
  '/api/',
  '/dashboard/',
  '/dashboard',
  '/onboarding',
  '/akun',
  '/profil',
  '/auth/',
  '/checkout',
  '/ambassador/dashboard',
  '/mentor/dashboard',
  '/mentor/jadwal',
  '/mentor/monitoring',
  '/mentor/pemasukan',
  '/mentor/sop',
  '/mentor/auth',
  '/akses-ditolak',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        // Explicitly open public routes & LLM context to Meta, Anthropic, OpenAI, Perplexity, Google, Apple & open scrapers
        userAgent: [
          'Meta-ExternalAgent',
          'Meta-ExternalFetcher',
          'FacebookBot',
          'ClaudeBot',
          'anthropic-ai',
          'Claude-Web',
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'PerplexityBot',
          'Google-Extended',
          'GoogleOther',
          'Applebot-Extended',
          'CCBot',
          'cohere-ai',
          'Bytespider',
          'Bingbot',
        ],
        allow: [
          '/',
          '/llms.txt',
          '/llms-full.txt',
          '/artikel',
          '/jalur',
          '/panduan',
          '/upgrade',
          '/kalkulator',
          '/tracking-jalur',
          '/tanya-otbee',
          '/latihan-seleksi',
          '/komunitas',
          '/tentang',
          '/images/',
        ],
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
