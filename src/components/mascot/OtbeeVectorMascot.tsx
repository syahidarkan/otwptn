'use client'

/**
 * OtbeeVectorMascot - Pure hardcoded 2D SVG mascot engine
 * Zero external PNGs. Pixel-accurate recreation of Otbee the bee.
 *
 * Visual reference: /public/mascot-hd/maskot-pov-depan-front.png
 * Character traits:
 *   - Chibi bee, golden-amber yellow (#F5B800 / #FFCF00) body
 *   - Big round head (60% of total height), small rounded body
 *   - Two antennae: black curved stalk + round black tip
 *   - Aviator goggles on forehead: dark brown leather band, two round teal/cyan lenses with crosshair reticles + glare
 *   - Large kawaii eyes: big black circle, white sclera patch top-left, two white highlight dots
 *   - Pink blush cheeks (soft radial gradient ellipses)
 *   - Small open/smile mouth (shows teeth when happy)
 *   - Black neckerchief tied at left side with bow knot + two trailing ends
 *   - Striped body: 3-4 black bands across yellow torso (thick, curved)
 *   - Crossbody satchel bag (dark brown leather, simple flap, strap going left-to-right)
 *   - Two stubby arms (yellow, no fingers, slightly curved) - arms out for front/idle
 *   - Two stubby feet
 *   - 4 blue-teal translucent wings (2 visible per side from front: upper large + lower small)
 *   - Black stinger at bottom
 */

import React, { useId, useEffect, useRef, useState } from 'react'

export type MascotPOV = 'front' | 'right' | 'left' | 'back' | 'top' | 'bottom' | '3/4'
export type MascotPoseAction =
  | 'idle'
  | 'bounce'
  | 'wave'
  | 'cheer'
  | 'thumbsup'
  | 'thinking'
  | 'sleep'
  | 'salto'
  | 'run'
  | 'happy'
  | 'sad'
  | 'excited'

interface OtbeeVectorMascotProps {
  pov?: MascotPOV
  action?: MascotPoseAction
  size?: number
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  onHover?: () => void
}

// -------------------------------------------------------------------------
// SVG viewBox is 200x240 (width x height). Center X=100, ground Y=235.
// Head center: (100, 85). Head radius: ~65 (slightly elliptical: rx=63, ry=65)
// Body center: (100, 175). Body: ellipse rx=48, ry=42
// -------------------------------------------------------------------------

function useBlinkTimer() {
  const [blink, setBlink] = useState(false)
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    const schedule = () => {
      const nextBlink = 2800 + Math.random() * 3500
      timeout = setTimeout(() => {
        setBlink(true)
        setTimeout(() => {
          setBlink(false)
          schedule()
        }, 130)
      }, nextBlink)
    }
    schedule()
    return () => clearTimeout(timeout)
  }, [])
  return blink
}

// ----- WING (front view: upper large, lower small) ------
function WingLeft({ id }: { id: string }) {
  return (
    <g>
      {/* Upper left wing - large teardrop */}
      <ellipse
        cx={52} cy={118}
        rx={30} ry={22}
        transform="rotate(-30 52 118)"
        fill={`url(#${id}-wing-fill)`}
        stroke="#8EC5D6"
        strokeWidth="1.2"
        opacity={0.88}
      />
      {/* Wing veins */}
      <line x1={68} y1={105} x2={40} y2={128} stroke="#A8D8E8" strokeWidth="0.6" opacity={0.7} />
      <line x1={72} y1={112} x2={44} y2={130} stroke="#A8D8E8" strokeWidth="0.5" opacity={0.6} />
      {/* Lower left wing - small */}
      <ellipse
        cx={58} cy={144}
        rx={18} ry={12}
        transform="rotate(-15 58 144)"
        fill={`url(#${id}-wing-fill)`}
        stroke="#8EC5D6"
        strokeWidth="1"
        opacity={0.78}
      />
    </g>
  )
}

function WingRight({ id }: { id: string }) {
  return (
    <g>
      {/* Upper right wing */}
      <ellipse
        cx={148} cy={118}
        rx={30} ry={22}
        transform="rotate(30 148 118)"
        fill={`url(#${id}-wing-fill)`}
        stroke="#8EC5D6"
        strokeWidth="1.2"
        opacity={0.88}
      />
      {/* Wing veins */}
      <line x1={132} y1={105} x2={160} y2={128} stroke="#A8D8E8" strokeWidth="0.6" opacity={0.7} />
      <line x1={128} y1={112} x2={156} y2={130} stroke="#A8D8E8" strokeWidth="0.5" opacity={0.6} />
      {/* Lower right wing */}
      <ellipse
        cx={142} cy={144}
        rx={18} ry={12}
        transform="rotate(15 142 144)"
        fill={`url(#${id}-wing-fill)`}
        stroke="#8EC5D6"
        strokeWidth="1"
        opacity={0.78}
      />
    </g>
  )
}

// ----- GOGGLES ------
function Goggles({ id, pov = 'front' }: { id: string; pov?: MascotPOV }) {
  if (pov === 'back') {
    // From back: just the strap going across
    return (
      <g>
        <rect x={42} y={62} width={116} height={12} rx={6} fill="#6B3A2A" />
        <rect x={42} y={64} width={116} height={4} rx={2} fill="#8B5542" opacity={0.5} />
      </g>
    )
  }
  if (pov === 'top') {
    // From top: goggles on the front edge, seen foreshortened
    return (
      <g>
        <ellipse cx={100} cy={105} rx={42} ry={8} fill="#5A2D1A" />
        <ellipse cx={82} cy={105} rx={14} ry={6} fill="#1A8A7A" />
        <ellipse cx={118} cy={105} rx={14} ry={6} fill="#1A8A7A" />
      </g>
    )
  }

  // Front / 3/4 / left / right
  const isProfile = pov === 'right' || pov === 'left'
  if (isProfile) {
    // Side profile: one goggle visible, strap going back
    const flip = pov === 'left' ? -1 : 1
    return (
      <g transform={pov === 'left' ? 'scale(-1,1) translate(-200,0)' : ''}>
        {/* Strap going left across head */}
        <rect x={50} y={60} width={105} height={13} rx={6.5} fill="#6B3A2A" />
        <rect x={50} y={62} width={105} height={5} rx={2.5} fill="#8B5542" opacity={0.4} />
        {/* One goggle lens (right side visible) */}
        <circle cx={134} cy={67} r={22} fill="#2A1A0A" stroke="#6B3A2A" strokeWidth={3} />
        <circle cx={134} cy={67} r={18} fill="#1D7A6A" />
        {/* Crosshair reticle */}
        <line x1={134} y1={52} x2={134} y2={82} stroke="#28B89A" strokeWidth="1.2" opacity={0.8} />
        <line x1={119} y1={67} x2={149} y2={67} stroke="#28B89A" strokeWidth="1.2" opacity={0.8} />
        <circle cx={134} cy={67} r={7} fill="none" stroke="#28B89A" strokeWidth="0.9" opacity={0.7} />
        {/* Glare */}
        <ellipse cx={126} cy={60} rx={4} ry={2.5} fill="white" opacity={0.3} transform="rotate(-25 126 60)" />
      </g>
    )
  }

  // Front / 3/4
  return (
    <g>
      {/* Brown leather strap/band across top of head */}
      <rect x={42} y={58} width={116} height={18} rx={9} fill="#6B3A2A" />
      <rect x={42} y={60} width={116} height={7} rx={3.5} fill="#8B5542" opacity={0.4} />

      {/* Left goggle frame (dark brown outer) */}
      <circle cx={76} cy={65} r={23} fill="#2A1A0A" stroke="#5A2D1A" strokeWidth={2.5} />
      {/* Left goggle lens (teal/cyan) */}
      <circle cx={76} cy={65} r={18} fill="#1D7A6A" />
      {/* Gradient sheen on left lens */}
      <circle cx={76} cy={65} r={18} fill={`url(#${id}-lens-radial)`} />
      {/* Left crosshair */}
      <line x1={76} y1={48} x2={76} y2={82} stroke="#28B89A" strokeWidth="1.4" opacity={0.85} />
      <line x1={59} y1={65} x2={93} y2={65} stroke="#28B89A" strokeWidth="1.4" opacity={0.85} />
      <circle cx={76} cy={65} r={7} fill="none" stroke="#28B89A" strokeWidth="1" opacity={0.7} />
      {/* Left glare */}
      <ellipse cx={68} cy={57} rx={5} ry={3} fill="white" opacity={0.35} transform="rotate(-30 68 57)" />

      {/* Bridge between lenses */}
      <rect x={94} y={62} width={12} height={6} rx={3} fill="#2A1A0A" />

      {/* Right goggle frame */}
      <circle cx={124} cy={65} r={23} fill="#2A1A0A" stroke="#5A2D1A" strokeWidth={2.5} />
      {/* Right goggle lens */}
      <circle cx={124} cy={65} r={18} fill="#1D7A6A" />
      <circle cx={124} cy={65} r={18} fill={`url(#${id}-lens-radial)`} />
      {/* Right crosshair */}
      <line x1={124} y1={48} x2={124} y2={82} stroke="#28B89A" strokeWidth="1.4" opacity={0.85} />
      <line x1={107} y1={65} x2={141} y2={65} stroke="#28B89A" strokeWidth="1.4" opacity={0.85} />
      <circle cx={124} cy={65} r={7} fill="none" stroke="#28B89A" strokeWidth="1" opacity={0.7} />
      {/* Right glare */}
      <ellipse cx={116} cy={57} rx={5} ry={3} fill="white" opacity={0.35} transform="rotate(-30 116 57)" />
    </g>
  )
}

// ----- ANTENNAE ------
function Antennae({ pov = 'front' }: { pov?: MascotPOV }) {
  if (pov === 'back') {
    return (
      <g>
        <path d="M 80 44 Q 72 25 68 15" stroke="#1A1A1A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <circle cx={68} cy={13} r={5.5} fill="#1A1A1A" />
        <path d="M 120 44 Q 128 25 132 15" stroke="#1A1A1A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <circle cx={132} cy={13} r={5.5} fill="#1A1A1A" />
      </g>
    )
  }
  if (pov === 'top') {
    // From top: antennae point outward
    return (
      <g>
        <line x1={78} y1={75} x2={58} y2={52} stroke="#1A1A1A" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx={56} cy={50} r={5} fill="#1A1A1A" />
        <line x1={122} y1={75} x2={142} y2={52} stroke="#1A1A1A" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx={144} cy={50} r={5} fill="#1A1A1A" />
      </g>
    )
  }
  if (pov === 'right') {
    return (
      <g>
        <path d="M 115 48 Q 125 28 128 16" stroke="#1A1A1A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <circle cx={128} cy={14} r={5.5} fill="#1A1A1A" />
        <path d="M 128 50 Q 145 35 152 24" stroke="#1A1A1A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <circle cx={152} cy={22} r={5.5} fill="#1A1A1A" />
      </g>
    )
  }
  if (pov === 'left') {
    return (
      <g transform="scale(-1,1) translate(-200,0)">
        <path d="M 115 48 Q 125 28 128 16" stroke="#1A1A1A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <circle cx={128} cy={14} r={5.5} fill="#1A1A1A" />
        <path d="M 128 50 Q 145 35 152 24" stroke="#1A1A1A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <circle cx={152} cy={22} r={5.5} fill="#1A1A1A" />
      </g>
    )
  }

  // Front / 3/4 - two antennae slightly apart
  return (
    <g>
      {/* Left antenna */}
      <path d="M 83 42 Q 76 22 72 10" stroke="#1A1A1A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx={72} cy={8} r={6} fill="#1A1A1A" />
      {/* Right antenna */}
      <path d="M 117 42 Q 124 22 128 10" stroke="#1A1A1A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx={128} cy={8} r={6} fill="#1A1A1A" />
    </g>
  )
}

// ----- EYES ------
function Eyes({ id, blink, pov = 'front', action = 'idle' }: { id: string; blink: boolean; pov?: MascotPOV; action?: MascotPoseAction }) {
  const isSleeping = action === 'sleep'
  const isThinking = action === 'thinking'

  if (pov === 'back') {
    return null
  }
  if (pov === 'top') {
    // Eyes barely visible from above, slightly squinting
    return (
      <g transform="translate(0, 10) scale(1, 0.4) translate(0, -10)">
        <ellipse cx={82} cy={102} rx={10} ry={8} fill="#1A1A1A" />
        <ellipse cx={118} cy={102} rx={10} ry={8} fill="#1A1A1A" />
      </g>
    )
  }

  if (isSleeping) {
    // Closed crescent eyes
    return (
      <g>
        <path d="M 70 103 Q 80 97 90 103" stroke="#1A1A1A" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <path d="M 110 103 Q 120 97 130 103" stroke="#1A1A1A" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      </g>
    )
  }

  const isProfile = pov === 'right' || pov === 'left'

  if (isProfile) {
    // Profile: only one eye visible
    const flip = pov === 'left'
    return (
      <g transform={flip ? 'scale(-1,1) translate(-200,0)' : ''}>
        <ellipse cx={130} cy={99} rx={16} ry={blink ? 2 : 15} fill="white" />
        {!blink && (
          <>
            <circle cx={132} cy={101} r={12} fill="#1A1A1A" />
            <circle cx={127} cy={96} r={3.5} fill="white" />
            <circle cx={137} cy={103} r={2} fill="white" />
          </>
        )}
        {blink && <ellipse cx={130} cy={99} rx={16} ry={2} fill="#1A1A1A" />}
      </g>
    )
  }

  // Front / 3/4
  const leftEyeCX = 82
  const rightEyeCX = 118
  const eyeCY = 100

  if (blink) {
    return (
      <g>
        <path d={`M ${leftEyeCX - 14} ${eyeCY} Q ${leftEyeCX} ${eyeCY - 6} ${leftEyeCX + 14} ${eyeCY}`}
          stroke="#1A1A1A" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d={`M ${rightEyeCX - 14} ${eyeCY} Q ${rightEyeCX} ${eyeCY - 6} ${rightEyeCX + 14} ${eyeCY}`}
          stroke="#1A1A1A" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    )
  }

  return (
    <g>
      {/* Left eye */}
      <ellipse cx={leftEyeCX} cy={eyeCY} rx={15} ry={15} fill="white" />
      <circle cx={leftEyeCX + 1} cy={eyeCY + 1} r={12} fill="#1A1A1A" />
      {/* Left highlights */}
      <circle cx={leftEyeCX - 4} cy={eyeCY - 4} r={4} fill="white" />
      <circle cx={leftEyeCX + 5} cy={eyeCY + 4} r={2} fill="white" />

      {/* Right eye */}
      <ellipse cx={rightEyeCX} cy={eyeCY} rx={15} ry={15} fill="white" />
      <circle cx={rightEyeCX + 1} cy={eyeCY + 1} r={12} fill="#1A1A1A" />
      {/* Right highlights */}
      <circle cx={rightEyeCX - 4} cy={eyeCY - 4} r={4} fill="white" />
      <circle cx={rightEyeCX + 5} cy={eyeCY + 4} r={2} fill="white" />

      {/* Thinking: eyebrow on right */}
      {isThinking && (
        <path d={`M ${rightEyeCX - 10} ${eyeCY - 17} Q ${rightEyeCX} ${eyeCY - 21} ${rightEyeCX + 10} ${eyeCY - 16}`}
          stroke="#C4860A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
    </g>
  )
}

// ----- BLUSH / CHEEKS ------
function Cheeks({ pov = 'front' }: { pov?: MascotPOV }) {
  if (pov === 'back' || pov === 'top') return null
  const isProfile = pov === 'right' || pov === 'left'
  if (isProfile) {
    const flip = pov === 'left'
    return (
      <g transform={flip ? 'scale(-1,1) translate(-200,0)' : ''}>
        <ellipse cx={148} cy={114} rx={11} ry={7} fill="#F4869A" opacity={0.65} />
      </g>
    )
  }
  return (
    <g>
      <ellipse cx={68} cy={114} rx={12} ry={8} fill="#F4869A" opacity={0.6} />
      <ellipse cx={132} cy={114} rx={12} ry={8} fill="#F4869A" opacity={0.6} />
    </g>
  )
}

// ----- MOUTH ------
function Mouth({ action = 'idle', pov = 'front' }: { action?: MascotPoseAction; pov?: MascotPOV }) {
  if (pov === 'back' || pov === 'top') return null
  const isProfile = pov === 'right' || pov === 'left'
  const mx = isProfile ? (pov === 'left' ? 72 : 128) : 100
  const my = 121

  if (action === 'sleep') {
    return (
      <path d={`M ${mx - 7} ${my + 2} Q ${mx} ${my + 6} ${mx + 7} ${my + 2}`}
        stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round" />
    )
  }
  if (action === 'cheer' || action === 'excited') {
    return (
      <g>
        <path d={`M ${mx - 11} ${my - 1} Q ${mx} ${my + 11} ${mx + 11} ${my - 1}`}
          fill="#1A1A1A" />
        <path d={`M ${mx - 11} ${my - 1} Q ${mx} ${my + 11} ${mx + 11} ${my - 1}`}
          fill="#C03060" stroke="none" />
        {/* Teeth */}
        <path d={`M ${mx - 7} ${my - 1} Q ${mx} ${my + 10} ${mx + 7} ${my - 1}`}
          fill="white" />
      </g>
    )
  }
  if (action === 'sad') {
    return (
      <path d={`M ${mx - 9} ${my + 4} Q ${mx} ${my} ${mx + 9} ${my + 4}`}
        stroke="#1A1A1A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    )
  }
  // Default happy smile (slight open mouth)
  return (
    <g>
      <path d={`M ${mx - 9} ${my} Q ${mx} ${my + 9} ${mx + 9} ${my}`}
        fill="#1A1A1A" />
      <path d={`M ${mx - 9} ${my} Q ${mx} ${my + 8} ${mx + 9} ${my}`}
        fill="#C03060" />
      <path d={`M ${mx - 7} ${my} Q ${mx} ${my + 6} ${mx + 7} ${my}`}
        fill="white" />
    </g>
  )
}

// ----- BODY WITH STRIPES ------
function Body({ id, pov = 'front' }: { id: string; pov?: MascotPOV }) {
  if (pov === 'top') {
    // From above: just the yellow oval top of body
    return (
      <g>
        <ellipse cx={100} cy={175} rx={48} ry={42} fill={`url(#${id}-body-grad)`} stroke="#D4960A" strokeWidth="1.5" />
        {/* Stripes as curved horizontal lines */}
        <path d="M 55 165 Q 100 160 145 165" stroke="#1A1A1A" strokeWidth="8" fill="none" strokeLinecap="round" opacity={0.9} />
        <path d="M 54 183 Q 100 178 146 183" stroke="#1A1A1A" strokeWidth="8" fill="none" strokeLinecap="round" opacity={0.9} />
      </g>
    )
  }
  if (pov === 'bottom') {
    return (
      <g>
        <ellipse cx={100} cy={175} rx={48} ry={42} fill={`url(#${id}-body-grad)`} stroke="#D4960A" strokeWidth="1.5" />
        <path d="M 56 170 Q 100 165 144 170" stroke="#1A1A1A" strokeWidth="7" fill="none" strokeLinecap="round" opacity={0.85} />
        <path d="M 55 188 Q 100 183 145 188" stroke="#1A1A1A" strokeWidth="7" fill="none" strokeLinecap="round" opacity={0.85} />
      </g>
    )
  }
  if (pov === 'right' || pov === 'left') {
    const flip = pov === 'left'
    return (
      <g transform={flip ? 'scale(-1,1) translate(-200,0)' : ''}>
        <ellipse cx={110} cy={175} rx={42} ry={40} fill={`url(#${id}-body-grad)`} stroke="#D4960A" strokeWidth="1.5" />
        {/* Stripes from profile */}
        <path d="M 70 162 Q 110 157 152 162" stroke="#1A1A1A" strokeWidth="9" fill="none" strokeLinecap="round" opacity={0.9} />
        <path d="M 68 180 Q 110 175 153 180" stroke="#1A1A1A" strokeWidth="9" fill="none" strokeLinecap="round" opacity={0.9} />
        <path d="M 70 198 Q 110 193 152 198" stroke="#1A1A1A" strokeWidth="9" fill="none" strokeLinecap="round" opacity={0.9} />
      </g>
    )
  }

  // Front / 3/4 / back
  return (
    <g>
      {/* Main body ellipse */}
      <ellipse cx={100} cy={177} rx={50} ry={44} fill={`url(#${id}-body-grad)`} stroke="#D4960A" strokeWidth="1.5" />
      {/* Black stripe bands - curved to follow body shape */}
      {/* Stripe 1 - top (neckerchief area) */}
      <path d="M 52 157 Q 100 151 148 157 Q 148 167 100 167 Q 52 167 52 157 Z"
        fill="#1A1A1A" opacity={0.92} />
      {/* Stripe 2 - middle */}
      <path d="M 52 175 Q 100 170 148 175 Q 148 185 100 185 Q 52 185 52 175 Z"
        fill="#1A1A1A" opacity={0.92} />
      {/* Stripe 3 - lower */}
      <path d="M 54 196 Q 100 191 146 196 Q 146 205 100 205 Q 54 205 54 196 Z"
        fill="#1A1A1A" opacity={0.90} />
    </g>
  )
}

// ----- NECKERCHIEF ------
function Neckerchief({ pov = 'front' }: { pov?: MascotPOV }) {
  if (pov === 'top' || pov === 'bottom') return null
  if (pov === 'back') {
    // From back: neckerchief knot visible at left side
    return (
      <g>
        {/* The wrap going around */}
        <path d="M 55 148 Q 100 142 145 148 Q 145 158 100 160 Q 55 158 55 148 Z"
          fill="#222222" />
        {/* Knot on right side from back = left side from front */}
        <circle cx={148} cy={152} r={7} fill="#1A1A1A" />
        {/* Tail ends */}
        <path d="M 148 152 L 162 160 L 158 168" stroke="#1A1A1A" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M 148 152 L 155 168 L 150 178" stroke="#1A1A1A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      </g>
    )
  }
  if (pov === 'right') {
    return (
      <g>
        <path d="M 70 148 Q 110 142 152 148 Q 152 158 110 160 Q 70 158 70 148 Z"
          fill="#222222" />
        {/* Knot at far right (visible) */}
        <circle cx={70} cy={152} r={6} fill="#1A1A1A" />
        <path d="M 70 152 L 56 161 L 61 170" stroke="#1A1A1A" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M 70 152 L 63 168 L 68 178" stroke="#1A1A1A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      </g>
    )
  }
  if (pov === 'left') {
    return (
      <g transform="scale(-1,1) translate(-200,0)">
        <path d="M 70 148 Q 110 142 152 148 Q 152 158 110 160 Q 70 158 70 148 Z"
          fill="#222222" />
        <circle cx={70} cy={152} r={6} fill="#1A1A1A" />
        <path d="M 70 152 L 56 161 L 61 170" stroke="#1A1A1A" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M 70 152 L 63 168 L 68 178" stroke="#1A1A1A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      </g>
    )
  }

  // Front: neckerchief wraps bottom of head/neck area
  return (
    <g>
      {/* Main neckerchief band */}
      <path d="M 52 150 Q 100 144 148 150 Q 148 161 100 163 Q 52 161 52 150 Z"
        fill="#222222" />
      {/* Knot at left side */}
      <circle cx={58} cy={155} r={8} fill="#1A1A1A" />
      {/* Bow ears */}
      <ellipse cx={48} cy={150} rx={8} ry={5} fill="#1A1A1A" transform="rotate(-20 48 150)" />
      <ellipse cx={48} cy={161} rx={8} ry={5} fill="#1A1A1A" transform="rotate(20 48 161)" />
      {/* Tail ends of bow */}
      <path d="M 58 155 L 42 165 L 46 176" stroke="#1A1A1A" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M 58 155 L 46 170 L 50 182" stroke="#1A1A1A" strokeWidth="5" fill="none" strokeLinecap="round" />
    </g>
  )
}

// ----- SATCHEL BAG ------
function Satchel({ pov = 'front', action = 'idle' }: { pov?: MascotPOV; action?: MascotPoseAction }) {
  if (pov === 'top') return null

  if (pov === 'back') {
    // Behind: bag visible on left side
    return (
      <g>
        {/* Strap going left-to-right across back */}
        <line x1={80} y1={152} x2={148} y2={200} stroke="#7A3B1E" strokeWidth="3.5" strokeLinecap="round" />
        {/* Bag on right */}
        <rect x={138} y={188} width={30} height={26} rx={5} fill="#7A3B1E" stroke="#5A2A14" strokeWidth="1.5" />
        <rect x={138} y={188} width={30} height={10} rx={4} fill="#8C4525" />
      </g>
    )
  }
  if (pov === 'right') {
    return (
      <g>
        <line x1={130} y1={152} x2={80} y2={198} stroke="#7A3B1E" strokeWidth="3.5" strokeLinecap="round" />
        <rect x={58} y={186} width={34} height={30} rx={6} fill="#7A3B1E" stroke="#5A2A14" strokeWidth="1.5" />
        <rect x={58} y={186} width={34} height={12} rx={5} fill="#8C4525" />
        <circle cx={75} cy={192} r={3} fill="#C07040" />
      </g>
    )
  }
  if (pov === 'left') {
    return (
      <g transform="scale(-1,1) translate(-200,0)">
        <line x1={130} y1={152} x2={80} y2={198} stroke="#7A3B1E" strokeWidth="3.5" strokeLinecap="round" />
        <rect x={58} y={186} width={34} height={30} rx={6} fill="#7A3B1E" stroke="#5A2A14" strokeWidth="1.5" />
        <rect x={58} y={186} width={34} height={12} rx={5} fill="#8C4525" />
        <circle cx={75} cy={192} r={3} fill="#C07040" />
      </g>
    )
  }

  // Front: strap goes from upper right shoulder down to lower left where bag hangs
  return (
    <g>
      {/* Shoulder strap - goes from right shoulder diagonally to lower left */}
      <line x1={132} y1={155} x2={80} y2={205} stroke="#7A3B1E" strokeWidth="3.5" strokeLinecap="round" />
      {/* Bag body - bottom left area */}
      <rect x={62} y={192} width={40} height={36} rx={7} fill="#7A3B1E" stroke="#5A2A14" strokeWidth="1.5" />
      {/* Bag flap */}
      <rect x={62} y={192} width={40} height={16} rx={6} fill="#8C4525" />
      {/* Flap bottom curve */}
      <path d="M 62 207 Q 82 212 102 207" fill="#8C4525" stroke="none" />
      {/* Flap clasp button */}
      <circle cx={82} cy={204} r={4} fill="#C07040" stroke="#8B5020" strokeWidth="1" />
      {/* Bag highlight */}
      <rect x={65} y={195} width={15} height={8} rx={3} fill="#9C5530" opacity={0.4} />
    </g>
  )
}

// ----- ARMS ------
function Arms({ pov = 'front', action = 'idle' }: { pov?: MascotPOV; action?: MascotPoseAction }) {
  if (pov === 'back') {
    // Arms visible from back
    return (
      <g>
        <ellipse cx={52} cy={175} rx={16} ry={10} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5"
          transform="rotate(-20 52 175)" />
        <ellipse cx={148} cy={175} rx={16} ry={10} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5"
          transform="rotate(20 148 175)" />
      </g>
    )
  }
  if (pov === 'top') {
    // From above: arms as small ovals
    return (
      <g>
        <ellipse cx={55} cy={168} rx={12} ry={8} fill="#F5B800" stroke="#D4960A" strokeWidth="1.2" />
        <ellipse cx={145} cy={168} rx={12} ry={8} fill="#F5B800" stroke="#D4960A" strokeWidth="1.2" />
      </g>
    )
  }
  if (pov === 'bottom') {
    return null
  }
  if (pov === 'right') {
    // Profile: one arm visible holding scroll
    return (
      <g>
        {/* Far arm (behind body) - subtle */}
        <ellipse cx={68} cy={174} rx={14} ry={9} fill="#E8A800" stroke="#C88800" strokeWidth="1.2"
          transform="rotate(15 68 174)" />
        {/* Near arm holding scroll */}
        <ellipse cx={152} cy={174} rx={16} ry={10} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5"
          transform="rotate(-15 152 174)" />
        {/* Scroll */}
        <ellipse cx={163} cy={174} rx={6} ry={10} fill="#F5E8C0" stroke="#C0A050" strokeWidth="1.2" />
        <ellipse cx={163} cy={165} rx={6} ry={3.5} fill="#E8C870" stroke="#C0A050" strokeWidth="1" />
        <ellipse cx={163} cy={183} rx={6} ry={3.5} fill="#E8C870" stroke="#C0A050" strokeWidth="1" />
      </g>
    )
  }
  if (pov === 'left') {
    return (
      <g transform="scale(-1,1) translate(-200,0)">
        <ellipse cx={68} cy={174} rx={14} ry={9} fill="#E8A800" stroke="#C88800" strokeWidth="1.2"
          transform="rotate(15 68 174)" />
        <ellipse cx={152} cy={174} rx={16} ry={10} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5"
          transform="rotate(-15 152 174)" />
        <ellipse cx={163} cy={174} rx={6} ry={10} fill="#F5E8C0" stroke="#C0A050" strokeWidth="1.2" />
        <ellipse cx={163} cy={165} rx={6} ry={3.5} fill="#E8C870" stroke="#C0A050" strokeWidth="1" />
        <ellipse cx={163} cy={183} rx={6} ry={3.5} fill="#E8C870" stroke="#C0A050" strokeWidth="1" />
      </g>
    )
  }

  // Front - arms out to sides
  if (action === 'wave') {
    return (
      <g>
        {/* Left arm down */}
        <path d="M 52 162 Q 36 172 32 183" stroke="#F5B800" strokeWidth="16" fill="none" strokeLinecap="round" />
        <path d="M 52 162 Q 36 172 32 183" stroke="#D4960A" strokeWidth="16" fill="none" strokeLinecap="round" opacity={0.3} />
        <ellipse cx={30} cy={186} rx={9} ry={7} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5" />
        {/* Right arm raised + waving */}
        <path d="M 148 162 Q 162 148 168 134" stroke="#F5B800" strokeWidth="16" fill="none" strokeLinecap="round" />
        <ellipse cx={170} cy={130} rx={9} ry={7} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5"
          transform="rotate(-30 170 130)" />
      </g>
    )
  }
  if (action === 'thumbsup') {
    return (
      <g>
        {/* Left arm normal */}
        <path d="M 52 162 Q 36 172 32 185" stroke="#F5B800" strokeWidth="16" fill="none" strokeLinecap="round" />
        <ellipse cx={30} cy={188} rx={9} ry={7} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5" />
        {/* Right arm raised with thumb up */}
        <path d="M 148 162 Q 160 155 162 142" stroke="#F5B800" strokeWidth="16" fill="none" strokeLinecap="round" />
        {/* Thumb */}
        <ellipse cx={162} cy={137} rx={8} ry={10} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5" />
        <path d="M 157 140 Q 162 132 167 140" fill="#F5B800" stroke="#D4960A" strokeWidth="1" />
      </g>
    )
  }
  if (action === 'thinking') {
    return (
      <g>
        {/* Left arm down */}
        <path d="M 52 162 Q 38 170 36 182" stroke="#F5B800" strokeWidth="16" fill="none" strokeLinecap="round" />
        <ellipse cx={34} cy={185} rx={9} ry={7} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5" />
        {/* Right arm raised to chin */}
        <path d="M 148 162 Q 155 155 148 148" stroke="#F5B800" strokeWidth="14" fill="none" strokeLinecap="round" />
        <ellipse cx={144} cy={144} rx={8} ry={7} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5" />
      </g>
    )
  }
  if (action === 'cheer' || action === 'excited') {
    return (
      <g>
        {/* Both arms raised */}
        <path d="M 52 162 Q 36 148 32 134" stroke="#F5B800" strokeWidth="16" fill="none" strokeLinecap="round" />
        <ellipse cx={30} cy={130} rx={9} ry={7} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5"
          transform="rotate(30 30 130)" />
        <path d="M 148 162 Q 164 148 168 134" stroke="#F5B800" strokeWidth="16" fill="none" strokeLinecap="round" />
        <ellipse cx={170} cy={130} rx={9} ry={7} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5"
          transform="rotate(-30 170 130)" />
      </g>
    )
  }

  // Default: arms out to sides (front idle)
  return (
    <g>
      {/* Left arm */}
      <path d="M 53 165 Q 36 170 28 180" stroke="#F5B800" strokeWidth="17" fill="none" strokeLinecap="round" />
      <path d="M 53 165 Q 36 170 28 180" stroke="#D4960A" strokeWidth="17" fill="none" strokeLinecap="round" opacity={0.25} />
      <ellipse cx={25} cy={183} rx={10} ry={8} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5" />
      {/* Right arm */}
      <path d="M 147 165 Q 164 170 172 180" stroke="#F5B800" strokeWidth="17" fill="none" strokeLinecap="round" />
      <path d="M 147 165 Q 164 170 172 180" stroke="#D4960A" strokeWidth="17" fill="none" strokeLinecap="round" opacity={0.25} />
      <ellipse cx={175} cy={183} rx={10} ry={8} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5" />
    </g>
  )
}

// ----- LEGS / FEET ------
function Legs({ pov = 'front' }: { pov?: MascotPOV }) {
  if (pov === 'top') return null
  if (pov === 'back') {
    return (
      <g>
        <ellipse cx={82} cy={228} rx={14} ry={9} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5" />
        <ellipse cx={118} cy={228} rx={14} ry={9} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5" />
      </g>
    )
  }
  if (pov === 'right' || pov === 'left') {
    const flip = pov === 'left'
    return (
      <g transform={flip ? 'scale(-1,1) translate(-200,0)' : ''}>
        <ellipse cx={90} cy={228} rx={12} ry={9} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5" />
        <ellipse cx={120} cy={228} rx={12} ry={9} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5" />
      </g>
    )
  }
  if (pov === 'bottom') {
    return (
      <g>
        <ellipse cx={80} cy={225} rx={16} ry={10} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5" />
        <ellipse cx={120} cy={225} rx={16} ry={10} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5" />
        {/* Foot bottom detail */}
        <ellipse cx={80} cy={226} rx={10} ry={5} fill="#D4960A" opacity={0.3} />
        <ellipse cx={120} cy={226} rx={10} ry={5} fill="#D4960A" opacity={0.3} />
      </g>
    )
  }
  // Front
  return (
    <g>
      {/* Left leg */}
      <path d="M 85 215 Q 80 224 78 230" stroke="#F5B800" strokeWidth="16" fill="none" strokeLinecap="round" />
      <ellipse cx={77} cy={232} rx={14} ry={9} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5" />
      {/* Right leg */}
      <path d="M 115 215 Q 120 224 122 230" stroke="#F5B800" strokeWidth="16" fill="none" strokeLinecap="round" />
      <ellipse cx={123} cy={232} rx={14} ry={9} fill="#F5B800" stroke="#D4960A" strokeWidth="1.5" />
      {/* Black stinger tip between feet */}
      <path d="M 100 218 L 100 226 L 96 232 M 100 226 L 104 232" stroke="#1A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  )
}

// ----- HEAD ------
function Head({ id, pov = 'front' }: { id: string; pov?: MascotPOV }) {
  if (pov === 'top') {
    // Top view: head from above
    return (
      <ellipse cx={100} cy={100} rx={62} ry={55} fill={`url(#${id}-head-grad)`} stroke="#D4960A" strokeWidth="2" />
    )
  }
  if (pov === 'bottom') {
    // Bottom: underside of body/head
    return (
      <ellipse cx={100} cy={175} rx={55} ry={48} fill={`url(#${id}-body-grad)`} stroke="#D4960A" strokeWidth="1.5" />
    )
  }
  if (pov === 'back') {
    return (
      <ellipse cx={100} cy={87} rx={62} ry={62} fill={`url(#${id}-head-grad)`} stroke="#D4960A" strokeWidth="2" />
    )
  }
  if (pov === 'right') {
    // Profile: slightly squished ellipse
    return (
      <ellipse cx={105} cy={87} rx={58} ry={62} fill={`url(#${id}-head-grad)`} stroke="#D4960A" strokeWidth="2" />
    )
  }
  if (pov === 'left') {
    return (
      <ellipse cx={95} cy={87} rx={58} ry={62} fill={`url(#${id}-head-grad)`} stroke="#D4960A" strokeWidth="2" />
    )
  }
  // Front / 3/4
  return (
    <ellipse cx={100} cy={87} rx={63} ry={64} fill={`url(#${id}-head-grad)`} stroke="#D4960A" strokeWidth="2" />
  )
}

// ============================================================
// DEFS - Gradients, filters
// ============================================================
function Defs({ id }: { id: string }) {
  return (
    <defs>
      {/* Head gradient - golden yellow with warm light from top-left */}
      <radialGradient id={`${id}-head-grad`} cx="38%" cy="30%" r="65%" fx="38%" fy="30%">
        <stop offset="0%" stopColor="#FFE066" />
        <stop offset="45%" stopColor="#FFCF00" />
        <stop offset="100%" stopColor="#D4960A" />
      </radialGradient>

      {/* Body gradient */}
      <radialGradient id={`${id}-body-grad`} cx="40%" cy="30%" r="65%" fx="40%" fy="30%">
        <stop offset="0%" stopColor="#FFD830" />
        <stop offset="50%" stopColor="#F5B800" />
        <stop offset="100%" stopColor="#C88800" />
      </radialGradient>

      {/* Wing fill - light blue translucent */}
      <linearGradient id={`${id}-wing-fill`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D4EEF8" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#A8D4E8" stopOpacity="0.75" />
      </linearGradient>

      {/* Goggle lens radial glow */}
      <radialGradient id={`${id}-lens-radial`} cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#38C8AA" stopOpacity="0.6" />
        <stop offset="60%" stopColor="#1A8A7A" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#0D5548" stopOpacity="0.1" />
      </radialGradient>

      {/* Drop shadow filter */}
      <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#C88800" floodOpacity="0.3" />
      </filter>
    </defs>
  )
}

// ============================================================
// ANIMATION CSS
// ============================================================
const MASCOT_KEYFRAMES = `
@keyframes otbee-idle-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}
@keyframes otbee-wing-flutter {
  0%, 100% { transform: scaleY(1) scaleX(1); }
  50% { transform: scaleY(0.85) scaleX(1.08); }
}
@keyframes otbee-bounce {
  0%, 100% { transform: translateY(0px) scaleY(1); }
  40% { transform: translateY(-18px) scaleY(1.05); }
  60% { transform: translateY(-15px) scaleY(1.05); }
  80% { transform: translateY(-2px) scaleY(0.96); }
}
@keyframes otbee-wave {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
@keyframes otbee-cheer {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-12px) rotate(-3deg); }
  75% { transform: translateY(-12px) rotate(3deg); }
}
@keyframes otbee-salto {
  0% { transform: translateY(0) rotate(0deg) scale(1); }
  20% { transform: translateY(-25px) rotate(90deg) scale(1.08); }
  50% { transform: translateY(-35px) rotate(180deg) scale(1.1); }
  80% { transform: translateY(-15px) rotate(270deg) scale(1.05); }
  100% { transform: translateY(0) rotate(360deg) scale(1); }
}
@keyframes otbee-thinking {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  30% { transform: rotate(-3deg) translateY(-2px); }
  70% { transform: rotate(3deg) translateY(-2px); }
}
@keyframes otbee-sleep {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(4px) rotate(2deg); }
}
@keyframes otbee-run {
  0%, 100% { transform: translateX(0) skewX(0deg); }
  25% { transform: translateX(3px) skewX(-4deg); }
  75% { transform: translateX(-3px) skewX(4deg); }
}
@keyframes otbee-happy {
  0%, 100% { transform: translateY(0) scaleX(1); }
  25% { transform: translateY(-8px) scaleX(1.05); }
  50% { transform: translateY(-6px) scaleX(0.97); }
  75% { transform: translateY(-10px) scaleX(1.03); }
}
@keyframes otbee-wing-fast {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.6); }
}
`

function getAnimStyle(action: MascotPoseAction): React.CSSProperties {
  switch (action) {
    case 'idle':
      return { animation: 'otbee-idle-float 3s ease-in-out infinite' }
    case 'bounce':
      return { animation: 'otbee-bounce 0.7s cubic-bezier(0.36,0.07,0.19,0.97) infinite' }
    case 'wave':
      return { animation: 'otbee-wave 1.5s ease-in-out infinite' }
    case 'cheer':
      return { animation: 'otbee-cheer 0.8s ease-in-out infinite' }
    case 'thumbsup':
      return { animation: 'otbee-happy 1.2s ease-in-out infinite' }
    case 'thinking':
      return { animation: 'otbee-thinking 2s ease-in-out infinite' }
    case 'sleep':
      return { animation: 'otbee-sleep 2.5s ease-in-out infinite' }
    case 'salto':
      return { animation: 'otbee-salto 0.9s cubic-bezier(0.4,0,0.2,1) forwards' }
    case 'run':
      return { animation: 'otbee-run 0.4s linear infinite' }
    case 'happy':
      return { animation: 'otbee-happy 0.9s ease-in-out infinite' }
    case 'excited':
      return { animation: 'otbee-cheer 0.5s ease-in-out infinite' }
    default:
      return {}
  }
}

// ============================================================
// WING ANIMATION - animated separately
// ============================================================
function AnimatedWings({ id, action, pov }: { id: string; action: MascotPoseAction; pov: MascotPOV }) {
  const wingAnim = (action === 'run' || action === 'bounce' || action === 'salto' || action === 'cheer' || action === 'excited')
    ? { animation: 'otbee-wing-fast 0.2s ease-in-out infinite', transformOrigin: 'center' }
    : { animation: 'otbee-wing-flutter 1.4s ease-in-out infinite', transformOrigin: 'center' }

  if (pov === 'back') {
    // Back: 4 wings spread wide
    return (
      <g style={wingAnim}>
        {/* Upper left large */}
        <ellipse cx={62} cy={112} rx={40} ry={28} transform="rotate(-40 62 112)"
          fill={`url(#${id}-wing-fill)`} stroke="#8EC5D6" strokeWidth="1.3" opacity={0.9} />
        {/* Lower left */}
        <ellipse cx={72} cy={148} rx={25} ry={16} transform="rotate(-25 72 148)"
          fill={`url(#${id}-wing-fill)`} stroke="#8EC5D6" strokeWidth="1.1" opacity={0.8} />
        {/* Upper right large */}
        <ellipse cx={138} cy={112} rx={40} ry={28} transform="rotate(40 138 112)"
          fill={`url(#${id}-wing-fill)`} stroke="#8EC5D6" strokeWidth="1.3" opacity={0.9} />
        {/* Lower right */}
        <ellipse cx={128} cy={148} rx={25} ry={16} transform="rotate(25 128 148)"
          fill={`url(#${id}-wing-fill)`} stroke="#8EC5D6" strokeWidth="1.1" opacity={0.8} />
      </g>
    )
  }
  if (pov === 'top') {
    return (
      <g style={wingAnim}>
        <ellipse cx={52} cy={125} rx={38} ry={22} transform="rotate(-15 52 125)"
          fill={`url(#${id}-wing-fill)`} stroke="#8EC5D6" strokeWidth="1.2" opacity={0.85} />
        <ellipse cx={148} cy={125} rx={38} ry={22} transform="rotate(15 148 125)"
          fill={`url(#${id}-wing-fill)`} stroke="#8EC5D6" strokeWidth="1.2" opacity={0.85} />
      </g>
    )
  }
  if (pov === 'right') {
    return (
      <g style={wingAnim}>
        {/* Wings visible from right: both going right */}
        <ellipse cx={62} cy={130} rx={35} ry={22} transform="rotate(-35 62 130)"
          fill={`url(#${id}-wing-fill)`} stroke="#8EC5D6" strokeWidth="1.2" opacity={0.85} />
        <ellipse cx={68} cy={158} rx={22} ry={14} transform="rotate(-20 68 158)"
          fill={`url(#${id}-wing-fill)`} stroke="#8EC5D6" strokeWidth="1" opacity={0.75} />
      </g>
    )
  }
  if (pov === 'left') {
    return (
      <g style={{ ...wingAnim, transform: 'scaleX(-1)', transformOrigin: '100px center' }}>
        <ellipse cx={62} cy={130} rx={35} ry={22} transform="rotate(-35 62 130)"
          fill={`url(#${id}-wing-fill)`} stroke="#8EC5D6" strokeWidth="1.2" opacity={0.85} />
        <ellipse cx={68} cy={158} rx={22} ry={14} transform="rotate(-20 68 158)"
          fill={`url(#${id}-wing-fill)`} stroke="#8EC5D6" strokeWidth="1" opacity={0.75} />
      </g>
    )
  }
  // Front / 3/4
  return (
    <g style={wingAnim}>
      <WingLeft id={id} />
      <WingRight id={id} />
    </g>
  )
}

// ============================================================
// SLEEP ZZZ particles
// ============================================================
function SleepZzz() {
  return (
    <g style={{ animation: 'otbee-idle-float 2s ease-in-out infinite' }}>
      <text x={138} y={68} fontSize={12} fill="#A0C8E8" fontWeight="bold" opacity={0.8}>z</text>
      <text x={148} y={56} fontSize={16} fill="#A0C8E8" fontWeight="bold" opacity={0.7}>z</text>
      <text x={160} y={42} fontSize={20} fill="#A0C8E8" fontWeight="bold" opacity={0.6}>z</text>
    </g>
  )
}

// ============================================================
// THINKING BUBBLE
// ============================================================
function ThinkingBubble() {
  return (
    <g style={{ animation: 'otbee-idle-float 2.5s ease-in-out infinite reverse' }}>
      <circle cx={148} cy={72} r={3} fill="#D4960A" opacity={0.5} />
      <circle cx={158} cy={62} r={5} fill="#D4960A" opacity={0.4} />
      <circle cx={170} cy={50} r={8} fill="#FFF8E0" stroke="#D4960A" strokeWidth="1.2" opacity={0.8} />
      <text x={165} y={55} fontSize={10} fill="#D4960A">?</text>
    </g>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function OtbeeVectorMascot({
  pov = 'front',
  action = 'idle',
  size = 120,
  className = '',
  style,
  onClick,
  onHover,
}: OtbeeVectorMascotProps) {
  const uid = useId().replace(/:/g, '')
  const id = `otbee-${uid}`
  const blink = useBlinkTimer()

  const animStyle = getAnimStyle(action)
  const isClickable = !!onClick

  return (
    <>
      <style>{MASCOT_KEYFRAMES}</style>
      <svg
        viewBox="0 0 200 240"
        width={size}
        height={size * 1.2}
        className={`select-none ${isClickable ? 'cursor-pointer' : ''} ${className}`}
        style={{ display: 'block', overflow: 'visible', ...style }}
        onClick={onClick}
        onMouseEnter={onHover}
        aria-label="Otbee mascot"
        role={isClickable ? 'button' : 'img'}
      >
        <Defs id={id} />

        {/* Animated wrapper - body anim */}
        <g style={{ transformOrigin: '100px 190px', ...animStyle }}>
          {/* Wings BEHIND body (render first) */}
          <AnimatedWings id={id} action={action} pov={pov} />

          {/* Legs */}
          <Legs pov={pov} />

          {/* Body with stripes */}
          <Body id={id} pov={pov} />

          {/* Neckerchief */}
          <Neckerchief pov={pov} />

          {/* Satchel */}
          <Satchel pov={pov} action={action} />

          {/* Arms */}
          <Arms pov={pov} action={action} />

          {/* Head */}
          <Head id={id} pov={pov} />

          {/* Antennae */}
          <Antennae pov={pov} />

          {/* Goggles (on head) */}
          <Goggles id={id} pov={pov} />

          {/* Eyes */}
          <Eyes id={id} blink={blink} pov={pov} action={action} />

          {/* Blush */}
          <Cheeks pov={pov} />

          {/* Mouth */}
          <Mouth action={action} pov={pov} />

          {/* Action-specific extras */}
          {action === 'sleep' && <SleepZzz />}
          {action === 'thinking' && <ThinkingBubble />}
        </g>
      </svg>
    </>
  )
}

// ============================================================
// HEAD-ONLY VARIANT (for chatbot trigger icon)
// ============================================================
export function OtbeeVectorHead({
  size = 48,
  className = '',
  style,
  onClick,
}: {
  size?: number
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}) {
  const uid = useId().replace(/:/g, '')
  const id = `otbee-head-${uid}`
  const blink = useBlinkTimer()

  // Head viewBox: crop to just the head area (x:30, y:0, w:140, h:155)
  return (
    <>
      <style>{MASCOT_KEYFRAMES}</style>
      <svg
        viewBox="30 0 140 155"
        width={size}
        height={size}
        className={`select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
        style={{ display: 'block', overflow: 'visible', ...style }}
        onClick={onClick}
        aria-label="Otbee head"
      >
        <Defs id={id} />
        <g style={{ animation: 'otbee-idle-float 3s ease-in-out infinite', transformOrigin: '100px 87px' }}>
          {/* Wing tips barely visible */}
          <ellipse cx={52} cy={128} rx={22} ry={14} transform="rotate(-28 52 128)"
            fill={`url(#${id}-wing-fill)`} stroke="#8EC5D6" strokeWidth="1" opacity={0.6} />
          {/* Neckerchief top part */}
          <path d="M 52 150 Q 100 144 148 150 Q 148 161 100 163 Q 52 161 52 150 Z"
            fill="#222222" />
          <circle cx={58} cy={155} r={8} fill="#1A1A1A" />
          <ellipse cx={48} cy={150} rx={7} ry={4.5} fill="#1A1A1A" transform="rotate(-20 48 150)" />
          <ellipse cx={48} cy={161} rx={7} ry={4.5} fill="#1A1A1A" transform="rotate(20 48 161)" />
          {/* Head */}
          <ellipse cx={100} cy={87} rx={63} ry={64} fill={`url(#${id}-head-grad)`} stroke="#D4960A" strokeWidth="2" />
          {/* Antennae */}
          <Antennae pov="front" />
          {/* Goggles */}
          <Goggles id={id} pov="front" />
          {/* Eyes */}
          <Eyes id={id} blink={blink} pov="front" action="idle" />
          {/* Cheeks */}
          <Cheeks pov="front" />
          {/* Mouth */}
          <Mouth action="idle" pov="front" />
        </g>
      </svg>
    </>
  )
}
