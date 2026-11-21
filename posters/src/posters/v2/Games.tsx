// Games PPU & PBM: arcade / game-show look — chunky outlined title, "PLAYER 1" XP bar, game cartridges, a real screenshot of the
// latihan page, trophy Otbee, classroom photo in the background.
import React from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import { C, FONT, INK, Icon, LogoLockup, Mascot, Socials } from '../kit'
import { PhoneShot, Photo } from '../kit2'
import CONTENT from '../../../content.json'

const G = CONTENT.v2.games

export const Games: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.08 : 1
  return (
    <AbsoluteFill style={{ background: '#FFC93C', fontFamily: FONT.body, overflow: 'hidden' }}>
      <Photo src="classroom.jpg" style={{ position: 'absolute', inset: 0, width: 1080, height, opacity: 0.18, filter: 'grayscale(1) contrast(1.2)', mixBlendMode: 'multiply' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.12) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.12) 75%), linear-gradient(45deg, rgba(255,255,255,0.12) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.12) 75%)', backgroundSize: '60px 60px', backgroundPosition: '0 0, 30px 30px' }} />

      <div style={{ position: 'absolute', left: 60, right: 60, top: story ? 150 : 46, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ padding: '10px 24px', borderRadius: 999, background: '#fff', border: `3px solid ${INK}` }}><LogoLockup h={26 * k} /></div>
        <div style={{ marginTop: 22 * k, textAlign: 'center', fontFamily: FONT.head, fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.02em', color: '#fff', WebkitTextStroke: `${10 * k}px ${INK}`, paintOrder: 'stroke fill', textShadow: `${8 * k}px ${8 * k}px 0 ${INK}` }}>
          <div style={{ fontSize: 96 * k }}>{G.title[0]}</div>
          <div style={{ fontSize: 126 * k, color: C.accent }}>{G.title[1]}</div>
        </div>
        <div style={{ marginTop: 20 * k, maxWidth: 860, textAlign: 'center', fontWeight: 800, fontSize: 23 * k, lineHeight: 1.4, color: INK }}>{G.sub}</div>
        {/* player XP bar */}
        <div style={{ marginTop: 18 * k, width: 620, padding: `${12 * k}px ${18 * k}px`, borderRadius: 18, background: INK, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 20 * k, color: C.accent, letterSpacing: '0.06em' }}>PLAYER 1</div>
          <div style={{ flex: 1, height: 18, borderRadius: 9, background: '#333', overflow: 'hidden' }}><div style={{ width: '68%', height: '100%', background: 'linear-gradient(90deg, #FFE45C, #F59E0B)' }} /></div>
          <div style={{ fontWeight: 900, fontSize: 18 * k, color: '#fff' }}>LV 7</div>
        </div>
      </div>

      {/* cartridges + real screenshot */}
      <div style={{ position: 'absolute', left: 60, top: story ? 780 : 560, width: story ? 560 : 560, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {G.games.map((g, i) => (
          <div key={g.n} style={{ height: story ? 190 : 165, borderRadius: 22, background: ['#fff', INK, INK, '#fff'][i], border: `4px solid ${INK}`, boxShadow: `6px 6px 0 ${INK}`, padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ alignSelf: 'flex-start', padding: '4px 12px', borderRadius: 8, background: C.accent, color: INK, fontWeight: 900, fontSize: 17 * k }}>{g.t}</div>
            <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 29 * k, lineHeight: 1.05, color: ['#fff', INK, INK, '#fff'][i] === INK ? '#fff' : INK }}>{g.n}</div>
          </div>
        ))}
      </div>
      <PhoneShot src="p-latihan.jpg" w={story ? 290 : 250} y={60} rot={6} style={{ position: 'absolute', right: story ? 70 : 80, top: story ? 760 : 530 }} />
      <Mascot name="trophy-jump" x={story ? 700 : 760} y={story ? 1290 : 990} h={story ? 280 : 220} />

      <div style={{ position: 'absolute', left: 60, bottom: story ? 210 : 40, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: `${10 * k}px ${18 * k}px`, borderRadius: 14, background: '#fff', border: `3px solid ${INK}`, fontWeight: 900, fontSize: 21 * k, color: INK }}><Icon name="trophy" size={24 * k} color={C.amberDeep} />{G.xp}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: `${15 * k}px ${32 * k}px`, borderRadius: 999, background: INK, color: C.accent, fontFamily: FONT.head, fontWeight: 900, fontSize: 28 * k }}>{G.cta}<Icon name="arrow" size={28 * k} color={C.accent} /></div>
        <Socials size={16 * k} />
      </div>
    </AbsoluteFill>
  )
}
