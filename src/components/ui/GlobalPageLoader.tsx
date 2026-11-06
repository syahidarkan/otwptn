'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { HoneyOverlay } from '@/components/ui/HoneyDrip'

type Phase = 'idle' | 'covering' | 'waiting' | 'revealing'

// Absolute ceiling for a whole transition so the overlay can never hang the UI.
const HARD_CAP_MS = 2800

export default function GlobalPageLoader() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const routeKey = `${pathname}?${searchParams.toString()}`

  const elRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const phaseRef = useRef<Phase>('idle')
  const pendingHrefRef = useRef<string | null>(null)
  const startKeyRef = useRef(routeKey)
  const routeKeyRef = useRef(routeKey)
  routeKeyRef.current = routeKey
  const capTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reveal only once the new route has committed AND painted.
  useEffect(() => {
    if (phaseRef.current !== 'waiting' || routeKey === startKeyRef.current) return

    // Speed up playback slightly and fade out smoothly once the new route paints
    if (videoRef.current) {
      try { videoRef.current.playbackRate = 1.5 } catch {}
    }
    let r2 = 0
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => reveal())
    })
    const t = setTimeout(() => reveal(), 120)
    return () => {
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey])

  function reveal() {
    const el = elRef.current
    if (!el || phaseRef.current === 'revealing' || phaseRef.current === 'idle') return
    phaseRef.current = 'revealing'
    el.style.opacity = '0'
    setTimeout(finish, 260)
  }

  function finish() {
    if (capTimerRef.current) clearTimeout(capTimerRef.current)
    capTimerRef.current = null
    pendingHrefRef.current = null
    const el = elRef.current
    if (el) {
      el.style.visibility = 'hidden'
      el.style.opacity = '0'
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause()
        videoRef.current.playbackRate = 1.0
        videoRef.current.currentTime = 0
      } catch {}
    }
    phaseRef.current = 'idle'
  }

  function startNav() {
    const href = pendingHrefRef.current
    if (!href) return
    router.push(href)
  }

  function cover(href: string) {
    const el = elRef.current
    if (!el) return false
    pendingHrefRef.current = href
    if (phaseRef.current !== 'idle') {
      if (phaseRef.current === 'waiting') startNav()
      return true
    }
    startKeyRef.current = routeKeyRef.current
    phaseRef.current = 'covering'
    router.prefetch(href)

    // Show overlay immediately on click so transition starts smoothly
    el.style.visibility = 'visible'
    el.style.opacity = '1'
    if (videoRef.current) {
      try {
        videoRef.current.currentTime = 0
        videoRef.current.playbackRate = 1.0
        videoRef.current.play().catch(() => {})
      } catch {}
    }

    phaseRef.current = 'waiting'
    startNav()

    capTimerRef.current = setTimeout(() => {
      if (phaseRef.current === 'idle') return
      reveal()
    }, HARD_CAP_MS)
    return true
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const a = (e.target as HTMLElement | null)?.closest?.('a')
      if (!a) return
      const href = a.getAttribute('href')
      if (!href) return
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        a.getAttribute('target') === '_blank' ||
        a.getAttribute('download') !== null
      ) return

      let url: URL
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      const cur = window.location
      if (url.pathname === cur.pathname && url.search === cur.search) return

      e.preventDefault()
      e.stopPropagation()
      cover(`${url.pathname}${url.search}${url.hash}`)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <HoneyOverlay ref={elRef} videoRef={videoRef} />
}
