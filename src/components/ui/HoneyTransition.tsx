'use client'

/**
 * HoneyTransition - Pure Hardcoded 4K Vector Liquid Honey Splash Transition.
 *
 *  - 100% Mathematical Vector Geometry (SVG): Infinite 4K/Retina sharpness, zero raster blur.
 *  - Authentic video splash shape: Dripping tongues, droplets, and contours traced directly
 *    from the source video footage via potrace subpixel vectorization.
 *  - Perfect round liquid bubbles: True SVG circles with specular glints; never stretched or gepeng.
 *  - 60-120 FPS GPU-accelerated: Driven directly by the browser's GPU Compositor Thread via
 *    hardware-accelerated translate3d transforms. Zero frame drops, zero stutter, zero lag.
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { OtbeeAvatar } from '@/components/mascot/otbee'
import { HONEY_INFLOW_PATH, HONEY_OUTFLOW_PATH, HONEY_BUBBLES } from './honeyPaths'

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

export const HoneyOverlay = forwardRef<HTMLDivElement, Props>(function HoneyOverlay(
  { isRouteLoaded = false, onScreenCovered, onComplete, engineRef },
  ref
) {
  const rootRef = useRef<HTMLDivElement>(null)
  const curtainRef = useRef<HTMLDivElement>(null)
  const routeRef = useRef(isRouteLoaded)
  const coveredRef = useRef(onScreenCovered)
  const doneRef = useRef(onComplete)

  const [phase, setPhase] = useState<'idle' | 'in' | 'hold' | 'out'>('idle')
  const [mascotOn, setMascotOn] = useState(false)
  const holdStartRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    routeRef.current = isRouteLoaded
    coveredRef.current = onScreenCovered
    doneRef.current = onComplete
  })

  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement)

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const stop = useCallback(() => {
    clearTimer()
    setPhase('idle')
    setMascotOn(false)

    const root = rootRef.current
    if (root) {
      root.style.visibility = 'hidden'
      root.style.opacity = '0'
    }

    const curtain = curtainRef.current
    if (curtain) {
      curtain.style.transition = 'none'
      curtain.style.transform = 'translate3d(0, -100%, 0)'
    }
  }, [])

  // Start transition: Honey flows down from top
  const start = useCallback(() => {
    clearTimer()
    const root = rootRef.current
    const curtain = curtainRef.current
    if (!root || !curtain) return

    // Show root overlay immediately
    root.style.visibility = 'visible'
    root.style.opacity = '1'

    // Reset initial position above viewport
    curtain.style.transition = 'none'
    curtain.style.transform = 'translate3d(0, -100%, 0)'

    // Force reflow
    void curtain.offsetHeight

    // Phase 1: Inflow (honey pours down smoothly onto screen)
    setPhase('in')
    setMascotOn(false)

    // Smooth viscous fluid inflow over 460ms on GPU
    curtain.style.transition = 'transform 480ms cubic-bezier(0.22, 1, 0.36, 1)'
    curtain.style.transform = 'translate3d(0, 0%, 0)'

    // When screen is covered (~450ms)
    timerRef.current = setTimeout(() => {
      setPhase('hold')
      setMascotOn(true)
      holdStartRef.current = Date.now()
      coveredRef.current?.()
    }, 450)
  }, [])

  // Trigger outflow (drain) once route is committed and min hold duration has elapsed
  useEffect(() => {
    if (phase !== 'hold' || !isRouteLoaded) return

    const elapsed = Date.now() - holdStartRef.current
    const remaining = Math.max(0, 180 - elapsed)

    const drainTimer = setTimeout(() => {
      setPhase('out')
      setMascotOn(false)

      const curtain = curtainRef.current
      if (!curtain) return

      // Fluid honey drain downwards off the bottom of the screen
      curtain.style.transition = 'transform 460ms cubic-bezier(0.38, 0, 0.72, 0.25)'
      curtain.style.transform = 'translate3d(0, 100%, 0)'

      timerRef.current = setTimeout(() => {
        stop()
        doneRef.current?.()
      }, 470)
    }, remaining)

    return () => clearTimeout(drainTimer)
  }, [phase, isRouteLoaded, stop])

  useImperativeHandle(engineRef, () => ({ start, reset: stop }), [start, stop])

  useEffect(() => () => clearTimer(), [])

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
        overflow: 'hidden',
      }}
    >
      {/* 4K Vector Liquid Honey Curtain */}
      <div
        ref={curtainRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          willChange: 'transform',
          transform: 'translate3d(0, -100%, 0)',
        }}
      >
        {/* Full-bleed solid honey body with floating liquid bubbles */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #b45309 0%, #d97706 30%, #f59e0b 70%, #d97706 100%)',
            boxShadow: 'inset 0 10px 40px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Circular bubbles (mathematical SVG vectors: 100% round, never gepeng) */}
          <svg
            viewBox="0 0 1280 720"
            preserveAspectRatio="xMidYMid slice"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <defs>
              <radialGradient id="bodyBubbleGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
                <stop offset="35%" stopColor="#fde68a" stopOpacity="0.4" />
                <stop offset="80%" stopColor="#d97706" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#78350f" stopOpacity="0.45" />
              </radialGradient>
            </defs>

            {HONEY_BUBBLES.map((b, idx) => {
              const hx = b.cx - b.r * 0.28
              const hy = b.cy - b.r * 0.28
              return (
                <g key={idx}>
                  {/* Bubble body */}
                  <circle
                    cx={b.cx}
                    cy={b.cy}
                    r={b.r}
                    fill="url(#bodyBubbleGrad)"
                    stroke="#92400e"
                    strokeWidth={1.5}
                    strokeOpacity={0.4}
                  />
                  {/* Specular curved glint */}
                  <ellipse
                    cx={hx}
                    cy={hy}
                    rx={b.r * 0.25}
                    ry={b.r * 0.14}
                    transform={`rotate(-35 ${hx} ${hy})`}
                    fill="#ffffff"
                    opacity={0.8}
                  />
                </g>
              )
            })}
          </svg>
        </div>

        {/* Leading edge: Authentic video-traced dripping tongues wave */}
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            height: '240px',
            marginTop: '-2px',
          }}
        >
          <svg
            viewBox="0 0 1280 720"
            preserveAspectRatio="none"
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              filter: 'drop-shadow(0 18px 24px rgba(120, 53, 15, 0.45))',
            }}
          >
            <defs>
              <linearGradient id="waveDripGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#b45309" />
                <stop offset="30%" stopColor="#d97706" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            <g transform="translate(0, 720) scale(0.1, -0.1)">
              <path
                d={HONEY_INFLOW_PATH}
                fill="url(#waveDripGrad)"
                stroke="#92400e"
                strokeWidth={16}
                strokeOpacity={0.4}
              />
              {/* Glossy specular white highlights along dripping tongues */}
              <path
                d="M 2850 600 C 2850 300 2950 150 3100 150 C 3180 150 3220 220 3150 240 C 3040 240 2980 380 2980 600 Z"
                fill="#ffffff"
                opacity={0.85}
              />
              <path
                d="M 5900 1800 C 5900 1500 5950 1350 6050 1350 C 6120 1350 6150 1420 6090 1430 C 6020 1430 5980 1550 5980 1800 Z"
                fill="#ffffff"
                opacity={0.75}
              />
              <path
                d="M 10350 1100 C 10350 850 10420 720 10520 720 C 10600 720 10620 780 10560 800 C 10480 800 10440 920 10440 1100 Z"
                fill="#ffffff"
                opacity={0.8}
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Center Mascot: Animated Otbee Honey Bee + Friendly Loading Quote */}
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
