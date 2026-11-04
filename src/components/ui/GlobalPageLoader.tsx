'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import HoneyDrip from '@/components/ui/HoneyDrip'

export default function GlobalPageLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showHoney, setShowHoney] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Listen to path or query param changes to finish loading
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

  // Listen to link clicks globally
  useEffect(() => {
    function handleAnchorClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // Ignore hash links, external links, downloads, mailto, tel, target="_blank"
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target.getAttribute('target') === '_blank' ||
        target.getAttribute('download') !== null
      ) {
        return
      }

      // Check if internal link
      const isInternal =
        href.startsWith('/') ||
        href.startsWith(window.location.origin)

      if (!isInternal) return

      // Normalize target path
      try {
        const url = new URL(href, window.location.origin)
        const currentUrl = new URL(window.location.href)

        // If clicking current page and same query, skip
        if (url.pathname === currentUrl.pathname && url.search === currentUrl.search) {
          return
        }

        // Start smooth top bar progress + honey animation
        setLoading(true)
        setProgress(28)
        setShowHoney(true)

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
        // invalid URL, ignore
      }
    }

    document.addEventListener('click', handleAnchorClick, true)
    return () => {
      document.removeEventListener('click', handleAnchorClick, true)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  if (!loading && progress === 0 && !showHoney) return null

  return (
    <>
      {/* Honey drip fullscreen transition */}
      {showHoney && (
        <HoneyDrip
          mode="fullscreen"
          onComplete={() => setShowHoney(false)}
        />
      )}

      {/* Amber progress bar */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none transition-opacity duration-300"
        style={{ opacity: loading || progress > 0 ? 1 : 0 }}
      >
        <div
          className="relative h-[3px] transition-all ease-out"
          style={{
            width: `${progress}%`,
            transitionDuration: progress === 100 ? '250ms' : '280ms',
            background: 'linear-gradient(90deg, #ffd400 0%, #f59e0b 60%, #ffd400 100%)',
            boxShadow: '0 0 12px rgba(255, 212, 0, 0.9), 0 0 4px rgba(245, 158, 11, 1)',
          }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#ffd400,0_0_5px_#f59e0b]" />
          <div className="absolute inset-x-0 top-full h-1.5 bg-gradient-to-b from-amber-400/30 to-transparent blur-xs pointer-events-none" />
        </div>
      </div>
    </>
  )
}
