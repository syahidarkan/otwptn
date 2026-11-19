'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { Plus, Edit, ExternalLink, AlertCircle } from 'lucide-react'

const CATEGORY_LABEL: Record<string, string> = {
  essay_only: 'Essay Only',
  prestasi_only: 'Prestasi Only',
  hybrid: 'Hybrid',
}

interface JalurPage {
  id: string
  university: string
  name: string
  category: string
  biaya: number | null
  persyaratan: string | null
  url: string | null
  pendaftaran: string | null
  pengumuman: string | null
  is_active: boolean
}

const emptyForm = {
  university: '',
  name: '',
  category: 'prestasi_only',
  biaya: '',
  persyaratan: '',
  url: '',
  pendaftaran: '',
  pengumuman: '',
}

const supabase = createClient()

export default function AdminJalurPage() {
  const [list, setList] = useState<JalurPage[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<JalurPage | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/jalur')
      const data = await res.json()
      if (data.jalurs) setList(data.jalurs)
    } catch {
      // Fallback
      const { data } = await supabase
        .from('jalur_pages')
        .select('*')
        .order('university')
      setList(data ?? [])
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setModal(true)
  }

  function openEdit(j: JalurPage) {
    setEditing(j)
    setForm({
      university: j.university,
      name: j.name,
      category: j.category,
      biaya: j.biaya ? String(j.biaya) : '',
      persyaratan: j.persyaratan ?? '',
      url: j.url ?? '',
      pendaftaran: j.pendaftaran ?? '',
      pengumuman: j.pengumuman ?? '',
    })
    setModal(true)
  }

  async function save() {
    const payload = {
      university: form.university,
      name: form.name,
      category: form.category,
      biaya: form.biaya ? Number(form.biaya) : null,
      persyaratan: form.persyaratan || null,
      url: form.url || null,
      pendaftaran: form.pendaftaran || null,
      pengumuman: form.pengumuman || null,
    }

    setError(null)
    try {
      const res = await fetch('/api/admin/jalur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          id: editing?.id,
          payload,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Gagal menyimpan data jalur')
        return
      }
    } catch (err) {
      console.error('[Admin Jalur Save Error]', err)
      setError('Gagal menghubungi server')
      return
    }

    setModal(false)
    load()
  }

  async function toggleActive(j: JalurPage) {
    setError(null)
    try {
      const res = await fetch('/api/admin/jalur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle',
          id: j.id,
          is_active: !j.is_active,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Gagal mengubah status jalur')
        return
      }
    } catch (err) {
      console.error('[Admin Jalur Toggle Error]', err)
      setError('Gagal menghubungi server')
      return
    }
    load()
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div className="space-y-6">
      {/* Header Banner Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center p-2.5 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascot-hd/roadmap-flags.png"
              alt="Jalur Masuk"
              className="w-full h-full object-contain"
              onError={e => {
                ;(e.currentTarget as HTMLImageElement).src = '/logo.png'
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500 font-bold">{list.length} Jalur Terdaftar</span>
            </div>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">
              Direktori Jalur Masuk PTN Non-Tes & Mandiri
            </h1>
            <p className="text-xs text-gray-500 font-medium max-w-2xl mt-1">
              Database universitas, persyaratan sertifikat, jadwal pendaftaran, dan biaya registrasi seleksi mandiri PTN se-Indonesia.
            </p>
          </div>
        </div>

        <button
          onClick={openAdd}
          className="bg-amber-400 hover:bg-amber-500 active:scale-95 text-amber-950 font-black px-5 py-3 rounded-2xl text-xs md:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Tambah Jalur Baru</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-gray-50 text-[11px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <th className="px-5 py-3 font-semibold">Universitas / Nama</th>
              <th className="px-5 py-3 font-semibold">Kategori</th>
              <th className="px-5 py-3 font-semibold">Pendaftaran</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((j) => (
              <tr key={j.id} className="border-b border-brand-gray last:border-0 hover:bg-brand-gray/30">
                <td className="px-5 py-3">
                  <p className="font-semibold text-brand-black">{j.name}</p>
                  <p className="text-xs text-brand-muted">{j.university}</p>
                </td>
                <td className="px-5 py-3 text-brand-dark">{CATEGORY_LABEL[j.category] ?? j.category}</td>
                <td className="px-5 py-3 text-brand-muted text-xs max-w-[180px] truncate">{j.pendaftaran ?? '-'}</td>
                <td className="px-5 py-3">
                  <Badge variant={j.is_active ? 'confirmed' : 'expired'}>
                    {j.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(j)}>
                      <Edit size={13} /> Edit
                    </Button>
                    <Button size="sm" variant={j.is_active ? 'danger' : 'primary'} onClick={() => toggleActive(j)}>
                      {j.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-brand-muted">Belum ada jalur</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Jalur' : 'Tambah Jalur'} size="lg">
        <div className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-800 dark:text-neutral-200 block mb-1">Universitas</label>
              <input value={form.university} onChange={f('university')} placeholder="Universitas Indonesia" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/80 dark:bg-neutral-900/80 text-sm text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-all" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-800 dark:text-neutral-200 block mb-1">Nama Jalur</label>
              <input value={form.name} onChange={f('name')} placeholder="PPKB UI" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/80 dark:bg-neutral-900/80 text-sm text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-800 dark:text-neutral-200 block mb-1">Kategori</label>
              <select value={form.category} onChange={f('category')} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/80 dark:bg-neutral-900/80 text-sm text-gray-900 dark:text-neutral-100 outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-all">
                <option value="essay_only">Essay Only</option>
                <option value="prestasi_only">Prestasi Only</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-800 dark:text-neutral-200 block mb-1">Biaya (Rp)</label>
              <input type="number" value={form.biaya} onChange={f('biaya')} placeholder="250000" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/80 dark:bg-neutral-900/80 text-sm text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-all" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-800 dark:text-neutral-200 block mb-1">Persyaratan & Dokumen</label>
            <textarea value={form.persyaratan} onChange={f('persyaratan')} placeholder="Pisahkan setiap syarat dengan &#34; - &#34; (spasi dash spasi)&#10;Contoh: Rapor sem 1-5 - Sertifikat prestasi - Foto 3x4" rows={4} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/80 dark:bg-neutral-900/80 text-sm text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-all resize-none" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-800 dark:text-neutral-200 block mb-1">Website Resmi</label>
            <input value={form.url} onChange={f('url')} placeholder="https://..." className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/80 dark:bg-neutral-900/80 text-sm text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-800 dark:text-neutral-200 block mb-1">Periode Pendaftaran</label>
              <input value={form.pendaftaran} onChange={f('pendaftaran')} placeholder="6 – 29 April 2026" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/80 dark:bg-neutral-900/80 text-sm text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-800 dark:text-neutral-200 block mb-1">Pengumuman</label>
              <input value={form.pengumuman} onChange={f('pengumuman')} placeholder="4 Juni 2026" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/80 dark:bg-neutral-900/80 text-sm text-gray-900 dark:text-neutral-100 placeholder:text-gray-400 dark:placeholder:text-neutral-500 outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-all" />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={save}
              disabled={!form.university || !form.name}
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-sm shadow-md shadow-amber-400/20 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              Simpan Data Jalur
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
