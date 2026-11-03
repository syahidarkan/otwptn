'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  Check,
  Star,
  Search,
  ArrowRight,
  Video,
  FileText,
  Sparkles,
} from 'lucide-react'

const FEATS = [
  'Konsultasi 1-on-1 langsung dengan mentor alumni',
  'Review essay personal, bukan cuma dari AI',
  'Strategi khusus sesuai jalur dan profilmu',
  'Akses prioritas ke semua fitur otwptn',
]

const PTN_LOGOS = [
  { name: 'UI', src: '/ptn-logos/ui.png' },
  { name: 'ITB', src: '/ptn-logos/itb.png' },
  { name: 'UGM', src: '/ptn-logos/ugm.png' },
  { name: 'UNAIR', src: '/ptn-logos/unair.png' },
]

export default function MentorSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [40, -40])
  const y2 = useTransform(scrollYProgress, [0, 1], [-20, 20])
  const rotate = useTransform(scrollYProgress, [0, 1], [-4, 4])

  // Animated Search Query cycling in Step 1
  const [searchQuery, setSearchQuery] = useState('Kedokteran UI')
  useEffect(() => {
    const queries = [
      'Kedokteran UI',
      'Teknik Informatika ITB',
      'Ilmu Komunikasi UGM',
      'SBM ITB',
      'Kedokteran UNAIR',
    ]
    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % queries.length
      setSearchQuery(queries[idx])
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const STARS = [
    { top: '4%', left: '5%', size: 18, op: 0.25, speed: y1 },
    { top: '15%', left: '90%', size: 14, op: 0.18, speed: y2 },
    { top: '50%', left: '94%', size: 36, op: 0.12, speed: y2 },
    { top: '65%', left: '3%', size: 22, op: 0.2, speed: y1 },
    { top: '88%', left: '92%', size: 16, op: 0.15, speed: y2 },
  ]

  return (
    <section
      ref={ref}
      id="mentor"
      className="section-pad px-4 sm:px-6 lg:px-8 relative overflow-hidden dark-section"
      style={{ background: 'var(--dark)' }}
    >
      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 85%)',
        }}
      />

      {/* Scattered floating stars via parallax */}
      {STARS.map((s, i) => (
        <motion.div
          key={i}
          style={{ y: s.speed, top: s.top, left: s.left, opacity: s.op }}
          className="absolute pointer-events-none"
        >
          <Star size={s.size} fill="var(--accent)" stroke="none" />
        </motion.div>
      ))}
      <motion.div style={{ y: y2, rotate }} className="absolute bottom-16 right-[10%] opacity-10 pointer-events-none">
        <Star size={48} fill="var(--accent)" stroke="none" />
      </motion.div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-20">
        {/* TOP PART: Butuh Bimbingan dengan Alumni */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h2 className="text-section-heading mb-5" style={{ color: 'var(--dark-fg)' }}>
              Butuh bimbingan dengan Alumni jalur yang sama sepertimu?
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--dark-muted)' }}>
              AI bisa bantu banyak hal, tapi kadang kamu butuh ngobrol langsung sama orang yang pernah di posisimu.
              Paket Intensif otwptn kasih kamu akses ke mentor asli - alumni yang lolos lewat jalur yang sama.
            </p>
            <ul className="space-y-2.5 mb-7">
              {FEATS.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check size={14} className="flex-shrink-0 mt-0.5 text-amber-400" style={{ color: '#ffd400' }} />
                  <span className="text-white font-semibold" style={{ color: '#ffffff' }}>
                    {f}
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/checkout/intensif" className="btn btn-primary px-6 py-3 text-sm">
              Lihat Paket Intensif
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="flex justify-center"
          >
            <motion.div style={{ y: y1 }}>
              <Image
                src="/mascot/mentor.png"
                alt="Tim mentor otwptn"
                width={400}
                height={299}
                className="drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* SUBTLE DIVIDER */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent w-full" />

        {/* BOTTOM PART: CARA KERJA (Merged into MentorSection with matching dark background) */}
        <div className="space-y-12">
          {/* Header Cara Kerja */}
          <div className="text-center space-y-3">
            <div className="inline-block">
              <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 text-gray-200 border border-white/15 shadow-2xs">
                Cara Kerja
              </span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Masuk Ke Kampus PTN Impian Jadi{' '}
              <span className="inline-block px-3.5 py-0.5 rounded-2xl bg-[#bbf7d0] text-emerald-950 font-black shadow-xs">
                Lebih Gampang!
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto font-medium">
              Hanya dalam 3 langkah sederhana, kamu bisa mulai perjalanan menuju kampus impianmu!
            </p>
          </div>

          {/* Cards Grid: Step 1 (Portrait) on left, Step 2 & Step 3 (Landscape) on right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* STEP 1: PILIH MENTOR (Col 1-5, Height fits content) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              {/* Step 1 Number Badge */}
              <div className="w-9 h-9 rounded-full bg-rose-500 text-white font-black text-sm flex items-center justify-center shadow-md mb-3 z-10">
                1
              </div>

              {/* Step 1 Card Body */}
              <div className="w-full rounded-3xl p-5 bg-[#18181b]/95 border border-rose-500/30 shadow-xl space-y-3">
                {/* Search Bar Mockup */}
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300">
                  <Search size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="font-semibold truncate text-white">{searchQuery}</span>
                </div>

                {/* Mentor Photo */}
                <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-800 border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                    alt="Mentor Chloe Rahmawati"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Alumni UI
                  </div>
                </div>

                {/* Mentor Info & Achievements */}
                <div>
                  <h4 className="text-base font-black text-white">Chloe Rahmawati</h4>
                  <p className="text-xs text-gray-400 font-medium">
                    Ilmu Komputer · Universitas Indonesia
                  </p>
                </div>

                <ul className="text-[11px] text-gray-300 space-y-1 list-disc list-inside font-medium leading-relaxed">
                  <li>Medali Emas Puspresnas OSN 2024</li>
                  <li>Parlemen Remaja Nasional 2023</li>
                  <li>Top 1% Skor UTBK SNBT & Lolos SNBP</li>
                </ul>

                {/* Tags, PTN Logos & Otbee Stamp Inside Card 1 */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap gap-1">
                      {['UI', 'ITB', 'UGM', 'UNAIR'].map(p => (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 text-[10px] font-bold border border-rose-500/20"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {PTN_LOGOS.map(logo => (
                        <div
                          key={logo.name}
                          className="w-5 h-5 rounded-full bg-white/10 border border-white/15 p-0.5 flex items-center justify-center"
                          title={logo.name}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={logo.src} alt={logo.name} className="w-full h-full object-contain" />
                        </div>
                      ))}
                      <span className="text-[10px] text-gray-400 font-bold">+12 PTN</span>
                    </div>
                  </div>

                  {/* Mascot Inside Card 1 (Verified Stamp) */}
                  <div className="flex flex-col items-center flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/mascot/thumbsup.png"
                      alt="Verified Otbee"
                      className="w-10 h-10 object-contain drop-shadow"
                    />
                    <span className="text-[8px] font-black uppercase text-amber-300 tracking-wider mt-0.5">
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Label Pill */}
              <div className="mt-3">
                <span className="px-4 py-1.5 rounded-full bg-white/10 text-xs font-bold text-gray-200 border border-white/15 shadow-2xs inline-block">
                  Pilih mentor yang sesuai dengan kamu
                </span>
              </div>
            </div>

            {/* STEP 2 & STEP 3 (Col 6-12, LANDSCAPE CARDS) */}
            <div className="lg:col-span-7 space-y-8">
              {/* STEP 2: TULIS CATATAN (LANDSCAPE) */}
              <div className="flex flex-col items-center sm:items-start w-full">
                <div className="w-9 h-9 rounded-full bg-cyan-500 text-white font-black text-sm flex items-center justify-center shadow-md mb-3 z-10 self-center sm:self-start">
                  2
                </div>

                {/* Landscape Card Body 2 */}
                <div className="w-full rounded-3xl p-5 bg-[#18181b]/95 border border-cyan-500/30 shadow-xl flex flex-col sm:flex-row items-center gap-5">
                  {/* Left Side: Note Content */}
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                      <span className="text-base">📝</span>
                      <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                        Catatan Target & Kebutuhan Kamu
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                      &ldquo;Halo Kak! Aku ingin masuk ke Fasilkom UI atau Teknik Informatika ITB lewat SNBP atau SNBT. Nilai raporku rata-rata 92.5, tapi aku masih bingung menyusun esai motivasi diri dan memilih sertifikat yang punya bobot tertinggi. Butuh bimbingan 1-on-1 langsung dari alumni yang pernah lolos.&rdquo;
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 text-[10px] font-bold border border-cyan-500/20">
                        Bedah Esai
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 text-[10px] font-bold border border-cyan-500/20">
                        Review Portofolio
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 text-[10px] font-bold border border-cyan-500/20">
                        Simulasi Wawancara
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Mascot Inside Card 2 (Otbee Taking Notes at Desk) */}
                  <div className="w-32 sm:w-36 flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/mascot/glasses-writing-desk.png"
                      alt="Otbee Writing Notes"
                      className="w-20 h-auto object-contain drop-shadow"
                    />
                    <span className="text-[9px] font-bold text-cyan-200 text-center mt-1.5 leading-tight">
                      Otbee catat kebutuhanmu
                    </span>
                  </div>
                </div>

                {/* Bottom Label Pill */}
                <div className="mt-3 self-center sm:self-start">
                  <span className="px-4 py-1.5 rounded-full bg-white/10 text-xs font-bold text-gray-200 border border-white/15 shadow-2xs inline-block">
                    Tulis catatan agar mentor tau tentang kamu
                  </span>
                </div>
              </div>

              {/* STEP 3: KETEMU DENGAN MENTOR (LANDSCAPE) */}
              <div className="flex flex-col items-center sm:items-start w-full">
                <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md mb-3 z-10 self-center sm:self-start">
                  3
                </div>

                {/* Landscape Card Body 3 */}
                <div className="w-full rounded-3xl p-5 bg-[#18181b]/95 border border-purple-500/30 shadow-xl flex flex-col sm:flex-row items-center gap-5">
                  {/* Left Side: Video Call Mockup */}
                  <div className="flex-1 w-full relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-900 border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
                      alt="Live Mentoring Google Meet"
                      className="w-full h-full object-cover"
                    />

                    {/* Live Session Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-[9px] font-black text-white flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      <span>Live 1-on-1 Session</span>
                    </div>

                    {/* Student PiP */}
                    <div className="absolute bottom-2 right-2 w-16 h-12 rounded-lg overflow-hidden border border-white/80 shadow-md bg-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80"
                        alt="Student Waving"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Right Side: Mascot Inside Card 3 (Otbee with Headset on Video Call) */}
                  <div className="w-full sm:w-44 flex-shrink-0 space-y-2 p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/mascot/video-call-match.png"
                      alt="Otbee Video Call"
                      className="w-20 h-auto object-contain drop-shadow"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1 text-[10px] font-black text-purple-300">
                        <Video size={12} />
                        <span>Google Meet 45 Mnt</span>
                      </div>
                      <p className="text-[9px] text-gray-400 leading-tight">
                        Screen sharing & bedah esai kalimat per kalimat
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Label Pill */}
                <div className="mt-3 self-center sm:self-start">
                  <span className="px-4 py-1.5 rounded-full bg-white/10 text-xs font-bold text-gray-200 border border-white/15 shadow-2xs inline-block">
                    Ketemu dengan mentor dan dapatkan bimbingan
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Button */}
          <div className="pt-4 text-center">
            <Link
              href="/checkout/intensif"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-gray-950 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span>Lihat Pilihan Mentor Alumni</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
