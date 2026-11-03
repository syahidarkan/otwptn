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
        setProgress(25)

        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
          setProgress(prev => {
            if (prev >= 85) {
              if (timerRef.current) clearInterval(timerRef.current)
              return 85
            }
            return prev + Math.floor(Math.random() * 10) + 6
          })
        }, 120)
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
      className="fixed inset-0 z-[99999] pointer-events-none transition-opacity duration-300"
      style={{ opacity: loading || progress > 0 ? 1 : 0 }}
    >
      {/* Top golden progress bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-sm transition-all ease-out z-[100000]"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '200ms' : '250ms',
          boxShadow: '0 0 10px rgba(245, 158, 11, 0.7), 0 0 4px rgba(234, 179, 8, 0.9)',
        }}
      />

      {/* Centered Modal Popup with Animated Mascot (Exact Reference Style) */}
      {loading && progress < 100 && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-[290px] sm:max-w-[320px] rounded-3xl p-6 bg-white border border-gray-100 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            {/* Animated Circular Aura & Verified Mascot */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              {/* Outer soft ring pulse */}
              <div className="absolute inset-0 rounded-full bg-emerald-100/60 animate-ping opacity-40" />

              <div className="w-24 h-24 rounded-full bg-gradient-to-b from-emerald-50 via-white to-amber-50/60 border-2 border-emerald-300 flex items-center justify-center shadow-inner relative overflow-hidden">
                {/* Floating Mascot with guaranteed working path */}
                <div className="animate-bounce" style={{ animationDuration: '1.2s' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/mascot/thumbsup.png"
                    alt="Otbee Loading"
                    className="w-16 h-16 object-contain drop-shadow-md select-none pointer-events-none"
                    onError={e => {
                      (e.target as HTMLImageElement).src = '/mascot-hd/thumbsup.png'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Title & Animated Dots */}
            <div>
              <div className="flex items-center justify-center gap-1.5 text-base sm:text-lg font-black text-gray-950 tracking-tight">
                <span>Menyiapkan Ruang Belajar</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Menghubungkan akun dan materi belajarmu...
              </p>
            </div>

            {/* Subtle bottom progress line */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
