import type { ViewData, ViewName } from './types'
import frontData from './data/front'

const loaders: Record<ViewName, () => Promise<{ default: ViewData }>> = {
  front: () => Promise.resolve({ default: frontData }),
  threeQuarter: () => import('./data/threeQuarter'),
  right: () => import('./data/right'),
  left: () => import('./data/left'),
  back: () => import('./data/back'),
  top: () => import('./data/top'),
  bottom: () => import('./data/bottom'),
}
const cache = new Map<ViewName, ViewData>([['front', frontData]])
const pending = new Map<ViewName, Promise<ViewData>>()

// Warm background cache on browser idle so transitions & turns are instant
if (typeof window !== 'undefined') {
  const warmViews = () => {
    ;(['threeQuarter', 'right', 'left'] as ViewName[]).forEach(v => {
      loadView(v).catch(() => {})
    })
  }
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(warmViews, { timeout: 2500 })
  } else {
    setTimeout(warmViews, 1200)
  }
}

export function getCachedView(v: ViewName): ViewData | undefined { return cache.get(v) }
export function loadView(v: ViewName): Promise<ViewData> {
  const hit = cache.get(v)
  if (hit) return Promise.resolve(hit)
  let p = pending.get(v)
  if (!p) {
    p = loaders[v]().then(m => { cache.set(v, m.default); return m.default })
    pending.set(v, p)
  }
  return p
}
/** which way the character faces in a view (+1 = to screen right, -1 = left, 0 = camera) */
export const FACING: Record<ViewName, number> = { front: 0, threeQuarter: 1, right: 1, left: -1, back: 0, top: 0, bottom: 0 }
export const ALL_VIEWS: ViewName[] = ['front', 'threeQuarter', 'right', 'left', 'back', 'top', 'bottom']
