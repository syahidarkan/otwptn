'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Check,
  Lock,
  Crown,
  Play,
  ArrowRight,
  BookOpen,
  Share2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
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
  } catch {}
}

export default function LessonDetailPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params)
  const router = useRouter()

  const [userTier, setUserTier] = useState<string>('free')
  const [completed, setCompletedState] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Find the lesson, stage, and track
  let foundJalur: EJalur | null = null
  let foundStage: EStage | null = null
  let foundLesson: ELesson | null = null

  for (const j of EJALUR_LIST) {
    for (const s of j.stages) {
      const l = s.lessons.find(item => item.id === lessonId)
      if (l) {
        foundJalur = j
        foundStage = s
        foundLesson = l
        break
      }
    }
    if (foundLesson) break
  }

  const allTrackLessons = foundJalur ? foundJalur.stages.flatMap(s => s.lessons) : []
  const currentIdx = allTrackLessons.findIndex(l => l.id === lessonId)
  const prevLesson = currentIdx > 0 ? allTrackLessons[currentIdx - 1] : null
  const nextLesson = currentIdx >= 0 && currentIdx < allTrackLessons.length - 1 ? allTrackLessons[currentIdx + 1] : null

  useEffect(() => {
    setCompletedState(getCompleted())

    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setLoading(false)
        return
      }
      supabase
        .from('profiles')
        .select('tier')
        .eq('id', data.user.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          if (profile?.tier) setUserTier(profile.tier)
          setLoading(false)
        })
    })
  }, [])

  function toggleDone(id: string) {
    const updated = completed.includes(id)
      ? completed.filter(x => x !== id)
      : [...completed, id]
    setCompletedState(updated)
    setCompleted(updated)
  }

  if (!foundLesson || !foundStage || !foundJalur) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white text-center">
        <div className="max-w-md space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <BookOpen size={30} />
          </div>
          <h2 className="text-xl font-black text-gray-950">Materi Tidak Ditemukan</h2>
          <p className="text-xs text-gray-600">
            Materi yang kamu tuju mungkin telah dipindahkan atau kode URL salah.
          </p>
          <Link
            href="/dashboard/ecourse"
            className="btn-brand-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black"
          >
            Kembali ke Daftar Modul
          </Link>
        </div>
      </div>
    )
  }

  const isLocked = foundLesson.isPremium && userTier === 'free'
  const backHref = `/dashboard/ecourse?cat=${foundJalur.id}`
  const isDone = completed.includes(foundLesson.id)

  return (
    <div className="w-full min-h-screen bg-gray-50/50 relative pb-28">
      {/* Background canvas */}
      <CardPattern type="pintarly-doodles" opacity={0.3} />

      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={backHref}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex-shrink-0"
              title="Kembali ke Silabus"
            >
              <ChevronLeft size={18} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                  Unit {foundStage.id}
                </span>
                <span className="text-[11px] font-semibold text-gray-400 truncate">
                  {foundStage.title}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-gray-950 truncate mt-0.5">
                {foundLesson.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!isLocked && (
              <button
                type="button"
                onClick={() => toggleDone(foundLesson.id)}
                className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDone
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'btn-brand-primary shadow-xs'
                }`}
              >
                {isDone ? (
                  <>
                    <CheckCircle2 size={15} /> Selesai
                  </>
                ) : (
                  <>
                    <Check size={15} /> Tandai Selesai
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* STRICT PREMIUM GATE */}
        {isLocked ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-amber-200 shadow-xl text-center space-y-6 max-w-lg mx-auto mt-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-amber-950 flex items-center justify-center mx-auto shadow-md">
              <Crown size={38} className="fill-amber-950" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                Unit {foundStage.id} · Materi Eksklusif Premium
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-950 mt-2 leading-snug">
                {foundLesson.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed max-w-sm mx-auto">
                Materi mendalam ini, template lolos seleksi, bedah esai kata demi kata, dan cheatsheet rahasia dikhususkan untuk pejuang PTN member <strong>Paket Premium & Intensif</strong>.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 max-w-sm mx-auto">
              <Link
                href="/upgrade"
                className="w-full py-3.5 rounded-full text-xs font-black btn-brand-primary flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-transform"
              >
                <span>Buka Akses Premium Sekarang</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                href={backHref}
                className="block w-full py-2.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Kembali ke Silabus Modul
              </Link>
            </div>
          </div>
        ) : (
          /* ACCESSIBLE LESSON READER */
          <article className="bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-gray-100 space-y-6">
            {/* Meta Header */}
            <div className="border-b border-gray-100 pb-5 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900">
                  {foundJalur.label}
                </span>
                <span className="text-xs font-bold text-gray-400">
                  Unit {foundStage.id} · {foundLesson.duration} baca
                </span>
                {foundLesson.isPremium && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-amber-950">
                    PREMIUM
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-snug">
                {foundLesson.title}
              </h1>
            </div>

            {/* Video Player if applicable */}
            {foundLesson.type === 'video' && (
              <div className="space-y-2">
                <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video shadow-lg">
                  {foundLesson.videoUrl ? (
                    <iframe
                      src={foundLesson.videoUrl}
                      title={foundLesson.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Play size={28} className="text-white fill-white ml-1" />
                      </div>
                      <span className="text-xs font-semibold mt-3 text-slate-300">Video materi resmi</span>
                    </div>
                  )}
                </div>
                {foundLesson.videoCredit && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950">
                    <span className="font-black">📺 Referensi Video:</span>
                    <span className="font-semibold text-amber-900">{foundLesson.videoCredit}</span>
                  </div>
                )}
              </div>
            )}

            {/* Long-form Content Article */}
            <div
              className="prose prose-sm max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: foundLesson.content }}
            />

            {/* Bottom Nav Prev / Next */}
            <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              {prevLesson ? (
                <Link
                  href={`/dashboard/ecourse/lesson/${prevLesson.id}`}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200 flex items-center gap-2 transition-colors justify-center"
                >
                  <ChevronLeft size={16} />
                  <div className="text-left">
                    <span className="text-[10px] text-gray-400 block font-normal">Materi Sebelumnya</span>
                    <span className="truncate max-w-[200px] block font-bold">{prevLesson.title}</span>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson && (
                <Link
                  href={
                    nextLesson.isPremium && userTier === 'free'
                      ? `/dashboard/ecourse/lesson/${nextLesson.id}`
                      : `/dashboard/ecourse/lesson/${nextLesson.id}`
                  }
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl btn-brand-primary text-xs font-black shadow-sm flex items-center gap-2 justify-center"
                >
                  <div className="text-right">
                    <span className="text-[10px] text-amber-900/80 block font-bold">
                      {nextLesson.isPremium && userTier === 'free' ? '🔒 Materi Berikutnya (Premium)' : 'Materi Berikutnya'}
                    </span>
                    <span className="truncate max-w-[200px] block">{nextLesson.title}</span>
                  </div>
                  <ChevronRight size={16} />
                </Link>
              )}
            </div>
          </article>
        )}
      </main>
    </div>
  )
}

