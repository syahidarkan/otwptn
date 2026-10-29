'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ThemeHydrator() {
  const pathname = usePathname()

  useEffect(() => {
    try {
      // 1. Homepage & Public Landing Pages are FIXED LIGHT (tidak terpengaruh device dark mode)
      const isPublicLanding =
        pathname === '/' ||
        pathname === '/artikel' ||
        pathname?.startsWith('/artikel/') ||
        pathname === '/upgrade' ||
        pathname === '/panduan' ||
        pathname === '/jalur' ||
        pathname?.startsWith('/jalur/') ||
        pathname === '/daftar' ||
        pathname === '/login' ||
        pathname === '/register'

      if (isPublicLanding) {
        document.documentElement.classList.remove('dark')
        document.documentElement.setAttribute('data-theme', 'light')
        return
      }

      // 2. Member / Dashboard / Admin Area: follow explicit user preference
      const stored = localStorage.getItem('theme')
      if (stored === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.setAttribute('data-theme', 'light')
      }
    } catch {}
  }, [pathname])

  return null
}
