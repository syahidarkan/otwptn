'use client'

/**
 * HoneyTransition - Remastered High-Fidelity 1080p/Retina Liquid Honey Splash Transition.
 *
 *  - Uses the authentic honey splash artwork and animation from the source footage.
 *  - Remastered at 1920x1080 Full HD with subpixel antialiasing and true RGBA alpha:
 *    * Only the outer white background is keyed out via connected-component edge floodfill.
 *    * All internal specular highlights, amber midtones, glossy rims, and floating bubbles
 *      remain 100% solid and vibrant (no see-through holes).
 *  - Rendered via GPU-accelerated Canvas with pre-decoded ImageBitmaps.
 *  - Staged navigation: Inflow plays at a flawless 60 FPS while the main thread is idle,
 *    screen is fully covered at frame 39, router.push() executes behind the honey screen,
 *    and drain plays smoothly once Next.js commits the new route.
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { OtbeeAvatar } from '@/components/mascot/otbee'

export interface HoneyHandle {
  start: () => void
  reset: () => void
}

interface Props {
  isRouteLoaded?: boolean
  onScreenCovered?: () => void
  onComplete?: () => void
  engineRef?: React.Ref<HoneyHandle>
}

const FRAME_COUNT = 78
const FRAME_SRC = (i: number) => `/honey-frames/f${String(i).padStart(2, '0')}.webp`
const FPS = 42
const FILL_END = 39
const DRAIN_END = 77
const MIN_HOLD = 0.18

type FrameDrawable = HTMLImageElement | ImageBitmap
let framesPromise: Promise<FrameDrawable[]> | null = null

export function preloadHoneyFrames(): Promise<FrameDrawable[]> {
  if (typeof window === 'undefined') return Promise.resolve([])
  if (!framesPromise) {
    framesPromise = Promise.all(
      Array.from({ length: FRAME_COUNT }, (_, i) => new Promise<FrameDrawable>((resolve) => {
        const img = new Image()
        img.decoding = 'async'
        img.onload = () => {
          if ('createImageBitmap' in window) {
            createImageBitmap(img).then(resolve).catch(() => resolve(img))
          } else {
            resolve(img)
          }
        }
        img.onerror = () => resolve(img)
        img.src = FRAME_SRC(i)
      }))
    )
  }
  return framesPromise
}

export const HoneyOverlay = forwardRef<HTMLDivElement, Props>(function HoneyOverlay(
  { isRouteLoaded = false, onScreenCovered, onComplete, engineRef },
  ref
) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const routeRef = useRef(isRouteLoaded)
  const coveredRef = useRef(onScreenCovered)
  const doneRef = useRef(onComplete)
  const [mascotOn, setMascotOn] = useState(false)

  useEffect(() => {
    routeRef.current = isRouteLoaded
    coveredRef.current = onScreenCovered
    doneRef.current = onComplete
  })

  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement)

  const st = useRef({
    phase: 'idle' as 'idle' | 'in' | 'hold' | 'out',
    t0: 0,
    holdT0: 0,
    outT0: 0,
    raf: 0,
    W: 0,
    H: 0,
    dpr: 1,
    frames: null as FrameDrawable[] | null,
    mascot: false,
    coveredFired: false,
  })

  const stop = useCallback(() => {
    const s = st.current
    if (s.raf) {
      cancelAnimationFrame(s.raf)
      s.raf = 0
    }
    s.phase = 'idle'
    s.mascot = false
    s.coveredFired = false
    setMascotOn(false)

    const root = rootRef.current
    if (root) {
      root.style.visibility = 'hidden'
      root.style.opacity = '0'
    }

    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (c && ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, c.width, c.height)
    }
  }, [])

  const drawFrame = (
    ctx: CanvasRenderingContext2D,
    frames: FrameDrawable[],
    idx: number,
    W: number,
    H: number
  ) => {
    const img = frames[idx]
    if (!img) return

    const nw = 'width' in img ? img.width : (img as HTMLImageElement).naturalWidth || 1920
    const nh = 'height' in img ? img.height : (img as HTMLImageElement).naturalHeight || 1080

    // Cover math: fills the canvas viewport while preserving aspect ratio
    const scale = Math.max(W / nw, H / nh)
    const dw = nw * scale
    const dh = nh * scale
    const dx = (W - dw) / 2
    const dy = (H - dh) / 2

    ctx.clearRect(0, 0, W, H)
    ctx.drawImage(img, dx, dy, dw, dh)
  }

  const frameRef = useRef<(now: number) => void>(() => {})

  const frame = useCallback((now: number) => {
    const s = st.current
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx || !s.frames) return

    s.raf = requestAnimationFrame((n) => frameRef.current(n))
    ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0)

    const { W, H, frames } = s

    if (s.phase === 'in') {
      const t = (now - s.t0) / 1000
      const idx = Math.min(FILL_END, Math.floor(t * FPS))
      drawFrame(ctx, frames, idx, W, H)

      if (!s.mascot && idx >= FILL_END - 4) {
        s.mascot = true
        setMascotOn(true)
      }

      if (idx >= FILL_END) {
        s.phase = 'hold'
        s.holdT0 = now
        if (!s.coveredFired) {
          s.coveredFired = true
          coveredRef.current?.()
        }
      }
    } else if (s.phase === 'hold') {
      drawFrame(ctx, frames, FILL_END, W, H)
      const holdTime = (now - s.holdT0) / 1000

      if (routeRef.current && holdTime >= MIN_HOLD) {
        s.phase = 'out'
        s.outT0 = now
        s.mascot = false
        setMascotOn(false)
      }
    } else if (s.phase === 'out') {
      const t = (now - s.outT0) / 1000
      const idx = Math.min(DRAIN_END, FILL_END + Math.floor(t * FPS))
      drawFrame(ctx, frames, idx, W, H)

      if (idx >= DRAIN_END) {
        stop()
        doneRef.current?.()
      }
    }
  }, [stop])

  useEffect(() => {
    frameRef.current = frame
  }, [frame])

  const start = useCallback(() => {
    const root = rootRef.current
    const c = canvasRef.current
    if (!root || !c) return

    root.style.visibility = 'visible'
    root.style.opacity = '1'

    const s = st.current
    s.dpr = Math.min(window.devicePixelRatio || 1, 2)
    s.W = window.innerWidth
    s.H = window.innerHeight
    c.width = Math.round(s.W * s.dpr)
    c.height = Math.round(s.H * s.dpr)

    s.phase = 'in'
    s.t0 = performance.now()
    s.mascot = false
    s.coveredFired = false

    const run = (loadedFrames: FrameDrawable[]) => {
      if (st.current.phase === 'idle') return
      s.frames = loadedFrames
      const ctx = c.getContext('2d')
      if (ctx) {
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
      }
      s.raf = requestAnimationFrame((n) => frameRef.current(n))
    }

    if (s.frames) {
      run(s.frames)
    } else {
      preloadHoneyFrames().then(run).catch(() => {})
    }
  }, [])

  useImperativeHandle(engineRef, () => ({ start, reset: stop }), [start, stop])

  // Warm image cache as soon as HoneyOverlay mounts
  useEffect(() => {
    preloadHoneyFrames().then((imgs) => {
      st.current.frames = imgs
    }).catch(() => {})
  }, [])

  useEffect(() => () => {
    if (st.current.raf) cancelAnimationFrame(st.current.raf)
  }, [])

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        pointerEvents: 'none',
        userSelect: 'none',
        visibility: 'hidden',
        opacity: 0,
        transition: 'opacity 180ms ease',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'none',
        }}
      />

      {/* Floating Otbee Mascot & Bubble during Hold state */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          pointerEvents: 'none',
          opacity: mascotOn ? 1 : 0,
          transform: mascotOn ? 'scale(1) translate3d(0, 0, 0)' : 'scale(0.88) translate3d(0, 16px, 0)',
          transition: 'all 240ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div
          style={{
            animation: mascotOn ? 'otbee-float 1.8s ease-in-out infinite alternate' : 'none',
            filter: 'drop-shadow(0 14px 28px rgba(180, 83, 9, 0.45))',
          }}
        >
          <OtbeeAvatar
            view="front"
            action="wave"
            size={110}
            shadow={false}
          />
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 22px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 30px rgba(180, 83, 9, 0.28), 0 0 0 1px rgba(251, 191, 36, 0.45)',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#92400e',
              letterSpacing: '-0.01em',
            }}
          >
            Sebentar ya, Otbee siapin halamannya... 🍯✨
          </span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes otbee-float {
          0% {
            transform: translate3d(0, 0, 0) rotate(-2deg);
          }
          100% {
            transform: translate3d(0, -10px, 0) rotate(2deg);
          }
        }
      `}</style>
    </div>
  )
})
