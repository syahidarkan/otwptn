// Pricelist paket. Model: Pahamify "#SikatSampaiDapat" / "Flash Sale 11.11" and the "Harga Tiket Try Out" posters:
// mascot flying in over a huge outlined title, a 2x2 grid of package cards (name tab, big price box, tag line underneath),
// grass at the bottom, payment-method strip. Real prices from src/lib/pricing.ts, normal prices only (no fake discount).
import React from 'react'
import { AbsoluteFill, Img, staticFile, useVideoConfig } from 'remotion'
import { C, FONT, INK, Icon, LogoLockup, Socials } from '../kit'
import CONTENT from '../../../content.json'

const P = CONTENT.v2.pricelist
const WEEKLY: Record<string, string> = { 'Akun Premium': 'Rp7.250', Nectar: 'Rp14.800', Honeycomb: 'Rp17.900', 'Royal Jelly': 'Rp26.800' }

const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 300 * s, height: 120 * s }}>
    {[[0, 50, 120], [70, 10, 150], [160, 30, 130], [40, 60, 220]].map(([l, t, d], i) => (
      <div key={i} style={{ position: 'absolute', left: l * s, top: t * s, width: d * s, height: (i === 3 ? 70 : d) * s, borderRadius: 999, background: 'rgba(255,255,255,0.85)' }} />
    ))}
  </div>
)

const Pack: React.FC<{ r: (typeof P.rows)[number]; k: number; hot?: boolean }> = ({ r, k, hot }) => (
  <div style={{ position: 'relative' }}>
    {r.tag && (
      <div style={{ position: 'absolute', right: -10, top: -26 * k, zIndex: 2, padding: `${7 * k}px ${14 * k}px`, borderRadius: 12, background: hot ? '#E5484D' : INK, color: hot ? '#fff' : C.accent, fontWeight: 900, fontSize: 15 * k, transform: 'rotate(6deg)', boxShadow: '0 6px 14px rgba(0,0,0,0.25)', whiteSpace: 'nowrap' }}>{r.tag}</div>
    )}
    <div style={{ borderRadius: 22, background: '#fff', border: `${4 * k}px solid ${hot ? C.amberDeep : INK}`, boxShadow: `0 ${7 * k}px 0 ${hot ? C.amberDeep : INK}`, overflow: 'hidden' }}>
      <div style={{ padding: `${12 * k}px ${16 * k}px`, background: hot ? C.accent : INK, color: hot ? INK : '#fff', textAlign: 'center', fontFamily: FONT.head, fontWeight: 900, fontSize: 28 * k, letterSpacing: '-0.01em' }}>{r.n}</div>
      <div style={{ padding: `${14 * k}px ${16 * k}px ${16 * k}px` }}>
        <div style={{ borderRadius: 16, background: hot ? INK : '#FFF3C4', padding: `${8 * k}px 0 ${10 * k}px`, textAlign: 'center', fontFamily: FONT.head, color: hot ? C.accent : INK }}>
          <span style={{ fontWeight: 800, fontSize: 26 * k, verticalAlign: 'top', marginRight: 4 }}>Rp</span>
          <span style={{ fontWeight: 900, fontSize: 64 * k, letterSpacing: '-0.04em', lineHeight: 1 }}>{r.p.replace('rb', '.000')}</span>
        </div>
        <div style={{ marginTop: 10 * k, fontWeight: 700, fontSize: 17 * k, lineHeight: 1.35, color: '#4A4130', textAlign: 'center', minHeight: 46 * k }}>{r.d}</div>
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 * k }}>
      <div style={{ padding: `${5 * k}px ${12 * k}px`, borderRadius: 999, background: '#E5484D', color: '#fff', fontWeight: 800, fontSize: 15 * k }}>{r.per === '/bulan' ? 'per bulan' : `berlaku ${r.per}`}</div>
      <div style={{ padding: `${5 * k}px ${12 * k}px`, borderRadius: 999, background: INK, color: C.accent, fontWeight: 800, fontSize: 15 * k }}>setara {WEEKLY[r.n]}/minggu</div>
    </div>
  </div>
)

export const Pricelist: React.FC = () => {
  const { height } = useVideoConfig()
  const story = height > 1500
  const k = story ? 1.12 : 1
  const top = story ? 140 : 36
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #FFE45C 0%, #FFD21F 45%, #FFC93C 100%)', fontFamily: FONT.body, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: '50%', top: top + 230, width: 2200, height: 2200, marginLeft: -1100, marginTop: -1100, background: 'repeating-conic-gradient(rgba(255,255,255,0.28) 0deg 6deg, rgba(255,255,255,0) 6deg 16deg)', WebkitMaskImage: 'radial-gradient(circle, #000 8%, transparent 45%)' }} />
      <Cloud x={-80} y={top + 120} s={0.9} />
      <Cloud x={820} y={top + 250} s={0.8} />
      <Img src={staticFile('posters/grass.png')} style={{ position: 'absolute', left: 0, bottom: 0, width: 1080, height: story ? 460 : 300, objectFit: 'cover', objectPosition: 'top', WebkitMaskImage: 'linear-gradient(transparent 0%, #000 25%)' }} />

      {/* header */}
      <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', padding: '0 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ padding: '10px 22px', borderRadius: 999, background: '#fff' }}><LogoLockup h={26 * k} /></div>
          <div style={{ padding: `${8 * k}px ${18 * k}px`, borderRadius: 14, background: INK, color: '#fff', textAlign: 'center', fontWeight: 800, fontSize: 15 * k, lineHeight: 1.2 }}>SEMUA PAKET MENTOR<br /><span style={{ color: C.accent, fontSize: 18 * k }}>+ AKUN PREMIUM</span></div>
        </div>
        <Img src={staticFile('posters/upgrade-paket.png')} style={{ height: story ? 230 : 170, marginTop: story ? 10 : -10, filter: 'drop-shadow(0 16px 20px rgba(90,60,0,0.3))' }} />
        <div style={{ marginTop: -18 * k, textAlign: 'center', fontFamily: FONT.head, fontWeight: 900, lineHeight: 0.88, letterSpacing: '-0.03em' }}>
          <div style={{ fontSize: 50 * k, color: INK }}>PRICELIST</div>
          <div style={{ fontSize: 112, color: '#fff', WebkitTextStroke: `${11 * k}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${9 * k}px 0 ${INK}` }}>PAKET OTWPTN</div>
        </div>
      </div>

      {/* 2x2 package grid */}
      <div style={{ position: 'absolute', left: 50, right: 50, top: story ? 720 : 470, display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 30, rowGap: story ? 80 : 46 }}>
        {P.rows.map((r, i) => <Pack key={r.n} r={r} k={k} hot={i === 2} />)}
      </div>

      {/* footer */}
      <div style={{ position: 'absolute', left: 50, right: 50, bottom: story ? 200 : 30, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 17 * k, color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>{P.note}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: `${14 * k}px ${32 * k}px`, borderRadius: 999, background: C.accent, border: `4px solid ${INK}`, color: INK, fontFamily: FONT.head, fontWeight: 900, fontSize: 27 * k, boxShadow: `5px 5px 0 ${INK}` }}>Pilih paketmu di otwptn.com/upgrade<Icon name="arrow" size={27 * k} color={INK} /></div>
        <div style={{ width: '100%', padding: `${10 * k}px ${18 * k}px`, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['QRIS', 'GoPay', 'OVO', 'DANA', 'Virtual Account'].map(m => <div key={m} style={{ padding: `${4 * k}px ${10 * k}px`, borderRadius: 8, border: '2px solid #E5E1D3', fontWeight: 900, fontSize: 14 * k, color: INK }}>{m}</div>)}
          </div>
          <Socials size={14 * k} />
        </div>
      </div>
    </AbsoluteFill>
  )
}
