// 11 - Rekrut mentor. Own concept: a dark "now hiring" job poster with halftone dots, a tilted polaroid of the mentor trio,
// and two lists (syarat / yang kamu dapat). otwptn ink + yellow.
import React from 'react'
import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion'
import { C, FONT, INK, Icon, LogoLockup, Mascot, Socials } from '../kit'
import CONTENT from '../../../content.json'

const R = CONTENT.rekrut.mentor

const Halftone: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <div style={{ position: 'absolute', inset: 0, width: w, height: h, backgroundImage: 'radial-gradient(rgba(255,212,0,0.16) 3px, transparent 3.5px)', backgroundSize: '22px 22px', WebkitMaskImage: 'linear-gradient(135deg, #000 0%, transparent 55%)' }} />
)

const List: React.FC<{ title: string; items: string[]; k: number; icon: string }> = ({ title, items, k, icon }) => (
  <div style={{ flex: 1 }}>
    <div style={{ display: 'inline-block', padding: `${6 * k}px ${16 * k}px`, borderRadius: 10, background: C.accent, color: INK, fontFamily: FONT.head, fontWeight: 900, fontSize: 22 * k, letterSpacing: '0.06em' }}>{title}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 * k, marginTop: 18 * k }}>
      {items.map(it => (
        <div key={it} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontWeight: 700, fontSize: 22 * k, lineHeight: 1.35, color: '#F4F4F5' }}>
          <div style={{ width: 30 * k, height: 30 * k, borderRadius: '50%', border: `2.5px solid ${C.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}><Icon name={icon} size={17 * k} color={C.accent} /></div>
          {it}
        </div>
      ))}
    </div>
  </div>
)

export const RekrutMentor: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.1 : 1
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 60% at 80% 20%, #2A2618 0%, ${INK} 60%)`, fontFamily: FONT.body, overflow: 'hidden' }}>
      <Halftone w={1080} h={height} />
      <div style={{ position: 'absolute', inset: 0, padding: story ? '150px 60px 220px' : '52px 60px 44px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <LogoLockup h={28 * k} white />
          <div style={{ padding: `${8 * k}px ${18 * k}px`, borderRadius: 999, border: `2px solid ${C.accent}`, color: C.accent, fontWeight: 800, fontSize: 18 * k, letterSpacing: '0.08em' }}>OPEN RECRUITMENT</div>
        </div>

        <div style={{ position: 'relative', marginTop: 34 * k, height: (story ? 520 : 430) }}>
          <div style={{ fontFamily: FONT.head, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.9 }}>
            <div style={{ fontSize: 70 * k, color: C.accent }}>{R.title[0]}</div>
            <div style={{ fontSize: 112, color: 'transparent', WebkitTextStroke: `${3 * k}px #fff`, marginTop: 8 }}>{R.title[1].split(' ')[0]}</div>
            <div style={{ fontSize: 112, color: '#fff' }}>{R.title[1].split(' ')[1]}</div>
          </div>
          {/* polaroid */}
          <div style={{ position: 'absolute', right: 0, top: story ? 10 : -10, width: (story ? 340 : 380), padding: `${16 * k}px ${16 * k}px ${60 * k}px`, background: '#FFFDF4', borderRadius: 8, transform: 'rotate(6deg)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ height: 300 * k, borderRadius: 4, background: 'linear-gradient(160deg, #FFE45C, #FFC233)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
              <Img src={staticFile('posters/mentor.png')} style={{ width: '104%', marginBottom: -6 }} />
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 16 * k, textAlign: 'center', fontFamily: FONT.head, fontWeight: 800, fontSize: 24 * k, color: INK }}>Mentor otwptn</div>
            <div style={{ position: 'absolute', left: '50%', top: -18, width: 120, height: 36, marginLeft: -60, background: 'rgba(255,212,0,0.85)', transform: 'rotate(-4deg)' }} />
          </div>
          <div style={{ position: 'absolute', left: 0, bottom: 0, maxWidth: story ? 560 : 520, fontWeight: 600, fontSize: 24 * k, lineHeight: 1.45, color: '#D4D4D8' }}>{R.sub}</div>
        </div>

        <div style={{ flex: 1, minHeight: 30 }} />
        <div style={{ display: 'flex', gap: 34 * k, padding: `${28 * k}px ${30 * k}px`, borderRadius: 30, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)' }}>
          <List title="SYARAT" items={R.reqs} k={k} icon="check" />
          <List title="YANG KAMU DAPAT" items={R.gets} k={k} icon="spark" />
        </div>

        <div style={{ flex: 1, minHeight: 30 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: `${16 * k}px ${34 * k}px`, borderRadius: 999, background: C.accent, color: INK, fontFamily: FONT.head, fontWeight: 900, fontSize: 30 * k }}>{R.cta}<Icon name="arrow" size={30 * k} color={INK} /></div>
            <Socials size={18 * k} color="#D4D4D8" style={{ justifyContent: 'flex-start' }} />
          </div>
          <div style={{ position: 'relative', width: 220 * k, height: 230 * k }}>
            <Mascot name="megaphone-community" x={0} y={0} h={230 * k} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
