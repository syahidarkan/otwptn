'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { Zap, ArrowRight, ShieldCheck, Star } from 'lucide-react'

const WORDS = ['Tes', 'Ujian', 'CBT', 'Pusing!']

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: 'easeOut' as const },
  }
}

function ResponsiveBee({
  src,
  desktopSize,
  mobileSize,
  desktopPos,
  mobilePos,
  rotate = 0,
  floatY = 14,
  floatDur = 4,
  floatDelay = 0,
  parallaxFactor = 80,
  entranceDelay = 0,
}: {
  src: string
  desktopSize: number
  mobileSize: number
  desktopPos: React.CSSProperties
  mobilePos: React.CSSProperties
  rotate?: number
  floatY?: number
  floatDur?: number
  floatDelay?: number
  parallaxFactor?: number
  entranceDelay?: number
}) {
  const { scrollY } = useScroll()
  const parallaxY = useTransform(scrollY, [0, 600], [0, parallaxFactor])

  return (
    <>
      {/* Mobile & Tablet Bee (Scaled, non-blocking) */}
      <div
        className="block md:hidden absolute pointer-events-none select-none z-10"
        style={{ ...mobilePos, ...(rotate ? { transform: `rotate(${rotate}deg)` } : {}) }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: entranceDelay, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.div
            animate={{ y: [0, -floatY * 0.6, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: floatDur, repeat: Infinity, ease: 'easeInOut', delay: floatDelay }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              style={{ width: `${mobileSize}px`, height: 'auto' }}
              className="filter drop-shadow-sm"
              draggable={false}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Desktop Bee (Full HD) */}
      <div
        className="hidden md:block absolute pointer-events-none select-none z-0"
        style={{ ...desktopPos, ...(rotate ? { transform: `rotate(${rotate}deg)` } : {}) }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.75, delay: entranceDelay, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.div style={{ y: parallaxY }}>
            <motion.div
              animate={{ y: [0, -floatY, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: floatDur, repeat: Infinity, ease: 'easeInOut', delay: floatDelay }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                width={desktopSize}
                className="filter drop-shadow-md"
                draggable={false}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}

const BEES = [
  { left: 158, top: 365, size: 239, rotate: 8 },
  { left: 374, top: 627, size: 149, rotate: 7 },
  { left: 509, top: 550, size: 193, rotate: -6 },
]

export default function HeroSection() {
  const [idx, setIdx] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % WORDS.length), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden min-h-screen flex items-center pt-20 md:pt-0">

      {/* Bee 1 - Kiri (Visible on Mobile + Desktop) */}
      <ResponsiveBee
        src="/bee1-hd.png"
        desktopSize={BEES[0].size}
        mobileSize={68}
        desktopPos={{ left: BEES[0].left, top: BEES[0].top }}
        mobilePos={{ left: '10px', top: '100px' }}
        rotate={BEES[0].rotate}
        floatY={16} floatDur={4.2} floatDelay={0}
        parallaxFactor={60} entranceDelay={0.2}
      />

      {/* Bee 2 - Kanan Atas (Visible on Mobile + Desktop) */}
      <ResponsiveBee
        src="/bee2-hd.png"
        desktopSize={BEES[1].size}
        mobileSize={58}
        desktopPos={{ right: BEES[1].left, top: BEES[1].top }}
        mobilePos={{ right: '12px', top: '115px' }}
        rotate={BEES[1].rotate}
        floatY={12} floatDur={3.8} floatDelay={0.9}
        parallaxFactor={40} entranceDelay={0.4}
      />

      {/* Bee 3 - Kanan Bawah (Visible on Mobile + Desktop) */}
      <ResponsiveBee
        src="/bee3-hd.png"
        desktopSize={BEES[2].size}
        mobileSize={64}
        desktopPos={{ left: `calc(50% + ${BEES[2].left}px)`, bottom: BEES[2].top }}
        mobilePos={{ right: '16px', bottom: '28px' }}
        rotate={BEES[2].rotate}
        floatY={18} floatDur={5} floatDelay={1.6}
        parallaxFactor={90} entranceDelay={0.6}
      />

      <div className="relative z-10 px-4 flex flex-col items-center text-center max-w-3xl mx-auto w-full py-12 md:py-16">
        <motion.h1 {...fadeUp(0.04)} className="text-hero text-gray-950 mb-6 md:mb-7 leading-[1.14] tracking-tight">
          Masuk PTN Impianmu{' '}
          <span className="inline-flex items-center align-middle flex-wrap gap-2.5 justify-center">
            <span className="text-gray-950 font-extrabold">Tanpa</span>
            <span className="inline-flex items-center justify-center px-5 py-1.5 rounded-2xl font-black overflow-hidden" style={{ background: 'rgba(255,255,255,0.38)', backdropFilter: 'blur(20px) saturate(2.2)', WebkitBackdropFilter: 'blur(20px) saturate(2.2)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 16px rgba(0,0,0,0.08), inset 0 0 0 1.5px rgba(255,255,255,0.5)', color: '#92400e' }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={WORDS[idx]}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="inline-block"
                >
                  {WORDS[idx]}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        </motion.h1>

        <motion.p {...fadeUp(0.16)} className="mb-8 max-w-xl mx-auto text-sm sm:text-base leading-relaxed px-2 text-gray-700 font-medium">
          Upload essay-mu, isi profil akademikmu, dan otwptn langsung beri analisis AI canggih -
          skor essay, estimasi peluang rasionalisasi SNBP, dan bimbingan 1-on-1 mentor alumni UI, ITB, & UGM.
        </motion.p>

        <motion.div {...fadeUp(0.24)} className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-8">
          <Link href="/register" className="btn btn-primary px-7 py-3.5 text-sm font-extrabold w-full sm:w-auto shadow-md">
            <Zap size={15} fill="currentColor" />
            Mulai Belajar Sekarang
          </Link>
          <Link href="/dashboard/kalkulator" className="btn btn-outline px-6 py-3.5 text-sm font-bold w-full sm:w-auto border-gray-300 hover:bg-white/80 text-gray-900 bg-white/50">
            Simulasi Peluang Gratis
          </Link>
        </motion.div>

        {/* Social Proof Stats */}
        <motion.div {...fadeUp(0.32)} className="flex items-center justify-center flex-wrap gap-6 text-xs text-gray-600 font-semibold pt-4 border-t border-amber-950/10 w-full max-w-md">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Mentor Alumni Jalur Yang Sama</span>
          </div>
          <div>
            <strong className="text-gray-950 font-extrabold">12.500+</strong> Pejuang PTN
          </div>
          <div>
            <strong className="text-gray-950 font-extrabold">94.8%</strong> Lolos Prodi Pilihan
          </div>
        </motion.div>
      </div>
    </section>
  )
}
