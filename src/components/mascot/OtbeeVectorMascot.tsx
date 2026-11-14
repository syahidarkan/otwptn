'use client'

/**
 * OtbeeVectorMascot - Pure hardcoded 2D SVG mascot
 *
 * PROPORTIONS (from pixel analysis of reference PNGs):
 * ViewBox: 220 x 280
 * HEAD (back/front): near-perfect circle, cx=110 cy=90, r=72
 * HEAD (right/left): very wide oval, rx=75 ry=62 - wider than tall
 * BODY: rounded rect-ish shape, sits below head overlapping slightly
 *       body center ~cy=195, rx=52 ry=48 - shorter/fatter than expected
 * HEAD occupies top ~50% of total character height
 * Default "front" pose = 3/4 angle (slight turn, not perfectly frontal)
 *
 * POV analysis from reference:
 * - BACK: head = perfect circle, body = rounded rect taller than wide
 * - RIGHT/LEFT: head = very wide ellipse (rx >> ry), body = oval
 * - FRONT: labelled "FRONT" in sheet but Otbee is very slightly 3/4
 * - 3/4 FRONT: more pronounced 3/4 angle
 */

import React, { useId, useEffect, useState } from 'react'

export type MascotPOV = 'front' | 'right' | 'left' | 'back' | 'top' | 'bottom' | '3/4'
export type MascotPoseAction =
  | 'idle' | 'bounce' | 'wave' | 'cheer' | 'thumbsup'
  | 'thinking' | 'sleep' | 'salto' | 'run' | 'happy' | 'sad' | 'excited' | 'none'

interface OtbeeVectorMascotProps {
  pov?: MascotPOV
  action?: MascotPoseAction
  size?: number
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  onHover?: () => void
}

// ============================================================
// BLINK TIMER
// ============================================================
function useBlinkTimer() {
  const [blink, setBlink] = useState(false)
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const schedule = () => {
      t = setTimeout(() => {
        setBlink(true)
        setTimeout(() => { setBlink(false); schedule() }, 120)
      }, 2800 + Math.random() * 3200)
    }
    schedule()
    return () => clearTimeout(t)
  }, [])
  return blink
}

// ============================================================
// DEFS
// ============================================================
function Defs({ id }: { id: string }) {
  return (
    <defs>
      {/* Head gradient - warm golden, light from upper-left */}
      <radialGradient id={`${id}-hg`} cx="35%" cy="28%" r="68%">
        <stop offset="0%" stopColor="#FFE566" />
        <stop offset="40%" stopColor="#FFD100" />
        <stop offset="100%" stopColor="#C8900A" />
      </radialGradient>
      {/* Body gradient */}
      <radialGradient id={`${id}-bg`} cx="38%" cy="25%" r="70%">
        <stop offset="0%" stopColor="#FFD830" />
        <stop offset="50%" stopColor="#F5B800" />
        <stop offset="100%" stopColor="#B87800" />
      </radialGradient>
      {/* Wing fill */}
      <linearGradient id={`${id}-wf`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#DCF0FA" stopOpacity="0.92" />
        <stop offset="100%" stopColor="#A8D4EC" stopOpacity="0.72" />
      </linearGradient>
      {/* Goggle lens radial */}
      <radialGradient id={`${id}-lr`} cx="32%" cy="28%" r="72%">
        <stop offset="0%" stopColor="#48D8B8" stopOpacity="0.7" />
        <stop offset="55%" stopColor="#1A8A72" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#0A5040" stopOpacity="0.1" />
      </radialGradient>
      {/* Arm gradient */}
      <radialGradient id={`${id}-ag`} cx="40%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#FFD830" />
        <stop offset="100%" stopColor="#D49008" />
      </radialGradient>
    </defs>
  )
}

// ============================================================
// CSS ANIMATIONS
// ============================================================
const KEYFRAMES = `
@keyframes ob-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes ob-bounce { 0%,100%{transform:translateY(0) scaleY(1)} 40%{transform:translateY(-20px) scaleY(1.04)} 70%{transform:translateY(-16px) scaleY(1.04)} 85%{transform:translateY(-2px) scaleY(0.96)} }
@keyframes ob-wave { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
@keyframes ob-cheer { 0%,100%{transform:translateY(0) rotate(0deg)} 25%{transform:translateY(-14px) rotate(-4deg)} 75%{transform:translateY(-14px) rotate(4deg)} }
@keyframes ob-salto { 0%{transform:rotate(0deg) scale(1) translateY(0)} 25%{transform:rotate(90deg) scale(1.08) translateY(-28px)} 55%{transform:rotate(200deg) scale(1.1) translateY(-38px)} 80%{transform:rotate(300deg) scale(1.05) translateY(-18px)} 100%{transform:rotate(360deg) scale(1) translateY(0)} }
@keyframes ob-think { 0%,100%{transform:rotate(0deg)} 35%{transform:rotate(-3deg) translateY(-2px)} 70%{transform:rotate(3deg) translateY(-2px)} }
@keyframes ob-sleep { 0%,100%{transform:rotate(-2deg) translateY(0)} 50%{transform:rotate(2deg) translateY(5px)} }
@keyframes ob-run { 0%,100%{transform:skewX(0deg)} 25%{transform:skewX(-5deg) translateX(2px)} 75%{transform:skewX(5deg) translateX(-2px)} }
@keyframes ob-happy { 0%,100%{transform:translateY(0) scaleX(1)} 30%{transform:translateY(-10px) scaleX(1.05)} 60%{transform:translateY(-7px) scaleX(0.97)} 80%{transform:translateY(-12px) scaleX(1.03)} }
@keyframes ob-wing { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.82)} }
@keyframes ob-wing-fast { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.55)} }
@keyframes ob-zzz { 0%{opacity:0;transform:translateY(0) scale(0.6)} 30%{opacity:0.9} 100%{opacity:0;transform:translateY(-18px) scale(1.1)} }
`

function getBodyAnim(action: MascotPoseAction): React.CSSProperties {
  switch (action) {
    case 'idle': return { animation: 'ob-float 3s ease-in-out infinite' }
    case 'bounce': return { animation: 'ob-bounce 0.65s cubic-bezier(0.36,0.07,0.19,0.97) infinite' }
    case 'wave': return { animation: 'ob-wave 1.6s ease-in-out infinite' }
    case 'cheer': case 'excited': return { animation: 'ob-cheer 0.75s ease-in-out infinite' }
    case 'salto': return { animation: 'ob-salto 0.85s cubic-bezier(0.4,0,0.2,1) forwards' }
    case 'thinking': return { animation: 'ob-think 2.2s ease-in-out infinite' }
    case 'sleep': return { animation: 'ob-sleep 2.5s ease-in-out infinite' }
    case 'thumbsup': case 'happy': return { animation: 'ob-happy 1s ease-in-out infinite' }
    case 'run': return { animation: 'ob-run 0.38s linear infinite' }
    default: return {}
  }
}

function getWingAnim(action: MascotPoseAction): React.CSSProperties {
  const fast = ['bounce', 'salto', 'cheer', 'excited', 'run', 'happy'].includes(action)
  return { animation: fast ? 'ob-wing-fast 0.18s ease-in-out infinite' : 'ob-wing 1.5s ease-in-out infinite', transformOrigin: 'center' }
}

// ============================================================
// WINGS
// ============================================================
function Wings({ id, pov, action }: { id: string; pov: MascotPOV; action: MascotPoseAction }) {
  const ws = getWingAnim(action)

  if (pov === 'back') {
    // 4 wings fully spread from back - butterfly shape
    return (
      <g style={ws}>
        {/* Upper left */}
        <path d="M 110 168 Q 60 148 38 118 Q 24 95 48 102 Q 72 108 90 148 Z"
          fill={`url(#${id}-wf)`} stroke="#8ECAE6" strokeWidth="1.4" opacity={0.9} />
        {/* Lower left */}
        <path d="M 110 180 Q 72 172 52 158 Q 36 145 54 148 Q 76 150 100 172 Z"
          fill={`url(#${id}-wf)`} stroke="#8ECAE6" strokeWidth="1.1" opacity={0.78} />
        {/* Upper right */}
        <path d="M 110 168 Q 160 148 182 118 Q 196 95 172 102 Q 148 108 130 148 Z"
          fill={`url(#${id}-wf)`} stroke="#8ECAE6" strokeWidth="1.4" opacity={0.9} />
        {/* Lower right */}
        <path d="M 110 180 Q 148 172 168 158 Q 184 145 166 148 Q 144 150 120 172 Z"
          fill={`url(#${id}-wf)`} stroke="#8ECAE6" strokeWidth="1.1" opacity={0.78} />
      </g>
    )
  }

  if (pov === 'right') {
    // Wings on the left side (behind body from right view)
    return (
      <g style={ws}>
        <path d="M 76 165 Q 42 148 26 122 Q 16 100 36 108 Q 58 116 72 150 Z"
          fill={`url(#${id}-wf)`} stroke="#8ECAE6" strokeWidth="1.3" opacity={0.88} />
        <path d="M 76 180 Q 50 172 36 158 Q 24 146 42 150 Q 60 154 74 174 Z"
          fill={`url(#${id}-wf)`} stroke="#8ECAE6" strokeWidth="1" opacity={0.72} />
      </g>
    )
  }

  if (pov === 'left') {
    // Wings on the right side
    return (
      <g style={ws}>
        <path d="M 144 165 Q 178 148 194 122 Q 204 100 184 108 Q 162 116 148 150 Z"
          fill={`url(#${id}-wf)`} stroke="#8ECAE6" strokeWidth="1.3" opacity={0.88} />
        <path d="M 144 180 Q 170 172 184 158 Q 196 146 178 150 Q 160 154 146 174 Z"
          fill={`url(#${id}-wf)`} stroke="#8ECAE6" strokeWidth="1" opacity={0.72} />
      </g>
    )
  }

  if (pov === 'top') {
    return (
      <g style={ws}>
        <path d="M 110 145 Q 68 130 44 110 Q 28 92 52 98 Q 78 104 100 138 Z"
          fill={`url(#${id}-wf)`} stroke="#8ECAE6" strokeWidth="1.2" opacity={0.85} />
        <path d="M 110 145 Q 152 130 176 110 Q 192 92 168 98 Q 142 104 120 138 Z"
          fill={`url(#${id}-wf)`} stroke="#8ECAE6" strokeWidth="1.2" opacity={0.85} />
      </g>
    )
  }

  // Front / 3/4 - wings behind body, left and right
  // 3/4: left wing more visible (character faces slightly right)
  const is34 = pov === '3/4'
  return (
    <g style={ws}>
      {/* Left wing (more prominent in 3/4) */}
      <path d={is34
        ? "M 72 162 Q 32 142 16 112 Q 6 88 28 98 Q 54 108 68 148 Z"
        : "M 68 162 Q 28 142 12 112 Q 2 88 24 98 Q 50 108 64 148 Z"}
        fill={`url(#${id}-wf)`} stroke="#8ECAE6" strokeWidth="1.4" opacity={0.92} />
      {/* Left lower */}
      <path d={is34
        ? "M 72 178 Q 44 170 28 154 Q 16 140 36 146 Q 56 150 70 172 Z"
        : "M 68 178 Q 40 170 24 154 Q 12 140 32 146 Q 52 150 66 172 Z"}
        fill={`url(#${id}-wf)`} stroke="#8ECAE6" strokeWidth="1.1" opacity={0.75} />
      {/* Right wing */}
      <path d={is34
        ? "M 148 162 Q 182 148 196 120 Q 206 96 186 104 Q 162 114 150 150 Z"
        : "M 152 162 Q 186 148 200 120 Q 210 96 190 104 Q 166 114 154 150 Z"}
        fill={`url(#${id}-wf)`} stroke="#8ECAE6" strokeWidth="1.3" opacity={0.82} />
      {/* Right lower */}
      <path d={is34
        ? "M 148 178 Q 170 172 182 156 Q 192 142 176 148 Q 158 154 150 174 Z"
        : "M 152 178 Q 174 172 186 156 Q 196 142 180 148 Q 162 154 154 174 Z"}
        fill={`url(#${id}-wf)`} stroke="#8ECAE6" strokeWidth="1" opacity={0.68} />
    </g>
  )
}

// ============================================================
// HEAD SHAPE
// Key insight from reference:
// - FRONT/BACK: near-perfect circle, slightly wider than tall
// - RIGHT/LEFT: very wide oval (rx >> ry), like a horizontally stretched ball
// - The head is BIG - same width as body or wider
// ============================================================
function HeadShape({ id, pov }: { id: string; pov: MascotPOV }) {
  if (pov === 'back') {
    return (
      <ellipse cx={110} cy={88} rx={72} ry={70}
        fill={`url(#${id}-hg)`} stroke="#C8900A" strokeWidth="2.5" />
    )
  }
  if (pov === 'right') {
    // Very wide oval from profile - head looks wide/fat
    return (
      <ellipse cx={112} cy={88} rx={74} ry={62}
        fill={`url(#${id}-hg)`} stroke="#C8900A" strokeWidth="2.5" />
    )
  }
  if (pov === 'left') {
    return (
      <ellipse cx={108} cy={88} rx={74} ry={62}
        fill={`url(#${id}-hg)`} stroke="#C8900A" strokeWidth="2.5" />
    )
  }
  if (pov === 'top') {
    return (
      <ellipse cx={110} cy={96} rx={70} ry={58}
        fill={`url(#${id}-hg)`} stroke="#C8900A" strokeWidth="2.5" />
    )
  }
  if (pov === 'bottom') {
    // Not much of head visible from bottom
    return null
  }
  if (pov === '3/4') {
    // 3/4 view - slightly squished on one side
    return (
      <ellipse cx={110} cy={88} rx={70} ry={68}
        fill={`url(#${id}-hg)`} stroke="#C8900A" strokeWidth="2.5" />
    )
  }
  // front - near circle, slightly wide
  return (
    <ellipse cx={110} cy={88} rx={72} ry={70}
      fill={`url(#${id}-hg)`} stroke="#C8900A" strokeWidth="2.5" />
  )
}

// ============================================================
// BODY SHAPE
// From reference: body is shorter/fatter than expected.
// From back view: body is wide rounded rect with thick stripes.
// Body sits below head, overlapping slightly at the neck area.
// ============================================================
function BodyShape({ id, pov }: { id: string; pov: MascotPOV }) {
  if (pov === 'top') {
    // From top: oval, mostly hidden by head
    return (
      <ellipse cx={110} cy={210} rx={52} ry={40}
        fill={`url(#${id}-bg)`} stroke="#C8900A" strokeWidth="2" />
    )
  }
  if (pov === 'bottom') {
    return (
      <ellipse cx={110} cy={190} rx={58} ry={52}
        fill={`url(#${id}-bg)`} stroke="#C8900A" strokeWidth="2" />
    )
  }
  if (pov === 'right' || pov === 'left') {
    const flip = pov === 'left'
    // Profile: body is a wide oval
    return (
      <g transform={flip ? 'scale(-1,1) translate(-220,0)' : ''}>
        <ellipse cx={118} cy={196} rx={50} ry={48}
          fill={`url(#${id}-bg)`} stroke="#C8900A" strokeWidth="2" />
      </g>
    )
  }
  // Front / 3/4 / back - rounded rect body
  // Use a path for the rounded body shape (wider top, narrowing at legs)
  return (
    <path d="M 60 165 Q 58 240 110 248 Q 162 240 160 165 Q 150 155 110 155 Q 70 155 60 165 Z"
      fill={`url(#${id}-bg)`} stroke="#C8900A" strokeWidth="2.2" />
  )
}

// ============================================================
// STRIPES
// Very thick black bands - from reference they're VERY prominent
// ============================================================
function Stripes({ pov }: { pov: MascotPOV }) {
  if (pov === 'top') return null
  if (pov === 'bottom') return null

  if (pov === 'right') {
    return (
      <g clipPath="none">
        {/* Profile stripes - curved bands */}
        <path d="M 70 170 Q 118 164 165 170 Q 165 182 118 182 Q 70 182 70 170 Z" fill="#1A1A1A" opacity={0.93} />
        <path d="M 68 190 Q 118 184 166 190 Q 166 202 118 202 Q 68 202 68 190 Z" fill="#1A1A1A" opacity={0.93} />
        <path d="M 70 210 Q 118 204 164 210 Q 162 220 118 220 Q 72 220 70 210 Z" fill="#1A1A1A" opacity={0.90} />
      </g>
    )
  }
  if (pov === 'left') {
    return (
      <g transform="scale(-1,1) translate(-220,0)">
        <path d="M 70 170 Q 118 164 165 170 Q 165 182 118 182 Q 70 182 70 170 Z" fill="#1A1A1A" opacity={0.93} />
        <path d="M 68 190 Q 118 184 166 190 Q 166 202 118 202 Q 68 202 68 190 Z" fill="#1A1A1A" opacity={0.93} />
        <path d="M 70 210 Q 118 204 164 210 Q 162 220 118 220 Q 72 220 70 210 Z" fill="#1A1A1A" opacity={0.90} />
      </g>
    )
  }
  if (pov === 'back') {
    return (
      <>
        <path d="M 60 168 Q 110 162 160 168 Q 160 182 110 182 Q 60 182 60 168 Z" fill="#1A1A1A" opacity={0.93} />
        <path d="M 58 190 Q 110 184 162 190 Q 162 204 110 204 Q 58 204 58 190 Z" fill="#1A1A1A" opacity={0.93} />
        <path d="M 60 212 Q 110 206 160 212 Q 160 224 110 224 Q 60 224 60 212 Z" fill="#1A1A1A" opacity={0.90} />
      </>
    )
  }
  // Front / 3/4 - stripes follow the body path shape
  return (
    <>
      <path d="M 62 170 Q 110 163 158 170 Q 157 183 110 183 Q 63 183 62 170 Z" fill="#1A1A1A" opacity={0.93} />
      <path d="M 60 190 Q 110 184 160 190 Q 159 203 110 203 Q 61 203 60 190 Z" fill="#1A1A1A" opacity={0.93} />
      <path d="M 62 210 Q 110 204 158 210 Q 156 221 110 221 Q 64 221 62 210 Z" fill="#1A1A1A" opacity={0.90} />
    </>
  )
}

// ============================================================
// NECKERCHIEF
// Black bandana tied around the neck area (between head & body)
// Knot with bow on LEFT side from front view
// ============================================================
function Neckerchief({ pov }: { pov: MascotPOV }) {
  if (pov === 'top' || pov === 'bottom') return null

  if (pov === 'back') {
    // From back: bow visible on right side (which is left from front)
    return (
      <g>
        <path d="M 56 154 Q 110 147 164 154 Q 164 166 110 168 Q 56 166 56 154 Z" fill="#222" />
        {/* Knot on right from back = left from front */}
        <circle cx={162} cy={158} r={9} fill="#111" />
        <ellipse cx={173} cy={152} rx={9} ry={6} fill="#111" transform="rotate(-25 173 152)" />
        <ellipse cx={173} cy={165} rx={9} ry={6} fill="#111" transform="rotate(25 173 165)" />
        <line x1={162} y1={158} x2={176} y2={170} stroke="#111" strokeWidth="6" strokeLinecap="round" />
        <line x1={162} y1={158} x2={170} y2={176} stroke="#111" strokeWidth="5.5" strokeLinecap="round" />
      </g>
    )
  }
  if (pov === 'right') {
    // Profile right: bow on far left (not visible), just the band
    return (
      <path d="M 68 152 Q 118 146 164 152 Q 164 164 118 166 Q 68 164 68 152 Z" fill="#222" />
    )
  }
  if (pov === 'left') {
    // Profile left: bow on near left = right side of image = visible
    return (
      <g>
        <path d="M 56 152 Q 102 146 152 152 Q 152 164 102 166 Q 56 164 56 152 Z" fill="#222" />
        {/* Bow visible on right side of image for left profile */}
        <circle cx={150} cy={156} r={8} fill="#111" />
        <ellipse cx={160} cy={150} rx={8} ry={5} fill="#111" transform="rotate(-20 160 150)" />
        <ellipse cx={160} cy={163} rx={8} ry={5} fill="#111" transform="rotate(20 160 163)" />
        <line x1={150} y1={156} x2={162} y2={167} stroke="#111" strokeWidth="5.5" strokeLinecap="round" />
        <line x1={150} y1={156} x2={158} y2={174} stroke="#111" strokeWidth="5" strokeLinecap="round" />
      </g>
    )
  }

  // Front / 3/4 - bow on left side
  return (
    <g>
      <path d="M 56 154 Q 110 147 164 154 Q 164 166 110 168 Q 56 166 56 154 Z" fill="#222" />
      {/* Knot center */}
      <circle cx={62} cy={158} r={9} fill="#111" />
      {/* Bow ears */}
      <ellipse cx={50} cy={151} rx={10} ry={6} fill="#111" transform="rotate(-25 50 151)" />
      <ellipse cx={50} cy={166} rx={10} ry={6} fill="#111" transform="rotate(25 50 166)" />
      {/* Tail ends */}
      <line x1={62} y1={158} x2={45} y2={171} stroke="#111" strokeWidth="6" strokeLinecap="round" />
      <line x1={62} y1={158} x2={50} y2={178} stroke="#111" strokeWidth="5.5" strokeLinecap="round" />
    </g>
  )
}

// ============================================================
// ANTENNAE
// ============================================================
function Antennae({ pov }: { pov: MascotPOV }) {
  if (pov === 'bottom') return null
  if (pov === 'top') {
    return (
      <g>
        <line x1={88} y1={76} x2={66} y2={52} stroke="#111" strokeWidth="4" strokeLinecap="round" />
        <circle cx={64} cy={50} r={6.5} fill="#111" />
        <line x1={132} y1={76} x2={154} y2={52} stroke="#111" strokeWidth="4" strokeLinecap="round" />
        <circle cx={156} cy={50} r={6.5} fill="#111" />
      </g>
    )
  }
  if (pov === 'back') {
    return (
      <g>
        <path d="M 88 24 Q 80 10 76 2" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx={75} cy={0} r={6.5} fill="#111" />
        <path d="M 132 24 Q 140 10 144 2" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx={145} cy={0} r={6.5} fill="#111" />
      </g>
    )
  }
  if (pov === 'right') {
    return (
      <g>
        <path d="M 122 28 Q 134 12 140 2" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx={141} cy={0} r={6.5} fill="#111" />
        <path d="M 136 30 Q 155 20 162 10" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx={163} cy={8} r={6} fill="#111" />
      </g>
    )
  }
  if (pov === 'left') {
    return (
      <g>
        <path d="M 98 28 Q 86 12 80 2" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx={79} cy={0} r={6.5} fill="#111" />
        <path d="M 84 30 Q 65 20 58 10" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx={57} cy={8} r={6} fill="#111" />
      </g>
    )
  }
  // Front / 3/4
  return (
    <g>
      <path d="M 90 24 Q 82 8 78 -2" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx={77} cy={-4} r={6.5} fill="#111" />
      <path d="M 130 24 Q 138 8 142 -2" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx={143} cy={-4} r={6.5} fill="#111" />
    </g>
  )
}

// ============================================================
// GOGGLES
// Aviator goggles with two round teal lenses + crosshair reticle
// Sits on the forehead (upper 1/3 of head)
// ============================================================
function Goggles({ id, pov }: { id: string; pov: MascotPOV }) {
  if (pov === 'bottom') return null
  if (pov === 'back') {
    // Just the band visible from behind
    return (
      <rect x={42} y={58} width={136} height={18} rx={9} fill="#6B3A22" />
    )
  }
  if (pov === 'top') {
    // Foreshortened - goggles at the front edge of head
    return (
      <g>
        <rect x={46} y={106} width={128} height={14} rx={7} fill="#6B3A22" />
        <ellipse cx={82} cy={113} rx={22} ry={8} fill="#1D7A6A" stroke="#2A1A0A" strokeWidth="2.5" />
        <ellipse cx={138} cy={113} rx={22} ry={8} fill="#1D7A6A" stroke="#2A1A0A" strokeWidth="2.5" />
      </g>
    )
  }
  if (pov === 'right') {
    // Right profile: two goggles visible on the right side, foreshortened
    return (
      <g>
        {/* Strap */}
        <rect x={44} y={56} width={130} height={18} rx={9} fill="#6B3A22" />
        <rect x={44} y={58} width={130} height={7} rx={3.5} fill="#8C5030" opacity={0.45} />
        {/* Far goggle (left lens from front = smaller/behind) */}
        <circle cx={128} cy={65} r={20} fill="#2A1A0A" stroke="#5A2D18" strokeWidth="2.5" />
        <circle cx={128} cy={65} r={15} fill="#1D7A6A" />
        <circle cx={128} cy={65} r={15} fill={`url(#${id}-lr)`} />
        <line x1={128} y1={51} x2={128} y2={79} stroke="#28C8A0" strokeWidth="1.3" opacity={0.8} />
        <line x1={114} y1={65} x2={142} y2={65} stroke="#28C8A0" strokeWidth="1.3" opacity={0.8} />
        <circle cx={128} cy={65} r={6} fill="none" stroke="#28C8A0" strokeWidth="0.9" opacity={0.7} />
        {/* Near goggle (right lens from front = bigger/closer) */}
        <circle cx={160} cy={65} r={23} fill="#2A1A0A" stroke="#5A2D18" strokeWidth="2.5" />
        <circle cx={160} cy={65} r={18} fill="#1D7A6A" />
        <circle cx={160} cy={65} r={18} fill={`url(#${id}-lr)`} />
        <line x1={160} y1={48} x2={160} y2={82} stroke="#28C8A0" strokeWidth="1.5" opacity={0.85} />
        <line x1={143} y1={65} x2={177} y2={65} stroke="#28C8A0" strokeWidth="1.5" opacity={0.85} />
        <circle cx={160} cy={65} r={8} fill="none" stroke="#28C8A0" strokeWidth="1.1" opacity={0.7} />
        <ellipse cx={152} cy={58} rx={5} ry={3} fill="white" opacity={0.3} transform="rotate(-30 152 58)" />
      </g>
    )
  }
  if (pov === 'left') {
    // Left profile: mirror of right
    return (
      <g>
        <rect x={46} y={56} width={130} height={18} rx={9} fill="#6B3A22" />
        <rect x={46} y={58} width={130} height={7} rx={3.5} fill="#8C5030" opacity={0.45} />
        {/* Near goggle (left side visible) */}
        <circle cx={60} cy={65} r={23} fill="#2A1A0A" stroke="#5A2D18" strokeWidth="2.5" />
        <circle cx={60} cy={65} r={18} fill="#1D7A6A" />
        <circle cx={60} cy={65} r={18} fill={`url(#${id}-lr)`} />
        <line x1={60} y1={48} x2={60} y2={82} stroke="#28C8A0" strokeWidth="1.5" opacity={0.85} />
        <line x1={43} y1={65} x2={77} y2={65} stroke="#28C8A0" strokeWidth="1.5" opacity={0.85} />
        <circle cx={60} cy={65} r={8} fill="none" stroke="#28C8A0" strokeWidth="1.1" opacity={0.7} />
        <ellipse cx={52} cy={58} rx={5} ry={3} fill="white" opacity={0.3} transform="rotate(-30 52 58)" />
        {/* Far goggle */}
        <circle cx={92} cy={65} r={20} fill="#2A1A0A" stroke="#5A2D18" strokeWidth="2.5" />
        <circle cx={92} cy={65} r={15} fill="#1D7A6A" />
        <circle cx={92} cy={65} r={15} fill={`url(#${id}-lr)`} />
        <line x1={92} y1={51} x2={92} y2={79} stroke="#28C8A0" strokeWidth="1.3" opacity={0.8} />
        <line x1={78} y1={65} x2={106} y2={65} stroke="#28C8A0" strokeWidth="1.3" opacity={0.8} />
      </g>
    )
  }
  // Front / 3/4 - both lenses visible side by side
  const is34 = pov === '3/4'
  // Slight offset for 3/4 (right lens larger/closer)
  const lx = is34 ? 84 : 84
  const rx2 = is34 ? 136 : 136

  return (
    <g>
      {/* Band/strap */}
      <rect x={40} y={55} width={140} height={20} rx={10} fill="#6B3A22" />
      <rect x={40} y={57} width={140} height={8} rx={4} fill="#8C5030" opacity={0.4} />

      {/* Left lens frame */}
      <circle cx={lx} cy={65} r={25} fill="#2A1A0A" stroke="#5A2D18" strokeWidth="2.5" />
      <circle cx={lx} cy={65} r={19} fill="#1D7A6A" />
      <circle cx={lx} cy={65} r={19} fill={`url(#${id}-lr)`} />
      <line x1={lx} y1={47} x2={lx} y2={83} stroke="#28C8A0" strokeWidth="1.5" opacity={0.85} />
      <line x1={lx - 18} y1={65} x2={lx + 18} y2={65} stroke="#28C8A0" strokeWidth="1.5" opacity={0.85} />
      <circle cx={lx} cy={65} r={8} fill="none" stroke="#28C8A0" strokeWidth="1" opacity={0.7} />
      <ellipse cx={lx - 7} cy={57} rx={5.5} ry={3.5} fill="white" opacity={0.32} transform={`rotate(-30 ${lx - 7} 57)`} />

      {/* Bridge */}
      <rect x={108} y={62} width={14} height={7} rx={3.5} fill="#2A1A0A" />

      {/* Right lens frame */}
      <circle cx={rx2} cy={65} r={25} fill="#2A1A0A" stroke="#5A2D18" strokeWidth="2.5" />
      <circle cx={rx2} cy={65} r={19} fill="#1D7A6A" />
      <circle cx={rx2} cy={65} r={19} fill={`url(#${id}-lr)`} />
      <line x1={rx2} y1={47} x2={rx2} y2={83} stroke="#28C8A0" strokeWidth="1.5" opacity={0.85} />
      <line x1={rx2 - 18} y1={65} x2={rx2 + 18} y2={65} stroke="#28C8A0" strokeWidth="1.5" opacity={0.85} />
      <circle cx={rx2} cy={65} r={8} fill="none" stroke="#28C8A0" strokeWidth="1" opacity={0.7} />
      <ellipse cx={rx2 - 7} cy={57} rx={5.5} ry={3.5} fill="white" opacity={0.32} transform={`rotate(-30 ${rx2 - 7} 57)`} />
    </g>
  )
}

// ============================================================
// EYES
// Big kawaii eyes: white sclera, big black pupil, 2 white highlights
// ============================================================
function Eyes({ blink, pov, action }: { blink: boolean; pov: MascotPOV; action: MascotPoseAction }) {
  if (pov === 'back' || pov === 'top' || pov === 'bottom') return null

  const isSleep = action === 'sleep'

  if (pov === 'right') {
    // One eye visible on the right side (the face side)
    const ex = 158; const ey = 100
    if (isSleep) return (
      <path d={`M ${ex - 14} ${ey} Q ${ex} ${ey - 7} ${ex + 14} ${ey}`}
        stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" />
    )
    return (
      <g>
        <ellipse cx={ex} cy={ey} rx={blink ? 15 : 15} ry={blink ? 2 : 15} fill="white" />
        {!blink && <>
          <circle cx={ex + 1} cy={ey + 1} r={12} fill="#111" />
          <circle cx={ex - 4} cy={ey - 4} r={4.5} fill="white" />
          <circle cx={ex + 5} cy={ey + 4} r={2} fill="white" />
        </>}
        {blink && <ellipse cx={ex} cy={ey} rx={15} ry={2} fill="#111" />}
      </g>
    )
  }
  if (pov === 'left') {
    const ex = 62; const ey = 100
    if (isSleep) return (
      <path d={`M ${ex - 14} ${ey} Q ${ex} ${ey - 7} ${ex + 14} ${ey}`}
        stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" />
    )
    return (
      <g>
        <ellipse cx={ex} cy={ey} rx={15} ry={blink ? 2 : 15} fill="white" />
        {!blink && <>
          <circle cx={ex + 1} cy={ey + 1} r={12} fill="#111" />
          <circle cx={ex - 4} cy={ey - 4} r={4.5} fill="white" />
          <circle cx={ex + 5} cy={ey + 4} r={2} fill="white" />
        </>}
        {blink && <ellipse cx={ex} cy={ey} rx={15} ry={2} fill="#111" />}
      </g>
    )
  }

  // Front / 3/4
  // Eyes slightly lower on face, big and wide apart
  const is34 = pov === '3/4'
  // 3/4: eyes shifted slightly (right eye closer)
  const lx = is34 ? 86 : 88
  const rx2 = is34 ? 134 : 132
  const ey = 103

  if (isSleep) {
    return (
      <g>
        <path d={`M ${lx - 14} ${ey} Q ${lx} ${ey - 8} ${lx + 14} ${ey}`} stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d={`M ${rx2 - 14} ${ey} Q ${rx2} ${ey - 8} ${rx2 + 14} ${ey}`} stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    )
  }
  if (blink) {
    return (
      <g>
        <path d={`M ${lx - 14} ${ey} Q ${lx} ${ey - 7} ${lx + 14} ${ey}`} stroke="#111" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d={`M ${rx2 - 14} ${ey} Q ${rx2} ${ey - 7} ${rx2 + 14} ${ey}`} stroke="#111" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>
    )
  }
  return (
    <g>
      {/* Left eye */}
      <ellipse cx={lx} cy={ey} rx={16} ry={16} fill="white" />
      <circle cx={lx + 1} cy={ey + 1} r={13} fill="#111" />
      <circle cx={lx - 5} cy={ey - 5} r={5} fill="white" />
      <circle cx={lx + 6} cy={ey + 5} r={2.2} fill="white" />

      {/* Right eye */}
      <ellipse cx={rx2} cy={ey} rx={16} ry={16} fill="white" />
      <circle cx={rx2 + 1} cy={ey + 1} r={13} fill="#111" />
      <circle cx={rx2 - 5} cy={ey - 5} r={5} fill="white" />
      <circle cx={rx2 + 6} cy={ey + 5} r={2.2} fill="white" />

      {/* Thinking eyebrow */}
      {action === 'thinking' && (
        <path d={`M ${rx2 - 12} ${ey - 19} Q ${rx2} ${ey - 24} ${rx2 + 12} ${ey - 18}`}
          stroke="#B07010" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
    </g>
  )
}

// ============================================================
// CHEEKS
// ============================================================
function Cheeks({ pov }: { pov: MascotPOV }) {
  if (pov === 'back' || pov === 'top' || pov === 'bottom') return null
  const is34 = pov === '3/4'

  if (pov === 'right') return (
    <ellipse cx={170} cy={116} rx={12} ry={8} fill="#F47898" opacity={0.68} />
  )
  if (pov === 'left') return (
    <ellipse cx={50} cy={116} rx={12} ry={8} fill="#F47898" opacity={0.68} />
  )
  return (
    <g>
      <ellipse cx={is34 ? 72 : 72} cy={118} rx={14} ry={9} fill="#F47898" opacity={0.65} />
      <ellipse cx={is34 ? 148 : 148} cy={118} rx={14} ry={9} fill="#F47898" opacity={0.65} />
    </g>
  )
}

// ============================================================
// MOUTH
// ============================================================
function Mouth({ action, pov }: { action: MascotPoseAction; pov: MascotPOV }) {
  if (pov === 'back' || pov === 'top' || pov === 'bottom') return null

  const isProfile = pov === 'right' || pov === 'left'
  const mx = isProfile ? (pov === 'right' ? 165 : 55) : 110
  const my = 126

  if (action === 'sleep') {
    return <path d={`M ${mx - 8} ${my + 2} Q ${mx} ${my + 7} ${mx + 8} ${my + 2}`}
      stroke="#111" strokeWidth="2.2" fill="none" strokeLinecap="round" />
  }
  if (action === 'sad') {
    return <path d={`M ${mx - 10} ${my + 5} Q ${mx} ${my} ${mx + 10} ${my + 5}`}
      stroke="#111" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  }
  if (action === 'cheer' || action === 'excited') {
    return (
      <g>
        <path d={`M ${mx - 12} ${my - 1} Q ${mx} ${my + 13} ${mx + 12} ${my - 1}`} fill="#111" />
        <path d={`M ${mx - 11} ${my - 1} Q ${mx} ${my + 11} ${mx + 11} ${my - 1}`} fill="#C03060" />
        <path d={`M ${mx - 9} ${my - 1} Q ${mx} ${my + 8} ${mx + 9} ${my - 1}`} fill="white" />
      </g>
    )
  }

  // Profile smile - more subtle
  if (isProfile) {
    return <path d={`M ${mx - 8} ${my} Q ${mx} ${my + 8} ${mx + 8} ${my}`}
      fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
  }

  // Default happy open smile
  return (
    <g>
      <path d={`M ${mx - 11} ${my} Q ${mx} ${my + 11} ${mx + 11} ${my}`} fill="#111" />
      <path d={`M ${mx - 10} ${my} Q ${mx} ${my + 9} ${mx + 10} ${my}`} fill="#C03060" />
      <path d={`M ${mx - 8} ${my} Q ${mx} ${my + 7} ${mx + 8} ${my}`} fill="white" />
    </g>
  )
}

// ============================================================
// ARMS
// Stubby, no fingers - just rounded oval stumps
// From front: arms stick out to the sides
// ============================================================
function Arms({ id, pov, action }: { id: string; pov: MascotPOV; action: MascotPoseAction }) {
  if (pov === 'top' || pov === 'bottom') return null

  if (pov === 'back') {
    return (
      <g>
        <ellipse cx={50} cy={188} rx={18} ry={12} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8"
          transform="rotate(-25 50 188)" />
        <ellipse cx={170} cy={188} rx={18} ry={12} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8"
          transform="rotate(25 170 188)" />
      </g>
    )
  }

  if (pov === 'right') {
    // One arm visible slightly (the near arm)
    return (
      <g>
        {/* Far arm behind */}
        <ellipse cx={68} cy={188} rx={15} ry={10} fill="#D49008" stroke="#B07808" strokeWidth="1.5"
          transform="rotate(20 68 188)" />
        {/* Near arm - holding scroll */}
        <path d="M 162 170 Q 178 180 182 196" stroke={`url(#${id}-ag)`} strokeWidth="20" fill="none" strokeLinecap="round" />
        <ellipse cx={184} cy={200} rx={12} ry={9} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
      </g>
    )
  }
  if (pov === 'left') {
    return (
      <g>
        <ellipse cx={152} cy={188} rx={15} ry={10} fill="#D49008" stroke="#B07808" strokeWidth="1.5"
          transform="rotate(-20 152 188)" />
        <path d="M 58 170 Q 42 180 38 196" stroke={`url(#${id}-ag)`} strokeWidth="20" fill="none" strokeLinecap="round" />
        <ellipse cx={36} cy={200} rx={12} ry={9} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
      </g>
    )
  }

  // Front/3/4 arms
  if (action === 'wave') {
    return (
      <g>
        <path d="M 60 172 Q 42 182 36 196" stroke={`url(#${id}-ag)`} strokeWidth="22" fill="none" strokeLinecap="round" />
        <ellipse cx={34} cy={200} rx={12} ry={9} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
        <path d="M 160 172 Q 176 156 180 140" stroke={`url(#${id}-ag)`} strokeWidth="22" fill="none" strokeLinecap="round" />
        <ellipse cx={181} cy={136} rx={12} ry={9} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" transform="rotate(-35 181 136)" />
      </g>
    )
  }
  if (action === 'cheer' || action === 'excited') {
    return (
      <g>
        <path d="M 60 172 Q 40 155 34 138" stroke={`url(#${id}-ag)`} strokeWidth="22" fill="none" strokeLinecap="round" />
        <ellipse cx={33} cy={134} rx={12} ry={9} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" transform="rotate(30 33 134)" />
        <path d="M 160 172 Q 180 155 186 138" stroke={`url(#${id}-ag)`} strokeWidth="22" fill="none" strokeLinecap="round" />
        <ellipse cx={187} cy={134} rx={12} ry={9} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" transform="rotate(-30 187 134)" />
      </g>
    )
  }
  if (action === 'thinking') {
    return (
      <g>
        <path d="M 60 172 Q 42 184 38 198" stroke={`url(#${id}-ag)`} strokeWidth="22" fill="none" strokeLinecap="round" />
        <ellipse cx={36} cy={202} rx={12} ry={9} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
        <path d="M 160 172 Q 162 158 150 148" stroke={`url(#${id}-ag)`} strokeWidth="20" fill="none" strokeLinecap="round" />
        <ellipse cx={147} cy={144} rx={11} ry={9} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
      </g>
    )
  }
  if (action === 'thumbsup') {
    return (
      <g>
        <path d="M 60 172 Q 42 184 38 198" stroke={`url(#${id}-ag)`} strokeWidth="22" fill="none" strokeLinecap="round" />
        <ellipse cx={36} cy={202} rx={12} ry={9} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
        <path d="M 160 172 Q 174 162 174 148" stroke={`url(#${id}-ag)`} strokeWidth="20" fill="none" strokeLinecap="round" />
        <ellipse cx={174} cy={142} rx={10} ry={13} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
      </g>
    )
  }

  // Default - arms out to sides
  return (
    <g>
      <path d="M 60 172 Q 38 178 28 190" stroke={`url(#${id}-ag)`} strokeWidth="22" fill="none" strokeLinecap="round" />
      <ellipse cx={25} cy={194} rx={13} ry={10} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
      <path d="M 160 172 Q 182 178 192 190" stroke={`url(#${id}-ag)`} strokeWidth="22" fill="none" strokeLinecap="round" />
      <ellipse cx={195} cy={194} rx={13} ry={10} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
    </g>
  )
}

// ============================================================
// LEGS / FEET
// Short stubby, rounded
// ============================================================
function Legs({ id, pov }: { id: string; pov: MascotPOV }) {
  if (pov === 'top') return null
  if (pov === 'back') {
    return (
      <g>
        <path d="M 86 240 Q 84 256 82 264" stroke={`url(#${id}-ag)`} strokeWidth="22" fill="none" strokeLinecap="round" />
        <ellipse cx={82} cy={267} rx={16} ry={10} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
        <path d="M 134 240 Q 136 256 138 264" stroke={`url(#${id}-ag)`} strokeWidth="22" fill="none" strokeLinecap="round" />
        <ellipse cx={138} cy={267} rx={16} ry={10} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
      </g>
    )
  }
  if (pov === 'right') {
    return (
      <g>
        <path d="M 96 240 Q 92 256 88 264" stroke={`url(#${id}-ag)`} strokeWidth="20" fill="none" strokeLinecap="round" />
        <ellipse cx={87} cy={267} rx={14} ry={10} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
        <path d="M 128 240 Q 132 254 134 262" stroke={`url(#${id}-ag)`} strokeWidth="20" fill="none" strokeLinecap="round" />
        <ellipse cx={135} cy={265} rx={14} ry={10} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
      </g>
    )
  }
  if (pov === 'left') {
    return (
      <g transform="scale(-1,1) translate(-220,0)">
        <path d="M 96 240 Q 92 256 88 264" stroke={`url(#${id}-ag)`} strokeWidth="20" fill="none" strokeLinecap="round" />
        <ellipse cx={87} cy={267} rx={14} ry={10} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
        <path d="M 128 240 Q 132 254 134 262" stroke={`url(#${id}-ag)`} strokeWidth="20" fill="none" strokeLinecap="round" />
        <ellipse cx={135} cy={265} rx={14} ry={10} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
      </g>
    )
  }
  if (pov === 'bottom') {
    return (
      <g>
        <ellipse cx={82} cy={260} rx={18} ry={12} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
        <ellipse cx={138} cy={260} rx={18} ry={12} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
      </g>
    )
  }
  // Front/3/4
  return (
    <g>
      <path d="M 88 238 Q 85 252 82 260" stroke={`url(#${id}-ag)`} strokeWidth="22" fill="none" strokeLinecap="round" />
      <ellipse cx={82} cy={263} rx={16} ry={10} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
      <path d="M 132 238 Q 135 252 138 260" stroke={`url(#${id}-ag)`} strokeWidth="22" fill="none" strokeLinecap="round" />
      <ellipse cx={138} cy={263} rx={16} ry={10} fill={`url(#${id}-ag)`} stroke="#C8900A" strokeWidth="1.8" />
      {/* Stinger */}
      <path d="M 110 236 L 110 244 L 106 252 M 110 244 L 114 252"
        stroke="#111" strokeWidth="2.8" fill="none" strokeLinecap="round" />
    </g>
  )
}

// ============================================================
// SATCHEL BAG
// Brown leather crossbody bag
// ============================================================
function Satchel({ pov }: { pov: MascotPOV }) {
  if (pov === 'top' || pov === 'bottom') return null

  if (pov === 'back') {
    return (
      <g>
        <line x1={90} y1={155} x2={148} y2={212} stroke="#7A3B1E" strokeWidth="4" strokeLinecap="round" />
        <rect x={136} y={206} width={36} height={32} rx={6} fill="#7A3B1E" stroke="#5A2A14" strokeWidth="1.8" />
        <rect x={136} y={206} width={36} height={14} rx={5} fill="#8C4525" />
        <circle cx={154} cy={213} r={3.5} fill="#C07040" stroke="#8B4820" strokeWidth="1" />
      </g>
    )
  }
  if (pov === 'right') {
    return (
      <g>
        <line x1={148} y1={155} x2={80} y2={214} stroke="#7A3B1E" strokeWidth="4" strokeLinecap="round" />
        <rect x={58} y={208} width={40} height={36} rx={7} fill="#7A3B1E" stroke="#5A2A14" strokeWidth="1.8" />
        <rect x={58} y={208} width={40} height={16} rx={6} fill="#8C4525" />
        <circle cx={78} cy={216} r={4} fill="#C07040" stroke="#8B4820" strokeWidth="1" />
        {/* Scroll sticking out */}
        <ellipse cx={102} cy={210} rx={7} ry={12} fill="#F5E8C0" stroke="#C0A050" strokeWidth="1.3" />
        <ellipse cx={102} cy={199} rx={7} ry={4} fill="#E8C870" stroke="#C0A050" strokeWidth="1" />
        <ellipse cx={102} cy={221} rx={7} ry={4} fill="#E8C870" stroke="#C0A050" strokeWidth="1" />
      </g>
    )
  }
  if (pov === 'left') {
    return (
      <g>
        <line x1={72} y1={155} x2={140} y2={214} stroke="#7A3B1E" strokeWidth="4" strokeLinecap="round" />
        <rect x={122} y={208} width={40} height={36} rx={7} fill="#7A3B1E" stroke="#5A2A14" strokeWidth="1.8" />
        <rect x={122} y={208} width={40} height={16} rx={6} fill="#8C4525" />
        <circle cx={142} cy={216} r={4} fill="#C07040" stroke="#8B4820" strokeWidth="1" />
        {/* Scroll sticking out */}
        <ellipse cx={118} cy={210} rx={7} ry={12} fill="#F5E8C0" stroke="#C0A050" strokeWidth="1.3" />
        <ellipse cx={118} cy={199} rx={7} ry={4} fill="#E8C870" stroke="#C0A050" strokeWidth="1" />
        <ellipse cx={118} cy={221} rx={7} ry={4} fill="#E8C870" stroke="#C0A050" strokeWidth="1" />
      </g>
    )
  }

  // Front / 3/4 - strap from right shoulder to lower left
  return (
    <g>
      <line x1={148} y1={157} x2={82} y2={224} stroke="#7A3B1E" strokeWidth="4" strokeLinecap="round" />
      <rect x={62} y={216} width={46} height={40} rx={8} fill="#7A3B1E" stroke="#5A2A14" strokeWidth="1.8" />
      <rect x={62} y={216} width={46} height={18} rx={7} fill="#8C4525" />
      <path d="M 62 233 Q 85 239 108 233" fill="#8C4525" />
      <circle cx={85} cy={224} r={4.5} fill="#C07040" stroke="#8B4820" strokeWidth="1.2" />
      <rect x={66} y={219} width={18} height={9} rx={3.5} fill="#9C5530" opacity={0.4} />
    </g>
  )
}

// ============================================================
// ZZZ / THINKING EXTRAS
// ============================================================
function SleepZzz() {
  return (
    <g>
      <text x={148} y={76} fontSize={13} fill="#90B8D8" fontWeight="bold"
        style={{ animation: 'ob-zzz 2s ease-out 0s infinite' }} opacity={0}>z</text>
      <text x={160} y={60} fontSize={18} fill="#90B8D8" fontWeight="bold"
        style={{ animation: 'ob-zzz 2s ease-out 0.65s infinite' }} opacity={0}>z</text>
      <text x={174} y={42} fontSize={24} fill="#90B8D8" fontWeight="bold"
        style={{ animation: 'ob-zzz 2s ease-out 1.3s infinite' }} opacity={0}>z</text>
    </g>
  )
}

function ThinkingBubble() {
  return (
    <g style={{ animation: 'ob-float 2s ease-in-out infinite reverse' }}>
      <circle cx={152} cy={80} r={3.5} fill="#D4A010" opacity={0.55} />
      <circle cx={163} cy={68} r={5.5} fill="#D4A010" opacity={0.42} />
      <circle cx={176} cy={54} r={9} fill="#FFF8E0" stroke="#D4A010" strokeWidth="1.4" opacity={0.85} />
      <text x={171} y={59} fontSize={11} fill="#D4A010" fontWeight="bold">?</text>
    </g>
  )
}

// ============================================================
// MAIN COMPONENT
// ViewBox: 0 0 220 280
// Head: big, center ~cx=110 cy=88
// Body: below head, cy~195
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
  const id = `ob-${uid}`
  const blink = useBlinkTimer()

  const bodyAnim = getBodyAnim(action)
  const transformOrigin = '110px 200px'

  return (
    <>
      <style>{KEYFRAMES}</style>
      <svg
        viewBox="0 0 220 280"
        width={size}
        height={size * (280 / 220)}
        className={`select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
        style={{ display: 'block', overflow: 'visible', ...style }}
        onClick={onClick}
        onMouseEnter={onHover}
        aria-label="Otbee maskot"
        role={onClick ? 'button' : 'img'}
      >
        <Defs id={id} />

        <g style={{ transformOrigin, ...bodyAnim }}>
          {/* 1. Wings (behind everything) */}
          <Wings id={id} pov={pov} action={action} />

          {/* 2. Legs */}
          <Legs id={id} pov={pov} />

          {/* 3. Body */}
          <BodyShape id={id} pov={pov} />

          {/* 4. Stripes on body */}
          <Stripes pov={pov} />

          {/* 5. Neckerchief */}
          <Neckerchief pov={pov} />

          {/* 6. Satchel */}
          <Satchel pov={pov} />

          {/* 7. Arms */}
          <Arms id={id} pov={pov} action={action} />

          {/* 8. Head */}
          <HeadShape id={id} pov={pov} />

          {/* 9. Antennae */}
          <Antennae pov={pov} />

          {/* 10. Goggles */}
          <Goggles id={id} pov={pov} />

          {/* 11. Eyes */}
          <Eyes blink={blink} pov={pov} action={action} />

          {/* 12. Cheeks */}
          <Cheeks pov={pov} />

          {/* 13. Mouth */}
          <Mouth action={action} pov={pov} />

          {/* 14. Action extras */}
          {action === 'sleep' && <SleepZzz />}
          {action === 'thinking' && <ThinkingBubble />}
        </g>
      </svg>
    </>
  )
}

// ============================================================
// HEAD-ONLY VARIANT (for chatbot trigger)
// Crops to show only the head, antennae, goggles, face
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
  const id = `ob-h-${uid}`
  const blink = useBlinkTimer()

  // Crop: viewBox "28 0 164 160" = head region only
  return (
    <>
      <style>{KEYFRAMES}</style>
      <svg
        viewBox="28 -8 164 162"
        width={size}
        height={size}
        className={`select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
        style={{ display: 'block', overflow: 'visible', ...style }}
        onClick={onClick}
        aria-label="Otbee head"
      >
        <Defs id={id} />
        <g style={{ animation: 'ob-float 3s ease-in-out infinite', transformOrigin: '110px 88px' }}>
          {/* Wing tips barely peeking */}
          <path d="M 68 162 Q 28 142 12 112 Q 2 88 24 98 Q 50 108 64 148 Z"
            fill={`url(#${id}-wf)`} stroke="#8ECAE6" strokeWidth="1.2" opacity={0.7} />
          {/* Neckerchief top */}
          <path d="M 56 154 Q 110 147 164 154 Q 164 164 110 166 Q 56 164 56 154 Z" fill="#222" />
          <circle cx={62} cy={158} r={8} fill="#111" />
          <ellipse cx={50} cy={151} rx={9} ry={5.5} fill="#111" transform="rotate(-25 50 151)" />
          <ellipse cx={50} cy={166} rx={9} ry={5.5} fill="#111" transform="rotate(25 50 166)" />
          {/* Head */}
          <ellipse cx={110} cy={88} rx={72} ry={70} fill={`url(#${id}-hg)`} stroke="#C8900A" strokeWidth="2.5" />
          {/* Antennae */}
          <path d="M 90 24 Q 82 8 78 -2" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx={77} cy={-4} r={6.5} fill="#111" />
          <path d="M 130 24 Q 138 8 142 -2" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx={143} cy={-4} r={6.5} fill="#111" />
          {/* Goggles */}
          <rect x={40} y={55} width={140} height={20} rx={10} fill="#6B3A22" />
          <rect x={40} y={57} width={140} height={8} rx={4} fill="#8C5030" opacity={0.4} />
          <circle cx={84} cy={65} r={25} fill="#2A1A0A" stroke="#5A2D18" strokeWidth="2.5" />
          <circle cx={84} cy={65} r={19} fill="#1D7A6A" />
          <circle cx={84} cy={65} r={19} fill={`url(#${id}-lr)`} />
          <line x1={84} y1={47} x2={84} y2={83} stroke="#28C8A0" strokeWidth="1.5" opacity={0.85} />
          <line x1={66} y1={65} x2={102} y2={65} stroke="#28C8A0" strokeWidth="1.5" opacity={0.85} />
          <circle cx={84} cy={65} r={8} fill="none" stroke="#28C8A0" strokeWidth="1" opacity={0.7} />
          <ellipse cx={77} cy={57} rx={5.5} ry={3.5} fill="white" opacity={0.32} transform="rotate(-30 77 57)" />
          <rect x={108} y={62} width={14} height={7} rx={3.5} fill="#2A1A0A" />
          <circle cx={136} cy={65} r={25} fill="#2A1A0A" stroke="#5A2D18" strokeWidth="2.5" />
          <circle cx={136} cy={65} r={19} fill="#1D7A6A" />
          <circle cx={136} cy={65} r={19} fill={`url(#${id}-lr)`} />
          <line x1={136} y1={47} x2={136} y2={83} stroke="#28C8A0" strokeWidth="1.5" opacity={0.85} />
          <line x1={118} y1={65} x2={154} y2={65} stroke="#28C8A0" strokeWidth="1.5" opacity={0.85} />
          <circle cx={136} cy={65} r={8} fill="none" stroke="#28C8A0" strokeWidth="1" opacity={0.7} />
          <ellipse cx={129} cy={57} rx={5.5} ry={3.5} fill="white" opacity={0.32} transform="rotate(-30 129 57)" />
          {/* Eyes */}
          {blink ? (
            <>
              <path d="M 74 103 Q 88 96 102 103" stroke="#111" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M 118 103 Q 132 96 146 103" stroke="#111" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx={88} cy={103} rx={16} ry={16} fill="white" />
              <circle cx={89} cy={104} r={13} fill="#111" />
              <circle cx={83} cy={98} r={5} fill="white" />
              <circle cx={94} cy={108} r={2.2} fill="white" />
              <ellipse cx={132} cy={103} rx={16} ry={16} fill="white" />
              <circle cx={133} cy={104} r={13} fill="#111" />
              <circle cx={127} cy={98} r={5} fill="white" />
              <circle cx={138} cy={108} r={2.2} fill="white" />
            </>
          )}
          {/* Cheeks */}
          <ellipse cx={72} cy={118} rx={14} ry={9} fill="#F47898" opacity={0.65} />
          <ellipse cx={148} cy={118} rx={14} ry={9} fill="#F47898" opacity={0.65} />
          {/* Mouth */}
          <path d="M 99 126 Q 110 137 121 126" fill="#111" />
          <path d="M 100 126 Q 110 135 120 126" fill="#C03060" />
          <path d="M 102 126 Q 110 133 118 126" fill="white" />
        </g>
      </svg>
    </>
  )
}
