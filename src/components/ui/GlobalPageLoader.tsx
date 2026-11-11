'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { HoneyOverlay } from '@/components/ui/HoneyDrip'

type Phase = 'idle' | 'covering' | 'waiting' | 'revealing'

// Maximum safety ceiling for a transition so overlay never hangs the UI forever
const HARD_CAP_MS = 15000

export default function GlobalPageLoader() {
  const router = useRouter()
  const pathname = usePathname()

  const elRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const phaseRef = useRef<Phase>('idle')
  const pendingHrefRef = useRef<string | null>(null)
  const startPathRef = useRef(pathname)
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname
  const routeLoadedRef = useRef(false)
  const isHoldingAtPeakRef = useRef(false)
  const hasRevealedRef = useRef(false)
  const capTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function finish() {
    if (capTimerRef.current) clearTimeout(capTimerRef.current)
    capTimerRef.current = null
    pendingHrefRef.current = null
    routeLoadedRef.current = false
    isHoldingAtPeakRef.current = false
    hasRevealedRef.current = false
    const el = elRef.current
    if (el) {
      el.style.visibility = 'hidden'
      el.style.opacity = '0'
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause()
        videoRef.current.playbackRate = 1.0
        // Set to 0 after visibility is hidden so seeked event never flashes frame 0
        videoRef.current.currentTime = 0
      } catch {}
    }
    phaseRef.current = 'idle'
  }

  function reveal() {
    const el = elRef.current
    if (!el || phaseRef.current === 'revealing' || phaseRef.current === 'idle' || hasRevealedRef.current) return
    hasRevealedRef.current = true
    phaseRef.current = 'revealing'
    el.style.opacity = '0'
    setTimeout(finish, 220)
  }

  // When the new route commits, flag route as loaded and resume honey drain
  useEffect(() => {
    if (phaseRef.current === 'idle' || pathname === startPathRef.current || hasRevealedRef.current) return
    routeLoadedRef.current = true

    const video = videoRef.current
    if (video) {
      // If the animation already completed its drain or is past 2.40s, reveal immediately!
      if (video.ended || video.currentTime >= 2.40) {
        reveal()
        return
      }

      // Resume draining off the bottom of the screen at smooth 1.25x speed
      isHoldingAtPeakRef.current = false
      video.playbackRate = 1.25
      try {
        video.play().catch(() => {})
      } catch {}
    }
  }, [pathname])

  function handleTimeUpdate(time: number) {
    const video = videoRef.current
    if (!video || hasRevealedRef.current || phaseRef.current === 'idle') return

    // Route is still loading in background:
    if (!routeLoadedRef.current) {
      if (time >= 0.85 && time < 1.10) {
        video.playbackRate = 0.60
      } else if (time >= 1.10 && time < 1.30) {
        video.playbackRate = 0.25
      } else if (time >= 1.30) {
        // Hold frame seamlessly right at peak honey coverage (>99.8% coverage)
        // Keep video paused at 1.30s until routeLoadedRef becomes true
        if (!isHoldingAtPeakRef.current || !video.paused) {
          isHoldingAtPeakRef.current = true
          try {
            video.pause()
            video.currentTime = 1.30
          } catch {}
        }
        return
      }
    }

    // Once route has loaded AND honey has drained down (>2.40s), reveal new page
    if (routeLoadedRef.current && (time >= 2.40 || video.ended)) {
      reveal()
    }
  }

  function handleEnded() {
    const video = videoRef.current
    if (!video || hasRevealedRef.current) return

    // If route has loaded, reveal immediately. Never replay!
    if (routeLoadedRef.current) {
      reveal()
    } else {
      try {
        video.pause()
        video.currentTime = 1.30
      } catch {}
    }
  }

  function cover(href: string) {
    const el = elRef.current
    if (!el) return false

    // If already in transition, do not restart
    if (phaseRef.current !== 'idle') return false

    pendingHrefRef.current = href
    startPathRef.current = pathnameRef.current
    routeLoadedRef.current = false
    isHoldingAtPeakRef.current = false
    hasRevealedRef.current = false
    phaseRef.current = 'waiting'

    // Show overlay immediately on click so honey drips in front of current page
    el.style.visibility = 'visible'
    el.style.opacity = '1'

    if (videoRef.current) {
      try {
        videoRef.current.currentTime = 0
        videoRef.current.playbackRate = 1.0
        videoRef.current.play().catch(() => {})
      } catch {}
    }

    // Trigger Next.js navigation immediately without artificial delays
    router.prefetch(href)
    router.push(href)

    // Safety watchdog: never leave the overlay visible longer than HARD_CAP_MS
    capTimerRef.current = setTimeout(() => {
      if (phaseRef.current === 'idle') return
      reveal()
    }, HARD_CAP_MS)
    return true
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      // If transition already running, ignore additional clicks to prevent double execution
      if (phaseRef.current !== 'idle') return

      const a = (e.target as HTMLElement | null)?.closest?.('a')
      if (!a) return
      const href = a.getAttribute('href')
      if (!href) return
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        a.getAttribute('target') === '_blank' ||
        a.getAttribute('download') !== null
      ) return

      let url: URL
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      const cur = window.location
      if (url.pathname === cur.pathname && url.search === cur.search) return

      e.preventDefault()
      e.stopPropagation()
      cover(`${url.pathname}${url.search}${url.hash}`)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <HoneyOverlay
      ref={elRef}
      videoRef={videoRef}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
    />
  )
}
