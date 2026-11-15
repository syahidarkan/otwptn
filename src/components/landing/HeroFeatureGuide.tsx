'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Calculator, FileText, Target, Calendar, MessageSquare,
  GraduationCap, Sparkles, ChevronRight, CheckCircle2,
  ExternalLink, Zap, Compass
} from 'lucide-react'
import { OtbeeAvatar, otbeeBrain, type OtbeeHandle, type ClipName } from '@/components/mascot/otbee'

interface FeatureNode {
  id: string
  label: string
  sublabel: string
  badge?: string
  badgeColor?: string
  icon: React.ReactNode
  tag: string
  title: string
  description: string
  bullets: { text: string; highlight?: boolean }[]
  footerText: string
  ctaText: string
  ctaHref: string
  isChatAction?: boolean
  // Arc angle in degrees (-140 to -40 across top half-circle)
  angle: number
}

const FEATURES: FeatureNode[] = [
  {
    id: 'kalkulator',
    label: 'Kalkulator',
    sublabel: 'Rapor SNBP',
    badge: 'AI',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
    icon: <Calculator className="w-4 h-4 text-emerald-600" />,
    tag: 'Rasionalisasi Nilai & Sertifikat',
    title: 'Kalkulator Peluang SNBP Cerdas',
    description: 'Hitung peluang lolos otomatis berdasarkan data historis 12.500+ pejuang PTN.',
    bullets: [
      { text: 'Rata-rata Rapor: 88.6 (Kategori Sains & Teknologi)', highlight: true },
      { text: 'Pilihan 1: Teknik Informatika UI - Peluang 84% (Aman)' },
      { text: 'Pilihan 2: Ilmu Komputer UGM - Peluang 79% (Kompetitif)' },
    ],
    footerText: 'Komparasi algoritma AI dengan kuota resmi SNPMB BPPP 2026',
    ctaText: 'Coba Kalkulator Gratis',
    ctaHref: '/dashboard/kalkulator',
    angle: -148,
  },
  {
    id: 'essay',
    label: 'Bedah Essay',
    sublabel: 'PPKB & Mandiri',
    badge: 'HOT',
    badgeColor: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
    icon: <FileText className="w-4 h-4 text-amber-600" />,
    tag: 'AI Review + Mentor UI/ITB/UGM',
    title: 'Review & Bedah Essay Kilat',
    description: 'Analisis hook pembuka, logika narasi, dan konsistensi visi prodi impian.',
    bullets: [
      { text: 'Hook Pembuka & Orisinalitas: Skor 9.2/10', highlight: true },
      { text: 'Analisis Struktur Paragraf & Argumentasi Logis' },
      { text: 'Feedback Line-by-Line & Revisi Langsung via Google Docs' },
    ],
    footerText: 'Review AI kilat < 60 detik + bimbingan 1-on-1 mentor alumni',
    ctaText: 'Review Essay Saya',
    ctaHref: '/dashboard/essay',
    angle: -116,
  },
  {
    id: 'target',
    label: 'Target PTN',
    sublabel: 'Passing Grade',
    badge: '140+',
    badgeColor: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
    icon: <Target className="w-4 h-4 text-blue-600" />,
    tag: 'Direktori Kampus & Prodi Nasional',
    title: 'Database Passing Grade & Kuota',
    description: 'Cek daya tampung, keketatan prodi, dan tren skor nilai lolos 3 tahun terakhir.',
    bullets: [
      { text: 'Database Lengkap Kuota SNBP & SNBT 140+ PTN', highlight: true },
      { text: 'UI, ITB, UGM, ITS, UNAIR, IPB, Undip, Unpad, dll.' },
      { text: 'Grafik Keketatan & Rasio Persaingan Tiap Jurusan' },
    ],
    footerText: 'Data resmi terverifikasi diperbarui berkala',
    ctaText: 'Eksplor Direktori PTN',
    ctaHref: '/direktori',
    angle: -84,
  },
  {
    id: 'jadwal',
    label: 'Jadwal 2026',
    sublabel: 'Countdown',
    badge: 'SOON',
    badgeColor: 'bg-purple-500/15 text-purple-700 border-purple-500/30',
    icon: <Calendar className="w-4 h-4 text-purple-600" />,
    tag: 'Timeline Seleksi Nasional & Mandiri',
    title: 'Kalender & Pengingat Seleksi PTN',
    description: 'Jangan sampai kelewat deadline registrasi akun dan pendaftaran jalur idaman.',
    bullets: [
      { text: 'Registrasi Akun SNPMB Sekolah & Siswa', highlight: true },
      { text: 'Pendaftaran SNBP & Batas Finalisasi Portofolio' },
      { text: 'Jalur Prestasi Mandiri (PPKB UI, PBUB UGM, SJP IPB)' },
    ],
    footerText: 'Dilengkapi alarm notifikasi pengingat H-7 dan H-1 deadline',
    ctaText: 'Cek Panduan Seleksi',
    ctaHref: '/panduan',
    angle: -52,
  },
  {
    id: 'otbee',
    label: 'Otbee AI',
    sublabel: 'Tanya CS 24/7',
    badge: 'LIVE',
    badgeColor: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
    icon: <MessageSquare className="w-4 h-4 text-amber-600" />,
    tag: 'Asisten Pintar Seleksi PTN',
    title: 'Tanya Jawab Seputar OtwPTN & Jalur Masuk',
    description: 'Bingung aturan sertifikat atau paket belajar? Otbee siap jawab pertanyaanmu!',
    bullets: [
      { text: 'Konsultasi Aturan SNBP & Kriteria Nilai Rapor', highlight: true },
      { text: 'Kurasi Piagam Prestasi Puspresnas & Portofolio' },
      { text: 'Tanya Detail Fitur & Rekomendasi Paket Belajar' },
    ],
    footerText: 'Siaga 24 jam nonstop melayani pejuang PTN di seluruh Indonesia',
    ctaText: 'Tanya Otbee Sekarang',
    ctaHref: '#',
    isChatAction: true,
    angle: -20,
  },
  {
    id: 'mentor',
    label: 'Mentor 1-on-1',
    sublabel: 'Alumni PTN',
    badge: 'TOP',
    badgeColor: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
    icon: <GraduationCap className="w-4 h-4 text-rose-600" />,
    tag: 'Bimbingan Personal Eksklusif',
    title: 'Mentor Alumni Jalur Yang Sama',
    description: 'Belajar langsung dari kakak tingkat yang sudah terbukti lolos ke jurusan impianmu.',
    bullets: [
      { text: 'Dibimbing Mahasiswa & Alumni UI, ITB, UGM Berprestasi', highlight: true },
      { text: 'Sesi Privat Zoom 1-on-1 & Diskusi Strategi Khusus' },
      { text: '94.8% Mentee Berhasil Lolos ke Prodi Pilihan Pertama' },
    ],
    footerText: 'Dapatkan garansi mentor pengganti jika tidak cocok',
    ctaText: 'Pilih Mentor Impianmu',
    ctaHref: '/upgrade',
    angle: 12,
  },
]

export default function HeroFeatureGuide() {
  const [activeFeature, setActiveFeature] = useState<FeatureNode | null>(null)
  const [sayText, setSayText] = useState<string | null>(null)
  const avatarRef = useRef<OtbeeHandle>(null)
  const sayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const speak = (text: string, clip: ClipName = 'talk', ms = 3800) => {
    if (sayTimerRef.current) clearTimeout(sayTimerRef.current)
    setSayText(text)
    avatarRef.current?.play(clip, {
      onDone: () => avatarRef.current?.play('idle')
    })
    sayTimerRef.current = setTimeout(() => {
      setSayText(null)
    }, ms)
  }

  const handleSelectFeature = (feat: FeatureNode) => {
    if (activeFeature?.id === feat.id) {
      setActiveFeature(null)
      return
    }
    setActiveFeature(feat)
    speak(`Fitur ${feat.label}! Klik kartu di bawah untuk mencobanya yaa 🐝✨`, 'cheer', 3200)
  }

  const handleOpenChat = () => {
    otbeeBrain.emit({ type: 'cs-chat-open' })
    const widget = document.getElementById('cs-chat-widget')
    if (widget) {
      widget.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  const handleQuickInteraction = (action: string) => {
    if (action === 'salto') {
      avatarRef.current?.fx('sparkle', 1)
      avatarRef.current?.play('salto', {
        speed: 1.3,
        onDone: () => avatarRef.current?.play('idle')
      })
      speak('Yeeey! Semangat pejuang PTN 2026! 🚀🔥', 'cheer', 3000)
    } else if (action === 'tips') {
      avatarRef.current?.fx('bulb', 1)
      speak('Tips hari ini: Rapor semester 1-5 harus dijaga konsisten naik agar lolos SNBP! 📈💡', 'talk', 4500)
    } else if (action === 'hai') {
      avatarRef.current?.fx('heart', 1)
      avatarRef.current?.play('shy', {
        onDone: () => avatarRef.current?.play('idle')
      })
      speak('Haii! Aku Otbee, asisten belajarmu untuk masuk PTN impian! 🐝💛', 'talk', 3500)
    } else if (action === 'rekomendasi') {
      avatarRef.current?.fx('stars', 1)
      speak('Coba Kalkulator Rasionalisasi Rapor kita dulu, gratis & cepat banget! 🎯', 'nod', 4000)
      setActiveFeature(FEATURES[0])
    }
  }

  return (
    <div id="hero-feature-guide" className="w-full max-w-4xl mx-auto mt-2 sm:mt-4 relative select-none flex flex-col items-center">
      {/* 1. Constellation / Orbital Feature Track */}
      <div className="relative w-full max-w-[620px] h-[230px] sm:h-[260px] flex items-center justify-center">

        {/* Ambient Glow Aura */}
        <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-amber-400/25 via-amber-300/15 to-transparent blur-3xl -z-10 pointer-events-none" />

        {/* Orbital Arc Graphic (Subtle dotted / constellation curve) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 620 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 60 230 C 130 50, 490 50, 560 230"
            stroke="url(#orbit-grad)"
            strokeWidth="1.8"
            strokeDasharray="4 6"
            className="opacity-60"
          />
          <defs>
            <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Interactive Otbee Mascot Head (Medium-Large) */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Otbee Speech Bubble */}
          {sayText && (
            <div className="absolute -top-10 z-30 px-3.5 py-1.5 rounded-2xl bg-gray-950/90 text-amber-300 text-[11px] font-bold border border-amber-400/40 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap max-w-[280px] text-center">
              {sayText}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-950 border-r border-b border-amber-400/40 rotate-45" />
            </div>
          )}

          {/* Head Avatar */}
          <div
            onClick={() => handleQuickInteraction('salto')}
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95 relative"
            title="Klik Otbee untuk aksi seru!"
          >
            <OtbeeAvatar
              ref={avatarRef}
              headOnly
              size={135}
              view="front"
              followPointer
            />
          </div>
        </div>

        {/* 6 Orbital Feature Nodes (Positioned along the arc around Otbee) */}
        {/* Node 1: Kalkulator SNBP (Left-bottom) */}
        <div className="absolute left-2 sm:left-6 top-[150px] sm:top-[160px] z-20">
          <FeatureNodePill
            node={FEATURES[0]}
            isActive={activeFeature?.id === FEATURES[0].id}
            onClick={() => handleSelectFeature(FEATURES[0])}
          />
        </div>

        {/* Node 2: Bedah Essay (Left-upper) */}
        <div className="absolute left-8 sm:left-24 top-[48px] sm:top-[42px] z-20">
          <FeatureNodePill
            node={FEATURES[1]}
            isActive={activeFeature?.id === FEATURES[1].id}
            onClick={() => handleSelectFeature(FEATURES[1])}
          />
        </div>

        {/* Node 3: Target PTN (Center-left-top) */}
        <div className="absolute left-[38%] -top-2 sm:top-0 -translate-x-1/2 z-20">
          <FeatureNodePill
            node={FEATURES[2]}
            isActive={activeFeature?.id === FEATURES[2].id}
            onClick={() => handleSelectFeature(FEATURES[2])}
          />
        </div>

        {/* Node 4: Jadwal 2026 (Center-right-top) */}
        <div className="absolute left-[62%] -top-2 sm:top-0 -translate-x-1/2 z-20">
          <FeatureNodePill
            node={FEATURES[3]}
            isActive={activeFeature?.id === FEATURES[3].id}
            onClick={() => handleSelectFeature(FEATURES[3])}
          />
        </div>

        {/* Node 5: Otbee AI (Right-upper) */}
        <div className="absolute right-8 sm:right-24 top-[48px] sm:top-[42px] z-20">
          <FeatureNodePill
            node={FEATURES[4]}
            isActive={activeFeature?.id === FEATURES[4].id}
            onClick={() => handleSelectFeature(FEATURES[4])}
          />
        </div>

        {/* Node 6: Mentor 1-on-1 (Right-bottom) */}
        <div className="absolute right-2 sm:right-6 top-[150px] sm:top-[160px] z-20">
          <FeatureNodePill
            node={FEATURES[5]}
            isActive={activeFeature?.id === FEATURES[5].id}
            onClick={() => handleSelectFeature(FEATURES[5])}
          />
        </div>
      </div>

      {/* 2. Interactive Status Capsule (Directly below Otbee's head, like Lumi status) */}
      <div className="mt-1 sm:mt-2 z-20">
        <button
          onClick={() => {
            if (!activeFeature) setActiveFeature(FEATURES[0])
            else setActiveFeature(null)
          }}
          className="group px-4 py-2 rounded-full bg-gray-950/85 hover:bg-gray-900 border border-amber-400/35 hover:border-amber-400 text-amber-200 text-xs font-black shadow-lg backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span>H-45 Pendaftaran SNBP 2026 • 12.500+ Pejuang Aktif</span>
          <span className="text-[10px] text-amber-400/80 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            {activeFeature ? 'Tutup Preview ✕' : 'Lihat Fitur Pemandu ↓'}
          </span>
        </button>
      </div>

      {/* 3. Interactive Feature Preview Card (Lumi-style expandable popover) */}
      {activeFeature && (
        <div className="w-full max-w-lg mt-3 bg-gradient-to-b from-gray-950/95 via-gray-900/95 to-gray-950/95 text-white rounded-3xl p-5 border border-amber-500/30 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 z-30">
          {/* Card Topbar */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                {activeFeature.icon}
              </span>
              <div>
                <h4 className="text-sm font-black text-amber-100 leading-tight">
                  {activeFeature.title}
                </h4>
                <span className="text-[10.5px] font-bold text-amber-400/90">
                  {activeFeature.tag}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveFeature(null)}
              className="w-7 h-7 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
              aria-label="Tutup preview"
            >
              ✕
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-300 font-medium leading-relaxed my-3">
            {activeFeature.description}
          </p>

          {/* Interactive Bullet Rows (Simulated Lumi notification rows) */}
          <div className="space-y-2 bg-gray-900/80 rounded-2xl p-3 border border-gray-800/80">
            {activeFeature.bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${b.highlight ? 'bg-amber-400 shadow-xs shadow-amber-400/50' : 'bg-gray-600'}`} />
                <span className={b.highlight ? 'font-bold text-amber-100' : 'text-gray-300 font-medium'}>
                  {b.text}
                </span>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="text-[10.5px] text-gray-400 font-semibold mt-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>{activeFeature.footerText}</span>
          </div>

          {/* CTA Button */}
          <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between gap-3">
            {activeFeature.isChatAction ? (
              <button
                onClick={handleOpenChat}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>{activeFeature.ctaText}</span>
                <ChevronRight size={14} className="stroke-[3]" />
              </button>
            ) : (
              <Link
                href={activeFeature.ctaHref}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>{activeFeature.ctaText}</span>
                <ChevronRight size={14} className="stroke-[3]" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 4. Quick Mascot Interaction Bar (Lumi-style bottom shortcuts: tips, salto, hai, target) */}
      <div className="flex items-center justify-center flex-wrap gap-2 mt-3 z-20">
        <button
          onClick={() => handleQuickInteraction('tips')}
          className="px-3 py-1 rounded-full bg-white/80 hover:bg-amber-50 text-gray-700 hover:text-amber-900 text-[11px] font-bold border border-amber-950/10 hover:border-amber-400/50 transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 active:scale-95"
        >
          <span>💡</span>
          <span>Tips Lolos</span>
        </button>
        <button
          onClick={() => handleQuickInteraction('salto')}
          className="px-3 py-1 rounded-full bg-white/80 hover:bg-amber-50 text-gray-700 hover:text-amber-900 text-[11px] font-bold border border-amber-950/10 hover:border-amber-400/50 transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 active:scale-95"
        >
          <span>✨</span>
          <span>Salto Otbee</span>
        </button>
        <button
          onClick={() => handleQuickInteraction('hai')}
          className="px-3 py-1 rounded-full bg-white/80 hover:bg-amber-50 text-gray-700 hover:text-amber-900 text-[11px] font-bold border border-amber-950/10 hover:border-amber-400/50 transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 active:scale-95"
        >
          <span>💖</span>
          <span>Sapa Otbee</span>
        </button>
        <button
          onClick={() => handleQuickInteraction('rekomendasi')}
          className="px-3 py-1 rounded-full bg-white/80 hover:bg-amber-50 text-gray-700 hover:text-amber-900 text-[11px] font-bold border border-amber-950/10 hover:border-amber-400/50 transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 active:scale-95"
        >
          <span>🎯</span>
          <span>Rekomendasi</span>
        </button>
      </div>
    </div>
  )
}

function FeatureNodePill({
  node,
  isActive,
  onClick,
}: {
  node: FeatureNode
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl border transition-all cursor-pointer active:scale-95 backdrop-blur-md shadow-xs ${
        isActive
          ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-md scale-105 font-black ring-2 ring-amber-400/50'
          : 'bg-white/90 hover:bg-amber-50 text-gray-800 hover:text-amber-950 border-gray-200/90 hover:border-amber-300 font-bold'
      }`}
    >
      <div className="flex-shrink-0">
        {node.icon}
      </div>
      <div className="text-left hidden sm:block">
        <div className="text-[11px] leading-tight font-extrabold flex items-center gap-1">
          <span>{node.label}</span>
          {node.badge && (
            <span className={`text-[8.5px] uppercase font-black px-1 py-0.2 rounded-md border ${node.badgeColor ?? 'bg-amber-100 text-amber-800 border-amber-300'}`}>
              {node.badge}
            </span>
          )}
        </div>
        <div className="text-[9px] text-gray-500 group-hover:text-amber-900 font-medium leading-none mt-0.5">
          {node.sublabel}
        </div>
      </div>
      {/* Mobile-only compact text */}
      <div className="sm:hidden text-[10px] font-black leading-tight">
        {node.label}
      </div>
    </button>
  )
}
