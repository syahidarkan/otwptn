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
  const a = R * Math.cos(Math.PI / 6) // = R * √3/2
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

export default function HoneycombBg({
  opacity = 0.55,
  className = '',
  colorScheme = 'amber',
  size = 28,
  animated = true,
}: HoneycombBgProps) {
  const palettes = {
    amber: {
      fills: ['#fbbf24', '#f59e0b', '#fcd34d', '#fde68a', '#f97316'],
      shadow: 'rgba(146,64,14,0.25)',
    },
    dark: {
      fills: ['#27272a', '#18181b', '#3f3f46', '#52525b', '#2d2d30'],
      shadow: 'rgba(0,0,0,0.5)',
    },
    light: {
      fills: ['#fef3c7', '#fde68a', '#fffbeb', '#fef9c3', '#fef08a'],
      shadow: 'rgba(245,158,11,0.12)',
    },
  }

  const p = palettes[colorScheme]
  const R = size
  const A = R * Math.cos(Math.PI / 6) // apothem = R * √3/2

  // Generate individual hex centers for a large area (covers up to ~2200×1400px)
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

        // Staggered delay: diagonal wave from top-left
        const waveDist = (col * 0.7 + row * 1.1)
        const delay = (waveDist % 8) * 0.09

        // Vary fill color based on position for depth
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
          0% { opacity: 0; transform: scale(0.75); }
          70% { opacity: 1; transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes hc-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.75; }
        }
      `}</style>
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <filter id="hc-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor={p.shadow} />
          </filter>
          <radialGradient id="hc-vignette" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0.3" />
          </radialGradient>
        </defs>

        {hexagons.map(({ cx, cy, fill, delay, key }) => (
          <polygon
            key={key}
            points={hexPoints(cx, cy, R * 0.94)}
            fill={fill}
            filter="url(#hc-shadow)"
            style={animated ? {
              animation: `hc-appear 0.55s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both`,
              transformOrigin: `${cx}px ${cy}px`,
            } : undefined}
          />
        ))}
      </svg>
    </div>
  )
}
