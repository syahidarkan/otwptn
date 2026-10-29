import React from 'react'

export type PatternType =
  | 'navy-explorer'
  | 'honeycomb-gold'
  | 'mentor-cosmic'
  | 'feature-essay'
  | 'feature-calc'
  | 'feature-ai'
  | 'feature-video'
  | 'feature-docs'
  | 'feature-tracking'
  | 'feature-community'
  | 'pintarly-doodles'

interface CardPatternProps {
  type: PatternType
  opacity?: number
  className?: string
  style?: React.CSSProperties
}

export default function CardPattern({
  type,
  opacity = 0.16,
  className = '',
  style = {},
}: CardPatternProps) {
  if (type === 'navy-explorer') {
    return (
      <div
        className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
        style={{ opacity, ...style }}
        aria-hidden="true"
      >
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 1000 350"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Honeycomb cluster 1 */}
          <g transform="translate(40, 30) scale(0.9)">
            <polygon points="30,0 60,17 60,52 30,70 0,52 0,17" />
            <polygon points="90,0 120,17 120,52 90,70 60,52 60,17" />
            <polygon points="60,52 90,70 90,105 60,122 30,105 30,70" />
            <polygon points="120,52 150,70 150,105 120,122 90,105 90,70" />
            <circle cx="30" cy="35" r="3" fill="currentColor" />
            <circle cx="90" cy="35" r="3" fill="currentColor" />
          </g>

          {/* Bee 1 with dashed loop */}
          <g transform="translate(190, 45) scale(0.85)">
            <ellipse cx="25" cy="20" rx="14" ry="10" />
            <line x1="20" y1="10" x2="20" y2="30" />
            <line x1="28" y1="11" x2="28" y2="29" />
            <ellipse cx="21" cy="8" rx="6" ry="10" transform="rotate(-25 21 8)" />
            <ellipse cx="29" cy="8" rx="6" ry="10" transform="rotate(25 29 8)" />
            <path d="M-40,60 C-10,70 5,30 25,20" strokeDasharray="3 4" />
          </g>

          {/* Backpack */}
          <g transform="translate(320, 40) scale(0.9)">
            <rect x="10" y="15" width="40" height="42" rx="8" />
            <path d="M20,15 L20,8 C20,5 40,5 40,8 L40,15" />
            <rect x="18" y="28" width="24" height="20" rx="4" />
            <line x1="30" y1="28" x2="30" y2="48" />
          </g>

          {/* Honeycomb cluster 2 */}
          <g transform="translate(420, 25) scale(0.85)">
            <polygon points="30,0 60,17 60,52 30,70 0,52 0,17" />
            <polygon points="90,0 120,17 120,52 90,70 60,52 60,17" />
            <polygon points="60,52 90,70 90,105 60,122 30,105 30,70" />
          </g>

          {/* Flag on mountain pole */}
          <g transform="translate(540, 60) scale(0.9)">
            <line x1="15" y1="5" x2="15" y2="60" />
            <path d="M15,8 L45,18 L15,28 Z" />
            <circle cx="15" cy="5" r="2" fill="currentColor" />
          </g>

          {/* Open Book */}
          <g transform="translate(640, 40) scale(0.85)">
            <path d="M10,40 C25,35 45,35 55,42 C65,35 85,35 100,40 L100,75 C85,70 65,70 55,77 C45,70 25,70 10,75 Z" />
            <line x1="55" y1="42" x2="55" y2="77" />
          </g>

          {/* Compass Rose */}
          <g transform="translate(770, 45) scale(0.9)">
            <circle cx="35" cy="35" r="28" />
            <circle cx="35" cy="35" r="24" strokeDasharray="2 3" />
            <polygon points="35,12 40,32 35,35 30,32" fill="currentColor" />
            <polygon points="35,58 40,38 35,35 30,38" />
            <polygon points="12,35 32,30 35,35 32,40" />
            <polygon points="58,35 38,30 35,35 38,40" />
          </g>

          {/* Pencil & Ruler */}
          <g transform="translate(880, 50) scale(0.9)">
            <rect x="10" y="10" width="12" height="50" rx="3" transform="rotate(-35 10 10)" />
            <polygon points="39,-7 46,-12 51,-7 44,-2" />
          </g>

          {/* ROW 2: Binoculars, Map, Bee 2, Graduation Cap, Goggles */}
          <g transform="translate(60, 180) scale(0.85)">
            <ellipse cx="20" cy="35" rx="14" ry="18" />
            <ellipse cx="56" cy="35" rx="14" ry="18" />
            <line x1="34" y1="35" x2="42" y2="35" strokeWidth="2.5" />
            <circle cx="20" cy="35" r="8" />
            <circle cx="56" cy="35" r="8" />
          </g>

          {/* Folded Map */}
          <g transform="translate(170, 185) scale(0.85)">
            <polygon points="10,15 30,10 50,15 70,10 70,60 50,65 30,60 10,65" />
            <line x1="30" y1="10" x2="30" y2="60" />
            <line x1="50" y1="15" x2="50" y2="65" />
            <path d="M20,35 C35,25 45,45 60,35" strokeDasharray="2 2" />
          </g>

          {/* Bee 2 */}
          <g transform="translate(300, 190) scale(0.8)">
            <ellipse cx="25" cy="20" rx="13" ry="9" />
            <line x1="20" y1="11" x2="20" y2="29" />
            <line x1="28" y1="12" x2="28" y2="28" />
            <ellipse cx="21" cy="9" rx="5" ry="9" transform="rotate(-30 21 9)" />
            <ellipse cx="29" cy="9" rx="5" ry="9" transform="rotate(30 29 9)" />
            <path d="M60,30 C90,10 110,40 135,25" strokeDasharray="3 3" />
          </g>

          {/* Honeycomb cluster 3 */}
          <g transform="translate(430, 175) scale(0.9)">
            <polygon points="30,0 60,17 60,52 30,70 0,52 0,17" />
            <polygon points="90,0 120,17 120,52 90,70 60,52 60,17" />
            <polygon points="60,52 90,70 90,105 60,122 30,105 30,70" />
          </g>

          {/* Goggles / Glasses */}
          <g transform="translate(600, 200) scale(0.9)">
            <circle cx="20" cy="20" r="16" />
            <circle cx="58" cy="20" r="16" />
            <path d="M36,18 Q39,14 42,18" strokeWidth="2" />
            <line x1="4" y1="18" x2="0" y2="15" />
            <line x1="74" y1="18" x2="78" y2="15" />
          </g>

          {/* Document / Diploma Scroll */}
          <g transform="translate(730, 190) scale(0.9)">
            <rect x="15" y="10" width="38" height="50" rx="4" />
            <line x1="22" y1="20" x2="45" y2="20" />
            <line x1="22" y1="28" x2="45" y2="28" />
            <line x1="22" y1="36" x2="38" y2="36" />
            <circle cx="34" cy="48" r="4" fill="currentColor" />
          </g>

          {/* Bar Chart Growth */}
          <g transform="translate(850, 195) scale(0.85)">
            <line x1="10" y1="50" x2="65" y2="50" />
            <rect x="16" y="32" width="8" height="18" rx="2" />
            <rect x="30" y="22" width="8" height="28" rx="2" />
            <rect x="44" y="12" width="8" height="38" rx="2" />
            <path d="M12,30 L28,20 L42,24 L56,8" strokeWidth="2" />
            <polygon points="56,8 52,14 58,13" fill="currentColor" />
          </g>

          {/* Floating Stars & Sparkles across the scene */}
          <g>
            <polygon points="120,30 122,36 128,38 122,40 120,46 118,40 112,38 118,36" fill="currentColor" />
            <polygon points="280,120 282,124 286,126 282,128 280,132 278,128 274,126 278,124" fill="currentColor" />
            <polygon points="520,30 522,35 527,37 522,39 520,44 518,39 513,37 518,35" fill="currentColor" />
            <polygon points="710,130 712,135 717,137 712,139 710,144 708,139 703,137 708,135" fill="currentColor" />
            <polygon points="940,140 942,145 947,147 942,149 940,154 938,149 933,147 938,145" fill="currentColor" />
            <circle cx="240" cy="140" r="2.5" fill="currentColor" />
            <circle cx="480" cy="110" r="2" fill="currentColor" />
            <circle cx="680" cy="80" r="2.5" fill="currentColor" />
            <circle cx="820" cy="130" r="2" fill="currentColor" />
          </g>
        </svg>
      </div>
    )
  }

  if (type === 'honeycomb-gold') {
    return (
      <div
        className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
        style={{ opacity, ...style }}
        aria-hidden="true"
      >
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 800 300"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Honeycomb grid cluster */}
          <g transform="translate(20, 20) scale(0.95)">
            <polygon points="35,5 70,25 70,65 35,85 0,65 0,25" />
            <polygon points="105,5 140,25 140,65 105,85 70,65 70,25" />
            <polygon points="70,65 105,85 105,125 70,145 35,125 35,85" />
            <polygon points="140,65 175,85 175,125 140,145 105,125 105,85" />
            <polygon points="210,65 245,85 245,125 210,145 175,125 175,85" />
          </g>

          {/* Dotted bee flight */}
          <path
            d="M200,120 C240,60 320,160 380,80 C440,10 500,90 560,50"
            strokeDasharray="4 5"
            strokeWidth="2"
          />

          {/* Bee silhouette */}
          <g transform="translate(560, 40) scale(1.1)">
            <ellipse cx="20" cy="15" rx="12" ry="8" />
            <line x1="16" y1="7" x2="16" y2="23" strokeWidth="2" />
            <line x1="23" y1="8" x2="23" y2="22" strokeWidth="2" />
            <ellipse cx="17" cy="5" rx="5" ry="8" transform="rotate(-20 17 5)" />
            <ellipse cx="24" cy="5" rx="5" ry="8" transform="rotate(20 24 5)" />
          </g>

          {/* Fountain pen / nib */}
          <g transform="translate(680, 50) scale(1)">
            <path d="M20,10 L35,45 L15,80 L5,80 L-15,45 Z" />
            <line x1="10" y1="10" x2="10" y2="55" strokeWidth="2" />
            <circle cx="10" cy="55" r="2.5" fill="currentColor" />
          </g>

          {/* Document draft lines */}
          <g transform="translate(320, 160) scale(0.9)">
            <rect x="0" y="0" width="70" height="90" rx="8" />
            <line x1="12" y1="20" x2="58" y2="20" />
            <line x1="12" y1="35" x2="58" y2="35" />
            <line x1="12" y1="50" x2="45" y2="50" />
            <line x1="12" y1="65" x2="50" y2="65" />
          </g>

          {/* Honeycomb cluster right */}
          <g transform="translate(600, 140) scale(0.85)">
            <polygon points="35,5 70,25 70,65 35,85 0,65 0,25" />
            <polygon points="105,5 140,25 140,65 105,85 70,65 70,25" />
            <polygon points="70,65 105,85 105,125 70,145 35,125 35,85" />
          </g>

          {/* Stars */}
          <polygon points="120,220 122,226 128,228 122,230 120,236 118,230 112,228 118,226" fill="currentColor" />
          <polygon points="480,210 482,215 487,217 482,219 480,224 478,219 473,217 478,215" fill="currentColor" />
        </svg>
      </div>
    )
  }

  if (type === 'mentor-cosmic') {
    return (
      <div
        className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
        style={{ opacity, ...style }}
        aria-hidden="true"
      >
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 1000 350"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Constellation lines */}
          <path d="M60,80 L140,50 L220,100 L310,60 L420,110" strokeDasharray="3 4" />
          <circle cx="60" cy="80" r="4" fill="currentColor" />
          <circle cx="140" cy="50" r="5" fill="currentColor" />
          <circle cx="220" cy="100" r="4" fill="currentColor" />
          <circle cx="310" cy="60" r="6" fill="currentColor" />
          <circle cx="420" cy="110" r="4" fill="currentColor" />

          {/* Headset mentor */}
          <g transform="translate(180, 160) scale(1)">
            <path d="M15,40 C15,18 45,18 45,40" strokeWidth="2.5" />
            <rect x="10" y="38" width="10" height="18" rx="4" fill="currentColor" />
            <rect x="40" y="38" width="10" height="18" rx="4" fill="currentColor" />
            <path d="M15,50 C15,62 30,65 35,62" strokeWidth="2" />
            <circle cx="37" cy="61" r="3" fill="currentColor" />
          </g>

          {/* Graduation Cap */}
          <g transform="translate(520, 50) scale(1.1)">
            <polygon points="40,10 80,25 40,40 0,25" />
            <polygon points="15,31 15,52 40,62 65,52 65,31" />
            <path d="M80,25 L88,40 L88,60" />
            <circle cx="88" cy="62" r="3" fill="currentColor" />
          </g>

          {/* Trophy of Excellence */}
          <g transform="translate(720, 60) scale(1)">
            <path d="M15,15 L55,15 L50,45 C48,55 22,55 20,45 Z" />
            <path d="M15,22 C5,22 5,38 17,38" />
            <path d="M55,22 C65,22 65,38 53,38" />
            <line x1="35" y1="52" x2="35" y2="68" strokeWidth="3" />
            <rect x="22" y="68" width="26" height="8" rx="2" />
            <polygon points="35,26 37,32 43,33 39,37 40,43 35,40 30,43 31,37 27,33 33,32" fill="currentColor" />
          </g>

          {/* Stars & Orbit */}
          <ellipse cx="850" cy="200" rx="90" ry="25" strokeDasharray="3 5" transform="rotate(-15 850 200)" />
          <circle cx="850" cy="200" r="14" />
          <circle cx="920" cy="185" r="4" fill="currentColor" />

          {/* Scattered diamonds */}
          <polygon points="80,250 84,258 92,260 84,262 80,270 76,262 68,260 76,258" fill="currentColor" />
          <polygon points="460,240 463,246 470,248 463,250 460,256 457,250 450,248 457,246" fill="currentColor" />
          <polygon points="650,220 653,226 660,228 653,230 650,236 647,230 640,228 647,226" fill="currentColor" />
        </svg>
      </div>
    )
  }

  // Feature specific patterns (Essay, Calculator, AI, Video, Docs, Tracking, Community)
  if (type === 'feature-essay') {
    return (
      <div className={`absolute inset-0 pointer-events-none select-none ${className}`} style={{ opacity, ...style }} aria-hidden="true">
        <svg className="w-full h-full object-cover" viewBox="0 0 300 200" fill="none" stroke="currentColor" strokeWidth="1.5">
          <g transform="translate(180, 20) scale(0.8)">
            <rect x="0" y="0" width="90" height="120" rx="10" />
            <line x1="18" y1="25" x2="72" y2="25" />
            <line x1="18" y1="45" x2="72" y2="45" />
            <line x1="18" y1="65" x2="72" y2="65" />
            <line x1="18" y1="85" x2="50" y2="85" />
          </g>
          <g transform="translate(30, 90) scale(0.9)">
            <polygon points="10,0 20,5 20,40 10,50 0,40 0,5" transform="rotate(-40 10 20)" />
          </g>
          <polygon points="70,30 73,38 82,40 73,42 70,50 67,42 58,40 67,38" fill="currentColor" />
          <polygon points="240,150 242,156 248,158 242,160 240,166 238,160 232,158 238,156" fill="currentColor" />
        </svg>
      </div>
    )
  }

  if (type === 'feature-calc') {
    return (
      <div className={`absolute inset-0 pointer-events-none select-none ${className}`} style={{ opacity, ...style }} aria-hidden="true">
        <svg className="w-full h-full object-cover" viewBox="0 0 300 200" fill="none" stroke="currentColor" strokeWidth="1.5">
          <g transform="translate(190, 25) scale(0.85)">
            <circle cx="45" cy="45" r="40" />
            <circle cx="45" cy="45" r="28" strokeDasharray="3 3" />
            <line x1="45" y1="5" x2="45" y2="85" />
            <line x1="5" y1="45" x2="85" y2="45" />
          </g>
          <text x="35" y="70" fontSize="38" fontWeight="bold" fill="currentColor" stroke="none">∑</text>
          <text x="75" y="140" fontSize="32" fontWeight="bold" fill="currentColor" stroke="none">%</text>
          <text x="210" y="170" fontSize="34" fontWeight="bold" fill="currentColor" stroke="none">√x</text>
        </svg>
      </div>
    )
  }

  if (type === 'feature-ai') {
    return (
      <div className={`absolute inset-0 pointer-events-none select-none ${className}`} style={{ opacity, ...style }} aria-hidden="true">
        <svg className="w-full h-full object-cover" viewBox="0 0 300 200" fill="none" stroke="currentColor" strokeWidth="1.5">
          <g transform="translate(180, 20) scale(0.8)">
            <rect x="20" y="20" width="70" height="70" rx="14" />
            <circle cx="42" cy="48" r="6" fill="currentColor" />
            <circle cx="68" cy="48" r="6" fill="currentColor" />
            <path d="M42,66 Q55,75 68,66" strokeWidth="2" />
            <line x1="55" y1="5" x2="55" y2="20" strokeWidth="2" />
            <circle cx="55" cy="5" r="4" fill="currentColor" />
          </g>
          <path d="M40,60 L90,60 L120,110 L160,110" strokeDasharray="3 4" strokeWidth="2" />
          <circle cx="40" cy="60" r="4" fill="currentColor" />
          <circle cx="90" cy="60" r="4" fill="currentColor" />
          <circle cx="120" cy="110" r="4" fill="currentColor" />
          <circle cx="160" cy="110" r="4" fill="currentColor" />
        </svg>
      </div>
    )
  }

  if (type === 'feature-video') {
    return (
      <div className={`absolute inset-0 pointer-events-none select-none ${className}`} style={{ opacity, ...style }} aria-hidden="true">
        <svg className="w-full h-full object-cover" viewBox="0 0 300 200" fill="none" stroke="currentColor" strokeWidth="1.5">
          <g transform="translate(180, 25) scale(0.9)">
            <rect x="0" y="0" width="90" height="65" rx="12" />
            <polygon points="35,22 58,33 35,44" fill="currentColor" />
          </g>
          <g transform="translate(25, 90) scale(0.8)">
            <circle cx="30" cy="30" r="26" />
            <circle cx="30" cy="30" r="10" />
            <circle cx="30" cy="8" r="4" fill="currentColor" />
            <circle cx="30" cy="52" r="4" fill="currentColor" />
          </g>
        </svg>
      </div>
    )
  }

  if (type === 'feature-docs') {
    return (
      <div className={`absolute inset-0 pointer-events-none select-none ${className}`} style={{ opacity, ...style }} aria-hidden="true">
        <svg className="w-full h-full object-cover" viewBox="0 0 300 200" fill="none" stroke="currentColor" strokeWidth="1.5">
          <g transform="translate(180, 30) scale(0.85)">
            <path d="M10,20 L35,20 L45,30 L85,30 C90,30 95,35 95,40 L95,75 C95,80 90,85 85,85 L10,85 C5,85 0,80 0,75 L0,30 C0,25 5,20 10,20 Z" />
            <path d="M40,55 L48,63 L65,45" strokeWidth="2.5" />
          </g>
          <g transform="translate(30, 90) scale(0.8)">
            <rect x="0" y="0" width="50" height="65" rx="6" />
            <circle cx="25" cy="45" r="8" fill="currentColor" />
          </g>
        </svg>
      </div>
    )
  }

  if (type === 'feature-tracking') {
    return (
      <div className={`absolute inset-0 pointer-events-none select-none ${className}`} style={{ opacity, ...style }} aria-hidden="true">
        <svg className="w-full h-full object-cover" viewBox="0 0 300 200" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20,150 C80,120 70,50 140,50 C210,50 200,140 270,110" strokeDasharray="4 4" strokeWidth="2" />
          <circle cx="20" cy="150" r="5" fill="currentColor" />
          <circle cx="140" cy="50" r="6" fill="currentColor" />
          <circle cx="270" cy="110" r="7" fill="currentColor" />
          <g transform="translate(250, 65) scale(0.8)">
            <line x1="10" y1="0" x2="10" y2="45" strokeWidth="2" />
            <polygon points="10,5 35,15 10,25" fill="currentColor" />
          </g>
        </svg>
      </div>
    )
  }

  if (type === 'feature-community') {
    return (
      <div className={`absolute inset-0 pointer-events-none select-none ${className}`} style={{ opacity, ...style }} aria-hidden="true">
        <svg className="w-full h-full object-cover" viewBox="0 0 300 200" fill="none" stroke="currentColor" strokeWidth="1.5">
          <g transform="translate(160, 20) scale(0.85)">
            <path d="M20,10 C50,10 75,25 75,45 C75,55 68,64 57,70 L60,85 L44,77 C36,79 28,80 20,80 C-10,80 -35,65 -35,45 C-35,25 -10,10 20,10 Z" />
            <circle cx="5" cy="45" r="4" fill="currentColor" />
            <circle cx="20" cy="45" r="4" fill="currentColor" />
            <circle cx="35" cy="45" r="4" fill="currentColor" />
          </g>
          <polygon points="40,110 43,118 52,120 43,122 40,130 37,122 28,120 37,118" fill="currentColor" />
          <polygon points="120,150 122,156 128,158 122,160 120,166 118,160 112,158 118,156" fill="currentColor" />
        </svg>
      </div>
    )
  }

  // Pintarly style subtle doodles — uses fixed-size pattern tile (userSpaceOnUse) to prevent stretching/gepeng on tall pages
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`} style={{ opacity, ...style }} aria-hidden="true">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pintarly-doodle-tile" width="360" height="360" patternUnits="userSpaceOnUse">
            {/* Stars */}
            <g stroke="#fde047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <polygon points="50,40 54,52 66,55 54,58 50,70 46,58 34,55 46,52" />
              <polygon points="230,210 234,222 246,225 234,228 230,240 226,228 214,225 226,222" />
            </g>

            {/* Smileys */}
            <g stroke="#fde047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <g transform="translate(260, 50) scale(0.95)">
                <circle cx="16" cy="16" r="15" />
                <circle cx="11" cy="12" r="1.5" fill="#fde047" />
                <circle cx="21" cy="12" r="1.5" fill="#fde047" />
                <path d="M10,19 Q16,25 22,19" />
              </g>
              <g transform="translate(70, 240) scale(0.95)">
                <circle cx="16" cy="16" r="15" />
                <circle cx="11" cy="12" r="1.5" fill="#fde047" />
                <circle cx="21" cy="12" r="1.5" fill="#fde047" />
                <path d="M10,19 Q16,25 22,19" />
              </g>
            </g>

            {/* Triangles */}
            <g stroke="#fde047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <polygon points="160,30 174,56 146,56" />
              <polygon points="310,270 324,296 296,296" />
            </g>

            {/* Plus Signs */}
            <g stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round">
              <g transform="translate(40, 160)">
                <line x1="0" y1="8" x2="16" y2="8" />
                <line x1="8" y1="0" x2="8" y2="16" />
              </g>
              <g transform="translate(280, 150)">
                <line x1="0" y1="8" x2="16" y2="8" />
                <line x1="8" y1="0" x2="8" y2="16" />
              </g>
              <g transform="translate(170, 310)">
                <line x1="0" y1="8" x2="16" y2="8" />
                <line x1="8" y1="0" x2="8" y2="16" />
              </g>
            </g>

            {/* Circles */}
            <g fill="#bfdbfe" opacity="0.6">
              <circle cx="140" cy="150" r="4" />
              <circle cx="200" cy="90" r="3.5" />
              <circle cx="110" cy="80" r="3" />
              <circle cx="210" cy="270" r="4" />
              <circle cx="40" cy="310" r="3.5" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pintarly-doodle-tile)" />
      </svg>
    </div>
  )
}
