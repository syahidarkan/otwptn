// 07 - Harga. Photo + floating app mockups (images-3 / "investasi terkecil" style), otwptn colours.
import React from 'react'
import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion'
import { C, FONT, INK, Icon, LogoLockup, Mascot, Socials } from './kit'
import { ChatScreen, EssayScreen, KalkulatorScreen } from './screens'
import CONTENT from '../../content.json'

const H = CONTENT.harga
const CREAM = '#FFF8E4'

const PhoneAt: React.FC<{ S: React.FC; x: number; y: number; s: number; r: number }> = ({ S, x, y, s, r }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 460 * s, height: 940 * s, transform: `rotate(${r}deg)`, filter: 'drop-shadow(0 30px 40px rgba(60,40,0,0.35))' }}>
    <div style={{ transform: `scale(${s})`, transformOrigin: '0 0', width: 460, height: 940 }}><S /></div>
  </div>
)

const PriceSticker: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ padding: `${18 * k}px ${30 * k}px ${16 * k}px`, borderRadius: 30 * k, background: C.accent, border: `${5 * k}px solid ${INK}`, boxShadow: `${8 * k}px ${8 * k}px 0 ${INK}`, transform: 'rotate(-4deg)', display: 'inline-block' }}>
    <div style={{ fontWeight: 800, fontSize: 22 * k, color: INK }}>{H.plan}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', fontFamily: FONT.head, color: INK }}>
      <span style={{ fontWeight: 800, fontSize: 40 * k, marginRight: 6 }}>Rp</span>
      <span style={{ fontWeight: 900, fontSize: 118 * k, lineHeight: 0.95, letterSpacing: '-0.05em' }}>{H.price}</span>
      <span style={{ fontWeight: 800, fontSize: 32 * k, marginLeft: 6 }}>/bulan</span>
    </div>
  </div>
)

const Headline: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 76 * k, lineHeight: 1.02, letterSpacing: '-0.045em', color: INK, whiteSpace: 'nowrap' }}>
    <div>{H.headline[0]}</div>
    <div>{H.headline[1]}</div>
    <div style={{ position: 'relative', display: 'inline-block', marginTop: 4 }}>
      <div style={{ position: 'absolute', left: -10, right: -10, bottom: 6 * k, height: 34 * k, borderRadius: 8, background: C.accent }} />
      <span style={{ position: 'relative' }}>{H.headline[2]}</span>
    </div>
  </div>
)

const Unlocks: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 * k }}>
    {H.unlocks.map(u => (
      <div key={u} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: `${9 * k}px ${16 * k}px`, borderRadius: 999, background: '#fff', boxShadow: '0 6px 16px rgba(80,60,0,0.10)', fontWeight: 800, fontSize: 20 * k, color: INK }}>
        <Icon name="check" size={18 * k} color={C.green} />{u}
      </div>
    ))}
  </div>
)

export const Harga: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  if (story) {
    const k = 1.08
    return (
      <AbsoluteFill style={{ background: CREAM, fontFamily: FONT.body, overflow: 'hidden' }}>
        {/* photo fills the top, fading into cream */}
        <Img src={staticFile('posters/photo-student.jpg')} style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1080, objectFit: 'cover', objectPosition: '50% 32%' }} />
        <div style={{ position: 'absolute', left: 0, top: 640, width: 1080, height: 460, background: `linear-gradient(180deg, rgba(255,248,228,0) 0%, ${CREAM} 85%)` }} />
        <div style={{ position: 'absolute', left: 60, top: 150, padding: '12px 24px', borderRadius: 999, background: 'rgba(255,255,255,0.92)' }}><LogoLockup h={28} /></div>
        <div style={{ position: 'absolute', right: 50, top: 470 }}><PriceSticker k={k} /></div>
        <div style={{ position: 'absolute', left: 64, right: 64, top: 820, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Headline k={k} />
          <div style={{ fontWeight: 700, fontSize: 28, lineHeight: 1.45, color: '#3B300B', maxWidth: 900 }}>{H.sub}</div>
          <Unlocks k={k} />
        </div>
        <PhoneAt S={KalkulatorScreen} x={30} y={1410} s={0.56} r={-8} />
        <PhoneAt S={EssayScreen} x={660} y={1420} s={0.56} r={7} />
        <Mascot name="coin-bag" x={420} y={1380} h={220} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1612, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 38px', borderRadius: 999, background: INK, color: C.accent, fontFamily: FONT.head, fontWeight: 800, fontSize: 32, boxShadow: '0 12px 30px rgba(0,0,0,0.25)' }}>{H.cta}<Icon name="arrow" size={30} color={C.accent} /></div>
          <div style={{ padding: '10px 26px', borderRadius: 999, background: '#fff', boxShadow: '0 10px 24px rgba(0,0,0,0.15)' }}><Socials size={19} /></div>
        </div>
      </AbsoluteFill>
    )
  }
  const k = 1
  return (
    <AbsoluteFill style={{ background: CREAM, fontFamily: FONT.body, overflow: 'hidden' }}>
      {/* photo on the right, fading into cream on the left */}
      <Img src={staticFile('posters/photo-student.jpg')} style={{ position: 'absolute', right: 0, top: 0, width: 640, height: 960, objectFit: 'cover', objectPosition: '45% 30%' }} />
      <div style={{ position: 'absolute', left: 440, top: 0, width: 260, height: 960, background: `linear-gradient(90deg, ${CREAM} 0%, rgba(255,248,228,0) 100%)` }} />
      <div style={{ position: 'absolute', left: 440, top: 760, width: 640, height: 220, background: `linear-gradient(180deg, rgba(255,248,228,0) 0%, ${CREAM} 90%)` }} />

      <div style={{ position: 'absolute', left: 64, top: 58, width: 560, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <LogoLockup h={30} />
        <Headline k={k} />
        <div style={{ fontWeight: 700, fontSize: 25, lineHeight: 1.45, color: '#3B300B', maxWidth: 470 }}>{H.sub}</div>
      </div>
      <div style={{ position: 'absolute', right: 46, top: 560 }}><PriceSticker k={0.86} /></div>
      <div style={{ position: 'absolute', left: 64, top: 640, width: 520 }}><Unlocks k={0.95} /></div>
      <div style={{ position: 'absolute', left: 64, top: 790, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 34px', borderRadius: 999, background: INK, color: C.accent, fontFamily: FONT.head, fontWeight: 800, fontSize: 30 }}>{H.cta}<Icon name="arrow" size={28} color={C.accent} /></div>
      <div style={{ position: 'absolute', left: 64, top: 880, fontWeight: 700, fontSize: 21, color: C.muted }}>{H.mentorLine}</div>
      <Mascot name="coin-bag" x={610} y={735} h={190} />

      {/* floating app screens, cut by the bottom edge */}
      <PhoneAt S={KalkulatorScreen} x={60} y={960} s={0.5} r={-7} />
      <PhoneAt S={ChatScreen} x={400} y={990} s={0.5} r={2} />
      <PhoneAt S={EssayScreen} x={740} y={960} s={0.5} r={8} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center' }}>
        <div style={{ padding: '12px 30px', borderRadius: 999, background: '#fff', boxShadow: '0 10px 24px rgba(0,0,0,0.15)' }}><Socials size={20} /></div>
      </div>
    </AbsoluteFill>
  )
}
