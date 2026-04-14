'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Module, Lesson } from '@/types'
import { CATEGORY_LABEL } from '@/lib/constants'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { ChevronDown, Plus, Trash2, Edit, ExternalLink, Link2 } from 'lucide-react'
import type { JalurCategory } from '@/types'

const supabase = createClient()

// Auto-convert Google Drive share link → embeddable image URL
function convertDriveThumb(url: string): string {
  const match = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
  if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`
  return url
}

export default function AdminEcoursePage() {
  const [modules, setModules] = useState<Array<Module & { lessons: Lesson[] }>>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [modModal, setModModal] = useState(false)
  const [lessonModal, setLessonModal] = useState<string | null>(null)
  const [editMod, setEditMod] = useState<Module | null>(null)

  const [modForm, setModForm] = useState({
    title: '', description: '', category: 'general', order_index: 0, thumbnail_url: '', file_url: '',
  })
  const [lessonForm, setLessonForm] = useState({
    title: '', description: '', content_type: 'video', content_url: '', content_body: '',
    file_url: '', order_index: 0, thumbnail_url: '',
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
      file_url: modForm.file_url || null,
    }
    if (editMod) {
      await supabase.from('modules').update(payload).eq('id', editMod.id)
    } else {
      await supabase.from('modules').insert({ ...payload, is_active: true })
    }
    setModModal(false)
    setEditMod(null)
    setModForm({ title: '', description: '', category: 'general', order_index: 0, thumbnail_url: '', file_url: '' })
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
      file_url: lessonForm.file_url || null,
      order_index: lessonForm.order_index,
      thumbnail_url: lessonForm.thumbnail_url || null,
      module_id: moduleId,
      is_active: true,
    })
    setLessonModal(null)
    setLessonForm({ title: '', description: '', content_type: 'video', content_url: '', content_body: '', file_url: '', order_index: 0, thumbnail_url: '' })
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

  // Handle thumbnail input with auto-convert for both module & lesson
  function handleModThumb(e: React.ChangeEvent<HTMLInputElement>) {
    setModForm(p => ({ ...p, thumbnail_url: convertDriveThumb(e.target.value) }))
  }
  function handleLessonThumb(e: React.ChangeEvent<HTMLInputElement>) {
    setLessonForm(p => ({ ...p, thumbnail_url: convertDriveThumb(e.target.value) }))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-brand-black">E-Course</h1>
        <Button onClick={() => { setEditMod(null); setModForm({ title: '', description: '', category: 'general', order_index: 0, thumbnail_url: '', file_url: '' }); setModModal(true) }} variant="primary" size="sm">
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
                  setModForm({ title: mod.title, description: mod.description ?? '', category: mod.category ?? 'general', order_index: mod.order_index, thumbnail_url: (mod as Module & { thumbnail_url?: string }).thumbnail_url ?? '', file_url: (mod as Module & { file_url?: string }).file_url ?? '' })
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
                        <a href={lesson.content_url} target="_blank" rel="noopener noreferrer" className="text-brand-muted hover:text-brand-black" title="Buka konten">
                          <ExternalLink size={13} />
                        </a>
                      )}
                      {(lesson as Lesson & { file_url?: string }).file_url && (
                        <a href={(lesson as Lesson & { file_url?: string }).file_url!} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700" title="Buka file">
                          <Link2 size={13} />
                        </a>
                      )}
                      <Button size="sm" variant="danger" onClick={() => deleteLesson(lesson.id)}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="ghost" onClick={() => { setLessonForm({ title: '', description: '', content_type: 'video', content_url: '', content_body: '', file_url: '', order_index: (mod.lessons?.length ?? 0), thumbnail_url: '' }); setLessonModal(mod.id) }}>
                  <Plus size={14} /> Tambah Lesson
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Module Modal */}
      <Modal isOpen={modModal} onClose={() => setModModal(false)} title={editMod ? 'Edit Modul' : 'Tambah Modul'}>
        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-brand-dark">Judul Modul</label>
            <input value={modForm.title} onChange={mf('title')} placeholder="Contoh: Modul Essay PPKB" className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-brand-dark">Deskripsi <span className="text-brand-muted font-normal">(opsional)</span></label>
            <textarea value={modForm.description} onChange={mf('description')} placeholder="Deskripsi singkat modul ini..." rows={3} className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black resize-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-brand-dark">Thumbnail <span className="text-brand-muted font-normal">(opsional)</span></label>
            <input value={modForm.thumbnail_url} onChange={handleModThumb} placeholder="Paste link Google Drive atau URL gambar" className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
            <p className="text-xs text-brand-muted">Link Google Drive otomatis dikonversi jadi gambar.</p>
            {modForm.thumbnail_url && (
              <img src={modForm.thumbnail_url} alt="preview" className="w-full h-32 object-cover rounded-lg mt-1" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-brand-dark">Kategori</label>
            <select value={modForm.category} onChange={mf('category')} className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black bg-white">
              <option value="general">Umum (semua member)</option>
              <option value="essay_only">Essay Only</option>
              <option value="prestasi_only">Prestasi Only</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <label className="text-xs font-semibold text-blue-800">📁 Link File PDF / Google Drive</label>
            <input
              value={modForm.file_url}
              onChange={mf('file_url')}
              placeholder="https://drive.google.com/file/d/..."
              className="w-full px-4 py-3 rounded-lg border border-blue-200 text-sm outline-none focus:border-blue-500 bg-white"
            />
            <p className="text-xs text-blue-600 mt-0.5">Link file materi modul ini (Google Drive, dll).</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-brand-dark">Urutan Tampil</label>
            <input type="number" value={modForm.order_index} onChange={mf('order_index')} placeholder="1, 2, 3..." min={0} className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
            <p className="text-xs text-brand-muted">Urutan modul di halaman e-course (dimulai dari 0).</p>
          </div>
          <Button onClick={saveModule} variant="primary" fullWidth>Simpan</Button>
        </div>
      </Modal>

      {/* Lesson Modal */}
      <Modal isOpen={!!lessonModal} onClose={() => setLessonModal(null)} title="Tambah Lesson">
        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-brand-dark">Judul Lesson</label>
            <input value={lessonForm.title} onChange={lf('title')} placeholder="Contoh: Cara Menulis Essay PPKB" className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-brand-dark">Deskripsi Singkat <span className="text-brand-muted font-normal">(opsional)</span></label>
            <textarea value={lessonForm.description} onChange={lf('description')} placeholder="Apa yang dipelajari di lesson ini?" rows={2} className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black resize-none" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-brand-dark">Tipe Konten</label>
            <select value={lessonForm.content_type} onChange={lf('content_type')} className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black bg-white">
              <option value="video">Video (YouTube embed)</option>
              <option value="text">Text / Markdown</option>
              <option value="pdf">PDF</option>
              <option value="template">Template (Download)</option>
            </select>
          </div>

          {lessonForm.content_type !== 'text' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-brand-dark">
                {lessonForm.content_type === 'video' ? 'Link YouTube (untuk embed video)' :
                 lessonForm.content_type === 'pdf' ? 'Link PDF (untuk ditampilkan di halaman)' :
                 'Link Konten Utama'}
              </label>
              <input
                value={lessonForm.content_url}
                onChange={lf('content_url')}
                placeholder={
                  lessonForm.content_type === 'video' ? 'https://youtube.com/watch?v=...' :
                  'https://...'
                }
                className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black"
              />
            </div>
          )}

          {lessonForm.content_type === 'text' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-brand-dark">Isi Konten (Teks / HTML)</label>
              <textarea value={lessonForm.content_body} onChange={lf('content_body')} placeholder="Tulis konten di sini..." rows={5} className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black resize-none font-mono" />
            </div>
          )}

          <div className="flex flex-col gap-1 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <label className="text-xs font-semibold text-blue-800">📁 Link File PDF / Google Drive</label>
            <input
              value={lessonForm.file_url}
              onChange={lf('file_url')}
              placeholder="https://drive.google.com/file/d/..."
              className="w-full px-4 py-3 rounded-lg border border-blue-200 text-sm outline-none focus:border-blue-500 bg-white"
            />
            <p className="text-xs text-blue-600 mt-0.5">Link file materi yang bisa didownload member. Paste link Google Drive biasa.</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-brand-dark">Thumbnail <span className="text-brand-muted font-normal">(opsional)</span></label>
            <input value={lessonForm.thumbnail_url} onChange={handleLessonThumb} placeholder="Paste link Google Drive atau URL gambar" className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
            <p className="text-xs text-brand-muted">Link Google Drive otomatis dikonversi jadi gambar.</p>
            {lessonForm.thumbnail_url && (
              <img src={lessonForm.thumbnail_url} alt="preview" className="w-full h-24 object-cover rounded-lg mt-1" />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-brand-dark">Urutan Tampil</label>
            <input type="number" value={lessonForm.order_index} onChange={lf('order_index')} placeholder="1, 2, 3..." min={0} className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
            <p className="text-xs text-brand-muted">Angka urutan lesson dalam modul ini (dimulai dari 0).</p>
          </div>

          <Button onClick={() => lessonModal && saveLesson(lessonModal)} variant="primary" fullWidth>
            Simpan Lesson
          </Button>
        </div>
      </Modal>
    </div>
  )
}
