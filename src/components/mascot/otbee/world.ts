/**
 * Otbee "world": finds places he can genuinely stand, i.e. something the user can SEE under his feet.
 *
 *  - edge   top edge of any box whose look differs from what is right above it (card, section boundary, pill ...)
 *  - line   thin rules / border lines
 *  - media  images, video, canvas, svg illustrations
 *  - control buttons / links that have their own background
 *  - text   the real glyphs of a line of text (measured per character, so he never stands on empty line space)
 *
 * All returned anchors resolve to PAGE (document) coordinates so the mascot can be positioned in the
 * document and scroll natively with the page (no per-frame chasing, no lag).
 */

export interface Spot { x: number; y: number }
export type SurfaceKind = 'edge' | 'line' | 'media' | 'control' | 'text'

export interface Anchor {
  kind: SurfaceKind
  el: Element
  /** feet position in page coordinates, or null when the surface no longer exists */
  resolve(): Spot | null
}

export interface Candidate {
  kind: SurfaceKind
  el: Element
  /** viewport y of the surface at scan time */
  y: number
  /** viewport x range where feet may be placed */
  xa: number
  xb: number
  weight: number
  /** validate the surface at viewport x and build an anchor, or null if nothing visible is there */
  make(xv: number): { anchor: Anchor; x: number; y: number; air: number } | null
}

export const IGNORE_SELECTOR = '#otbee-floating-container, #cs-chat-widget, [data-otbee-ignore]'
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK', 'HEAD', 'TITLE', 'BR', 'HTML', 'BODY', 'TEXTAREA', 'OPTION', 'SELECT', 'IFRAME'])
const MEDIA_TAGS = new Set(['IMG', 'VIDEO', 'CANVAS', 'PICTURE'])
const INK_TAGS = new Set(['IMG', 'VIDEO', 'CANVAS', 'BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'SVG', 'PATH', 'CIRCLE', 'RECT', 'G', 'LABEL'])

// ------------------------------------------------------------------ colour helpers
let _cv: CanvasRenderingContext2D | null = null
const _colorCache = new Map<string, [number, number, number, number]>()
function colorOf(css: string): [number, number, number, number] {
  const hit = _colorCache.get(css)
  if (hit) return hit
  let out: [number, number, number, number] = [0, 0, 0, 0]
  try {
    if (!_cv) { const c = document.createElement('canvas'); c.width = c.height = 1; _cv = c.getContext('2d', { willReadFrequently: true }) }
    if (_cv) {
      _cv.clearRect(0, 0, 1, 1)
      _cv.fillStyle = '#000'
      _cv.fillStyle = css
      _cv.fillRect(0, 0, 1, 1)
      const d = _cv.getImageData(0, 0, 1, 1).data
      out = [d[0], d[1], d[2], d[3] / 255]
    }
  } catch { /* ignore */ }
  if (_colorCache.size > 400) _colorCache.clear()
  _colorCache.set(css, out)
  return out
}

function ignored(el: Element): boolean { return !!el.closest(IGNORE_SELECTOR) }

/** topmost element at a point that is not Otbee himself / the chat widget */
function hitAt(x: number, y: number): Element | null {
  if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return null
  const list = document.elementsFromPoint(x, y)
  for (const e of list) if (!ignored(e)) return e
  return null
}

function hasOwnText(el: Element): boolean {
  for (const n of el.childNodes) if (n.nodeType === 3 && (n.nodeValue ?? '').trim().length > 1) return true
  return false
}

/** how much of the space where his body will be is free of text / images / buttons (1 = completely clear) */
function airAt(x: number, yFoot: number, scale: number): number {
  const dys = [14, 36, 58, 80, 100].map(v => v * scale)
  let occ = 0, total = 0
  for (const dy of dys) for (const dx of [-16 * scale, 0, 16 * scale]) {
    const yy = yFoot - dy
    if (yy < 0) continue
    const h = hitAt(x + dx, yy)
    total++
    if (!h) continue
    const tag = h.tagName.toUpperCase()
    if (INK_TAGS.has(tag) || h.closest('svg') || hasOwnText(h)) occ++
  }
  return total ? 1 - occ / total : 1
}

// ------------------------------------------------------------------ effective background
function bgKey(el: Element | null): string {
  let cur: Element | null = el
  for (let i = 0; cur && i < 14; i++, cur = cur.parentElement) {
    const cs = getComputedStyle(cur)
    if (cs.backgroundImage !== 'none') return 'img:' + cs.backgroundImage.slice(0, 80)
    const c = colorOf(cs.backgroundColor)
    if (c[3] > 0.12) return `rgb:${c[0]},${c[1]},${c[2]}`
  }
  return 'rgb:255,255,255'
}
function keysDiffer(a: string, b: string): boolean {
  if (a === b) return false
  if (a.startsWith('rgb:') && b.startsWith('rgb:')) {
    const [r1, g1, b1] = a.slice(4).split(',').map(Number), [r2, g2, b2] = b.slice(4).split(',').map(Number)
    return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) > 24
  }
  return true
}

// ------------------------------------------------------------------ scanning
const fixedCache = new Map<Element, boolean>()
function isFixedChain(el: Element): boolean {
  let cur: Element | null = el
  const chain: Element[] = []
  let res = false
  for (let i = 0; cur && cur !== document.body && i < 16; i++, cur = cur.parentElement) {
    const known = fixedCache.get(cur)
    if (known !== undefined) { res = known; break }
    chain.push(cur)
    const p = getComputedStyle(cur).position
    if (p === 'fixed' || p === 'sticky') { res = true; break }
  }
  for (const c of chain) fixedCache.set(c, res)
  return res
}

interface ScanOpts { scale?: number; minFootY?: number }

export function scanSurfaces(opts: ScanOpts = {}): Candidate[] {
  fixedCache.clear()
  const scale = opts.scale ?? 1
  const vw = window.innerWidth, vh = window.innerHeight
  const minFootY = opts.minFootY ?? 120 * scale + 40
  const maxFootY = vh - 26
  const out: Candidate[] = []

  // ---------- box edges, lines, media, controls
  const rawEdges: { el: HTMLElement; r: DOMRect; kind: SurfaceKind; y: number; bottomLine: boolean; weight: number }[] = []
  const all = document.body.getElementsByTagName('*')
  for (let i = 0; i < all.length; i++) {
    const el = all[i] as HTMLElement
    if (SKIP_TAGS.has(el.tagName) || (el as unknown as SVGElement).ownerSVGElement) continue
    const r = el.getBoundingClientRect()
    if (r.width < 28 || r.height < 1) continue
    if (r.right < 24 || r.left > vw - 24) continue
    if (r.bottom < minFootY - 4 || r.top > maxFootY + 2) continue
    if (ignored(el)) continue
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.4 || cs.pointerEvents === 'none') continue
    const tag = el.tagName
    const isMedia = MEDIA_TAGS.has(tag) || tag.toLowerCase() === 'svg'
    const bg = colorOf(cs.backgroundColor)
    const hasBg = bg[3] > 0.12 || cs.backgroundImage !== 'none'
    const bt = parseFloat(cs.borderTopWidth) > 0.5 && cs.borderTopStyle !== 'none' && colorOf(cs.borderTopColor)[3] > 0.1
    const bb = parseFloat(cs.borderBottomWidth) > 0.5 && cs.borderBottomStyle !== 'none' && colorOf(cs.borderBottomColor)[3] > 0.1
    const shadow = cs.boxShadow !== 'none'
    const interactive = tag === 'BUTTON' || tag === 'A' || el.getAttribute('role') === 'button'
    if (isMedia) {
      if (r.width < 48 || r.height < 40) continue
      rawEdges.push({ el, r, kind: 'media', y: r.top, bottomLine: false, weight: 1 })
      continue
    }
    if (!(hasBg || bt || shadow || bb)) continue
    if (isFixedChain(el)) continue
    // huge page-wide wrappers are only useful for their boundary line, same rule as everything else
    if (hasBg || bt || shadow) {
      const kind: SurfaceKind = r.height <= 5 ? 'line' : interactive ? 'control' : 'edge'
      rawEdges.push({ el, r, kind, y: r.top, bottomLine: false, weight: kind === 'line' ? 0.86 : kind === 'control' ? 0.95 : 0.9 })
    }
    if (bb && r.height > 5) rawEdges.push({ el, r, kind: 'line', y: r.bottom - 1, bottomLine: true, weight: 0.86 })
  }

  for (const it of rawEdges) {
    if (it.y < minFootY || it.y > maxFootY) continue
    const { el, r } = it
    const xa = Math.max(r.left + 22, 48), xb = Math.min(r.right - 22, vw - 48)
    if (xb - xa < 4) continue
    out.push({
      kind: it.kind, el, y: it.y, xa, xb,
      weight: it.weight * (it.kind === 'media' ? 1 : 1) * Math.min(1, 0.55 + (xb - xa) / 500),
      make(xv) {
        const x = Math.min(xb, Math.max(xa, xv))
        const yv = it.y
        const rr = el.getBoundingClientRect()
        // something visible must be directly under the feet ...
        const below = hitAt(x, it.bottomLine ? yv : yv + Math.min(4, rr.height / 2))
        if (!below || !(el.contains(below) || below === el)) return null
        // ... and the edge itself must be visible (differ from what is just above)
        if (!it.bottomLine && it.kind !== 'media' && it.kind !== 'line') {
          const above = hitAt(x, yv - 4)
          if (above && (el.contains(above) || above === el)) return null
          const cs = getComputedStyle(el)
          const bt = parseFloat(cs.borderTopWidth) > 0.5 && cs.borderTopStyle !== 'none'
          const shadow = cs.boxShadow !== 'none'
          if (!(bt || shadow || keysDiffer(bgKey(el), bgKey(above ?? el.parentElement)))) return null
        }
        const air = airAt(x, yv, scale)
        const fx = (x - rr.left) / Math.max(1, rr.width)
        const anchor: Anchor = {
          kind: it.kind, el,
          resolve() {
            if (!el.isConnected) return null
            const q = el.getBoundingClientRect()
            if (q.width < 4) return null
            return { x: q.left + fx * q.width + window.scrollX, y: (it.bottomLine ? q.bottom - 1 : q.top) + window.scrollY }
          },
        }
        return { anchor, x, y: yv, air }
      },
    })
  }

  // ---------- real text glyphs
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const parentInfo = new Map<Element, { fs: number; ok: boolean }>()
  const range = document.createRange()
  let textCount = 0
  while (walker.nextNode() && textCount < 260) {
    const node = walker.currentNode as Text
    const raw = node.nodeValue ?? ''
    if (raw.trim().length < 3) continue
    const parent = node.parentElement
    if (!parent || SKIP_TAGS.has(parent.tagName) || (parent as unknown as SVGElement).ownerSVGElement || ignored(parent)) continue
    let info = parentInfo.get(parent)
    if (!info) {
      const cs = getComputedStyle(parent)
      const fs = parseFloat(cs.fontSize) || 16
      const ok = cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.5 && fs >= 14 && colorOf(cs.color)[3] > 0.3 && !isFixedChain(parent)
      info = { fs, ok }
      parentInfo.set(parent, info)
    }
    if (!info.ok) continue
    range.selectNodeContents(node)
    const rects = range.getClientRects()
    for (let k = 0; k < rects.length; k++) {
      const lr = rects[k]
      if (lr.width < 24 || lr.height < 8) continue
      const yv = lr.top + lr.height * 0.26
      if (yv < minFootY || yv > maxFootY) continue
      if (lr.right < 40 || lr.left > vw - 40) continue
      const xa = Math.max(lr.left + 6, 44), xb = Math.min(lr.right - 6, vw - 44)
      if (xb - xa < 4) continue
      const fs = info.fs
      const lineTop = lr.top, lineRight = lr.right, lineLeft = lr.left, lineH = lr.height
      textCount++
      out.push({
        kind: 'text', el: parent, y: yv, xa, xb,
        weight: fs >= 28 ? 0.95 : fs >= 20 ? 0.85 : 0.6,
        make(xv) {
          const want = Math.min(xb, Math.max(xa, xv))
          // find a real glyph near `want` on this line
          const len = (node.nodeValue ?? '').length
          let best = -1, bestD = 1e9, bestR: DOMRect | null = null
          const rg = document.createRange()
          for (let i = 0; i < len; i++) {
            const ch = (node.nodeValue ?? '')[i]
            if (/\s/.test(ch)) continue
            rg.setStart(node, i); rg.setEnd(node, i + 1)
            const cr = rg.getBoundingClientRect()
            if (cr.width < 1 || Math.abs(cr.top - lineTop) > 4 || cr.left < lineLeft - 1 || cr.right > lineRight + 1) continue
            const cx = cr.left + cr.width / 2
            const d = Math.abs(cx - want) - (/[A-Z0-9bdfhklt]/.test(ch) ? 3 : 0)
            if (d < bestD) { bestD = d; best = i; bestR = cr }
          }
          if (best < 0 || !bestR || bestD > 40) return null
          const cr = bestR as DOMRect
          const x = cr.left + cr.width / 2, yv2 = cr.top + cr.height * 0.26
          const h = hitAt(x, cr.top + cr.height * 0.5)
          if (!h || !(parent.contains(h) || h.contains(parent))) return null
          const air = airAt(x, yv2, scale)
          const idx = best
          const anchor: Anchor = {
            kind: 'text', el: parent,
            resolve() {
              if (!node.isConnected || idx >= (node.nodeValue ?? '').length) return null
              try {
                const g = document.createRange()
                g.setStart(node, idx); g.setEnd(node, idx + 1)
                const q = g.getBoundingClientRect()
                if (q.width < 1) return null
                return { x: q.left + q.width / 2 + window.scrollX, y: q.top + q.height * 0.26 + window.scrollY }
              } catch { return null }
            },
          }
          void lineH
          return { anchor, x, y: yv2, air }
        },
      })
    }
  }
  return out
}

export interface PickOpts {
  /** preferred band of the viewport (fractions of viewport height) for the feet */
  band: [number, number]
  nearX?: number
  excludeEl?: Element | null
  /** hard limit in viewport px: feet must be inside [yMin, yMax] */
  yMin?: number
  yMax?: number
  scale?: number
}

export interface Picked { anchor: Anchor; x: number; y: number; air: number; score: number }

/** best standable spot for the given band; tries the strongest few surfaces and validates them for real */
export function pickSpot(cands: Candidate[], o: PickOpts): Picked | null {
  const vh = window.innerHeight, vw = window.innerWidth
  const [b0, b1] = o.band
  const mid = ((b0 + b1) / 2) * vh
  const half = Math.max(30, ((b1 - b0) / 2) * vh)
  const pool = cands
    .filter(c => (o.yMin === undefined || c.y >= o.yMin) && (o.yMax === undefined || c.y <= o.yMax) && c.el !== o.excludeEl)
    .map(c => {
      const dist = Math.max(0, Math.abs(c.y - mid) - half)
      const bandScore = Math.max(0.08, 1 - dist / (vh * 0.5))
      return { c, pre: c.weight * bandScore }
    })
    .sort((a, b) => b.pre - a.pre)
    .slice(0, 34)
  const results: Picked[] = []
  for (const { c, pre } of pool) {
    const xs = [o.nearX ?? (c.xa + c.xb) / 2, (c.xa + c.xb) / 2, c.xa + (c.xb - c.xa) * 0.25, c.xa + (c.xb - c.xa) * 0.75, c.xa + (c.xb - c.xa) * 0.9]
    let bestHere: Picked | null = null
    for (const xv of xs) {
      const m = c.make(xv)
      if (!m) continue
      const prox = o.nearX === undefined ? 1 : 0.8 + 0.2 * (1 - Math.min(1, Math.abs(m.x - o.nearX) / (vw * 0.6)))
      const score = pre * (0.2 + 0.8 * m.air) * (0.2 + 0.8 * m.air) * (m.air < 0.55 ? 0.35 : 1) * prox
      if (!bestHere || score > bestHere.score) bestHere = { anchor: m.anchor, x: m.x, y: m.y, air: m.air, score }
    }
    if (bestHere) results.push(bestHere)
    if (results.length >= 7) break
  }
  if (!results.length) return null
  results.sort((a, b) => b.score - a.score)
  // a little variety: usually the best, sometimes the runner-up
  const r = Math.random()
  return results[r < 0.68 || results.length < 2 ? 0 : r < 0.9 || results.length < 3 ? 1 : 2]
}

/** stepping stones between two spots (viewport coords): visible surfaces roughly on the way, ordered downwards */
export function stepsBetween(cands: Candidate[], from: { x: number; y: number }, to: { x: number; y: number }, scale = 1, max = 2): Picked[] {
  const gap = 150 * scale
  const lo = Math.min(from.y, to.y) + gap * 0.6, hi = Math.max(from.y, to.y) - gap * 0.6
  if (hi - lo < gap * 0.5) return []
  const pool = cands.filter(c => c.y > lo && c.y < hi && c.xb > 40)
  const picked: Picked[] = []
  const wanted = Math.min(max, Math.floor((hi - lo) / gap) + (hi - lo > gap * 0.9 ? 1 : 0))
  for (let n = 1; n <= wanted; n++) {
    const ty = lo + ((hi - lo) * n) / (wanted + 1)
    const tx = from.x + ((to.x - from.x) * n) / (wanted + 1)
    const sorted = pool.map(c => ({ c, d: Math.abs(c.y - ty) + Math.abs((c.xa + c.xb) / 2 - tx) * 0.25 - c.weight * 20 })).sort((a, b) => a.d - b.d).slice(0, 6)
    for (const { c } of sorted) {
      const m = c.make(tx)
      if (m && m.air > 0.35) { picked.push({ anchor: m.anchor, x: m.x, y: m.y, air: m.air, score: 1 }); break }
    }
  }
  picked.sort((a, b) => a.y - b.y)
  return from.y < to.y ? picked : picked.reverse()
}

/** an anchor on the top edge of one specific element (used when the user clicks something) */
export function anchorOnElement(el: Element, xv: number): { anchor: Anchor; x: number; y: number } | null {
  const r = el.getBoundingClientRect()
  if (r.width < 8) return null
  const x = Math.min(r.right - 10, Math.max(r.left + 10, xv))
  const fx = (x - r.left) / Math.max(1, r.width)
  return {
    x, y: r.top,
    anchor: {
      kind: 'control', el,
      resolve() {
        if (!el.isConnected) return null
        const q = el.getBoundingClientRect()
        return { x: q.left + fx * q.width + window.scrollX, y: q.top + window.scrollY }
      },
    },
  }
}

/** dev helper: paint the best candidates so you can SEE where he thinks he can stand */
export function debugSurfaces(scale = 1): number {
  document.querySelectorAll('[data-otbee-debug]').forEach(n => n.remove())
  const cands = scanSurfaces({ scale })
  let n = 0
  const colors: Record<SurfaceKind, string> = { edge: '#2563eb', line: '#9333ea', media: '#16a34a', control: '#ea580c', text: '#dc2626' }
  for (const c of cands) {
    const m = c.make((c.xa + c.xb) / 2)
    if (!m) continue
    const d = document.createElement('div')
    d.setAttribute('data-otbee-debug', '1')
    d.setAttribute('data-otbee-ignore', '1')
    d.style.cssText = `position:fixed;left:${m.x - 5}px;top:${m.y - 5}px;width:10px;height:10px;border-radius:50%;background:${colors[c.kind]};z-index:99998;pointer-events:none;opacity:${0.4 + 0.6 * m.air}`
    d.title = c.kind
    document.body.appendChild(d)
    n++
  }
  return n
}
