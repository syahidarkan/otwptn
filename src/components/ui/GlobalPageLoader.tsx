'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { HoneyFill } from '@/components/ui/HoneyDrip'

type HoneyPhase = 'idle' | 'entering' | 'exiting'

// Show honey only if loading takes longer than this (prefetched routes are ~50ms, skip them)
const HONEY_THRESHOLD_MS = 300

export default function GlobalPageLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [honeyPhase, setHoneyPhase] = useState<HoneyPhase>('idle')
  const [exitTarget, setExitTarget] = useState<number | undefined>()
  const honeyPhaseRef = useRef<HoneyPhase>('idle')
  honeyPhaseRef.current = honeyPhase
  const enterStartRef = useRef<number>(0)
  const navDoneRef = useRef(false)
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Navigation complete
  useEffect(() => {
    navDoneRef.current = true
    const elapsed = Date.now() - enterStartRef.current

    if (honeyPhaseRef.current === 'entering') {
      // Honey is showing — speed up to finish in same time as loading took, min 0.5s
      setExitTarget(Math.max(0.5, elapsed / 1000))
      setHoneyPhase('exiting')
    } else {
      // Navigation completed before honey threshold fired — cancel and stay idle
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  useEffect(() => {
    function handleAnchorClick(e: MouseEvent) {
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

        enterStartRef.current = Date.now()
        navDoneRef.current = false
        setExitTarget(undefined)

        if (delayTimerRef.current) clearTimeout(delayTimerRef.current)
        // Start honey only if still loading after threshold
        delayTimerRef.current = setTimeout(() => {
          if (!navDoneRef.current && honeyPhaseRef.current === 'idle') {
            setHoneyPhase('entering')
          }
        }, HONEY_THRESHOLD_MS)
      } catch {
        // invalid URL
      }
    }

    document.addEventListener('click', handleAnchorClick, true)
    return () => {
      document.removeEventListener('click', handleAnchorClick, true)
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current)
    }
  }, [])

  return honeyPhase !== 'idle' ? (
    <HoneyFill
      phase={honeyPhase as 'entering' | 'exiting'}
      onComplete={() => setHoneyPhase('idle')}
      exitTarget={exitTarget}
    />
  ) : null
}
