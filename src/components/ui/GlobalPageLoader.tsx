'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { HoneyFill } from '@/components/ui/HoneyDrip'

type HoneyPhase = 'idle' | 'entering' | 'exiting'

export default function GlobalPageLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [honeyPhase, setHoneyPhase] = useState<HoneyPhase>('idle')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const honeyPhaseRef = useRef<HoneyPhase>('idle')
  honeyPhaseRef.current = honeyPhase
  // href waiting to be navigated — held until honey fully covers screen
  const pendingHrefRef = useRef<string | null>(null)

  // When pathname changes: navigation completed → switch honey to exiting
  useEffect(() => {
    if (honeyPhaseRef.current === 'entering') {
      setHoneyPhase('exiting')
    }
    if (loading) {
      setProgress(100)
      const t = setTimeout(() => { setLoading(false); setProgress(0) }, 350)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  // Called by HoneyFill when canvas is fully covered by honey
  const handleFullyCovered = useCallback(() => {
    const href = pendingHrefRef.current
    if (href) {
      pendingHrefRef.current = null
      router.push(href)
    }
  }, [router])

  // Listen to link clicks globally — intercept and defer navigation
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

        // Block Next.js Link handler from navigating immediately
        e.preventDefault()
        e.stopPropagation()

        // Store href — navigation fires when honey fully covers screen
        pendingHrefRef.current = href

        setLoading(true)
        setProgress(28)

        if (honeyPhaseRef.current === 'idle') {
          setHoneyPhase('entering')
        }

        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
          setProgress(prev => {
            if (prev >= 88) { if (timerRef.current) clearInterval(timerRef.current); return 88 }
            return prev + Math.floor(Math.random() * 8) + 5
          })
        }, 110)
      } catch {
        // invalid URL — let browser handle
      }
    }

    document.addEventListener('click', handleAnchorClick, true)
    return () => {
      document.removeEventListener('click', handleAnchorClick, true)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <>
      {/* Honey drip fullscreen transition */}
      {honeyPhase !== 'idle' && (
        <HoneyFill
          phase={honeyPhase as 'entering' | 'exiting'}
          onComplete={() => setHoneyPhase('idle')}
          onFullyCovered={handleFullyCovered}
        />
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
