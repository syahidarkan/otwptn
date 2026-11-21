// Fitur 05 - Mentor Alumni. Pintarly "who's it for"-style: centred highlighted title, two match cards joined by the jalur, a "what you get" list.
import React from 'react'
import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion'
import { BTN_GRAD } from '../../ui/kit'
import { C, FONT, INK, Icon, LogoLockup, Socials } from '../kit'
import CONTENT from '../../../content.json'

const M = CONTENT.fitur.mentor
const MINT = '#FFF4CC'

const Who: React.FC<{ img: string; label: string; sub: string; tag: string; k: number; dark?: boolean }> = ({ img, label, sub, tag, k, dark }) => (
  <div style={{ flex: 1, borderRadius: 34, background: dark ? INK : '#fff', boxShadow: '0 16px 40px rgba(120,80,0,0.14)', padding: `${24 * k}px ${22 * k}px ${26 * k}px`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ height: 210 * k, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <Img src={staticFile(`posters/${img}.png`)} style={{ maxHeight: 210 * k, maxWidth: 400 * k }} />
    </div>
    <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 40 * k, color: dark ? C.accent : INK, marginTop: 16 * k, letterSpacing: '-0.02em' }}>{label}</div>
    <div style={{ fontWeight: 700, fontSize: 23 * k, color: dark ? '#D4D4D8' : C.muted, marginTop: 2 }}>{sub}</div>
    <div style={{ marginTop: 14 * k, padding: `${8 * k}px ${18 * k}px`, borderRadius: 999, background: dark ? 'rgba(255,212,0,0.16)' : '#FFF4BF', color: dark ? C.accent : C.amberInk, fontWeight: 800, fontSize: 19 * k }}>{tag}</div>
  </div>
)

export const Mentor: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.18 : 1
  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, #FFFDF6 0%, ${MINT} 60%, #FFE58A 100%)`, fontFamily: FONT.body, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -200, top: -160, width: 620, height: 620, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,212,0,0.28), rgba(255,212,0,0) 70%)' }} />
      <div style={{ position: 'absolute', inset: 0, padding: story ? '150px 60px 220px' : '56px 60px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <LogoLockup h={32 * k} />
        <div style={{ marginTop: 30 * k, textAlign: 'center', fontFamily: FONT.head, fontWeight: 900, fontSize: 80 * k, lineHeight: 1.04, letterSpacing: '-0.04em', color: INK }}>
          <div>{M.title[0]}</div>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ position: 'absolute', left: -12, right: -12, bottom: 8 * k, height: 32 * k, borderRadius: 10, background: 'linear-gradient(90deg, #FFD400, #F59E0B)' }} />
            <span style={{ position: 'relative' }}>{M.title[1]}</span>
          </div>
        </div>

        {story && <div style={{ flex: 1 }} />}
        {/* the match */}
        <div style={{ position: 'relative', width: '100%', marginTop: 90 * k }}>
          <svg width={960} height={90 * k} viewBox={`0 0 960 ${90 * k}`} style={{ position: 'absolute', left: 0, top: -40 * k }}>
            <path d={`M 230 ${86 * k} C 300 ${-10 * k}, 660 ${-10 * k}, 730 ${86 * k}`} fill="none" stroke="#FFD400" strokeWidth={12} strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', left: '50%', top: -58 * k, transform: 'translateX(-50%)', padding: `${9 * k}px ${22 * k}px`, borderRadius: 999, background: INK, color: C.accent, fontWeight: 800, fontSize: 21 * k, display: 'flex', alignItems: 'center', gap: 8, zIndex: 2, whiteSpace: 'nowrap' }}>
            <Icon name="check" size={20 * k} color={C.accent} />{M.link}
          </div>
          <div style={{ display: 'flex', gap: 26 * k, alignItems: 'stretch' }}>
            <Who img="sign-pejuang" k={k} {...M.you} />
            <Who img="mentor" k={k} dark {...M.mentor} />
          </div>
        </div>

        {story && <div style={{ flex: 1 }} />}
        {/* what you get */}
        <div style={{ width: '100%', marginTop: 34 * k, padding: `${8 * k}px ${16 * k}px`, borderRadius: 999, background: 'linear-gradient(90deg, #FFE45C, #FFC233)', textAlign: 'center', fontFamily: FONT.head, fontWeight: 900, fontSize: 30 * k, letterSpacing: '0.04em', color: INK }}>
          YANG KAMU DAPAT
        </div>
        <div style={{ width: '100%', marginTop: 22 * k, display: 'flex', flexDirection: 'column', gap: 16 * k }}>
          {M.gets.map(g => (
            <div key={g.t} style={{ display: 'flex', alignItems: 'center', gap: 22 * k }}>
              <div style={{ width: 66 * k, height: 66 * k, borderRadius: 20, background: BTN_GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={g.icon} size={32 * k} color={INK} /></div>
              <div>
                <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 30 * k, color: INK, letterSpacing: '-0.02em' }}>{g.t}</div>
                <div style={{ fontWeight: 600, fontSize: 21 * k, color: C.muted, marginTop: 2 }}>{g.d}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, minHeight: 24 }} />
        <div style={{ fontWeight: 700, fontSize: 19 * k, color: C.muted, marginBottom: 14 * k }}>{M.note}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: `${16 * k}px ${40 * k}px`, borderRadius: 999, background: INK, color: C.accent, fontFamily: FONT.head, fontWeight: 800, fontSize: 30 * k }}>
          Cari mentormu di {CONTENT.site}<Icon name="arrow" size={30 * k} color={C.accent} />
        </div>
        <Socials size={19 * k} style={{ marginTop: 18 * k }} />
      </div>
    </AbsoluteFill>
  )
}
