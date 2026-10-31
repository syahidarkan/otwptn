import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://otwptn.com'
  const currentDate = new Date().toISOString()

  // Primary High-Priority Landing Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/jalur`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/panduan`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/panduan/jalur-non-tes-ptn`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/panduan/ppkb-ui`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/panduan/pbub-ugm`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/panduan/sjp-ipb`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/panduan/mentor-ptn-terbaik`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/upgrade`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/daftar`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/komunitas`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Jalur Non-Tes Subroutes for SEO Dominance
  const jalurTracks = [
    'ppkb-ui',
    'sjp-ipb',
    'pbub-ugm',
    'golden-ticket-unair',
    'smitb-peminatan',
    'snbp-nasional',
    'span-ptkin',
    'prestasi-undip',
    'mandiri-prestasi-unpad',
  ]

  const trackRoutes: MetadataRoute.Sitemap = jalurTracks.map(id => ({
    url: `${baseUrl}/jalur/${id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  // Artikel Hub & Articles for SEO Dominance
  const articleSlugs = [
    'panduan-lolos-snbp-2026-strategi-rapor-dan-prodi',
    'tips-menulis-personal-statement-ppkb-ui',
    'jalur-ketua-osis-sjp-ipb-kriteria-portofolio',
    'pbub-ugm-kategori-prestasi-dan-sertifikat',
    '5-kesalahan-fatal-essay-seleksi-non-tes',
    'cara-hitung-peluang-masuk-ptn-tanpa-tes',
  ]

  const articleRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/artikel`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    ...articleSlugs.map(slug => ({
      url: `${baseUrl}/artikel/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ]

  return [...staticRoutes, ...trackRoutes, ...articleRoutes]
}
