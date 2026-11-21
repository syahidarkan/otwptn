// 08 - Eligible SNBP. Model of the aimasukptn "#1 app" story: medal badge + outlined stacked caps, tilted phone, floating tip cards,
// big mascot, sunny sky & hills. Colours: otwptn yellow / amber / ink / cream only.
import React from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import { C, FONT, INK, Icon, LogoLockup, Mascot, Socials } from '../kit'
import { KalkulatorScreen } from '../screens'
import CONTENT from '../../../content.json'

const E = CONTENT.momen.eligible

const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 300 * s, height: 120 * s }}>
    {[[0, 50, 120], [70, 10, 150], [160, 30, 130], [40, 60, 220]].map(([l, t, d], i) => (
      <div key={i} style={{ position: 'absolute', left: l * s, top: t * s, width: d * s, height: (i === 3 ? 70 : d) * s, borderRadius: 999, background: '#FFFDF2' }} />
    ))}
  </div>
)

const Medal: React.FC<{ s: number }> = ({ s }) => (
  <div style={{ position: 'relative', width: 230 * s, height: 270 * s, flexShrink: 0 }}>
    {/* ribbons */}
    <div style={{ position: 'absolute', left: 40 * s, top: 150 * s, width: 64 * s, height: 120 * s, background: INK, transform: 'rotate(18deg)', clipPath: 'polygon(0 0,100% 0,100% 100%,50% 80%,0 100%)' }} />
    <div style={{ position: 'absolute', left: 126 * s, top: 150 * s, width: 64 * s, height: 120 * s, background: '#E08A00', transform: 'rotate(-18deg)', clipPath: 'polygon(0 0,100% 0,100% 100%,50% 80%,0 100%)' }} />
    {/* rosette */}
    <div style={{ position: 'absolute', left: 0, top: 0, width: 230 * s, height: 230 * s, borderRadius: '50%', background: `repeating-conic-gradient(${C.accent} 0deg 10deg, #FFB800 10deg 20deg)`, border: `${6 * s}px solid ${INK}` }} />
    <div style={{ position: 'absolute', left: 30 * s, top: 30 * s, width: 170 * s, height: 170 * s, borderRadius: '50%', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="check" size={100 * s} color={C.accent} />
    </div>
  </div>
)

const Tip: React.FC<{ t: string; d: string; k: number; style?: React.CSSProperties }> = ({ t, d, k, style }) => (
  <div style={{ position: 'absolute', width: 430 * k, padding: `${18 * k}px ${22 * k}px`, borderRadius: 22, background: '#fff', boxShadow: '0 18px 40px rgba(90,60,0,0.22)', ...style }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 15 * k, letterSpacing: '0.08em', color: C.amberDeep }}>
      <Icon name="spark" size={16 * k} color={C.amberDeep} />TIPS DARI OTBEE
    </div>
    <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 27 * k, color: INK, marginTop: 6, letterSpacing: '-0.02em' }}>{t}</div>
    <div style={{ fontWeight: 600, fontSize: 19 * k, color: '#4B4B4B', marginTop: 4, lineHeight: 1.4 }}>{d}</div>
  </div>
)

export const Eligible: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.06 : 1
  const top = story ? 150 : 46
  const hs = 104 * k
  const bodyTop = top + (story ? 560 : 470) // where the phone & tips area starts
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FFE45C 0%, #FFD21F 40%, #FFC107 100%)', fontFamily: FONT.body, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: '50%', top: top + 260, width: 2400, height: 2400, marginLeft: -1200, marginTop: -1200, background: 'repeating-conic-gradient(rgba(255,255,255,0.18) 0deg 8deg, rgba(255,255,255,0) 8deg 20deg)', WebkitMaskImage: 'radial-gradient(circle, #000 10%, transparent 55%)' }} />
      <Cloud x={-60} y={bodyTop + 40} s={1.3} />
      <Cloud x={760} y={bodyTop - 80} s={1} />
      {/* hills */}
      <div style={{ position: 'absolute', left: -300, right: -300, bottom: -900, height: 1500, borderRadius: '50%', background: '#F5A400' }} />
      <div style={{ position: 'absolute', left: 300, right: -500, bottom: -1000, height: 1500, borderRadius: '50%', background: '#E58F00' }} />

      <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ padding: '12px 26px', borderRadius: 999, background: '#fff' }}><LogoLockup h={28 * k} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26 * k, marginTop: 30 * k }}>
          <Medal s={0.92 * k} />
          <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: hs, lineHeight: 0.92, letterSpacing: '-0.03em', color: INK, WebkitTextStroke: `${10 * k}px #fff`, paintOrder: 'stroke fill', textShadow: `0 ${8 * k}px 0 ${INK}` }}>
            {E.lines.map(l => <div key={l}>{l}</div>)}
          </div>
        </div>
        <div style={{ marginTop: 26 * k, padding: `${16 * k}px ${30 * k}px`, borderRadius: 24, background: '#fff', fontFamily: FONT.head, fontWeight: 800, fontSize: 32 * k, color: INK, boxShadow: '0 14px 30px rgba(90,60,0,0.18)', textAlign: 'center' }}>{E.congrats}</div>
        <div style={{ marginTop: 16 * k, padding: `${10 * k}px ${26 * k}px`, borderRadius: 14, background: INK, color: C.accent, fontWeight: 900, fontSize: 26 * k, transform: 'rotate(-2deg)' }}>{E.warn}</div>
      </div>

      {/* phone + tips + Otbee */}
      <div style={{ position: 'absolute', left: story ? 30 : 40, top: bodyTop + (story ? 120 : 130), transform: 'rotate(-9deg)', filter: 'drop-shadow(0 30px 40px rgba(80,50,0,0.4))' }}>
        <div style={{ transform: `scale(${story ? 0.66 : 0.6})`, transformOrigin: '0 0', width: 460, height: 940 }}><KalkulatorScreen /></div>
      </div>
      <Tip k={k} t={E.tips[0].t} d={E.tips[0].d} style={{ left: story ? 560 : 590, top: bodyTop + (story ? 150 : 150), transform: 'rotate(2deg)', width: (story ? 440 : 420) }} />
      <Tip k={k} t={E.tips[1].t} d={E.tips[1].d} style={{ left: story ? 300 : 330, top: bodyTop + (story ? 400 : 345), transform: 'rotate(-2deg)', width: (story ? 440 : 400) }} />
      {story && <Tip k={k} t={E.tips[2].t} d={E.tips[2].d} style={{ left: 120, top: bodyTop + 640, transform: 'rotate(1.5deg)', width: 520 }} />}
      <Mascot name="reading-books" x={story ? 700 : 790} y={bodyTop + (story ? 560 : 400)} h={story ? 400 : 290} />

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: story ? 200 : 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: `${16 * k}px ${34 * k}px`, borderRadius: 999, background: INK, color: C.accent, fontFamily: FONT.head, fontWeight: 800, fontSize: 28 * k, boxShadow: '0 12px 30px rgba(0,0,0,0.25)' }}>{E.cta}<Icon name="arrow" size={28 * k} color={C.accent} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Socials size={18 * k} />
          <span style={{ fontWeight: 700, fontSize: 16 * k, color: 'rgba(17,17,17,0.7)' }}>{E.source}</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}
