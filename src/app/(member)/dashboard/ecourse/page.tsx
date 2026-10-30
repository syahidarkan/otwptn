'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import {
  ChevronDown,
  Lock,
  BookOpen,
  Play,
  Flag,
  Check,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Crown,
  Trophy,
} from 'lucide-react'
import Link from 'next/link'
import { EJALUR_LIST, type ELesson, type EStage, type EJalur } from '@/lib/ecourseData'
import CardPattern from '@/components/ui/CardPattern'

const STORAGE_KEY = 'ecourse_v2_completed'

function getCompleted(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function setCompleted(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    /* noop */
  }
}

// Pintarly winding offsets (X percentage within the road canvas)
const NODE_OFFSETS = [
  [50, 36, 44, 50], // Unit 1 (meanders left, returns to center milestone)
  [50, 64, 56, 50], // Unit 2 (meanders right, returns to center milestone)
  [50, 34, 46, 50], // Unit 3
  [50, 66, 54, 50], // Unit 4
  [50, 36, 44, 50], // Unit 5
  [50, 64, 56, 50], // Unit 6
  [50, 34, 46, 50], // Unit 7
  [50, 66, 54, 50], // Unit 8
  [50, 36, 44, 50], // Unit 9
  [50, 64, 56, 50], // Unit 10
]

const ROW_HEIGHT = 100 // px per node row

export default function EcoursePage() {
  const [jalurId, setJalurId] = useState(EJALUR_LIST[0].id)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [completed, setCompletedState] = useState<string[]>([])
  const [activeLesson, setActiveLesson] = useState<ELesson | null>(null)
  const [activeStage, setActiveStage] = useState<EStage | null>(null)
  const [lockedNotice, setLockedNotice] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCompletedState(getCompleted())
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

  function toggleDone(id: string) {
    const updated = completed.includes(id)
      ? completed.filter(x => x !== id)
      : [...completed, id]
    setCompletedState(updated)
    setCompleted(updated)
  }

  function handleNodeClick(lesson: ELesson, stage: EStage) {
    if (!isLessonUnlocked(lesson.id)) {
      setLockedNotice(`Materi "${lesson.title}" masih terkunci. Selesaikan materi sebelumnya terlebih dahulu!`)
      return
    }
    setActiveLesson(lesson)
    setActiveStage(stage)
  }

  function goNext() {
    if (!activeLesson || !activeStage) return
    const currentIdx = allLessons.findIndex(l => l.id === activeLesson.id)
    if (currentIdx < allLessons.length - 1) {
      const nxt = allLessons[currentIdx + 1]
      const nxtStg = jalur.stages.find(s => s.lessons.some(l => l.id === nxt.id)) ?? activeStage
      setActiveLesson(nxt)
      setActiveStage(nxtStg)
    }
  }

  function goPrev() {
    if (!activeLesson || !activeStage) return
    const currentIdx = allLessons.findIndex(l => l.id === activeLesson.id)
    if (currentIdx > 0) {
      const prv = allLessons[currentIdx - 1]
      const prvStg = jalur.stages.find(s => s.lessons.some(l => l.id === prv.id)) ?? activeStage
      setActiveLesson(prv)
      setActiveStage(prvStg)
    }
  }

  return (
    <div className="w-full min-h-screen relative bg-white">
      {/* Pintarly Playful Doodle Canvas Background (Stars, Smileys, Triangles, Crosses) */}
      <CardPattern type="pintarly-doodles" opacity={0.45} />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Jalur Switcher (Pintarly Dropdown Pill) */}
        <div className="flex justify-center mb-8 sticky top-4 z-40">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="glass-panel rounded-full px-5 py-2.5 flex items-center gap-3 shadow-md hover:shadow-lg transition-all"
              style={{ background: 'rgba(255, 255, 255, 0.95)' }}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-sky-100 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mascot/thumbsup.png" alt="" className="w-7 h-7 object-contain" />
              </div>
              <span className="text-base font-extrabold text-gray-900 tracking-tight">
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
                      onClick={() => {
                        setJalurId(j.id)
                        setDropdownOpen(false)
                        setActiveLesson(null)
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors ${
                        j.id === jalurId
                          ? 'bg-amber-50 text-amber-900 font-bold'
                          : 'hover:bg-gray-50 text-gray-800 font-semibold'
                      }`}
                    >
                      <span className="text-sm">{j.label}</span>
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

        {/* Content Layout: Center Winding Path + Right Sticky Sidebar */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-12">
          {/* CENTER: Winding Road Column (Max width matching Pintarly ~480-520px) */}
          <div className="w-full max-w-[500px] mx-auto pb-32">
            {jalur.stages.map((stage, si) => {
              const offsets = NODE_OFFSETS[si % NODE_OFFSETS.length]
              const stageCompletedCount = stage.lessons.filter(l =>
                completed.includes(l.id)
              ).length
              const isStageFinished = stageCompletedCount === stage.lessons.length

              // Total height for this stage (3 lesson nodes + 1 milestone node)
              const stageNodeCount = stage.lessons.length + 1
              const stageHeight = stageNodeCount * ROW_HEIGHT

              return (
                <div key={stage.id} className="relative mb-14">
                  {/* Floating Unit Header Card - Sticky top-20 so it sticks and gets pushed by the next unit */}
                  <div className="sticky top-20 z-20 mx-2 mb-6 p-5 rounded-3xl bg-white shadow-md">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Unit {stage.id} · {stage.duration}
                    </p>
                    <h2 className="text-base font-extrabold text-gray-900 leading-snug mb-3">
                      {stage.title}
                    </h2>
                    {/* Horizontal Progress Bar */}
                    <div className="h-2 rounded-full overflow-hidden bg-gray-100 mb-1.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(stageCompletedCount / stage.lessons.length) * 100}%`,
                          background: 'linear-gradient(90deg, #38bdf8 0%, #0284c7 100%)',
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-semibold text-gray-400">
                      <span>{stageCompletedCount} dari {stage.lessons.length} selesai</span>
                      {isStageFinished && (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check size={12} /> Selesai
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Winding Road Track Container */}
                  <div className="relative" style={{ height: stageHeight }}>
                    {/* Smooth Continuous Winding SVG Road */}
                    <svg
                      width="100%"
                      height={stageHeight}
                      viewBox={`0 0 100 ${stageHeight}`}
                      preserveAspectRatio="none"
                      className="absolute inset-0 pointer-events-none"
                      style={{ zIndex: 0 }}
                    >
                      {/* Smooth curved bezier road path */}
                      {Array.from({ length: stageNodeCount - 1 }).map((_, i) => {
                        const x1 = offsets[i % offsets.length]
                        const x2 = offsets[(i + 1) % offsets.length]
                        const y1 = i * ROW_HEIGHT + ROW_HEIGHT / 2
                        const y2 = (i + 1) * ROW_HEIGHT + ROW_HEIGHT / 2
                        const mx = (x1 + x2) / 2
                        const lessonId = stage.lessons[i]?.id
                        const isDone = lessonId && completed.includes(lessonId)

                        return (
                          <g key={i}>
                            {/* Outer road track */}
                            <path
                              d={`M ${x1} ${y1} Q ${mx} ${(y1 + y2) / 2} ${x2} ${y2}`}
                              fill="none"
                              stroke="#e2e8f0"
                              strokeWidth="24"
                              strokeLinecap="round"
                              vectorEffect="non-scaling-stroke"
                            />
                            {/* Road progress highlight if completed */}
                            {isDone && (
                              <path
                                d={`M ${x1} ${y1} Q ${mx} ${(y1 + y2) / 2} ${x2} ${y2}`}
                                fill="none"
                                stroke="#bbf7d0"
                                strokeWidth="20"
                                strokeLinecap="round"
                                vectorEffect="non-scaling-stroke"
                              />
                            )}
                          </g>
                        )
                      })}
                    </svg>

                    {/* Lesson Nodes on Road */}
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
                            {/* "Mulai" / "Lanjut" Floating Badge (Centered Above Active Node) */}
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
                              className={`rounded-full flex items-center justify-center transition-all duration-200 ${
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

                            {/* Otbee Mascot Sitting Beside Active Node (Exact Pintarly Look) */}
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

                    {/* Milestone Checkpoint Node (Unit End with Flag) */}
                    <div
                      className="absolute"
                      style={{
                        top: 3 * ROW_HEIGHT + ROW_HEIGHT / 2,
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

                        {/* Otbee Mascot waving flag at checkpoint (Exact Pintarly Look) */}
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

                  {/* Free Unit Finished Card (Exact Pintarly Banner on Unit 1) */}
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

          {/* RIGHT: Desktop Sticky Sidebar (Exact Pintarly Desktop Layout - Pinned while scrolling) */}
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
                  onClick={() => {
                    setActiveLesson(nextLesson)
                    setActiveStage(nextStage)
                  }}
                  className="w-full py-3 rounded-full text-sm font-extrabold btn-brand-primary"
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

      {/* ─── LESSON STUDY MODAL (Glassmorphic Study Drawer) ─── */}
      {activeLesson && activeStage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-md animate-fade-up"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-start justify-between gap-4 bg-gray-50/70">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                    Unit {activeStage.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-700">
                    {activeLesson.type === 'video' ? 'Video' : 'Bacaan'} · {activeLesson.duration}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug">
                  {activeLesson.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveLesson(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-200/80 hover:bg-gray-300 text-gray-600 transition-colors flex-shrink-0"
                aria-label="Tutup"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Article */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-gray-800 text-sm leading-relaxed">
              {activeLesson.type === 'video' && (
                <div className="mb-6 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video shadow-lg">
                  {activeLesson.videoUrl ? (
                    <iframe
                      src={activeLesson.videoUrl}
                      title={activeLesson.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Play size={28} className="text-white fill-white ml-1" />
                      </div>
                      <span className="text-xs font-semibold mt-3 text-slate-300">Video segera hadir</span>
                    </div>
                  )}
                </div>
              )}

              <div
                className="prose prose-sm max-w-none prose-headings:font-extrabold prose-headings:text-gray-900 prose-p:leading-relaxed prose-li:my-0.5"
                dangerouslySetInnerHTML={{ __html: activeLesson.content }}
              />
            </div>

            {/* Modal Footer / Navigation Controls */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => toggleDone(activeLesson.id)}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  completed.includes(activeLesson.id)
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'glass-btn-primary'
                }`}
              >
                {completed.includes(activeLesson.id) ? (
                  <>
                    <CheckCircle2 size={16} /> Selesai Dipelajari
                  </>
                ) : (
                  <>
                    <Check size={16} /> Tandai Selesai
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={goPrev}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-1"
                >
                  <ChevronLeft size={14} /> Sebelumnya
                </button>
                <button
                  onClick={goNext}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-1"
                >
                  Berikutnya <ChevronRight size={14} />
                </button>
              </div>
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
              className="w-full py-2.5 rounded-full text-xs font-extrabold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
