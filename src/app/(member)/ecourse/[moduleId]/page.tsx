'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import type { Module, Lesson } from '@/types'
import { ChevronLeft, Video, FileText, Download, File, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Link from 'next/link'

const STORAGE_KEY = 'ecourse_completed'

function getCompleted(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}

function toggleCompleted(lessonId: string) {
  const current = getCompleted()
  const updated = current.includes(lessonId)
    ? current.filter((id) => id !== lessonId)
    : [...current, lessonId]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

const typeIcon: Record<string, React.ReactNode> = {
  video: <Video size={14} />,
  text: <FileText size={14} />,
  pdf: <File size={14} />,
  template: <Download size={14} />,
}

export default function ModulePage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.moduleId as string

  const [module, setModule] = useState<Module | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [completed, setCompleted] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setCompleted(getCompleted())
    const supabase = createClient()

    supabase.from('modules').select('*').eq('id', moduleId).single()
      .then(({ data }) => setModule(data))

    supabase.from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .eq('is_active', true)
      .order('order_index')
      .then(({ data }) => {
        setLessons(data ?? [])
        if (data && data.length > 0) setActiveLesson(data[0])
        setLoading(false)
      })
  }, [moduleId])

  function handleToggle(lessonId: string) {
    setCompleted(toggleCompleted(lessonId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-gray flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-gray flex flex-col">
      {/* Top bar */}
      <div className="bg-brand-black text-white px-4 py-3 flex items-center gap-4">
        <Link href="/ecourse" className="text-white/60 hover:text-white flex items-center gap-1 text-sm">
          <ChevronLeft size={16} /> E-Course
        </Link>
        <span className="text-white/30">/</span>
        <span className="text-white font-semibold text-sm truncate">{module?.title}</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: lesson list */}
        <aside className="w-72 bg-white border-r border-brand-gray-2 flex flex-col shrink-0 overflow-y-auto hidden md:flex">
          <div className="p-4 border-b border-brand-gray-2">
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">
              {lessons.length} Materi
            </p>
          </div>
          <nav className="flex flex-col p-2">
            {lessons.map((lesson) => {
              const done = completed.includes(lesson.id)
              const active = activeLesson?.id === lesson.id
              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                    active ? 'bg-brand-black text-white' : 'hover:bg-brand-gray text-brand-dark'
                  }`}
                >
                  <span className={active ? 'text-brand-yellow' : done ? 'text-green-500' : 'text-brand-muted'}>
                    {done ? <CheckCircle size={14} /> : typeIcon[lesson.content_type]}
                  </span>
                  <span className="text-sm font-medium leading-tight">{lesson.title}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeLesson ? (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-brand-black">{activeLesson.title}</h2>
                <button
                  onClick={() => handleToggle(activeLesson.id)}
                  className={`flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
                    completed.includes(activeLesson.id)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-brand-gray text-brand-dark hover:bg-brand-gray-2'
                  }`}
                >
                  <CheckCircle size={15} />
                  {completed.includes(activeLesson.id) ? 'Selesai' : 'Tandai Selesai'}
                </button>
              </div>

              {/* Content renderer */}
              {activeLesson.content_type === 'video' && activeLesson.content_url && (
                <div className="aspect-video rounded-2xl overflow-hidden bg-brand-black mb-6">
                  <iframe
                    src={activeLesson.content_url}
                    className="w-full h-full"
                    allowFullScreen
                    title={activeLesson.title}
                  />
                </div>
              )}

              {activeLesson.content_type === 'text' && activeLesson.content_body && (
                <div
                  className="prose prose-sm max-w-none bg-white rounded-2xl p-8 border border-brand-gray-2"
                  dangerouslySetInnerHTML={{ __html: activeLesson.content_body }}
                />
              )}

              {activeLesson.content_type === 'pdf' && activeLesson.content_url && (
                <div className="bg-white rounded-2xl p-8 border border-brand-gray-2 text-center">
                  <File size={48} className="mx-auto text-brand-muted mb-4" />
                  <p className="text-brand-dark font-medium mb-4">{activeLesson.title}</p>
                  <Button href={activeLesson.content_url} variant="primary">
                    Buka PDF
                  </Button>
                </div>
              )}

              {activeLesson.content_type === 'template' && activeLesson.content_url && (
                <div className="bg-white rounded-2xl p-8 border border-brand-gray-2 text-center">
                  <Download size={48} className="mx-auto text-brand-yellow mb-4" />
                  <p className="text-brand-dark font-medium mb-4">{activeLesson.title}</p>
                  <Button href={activeLesson.content_url} variant="primary">
                    Download Template
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-brand-muted mt-20">Pilih materi di sidebar</div>
          )}
        </main>
      </div>
    </div>
  )
}
