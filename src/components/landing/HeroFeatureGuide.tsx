'use client'

import React, { useEffect, useRef, useState } from 'react'
import { HeadPuppet, type HeadPuppetHandle } from '@/components/mascot/otbee'
import { OtbeeAvatar } from '@/components/mascot/otbee'

export default function HeroMascotHead() {
  const headRef = useRef<HeadPuppetHandle>(null)
  const [bubbleText, setBubbleText] = useState<string | null>('Halo pejuang PTN! 🐝✨')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Scroll transition states
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isHandedOver, setIsHandedOver] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      // 0 -> 280px is the transformation zone
      const p = Math.max(0, Math.min(1, y / 260))
      setScrollProgress(p)

      // Once scrolled past 270px, hand over to the floating mascot
      if (p >= 0.95 && !isHandedOver) {
        setIsHandedOver(true)
      } else if (p < 0.85 && isHandedOver) {
        setIsHandedOver(false)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHandedOver])

  const handleHeadClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const reactions = [
      { text: 'Semangat belajar yaa! 🚀🔥', clip: 'cheer' as const },
      { text: 'Otbee siap nemenin kamu lolos PTN! 💛', clip: 'shy' as const },
      { text: 'Yeeey! Tetap konsisten & pantang menyerah! 🌟', clip: 'salto' as const },
      { text: 'Fokus & optimis, PTN impian menantimu! 🎓✨', clip: 'nod' as const },
    ]
    const r = reactions[Math.floor(Math.random() * reactions.length)]
    headRef.current?.play(r.clip, {
      onDone: () => headRef.current?.play('idle'),
    })
    setBubbleText(r.text)
    timerRef.current = setTimeout(() => {
      setBubbleText(null)
    }, 3800)
  }

  // Scale from 145px down to 118px (exact size of the walking mascot)
  const currentScale = 1 - scrollProgress * 0.186
  // Body unfold progress: emerges as scrollProgress goes from 0.35 to 0.95
  const bodyUnfold = Math.max(0, Math.min(1, (scrollProgress - 0.35) / 0.55))

  return (
    <div
      id="hero-feature-guide"
      className="w-full flex flex-col items-center justify-center relative select-none py-2"
      style={{
        opacity: isHandedOver ? 0 : 1,
        transition: 'opacity 0.22s ease-out',
        pointerEvents: isHandedOver ? 'none' : 'auto',
      }}
    >
      {/* Ambient Glow Aura */}
      <div
        className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-amber-400/30 via-amber-300/20 to-pink-300/10 blur-3xl -z-10 pointer-events-none"
        style={{
          opacity: 1 - scrollProgress * 0.8,
          transform: `scale(${currentScale})`,
          transition: 'transform 0.15s ease-out',
        }}
      />

      {/* Speech Bubble (fades as user scrolls) */}
      {bubbleText && scrollProgress < 0.25 && (
        <div className="mb-2 z-20 px-4 py-1.5 rounded-2xl bg-white/95 text-gray-900 text-xs font-black border border-amber-300/80 shadow-md backdrop-blur-md animate-bounce relative">
          {bubbleText}
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-r border-b border-amber-300/80 rotate-45" />
        </div>
      )}

      {/* Interactive Mascot Container (Transforms from 4K Head into Full Body) */}
      <div
        onClick={handleHeadClick}
        className="cursor-pointer relative flex flex-col items-center"
        style={{
          transform: `scale(${currentScale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.1s ease-out',
        }}
        title="Klik Otbee!"
      >
        {/* 1. Official 4K HD Head Puppet (Smooth anti-aliased layers, follows pointer) */}
        <div
          style={{
            opacity: 1 - bodyUnfold,
            transition: 'opacity 0.15s ease-out',
            display: bodyUnfold >= 0.98 ? 'none' : 'block',
          }}
        >
          <HeadPuppet
            ref={headRef}
            size={145}
            followPointer={scrollProgress < 0.4}
            action="idle"
          />
        </div>

        {/* 2. Full Body Emerging from beneath the head */}
        <div
          style={{
            position: bodyUnfold >= 0.98 ? 'relative' : 'absolute',
            top: 0,
            left: '50%',
            transform: `translateX(-50%) scale(${0.75 + bodyUnfold * 0.25})`,
            opacity: bodyUnfold,
            clipPath: `inset(0 0 ${Math.max(0, (1 - bodyUnfold) * 75)}% 0)`,
            transition: 'opacity 0.18s ease-out, clip-path 0.18s ease-out',
            pointerEvents: 'none',
          }}
        >
          <OtbeeAvatar
            view="front"
            size={118}
            action={scrollProgress > 0.6 ? 'jumpAir' : 'idle'}
          />
        </div>
      </div>
    </div>
  )
}
