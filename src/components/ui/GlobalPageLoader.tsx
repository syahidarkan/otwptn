'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { HoneyOverlay } from '@/components/ui/HoneyDrip'

type Phase = 'idle' | 'covering' | 'waiting' | 'revealing'

// Maximum ceiling for a whole transition so the overlay can never hang the UI.
const HARD_CAP_MS = 5000

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
  const routeLoadedRef = useRef(false)
  const capTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function finish() {
    if (capTimerRef.current) clearTimeout(capTimerRef.current)
    capTimerRef.current = null
    pendingHrefRef.current = null
    routeLoadedRef.current = false
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

  function reveal() {
    const el = elRef.current
    if (!el || phaseRef.current === 'revealing' || phaseRef.current === 'idle') return
    phaseRef.current = 'revealing'
    el.style.opacity = '0'
    setTimeout(finish, 260)
  }

  // When the new route commits underneath, flag route as loaded.
  // The honey overlay remains visibly on top until its drip animation completes naturally.
  useEffect(() => {
    if (phaseRef.current === 'idle' || routeKey === startKeyRef.current) return
    routeLoadedRef.current = true

    // If video has already passed peak drain or finished, reveal cleanly
    const video = videoRef.current
    if (video) {
      if (video.ended || video.currentTime >= 2.45) {
        reveal()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey])

  function handleTimeUpdate(time: number) {
    if (time >= 2.45) {
      reveal()
    }
  }

  function handleEnded() {
    reveal()
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
    routeLoadedRef.current = false
    phaseRef.current = 'covering'
    router.prefetch(href)

    // Show overlay immediately on click so honey drips in front of current page
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
    // Navigate at 800ms when honey has flooded >95% of the screen so page change is completely hidden behind honey
    setTimeout(() => {
      if (phaseRef.current === 'waiting') {
        startNav()
      }
    }, 800)

    capTimerRef.current = setTimeout(() => {
      if (phaseRef.current === 'idle') return
      reveal()
    }, 3500)
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

  return (
    <HoneyOverlay
      ref={elRef}
      videoRef={videoRef}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
    />
  )
}
