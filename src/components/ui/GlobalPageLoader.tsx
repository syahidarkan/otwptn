'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { HoneyOverlay, HoneyOverlayHandle } from '@/components/ui/HoneyDrip'

export default function GlobalPageLoader() {
  const router   = useRouter()
  const pathname = usePathname()

  const overlayRef         = useRef<HoneyOverlayHandle>(null)
  const isTransitioningRef = useRef(false)
  const hasCompletedRef    = useRef(false)
  const startUrlRef        = useRef('')
  const watchdogTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const drainFailsafeRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollIntervalRef    = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearAllTimers = useCallback(() => {
    if (watchdogTimerRef.current)  { clearTimeout(watchdogTimerRef.current);   watchdogTimerRef.current  = null }
    if (drainFailsafeRef.current)  { clearTimeout(drainFailsafeRef.current);   drainFailsafeRef.current  = null }
    if (pollIntervalRef.current)   { clearInterval(pollIntervalRef.current);   pollIntervalRef.current   = null }
  }, [])

  const handleComplete = useCallback(() => {
    if (!isTransitioningRef.current || hasCompletedRef.current) return
    hasCompletedRef.current  = true
    isTransitioningRef.current = false
    clearAllTimers()
    // HoneyOverlay handles its own hide/clear internally; nothing extra needed here.
  }, [clearAllTimers])

  const markRouteCommitted = useCallback(() => {
    if (!isTransitioningRef.current) return
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    // Tell canvas to start drain phase
    overlayRef.current?.routeCommitted()

    // Failsafe: if canvas drain somehow stalls, force complete after 2s
    if (!drainFailsafeRef.current) {
      drainFailsafeRef.current = setTimeout(() => {
        handleComplete()
      }, 2000)
    }
  }, [handleComplete])

  // Detect pathname change via Next.js hook
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
    if (isTransitioningRef.current) return

    clearAllTimers()
    isTransitioningRef.current = true
    hasCompletedRef.current    = false
    startUrlRef.current = `${window.location.pathname}${window.location.search}`

    // Start canvas animation; callback fires when screen is fully covered
    overlayRef.current?.startAnimation(() => {
      // Screen covered — navigate now
      router.prefetch(href)
      router.push(href)
    })

    // Poll full URL every 80ms to catch query-param / fast navigations
    pollIntervalRef.current = setInterval(() => {
      if (!isTransitioningRef.current) return
      const nowFull = `${window.location.pathname}${window.location.search}`
      if (nowFull !== startUrlRef.current) {
        markRouteCommitted()
      }
    }, 80)

    // Hard safety cap (5s) so overlay never freezes
    watchdogTimerRef.current = setTimeout(() => {
      if (isTransitioningRef.current) {
        handleComplete()
      }
    }, 5000)
  }, [clearAllTimers, handleComplete, markRouteCommitted, router])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
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
      ref={overlayRef}
      onComplete={handleComplete}
    />
  )
}
