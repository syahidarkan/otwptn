'use client'

import { useEffect, useState } from 'react'

interface HoneyDripProps {
  mode?: 'separator' | 'fullscreen'
  className?: string
  height?: number
}

// ─── Unified bottom shape: one closed path covering all drip protrusions ─────
// Traces across full width at y=0, dips through each drip, closes back at y=0.
// No gaps between drips — the y=0 line acts as the bridge.
interface DripDef { cx: number; hw: number; len: number }

function honeyBottomPath(drips: DripDef[]): string {
  const sorted = [...drips].sort((a, b) => a.cx - b.cx)
  const parts: string[] = ['M 0 0']

  for (const { cx, hw, len } of sorted) {
    const nw = hw * 0.58
    const ny = len * 0.38
    const bw = hw * 0.84
    const by = len * 0.70
    const tr = hw * 0.12
    parts.push(
      `L ${cx - hw} 0`,
      `C ${cx - hw} ${ny * 0.3}, ${cx - nw} ${ny * 0.78}, ${cx - nw} ${ny}`,
      `C ${cx - nw} ${ny + (by - ny) * 0.5}, ${cx - bw} ${by - 8}, ${cx - bw} ${by}`,
      `C ${cx - bw} ${len - (len - by) * 0.22}, ${cx - tr} ${len - 5}, ${cx} ${len}`,
      `C ${cx + tr} ${len - 5}, ${cx + bw} ${len - (len - by) * 0.22}, ${cx + bw} ${by}`,
      `C ${cx + bw} ${by - 8}, ${cx + nw} ${ny + (by - ny) * 0.5}, ${cx + nw} ${ny}`,
      `C ${cx + nw} ${ny * 0.78}, ${cx + hw} ${ny * 0.3}, ${cx + hw} 0`,
    )
  }
  parts.push('L 1200 0', 'Z')
  return parts.join(' ')
}

// ── Drip definitions ──────────────────────────────────────────────────────────
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

const SEP_DRIP_DEFS: DripDef[] = [
  { cx: 4,  hw: 3.0, len: 48 },
  { cx: 12, hw: 2.2, len: 32 },
  { cx: 21, hw: 3.8, len: 62 },
  { cx: 30, hw: 2.6, len: 38 },
  { cx: 39, hw: 3.2, len: 55 },
  { cx: 48, hw: 4.2, len: 72 },
  { cx: 58, hw: 2.4, len: 30 },
  { cx: 67, hw: 3.6, len: 60 },
  { cx: 76, hw: 2.8, len: 42 },
  { cx: 84, hw: 3.4, len: 65 },
  { cx: 92, hw: 2.5, len: 36 },
  { cx: 97, hw: 2.8, len: 50 },
]
const SEP_BOTTOM_PATH = honeyBottomPath(SEP_DRIP_DEFS)

const HONEY_GRADIENT =
  'linear-gradient(180deg, #92400e 0%, #d97706 10%, #f59e0b 40%, #fbbf24 68%, #fcd34d 88%, #fde68a 100%)'

// ─── Separator ────────────────────────────────────────────────────────────────
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
          <style>{`
            @keyframes sep-reveal {
              from { clip-path: inset(0 0 100% 0); }
              to   { clip-path: inset(0 0 0 0); }
            }
          `}</style>
          <linearGradient id="sep-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#d97706" />
            <stop offset="45%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="14" fill="#d97706" />
        <rect x="0" y="0" width="100" height="2" fill="rgba(255,255,255,0.3)" />
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
  // We use CSS class switching + keyframe animations.
  // Keyframes define their own from/to states → no "mount timing" issue.
  // The base class hides the element (clip from bottom = 100%).
  // hf-enter reveals top→down. hf-hold keeps it open. hf-exit hides bottom→up.
  const [cls, setCls] = useState('')

  useEffect(() => {
    if (phase === 'entering') setCls('hf-enter')
    else if (phase === 'holding') setCls('hf-hold')
    else if (phase === 'exiting') setCls('hf-exit')
  }, [phase])

  return (
    <>
      <style>{`
        /* Base: element hidden by default */
        .hf-root { clip-path: inset(0 0 100% 0); }

        /* Reveal honey flowing in from top */
        .hf-root.hf-enter {
          animation: hf-in 1.0s cubic-bezier(0.42,0,0.1,1) forwards;
        }

        /* Hold fully open (honey + drips visible) */
        .hf-root.hf-hold {
          clip-path: inset(0 0 0 0) !important;
          animation: none !important;
        }

        /* Honey retracts upward (bottom clip moves up 0→100%) */
        .hf-root.hf-exit {
          clip-path: inset(0 0 0 0);
          animation: hf-out 0.65s cubic-bezier(0.76,0,0.24,1) forwards;
        }

        @keyframes hf-in {
          from { clip-path: inset(0 0 100% 0); }
          to   { clip-path: inset(0 0 0% 0); }
        }
        @keyframes hf-out {
          from { clip-path: inset(0 0 0% 0); }
          to   { clip-path: inset(0 0 100% 0); }
        }
      `}</style>

      {/*
        One fixed element: top 67vh = honey body, bottom 185px = drip shapes.
        clip-path is applied to this whole element — no children escaping outside.
        As hf-in plays (clip bottom 100%→0%), the visible bottom edge sweeps downward:
          → honey body appears first, drips revealed last. Looks like honey flowing in.
        As hf-out plays (clip bottom 0%→100%), the visible bottom edge sweeps upward:
          → honey retracts upward, page content revealed from below.
      */}
      <div
        aria-hidden="true"
        className={`hf-root${cls ? ' ' + cls : ''}`}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: 'calc(67vh + 185px)',
          zIndex: 999997,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {/* Honey body background (top 67vh) */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '67vh',
          background: HONEY_GRADIENT,
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: 'rgba(255,255,255,0.18)' }} />
        </div>

        {/* Drip shapes sit immediately below honey body (at top: 67vh) */}
        <svg
          viewBox="0 0 1200 185"
          preserveAspectRatio="none"
          width="100%"
          height={185}
          style={{ position: 'absolute', top: '67vh', left: 0, right: 0, display: 'block' }}
        >
          <defs>
            <linearGradient id="hff-g" x1="0" y1="0" x2="0" y2="185" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#fde68a" />
              <stop offset="30%"  stopColor="#fbbf24" />
              <stop offset="68%"  stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={FULL_BOTTOM_PATH} fill="url(#hff-g)" />
        </svg>
      </div>
    </>
  )
}
