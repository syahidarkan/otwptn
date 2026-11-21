// 09 - Pendaftaran SNBP. Model of the Pintarly "Tryout #1" posters: big title, a tear-off calendar "H-xx", dated pills, a campus
// skyline behind. otwptn colours. Dates are placeholders to fill from snpmb.id.
import React from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import { C, FONT, INK, Icon, LogoLockup, Mascot, Socials } from '../kit'
import CONTENT from '../../../content.json'

const S = CONTENT.momen.snbp

/** a generic campus silhouette: tower + colonnade blocks (not any real building) */
const Campus: React.FC<{ y: number; color: string }> = ({ y, color }) => (
  <svg width={1080} height={420} viewBox="0 0 1080 420" style={{ position: 'absolute', left: 0, top: y }}>
    <g fill={color}>
      <rect x={40} y={210} width={260} height={210} rx={8} />
      <rect x={70} y={170} width={200} height={50} rx={6} />
      <rect x={780} y={230} width={260} height={190} rx={8} />
      <rect x={810} y={190} width={200} height={50} rx={6} />
      <rect x={430} y={60} width={220} height={360} rx={8} />
      <polygon points="410,70 540,0 670,70" />
      <rect x={300} y={250} width={480} height={170} rx={6} />
    </g>
    <g fill="#FFF8E4" opacity={0.55}>
      {Array.from({ length: 6 }, (_, i) => <rect key={'a' + i} x={470 + (i % 3) * 52} y={110 + Math.floor(i / 3) * 70} width={30} height={46} rx={4} />)}
      {Array.from({ length: 8 }, (_, i) => <rect key={'b' + i} x={320 + i * 56} y={290} width={22} height={110} rx={4} />)}
      {Array.from({ length: 8 }, (_, i) => <rect key={'c' + i} x={70 + (i % 4) * 56} y={250 + Math.floor(i / 4) * 70} width={30} height={40} rx={4} />)}
      {Array.from({ length: 8 }, (_, i) => <rect key={'d' + i} x={810 + (i % 4) * 56} y={270 + Math.floor(i / 4) * 66} width={30} height={40} rx={4} />)}
    </g>
  </svg>
)

const CalendarPage: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ position: 'relative', width: 330 * k, borderRadius: 30, background: '#fff', boxShadow: `0 24px 50px rgba(90,60,0,0.25)`, overflow: 'hidden', transform: 'rotate(-5deg)', flexShrink: 0 }}>
    <div style={{ height: 70 * k, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70 * k }}>
      {[0, 1].map(i => <div key={i} style={{ width: 22 * k, height: 22 * k, borderRadius: '50%', background: C.accent }} />)}
    </div>
    <div style={{ padding: `${18 * k}px 0 ${24 * k}px`, textAlign: 'center' }}>
      <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 104 * k, color: INK, letterSpacing: '-0.04em', lineHeight: 1 }}>{S.hMinus}</div>
      <div style={{ fontWeight: 800, fontSize: 21 * k, color: C.amberDeep, marginTop: 8 }}>menuju pendaftaran</div>
    </div>
    {/* torn edge */}
    <svg width={330 * k} height={16} viewBox="0 0 330 16" preserveAspectRatio="none" style={{ display: 'block' }}>
      <path d={'M0 0 ' + Array.from({ length: 23 }, (_, i) => `L${i * 15 + 7.5} 14 L${(i + 1) * 15} 0`).join(' ') + ' L330 16 L0 16 Z'} fill="#FFE98A" />
    </svg>
  </div>
)

export const SnbpDaftar: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.1 : 1
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FFF8E4 0%, #FFF0B8 55%, #FFE07A 100%)', fontFamily: FONT.body, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -160, top: story ? 120 : -40, width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, #FFD400 0%, rgba(255,212,0,0.55) 45%, rgba(255,212,0,0) 70%)' }} />
      <Campus y={story ? 1290 : 930} color="rgba(229,143,0,0.22)" />

      <div style={{ position: 'absolute', inset: 0, padding: story ? '150px 60px 220px' : '50px 60px 44px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <LogoLockup h={28 * k} />
          <div style={{ fontWeight: 700, fontSize: 17 * k, color: C.amberInk }}>{S.note}</div>
        </div>

        <div style={{ marginTop: 30 * k, fontFamily: FONT.head, fontWeight: 900, letterSpacing: '-0.04em', color: INK, lineHeight: 0.95 }}>
          <div style={{ fontSize: 84 * k }}>{S.title[0]}</div>
          <div style={{ display: 'inline-block', marginTop: 10 * k, padding: `0 ${22 * k}px ${8 * k}px`, borderRadius: 22, background: C.accent, fontSize: 124 * k, boxShadow: `8px 8px 0 ${INK}` }}>{S.title[1]}</div>
        </div>

        {story && <div style={{ flex: 1 }} />}
        {/* calendar + Otbee + bubble */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: 40 * k }}>
          <CalendarPage k={k} />
          <div style={{ position: 'relative', flex: 1, height: 330 * k }}>
            <div style={{ position: 'absolute', left: 20, top: 0, right: 0, padding: `${14 * k}px ${20 * k}px`, borderRadius: 22, borderBottomLeftRadius: 4, background: INK, color: '#fff', fontWeight: 700, fontSize: 22 * k, lineHeight: 1.35 }}>{S.bubble}</div>
            <Mascot name="calendar-zoom" x={story ? 120 : 110} y={96 * k} h={250 * k} />
          </div>
        </div>

        {/* dates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 * k, marginTop: 34 * k }}>
          {S.dates.map((d, i) => (
            <div key={d.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${16 * k}px ${26 * k}px`, borderRadius: 999, background: i === 1 ? INK : '#fff', color: i === 1 ? '#fff' : INK, boxShadow: '0 8px 20px rgba(90,60,0,0.10)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 800, fontSize: 25 * k }}>
                <Icon name={['mentor', 'flag', 'trophy'][i]} size={26 * k} color={i === 1 ? C.accent : C.amberDeep} />{d.k}
              </span>
              <span style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 27 * k, color: i === 1 ? C.accent : INK }}>{d.v}</span>
            </div>
          ))}
        </div>

        {/* checklist */}
        <div style={{ marginTop: 22 * k, padding: `${20 * k}px ${26 * k}px`, borderRadius: 26, background: 'rgba(255,255,255,0.85)', display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 22, rowGap: 12 * k }}>
          {S.checklist.map(c => (
            <div key={c} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontWeight: 700, fontSize: 20 * k, color: INK, lineHeight: 1.3 }}>
              <div style={{ width: 24 * k, height: 24 * k, borderRadius: 7, border: `3px solid ${INK}`, flexShrink: 0, marginTop: 1 }} />{c}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, minHeight: 20 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: `${15 * k}px ${36 * k}px`, borderRadius: 999, background: INK, color: C.accent, fontFamily: FONT.head, fontWeight: 800, fontSize: 28 * k }}>{S.cta}<Icon name="arrow" size={28 * k} color={C.accent} /></div>
          <Socials size={18 * k} />
        </div>
      </div>
    </AbsoluteFill>
  )
}
