'use client'

/**
 * HoneyTransition - fully procedural honey flood used for page transitions (replaces the old mp4/webm).
 *
 *   IN   honey slides down from the top edge as bulbous, necked drips that merge into one sheet
 *   HOLD screen is covered while the next route loads (Otbee flies about on top)
 *   OUT  the sheet drains downward with a wavy, glossy meniscus, revealing the new page
 *
 * Everything is drawn on one <canvas> (resolution independent, DPR aware) with: amber gradient body, thickness
 * shading, layered rim light, drip glints and rising bubbles with highlights.
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { OtbeeAvatar } from '@/components/mascot/otbee'

export interface HoneyHandle { start: () => void; reset: () => void }

interface Props {
  isRouteLoaded?: boolean
  onComplete?: () => void
  engineRef?: React.Ref<HoneyHandle>
}

const IN_DUR = 0.95
const OUT_DUR = 1.0
const MIN_HOLD = 0.28

interface Drip { x: number; hw: number; L: number; delay: number }
interface Bubble { x: number; y: number; r: number; sp: number; ph: number }

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const easeIn = (t: number) => t * t * (1.6 - 0.6 * t)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function rand(seed: number) { // mulberry32
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

function makeScene(W: number, H: number) {
  const r = rand((Math.random() * 1e9) | 0)
  const n = Math.max(7, Math.round(W / 95))
  const cell = W / n
  const drips: Drip[] = []
  for (let i = 0; i < n; i++) {
    drips.push({ x: (i + 0.5) * cell + (r() - 0.5) * cell * 0.35, hw: cell * (0.5 + r() * 0.16), L: H * (0.3 + r() * 0.32), delay: r() * 0.22 })
  }
  const count = Math.min(48, Math.round((W * H) / 16000))
  const bubbles: Bubble[] = []
  for (let i = 0; i < count; i++) {
    const big = r() < 0.18
    bubbles.push({ x: r() * W, y: r() * (H + 200), r: big ? 10 + r() * 12 : 3 + r() * 7, sp: 10 + r() * 26, ph: r() * 6.28 })
  }
  return { drips, bubbles }
}

/** closed region: everything above the bulbous bottom boundary */
function bottomRegion(W: number, Yb: number, drips: Drip[], t: number, p: number): Path2D {
  const path = new Path2D()
  path.moveTo(-30, -30)
  path.lineTo(-30, Yb)
  let cx = -30
  const wave = (x: number) => Yb + 5 * Math.sin(x * 0.021 + t * 3.1) + 3 * Math.sin(x * 0.047 - t * 2.3)
  for (const d of drips) {
    const lenNow = d.L * Math.pow(Math.sin(Math.PI * clamp01((p - d.delay * 0.6) / (1 - d.delay * 0.6))), 1.15) * easeOut(clamp01((p - d.delay) / 0.5 + 0.2))
    for (let x = cx; x < d.x - d.hw; x += 24) path.lineTo(x, wave(x))
    cx = d.x + d.hw
    const L = lenNow
    if (L < 3) { path.lineTo(d.x - d.hw, wave(d.x - d.hw)); continue }
    const y0 = wave(d.x - d.hw)
    const nw = d.hw * 0.38, ny = y0 + L * 0.27, bw = d.hw * 0.92, by = y0 + L * 0.65, tr = d.hw * 0.11, tip = y0 + L
    const x = d.x
    path.lineTo(x - d.hw, y0)
    path.bezierCurveTo(x - d.hw, y0 + L * 0.06, x - nw, ny - L * 0.03, x - nw, ny)
    path.bezierCurveTo(x - nw, ny + (by - ny) * 0.55, x - bw, by - 5, x - bw, by)
    path.bezierCurveTo(x - bw, tip - (tip - by) * 0.2, x - tr, tip - 3, x, tip)
    path.bezierCurveTo(x + tr, tip - 3, x + bw, tip - (tip - by) * 0.2, x + bw, by)
    path.bezierCurveTo(x + bw, by - 5, x + nw, ny + (by - ny) * 0.55, x + nw, ny)
    path.bezierCurveTo(x + nw, ny - L * 0.03, x + d.hw, y0 + L * 0.06, x + d.hw, y0)
  }
  for (let x = cx; x < W + 30; x += 24) path.lineTo(x, wave(x))
  path.lineTo(W + 30, Yb)
  path.lineTo(W + 30, -30)
  path.closePath()
  return path
}

/** closed region: everything below a wavy draining meniscus */
function topRegion(W: number, H: number, q: number, t: number, drips: Drip[]): Path2D {
  const Yt = -90 + (H + 260) * easeInOut(q)
  const amp = 16 * Math.sin(Math.PI * clamp01(q * 1.05)) + 4
  const path = new Path2D()
  path.moveTo(-30, H + 60)
  for (let x = -30; x <= W + 30; x += 12) {
    let y = Yt + amp * Math.sin(x * 0.0105 + q * 5 + 1.2) + amp * 0.55 * Math.sin(x * 0.027 - q * 3.4)
    for (const d of drips) { // honey that lingers in rounded lobes
      const u = (x - d.x) / (d.hw * 3)
      if (Math.abs(u) < 1) y -= d.L * 0.07 * (1 - u * u) * (1 - u * u) * Math.sin(Math.PI * clamp01(q * 1.15)) * (0.6 + d.delay * 2)
    }
    path.lineTo(x, y)
  }
  path.lineTo(W + 30, H + 60)
  path.closePath()
  return path
}

function paintHoney(ctx: CanvasRenderingContext2D, W: number, H: number, region: Path2D, bubbles: Bubble[], t: number, glints: { x: number; y: number; r: number }[]) {
  ctx.save()
  ctx.clip(region)
  // body
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#DE920E'); g.addColorStop(0.5, '#EAA11E'); g.addColorStop(1, '#F3B635')
  ctx.fillStyle = g
  ctx.fillRect(-40, -40, W + 80, H + 80)
  // depth: warm vignette + diagonal sheen
  const rg = ctx.createRadialGradient(W * 0.5, H * 0.4, H * 0.1, W * 0.5, H * 0.5, Math.max(W, H) * 0.8)
  rg.addColorStop(0, 'rgba(255,214,110,.20)'); rg.addColorStop(1, 'rgba(160,80,0,.25)')
  ctx.fillStyle = rg
  ctx.fillRect(-40, -40, W + 80, H + 80)
  const sh = ctx.createLinearGradient(0, 0, W, H)
  const sp = (t * 0.12) % 1
  sh.addColorStop(clamp01(sp - 0.15), 'rgba(255,230,150,0)'); sh.addColorStop(clamp01(sp), 'rgba(255,230,150,.16)'); sh.addColorStop(clamp01(sp + 0.15), 'rgba(255,230,150,0)')
  ctx.fillStyle = sh
  ctx.fillRect(-40, -40, W + 80, H + 80)
  // bubbles
  for (const b of bubbles) {
    const y = H + 120 - ((b.y + t * b.sp) % (H + 240))
    const x = b.x + Math.sin(t * 0.9 + b.ph) * 6
    const bg = ctx.createRadialGradient(x - b.r * 0.3, y - b.r * 0.3, b.r * 0.1, x, y, b.r)
    bg.addColorStop(0, 'rgba(255,236,160,.55)'); bg.addColorStop(0.7, 'rgba(255,205,90,.22)'); bg.addColorStop(1, 'rgba(255,190,60,.35)')
    ctx.fillStyle = bg
    ctx.beginPath(); ctx.arc(x, y, b.r, 0, 6.2832); ctx.fill()
    ctx.strokeStyle = 'rgba(255,246,200,.6)'; ctx.lineWidth = Math.max(1, b.r * 0.1)
    ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,.75)'
    ctx.beginPath(); ctx.ellipse(x - b.r * 0.38, y - b.r * 0.4, b.r * 0.22, b.r * 0.12, -0.7, 0, 6.2832); ctx.fill()
  }
  // rim light along the edge (stroke straddles the edge, clip keeps the inner half)
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'
  ctx.strokeStyle = 'rgba(150,70,0,.22)'; ctx.lineWidth = 40; ctx.stroke(region)
  ctx.strokeStyle = 'rgba(255,196,80,.5)'; ctx.lineWidth = 22; ctx.stroke(region)
  ctx.strokeStyle = 'rgba(255,226,130,.8)'; ctx.lineWidth = 9; ctx.stroke(region)
  ctx.restore()
  // crisp outer contour + glints
  ctx.save()
  ctx.lineJoin = 'round'
  ctx.strokeStyle = 'rgba(176,96,6,.95)'; ctx.lineWidth = 2.5; ctx.stroke(region)
  ctx.restore()
  for (const gl of glints) {
    ctx.save()
    ctx.translate(gl.x, gl.y); ctx.rotate(-0.25)
    ctx.fillStyle = 'rgba(255,255,255,.7)'
    ctx.beginPath(); ctx.ellipse(0, 0, gl.r * 0.28, gl.r * 0.75, 0, 0, 6.2832); ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,.55)'
    ctx.beginPath(); ctx.arc(gl.r * 0.1, gl.r * 1.05, gl.r * 0.14, 0, 6.2832); ctx.fill()
    ctx.restore()
  }
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
    t0: 0, raf: 0, W: 0, H: 0, dpr: 1, clock: 0,
    scene: null as ReturnType<typeof makeScene> | null,
    mascot: false,
  })

  const stop = useCallback(() => {
    const s = st.current
    cancelAnimationFrame(s.raf); s.raf = 0; s.phase = 'idle'
    const c = canvasRef.current, ctx = c?.getContext('2d')
    if (c && ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, c.width, c.height) }
    s.mascot = false; setMascotOn(false)
  }, [])

  const frameRef = useRef<(now: number) => void>(() => {})
  const frame = useCallback((now: number) => {
    const s = st.current
    const c = canvasRef.current, ctx = c?.getContext('2d')
    if (!c || !ctx || !s.scene) return
    s.raf = requestAnimationFrame(n => frameRef.current(n))
    const t = (now - s.t0) / 1000
    s.clock = now / 1000
    ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0)
    ctx.clearRect(0, 0, s.W, s.H)
    const { W, H } = s
    const { drips, bubbles } = s.scene
    if (s.phase === 'in') {
      const p = clamp01(t / IN_DUR)
      const Yb = -20 + (H + 70) * easeIn(p)
      const glints: { x: number; y: number; r: number }[] = []
      const region = bottomRegion(W, Yb, drips, s.clock, p)
      for (const d of drips) {
        const L = d.L * Math.pow(Math.sin(Math.PI * clamp01((p - d.delay * 0.6) / (1 - d.delay * 0.6))), 1.15) * easeOut(clamp01((p - d.delay) / 0.5 + 0.2))
        if (L > 40) glints.push({ x: d.x - d.hw * 0.32, y: Yb + L * 0.68, r: d.hw * 0.42 })
      }
      paintHoney(ctx, W, H, region, bubbles, s.clock, glints)
      if (!s.mascot && p > 0.72) { s.mascot = true; setMascotOn(true) }
      if (t >= IN_DUR) { s.phase = 'hold'; s.t0 = now }
    } else if (s.phase === 'hold') {
      const fullRect = new Path2D()
      fullRect.rect(-30, -30, W + 60, H + 60)
      paintHoney(ctx, W, H, fullRect, bubbles, s.clock, [])
      if (routeRef.current && t >= MIN_HOLD) { s.phase = 'out'; s.t0 = now; s.mascot = false; setMascotOn(false) }
    } else if (s.phase === 'out') {
      const q = clamp01(t / OUT_DUR)
      paintHoney(ctx, W, H, topRegion(W, H, q, s.clock, drips), bubbles, s.clock, [])
      if (t >= OUT_DUR) { stop(); doneRef.current?.() }
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
    s.scene = makeScene(s.W, s.H)
    s.phase = 'in'; s.t0 = performance.now(); s.mascot = false
    s.raf = requestAnimationFrame(n => frameRef.current(n))
  }, [])

  useImperativeHandle(engineRef, () => ({ start, reset: stop }), [start, stop])
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
