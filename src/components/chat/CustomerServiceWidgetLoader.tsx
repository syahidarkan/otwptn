'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const CustomerServiceWidget = dynamic(
  () => import('./CustomerServiceWidget'),
  { ssr: false }
)

export default function CustomerServiceWidgetLoader() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Defer chat widget until idle or after 800ms to guarantee zero impact on initial load
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const win = window as unknown as {
        requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number
        cancelIdleCallback: (id: number) => void
      }
      const id = win.requestIdleCallback(() => setReady(true), { timeout: 1200 })
      return () => win.cancelIdleCallback(id)
    } else {
      const t = setTimeout(() => setReady(true), 400)
      return () => clearTimeout(t)
    }
  }, [])

  if (!ready) return null
  return <CustomerServiceWidget />
}
