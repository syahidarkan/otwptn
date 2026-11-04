'use client'

import { useMemo } from 'react'

interface HoneycombBgProps {
  opacity?: number
  className?: string
  colorScheme?: 'amber' | 'dark' | 'light'
  size?: number
  animated?: boolean
}

function hexPoints(cx: number, cy: number, R: number): string {
  const a = R * Math.cos(Math.PI / 6)
  const b = R * 0.5
  return [
    `${cx + R},${cy}`,
    `${cx + b},${cy + a}`,
    `${cx - b},${cy + a}`,
    `${cx - R},${cy}`,
    `${cx - b},${cy - a}`,
    `${cx + b},${cy - a}`,
  ].join(' ')
}

// Smaller highlight polygon, offset top-left for 3D facet look
function hexHighlight(cx: number, cy: number, R: number): string {
  const r = R * 0.55
  const off = R * 0.12
  return hexPoints(cx - off, cy - off, r)
}

export default function HoneycombBg({
  opacity = 0.6,
  className = '',
  colorScheme = 'amber',
  size = 28,
  animated = true,
}: HoneycombBgProps) {
  const palettes = {
    amber: {
      fills: ['#f59e0b', '#fbbf24', '#f97316', '#fcd34d', '#d97706'],
      shadow: 'rgba(120,53,15,0.35)',
      highlight: 'rgba(255,255,255,0.22)',
    },
    dark: {
      fills: ['#27272a', '#18181b', '#3f3f46', '#52525b', '#2d2d30'],
      shadow: 'rgba(0,0,0,0.6)',
      highlight: 'rgba(255,255,255,0.08)',
    },
    light: {
      fills: ['#fef3c7', '#fde68a', '#fffbeb', '#fef9c3', '#fef08a'],
      shadow: 'rgba(245,158,11,0.15)',
      highlight: 'rgba(255,255,255,0.45)',
    },
  }

  const p = palettes[colorScheme]
  const R = size
  const A = R * Math.cos(Math.PI / 6)

  const hexagons = useMemo(() => {
    const list: { cx: number; cy: number; fill: string; delay: number; key: string }[] = []
    const colStep = 1.5 * R
    const rowStep = 2 * A
    const maxX = 2400
    const maxY = 1500

    const cols = Math.ceil(maxX / colStep) + 2
    const rows = Math.ceil(maxY / rowStep) + 2

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const isOddCol = col % 2 === 1
        const cx = col * colStep + R - colStep
        const cy = row * rowStep + (isOddCol ? A : 0) + A - rowStep

        // Wave propagates diagonally top-left → bottom-right
        const waveDist = col * 0.65 + row * 1.05
        const delay = (waveDist % 7) * 0.1

        const fillIndex = (col * 3 + row * 2) % p.fills.length
        list.push({ cx, cy, fill: p.fills[fillIndex], delay, key: `${col}-${row}` })
      }
    }
    return list
  }, [R, A, p.fills])

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes hc-appear {
          0%   { opacity: 0; transform: scale(0.72); }
          65%  { opacity: 1; transform: scale(1.06); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes hc-wave {
          0%, 100% { transform: scale(1) translateY(0); filter: brightness(1); }
          40%       { transform: scale(1.045) translateY(-1.5px); filter: brightness(1.12); }
          70%       { transform: scale(0.985) translateY(0.5px); filter: brightness(0.93); }
        }
      `}</style>
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <filter id="hc-shadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="1" dy="2.5" stdDeviation="1.5" floodColor={p.shadow} />
          </filter>
        </defs>

        {hexagons.map(({ cx, cy, fill, delay, key }) => {
          const appearDur = 0.52
          const wavePeriod = 2.6 + (delay % 0.6)  // slight period variation for organic feel
          const waveDelay = delay + appearDur

          return (
            <g key={key}>
              {/* Main hex face */}
              <polygon
                points={hexPoints(cx, cy, R * 0.93)}
                fill={fill}
                filter="url(#hc-shadow)"
                style={animated ? {
                  animation: `hc-appear ${appearDur}s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both, hc-wave ${wavePeriod}s ease-in-out ${waveDelay}s infinite`,
                  transformOrigin: `${cx}px ${cy}px`,
                } : undefined}
              />
              {/* Top-left highlight for 3D facet effect */}
              {animated && (
                <polygon
                  points={hexHighlight(cx, cy, R * 0.93)}
                  fill={p.highlight}
                  style={{
                    animation: `hc-appear ${appearDur}s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both, hc-wave ${wavePeriod}s ease-in-out ${waveDelay}s infinite`,
                    transformOrigin: `${cx}px ${cy}px`,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
