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
      {/* Mobile & Tablet Bee (Scaled, non-blocking at viewport margins) */}
      <div
        className="block xl:hidden absolute pointer-events-none select-none z-0"
        style={{ ...mobilePos, ...(rotate ? { transform: `rotate(${rotate}deg)` } : {}) }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: entranceDelay, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.div
            animate={{ y: [0, -floatY * 0.5, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: floatDur, repeat: Infinity, ease: 'easeInOut', delay: floatDelay }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="Maskot Otbee - OtwPTN Platform Masuk PTN Non-Tes"
              style={{ width: `${mobileSize}px`, height: 'auto' }}
              className="filter drop-shadow-sm opacity-85"
              draggable={false}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Desktop Bee (Full HD, positioned outside the central text column) */}
      <div
        className="hidden xl:block absolute pointer-events-none select-none z-0"
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
                alt="Maskot Lebah Otbee Pejuang PTN Jalur Prestasi dan SNBP"
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

export default function HeroSection() {
  const [idx, setIdx] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % WORDS.length), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden min-h-screen flex items-center pt-20 md:pt-0">

      {/* Bee 1 - Kiri (Visible on Mobile/Tablet + Desktop, safe margins below navbar) */}
      <ResponsiveBee
        src="/bee1-hd.png"
        desktopSize={220}
        mobileSize={58}
        desktopPos={{ left: 'max(20px, calc(50% - 620px))', top: '32%' }}
        mobilePos={{ left: '12px', top: '135px' }}
        rotate={8}
        floatY={14} floatDur={4.2} floatDelay={0}
        parallaxFactor={60} entranceDelay={0.2}
      />

      {/* Bee 2 - Kanan Atas (Visible on Mobile/Tablet + Desktop, safe margins below navbar) */}
      <ResponsiveBee
        src="/bee2-hd.png"
        desktopSize={145}
        mobileSize={52}
        desktopPos={{ right: 'max(20px, calc(50% - 600px))', top: '20%' }}
        mobilePos={{ right: '12px', top: '145px' }}
        rotate={7}
        floatY={12} floatDur={3.8} floatDelay={0.9}
        parallaxFactor={40} entranceDelay={0.4}
      />

      {/* Bee 3 - Kanan Bawah (Visible on Mobile/Tablet + Desktop, safe margins) */}
      <ResponsiveBee
        src="/bee3-hd.png"
        desktopSize={175}
        mobileSize={54}
        desktopPos={{ right: 'max(30px, calc(50% - 560px))', bottom: '12%' }}
        mobilePos={{ right: '16px', bottom: '24px' }}
        rotate={-6}
        floatY={18} floatDur={5} floatDelay={1.6}
        parallaxFactor={90} entranceDelay={0.6}
      />

      <div className="relative z-10 px-4 flex flex-col items-center text-center max-w-3xl mx-auto w-full py-12 md:py-16">
        {/* Authority Branding Badge: SNBP, PPKB, SJP, PBUB = OtwPTN */}
        <motion.div
          {...fadeUp(0.01)}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-amber-300/80 shadow-xs mb-5 text-xs font-black text-amber-950 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Pusat Otoritas #1 SNBP, PPKB UI, SJP IPB & Mandiri Prestasi PTN</span>
        </motion.div>

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

        <motion.p {...fadeUp(0.16)} className="mb-6 max-w-xl mx-auto text-sm sm:text-base leading-relaxed px-2 text-gray-700 font-medium">
          Upload essay-mu, isi profil akademikmu, dan otwptn langsung beri analisis AI canggih -
          skor essay, estimasi peluang rasionalisasi SNBP, dan bimbingan 1-on-1 mentor alumni UI, ITB, & UGM.
        </motion.p>

        {/* Track Pills: SNBP, PPKB, SJP, PBUB */}
        <motion.div {...fadeUp(0.20)} className="flex items-center justify-center flex-wrap gap-2 mb-8 text-[11px] font-extrabold text-gray-700">
          <span className="bg-amber-100/90 text-amber-950 px-3 py-1 rounded-full border border-amber-300/80 shadow-2xs">#1 SNBP 2026</span>
          <span className="bg-white/80 text-gray-900 px-3 py-1 rounded-full border border-gray-200">PPKB UI</span>
          <span className="bg-white/80 text-gray-900 px-3 py-1 rounded-full border border-gray-200">SJP IPB (Ketua OSIS)</span>
          <span className="bg-white/80 text-gray-900 px-3 py-1 rounded-full border border-gray-200">PBUB UGM</span>
          <span className="bg-white/80 text-gray-900 px-3 py-1 rounded-full border border-gray-200">Mandiri Prestasi UNAIR & Undip</span>
        </motion.div>

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
