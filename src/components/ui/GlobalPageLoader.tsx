'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { HoneyOverlay, type HoneyHandle } from '@/components/ui/HoneyTransition'
import { otbeeBrain } from '@/components/mascot/otbee/brain'

export default function GlobalPageLoader() {
  const router = useRouter()
  const pathname = usePathname()

  const elRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<HoneyHandle>(null)
  const [isRouteLoaded, setIsRouteLoaded] = useState(false)
  const isTransitioningRef = useRef(false)
  const hasCompletedRef = useRef(false)
  const cooldownRef = useRef(false)
  const startUrlRef = useRef('')
  const watchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const drainFailsafeRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearAllTimers = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current)
      watchdogTimerRef.current = null
    }
    if (drainFailsafeRef.current) {
      clearTimeout(drainFailsafeRef.current)
      drainFailsafeRef.current = null
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }, [])

  const handleComplete = useCallback(() => {
    if (!isTransitioningRef.current || hasCompletedRef.current) return
    hasCompletedRef.current = true
    clearAllTimers()

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
      engineRef.current?.reset()
      setIsRouteLoaded(false)
      isTransitioningRef.current = false
      hasCompletedRef.current = false
      otbeeBrain.emit({ type: 'nav-end' })
      // Enforce 400ms cooldown so animations never double-trigger
      cooldownRef.current = true
      setTimeout(() => {
        cooldownRef.current = false
      }, 400)
    }, 220)
  }, [clearAllTimers])

  const markRouteCommitted = useCallback(() => {
    if (!isTransitioningRef.current) return
    setIsRouteLoaded(true)
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    // Once route commits the honey drains (~1s).
    // Failsafe ensures the overlay NEVER stays frozen if a browser throttles video resume.
    if (!drainFailsafeRef.current) {
      drainFailsafeRef.current = setTimeout(() => {
        handleComplete()
      }, 1500)
    }
  }, [handleComplete])

  // Detect pathname changes via Next.js hook
  useEffect(() => {
    if (!isTransitioningRef.current) return
    const currentFull = typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}`
      : pathname
    if (currentFull !== startUrlRef.current) {
      markRouteCommitted()
    }
  }, [pathname, markRouteCommitted])

  const startTransition = useCallback((href: string) => {
    const el = elRef.current
    if (!el || isTransitioningRef.current || cooldownRef.current) return

    clearAllTimers()
    isTransitioningRef.current = true
    hasCompletedRef.current = false
    startUrlRef.current = `${window.location.pathname}${window.location.search}`
    setIsRouteLoaded(false)

    // Show overlay immediately
    el.style.visibility = 'visible'
    el.style.opacity = '1'

    engineRef.current?.start()
    otbeeBrain.emit({ type: 'nav-start' })

    // Trigger router navigation immediately
    router.prefetch(href)
    router.push(href)

    // Poll full URL (pathname + search) every 80ms so query-param or fast navigations never hang
    pollIntervalRef.current = setInterval(() => {
      if (!isTransitioningRef.current) return
      const nowFull = `${window.location.pathname}${window.location.search}`
      if (nowFull !== startUrlRef.current) {
        markRouteCommitted()
      }
    }, 80)

    // Hard safety cap (4.5s) so overlay never freezes on top of UI under any condition
    watchdogTimerRef.current = setTimeout(() => {
      if (isTransitioningRef.current) {
        handleComplete()
      }
    }, 4500)
  }, [clearAllTimers, handleComplete, markRouteCommitted, router])

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
    return () => {
      document.removeEventListener('click', onClick, true)
      clearAllTimers()
    }
  }, [startTransition, clearAllTimers])

  return (
    <HoneyOverlay
      ref={elRef}
      engineRef={engineRef}
      isRouteLoaded={isRouteLoaded}
      onComplete={handleComplete}
    />
  )
}
