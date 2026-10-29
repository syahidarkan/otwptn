'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Sparkles, Crown, GraduationCap, Flame } from 'lucide-react'

interface PromoSlide {
  id: string
  badge: string
  badgeIcon: any
  title: string
  subtext: string
  bg: string
  image: string
  tag: string
  targetUrl: string
}

const SLIDES: PromoSlide[] = [
  {
    id: 'queen-bee',
    badge: 'Queen Bee VIP',
    badgeIcon: Crown,
    title: '1-on-1 Bimbingan Mentor Alumni',
    subtext: 'oleh otwptn',
    bg: 'linear-gradient(135deg, #134227 0%, #1c5e37 100%)',
    image: '/mascot-hd/maskot-fitur-mentor-alumni.png',
    tag: 'Diskon 50%',
    targetUrl: '/upgrade',
  },
  {
    id: 'honeycomb',
    badge: 'Honeycomb Reguler',
    badgeIcon: Sparkles,
    title: 'Review Essay & Rapor 5 Semester',
    subtext: 'oleh otwptn',
    bg: 'linear-gradient(135deg, #44260a 0%, #6d3d0f 100%)',
    image: '/mascot-hd/maskot-nulis-essay-meja.png',
    tag: 'Best Seller',
    targetUrl: '/upgrade',
  },
  {
    id: 'nectar',
    badge: 'Nectar Review',
    badgeIcon: GraduationCap,
    title: 'Simulasi Rasio Peluang SNBP',
    subtext: 'oleh otwptn',
    bg: 'linear-gradient(135deg, #0e2b47 0%, #174775 100%)',
    image: '/mascot-hd/kalkulator-peluang.png',
    tag: 'Akurat 98%',
    targetUrl: '/upgrade',
  },
  {
    id: 'premium-club',
    badge: 'Akun Premium',
    badgeIcon: Flame,
    title: 'Akses Modul Video & Circle Belajar',
    subtext: 'oleh otwptn',
    bg: 'linear-gradient(135deg, #2d1442 0%, #4a216d 100%)',
    image: '/mascot-hd/support-headset.png',
    tag: 'Mulai 44rb',
    targetUrl: '/upgrade',
  },
]

export default function SidebarPromoCard() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Auto geser carousel every 4.5 seconds
  useEffect(() => {
    if (dismissed || isPaused) return
    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [dismissed, isPaused])

  if (dismissed) return null

  const slide = SLIDES[currentIdx]
  const Icon = slide.badgeIcon

  return (
    <div
      className="relative px-3 mb-2 flex-shrink-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Link
        href={slide.targetUrl}
        className="block relative rounded-2xl p-3.5 text-white overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer"
        style={{
          background: slide.bg,
          minHeight: 124,
        }}
      >
        {/* Close / Dismiss Button */}
        <button
          type="button"
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            setDismissed(true)
          }}
          aria-label="Tutup promo"
          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white flex items-center justify-center transition-colors z-20"
        >
          <X size={12} strokeWidth={2.5} />
        </button>

        {/* Top badge row */}
        <div className="flex items-center gap-1.5 mb-1.5 z-10 relative">
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
            <Icon size={10} className="text-amber-300" />
          </div>
          <span className="text-[11px] font-bold tracking-tight text-white/90">
            {slide.badge}
          </span>
        </div>

        {/* Content & Mascot grid */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex-1 pr-1">
            <h4 className="text-[13px] font-black leading-tight tracking-tight text-white line-clamp-2">
              {slide.title}
            </h4>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-white/70">
                {slide.subtext}
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950">
                {slide.tag}
              </span>
            </div>
          </div>

          {/* Mascot / Graphic */}
          <div className="w-16 h-16 flex-shrink-0 relative -mr-1 -mb-1 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
              onError={e => {
                ;(e.currentTarget as HTMLImageElement).src = '/logo.png'
              }}
            />
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div
          className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none"
        />
      </Link>

      {/* Auto-Slide Dot Indicators (Gambar 1 style) */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrentIdx(idx)}
            aria-label={`Slide ${idx + 1}`}
            className="transition-all duration-300 rounded-full"
            style={{
              width: currentIdx === idx ? 16 : 5,
              height: 5,
              backgroundColor:
                currentIdx === idx ? 'var(--accent, #f59e0b)' : 'rgba(156, 163, 175, 0.4)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
