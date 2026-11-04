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

        // Start smooth top bar progress
        setLoading(true)
        setProgress(28)

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

  if (!loading && progress === 0) return null

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none transition-opacity duration-300"
      style={{ opacity: loading || progress > 0 ? 1 : 0 }}
    >
      {/* Sleek Modern Electric Blue Progress Bar (Requested: Garis Biru Loading di Atas Layar) */}
      <div
        className="relative h-[3.5px] bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '250ms' : '280ms',
          boxShadow: '0 0 14px rgba(56, 189, 248, 0.9), 0 0 4px rgba(37, 99, 235, 1)',
        }}
      >
        {/* Leading edge luminous dot */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_#38bdf8,0_0_6px_#0284c7]" />

        {/* Ambient bottom glow trail */}
        <div
          className="absolute inset-x-0 top-full h-1.5 bg-gradient-to-b from-sky-400/40 to-transparent blur-xs pointer-events-none"
        />
      </div>
    </div>
  )
}
