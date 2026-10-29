import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Rocket,
  HelpCircle,
  Flame,
  Share2,
  FileCheck2,
  Calculator,
  PlayCircle,
  CheckCircle2,
  Circle,
  Sparkles,
} from 'lucide-react'
import JalurTracker from '@/components/dashboard/JalurTracker'
import QuoteCard from '@/components/dashboard/QuoteCard'
import CardPattern, { type PatternType } from '@/components/ui/CardPattern'
import AmbientStarsCanvas from '@/components/dashboard/AmbientStarsCanvas'
import AjakTemanCard from '@/components/dashboard/AjakTemanCard'

interface FeatureConfig {
  label: string
  href: string
  img: string
  bg: string
  border: string
  textColor: string
  pattern: PatternType
  patternColor: string
}

const FEATURES: FeatureConfig[] = [
  {
    label: 'Essay AI Review',
    href: '/dashboard/essay',
    img: '/mascot-hd/writing-essay.png',
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 60%, #fde68a 100%)',
    border: 'rgba(251, 191, 36, 0.4)',
    textColor: '#78350f',
    pattern: 'feature-essay',
    patternColor: '#b45309',
  },
  {
    label: 'Kalkulator Peluang',
    href: '/dashboard/kalkulator',
    img: '/mascot-hd/percent-ring.png',
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)',
    border: 'rgba(74, 222, 128, 0.4)',
    textColor: '#065f46',
    pattern: 'feature-calc',
    patternColor: '#059669',
  },
  {
    label: 'Otbee AI',
    href: '/dashboard/otbee',
    img: '/mascot-hd/ai-robot.png',
    bg: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 60%, #c7d2fe 100%)',
    border: 'rgba(129, 140, 248, 0.4)',
    textColor: '#312e81',
    pattern: 'feature-ai',
    patternColor: '#4f46e5',
  },
  {
    label: 'Modul & Video',
    href: '/dashboard/ecourse',
    img: '/mascot-hd/tablet-play.png',
    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 60%, #bfdbfe 100%)',
    border: 'rgba(96, 165, 250, 0.4)',
    textColor: '#1e3a8a',
    pattern: 'feature-video',
    patternColor: '#2563eb',
  },
  {
    label: 'Mentor Alumni',
    href: '/checkout/intensif',
    img: '/mascot-hd/trio-mentor.png',
    bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 60%, #fbcfe8 100%)',
    border: 'rgba(244, 114, 182, 0.4)',
    textColor: '#831843',
    pattern: 'mentor-cosmic',
    patternColor: '#db2777',
  },
  {
    label: 'Tracking Jalur',
    href: '/dashboard/tracking-jalur',
    img: '/mascot-hd/roadmap-flags.png',
    bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 60%, #fed7aa 100%)',
    border: 'rgba(251, 146, 60, 0.4)',
    textColor: '#7c2d12',
    pattern: 'feature-tracking',
    patternColor: '#ea580c',
  },
  {
    label: 'Penyimpanan Dokumen',
    href: '/dashboard/dokumen',
    img: '/mascot-hd/file-box-storage.png',
    bg: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 60%, #99f6e4 100%)',
    border: 'rgba(45, 212, 191, 0.4)',
    textColor: '#134e4a',
    pattern: 'feature-docs',
    patternColor: '#0d9488',
  },
  {
    label: 'Cari Teman Belajar',
    href: '/dashboard/teman',
    img: '/mascot-hd/headset-wave.png',
    bg: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 60%, #e9d5ff 100%)',
    border: 'rgba(192, 132, 252, 0.4)',
    textColor: '#581c87',
    pattern: 'feature-community',
    patternColor: '#9333ea',
  },
  {
    label: 'Komunitas',
    href: '/komunitas',
    img: '/mascot-hd/megaphone-community.png',
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 60%, #fde68a 100%)',
    border: 'rgba(245, 158, 11, 0.4)',
    textColor: '#78350f',
    pattern: 'honeycomb-gold',
    patternColor: '#d97706',
  },
]

const DAYS = ['S', 'S', 'R', 'K', 'J', 'S', 'M']

const TIER_NAME: Record<string, string> = {
  free: 'Free',
  review: 'Review',
  dokumen: 'Reguler',
  menyeluruh: 'Intensif',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, tier, school_name, school, avg_rapor, cert_count, target_jalurs')
    .eq('id', user.id)
    .single()

  const firstName = (profile?.full_name || 'Pejuang PTN').split(' ')[0]
  const tier = profile?.tier || 'free'
  const isFree = tier === 'free'

  const steps = [
    { label: 'Lengkapi profil sekolah', done: !!(profile?.school_name || profile?.school), href: '/profil' },
    { label: 'Isi nilai rapor', done: profile?.avg_rapor != null, href: '/dashboard/kalkulator' },
    { label: 'Tambah sertifikat / prestasi', done: (profile?.cert_count ?? 0) > 0, href: '/profil' },
    { label: 'Pilih jalur target', done: (profile?.target_jalurs?.length ?? 0) > 0, href: '#jalur' },
    { label: 'Mulai essay pertamamu', done: false, href: '/dashboard/essay' },
  ]
  const doneCount = steps.filter(s => s.done).length

  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="glass-badge text-xs font-black uppercase text-gray-800 tracking-wider">
          <Rocket size={13} className="text-amber-500" /> Paket {TIER_NAME[tier] ?? tier}
        </div>
        <Link
          href="/komunitas"
          className="glass-badge text-xs font-bold text-gray-700 hover:text-black transition-colors"
        >
          <HelpCircle size={13} className="text-gray-500" /> Panduan
        </Link>
      </div>

      <div className="mb-7">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-1">
          Selamat datang kembali, {firstName}!
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Siap melanjutkan persiapan hari ini? Mari raih kampus impianmu.
        </p>
      </div>

      {/* Main CTA + Streak Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Card 1: Lanjutkan Essay-mu (Golden Amber Luxury Pattern) */}
        <div
          className="lg:col-span-2 rounded-3xl p-7 md:p-8 relative overflow-hidden flex flex-col justify-between min-h-[230px] shadow-md transition-all hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef08a 40%, #ffd400 100%)',
          }}
        >
          {/* Custom Honeycomb & Pen Doodle Pattern */}
          <CardPattern
            type="honeycomb-gold"
            opacity={0.22}
            style={{ color: '#b45309' }}
          />

          {/* Frosted highlight reflection */}
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none opacity-40 blur-3xl"
            style={{ background: 'rgba(255, 255, 255, 0.8)' }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-md">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md !text-amber-950 mb-2 shadow-xs" style={{ color: '#451a03' }}>
              <Sparkles size={12} className="text-amber-600" /> Draf Aktif
            </span>
            <p className="text-xs font-black tracking-wider uppercase mb-0.5" style={{ color: '#522b05' }}>
              Halo {firstName}
            </p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2" style={{ color: '#000000' }}>
              Lanjutkan Essay-mu
            </h2>
            <p className="text-sm font-semibold leading-relaxed mb-5" style={{ color: '#1f1608' }}>
              Dapatkan review AI instan dan masukan komprehensif untuk menyempurnakan essay SNBP-mu.
            </p>
            <Link
              href="/dashboard/essay"
              className="btn-brand-dark inline-flex items-center gap-2"
            >
              Mulai Sekarang <ArrowRight size={15} />
            </Link>
          </div>

          {/* Mascot Asset - Full Uncropped HD */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot-hd/maskot-lanjutkan-draft-essay.png"
            alt="Otbee Lanjutkan Essay"
            className="absolute bottom-0 right-3 pointer-events-none filter drop-shadow-md hidden sm:block object-contain"
            style={{ height: '92%', width: 'auto' }}
          />
        </div>

        {/* Card: Streak Tracker (Glass Panel) */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600">
                  <Flame size={20} className="fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <span className="text-lg font-black text-gray-900">0 hari</span>
                  <p className="text-[11px] font-semibold text-gray-500">Streak Belajar</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                0 / 7 hari
              </span>
            </div>

            <div className="flex justify-between gap-1 mb-5">
              {DAYS.map((d, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-gray-200 text-gray-400 bg-white/60"
                >
                  {d}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200/80 pt-4 flex items-center justify-between text-sm">
            <div>
              <p className="font-extrabold text-base text-gray-900">0</p>
              <p className="text-xs text-gray-500">materi selesai</p>
            </div>
            <div className="text-right">
              <p className="font-extrabold text-base text-gray-900">100%</p>
              <p className="text-xs text-gray-500">akurasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Upgrade ke Paket Mentor (Dark Navy Explorer Doodle Pattern matching Screenshot 3) */}
      {isFree && (
        <div
          className="rounded-3xl p-7 md:p-8 mb-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #07152b 0%, #0a1f40 50%, #122f5c 100%)',
          }}
        >
          {/* Exact Pattern from User Screenshot 3 */}
          <CardPattern
            type="navy-explorer"
            opacity={0.24}
            style={{ color: '#38bdf8' }}
          />

          {/* Three.js Ambient Starlight Canvas */}
          <AmbientStarsCanvas />

          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 backdrop-blur-md text-sky-200 mb-3">
              <Sparkles size={12} className="text-sky-300" /> Bimbingan Intensif PTN
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-1.5">
              Upgrade ke Paket Mentor
            </h2>
            <p className="text-2xl font-black text-amber-400 mb-2.5">
              Mulai dari Rp50.000
            </p>
            <p className="text-sm font-medium leading-relaxed text-slate-200/90 mb-6 max-w-lg">
              Review essay langsung dari mentor alumni UI, ITB & UGM, akses modul dokumen tak terbatas, serta penyusunan strategi personal sesuai targetmu.
            </p>
            <Link
              href="/dashboard/mentor"
              className="btn-brand-primary inline-flex items-center gap-2"
            >
              Lihat Penawaran <ArrowRight size={15} />
            </Link>
          </div>

          {/* Asset Upgrade Mentor */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/fitur/upgrade-paket.png"
            alt=""
            className="relative z-10 flex-shrink-0 pointer-events-none filter drop-shadow-2xl"
            style={{ height: 260, width: 'auto' }}
          />
        </div>
      )}

      {/* Akses Cepat */}
      <div className="mb-8">
        <h2 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">
          Akses Cepat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {[
            {
              label: 'Essay AI Review',
              sub: 'Review instan draf essay-mu',
              href: '/dashboard/essay',
              icon: FileCheck2,
              iconColor: 'text-amber-500',
              iconBg: 'bg-amber-50',
            },
            {
              label: 'Kalkulator Peluang',
              sub: 'Hitung peluang lolos jalurmu',
              href: '/dashboard/kalkulator',
              icon: Calculator,
              iconColor: 'text-emerald-500',
              iconBg: 'bg-emerald-50',
            },
            {
              label: 'Modul & Video',
              sub: 'Materi & strategi lengkap',
              href: '/dashboard/ecourse',
              icon: PlayCircle,
              iconColor: 'text-blue-500',
              iconBg: 'bg-blue-50',
            },
          ].map(({ label, sub, href, icon: Icon, iconColor, iconBg }) => (
            <Link
              key={href}
              href={href}
              className="glass-panel rounded-2xl p-4 flex items-center gap-3.5 hover-lift transition-all"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}
              >
                <Icon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate">{label}</p>
                <p className="text-xs text-gray-500 truncate">{sub}</p>
              </div>
              <ArrowRight size={16} className="text-gray-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Langkah Pertama Checklist */}
      <div className="glass-panel rounded-3xl p-6 md:p-7 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Langkah Pertama</h2>
            <p className="text-xs text-gray-500">Selesaikan langkah awal untuk membuka potensi maksimal akunmu</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
            {doneCount} / {steps.length} selesai
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-gray-200/70 mb-5">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(doneCount / steps.length) * 100}%`,
              background: 'linear-gradient(90deg, #ffd700 0%, #f59e0b 100%)',
            }}
          />
        </div>
        <div className="flex flex-col divide-y divide-gray-100">
          {steps.map(s => (
            <Link
              key={s.label}
              href={s.href}
              className="flex items-center justify-between py-3 hover:px-2 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                {s.done ? (
                  <CheckCircle2 size={19} className="text-emerald-600" />
                ) : (
                  <Circle size={19} className="text-gray-300" />
                )}
                <span
                  className={`text-sm font-medium ${
                    s.done ? 'line-through text-gray-400' : 'text-gray-800 font-semibold'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              <ArrowRight size={15} className="text-gray-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Jalur Tracker */}
      <div id="jalur" className="mb-8 scroll-mt-20">
        <JalurTracker />
      </div>

      {/* Semua Fitur Grid (9 Patterned Glass Cards) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Semua Fitur</h2>
            <p className="text-xs text-gray-500">Eksplorasi seluruh perangkat penunjang kelulusanmu</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <Link
              key={f.label}
              href={f.href}
              className="hover-lift rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow-sm transition-all"
              style={{
                background: f.bg,
              }}
            >
              {/* Unique Themed Pattern Overlay for Each Card */}
              <CardPattern
                type={f.pattern}
                opacity={0.18}
                style={{ color: f.patternColor }}
              />

              <div className="relative z-10 flex items-start justify-between">
                <span
                  className="text-sm font-extrabold leading-tight max-w-[70%]"
                  style={{ color: f.textColor }}
                >
                  {f.label}
                </span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/50 backdrop-blur-xs">
                  <ArrowRight size={13} style={{ color: f.textColor }} />
                </div>
              </div>

              {/* HD Feature Mascot - Fully Uncropped */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.img}
                alt={f.label}
                className="absolute bottom-1 right-1 pointer-events-none filter drop-shadow-xs object-contain"
                style={{ height: '74%', maxHeight: '115px', width: 'auto' }}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Tantangan + Quote Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tantangan Hari Ini */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 mb-1">Tantangan Hari Ini</h2>
            <p className="text-xs text-gray-500 mb-4">Kumpulkan XP dan bangun konsistensimu setiap hari</p>
            <div className="flex flex-col divide-y divide-gray-100">
              {[
                { label: 'Lengkapi satu langkah pertama', xp: 20 },
                { label: 'Baca satu modul belajar', xp: 15 },
                { label: 'Ajak satu teman gabung', xp: 15 },
              ].map(c => (
                <div key={c.label} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Circle size={16} className="text-gray-300" />
                    <span className="text-sm font-medium text-gray-800">{c.label}</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    +{c.xp} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quote Card & Ajak Teman */}
        <div className="flex flex-col gap-5">
          <QuoteCard />
          <AjakTemanCard userRefCode={user?.id ? user.id.slice(0, 8).toUpperCase() : 'PEJUANG2026'} />
        </div>
      </div>
    </div>
  )
}
