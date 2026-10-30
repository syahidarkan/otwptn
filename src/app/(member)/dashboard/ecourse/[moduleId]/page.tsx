'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Module, Lesson } from '@/types'
import {
  ChevronLeft, Video, FileText, Download, File,
  CheckCircle2, Lock, BookOpen, Play, Flag, X
} from 'lucide-react'
import { completeQuest } from '@/lib/quests'

const STORAGE_KEY = 'ecourse_completed'

// Zigzag horizontal offsets for the skill path (0–100 range, used as viewBox X coords)
const ZIGZAG = [8, 28, 52, 72, 52, 28, 8, 28, 52, 72, 52, 28]
const NODE_ROW_H = 88 // uniform row height px

function toYouTubeEmbed(url: string): string {
  if (url.includes('/embed/')) return url
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`
  const longMatch = url.match(/[?&]v=([^?&]+)/)
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`
  return url
}

function getCompleted(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}

function toggleCompleted(lessonId: string) {
  const current = getCompleted()
  const updated = current.includes(lessonId) ? current.filter(id => id !== lessonId) : [...current, lessonId]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

function isMilestone(index: number, total: number) {
  return index > 0 && (index % 4 === 0 || index === total - 1)
}

export default function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(params)
  const [module, setModule] = useState<Module | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [completed, setCompleted] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setCompleted(getCompleted())
    const supabase = createClient()
    supabase.from('modules').select('*').eq('id', moduleId).single().then(({ data }) => setModule(data))
    supabase.from('lessons').select('*').eq('module_id', moduleId).eq('is_active', true).order('order_index')
      .then(({ data }) => {
        setLessons(data ?? [])
        setLoading(false)
      })
    // Trigger auto-complete for daily quest: Tonton/baca modul ecourse
    completeQuest('q-ecourse')
  }, [moduleId])

  function handleToggle(lessonId: string) {
    setCompleted(toggleCompleted(lessonId))
    completeQuest('q-ecourse')
  }

  const completedCount = lessons.filter(l => completed.includes(l.id)).length

  // Find the first uncompleted lesson as "current"
  const currentIndex = lessons.findIndex(l => !completed.includes(l.id))
  const currentLesson = currentIndex >= 0 ? lessons[currentIndex] : lessons[lessons.length - 1]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)] md:h-screen">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Memuat...</p>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-20 px-6 py-3 flex items-center justify-between gap-4" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <Link href="/dashboard/ecourse" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--muted)' }}>
          <ChevronLeft size={16} /> Modul & Video
        </Link>
        <p className="text-sm font-extrabold truncate flex-1 text-center" style={{ color: 'var(--fg)' }}>{module?.title}</p>
        <span className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--muted)' }}>{completedCount}/{lessons.length}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-0">
        {/* LEFT: Skill path */}
        <div className="flex-1 lg:max-w-[520px] px-4 pt-8 pb-20 relative overflow-x-hidden">
          {/* Progress bar */}
          <div className="mx-4 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--muted)' }}>Progress unit ini</span>
              <span className="text-xs font-bold" style={{ color: 'var(--accent-hover)' }}>{completedCount} dari {lessons.length} selesai</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-alt)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${lessons.length ? (completedCount / lessons.length) * 100 : 0}%`, background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-hover) 100%)' }}
              />
            </div>
          </div>

          {lessons.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Belum ada materi di modul ini.</p>
            </div>
          ) : (
            <div className="relative" style={{ paddingBottom: 40 }}>
              {/* Vertical connecting SVG path - viewBox uses same 0–100 X scale as ZIGZAG */}
              <svg
                width="100%"
                height={lessons.length * NODE_ROW_H}
                viewBox={`0 0 100 ${lessons.length * NODE_ROW_H}`}
                preserveAspectRatio="none"
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 0 }}
              >
                {lessons.map((lesson, i) => {
                  if (i === lessons.length - 1) return null
                  const x1 = ZIGZAG[i % ZIGZAG.length] + 4
                  const x2 = ZIGZAG[(i + 1) % ZIGZAG.length] + 4
                  const y1 = i * NODE_ROW_H + NODE_ROW_H / 2
                  const y2 = (i + 1) * NODE_ROW_H + NODE_ROW_H / 2
                  const mx = (x1 + x2) / 2
                  const done = completed.includes(lesson.id)
                  return (
                    <path
                      key={lesson.id}
                      d={`M ${x1} ${y1} Q ${mx} ${(y1 + y2) / 2} ${x2} ${y2}`}
                      fill="none"
                      stroke={done ? '#86efac' : '#e5e7eb'}
                      strokeWidth="0.8"
                      strokeDasharray={done ? '0' : '2.5 1.5'}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  )
                })}
              </svg>

              {/* Lesson nodes */}
              <div className="relative" style={{ zIndex: 1 }}>
                {lessons.map((lesson, i) => {
                  const done = completed.includes(lesson.id)
                  const isCurrent = lesson.id === currentLesson?.id
                  const isLocked = !done && !isCurrent && i > (currentIndex >= 0 ? currentIndex : lessons.length)
                  const milestone = isMilestone(i, lessons.length)
                  const leftPct = ZIGZAG[i % ZIGZAG.length]
                  const isActive = activeLesson?.id === lesson.id
                  const isVideo = lesson.content_type === 'video'

                  return (
                    <div
                      key={lesson.id}
                      className="relative flex items-center"
                      style={{ height: NODE_ROW_H, paddingLeft: `${leftPct}%` }}
                    >
                      {/* Milestone flag */}
                      {milestone && (
                        <div
                          className="flex items-center gap-2 px-4 py-2 rounded-2xl mb-0 mr-4"
                          style={{ background: done ? '#dcfce7' : 'var(--bg-alt)', border: '2px solid', borderColor: done ? '#86efac' : 'var(--border)', minWidth: 120 }}
                        >
                          <Flag size={14} style={{ color: done ? '#15803d' : 'var(--muted-2)' }} />
                          <span className="text-xs font-bold" style={{ color: done ? '#15803d' : 'var(--muted)' }}>Checkpoint {Math.floor(i / 4)}</span>
                        </div>
                      )}

                      {/* Node button */}
                      {!milestone && (
                        <div className="relative flex-shrink-0">
                          {/* Mascot + speech bubble for current lesson */}
                          {isCurrent && (
                            <div className="absolute pointer-events-none" style={{ right: -90, top: -24, zIndex: 10 }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src="/fitur/modul-video.png" alt="" style={{ height: 56, width: 'auto', position: 'absolute', right: 0, bottom: 0 }} />
                              <div
                                className="absolute text-[10px] font-black px-2.5 py-1 rounded-xl whitespace-nowrap"
                                style={{ background: 'var(--accent)', color: 'var(--accent-ink)', bottom: 52, right: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                              >
                                {isActive ? 'Lanjut!' : 'Mulai!'}
                                <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid var(--accent)' }} />
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => setActiveLesson(isActive ? null : lesson)}
                            className="flex flex-col items-center gap-1.5 group"
                            style={{ outline: 'none' }}
                          >
                            {/* Circle node */}
                            <div
                              className="flex items-center justify-center rounded-full transition-all duration-200 group-hover:scale-110"
                              style={{
                                width: 52,
                                height: 52,
                                border: '3px solid',
                                borderColor: done ? '#4ade80' : isCurrent ? 'var(--accent-hover)' : isActive ? 'var(--accent)' : 'var(--border)',
                                background: done ? '#dcfce7' : isCurrent ? 'var(--accent)' : isActive ? 'var(--bg-alt)' : 'var(--bg)',
                                boxShadow: isCurrent ? '0 4px 16px rgba(253,211,0,0.35)' : isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                              }}
                            >
                              {done ? (
                                <CheckCircle2 size={22} style={{ color: '#15803d' }} />
                              ) : isLocked ? (
                                <Lock size={20} style={{ color: 'var(--muted-2)' }} />
                              ) : isVideo ? (
                                <Play size={20} style={{ color: isCurrent ? 'var(--accent-ink)' : 'var(--fg)', fill: isCurrent ? 'var(--accent-ink)' : 'var(--fg)' }} />
                              ) : (
                                <BookOpen size={20} style={{ color: isCurrent ? 'var(--accent-ink)' : 'var(--fg)' }} />
                              )}
                            </div>

                            {/* Lesson title chip */}
                            <div
                              className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold text-center max-w-[120px] leading-tight"
                              style={{
                                background: isActive ? 'var(--accent)' : 'var(--bg-alt)',
                                color: isActive ? 'var(--accent-ink)' : 'var(--fg)',
                                border: '1px solid',
                                borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                              }}
                            >
                              <span className="line-clamp-2">{lesson.title}</span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Lesson content viewer */}
        <div
          className="lg:flex-1 lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)] lg:overflow-y-auto"
          style={{ borderLeft: '1px solid var(--border)' }}
        >
          {activeLesson ? (
            <LessonContent
              lesson={activeLesson}
              completed={completed}
              onToggle={handleToggle}
              onClose={() => setActiveLesson(null)}
              onNext={() => {
                const idx = lessons.findIndex(l => l.id === activeLesson.id)
                if (idx < lessons.length - 1) setActiveLesson(lessons[idx + 1])
              }}
              hasNext={lessons.findIndex(l => l.id === activeLesson.id) < lessons.length - 1}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 px-8 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fitur/modul-video.png" alt="" className="mb-5 opacity-60" style={{ height: 100, width: 'auto' }} />
              <p className="text-base font-extrabold mb-2" style={{ color: 'var(--fg)' }}>
                {completedCount === lessons.length && lessons.length > 0 ? 'Semua materi selesai!' : 'Pilih materi untuk mulai'}
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
                {completedCount === lessons.length && lessons.length > 0
                  ? 'Keren banget! Kamu udah nyelesain semua materi di modul ini.'
                  : 'Tap salah satu node di jalur belajar untuk buka materinya.'}
              </p>
              {currentLesson && completedCount < lessons.length && (
                <button
                  onClick={() => setActiveLesson(currentLesson)}
                  className="btn btn-primary px-6 py-3 text-sm font-bold"
                >
                  {completedCount === 0 ? 'Mulai Belajar' : 'Lanjutkan'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface LessonContentProps {
  lesson: Lesson
  completed: string[]
  onToggle: (id: string) => void
  onClose: () => void
  onNext: () => void
  hasNext: boolean
}

function LessonContent({ lesson, completed, onToggle, onClose, onNext, hasNext }: LessonContentProps) {
  const isDone = completed.includes(lesson.id)
  const isVideo = lesson.content_type === 'video'

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--accent-hover)', letterSpacing: '0.08em' }}>
            {isVideo ? 'Video' : lesson.content_type === 'text' ? 'Bacaan' : lesson.content_type === 'pdf' ? 'PDF' : 'Template'}
          </span>
          <h2 className="text-lg font-extrabold leading-snug" style={{ color: 'var(--fg)' }}>{lesson.title}</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--bg-alt)', color: 'var(--muted)' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Video */}
      {lesson.content_type === 'video' && lesson.content_url && (
        <div className="aspect-video rounded-2xl overflow-hidden mb-5" style={{ background: 'var(--dark)' }}>
          <iframe
            src={toYouTubeEmbed(lesson.content_url)}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={lesson.title}
          />
        </div>
      )}

      {/* Text content */}
      {lesson.content_type === 'text' && lesson.content_body && (
        <div className="card prose prose-sm max-w-none p-6 mb-5" dangerouslySetInnerHTML={{ __html: lesson.content_body }} />
      )}

      {/* PDF */}
      {lesson.content_type === 'pdf' && lesson.content_url && (
        <div className="card p-8 text-center mb-5">
          <File size={36} className="mx-auto mb-3" style={{ color: 'var(--muted-2)' }} />
          <p className="text-sm font-semibold mb-4" style={{ color: 'var(--fg)' }}>{lesson.title}</p>
          <a href={lesson.content_url} target="_blank" rel="noreferrer" className="btn btn-primary text-sm px-5 py-2.5 inline-flex">Buka PDF</a>
        </div>
      )}

      {/* Template */}
      {lesson.content_type === 'template' && lesson.content_url && (
        <div className="card p-8 text-center mb-5">
          <Download size={36} className="mx-auto mb-3" style={{ color: 'var(--accent-hover)' }} />
          <p className="text-sm font-semibold mb-4" style={{ color: 'var(--fg)' }}>{lesson.title}</p>
          <a href={lesson.content_url} target="_blank" rel="noreferrer" className="btn btn-primary text-sm px-5 py-2.5 inline-flex">Download Template</a>
        </div>
      )}

      {/* File attachment */}
      {lesson.file_url && (
        <div className="flex items-center gap-4 card px-5 py-4 mb-5">
          <Download size={18} style={{ color: 'var(--muted-2)' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>File Materi</p>
            <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{lesson.title}</p>
          </div>
          <a href={lesson.file_url} target="_blank" rel="noreferrer" className="btn btn-primary text-xs px-4 py-2 inline-flex flex-shrink-0">Buka</a>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={() => onToggle(lesson.id)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all"
          style={{
            background: isDone ? '#dcfce7' : 'var(--accent)',
            color: isDone ? '#15803d' : 'var(--accent-ink)',
            border: '2px solid',
            borderColor: isDone ? '#86efac' : 'var(--accent)',
          }}
        >
          {isDone ? <CheckCircle2 size={16} /> : null}
          {isDone ? 'Sudah Selesai ✓' : 'Tandai Selesai'}
        </button>
        {hasNext && (
          <button
            onClick={onNext}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold"
            style={{ background: 'var(--bg-alt)', color: 'var(--fg)', border: '2px solid var(--border)' }}
          >
            Materi Berikutnya →
          </button>
        )}
      </div>
    </div>
  )
}
