import type { OtbeeAnimation } from './OtbeeMascot'

export interface MascotConfig {
  pose: string
  animation: OtbeeAnimation
}

export const MASCOT_PAGE_CONFIG: Record<string, MascotConfig> = {
  '/': { pose: 'maskot-plang-pejuang-ptn', animation: 'wave' },
  '/dashboard': { pose: 'maskot-lolos-ptn-loncat', animation: 'celebrate' },
  '/dashboard/essay': { pose: 'maskot-nulis-essay-meja', animation: 'thinking' },
  '/dashboard/kalkulator': { pose: 'maskot-peluang-persentase', animation: 'idle' },
  '/dashboard/otbee': { pose: 'maskot-bersama-robot-ai', animation: 'wave' },
  '/dashboard/mentor': { pose: 'maskot-fitur-mentor-alumni', animation: 'idle' },
  '/dashboard/teman': { pose: 'maskot-fitur-cari-teman-belajar', animation: 'wave' },
  '/dashboard/komunitas': { pose: 'maskot-toa-komunitas', animation: 'bounce' },
  '/dashboard/tracking-jalur': { pose: 'maskot-fitur-tracking-jalur', animation: 'idle' },
  '/dashboard/latihan': { pose: 'maskot-lolos-ptn-loncat', animation: 'bounce' },
  '/dashboard/ecourse': { pose: 'maskot-tablet-video-materi', animation: 'idle' },
  '/login': { pose: 'maskot-melambai-di-pintu-gerbang', animation: 'wave' },
  '/register': { pose: 'maskot-lolos-ptn-loncat', animation: 'celebrate' },
  'default': { pose: 'maskot-pov-depan-front', animation: 'idle' },
}

export function getMascotConfigForPath(pathname: string): MascotConfig {
  // Exact match first
  if (MASCOT_PAGE_CONFIG[pathname]) return MASCOT_PAGE_CONFIG[pathname]

  // Prefix match (longest first) for nested routes
  const prefixMatch = Object.keys(MASCOT_PAGE_CONFIG)
    .filter(key => key !== 'default' && pathname.startsWith(key + '/'))
    .sort((a, b) => b.length - a.length)[0]

  if (prefixMatch) return MASCOT_PAGE_CONFIG[prefixMatch]

  return MASCOT_PAGE_CONFIG['default']
}
