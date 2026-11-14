'use client'

/**
 * HoneyTransition - Authentic High-Definition Video Transition Engine.
 *
 *  - 100% Authentic Animation: Plays the true honey splash footage directly from
 *    the source video asset without any artificial or generated approximations.
 *  - Zero Gepeng / Distortion: Uses CSS `object-fit: cover` with centered placement
 *    to preserve strict aspect ratio geometry across any screen size. Circles remain
 *    flawlessly circular.
 *  - Native Hardware Acceleration: Decoded and composited directly by the browser's
 *    GPU video pipeline (Apple VideoToolbox / Chromium VP9). Zero main-thread overhead,
 *    zero canvas frame-dropping, zero lag or freezing during route hydration.
 *  - Dual Native Alpha Codecs:
 *    * Safari (macOS / iOS): HEVC Apple VideoToolbox with alpha channel (`hvc1`).
 *    * Chrome / Firefox: VP9 with alpha channel (`yuva420p` / `alpha_mode=1`).
 *    * Universal fallback: Standard MP4.
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

// Key frame timestamps (78 frames @ 30fps = 2.6s total):
// Inflow: 0.0s -> ~1.26s (Frame 38: honey covers 100% of the screen)
// Hold: ~1.26s -> 1.32s (screen fully opaque with honey)
// Drain: 1.33s -> 2.60s (honey drains down and reveals new route)
const COVER_TIME = 1.26
const DRAIN_START = 1.32

export const HoneyOverlay = forwardRef<HTMLDivElement, Props>(function HoneyOverlay(
  { isRouteLoaded = false, onScreenCovered, onComplete, engineRef },
  ref
) {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const routeRef = useRef(isRouteLoaded)
  const coveredRef = useRef(onScreenCovered)
  const doneRef = useRef(onComplete)

  const [mascotVisible, setMascotVisible] = useState(false)
  const coveredFiredRef = useRef(false)
  const completedFiredRef = useRef(false)
  const isHoldingRef = useRef(false)
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    routeRef.current = isRouteLoaded
    coveredRef.current = onScreenCovered
    doneRef.current = onComplete
  })

  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement)

  const clearFallbackTimer = () => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
  }

  // When route finishes loading, resume video to complete the drain phase
  useEffect(() => {
    if (!isRouteLoaded) return
    const video = videoRef.current
    if (!video) return

    if (isHoldingRef.current) {
      isHoldingRef.current = false
      setMascotVisible(false)
      video.playbackRate = 1.15
      video.play().catch(() => {})
    }
  }, [isRouteLoaded])

  const stop = useCallback(() => {
    clearFallbackTimer()
    coveredFiredRef.current = false
    completedFiredRef.current = false
    isHoldingRef.current = false
    setMascotVisible(false)

    const root = rootRef.current
    if (root) {
      root.style.visibility = 'hidden'
      root.style.opacity = '0'
    }

    const video = videoRef.current
    if (video) {
      try {
        video.pause()
        video.currentTime = 0
      } catch {}
    }
  }, [])

  const start = useCallback(() => {
    clearFallbackTimer()
    coveredFiredRef.current = false
    completedFiredRef.current = false
    isHoldingRef.current = false
    setMascotVisible(false)

    const root = rootRef.current
    const video = videoRef.current
    if (!root || !video) return

    root.style.visibility = 'visible'
    root.style.opacity = '1'

    video.currentTime = 0
    video.playbackRate = 1.0

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy or media error fallback: guarantee navigation proceeds
        coveredRef.current?.()
        fallbackTimerRef.current = setTimeout(() => {
          doneRef.current?.()
        }, 1200)
      })
    }
  }, [])

  useImperativeHandle(engineRef, () => ({
    start,
    reset: stop,
  }), [start, stop])

  // Handle continuous video time updates for frame-accurate transitions
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const t = video.currentTime

    // 1. Screen is covered: fire router.push behind the honey
    if (!coveredFiredRef.current && t >= COVER_TIME) {
      coveredFiredRef.current = true
      coveredRef.current?.()
    }

    // 2. Hold at peak honey if destination route hasn't loaded yet
    if (!routeRef.current && t >= DRAIN_START && !isHoldingRef.current) {
      isHoldingRef.current = true
      video.pause()
      setMascotVisible(true)
      return
    }

    // 3. Video completed drain
    if (t >= 2.50 && !completedFiredRef.current) {
      completedFiredRef.current = true
      doneRef.current?.()
    }
  }, [])

  const handleEnded = useCallback(() => {
    if (!completedFiredRef.current) {
      completedFiredRef.current = true
      doneRef.current?.()
    }
  }, [])

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647,
        pointerEvents: 'none',
        userSelect: 'none',
        visibility: 'hidden',
        opacity: 0,
        transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Native Hardware-Accelerated Video Player */}
      <video
        ref={videoRef}
        playsInline
        muted
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block',
          pointerEvents: 'none',
        }}
      >
        {/* Safari (macOS / iOS) native transparent HEVC */}
        <source src="/honey-transition.mov" type='video/quicktime; codecs="hvc1"' />
        <source src="/honey-transition.mp4" type='video/mp4; codecs="hvc1"' />
        {/* Chromium / Firefox native transparent VP9 */}
        <source src="/honey-transition.webm" type='video/webm; codecs="vp9"' />
        {/* Universal Fallback */}
        <source src="/honey-fast.mp4" type="video/mp4" />
      </video>

      {/* Floating Otbee Mascot when page load takes a moment */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none transition-opacity duration-300"
        style={{
          opacity: mascotVisible ? 1 : 0,
          transform: mascotVisible ? 'scale(1)' : 'scale(0.92)',
          transition: 'opacity 250ms ease-out, transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div className="relative flex flex-col items-center animate-bounce">
          <OtbeeAvatar size={92} action="fly" />
          <div className="mt-3 px-4 py-2 rounded-full bg-white/95 shadow-xl border border-amber-200/80 backdrop-blur-md">
            <p className="text-sm font-bold text-amber-950 flex items-center gap-1.5 whitespace-nowrap">
              <span>Sebentar ya, Otbee siapin halamannya...</span>
              <span>🍯✨</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})
