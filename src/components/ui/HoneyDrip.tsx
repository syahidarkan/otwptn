'use client'

import { useEffect, useState } from 'react'

interface HoneyDripProps {
  mode?: 'separator' | 'fullscreen'
  className?: string
  height?: number
}

interface DripDef { cx: number; hw: number; len: number }

// One closed path: horizontal line at y=0 bridges all drips, drips protrude below
function honeyBottomPath(drips: DripDef[]): string {
  const sorted = [...drips].sort((a, b) => a.cx - b.cx)
  const W = sorted.length > 5 ? 1200 : 100
  const parts: string[] = [`M 0 0`]

  for (const { cx, hw, len } of sorted) {
    const nw = hw * 0.60
    const ny = len * 0.38
    const bw = hw * 0.86
    const by = len * 0.72
    const tr = hw * 0.14
    parts.push(
      `L ${cx - hw} 0`,
      `C ${cx - hw} ${ny * 0.3} ${cx - nw} ${ny * 0.8} ${cx - nw} ${ny}`,
      `C ${cx - nw} ${ny + (by - ny) * 0.5} ${cx - bw} ${by - 8} ${cx - bw} ${by}`,
      `C ${cx - bw} ${len - (len - by) * 0.22} ${cx - tr} ${len - 5} ${cx} ${len}`,
      `C ${cx + tr} ${len - 5} ${cx + bw} ${len - (len - by) * 0.22} ${cx + bw} ${by}`,
      `C ${cx + bw} ${by - 8} ${cx + nw} ${ny + (by - ny) * 0.5} ${cx + nw} ${ny}`,
      `C ${cx + nw} ${ny * 0.8} ${cx + hw} ${ny * 0.3} ${cx + hw} 0`,
    )
  }
  parts.push(`L ${W} 0`, 'Z')
  return parts.join(' ')
}

// Wider drips, closer together — minimises visible gaps
const FULL_DRIPS: DripDef[] = [
  { cx: 48,   hw: 44, len: 130 },
  { cx: 150,  hw: 34, len: 100 },
  { cx: 245,  hw: 50, len: 155 },
  { cx: 355,  hw: 38, len: 120 },
  { cx: 450,  hw: 46, len: 148 },
  { cx: 550,  hw: 28, len: 86  },
  { cx: 630,  hw: 52, len: 165 },
  { cx: 740,  hw: 36, len: 115 },
  { cx: 832,  hw: 48, len: 150 },
  { cx: 936,  hw: 28, len: 84  },
  { cx: 1012, hw: 50, len: 158 },
  { cx: 1118, hw: 36, len: 108 },
  { cx: 1185, hw: 42, len: 135 },
]
const FULL_BOTTOM_PATH = honeyBottomPath(FULL_DRIPS)

const SEP_DRIPS: DripDef[] = [
  { cx: 4,  hw: 3.5, len: 50 }, { cx: 13, hw: 2.6, len: 34 },
  { cx: 22, hw: 4.2, len: 65 }, { cx: 32, hw: 3.0, len: 40 },
  { cx: 41, hw: 3.6, len: 58 }, { cx: 50, hw: 4.8, len: 76 },
  { cx: 60, hw: 2.8, len: 32 }, { cx: 69, hw: 4.0, len: 63 },
  { cx: 78, hw: 3.2, len: 44 }, { cx: 87, hw: 3.8, len: 68 },
  { cx: 94, hw: 2.6, len: 38 }, { cx: 98, hw: 3.0, len: 52 },
]
const SEP_BOTTOM_PATH = honeyBottomPath(SEP_DRIPS)

const HONEY_GRADIENT =
  'linear-gradient(180deg,#92400e 0%,#b45309 8%,#d97706 18%,#f59e0b 42%,#fbbf24 68%,#fcd34d 86%,#fde68a 100%)'

// ─── Separator ───────────────────────────────────────────────────────────────
export default function HoneyDrip({ mode = 'separator', className = '', height = 90 }: HoneyDripProps) {
  if (mode === 'fullscreen') return null
  return (
    <div
      className={`relative w-full overflow-hidden pointer-events-none select-none ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        width="100%" height="100%"
        style={{ position: 'absolute', inset: 0, display: 'block', animation: 'sep-reveal 1s cubic-bezier(0.4,0,0.2,1) both' }}
      >
        <defs>
          <style>{`@keyframes sep-reveal{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 0 0)}}`}</style>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#d97706" />
            <stop offset="45%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="14" fill="#d97706" />
        <rect x="0" y="0" width="100" height="2" fill="rgba(255,255,255,0.3)" />
        <path d={SEP_BOTTOM_PATH} fill="url(#sg)" />
      </svg>
    </div>
  )
}

// ─── Fullscreen ───────────────────────────────────────────────────────────────
interface HoneyFillProps { phase: 'entering' | 'holding' | 'exiting' }

export function HoneyFill({ phase }: HoneyFillProps) {
  const [cls, setCls] = useState('')

  useEffect(() => {
    if (phase === 'entering')      setCls('hf-enter')
    else if (phase === 'holding')  setCls('hf-hold')
    else if (phase === 'exiting')  setCls('hf-exit')
  }, [phase])

  const isActive = cls !== '' && cls !== 'hf-exit'

  return (
    <>
      {/* ── Amber backdrop fills drip gaps — no raw page content visible ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0,
          background: '#fde68a',
          zIndex: 999994,
          pointerEvents: 'none',
          opacity: isActive ? 1 : 0,
          transition: 'opacity 0.4s',
        }}
      />

      {/*
        ── Honey animation element ──
        Height: 67vh honey body + 220px for drip shapes.
        Clip-path sweeps the visible bottom boundary:
          hf-enter: inset bottom 100%→33vh  → bottom edge sweeps DOWN (honey flows in)
          hf-hold:  inset bottom 33vh       → holds at 67vh, drips visible below
          hf-exit:  inset bottom 33vh→100%  → bottom edge sweeps UP (honey retracts)
        Drip SVG at top:67vh stays INSIDE element, fully inside the clip area
        once honey reaches 67vh.
      */}
      <style>{`
        .hf-root{clip-path:inset(0 0 100% 0);}
        .hf-root.hf-enter{animation:hf-in 1.0s cubic-bezier(0.42,0,0.1,1) forwards;}
        .hf-root.hf-hold{clip-path:inset(0 0 33vh 0)!important;animation:none!important;}
        .hf-root.hf-exit{clip-path:inset(0 0 33vh 0);animation:hf-out 0.65s cubic-bezier(0.76,0,0.24,1) forwards;}
        @keyframes hf-in{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 33vh 0)}}
        @keyframes hf-out{from{clip-path:inset(0 0 33vh 0)}to{clip-path:inset(0 0 100% 0)}}
      `}</style>

      <div
        aria-hidden="true"
        className={`hf-root${cls ? ' ' + cls : ''}`}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: 'calc(67vh + 220px)',
          zIndex: 999997,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {/* Honey body: fills 0 → 67vh */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '67vh',
          background: HONEY_GRADIENT,
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: 'rgba(255,255,255,0.18)' }} />
        </div>

        {/* Drip shapes: positioned at the honey body bottom (67vh) */}
        <svg
          viewBox="0 0 1200 220"
          preserveAspectRatio="none"
          width="100%" height={220}
          style={{ position: 'absolute', top: '67vh', left: 0, right: 0, display: 'block' }}
        >
          <defs>
            <linearGradient id="hff-g" x1="0" y1="0" x2="0" y2="220" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#fde68a" />
              <stop offset="25%"  stopColor="#fcd34d" />
              <stop offset="55%"  stopColor="#fbbf24" />
              <stop offset="80%"  stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Bridge rect: covers stem-area gaps between drips */}
          <rect x="0" y="0" width="1200" height="22" fill="#fde68a" />
          <path d={FULL_BOTTOM_PATH} fill="url(#hff-g)" />
        </svg>
      </div>
    </>
  )
}
