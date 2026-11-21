// 13 - Edukasi: peta jalur. Own concept: a metro/subway map where each admission route is a line converging on "PTN impian".
import React from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import { C, FONT, INK, Icon, LogoLockup, Mascot, Socials } from '../kit'
import CONTENT from '../../../content.json'

const P = CONTENT.edukasi.peta

export const PetaJalur: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.06 : 1
  // map geometry
  const top = story ? 640 : 480
  const gap = story ? 330 : 210
  const xs = [110, 300, 490, 680]
  const term = { x: 935, y: top + gap }
  const ys = P.lines.map((_, i) => top + i * gap)
  return (
    <AbsoluteFill style={{ background: '#FFFBEE', fontFamily: FONT.body, overflow: 'hidden' }}>
      {/* map grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(180,140,40,0.10) 2px, transparent 2px), linear-gradient(90deg, rgba(180,140,40,0.10) 2px, transparent 2px)', backgroundSize: '60px 60px' }} />
      <svg width={1080} height={height} style={{ position: 'absolute', inset: 0 }}>
        {P.lines.map((l, i) => {
          const y = ys[i]
          const d = `M ${xs[0] - 40} ${y} L ${xs[3]} ${y} C ${xs[3] + 120} ${y}, ${term.x - 120} ${term.y}, ${term.x} ${term.y}`
          return <path key={l.name} d={d} fill="none" stroke={l.color} strokeWidth={22} strokeLinecap="round" />
        })}
        {P.lines.map((l, i) => xs.map((x, j) => (
          <circle key={l.name + j} cx={x} cy={ys[i]} r={17} fill="#fff" stroke={INK} strokeWidth={7} />
        )))}
        <circle cx={term.x} cy={term.y} r={56} fill={INK} />
        <circle cx={term.x} cy={term.y} r={40} fill={C.accent} />
      </svg>
      <div style={{ position: 'absolute', left: term.x - 20, top: term.y - 22 }}><Icon name="spark" size={40} color={INK} /></div>
      <div style={{ position: 'absolute', left: term.x - 90, top: term.y + 66, width: 180, textAlign: 'center', fontFamily: FONT.head, fontWeight: 900, fontSize: 30 * k, color: INK, lineHeight: 1 }}>PTN<br />impian</div>

      {/* line names + station labels */}
      {P.lines.map((l, i) => (
        <React.Fragment key={l.name}>
          <div style={{ position: 'absolute', left: xs[0] - 40, top: ys[i] - 70 * k, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: `${6 * k}px ${16 * k}px`, borderRadius: 10, background: l.color, color: l.color === '#111111' ? C.accent : INK, fontFamily: FONT.head, fontWeight: 900, fontSize: 24 * k, border: `3px solid ${INK}` }}>{l.name}</div>
            <div style={{ fontWeight: 800, fontSize: 17 * k, color: C.amberInk }}>{l.tag}</div>
          </div>
          {l.stops.map((s, j) => (
            <div key={s} style={{ position: 'absolute', left: xs[j] - 85, top: ys[i] + 30, width: 170, textAlign: 'center', fontWeight: 700, fontSize: 17 * k, lineHeight: 1.25, color: INK }}>{s}</div>
          ))}
        </React.Fragment>
      ))}

      <div style={{ position: 'absolute', inset: 0, padding: story ? '150px 60px 220px' : '50px 60px 44px', display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
        <LogoLockup h={28 * k} />
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 26 * k }}>
          <div>
            <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 84 * k, lineHeight: 0.98, letterSpacing: '-0.045em', color: INK }}>
              <div>{P.title[0]}</div>
              <div style={{ display: 'inline-block', marginTop: 6, padding: `0 ${16 * k}px ${6 * k}px`, borderRadius: 16, background: C.accent }}>{P.title[1]}</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 23 * k, color: '#4A4130', marginTop: 16 * k, maxWidth: 560 }}>{P.sub}</div>
          </div>
          <Mascot name="map-pointing" x={0} y={0} h={story ? 300 : 230} style={{ position: 'relative', left: 0, top: 0 }} />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 16 * k, color: C.muted }}>{P.note}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: `${15 * k}px ${36 * k}px`, borderRadius: 999, background: INK, color: C.accent, fontFamily: FONT.head, fontWeight: 900, fontSize: 28 * k }}>{P.cta}<Icon name="arrow" size={28 * k} color={C.accent} /></div>
          <Socials size={18 * k} />
        </div>
      </div>
    </AbsoluteFill>
  )
}
