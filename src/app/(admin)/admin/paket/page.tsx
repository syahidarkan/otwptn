'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Package } from '@/types'
import { CATEGORY_LABEL, TIER_LABEL } from '@/lib/constants'
import { formatRupiah } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { Plus, Edit } from 'lucide-react'
import type { JalurCategory, PackageTier } from '@/types'

const supabase = createClient()

export default function AdminPaketPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [modal, setModal] = useState(false)
  const [editPkg, setEditPkg] = useState<Package | null>(null)
  const [form, setForm] = useState({
    name: '', category: 'essay_only', tier: 'review',
    price: 0, addon_price: 50000, description: '', features: '',
  })

  const load = useCallback(async () => {
    const { data } = await supabase.from('packages').select('*').order('category').order('tier')
    setPackages(data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  function openEdit(pkg: Package) {
    setEditPkg(pkg)
    setForm({
      name: pkg.name, category: pkg.category, tier: pkg.tier,
      price: pkg.price, addon_price: pkg.addon_price,
      description: pkg.description ?? '',
      features: (pkg.features ?? []).join('\n'),
    })
    setModal(true)
  }

  async function save() {
    const payload = {
      ...form,
      price: Number(form.price),
      addon_price: Number(form.addon_price),
      features: form.features.split('\n').filter(Boolean),
    }
    if (editPkg) {
      await supabase.from('packages').update(payload).eq('id', editPkg.id)
    } else {
      await supabase.from('packages').insert({ ...payload, is_active: true })
    }
    setModal(false)
    setEditPkg(null)
    await load()
  }

  async function toggleActive(pkg: Package) {
    await supabase.from('packages').update({ is_active: !pkg.is_active }).eq('id', pkg.id)
    await load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-brand-black">Paket Bimbingan</h1>
        <Button onClick={() => { setEditPkg(null); setForm({ name: '', category: 'essay_only', tier: 'review', price: 0, addon_price: 50000, description: '', features: '' }); setModal(true) }} variant="primary" size="sm">
          <Plus size={15} /> Tambah Paket
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-brand-gray-2 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-gray-2 bg-brand-gray">
            <tr className="text-left text-brand-muted">
              <th className="px-5 py-3 font-semibold">Nama</th>
              <th className="px-5 py-3 font-semibold">Kategori</th>
              <th className="px-5 py-3 font-semibold">Tier</th>
              <th className="px-5 py-3 font-semibold">Harga</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id} className="border-b border-brand-gray last:border-0 hover:bg-brand-gray/30">
                <td className="px-5 py-3 font-semibold text-brand-black">{pkg.name}</td>
                <td className="px-5 py-3">{CATEGORY_LABEL[pkg.category as JalurCategory]}</td>
                <td className="px-5 py-3">{TIER_LABEL[pkg.tier]}</td>
                <td className="px-5 py-3">{formatRupiah(pkg.price)}</td>
                <td className="px-5 py-3">
                  <Badge variant={pkg.is_active ? 'confirmed' : 'expired'}>
                    {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </td>
                <td className="px-5 py-3 flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(pkg)}>
                    <Edit size={13} /> Edit
                  </Button>
                  <Button size="sm" variant={pkg.is_active ? 'danger' : 'primary'} onClick={() => toggleActive(pkg)}>
                    {pkg.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>
                </td>
              </tr>
            ))}
            {packages.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-brand-muted">Belum ada paket</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editPkg ? 'Edit Paket' : 'Tambah Paket'}>
        <div className="flex flex-col gap-3">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nama paket" className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm bg-white outline-none focus:border-brand-black">
              <option value="essay_only">Essay Only</option>
              <option value="prestasi_only">Prestasi Only</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <select value={form.tier} onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))} className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm bg-white outline-none focus:border-brand-black">
              <option value="review">Review</option>
              <option value="dokumen">Dokumen</option>
              <option value="menyeluruh">Menyeluruh</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} placeholder="Harga (Rp)" className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
            <input type="number" value={form.addon_price} onChange={(e) => setForm((f) => ({ ...f, addon_price: Number(e.target.value) }))} placeholder="Addon price" className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black" />
          </div>
          <textarea value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))} placeholder="Fitur (satu per baris)" rows={4} className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black resize-none" />
          <Button onClick={save} variant="primary" fullWidth disabled={!form.name}>Simpan</Button>
        </div>
      </Modal>
    </div>
  )
}
