'use client'

import React, { useId, useState, useEffect } from 'react'

export type MascotPOV = 'front' | 'right' | 'left' | 'back' | 'top' | '3/4' | 'bottom'
export type MascotPoseAction =
  | 'idle'
  | 'wave'
  | 'cheer'
  | 'thumbsup'
  | 'bounce'
  | 'salto'
  | 'point'
  | 'thinking'
  | 'sleep'
  | 'happy'

export interface OtbeeVectorProps {
  pov?: MascotPOV
  action?: MascotPoseAction
  size?: number
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  onHover?: () => void
}

/**
 * Hardcoded Pure SVG 2D Otbee Mascot Engine
 * Accurately replicates the character turnaround from "Maskot/2d all pov.png"
 * 100% vector, zero external PNGs, infinitely scalable, fully animated via SVG & CSS.
 */
export default function OtbeeVectorMascot({
  pov = 'front',
  action = 'idle',
  size = 120,
  className = '',
  style,
  onClick,
  onHover,
}: OtbeeVectorProps) {
  const uid = useId().replace(/:/g, '')
  const [blinking, setBlinking] = useState(false)
  const [hovered, setHovered] = useState(false)

  // Natural periodic blinking loop
  useEffect(() => {
    if (pov === 'back' || pov === 'top' || pov === 'bottom' || action === 'sleep') return

    const blinkInterval = setInterval(() => {
      setBlinking(true)
      setTimeout(() => setBlinking(false), 160)
    }, 3800 + Math.random() * 2000)

    return () => clearInterval(blinkInterval)
  }, [pov, action])

  // Colors & Gradients definition
  const yellowGradId = `yellow-body-${uid}`
  const yellowHighlightId = `yellow-hl-${uid}`
  const goggleLensId = `goggle-teal-${uid}`
  const wingGradId = `wing-blue-${uid}`
  const leatherGradId = `leather-${uid}`
  const cheekGradId = `cheek-${uid}`
  const stingerGradId = `stinger-${uid}`

  // Render distinct POV components
  const renderPOV = () => {
    switch (pov) {
      case 'front':
        return renderFront()
      case '3/4':
        return renderThreeQuarter()
      case 'right':
        return renderProfile('right')
      case 'left':
        return renderProfile('left')
      case 'back':
        return renderBack()
      case 'top':
        return renderTop()
      case 'bottom':
        return renderBottom()
      default:
        return renderFront()
    }
  }

  // ==========================================
  // POV 1: FRONT VIEW
  // ==========================================
  const renderFront = () => (
    <g className="otbee-body-group">
      {/* 1. WINGS (Behind body) */}
      <g className="otbee-wings">
        {/* Left Wings */}
        <g className="otbee-wing-left" style={{ transformOrigin: '78px 125px' }}>
          <ellipse
            cx="48"
            cy="118"
            rx="36"
            ry="24"
            transform="rotate(-24 48 118)"
            fill={`url(#${wingGradId})`}
            stroke="#7dd3fc"
            strokeWidth="2.5"
            opacity="0.82"
          />
          <ellipse
            cx="54"
            cy="138"
            rx="26"
            ry="18"
            transform="rotate(-15 54 138)"
            fill={`url(#${wingGradId})`}
            stroke="#7dd3fc"
            strokeWidth="2"
            opacity="0.75"
          />
        </g>
        {/* Right Wings */}
        <g className="otbee-wing-right" style={{ transformOrigin: '162px 125px' }}>
          <ellipse
            cx="192"
            cy="118"
            rx="36"
            ry="24"
            transform="rotate(24 192 118)"
            fill={`url(#${wingGradId})`}
            stroke="#7dd3fc"
            strokeWidth="2.5"
            opacity="0.82"
          />
          <ellipse
            cx="186"
            cy="138"
            rx="26"
            ry="18"
            transform="rotate(15 186 138)"
            fill={`url(#${wingGradId})`}
            stroke="#7dd3fc"
            strokeWidth="2"
            opacity="0.75"
          />
        </g>
      </g>

      {/* 2. STINGER (Bottom center) */}
      <path
        d="M 112 186 Q 120 208 120 216 Q 120 208 128 186 Z"
        fill={`url(#${stingerGradId})`}
      />

      {/* 3. FEET / LEGS */}
      <g className="otbee-feet">
        <path
          d="M 94 180 Q 94 200 102 204 Q 112 204 114 186 Z"
          fill="#ff9800"
          stroke="#e65100"
          strokeWidth="2"
        />
        <path
          d="M 126 186 Q 128 204 138 204 Q 146 200 146 180 Z"
          fill="#ff9800"
          stroke="#e65100"
          strokeWidth="2"
        />
      </g>

      {/* 4. MAIN ABDOMEN / TORSO */}
      <ellipse cx="120" cy="154" rx="46" ry="38" fill={`url(#${yellowGradId})`} />

      {/* Black Stripes on Torso */}
      <path
        d="M 77 142 Q 120 152 163 142 L 165 152 Q 120 162 75 152 Z"
        fill="#1e1e24"
      />
      <path
        d="M 80 162 Q 120 172 160 162 L 157 172 Q 120 182 83 172 Z"
        fill="#1e1e24"
      />

      {/* 5. SATCHEL BAG & STRAP */}
      <g className="otbee-satchel">
        {/* Leather Crossbody Strap */}
        <path
          d="M 88 124 L 148 174 L 142 180 L 82 130 Z"
          fill={`url(#${leatherGradId})`}
          stroke="#3e2312"
          strokeWidth="1.2"
        />
        {/* Satchel Pouch */}
        <rect
          x="140"
          y="156"
          width="26"
          height="22"
          rx="5"
          fill="#5c381e"
          stroke="#3e2312"
          strokeWidth="2"
        />
        {/* Satchel Flap */}
        <path
          d="M 139 156 Q 153 166 167 156 L 167 165 Q 153 174 139 165 Z"
          fill="#784824"
        />
        <circle cx="153" cy="168" r="2" fill="#fbbf24" />
      </g>

      {/* 6. ARMS */}
      {renderArms()}

      {/* 7. NECKERCHIEF (Black bandana) */}
      <g className="otbee-neckerchief">
        <path
          d="M 82 120 Q 120 134 158 120 Q 146 138 120 140 Q 94 138 82 120 Z"
          fill="#232328"
          stroke="#111"
          strokeWidth="1.5"
        />
        {/* Knot on the left */}
        <circle cx="84" cy="124" r="5" fill="#18181b" />
        <path d="M 82 126 Q 74 136 78 142 Q 84 138 84 128 Z" fill="#232328" />
        <path d="M 84 126 Q 80 138 86 144 Q 88 136 86 128 Z" fill="#18181b" />
      </g>

      {/* 8. HEAD DOME */}
      <circle cx="120" cy="88" r="46" fill={`url(#${yellowGradId})`} />
      {/* Head highlight shine */}
      <ellipse cx="106" cy="64" rx="22" ry="12" transform="rotate(-15 106 64)" fill={`url(#${yellowHighlightId})`} />

      {/* 9. CHEEKS (Rosy blushes) */}
      <ellipse cx="94" cy="100" rx="9" ry="5.5" fill={`url(#${cheekGradId})`} />
      <ellipse cx="146" cy="100" rx="9" ry="5.5" fill={`url(#${cheekGradId})`} />

      {/* 10. EYES */}
      {renderEyes(104, 88, 136, 88)}

      {/* 11. MOUTH */}
      {renderMouth(120, 102)}

      {/* 12. AVIATOR GOGGLES */}
      <g className="otbee-goggles">
        {/* Leather strap wrapped on forehead */}
        <path
          d="M 75 74 Q 120 66 165 74 L 164 82 Q 120 74 76 82 Z"
          fill="#5a351d"
          stroke="#381e0d"
          strokeWidth="1.5"
        />
        {/* Left Goggle Rim & Lens */}
        <circle cx="98" cy="74" r="16.5" fill="#422513" stroke="#2a160a" strokeWidth="2.5" />
        <circle cx="98" cy="74" r="13.5" fill={`url(#${goggleLensId})`} />
        {/* Left Crosshair (+) */}
        <line x1="98" y1="63" x2="98" y2="85" stroke="#99f6e4" strokeWidth="1.5" opacity="0.8" />
        <line x1="87" y1="74" x2="109" y2="74" stroke="#99f6e4" strokeWidth="1.5" opacity="0.8" />
        <circle cx="98" cy="74" r="7" fill="none" stroke="#99f6e4" strokeWidth="1" opacity="0.6" />
        {/* Lens reflection glare */}
        <path d="M 90 68 Q 98 64 104 68" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />

        {/* Center bridge */}
        <rect x="111" y="72" width="18" height="5" rx="2" fill="#5a351d" stroke="#381e0d" strokeWidth="1.5" />

        {/* Right Goggle Rim & Lens */}
        <circle cx="142" cy="74" r="16.5" fill="#422513" stroke="#2a160a" strokeWidth="2.5" />
        <circle cx="142" cy="74" r="13.5" fill={`url(#${goggleLensId})`} />
        {/* Right Crosshair (+) */}
        <line x1="142" y1="63" x2="142" y2="85" stroke="#99f6e4" strokeWidth="1.5" opacity="0.8" />
        <line x1="131" y1="74" x2="153" y2="74" stroke="#99f6e4" strokeWidth="1.5" opacity="0.8" />
        <circle cx="142" cy="74" r="7" fill="none" stroke="#99f6e4" strokeWidth="1" opacity="0.6" />
        {/* Lens reflection glare */}
        <path d="M 134 68 Q 142 64 148 68" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />
      </g>

      {/* 13. ANTENNAE (On top of head) */}
      <g className="otbee-antennae">
        {/* Left Antenna */}
        <path
          d="M 108 46 Q 98 28 86 34"
          fill="none"
          stroke="#1e1e24"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="86" cy="34" r="4.5" fill="#1e1e24" />
        {/* Right Antenna */}
        <path
          d="M 132 46 Q 142 28 154 34"
          fill="none"
          stroke="#1e1e24"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="154" cy="34" r="4.5" fill="#1e1e24" />
      </g>
    </g>
  )

  // ==========================================
  // POV 2: 3/4 FRONT VIEW
  // ==========================================
  const renderThreeQuarter = () => (
    <g className="otbee-body-group">
      {/* Wings */}
      <g className="otbee-wings">
        <ellipse
          cx="68"
          cy="120"
          rx="34"
          ry="22"
          transform="rotate(-28 68 120)"
          fill={`url(#${wingGradId})`}
          stroke="#7dd3fc"
          strokeWidth="2.5"
          opacity="0.8"
        />
      </g>

      {/* Stinger */}
      <path d="M 104 184 Q 110 206 112 214 Q 116 206 122 184 Z" fill={`url(#${stingerGradId})`} />

      {/* Feet */}
      <path d="M 92 182 Q 94 200 102 202 Q 110 200 110 184 Z" fill="#ff9800" stroke="#e65100" strokeWidth="2" />
      <path d="M 118 184 Q 120 202 128 202 Q 134 200 134 184 Z" fill="#ff9800" stroke="#e65100" strokeWidth="2" />

      {/* Torso */}
      <ellipse cx="114" cy="154" rx="42" ry="36" fill={`url(#${yellowGradId})`} />
      {/* Stripes (curving in 3/4 angle) */}
      <path d="M 76 144 Q 112 160 152 146 L 150 155 Q 112 169 74 153 Z" fill="#1e1e24" />
      <path d="M 78 163 Q 112 178 148 165 L 146 174 Q 112 187 76 172 Z" fill="#1e1e24" />

      {/* Satchel on right side */}
      <rect x="136" y="152" width="24" height="20" rx="4" fill="#5c381e" stroke="#3e2312" strokeWidth="1.8" />
      <circle cx="148" cy="162" r="2" fill="#fbbf24" />
      {/* Rolled paper scroll sticking out */}
      <rect x="144" y="142" width="8" height="15" rx="3" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.2" transform="rotate(18 148 149)" />

      {/* Arms */}
      <ellipse cx="80" cy="150" rx="10" ry="18" fill="#ffb300" stroke="#f57c00" strokeWidth="1.5" transform="rotate(-15 80 150)" />
      <ellipse cx="132" cy="156" rx="9" ry="16" fill="#ffb300" stroke="#f57c00" strokeWidth="1.5" transform="rotate(20 132 156)" />

      {/* Neckerchief */}
      <path d="M 80 122 Q 114 136 148 122 Q 138 138 114 140 Q 90 138 80 122 Z" fill="#232328" stroke="#111" strokeWidth="1.5" />
      <circle cx="82" cy="126" r="4.5" fill="#18181b" />

      {/* Head */}
      <circle cx="118" cy="90" r="44" fill={`url(#${yellowGradId})`} />
      <ellipse cx="106" cy="66" rx="20" ry="11" transform="rotate(-15 106 66)" fill={`url(#${yellowHighlightId})`} />

      {/* Cheeks */}
      <ellipse cx="98" cy="102" rx="8" ry="5" fill={`url(#${cheekGradId})`} />
      <ellipse cx="142" cy="101" rx="7" ry="4.5" fill={`url(#${cheekGradId})`} />

      {/* Eyes in 3/4 */}
      {renderEyes(108, 90, 134, 89, true)}

      {/* Smile */}
      <path d="M 118 102 Q 125 108 131 103" stroke="#222" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Goggles 3/4 */}
      <path d="M 82 72 Q 118 64 158 74 L 157 81 Q 118 72 82 79 Z" fill="#5a351d" stroke="#381e0d" strokeWidth="1.5" />
      <circle cx="102" cy="74" r="15" fill="#422513" stroke="#2a160a" strokeWidth="2.5" />
      <circle cx="102" cy="74" r="12" fill={`url(#${goggleLensId})`} />
      <line x1="102" y1="64" x2="102" y2="84" stroke="#99f6e4" strokeWidth="1.3" opacity="0.8" />
      <line x1="92" y1="74" x2="112" y2="74" stroke="#99f6e4" strokeWidth="1.3" opacity="0.8" />

      <circle cx="138" cy="75" r="13.5" fill="#422513" stroke="#2a160a" strokeWidth="2.5" />
      <circle cx="138" cy="75" r="10.5" fill={`url(#${goggleLensId})`} />
      <line x1="138" y1="66" x2="138" y2="84" stroke="#99f6e4" strokeWidth="1.2" opacity="0.8" />
      <line x1="129" y1="75" x2="147" y2="75" stroke="#99f6e4" strokeWidth="1.2" opacity="0.8" />

      {/* Antennae */}
      <path d="M 110 48 Q 102 30 92 34" fill="none" stroke="#1e1e24" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="92" cy="34" r="4.2" fill="#1e1e24" />
      <path d="M 128 47 Q 138 28 148 33" fill="none" stroke="#1e1e24" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="148" cy="33" r="4.2" fill="#1e1e24" />
    </g>
  )

  // ==========================================
  // POV 3: PROFILE (RIGHT / LEFT)
  // ==========================================
  const renderProfile = (side: 'right' | 'left') => {
    const flip = side === 'left' ? 'scale(-1, 1) translate(-240, 0)' : ''
    return (
      <g className="otbee-body-group" transform={flip}>
        {/* Wings behind */}
        <ellipse cx="65" cy="118" rx="34" ry="22" transform="rotate(-30 65 118)" fill={`url(#${wingGradId})`} stroke="#7dd3fc" strokeWidth="2.5" opacity="0.8" />

        {/* Stinger */}
        <path d="M 76 182 Q 70 198 66 206 Q 74 198 84 182 Z" fill={`url(#${stingerGradId})`} />

        {/* Feet */}
        <ellipse cx="106" cy="192" rx="12" ry="8" fill="#ff9800" stroke="#e65100" strokeWidth="2" />

        {/* Torso */}
        <ellipse cx="104" cy="154" rx="38" ry="34" fill={`url(#${yellowGradId})`} />
        {/* Vertical stripes on side */}
        <path d="M 88 132 Q 98 154 94 176 L 104 176 Q 108 154 98 132 Z" fill="#1e1e24" />
        <path d="M 114 134 Q 124 154 120 174 L 128 172 Q 132 154 122 134 Z" fill="#1e1e24" />

        {/* Satchel on hip with scroll */}
        <rect x="108" y="152" width="22" height="18" rx="4" fill="#5c381e" stroke="#3e2312" strokeWidth="1.8" />
        <rect x="114" y="142" width="8" height="14" rx="2.5" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.2" transform="rotate(15 118 149)" />

        {/* Profile Arm */}
        <ellipse cx="120" cy="152" rx="9" ry="17" fill="#ffb300" stroke="#f57c00" strokeWidth="1.5" transform="rotate(15 120 152)" />

        {/* Neckerchief */}
        <path d="M 84 124 L 136 124 Q 128 138 108 138 Z" fill="#232328" stroke="#111" strokeWidth="1.5" />
        <circle cx="132" cy="126" r="4.5" fill="#18181b" />

        {/* Head */}
        <circle cx="118" cy="88" r="42" fill={`url(#${yellowGradId})`} />
        <ellipse cx="110" cy="66" rx="18" ry="10" transform="rotate(-15 110 66)" fill={`url(#${yellowHighlightId})`} />

        {/* Snout/Cheek Profile */}
        <ellipse cx="136" cy="98" rx="6" ry="4.5" fill={`url(#${cheekGradId})`} />

        {/* Eye */}
        {renderEyes(128, 88, 128, 88, false, true)}

        {/* Smile profile */}
        <path d="M 136 98 Q 142 102 144 98" stroke="#222" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Goggles in profile */}
        <path d="M 80 72 L 142 74 L 140 82 L 80 80 Z" fill="#5a351d" stroke="#381e0d" strokeWidth="1.5" />
        <circle cx="126" cy="74" r="16" fill="#422513" stroke="#2a160a" strokeWidth="2.5" />
        <circle cx="126" cy="74" r="13" fill={`url(#${goggleLensId})`} />
        <line x1="126" y1="63" x2="126" y2="85" stroke="#99f6e4" strokeWidth="1.3" opacity="0.8" />
        <line x1="115" y1="74" x2="137" y2="74" stroke="#99f6e4" strokeWidth="1.3" opacity="0.8" />

        {/* Antennae */}
        <path d="M 116 48 Q 124 28 134 32" fill="none" stroke="#1e1e24" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="134" cy="32" r="4.2" fill="#1e1e24" />
      </g>
    )
  }

  // ==========================================
  // POV 4: BACK VIEW
  // ==========================================
  const renderBack = () => (
    <g className="otbee-body-group">
      {/* 4 Wings Spread Out */}
      <g className="otbee-wings">
        <ellipse cx="56" cy="118" rx="36" ry="24" transform="rotate(-26 56 118)" fill={`url(#${wingGradId})`} stroke="#7dd3fc" strokeWidth="2.5" opacity="0.85" />
        <ellipse cx="62" cy="138" rx="28" ry="18" transform="rotate(-16 62 138)" fill={`url(#${wingGradId})`} stroke="#7dd3fc" strokeWidth="2" opacity="0.75" />
        <ellipse cx="184" cy="118" rx="36" ry="24" transform="rotate(26 184 118)" fill={`url(#${wingGradId})`} stroke="#7dd3fc" strokeWidth="2.5" opacity="0.85" />
        <ellipse cx="178" cy="138" rx="28" ry="18" transform="rotate(16 178 138)" fill={`url(#${wingGradId})`} stroke="#7dd3fc" strokeWidth="2" opacity="0.75" />
      </g>

      {/* Stinger */}
      <path d="M 112 186 Q 120 208 120 216 Q 120 208 128 186 Z" fill={`url(#${stingerGradId})`} />

      {/* Feet */}
      <ellipse cx="102" cy="192" rx="10" ry="8" fill="#ff9800" stroke="#e65100" strokeWidth="2" />
      <ellipse cx="138" cy="192" rx="10" ry="8" fill="#ff9800" stroke="#e65100" strokeWidth="2" />

      {/* Torso */}
      <ellipse cx="120" cy="154" rx="46" ry="38" fill={`url(#${yellowGradId})`} />
      {/* Black stripes wrapping across back */}
      <path d="M 75 142 Q 120 148 165 142 L 163 152 Q 120 158 77 152 Z" fill="#1e1e24" />
      <path d="M 78 162 Q 120 168 162 162 L 160 172 Q 120 178 80 172 Z" fill="#1e1e24" />

      {/* Satchel hanging on left hip from back */}
      <rect x="74" y="156" width="22" height="18" rx="4" fill="#5c381e" stroke="#3e2312" strokeWidth="1.8" />
      <rect x="80" y="146" width="8" height="14" rx="2.5" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.2" transform="rotate(-15 84 153)" />

      {/* Arms */}
      <ellipse cx="68" cy="150" rx="9" ry="18" fill="#ffb300" stroke="#f57c00" strokeWidth="1.5" transform="rotate(-20 68 150)" />
      <ellipse cx="172" cy="150" rx="9" ry="18" fill="#ffb300" stroke="#f57c00" strokeWidth="1.5" transform="rotate(20 172 150)" />

      {/* Neckerchief back knot */}
      <path d="M 86 122 Q 120 130 154 122 Q 146 136 120 138 Q 94 136 86 122 Z" fill="#232328" stroke="#111" strokeWidth="1.5" />
      <circle cx="150" cy="124" r="5" fill="#18181b" />

      {/* Head Dome Back */}
      <circle cx="120" cy="88" r="46" fill={`url(#${yellowGradId})`} />

      {/* Goggle Strap Running Across Back of Head */}
      <path d="M 76 74 Q 120 72 164 74 L 164 82 Q 120 80 76 82 Z" fill="#5a351d" stroke="#381e0d" strokeWidth="1.8" />

      {/* Antennae */}
      <path d="M 108 46 Q 98 28 86 34" fill="none" stroke="#1e1e24" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="86" cy="34" r="4.5" fill="#1e1e24" />
      <path d="M 132 46 Q 142 28 154 34" fill="none" stroke="#1e1e24" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="154" cy="34" r="4.5" fill="#1e1e24" />
    </g>
  )

  // ==========================================
  // POV 5: TOP VIEW
  // ==========================================
  const renderTop = () => (
    <g className="otbee-body-group">
      {/* Wings fanned out left and right */}
      <ellipse cx="44" cy="120" rx="40" ry="24" transform="rotate(-15 44 120)" fill={`url(#${wingGradId})`} stroke="#7dd3fc" strokeWidth="2.5" opacity="0.8" />
      <ellipse cx="196" cy="120" rx="40" ry="24" transform="rotate(15 196 120)" fill={`url(#${wingGradId})`} stroke="#7dd3fc" strokeWidth="2.5" opacity="0.8" />

      {/* Satchel top */}
      <rect x="162" y="130" width="16" height="22" rx="4" fill="#5c381e" stroke="#3e2312" strokeWidth="1.5" />

      {/* Head viewed from above */}
      <circle cx="120" cy="120" r="56" fill={`url(#${yellowGradId})`} />

      {/* Goggles on front edge of dome */}
      <path d="M 70 148 Q 120 160 170 148 L 168 158 Q 120 170 72 158 Z" fill="#5a351d" stroke="#381e0d" strokeWidth="2" />
      <ellipse cx="98" cy="156" rx="14" ry="10" fill="#422513" stroke="#2a160a" strokeWidth="2" />
      <ellipse cx="98" cy="156" rx="11" ry="8" fill={`url(#${goggleLensId})`} />
      <ellipse cx="142" cy="156" rx="14" ry="10" fill="#422513" stroke="#2a160a" strokeWidth="2" />
      <ellipse cx="142" cy="156" rx="11" ry="8" fill={`url(#${goggleLensId})`} />

      {/* Antennae pointing forward */}
      <path d="M 102 96 Q 84 84 80 72" fill="none" stroke="#1e1e24" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="80" cy="72" r="4.5" fill="#1e1e24" />
      <path d="M 138 96 Q 156 84 160 72" fill="none" stroke="#1e1e24" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="160" cy="72" r="4.5" fill="#1e1e24" />
    </g>
  )

  // ==========================================
  // POV 6: BOTTOM VIEW
  // ==========================================
  const renderBottom = () => (
    <g className="otbee-body-group">
      {/* Underside dome */}
      <ellipse cx="120" cy="120" rx="58" ry="48" fill={`url(#${yellowGradId})`} />

      {/* Stinger in center bottom */}
      <polygon points="120,184 114,158 126,158" fill={`url(#${stingerGradId})`} />

      {/* Feet / Leg bottoms */}
      <ellipse cx="96" cy="128" rx="14" ry="18" fill="#ff9800" stroke="#e65100" strokeWidth="2" />
      <ellipse cx="144" cy="128" rx="14" ry="18" fill="#ff9800" stroke="#e65100" strokeWidth="2" />

      {/* Satchel on side */}
      <rect x="170" y="110" width="18" height="24" rx="4" fill="#5c381e" stroke="#3e2312" strokeWidth="1.5" />

      {/* Goggles rim peeking on top */}
      <path d="M 78 86 Q 120 78 162 86" stroke="#5a351d" strokeWidth="6" fill="none" />
    </g>
  )

  // ==========================================
  // DYNAMIC EYES
  // ==========================================
  const renderEyes = (lx: number, ly: number, rx: number, ry: number, isThreeQuarter = false, isProfile = false) => {
    if (blinking) {
      return (
        <g stroke="#1e1e24" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d={`M ${lx - 8} ${ly} Q ${lx} ${ly + 5} ${lx + 8} ${ly}`} />
          {!isProfile && <path d={`M ${rx - 8} ${ry} Q ${rx} ${ry + 5} ${rx + 8} ${ry}`} />}
        </g>
      )
    }

    if (action === 'sleep') {
      return (
        <g stroke="#1e1e24" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d={`M ${lx - 7} ${ly + 2} Q ${lx} ${ly + 7} ${lx + 7} ${ly + 2}`} />
          {!isProfile && <path d={`M ${rx - 7} ${ry + 2} Q ${rx} ${ry + 7} ${rx + 7} ${ry + 2}`} />}
        </g>
      )
    }

    if (action === 'happy' || action === 'cheer') {
      return (
        <g stroke="#1e1e24" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d={`M ${lx - 8} ${ly + 3} Q ${lx} ${ly - 6} ${lx + 8} ${ly + 3}`} />
          {!isProfile && <path d={`M ${rx - 8} ${ry + 3} Q ${rx} ${ry - 6} ${rx + 8} ${ry + 3}`} />}
        </g>
      )
    }

    // Classic Kawaii Anime Eyes
    return (
      <g className="otbee-eyes">
        {/* Left Eye */}
        <ellipse cx={lx} cy={ly} rx={isThreeQuarter ? 7.5 : 8} ry="11" fill="#1e1e24" />
        {/* Main highlight */}
        <circle cx={lx - 2.5} cy={ly - 4} r="3.2" fill="#fff" />
        {/* Secondary mini highlight */}
        <circle cx={lx + 2.5} cy={ly + 3.5} r="1.6" fill="#fff" />

        {/* Right Eye (omitted in profile) */}
        {!isProfile && (
          <>
            <ellipse cx={rx} cy={ry} rx={isThreeQuarter ? 6.5 : 8} ry="11" fill="#1e1e24" />
            <circle cx={rx - 2.5} cy={ry - 4} r="3.2" fill="#fff" />
            <circle cx={rx + 2.5} cy={ry + 3.5} r="1.6" fill="#fff" />
          </>
        )}
      </g>
    )
  }

  // ==========================================
  // DYNAMIC MOUTH
  // ==========================================
  const renderMouth = (x: number, y: number) => {
    if (action === 'happy' || action === 'cheer' || action === 'bounce') {
      return (
        <g>
          {/* Open joyous smile with pink tongue */}
          <path
            d={`M ${x - 8} ${y - 2} Q ${x} ${y + 11} ${x + 8} ${y - 2} Z`}
            fill="#a21caf"
            stroke="#1e1e24"
            strokeWidth="2"
          />
          <path
            d={`M ${x - 5} ${y + 4} Q ${x} ${y + 1} ${x + 5} ${y + 4} Q ${x} ${y + 9} ${x - 5} ${y + 4} Z`}
            fill="#f472b6"
          />
        </g>
      )
    }

    // Default cute closed smile
    return (
      <path
        d={`M ${x - 6} ${y} Q ${x} ${y + 6} ${x + 6} ${y}`}
        stroke="#1e1e24"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    )
  }

  // ==========================================
  // DYNAMIC ARMS PER ACTION
  // ==========================================
  const renderArms = () => {
    if (action === 'wave') {
      return (
        <g className="otbee-arms">
          {/* Left arm relaxed */}
          <ellipse cx="72" cy="150" rx="9" ry="17" fill="#ffb300" stroke="#f57c00" strokeWidth="1.5" transform="rotate(-20 72 150)" />
          {/* Right arm waving up high */}
          <g className="otbee-arm-wave" style={{ transformOrigin: '166px 140px' }}>
            <path
              d="M 166 140 Q 185 115 194 95 Q 200 98 196 108 Q 186 128 174 148 Z"
              fill="#ffb300"
              stroke="#f57c00"
              strokeWidth="1.5"
            />
            {/* Chubby palm */}
            <circle cx="196" cy="98" r="6" fill="#ffb300" stroke="#f57c00" strokeWidth="1.5" />
          </g>
        </g>
      )
    }

    if (action === 'cheer') {
      return (
        <g className="otbee-arms">
          {/* Both arms raised up in victory */}
          <path d="M 74 140 Q 55 115 46 95 Q 40 98 44 108 Q 54 128 66 148 Z" fill="#ffb300" stroke="#f57c00" strokeWidth="1.5" />
          <circle cx="44" cy="98" r="6" fill="#ffb300" stroke="#f57c00" strokeWidth="1.5" />

          <path d="M 166 140 Q 185 115 194 95 Q 200 98 196 108 Q 186 128 174 148 Z" fill="#ffb300" stroke="#f57c00" strokeWidth="1.5" />
          <circle cx="196" cy="98" r="6" fill="#ffb300" stroke="#f57c00" strokeWidth="1.5" />
        </g>
      )
    }

    if (action === 'thumbsup') {
      return (
        <g className="otbee-arms">
          <ellipse cx="72" cy="150" rx="9" ry="17" fill="#ffb300" stroke="#f57c00" strokeWidth="1.5" transform="rotate(-20 72 150)" />
          {/* Right arm presenting thumbs up */}
          <ellipse cx="166" cy="144" rx="16" ry="9" fill="#ffb300" stroke="#f57c00" strokeWidth="1.5" transform="rotate(-20 166 144)" />
          {/* Thumbs up hand */}
          <circle cx="180" cy="138" r="6" fill="#ffb300" stroke="#f57c00" strokeWidth="1.5" />
          <path d="M 180 138 L 180 126 Q 183 124 185 126 L 185 138 Z" fill="#ff9800" stroke="#e65100" strokeWidth="1.5" />
        </g>
      )
    }

    // Default friendly open arms
    return (
      <g className="otbee-arms">
        <ellipse cx="70" cy="152" rx="9" ry="18" fill="#ffb300" stroke="#f57c00" strokeWidth="1.5" transform="rotate(-24 70 152)" />
        <ellipse cx="170" cy="152" rx="9" ry="18" fill="#ffb300" stroke="#f57c00" strokeWidth="1.5" transform="rotate(24 170 152)" />
      </g>
    )
  }

  // Animation CSS styles based on action
  const getActionClass = () => {
    switch (action) {
      case 'bounce':
        return 'otbee-action-bounce'
      case 'salto':
        return 'otbee-action-salto'
      case 'wave':
        return 'otbee-action-wave'
      case 'cheer':
        return 'otbee-action-cheer'
      case 'thinking':
        return 'otbee-action-thinking'
      case 'sleep':
        return 'otbee-action-sleep'
      default:
        return 'otbee-action-idle'
    }
  }

  return (
    <div
      className={`relative inline-block select-none cursor-${onClick ? 'pointer' : 'default'} ${className}`}
      style={{
        width: size,
        height: size,
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={() => { setHovered(true); onHover?.() }}
      onMouseLeave={() => setHovered(false)}
    >
      <style>{`
        /* Global Otbee Animation Keyframes */
        @keyframes otbee-kf-idle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(1.5deg); }
        }
        @keyframes otbee-kf-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          20% { transform: translateY(-18px) scaleX(0.94) scaleY(1.08); }
          40% { transform: translateY(0) scaleX(1.12) scaleY(0.9); }
          60% { transform: translateY(-8px) scale(1.02); }
          80% { transform: translateY(0) scaleX(1.04) scaleY(0.96); }
        }
        @keyframes otbee-kf-salto {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          15% { transform: translateY(8px) scaleX(1.22) scaleY(0.78); }
          45% { transform: translateY(-70px) rotate(180deg) scaleX(0.88) scaleY(1.15); }
          75% { transform: translateY(-50px) rotate(330deg) scale(0.95); }
          90% { transform: translateY(0) rotate(360deg) scaleX(1.18) scaleY(0.82); }
          100% { transform: translateY(0) rotate(360deg) scale(1); }
        }
        @keyframes otbee-kf-wing-left {
          0%, 100% { transform: rotate(0deg) scaleY(1); }
          50% { transform: rotate(14deg) scaleY(0.86); }
        }
        @keyframes otbee-kf-wing-right {
          0%, 100% { transform: rotate(0deg) scaleY(1); }
          50% { transform: rotate(-14deg) scaleY(0.86); }
        }
        @keyframes otbee-kf-arm-wave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(26deg); }
        }
        @keyframes otbee-kf-thinking {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-4px) rotate(3deg); }
        }

        .otbee-action-idle {
          animation: otbee-kf-idle 2.8s ease-in-out infinite;
        }
        .otbee-action-bounce {
          animation: otbee-kf-bounce 1.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
        }
        .otbee-action-salto {
          animation: otbee-kf-salto 0.9s cubic-bezier(0.34, 1.3, 0.64, 1) both;
        }
        .otbee-action-wave {
          animation: otbee-kf-idle 2.4s ease-in-out infinite;
        }
        .otbee-action-cheer {
          animation: otbee-kf-bounce 1.4s ease-in-out infinite;
        }
        .otbee-action-thinking {
          animation: otbee-kf-thinking 3.5s ease-in-out infinite;
        }
        .otbee-action-sleep {
          animation: otbee-kf-idle 4s ease-in-out infinite;
          opacity: 0.92;
        }

        .otbee-wing-left {
          animation: otbee-kf-wing-left 0.22s ease-in-out infinite;
        }
        .otbee-wing-right {
          animation: otbee-kf-wing-right 0.22s ease-in-out infinite;
        }
        .otbee-arm-wave {
          animation: otbee-kf-arm-wave 0.55s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 240 240"
        width="100%"
        height="100%"
        className={`${getActionClass()} transition-transform duration-200`}
        style={{
          transform: hovered && action === 'idle' ? 'scale(1.08)' : undefined,
          filter: hovered ? 'drop-shadow(0 6px 16px rgba(245, 158, 11, 0.45))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.18))',
        }}
      >
        <defs>
          {/* Golden Yellow Body Gradient */}
          <linearGradient id={yellowGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffd54f" />
            <stop offset="55%" stopColor="#ffb300" />
            <stop offset="100%" stopColor="#ff8f00" />
          </linearGradient>

          {/* Yellow Highlight Shine */}
          <linearGradient id={yellowHighlightId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Glowing Teal Goggle Lens */}
          <linearGradient id={goggleLensId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="60%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#115e59" />
          </linearGradient>

          {/* Translucent Wings Gradient */}
          <linearGradient id={wingGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#bae6fd" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.6" />
          </linearGradient>

          {/* Leather Brown Gradient */}
          <linearGradient id={leatherGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#784824" />
            <stop offset="100%" stopColor="#452712" />
          </linearGradient>

          {/* Cheek Pink Blush Gradient */}
          <radialGradient id={cheekGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fb7185" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
          </radialGradient>

          {/* Stinger Dark Gradient */}
          <linearGradient id={stingerGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>
        </defs>

        {renderPOV()}
      </svg>
    </div>
  )
}

/**
 * Pure Vector Otbee Head Component
 * Strictly head only (no neck, no body), animated with natural blinking.
 */
export function OtbeeVectorHead({
  size = 64,
  className = '',
  style,
}: {
  size?: number
  className?: string
  style?: React.CSSProperties
}) {
  const uid = useId().replace(/:/g, '')
  const [blinking, setBlinking] = useState(false)

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true)
      setTimeout(() => setBlinking(false), 160)
    }, 3500 + Math.random() * 2000)
    return () => clearInterval(blinkInterval)
  }, [])

  const yellowId = `vhead-yellow-${uid}`
  const tealId = `vhead-teal-${uid}`
  const cheekId = `vhead-cheek-${uid}`

  return (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      <svg viewBox="60 20 120 115" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={yellowId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffd54f" />
            <stop offset="60%" stopColor="#ffb300" />
            <stop offset="100%" stopColor="#ff8f00" />
          </linearGradient>
          <linearGradient id={tealId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="60%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#115e59" />
          </linearGradient>
          <radialGradient id={cheekId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fb7185" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Head Dome */}
        <circle cx="120" cy="85" r="46" fill={`url(#${yellowId})`} />
        {/* Head Shine */}
        <ellipse cx="106" cy="62" rx="20" ry="11" transform="rotate(-15 106 62)" fill="#fff" opacity="0.35" />

        {/* Cheeks */}
        <ellipse cx="94" cy="98" rx="9" ry="5.5" fill={`url(#${cheekId})`} />
        <ellipse cx="146" cy="98" rx="9" ry="5.5" fill={`url(#${cheekId})`} />

        {/* Eyes */}
        {blinking ? (
          <g stroke="#1e1e24" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M 96 86 Q 104 91 112 86" />
            <path d="M 128 86 Q 136 91 144 86" />
          </g>
        ) : (
          <g>
            <ellipse cx="104" cy="86" rx="8" ry="11" fill="#1e1e24" />
            <circle cx="101.5" cy="82" r="3.2" fill="#fff" />
            <circle cx="106.5" cy="89.5" r="1.6" fill="#fff" />

            <ellipse cx="136" cy="86" rx="8" ry="11" fill="#1e1e24" />
            <circle cx="133.5" cy="82" r="3.2" fill="#fff" />
            <circle cx="138.5" cy="89.5" r="1.6" fill="#fff" />
          </g>
        )}

        {/* Cute Smile */}
        <path d="M 114 100 Q 120 106 126 100" stroke="#1e1e24" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Goggles on Forehead */}
        <path d="M 75 72 Q 120 64 165 72 L 164 80 Q 120 72 76 80 Z" fill="#5a351d" stroke="#381e0d" strokeWidth="1.5" />
        <circle cx="98" cy="72" r="16" fill="#422513" stroke="#2a160a" strokeWidth="2.5" />
        <circle cx="98" cy="72" r="13" fill={`url(#${tealId})`} />
        <line x1="98" y1="62" x2="98" y2="82" stroke="#99f6e4" strokeWidth="1.5" opacity="0.85" />
        <line x1="88" y1="72" x2="108" y2="72" stroke="#99f6e4" strokeWidth="1.5" opacity="0.85" />
        <path d="M 91 66 Q 98 62 104 66" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.9" />

        <rect x="111" y="70" width="18" height="5" rx="2" fill="#5a351d" stroke="#381e0d" strokeWidth="1.5" />

        <circle cx="142" cy="72" r="16" fill="#422513" stroke="#2a160a" strokeWidth="2.5" />
        <circle cx="142" cy="72" r="13" fill={`url(#${tealId})`} />
        <line x1="142" y1="62" x2="142" y2="82" stroke="#99f6e4" strokeWidth="1.5" opacity="0.85" />
        <line x1="132" y1="72" x2="152" y2="72" stroke="#99f6e4" strokeWidth="1.5" opacity="0.85" />
        <path d="M 135 66 Q 142 62 148 66" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.9" />

        {/* Antennae */}
        <path d="M 108 44 Q 98 26 86 32" fill="none" stroke="#1e1e24" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="86" cy="32" r="4.5" fill="#1e1e24" />
        <path d="M 132 44 Q 142 26 154 32" fill="none" stroke="#1e1e24" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="154" cy="32" r="4.5" fill="#1e1e24" />
      </svg>
    </div>
  )
}
