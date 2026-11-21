// Otbee TV: study-cam grid made of real photos (like a live video call), an ON AIR / LIVE badge, a real screenshot of the
// Study Cam page in a laptop. Warm dark studio look.
import React from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import { C, FONT, INK, Icon, LogoLockup, Mascot, Socials } from '../kit'
import { Photo } from '../kit2'
import CONTENT from '../../../content.json'

const T = CONTENT.v2.otbeeTV
const TILES = [
  { src: 'night-study.jpg', pos: '50% 30%', n: 'Nadia', t: 'Target UI' },
  { src: 'study-outdoor.jpg', pos: '50% 35%', n: 'Raka & Dimas', t: 'Target UGM' },
  { src: 'student.jpg', pos: '50% 25%', n: 'Citra', t: 'Target ITB' },
  { src: 'sma-pair.jpg', pos: '50% 25%', n: 'Alya & Bima', t: 'Target IPB' },
]

export const OtbeeTV: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.08 : 1
  const tileH = story ? 380 : 250
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 50% 35%, #2C2515 0%, ${INK} 70%)`, fontFamily: FONT.body, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 5px)' }} />
      <div style={{ position: 'absolute', left: 60, right: 60, top: story ? 150 : 46, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
          <LogoLockup h={26 * k} white />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 10, background: '#F04438', color: '#fff', fontWeight: 900, fontSize: 20 * k, letterSpacing: '0.12em' }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: '#fff' }} />LIVE
          </div>
        </div>
        {/* TV title */}
        <div style={{ marginTop: 26 * k, padding: `${10 * k}px ${40 * k}px ${16 * k}px`, borderRadius: 30, border: `6px solid ${C.accent}`, boxShadow: `0 0 40px rgba(255,212,0,0.35), inset 0 0 30px rgba(255,212,0,0.15)` }}>
          <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 120 * k, lineHeight: 1, letterSpacing: '-0.03em', color: C.accent, textShadow: '0 0 30px rgba(255,212,0,0.5)' }}>{T.title[0]}</div>
        </div>
        <div style={{ marginTop: 18 * k, fontFamily: FONT.head, fontWeight: 900, fontSize: 40 * k, color: '#fff', letterSpacing: '-0.02em' }}>{T.sub}</div>

        {/* the study-cam grid */}
        <div style={{ marginTop: 26 * k, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {TILES.map((t, i) => (
            <div key={t.n} style={{ position: 'relative', height: tileH, borderRadius: 22, overflow: 'hidden', border: i === 0 ? `4px solid ${C.accent}` : '4px solid #2E2A20' }}>
              <Photo src={t.src} pos={t.pos} style={{ width: '100%', height: '100%' }} />
              <div style={{ position: 'absolute', left: 12, bottom: 12, padding: '6px 14px', borderRadius: 999, background: 'rgba(17,17,17,0.75)', color: '#fff', fontWeight: 800, fontSize: 17 * k }}>{t.n} · <span style={{ color: C.accent }}>{t.t}</span></div>
              {i === 0 && <div style={{ position: 'absolute', right: 12, top: 12, padding: '4px 12px', borderRadius: 999, background: C.accent, color: INK, fontWeight: 900, fontSize: 15 * k }}>fokus 45 mnt</div>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 22 * k, maxWidth: 860, textAlign: 'center', fontWeight: 700, fontSize: 23 * k, lineHeight: 1.45, color: '#D4D4D8' }}>{T.body}</div>
        <div style={{ marginTop: 18 * k, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {T.pills.map(p => <div key={p} style={{ padding: `${8 * k}px ${18 * k}px`, borderRadius: 999, border: `2px solid ${C.accent}`, color: C.accent, fontWeight: 800, fontSize: 19 * k }}>{p}</div>)}
        </div>
      </div>
      <Mascot name="headset-wave" x={story ? 800 : 830} y={story ? 1420 : 1060} h={story ? 280 : 230} />
      <div style={{ position: 'absolute', left: story ? 60 : 60, bottom: story ? 210 : 44, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: `${15 * k}px ${32 * k}px`, borderRadius: 999, background: C.accent, color: INK, fontFamily: FONT.head, fontWeight: 900, fontSize: 28 * k }}>{T.cta}<Icon name="arrow" size={28 * k} color={INK} /></div>
        <Socials size={17 * k} color="#D4D4D8" />
      </div>
    </AbsoluteFill>
  )
}
