// Platform #1 masuk PTN tanpa tes. Model: the aimasukptn "#1 App Store" story (medal + outlined caps, stats card, banner,
// tilted real phone screenshots, floating cards, big mascot, sky + grass). otwptn colours, real otwptn.com screenshots.
import React from 'react'
import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion'
import { C, FONT, INK, Icon, LogoLockup, Socials } from '../kit'
import { PhoneShot } from '../kit2'
import CONTENT from '../../../content.json'

const P = CONTENT.v2.platform1

const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 300 * s, height: 120 * s }}>
    {[[0, 50, 120], [70, 10, 150], [160, 30, 130], [40, 60, 220]].map(([l, t, d], i) => (
      <div key={i} style={{ position: 'absolute', left: l * s, top: t * s, width: d * s, height: (i === 3 ? 70 : d) * s, borderRadius: 999, background: '#FFFEF6' }} />
    ))}
  </div>
)

const Medal: React.FC<{ s: number }> = ({ s }) => (
  <div style={{ position: 'relative', width: 250 * s, height: 300 * s, flexShrink: 0 }}>
    <div style={{ position: 'absolute', left: 30 * s, top: 170 * s, width: 80 * s, height: 130 * s, background: INK, transform: 'rotate(22deg)', clipPath: 'polygon(0 0,100% 0,100% 100%,50% 78%,0 100%)' }} />
    <div style={{ position: 'absolute', left: 140 * s, top: 170 * s, width: 80 * s, height: 130 * s, background: '#D97706', transform: 'rotate(-22deg)', clipPath: 'polygon(0 0,100% 0,100% 100%,50% 78%,0 100%)' }} />
    <div style={{ position: 'absolute', inset: `0 0 ${50 * s}px 0`, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #FFF3A0, #FFC107 55%, #E89B00)', border: `${7 * s}px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 120 * s, color: '#fff', WebkitTextStroke: `${8 * s}px ${INK}`, paintOrder: 'stroke fill', letterSpacing: '-0.04em', transform: 'rotate(-8deg)' }}>{P.badge}</div>
    </div>
  </div>
)

const FloatCard: React.FC<{ t: string; d: string; k: number; style?: React.CSSProperties }> = ({ t, d, k, style }) => (
  <div style={{ position: 'absolute', width: 400 * k, padding: `${18 * k}px ${22 * k}px`, borderRadius: 18, background: '#fff', boxShadow: '0 18px 36px rgba(60,40,0,0.25)', ...style }}>
    <div style={{ display: 'flex', gap: 3 }}>{[0, 1, 2, 3, 4].map(i => <Icon key={i} name="spark" size={16 * k} color="#F5B000" />)}</div>
    <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 25 * k, color: INK, marginTop: 6, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>{t}</div>
    <div style={{ fontWeight: 700, fontSize: 19 * k, color: '#4B4B4B', marginTop: 4, lineHeight: 1.35 }}>{d}</div>
  </div>
)

export const Platform1: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.12 : 1
  const top = story ? 140 : 40
  const ph = story ? 860 : 690 // where the phones start
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FFE45C 0%, #FFD84D 45%, #FFF0B0 100%)', fontFamily: FONT.body, overflow: 'hidden' }}>
      <Cloud x={-90} y={top + 520} s={1.4} />
      <Cloud x={720} y={top + 600} s={1.1} />
      <Cloud x={800} y={top + 40} s={0.8} />
      {/* grass hills from the otwptn site footer art */}
      <Img src={staticFile('posters/grass.png')} style={{ position: 'absolute', left: 0, bottom: 0, width: 1080, height: story ? 620 : 380, objectFit: 'cover', objectPosition: 'top', WebkitMaskImage: 'linear-gradient(transparent 0%, #000 12%)' }} />

      <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ padding: '10px 24px', borderRadius: 999, background: '#fff' }}><LogoLockup h={26 * k} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 22 * k }}>
          <Medal s={0.82 * k} />
          <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 92 * k, lineHeight: 0.92, letterSpacing: '-0.03em', color: C.accent, WebkitTextStroke: `${11 * k}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${7 * k}px 0 ${INK}` }}>
            {P.lines.map(l => <div key={l}>{l}</div>)}
          </div>
        </div>
        {/* stats card */}
        <div style={{ marginTop: 22 * k, padding: `${16 * k}px ${30 * k}px`, borderRadius: 22, background: '#fff', boxShadow: '0 14px 30px rgba(90,60,0,0.16)', textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: 34 * k, justifyContent: 'center' }}>
            {P.stats.map(s => (
              <div key={s.k} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 44 * k, color: INK, letterSpacing: '-0.03em' }}>{s.v}</span>
                <span style={{ fontWeight: 800, fontSize: 19 * k, color: C.muted }}>{s.k}</span>
              </div>
            ))}
          </div>
          <div style={{ fontWeight: 700, fontSize: 16 * k, color: C.muted2, marginTop: 4 }}>{P.statsNote}</div>
        </div>
        <div style={{ marginTop: 16 * k, padding: `${10 * k}px ${28 * k}px`, borderRadius: 14, background: INK, color: C.accent, fontFamily: FONT.head, fontWeight: 900, fontSize: 30 * k, transform: 'rotate(-1.5deg)', boxShadow: '0 10px 20px rgba(0,0,0,0.25)' }}>{P.banner}</div>
      </div>

      {/* real screenshots */}
      <PhoneShot src="p-kalk.jpg" w={story ? 330 : 290} y={300} rot={-9} style={{ position: 'absolute', left: story ? 40 : 46, top: ph }} />
      <PhoneShot src="p-track.jpg" w={story ? 300 : 260} y={300} rot={7} style={{ position: 'absolute', left: story ? 360 : 320, top: ph + (story ? 90 : 70) }} />
      <FloatCard k={k} t={P.cards[0].t} d={P.cards[0].d} style={{ right: 36, top: ph - 10, transform: 'rotate(2deg)' }} />
      <FloatCard k={k} t={P.cards[2].t} d={P.cards[2].d} style={{ right: story ? 40 : 30, top: ph + (story ? 200 : 170), transform: 'rotate(-1.5deg)', width: 360 * k }} />
      <Img src={staticFile('posters/bee1-hd.png')} style={{ position: 'absolute', right: story ? 0 : -10, top: ph + (story ? 400 : 300), height: story ? 420 : 330, filter: 'drop-shadow(0 20px 24px rgba(60,40,0,0.3))' }} />

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: story ? 210 : 34, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: `${15 * k}px ${36 * k}px`, borderRadius: 999, background: C.accent, border: `4px solid ${INK}`, color: INK, fontFamily: FONT.head, fontWeight: 900, fontSize: 30 * k, boxShadow: `5px 5px 0 ${INK}` }}>{P.cta}<Icon name="arrow" size={30 * k} color={INK} /></div>
        <div style={{ padding: '8px 22px', borderRadius: 999, background: 'rgba(255,255,255,0.9)' }}><Socials size={17 * k} /></div>
      </div>
    </AbsoluteFill>
  )
}
