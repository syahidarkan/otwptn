// AI Essay Reviewer GRATIS. Model: Pintarly "Tryout SNBT Fleksibel #1 GRATIS!!!" (images-2): centred title on a highlight bar,
// huge GRATIS, two mascots in front of a faded campus photo, a sticker on the right, caps statement, gradient pill, swipe hint.
import React from 'react'
import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion'
import { C, FONT, INK, Icon, LogoLockup, Socials } from '../kit'
import { GPill, Photo, PhoneShot, Swipe } from '../kit2'
import CONTENT from '../../../content.json'

const E = CONTENT.v2.essayGratis

const Sparkle: React.FC<{ x: number; y: number; s: number; color: string }> = ({ x, y, s, color }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ position: 'absolute', left: x, top: y }}>
    <path d="M12 1.5c.8 5.6 3.2 8.4 9.5 10.5-6.3 2.1-8.7 4.9-9.5 10.5-.8-5.6-3.2-8.4-9.5-10.5C8.8 9.9 11.2 7.1 12 1.5z" fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
  </svg>
)

export const EssayGratis: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.1 : 1
  const mid = story ? 560 : 360 // top of the mascot scene
  const sceneH = story ? 600 : 470
  return (
    <AbsoluteFill style={{ background: '#FFFCF2', fontFamily: FONT.body, overflow: 'hidden' }}>
      {/* faded campus photo behind the scene, like the illustrated campus in the reference */}
      <Photo src="classroom.jpg" style={{ position: 'absolute', left: 0, top: mid - 60, width: 1080, height: sceneH + 160, opacity: 0.22, filter: 'grayscale(0.4) sepia(0.4)' }} />
      <div style={{ position: 'absolute', left: 0, top: mid - 60, width: 1080, height: sceneH + 160, background: 'linear-gradient(180deg, #FFFCF2 0%, rgba(255,252,242,0) 25%, rgba(255,252,242,0) 70%, #FFFCF2 100%)' }} />
      <Sparkle x={60} y={story ? 230 : 120} s={70} color="#F5B000" />
      <Sparkle x={950} y={story ? 520 : 330} s={48} color={INK} />
      <svg width={180} height={80} viewBox="0 0 160 80" style={{ position: 'absolute', right: 40, top: story ? 170 : 70 }}><path d="M6 60 C 30 10, 50 10, 62 44 S 96 78, 110 34 S 140 6, 154 20" fill="none" stroke="#FFC233" strokeWidth="8" strokeLinecap="round" /></svg>

      <div style={{ position: 'absolute', left: 0, right: 0, top: story ? 150 : 44, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <LogoLockup h={28 * k} />
        <div style={{ position: 'relative', marginTop: 24 * k }}>
          <div style={{ position: 'absolute', left: -16, right: -16, bottom: 4, height: 34 * k, background: 'linear-gradient(90deg, #FFE45C, #FFB800)', borderRadius: 6 }} />
          <div style={{ position: 'relative', fontFamily: FONT.head, fontWeight: 900, fontSize: 64 * k, color: INK, letterSpacing: '-0.02em' }}>{E.title[0]}</div>
        </div>
        <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 150 * k, lineHeight: 1, letterSpacing: '-0.03em', marginTop: 4, background: 'linear-gradient(180deg, #FFE45C 10%, #FFB000 60%, #F08A00 100%)', WebkitBackgroundClip: 'text', color: 'transparent', WebkitTextStroke: `${5 * k}px ${INK}`, filter: 'drop-shadow(0 8px 0 rgba(17,17,17,0.9))' }}>{E.big}</div>
      </div>

      {/* scene: two mascots + a real phone screenshot as the "sticker" */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: mid + (story ? 40 : 10), height: sceneH }}>
        <Img src={staticFile('posters/maskot-fitur-otbee-ai.png')} style={{ position: 'absolute', left: story ? 40 : 60, bottom: 0, height: sceneH * 0.95, filter: 'drop-shadow(0 18px 24px rgba(80,50,0,0.25))' }} />
        <Img src={staticFile('posters/writing-essay.png')} style={{ position: 'absolute', left: story ? 390 : 400, bottom: -6, height: sceneH * 0.66, filter: 'drop-shadow(0 14px 20px rgba(80,50,0,0.25))' }} />
        <PhoneShot src="p-essay.jpg" w={story ? 250 : 210} y={90} rot={8} style={{ position: 'absolute', right: story ? 60 : 70, top: story ? -10 : -30 }} />
        <div style={{ position: 'absolute', right: story ? 30 : 36, bottom: story ? 30 : 0, padding: `${10 * k}px ${18 * k}px`, borderRadius: 16, background: INK, color: C.accent, fontWeight: 900, fontSize: 20 * k, transform: 'rotate(-5deg)', boxShadow: '0 10px 20px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="essay" size={22 * k} color={C.accent} />{E.sticker}
        </div>
      </div>

      <div style={{ position: 'absolute', left: 60, right: 60, top: mid + sceneH + (story ? 80 : 30), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 * k }}>
        <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 30 * k, lineHeight: 1.25, color: INK, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '-0.005em' }}>{E.statement}</div>
        <GPill size={25 * k} style={{ width: '100%' }}>{E.pill}</GPill>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {E.jalur.map(j => <div key={j} style={{ padding: `${7 * k}px ${16 * k}px`, borderRadius: 999, background: '#fff', border: `2.5px solid ${INK}`, fontWeight: 800, fontSize: 19 * k, color: INK }}>{j}</div>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 * k, padding: `${15 * k}px ${36 * k}px`, borderRadius: 999, background: INK, color: C.accent, fontFamily: FONT.head, fontWeight: 900, fontSize: 30 * k }}>Coba di {E.cta}<Icon name="arrow" size={30 * k} color={C.accent} /></div>
      </div>

      <div style={{ position: 'absolute', left: 60, right: 60, bottom: story ? 210 : 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ padding: '10px 22px', borderRadius: 999, background: '#fff', boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}><Socials size={16 * k} /></div>
        <Swipe size={20 * k} />
      </div>
    </AbsoluteFill>
  )
}
