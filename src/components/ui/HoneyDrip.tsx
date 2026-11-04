'use client'

import { useEffect, useRef } from 'react'

interface HoneyDripProps {
  /** section separator mode (default) or fullscreen page transition */
  mode?: 'separator' | 'fullscreen'
  className?: string
  /** height of the separator band in px (separator mode only) */
  height?: number
  /** called when fullscreen animation completes */
  onComplete?: () => void
}

// Drip config: x position (%), width (%), max length (%), delay (s)
const DRIPS = [
  { x: 3,   w: 3.5, len: 55, delay: 0.0 },
  { x: 11,  w: 2.5, len: 38, delay: 0.15 },
  { x: 19,  w: 4.0, len: 70, delay: 0.05 },
  { x: 29,  w: 2.8, len: 42, delay: 0.25 },
  { x: 38,  w: 3.2, len: 60, delay: 0.1  },
  { x: 47,  w: 4.5, len: 80, delay: 0.0  },
  { x: 57,  w: 2.6, len: 35, delay: 0.3  },
  { x: 65,  w: 3.8, len: 65, delay: 0.08 },
  { x: 74,  w: 2.4, len: 48, delay: 0.2  },
  { x: 82,  w: 3.6, len: 72, delay: 0.12 },
  { x: 90,  w: 2.9, len: 40, delay: 0.18 },
  { x: 96,  w: 3.0, len: 55, delay: 0.06 },
]

function dripPath(xPct: number, wPct: number, lenPct: number, totalH: number): string {
  const x0 = xPct
  const w = wPct
  const h = lenPct
  // SVG viewBox is 0 0 100 100 (percent-based coordinates)
  // Drip shape: rectangle narrows to teardrop at bottom
  const half = w / 2
  const neckAt = h * 0.7   // where the drip starts narrowing
  const tipW = half * 0.35 // width at the very tip
  return [
    `M ${x0 - half} 0`,
    `L ${x0 + half} 0`,
    `L ${x0 + half} ${neckAt}`,
    `Q ${x0 + half} ${h} ${x0 + tipW} ${h}`,
    `Q ${x0} ${h + w * 0.6} ${x0 - tipW} ${h}`,
    `Q ${x0 - half} ${h} ${x0 - half} ${neckAt}`,
    `Z`,
  ].join(' ')
}

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
        @keyframes drip-down {
          from { transform: scaleY(0); transform-origin: top center; opacity: 0.6; }
          to   { transform: scaleY(1); transform-origin: top center; opacity: 1; }
        }
        @keyframes drop-fall {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          80%  { opacity: 0.9; }
          100% { transform: translateY(28px) scale(0.6); opacity: 0; }
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
          <linearGradient id="honey-top-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f59e0b" />
            <stop offset="60%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fcd34d" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="honey-drip-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f59e0b" />
            <stop offset="70%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0.3" />
          </linearGradient>
          <filter id="honey-blur">
            <feGaussianBlur stdDeviation="0.3" />
          </filter>
        </defs>

        {/* Top band */}
        <rect x="0" y="0" width="100" height="14" fill="url(#honey-top-grad)" />

        {/* Shine highlight */}
        <rect x="0" y="0" width="100" height="2.5" fill="rgba(255,255,255,0.35)" />

        {/* Drips */}
        {DRIPS.map((drip, i) => (
          <g key={i} style={{ animationDelay: `${drip.delay}s` }}>
            <path
              d={dripPath(drip.x, drip.w, drip.len, 100)}
              fill="url(#honey-drip-grad)"
              filter="url(#honey-blur)"
              style={{
                animation: `drip-down 1.2s cubic-bezier(0.25,0.46,0.45,0.94) ${drip.delay}s both`,
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ─── Fullscreen honey flood transition ─── */
function HoneyFill({ onComplete }: { onComplete?: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Phase 1: flood in (~800ms), Phase 2: hold (~200ms), Phase 3: drain out (~500ms)
    const id = setTimeout(() => {
      onComplete?.()
    }, 1500)
    return () => clearTimeout(id)
  }, [onComplete])

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        @keyframes honey-flood-in {
          0%   { clip-path: inset(0 0 100% 0); }
          100% { clip-path: inset(0 0 0% 0); }
        }
        @keyframes honey-flood-out {
          0%   { clip-path: inset(0 0 0% 0); opacity: 1; }
          100% { clip-path: inset(100% 0 0% 0); opacity: 0; }
        }
        .honey-flood-layer {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #f59e0b 0%, #fbbf24 40%, #fcd34d 70%, #fde68a 100%);
          animation: honey-flood-in 0.65s cubic-bezier(0.76,0,0.24,1) forwards,
                     honey-flood-out 0.55s cubic-bezier(0.76,0,0.24,1) 1.0s forwards;
        }
        .honey-flood-drips {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 120px;
          background: linear-gradient(180deg, #fde68a 0%, #fde68a 30%, transparent 100%);
          animation: honey-flood-in 0.65s cubic-bezier(0.76,0,0.24,1) 0.05s forwards,
                     honey-flood-out 0.55s cubic-bezier(0.76,0,0.24,1) 1.0s forwards;
        }
      `}</style>
      <div className="honey-flood-layer" />
      {/* SVG drips along the bottom leading edge */}
      <svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="80"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          animation: 'honey-flood-in 0.65s cubic-bezier(0.76,0,0.24,1) forwards, honey-flood-out 0.55s cubic-bezier(0.76,0,0.24,1) 1.0s forwards',
        }}
      >
        <defs>
          <linearGradient id="hff-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[40,110,180,260,340,410,490,560,640,720,800,880,950,1030,1110,1180].map((x, i) => {
          const h = 20 + (i % 5) * 12
          const w = 14 + (i % 3) * 6
          return (
            <ellipse key={i} cx={x} cy={0} rx={w/2} ry={h}
              fill="#fde68a" fillOpacity="0.9"
            />
          )
        })}
      </svg>
    </div>
  )
}
