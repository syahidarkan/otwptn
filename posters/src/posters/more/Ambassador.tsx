// 12 - Rekrut ambassador. Own concept: a comic-book page (halftone paper, inked panels, speech bubbles, a "KOMISI!" starburst).
import React from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import { C, FONT, INK, Icon, LogoLockup, Mascot, Socials } from '../kit'
import CONTENT from '../../../content.json'

const A = CONTENT.rekrut.ambassador
const PAPER = '#FFF6D6'
const ink = (k: number) => `${5 * k}px solid ${INK}`

const Burst: React.FC<{ size: number; text: string; style?: React.CSSProperties }> = ({ size, text, style }) => {
  const pts = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2, r = i % 2 ? 0.72 : 1
    return `${(50 + 50 * r * Math.cos(a)).toFixed(1)},${(50 + 50 * r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
  return (
    <div style={{ position: 'absolute', width: size, height: size, ...style }}>
      <svg width={size} height={size} viewBox="-4 -4 108 108" style={{ position: 'absolute', inset: 0 }}><polygon points={pts} fill={C.accent} stroke={INK} strokeWidth={3} strokeLinejoin="round" /></svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.head, fontWeight: 900, fontSize: size * 0.17, color: INK, transform: 'rotate(-10deg)', letterSpacing: '-0.02em' }}>{text}</div>
    </div>
  )
}

const Bubble: React.FC<{ k: number; children: React.ReactNode; tail: 'left' | 'right'; style?: React.CSSProperties }> = ({ k, children, tail, style }) => (
  <div style={{ position: 'absolute', padding: `${14 * k}px ${22 * k}px`, borderRadius: 999, background: '#fff', border: ink(k * 0.8), fontFamily: FONT.head, fontWeight: 900, fontSize: 30 * k, color: INK, whiteSpace: 'nowrap', ...style }}>
    {children}
    <svg width={40 * k} height={34 * k} viewBox="0 0 40 34" style={{ position: 'absolute', bottom: -30 * k, [tail]: 40 * k }}>
      <path d={tail === 'left' ? 'M2 0 L12 32 L30 0' : 'M10 0 L28 32 L38 0'} fill="#fff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <rect x={0} y={-2} width={40} height={6} fill="#fff" />
    </svg>
  </div>
)

const Panel: React.FC<{ s: (typeof A.steps)[number]; pose: string; k: number; h: number }> = ({ s, pose, k, h }) => (
  <div style={{ position: 'relative', flex: 1, height: h, background: '#fff', border: ink(k), borderRadius: 18, overflow: 'hidden', boxShadow: `${6 * k}px ${6 * k}px 0 ${INK}` }}>
    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,180,0,0.35) 2.5px, transparent 3px)', backgroundSize: '14px 14px' }} />
    <div style={{ position: 'absolute', left: 12, top: 12, width: 46 * k, height: 46 * k, borderRadius: '50%', background: INK, color: C.accent, fontFamily: FONT.head, fontWeight: 900, fontSize: 26 * k, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.n}</div>
    <Mascot name={pose} x={0} y={30 * k} h={h * 0.56} style={{ left: '50%', transform: 'translateX(-50%)' }} />
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `${12 * k}px ${14 * k}px`, background: PAPER, borderTop: ink(k * 0.8) }}>
      <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 24 * k, color: INK, lineHeight: 1.1 }}>{s.t}</div>
      <div style={{ fontWeight: 700, fontSize: 16.5 * k, color: '#3F3A2A', marginTop: 4, lineHeight: 1.3 }}>{s.d}</div>
    </div>
  </div>
)

export const Ambassador: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.08 : 1
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: FONT.body, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(245,158,11,0.25) 3px, transparent 3.5px)', backgroundSize: '26px 26px' }} />
      <div style={{ position: 'absolute', inset: 0, padding: story ? '150px 54px 220px' : '48px 54px 40px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><div style={{ padding: '10px 24px', borderRadius: 999, background: '#fff', border: ink(0.6) }}><LogoLockup h={26 * k} /></div></div>

        {/* title panel */}
        <div style={{ position: 'relative', marginTop: 24 * k, height: story ? 520 : 420, background: C.accent, border: ink(k), borderRadius: 22, boxShadow: `${8 * k}px ${8 * k}px 0 ${INK}`, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-conic-gradient(from 0deg at 75% 60%, rgba(255,255,255,0.35) 0deg 6deg, transparent 6deg 16deg)' }} />
          <div style={{ position: 'absolute', left: 34, top: 30, fontFamily: FONT.head, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 0.92, color: '#fff', WebkitTextStroke: `${7 * k}px ${INK}`, paintOrder: 'stroke fill', textShadow: `${6 * k}px ${6 * k}px 0 ${INK}` }}>
            <div style={{ fontSize: 66 * k }}>{A.title[0]}</div>
            <div style={{ fontSize: 92 * k }}>{A.title[1]}</div>
            <div style={{ fontSize: 88 * k, color: INK, WebkitTextStroke: `${7 * k}px #fff` }}>{A.title[2]}</div>
          </div>
          <Mascot name="megaphone-community" x={story ? 640 : 690} y={story ? 200 : 150} h={story ? 330 : 280} />
          <Bubble k={k} tail="right" style={{ left: story ? 370 : 410, top: story ? 360 : 300 }}>{A.bubble1}</Bubble>
        </div>
        <Burst size={story ? 250 : 210} text="KOMISI!" style={{ left: story ? 24 : 20, top: story ? 600 : 410, transform: 'rotate(-10deg)' }} />

        <div style={{ position: 'relative', marginTop: 50 * k, alignSelf: 'center' }}>
          <div style={{ padding: `${12 * k}px ${30 * k}px`, borderRadius: 16, background: INK, color: C.accent, fontFamily: FONT.head, fontWeight: 900, fontSize: 36 * k, transform: 'rotate(-1.5deg)' }}>{A.bubble2}</div>
        </div>

        <div style={{ flex: 1, minHeight: 26 }} />
        <div style={{ display: 'flex', gap: 22 * k }}>
          {A.steps.map((s, i) => <Panel key={s.n} s={s} k={k} h={story ? 400 : 330} pose={['checklist', 'megaphone-community', 'coin-bag'][i]} />)}
        </div>
        <div style={{ marginTop: 22 * k, textAlign: 'center', fontWeight: 800, fontSize: 21 * k, color: INK }}>{A.who}</div>

        <div style={{ flex: 1, minHeight: 22 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: `${15 * k}px ${36 * k}px`, borderRadius: 999, background: INK, color: C.accent, fontFamily: FONT.head, fontWeight: 900, fontSize: 30 * k, border: ink(0.6) }}>{A.cta}<Icon name="arrow" size={30 * k} color={C.accent} /></div>
          <Socials size={18 * k} />
        </div>
      </div>
    </AbsoluteFill>
  )
}
