'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { HoneyFill } from '@/components/ui/HoneyDrip'

type HoneyPhase = 'idle' | 'entering' | 'exiting'

// Navigation is held back until the honey has visually started covering the
// screen (or this minimum elapses), so the new page never flashes in before
// the animation appears.
const MIN_COVER_BEFORE_NAV_MS = 220

export default function GlobalPageLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [honeyPhase, setHoneyPhase] = useState<HoneyPhase>('idle')
  const honeyPhaseRef = useRef<HoneyPhase>('idle')
  honeyPhaseRef.current = honeyPhase
  // Both must be true before exit starts
  const coveredRef = useRef(false)
  const navDoneRef = useRef(false)
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingHrefRef = useRef<string | null>(null)
  const navStartedRef = useRef(false)

  const startPendingNav = useCallback(() => {
    if (navStartedRef.current || !pendingHrefRef.current) return
    navStartedRef.current = true
    router.push(pendingHrefRef.current)
  }, [router])

  // Navigation done: if honey already covering → exit; else mark and wait for cover
  useEffect(() => {
    if (honeyPhaseRef.current !== 'entering') return
    navDoneRef.current = true
    if (coveredRef.current) setHoneyPhase('exiting')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  // HoneyFill pauses video and calls this when canvas is fully covered
  const handleFullyCovered = useCallback(() => {
    coveredRef.current = true
    if (navDoneRef.current) setHoneyPhase('exiting')
    // else: stay in entering, video is paused at full-cover; pathname effect will trigger exit
  }, [])

  useEffect(() => {
    function handleAnchorClick(e: MouseEvent) {
      // Let modified/non-primary clicks behave natively (new tab, etc.)
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const target = (e.target as HTMLElement).closest('a')
      if (!target) return
      const href = target.getAttribute('href')
      if (!href) return
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target.getAttribute('target') === '_blank' ||
        target.getAttribute('download') !== null
      ) return

      const isInternal = href.startsWith('/') || href.startsWith(window.location.origin)
      if (!isInternal) return

      try {
        const url = new URL(href, window.location.origin)
        const cur = new URL(window.location.href)
        if (url.pathname === cur.pathname && url.search === cur.search) return

        if (honeyPhaseRef.current !== 'idle') return

        // Hold navigation back until honey starts covering the screen
        e.preventDefault()
        coveredRef.current = false
        navDoneRef.current = false
        navStartedRef.current = false
        pendingHrefRef.current = `${url.pathname}${url.search}${url.hash}`

        setHoneyPhase('entering')
        setTimeout(startPendingNav, MIN_COVER_BEFORE_NAV_MS)

        // Safety net: force exit after 2.5s even if coverage detection fails
        if (maxTimerRef.current) clearTimeout(maxTimerRef.current)
        maxTimerRef.current = setTimeout(() => {
          startPendingNav()
          if (honeyPhaseRef.current !== 'idle') setHoneyPhase('idle')
        }, 2500)
      } catch {
        // invalid URL
      }
    }

    document.addEventListener('click', handleAnchorClick, true)
    return () => document.removeEventListener('click', handleAnchorClick, true)
  }, [startPendingNav])

  return honeyPhase !== 'idle' ? (
    <HoneyFill
      phase={honeyPhase as 'entering' | 'exiting'}
      onComplete={() => setHoneyPhase('idle')}
      onFullyCovered={handleFullyCovered}
    />
  ) : null
}
