'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { Plus, Edit, ExternalLink } from 'lucide-react'

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

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('jalur_pages')
      .select('*')
      .order('university')
    setList(data ?? [])
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
    if (editing) {
      await supabase.from('jalur_pages').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('jalur_pages').insert({ ...payload, is_active: true })
    }
    setModal(false)
    load()
  }

  async function toggleActive(j: JalurPage) {
    await supabase.from('jalur_pages').update({ is_active: !j.is_active }).eq('id', j.id)
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
                <td className="px-5 py-3 text-brand-muted text-xs max-w-[180px] truncate">{j.pendaftaran ?? '—'}</td>
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
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-brand-dark block mb-1">Universitas</label>
              <input value={form.university} onChange={f('university')} placeholder="Universitas Indonesia" className="w-full px-3 py-2.5 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-brand-dark block mb-1">Nama Jalur</label>
              <input value={form.name} onChange={f('name')} placeholder="PPKB UI" className="w-full px-3 py-2.5 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-dark block mb-1">Kategori</label>
              <select value={form.category} onChange={f('category')} className="w-full px-3 py-2.5 rounded-lg border border-brand-gray-2 text-sm bg-white outline-none focus:border-brand-black">
                <option value="essay_only">Essay Only</option>
                <option value="prestasi_only">Prestasi Only</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-dark block mb-1">Biaya (Rp)</label>
              <input type="number" value={form.biaya} onChange={f('biaya')} placeholder="250000" className="w-full px-3 py-2.5 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-dark block mb-1">Persyaratan & Dokumen</label>
            <textarea value={form.persyaratan} onChange={f('persyaratan')} placeholder="Pisahkan setiap syarat dengan &#34; - &#34; (spasi dash spasi)&#10;Contoh: Rapor sem 1-5 - Sertifikat prestasi - Foto 3x4" rows={5} className="w-full px-3 py-2.5 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black resize-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-dark block mb-1">Website Resmi</label>
            <input value={form.url} onChange={f('url')} placeholder="https://..." className="w-full px-3 py-2.5 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-brand-dark block mb-1">Periode Pendaftaran</label>
              <input value={form.pendaftaran} onChange={f('pendaftaran')} placeholder="6 – 29 April 2026" className="w-full px-3 py-2.5 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-dark block mb-1">Pengumuman</label>
              <input value={form.pengumuman} onChange={f('pengumuman')} placeholder="4 Juni 2026" className="w-full px-3 py-2.5 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
            </div>
          </div>

          <Button onClick={save} variant="primary" fullWidth disabled={!form.university || !form.name}>
            Simpan
          </Button>
        </div>
      </Modal>
    </div>
  )
}
