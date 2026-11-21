import React from 'react'
import { Img, staticFile } from 'remotion'
import { C, FONT } from '../config'

export const CREAM = '#FBF6E6'
export const INK = '#16130C'
export const CARD_SHADOW = '0 18px 40px rgba(80,60,0,0.10), 0 3px 10px rgba(80,60,0,0.06)'
export const SUN = 'linear-gradient(160deg, #FFE766 0%, #FFD400 45%, #FFB800 100%)'

export const Card: React.FC<{ x: number; y: number; w: number; h: number; bg?: string; r?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, bg = '#fff', r = 40, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r, background: bg, boxShadow: CARD_SHADOW, overflow: 'hidden', ...style }}>{children}</div>
)

/** honeycomb outline texture */
export const Hex: React.FC<{ w: number; h: number; r?: number; color?: string; opacity?: number }> = ({ w, h, r = 40, color = '#B98A00', opacity = 0.14 }) => {
  const dx = r * Math.sqrt(3), dy = r * 1.5
  const cells: string[] = []
  for (let row = -1; row * dy < h + r; row++) for (let col = -1; col * dx < w + dx; col++) {
    const cx = col * dx + (row % 2 ? dx / 2 : 0), cy = row * dy
    cells.push([0, 1, 2, 3, 4, 5].map(k => { const a = Math.PI / 6 + (k * Math.PI) / 3; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}` }).join(' '))
  }
  return (
    <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
      {cells.map((p, i) => <polygon key={i} points={p} fill="none" stroke={color} strokeWidth={2} opacity={opacity} />)}
    </svg>
  )
}

export const Mascot: React.FC<{ name: string; x: number; y: number; h: number; flip?: boolean; style?: React.CSSProperties }> = ({ name, x, y, h, flip, style }) => (
  <Img src={staticFile(`posters/${name}.png`)} style={{ position: 'absolute', left: x, top: y, height: h, transform: flip ? 'scaleX(-1)' : undefined, filter: 'drop-shadow(0 18px 24px rgba(90,60,0,0.22))', ...style }} />
)

export const Wordmark: React.FC<{ h: number; white?: boolean; style?: React.CSSProperties }> = ({ h, white, style }) => (
  <Img src={staticFile(`brand/wordmark-${white ? 'white' : 'dark'}.png`)} style={{ height: h, display: 'block', ...style }} />
)

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
export const Icon: React.FC<{ name: string; size: number; color?: string }> = ({ name, size, color = INK }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ color, display: 'block' }}>
    {name === 'route' && <><circle cx="6" cy="18" r="2.4" {...P} /><path d="M8.4 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.6" {...P} /><path d="M17 3.5v5M17 3.5h3.2l-1 1.3 1 1.3H17" {...P} /></>}
    {name === 'essay' && <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" {...P} /><path d="M14 3v5h5M8.5 13h7M8.5 17h4" {...P} /></>}
    {name === 'percent' && <><circle cx="7.5" cy="7.5" r="2.6" {...P} /><circle cx="16.5" cy="16.5" r="2.6" {...P} /><path d="M18.5 5.5l-13 13" {...P} /></>}
    {name === 'chat' && <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5z" {...P} /><path d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01" {...P} strokeWidth={3} /></>}
    {name === 'mentor' && <><circle cx="9" cy="8" r="3.2" {...P} /><path d="M3 20c.6-3.4 3-5.2 6-5.2s5.4 1.8 6 5.2" {...P} /><path d="M16 4.8a3.2 3.2 0 0 1 0 6.4M18 14.9c1.6.7 2.7 2.3 3 5.1" {...P} /></>}
    {name === 'flag' && <><path d="M5 21V4" {...P} /><path d="M5 4h11l-2 3.5L16 11H5" {...P} /></>}
    {name === 'spark' && <path d="M12 3c.7 4.6 2.4 6.3 7 7-4.6.7-6.3 2.4-7 7-.7-4.6-2.4-6.3-7-7 4.6-.7 6.3-2.4 7-7z" {...P} />}
    {name === 'history' && <><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" {...P} /><path d="M3 4v4h4M12 7.5V12l3 2" {...P} /></>}
    {name === 'school' && <><path d="M3 9l9-5 9 5-9 5z" {...P} /><path d="M7 11.2V16c1.4 1.5 3 2.2 5 2.2s3.6-.7 5-2.2v-4.8M21 9v5" {...P} /></>}
    {name === 'trophy' && <><path d="M8 4h8v5a4 4 0 0 1-8 0z" {...P} /><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4" {...P} /></>}
    {name === 'clock' && <><circle cx="12" cy="12" r="8.5" {...P} /><path d="M12 7.5V12l3 2" {...P} /></>}
    {name === 'video' && <><rect x="3" y="6" width="12.5" height="12" rx="2.5" {...P} /><path d="M15.5 10.5L21 7.5v9l-5.5-3" {...P} /></>}
    {name === 'check' && <path d="M5 12.5l4.2 4L19 7" {...P} strokeWidth={3} />}
    {name === 'arrow' && <path d="M5 12h14M13 6l6 6-6 6" {...P} strokeWidth={2.6} />}
    {name === 'globe' && <><circle cx="12" cy="12" r="9" {...P} /><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z" {...P} /></>}
    {name === 'ig' && <><rect x="3.5" y="3.5" width="17" height="17" rx="5" {...P} /><circle cx="12" cy="12" r="4" {...P} /><path d="M17.2 6.8h.01" {...P} strokeWidth={3} /></>}
    {name === 'tiktok' && <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.4 2.6 2.2 4.4 5 4.7" {...P} />}
    {name === 'x' && <path d="M4 4l16 16M20 4L4 20" {...P} />}
    {name === 'threads' && <text x="12" y="18.2" textAnchor="middle" fontSize="20" fontWeight="800" fontFamily="Arial, sans-serif" fill="currentColor">@</text>}
  </svg>
)

export const Pill: React.FC<{ children: React.ReactNode; bg?: string; fg?: string; size?: number; style?: React.CSSProperties }> = ({ children, bg = '#fff', fg = INK, size = 22, style }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.4, padding: `${size * 0.42}px ${size * 0.85}px`, borderRadius: 999, background: bg, color: fg, fontFamily: FONT.body, fontWeight: 800, fontSize: size, whiteSpace: 'nowrap', ...style }}>{children}</div>
)

export { C, FONT }

/** the official mark: the site favicon (Otbee head) + wordmark */
export const LogoLockup: React.FC<{ h: number; white?: boolean; gap?: number }> = ({ h, white, gap }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: gap ?? h * 0.28 }}>
    <Img src={staticFile('posters/favicon.png')} style={{ height: h * 1.5, display: 'block' }} />
    <Wordmark h={h} white={white} />
  </div>
)

import CONTENT from '../../content.json'
/** footer pill: lead text, the four social icons + @handle, the site */
export const SocialFooter: React.FC<{ x: number; y: number; w: number; h: number; lead: string }> = ({ x, y, w, h, lead }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: h / 2, background: BTN_GRAD_K, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px', fontFamily: FONT.body, boxShadow: '0 10px 24px rgba(200,120,0,0.25)' }}>
    <div style={{ fontWeight: 800, fontSize: 24, color: INK }}>{lead}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontWeight: 800, fontSize: 23, color: INK }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {CONTENT.socials.map(n => <Icon key={n} name={n} size={n === 'x' ? 24 : 27} />)}
        <span style={{ marginLeft: 4 }}>@{CONTENT.handle}</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="globe" size={27} />{CONTENT.site}</span>
    </div>
  </div>
)
const BTN_GRAD_K = 'linear-gradient(135deg, #FFD700 0%, #F59E0B 100%)'

/** inline social row (flows in a flex layout): icons + @handle + site */
export const Socials: React.FC<{ color?: string; size?: number; style?: React.CSSProperties }> = ({ color = INK, size = 24, style }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: size, fontFamily: FONT.body, fontWeight: 800, fontSize: size * 0.95, color, ...style }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: size * 0.42 }}>
      {CONTENT.socials.map(n => <Icon key={n} name={n} size={n === 'x' ? size : size * 1.1} color={color} />)}
      <span style={{ marginLeft: size * 0.2 }}>@{CONTENT.handle}</span>
    </span>
    <span style={{ display: 'flex', alignItems: 'center', gap: size * 0.35 }}><Icon name="globe" size={size * 1.1} color={color} />{CONTENT.site}</span>
  </div>
)

/** story = 1080x1920 (keep the top 130 and bottom ~200 px clear for the story UI) */
export const useStory = (h: number) => h > 1500
