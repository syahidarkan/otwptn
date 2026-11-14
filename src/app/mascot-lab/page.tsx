'use client'

import { useRef, useState } from 'react'
import { OtbeeAvatar, ALL_VIEWS, CLIPS } from '@/components/mascot/otbee'
import type { ClipName, OtbeeHandle, ViewName } from '@/components/mascot/otbee'

const VIEW_LABEL: Record<ViewName, string> = {
  front: 'Depan', threeQuarter: '3/4 Depan', right: 'Kanan', left: 'Kiri', back: 'Belakang', top: 'Atas', bottom: 'Bawah',
}
const CLIP_NAMES = Object.keys(CLIPS) as ClipName[]

export default function MascotLab() {
  const [view, setView] = useState<ViewName>('front')
  const [action, setAction] = useState<ClipName>('idle')
  const [follow, setFollow] = useState(true)
  const [headOnly, setHeadOnly] = useState(false)
  const ref = useRef<OtbeeHandle>(null)

  const play = (n: ClipName) => {
    setAction(n)
    ref.current?.play(n, { onDone: () => ref.current?.play('idle') })
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#fff8dc,#ffeeb0)', padding: 24, fontFamily: 'var(--font-sans), system-ui' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Otbee Lab - rig maskot 2D vektor</h1>
      <p style={{ margin: '4px 0 16px', opacity: 0.7 }}>
        Semua bentuk = trace vektor dari <code>Maskot/2d all pov.png</code>. Pilih sudut pandang &amp; aksi.
      </p>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 10px 40px rgba(0,0,0,.08)', minWidth: 420, display: 'grid', placeItems: 'center', minHeight: 560 }}>
          <OtbeeAvatar ref={ref} key={`${headOnly}`} view={view} action={action} size={headOnly ? 300 : 460} followPointer={follow} headOnly={headOnly} />
        </div>

        <div style={{ flex: 1, minWidth: 300, maxWidth: 560 }}>
          <h3 style={{ fontWeight: 700 }}>Sudut pandang</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ALL_VIEWS.map(v => (
              <button key={v} onClick={() => setView(v)} style={btn(view === v)}>{VIEW_LABEL[v]}</button>
            ))}
          </div>
          <h3 style={{ fontWeight: 700, marginTop: 20 }}>Aksi / animasi</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CLIP_NAMES.map(n => (
              <button key={n} onClick={() => play(n)} style={btn(action === n)}>{n}</button>
            ))}
          </div>
          <h3 style={{ fontWeight: 700, marginTop: 20 }}>Efek partikel</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(['sparkle', 'stars', 'heart', 'zzz', 'question', 'exclaim', 'note', 'sweat', 'confetti', 'bulb', 'dust'] as const).map(f => (
              <button key={f} onClick={() => ref.current?.fx(f, 1)} style={btn(false)}>{f}</button>
            ))}
          </div>
          <label style={{ display: 'block', marginTop: 20 }}>
            <input type="checkbox" checked={follow} onChange={e => setFollow(e.target.checked)} /> Mata &amp; kepala mengikuti kursor
          </label>
          <label style={{ display: 'block', marginTop: 8 }}>
            <input type="checkbox" checked={headOnly} onChange={e => setHeadOnly(e.target.checked)} /> Mode kepala saja (ikon chatbot)
          </label>
        </div>
      </div>

      <h3 style={{ fontWeight: 700, margin: '28px 0 8px' }}>Semua sudut pandang</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
        {ALL_VIEWS.map(v => (
          <div key={v} style={{ textAlign: 'center' }}>
            <OtbeeAvatar view={v} size={190} />
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6 }}>{VIEW_LABEL[v]}</div>
          </div>
        ))}
      </div>
    </main>
  )
}

function btn(active: boolean): React.CSSProperties {
  return {
    padding: '8px 14px', borderRadius: 999, border: '1px solid ' + (active ? '#d89a00' : '#e5d9a8'),
    background: active ? '#ffc933' : '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13,
  }
}
