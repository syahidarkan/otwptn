'use client'

import { forwardRef } from 'react'

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
const HONEY_VB_H = BRIDGE_H + 168

// Always-mounted, GPU-only honey layer for page transitions. No video, no canvas, no
// per-frame pixel work: GlobalPageLoader drives it with Web Animations on the root element.
export const HoneyOverlay = forwardRef<HTMLDivElement>(function HoneyOverlay(_, ref) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 999997,
        pointerEvents: 'none',
        userSelect: 'none',
        visibility: 'hidden',
        transformOrigin: 'top left',
        transform: 'translateY(-110%)',
        willChange: 'transform',
        contain: 'layout paint',
      }}
    >
      <div
        style={{
          height: '100vh',
          background: 'linear-gradient(180deg,#fcd34d 0%,#fbbf24 35%,#f59e0b 100%)',
        }}
      />
      <svg
        viewBox={`0 0 1200 ${HONEY_VB_H}`}
        preserveAspectRatio="none"
        width="100%"
        height={HONEY_DRIP_H}
        style={{ display: 'block', marginTop: -30, filter: 'drop-shadow(0 6px 8px rgba(120,53,15,0.25))' }}
      >
        <path d={FULL_BOTTOM_PATH} fill="#f59e0b" />
      </svg>
    </div>
  )
})
