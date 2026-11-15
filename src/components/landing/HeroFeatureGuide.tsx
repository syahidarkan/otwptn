'use client'

import React, { useRef, useState } from 'react'
import { OtbeeAvatar, type OtbeeHandle } from '@/components/mascot/otbee'

export default function HeroMascotHead() {
  const avatarRef = useRef<OtbeeHandle>(null)
  const [bubbleText, setBubbleText] = useState<string | null>('Halo pejuang PTN! 🐝✨')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleHeadClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const reactions = [
      { text: 'Semangat belajar yaa! 🚀🔥', clip: 'cheer' as const, fx: 'stars' as const },
      { text: 'Otbee siap nemenin kamu lolos PTN! 💛', clip: 'shy' as const, fx: 'heart' as const },
      { text: 'Yeeey! Tetap konsisten & pantang menyerah! 🌟', clip: 'salto' as const, fx: 'sparkle' as const },
      { text: 'Fokus & optimis, PTN impian menantimu! 🎓✨', clip: 'nod' as const, fx: 'bulb' as const },
    ]
    const r = reactions[Math.floor(Math.random() * reactions.length)]
    avatarRef.current?.fx(r.fx, 1)
    avatarRef.current?.play(r.clip, {
      onDone: () => avatarRef.current?.play('idle'),
    })
    setBubbleText(r.text)
    timerRef.current = setTimeout(() => {
      setBubbleText(null)
    }, 3800)
  }

  return (
    <div id="hero-feature-guide" className="w-full flex flex-col items-center justify-center relative select-none py-2">
      {/* Ambient Glow Aura */}
      <div className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-amber-400/30 via-amber-300/20 to-pink-300/10 blur-3xl -z-10 pointer-events-none" />

      {/* Speech Bubble */}
      {bubbleText && (
        <div className="mb-2 z-20 px-4 py-1.5 rounded-2xl bg-white/95 text-gray-900 text-xs font-black border border-amber-300/80 shadow-md backdrop-blur-md animate-bounce relative">
          {bubbleText}
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-r border-b border-amber-300/80 rotate-45" />
        </div>
      )}

      {/* Interactive Mascot Head (Medium-Large, follows cursor) */}
      <div
        onClick={handleHeadClick}
        className="cursor-pointer transition-transform hover:scale-105 active:scale-95 relative"
        title="Klik Otbee!"
      >
        <OtbeeAvatar
          ref={avatarRef}
          headOnly
          size={145}
          view="front"
          followPointer
        />
      </div>
    </div>
  )
}
