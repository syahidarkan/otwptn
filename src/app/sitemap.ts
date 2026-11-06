import { MetadataRoute } from 'next'
import { ARTICLES } from '@/lib/articlesData'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
      url: `${baseUrl}/tentang`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/direktori`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kebijakan-privasi`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/syarat-ketentuan`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
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

  // /jalur/[id] is backed by the jalur_pages table (uuid ids), so list the real active rows.
  // Public read is allowed by RLS; on any failure fall back to no per-jalur entries.
  let trackRoutes: MetadataRoute.Sitemap = []
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (url && anon) {
      const res = await fetch(`${url}/rest/v1/jalur_pages?select=id,created_at&is_active=eq.true`, {
        headers: { apikey: anon, Authorization: `Bearer ${anon}` },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(4000),
      })
      if (res.ok) {
        const rows: { id: string; created_at: string }[] = await res.json()
        trackRoutes = rows.map(r => ({
          url: `${baseUrl}/jalur/${r.id}`,
          lastModified: new Date(r.created_at).toISOString(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))
      }
    }
  } catch {
    trackRoutes = []
  }

  // Artikel Hub & All Articles from articlesData for SEO Dominance
  const articleRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/artikel`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    ...ARTICLES.map(a => ({
      url: `${baseUrl}/artikel/${a.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ]

  return [...staticRoutes, ...trackRoutes, ...articleRoutes]
}
