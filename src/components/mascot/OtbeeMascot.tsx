'use client'

import Image from 'next/image'
import { useState, useEffect, useId } from 'react'

export type OtbeeAnimation =
  | 'idle'
  | 'bounce'
  | 'shake'
  | 'spin'
  | 'wave'
  | 'jump'
  | 'celebrate'
  | 'thinking'
  | 'none'

export interface OtbeeMascotProps {
  pose?: string
  size?: number
  animation?: OtbeeAnimation
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  onHover?: () => void
}

const KEYFRAMES = `
@keyframes otbee-idle-float {
  0%, 100% { transform: translateY(0px) rotate(-1deg) scale(1); }
  50% { transform: translateY(-10px) rotate(1.5deg) scale(1.02); }
}
@keyframes otbee-bounce {
  0% { transform: translateY(0) scaleX(1) scaleY(1); }
  20% { transform: translateY(-18px) scaleX(0.95) scaleY(1.08); }
  40% { transform: translateY(0px) scaleX(1.1) scaleY(0.9); }
  55% { transform: translateY(-8px) scaleX(0.98) scaleY(1.04); }
  70% { transform: translateY(0px) scaleX(1.04) scaleY(0.97); }
  85% { transform: translateY(-3px) scaleX(1) scaleY(1); }
  100% { transform: translateY(0) scaleX(1) scaleY(1); }
}
@keyframes otbee-shake {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  15% { transform: translateX(-8px) rotate(-3deg); }
  30% { transform: translateX(8px) rotate(3deg); }
  45% { transform: translateX(-6px) rotate(-2deg); }
  60% { transform: translateX(6px) rotate(2deg); }
  75% { transform: translateX(-3px) rotate(-1deg); }
  90% { transform: translateX(3px) rotate(1deg); }
}
@keyframes otbee-spin {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
}
@keyframes otbee-wave {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  20% { transform: rotate(-12deg) translateY(-4px); }
  40% { transform: rotate(12deg) translateY(-6px); }
  60% { transform: rotate(-8deg) translateY(-3px); }
  80% { transform: rotate(8deg) translateY(-2px); }
}
@keyframes otbee-jump {
  0% { transform: translateY(0) scaleX(1) scaleY(1); }
  15% { transform: translateY(4px) scaleX(1.12) scaleY(0.88); }
  35% { transform: translateY(-30px) scaleX(0.92) scaleY(1.1); }
  55% { transform: translateY(-30px) scaleX(0.92) scaleY(1.1); }
  70% { transform: translateY(0px) scaleX(1.14) scaleY(0.86); }
  82% { transform: translateY(-10px) scaleX(0.97) scaleY(1.05); }
  92% { transform: translateY(0px) scaleX(1.05) scaleY(0.96); }
  100% { transform: translateY(0) scaleX(1) scaleY(1); }
}
@keyframes otbee-celebrate {
  0% { transform: rotate(0deg) translateY(0) scale(1); }
  20% { transform: rotate(180deg) translateY(-15px) scale(1.08); }
  40% { transform: rotate(360deg) translateY(0px) scale(1); }
  55% { transform: rotate(360deg) translateY(-10px) scaleX(0.95) scaleY(1.08); }
  70% { transform: rotate(360deg) translateY(0px) scaleX(1.1) scaleY(0.9); }
  85% { transform: rotate(360deg) translateY(-4px) scale(1); }
  100% { transform: rotate(360deg) translateY(0) scale(1); }
}
@keyframes otbee-thinking {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  25% { transform: translateY(-5px) rotate(2deg); }
  50% { transform: translateY(-3px) rotate(-3deg); }
  75% { transform: translateY(-6px) rotate(1deg); }
}
@keyframes otbee-wing-flutter {
  0%, 100% { transform: scaleX(1); }
  25% { transform: scaleX(0.88); }
  50% { transform: scaleX(1.05); }
  75% { transform: scaleX(0.92); }
}
@keyframes otbee-slide-in {
  from { transform: translateY(60px) scale(0.7); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
`

const ANIMATION_STYLES: Record<OtbeeAnimation, React.CSSProperties> = {
  idle: {
    animation: 'otbee-idle-float 3s ease-in-out infinite',
  },
  bounce: {
    animation: 'otbee-bounce 1.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite',
  },
  shake: {
    animation: 'otbee-shake 0.6s ease-in-out infinite',
  },
  spin: {
    animation: 'otbee-spin 1s ease-in-out infinite',
  },
  wave: {
    animation: 'otbee-wave 1.5s ease-in-out infinite',
    transformOrigin: 'bottom center',
  },
  jump: {
    animation: 'otbee-jump 1.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite',
    transformOrigin: 'bottom center',
  },
  celebrate: {
    animation: 'otbee-celebrate 1.6s ease-in-out infinite',
    transformOrigin: 'center',
  },
  thinking: {
    animation: 'otbee-thinking 4s ease-in-out infinite',
  },
  none: {},
}

export default function OtbeeMascot({
  pose = 'maskot-pov-depan-front',
  size = 120,
  animation = 'idle',
  className = '',
  style,
  onClick,
  onHover,
}: OtbeeMascotProps) {
  const [hovered, setHovered] = useState(false)
  const uid = useId().replace(/:/g, '')

  const animStyle = ANIMATION_STYLES[animation] ?? {}

  const hoverScale: React.CSSProperties = hovered
    ? { transform: 'scale(1.08)', transition: 'transform 0.2s ease' }
    : {}

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        id={`otbee-${uid}`}
        className={`relative inline-block select-none cursor-${onClick ? 'pointer' : 'default'} ${className}`}
        style={{
          width: size,
          height: size,
          ...style,
        }}
        onMouseEnter={() => { setHovered(true); onHover?.() }}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
      >
        {/* Wing flutter overlay */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            animation: 'otbee-wing-flutter 0.4s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        {/* Main sprite */}
        <div
          style={{
            width: '100%',
            height: '100%',
            ...animStyle,
            ...(hovered && animation === 'none' ? hoverScale : {}),
          }}
        >
          <Image
            src={`/mascot-hd/${pose}.png`}
            alt="Otbee mascot"
            width={size}
            height={size}
            priority={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              ...(hovered ? { transform: 'scale(1.08)', transition: 'transform 0.2s ease' } : {}),
            }}
            unoptimized
          />
        </div>
      </div>
    </>
  )
}
