// Rekrut content creator. Model: Pintarly "Investasi terkecil" (images-4): headline top-left on white, a real photo of a person
// filling the right side, a highlighted promo pill, mascot + CTA pill, a real app screenshot at the bottom.
import React from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import { C, FONT, INK, Icon, LogoLockup, Mascot, Socials } from '../kit'
import { GPill, PhoneShot, Photo } from '../kit2'
import CONTENT from '../../../content.json'

const R = CONTENT.v2.creator

export const Creator: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.08 : 1
  const photoW = story ? 560 : 520
  return (
    <AbsoluteFill style={{ background: '#FFFDF7', fontFamily: FONT.body, overflow: 'hidden' }}>
      <Photo src="creator.jpg" pos="50% 25%" style={{ position: 'absolute', right: 0, top: 0, width: photoW, height: story ? 1300 : 1000 }} />
      <div style={{ position: 'absolute', right: photoW - 200, top: 0, width: 220, height: story ? 1300 : 1000, background: 'linear-gradient(90deg, #FFFDF7, rgba(255,253,247,0))' }} />
      <div style={{ position: 'absolute', right: 0, top: (story ? 1300 : 1000) - 260, width: photoW + 40, height: 260, background: 'linear-gradient(180deg, rgba(255,253,247,0), #FFFDF7)' }} />
      {/* REC badge on the photo */}
      <div style={{ position: 'absolute', right: 40, top: story ? 160 : 50, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 999, background: 'rgba(17,17,17,0.85)', color: '#fff', fontWeight: 900, fontSize: 20 * k, letterSpacing: '0.1em' }}>
        <div style={{ width: 14, height: 14, borderRadius: 7, background: '#F04438' }} />REC
      </div>

      <div style={{ position: 'absolute', left: 60, top: story ? 150 : 50, width: story ? 560 : 540, display: 'flex', flexDirection: 'column', gap: 22 * k }}>
        <LogoLockup h={28 * k} />
        <div style={{ fontFamily: FONT.head, fontWeight: 900, lineHeight: 0.98, letterSpacing: '-0.045em', color: INK }}>
          <div style={{ fontSize: 56 * k, color: C.amberDeep }}>{R.title[0]}</div>
          <div style={{ fontSize: 100 * k }}>{R.title[1]}</div>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ position: 'absolute', left: -10, right: -10, bottom: 8 * k, height: 36 * k, borderRadius: 8, background: C.accent }} />
            <span style={{ position: 'relative', fontSize: 100 * k }}>{R.title[2]}</span>
          </div>
        </div>
        <div style={{ fontWeight: 700, fontSize: 24 * k, lineHeight: 1.45, color: '#3B300B', maxWidth: 470 }}>{R.sub}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 * k, alignItems: 'flex-start' }}>
          {R.pills.map((p, i) => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: `${10 * k}px ${20 * k}px`, borderRadius: 999, background: i === 0 ? INK : '#fff', color: i === 0 ? C.accent : INK, boxShadow: '0 8px 18px rgba(80,60,0,0.10)', fontWeight: 800, fontSize: 22 * k }}>
              <Icon name={['coin', 'spark', 'clock', 'trophy'][i] === 'coin' ? 'spark' : ['coin', 'spark', 'clock', 'trophy'][i]} size={22 * k} color={i === 0 ? C.accent : C.amberDeep} />{p}
            </div>
          ))}
        </div>
      </div>

      <PhoneShot src="p-creator.jpg" w={story ? 270 : 230} y={0} rot={-7} style={{ position: 'absolute', left: story ? 60 : 50, top: story ? 1210 : 880 }} />
      <Mascot name="megaphone-community" x={story ? 360 : 300} y={story ? 1230 : 900} h={story ? 260 : 210} />

      <div style={{ position: 'absolute', left: story ? 600 : 540, right: story ? 30 : 50, top: story ? 1260 : 940, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
        <GPill size={18 * k} style={{ textAlign: 'left' }}>{R.req}</GPill>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: `${14 * k}px ${26 * k}px`, borderRadius: 999, background: INK, color: C.accent, fontFamily: FONT.head, fontWeight: 900, fontSize: (story ? 22 : 25), whiteSpace: 'nowrap' }}>{R.cta}<Icon name="arrow" size={25 * k} color={C.accent} /></div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: story ? 210 : 34, display: 'flex', justifyContent: 'center' }}>
        <div style={{ padding: '10px 24px', borderRadius: 999, background: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,0.12)' }}><Socials size={17 * k} /></div>
      </div>
    </AbsoluteFill>
  )
}
