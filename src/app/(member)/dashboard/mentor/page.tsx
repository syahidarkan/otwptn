'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Sparkles,
  ShieldCheck,
  Star,
  Calendar,
  Clock,
  Video,
  MessageCircle,
  FileText,
  Upload,
  CheckCircle2,
  Check,
  ArrowRight,
  Bold,
  Italic,
  Underline,
  List,
  Heading1,
  Download,
  History,
  MessageSquare,
  Scan,
  Trophy,
  X,
  Award,
  ChevronDown,
  Volume2,
  VolumeX,
  School,
  GraduationCap,
} from 'lucide-react'

// Dummy mentor profile for demonstration
const ASSIGNED_MENTOR = {
  name: 'Kak Rayhan Fadillah, S.Kom.',
  univ: 'Universitas Indonesia',
  major: 'Fasilkom UI (Ilmu Komputer)',
  track: 'Lolos PPKB UI & SNBP',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  waNumber: '6281234567890',
  rating: 4.98,
  menteeCount: 42,
}

interface MentorProfile {
  name: string
  univ: string
  univCode: 'UI' | 'ITB' | 'UGM' | 'ITS' | 'UNAIR'
  major: string
  track: string
  avatar: string
  specialty: string
  rating: number
  gradYear: string
  menteeCount: number
  sampleNote: string
}

const MENTOR_ROSTER: MentorProfile[] = [
  {
    name: 'Rayhan Fadillah, S.Kom.',
    univ: 'Universitas Indonesia',
    univCode: 'UI',
    major: 'Fasilkom UI (Ilmu Komputer)',
    track: 'Lolos PPKB UI & SNBP',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    specialty: 'Bedah Essay PPKB UI & SIMAK Rapor',
    rating: 4.98,
    gradYear: 'Alumni UI 2024',
    menteeCount: 42,
    sampleNote: 'Kalimat pembuka esai harus menonjolkan intellectual curiosity kamu tentang rekayasa perangkat lunak, bukan sekadar cerita umum hobi coding.',
  },
  {
    name: 'Amanda Putri, S.M.',
    univ: 'Institut Teknologi Bandung',
    univCode: 'ITB',
    major: 'Sekolah Bisnis dan Manajemen (SBM ITB)',
    track: 'Lolos Seleksi Mandiri Nilai Rapor',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    specialty: 'Koreksi Essay SBM & Portofolio Kepemimpinan',
    rating: 4.96,
    gradYear: 'Alumni ITB 2023',
    menteeCount: 38,
    sampleNote: 'Ubah narasi kepanitiaan jadi data driven: cantumkan revenue yang dicapai dan tim 40 orang yang kamu pimpin untuk membuktikan leadership.',
  },
  {
    name: 'dr. Farhan Ramadhan',
    univ: 'Universitas Gadjah Mada',
    univCode: 'UGM',
    major: 'Fakultas Kedokteran (FKKMK UGM)',
    track: 'Lolos SNBP Kedokteran Peringkat 1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    specialty: 'Rasionalisasi Nilai Rapor Saintek & Kedokteran',
    rating: 4.99,
    gradYear: 'Alumni UGM 2022',
    menteeCount: 51,
    sampleNote: 'Nilai Biologi dan Kimia kamu semester 3-5 sangat konsisten di 94+. Kita tonjolkan linieritas ini pada esai kontribusi bidang preventif.',
  },
  {
    name: 'Nadhira Syarif, S.T.',
    univ: 'Institut Teknologi Sepuluh Nopember',
    univCode: 'ITS',
    major: 'Teknik Sipil ITS',
    track: 'Lolos Mandiri Prestasi ITS',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    specialty: 'Pemilihan Prodi Teknik & Sertifikat Puspresnas',
    rating: 4.95,
    gradYear: 'Alumni ITS 2024',
    menteeCount: 34,
    sampleNote: 'Sertifikat lomba rancang jembatan nasional kamu memiliki bobot tier-1 di ITS. Wajib ditaruh di slot nomor 1 di berkas pendaftaran.',
  },
  {
    name: 'Cut Sarah, S.Hub.Int.',
    univ: 'Universitas Indonesia',
    univCode: 'UI',
    major: 'Hubungan Internasional UI',
    track: 'Lolos Talent Scouting KKI & PPKB',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    specialty: 'Essay Bahasa Inggris & Wawancara Internasional',
    rating: 4.97,
    gradYear: 'Alumni UI 2024',
    menteeCount: 29,
    sampleNote: 'Strong thesis statement needed in paragraph 1. Connect current geopolitical ASEAN case with your academic vision in UI.',
  },
  {
    name: 'Kevin Pratama, S.Ked.',
    univ: 'Universitas Airlangga',
    univCode: 'UNAIR',
    major: 'Pendidikan Dokter Unair',
    track: 'Lolos SNBP Kedokteran Unair',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    specialty: 'Rasionalisasi Kuota Sekolah & Medali Olimpiade',
    rating: 4.98,
    gradYear: 'Alumni Unair 2023',
    menteeCount: 44,
    sampleNote: 'Riwayat alumni SMAN kamu di FK Unair 3 tahun berturut-turut sangat solid. Kita fokus optimalkan esai komitmen dokter daerah.',
  },
]

interface EssayComment {
  id: string
  mentorName: string
  mentorAvatar: string
  quote: string
  type: 'hapus' | 'revisi' | 'perlu-bukti' | 'sudah-oke'
  comment: string
  time: string
  resolved?: boolean
  replies: { author: string; text: string; time: string }[]
}

const INITIAL_COMMENTS: EssayComment[] = [
  {
    id: 'comm-1',
    mentorName: 'Kak Rayhan Fadillah',
    mentorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    quote: 'Saya adalah anak yang rajin dan berbakti kepada orang tua.',
    type: 'hapus',
    comment: 'Bagian ini terlalu klise dan generik. Tim penilai PPKB UI mencari dorongan intelektual dan problem konkret yang ingin kamu selesaikan lewat prodi pilihan, bukan sekadar sifat umum.',
    time: 'Kemarin, 14:20',
    replies: [
      { author: 'Kamu (Mentee)', text: 'Baik Kak, kalau diganti dengan alasan ketertarikan pada proyek otomasi sistem rumah gimana?', time: 'Kemarin, 15:10' },
      { author: 'Kak Rayhan Fadillah', text: 'Nah itu jauh lebih spesifik dan berkarakter! Masukkan itu.', time: 'Kemarin, 15:30' },
    ],
  },
  {
    id: 'comm-2',
    mentorName: 'Kak Rayhan Fadillah',
    mentorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    quote: 'Pengalaman saya menjadi ketua panitia pentas seni.',
    type: 'perlu-bukti',
    comment: 'Tolong tambahkan metrik keberhasilan konkret: berapa jumlah peserta yang hadir? Berapa anggaran yang kamu kelola? Ini akan membuktikan kompetensi leadership kamu.',
    time: 'Hari ini, 09:15',
    replies: [],
  },
]

export default function MentorAlumniPage() {
  const supabase = createClient()
  const [tier, setTier] = useState<string>('free')
  const [, setLoading] = useState(true)
  const [demoUnlocked, setDemoUnlocked] = useState(false)
  const [activeTab, setActiveTab] = useState<'workspace' | 'profile-rapor' | 'booking'>('workspace')

  // University Filter for Mentor Roster
  const [univFilter, setUnivFilter] = useState<'Semua' | 'UI' | 'ITB' | 'UGM' | 'ITS' | 'UNAIR'>('Semua')
  const [selectedMentorModal, setSelectedMentorModal] = useState<MentorProfile | null>(null)

  // Interactive Live Google Meet Simulation
  const [activeAnnotationIdx, setActiveAnnotationIdx] = useState<number>(0)

  // VIP Google Docs Essay Workspace States
  const [essayTitle, setEssayTitle] = useState('Draf Essay Motivasi PPKB UI — Fasilkom')
  const [essayContent, setEssayContent] = useState(
    `Sejak duduk di bangku kelas 10, saya menaruh minat mendalam pada integrasi kecerdasan buatan dalam pemrosesan data kesehatan. Saat mengamati sistem pendaftaran puskesmas di daerah saya yang masih mengalami antrean berulang, saya menyadari bahwa efisiensi sistem informasi bukan sekadar kemudahan teknologi, melainkan hak layanan publik yang mendesak.\n\nMelalui keikutsertaan saya dalam Olimpiade Informatika dan pengembangan aplikasi mini berbasis web untuk inventaris ekstrakurikuler, saya belajar bagaimana logika algoritma dapat memecahkan masalah nyata di sekitar kita.\n\nMemilih Fakultas Ilmu Komputer Universitas Indonesia adalah keputusan terencana untuk mendalami rekayasa perangkat lunak dan data science di bawah bimbingan para akademisi terbaik tanah air.`
  )
  const [comments, setComments] = useState<EssayComment[]>(INITIAL_COMMENTS)
  const [replyInput, setReplyInput] = useState<Record<string, string>>({})
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false)

  // Profile Rapor & Academic Checklist
  const [schoolName, setSchoolName] = useState('SMAN 8 Jakarta')
  const [eligibleRank, setEligibleRank] = useState('3')
  const [jurusan, setJurusan] = useState<'IPA' | 'IPS'>('IPA')
  const [alumniCount, setAlumniCount] = useState('14')
  const [scanning, setScanning] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)
  const [raporData, setRaporData] = useState<Record<string, number[]>>({
    Matematika: [88, 90, 92, 94, 95],
    Fisika: [85, 88, 90, 92, 93],
    Kimia: [86, 87, 89, 91, 93],
    Biologi: [87, 89, 90, 93, 94],
    'Bahasa Indonesia': [90, 91, 93, 94, 95],
    'Bahasa Inggris': [89, 92, 93, 95, 96],
  })

  // Booking Sesi 1-on-1 States
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTopic, setBookingTopic] = useState('Review Essay Kalimat per Kalimat')
  const [bookingConfirmed, setBookingConfirmed] = useState(false)

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setLoading(false)
        return
      }
      supabase
        .from('profiles')
        .select('tier, full_name, school_name')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          const t = profile?.tier || 'free'
          setTier(t)
          if (t !== 'free') setDemoUnlocked(true)
          if (profile?.school_name) setSchoolName(profile.school_name)
          setLoading(false)
        })
    })
  }, [supabase])

  const isUnlocked = demoUnlocked || (tier !== 'free' && tier !== '')

  function handleFormat(tag: string) {
    setEssayContent(prev => prev + `\n[${tag}] Bagian yang ditandai...`)
  }

  function handleResolveComment(id: string) {
    setComments(prev =>
      prev.map(c => (c.id === id ? { ...c, resolved: true } : c))
    )
  }

  function handleAddReply(commentId: string) {
    const text = replyInput[commentId]
    if (!text?.trim()) return
    setComments(prev =>
      prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [
              ...c.replies,
              { author: 'Kamu (Mentee)', text: text.trim(), time: 'Baru saja' },
            ],
          }
        }
        return c
      })
    )
    setReplyInput(prev => ({ ...prev, [commentId]: '' }))
  }

  function handleScanRapor() {
    setScanning(true)
    setScanSuccess(false)
    setTimeout(() => {
      setScanning(false)
      setScanSuccess(true)
      setRaporData({
        Matematika: [90, 92, 93, 95, 96],
        Fisika: [88, 90, 91, 94, 95],
        Kimia: [87, 89, 92, 93, 94],
        Biologi: [89, 91, 91, 93, 94],
        'Bahasa Indonesia': [92, 93, 94, 95, 96],
        'Bahasa Inggris': [91, 93, 94, 96, 97],
      })
    }, 2000)
  }

  function handleExportPDF() {
    window.print()
  }

  const filteredMentors =
    univFilter === 'Semua'
      ? MENTOR_ROSTER
      : MENTOR_ROSTER.filter(m => m.univCode === univFilter)

  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10 space-y-10">
      {/* Top Simulation Mode Bar */}
      <div className="p-4 rounded-3xl bg-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="text-xs font-black text-gray-900 block">
              Program Mentorship 1-on-1 Alumni Top PTN
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              {isUnlocked
                ? 'Portal VIP Aktif — Akses Penuh ke Workspace, OCR Rapor, & Booking Meet'
                : 'Mode Preview Siswa — Simulasi Kurikulum & Profil Mentor'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setDemoUnlocked(!demoUnlocked)}
          className="btn-brand-primary px-5 py-2.5 rounded-full text-xs font-black shadow-xs flex items-center gap-2"
        >
          {isUnlocked ? (
            'Alihkan ke Mode Showcase'
          ) : (
            <>
              <ShieldCheck size={14} /> Buka Simulasi Akses VIP Mentee
            </>
          )}
        </button>
      </div>

      {!isUnlocked ? (
        /* =========================================================================
           STATE A: FREE USER — CLEAN, BALANCED SHOWCASE
           ========================================================================= */
        <div className="space-y-12">
          {/* 1. HERO BANNER: BALANCED PROPORTIONS, NO OVERLAP */}
          <div className="rounded-3xl bg-white p-8 md:p-12 shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Value Prop */}
              <div className="lg:col-span-8 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-wider">
                    Bimbingan Privat 1-on-1 · 100% Alumni Resmi
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-gray-950 tracking-tight leading-tight">
                  Lolos PTN Non-Tes{' '}
                  <span className="text-amber-600">Bukan Soal Hoki.</span>{' '}
                  Dibimbing Langsung Alumni Top.
                </h1>

                <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed max-w-2xl">
                  Bukan seminar massal atau webinar rekaman. Kamu dipasangkan dengan 1 mentor personal dari kampus & jurusan impianmu untuk membedah esai kata demi kata, audit 5 semester rapor, dan konsultasi 1-on-1 Google Meet sampai kamu resmi diterima.
                </p>

                {/* 3 Clear Stat Badges */}
                <div className="grid grid-cols-3 gap-3 pt-2 max-w-md">
                  <div className="p-3.5 rounded-2xl bg-gray-50 text-center">
                    <p className="text-lg md:text-xl font-black text-gray-900">94.2%</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Mentee Lolos 2025</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 text-center">
                    <p className="text-lg md:text-xl font-black text-gray-900">1 : 5</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Rasio Kuota Mentor</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 text-center">
                    <p className="text-lg md:text-xl font-black text-emerald-700">100%</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Garansi Sampai Final</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <Link
                    href="/upgrade"
                    className="btn-brand-primary px-8 py-3.5 rounded-full text-xs font-black shadow-md flex items-center gap-2"
                  >
                    Amankan Kuota Mentorship Sekarang <ArrowRight size={15} />
                  </Link>
                  <button
                    onClick={() => setDemoUnlocked(true)}
                    className="px-6 py-3.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors flex items-center gap-2"
                  >
                    <ShieldCheck size={15} className="text-amber-600" /> Coba Simulasi Portal VIP
                  </button>
                </div>
              </div>

              {/* Right Column: Clean Mascot Card */}
              <div className="lg:col-span-4 flex items-center justify-center">
                <div className="p-6 rounded-3xl bg-amber-50/60 flex flex-col items-center text-center space-y-3 w-full max-w-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/mascot/mentor-call-notes.png"
                    alt="Otbee Mentor Mascot"
                    className="w-36 h-36 object-contain"
                  />
                  <div>
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                      Otbee Mentor Match
                    </h3>
                    <p className="text-[11px] text-gray-600 mt-1">
                      Cocokkan minat jurusamu dengan alumni UI, ITB, UGM, UNAIR & ITS
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 4 PILAR KURIKULUM: CLEAN 4-COLUMN CARDS WITHOUT CLUTTER */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900">
                  4 Fasilitas Utama Mentorship
                </h2>
                <p className="text-xs text-gray-500">
                  Semua yang kamu dapatkan selama masa bimbingan intensif hingga pengumuman seleksi.
                </p>
              </div>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
                ✓ Garansi Review Tak Terbatas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  step: '01',
                  title: 'Audit Rapor & AI Linieritas',
                  desc: 'Ekstraksi nilai 5 semester untuk mendeteksi tren kenaikan, mata pelajaran kunci prodi impian, dan perbandingan kuota eligible.',
                  mascot: '/mascot/glasses-writing-desk.png',
                  badge: 'Scan Rapor AI',
                },
                {
                  step: '02',
                  title: 'Kurasi Portofolio BPTI',
                  desc: 'Memilah 3 sertifikat prestasi terbaik bertaraf nasional/provinsi yang paling berbobot bagi panitia seleksi universitas tujuan.',
                  mascot: '/mascot/trophy-graduate.png',
                  badge: 'Bobot Puspresnas',
                },
                {
                  step: '03',
                  title: 'Collaborative Docs Workspace',
                  desc: 'Tulis esai motivasi langsung bersama mentor. Setiap kalimat diperiksa, dikoreksi hook pembukanya, dan direvisi tanpa batas.',
                  mascot: '/mascot/review-draft.png',
                  badge: 'Anotasi Kalimat',
                },
                {
                  step: '04',
                  title: '4x Sesi 1-on-1 Google Meet',
                  desc: 'Konsultasi tatap muka 60 menit per sesi. Simulasi wawancara, verifikasi berkas final, dan penyusunan strategi prodi cadangan.',
                  mascot: '/mascot/video-call-match.png',
                  badge: 'Privat 60 Menit',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl bg-white p-6 shadow-md flex flex-col justify-between hover-lift"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                        Pilar {item.step}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {item.badge}
                      </span>
                    </div>

                    <div className="w-full flex items-center justify-center py-2 h-24">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.mascot}
                        alt={item.title}
                        className="max-h-20 object-contain"
                      />
                    </div>

                    <h3 className="text-sm font-black text-gray-900 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. SIMULASI SESI 1-ON-1 & ANOTASI ESAI (CLEAN LIGHT DESIGN) */}
          <div className="rounded-3xl bg-white p-8 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                  Preview Bimbingan
                </span>
                <h3 className="text-lg md:text-xl font-black text-gray-900 mt-1">
                  Simulasi Sesi 1-on-1 & Live Essay Review
                </h3>
              </div>
              <span className="text-xs font-bold text-gray-500">
                Klik kalimat bergaris kuning di bawah untuk melihat anotasi mentor
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left (5 cols): Mentor Video & Audio Wave */}
              <div className="lg:col-span-5 rounded-2xl bg-gray-50 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                    alt=""
                    className="w-14 h-14 rounded-2xl object-cover shadow-xs"
                  />
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      ● Sesi Terhubung
                    </span>
                    <h4 className="text-xs font-black text-gray-900 mt-1">
                      Kak Rayhan Fadillah, S.Kom.
                    </h4>
                    <p className="text-[11px] text-gray-500">Alumni Fasilkom UI · Mentor Pendamping</p>
                  </div>
                </div>

                {/* Voice Feedback Waveform */}
                <div className="p-3.5 rounded-xl bg-white shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-gray-800 flex items-center gap-1.5">
                      <Volume2 size={14} className="text-amber-600" /> Catatan Suara Mentor
                    </span>
                    <span className="text-gray-400 font-mono text-[10px]">01:24 / 03:00</span>
                  </div>
                  <div className="flex items-center gap-1 h-5 pt-1">
                    {[12, 18, 8, 22, 15, 26, 10, 19, 24, 14, 20, 9, 25, 16, 21, 11, 23, 17, 13, 8].map((h, i) => (
                      <span
                        key={i}
                        style={{ height: `${h}px` }}
                        className="flex-1 bg-amber-400 rounded-full"
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed italic">
                  &ldquo;Paragraf 1 kamu sudah bagus di bagian ketertarikan teknologi, tapi tolong hindari klaim umum tanpa bukti. Lihat catatan di draf esaimu.&rdquo;
                </p>
              </div>

              {/* Right (7 cols): Document & Highlighted Sentences */}
              <div className="lg:col-span-7 rounded-2xl bg-gray-50 p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 text-xs">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5">
                    <FileText size={14} className="text-amber-600" /> PPKB_UI_Essay_Review_Draft.docx
                  </span>
                  <span className="text-emerald-700 font-bold text-[11px]">Auto-saved</span>
                </div>

                <div className="space-y-3 font-serif text-xs md:text-sm leading-relaxed text-gray-800">
                  <p>
                    Sejak kelas 10, saya menaruh minat mendalam pada integrasi kecerdasan buatan dalam pemrosesan data puskesmas.{' '}
                    <span
                      onClick={() => setActiveAnnotationIdx(0)}
                      className={`cursor-pointer px-1.5 py-0.5 rounded transition-all ${
                        activeAnnotationIdx === 0
                          ? 'bg-amber-300 text-amber-950 font-bold ring-2 ring-amber-400'
                          : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      }`}
                    >
                      &ldquo;Saya adalah anak yang rajin dan berbakti kepada orang tua.&rdquo;
                    </span>{' '}
                    Melalui keikutsertaan saya dalam Olimpiade Informatika dan pengembangan aplikasi mini web inventaris,{' '}
                    <span
                      onClick={() => setActiveAnnotationIdx(1)}
                      className={`cursor-pointer px-1.5 py-0.5 rounded transition-all ${
                        activeAnnotationIdx === 1
                          ? 'bg-emerald-300 text-emerald-950 font-bold ring-2 ring-emerald-400'
                          : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                      }`}
                    >
                      &ldquo;saya berhasil memangkas waktu pencarian data dari 15 menit menjadi 2 detik.&rdquo;
                    </span>
                  </p>
                </div>

                {/* Active Annotation Feedback Box */}
                <div className="p-4 rounded-xl bg-white shadow-xs border-l-3 border-amber-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-900">
                      Catatan Mentor Kak Rayhan:
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                      {activeAnnotationIdx === 0 ? 'Perlu Diganti' : 'Hook Sudah Kuat!'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed font-sans">
                    {activeAnnotationIdx === 0
                      ? 'Bagian ini terlalu generik dan tidak mencerminkan keunikan intelektualmu. Ganti dengan alasan konkret ketertarikanmu pada arsitektur web & data science.'
                      : 'Metrik 15 menit jadi 2 detik ini sangat kuat! Panitia PPKB UI suka kandidat yang bisa membuktikan dampak nyata dengan angka kuantitatif.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. DIREKTORI MENTOR ALUMNI: CLEAN GRID WITH FILTER */}
          <div className="rounded-3xl bg-white p-8 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900">
                  Jajaran Mentor Alumni Kami
                </h2>
                <p className="text-xs text-gray-500">
                  Alumni berprestasi dari universitas top yang telah melalui jalur non-tes.
                </p>
              </div>

              <Link
                href="/upgrade"
                className="btn-brand-primary px-5 py-2.5 rounded-full text-xs font-black shadow-xs self-start sm:self-auto"
              >
                Pilih Mentormu Sekarang
              </Link>
            </div>

            {/* University Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {(['Semua', 'UI', 'ITB', 'UGM', 'ITS', 'UNAIR'] as const).map(u => (
                <button
                  key={u}
                  onClick={() => setUnivFilter(u)}
                  className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all ${
                    univFilter === u
                      ? 'btn-brand-primary'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {u === 'Semua' ? 'Semua Kampus' : `Kampus ${u}`}
                </button>
              ))}
            </div>

            {/* Mentors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMentors.map((m, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl bg-gray-50/80 p-5 flex flex-col justify-between hover:bg-amber-50/50 transition-all hover-lift space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-14 h-14 rounded-2xl object-cover shadow-xs flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-black text-gray-950 truncate">{m.name}</h4>
                          <span className="text-[11px] font-bold text-amber-700 flex items-center gap-0.5">
                            <Star size={11} fill="currentColor" /> {m.rating}
                          </span>
                        </div>
                        <p className="text-xs font-black text-amber-900 mt-0.5">{m.univ}</p>
                        <p className="text-[11px] text-gray-500 truncate">{m.major}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] pt-1 border-t border-gray-200/50">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Jalur Masuk:</span>
                        <span className="font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full text-[10px]">
                          ✓ {m.track}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Fokus:</span>
                        <span className="font-bold text-gray-800 text-[10px] truncate max-w-[170px]">
                          {m.specialty}
                        </span>
                      </div>
                    </div>

                    <p className="p-3 rounded-xl bg-white shadow-xs text-[11px] italic text-gray-700 font-serif border-l-2 border-amber-400">
                      &ldquo;{m.sampleNote}&rdquo;
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedMentorModal(m)}
                    className="w-full py-2.5 rounded-full text-xs font-bold bg-white hover:bg-gray-100 text-gray-900 shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={13} className="text-amber-600" /> Lihat Portofolio Mentor
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 5. SUCCESS STORIES */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900">
                Kisah Sukses Mentee
              </h2>
              <p className="text-xs text-gray-500">
                Simak pengalaman siswa yang telah lolos di fakultas impian bersama mentor otwptn.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  mentee: 'Salma Salsabila',
                  school: 'SMAN 28 Jakarta',
                  admitted: 'Kedokteran Universitas Indonesia (PPKB UI)',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                  quote:
                    'Anotasi draf esai di workspace otwptn bener-bener ngebuka mata. Mentor nunjukin bagian mana yang terkesan mengeluh dan diubah jadi gagasan solutif. Alhamdulillah lolos di pilihan pertama!',
                },
                {
                  mentee: 'Arkan Danendra',
                  school: 'SMAN 3 Bandung',
                  admitted: 'STEI-R Institut Teknologi Bandung (SNBP)',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                  quote:
                    'Audit 5 semester rapor ngebantu banget waktu sekolah nentuin eligible. Rasionalisasi sertifikat olimpiade juga tepat sasaran.',
                },
                {
                  mentee: 'Nabila Putri',
                  school: 'SMA Taruna Nusantara',
                  admitted: 'Ilmu Komunikasi UGM (Prestasi Mandiri)',
                  avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
                  quote:
                    'Sesi 1-on-1 Google Meet sangat mendalam. Mentor ngoreksi cara penyampaian motivasi dan portofolio jurnalistik saya.',
                },
              ].map((t, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl bg-white p-6 shadow-md flex flex-col justify-between hover-lift space-y-4"
                >
                  <p className="text-xs text-gray-700 leading-relaxed font-serif italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.avatar}
                      alt={t.mentee}
                      className="w-10 h-10 rounded-full object-cover shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-gray-900">{t.mentee}</p>
                      <p className="text-[11px] text-gray-400 font-medium">{t.school}</p>
                      <span className="inline-block text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full mt-1">
                        🎓 {t.admitted}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. FAQ ACCORDION */}
          <div className="rounded-3xl bg-white p-8 shadow-md space-y-5">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-xs text-gray-500">Informasi seputar sistem bimbingan mentor alumni.</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: 'Bagaimana jika jurusan atau kampus impian saya belum ada di daftar mentor?',
                  a: 'Tim otwptn memiliki jaringan alumni luas di UI, ITB, UGM, UNAIR, ITS, Undip, dan UB. Saat mendaftar paket mentor, kamu dapat mengajukan request jurusan spesifik dan kami akan mencocokkan mentor resmi dari fakultas tersebut dalam 1x24 jam.',
                },
                {
                  q: 'Apakah esai saya akan dituliskan oleh mentor (joki esai)?',
                  a: 'Sama sekali tidak. Menjual joki esai dilarang keras dan berisiko diskualifikasi kampus. Mentor kami berperan sebagai kurator intelektual: membedah kelemahan argumen, mempertajam sudut pandang, memperbaiki tata bahasa, dan memancing gagasan otentikmu sendiri.',
                },
                {
                  q: 'Berapa kali batas revisi esai di platform otwptn?',
                  a: 'Revisi esai bersama mentor personal tidak terbatas (unlimited revisions) hingga esai dinyatakan final dan siap di-submit ke portal seleksi resmi universitas.',
                },
                {
                  q: 'Kapan sesi Google Meet 1-on-1 bisa dijadwalkan?',
                  a: 'Jadwal Google Meet sangat fleksibel. Kamu dapat memilih waktu luangmu (sore atau akhir pekan) melalui kalender booking terintegrasi yang tersedia di dashboard mentee.',
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-gray-50 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left gap-4"
                  >
                    <span className="text-xs md:text-sm font-bold text-gray-900">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform ${openFaq === idx ? 'rotate-180 text-amber-600' : ''}`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed font-medium border-t border-gray-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 7. FINAL CALL TO ACTION STRIP */}
          <div className="rounded-3xl bg-white p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900">Siap Maksimalkan Peluang Non-Tes?</h3>
              <p className="text-xs text-gray-500">
                Pendaftaran paket mentor dibuka terbatas demi menjaga rasio bimbingan privat tetap 1-on-1.
              </p>
            </div>
            <Link
              href="/upgrade"
              className="btn-brand-primary px-8 py-3.5 rounded-full text-xs font-black shadow-md whitespace-nowrap"
            >
              Daftar Paket Mentor Sekarang
            </Link>
          </div>
        </div>
      ) : (
        /* =========================================================================
           STATE B: VIP UNLOCKED MENTORSHIP WORKSPACE
           ========================================================================= */
        <div className="space-y-6">
          {/* Mentor Profile Header Bar */}
          <div className="p-6 rounded-3xl bg-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ASSIGNED_MENTOR.avatar}
                alt=""
                className="w-16 h-16 rounded-2xl object-cover shadow-xs"
              />
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-900 mb-1">
                  <ShieldCheck size={12} className="text-amber-700" /> Mentor Pendamping Kamu
                </span>
                <h2 className="text-lg font-black text-gray-900">{ASSIGNED_MENTOR.name}</h2>
                <p className="text-xs text-gray-500 font-semibold">{ASSIGNED_MENTOR.major} · {ASSIGNED_MENTOR.univ}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href={`https://wa.me/${ASSIGNED_MENTOR.waNumber}?text=Halo%20Kak%20Rayhan,%20saya%20mentee%20otwptn%20ingin%20konsultasi%20esai.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-full text-xs font-extrabold bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors flex items-center gap-1.5"
              >
                <MessageCircle size={15} className="text-emerald-600" /> WhatsApp Mentor
              </a>
              <button
                onClick={() => setActiveTab('booking')}
                className="btn-brand-primary px-5 py-2.5 rounded-full text-xs font-black shadow-xs flex items-center gap-1.5"
              >
                <Calendar size={15} /> Booking 1-on-1 Meet
              </button>
            </div>
          </div>

          {/* Sub-Feature Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveTab('workspace')}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all ${
                activeTab === 'workspace'
                  ? 'btn-brand-primary'
                  : 'bg-white text-gray-700 shadow-xs hover:bg-gray-50'
              }`}
            >
              <FileText size={15} /> Collaborative Essay Workspace
            </button>

            <button
              onClick={() => setActiveTab('profile-rapor')}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all ${
                activeTab === 'profile-rapor'
                  ? 'btn-brand-primary'
                  : 'bg-white text-gray-700 shadow-xs hover:bg-gray-50'
              }`}
            >
              <Scan size={15} /> Rapor & Kelengkapan Profil (Scan OCR)
            </button>

            <button
              onClick={() => setActiveTab('booking')}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all ${
                activeTab === 'booking'
                  ? 'btn-brand-primary'
                  : 'bg-white text-gray-700 shadow-xs hover:bg-gray-50'
              }`}
            >
              <Calendar size={15} /> Jadwal Bimbingan 1-on-1 (Google Meet)
            </button>
          </div>

          {/* TAB 1: COLLABORATIVE ESSAY WORKSPACE */}
          {activeTab === 'workspace' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Document Paper Sheet */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-8 rounded-3xl bg-white shadow-md flex flex-col min-h-[640px]">
                  {/* Document Title & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-100">
                    <input
                      value={essayTitle}
                      onChange={e => setEssayTitle(e.target.value)}
                      className="text-base font-black text-gray-900 bg-transparent outline-none flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportPDF}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1.5 transition-colors"
                      >
                        <Download size={13} /> Export PDF
                      </button>
                      <button
                        onClick={() => setVersionHistoryOpen(true)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1.5 transition-colors"
                      >
                        <History size={13} /> Riwayat Versi
                      </button>
                    </div>
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gray-50 rounded-2xl mb-4 text-xs font-bold text-gray-700">
                    <button
                      onClick={() => handleFormat('Heading')}
                      className="p-1.5 rounded-lg hover:bg-gray-200 flex items-center gap-1"
                    >
                      <Heading1 size={14} /> Judul
                    </button>
                    <button
                      onClick={() => handleFormat('Bold')}
                      className="p-1.5 rounded-lg hover:bg-gray-200"
                    >
                      <Bold size={14} />
                    </button>
                    <button
                      onClick={() => handleFormat('Italic')}
                      className="p-1.5 rounded-lg hover:bg-gray-200"
                    >
                      <Italic size={14} />
                    </button>
                    <button
                      onClick={() => handleFormat('Underline')}
                      className="p-1.5 rounded-lg hover:bg-gray-200"
                    >
                      <Underline size={14} />
                    </button>
                    <button
                      onClick={() => handleFormat('List')}
                      className="p-1.5 rounded-lg hover:bg-gray-200"
                    >
                      <List size={14} />
                    </button>

                    <div className="h-4 w-px bg-gray-300 mx-1" />

                    {/* Mentor Annotation Tags */}
                    <span className="text-[10px] text-gray-400 uppercase font-extrabold mr-1">
                      Anotasi Mentor:
                    </span>
                    <button
                      onClick={() => handleFormat('HAPUS SAJA')}
                      className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 hover:bg-rose-200"
                    >
                      Hapus Saja
                    </button>
                    <button
                      onClick={() => handleFormat('PERLU BUKTI')}
                      className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 hover:bg-amber-200"
                    >
                      Perlu Bukti
                    </button>
                    <button
                      onClick={() => handleFormat('PERBAIKI KALIMAT')}
                      className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      Perbaiki Kalimat
                    </button>
                    <button
                      onClick={() => handleFormat('SUDAH KEREN')}
                      className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    >
                      Sudah Keren
                    </button>
                  </div>

                  {/* Document Paper Sheet */}
                  <textarea
                    value={essayContent}
                    onChange={e => setEssayContent(e.target.value)}
                    rows={16}
                    className="flex-1 w-full p-4 rounded-2xl bg-gray-50/50 text-sm leading-relaxed text-gray-900 font-serif outline-none resize-none"
                    placeholder="Mulai menulis draf essay kamu di sini..."
                  />

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100 mt-3 font-mono">
                    <span>{essayContent.split(/\s+/).filter(Boolean).length} kata</span>
                    <span>Tersimpan otomatis ke Cloud</span>
                  </div>
                </div>
              </div>

              {/* Right Margin: Mentor Annotation & Comment Cards */}
              <div className="space-y-4">
                <div className="p-6 rounded-3xl bg-white shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-amber-500" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                        Komentar Mentor ({comments.filter(c => !c.resolved).length})
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">Collaborative Review</span>
                  </div>

                  <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
                    {comments.map(c => (
                      <div
                        key={c.id}
                        className={`p-4 rounded-2xl transition-all ${
                          c.resolved
                            ? 'bg-gray-50 opacity-60'
                            : 'bg-amber-50/70 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={c.mentorAvatar}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-xs font-extrabold text-gray-900">
                              {c.mentorName}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400">{c.time}</span>
                        </div>

                        {/* Quoted Target */}
                        <div className="p-2 rounded-xl bg-white/90 text-xs font-serif italic text-gray-700 mb-2 border-l-2 border-amber-400">
                          &ldquo;{c.quote}&rdquo;
                        </div>

                        {/* Comment text */}
                        <p className="text-xs text-gray-800 font-medium leading-relaxed mb-3">
                          {c.comment}
                        </p>

                        {/* Replies Thread */}
                        {c.replies.length > 0 && (
                          <div className="space-y-1.5 pl-3 border-l-2 border-amber-200 mb-3">
                            {c.replies.map((r, ri) => (
                              <div key={ri} className="text-[11px]">
                                <span className="font-extrabold text-gray-900">{r.author}: </span>
                                <span className="text-gray-700">{r.text}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Resolve & Reply Actions */}
                        {!c.resolved && (
                          <div className="pt-2 border-t border-amber-100 flex flex-col gap-2">
                            <div className="flex items-center gap-1.5">
                              <input
                                value={replyInput[c.id] || ''}
                                onChange={e =>
                                  setReplyInput({ ...replyInput, [c.id]: e.target.value })
                                }
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleAddReply(c.id)
                                }}
                                placeholder="Balas saran mentor..."
                                className="flex-1 px-3 py-1.5 rounded-xl bg-white text-xs outline-none font-medium"
                              />
                              <button
                                onClick={() => handleAddReply(c.id)}
                                className="btn-brand-primary px-3 py-1.5 rounded-xl text-xs font-bold"
                              >
                                Balas
                              </button>
                            </div>
                            <button
                              onClick={() => handleResolveComment(c.id)}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 self-end"
                            >
                              <Check size={12} /> Tandai Selesai Direvisi
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RAPOR & KELENGKAPAN PROFIL (SCAN OCR) */}
          {activeTab === 'profile-rapor' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form & Scan Trigger */}
              <div className="lg:col-span-2 space-y-6">
                {/* Academic Context Card */}
                <div className="p-8 rounded-3xl bg-white shadow-md space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <School size={18} className="text-amber-500" />
                      <h3 className="text-sm font-black text-gray-900">
                        Profil Sekolah & Posisi Eligible Kamu
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">✓ Data Tersinkronisasi</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                        Asal Sekolah (SMA / SMK / MA)
                      </label>
                      <input
                        value={schoolName}
                        onChange={e => setSchoolName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                        Jurusan Saat Ini
                      </label>
                      <select
                        value={jurusan}
                        onChange={e => setJurusan(e.target.value as 'IPA' | 'IPS')}
                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none"
                      >
                        <option value="IPA">MIPA / Sains & Teknologi</option>
                        <option value="IPS">IPS / Sosial Humaniora</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                        Peringkat Eligible Sekolah
                      </label>
                      <input
                        value={eligibleRank}
                        onChange={e => setEligibleRank(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                        Jejak Alumni di PTN Target (3 Thn Terakhir)
                      </label>
                      <input
                        value={alumniCount}
                        onChange={e => setAlumniCount(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Scan Rapor OCR Section */}
                <div className="p-8 rounded-3xl bg-white shadow-md space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                        <Scan size={18} className="text-amber-500" /> Hasil Audit Nilai Rapor (Semester 1–5)
                      </h3>
                      <p className="text-xs text-gray-500">Mata pelajaran penentu bobot kelolosan prodi pilihan.</p>
                    </div>

                    <button
                      onClick={handleScanRapor}
                      disabled={scanning}
                      className="btn-brand-primary px-4 py-2 rounded-full text-xs font-black shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <Upload size={14} /> {scanning ? 'Menganalisis Rapor...' : 'Upload & Scan Ulang Rapor'}
                    </button>
                  </div>

                  {scanSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      OCR Berhasil: Nilai rapor 5 semester telah diperbarui dan diverifikasi otomatis.
                    </div>
                  )}

                  {/* Rapor Data Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-gray-100 text-[11px] font-black uppercase text-gray-400">
                          <th className="py-2.5 px-3">Mata Pelajaran</th>
                          <th className="py-2.5 px-3 text-center">Sem 1</th>
                          <th className="py-2.5 px-3 text-center">Sem 2</th>
                          <th className="py-2.5 px-3 text-center">Sem 3</th>
                          <th className="py-2.5 px-3 text-center">Sem 4</th>
                          <th className="py-2.5 px-3 text-center">Sem 5</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 font-semibold text-gray-900">
                        {Object.entries(raporData).map(([subject, grades]) => (
                          <tr key={subject} className="hover:bg-gray-50">
                            <td className="py-3 px-3 font-bold">{subject}</td>
                            {grades.map((grade, idx) => (
                              <td key={idx} className="py-3 px-3 text-center">
                                <span className="px-2.5 py-1 rounded-lg bg-gray-100 font-mono">
                                  {grade}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Upload Sertifikat Checklist */}
              <div className="space-y-4">
                <div className="p-6 rounded-3xl bg-white shadow-md space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <Trophy size={16} className="text-amber-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                      Sertifikat Prestasi Wajib
                    </h3>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed">
                    Mentor mewajibkan upload 3 sertifikat tertinggi untuk dikurasi bobot nilainya.
                  </p>

                  <div className="space-y-3">
                    {[
                      { name: 'Sertifikat 1 (Medali Perak OSN Informatika)', level: 'Nasional', status: 'Terunggah' },
                      { name: 'Sertifikat 2 (Juara 1 Lomba Web Design)', level: 'Provinsi', status: 'Terunggah' },
                      { name: 'Sertifikat 3 (Ketua OSIS / Kepemimpinan)', level: 'Sekolah', status: 'Perlu Dicek' },
                    ].map((cert, ci) => (
                      <div key={ci} className="p-3.5 rounded-2xl bg-gray-50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
                            {cert.level}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600">✓ {cert.status}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-900">{cert.name}</p>
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-3 rounded-full text-xs font-black bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center gap-2 transition-colors">
                    <Upload size={14} /> Unggah Sertifikat Baru
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BOOKING SESI 1-ON-1 GOOGLE MEET */}
          {activeTab === 'booking' && (
            <div className="p-8 rounded-3xl bg-white shadow-md max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Video size={24} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Jadwalkan Sesi 1-on-1 Google Meet</h3>
                  <p className="text-xs text-gray-500">Konsultasi privat 45–60 menit bersama {ASSIGNED_MENTOR.name}.</p>
                </div>
              </div>

              {bookingConfirmed ? (
                <div className="p-6 rounded-2xl bg-emerald-50 text-emerald-950 text-center space-y-3">
                  <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-black">Sesi Mentoring Berhasil Dijadwalkan!</h4>
                  <p className="text-xs leading-relaxed max-w-md mx-auto text-emerald-800">
                    Jadwal pada <strong>{bookingDate || 'Sabtu, 14:00 WIB'}</strong> untuk topik <strong>&ldquo;{bookingTopic}&rdquo;</strong> telah dikonfirmasi. Tautan Google Meet telah dikirimkan ke WhatsApp kamu.
                  </p>
                  <button
                    onClick={() => setBookingConfirmed(false)}
                    className="btn-brand-primary px-6 py-2 rounded-full text-xs font-bold inline-block mt-2"
                  >
                    Atur Jadwal Lain
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                      Pilih Tanggal & Waktu Sesi
                    </label>
                    <input
                      type="datetime-local"
                      value={bookingDate}
                      onChange={e => setBookingDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                      Topik Utama yang Ingin Dibahas
                    </label>
                    <select
                      value={bookingTopic}
                      onChange={e => setBookingTopic(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option>Review Essay Kalimat per Kalimat</option>
                      <option>Evaluasi Rasionalisasi Nilai Rapor & Kuota</option>
                      <option>Kurasi Portofolio & Sertifikat Lomba</option>
                      <option>Simulasi Wawancara / Verifikasi Berkas</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setBookingConfirmed(true)}
                    className="w-full btn-brand-primary py-3.5 rounded-full text-xs font-black shadow-md flex items-center justify-center gap-2 mt-4"
                  >
                    <Calendar size={15} /> Konfirmasi Jadwal Sesi Mentoring
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Version History Modal */}
          {versionHistoryOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
                <button
                  onClick={() => setVersionHistoryOpen(false)}
                  className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <History size={18} className="text-amber-600" />
                  <h3 className="text-sm font-black text-gray-900">Riwayat Versi Essay</h3>
                </div>

                <div className="space-y-3 mb-5">
                  {[
                    { ver: 'v1.2 (Saat Ini)', time: 'Hari ini, 10:20', author: 'Mentor Rayhan (Anotasi Ditambahkan)' },
                    { ver: 'v1.1', time: 'Kemarin, 16:45', author: 'Kamu (Perbaikan Paragraf 2)' },
                    { ver: 'v1.0 (Draf Awal)', time: '2 hari lalu, 11:00', author: 'Kamu (Draf Pertama Dibuat)' },
                  ].map((v, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-gray-50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-extrabold text-gray-900">{v.ver}</p>
                        <p className="text-[11px] text-gray-400">{v.author}</p>
                      </div>
                      <span className="text-[10px] text-gray-400">{v.time}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setVersionHistoryOpen(false)}
                  className="w-full btn-brand-primary py-2.5 rounded-full text-xs font-black"
                >
                  Tutup Riwayat
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mentor Dossier Preview Modal */}
      {selectedMentorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl relative space-y-5">
            <button
              onClick={() => setSelectedMentorModal(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedMentorModal.avatar}
                alt={selectedMentorModal.name}
                className="w-14 h-14 rounded-2xl object-cover shadow-xs"
              />
              <div>
                <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  ✓ Alumni Terverifikasi
                </span>
                <h3 className="text-base font-black text-gray-950 mt-1">{selectedMentorModal.name}</h3>
                <p className="text-xs font-bold text-amber-900">{selectedMentorModal.univ}</p>
                <p className="text-[11px] text-gray-500">{selectedMentorModal.major} · {selectedMentorModal.gradYear}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs bg-gray-50 p-4 rounded-2xl">
              <div className="flex justify-between">
                <span className="text-gray-500">Jalur Masuk:</span>
                <span className="font-black text-emerald-700">{selectedMentorModal.track}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Spesialisasi Review:</span>
                <span className="font-bold text-gray-900">{selectedMentorModal.specialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rating Mentee:</span>
                <span className="font-black text-amber-600 flex items-center gap-1">
                  <Star size={12} fill="currentColor" /> {selectedMentorModal.rating} ({selectedMentorModal.menteeCount} mentee lolos)
                </span>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-black uppercase text-gray-400 tracking-wider mb-2">
                Contoh Standar Anotasi Esai oleh Mentor Ini:
              </p>
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border-l-2 border-amber-400 text-xs text-gray-800 font-serif italic">
                &ldquo;{selectedMentorModal.sampleNote}&rdquo;
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/upgrade"
                className="flex-1 btn-brand-primary py-3 rounded-full text-xs font-black text-center shadow-md"
              >
                Pilih Mentor Ini
              </Link>
              <button
                onClick={() => setSelectedMentorModal(null)}
                className="px-5 py-3 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
