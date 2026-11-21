// Cara SNBP ngitung nilai (replaces the notebook version). Photo-led: real students in SMA uniform on top, the formula as a
// donut split, a real screenshot of the otwptn kalkulator.
import React from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import { C, FONT, INK, Icon, LogoLockup, Mascot, Socials } from '../kit'
import { PhoneShot, Photo } from '../kit2'
import CONTENT from '../../../content.json'

const N = CONTENT.v2.nilai

const Donut: React.FC<{ s: number }> = ({ s }) => (
  <div style={{ position: 'relative', width: s, height: s, borderRadius: '50%', background: `conic-gradient(${C.accent} 0deg 180deg, ${INK} 180deg 360deg)`, flexShrink: 0, boxShadow: '0 16px 30px rgba(80,50,0,0.25)' }}>
    <div style={{ position: 'absolute', inset: s * 0.2, borderRadius: '50%', background: '#FFF8E4', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT.head, fontWeight: 900, fontSize: s * 0.13, lineHeight: 1.05, color: INK }}>Nilai<br />SNBP</div>
  </div>
)

export const NilaiSnbp: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.08 : 1
  const photoH = story ? 760 : 560
  return (
    <AbsoluteFill style={{ background: '#FFF8E4', fontFamily: FONT.body, overflow: 'hidden' }}>
      <Photo src="sma-pair.jpg" pos="50% 22%" style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: photoH }} />
      <div style={{ position: 'absolute', left: 0, top: photoH - 300, width: 1080, height: 300, background: 'linear-gradient(180deg, rgba(255,248,228,0), #FFF8E4 90%)' }} />
      <div style={{ position: 'absolute', left: 60, top: story ? 150 : 44, padding: '10px 22px', borderRadius: 999, background: 'rgba(255,255,255,0.92)' }}><LogoLockup h={26 * k} /></div>
      <div style={{ position: 'absolute', right: 60, top: story ? 154 : 48, padding: '8px 16px', borderRadius: 999, background: 'rgba(17,17,17,0.8)', color: '#fff', fontWeight: 800, fontSize: 16 * k }}>{N.source}</div>

      <div style={{ position: 'absolute', left: 60, right: 60, top: photoH - (story ? 210 : 170) }}>
        <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 82 * k, lineHeight: 1, letterSpacing: '-0.045em', color: INK }}>
          <div>{N.title[0]}</div>
          <div style={{ display: 'inline-block', marginTop: 6, padding: `0 ${16 * k}px ${6 * k}px`, borderRadius: 14, background: C.accent }}>{N.title[1]}</div>
        </div>
        <div style={{ marginTop: 14 * k, fontWeight: 700, fontSize: 23 * k, color: '#4A4130' }}>{N.intro}</div>

        {/* formula */}
        <div style={{ marginTop: 26 * k, display: 'flex', alignItems: 'center', gap: 26 * k }}>
          <Donut s={story ? 250 : 220} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 * k }}>
            {N.parts.map((p, i) => (
              <div key={p.t} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: `${14 * k}px ${18 * k}px`, borderRadius: 20, background: i ? INK : '#fff', boxShadow: '0 10px 22px rgba(80,50,0,0.12)' }}>
                <div style={{ width: 18, height: 54 * k, borderRadius: 9, background: i ? C.accent : INK, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 30 * k, color: i ? C.accent : INK, letterSpacing: '-0.02em' }}>{p.pct} <span style={{ color: i ? '#fff' : INK }}>{p.t}</span></div>
                  <div style={{ fontWeight: 700, fontSize: 18 * k, color: i ? '#C9C9CF' : C.muted, marginTop: 2 }}>{p.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 22 * k, display: 'flex', flexDirection: 'column', gap: 10 * k, maxWidth: story ? 560 : 600 }}>
          {N.tips.map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 800, fontSize: 20 * k, color: INK }}>
              <div style={{ width: 30 * k, height: 30 * k, borderRadius: '50%', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="check" size={17 * k} color={INK} /></div>{t}
            </div>
          ))}
        </div>
      </div>

      <PhoneShot src="p-kalk.jpg" w={story ? 300 : 240} y={520} rot={7} style={{ position: 'absolute', right: story ? 24 : 60, top: story ? 1300 : 1010 }} />
      <Mascot name="percent-ring" x={story ? 520 : 560} y={story ? 1400 : 1080} h={story ? 220 : 170} />
      <div style={{ position: 'absolute', left: 60, bottom: story ? 210 : 40, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: `${15 * k}px ${28 * k}px`, borderRadius: 999, background: INK, color: C.accent, fontFamily: FONT.head, fontWeight: 900, fontSize: story ? 22 : 24, whiteSpace: 'nowrap' }}>{N.cta}<Icon name="arrow" size={24 * k} color={C.accent} /></div>
        <Socials size={16 * k} />
      </div>
    </AbsoluteFill>
  )
}
