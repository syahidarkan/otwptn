'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

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
const FULL_BOTTOM_PATH = honeyBottomPath(FULL_DRIPS, 1200, BRIDGE_H)

const HONEY_GRADIENT =
  'linear-gradient(180deg,#92400e 0%,#b45309 8%,#d97706 18%,#f59e0b 42%,#fbbf24 68%,#fcd34d 86%,#fde68a 100%)'

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

interface HoneyFillProps { phase: 'entering' | 'holding' | 'exiting' }

// Luma key constants — honey max blue is ~130, white bg blue is 255
const LK_B_THRESHOLD = 150  // blue above this = white candidate
const LK_R_MIN = 190        // red also high = white (not honey)
const LK_G_MIN = 180        // green also high = white
const LK_FEATHER = 105      // feather range for smooth edges

// Canvas draw resolution — lower = faster luma key, higher = sharper honey edges
const CANVAS_W = 480
const CANVAS_H = 270

export function HoneyFill({ phase }: HoneyFillProps) {
  const [cls, setCls] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  const startDrawing = useCallback(() => {
    const draw = () => {
      const canvas = canvasRef.current
      const vid = videoRef.current
      if (canvas && vid && vid.readyState >= 2) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (ctx) {
          ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
          ctx.drawImage(vid, 0, 0, CANVAS_W, CANVAS_H)
          // Luma key: remove white background pixels
          const imgData = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H)
          const d = imgData.data
          for (let i = 0; i < d.length; i += 4) {
            const b = d[i + 2]
            if (b > LK_B_THRESHOLD && d[i] > LK_R_MIN && d[i + 1] > LK_G_MIN) {
              // Alpha: 255 at threshold, 0 at threshold+feather
              const alpha = Math.max(0, 1 - (b - LK_B_THRESHOLD) / LK_FEATHER)
              d[i + 3] = Math.round(alpha * 255)
            }
          }
          ctx.putImageData(imgData, 0, 0)
        }
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = CANVAS_W
      canvas.height = CANVAS_H
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return

    if (phase === 'entering') {
      setCls('hf-enter')
      vid.currentTime = 0
      vid.play().then(startDrawing).catch(startDrawing)
    } else if (phase === 'holding') {
      setCls('hf-hold')
    } else if (phase === 'exiting') {
      setCls('hf-exit')
    }
  }, [phase, startDrawing])

  return (
    <>
      <style>{`
        .hf-root{clip-path:inset(0 0 100% 0);}
        .hf-root.hf-enter{animation:hf-in 1.0s cubic-bezier(0.42,0,0.1,1) forwards;}
        .hf-root.hf-hold{clip-path:inset(0 0 0 0)!important;animation:none!important;}
        .hf-root.hf-exit{clip-path:inset(0 0 0 0);animation:hf-out 0.7s ease-in forwards;}
        @keyframes hf-in {from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 0 0)}}
        @keyframes hf-out{
          0%{clip-path:inset(0 0 0 0);opacity:1}
          70%{clip-path:inset(60% 0 0 0);opacity:1}
          100%{clip-path:inset(100% 0 0 0);opacity:0}
        }
      `}</style>

      <div
        aria-hidden="true"
        className={`hf-root${cls ? ' '+cls : ''}`}
        style={{
          position: 'fixed', inset: 0,
          zIndex: 999997,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <video
          ref={videoRef}
          muted playsInline preload="auto" loop
          style={{ display: 'none' }}
        >
          <source src="/honey-splash.mp4" type="video/mp4" />
        </video>
        {/* Real per-pixel alpha via luma key — no blend mode needed */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
          }}
        />
      </div>
    </>
  )
}
