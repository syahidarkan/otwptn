// Real-image helpers: app screenshots in device frames, photos, Pintarly-style gradient pills.
import React from 'react'
import { Img, staticFile } from 'remotion'
import { C, FONT, INK } from './kit'

/** a real otwptn.com screenshot (public/posters/shot/*.jpg) inside a phone frame; `y` scrolls the page (in screenshot px) */
export const PhoneShot: React.FC<{ src: string; w: number; y?: number; rot?: number; style?: React.CSSProperties }> = ({ src, w, y = 0, rot = 0, style }) => {
  const h = w * 2.08, b = w * 0.035
  return (
    <div style={{ position: 'relative', width: w, height: h, borderRadius: w * 0.14, background: '#0D0D0E', padding: b, boxShadow: '0 30px 60px rgba(40,25,0,0.35), inset 0 0 0 2px #2A2A2D', transform: `rotate(${rot}deg)`, flexShrink: 0, ...style }}>
      <div style={{ width: '100%', height: '100%', borderRadius: w * 0.11, overflow: 'hidden', position: 'relative', background: '#fff' }}>
        <Img src={staticFile(`posters/shot/${src}`)} style={{ position: 'absolute', left: 0, top: -y * ((w - 2 * b) / 1200), width: '100%' }} />
        <div style={{ position: 'absolute', top: w * 0.025, left: '50%', transform: 'translateX(-50%)', width: w * 0.3, height: w * 0.075, borderRadius: 99, background: '#000' }} />
      </div>
    </div>
  )
}

/** desktop screenshot in a laptop / browser frame */
export const LaptopShot: React.FC<{ src: string; w: number; ratio?: number; y?: number; style?: React.CSSProperties }> = ({ src, w, ratio = 0.62, y = 0, style }) => (
  <div style={{ width: w, flexShrink: 0, ...style }}>
    <div style={{ borderRadius: w * 0.025, background: '#1B1B1D', padding: w * 0.018, boxShadow: '0 30px 60px rgba(40,25,0,0.3)' }}>
      <div style={{ height: w * ratio, borderRadius: w * 0.008, overflow: 'hidden', position: 'relative', background: '#fff' }}>
        <Img src={staticFile(`posters/shot/${src}`)} style={{ position: 'absolute', left: 0, top: -y, width: '100%' }} />
      </div>
    </div>
    <div style={{ height: w * 0.035, margin: `0 ${-w * 0.04}px`, borderRadius: `0 0 ${w * 0.03}px ${w * 0.03}px`, background: 'linear-gradient(#D7D9DE, #B9BCC3)' }} />
  </div>
)

export const Photo: React.FC<{ src: string; style?: React.CSSProperties; pos?: string }> = ({ src, style, pos = 'center' }) => (
  <Img src={staticFile(`posters/photo/${src}`)} style={{ objectFit: 'cover', objectPosition: pos, display: 'block', ...style }} />
)

export const GRAD = 'linear-gradient(90deg, #FFE45C 0%, #FFC233 55%, #F59E0B 100%)'
/** Pintarly-like soft gradient pill (in otwptn yellow -> amber) */
export const GPill: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties; dark?: boolean }> = ({ children, size = 26, style, dark }) => (
  <div style={{ padding: `${size * 0.55}px ${size * 1.1}px`, borderRadius: size * 1.2, background: dark ? INK : GRAD, color: dark ? C.accent : INK, fontFamily: FONT.body, fontWeight: 800, fontSize: size, lineHeight: 1.35, textAlign: 'center', boxShadow: '0 10px 24px rgba(160,100,0,0.18)', ...style }}>{children}</div>
)

/** 'swipe kiri' hint like the Pintarly carousels */
export const Swipe: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = INK }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT.body, fontWeight: 800, fontSize: size, color }}>
    Swipe kiri
    <svg width={size * 4} height={size} viewBox="0 0 80 20"><path d="M2 10h70M62 3l10 7-10 7" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </div>
)
