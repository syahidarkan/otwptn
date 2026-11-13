'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

interface HoneyDripProps {
  mode?: 'separator' | 'fullscreen'
  className?: string
  height?: number
}

interface DripDef { cx: number; hw: number; len: number }

const BRIDGE_H = 35

function honeyBottomPath(drips: DripDef[], W = 1200, yOffset = 0): string {
  const sorted = [...drips].sort((a, b) => a.cx - b.cx)
  const parts: string[] = [`M 0 ${yOffset}`]
  for (const { cx, hw, len } of sorted) {
    const nw = hw * 0.38
    const ny = yOffset + len * 0.27
    const bw = hw * 0.92
    const by = yOffset + len * 0.65
    const tr = hw * 0.11
    const tipY = yOffset + len
    parts.push(
      `L ${cx - hw} ${yOffset}`,
      `C ${cx-hw} ${yOffset+len*0.06} ${cx-nw} ${ny-len*0.03} ${cx-nw} ${ny}`,
      `C ${cx-nw} ${ny+(by-ny)*0.55} ${cx-bw} ${by-5} ${cx-bw} ${by}`,
      `C ${cx-bw} ${tipY-(tipY-by)*0.20} ${cx-tr} ${tipY-3} ${cx} ${tipY}`,
      `C ${cx+tr} ${tipY-3} ${cx+bw} ${tipY-(tipY-by)*0.20} ${cx+bw} ${by}`,
      `C ${cx+bw} ${by-5} ${cx+nw} ${ny+(by-ny)*0.55} ${cx+nw} ${ny}`,
      `C ${cx+nw} ${ny-len*0.03} ${cx+hw} ${yOffset+len*0.06} ${cx+hw} ${yOffset}`,
    )
  }
  parts.push(`L ${W} ${yOffset}`, 'Z')
  return parts.join(' ')
}

const SEP_DRIPS: DripDef[] = [
  { cx: 4,  hw: 3.5, len: 50 }, { cx: 13, hw: 2.6, len: 34 },
  { cx: 22, hw: 4.2, len: 65 }, { cx: 32, hw: 3.0, len: 40 },
  { cx: 41, hw: 3.6, len: 58 }, { cx: 50, hw: 4.8, len: 76 },
  { cx: 60, hw: 2.8, len: 32 }, { cx: 69, hw: 4.0, len: 63 },
  { cx: 78, hw: 3.2, len: 44 }, { cx: 87, hw: 3.8, len: 68 },
  { cx: 94, hw: 2.6, len: 38 }, { cx: 98, hw: 3.0, len: 52 },
]
const SEP_BOTTOM_PATH = honeyBottomPath(SEP_DRIPS, 100, 4)

const FULL_DRIPS: DripDef[] = [
  { cx: 54,   hw: 50, len: 128 },
  { cx: 150,  hw: 44, len: 150 },
  { cx: 250,  hw: 52, len: 164 },
  { cx: 352,  hw: 46, len: 136 },
  { cx: 452,  hw: 50, len: 156 },
  { cx: 548,  hw: 44, len: 122 },
  { cx: 648,  hw: 54, len: 168 },
  { cx: 752,  hw: 46, len: 142 },
  { cx: 852,  hw: 50, len: 158 },
  { cx: 950,  hw: 44, len: 126 },
  { cx: 1050, hw: 52, len: 148 },
  { cx: 1150, hw: 48, len: 136 },
]

export default function HoneyDrip({ mode = 'separator', className = '', height = 90 }: HoneyDripProps) {
  if (mode === 'fullscreen') return null
  return (
    <div className={`relative w-full overflow-hidden pointer-events-none select-none ${className}`} style={{ height }} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"
        style={{ position: 'absolute', inset: 0, display: 'block', animation: 'sep-reveal 1s cubic-bezier(0.4,0,0.2,1) both' }}>
        <defs>
          <style>{`@keyframes sep-reveal{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 0 0)}}`}</style>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#d97706" />
            <stop offset="45%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="4"  fill="#d97706" />
        <rect x="0" y="0" width="100" height="2"  fill="rgba(255,255,255,0.3)" />
        <path d={SEP_BOTTOM_PATH} fill="url(#sg)" />
      </svg>
    </div>
  )
}

export const HONEY_DRIP_H = 170
// kept for any existing imports
const _HONEY_VB_H = BRIDGE_H + 168
void _HONEY_VB_H

// ---------------------------------------------------------------------------
// Canvas 2D drip drawing helpers
// ---------------------------------------------------------------------------

/**
 * Draw the honey shape on a 2D canvas.
 *
 * @param ctx         - Canvas 2D context (ctx.setTransform already applied for DPR)
 * @param cw          - logical canvas width  (physical / dpr)
 * @param ch          - logical canvas height (physical / dpr)
 * @param baseY       - Y of the flat body bottom edge (drips hang below this)
 * @param waveProg    - progress 0..1 for drip-wave oscillation
 * @param sheenOffset - 0..1 offset for sheen movement
 */
function drawHoney(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  baseY: number,
  waveProg: number,
  sheenOffset: number,
) {
  ctx.save()

  const scale = cw / 1200

  // Build the fill path: top-left -> top-right -> along baseY with drips -> close
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(cw, 0)
  ctx.lineTo(cw, baseY)

  // Draw drips right-to-left so winding is consistent for fill
  const sorted = [...FULL_DRIPS].sort((a, b) => b.cx - a.cx)
  for (const { cx, hw, len } of sorted) {
    const phase  = (cx / 1200) * Math.PI * 2
    const wobble = Math.sin(waveProg * Math.PI * 2 + phase) * len * 0.07

    const sCx  = cx * scale
    const sHw  = hw * scale
    const sLen = (len + wobble) * scale

    const nw   = sHw * 0.38
    const ny   = baseY + sLen * 0.27
    const bw   = sHw * 0.92
    const by   = baseY + sLen * 0.65
    const tr   = sHw * 0.11
    const tipY = baseY + sLen

    ctx.lineTo(sCx + sHw, baseY)
    ctx.bezierCurveTo(sCx+sHw, baseY+sLen*0.06, sCx+nw,  ny-sLen*0.03, sCx+nw,  ny)
    ctx.bezierCurveTo(sCx+nw,  ny+(by-ny)*0.55,  sCx+bw,  by-5*scale,   sCx+bw,  by)
    ctx.bezierCurveTo(sCx+bw,  tipY-(tipY-by)*0.20, sCx+tr, tipY-3*scale, sCx,   tipY)
    ctx.bezierCurveTo(sCx-tr,  tipY-3*scale, sCx-bw, tipY-(tipY-by)*0.20, sCx-bw, by)
    ctx.bezierCurveTo(sCx-bw,  by-5*scale,   sCx-nw, ny+(by-ny)*0.55,  sCx-nw, ny)
    ctx.bezierCurveTo(sCx-nw,  ny-sLen*0.03, sCx-sHw, baseY+sLen*0.06, sCx-sHw, baseY)
  }

  ctx.lineTo(0, baseY)
  ctx.closePath()

  // Main amber gradient
  const grad = ctx.createLinearGradient(0, 0, 0, baseY + 20)
  grad.addColorStop(0,   '#d97706')
  grad.addColorStop(0.5, '#f59e0b')
  grad.addColorStop(1,   '#fbbf24')
  ctx.fillStyle = grad
  ctx.fill()

  // Drip-edge softening overlay
  const edgeGrad = ctx.createLinearGradient(0, Math.max(0, baseY - 20), 0, baseY + 60)
  edgeGrad.addColorStop(0, 'rgba(253,230,138,0)')
  edgeGrad.addColorStop(0.4, 'rgba(253,230,138,0.25)')
  edgeGrad.addColorStop(1,   'rgba(253,230,138,0)')
  ctx.fillStyle = edgeGrad
  ctx.fill()

  // Sheen stripes clipped to honey shape
  ctx.save()
  ctx.clip()
  const stripeW   = cw * 0.14
  const stripeGap = cw * 0.46
  for (let i = 0; i < 2; i++) {
    const rawX = (sheenOffset * cw * 0.55 + i * stripeGap) % (cw + stripeW) - stripeW
    ctx.save()
    ctx.translate(rawX + stripeW / 2, baseY / 2)
    ctx.rotate(-0.28)
    const sg = ctx.createLinearGradient(-stripeW / 2, 0, stripeW / 2, 0)
    sg.addColorStop(0,   'rgba(255,255,255,0)')
    sg.addColorStop(0.5, 'rgba(255,255,255,0.055)')
    sg.addColorStop(1,   'rgba(255,255,255,0)')
    ctx.fillStyle = sg
    ctx.fillRect(-stripeW / 2, -ch, stripeW, ch * 2)
    ctx.restore()
  }
  ctx.restore()

  // Top gloss bar
  const glossH = Math.min(baseY, 10)
  if (glossH > 0) {
    const glossGrad = ctx.createLinearGradient(0, 0, 0, glossH)
    glossGrad.addColorStop(0, 'rgba(255,255,255,0.20)')
    glossGrad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = glossGrad
    ctx.fillRect(0, 0, cw, glossH)
  }

  ctx.restore()
}

// ---------------------------------------------------------------------------
// Animation phases (ms)
// ---------------------------------------------------------------------------
const PHASE_FILL_MS  = 600
const PHASE_HOLD_MS  = 200
const PHASE_DRAIN_MS = 800

export interface HoneyOverlayHandle {
  /**
   * Start the transition. `onRouteReady` is called when the screen is fully
   * covered (safe to push the new route).
   */
  startAnimation: (onRouteReady: () => void) => void
  /** Call when Next.js confirms the route has committed; kicks off drain. */
  routeCommitted: () => void
}

export const HoneyOverlay = forwardRef<
  HoneyOverlayHandle,
  { onComplete?: () => void }
>(
  function HoneyOverlay({ onComplete }, ref) {
    const canvasRef      = useRef<HTMLCanvasElement | null>(null)
    const wrapRef        = useRef<HTMLDivElement | null>(null)
    const rafRef         = useRef(0)
    const startTimeRef   = useRef(0)
    const phaseRef       = useRef<'idle' | 'fill' | 'hold' | 'drain'>('idle')
    const onCompleteRef  = useRef(onComplete)
    const onRouteReadyRef = useRef<(() => void) | null>(null)
    onCompleteRef.current = onComplete

    function resizeCanvas() {
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      canvas.width  = Math.round(window.innerWidth  * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      canvas.style.width  = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }

    useEffect(() => {
      resizeCanvas()
      window.addEventListener('resize', resizeCanvas)
      return () => window.removeEventListener('resize', resizeCanvas)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function clearCanvas() {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    function stopLoop() {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
    }

    function runFrame(now: number) {
      const canvas = canvasRef.current
      const wrap   = wrapRef.current
      if (!canvas || !wrap) return

      const elapsed = now - startTimeRef.current
      const dpr = window.devicePixelRatio || 1
      const cw  = canvas.width  / dpr
      const ch  = canvas.height / dpr

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cw, ch)

      const sheenOffset = (now / 3000) % 1
      const waveProg    = (now / 1000) % 1

      // Max drip extension below baseY (at 1200px reference width, max is 168px)
      const maxDrip = 168 * (cw / 1200)

      if (phaseRef.current === 'fill') {
        const pct  = Math.min(elapsed / PHASE_FILL_MS, 1)
        // ease in-out cubic
        const ease = pct < 0.5 ? 4*pct*pct*pct : 1 - Math.pow(-2*pct+2,3)/2
        const baseY = -maxDrip + (ch + maxDrip) * ease
        drawHoney(ctx, cw, ch, baseY, waveProg, sheenOffset)

        if (elapsed >= PHASE_FILL_MS) {
          phaseRef.current  = 'hold'
          startTimeRef.current = now
          // Notify caller: safe to navigate
          const cb = onRouteReadyRef.current
          onRouteReadyRef.current = null
          cb?.()
        }
      } else if (phaseRef.current === 'hold') {
        drawHoney(ctx, cw, ch, ch, waveProg, sheenOffset)
        if (elapsed >= PHASE_HOLD_MS) {
          phaseRef.current  = 'drain'
          startTimeRef.current = now
        }
      } else if (phaseRef.current === 'drain') {
        const pct  = Math.min(elapsed / PHASE_DRAIN_MS, 1)
        // smoothstep
        const ease = pct * pct * (3 - 2 * pct)
        const baseY = ch - (ch + maxDrip) * ease
        if (baseY > -maxDrip) {
          drawHoney(ctx, cw, ch, baseY, waveProg, sheenOffset)
        }
        if (pct >= 1) {
          // Fade overlay, then clean up
          wrap.style.opacity = '0'
          stopLoop()
          phaseRef.current = 'idle'
          setTimeout(() => {
            const w = wrapRef.current
            if (w) w.style.visibility = 'hidden'
            clearCanvas()
            onCompleteRef.current?.()
          }, 240)
          return
        }
      } else {
        return
      }

      rafRef.current = requestAnimationFrame(runFrame)
    }

    useImperativeHandle(ref, () => ({
      startAnimation(onRouteReady: () => void) {
        // Prevent double-play
        if (phaseRef.current !== 'idle') return

        const wrap = wrapRef.current
        if (!wrap) return

        // Reduced motion: skip entirely
        if (typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          onRouteReady()
          setTimeout(() => onCompleteRef.current?.(), 0)
          return
        }

        stopLoop()
        clearCanvas()
        resizeCanvas()

        onRouteReadyRef.current = onRouteReady
        phaseRef.current = 'fill'
        wrap.style.visibility = 'visible'
        wrap.style.opacity = '1'

        startTimeRef.current = performance.now()
        rafRef.current = requestAnimationFrame(runFrame)
      },

      routeCommitted() {
        // If still filling, let fill finish naturally; hold will auto-advance to drain.
        // If currently in hold phase, skip to drain immediately.
        if (phaseRef.current === 'hold') {
          phaseRef.current = 'drain'
          startTimeRef.current = performance.now()
        }
      },
    }))

    return (
      <div
        ref={wrapRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2147483647,
          pointerEvents: 'none',
          userSelect: 'none',
          visibility: 'hidden',
          opacity: 0,
          transition: 'opacity 220ms cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'transparent',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'block',
            pointerEvents: 'none',
          }}
        />
      </div>
    )
  }
)
