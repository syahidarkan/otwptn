'use client'

// Adapted from pintarly - "Showcase Fitur Utama" auto-sliding feature carousel.
// Each feature gets a distinct, purpose-built visual with a subtle 3D tilt (Framer Motion perspective transforms).

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  ChevronDown, PlayCircle,
  Mic, Video as VideoIcon, PhoneOff, MessageCircle, Send, Heart, Share2, FileText, Shuffle,
} from 'lucide-react'

function AnimatedPercent({ active, value }: { active: boolean; value: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) { setN(0); return }
    let raf: number
    const start = performance.now()
    const dur = 1100
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, value])
  return <>{n}</>
}

/* ── Mentor: Zoom-style call with screen-shared Google Docs ──────────── */
function MentorZoomPreview() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#1a1a1a' }}>
      <div className="p-3">
        <div className="rounded-lg bg-white p-3" style={{ minHeight: 100 }}>
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#60a5fa' }} />
            <span className="text-xs font-semibold" style={{ color: '#6b7280' }}>essay_motivasi.docx</span>
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 rounded-full" style={{ background: '#e5e7eb', width: '92%' }} />
            <div className="h-1.5 rounded-full" style={{ background: '#e5e7eb', width: '78%' }} />
            <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,212,0,0.55)', width: '60%' }} />
            <div className="h-1.5 rounded-full" style={{ background: '#e5e7eb', width: '85%' }} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 pb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'var(--accent)', color: '#111' }}>K.N</div>
        {['A', 'B', 'C'].map(l => (
          <div key={l} className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>{l}</div>
        ))}
        <span className="text-xs ml-auto flex items-center gap-1" style={{ color: '#f87171' }}>● Live</span>
      </div>
    </div>
  )
}

/* ── Cari Teman Belajar: omegle-style 2-screen matching ───────────────── */
function MatchingPreview() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="aspect-[3/4] rounded-xl relative overflow-hidden flex items-center justify-center" style={{ background: 'var(--dark)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>K</div>
          <span className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}>Kamu</span>
        </div>
        <div className="aspect-[3/4] rounded-xl relative overflow-hidden flex flex-col items-center justify-center gap-1" style={{ background: 'var(--bg-alt)' }}>
          <Image src="/mascot/thinking-idea.png" alt="Teman belajar" width={56} height={64} />
          <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Mencari...</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-alt)' }}><Mic size={13} /></div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-alt)' }}><VideoIcon size={13} /></div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}><Shuffle size={13} /></div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#fee2e2', color: '#b91c1c' }}><PhoneOff size={13} /></div>
      </div>
    </div>
  )
}

/* ── Essay AI Review: 3D paper + "Catatan Revisi" comment bubble ──────── */
function EssayPaperPreview() {
  return (
    <div className="relative px-2 pt-2 pb-6">
      <div className="rounded-xl p-4 text-left" style={{ background: '#fff', transform: 'rotate(-1.5deg)', boxShadow: '0 20px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)', border: '1px solid var(--border)' }}>
        <p className="text-xs leading-relaxed px-2 py-1.5 rounded mb-1.5" style={{ background: 'rgba(34,197,94,0.16)' }}>Motivasi saya memilih Kedokteran UI berawal dari pengalaman merawat kakek saya...</p>
        <p className="text-xs leading-relaxed px-2 py-1.5 rounded" style={{ background: 'rgba(239,68,68,0.13)' }}>Saya ingin jadi dokter yang baik dan membantu banyak orang.</p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10, rotate: 4 }}
        whileInView={{ opacity: 1, y: 0, rotate: 3 }}
        viewport={{ once: true }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="glass rounded-xl p-3 max-w-[180px] absolute -right-2 bottom-0"
        style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <MessageCircle size={12} style={{ color: '#b91c1c' }} />
          <span className="text-xs font-bold text-fg">Catatan Revisi</span>
        </div>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>Terlalu umum - tambahkan contoh konkret.</p>
      </motion.div>
    </div>
  )
}

/* ── Kalkulator: real form fields + animated percent ──────────────────── */
function KalkulatorFormPreview({ active }: { active: boolean }) {
  return (
    <div className="text-left">
      <div className="space-y-2.5 mb-3">
        {[['Sekolah', 'SMAN 8 Jakarta'], ['Rata-rata Rapor', '88.5'], ['Peringkat Sekolah', 'Top 5%']].map(([l, v]) => (
          <div key={l}>
            <label className="text-xs font-semibold text-fg block mb-1">{l}</label>
            <div className="input text-xs flex items-center justify-between" style={{ color: 'var(--fg)' }}>
              {v}<ChevronDown size={13} style={{ color: 'var(--muted)' }} />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-4 text-center" style={{ background: 'var(--bg-alt)' }}>
        <div className="text-3xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: '#15803d' }}>
          <AnimatedPercent active={active} value={73} />%
        </div>
        <div className="text-xs mt-1 font-medium text-fg">Estimasi peluang lolos</div>
      </div>
    </div>
  )
}

/* ── Otbee AI: full phone chat mockup ──────────────────────────────────── */
function OtbeePhonePreview() {
  return (
    <div className="mx-auto rounded-[2.2rem] p-2" style={{ background: '#111', maxWidth: 230 }}>
      <div className="rounded-[1.8rem] overflow-hidden bg-white">
        <div className="h-6 flex items-center justify-center" style={{ background: '#111' }}>
          <div className="w-16 h-3 rounded-full" style={{ background: '#111', border: '1px solid #333' }} />
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--dark)', color: '#fff' }}>O</div>
          <div>
            <div className="text-xs font-bold text-fg">Otbee AI</div>
            <div className="text-xs" style={{ color: '#22c55e' }}>● Online</div>
          </div>
        </div>
        <div className="p-3 space-y-2 min-h-[130px]">
          <div className="rounded-xl rounded-bl-sm px-2.5 py-1.5 text-xs max-w-[80%]" style={{ background: 'var(--bg-alt)' }}>Syarat PPKB UI 2027?</div>
          <div className="rounded-xl rounded-br-sm px-2.5 py-1.5 text-xs max-w-[85%] ml-auto" style={{ background: 'var(--dark)', color: '#fff' }}>Rapor ≥85, portofolio, essay 500–800 kata.</div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex-1 h-7 rounded-full" style={{ background: 'var(--bg-alt)' }} />
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent)' }}>
            <Send size={12} style={{ color: '#111' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Modul & Video: thumbnail grid ─────────────────────────────────────── */
function ModulGridPreview() {
  const items = [{ t: 'Strategi Essay', c: '#fef9c3' }, { t: 'Portofolio', c: '#dcfce7' }, { t: 'Wawancara', c: '#f3e8ff' }, { t: 'Strategi Jalur', c: '#e0f2fe' }]
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map(m => (
        <div key={m.t} className="rounded-xl aspect-video relative flex items-center justify-center" style={{ background: m.c }}>
          <PlayCircle size={22} style={{ color: 'var(--fg)' }} />
          <span className="absolute bottom-1.5 left-2 text-xs font-semibold text-fg">{m.t}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Komunitas: X/Instagram-style post ─────────────────────────────────── */
function KomunitasPostPreview() {
  return (
    <div className="rounded-xl p-3.5 text-left" style={{ background: 'var(--bg-alt)' }}>
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'var(--dark)', color: '#fff' }}>R</div>
        <div>
          <div className="text-xs font-bold text-fg">Rania D. <span className="font-normal" style={{ color: 'var(--muted)' }}>@rania_ptn</span></div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>2 jam lalu</div>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-fg mb-3">Alhamdulillah diterima PPKB UI Kedokteran! Makasih buat yang udah bantu review essay 🎉</p>
      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--muted)' }}>
        <span className="flex items-center gap-1"><Heart size={13} /> 128</span>
        <span className="flex items-center gap-1"><MessageCircle size={13} /> 24</span>
        <span className="flex items-center gap-1"><Share2 size={13} /> 8</span>
      </div>
    </div>
  )
}

/* ── Tracking Jalur: timeline with mascot progress + uni badges ───────── */
function TrackingTimelinePreview() {
  const steps = [
    { label: 'PPKB UI', uni: 'UI', pct: 85, done: true },
    { label: 'PBUB UGM', uni: 'UGM', pct: 50, done: false },
    { label: 'SMUP Unpad', uni: 'UNPAD', pct: 20, done: false },
  ]
  return (
    <div className="text-left">
      <div className="relative pl-6">
        <div className="absolute left-[7px] top-1 bottom-1 w-0.5" style={{ background: 'var(--border)' }} />
        {steps.map(s => (
          <div key={s.label} className="relative mb-4 last:mb-0">
            <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full border-2" style={{ background: s.done ? '#16a34a' : 'var(--bg)', borderColor: s.done ? '#16a34a' : 'var(--border)' }} />
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-fg">{s.label}</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{s.pct}% selesai</div>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'var(--dark)', color: '#fff' }}>{s.uni}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Penyimpanan Dokumen: folder visual ────────────────────────────────── */
function DokumenFolderPreview() {
  return (
    <div className="mx-auto" style={{ maxWidth: 220 }}>
      <div className="rounded-t-lg" style={{ height: 14, width: 72, background: '#fbbf24', marginLeft: 6 }} />
      <div className="rounded-xl rounded-tl-none p-3" style={{ background: '#fbbf24' }}>
        <div className="rounded-lg bg-white p-2.5 space-y-2">
          {['Rapor_Semester5.pdf', 'Sertifikat_OSN.pdf', 'Essay_Final_v3.docx'].map(f => (
            <div key={f} className="flex items-center gap-2 text-xs font-medium text-fg">
              <FileText size={13} style={{ color: 'var(--muted)' }} /> {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

type Feature = { id: string; label: string; title: string; desc: string; mascot: string; preview: (p: { active: boolean }) => React.ReactNode }

const FEATURES: Feature[] = [
  { id: 'mentor', label: 'Mentor Alumni', title: 'Konsultasi grup, sharescreen bareng mentor.', desc: 'Sesi video call grup bareng mentor alumni - sharescreen langsung di essay-mu lewat Google Docs, kayak kelas kecil.', mascot: '/mascot/medal.png', preview: () => <MentorZoomPreview /> },
  { id: 'essay', label: 'Essay AI Review', title: 'Dikoreksi kayak di Google Docs, tapi sama AI.', desc: 'Tiap kalimat di-highlight dengan catatan revisi spesifik - bagian yang kuat, yang perlu diperbaiki, dan saran kalimat pengganti.', mascot: '/mascot/writing-essay.png', preview: () => <EssayPaperPreview /> },
  { id: 'kalkulator', label: 'Kalkulator Peluang', title: 'Estimasi peluang, bukan tebak-tebakan.', desc: 'Isi rapor, peringkat sekolah, dan sertifikatmu - otwptn hitung estimasi peluangmu dengan animasi real-time.', mascot: '/mascot/bar-chart-point.png', preview: ({ active }) => <KalkulatorFormPreview active={active} /> },
  { id: 'otbee', label: 'Otbee AI', title: 'Konsultan yang gak pernah tidur.', desc: 'Chat 24/7 dengan AI yang udah dilatih dari data kelulusan jalur non-tes tahun-tahun sebelumnya, langsung dari HP-mu.', mascot: '/mascot/otbee-phone.png', preview: () => <OtbeePhonePreview /> },
  { id: 'modul', label: 'Modul & Video', title: 'Belajar terstruktur lewat video dan modul.', desc: 'Materi dipecah per jalur - strategi essay, portofolio, sampai simulasi wawancara, dalam video singkat yang gampang dicerna.', mascot: '/mascot/tablet-play.png', preview: () => <ModulGridPreview /> },
  { id: 'komunitas', label: 'Komunitas', title: 'Gak berjuang sendirian.', desc: 'Forum diskusi real-time dengan sesama pejuang jalur non-tes - tanya jawab, sharing pengalaman, saling semangatin.', mascot: '/mascot/megaphone-community.png', preview: () => <KomunitasPostPreview /> },
  { id: 'tracking', label: 'Tracking Jalur', title: 'Pantau progres semua jalur yang kamu ikuti.', desc: 'Timeline yang nunjukin status tiap pendaftaran jalur - draf, submit, hasil - biar gak ada yang kelewat.', mascot: '/mascot/roadmap-flags.png', preview: () => <TrackingTimelinePreview /> },
  { id: 'dokumen', label: 'Penyimpanan Dokumen', title: 'Semua dokumen pendaftaran, satu tempat.', desc: 'Simpan rapor, sertifikat, dan essay versi terbaru - tinggal download pas butuh submit.', mascot: '/mascot/file-box-storage.png', preview: () => <DokumenFolderPreview /> },
  { id: 'matching', label: 'Cari Teman Belajar', title: 'Belajar bareng, kayak Omegle buat PTN.', desc: 'Terhubung instan dengan sesama pejuang jalur non-tes buat ngobrol, sharing strategi, atau saling semangatin.', mascot: '/mascot/video-call-match.png', preview: () => <MatchingPreview /> },
]

export default function FiturSection() {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (paused) return
    timer.current = setInterval(() => setIdx(i => (i + 1) % FEATURES.length), 4500)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [paused])

  const f = FEATURES[idx]

  return (
    <section id="fitur" className="section-pad px-4" style={{ background: 'var(--bg-alt)' }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-section-heading text-fg text-center mb-12"
        >
          Showcase <span className="pill-highlight">Fitur Utama</span> otwptn
        </motion.h2>

        {/* Desktop: sidebar + content | Mobile: stacked */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">

          {/* Sidebar: vertical feature list */}
          <div className="md:w-52 flex-shrink-0">
            {/* Mobile: horizontal scroll */}
            <div className="flex md:hidden gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
              {FEATURES.map((x, i) => (
                <button key={x.id} onClick={() => setIdx(i)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                  style={{ background: idx === i ? 'var(--dark)' : 'var(--bg)', color: idx === i ? 'var(--dark-fg)' : 'var(--muted)', border: '1px solid var(--border)' }}>
                  {x.label}
                </button>
              ))}
            </div>
            {/* Desktop: stacked list */}
            <div className="hidden md:flex flex-col gap-1">
              {FEATURES.map((x, i) => (
                <button key={x.id} onClick={() => setIdx(i)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left w-full transition-all group"
                  style={{
                    background: idx === i ? 'var(--bg)' : 'transparent',
                    color: idx === i ? 'var(--fg)' : 'var(--muted)',
                    fontWeight: idx === i ? 700 : 500,
                    boxShadow: idx === i ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    border: idx === i ? '1px solid var(--border)' : '1px solid transparent',
                  }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all"
                    style={{ background: idx === i ? 'var(--accent)' : 'var(--border)' }} />
                  {x.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0" style={{ perspective: 1200 }}>
            <AnimatePresence mode="wait">
              <motion.div key={f.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center"
              >
                {/* Text + mascot */}
                <div className="flex flex-col gap-4">
                  <Image src={f.mascot} alt={f.label} width={200} height={236} />
                  <div>
                    <h3 className="text-lg font-bold text-fg mb-2">{f.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{f.desc}</p>
                  </div>
                </div>

                {/* Preview card */}
                <motion.div
                  className="card p-5"
                  style={{ transformStyle: 'preserve-3d' }}
                  whileHover={{ rotateY: 3, rotateX: -2, scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                >
                  {f.preview({ active: true })}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-10">
          {FEATURES.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className="h-1.5 rounded-full transition-all"
              style={{ width: idx === i ? 20 : 6, background: idx === i ? 'var(--dark)' : 'var(--border)' }} />
          ))}
        </div>
      </div>
    </section>
  )
}
