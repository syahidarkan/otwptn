'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { HoneyFill } from '@/components/ui/HoneyDrip'

type HoneyPhase = 'idle' | 'entering' | 'exiting'

export default function GlobalPageLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [honeyPhase, setHoneyPhase] = useState<HoneyPhase>('idle')
  const honeyPhaseRef = useRef<HoneyPhase>('idle')
  honeyPhaseRef.current = honeyPhase
  // Both must be true before exit starts
  const coveredRef = useRef(false)
  const navDoneRef = useRef(false)
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

        coveredRef.current = false
        navDoneRef.current = false
        if (honeyPhaseRef.current === 'idle') {
          setHoneyPhase('entering')
          // Safety net: force exit after 2.5s even if coverage detection fails
          if (maxTimerRef.current) clearTimeout(maxTimerRef.current)
          maxTimerRef.current = setTimeout(() => {
            if (honeyPhaseRef.current !== 'idle') setHoneyPhase('idle')
          }, 2500)
        }
      } catch {
        // invalid URL
      }
    }

    document.addEventListener('click', handleAnchorClick, true)
    return () => document.removeEventListener('click', handleAnchorClick, true)
  }, [])

  return honeyPhase !== 'idle' ? (
    <HoneyFill
      phase={honeyPhase as 'entering' | 'exiting'}
      onComplete={() => setHoneyPhase('idle')}
      onFullyCovered={handleFullyCovered}
    />
  ) : null
}
