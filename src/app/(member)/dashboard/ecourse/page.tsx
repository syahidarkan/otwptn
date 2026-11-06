'use client'

import { useState, useRef, useEffect, useMemo, useSyncExternalStore, Suspense } from 'react'
import {
  ChevronDown,
  Lock,
  BookOpen,
  Play,
  Flag,
  Check,
  CheckCircle2,
  Crown,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { EJALUR_LIST, type ELesson, type EStage } from '@/lib/ecourseData'
import { getCompletedSnapshot, getCompletedServerSnapshot, subscribeCompleted } from './completed'

const CAT_ALIASES: Record<string, string> = {
  pbm: 'basic-essay',
  ppu: 'basic-essay',
  esai: 'essay',
  ppkb: 'essay',
}

function resolveJalurId(cat: string | null): string {
  if (cat && EJALUR_LIST.some(j => j.id === cat)) return cat
  if (cat && CAT_ALIASES[cat]) return CAT_ALIASES[cat]
  return EJALUR_LIST[0].id
}

// Pintarly winding offsets (X percentage within the road canvas)
const NODE_OFFSETS = [
  [50, 36, 44, 50], // Unit 1
  [50, 64, 56, 50], // Unit 2
  [50, 34, 46, 50], // Unit 3
  [50, 66, 54, 50], // Unit 4
  [50, 36, 44, 50], // Unit 5
  [50, 64, 56, 50], // Unit 6
  [50, 34, 46, 50], // Unit 7
  [50, 66, 54, 50], // Unit 8
  [50, 36, 44, 50], // Unit 9
  [50, 64, 56, 50], // Unit 10
]

const ROW_HEIGHT = 120 // px per node row (room for the lesson caption under each node)

function EcourseContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const jalurId = resolveJalurId(searchParams.get('cat'))
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const completed = useSyncExternalStore(subscribeCompleted, getCompletedSnapshot, getCompletedServerSnapshot)
  const [lockedNotice, setLockedNotice] = useState<string | null>(null)
  const [userTier, setUserTier] = useState<string>('free')
  const [isAdmin, setIsAdmin] = useState(false)
  const [premiumModalData, setPremiumModalData] = useState<{ title: string; unit: number; stageTitle: string; lessons: ELesson[] } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check profile tier
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase
        .from('profiles')
        .select('tier, is_admin')
        .eq('id', data.user.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          if (profile?.tier) setUserTier(profile.tier)
          if (profile?.is_admin) setIsAdmin(true)
        })
    })
  }, [])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const jalur = useMemo(
    () => EJALUR_LIST.find(j => j.id === jalurId) ?? EJALUR_LIST[0],
    [jalurId]
  )

  const allLessons = useMemo(() => jalur.stages.flatMap(s => s.lessons), [jalur])
  const completedCount = allLessons.filter(l => completed.includes(l.id)).length
  const totalLessons = allLessons.length

  // First incomplete lesson is the "current" active lesson on the road
  const nextLesson = allLessons.find(l => !completed.includes(l.id)) ?? allLessons[0]
  const nextStage =
    jalur.stages.find(s => s.lessons.some(l => l.id === nextLesson?.id)) ?? jalur.stages[0]

  function isLessonUnlocked(lessonId: string): boolean {
    const idx = allLessons.findIndex(l => l.id === lessonId)
    if (idx <= 0) return true
    // Unlocked if all previous lessons are completed
    return allLessons.slice(0, idx).every(l => completed.includes(l.id))
  }

  function handleNodeClick(lesson: ELesson, stage: EStage) {
    if (lesson.isPremium && userTier === 'free' && !isAdmin) {
      setPremiumModalData({
        title: lesson.title,
        unit: stage.id,
        stageTitle: stage.title,
        lessons: stage.lessons,
      })
      return
    }

    if (!isLessonUnlocked(lesson.id)) {
      setLockedNotice(`Materi "${lesson.title}" masih terkunci. Selesaikan materi sebelumnya terlebih dahulu!`)
      return
    }

    // Direct navigation to dedicated full-page reader route
    router.push(`/dashboard/ecourse/lesson/${lesson.id}`)
  }

  function handleSelectJalur(id: string) {
    setDropdownOpen(false)
    router.push(`/dashboard/ecourse?cat=${id}`)
  }

  return (
    <div className="w-full min-h-screen relative bg-white">
      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Jalur Switcher Pill */}
        <div className="flex justify-center mb-8 sticky top-4 z-40">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="glass-panel rounded-full px-5 py-2.5 flex items-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer"
              style={{ background: 'rgba(255, 255, 255, 0.95)' }}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-sky-100 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mascot/thumbsup.png" alt="" className="w-7 h-7 object-contain" />
              </div>
              <span className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight truncate max-w-[58vw] sm:max-w-none">
                {jalur.label}
              </span>
              <ChevronDown
                size={18}
                className="text-gray-500 transition-transform duration-200"
                style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}
              />
            </button>

            {dropdownOpen && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 rounded-2xl overflow-hidden shadow-2xl bg-white/95 backdrop-blur-xl z-50 animate-fade-up"
              >
                <div className="p-2 border-b border-gray-100 bg-gray-50/70">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 py-1">
                    Pilih Jalur Belajar
                  </p>
                </div>
                <div className="p-1 divide-y divide-gray-50">
                  {EJALUR_LIST.map(j => (
                    <button
                      key={j.id}
                      onClick={() => handleSelectJalur(j.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                        j.id === jalurId
                          ? 'bg-amber-50 text-amber-900 font-bold'
                          : 'hover:bg-gray-50 text-gray-800 font-semibold'
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm truncate">{j.label}</span>
                        <span className="block text-[11px] font-medium text-gray-500">
                          {j.stages.length} unit · {j.stages.reduce((n, s) => n + s.lessons.length, 0)} materi
                        </span>
                      </span>
                      {j.id === jalurId && (
                        <CheckCircle2 size={16} className="text-amber-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Layout: Center Road Canvas + Desktop Sticky Progress Panel */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-10">
          {/* CENTER: Winding Road Canvas */}
          <div className="w-full max-w-[620px] mx-auto flex flex-col items-center">
            {jalur.stages.map((stage, si) => {
              const offsets = NODE_OFFSETS[si % NODE_OFFSETS.length]
              const totalHeight = (stage.lessons.length + 1) * ROW_HEIGHT
              const isStageFinished = stage.lessons.every(l => completed.includes(l.id))

              return (
                <div key={stage.id} className="w-full mb-12">
                  {/* Stage Banner / Header */}
                  <div className="sticky top-20 z-30 mb-8 mx-auto max-w-[460px]">
                    <div
                      className="rounded-3xl p-4 sm:p-5 shadow-lg border border-white/60 backdrop-blur-md transition-transform"
                      style={{
                        background:
                          si % 2 === 0
                            ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                            : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-gray-700">
                          Unit {stage.id}
                        </span>
                        <span className="text-[11px] font-bold text-gray-600">
                          {stage.lessons.filter(l => completed.includes(l.id)).length} /{' '}
                          {stage.lessons.length} Selesai
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-gray-950 leading-tight">
                        {stage.title}
                      </h2>
                      <p className="text-xs text-gray-700 font-medium mt-1 leading-snug">
                        {stage.description ?? `Estimasi durasi belajar: ± ${stage.duration}`}
                      </p>
                    </div>
                  </div>

                  {/* Road Canvas with Winding SVG Track and Nodes */}
                  <div
                    className="relative w-full max-w-[420px] mx-auto"
                    style={{ height: totalHeight }}
                  >
                    {/* SVG Winding Curved Track */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ overflow: 'visible' }}
                    >
                      {/* Drop Shadow for the Road */}
                      <path
                        d={stage.lessons.reduce((acc, _, li) => {
                          const x = offsets[li % offsets.length]
                          const y = li * ROW_HEIGHT + ROW_HEIGHT / 2
                          if (li === 0) return `M ${x * 4.2} ${y}`
                          const prevX = offsets[(li - 1) % offsets.length]
                          const prevY = (li - 1) * ROW_HEIGHT + ROW_HEIGHT / 2
                          const midY = (prevY + y) / 2
                          return `${acc} C ${prevX * 4.2} ${midY}, ${x * 4.2} ${midY}, ${x * 4.2} ${y}`
                        }, '')}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />
                      {/* Main Cream / Light Blue Track */}
                      <path
                        d={stage.lessons.reduce((acc, _, li) => {
                          const x = offsets[li % offsets.length]
                          const y = li * ROW_HEIGHT + ROW_HEIGHT / 2
                          if (li === 0) return `M ${x * 4.2} ${y}`
                          const prevX = offsets[(li - 1) % offsets.length]
                          const prevY = (li - 1) * ROW_HEIGHT + ROW_HEIGHT / 2
                          const midY = (prevY + y) / 2
                          return `${acc} C ${prevX * 4.2} ${midY}, ${x * 4.2} ${midY}, ${x * 4.2} ${y}`
                        }, '')}
                        fill="none"
                        stroke={si % 2 === 0 ? '#fef08a' : '#bae6fd'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="6 6"
                      />
                    </svg>

                    {/* Lesson Nodes along the road */}
                    {stage.lessons.map((lesson, li) => {
                      const isDone = completed.includes(lesson.id)
                      const isCurrent = lesson.id === nextLesson?.id
                      const unlocked = isLessonUnlocked(lesson.id)
                      const xPct = offsets[li % offsets.length]
                      const topPx = li * ROW_HEIGHT + ROW_HEIGHT / 2

                      return (
                        <div
                          key={lesson.id}
                          className="absolute"
                          style={{
                            top: topPx,
                            left: `${xPct}%`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: isCurrent ? 10 : 2,
                          }}
                        >
                          <div className="relative flex flex-col items-center">
                            {/* "Mulai" / "Lanjut" Floating Badge */}
                            {isCurrent && (
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-20 animate-bounce">
                                <div className="px-3.5 py-1 rounded-full text-xs font-black tracking-wide bg-white text-gray-900 border border-gray-200 shadow-md">
                                  {isDone ? 'Ulangi' : 'Mulai'}
                                </div>
                              </div>
                            )}

                            {/* Node Button */}
                            <button
                              onClick={() => handleNodeClick(lesson, stage)}
                              className={`rounded-full relative flex items-center justify-center transition-all duration-200 cursor-pointer ${
                                isCurrent
                                  ? 'w-[72px] h-[72px] shadow-xl hover:scale-105 active:scale-95'
                                  : isDone
                                  ? 'w-[60px] h-[60px] shadow-sm hover:scale-105 active:scale-95'
                                  : 'w-[56px] h-[56px] shadow-xs hover:scale-105'
                              }`}
                              style={{
                                background: isCurrent
                                  ? 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)'
                                  : isDone
                                  ? '#dcfce7'
                                  : '#ffffff',
                                border: isCurrent
                                  ? '4px solid #bae6fd'
                                  : isDone
                                  ? '3px solid #86efac'
                                  : '3px solid #e2e8f0',
                                boxShadow: isCurrent
                                  ? '0 0 0 6px rgba(56, 189, 248, 0.25), 0 8px 24px rgba(0,0,0,0.12)'
                                  : undefined,
                              }}
                              aria-label={lesson.title}
                            >
                              {lesson.isPremium && (
                                <span
                                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border border-white text-amber-950 flex items-center justify-center shadow-xs z-10"
                                  title="Materi Eksklusif Premium"
                                >
                                  <Crown size={11} strokeWidth={2.6} className="fill-amber-950" />
                                </span>
                              )}
                              {isCurrent ? (
                                lesson.type === 'video' ? (
                                  <Play size={28} className="text-slate-900 fill-slate-900" />
                                ) : (
                                  <BookOpen size={28} className="text-slate-900" />
                                )
                              ) : isDone ? (
                                <Check size={26} className="text-emerald-600 stroke-[3]" />
                              ) : unlocked ? (
                                <BookOpen size={22} className="text-gray-500" />
                              ) : (
                                <Lock size={20} className="text-gray-400" />
                              )}
                            </button>

                            <span
                              className={`absolute top-full left-1/2 -translate-x-1/2 w-[150px] text-center text-[10px] leading-tight line-clamp-2 ${
                                isCurrent ? 'font-black text-gray-900' : 'font-bold text-gray-500'
                              }`}
                              style={{ marginTop: isCurrent ? 6 : 4 }}
                            >
                              {lesson.title}
                            </span>

                            {/* Otbee Mascot Beside Active Node */}
                            {isCurrent && (
                              <div
                                className="absolute pointer-events-none select-none z-10"
                                style={{
                                  left: xPct > 45 ? -84 : 76,
                                  top: -10,
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src="/mascot/reading-books.png"
                                  alt=""
                                  className="w-20 h-auto filter drop-shadow-md animate-float"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {/* Milestone Checkpoint Node */}
                    <div
                      className="absolute"
                      style={{
                        top: stage.lessons.length * ROW_HEIGHT + ROW_HEIGHT / 2,
                        left: `${offsets[3 % offsets.length]}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2,
                      }}
                    >
                      <div className="relative flex flex-col items-center">
                        <div
                          className="w-[56px] h-[56px] rounded-full flex items-center justify-center transition-all"
                          style={{
                            background: isStageFinished ? '#dcfce7' : '#f8fafc',
                            border: `3px solid ${isStageFinished ? '#4ade80' : '#cbd5e1'}`,
                            boxShadow: isStageFinished ? '0 4px 16px rgba(74, 222, 128, 0.25)' : undefined,
                          }}
                        >
                          <Flag
                            size={22}
                            className={isStageFinished ? 'text-emerald-700' : 'text-gray-400'}
                          />
                        </div>

                        {/* Otbee Mascot waving flag at checkpoint */}
                        <div
                          className="absolute pointer-events-none select-none"
                          style={{ left: 62, top: -20 }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/mascot/lulus-ptn.png"
                            alt=""
                            className="w-16 h-auto filter drop-shadow-md animate-float"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Free Unit Finished Card */}
                  {si === 0 && (
                    <div className="mt-8 mx-2 p-4 rounded-3xl bg-white shadow-md flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                          <Check size={16} className="stroke-[3]" />
                        </div>
                        <span className="text-sm font-extrabold text-gray-900">
                          Unit gratis selesai
                        </span>
                      </div>
                      <Link
                        href="/checkout/intensif"
                        className="px-4 py-2 rounded-full text-xs font-extrabold btn-brand-primary inline-flex items-center gap-1.5"
                      >
                        <Crown size={13} className="text-gray-900" /> Lihat Premium
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* RIGHT: Desktop Sticky Sidebar */}
          <div className="hidden lg:block w-[360px] flex-shrink-0 sticky top-6 space-y-4 self-start z-20">
            {/* Card 1: Course Progress Overview */}
            <div className="p-5 rounded-3xl bg-white shadow-md">
              <h3 className="text-base font-extrabold text-gray-900 mb-2">{jalur.label}</h3>
              <div className="h-2 rounded-full overflow-hidden bg-gray-100 mb-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalLessons ? (completedCount / totalLessons) * 100 : 0}%`,
                    background: 'linear-gradient(90deg, #ffd700 0%, #f59e0b 100%)',
                  }}
                />
              </div>
              <p className="text-xs font-semibold text-gray-500">
                {completedCount} dari {totalLessons} selesai
              </p>
            </div>

            {/* Card 2: Berikutnya: Pelajaran (Quick Action CTA) */}
            {nextLesson && (
              <div className="p-5 rounded-3xl bg-white shadow-md">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                  Berikutnya
                </p>
                <h4 className="text-base font-extrabold text-gray-900 mb-1">Pelajaran</h4>
                <p className="text-xs text-gray-600 mb-4 font-medium leading-snug">
                  Unit {nextStage.id} · {nextLesson.title}
                </p>
                <button
                  onClick={() => handleNodeClick(nextLesson, nextStage)}
                  className="w-full py-3 rounded-full text-sm font-extrabold btn-brand-primary cursor-pointer shadow-sm hover:shadow-md transition-all"
                >
                  Lanjutkan
                </button>
              </div>
            )}

            {/* Card 3: Index Unit / Stage Navigator */}
            <div className="p-5 rounded-3xl bg-white shadow-md max-h-72 overflow-y-auto">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                Daftar Unit
              </p>
              <div className="space-y-1.5">
                {jalur.stages.map(stg => {
                  const doneInStage = stg.lessons.filter(l => completed.includes(l.id)).length
                  const isDone = doneInStage === stg.lessons.length
                  return (
                    <div
                      key={stg.id}
                      className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors text-xs"
                    >
                      <span className="font-semibold text-gray-800 truncate max-w-[210px]">
                        Unit {stg.id}: {stg.title}
                      </span>
                      <span
                        className={`font-bold text-[11px] px-2 py-0.5 rounded-full ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {doneInStage}/{stg.lessons.length}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Exclusive Modal */}
      {premiumModalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-up"
          role="dialog"
        >
          <div className="w-full max-w-sm rounded-3xl p-6 bg-white border border-amber-200 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 flex items-center justify-center mx-auto shadow-md">
              <Crown size={28} className="fill-amber-950" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide text-center mb-1">
                Unit {premiumModalData.unit} · Khusus Premium
              </p>
              <h3 className="text-base font-black text-gray-950 leading-snug text-center">
                {premiumModalData.stageTitle}
              </h3>
              <div className="mt-3 space-y-1.5 bg-amber-50 rounded-2xl p-3">
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide mb-2">Yang kamu dapatkan di unit ini:</p>
                {premiumModalData.lessons.slice(0, 4).map((l, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-300 text-amber-950 text-[9px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-xs text-gray-700 font-medium leading-tight">{l.title}</span>
                  </div>
                ))}
                {premiumModalData.lessons.length > 4 && (
                  <p className="text-[10px] text-amber-700 font-bold mt-1 pl-6">+{premiumModalData.lessons.length - 4} materi lainnya</p>
                )}
              </div>
            </div>

            <div className="pt-1 space-y-2">
              <Link
                href="/upgrade"
                className="w-full py-3 rounded-full text-xs font-black btn-brand-primary flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Buka Akses Premium Sekarang</span>
                <ArrowRight size={14} />
              </Link>
              <button
                onClick={() => setPremiumModalData(null)}
                className="w-full py-2.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Locked Notice Popup */}
      {lockedNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-up"
          role="dialog"
        >
          <div className="w-full max-w-sm rounded-3xl p-6 bg-white border border-gray-200 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <Lock size={22} />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 mb-1">Materi Terkunci</h3>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed">{lockedNotice}</p>
            <button
              onClick={() => setLockedNotice(null)}
              className="w-full py-2.5 rounded-full text-xs font-extrabold bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function EcoursePage() {
  return (
    <Suspense fallback={null}>
      <EcourseContent />
    </Suspense>
  )
}
