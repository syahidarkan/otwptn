'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import FeatureHeader from '@/components/dashboard/FeatureHeader'
import PadananKataGame from '@/components/games/PadananKataGame'
import BakuAtauNggakGame from '@/components/games/BakuAtauNggakGame'
import BenerinKalimatGame from '@/components/games/BenerinKalimatGame'
import { INITIAL_LEADERBOARD, LeaderboardEntry } from '@/lib/games/gameEngine'
import {
  Zap,
  Sparkles,
  BookOpen,
  Trophy,
  Swords,
  Flame,
  Star,
  Users,
  Video,
  ChevronRight,
  Shuffle,
  Award,
  Crown,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type ActiveTab = 'padanan-kata' | 'baku-atau-nggak' | 'benerin-kalimat' | 'campuran-battle' | 'leaderboard'

export default function LatihanPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('padanan-kata')
  const [leaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD)

  // Instant sync with URL query param (?tab=baku-atau-nggak, ?tab=benerin-kalimat, etc.)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab')
      if (
        tabParam &&
        ['padanan-kata', 'baku-atau-nggak', 'benerin-kalimat', 'campuran-battle', 'leaderboard'].includes(tabParam)
      ) {
        setActiveTab(tabParam as ActiveTab)
      }
    }
    syncFromUrl()

    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [])

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-24 space-y-8 overflow-hidden">
      {/* Ambient background glows for glassmorphism */}
      <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-96 h-96 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />

      <FeatureHeader
        title="Arena Latihan PPU & PBM"
        subtitle="Latih insting kata baku, PUEBI, dan analogi istilah akademik untuk menyempurnakan tulisan essay SNBP, PPKB UI, dan persiapan UTBK. Main solo atau tantang teman belajarmu!"
        mascot="/fitur/kalkulator-peluang.png"
        badgeText="Minigames & Battle Arena"
      />

      {/* Gamified Study Cam Integration Banner with Frosted Glass & Mascot */}
      <div className="relative rounded-3xl backdrop-blur-2xl bg-gradient-to-r from-amber-400/90 via-amber-300/85 to-amber-200/90 border border-white/80 p-6 md:p-7 shadow-[0_12px_36px_rgba(245,158,11,0.18)] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="space-y-2 text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md text-xs font-black text-amber-950 shadow-xs">
            <Flame size={14} className="text-amber-600 fill-amber-600 animate-pulse" />
            <span>Tantangan Duel Berhadiah XP & Ranking</span>
          </div>
          <h3 className="text-lg md:text-2xl font-black text-gray-950 tracking-tight">
            Nongkrong Sambil Battle Edukasi di Study Cam!
          </h3>
          <p className="text-xs md:text-sm text-gray-900 max-w-xl font-semibold leading-relaxed">
            Sedang video call bareng pejuang PTN lain? Klik tombol Tantang Battle langsung di layar kamera Study Cam atau bagikan kode room-mu untuk adu kecepatan!
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10 flex-shrink-0">
          <div className="hidden lg:block w-20 h-20 relative">
            <Image
              src="/mascot/trophy-graduate.png"
              alt="Mascot Trophy"
              fill
              className="object-contain drop-shadow-md animate-bounce"
            />
          </div>

          <Link
            href="/dashboard/teman"
            className="px-6 py-3.5 rounded-2xl bg-gray-950 hover:bg-black text-white text-xs font-black flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Video size={16} className="text-amber-400" />
            <span>Buka Study Cam Teman</span>
          </Link>
        </div>
      </div>

      {/* Glassmorphic Game Tabs Navigation */}
      <div className="p-1.5 rounded-3xl backdrop-blur-xl bg-white/70 border border-white/80 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('padanan-kata')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            activeTab === 'padanan-kata'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 shadow-sm'
              : 'text-gray-600 hover:text-gray-950 hover:bg-white/60'
          }`}
        >
          <Zap size={15} /> 1. Padanan Kata (PPU)
        </button>

        <button
          onClick={() => setActiveTab('baku-atau-nggak')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            activeTab === 'baku-atau-nggak'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 shadow-sm'
              : 'text-gray-600 hover:text-gray-950 hover:bg-white/60'
          }`}
        >
          <Sparkles size={15} /> 2. Wordle Baku (PUEBI)
        </button>

        <button
          onClick={() => setActiveTab('benerin-kalimat')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            activeTab === 'benerin-kalimat'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 shadow-sm'
              : 'text-gray-600 hover:text-gray-950 hover:bg-white/60'
          }`}
        >
          <BookOpen size={15} /> 3. Benerin Kalimat (PBM)
        </button>

        <button
          onClick={() => setActiveTab('campuran-battle')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            activeTab === 'campuran-battle'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 shadow-sm'
              : 'text-gray-600 hover:text-gray-950 hover:bg-white/60'
          }`}
        >
          <Shuffle size={15} /> Kuis Acak Campuran
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            activeTab === 'leaderboard'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 shadow-sm'
              : 'text-gray-600 hover:text-gray-950 hover:bg-white/60'
          }`}
        >
          <Trophy size={15} /> Leaderboard
        </button>
      </div>

      {/* Active Tab View */}
      <div className="pt-2">
        {activeTab === 'padanan-kata' && <PadananKataGame initialCategory="padanan" />}
        {activeTab === 'baku-atau-nggak' && <BakuAtauNggakGame />}
        {activeTab === 'benerin-kalimat' && <BenerinKalimatGame />}
        {activeTab === 'campuran-battle' && <PadananKataGame initialCategory="mixed" />}

        {activeTab === 'leaderboard' && (
          <div className="max-w-3xl mx-auto rounded-3xl backdrop-blur-2xl bg-white/85 border border-white/90 shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 p-1 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/mascot/trophy-graduate.png"
                    alt="Trophy"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
                    Top Pejuang PPU & PBM Pekan Ini
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Akumulasi poin kemenangan dari duel arena dan latihan harian.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black">
                <Crown size={14} className="text-amber-500 fill-amber-500" />
                <span>Peringkat Teratas</span>
              </div>
            </div>

            <div className="space-y-3">
              {leaderboard.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    idx === 0
                      ? 'backdrop-blur-md bg-amber-50/80 border-amber-300 shadow-sm ring-1 ring-amber-300/50'
                      : idx === 1
                      ? 'bg-slate-50/80 border-slate-200'
                      : idx === 2
                      ? 'bg-amber-50/40 border-amber-200/60'
                      : 'bg-white/70 border-gray-100 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shadow-xs ${
                        idx === 0
                          ? 'bg-gradient-to-tr from-amber-400 to-amber-300 text-gray-950 font-black'
                          : idx === 1
                          ? 'bg-gray-200 text-gray-800'
                          : idx === 2
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-gray-100 text-gray-500 font-bold'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <div className="w-10 h-10 rounded-full bg-white p-0.5 border border-gray-200 shadow-xs flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.avatar} alt="" className="w-full h-full object-cover" />
                    </div>

                    <div>
                      <h4 className="text-xs md:text-sm font-black text-gray-900">{item.name}</h4>
                      <p className="text-[11px] text-gray-500 font-semibold">
                        {item.school} • <span className="text-amber-700 font-black">{item.tier}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm md:text-base font-black text-gray-950 block font-mono">
                      {item.score} Poin
                    </span>
                    <span className="text-[10px] text-emerald-600 font-extrabold">
                      {item.winRate}% Menang
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
