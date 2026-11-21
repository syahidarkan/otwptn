// Fitur 04 - Otbee AI. Own concept: a 2 a.m. phone lockscreen; Otbee's replies arrive as notifications.
import React from 'react'
import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion'
import { rng } from '../../anim'
import { C, FONT, INK, Icon, LogoLockup, Mascot, Socials } from '../kit'
import CONTENT from '../../../content.json'

const O = CONTENT.fitur.otbee

const Stars: React.FC<{ h: number }> = ({ h }) => {
  const r = rng(42)
  return (
    <svg width={1080} height={h} style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: 90 }, (_, i) => <circle key={i} cx={r() * 1080} cy={r() * h * 0.75} r={0.8 + r() * 2.2} fill="#fff" opacity={0.25 + r() * 0.6} />)}
    </svg>
  )
}

const Notif: React.FC<{ k: number; meta?: string; children: React.ReactNode }> = ({ k, meta, children }) => (
  <div style={{ width: '100%', padding: `${22 * k}px ${26 * k}px`, borderRadius: 34 * k, background: 'rgba(48,42,24,0.95)', border: '1.5px solid rgba(255,212,0,0.22)', boxShadow: '0 20px 40px rgba(0,0,0,0.25)', display: 'flex', gap: 20 * k }}>
    <div style={{ width: 70 * k, height: 70 * k, borderRadius: 18 * k, background: C.accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <Img src={staticFile('posters/favicon.png')} style={{ height: 62 * k }} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontWeight: 800, fontSize: 25 * k, color: '#fff' }}>{O.name}</div>
        <div style={{ fontWeight: 600, fontSize: 20 * k, color: 'rgba(255,255,255,0.6)' }}>sekarang</div>
      </div>
      {meta && <div style={{ fontWeight: 600, fontSize: 19 * k, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{meta}</div>}
      <div style={{ fontWeight: 600, fontSize: 24 * k, color: '#fff', marginTop: 6 * k, lineHeight: 1.4 }}>{children}</div>
    </div>
  </div>
)

export const OtbeeAI: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.18 : 1.04
  const steps = O.notifs[2].text.split(/\s{2,}/)
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #0B0A07 0%, #17140C 55%, #2A2312 100%)', fontFamily: FONT.body, overflow: 'hidden' }}>
      <Stars h={height} />
      {/* moon */}
      <div style={{ position: 'absolute', right: 90, top: story ? 170 : 70, width: 120, height: 120, borderRadius: '50%', background: '#FFF4C2', boxShadow: '0 0 80px rgba(255,236,150,0.55)' }}>
        <div style={{ position: 'absolute', left: 34, top: -12, width: 120, height: 120, borderRadius: '50%', background: '#0E0C08' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, padding: story ? '150px 60px 220px' : '52px 60px 46px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 26 * k, color: 'rgba(255,255,255,0.75)' }}>{O.date}</div>
        <div style={{ fontFamily: FONT.head, fontWeight: 600, fontSize: 230 * k, lineHeight: 1, color: '#fff', letterSpacing: '-0.03em', marginTop: 4 }}>{O.time}</div>

        {story && <div style={{ flex: 1 }} />}
        <div style={{ width: '100%', marginTop: 30 * k, display: 'flex', flexDirection: 'column', gap: 16 * k }}>
          <Notif k={k} meta={`Membalas: "${O.notifs[0].text.split('?')[0]}?"`}>{O.notifs[1].text}</Notif>
          <Notif k={k}>
            {steps.map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <Icon name="check" size={22 * k} color={C.accent} />{s.replace(/^\d\.\s*/, '')}
              </div>
            ))}
          </Notif>
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 66 * k, lineHeight: 1.02, letterSpacing: '-0.035em', color: '#fff' }}>{O.headline[0]}</div>
            <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 66 * k, lineHeight: 1.02, letterSpacing: '-0.035em', color: C.accent, marginTop: 4 }}>{O.headline[1]}</div>
            <div style={{ fontWeight: 600, fontSize: 25 * k, color: 'rgba(255,255,255,0.78)', marginTop: 16 * k, lineHeight: 1.4 }}>{O.sub}</div>
          </div>
          <div style={{ position: 'relative', width: 250 * k, height: 300 * k, flexShrink: 0 }}>
            <Mascot name="headset-wave" x={0} y={0} h={300 * k} />
          </div>
        </div>
        {story && <div style={{ flex: 1 }} />}
        <div style={{ width: '100%', marginTop: 30 * k, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: `${16 * k}px ${30 * k}px`, borderRadius: 999, background: C.accent, fontFamily: FONT.head, fontWeight: 800, fontSize: 30 * k, color: INK }}>
            Tanya Otbee di {CONTENT.site}<Icon name="arrow" size={30 * k} color={INK} />
          </div>
          <LogoLockup h={28 * k} white />
        </div>
        <Socials size={19 * k} color="rgba(255,255,255,0.85)" style={{ marginTop: 22 * k }} />
      </div>
    </AbsoluteFill>
  )
}
