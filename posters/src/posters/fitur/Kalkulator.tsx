// Fitur 03 - Kalkulator Peluang. Ruangguru-style: blue sky, clouds, a giant extruded number, Otbee flying in, an info panel at the bottom.
import React from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import { C, FONT, INK, Icon, LogoLockup, Mascot, Socials } from '../kit'
import { PhoneShot } from '../kit2'
import CONTENT from '../../../content.json'

const K = CONTENT.fitur.kalkulator
const BLUE = '#B45309' // otwptn amber ink for labels

const Cloud: React.FC<{ x: number; y: number; s: number; o?: number }> = ({ x, y, s, o = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 300 * s, height: 120 * s, opacity: o }}>
    {[[0, 50, 120], [70, 10, 150], [160, 30, 130], [40, 60, 220]].map(([l, t, d], i) => (
      <div key={i} style={{ position: 'absolute', left: l * s, top: t * s, width: d * s, height: (i === 3 ? 70 : d) * s, borderRadius: 999, background: '#fff' }} />
    ))}
  </div>
)

/** extruded 3D type: stacked offset copies make the depth */
const extrude = (n: number, k: number) => Array.from({ length: n }, (_, i) => `${(i + 1) * 1.2 * k}px ${(i + 1) * 1.6 * k}px 0 ${i < n - 2 ? '#E08A00' : INK}`).join(', ')

export const Kalkulator: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.2 : 1
  const num = (story ? 470 : 420)
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FFB800 0%, #FFD23F 40%, #FFEA9A 78%, #FFF7DC 100%)', fontFamily: FONT.body, overflow: 'hidden' }}>
      <Cloud x={-80} y={story ? 340 : 200} s={1.2} o={0.9} />
      <Cloud x={720} y={story ? 1000 : 700} s={1.4} o={0.95} />
      <Cloud x={-120} y={story ? 1180 : 850} s={1.5} o={0.95} />
      {/* skyline */}
      <svg width={1080} height={260} viewBox="0 0 1080 260" style={{ position: 'absolute', left: 0, bottom: story ? 160 : 0, opacity: 0.35 }}>
        {[[20, 120], [90, 70], [150, 150], [230, 90], [300, 180], [380, 110], [440, 140], [520, 200], [600, 120], [680, 160], [760, 90], [830, 170], [910, 110], [980, 140]].map(([x, h], i) => <rect key={i} x={x} y={260 - h} width={62} height={h} rx={6} fill="#E08A00" />)}
      </svg>

      <PhoneShot src="p-kalk.jpg" w={story ? 280 : 240} y={560} rot={8} style={{ position: 'absolute', right: story ? 60 : 60, top: story ? 1130 : 660 }} />
      <PhoneShot src="p-kalk.jpg" w={story ? 260 : 220} y={120} rot={-8} style={{ position: 'absolute', left: story ? 60 : 60, top: story ? 1150 : 680 }} />
      <div style={{ position: 'absolute', inset: 0, padding: story ? '150px 60px 220px' : '54px 60px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <LogoLockup h={30 * k} />
        <div style={{ marginTop: 34 * k, fontFamily: FONT.head, fontWeight: 900, fontSize: 60 * k, color: INK, letterSpacing: '-0.03em' }}>{K.top}</div>

        {story && <div style={{ flex: 1 }} />}
        {/* the number */}
        <div style={{ position: 'relative', marginTop: 6 * k, display: 'flex', alignItems: 'flex-start' }}>
          <Mascot name="paper-plane-fly" x={-300} y={60} h={210 * k} />
          <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: num, lineHeight: 1, letterSpacing: '-0.05em', color: '#fff', WebkitTextStroke: `${6 * k}px ${INK}`, paintOrder: 'stroke fill', textShadow: extrude(14, k) }}>{K.number}</div>
          <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: num * 0.42, lineHeight: 1, marginTop: num * 0.1, marginLeft: 10, color: '#fff', WebkitTextStroke: `${5 * k}px ${INK}`, paintOrder: 'stroke fill', textShadow: extrude(9, k) }}>%</div>
        </div>
        <div style={{ marginTop: 18 * k, fontWeight: 700, fontSize: 19 * k, color: 'rgba(17,17,17,0.7)' }}>{K.note}</div>

        {story && <div style={{ flex: 1 }} />}
        <div style={{ marginTop: 26 * k, display: 'flex', alignItems: 'center', gap: 14, padding: `${14 * k}px ${34 * k}px`, borderRadius: 999, background: INK, color: '#fff', fontFamily: FONT.head, fontWeight: 800, fontSize: 40 * k, letterSpacing: '-0.02em' }}>
          <Icon name="percent" size={38 * k} color={C.accent} />{K.name}
        </div>

        <div style={{ flex: 1 }} />
        {/* info panel */}
        <div style={{ position: 'relative', width: '100%', borderRadius: 30, background: 'rgba(255,255,255,0.96)', boxShadow: '0 20px 50px rgba(120,70,0,0.25)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', padding: `${30 * k}px ${16 * k}px` }}>
            {K.factors.map((f, i) => (
              <div key={f.t} style={{ flex: 1, padding: '0 22px', borderLeft: i ? '2px solid #F1E3BC' : 'none' }}>
                <div style={{ fontWeight: 800, fontSize: 17 * k, letterSpacing: '0.08em', color: BLUE }}>{['CAKUPAN', 'RIWAYAT DATA', 'REFERENSI'][i]}</div>
                <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 31 * k, color: INK, marginTop: 6, letterSpacing: '-0.02em' }}>{f.t}</div>
                <div style={{ fontWeight: 600, fontSize: 19 * k, color: C.muted, marginTop: 4, lineHeight: 1.35 }}>{f.d}</div>
              </div>
            ))}
          </div>
          <div style={{ background: INK, color: '#fff', textAlign: 'center', padding: `${18 * k}px 0`, fontFamily: FONT.head, fontWeight: 800, fontSize: 32 * k, letterSpacing: '-0.01em' }}>
            {K.cta.replace(CONTENT.site, '')}<span style={{ color: C.accent }}>{CONTENT.site}</span>
          </div>
        </div>
        <div style={{ marginTop: 20 * k, padding: '10px 28px', borderRadius: 999, background: 'rgba(255,255,255,0.85)' }}><Socials size={20 * k} /></div>
      </div>
      <Mascot name="pencil-fly" x={story ? 810 : 830} y={story ? 560 : 330} h={story ? 300 : 260} style={{ transform: 'rotate(8deg)' }} />
    </AbsoluteFill>
  )
}
