import { loadFont as loadOutfit } from '@remotion/google-fonts/Outfit'
import { loadFont as loadJakarta } from '@remotion/google-fonts/PlusJakartaSans'


export type Layout = 'landscape' | 'portrait'
export const SIZE: Record<Layout, { w: number; h: number }> = {
  landscape: { w: 1920, h: 1080 },
  portrait: { w: 1080, h: 1920 },
}

// Brand tokens ported from src/app/globals.css
export const C = {
  accent: '#FFD400',
  accentHover: '#F0C700',
  amber: '#F59E0B',
  amberDeep: '#D97706',
  amberInk: '#92400E',
  ink: '#111111',
  bg: '#FFFFFF',
  bgAlt: '#F7F7F5',
  muted: '#6B7280',
  muted2: '#9CA3AF',
  border: '#E9E9E7',
  dark: '#111111',
  dark2: '#18181B',
  green: '#16A34A',
  greenSoft: '#DCFCE7',
  essayBg: '#FEF9C3',
  essayFg: '#854D0E',
}

const hasDom = typeof document !== 'undefined'
export const FONT = {
  head: hasDom ? loadOutfit('normal', { weights: ['500', '600', '700', '800', '900'], subsets: ['latin'] }).fontFamily : 'Outfit',
  body: hasDom ? loadJakarta('normal', { weights: ['500', '600', '700', '800'], subsets: ['latin'] }).fontFamily : 'Plus Jakarta Sans',
}
