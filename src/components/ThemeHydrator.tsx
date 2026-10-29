'use client'

import { useEffect } from 'react'

export default function ThemeHydrator() {
  useEffect(() => {
    try {
      const applyTheme = (theme: 'dark' | 'light') => {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
          document.documentElement.setAttribute('data-theme', 'dark')
        } else {
          document.documentElement.classList.remove('dark')
          document.documentElement.setAttribute('data-theme', 'light')
        }
      }

      const stored = localStorage.getItem('theme')
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      if (stored === 'dark' || stored === 'light') {
        applyTheme(stored)
      } else {
        applyTheme(mediaQuery.matches ? 'dark' : 'light')
      }

      const handler = (e: MediaQueryListEvent) => {
        const currentStored = localStorage.getItem('theme')
        if (!currentStored || currentStored === 'system') {
          applyTheme(e.matches ? 'dark' : 'light')
        }
      }

      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } catch {}
  }, [])

  return null
}
