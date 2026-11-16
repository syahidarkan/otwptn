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
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'Google-Extended',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Applebot-Extended',
          'cohere-ai',
          'Bingbot',
        ],
        allow: ['/', '/llms.txt', '/artikel', '/jalur', '/panduan', '/upgrade', '/kalkulator', '/tentang'],
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
