import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'otwptn - Platform Masuk PTN Jalur Non-Tes',
    short_name: 'otwptn',
    description:
      'Platform bimbingan persiapan masuk PTN jalur non-tes (SNBP, PPKB UI, PBUB UGM, SJP IPB) dengan kalkulator peluang AI dan mentor alumni.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#fed45b',
    icons: [
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
