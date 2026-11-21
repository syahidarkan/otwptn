// 10 - Jalur mandiri. Own concept: boarding passes to "PTN impian", Otbee flying a paper plane along a dashed route. otwptn colours.
import React from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import { C, FONT, INK, Icon, LogoLockup, Mascot, Socials } from '../kit'
import CONTENT from '../../../content.json'

const M = CONTENT.momen.mandiri

const Field: React.FC<{ k: number; label: string; value: string; big?: boolean }> = ({ k, label, value, big }) => (
  <div>
    <div style={{ fontWeight: 800, fontSize: 14 * k, letterSpacing: '0.1em', color: C.muted2 }}>{label}</div>
    <div style={{ fontFamily: FONT.head, fontWeight: big ? 900 : 800, fontSize: (big ? 30 : 22) * k, color: INK, marginTop: 2, letterSpacing: '-0.01em' }}>{value}</div>
  </div>
)

const Pass: React.FC<{ p: (typeof M.passes)[number]; k: number; w: number; rot: number }> = ({ p, k, w, rot }) => (
  <div style={{ width: w, display: 'flex', borderRadius: 28, background: '#fff', boxShadow: '0 26px 50px rgba(60,40,0,0.28)', transform: `rotate(${rot}deg)`, overflow: 'hidden' }}>
    <div style={{ flex: 1 }}>
      <div style={{ background: INK, padding: `${16 * k}px ${24 * k}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 22 * k, color: C.accent, letterSpacing: '0.06em' }}>BOARDING PASS</div>
        <Icon name="flag" size={24 * k} color={C.accent} />
      </div>
      <div style={{ padding: `${18 * k}px ${24 * k}px ${22 * k}px` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 * k }}>
          <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 58 * k, color: INK, letterSpacing: '-0.03em', lineHeight: 1 }}>{p.code}</div>
          <svg width={90 * k} height={24 * k} viewBox="0 0 90 24"><path d="M2 12h70" stroke={C.amber} strokeWidth="3" strokeDasharray="6 6" /><path d="M70 4l14 8-14 8z" fill={C.amber} /></svg>
          <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 58 * k, color: C.amberDeep, letterSpacing: '-0.03em', lineHeight: 1 }}>PTN</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: `${12 * k}px ${18 * k}px`, marginTop: 16 * k }}>
          <Field k={k} label="JALUR" value={p.name} big />
          <Field k={k} label="PENUMPANG" value="Kamu" big />
          <Field k={k} label="BERANGKAT DARI" value={p.from} />
          <Field k={k} label="TANGGAL" value={p.date} />
        </div>
      </div>
    </div>
    {/* perforated stub */}
    <div style={{ width: 120 * k, borderLeft: `3px dashed #E5E1D3`, background: '#FFF6CF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 * k }}>
      <div style={{ fontWeight: 800, fontSize: 13 * k, letterSpacing: '0.1em', color: C.amberInk }}>GATE</div>
      <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 26 * k, color: INK, textAlign: 'center', lineHeight: 1.05 }}>Esai &<br />berkas</div>
      <svg width={70 * k} height={44 * k} viewBox="0 0 70 44">{Array.from({ length: 16 }, (_, i) => <rect key={i} x={i * 4.4} y={0} width={[2, 1, 3, 1][i % 4]} height={44} fill={INK} />)}</svg>
    </div>
  </div>
)

export const Mandiri: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.08 : 1
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(160deg, #FFC21A 0%, #FFD84D 45%, #FFF1B0 100%)', fontFamily: FONT.body, overflow: 'hidden' }}>
      {/* flight route */}
      <svg width={1080} height={height} style={{ position: 'absolute', inset: 0 }}>
        <path d={story ? 'M -40 820 C 260 640, 420 900, 640 560 S 980 300, 1120 260' : 'M -40 560 C 240 420, 420 640, 620 380 S 960 160, 1120 120'} fill="none" stroke="#fff" strokeWidth={8} strokeDasharray="4 22" strokeLinecap="round" opacity={0.9} />
      </svg>
      <Mascot name="paper-plane-fly" x={story ? 690 : 720} y={story ? 250 : 90} h={story ? 300 : 250} style={{ transform: 'rotate(-8deg)' }} />

      <div style={{ position: 'absolute', inset: 0, padding: story ? '150px 60px 220px' : '52px 60px 44px', display: 'flex', flexDirection: 'column' }}>
        <LogoLockup h={28 * k} />
        <div style={{ marginTop: 30 * k, fontFamily: FONT.head, fontWeight: 900, fontSize: 78 * k, lineHeight: 1.0, letterSpacing: '-0.045em', color: INK, maxWidth: story ? 640 : 600 }}>
          <div>{M.title[0]}</div>
          <div style={{ color: '#fff', WebkitTextStroke: `${3 * k}px ${INK}`, paintOrder: 'stroke fill', textShadow: `5px 5px 0 ${INK}` }}>{M.title[1]}</div>
        </div>
        <div style={{ marginTop: 22 * k, fontWeight: 700, fontSize: 24 * k, lineHeight: 1.45, color: '#3B300B', maxWidth: story ? 600 : 600 }}>{M.sub}</div>

        <div style={{ flex: 1, minHeight: 24 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 * k }}>
          {M.passes.map((p, i) => <Pass key={p.code} p={p} k={k} w={story ? 940 : 900} rot={i ? 1.5 : -2} />)}
        </div>
        <div style={{ marginTop: 18 * k, textAlign: 'center', fontWeight: 700, fontSize: 17 * k, color: C.amberInk }}>{M.note}</div>
        <div style={{ flex: story ? 1 : 0, minHeight: 22 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: `${15 * k}px ${36 * k}px`, borderRadius: 999, background: INK, color: C.accent, fontFamily: FONT.head, fontWeight: 800, fontSize: 28 * k }}>{M.cta}<Icon name="arrow" size={28 * k} color={C.accent} /></div>
          <Socials size={18 * k} />
        </div>
      </div>
    </AbsoluteFill>
  )
}
