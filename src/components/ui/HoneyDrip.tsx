'use client'

import { useEffect, useState } from 'react'

interface HoneyDripProps {
  mode?: 'separator' | 'fullscreen'
  className?: string
  height?: number
}

// ─── Unified bottom path: traces full honey bottom + all drips as ONE shape ──
// No gaps between drips — the path covers the full width at y=0, then dips
// through each drip in sequence (left-to-right) and closes back at y=0.
interface DripDef { cx: number; hw: number; len: number }

function honeyBottomPath(drips: DripDef[]): string {
  const sorted = [...drips].sort((a, b) => a.cx - b.cx)
  const parts: string[] = ['M 0 0']

  for (const { cx, hw, len } of sorted) {
    const nw = hw * 0.58          // neck half-width
    const ny = len * 0.38         // neck y
    const bw = hw * 0.84          // bulge half-width
    const by = len * 0.70         // bulge y
    const tr = hw * 0.12          // tip radius

    parts.push(
      `L ${cx - hw} 0`,
      // down left side
      `C ${cx - hw} ${ny * 0.3}, ${cx - nw} ${ny * 0.78}, ${cx - nw} ${ny}`,
      `C ${cx - nw} ${ny + (by - ny) * 0.5}, ${cx - bw} ${by - 8}, ${cx - bw} ${by}`,
      `C ${cx - bw} ${len - (len - by) * 0.22}, ${cx - tr} ${len - 5}, ${cx} ${len}`,
      // up right side
      `C ${cx + tr} ${len - 5}, ${cx + bw} ${len - (len - by) * 0.22}, ${cx + bw} ${by}`,
      `C ${cx + bw} ${by - 8}, ${cx + nw} ${ny + (by - ny) * 0.5}, ${cx + nw} ${ny}`,
      `C ${cx + nw} ${ny * 0.78}, ${cx + hw} ${ny * 0.3}, ${cx + hw} 0`,
    )
  }

  parts.push('L 1200 0', 'Z')
  return parts.join(' ')
}

// Pre-compute constant paths at module level (never changes)
const FULL_DRIPS: DripDef[] = [
  { cx: 65,   hw: 32, len: 128 },
  { cx: 165,  hw: 20, len: 86  },
  { cx: 258,  hw: 40, len: 148 },
  { cx: 365,  hw: 26, len: 95  },
  { cx: 460,  hw: 36, len: 132 },
  { cx: 558,  hw: 18, len: 68  },
  { cx: 645,  hw: 46, len: 158 },
  { cx: 755,  hw: 24, len: 92  },
  { cx: 848,  hw: 38, len: 122 },
  { cx: 942,  hw: 17, len: 62  },
  { cx: 1032, hw: 42, len: 142 },
  { cx: 1125, hw: 23, len: 88  },
  { cx: 1188, hw: 28, len: 110 },
]
const FULL_BOTTOM_PATH = honeyBottomPath(FULL_DRIPS)

// Separator mode drips (100-unit viewBox)
interface SepDripDef { x: number; w: number; len: number; delay: number }
const SEP_DRIPS: SepDripDef[] = [
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
const SEP_DRIP_DEFS: DripDef[] = SEP_DRIPS.map(d => ({ cx: d.x, hw: d.w, len: d.len }))
const SEP_BOTTOM_PATH = honeyBottomPath(SEP_DRIP_DEFS)

const HONEY_GRADIENT = 'linear-gradient(180deg, #92400e 0%, #d97706 12%, #f59e0b 42%, #fbbf24 70%, #fcd34d 90%, #fde68a 100%)'

// ─── Separator ────────────────────────────────────────────────────────────────
export default function HoneyDrip({ mode = 'separator', className = '', height = 90 }: HoneyDripProps) {
  if (mode === 'fullscreen') return null

  return (
    <div
      className={`relative w-full overflow-hidden pointer-events-none select-none ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes sep-drip {
          from { clip-path: inset(0 0 100% 0); }
          to   { clip-path: inset(0 0 0 0); }
        }
      `}</style>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        width="100%" height="100%"
        style={{ position: 'absolute', inset: 0, display: 'block', animation: 'sep-drip 1.1s cubic-bezier(0.25,0.46,0.45,0.94) both' }}
      >
        <defs>
          <linearGradient id="sep-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#d97706" />
            <stop offset="40%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {/* Top band */}
        <rect x="0" y="0" width="100" height="14" fill="#d97706" />
        <rect x="0" y="0" width="100" height="2" fill="rgba(255,255,255,0.3)" />
        {/* Unified drip bottom shape */}
        <path d={SEP_BOTTOM_PATH} fill="url(#sep-grad)" />
      </svg>
    </div>
  )
}

// ─── Fullscreen honey flood (used by GlobalPageLoader) ────────────────────────
interface HoneyFillProps {
  phase: 'entering' | 'holding' | 'exiting'
}

export function HoneyFill({ phase }: HoneyFillProps) {
  // Start at 0px so CSS transition has a "from" state.
  // Without this, React mounts already at 67vh → no visible animation.
  const [displayH, setDisplayH] = useState('0px')

  useEffect(() => {
    if (phase === 'entering') {
      let id2: number
      const id1 = requestAnimationFrame(() => {
        id2 = requestAnimationFrame(() => setDisplayH('67vh'))
      })
      return () => { cancelAnimationFrame(id1); cancelAnimationFrame(id2) }
    }
    if (phase === 'holding') setDisplayH('67vh')
    if (phase === 'exiting') setDisplayH('0px')
  }, [phase])

  const dur = phase === 'exiting' ? '0.6s' : '0.9s'
  const ease = 'cubic-bezier(0.76,0,0.24,1)'

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: displayH,
        transition: `height ${dur} ${ease}`,
        background: HONEY_GRADIENT,
        zIndex: 999997,
        overflow: 'visible',   // allow drip SVG to extend below the div
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* Shine strip */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: 'rgba(255,255,255,0.18)' }} />

      {/* Drip shapes — hang below the honey body via overflow:visible + bottom:-185 */}
      <svg
        viewBox="0 0 1200 185"
        preserveAspectRatio="none"
        width="100%"
        height={185}
        style={{ position: 'absolute', bottom: -185, left: 0, right: 0, display: 'block' }}
      >
        <defs>
          <linearGradient id="hff-grad" x1="0" y1="0" x2="0" y2="185" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#fde68a" />   {/* matches honey body bottom */}
            <stop offset="35%"  stopColor="#fbbf24" />
            <stop offset="70%"  stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Single unified path: covers full width at y=0 + all drip protrusions */}
        <path d={FULL_BOTTOM_PATH} fill="url(#hff-grad)" />
      </svg>
    </div>
  )
}
