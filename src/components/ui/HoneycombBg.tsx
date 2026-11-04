'use client'

interface HoneycombBgProps {
  opacity?: number
  className?: string
  colorScheme?: 'amber' | 'dark' | 'light'
  size?: number
}

// Flat-top regular hexagon grid (R = corner-to-center radius)
// Pattern cell: width = 3R, height = R*√3
// Two hexes per cell: at (R, R*√3/2) and at (2.5R, 0) & (2.5R, R*√3)
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

export default function HoneycombBg({
  opacity = 0.55,
  className = '',
  colorScheme = 'amber',
  size = 28,
}: HoneycombBgProps) {
  const uid = 'hc'

  const palettes = {
    amber: {
      fill1: '#fbbf24',
      fill2: '#f59e0b',
      fill3: '#fcd34d',
      stroke: '#d97706',
      shadow: 'rgba(146,64,14,0.3)',
    },
    dark: {
      fill1: '#27272a',
      fill2: '#18181b',
      fill3: '#3f3f46',
      stroke: '#52525b',
      shadow: 'rgba(0,0,0,0.5)',
    },
    light: {
      fill1: '#fef3c7',
      fill2: '#fde68a',
      fill3: '#fffbeb',
      stroke: '#fcd34d',
      shadow: 'rgba(245,158,11,0.15)',
    },
  }

  const p = palettes[colorScheme]
  const R = size
  const A = R * Math.cos(Math.PI / 6) // = R * √3/2
  const pw = 3 * R
  const ph = 2 * A

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* 3D top-lit gradient */}
          <radialGradient id={`${uid}-g1`} cx="40%" cy="30%" r="65%">
            <stop offset="0%" stopColor={p.fill3} />
            <stop offset="50%" stopColor={p.fill1} />
            <stop offset="100%" stopColor={p.fill2} />
          </radialGradient>
          <radialGradient id={`${uid}-g2`} cx="45%" cy="35%" r="60%">
            <stop offset="0%" stopColor={p.fill1} />
            <stop offset="60%" stopColor={p.fill2} />
            <stop offset="100%" stopColor={p.stroke} />
          </radialGradient>
          <filter id={`${uid}-sh`}>
            <feDropShadow dx="0" dy="2.5" stdDeviation="1.5" floodColor={p.shadow} />
          </filter>

          {/* One tile: width=3R, height=2A — contains 2 partial hexes */}
          <pattern
            id={`${uid}-pat`}
            x="0" y="0"
            width={pw} height={ph}
            patternUnits="userSpaceOnUse"
          >
            {/* Hex A — center column */}
            <polygon
              points={hexPoints(R, A, R - 1)}
              fill={`url(#${uid}-g1)`}
              stroke={p.stroke}
              strokeWidth="0.8"
              filter={`url(#${uid}-sh)`}
            />
            {/* Hex B — right edge (tiles left too) */}
            <polygon
              points={hexPoints(2.5 * R, 0, R - 1)}
              fill={`url(#${uid}-g2)`}
              stroke={p.stroke}
              strokeWidth="0.8"
              filter={`url(#${uid}-sh)`}
            />
            <polygon
              points={hexPoints(2.5 * R, ph, R - 1)}
              fill={`url(#${uid}-g2)`}
              stroke={p.stroke}
              strokeWidth="0.8"
              filter={`url(#${uid}-sh)`}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${uid}-pat)`} />
      </svg>
    </div>
  )
}
