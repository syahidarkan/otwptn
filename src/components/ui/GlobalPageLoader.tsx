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
  const capTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function finish() {
    if (capTimerRef.current) clearTimeout(capTimerRef.current)
    capTimerRef.current = null
    pendingHrefRef.current = null
    routeLoadedRef.current = false
    isHoldingAtPeakRef.current = false
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
    if (!el || phaseRef.current === 'revealing' || phaseRef.current === 'idle') return
    phaseRef.current = 'revealing'
    el.style.opacity = '0'
    setTimeout(finish, 260)
  }

  // When the new route commits underneath, flag route as loaded.
  useEffect(() => {
    if (phaseRef.current === 'idle' || pathname === startPathRef.current) return
    routeLoadedRef.current = true

    const video = videoRef.current
    if (video) {
      // If the video was held at peak coverage waiting for the page, resume immediately!
      if (isHoldingAtPeakRef.current || video.paused) {
        isHoldingAtPeakRef.current = false
        try {
          video.play().catch(() => {})
        } catch {}
      }
      // If video already completed its animation, reveal now!
      if (video.ended || video.currentTime >= 2.45) {
        reveal()
      }
    }
  }, [pathname])

  function handleTimeUpdate(time: number) {
    const video = videoRef.current
    if (!video) return

    // Peak coverage window is 1.18s - 1.35s (honey covers >98% of the screen).
    // If the route has NOT loaded yet, hold/pause at peak honey so the user stays covered!
    if (time >= 1.20 && time < 1.35 && !routeLoadedRef.current) {
      if (!isHoldingAtPeakRef.current) {
        isHoldingAtPeakRef.current = true
        try {
          video.pause()
        } catch {}
      }
      return
    }

    // Only reveal when the route has ACTUALLY loaded AND the video has finished draining!
    if (time >= 2.45 && routeLoadedRef.current) {
      reveal()
    }
  }

  function handleEnded() {
    const video = videoRef.current
    if (!video) return

    // If route has loaded, reveal immediately
    if (routeLoadedRef.current) {
      reveal()
    } else {
      // If video reached the end but route is still processing, pause on the last frame
      // until pathname updates
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
