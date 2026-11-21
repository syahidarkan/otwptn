// Daftar jalur mandiri non-tes. Model: Pintarly "TRYOUT SNBT 2026 #1" (images-5): big outlined title + tilted tag, caps statement,
// the content block, a crowd of characters at the bottom, an info box. Real PTN logos from the otwptn site.
import React from 'react'
import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion'
import { C, FONT, INK, Icon, LogoLockup, Socials } from '../kit'
import CONTENT from '../../../content.json'

const M = CONTENT.v2.mandiriList

export const MandiriList: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.08 : 1
  const cols = 3
  const cw = (960 - (cols - 1) * 14) / cols
  const ch = story ? 128 : 100
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FFF3C4 0%, #FFE07A 50%, #FFC93C 100%)', fontFamily: FONT.body, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: '50%', top: story ? 330 : 190, width: 1700, height: 1700, marginLeft: -850, marginTop: -850, background: 'repeating-conic-gradient(rgba(255,255,255,0.35) 0deg 6deg, rgba(255,255,255,0) 6deg 16deg)', WebkitMaskImage: 'radial-gradient(circle, #000 15%, transparent 60%)' }} />
      <Img src={staticFile('posters/bee2-hd.png')} style={{ position: 'absolute', left: -20, top: story ? 200 : 70, height: story ? 230 : 180, transform: 'scaleX(-1)' }} />
      <Img src={staticFile('posters/bee3-hd.png')} style={{ position: 'absolute', right: -10, top: story ? 230 : 90, height: story ? 220 : 170 }} />
      {/* the crowd: Otbee in almamater jackets */}
      <Img src={staticFile('posters/hero-bawah-hd.png')} style={{ position: 'absolute', left: -60, width: 1200, bottom: story ? 300 : 120, filter: 'drop-shadow(0 16px 20px rgba(80,50,0,0.25))' }} />

      <div style={{ position: 'absolute', left: 60, right: 60, top: story ? 150 : 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ padding: '10px 24px', borderRadius: 999, background: '#fff' }}><LogoLockup h={26 * k} /></div>
        <div style={{ position: 'relative', marginTop: 16 * k, textAlign: 'center', fontFamily: FONT.head, fontWeight: 900, fontSize: 86 * k, lineHeight: 0.95, letterSpacing: '-0.03em', color: INK, WebkitTextStroke: `${9 * k}px #fff`, paintOrder: 'stroke fill', textShadow: `0 ${6 * k}px 0 rgba(17,17,17,0.85)` }}>
          <div>{M.title[0]}</div>
          <div>{M.title[1]}</div>
        </div>
        <div style={{ marginTop: 14 * k, padding: `${6 * k}px ${20 * k}px`, borderRadius: 12, background: INK, color: C.accent, fontFamily: FONT.head, fontWeight: 900, fontSize: 28 * k, transform: 'rotate(-2deg)' }}>TANPA UTBK!</div>
        <div style={{ marginTop: 16 * k, maxWidth: 860, textAlign: 'center', fontWeight: 800, fontSize: 23 * k, lineHeight: 1.4, color: '#3B300B' }}>{M.sub}</div>

        <div style={{ marginTop: 20 * k, display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cw}px)`, gap: 14 }}>
          {M.items.map(it => (
            <div key={it.n} style={{ height: ch, borderRadius: 18, background: '#fff', boxShadow: '0 10px 22px rgba(120,80,0,0.14)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px' }}>
              <Img src={staticFile(`posters/ptn/${it.logo}.png`)} style={{ width: 50 * k, height: 50 * k, objectFit: 'contain', flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 21 * k, color: INK, lineHeight: 1.1 }}>{it.n}</div>
                <div style={{ fontWeight: 700, fontSize: 14 * k, color: C.muted, marginTop: 3, lineHeight: 1.2 }}>{it.u}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', left: 60, right: 60, bottom: story ? 210 : 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: '100%', padding: `${16 * k}px ${24 * k}px`, borderRadius: 22, background: 'rgba(17,17,17,0.92)', color: '#fff', textAlign: 'center', fontWeight: 800, fontSize: 23 * k, lineHeight: 1.35, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Icon name="route" size={28 * k} color={C.accent} /><span>{M.more.split('otwptn.com/jalur')[0]}<span style={{ color: C.accent }}>otwptn.com/jalur</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Socials size={16 * k} />
          <span style={{ fontWeight: 700, fontSize: 15 * k, color: 'rgba(17,17,17,0.7)' }}>{M.note}</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}
