'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function GlobalPageLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Listen to path or query param changes to finish loading
  useEffect(() => {
    if (loading) {
      setProgress(100)
      const t = setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 300)
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

        // Start progress
        setLoading(true)
        setProgress(20)

        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
          setProgress(prev => {
            if (prev >= 85) {
              if (timerRef.current) clearInterval(timerRef.current)
              return 85
            }
            return prev + Math.floor(Math.random() * 12) + 5
          })
        }, 150)
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

  if (!loading && progress === 0) return null

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-300"
      style={{ opacity: loading || progress > 0 ? 1 : 0 }}
    >
      {/* Top golden progress bar */}
      <div
        className="h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-sm transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '200ms' : '300ms',
          boxShadow: '0 0 10px rgba(245, 158, 11, 0.7), 0 0 4px rgba(234, 179, 8, 0.9)',
        }}
      />

      {/* Floating subtle loading badge at top right */}
      {loading && progress < 100 && (
        <div className="fixed top-3 right-4 z-[99999] flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-amber-300/80 shadow-md text-amber-950 text-[11px] font-black animate-fade-in pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>Memuat...</span>
        </div>
      )}
    </div>
  )
}
