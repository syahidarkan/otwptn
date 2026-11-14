'use client'

/**
 * HoneyTransition - page-transition overlay that plays back the REAL honey splash video, frame by frame,
 * from a single hardcoded sprite sheet (public/honey-sheet.webp: 10x8 grid, 78 frames, 640x360 each,
 * pre-keyed to alpha so it composites over any page without carrying its old white background).
 *
 * Why a sprite sheet instead of a <video> or procedural canvas drawing:
 *  - It IS the original honey-fast.mp4 footage (same 78 frames, same 30fps), so it looks pixel-identical
 *    to the video that was used before - nothing is redrawn from scratch.
 *  - Per frame, rendering is a single ctx.drawImage() blit - drastically cheaper than either decoding a
 *    video every frame or (as the previous procedural version did) rebuilding gradients, paths and dozens
 *    of bubble radial-gradients every frame. That per-frame cost was the main source of the jank/freeze
 *    during navigation.
 *  - One decoded image, reused for every transition for the rest of the session (cached after first load).
 *
 *   IN    frames 0..FILL_END play forward as the honey floods the screen (matches the video's fill-in)
 *   HOLD  frozen on the fully-covered frame while the next route loads (Otbee flies about on top)
 *   OUT   frames FILL_END..DRAIN_END play forward as the honey drains away, revealing the new page
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { OtbeeAvatar } from '@/components/mascot/otbee'

export interface HoneyHandle { start: () => void; reset: () => void }

interface Props {
  isRouteLoaded?: boolean
  onComplete?: () => void
  engineRef?: React.Ref<HoneyHandle>
}

const SHEET_SRC = '/honey-sheet.webp'
const COLS = 10
const CELL_W = 640
const CELL_H = 360
const FPS = 30
/** index of the frame where the honey fully covers the screen (measured from the source video) */
const FILL_END = 39
/** index of the last (fully drained / empty) frame */
const DRAIN_END = 77
/** minimum time to hold on the full-coverage frame, so a very fast route load never looks like a flash cut */
const MIN_HOLD = 0.15

let sheetPromise: Promise<HTMLImageElement> | null = null
function loadSheet(): Promise<HTMLImageElement> {
  if (!sheetPromise) {
    sheetPromise = new Promise((resolve, reject) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = SHEET_SRC
    })
  }
  return sheetPromise
}

export const HoneyOverlay = forwardRef<HTMLDivElement, Props>(function HoneyOverlay({ isRouteLoaded = false, onComplete, engineRef }, ref) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const routeRef = useRef(isRouteLoaded)
  const doneRef = useRef(onComplete)
  const [mascotOn, setMascotOn] = useState(false)
  useEffect(() => { routeRef.current = isRouteLoaded; doneRef.current = onComplete })
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement)

  const st = useRef({
    phase: 'idle' as 'idle' | 'in' | 'hold' | 'out',
    t0: 0, raf: 0, W: 0, H: 0, dpr: 1,
    sheet: null as HTMLImageElement | null,
    mascot: false,
  })

  const stop = useCallback(() => {
    const s = st.current
    cancelAnimationFrame(s.raf); s.raf = 0; s.phase = 'idle'
    const c = canvasRef.current, ctx = c?.getContext('2d')
    if (c && ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height) }
    s.mascot = false; setMascotOn(false)
  }, [])

  /** draw one sheet frame, scaled to cover the whole canvas (like CSS background-size: cover) */
  const drawFrame = (ctx: CanvasRenderingContext2D, sheet: HTMLImageElement, idx: number, W: number, H: number) => {
    const col = idx % COLS, row = (idx / COLS) | 0
    const sx = col * CELL_W, sy = row * CELL_H
    const scale = Math.max(W / CELL_W, H / CELL_H)
    const dw = CELL_W * scale, dh = CELL_H * scale
    const dx = (W - dw) / 2, dy = (H - dh) / 2
    ctx.clearRect(0, 0, W, H)
    ctx.drawImage(sheet, sx, sy, CELL_W, CELL_H, dx, dy, dw, dh)
  }

  const frameRef = useRef<(now: number) => void>(() => {})
  const frame = useCallback((now: number) => {
    const s = st.current
    const c = canvasRef.current, ctx = c?.getContext('2d')
    if (!c || !ctx || !s.sheet) return
    s.raf = requestAnimationFrame(n => frameRef.current(n))
    const t = (now - s.t0) / 1000
    ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0)
    const { W, H, sheet } = s
    if (s.phase === 'in') {
      const idx = Math.min(FILL_END, Math.floor(t * FPS))
      drawFrame(ctx, sheet, idx, W, H)
      if (!s.mascot && idx >= FILL_END - 3) { s.mascot = true; setMascotOn(true) }
      if (idx >= FILL_END) { s.phase = 'hold'; s.t0 = now }
    } else if (s.phase === 'hold') {
      drawFrame(ctx, sheet, FILL_END, W, H)
      if (routeRef.current && t >= MIN_HOLD) { s.phase = 'out'; s.t0 = now; s.mascot = false; setMascotOn(false) }
    } else if (s.phase === 'out') {
      const idx = Math.min(DRAIN_END, FILL_END + Math.floor(t * FPS))
      drawFrame(ctx, sheet, idx, W, H)
      if (idx >= DRAIN_END) { stop(); doneRef.current?.() }
    }
  }, [stop])
  useEffect(() => { frameRef.current = frame }, [frame])

  const start = useCallback(() => {
    const s = st.current
    const c = canvasRef.current
    if (!c) return
    cancelAnimationFrame(s.raf)
    s.dpr = Math.min(1.5, window.devicePixelRatio || 1)
    s.W = window.innerWidth; s.H = window.innerHeight
    c.width = Math.round(s.W * s.dpr); c.height = Math.round(s.H * s.dpr)
    s.phase = 'in'; s.t0 = performance.now(); s.mascot = false
    const begin = (img: HTMLImageElement) => {
      if (st.current.phase === 'idle') return // reset() was called while the sheet was still loading
      s.sheet = img
      const ctx = c.getContext('2d')
      if (ctx) ctx.imageSmoothingQuality = 'high'
      s.raf = requestAnimationFrame(n => frameRef.current(n))
    }
    if (s.sheet) begin(s.sheet)
    else loadSheet().then(begin).catch(() => {})
  }, [])

  useImperativeHandle(engineRef, () => ({ start, reset: stop }), [start, stop])
  // warm the decode cache as early as possible so the very first transition doesn't stall on it
  useEffect(() => { loadSheet().catch(() => {}) }, [])
  useEffect(() => () => cancelAnimationFrame(st.current.raf), [])

  return (
    <div ref={rootRef} aria-hidden data-honey-overlay data-otbee-ignore style={{ position: 'fixed', inset: 0, zIndex: 99999, visibility: 'hidden', opacity: 1, transition: 'opacity 120ms linear' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-54%)', display: 'flex', flexDirection: 'column', alignItems: 'center',
          opacity: mascotOn ? 1 : 0, transition: 'opacity .25s ease', pointerEvents: 'none',
        }}
      >
        <OtbeeAvatar view="front" action="fly" size={190} paused={!mascotOn} />
        <div style={{ marginTop: 10, fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: 0.2, textShadow: '0 2px 8px rgba(120,60,0,.55)' }}>
          Sebentar ya, Otbee siapin halamannya…
        </div>
      </div>
    </div>
  )
})
