'use client'

import React, { useState, useEffect } from 'react'
import {
  X, Star, Flame, Award, CheckCircle2, ArrowRight,
  Gift, Zap
} from 'lucide-react'

interface QuestItem {
  id: string
  title: string
  rewardXP: number
  rewardCoins: number
  actionUrl: string
  isCompleted: boolean
  isClaimed: boolean
}

const DEFAULT_QUESTS: QuestItem[] = [
  {
    id: 'q-login',
    title: 'Login Harian & Buka Dashboard OtwPTN',
    rewardXP: 15,
    rewardCoins: 10,
    actionUrl: '/dashboard',
    isCompleted: true,
    isClaimed: false,
  },
  {
    id: 'q-kalkulator',
    title: 'Simulasikan 1 Prodi di Kalkulator Peluang',
    rewardXP: 25,
    rewardCoins: 20,
    actionUrl: '/dashboard/kalkulator',
    isCompleted: true,
    isClaimed: false,
  },
  {
    id: 'q-otbee',
    title: 'Kirim Pertanyaan Strategi ke Otbee AI',
    rewardXP: 20,
    rewardCoins: 15,
    actionUrl: '/dashboard/otbee',
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'q-essay',
    title: 'Simpan atau Review 1 Draft Essay Motivasi',
    rewardXP: 40,
    rewardCoins: 30,
    actionUrl: '/dashboard/essay',
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'q-tracking',
    title: 'Cek Kalender Seleksi di Tracking Jalur',
    rewardXP: 20,
    rewardCoins: 15,
    actionUrl: '/dashboard/tracking-jalur',
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'q-ecourse',
    title: 'Tonton 1 Video E-Course Strategi Non-Tes',
    rewardXP: 30,
    rewardCoins: 25,
    actionUrl: '/dashboard/ecourse',
    isCompleted: false,
    isClaimed: false,
  },
]

interface XPQuestModalProps {
  isOpen: boolean
  onClose: () => void
  currentXP: number
  currentLevel: number
  currentCoins: number
  onUpdate: (xp: number, level: number, coins: number) => void
}

export default function XPQuestModal({
  isOpen,
  onClose,
  currentXP,
  currentLevel,
  currentCoins,
  onUpdate,
}: XPQuestModalProps) {
  const [quests, setQuests] = useState<QuestItem[]>(DEFAULT_QUESTS)
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null)

  useEffect(() => {
    const refresh = () => {
      try {
        const storedQuests = localStorage.getItem('otwptn_quests')
        if (storedQuests) {
          const parsed = JSON.parse(storedQuests)
          if (Array.isArray(parsed) && parsed.length >= DEFAULT_QUESTS.length) {
            setQuests(parsed)
            return
          }
        }
      } catch {}
      setQuests(DEFAULT_QUESTS)
    }

    refresh()
    window.addEventListener('otwptn_quest_completed', refresh)
    return () => window.removeEventListener('otwptn_quest_completed', refresh)
  }, [isOpen])

  const handleClaim = (questId: string) => {
    const q = quests.find(item => item.id === questId)
    if (!q || q.isClaimed) return

    let nextXP = currentXP + q.rewardXP
    let nextLevel = currentLevel
    const nextCoins = currentCoins + q.rewardCoins

    if (nextXP >= 100) {
      nextLevel += 1
      nextXP = nextXP - 100
      setCelebrationMsg(`🎉 SELAMAT! Kamu naik ke Level ${nextLevel}: Pejuang Tangguh PTN!`)
    } else {
      setCelebrationMsg(`✨ Klaim Berhasil! +${q.rewardXP} XP & +${q.rewardCoins} Koin!`)
    }

    const updatedQuests = quests.map(item =>
      item.id === questId ? { ...item, isClaimed: true } : item
    )
    setQuests(updatedQuests)

    try {
      localStorage.setItem('otwptn_xp', String(nextXP))
      localStorage.setItem('otwptn_level', String(nextLevel))
      localStorage.setItem('otwptn_coins', String(nextCoins))
      localStorage.setItem('otwptn_quests', JSON.stringify(updatedQuests))
      window.dispatchEvent(new Event('otwptn_xp_updated'))
    } catch {}

    onUpdate(nextXP, nextLevel, nextCoins)

    setTimeout(() => {
      setCelebrationMsg(null)
    }, 3500)
  }

  if (!isOpen) return null

  const levelTitles: Record<number, string> = {
    1: 'Calon Maba Ambis',
    2: 'Pejuang Tangguh PTN',
    3: 'Master Strategi SNBP',
    4: 'Top Ranker Nasional',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border-0 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header Banner with Mascot */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 p-6 flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/95 p-1 flex items-center justify-center shadow-xs flex-shrink-0 border-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mascot-hd/trophy-graduate.png"
                alt="Trophy"
                className="w-full h-full object-contain filter drop-shadow-xs"
                onError={e => {
                  ;(e.currentTarget as HTMLImageElement).src = '/logo.png'
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 uppercase tracking-wider">
                <Star size={14} className="fill-amber-600 text-amber-700" />
                <span>Level {currentLevel} • {levelTitles[currentLevel] || 'Pejuang PTN'}</span>
              </div>
              <h3 className="text-xl font-black text-gray-950 tracking-tight mt-0.5">
                Pusat XP & Misi Harian
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-gray-800 flex items-center justify-center transition-colors z-10 cursor-pointer"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Celebration Toast */}
        {celebrationMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 text-emerald-900 text-xs font-black flex items-center gap-2 animate-in fade-in border-0 shadow-2xs">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <span>{celebrationMsg}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* XP & Progress Card - ZERO BLACK OUTLINE */}
          <div className="p-4 rounded-2xl bg-amber-50/90 space-y-2.5 border-0 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-extrabold text-amber-950">
              <span className="flex items-center gap-1.5">
                <Zap size={15} className="text-amber-600 fill-amber-500" /> Progress Menuju Level {currentLevel + 1}
              </span>
              <span className="text-amber-900 font-black">{currentXP} / 100 XP</span>
            </div>

            {/* Animated XP Bar */}
            <div className="w-full h-3 rounded-full bg-amber-200/70 overflow-hidden p-0.5 border-0">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500 shadow-xs"
                style={{ width: `${Math.min(100, Math.max(5, currentXP))}%` }}
              />
            </div>
            <p className="text-[11px] text-amber-900 font-semibold leading-relaxed">
              Kumpulkan {100 - currentXP} XP lagi untuk membuka lencana baru & bonus kuota kredit Otbee AI!
            </p>
          </div>

          {/* Quick Stats Grid: Streak & Coins - ZERO BLACK OUTLINE */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-rose-50/80 flex items-center gap-3 border-0 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 border-0">
                <Flame size={20} className="fill-rose-500 text-rose-600" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-rose-600 uppercase">Streak Belajar</div>
                <div className="text-base font-black text-gray-900">3 Hari Berturut</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/80 flex items-center gap-3 border-0 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 border-0">
                <Gift size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-sky-600 uppercase">Otbee Coins</div>
                <div className="text-base font-black text-gray-900">{currentCoins} Koin</div>
              </div>
            </div>
          </div>

          {/* Misi Harian Belajar - ALWAYS POPULATED & ZERO OUTLINES */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <Award size={15} className="text-amber-500" />
                Misi Harian Pejuang PTN
              </h4>
              <span className="text-[10px] font-bold text-gray-400">Reset setiap hari</span>
            </div>

            <div className="space-y-2">
              {quests.map(quest => (
                <div
                  key={quest.id}
                  className={`p-3.5 rounded-2xl border-0 transition-all flex items-center justify-between gap-3 shadow-2xs ${
                    quest.isClaimed
                      ? 'bg-gray-50/70 opacity-60'
                      : quest.isCompleted
                      ? 'bg-amber-50/90 hover:bg-amber-100/90'
                      : 'bg-gray-50/80 hover:bg-gray-100'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-extrabold text-gray-900 leading-snug">
                      {quest.title}
                    </h5>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-black text-amber-700">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                        +{quest.rewardXP} XP
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
                        +{quest.rewardCoins} Koin
                      </span>
                    </div>
                  </div>

                  {quest.isClaimed ? (
                    <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-500 font-bold text-xs border-0">
                      Selesai ✓
                    </span>
                  ) : quest.isCompleted ? (
                    <button
                      onClick={() => handleClaim(quest.id)}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-amber-950 font-black text-xs transition-all shadow-xs cursor-pointer flex-shrink-0 border-0"
                    >
                      Klaim XP
                    </button>
                  ) : (
                    <a
                      href={quest.actionUrl}
                      onClick={onClose}
                      className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs transition-colors flex items-center gap-1 flex-shrink-0 border-0"
                    >
                      <span>Mulai</span>
                      <ArrowRight size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
