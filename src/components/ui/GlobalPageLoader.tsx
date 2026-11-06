'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { HoneyOverlay } from '@/components/ui/HoneyDrip'

type Phase = 'idle' | 'covering' | 'waiting' | 'revealing'

const COVER_MS = 300
const REVEAL_MS = 400
// Absolute ceiling for a whole transition so the overlay can never hang the UI.
const HARD_CAP_MS = 3500

export default function GlobalPageLoader() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const routeKey = `${pathname}?${searchParams.toString()}`

  const elRef = useRef<HTMLDivElement>(null)
  const phaseRef = useRef<Phase>('idle')
  const pendingHrefRef = useRef<string | null>(null)
  const startKeyRef = useRef(routeKey)
  const routeKeyRef = useRef(routeKey)
  routeKeyRef.current = routeKey
  const capTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const coverAnimRef = useRef<Animation | null>(null)
  const revealAnimRef = useRef<Animation | null>(null)

  // Reveal only once the new route has committed AND painted.
  useEffect(() => {
    if (phaseRef.current !== 'waiting' || routeKey === startKeyRef.current) return
    // Two animation frames = committed + painted; the timer keeps it moving if frames are throttled.
    let r2 = 0
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => reveal())
    })
    const t = setTimeout(() => reveal(), 100)
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
    coverAnimRef.current?.cancel()
    const h = el.offsetHeight
    // Flip so the drips lead on the way down and the honey drains off the screen.
    el.style.transform = `translateY(${h}px) scaleY(-1)`
    const anim = el.animate(
      [
        { transform: `translateY(${h}px) scaleY(-1)` },
        { transform: `translateY(${h * 2}px) scaleY(-1)` },
      ],
      { duration: REVEAL_MS, easing: 'cubic-bezier(0.5, 0, 0.9, 0.6)', fill: 'forwards' },
    )
    revealAnimRef.current = anim
    anim.onfinish = finish
    setTimeout(() => {
      if (revealAnimRef.current === anim) finish()
    }, REVEAL_MS + 80)
  }

  function finish() {
    const el = elRef.current
    if (capTimerRef.current) clearTimeout(capTimerRef.current)
    capTimerRef.current = null
    if (revealAnimRef.current) {
      revealAnimRef.current.onfinish = null
      revealAnimRef.current.cancel()
      revealAnimRef.current = null
    }
    pendingHrefRef.current = null
    if (el) {
      el.style.visibility = 'hidden'
      el.style.transform = 'translateY(-110%)'
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
      // Already covering/waiting: just retarget the navigation.
      if (phaseRef.current === 'waiting') startNav()
      return true
    }
    startKeyRef.current = routeKeyRef.current
    phaseRef.current = 'covering'
    router.prefetch(href)
    el.style.visibility = 'visible'
    const anim = el.animate(
      [{ transform: 'translateY(-110%) scaleY(1)' }, { transform: 'translateY(0) scaleY(1)' }],
      { duration: COVER_MS, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' },
    )
    coverAnimRef.current = anim
    const onCovered = () => {
      if (coverAnimRef.current !== anim || phaseRef.current !== 'covering') return
      el.style.transform = 'translateY(0) scaleY(1)'
      anim.cancel()
      phaseRef.current = 'waiting'
      startNav()
    }
    anim.onfinish = onCovered
    // Do not depend on the animation clock alone: start navigating even if frames are throttled.
    setTimeout(onCovered, COVER_MS + 40)
    capTimerRef.current = setTimeout(() => {
      if (phaseRef.current === 'idle') return
      startNav()
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

  return <HoneyOverlay ref={elRef} />
}
