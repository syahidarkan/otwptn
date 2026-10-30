'use client'

// Adapted from pintarly — stats ("Mereka Udah Mulai. Kamu Kapan?") stacked above the bottom CTA, dark fades into the gradient CTA bg

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Zap } from 'lucide-react'

const CONFETTI_COLORS = ['#ffd400', '#22c55e', '#60a5fa', '#f472b6', '#fb923c']

function Confetti({ fire }: { fire: boolean }) {
  const pieces = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      angle: (i / 18) * Math.PI * 2 + Math.random() * 0.4,
      dist: 60 + Math.random() * 50,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 4 + Math.random() * 4,
    }))
  ).current

  if (!fire) return null
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {pieces.map(p => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-sm"
          style={{ width: p.size, height: p.size, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist - 20,
            opacity: 0,
            rotate: 180,
          }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

function CountUpStat({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [n, setN] = useState(0)
  const [burst, setBurst] = useState(false)

  useEffect(() => {
    if (!inView) return
    let raf: number
    const start = performance.now()
    const dur = 1400
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      setN(value * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setBurst(true)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value])

  return (
    <span ref={ref} className="relative inline-block">
      {n.toFixed(decimals)}
      <Confetti fire={burst} />
    </span>
  )
}

export default function StatsCTASection() {
  return (
    <>
      {/* Stats — dark */}
      <section className="section-pad px-4 dark-section" style={{ background: 'var(--dark)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex justify-center mb-6"
          >
            <Image src="/mascot/top.png" alt="Alumni otwptn" width={420} height={313} className="drop-shadow-xl" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="text-section-heading mb-14"
            style={{ color: '#ffffff' }}
          >
            <span style={{ color: '#ffffff' }}>Mereka Udah Mulai. </span>
            <span style={{ color: '#ffd400' }} className="font-extrabold text-[#ffd400]">Kamu Kapan?</span>
          </motion.h2>

          <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto">
            <div>
              <div className="font-bold mb-2 text-white" style={{ fontFamily: 'var(--font-heading)', color: '#ffffff', letterSpacing: '-0.04em', fontSize: 'clamp(3.5rem, 8vw, 6rem)' }}>
                <CountUpStat value={500} />+
              </div>
              <div className="text-sm font-semibold text-white" style={{ color: '#ffffff' }}>siswa aktif belajar</div>
            </div>
            <div>
              <div className="font-bold mb-2 text-white" style={{ fontFamily: 'var(--font-heading)', color: '#ffffff', letterSpacing: '-0.04em', fontSize: 'clamp(3.5rem, 8vw, 6rem)' }}>
                <CountUpStat value={4.9} decimals={1} />
              </div>
              <div className="text-sm font-semibold text-white" style={{ color: '#ffffff' }}>rating dari alumni</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA — hero gradient, like before */}
      <section className="section-pad px-4" style={{ background: 'var(--hero-grad)' }}>
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex justify-center mb-4"
          >
            <Image src="/mascot/trophy-jump.png" alt="otwptn" width={140} height={160} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
            className="text-section-heading text-fg mb-8"
          >
            Jangan Cuma Overthinking.<br />Mulai Sekarang.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.16, ease: 'easeOut' }}
          >
            <Link href="/register" className="btn btn-primary px-7 py-4" style={{ fontSize: '15px' }}>
              <Zap size={15} fill="currentColor" />
              Mulai Belajar Sekarang
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
