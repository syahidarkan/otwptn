'use client'

import { useEffect, useRef, useCallback } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (id: string) => void
      remove: (id: string) => void
    }
  }
}

interface Props {
  onSuccess: (token: string) => void
  onExpire?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
}

let scriptLoaded = false

export function TurnstileWidget({ onSuccess, onExpire, theme = 'light', size = 'normal' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  const render = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return
    if (widgetId.current) {
      window.turnstile.remove(widgetId.current)
    }
    widgetId.current = window.turnstile.render(containerRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      callback: (token: string) => onSuccessRef.current(token),
      'expired-callback': () => onExpireRef.current?.(),
      theme,
      size,
    })
  }, [theme, size])

  useEffect(() => {
    if (window.turnstile) { render(); return }

    if (!scriptLoaded) {
      scriptLoaded = true
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      s.async = true
      s.defer = true
      s.onload = render
      document.head.appendChild(s)
    } else {
      // Script loading but not ready yet - poll
      const id = setInterval(() => {
        if (window.turnstile) { clearInterval(id); render() }
      }, 100)
      return () => clearInterval(id)
    }

    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current)
        widgetId.current = null
      }
    }
  }, [render])

  return <div ref={containerRef} className="flex justify-center" />
}
