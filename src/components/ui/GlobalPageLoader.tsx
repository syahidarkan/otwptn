'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { HoneyOverlay } from '@/components/ui/HoneyDrip'

type Phase = 'idle' | 'covering' | 'waiting' | 'revealing'

// Maximum ceiling for a whole transition so the overlay can never hang the UI.
const HARD_CAP_MS = 5000

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
    setTimeout(finish, 260)
  }

  // When the new route commits underneath, flag route as loaded.
  useEffect(() => {
    if (phaseRef.current === 'idle' || pathname === startPathRef.current || hasRevealedRef.current) return
    routeLoadedRef.current = true

    const video = videoRef.current
    if (video) {
      // If the animation already completed its drain or is past 2.30s, reveal immediately!
      if (video.ended || video.currentTime >= 2.30) {
        reveal()
        return
      }

      // If video was holding or slowed down waiting for route, accelerate to drain speed (1.15x)
      video.playbackRate = 1.15
      if (isHoldingAtPeakRef.current || video.paused) {
        isHoldingAtPeakRef.current = false
        try {
          video.play().catch(() => {})
        } catch {}
      }
    }
  }, [pathname])

  function handleTimeUpdate(time: number) {
    const video = videoRef.current
    if (!video || hasRevealedRef.current || phaseRef.current === 'idle') return

    // Adaptive speed: If the route is still loading in the background
    if (!routeLoadedRef.current) {
      // Smoothly ramp down speed as honey approaches 100% full coverage
      if (time >= 0.85 && time < 1.05) {
        video.playbackRate = 0.55
      } else if (time >= 1.05 && time < 1.24) {
        video.playbackRate = 0.22
      } else if (time >= 1.24) {
        // Hold frame seamlessly right at peak honey coverage (>99% coverage)
        if (!isHoldingAtPeakRef.current) {
          isHoldingAtPeakRef.current = true
          try {
            video.pause()
          } catch {}
        }
        return
      }
    }

    // Only reveal when the route has loaded AND the honey has drained down
    if (time >= 2.40 && routeLoadedRef.current) {
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
      } catch {}
    }
  }

  function startNav() {
    const href = pendingHrefRef.current
    if (!href) return
    router.push(href)
  }

  function cover(href: string) {
    const el = elRef.current
    if (!el) return false
    pendingHrefRef.current = href
    if (phaseRef.current !== 'idle') {
      if (phaseRef.current === 'waiting') startNav()
      return true
    }
    startPathRef.current = pathnameRef.current
    routeLoadedRef.current = false
    isHoldingAtPeakRef.current = false
    hasRevealedRef.current = false
    phaseRef.current = 'covering'

    // Prefetch immediately so Next.js starts fetching the route bundle right away
    router.prefetch(href)

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

    phaseRef.current = 'waiting'

    // Call startNav at 400ms (when honey has started covering >50% of the screen).
    // Because router.prefetch was called at t=0, Next.js commits the transition around 800-1100ms,
    // right when honey is at 90-98% coverage!
    setTimeout(() => {
      if (phaseRef.current === 'waiting') {
        startNav()
      }
    }, 400)

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
