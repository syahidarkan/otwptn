'use client'

import { useEffect, useState } from 'react'

interface HoneyDripProps {
  mode?: 'separator' | 'fullscreen'
  className?: string
  height?: number
  onComplete?: () => void
}

// ─── Bezier honey drip path ───────────────────────────────────────────────────
// wide stem → neck → bulge → teardrop tip, matches honey-splash.png reference
function honeyDripPath(cx: number, hw: number, len: number): string {
  const nw = hw * 0.58          // neck half-width
  const ny = len * 0.38         // neck y
  const bw = hw * 0.84          // bulge half-width
  const by = len * 0.70         // bulge y
  const tipR = hw * 0.12        // tip radius offset

  return [
    `M ${cx - hw} 0`,
    // left side
    `C ${cx - hw} ${ny * 0.3}, ${cx - nw} ${ny * 0.8}, ${cx - nw} ${ny}`,
    `C ${cx - nw} ${ny + (by - ny) * 0.5}, ${cx - bw} ${by - 10}, ${cx - bw} ${by}`,
    `C ${cx - bw} ${len - (len - by) * 0.25}, ${cx - tipR} ${len - 6}, ${cx} ${len}`,
    // right side (mirror)
    `C ${cx + tipR} ${len - 6}, ${cx + bw} ${len - (len - by) * 0.25}, ${cx + bw} ${by}`,
    `C ${cx + bw} ${by - 10}, ${cx + nw} ${ny + (by - ny) * 0.5}, ${cx + nw} ${ny}`,
    `C ${cx + nw} ${ny * 0.8}, ${cx + hw} ${ny * 0.3}, ${cx + hw} 0`,
    'Z',
  ].join(' ')
}

// ─── Separator mode drip positions (100-unit viewBox) ────────────────────────
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
  const nw = hw * 0.58; const ny = len * 0.38
  const bw = hw * 0.84; const by = len * 0.70
  const tipR = hw * 0.12
  return [
    `M ${cx - hw} 0`,
    `C ${cx - hw} ${ny * 0.3}, ${cx - nw} ${ny * 0.8}, ${cx - nw} ${ny}`,
    `C ${cx - nw} ${ny + (by - ny) * 0.5}, ${cx - bw} ${by - 2}, ${cx - bw} ${by}`,
    `C ${cx - bw} ${len - (len - by) * 0.25}, ${cx - tipR} ${len - 1.5}, ${cx} ${len}`,
    `C ${cx + tipR} ${len - 1.5}, ${cx + bw} ${len - (len - by) * 0.25}, ${cx + bw} ${by}`,
    `C ${cx + bw} ${by - 2}, ${cx + nw} ${ny + (by - ny) * 0.5}, ${cx + nw} ${ny}`,
    `C ${cx + nw} ${ny * 0.8}, ${cx + hw} ${ny * 0.3}, ${cx + hw} 0`,
    'Z',
  ].join(' ')
}

// ─── Fullscreen drip positions (1200-unit canvas) ────────────────────────────
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

const HONEY_GRADIENT = 'linear-gradient(180deg, #92400e 0%, #d97706 12%, #f59e0b 42%, #fbbf24 70%, #fcd34d 90%, #fde68a 100%)'

export default function HoneyDrip({ mode = 'separator', className = '', height = 90 }: HoneyDripProps) {
  if (mode === 'fullscreen') return null  // fullscreen handled via HoneyFill export

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
        width="100%" height="100%"
        style={{ position: 'absolute', inset: 0, display: 'block' }}
      >
        <defs>
          <linearGradient id="sep-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#d97706" />
            <stop offset="50%"  stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="sep-drip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f59e0b" />
            <stop offset="65%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="16" fill="url(#sep-top)" />
        <rect x="0" y="0" width="100" height="2.5" fill="rgba(255,255,255,0.3)" />
        {SEP_DRIPS.map((d, i) => (
          <path
            key={i}
            d={sepDripPath(d.x, d.w, d.len)}
            fill="url(#sep-drip)"
            style={{ animation: `sep-drip-down 1.3s cubic-bezier(0.25,0.46,0.45,0.94) ${d.delay}s both` }}
          />
        ))}
      </svg>
    </div>
  )
}

// ─── Named export for GlobalPageLoader ───────────────────────────────────────
interface HoneyFillProps {
  phase: 'entering' | 'holding' | 'exiting'
}

export function HoneyFill({ phase }: HoneyFillProps) {
  // Start at 0 so CSS transition has a "from" state when we animate to 67vh.
  // Without this, React mounts the element already at 67vh → no transition.
  const [displayH, setDisplayH] = useState('0px')

  useEffect(() => {
    if (phase === 'entering') {
      // Double-RAF: first ensures the 0px is painted, second triggers the transition
      let id: number
      const id1 = requestAnimationFrame(() => {
        id = requestAnimationFrame(() => setDisplayH('67vh'))
      })
      return () => { cancelAnimationFrame(id1); cancelAnimationFrame(id) }
    }
    if (phase === 'holding') {
      setDisplayH('67vh')
    }
    if (phase === 'exiting') {
      setDisplayH('0px')
    }
  }, [phase])

  const dur = phase === 'exiting' ? '0.6s' : '0.9s'
  const ease = 'cubic-bezier(0.76,0,0.24,1)'
  const isOpen = displayH !== '0px'

  return (
    <div aria-hidden="true" style={{ pointerEvents: 'none', userSelect: 'none' }}>
      {/* ── Honey body ── */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: displayH,
          transition: `height ${dur} ${ease}`,
          background: HONEY_GRADIENT,
          zIndex: 999997,
          overflow: 'hidden',
        }}
      >
        {/* Inner shine strip at top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: 'rgba(255,255,255,0.18)' }} />
      </div>

      {/* ── Drip edge — tracks the honey body bottom ── */}
      <div
        style={{
          position: 'fixed',
          top: displayH,          // matches honey body height → follows its bottom edge
          left: 0, right: 0,
          height: 185,
          transition: `top ${dur} ${ease}, opacity 0.15s`,
          opacity: isOpen ? 1 : 0,
          zIndex: 999997,
          pointerEvents: 'none',
        }}
      >
        <svg
          viewBox="0 0 1200 185"
          preserveAspectRatio="xMidYMin slice"
          width="100%" height="185"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id="hff-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#fcd34d" />
              <stop offset="45%"  stopColor="#fbbf24" />
              <stop offset="80%"  stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fde68a" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {/* Fill gap between drip stems */}
          <rect x="0" y="0" width="1200" height="10" fill="#fcd34d" />
          {FULL_DRIPS.map((d, i) => (
            <path
              key={i}
              d={honeyDripPath(d.cx, d.hw, d.len)}
              fill="url(#hff-grad)"
            />
          ))}
        </svg>
      </div>
    </div>
  )
}
