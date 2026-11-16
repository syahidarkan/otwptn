'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const FloatingMascot = dynamic(() => import('./FloatingMascot'), { ssr: false })

export default function FloatingMascotLoader() {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // Defer mascot initialization until after initial FCP/LCP paint
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const win = window as unknown as {
        requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number
        cancelIdleCallback: (id: number) => void
      }
      const id = win.requestIdleCallback(() => setShouldLoad(true), { timeout: 600 })
      return () => win.cancelIdleCallback(id)
    } else {
      const timer = setTimeout(() => setShouldLoad(true), 150)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!shouldLoad) return null
  return <FloatingMascot />
}
