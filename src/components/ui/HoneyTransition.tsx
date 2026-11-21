'use client'

/**
 * HoneyTransition - Authentic High-Definition Video Transition Engine (Desktop)
 * and Focused Glassmorphic Otbee Loading Screen (Mobile).
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { OtbeeAvatar, Otbee4KPuppet } from '@/components/mascot/otbee'

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

// Key frame timestamps for Desktop video
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
  const mobileHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    routeRef.current = isRouteLoaded
    coveredRef.current = onScreenCovered
    doneRef.current = onComplete
  })

  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement)

  const clearTimers = () => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
    if (mobileHoldTimerRef.current) {
      clearTimeout(mobileHoldTimerRef.current)
      mobileHoldTimerRef.current = null
    }
  }

  // When route finishes loading
  useEffect(() => {
    if (!isRouteLoaded) return

    const isMobileNow = typeof window !== 'undefined' && (window.matchMedia('(max-width: 767px)').matches || window.innerWidth < 768)

    if (isMobileNow) {
      // Mobile: smooth hold for 260ms then dismiss cleanly
      if (!mobileHoldTimerRef.current && !completedFiredRef.current) {
        mobileHoldTimerRef.current = setTimeout(() => {
          completedFiredRef.current = true
          doneRef.current?.()
        }, 260)
      }
      return
    }

    // Desktop: resume video to complete the drain phase
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
    clearTimers()
    isHoldingRef.current = false
    coveredFiredRef.current = false
    completedFiredRef.current = false
    setMascotVisible(false)

    const video = videoRef.current
    if (video) {
      video.pause()
      video.currentTime = 0
    }

    const root = rootRef.current
    if (root) {
      root.style.opacity = '0'
      root.style.visibility = 'hidden'
    }
  }, [])

  const start = useCallback(() => {
    clearTimers()
    isHoldingRef.current = false
    coveredFiredRef.current = false
    completedFiredRef.current = false
    setMascotVisible(false)

    const root = rootRef.current
    if (!root) return

    root.style.visibility = 'visible'
    root.style.opacity = '1'

    const isMobileNow = typeof window !== 'undefined' && (window.matchMedia('(max-width: 767px)').matches || window.innerWidth < 768)

    if (isMobileNow) {
      // Mobile mode: instantaneous route navigation with sleek top loading bar
      setTimeout(() => {
        if (!coveredFiredRef.current) {
          coveredFiredRef.current = true
          coveredRef.current?.()
        }
      }, 40)

      // Safety timeout
      fallbackTimerRef.current = setTimeout(() => {
        if (!completedFiredRef.current) {
          completedFiredRef.current = true
          doneRef.current?.()
        }
      }, 3500)
      return
    }

    // Desktop mode: transparent video playback
    const video = videoRef.current
    if (!video) return

    video.currentTime = 0
    video.playbackRate = 1.0

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
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
  }))

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
      className="honey-overlay-container"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647,
        pointerEvents: 'none',
        userSelect: 'none',
        visibility: 'hidden',
        opacity: 0,
        transition: 'opacity 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @media (max-width: 767px) {
          .honey-overlay-container {
            background-color: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
          .honey-desktop-layer {
            display: none !important;
          }
          .honey-mobile-layer {
            display: block !important;
          }
        }
        @media (min-width: 768px) {
          .honey-overlay-container {
            background-color: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
          .honey-desktop-layer {
            display: block !important;
          }
          .honey-mobile-layer {
            display: none !important;
          }
        }
      `}</style>

      {/* 1. Mobile Experience: Sleek Top Loading Line in OtwPTN Yellow (No dark blur, no blocking animations) */}
      <div className="honey-mobile-layer fixed top-0 left-0 right-0 h-[3.5px] z-[9999999] pointer-events-none overflow-hidden bg-transparent">
        <div className="w-full h-full relative">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_14px_rgba(245,158,11,1)]"
            style={{
              width: isRouteLoaded ? '100%' : '75%',
              transition: isRouteLoaded
                ? 'width 180ms ease-out'
                : 'width 600ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>

      {/* 2. Desktop Experience: Authentic Transparent Honey Splash Video */}
      <div className="honey-desktop-layer absolute inset-0">
        <video
          ref={videoRef}
          playsInline
          muted
          preload="metadata"
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
          <source src="/honey-transition.mov" type='video/quicktime; codecs="hvc1"' />
          <source src="/honey-transition.mp4" type='video/mp4; codecs="hvc1"' />
          <source src="/honey-transition.webm" type='video/webm; codecs="vp9"' />
          <source src="/honey-fast.mp4" type="video/mp4" />
        </video>

        {/* Floating Otbee Mascot when page load takes a moment on Desktop */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none transition-opacity duration-300"
          style={{
            opacity: mascotVisible ? 1 : 0,
            transform: mascotVisible ? 'scale(1)' : 'scale(0.92)',
            transition: 'opacity 250ms ease-out, transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div
            className="relative flex flex-col items-center animate-bounce"
            style={{ width: 92, minWidth: 92, maxWidth: 92 }}
          >
            <OtbeeAvatar
              size={92}
              action="fly"
              followPointer={true}
              style={{ width: 92, height: 92, maxWidth: 92, maxHeight: 92, flexShrink: 0 }}
            />
            <div className="mt-3 px-4 py-2 rounded-full bg-white/95 shadow-xl border border-amber-200/80 backdrop-blur-md">
              <p className="text-sm font-bold text-amber-950 flex items-center gap-1.5 whitespace-nowrap">
                <span>Sebentar ya, Otbee siapin halamannya...</span>
                <span>🍯✨</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
