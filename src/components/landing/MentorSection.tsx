'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Check, Star } from 'lucide-react'

const FEATS = [
  'Konsultasi 1-on-1 langsung dengan mentor alumni',
  'Review essay personal, bukan cuma dari AI',
  'Strategi khusus sesuai jalur dan profilmu',
  'Akses prioritas ke semua fitur otwptn',
]

export default function MentorSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [40, -40])
  const y2 = useTransform(scrollYProgress, [0, 1], [-20, 20])
  const rotate = useTransform(scrollYProgress, [0, 1], [-4, 4])

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

      <div className="max-w-6xl mx-auto relative z-10">
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
      </div>
    </section>
  )
}
