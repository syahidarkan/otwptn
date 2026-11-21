import React from 'react'
import { C, FONT } from '../config'
import { clamp, ease, prog, spr } from '../anim'

export const SHADOW = '0 40px 90px rgba(17,17,17,0.16), 0 10px 26px rgba(17,17,17,0.08)'
export const SHADOW_SM = '0 10px 30px rgba(17,17,17,0.10), 0 2px 6px rgba(17,17,17,0.06)'
export const YELLOW_GRAD = 'linear-gradient(135deg, #FFE45C 0%, #FFD400 48%, #F7C600 100%)'
export const BTN_GRAD = 'linear-gradient(135deg, #FFD700 0%, #F59E0B 100%)'

/** absolutely positioned at a world/local point (centered) */
export const At: React.FC<{ x: number; y: number; w?: number; h?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => {
  const tf = String(style?.transform ?? '')
  const transform = tf.includes('translate(-50%') ? tf : `translate(-50%, -50%) ${tf}`
  return <div style={{ position: 'absolute', left: x, top: y, width: w ?? 'max-content', height: h, ...style, transform }}>{children}</div>
}

/** pop-in: scale + lift + fade, spring overshoot */
export function pop(t: number, t0: number, opts: { from?: number; lift?: number; freq?: number; damp?: number } = {}) {
  const { from = 0.6, lift = 40, freq = 2.6, damp = 0.55 } = opts
  if (t < t0) return { opacity: 0, transform: `translateY(${lift}px) scale(${from})` }
  const s = spr(t, t0, freq, damp)
  const o = clamp((t - t0) / 0.18)
  return { opacity: o, transform: `translateY(${(1 - s) * lift}px) scale(${from + (1 - from) * s})` }
}

/** 3D card entrance: swings in from a tilt */
export function swing(t: number, t0: number, dur = 0.7, fromRY = -38, fromRX = 18, fromY = 120) {
  const u = prog(t, t0, t0 + dur, ease.outQuart)
  const s = spr(t, t0, 1.9, 0.62)
  return {
    opacity: clamp((t - t0) / 0.2),
    transform: `perspective(2400px) translateY(${(1 - u) * fromY}px) rotateY(${(1 - s) * fromRY}deg) rotateX(${(1 - s) * fromRX}deg) scale(${0.86 + 0.14 * s})`,
  }
}

export const Phone: React.FC<{ w: number; h: number; children?: React.ReactNode; time?: string; dark?: boolean }> = ({ w, h, children, time = '09:41', dark }) => (
  <div style={{ width: w, height: h, borderRadius: 74, background: '#0D0D0E', padding: 13, boxShadow: `${SHADOW}, inset 0 0 0 2px #2A2A2D`, position: 'relative' }}>
    <div style={{ position: 'absolute', inset: 4, borderRadius: 70, boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.06)' }} />
    <div style={{ width: '100%', height: '100%', borderRadius: 61, overflow: 'hidden', background: dark ? '#111' : C.bgAlt, position: 'relative', fontFamily: FONT.body }}>
      <div style={{ height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 34px 0', fontWeight: 700, fontSize: 17, color: dark ? '#fff' : C.ink }}>
        <span>{time}</span>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ width: 18, height: 11, borderRadius: 3, background: 'currentColor', opacity: 0.85 }} />
          <span style={{ width: 25, height: 12, borderRadius: 4, border: '2px solid currentColor', opacity: 0.85 }} />
        </span>
      </div>
      <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 118, height: 34, borderRadius: 20, background: '#000' }} />
      {children}
    </div>
  </div>
)

export const Chip: React.FC<{ children: React.ReactNode; bg?: string; fg?: string; size?: number; style?: React.CSSProperties; icon?: React.ReactNode }> = ({ children, bg = '#fff', fg = C.ink, size = 20, style, icon }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.4, padding: `${size * 0.42}px ${size * 0.8}px`, borderRadius: 999, background: bg, color: fg, fontFamily: FONT.body, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap', ...style }}>
    {icon}{children}
  </div>
)

export const Spark: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = C.amberInk }) => (
  <svg width={size} height={size} viewBox="-1 -1 2 2"><path d="M0,-1 C0.12,-0.3 0.3,-0.12 1,0 C0.3,0.12 0.12,0.3 0,1 C-0.12,0.3 -0.3,0.12 -1,0 C-0.3,-0.12 -0.12,-0.3 0,-1 Z" fill={color} /></svg>
)

export const Check: React.FC<{ size?: number; bg?: string; fg?: string; p?: number }> = ({ size = 28, bg = C.green, fg = '#fff', p = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" style={{ transform: `scale(${0.4 + 0.6 * p})`, opacity: clamp(p * 3) }}>
    <circle cx="14" cy="14" r="14" fill={bg} />
    <path d="M8 14.5 L12.2 18.5 L20 10" fill="none" stroke={fg} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20" strokeDashoffset={20 * (1 - p)} />
  </svg>
)

export const Avatar: React.FC<{ text: string; size: number; bg?: string; fg?: string; ring?: string }> = ({ text, size, bg = C.accent, fg = C.ink, ring }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.head, fontWeight: 800, fontSize: size * 0.4, boxShadow: ring ? `0 0 0 ${size * 0.06}px ${ring}` : undefined }}>{text}</div>
)

/** honeycomb outline pattern as in the app's yellow headers */
export const HexPattern: React.FC<{ w: number; h: number; r?: number; stroke?: string; opacity?: number; x0?: number; y0?: number }> = ({ w, h, r = 46, stroke = '#B98A00', opacity = 0.16, x0 = 0, y0 = 0 }) => {
  const a = r * Math.cos(Math.PI / 6)
  const cells: string[] = []
  for (let row = -1; row * a * 2 < h + a * 2; row++) {
    for (let col = -1; col * r * 1.5 < w + r * 2; col++) {
      const cx = x0 + col * r * 1.5, cy = y0 + row * a * 2 + (col % 2 ? a : 0)
      const pts: string[] = []
      for (let i = 0; i < 6; i++) { const t = (Math.PI / 3) * i; pts.push(`${(cx + r * Math.cos(t)).toFixed(1)},${(cy + r * Math.sin(t)).toFixed(1)}`) }
      cells.push(pts.join(' '))
    }
  }
  return (
    <svg width={w} height={h} style={{ position: 'absolute', inset: 0, opacity }}>
      {cells.map((p, i) => <polygon key={i} points={p} fill="none" stroke={stroke} strokeWidth={2} />)}
    </svg>
  )
}

/** word-by-word rise with a soft mask (kinetic type) */
export const Words: React.FC<{ text: string; t: number; t0: number; per?: number; size: number; color?: string; weight?: number; font?: string; style?: React.CSSProperties; hl?: (w: string, i: number) => React.CSSProperties | undefined }> = ({ text, t, t0, per = 0.07, size, color = C.ink, weight = 800, font = FONT.head, style, hl }) => {
  const words = text.split(' ')
  return (
    <div style={{ fontFamily: font, fontWeight: weight, fontSize: size, color, lineHeight: 1.08, letterSpacing: '-0.03em', whiteSpace: 'nowrap', ...style }}>
      {words.map((w, i) => {
        const tt = t0 + i * per
        const u = prog(t, tt, tt + 0.55, ease.outExpo)
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: size * 0.12, marginBottom: -size * 0.12 }}>
            <span style={{ display: 'inline-block', transform: `translateY(${(1 - u) * 105}%) rotate(${(1 - u) * 6}deg)`, opacity: clamp(u * 2), ...hl?.(w, i) }}>
              {w}{i < words.length - 1 ? ' ' : ''}
            </span>
          </span>
        )
      })}
    </div>
  )
}
