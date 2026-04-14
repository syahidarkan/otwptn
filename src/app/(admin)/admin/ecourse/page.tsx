'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Module, Lesson } from '@/types'
import { CATEGORY_LABEL } from '@/lib/constants'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { ChevronDown, Plus, Trash2, Edit, ExternalLink } from 'lucide-react'
import type { JalurCategory } from '@/types'

const supabase = createClient()

export default function AdminEcoursePage() {
  const [modules, setModules] = useState<Array<Module & { lessons: Lesson[] }>>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [modModal, setModModal] = useState(false)
  const [lessonModal, setLessonModal] = useState<string | null>(null)
  const [editMod, setEditMod] = useState<Module | null>(null)

  const [modForm, setModForm] = useState({
    title: '', description: '', category: 'general', order_index: 0, thumbnail_url: '',
  })
  const [lessonForm, setLessonForm] = useState({
    title: '', description: '', content_type: 'video', content_url: '', content_body: '', order_index: 0, thumbnail_url: '',
  })

  const load = useCallback(async () => {
    const { data } = await supabase.from('modules').select('*, lessons(*)').order('order_index')
    setModules(data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  async function saveModule() {
    const payload = {
      title: modForm.title,
      description: modForm.description || null,
      category: modForm.category,
      order_index: modForm.order_index,
      thumbnail_url: modForm.thumbnail_url || null,
    }
    if (editMod) {
      await supabase.from('modules').update(payload).eq('id', editMod.id)
    } else {
      await supabase.from('modules').insert({ ...payload, is_active: true })
    }
    setModModal(false)
    setEditMod(null)
    setModForm({ title: '', description: '', category: 'general', order_index: 0, thumbnail_url: '' })
    await load()
  }

  async function deleteModule(id: string) {
    if (!confirm('Hapus modul ini beserta semua lessonnya?')) return
    await supabase.from('modules').delete().eq('id', id)
    await load()
  }

  async function saveLesson(moduleId: string) {
    await supabase.from('lessons').insert({
      title: lessonForm.title,
      description: lessonForm.description || null,
      content_type: lessonForm.content_type,
      content_url: lessonForm.content_url || null,
      content_body: lessonForm.content_body || null,
      order_index: lessonForm.order_index,
      thumbnail_url: lessonForm.thumbnail_url || null,
      module_id: moduleId,
      is_active: true,
    })
    setLessonModal(null)
    setLessonForm({ title: '', description: '', content_type: 'video', content_url: '', content_body: '', order_index: 0, thumbnail_url: '' })
    await load()
  }

  async function deleteLesson(id: string) {
    if (!confirm('Hapus lesson ini?')) return
    await supabase.from('lessons').delete().eq('id', id)
    await load()
  }

  const mf = (k: keyof typeof modForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setModForm(p => ({ ...p, [k]: k === 'order_index' ? Number(e.target.value) : e.target.value }))

  const lf = (k: keyof typeof lessonForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setLessonForm(p => ({ ...p, [k]: k === 'order_index' ? Number(e.target.value) : e.target.value }))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-brand-black">E-Course</h1>
        <Button onClick={() => { setEditMod(null); setModForm({ title: '', description: '', category: 'general', order_index: 0, thumbnail_url: '' }); setModModal(true) }} variant="primary" size="sm">
          <Plus size={15} /> Tambah Modul
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {modules.map((mod) => (
          <div key={mod.id} className="bg-white rounded-2xl border border-brand-gray-2">
            <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-brand-gray/40 rounded-t-2xl" onClick={() => setExpanded(expanded === mod.id ? null : mod.id)}>
              {(mod as Module & { thumbnail_url?: string }).thumbnail_url && (
                <img src={(mod as Module & { thumbnail_url?: string }).thumbnail_url!} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
              )}
              <ChevronDown size={16} className={`text-brand-muted transition-transform ${expanded === mod.id ? 'rotate-180' : ''}`} />
              <div className="flex-1">
                <p className="font-bold text-brand-black">{mod.title}</p>
                <p className="text-xs text-brand-muted">{CATEGORY_LABEL[mod.category as JalurCategory] ?? mod.category} • {mod.lessons?.length ?? 0} lesson</p>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="ghost" onClick={() => {
                  setEditMod(mod)
                  setModForm({ title: mod.title, description: mod.description ?? '', category: mod.category ?? 'general', order_index: mod.order_index, thumbnail_url: (mod as Module & { thumbnail_url?: string }).thumbnail_url ?? '' })
                  setModModal(true)
                }}>
                  <Edit size={13} />
                </Button>
                <Button size="sm" variant="danger" onClick={() => deleteModule(mod.id)}>
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>

            {expanded === mod.id && (
              <div className="border-t border-brand-gray-2 px-5 py-4">
                {mod.description && <p className="text-sm text-brand-muted mb-3">{mod.description}</p>}
                <div className="flex flex-col gap-2 mb-3">
                  {(mod.lessons ?? []).sort((a, b) => a.order_index - b.order_index).map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-brand-gray">
                      {(lesson as Lesson & { thumbnail_url?: string }).thumbnail_url && (
                        <img src={(lesson as Lesson & { thumbnail_url?: string }).thumbnail_url!} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                      )}
                      <span className="text-xs bg-brand-gray-2 px-2 py-0.5 rounded font-mono">{lesson.content_type}</span>
                      <span className="flex-1 text-sm font-medium text-brand-black">{lesson.title}</span>
                      {lesson.content_url && (
                        <a href={lesson.content_url} target="_blank" rel="noopener noreferrer" className="text-brand-muted hover:text-brand-black">
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <Button size="sm" variant="danger" onClick={() => deleteLesson(lesson.id)}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="ghost" onClick={() => { setLessonForm({ title: '', description: '', content_type: 'video', content_url: '', content_body: '', order_index: (mod.lessons?.length ?? 0), thumbnail_url: '' }); setLessonModal(mod.id) }}>
                  <Plus size={14} /> Tambah Lesson
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Module Modal */}
      <Modal isOpen={modModal} onClose={() => setModModal(false)} title={editMod ? 'Edit Modul' : 'Tambah Modul'}>
        <div className="flex flex-col gap-3">
          <input value={modForm.title} onChange={mf('title')} placeholder="Judul modul" className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
          <textarea value={modForm.description} onChange={mf('description')} placeholder="Deskripsi modul (opsional)" rows={3} className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black resize-none" />
          <input value={modForm.thumbnail_url} onChange={mf('thumbnail_url')} placeholder="URL thumbnail/foto (opsional)" className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
          {modForm.thumbnail_url && (
            <img src={modForm.thumbnail_url} alt="preview" className="w-full h-32 object-cover rounded-lg" />
          )}
          <select value={modForm.category} onChange={mf('category')} className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black bg-white">
            <option value="general">Umum</option>
            <option value="essay_only">Essay Only</option>
            <option value="prestasi_only">Prestasi Only</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <input type="number" value={modForm.order_index} onChange={mf('order_index')} placeholder="Urutan" className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
          <Button onClick={saveModule} variant="primary" fullWidth>Simpan</Button>
        </div>
      </Modal>

      {/* Lesson Modal */}
      <Modal isOpen={!!lessonModal} onClose={() => setLessonModal(null)} title="Tambah Lesson">
        <div className="flex flex-col gap-3">
          <input value={lessonForm.title} onChange={lf('title')} placeholder="Judul lesson" className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
          <textarea value={lessonForm.description} onChange={lf('description')} placeholder="Deskripsi singkat lesson (opsional)" rows={2} className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black resize-none" />
          <select value={lessonForm.content_type} onChange={lf('content_type')} className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black bg-white">
            <option value="video">Video (YouTube embed)</option>
            <option value="text">Text / Markdown</option>
            <option value="pdf">PDF</option>
            <option value="template">Template (Download)</option>
          </select>
          {lessonForm.content_type !== 'text' && (
            <input value={lessonForm.content_url} onChange={lf('content_url')} placeholder={lessonForm.content_type === 'video' ? 'https://youtube.com/...' : lessonForm.content_type === 'pdf' ? 'https://... (link PDF)' : 'https://... (link file download)'} className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
          )}
          {lessonForm.content_type === 'text' && (
            <textarea value={lessonForm.content_body} onChange={lf('content_body')} placeholder="Konten teks / HTML" rows={5} className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black resize-none font-mono" />
          )}
          <input value={lessonForm.thumbnail_url} onChange={lf('thumbnail_url')} placeholder="URL thumbnail lesson (opsional)" className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
          {lessonForm.thumbnail_url && (
            <img src={lessonForm.thumbnail_url} alt="preview" className="w-full h-24 object-cover rounded-lg" />
          )}
          <input type="number" value={lessonForm.order_index} onChange={lf('order_index')} placeholder="Urutan" className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
          <Button onClick={() => lessonModal && saveLesson(lessonModal)} variant="primary" fullWidth>
            Simpan Lesson
          </Button>
        </div>
      </Modal>
    </div>
  )
}
