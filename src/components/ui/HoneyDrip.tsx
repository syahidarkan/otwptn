'use client'

import { useEffect, useRef, useState } from 'react'

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

// SVG fallback drips (used when video not available)
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

const HONEY_GRADIENT =
  'linear-gradient(180deg,#92400e 0%,#b45309 8%,#d97706 18%,#f59e0b 42%,#fbbf24 68%,#fcd34d 86%,#fde68a 100%)'

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

interface HoneyFillProps { phase: 'entering' | 'holding' | 'exiting' }

// VIDEO_DRIP_HEIGHT: how tall the video drip area should be below the honey body
const VIDEO_DRIP_HEIGHT = 420  // px — taller than SVG drip, shows more of the video

export function HoneyFill({ phase }: HoneyFillProps) {
  const [cls, setCls] = useState('')
  const [videoOk, setVideoOk] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (phase === 'entering') {
      setCls('hf-enter')
      videoRef.current?.play().catch(() => null)
    } else if (phase === 'holding') {
      setCls('hf-hold')
    } else if (phase === 'exiting') {
      setCls('hf-exit')
      // Pause video when exiting so it doesn't glitch on next enter
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.pause()
          videoRef.current.currentTime = 0
        }
      }, 650)
    }
  }, [phase])

  const totalH = `calc(67vh + ${VIDEO_DRIP_HEIGHT}px)`

  return (
    <>
      {/*
        Honey body    = 0 → 67vh (solid amber CSS gradient)
        Drip area     = 67vh → 67vh+VIDEO_DRIP_HEIGHT
          - If honey-drip.mp4 exists: video with mix-blend-mode:multiply
            (white background → transparent, amber honey → visible drip shapes)
          - Fallback: SVG drip path

        mix-blend-mode: multiply explanation:
          white  (#fff)   × page-bg  = page-bg   → background disappears
          amber  (#f59e0b)× page-bg  = deeper amber → drips stay visible

        clip-path:
          enter: inset bottom 100→0  (honey flows in top-to-bottom)
          hold:  inset 0 0 0 0       (fully visible)
          exit:  inset top 0→100%    (page revealed top-first)
      */}
      <style>{`
        .hf-root{clip-path:inset(0 0 100% 0);}
        .hf-root.hf-enter{animation:hf-in 1.0s cubic-bezier(0.42,0,0.1,1) forwards;}
        .hf-root.hf-hold{clip-path:inset(0 0 0 0)!important;animation:none!important;}
        .hf-root.hf-exit{clip-path:inset(0 0 0 0);animation:hf-out 0.65s cubic-bezier(0.76,0,0.24,1) forwards;}
        @keyframes hf-in {from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 0 0)}}
        @keyframes hf-out{from{clip-path:inset(0 0 0 0)}to{clip-path:inset(100% 0 0 0)}}
      `}</style>

      <div
        aria-hidden="true"
        className={`hf-root${cls ? ' '+cls : ''}`}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: totalH,
          zIndex: 999997,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {/* Honey body: solid amber, covers top 67vh */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '67vh',
          background: HONEY_GRADIENT,
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: 'rgba(255,255,255,0.18)' }} />
        </div>

        {/* Drip area: video preferred, SVG fallback */}
        <div style={{
          position: 'absolute', top: '67vh', left: 0, right: 0,
          height: VIDEO_DRIP_HEIGHT,
          overflow: 'hidden',
        }}>
          {/* Real honey video — place file at /public/honey-drip.mp4 */}
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            onCanPlay={() => setVideoOk(true)}
            onError={() => setVideoOk(false)}
            style={{
              display: videoOk ? 'block' : 'none',
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              // mix-blend-mode: multiply → white bg becomes transparent, amber honey stays
              mixBlendMode: 'multiply',
            }}
          >
            <source src="/honey-drip.webm" type="video/webm" />
            <source src="/honey-drip.mp4"  type="video/mp4" />
          </video>

          {/* SVG fallback when video not loaded */}
          {!videoOk && (
            <svg
              viewBox="0 0 1200 220"
              preserveAspectRatio="none"
              width="100%" height={220}
              style={{ display: 'block' }}
            >
              <defs>
                <linearGradient id="hff-g" x1="0" y1={BRIDGE_H} x2="0" y2="220" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#fde68a" />
                  <stop offset="22%"  stopColor="#fbbf24" />
                  <stop offset="50%"  stopColor="#f59e0b" />
                  <stop offset="72%"  stopColor="#d97706" />
                  <stop offset="88%"  stopColor="#b45309" />
                  <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="1200" height={BRIDGE_H} fill="#fde68a" />
              <path d={FULL_BOTTOM_PATH} fill="url(#hff-g)" />
            </svg>
          )}
        </div>
      </div>
    </>
  )
}
