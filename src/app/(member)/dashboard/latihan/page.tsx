'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
} from 'lucide-react'
import Link from 'next/link'

type ActiveTab = 'padanan-kata' | 'baku-atau-nggak' | 'benerin-kalimat' | 'leaderboard'

export default function LatihanPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('padanan-kata')
  const [leaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD)

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <FeatureHeader
        title="Arena Latihan PPU & PBM"
        subtitle="Latih insting kata baku, PUEBI, dan analogi istilah akademik untuk menyempurnakan tulisan essay SNBP dan persiapan UTBK. Main solo atau tantang teman belajarmu!"
        mascot="/fitur/kalkulator-peluang.png"
        badgeText="Minigames & Battle Arena"
      />

      {/* Quick Stats & Study Cam Integration Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 text-gray-950 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-amber-300/60">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 text-xs font-black text-amber-950 mb-1">
            <Flame size={14} className="text-amber-600 fill-amber-600" />
            <span>Tantangan Mingguan Berhadiah XP</span>
          </div>
          <h3 className="text-lg md:text-xl font-black tracking-tight">
            Nongkrong Sambil Battle Edukasi di Study Cam!
          </h3>
          <p className="text-xs text-gray-800 max-w-xl font-medium leading-relaxed">
            Sedang video call bareng pejuang PTN lain? Salin kode room atau buka arena ini langsung di samping layar Study Cam-mu.
          </p>
        </div>

        <Link
          href="/dashboard/teman"
          className="btn bg-gray-950 hover:bg-black text-white text-xs font-black py-3 px-6 rounded-full flex items-center gap-2 shadow-sm flex-shrink-0"
        >
          <Video size={15} /> Buka Study Cam Teman
        </Link>
      </div>

      {/* Game Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('padanan-kata')}
          className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-black transition-all flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'padanan-kata'
              ? 'bg-amber-400 text-gray-950 shadow-sm'
              : 'bg-white text-gray-600 hover:text-gray-950 border border-gray-100'
          }`}
        >
          <Zap size={16} /> 1. Padanan Kata
        </button>

        <button
          onClick={() => setActiveTab('baku-atau-nggak')}
          className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-black transition-all flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'baku-atau-nggak'
              ? 'bg-amber-400 text-gray-950 shadow-sm'
              : 'bg-white text-gray-600 hover:text-gray-950 border border-gray-100'
          }`}
        >
          <Sparkles size={16} /> 2. Baku atau Nggak
        </button>

        <button
          onClick={() => setActiveTab('benerin-kalimat')}
          className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-black transition-all flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'benerin-kalimat'
              ? 'bg-amber-400 text-gray-950 shadow-sm'
              : 'bg-white text-gray-600 hover:text-gray-950 border border-gray-100'
          }`}
        >
          <BookOpen size={16} /> 3. Benerin Kalimatnya
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-black transition-all flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'leaderboard'
              ? 'bg-amber-400 text-gray-950 shadow-sm'
              : 'bg-white text-gray-600 hover:text-gray-950 border border-gray-100'
          }`}
        >
          <Trophy size={16} /> Leaderboard
        </button>
      </div>

      {/* Active Tab View */}
      <div className="pt-2">
        {activeTab === 'padanan-kata' && <PadananKataGame />}
        {activeTab === 'baku-atau-nggak' && <BakuAtauNggakGame />}
        {activeTab === 'benerin-kalimat' && <BenerinKalimatGame />}

        {activeTab === 'leaderboard' && (
          <div className="max-w-2xl mx-auto rounded-3xl bg-white border border-gray-100 shadow-md p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Trophy size={20} className="text-amber-500" />
                  Top Pejuang PPU & PBM Pekan Ini
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Akumulasi skor tertinggi dari ketiga minigame edukatif.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Peringkat #1-#5
              </span>
            </div>

            <div className="space-y-3">
              {leaderboard.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    idx === 0
                      ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center ${
                        idx === 0
                          ? 'bg-amber-400 text-gray-950'
                          : idx === 1
                          ? 'bg-gray-200 text-gray-800'
                          : idx === 2
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <div className="w-10 h-10 rounded-full bg-amber-100/50 p-1 flex items-center justify-center flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.avatar} alt="" className="w-full h-full object-contain" />
                    </div>

                    <div>
                      <h4 className="text-xs md:text-sm font-black text-gray-900">{item.name}</h4>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {item.school} • <span className="text-amber-700 font-bold">{item.tier}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm md:text-base font-black text-gray-950 block font-mono">
                      {item.score} Poin
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">
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
