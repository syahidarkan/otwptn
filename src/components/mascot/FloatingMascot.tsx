'use client'

/**
 * Otbee lives in the page itself (see otbee/controller.ts for the behaviour). This component only renders
 * the avatar inside a document-positioned container and the speech bubble, and wires the controller up.
 */

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { OtbeeAvatar, Otbee4KPuppet, debugSurfaces } from './otbee'
import type { OtbeeHandle, Otbee4KPuppetHandle } from './otbee'
import { createController, type Bubble, type Controller } from './otbee/controller'
import { createClient } from '@/lib/supabase/client'

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v))

export default function FloatingMascot() {
  const pathname = usePathname()
  const puppetRef = useRef<Otbee4KPuppetHandle>(null)
  const avatarRef = useRef<OtbeeHandle>(null)
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

  // Growth progress: 0 (head only at hero top) -> 1 (full body past hero)
  const [growthProgress, setGrowthProgress] = useState(() => {
    if (typeof window === 'undefined') return 1
    return (pathname ?? '/') === '/' ? clamp(window.scrollY / 260) : 1
  })
  const progressValRef = useRef(growthProgress)
  progressValRef.current = growthProgress

  // Combined avatar handle dispatching to active mode (hero 4K puppet vs roaming elastic avatar)
  const combinedAvatar = useRef<OtbeeHandle>({
    play: (name, opts) => {
      puppetRef.current?.play(name, opts)
      avatarRef.current?.play(name, opts)
    },
    setView: (v) => {
      avatarRef.current?.setView(v)
      puppetRef.current?.setView(v)
    },
    fx: (type, side) => {
      puppetRef.current?.fx(type, side)
      avatarRef.current?.fx(type, side)
    },
    setFacing: (f) => {
      puppetRef.current?.setFacing(f)
      avatarRef.current?.setFacing(f)
    },
    get mixer() {
      return (growthProgress >= 0.95 ? avatarRef.current?.mixer : puppetRef.current?.mixer) ?? puppetRef.current?.mixer!
    },
  })

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const next = pathRef.current !== '/' ? 1 : clamp(window.scrollY / 260)
          if (Math.abs(next - progressValRef.current) > 0.008) {
            progressValRef.current = next
            setGrowthProgress(next)
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  const preventSelection = (e: Event) => {
    e.preventDefault()
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    window.getSelection()?.removeAllRanges()
    document.body.classList.add('otbee-dragging')
    document.addEventListener('selectstart', preventSelection, { capture: true })
    document.addEventListener('dragstart', preventSelection, { capture: true })
    isDraggingRef.current = true
    hasMovedRef.current = false
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    e.preventDefault()
    window.getSelection()?.removeAllRanges()
    const dx = Math.abs(e.clientX - dragStartPos.current.x)
    const dy = Math.abs(e.clientY - dragStartPos.current.y)
    if (!hasMovedRef.current && (dx > 3 || dy > 3)) {
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
    document.body.classList.remove('otbee-dragging')
    document.removeEventListener('selectstart', preventSelection, { capture: true })
    document.removeEventListener('dragstart', preventSelection, { capture: true })
    window.getSelection()?.removeAllRanges()
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
    if (hasMovedRef.current) {
      setIsDraggingState(false)
      ctl.current?.endDrag()
    } else {
      if (growthProgress < 0.6) {
        const reactions: { text: string; clip: 'cheer' | 'nod' | 'shy' }[] = [
          { text: 'Semangat belajar yaa! 🚀🔥', clip: 'cheer' },
          { text: 'Otbee siap nemenin kamu lolos PTN! 💛', clip: 'shy' },
          { text: 'Fokus & konsisten, PTN impian pasti tercapai! 🌟', clip: 'nod' },
          { text: 'Ayo gasspol latihan soal hari ini! 🐝💪', clip: 'cheer' },
          { text: 'Jangan lupa istirahat & jaga kesehatan yaa! ☕✨', clip: 'nod' },
        ]
        const r = reactions[Math.floor(Math.random() * reactions.length)]
        combinedAvatar.current.play(r.clip, { onDone: () => combinedAvatar.current.play('idle') })
        combinedAvatar.current.fx('stars')
        setBubble({ id: Date.now(), text: r.text, below: false, shift: 0 })
        setTimeout(() => setBubble(null), 3800)
      } else {
        ctl.current?.clickMascot()
      }
    }
  }

  useEffect(() => {
    return () => {
      document.body.classList.remove('otbee-dragging')
      document.removeEventListener('selectstart', preventSelection, { capture: true })
      document.removeEventListener('dragstart', preventSelection, { capture: true })
    }
  }, [])

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
      avatar: () => combinedAvatar.current,
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
      {(bubble || hovered) && (() => {
        const isYellowBg = growthProgress < 0.8
        const bg = isYellowBg ? '#ffffff' : '#fef08a'
        const color = isYellowBg ? '#0f172a' : '#78350f'
        const shadow = isYellowBg
          ? '0 12px 30px -4px rgba(0,0,0,0.12), 0 4px 12px -2px rgba(0,0,0,0.06)'
          : '0 12px 30px -4px rgba(217,119,6,0.25), 0 4px 12px -2px rgba(217,119,6,0.12)'
        const border = isYellowBg ? '1px solid rgba(0,0,0,0.07)' : '1px solid rgba(245,158,11,0.38)'

        return (
          <div
            key={bubble?.id ?? 'hint'}
            role="tooltip"
            style={{
              position: 'absolute', left: '50%', zIndex: 3,
              ...(bubble?.below ? { top: '100%', marginTop: 10 } : { bottom: '100%', marginBottom: 10 }),
              transform: `translateX(calc(-50% + ${bubble?.shift ?? 0}px))`,
              background: bg,
              color,
              fontSize: 12.5,
              fontWeight: 800,
              padding: '9px 18px',
              borderRadius: 24,
              width: 'max-content',
              maxWidth: size < 100 ? 230 : 280,
              textAlign: 'center',
              lineHeight: 1.4,
              boxShadow: shadow,
              border,
              pointerEvents: 'none',
              animation: 'otbee-bubble-pop .22s cubic-bezier(.34,1.56,.64,1) both',
            }}
          >
            {bubble?.text ?? (growthProgress < 0.6 ? 'Halo pejuang PTN! Klik aku yaa 🐝✨' : 'Klik aku untuk salto & tips PTN! 🐝')}
            <span style={{
              position: 'absolute',
              left: `calc(50% - ${bubble?.shift ?? 0}px)`,
              marginLeft: -6,
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              ...(bubble?.below
                ? { bottom: '100%', borderBottom: `6px solid ${bg}` }
                : { top: '100%', borderTop: `6px solid ${bg}` }),
            }} />
          </div>
        )
      })()}
      {/* Ambient glow in hero section */}
      {growthProgress < 0.8 && (
        <div
          className="absolute rounded-full bg-gradient-to-tr from-amber-400/30 via-amber-300/20 to-pink-300/10 blur-2xl -z-10 pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 1.8,
            height: size * 1.8,
            opacity: 1 - growthProgress,
          }}
        />
      )}
      <style>{`
        @keyframes otbee-bubble-pop{0%{opacity:0;scale:.85}100%{opacity:1;scale:1}}
        body.otbee-dragging,
        body.otbee-dragging * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
          cursor: grabbing !important;
        }
        body.otbee-dragging *::selection {
          background: transparent !important;
          color: inherit !important;
        }
        #otbee-floating-container,
        #otbee-floating-container * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
        }
        #otbee-floating-container *::selection {
          background: transparent !important;
          color: inherit !important;
        }
      `}</style>
      <div ref={popRef} style={{ transformOrigin: '50% 100%', userSelect: 'none', WebkitUserSelect: 'none' }}>
        <div ref={tiltRef} style={{ transformOrigin: '50% 80%', userSelect: 'none', WebkitUserSelect: 'none' }}>
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onLostPointerCapture={handlePointerUp}
            onMouseDown={e => {
              e.preventDefault()
              window.getSelection()?.removeAllRanges()
            }}
            onDragStart={e => e.preventDefault()}
            draggable={false}
            title="Klik untuk tips atau drag & drop untuk memindahkan Otbee!"
            style={{
              cursor: isDraggingState ? 'grabbing' : 'grab',
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              filter: hovered
                ? 'drop-shadow(0 6px 16px rgba(245,158,11,.5))'
                : 'drop-shadow(0 3px 6px rgba(0,0,0,.18))',
              transition: 'filter .2s',
            }}
          >
            {/* Stage A: 4K HD Round-Chin Interactive Head & Emergence in Hero (growthProgress < 0.95) */}
            <div
              style={{
                display: growthProgress < 0.95 ? 'block' : 'none',
                opacity: growthProgress < 0.95 ? 1 : 0,
                transition: 'opacity 0.15s ease',
              }}
            >
              <Otbee4KPuppet
                ref={puppetRef}
                growthProgress={growthProgress}
                size={size}
                paused={growthProgress >= 0.95}
                followPointer={!isDraggingState}
                onErraticPointer={() => ctl.current?.onDizzy()}
              />
            </div>

            {/* Stage B: Fully Elastic Skeletal Mascot (skinD joints, elbow & knee bending, footsteps, saltos) for Roaming */}
            <div
              style={{
                display: growthProgress >= 0.95 ? 'block' : 'none',
                opacity: growthProgress >= 0.95 ? 1 : 0,
                transition: 'opacity 0.15s ease',
              }}
            >
              <OtbeeAvatar
                ref={avatarRef}
                view="front"
                size={size}
                paused={growthProgress < 0.95}
                followPointer={!isDraggingState}
                onErraticPointer={() => ctl.current?.onDizzy()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
