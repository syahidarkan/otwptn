// Fitur 01 - Tracking Jalur. Pintarly-style: light & airy, centred highlighted title, a speech pill, a "mark your calendar" timeline.
import React from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import { BTN_GRAD } from '../../ui/kit'
import { C, FONT, INK, Icon, LogoLockup, Mascot, Socials } from '../kit'
import CONTENT from '../../../content.json'

const T = CONTENT.fitur.tracking
const TEAL = '#F59E0B' // otwptn amber (accent pair of #FFD400)
const LINE_X = 380

const Squiggle: React.FC<{ x: number; y: number; s: number; color: string; r?: number }> = ({ x, y, s, color, r = 0 }) => (
  <svg width={160 * s} height={80 * s} viewBox="0 0 160 80" style={{ position: 'absolute', left: x, top: y, transform: `rotate(${r}deg)` }}>
    <path d="M6 60 C 30 10, 50 10, 62 44 S 96 78, 110 34 S 140 6, 154 20" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" />
  </svg>
)
const Star4: React.FC<{ x: number; y: number; s: number; color: string }> = ({ x, y, s, color }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ position: 'absolute', left: x, top: y }}>
    <path d="M12 1.5c.8 5.6 3.2 8.4 9.5 10.5-6.3 2.1-8.7 4.9-9.5 10.5-.8-5.6-3.2-8.4-9.5-10.5C8.8 9.9 11.2 7.1 12 1.5z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
  </svg>
)

export const Tracking: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.12 : 1
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEA 55%, #FFF3C4 100%)', fontFamily: FONT.body, overflow: 'hidden' }}>
      {/* soft background shapes, Pintarly-like */}
      <div style={{ position: 'absolute', left: -220, top: story ? 380 : 260, width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.16), rgba(245,158,11,0) 70%)' }} />
      <div style={{ position: 'absolute', right: -240, top: story ? 900 : 620, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,212,0,0.32), rgba(255,212,0,0) 70%)' }} />
      <Star4 x={80} y={story ? 230 : 120} s={70} color={TEAL} />
      <Star4 x={930} y={story ? 330 : 215} s={46} color="#F2B500" />
      <Squiggle x={-30} y={story ? 1560 : 1120} s={1.4} color="rgba(245,158,11,0.3)" r={-12} />
      <Squiggle x={880} y={story ? 160 : 60} s={1} color="rgba(242,181,0,0.4)" r={18} />

      <div style={{ position: 'absolute', inset: 0, padding: story ? '150px 70px 230px' : '64px 70px 56px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <LogoLockup h={34 * k} />
        <div style={{ marginTop: 34 * k, textAlign: 'center', fontFamily: FONT.head, fontWeight: 900, fontSize: 96 * k, lineHeight: 1.02, letterSpacing: '-0.04em', color: INK }}>
          <div>{T.title[0]}</div>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ position: 'absolute', left: -14, right: -14, bottom: 10 * k, height: 40 * k, borderRadius: 12, background: `linear-gradient(90deg, ${TEAL}, #FFD400)`, opacity: 0.85 }} />
            <span style={{ position: 'relative' }}>{T.title[1]}</span>
          </div>
        </div>
        {/* speech pill */}
        <div style={{ marginTop: 34 * k, maxWidth: 820, padding: `${20 * k}px ${34 * k}px`, borderRadius: 36, background: 'linear-gradient(90deg, #FFF6C2, #FFE07A)', fontWeight: 700, fontSize: 26 * k, lineHeight: 1.4, color: '#2B2A1F', textAlign: 'center', boxShadow: '0 10px 30px rgba(120,100,0,0.08)' }}>
          {T.bubble}
        </div>

        {/* timeline: Otbee on the left, the steps run down the right of the line */}
        <div style={{ position: 'relative', flex: 1, width: '100%', marginTop: 40 * k, marginBottom: 36 * k }}>
          <Mascot name="roadmap-flags" x={story ? -10 : -10} y={0} h={story ? 380 : 300} style={{ top: '50%', transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', left: LINE_X - 5, top: 14, bottom: 14, width: 10, borderRadius: 5, background: `linear-gradient(180deg, ${TEAL}, #FFD400)` }} />
          <div style={{ position: 'absolute', left: LINE_X - 36 * k, right: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {T.steps.map((s, i) => (
              <div key={s.t} style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
                <div style={{ width: 72 * k, height: 72 * k, borderRadius: '50%', background: '#fff', border: `5px solid ${i < 2 ? TEAL : '#FFD400'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', flexShrink: 0 }}>
                  <Icon name={s.icon} size={32 * k} color={INK} />
                </div>
                <Step s={s} align="left" k={k} />
              </div>
            ))}
          </div>
        </div>

        {/* CTA + socials */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 * k }}>
          <div style={{ padding: `${18 * k}px ${40 * k}px`, borderRadius: 999, background: BTN_GRAD, fontFamily: FONT.head, fontWeight: 800, fontSize: 32 * k, color: INK, boxShadow: '0 12px 28px rgba(245,158,11,0.35)', display: 'flex', alignItems: 'center', gap: 14 }}>
            {T.cta}<Icon name="arrow" size={32 * k} color={INK} />
          </div>
          <div style={{ padding: '12px 30px', borderRadius: 999, background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
            <Socials size={21 * k} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

const Step: React.FC<{ s: { t: string; d: string }; align: 'left' | 'right'; k: number }> = ({ s, align, k }) => (
  <div style={{ textAlign: align, maxWidth: 520 }}>
    <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 34 * k, letterSpacing: '-0.02em', color: INK, lineHeight: 1.1 }}>{s.t}</div>
    <div style={{ fontWeight: 600, fontSize: 21 * k, color: C.muted, marginTop: 6, lineHeight: 1.35 }}>{s.d}</div>
  </div>
)
