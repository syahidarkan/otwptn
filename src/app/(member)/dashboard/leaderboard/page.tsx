'use client'

import { useState, useEffect, useCallback } from 'react'
import FeatureHeader from '@/components/dashboard/FeatureHeader'
import { Trophy, Crown, Target, Flame } from 'lucide-react'

type LeaderboardEntry = {
  rank: number
  user_id: string
  name: string
  school: string
  targetPTN: string
  xp: number
  streak: number
  avatar: string | null
  isYou: boolean
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'mingguan' | 'bulanan' | 'sepanjang-masa'>('mingguan')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const loadLeaderboard = useCallback(async (p: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?period=${p}`)
      if (res.ok) {
        const data = await res.json()
        setEntries(data.entries ?? [])
      }
    } catch {
      // silently fail — show empty state
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadLeaderboard(period) }, [period, loadLeaderboard])

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)
  const youEntry = entries.find(e => e.isYou)

  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10">
      <FeatureHeader
        title="Papan Peringkat Pejuang PTN"
        subtitle="Pantau progres belajar, konsistensi streak, dan kumpulkan XP melalui penulisan essay dan latihan rasionalisasi nilai rapor."
        mascot="/fitur/modul-video.png"
        badgeText="Live Leaderboard"
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Trophy size={32} />
          </div>
          <p className="font-bold text-gray-600">Belum ada data untuk periode ini</p>
          <p className="text-sm mt-1">Mulai review esai atau kalkulator untuk masuk leaderboard!</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 items-end">
              {/* Rank 2 */}
              <PodiumCard entry={top3[1]} size="small" order="order-2 md:order-1" />
              {/* Rank 1 */}
              <PodiumCard entry={top3[0]} size="large" order="order-1 md:order-2" />
              {/* Rank 3 */}
              <PodiumCard entry={top3[2]} size="small" order="order-3" />
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="p-6 rounded-3xl bg-white shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-black text-gray-900">Peringkat Lengkap Siswa</h3>
              <div className="flex gap-2">
                {(['mingguan', 'bulanan', 'sepanjang-masa'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all ${
                      period === p ? 'btn-brand-primary' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {(top3.length >= 3 ? rest : entries).map(entry => (
                <EntryRow key={entry.user_id} entry={entry} />
              ))}
              {!youEntry && (
                <p className="text-center text-xs text-gray-400 pt-2">
                  Kamu belum masuk leaderboard periode ini. Review esai atau buka kalkulator untuk XP!
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Avatar({ src, name, size }: { src: string | null; name: string; size: number }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={`w-${size} h-${size} rounded-full object-cover`} />
  }
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div className={`w-${size} h-${size} rounded-full bg-amber-200 flex items-center justify-center text-amber-900 font-black text-xs`}>
      {initials}
    </div>
  )
}

function PodiumCard({ entry, size, order }: { entry: LeaderboardEntry; size: 'small' | 'large'; order: string }) {
  const isLarge = size === 'large'
  return (
    <div className={`${isLarge ? 'p-8 scale-105 border-2 border-amber-300 shadow-xl bg-gradient-to-b from-amber-50 to-white' : 'p-6 shadow-md bg-white'} rounded-3xl text-center flex flex-col items-center ${order}`}>
      <div className={`${isLarge ? 'w-10 h-10 bg-amber-400 text-amber-950 text-sm' : 'w-8 h-8 bg-slate-100 text-slate-700 text-xs'} rounded-full font-black flex items-center justify-center mb-3 shadow-md`}>
        {isLarge ? (
          <span className="flex items-center gap-1">
            <Crown size={14} className="fill-amber-950" /> 1
          </span>
        ) : (
          `#${entry.rank}`
        )}
      </div>
      <Avatar src={entry.avatar} name={entry.name} size={isLarge ? 20 : 16} />
      <h3 className={`${isLarge ? 'text-base' : 'text-sm'} font-black text-gray-900 mt-3`}>{entry.name}</h3>
      <p className={`${isLarge ? 'text-xs' : 'text-[11px]'} text-amber-800 font-black mt-0.5`}>{entry.targetPTN}</p>
      <span className={`mt-3 ${isLarge ? 'btn-brand-primary px-4 py-1.5 shadow-xs text-xs' : 'px-3 py-1 bg-amber-50 text-amber-900 text-xs'} rounded-full font-black`}>
        {entry.xp} XP{isLarge ? ` · ${entry.streak} Hari Streak` : ''}
      </span>
      {entry.isYou && <span className="mt-2 text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full">Kamu</span>}
    </div>
  )
}

function EntryRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className={`p-3.5 rounded-2xl flex items-center gap-3 transition-colors ${
      entry.isYou ? 'bg-amber-100/70 border-2 border-amber-300' : 'bg-gray-50/70 hover:bg-gray-100/60'
    }`}>
      <span className="w-7 text-center text-xs font-black text-gray-500 font-mono">#{entry.rank}</span>
      <Avatar src={entry.avatar} name={entry.name} size={10} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-black text-gray-900 truncate">{entry.name}</h4>
          {entry.isYou && (
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full">
              Kamu
            </span>
          )}
        </div>
        <p className="text-[11px] text-amber-700 font-bold truncate mt-0.5 flex items-center gap-1">
          <Target size={11} className="flex-shrink-0" />
          <span>{entry.targetPTN}</span>
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <span className="text-xs font-black text-gray-900 block">{entry.xp} XP</span>
        <span className="text-[10px] font-bold text-gray-400 flex items-center justify-end gap-1">
          <Flame size={11} className="text-amber-500 fill-amber-500" />
          <span>{entry.streak} Hari</span>
        </span>
      </div>
    </div>
  )
}
