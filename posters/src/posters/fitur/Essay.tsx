// Fitur 02 - Essay AI Review. aimasukptn-style: loud pink, sunburst, stacked caps headline with hard shadow, before/after cards.
import React from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import { C, FONT, INK, Icon, LogoLockup, Mascot, Socials } from '../kit'
import CONTENT from '../../../content.json'

const E = CONTENT.fitur.essay
const PINK = '#D97706' // otwptn amber-deep (accent words)

export const Essay: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.14 : 1
  const hs = 128
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 60% at 50% 30%, #FFC93C 0%, #F59E0B 55%, #E07C00 100%)`, fontFamily: FONT.body, overflow: 'hidden' }}>
      {/* sunburst */}
      <div style={{ position: 'absolute', left: '50%', top: story ? 560 : 330, width: 2600, height: 2600, marginLeft: -1300, marginTop: -1300, borderRadius: '50%', background: 'repeating-conic-gradient(rgba(255,240,160,0.35) 0deg 7deg, rgba(255,240,160,0) 7deg 18deg)', WebkitMaskImage: 'radial-gradient(circle, #000 0%, #000 30%, transparent 60%)' }} />
      <div style={{ position: 'absolute', inset: 0, padding: story ? '150px 64px 220px' : '54px 64px 50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ padding: '12px 26px', borderRadius: 999, background: '#fff' }}><LogoLockup h={28 * k} /></div>

        {/* headline + Otbee */}
        <div style={{ position: 'relative', width: '100%', marginTop: 34 * k, display: 'flex', alignItems: 'center' }}>
          <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: hs, lineHeight: 0.9, letterSpacing: '-0.03em', color: '#fff', WebkitTextStroke: `${7 * k}px ${INK}`, paintOrder: 'stroke fill', textShadow: `${9 * k}px ${9 * k}px 0 ${INK}` }}>
            {E.lines.map((l, i) => <div key={l} style={{ transform: `rotate(${i === 1 ? -2 : 0}deg)`, marginLeft: i * 18 }}>{l}</div>)}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ position: 'relative', width: 330, height: 380 * k, flexShrink: 0 }}>
            <Mascot name="writing-essay" x={0} y={20 * k} h={360 * k} />
            {/* score sticker */}
            <div style={{ position: 'absolute', right: 0, top: -10, width: 150 * k, height: 150 * k, borderRadius: '50%', background: C.accent, border: `${6 * k}px solid ${INK}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: 'rotate(12deg)', boxShadow: `6px 6px 0 ${INK}` }}>
              <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 56 * k, color: INK, lineHeight: 1 }}>{E.score}</div>
              <div style={{ fontWeight: 800, fontSize: 18 * k, color: INK }}>/100</div>
            </div>
          </div>
        </div>

        {story && <div style={{ flex: 1 }} />}
        <div style={{ marginTop: 28 * k, padding: `${14 * k}px ${30 * k}px`, borderRadius: 22, background: '#fff', fontFamily: FONT.head, fontWeight: 800, fontSize: 34 * k, color: INK, textAlign: 'center' }}>
          {E.sub.split('ratusan esai')[0]}<span style={{ color: PINK }}>ratusan esai</span>{E.sub.split('ratusan esai')[1]}
        </div>

        {story && <div style={{ flex: 1 }} />}
        {/* before / after */}
        <div style={{ width: '100%', marginTop: 30 * k, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * k }}>
          <Sentence tag={E.beforeTag} tagBg="#F04438" bg="rgba(255,255,255,0.92)" strike k={k}>{E.before}</Sentence>
          <div style={{ width: 54 * k, height: 54 * k, borderRadius: '50%', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(90deg)' }}>
            <Icon name="arrow" size={30 * k} color={C.accent} />
          </div>
          <Sentence tag={E.afterTag} tagBg={C.green} bg={C.accent} k={k}>{E.after}</Sentence>
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 * k }}>
          <div style={{ padding: `${16 * k}px ${46 * k}px`, borderRadius: 26, background: C.accent, border: `${5 * k}px solid ${INK}`, boxShadow: `7px 7px 0 ${INK}`, fontFamily: FONT.head, fontWeight: 900, fontSize: 48 * k, color: INK, letterSpacing: '-0.02em' }}>
            {CONTENT.site}
          </div>
          <div style={{ fontWeight: 800, fontStyle: 'italic', fontSize: 22 * k, color: INK, marginTop: 8 * k }}>{E.tagline}</div>
          <Socials size={20 * k} />
        </div>
      </div>
    </AbsoluteFill>
  )
}

const Sentence: React.FC<{ tag: string; tagBg: string; bg: string; strike?: boolean; k: number; children: React.ReactNode }> = ({ tag, tagBg, bg, strike, k, children }) => (
  <div style={{ position: 'relative', width: '92%', padding: `${30 * k}px ${30 * k}px ${22 * k}px`, borderRadius: 24, background: bg, border: `${4 * k}px solid ${INK}`, boxShadow: `6px 6px 0 ${INK}` }}>
    <div style={{ position: 'absolute', left: 22, top: -18 * k, padding: `${5 * k}px ${14 * k}px`, borderRadius: 999, background: tagBg, color: '#fff', fontWeight: 900, fontSize: 17 * k, letterSpacing: '0.08em', border: `3px solid ${INK}` }}>{tag}</div>
    <div style={{ fontWeight: 700, fontSize: 27 * k, lineHeight: 1.38, color: strike ? '#6B6B6B' : INK, textDecoration: strike ? 'line-through' : undefined, textDecorationColor: '#F04438', textDecorationThickness: 4 }}>{children}</div>
  </div>
)
