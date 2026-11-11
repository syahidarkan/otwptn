'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { HoneyOverlay } from '@/components/ui/HoneyDrip'

export default function GlobalPageLoader() {
  const router = useRouter()
  const pathname = usePathname()

  const elRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isRouteLoaded, setIsRouteLoaded] = useState(false)
  const isTransitioningRef = useRef(false)
  const hasCompletedRef = useRef(false)
  const startPathRef = useRef(pathname)
  const watchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleComplete() {
    if (!isTransitioningRef.current || hasCompletedRef.current) return
    hasCompletedRef.current = true

    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current)
      watchdogTimerRef.current = null
    }

    const el = elRef.current
    if (el) {
      el.style.opacity = '0'
    }

    // Clean reset after fade-out completes (220ms)
    setTimeout(() => {
      const overlay = elRef.current
      if (overlay) {
        overlay.style.visibility = 'hidden'
      }
      if (videoRef.current) {
        try {
          videoRef.current.pause()
          videoRef.current.playbackRate = 1.0
          videoRef.current.currentTime = 0
        } catch {}
      }
      setIsRouteLoaded(false)
      isTransitioningRef.current = false
      hasCompletedRef.current = false
    }, 220)
  }

  // When pathname changes to destination route, release peak hold to drain honey
  useEffect(() => {
    if (!isTransitioningRef.current || pathname === startPathRef.current) return
    setIsRouteLoaded(true)
  }, [pathname])

  function startTransition(href: string) {
    const el = elRef.current
    if (!el || isTransitioningRef.current) return

    isTransitioningRef.current = true
    hasCompletedRef.current = false
    startPathRef.current = pathname
    setIsRouteLoaded(false)

    // Show overlay immediately
    el.style.visibility = 'visible'
    el.style.opacity = '1'

    // Play video from 0
    if (videoRef.current) {
      try {
        videoRef.current.currentTime = 0
        videoRef.current.playbackRate = 1.0
        videoRef.current.play().catch(() => {})
      } catch {}
    }

    // Trigger router navigation immediately
    router.prefetch(href)
    router.push(href)

    // Watchdog safety timer: 12 seconds
    watchdogTimerRef.current = setTimeout(() => {
      if (isTransitioningRef.current) {
        handleComplete()
      }
    }, 12000)
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      // Strictly ignore any clicks while a transition is already in progress
      if (isTransitioningRef.current) return

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
      startTransition(`${url.pathname}${url.search}${url.hash}`)
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <HoneyOverlay
      ref={elRef}
      videoRef={videoRef}
      isRouteLoaded={isRouteLoaded}
      onComplete={handleComplete}
    />
  )
}
