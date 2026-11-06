'use client'

import { useEffect, useState } from 'react'
import { Flame, CheckCircle2, Circle, ArrowRight, Share2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import StreakPosterModal from '@/components/dashboard/StreakPosterModal'
import {
  calculateAndSaveStreak,
  getDailyQuests,
  completeDailyQuest,
  type DailyQuest,
  type StreakData,
} from '@/lib/streakAndQuests'
import { awardXP } from '@/lib/games/gameEngine'

const DAYS = [
  { label: 'M', day: 0 },
  { label: 'S', day: 1 },
  { label: 'S', day: 2 },
  { label: 'R', day: 3 },
  { label: 'K', day: 4 },
  { label: 'J', day: 5 },
  { label: 'S', day: 6 },
]

export function DashboardStreakCard() {
  const [streakData, setStreakData] = useState<StreakData>({
    streak: 1,
    lastDate: '',
    activeDaysOfWeek: [new Date().getDay()],
  })
  const [completedModulesCount, setCompletedModulesCount] = useState(0)
  const [showPosterModal, setShowPosterModal] = useState(false)
  const [userInfo, setUserInfo] = useState({ name: 'Pejuang PTN', targetPTN: 'Universitas Indonesia' })

  useEffect(() => {
    const s = calculateAndSaveStreak()
    setStreakData(s)

    try {
      const ec = JSON.parse(localStorage.getItem('ecourse_v2_completed') || '[]')
      setCompletedModulesCount(ec.length)
    } catch {}

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('full_name, target_ptns')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            const name = data?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || 'Pejuang PTN'
            const ptns = data?.target_ptns
            const targetPTN = (Array.isArray(ptns) && ptns[0]) ? ptns[0] : 'Universitas Indonesia'
            setUserInfo({ name, targetPTN })
          })
      }
    })
  }, [])

  return (
    <>
      <StreakPosterModal
        isOpen={showPosterModal}
        onClose={() => setShowPosterModal(false)}
        streak={streakData.streak}
        activeDaysCount={streakData.activeDaysOfWeek.length}
        completedModulesCount={completedModulesCount}
        userName={userInfo.name}
        targetPTN={userInfo.targetPTN}
      />

      <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950 shadow-xs">
                <Flame size={22} className="fill-amber-950" />
              </div>
              <div>
                <span className="text-xl font-black text-gray-950">{streakData.streak} Hari</span>
                <p className="text-[11px] font-bold text-gray-500">Streak Belajar Aktif</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPosterModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Share2 size={12} /> Pamerkan Streak
            </button>
          </div>

          {/* Days of week */}
          <div className="flex justify-between gap-1 mb-5">
            {DAYS.map((d, i) => {
              const isActive = streakData.activeDaysOfWeek.includes(d.day)
              return (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border transition-all ${
                    isActive
                      ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-2xs scale-105'
                      : 'border-gray-200 text-gray-400 bg-white/60'
                  }`}
                >
                  {d.label}
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-gray-200/80 pt-4 flex items-center justify-between text-sm">
          <div>
            <p className="font-extrabold text-base text-gray-900">{completedModulesCount}</p>
            <p className="text-xs text-gray-500 font-medium">materi selesai</p>
          </div>
          <button
            type="button"
            onClick={() => setShowPosterModal(true)}
            className="text-xs font-black text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
          >
            Buat Poster Story <Sparkles size={12} />
          </button>
        </div>
      </div>
    </>
  )
}

export function DashboardQuestsCard({ profile }: { profile?: any }) {
  const [quests, setQuests] = useState<DailyQuest[]>([])

  useEffect(() => {
    const q = getDailyQuests(profile)
    setQuests(q)
  }, [profile])

  const handleToggleQuest = (questId: string, xp: number) => {
    completeDailyQuest(questId)
    setQuests(prev =>
      prev.map(q => (q.id === questId ? { ...q, done: true } : q))
    )
    awardXP(xp, 'Tantangan Harian')
  }

  const completedQuestsCount = quests.filter(q => q.done).length

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-extrabold text-gray-900">Tantangan Hari Ini</h2>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            {completedQuestsCount} dari {quests.length} selesai
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Kumpulkan XP harian dan bangun konsistensimu menuju kampus impian
        </p>

        <div className="flex flex-col divide-y divide-gray-100">
          {quests.map(q => (
            <div key={q.id} className="flex items-center justify-between py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => !q.done && handleToggleQuest(q.id, q.xp)}
                  className="flex-shrink-0 cursor-pointer"
                  title={q.done ? 'Sudah selesai' : 'Tandai selesai'}
                >
                  {q.done ? (
                    <CheckCircle2 size={18} className="text-emerald-500 fill-emerald-100" />
                  ) : (
                    <Circle size={18} className="text-gray-300 hover:text-amber-500 transition-colors" />
                  )}
                </button>
                <Link
                  href={q.href}
                  className={`text-xs sm:text-sm font-semibold truncate hover:underline ${
                    q.done ? 'line-through text-gray-400' : 'text-gray-800'
                  }`}
                >
                  {q.label}
                </Link>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-full ${
                    q.done
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  +{q.xp} XP
                </span>
                {!q.done && (
                  <Link
                    href={q.href}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900"
                  >
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
