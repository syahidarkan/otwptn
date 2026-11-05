'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

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

interface HoneyFillProps {
  phase: 'entering' | 'exiting'
  onComplete: () => void
  /** target seconds for exit animation; derived from actual load time */
  exitTarget?: number
}

const CANVAS_W = 1280
const CANVAS_H = 720


export function HoneyFill({ phase, onComplete, exitTarget }: HoneyFillProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = CANVAS_W
      canvasRef.current.height = CANVAS_H
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const startDrawing = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    const draw = () => {
      const vid = videoRef.current
      if (vid && vid.readyState >= 2) {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
        ctx.drawImage(vid, 0, 0, CANVAS_W, CANVAS_H)
        const imgData = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H)
        const d = imgData.data
        for (let i = 0; i < d.length; i += 4) {
          const b = d[i + 2]
          if (b > 150 && d[i] > 190 && d[i + 1] > 180) {
            d[i + 3] = Math.round(Math.max(0, 1 - (b - 150) / 105) * 255)
          }
        }
        ctx.putImageData(imgData, 0, 0)
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(draw)
  }, [])

  // Start / speed-up video based on phase
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return

    if (phase === 'entering') {
      vid.currentTime = 0
      vid.playbackRate = 1
      vid.play().then(startDrawing).catch(startDrawing)
    } else if (phase === 'exiting') {
      const remaining = (vid.duration || 10) - vid.currentTime
      if (remaining <= 0.05) { onCompleteRef.current(); return }
      // Speed up to finish in exitTarget seconds (matches actual load time, min 0.5s)
      const target = exitTarget ?? 0.8
      vid.playbackRate = Math.min(8, Math.max(1, remaining / target))
    }
  }, [phase, startDrawing, exitTarget])

  // When video ends → signal parent to unmount
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    const handleEnded = () => { cancelAnimationFrame(rafRef.current); onCompleteRef.current() }
    vid.addEventListener('ended', handleEnded)
    return () => vid.removeEventListener('ended', handleEnded)
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0,
        zIndex: 999997,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <video
        ref={videoRef}
        muted playsInline preload="auto"
        style={{ display: 'none' }}
      >
        <source src="/honey-fill.webm" type="video/webm" />
        <source src="/honey-splash.mp4" type="video/mp4" />
      </video>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
    </div>
  )
}
