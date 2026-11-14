'use client'

/**
 * Otbee lives in the page itself (see otbee/controller.ts for the behaviour). This component only renders
 * the avatar inside a document-positioned container and the speech bubble, and wires the controller up.
 */

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { OtbeeAvatar, debugSurfaces } from './otbee'
import type { OtbeeHandle } from './otbee'
import { createController, type Bubble, type Controller } from './otbee/controller'
import { createClient } from '@/lib/supabase/client'

export default function FloatingMascot() {
  const pathname = usePathname()
  const avatar = useRef<OtbeeHandle>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const ctl = useRef<Controller | null>(null)
  const nameRef = useRef<string | null>(null)
  const pathRef = useRef(pathname ?? '/')
  const sizeRef = useRef(118)
  const [mounted, setMounted] = useState(false)
  const [size, setSize] = useState(118)
  const [hovered, setHovered] = useState(false)
  const [bubble, setBubble] = useState<Bubble | null>(null)
  const [isDraggingState, setIsDraggingState] = useState(false)
  const isDraggingRef = useRef(false)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const hasMovedRef = useRef(false)

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    isDraggingRef.current = true
    hasMovedRef.current = false
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    const dx = Math.abs(e.clientX - dragStartPos.current.x)
    const dy = Math.abs(e.clientY - dragStartPos.current.y)
    if (!hasMovedRef.current && (dx > 5 || dy > 5)) {
      hasMovedRef.current = true
      setIsDraggingState(true)
      ctl.current?.startDrag(e.clientX, e.clientY)
    }
    if (hasMovedRef.current) {
      ctl.current?.onDragMove(e.clientX, e.clientY)
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
    if (hasMovedRef.current) {
      setIsDraggingState(false)
      ctl.current?.endDrag()
    } else {
      ctl.current?.clickMascot()
    }
  }

  const hidden = !!pathname && (pathname.startsWith('/dashboard/essay/') || pathname.startsWith('/admin'))

  useEffect(() => { pathRef.current = pathname ?? '/' }, [pathname])

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(t)
  }, [])

  // responsive size (smaller on phones)
  useEffect(() => {
    const upd = () => { const s = window.innerWidth < 640 ? 88 : 118; sizeRef.current = s; setSize(s) }
    upd()
    window.addEventListener('resize', upd)
    return () => window.removeEventListener('resize', upd)
  }, [])

  // signed-in user's first name, for personal lines
  useEffect(() => {
    let live = true
    createClient().auth.getUser().then(({ data }) => {
      const n = (data.user?.user_metadata as { full_name?: string } | undefined)?.full_name
      if (live && n) nameRef.current = n.trim().split(/\s+/)[0]
    }).catch(() => {})
    return () => { live = false }
  }, [])

  // boot the controller once the DOM nodes exist
  useEffect(() => {
    if (!mounted || hidden) return
    const container = containerRef.current, pop = popRef.current, tilt = tiltRef.current
    if (!container || !pop || !tilt) return
    const c = createController({
      avatar: () => avatar.current,
      container, pop, tilt,
      size: () => sizeRef.current,
      name: () => nameRef.current,
      setBubble,
      pathname: () => pathRef.current,
    })
    ctl.current = c
    c.start()
    if (process.env.NODE_ENV !== 'production') {
      const w = window as unknown as { __otbee?: Controller; __otbeeSurfaces?: typeof debugSurfaces }
      w.__otbee = c
      w.__otbeeSurfaces = debugSurfaces
    }
    return () => { c.dispose(); ctl.current = null }
  }, [mounted, hidden])

  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    ctl.current?.onPathChange()
  }, [pathname])

  if (!mounted || hidden) return null

  return (
    <div
      id="otbee-floating-container"
      ref={containerRef}
      style={{ position: 'absolute', left: 0, top: 0, zIndex: 25, willChange: 'transform', opacity: 0, pointerEvents: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {(bubble || hovered) && (
        <div
          key={bubble?.id ?? 'hint'}
          role="tooltip"
          style={{
            position: 'absolute', left: '50%', zIndex: 3,
            ...(bubble?.below ? { top: '100%', marginTop: 8 } : { bottom: '100%', marginBottom: 6 }),
            transform: `translateX(calc(-50% + ${bubble?.shift ?? 0}px))`,
            background: 'linear-gradient(135deg,#1e1b18,#292520)', color: '#fef08a', fontSize: 11.5, fontWeight: 700,
            padding: '8px 14px', borderRadius: 16, width: 'max-content', maxWidth: size < 100 ? 230 : 280, textAlign: 'center', lineHeight: 1.4,
            boxShadow: '0 8px 24px -4px rgba(0,0,0,.4), 0 2px 6px rgba(245,158,11,.2)', border: '1px solid rgba(245,158,11,.3)',
            pointerEvents: 'none', animation: 'otbee-bubble-pop .22s cubic-bezier(.34,1.56,.64,1) both',
          }}
        >
          {bubble?.text ?? 'Klik aku untuk salto & tips PTN! 🐝'}
          <span style={{
            position: 'absolute', left: `calc(50% - ${bubble?.shift ?? 0}px)`, marginLeft: -6, width: 0, height: 0,
            borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
            ...(bubble?.below ? { bottom: '100%', borderBottom: '6px solid #1e1b18' } : { top: '100%', borderTop: '6px solid #292520' }),
          }} />
        </div>
      )}
      <style>{`@keyframes otbee-bubble-pop{0%{opacity:0;scale:.85}100%{opacity:1;scale:1}}`}</style>
      <div ref={popRef} style={{ transformOrigin: '50% 100%' }}>
        <div ref={tiltRef} style={{ transformOrigin: '50% 80%' }}>
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            title="Klik untuk tips atau drag & drop untuk memindahkan Otbee!"
            style={{
              cursor: isDraggingState ? 'grabbing' : 'grab',
              touchAction: 'none',
              userSelect: 'none',
              filter: hovered
                ? 'drop-shadow(0 6px 16px rgba(245,158,11,.5))'
                : 'drop-shadow(0 3px 6px rgba(0,0,0,.18))',
              transition: 'filter .2s',
            }}
          >
            <OtbeeAvatar ref={avatar} view="front" size={size} followPointer={!isDraggingState} />
          </div>
        </div>
      </div>
    </div>
  )
}
