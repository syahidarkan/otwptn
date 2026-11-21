import React from 'react'
import { AbsoluteFill, Img, staticFile } from 'remotion'
import { BTN_GRAD, Chip, Phone, SHADOW_SM, Spark, YELLOW_GRAD } from '../ui/kit'
import { C, CREAM, Card, FONT, Hex, INK, Icon, Mascot, Pill, SUN, SocialFooter, Wordmark } from './kit'
import CONTENT from '../../content.json'

const B = CONTENT.brandIntro
type Box = { x: number; y: number; w: number; h: number }
export type PosterLayout = 'feed' | 'story'

// ---------------------------------------------------------------- blocks
const Hero: React.FC<{ b: Box; story: boolean }> = ({ b, story }) => {
  const hs = story ? 112 : 80
  return (
    <Card {...b} bg={SUN}>
      <Hex w={b.w} h={b.h} r={46} opacity={0.18} />
      <div style={{ position: 'absolute', right: -60, top: -90, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.75), rgba(255,255,255,0) 70%)' }} />
      <div style={{ position: 'absolute', left: 44, top: story ? 60 : 52 }}>
        <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: hs, lineHeight: 0.98, letterSpacing: '-0.045em', color: INK }}>
          {B.headline.map(l => <div key={l}>{l}</div>)}
        </div>
        <div style={{ display: 'inline-block', marginTop: hs * 0.32, padding: `${hs * 0.1}px ${hs * 0.26}px ${hs * 0.13}px`, borderRadius: hs * 0.26, background: INK, color: C.accent, fontFamily: FONT.head, fontWeight: 900, fontSize: hs * 0.56, letterSpacing: '-0.03em', transform: 'rotate(-2.5deg)', transformOrigin: 'left center' }}>
          {B.headlineAccent}
        </div>
      </div>
      <Mascot name="map-pointing" x={b.w - (story ? 430 : 268)} y={b.h - (story ? 470 : 318)} h={story ? 520 : 340} />
    </Card>
  )
}

const Brand: React.FC<{ b: Box; story: boolean }> = ({ b, story }) => (
  <Card {...b} bg="#fff">
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 28, padding: '0 36px' }}>
      <Img src={staticFile('posters/favicon.png')} style={{ height: b.h - 40, display: 'block', flexShrink: 0 }} />
      <div>
        <Wordmark h={story ? 64 : 62} />
        <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: story ? 26 : 23, color: C.muted, marginTop: 12 }}>{B.tagline}</div>
      </div>
    </div>
  </Card>
)

const Jalur: React.FC<{ b: Box; story: boolean }> = ({ b, story }) => (
  <Card {...b} bg="#fff">
    <div style={{ position: 'absolute', inset: 0, padding: story ? 32 : 28, display: 'flex', flexDirection: 'column', gap: story ? 20 : 16 }}>
      <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: story ? 34 : 25, lineHeight: 1.1, letterSpacing: '-0.02em', color: INK }}>{B.jalurTitle}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {B.jalur.map(j => <Pill key={j} size={story ? 21 : 16} bg="#FFF4BF" fg={C.amberInk}>{j}</Pill>)}
      </div>
      <div style={{ flex: 1 }} />
      <Pill size={story ? 27 : 21} bg={INK} fg={C.accent} style={{ justifyContent: 'space-between', alignSelf: 'stretch', padding: story ? '16px 26px' : '12px 22px' }}>
        {CONTENT.site.toUpperCase()}<Icon name="arrow" size={story ? 30 : 27} color={C.accent} />
      </Pill>
    </div>
  </Card>
)

const Features: React.FC<{ b: Box; story: boolean }> = ({ b, story }) => {
  const row = story ? 46 : 50
  return (
    <Card {...b} bg={INK}>
      <Hex w={b.w} h={b.h} r={38} color="#FFD400" opacity={0.07} />
      <div style={{ position: 'absolute', inset: 0, padding: '30px 30px' }}>
        <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: story ? 44 : 50, lineHeight: 0.98, letterSpacing: '-0.035em', color: '#fff' }}>
          {B.featuresTitle[0]} <span style={{ color: C.accent }}>{B.featuresTitle[1]}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: story ? 20 : 22 }}>
          {B.features.map((f, i) => (
            <div key={f.name} style={{ height: row, borderRadius: row / 2, background: i % 2 ? 'rgba(255,255,255,0.07)' : 'rgba(255,212,0,0.12)', display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 6 }}>
              <div style={{ width: row - 12, height: row - 12, borderRadius: '50%', background: BTN_GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={f.icon} size={row * 0.48} color={INK} />
              </div>
              <div style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: story ? 23 : 22, color: '#fff' }}>{f.name}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

const JALUR = [
  { name: 'PPKB UI', org: 'Universitas Indonesia', done: 4, of: 6 },
  { name: 'SNBP 2027', org: 'Seleksi Nasional Berbasis Prestasi', done: 3, of: 5 },
  { name: 'IUP UGM', org: 'Universitas Gadjah Mada', done: 2, of: 5 },
]
const PhoneScreen: React.FC = () => (
  <Phone w={460} h={940}>
    <div style={{ position: 'absolute', left: 22, right: 22, top: 64, height: 162, borderRadius: 26, background: YELLOW_GRAD, overflow: 'hidden', padding: '18px 22px' }}>
      <Chip size={14} bg="rgba(255,255,255,0.75)" fg={C.amberInk} icon={<Spark size={12} />}>Roadmap Seleksi</Chip>
      <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 31, marginTop: 12, color: INK, letterSpacing: '-0.02em' }}>Tracking Jalur</div>
      <div style={{ fontSize: 14.5, fontWeight: 600, color: '#3b3215', marginTop: 4 }}>Pantau tahapan seleksi & berkas</div>
    </div>
    <div style={{ position: 'absolute', left: 26, top: 246, fontFamily: FONT.head, fontWeight: 800, fontSize: 19, color: INK }}>Jalur yang Diikuti</div>
    {JALUR.map((j, i) => (
      <div key={j.name} style={{ position: 'absolute', left: 22, right: 22, top: 290 + i * 148, height: 128, borderRadius: 22, background: '#fff', boxShadow: i === 0 ? `0 0 0 2.5px ${C.accent}, ${SHADOW_SM}` : SHADOW_SM, padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 21, color: INK }}>{j.name}</div>
          <Chip size={11} bg={C.greenSoft} fg={C.green}>Non-tes</Chip>
        </div>
        <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, marginTop: 3 }}>{j.org}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
          <div style={{ flex: 1, height: 9, borderRadius: 9, background: '#F0EFEA', overflow: 'hidden' }}>
            <div style={{ width: `${(j.done / j.of) * 100}%`, height: '100%', borderRadius: 9, background: BTN_GRAD }} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: INK }}>{j.done}/{j.of}</div>
        </div>
      </div>
    ))}
  </Phone>
)

const Peek: React.FC<{ b: Box }> = ({ b }) => (
  <Card {...b} bg={INK}>
    <div style={{ position: 'absolute', left: 30, top: 30, fontFamily: FONT.head, fontWeight: 900, fontSize: 44, lineHeight: 1, letterSpacing: '-0.035em', color: '#fff' }}>
      {B.peekTitle[0]}<br /><span style={{ color: C.accent }}>{B.peekTitle[1]}</span>
    </div>
    <svg width="70" height="70" viewBox="0 0 24 24" style={{ position: 'absolute', right: 26, top: 120 }}>
      <path d="M12 2c.6 4.8 2.2 6.6 7 7.2-4.8.6-6.4 2.4-7 7.2-.6-4.8-2.2-6.6-7-7.2 4.8-.6 6.4-2.4 7-7.2z" fill={C.accent} />
    </svg>
    <div style={{ position: 'absolute', left: 34, top: 172, transform: 'scale(0.6) rotate(-6deg)', transformOrigin: '0 0' }}>
      <PhoneScreen />
    </div>
  </Card>
)

const Price: React.FC<{ label: string; price: string; items: string[]; premium?: boolean; badge?: string; w: number; h: number; story: boolean }> = ({ label, price, items, premium, badge, w, h, story }) => {
  const big = story ? 96 : 86
  return (
    <div style={{ position: 'relative', width: w, height: h, borderRadius: 34, background: premium ? '#fff' : 'rgba(255,255,255,0.92)', boxShadow: premium ? `0 0 0 6px ${C.accent}, 0 26px 50px rgba(120,80,0,0.25)` : '0 14px 30px rgba(80,60,0,0.10)', padding: story ? '26px 26px' : '30px 28px', fontFamily: FONT.body }}>
      {badge && <div style={{ position: 'absolute', right: 20, top: -22, padding: '9px 18px', borderRadius: 999, background: 'linear-gradient(135deg, #FF7A2F, #F04438)', color: '#fff', fontWeight: 900, fontSize: 17, letterSpacing: '0.08em', transform: 'rotate(3deg)', boxShadow: '0 8px 18px rgba(240,68,56,0.35)' }}>{badge}</div>}
      <div style={{ fontWeight: 800, fontSize: story ? 22 : 21, color: premium ? C.amberInk : C.muted, letterSpacing: '0.02em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 4, fontFamily: FONT.head, color: premium ? INK : '#2563EB' }}>
        <span style={{ fontWeight: 800, fontSize: big * 0.3, marginTop: big * 0.2, marginRight: 6 }}>Rp</span>
        <span style={{ fontWeight: 900, fontSize: big, lineHeight: 1, letterSpacing: '-0.05em', ...(premium ? { background: 'linear-gradient(180deg, #FFB800, #F07C00)', WebkitBackgroundClip: 'text', color: 'transparent' } : {}) }}>{price}</span>
        <span style={{ fontWeight: 800, fontSize: big * 0.26, alignSelf: 'flex-end', marginBottom: big * 0.12, marginLeft: 6, color: INK }}>/bulan</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: story ? 8 : 9, marginTop: story ? 12 : 16 }}>
        {items.map(it => (
          <div key={it} style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: story ? 19 : premium ? 17 : 16, color: premium ? INK : '#4B5563' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: premium ? C.green : '#D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="check" size={15} color="#fff" />
            </div>
            {it}
          </div>
        ))}
      </div>
    </div>
  )
}

const Pricing: React.FC<{ b: Box; story: boolean }> = ({ b, story }) => {
  const fw = story ? 452 : 284, pw = story ? 484 : 340
  return (
    <Card {...b} bg="linear-gradient(160deg, #FFF3B0, #FFE27A)">
      <Hex w={b.w} h={b.h} r={40} opacity={0.12} />
      <div style={{ position: 'absolute', left: 22, top: story ? 26 : 40, transform: 'rotate(-1.5deg)' }}>
        <Price {...B.free} w={fw} h={b.h - (story ? 56 : 90)} story={story} />
      </div>
      <div style={{ position: 'absolute', right: 22, top: story ? 26 : 26, transform: 'rotate(1.5deg)' }}>
        <Price {...B.premium} premium w={pw} h={b.h - (story ? 50 : 52)} story={story} />
      </div>
    </Card>
  )
}

const Footer: React.FC<{ b: Box }> = ({ b }) => <SocialFooter {...b} lead={B.footerLead} />
const CARD_SHADOW_SM = '0 10px 24px rgba(200,120,0,0.25)'

// ---------------------------------------------------------------- layouts
export const BrandIntro: React.FC<{ layout: PosterLayout }> = ({ layout }) => {
  const story = layout === 'story'
  return (
    <AbsoluteFill style={{ background: CREAM, fontFamily: FONT.body }}>
      <Hex w={1080} h={story ? 1920 : 1350} r={56} opacity={0.06} />
      {story ? (
        <>
          <Hero b={{ x: 40, y: 130, w: 1000, h: 520 }} story />
          <Brand b={{ x: 40, y: 670, w: 1000, h: 140 }} story />
          <Features b={{ x: 40, y: 830, w: 520, h: 400 }} story />
          <Jalur b={{ x: 580, y: 830, w: 460, h: 400 }} story />
          <Pricing b={{ x: 40, y: 1250, w: 1000, h: 380 }} story />
          <Footer b={{ x: 40, y: 1650, w: 1000, h: 72 }} />
        </>
      ) : (
        <>
          <Hero b={{ x: 40, y: 40, w: 620, h: 520 }} story={false} />
          <Jalur b={{ x: 680, y: 40, w: 360, h: 272 }} story={false} />
          <Features b={{ x: 680, y: 332, w: 360, h: 418 }} story={false} />
          <Brand b={{ x: 40, y: 580, w: 620, h: 170 }} story={false} />
          <Peek b={{ x: 40, y: 770, w: 300, h: 460 }} />
          <Pricing b={{ x: 360, y: 770, w: 680, h: 460 }} story={false} />
          <Footer b={{ x: 40, y: 1250, w: 1000, h: 66 }} />
        </>
      )}
    </AbsoluteFill>
  )
}
