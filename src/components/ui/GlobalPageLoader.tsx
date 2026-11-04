'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { HoneyFill } from '@/components/ui/HoneyDrip'

type HoneyPhase = 'idle' | 'entering' | 'holding' | 'exiting'

export default function GlobalPageLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [honeyPhase, setHoneyPhase] = useState<HoneyPhase>('idle')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const honeyTimerRef = useRef<NodeJS.Timeout | null>(null)
  const honeyPhaseRef = useRef<HoneyPhase>('idle')
  honeyPhaseRef.current = honeyPhase
  const enterStartRef = useRef<number>(0)

  // Navigation complete: pathname/params changed
  useEffect(() => {
    if (loading) {
      setProgress(100)
      const t = setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 350)
      return () => clearTimeout(t)
    }
  }, [pathname, searchParams])

  // When navigation completes, start exiting honey
  // If still entering, wait for enter to finish first (avoids snap to full orange)
  useEffect(() => {
    const phase = honeyPhaseRef.current
    if (phase === 'entering' || phase === 'holding') {
      if (honeyTimerRef.current) clearTimeout(honeyTimerRef.current)
      const ENTER_DURATION = 1000
      const elapsed = Date.now() - enterStartRef.current
      const remaining = phase === 'entering' ? Math.max(0, ENTER_DURATION - elapsed) : 0
      honeyTimerRef.current = setTimeout(() => {
        setHoneyPhase('exiting')
        honeyTimerRef.current = setTimeout(() => {
          setHoneyPhase('idle')
        }, 700)
      }, remaining)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  // Listen to link clicks globally
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

        // Start loading + honey entering phase
        setLoading(true)
        setProgress(28)

        if (honeyPhaseRef.current === 'idle') {
          enterStartRef.current = Date.now()
          setHoneyPhase('entering')
          if (honeyTimerRef.current) clearTimeout(honeyTimerRef.current)
          // After 900ms still loading → switch to holding
          honeyTimerRef.current = setTimeout(() => {
            setHoneyPhase(prev => prev === 'entering' ? 'holding' : prev)
          }, 900)
        }

        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
          setProgress(prev => {
            if (prev >= 88) {
              if (timerRef.current) clearInterval(timerRef.current)
              return 88
            }
            return prev + Math.floor(Math.random() * 8) + 5
          })
        }, 110)
      } catch {
        // invalid URL
      }
    }

    document.addEventListener('click', handleAnchorClick, true)
    return () => {
      document.removeEventListener('click', handleAnchorClick, true)
      if (timerRef.current) clearInterval(timerRef.current)
      if (honeyTimerRef.current) clearTimeout(honeyTimerRef.current)
    }
  }, [])

  return (
    <>
      {/* Honey drip fullscreen transition */}
      {honeyPhase !== 'idle' && (
        <HoneyFill phase={honeyPhase} />
      )}

      {/* Amber progress bar */}
      {(loading || progress > 0) && (
        <div
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none"
        >
          <div
            className="relative h-[3px] transition-all ease-out"
            style={{
              width: `${progress}%`,
              transitionDuration: progress === 100 ? '250ms' : '280ms',
              background: 'linear-gradient(90deg, #ffd400 0%, #f59e0b 60%, #ffd400 100%)',
              boxShadow: '0 0 12px rgba(255,212,0,0.9), 0 0 4px rgba(245,158,11,1)',
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#ffd400,0_0_5px_#f59e0b]" />
          </div>
        </div>
      )}
    </>
  )
}
