'use client'

import { useEffect, useRef } from 'react'

interface HoneyDripProps {
  mode?: 'separator' | 'fullscreen'
  className?: string
  height?: number
  onComplete?: () => void
}

// Realistic honey drip shape: wide stem → neck → bulge → teardrop tip
// All in a 1200×180 viewBox
function honeyDripPath(cx: number, hw: number, len: number): string {
  const nw = hw * 0.60   // neck half-width
  const ny = len * 0.40  // neck y
  const bw = hw * 0.82   // bulge half-width
  const by = len * 0.72  // bulge y

  return [
    `M ${cx - hw} 0`,
    `C ${cx - hw} ${ny * 0.3}, ${cx - nw} ${ny * 0.8}, ${cx - nw} ${ny}`,
    `C ${cx - nw} ${ny + (by - ny) * 0.5}, ${cx - bw} ${by - 8}, ${cx - bw} ${by}`,
    `C ${cx - bw} ${len - (len - by) * 0.28}, ${cx - hw * 0.14} ${len - 5}, ${cx} ${len}`,
    `C ${cx + hw * 0.14} ${len - 5}, ${cx + bw} ${len - (len - by) * 0.28}, ${cx + bw} ${by}`,
    `C ${cx + bw} ${by - 8}, ${cx + nw} ${ny + (by - ny) * 0.5}, ${cx + nw} ${ny}`,
    `C ${cx + nw} ${ny * 0.8}, ${cx + hw} ${ny * 0.3}, ${cx + hw} 0`,
    'Z',
  ].join(' ')
}

// Separator mode drips (% coordinates, viewBox 0 0 100 100)
const SEP_DRIPS = [
  { x: 4,  w: 3.0, len: 48, delay: 0.00 },
  { x: 12, w: 2.2, len: 32, delay: 0.15 },
  { x: 21, w: 3.8, len: 62, delay: 0.05 },
  { x: 30, w: 2.6, len: 38, delay: 0.25 },
  { x: 39, w: 3.2, len: 55, delay: 0.10 },
  { x: 48, w: 4.2, len: 72, delay: 0.00 },
  { x: 58, w: 2.4, len: 30, delay: 0.30 },
  { x: 67, w: 3.6, len: 60, delay: 0.08 },
  { x: 76, w: 2.8, len: 42, delay: 0.20 },
  { x: 84, w: 3.4, len: 65, delay: 0.12 },
  { x: 92, w: 2.5, len: 36, delay: 0.18 },
  { x: 97, w: 2.8, len: 50, delay: 0.06 },
]

function sepDripPath(cx: number, hw: number, len: number): string {
  const nw = hw * 0.60
  const ny = len * 0.40
  const bw = hw * 0.82
  const by = len * 0.72
  return [
    `M ${cx - hw} 0`,
    `C ${cx - hw} ${ny * 0.3}, ${cx - nw} ${ny * 0.8}, ${cx - nw} ${ny}`,
    `C ${cx - nw} ${ny + (by - ny) * 0.5}, ${cx - bw} ${by - 2}, ${cx - bw} ${by}`,
    `C ${cx - bw} ${len - (len - by) * 0.28}, ${cx - hw * 0.14} ${len - 1}, ${cx} ${len}`,
    `C ${cx + hw * 0.14} ${len - 1}, ${cx + bw} ${len - (len - by) * 0.28}, ${cx + bw} ${by}`,
    `C ${cx + bw} ${by - 2}, ${cx + nw} ${ny + (by - ny) * 0.5}, ${cx + nw} ${ny}`,
    `C ${cx + nw} ${ny * 0.8}, ${cx + hw} ${ny * 0.3}, ${cx + hw} 0`,
    'Z',
  ].join(' ')
}

// Fullscreen mode drip positions (1200×180 canvas)
const FULL_DRIPS = [
  { cx: 65,  hw: 32, len: 128 },
  { cx: 165, hw: 20, len: 86  },
  { cx: 258, hw: 40, len: 148 },
  { cx: 365, hw: 26, len: 95  },
  { cx: 460, hw: 36, len: 132 },
  { cx: 558, hw: 18, len: 68  },
  { cx: 645, hw: 46, len: 158 },
  { cx: 755, hw: 24, len: 92  },
  { cx: 848, hw: 38, len: 122 },
  { cx: 942, hw: 17, len: 62  },
  { cx: 1032,hw: 42, len: 142 },
  { cx: 1125,hw: 23, len: 88  },
  { cx: 1188,hw: 28, len: 110 },
]

export default function HoneyDrip({ mode = 'separator', className = '', height = 90, onComplete }: HoneyDripProps) {
  if (mode === 'fullscreen') {
    return <HoneyFill onComplete={onComplete} />
  }

  return (
    <div
      className={`relative w-full overflow-hidden pointer-events-none select-none ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes sep-drip-down {
          from { transform: scaleY(0); transform-origin: top center; opacity: 0.5; }
          to   { transform: scaleY(1); transform-origin: top center; opacity: 1; }
        }
      `}</style>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0, display: 'block' }}
      >
        <defs>
          <linearGradient id="sep-honey-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#d97706" />
            <stop offset="50%"  stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="sep-honey-drip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f59e0b" />
            <stop offset="60%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0.4" />
          </linearGradient>
          <filter id="sep-blur">
            <feGaussianBlur stdDeviation="0.25" />
          </filter>
        </defs>
        <rect x="0" y="0" width="100" height="16" fill="url(#sep-honey-top)" />
        <rect x="0" y="0" width="100" height="2.5" fill="rgba(255,255,255,0.3)" />
        {SEP_DRIPS.map((drip, i) => (
          <path
            key={i}
            d={sepDripPath(drip.x, drip.w, drip.len)}
            fill="url(#sep-honey-drip)"
            filter="url(#sep-blur)"
            style={{ animation: `sep-drip-down 1.3s cubic-bezier(0.25,0.46,0.45,0.94) ${drip.delay}s both` }}
          />
        ))}
      </svg>
    </div>
  )
}

/* ─── Fullscreen honey flood transition ─── */
interface HoneyFillProps {
  phase?: 'entering' | 'holding' | 'exiting'
  onComplete?: () => void
}

export function HoneyFill({ phase = 'entering', onComplete }: HoneyFillProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = setTimeout(() => onComplete?.(), 1500)
    return () => clearTimeout(id)
  }, [onComplete])

  const isExiting = phase === 'exiting'
  const bodyHeight = isExiting ? '0px' : '67vh'
  const bodyTransition = `height ${isExiting ? '0.6s' : '0.9s'} cubic-bezier(0.76,0,0.24,1)`
  const dripTop = isExiting ? '0px' : '67vh'
  const dripTransition = `top ${isExiting ? '0.6s' : '0.9s'} cubic-bezier(0.76,0,0.24,1), opacity 0.12s`
  const dripOpacity = isExiting ? 0 : 1

  return (
    <div ref={ref} className="pointer-events-none select-none" aria-hidden="true">
      {/* Honey body */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: bodyHeight,
          transition: bodyTransition,
          background: 'linear-gradient(180deg, #92400e 0%, #d97706 15%, #f59e0b 45%, #fbbf24 72%, #fcd34d 90%, #fde68a 100%)',
          zIndex: 999997,
          overflow: 'hidden',
        }}
      >
        {/* Inner shine strip */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: 'rgba(255,255,255,0.18)' }} />
      </div>

      {/* Drip edge — follows honey body bottom */}
      <div
        style={{
          position: 'fixed',
          top: dripTop,
          left: 0, right: 0,
          height: 180,
          transition: dripTransition,
          opacity: dripOpacity,
          zIndex: 999997,
          pointerEvents: 'none',
        }}
      >
        <svg
          viewBox="0 0 1200 180"
          preserveAspectRatio="xMidYMin meet"
          width="100%" height="180"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id="hff-drip-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#fcd34d" />
              <stop offset="50%"  stopColor="#fbbf24" />
              <stop offset="85%"  stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fde68a" stopOpacity="0.5" />
            </linearGradient>
            <filter id="hff-blur">
              <feGaussianBlur stdDeviation="0.6" />
            </filter>
          </defs>
          {/* Fill top gap between drips */}
          <rect x="0" y="0" width="1200" height="12" fill="#fcd34d" />
          {FULL_DRIPS.map((drip, i) => (
            <path
              key={i}
              d={honeyDripPath(drip.cx, drip.hw, drip.len)}
              fill="url(#hff-drip-grad)"
              filter="url(#hff-blur)"
            />
          ))}
        </svg>
      </div>
    </div>
  )
}
