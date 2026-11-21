import React from 'react'
import { Img, staticFile } from 'remotion'
import { BTN_GRAD, Chip, Phone, SHADOW_SM, Spark, YELLOW_GRAD } from '../ui/kit'
import { C, FONT, INK, Icon } from './kit'

// Example app screens (460 x 940 phone). Values inside are sample UI data, not claims.

const Header: React.FC<{ chip: string; title: string; sub: string }> = ({ chip, title, sub }) => (
  <div style={{ position: 'absolute', left: 22, right: 22, top: 64, height: 150, borderRadius: 26, background: YELLOW_GRAD, overflow: 'hidden', padding: '18px 22px' }}>
    <Chip size={14} bg="rgba(255,255,255,0.75)" fg={C.amberInk} icon={<Spark size={12} />}>{chip}</Chip>
    <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 30, marginTop: 12, color: INK, letterSpacing: '-0.02em' }}>{title}</div>
    <div style={{ fontSize: 14.5, fontWeight: 600, color: '#3b3215', marginTop: 4 }}>{sub}</div>
  </div>
)
const Bar: React.FC<{ v: number; color?: string }> = ({ v, color }) => (
  <div style={{ flex: 1, height: 9, borderRadius: 9, background: '#F0EFEA', overflow: 'hidden' }}>
    <div style={{ width: `${v * 100}%`, height: '100%', borderRadius: 9, background: color ?? BTN_GRAD }} />
  </div>
)
const box = (top: number, h: number): React.CSSProperties => ({ position: 'absolute', left: 22, right: 22, top, height: h, borderRadius: 22, background: '#fff', boxShadow: SHADOW_SM, padding: '16px 18px' })

const JALUR = [
  { name: 'PPKB UI', org: 'Universitas Indonesia', done: 4, of: 6 },
  { name: 'SNBP 2027', org: 'Seleksi Nasional Berbasis Prestasi', done: 3, of: 5 },
  { name: 'IUP UGM', org: 'Universitas Gadjah Mada', done: 2, of: 5 },
]
export const TrackingScreen: React.FC = () => (
  <Phone w={460} h={940}>
    <Header chip="Roadmap Seleksi" title="Tracking Jalur" sub="Pantau tahapan seleksi & berkas" />
    <div style={{ position: 'absolute', left: 26, top: 236, fontFamily: FONT.head, fontWeight: 800, fontSize: 19, color: INK }}>Jalur yang Diikuti</div>
    {JALUR.map((j, i) => (
      <div key={j.name} style={{ ...box(276 + i * 146, 128), boxShadow: i === 0 ? `0 0 0 2.5px ${C.accent}, ${SHADOW_SM}` : SHADOW_SM }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 21, color: INK }}>{j.name}</div>
          <Chip size={11} bg={C.greenSoft} fg={C.green}>Non-tes</Chip>
        </div>
        <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, marginTop: 3 }}>{j.org}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
          <Bar v={j.done / j.of} />
          <div style={{ fontSize: 13, fontWeight: 800, color: INK }}>{j.done}/{j.of}</div>
        </div>
      </div>
    ))}
    <div style={{ ...box(722, 168) }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: C.muted2, letterSpacing: '0.06em' }}>CHECKLIST BERKAS · PPKB UI</div>
      {['Rapor semester 1-5', 'Esai motivasi', 'Sertifikat prestasi'].map((t, i) => (
        <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 11, fontSize: 15, fontWeight: 700, color: i < 2 ? INK : C.muted }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, background: i < 2 ? C.green : '#fff', border: i < 2 ? 'none' : '2px solid #D4D4CF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i < 2 && <Icon name="check" size={14} color="#fff" />}</div>
          {t}
        </div>
      ))}
    </div>
  </Phone>
)

export const EssayScreen: React.FC = () => (
  <Phone w={460} h={940}>
    <Header chip="AI Writing Suite" title="Essay AI Review" sub="Personal Statement Workspace" />
    <div style={{ ...box(232, 300), fontSize: 15.5, lineHeight: 1.62, color: '#2b2b2b', fontWeight: 500 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: C.muted2, letterSpacing: '0.06em', marginBottom: 6 }}>DRAF 2 · PPKB UI</div>
      Ketertarikan saya pada teknik dimulai ketika saya{' '}
      <span style={{ background: 'rgba(255,212,0,0.5)', borderRadius: 4, padding: '1px 3px' }}>sering mengamati proses mekanika di lingkungan sekitar.</span>{' '}
      <span style={{ textDecoration: 'underline wavy #F04438', textUnderlineOffset: 4 }}>Sejak kecil saya bermimpi menjadi insinyur.</span>{' '}
      Melalui program studi Teknik Mesin, saya ingin merancang alat bantu yang lebih hemat energi untuk bengkel kecil di daerah saya. Pengalaman memimpin tim robotik sekolah mengajarkan saya...
    </div>
    <div style={{ ...box(548, 66), display: 'flex', alignItems: 'center', gap: 10, background: '#FFF1F0', boxShadow: 'none', border: '1.5px solid #FECACA' }}>
      <div style={{ width: 10, height: 10, borderRadius: 5, background: '#F04438', flexShrink: 0 }} />
      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#991B1B' }}>Kalimat klise terdeteksi. Coba ganti dengan pengalaman spesifik.</div>
    </div>
    <div style={{ ...box(630, 262) }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 48, color: INK, lineHeight: 1 }}>80</div>
        <div style={{ fontWeight: 800, fontSize: 18, color: C.muted }}>/100</div>
        <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: C.muted2, letterSpacing: '0.06em' }}>EVALUASI 4 PILAR</div>
      </div>
      {[['Hook pembuka', 0.83], ['Alur cerita', 0.74], ['Relevansi prodi', 0.88], ['Tata bahasa', 0.7]].map(([n, v]) => (
        <div key={n as string} style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, fontWeight: 700, color: INK }}><span>{n}</span><span>{Math.round((v as number) * 100)}</span></div>
          <div style={{ display: 'flex', marginTop: 5 }}><Bar v={v as number} /></div>
        </div>
      ))}
    </div>
  </Phone>
)

export const KalkulatorScreen: React.FC = () => {
  const pct = 85
  return (
    <Phone w={460} h={940}>
      <Header chip="Rasionalisasi Rapor" title="Kalkulator Peluang" sub="PPKB UI · Teknik Mesin" />
      <div style={{ ...box(232, 300), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 190, height: 190, borderRadius: '50%', background: `conic-gradient(${C.green} ${pct * 3.6}deg, #EDEDE8 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 150, height: 150, borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: FONT.head, fontWeight: 900, fontSize: 50, color: INK, lineHeight: 1 }}>{pct}%</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.muted, marginTop: 4 }}>peluang lolos</div>
          </div>
        </div>
        <Chip size={13} bg={C.greenSoft} fg={C.green} style={{ marginTop: 18 }}>Rekomendasi: aman untuk pilihan 1</Chip>
      </div>
      {[['Rata-rata rapor sem 1-5', '89,4'], ['Akreditasi sekolah', 'A · kuota 40%'], ['Mapel pendukung', 'Mat, Fisika'], ['Posisi persentil', 'Top 12%']].map(([k, v], i) => (
        <div key={k} style={{ ...box(550 + i * 86, 70), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: C.muted }}>{k}</div>
          <div style={{ fontFamily: FONT.head, fontSize: 19, fontWeight: 800, color: INK }}>{v}</div>
        </div>
      ))}
    </Phone>
  )
}

const Bubble: React.FC<{ me?: boolean; children: React.ReactNode }> = ({ me, children }) => (
  <div style={{ alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '82%', padding: '13px 16px', borderRadius: 20, borderBottomRightRadius: me ? 6 : 20, borderBottomLeftRadius: me ? 20 : 6, background: me ? C.accent : '#fff', boxShadow: me ? 'none' : SHADOW_SM, fontSize: 15.5, fontWeight: 600, lineHeight: 1.45, color: INK }}>{children}</div>
)
export const ChatScreen: React.FC = () => (
  <Phone w={460} h={940}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 54, height: 78, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', borderBottom: '1.5px solid #ECEBE6', background: '#fff' }}>
      <Img src={staticFile('posters/favicon.png')} style={{ height: 46 }} />
      <div>
        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 19, color: INK }}>Otbee AI</div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.green }}>● Aktif siaga</div>
      </div>
    </div>
    <div style={{ position: 'absolute', left: 18, right: 18, top: 150, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Bubble me>Aku cocoknya jalur non-tes yang mana ya? Rapor aku lumayan, ada 2 sertifikat lomba.</Bubble>
      <Bubble>Dari rapor dan sertifikatmu, PPKB UI dan SNBP layak dikejar barengan. Mau aku susun strateginya?</Bubble>
      <Bubble me>Boleh, ayo!</Bubble>
      <div style={{ alignSelf: 'flex-start', width: '88%', padding: '16px 18px', borderRadius: 20, borderBottomLeftRadius: 6, background: INK, color: '#fff' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.accent, letterSpacing: '0.06em' }}>STRATEGI DARI OTBEE</div>
        {['Lengkapi 2 sertifikat lomba', 'Revisi esai motivasi', 'Upload rapor semester 5'].map((t, i) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, fontSize: 14.5, fontWeight: 700 }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: i < 2 ? C.accent : 'transparent', border: i < 2 ? 'none' : '2px solid #555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i < 2 && <Icon name="check" size={13} color={INK} />}</div>
            {t}
          </div>
        ))}
      </div>
    </div>
    <div style={{ position: 'absolute', left: 18, right: 18, bottom: 22, height: 58, borderRadius: 29, background: '#fff', boxShadow: SHADOW_SM, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 0 22px' }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.muted2 }}>Tanya Otbee...</div>
      <div style={{ width: 42, height: 42, borderRadius: 21, background: BTN_GRAD }} />
    </div>
  </Phone>
)

export const MentorScreen: React.FC = () => (
  <Phone w={460} h={940} dark>
    <div style={{ position: 'absolute', left: 22, right: 22, top: 66, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
      <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 21 }}>Sesi Mentor Alumni</div>
      <Chip size={12} bg="#F04438" fg="#fff">● Live</Chip>
    </div>
    {[{ n: 'Kak Rayhan', s: 'Alumni Fasilkom UI · lolos PPKB UI', a: 'R', dark: true }, { n: 'Kamu', s: 'SMA kelas 12 · target PPKB UI', a: 'K', dark: false }].map((p, i) => (
      <div key={p.n} style={{ position: 'absolute', left: 22, right: 22, top: 116 + i * 300, height: 284, borderRadius: 26, background: p.dark ? '#24242A' : 'linear-gradient(160deg, #FFF2B0, #FFE27A)', border: p.dark ? `3px solid ${C.accent}` : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 104, height: 104, borderRadius: 52, background: p.dark ? 'transparent' : C.accent, border: p.dark ? `4px solid ${C.accent}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.head, fontWeight: 900, fontSize: 46, color: p.dark ? C.accent : INK }}>{p.a}</div>
        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 24, color: p.dark ? '#fff' : INK, marginTop: 14 }}>{p.n}</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: p.dark ? '#B7B7BD' : '#6B5A1E', marginTop: 4 }}>{p.s}</div>
      </div>
    ))}
    <div style={{ position: 'absolute', left: 22, right: 22, top: 724, padding: '16px 18px', borderRadius: 22, background: '#24242A', color: '#fff' }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: C.accent, letterSpacing: '0.06em' }}>CATATAN MENTOR</div>
      <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 8, lineHeight: 1.45, color: '#E4E4E7' }}>Paragraf 2 sudah kuat. Tambahkan hasil nyata dari proyek robotikmu.</div>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', justifyContent: 'center', gap: 16 }}>
      {['#3F3F46', '#3F3F46', '#F04438'].map((c, i) => <div key={i} style={{ width: 52, height: 52, borderRadius: 26, background: c }} />)}
    </div>
  </Phone>
)

export const SCREENS: Record<string, React.FC> = { tracking: TrackingScreen, essay: EssayScreen, kalkulator: KalkulatorScreen, chat: ChatScreen, mentor: MentorScreen }
