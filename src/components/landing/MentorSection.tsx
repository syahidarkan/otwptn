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
  FileEdit,
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

  // Real Typing effect in Search Bar (Step 1)
  const [displayText, setDisplayText] = useState('')
  useEffect(() => {
    const queries = [
      'Teknik Informatika ITB',
      'Kedokteran UI',
      'Ilmu Komunikasi UGM',
      'SBM ITB',
      'Kedokteran UNAIR',
    ]
    let queryIdx = 0
    let charIdx = 0
    let isDeleting = false
    let timeoutId: NodeJS.Timeout

    function tick() {
      const current = queries[queryIdx]
      if (!isDeleting) {
        setDisplayText(current.slice(0, charIdx + 1))
        charIdx++
        if (charIdx === current.length) {
          isDeleting = true
          timeoutId = setTimeout(tick, 2200)
          return
        }
        timeoutId = setTimeout(tick, 85)
      } else {
        setDisplayText(current.slice(0, charIdx - 1))
        charIdx--
        if (charIdx === 0) {
          isDeleting = false
          queryIdx = (queryIdx + 1) % queries.length
          timeoutId = setTimeout(tick, 450)
          return
        }
        timeoutId = setTimeout(tick, 40)
      }
    }

    timeoutId = setTimeout(tick, 400)
    return () => clearTimeout(timeoutId)
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

      <div className="max-w-6xl mx-auto relative z-10 space-y-16">
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

        {/* 3 CARDS WORKFLOW (Seamlessly connected without divider line) */}
        <div>
          {/* 3 Columns Grid: 1 Kiri Card Panjang, 2 Tengah Sedang, 3 Kanan Landscape */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* COLUMN 1 (KIRI: Card Panjang, Background Putih) */}
            <div className="flex flex-col items-center">
              {/* Yellow Bubble 1 */}
              <div className="w-9 h-9 rounded-full bg-amber-400 text-gray-950 font-black text-sm flex items-center justify-center shadow-md mb-3 z-10">
                1
              </div>

              {/* Card 1 Body (Panjang/Portrait - Background Putih) */}
              <div className="w-full rounded-3xl p-5 bg-white border border-rose-200 shadow-md space-y-3">
                {/* Search Bar with Typing Effect */}
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs shadow-2xs">
                  <Search size={14} className="text-gray-500 flex-shrink-0" />
                  <span className="font-bold text-gray-950 truncate flex items-center">
                    {displayText}
                    <span className="inline-block w-0.5 h-3.5 bg-amber-500 ml-0.5 animate-pulse" />
                  </span>
                </div>

                {/* Mentor Photo */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 border border-gray-100">
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

                {/* Mentor Info */}
                <div>
                  <h4 className="text-base font-black text-gray-950">Chloe Rahmawati</h4>
                  <p className="text-xs text-gray-800 font-bold mt-0.5">
                    Ilmu Komputer · Universitas Indonesia
                  </p>
                </div>

                {/* Bullet achievements */}
                <ul className="text-[11px] text-gray-950 space-y-1 list-disc list-inside font-bold leading-relaxed">
                  <li>Medali Emas Puspresnas OSN 2024</li>
                  <li>Parlemen Remaja Nasional 2023</li>
                  <li>Top 1% Skor UTBK SNBT & Lolos SNBP</li>
                </ul>

                {/* Tags & PTN Logos */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap gap-1">
                      {['UI', 'ITB', 'UGM', 'UNAIR'].map(p => (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-900 text-[10px] font-bold border border-rose-200"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      {PTN_LOGOS.map(logo => (
                        <div
                          key={logo.name}
                          className="w-5 h-5 rounded-full bg-white border border-gray-200 p-0.5 flex items-center justify-center shadow-2xs"
                          title={logo.name}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={logo.src} alt={logo.name} className="w-full h-full object-contain" />
                        </div>
                      ))}
                      <span className="text-[10px] text-gray-700 font-bold ml-0.5">+12 PTN</span>
                    </div>
                  </div>

                  {/* Mascot Inside Card 1 */}
                  <div className="flex flex-col items-center flex-shrink-0 bg-amber-50/70 border border-amber-200 rounded-2xl p-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/mascot/thumbsup.png"
                      alt="Verified Otbee"
                      className="w-8 h-8 object-contain drop-shadow"
                    />
                    <span className="text-[8px] font-black uppercase text-amber-950 tracking-wider">
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Label Pill 1 */}
              <div className="mt-3 text-center">
                <span className="px-3.5 py-1.5 rounded-full bg-white text-xs font-black text-gray-950 border border-gray-300 shadow-sm inline-block">
                  Pilih mentor yang sesuai dengan kamu
                </span>
              </div>
            </div>

            {/* COLUMN 2 (TENGAH: Card Sedang / Tidak Sepanjang Kiri - Background Putih) */}
            <div className="flex flex-col items-center">
              {/* Yellow Bubble 2 */}
              <div className="w-9 h-9 rounded-full bg-amber-400 text-gray-950 font-black text-sm flex items-center justify-center shadow-md mb-3 z-10">
                2
              </div>

              {/* Card 2 Body (Sedang/Fit Content - Background Putih) */}
              <div className="w-full rounded-3xl p-5 bg-white border-2 border-cyan-400 shadow-md space-y-3.5">
                {/* Note Header (Icon instead of Emoji) */}
                <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
                  <FileEdit size={16} className="text-cyan-800 flex-shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-950">
                    Catatan
                  </span>
                </div>

                {/* Note Content (Pure Black Font) */}
                <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200">
                  <p className="text-xs text-gray-950 leading-relaxed font-bold">
                    Aku ingin masuk ke Fasilkom UI atau Teknik Informatika ITB dengan jurusan favorit. Nilai raporku rata-rata 92.5 tapi aku masih bingung menyusun esai motivasi diri dan memilih sertifikat yang punya bobot tertinggi. Butuh bimbingan dalam proses aplikasi serta tips lolos SNBP.
                  </p>
                </div>

                {/* Tags & Mascot Inside Card 2 */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-950 text-[10px] font-bold border border-cyan-300">
                      Bedah Esai
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-950 text-[10px] font-bold border border-cyan-300">
                      Review Portofolio
                    </span>
                  </div>

                  {/* Mascot Inside Card 2 (Otbee Writing Notes at Desk) */}
                  <div className="flex-shrink-0 bg-cyan-50/80 border border-cyan-200 rounded-2xl p-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/mascot/glasses-writing-desk.png"
                      alt="Otbee Writing Notes"
                      className="w-10 h-10 object-contain drop-shadow"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Label Pill 2 */}
              <div className="mt-3 text-center">
                <span className="px-3.5 py-1.5 rounded-full bg-white text-xs font-black text-gray-950 border border-gray-300 shadow-sm inline-block">
                  Tulis catatan agar mentor tau tentang kamu
                </span>
              </div>
            </div>

            {/* COLUMN 3 (KANAN: Landscape Card - Background Putih) */}
            <div className="flex flex-col items-center">
              {/* Yellow Bubble 3 */}
              <div className="w-9 h-9 rounded-full bg-amber-400 text-gray-950 font-black text-sm flex items-center justify-center shadow-md mb-3 z-10">
                3
              </div>

              {/* Card 3 Body (Landscape Aspect Video - Background Putih) */}
              <div className="w-full rounded-3xl p-5 bg-white border-2 border-purple-400 shadow-md space-y-3">
                {/* Landscape Video Screen */}
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-gray-200 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
                    alt="Live Mentoring Google Meet"
                    className="w-full h-full object-cover"
                  />

                  {/* Live Session Badge at top left */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-[9px] font-black text-white flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>Live Session</span>
                  </div>

                  {/* Student PiP in bottom right */}
                  <div className="absolute bottom-2 right-2 w-14 h-11 rounded-lg overflow-hidden border border-white/80 shadow-md bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80"
                      alt="Student Waving"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Session Highlights & Mascot Inside Card 3 */}
                <div className="pt-1 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[11px] font-black text-purple-950">
                      <Video size={13} className="text-purple-700" />
                      <span>Google Meet 45 Menit</span>
                    </div>
                    <p className="text-[10px] text-gray-900 font-bold">
                      Diskusi 1-on-1 & koreksi esai kalimat demi kalimat
                    </p>
                  </div>

                  {/* Mascot Inside Card 3 (Otbee with Headset) */}
                  <div className="flex-shrink-0 bg-purple-50 border border-purple-200 rounded-2xl p-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/mascot/video-call-match.png"
                      alt="Otbee Video Call"
                      className="w-10 h-10 object-contain drop-shadow"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Label Pill 3 */}
              <div className="mt-3 text-center">
                <span className="px-3.5 py-1.5 rounded-full bg-white text-xs font-black text-gray-950 border border-gray-300 shadow-sm inline-block">
                  Ketemu dengan mentor dan dapatkan bimbingan
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Right CTA Button (Brand Yellow Button) */}
          <div className="flex justify-end mt-6">
            <Link
              href="/checkout/intensif"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-black bg-amber-400 hover:bg-amber-300 text-gray-950 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
            >
              <span>Lihat Pilihan Mentor</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
