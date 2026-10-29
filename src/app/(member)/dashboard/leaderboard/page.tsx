'use client'

import { useState } from 'react'
import FeatureHeader from '@/components/dashboard/FeatureHeader'
import {
  Trophy,
  Flame,
  Medal,
  Star,
  Sparkles,
  Award,
  Users,
  Search,
  ChevronUp,
} from 'lucide-react'

const LEADERBOARD_USERS = [
  { rank: 1, name: 'Fajar Nugraha', school: 'SMAN 8 Jakarta', targetPTN: 'UI · Ilmu Komputer', xp: 2450, streak: 21, essays: 6, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
  { rank: 2, name: 'Keisha Maharani', school: 'MAN 2 Surabaya', targetPTN: 'UNAIR · Kedokteran', xp: 2280, streak: 18, essays: 5, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' },
  { rank: 3, name: 'Dinda Ayuningtyas', school: 'SMAN 3 Bandung', targetPTN: 'ITB · SBM ITB', xp: 2120, streak: 14, essays: 4, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
  { rank: 4, name: 'Bima Pratama', school: 'SMA Taruna Nusantara', targetPTN: 'UGM · Teknik Sipil', xp: 1980, streak: 9, essays: 4, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
  { rank: 5, name: 'Nayla Zahira', school: 'SMAN 1 Yogyakarta', targetPTN: 'UI · Psikologi', xp: 1850, streak: 11, essays: 3, avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80' },
  { rank: 6, name: 'Raffi Kurniawan', school: 'SMAN 1 Surabaya', targetPTN: 'ITS · Informatika', xp: 1720, streak: 15, essays: 3, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80' },
  { rank: 7, name: 'Siti Nurhaliza', school: 'SMAN 1 Semarang', targetPTN: 'UNDIP · Kesmas', xp: 1610, streak: 8, essays: 2, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' },
  { rank: 8, name: 'Syahid Arkan (Kamu)', school: 'SMAN 8 Jakarta', targetPTN: 'UI · Ilmu Komputer', xp: 1450, streak: 7, essays: 2, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80', isYou: true },
]

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'mingguan' | 'bulanan' | 'sepanjang-masa'>('mingguan')

  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10">
      <FeatureHeader
        title="Papan Peringkat Pejuang PTN"
        subtitle="Pantau progres belajar, konsistensi streak, dan kumpulkan XP melalui penulisan essay dan latihan rasionalisasi nilai rapor."
        mascot="/fitur/ecourse-modul.png"
        badgeText="Weekly Leaderboard"
      />

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 items-end">
        {/* Rank 2 */}
        <div className="p-6 rounded-3xl bg-white shadow-md text-center flex flex-col items-center order-2 md:order-1">
          <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center mb-3">
            #2
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LEADERBOARD_USERS[1].avatar}
            alt=""
            className="w-16 h-16 rounded-full object-cover shadow-sm mb-3"
          />
          <h3 className="text-sm font-black text-gray-900">{LEADERBOARD_USERS[1].name}</h3>
          <p className="text-[11px] text-amber-700 font-bold mt-0.5">{LEADERBOARD_USERS[1].targetPTN}</p>
          <span className="mt-3 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-900">
            {LEADERBOARD_USERS[1].xp} XP
          </span>
        </div>

        {/* Rank 1 (Gold Winner) */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-amber-50 to-white shadow-xl text-center flex flex-col items-center order-1 md:order-2 border-2 border-amber-300 scale-105">
          <div className="w-10 h-10 rounded-full bg-amber-400 text-amber-950 font-black text-sm flex items-center justify-center mb-3 shadow-md">
            👑 #1
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LEADERBOARD_USERS[0].avatar}
            alt=""
            className="w-20 h-20 rounded-full object-cover shadow-md mb-3 border-2 border-amber-400"
          />
          <h3 className="text-base font-black text-gray-900">{LEADERBOARD_USERS[0].name}</h3>
          <p className="text-xs text-amber-800 font-black mt-0.5">{LEADERBOARD_USERS[0].targetPTN}</p>
          <span className="mt-3 btn-brand-primary px-4 py-1.5 rounded-full text-xs font-black shadow-xs">
            {LEADERBOARD_USERS[0].xp} XP · 21 Hari Streak
          </span>
        </div>

        {/* Rank 3 */}
        <div className="p-6 rounded-3xl bg-white shadow-md text-center flex flex-col items-center order-3">
          <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center mb-3">
            #3
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LEADERBOARD_USERS[2].avatar}
            alt=""
            className="w-16 h-16 rounded-full object-cover shadow-sm mb-3"
          />
          <h3 className="text-sm font-black text-gray-900">{LEADERBOARD_USERS[2].name}</h3>
          <p className="text-[11px] text-amber-700 font-bold mt-0.5">{LEADERBOARD_USERS[2].targetPTN}</p>
          <span className="mt-3 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-900">
            {LEADERBOARD_USERS[2].xp} XP
          </span>
        </div>
      </div>

      {/* Leaderboard Table List */}
      <div className="p-6 rounded-3xl bg-white shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-sm font-black text-gray-900">Peringkat Lengkap Siswa</h3>
          <div className="flex gap-2">
            {(['mingguan', 'bulanan', 'sepanjang-masa'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all ${
                  period === p
                    ? 'btn-brand-primary'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {LEADERBOARD_USERS.map(user => (
            <div
              key={user.rank}
              className={`p-3.5 rounded-2xl flex items-center gap-3 transition-colors ${
                user.isYou
                  ? 'bg-amber-100/70 border-2 border-amber-300'
                  : 'bg-gray-50/70 hover:bg-gray-100/60'
              }`}
            >
              <span className="w-7 text-center text-xs font-black text-gray-500 font-mono">
                #{user.rank}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-gray-900 truncate">{user.name}</h4>
                  {user.isYou && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.2 rounded-full">
                      Peringkat Kamu
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-amber-700 font-bold truncate mt-0.5">
                  🎯 {user.targetPTN}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs font-black text-gray-900 block">{user.xp} XP</span>
                <span className="text-[10px] font-bold text-gray-400">🔥 {user.streak} Hari</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
