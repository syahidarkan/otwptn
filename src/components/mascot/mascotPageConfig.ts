import type { ClipName } from './otbee/engine'
import type { ViewName } from './otbee/types'

export interface MascotConfig {
  clip: ClipName
  view: ViewName
  /** optional greeting when entering the page - "{name}" is replaced with the user's first name,
   *  or "Pejuang PTN" when nobody is signed in */
  greet?: string
}

export const MASCOT_PAGE_CONFIG: Record<string, MascotConfig> = {
  '/': { clip: 'wave', view: 'front', greet: 'Halo {name}! Otbee siap nemenin 🐝' },
  '/dashboard': { clip: 'cheer', view: 'front', greet: 'Selamat datang kembali, {name}! Yuk lanjut belajar 🔥' },
  '/dashboard/essay': { clip: 'thinking', view: 'threeQuarter', greet: 'Essay dulu yuk, {name}! Aku temenin ✍️' },
  '/dashboard/kalkulator': { clip: 'idle', view: 'threeQuarter', greet: 'Hitung peluangmu di sini, {name} 📈' },
  '/dashboard/otbee': { clip: 'wave', view: 'front' },
  '/dashboard/mentor': { clip: 'nod', view: 'threeQuarter' },
  '/dashboard/teman': { clip: 'wave', view: 'front' },
  '/dashboard/komunitas': { clip: 'bounce', view: 'front' },
  '/dashboard/tracking-jalur': { clip: 'idle', view: 'threeQuarter' },
  '/dashboard/latihan': { clip: 'dance', view: 'front' },
  '/dashboard/ecourse': { clip: 'idle', view: 'threeQuarter' },
  '/login': { clip: 'wave', view: 'front', greet: 'Masuk dulu ya, {name}! Aku tunggu 👋' },
  '/register': { clip: 'celebrate', view: 'front', greet: 'Selamat bergabung, {name}! 🎉' },
  default: { clip: 'idle', view: 'front' },
}

export function getMascotConfigForPath(pathname: string): MascotConfig {
  if (MASCOT_PAGE_CONFIG[pathname]) return MASCOT_PAGE_CONFIG[pathname]
  const prefix = Object.keys(MASCOT_PAGE_CONFIG)
    .filter(k => k !== 'default' && pathname.startsWith(k + '/'))
    .sort((a, b) => b.length - a.length)[0]
  return prefix ? MASCOT_PAGE_CONFIG[prefix] : MASCOT_PAGE_CONFIG.default
}
