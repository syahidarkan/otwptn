'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ProfilPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    school: '',
    email: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      supabase.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: profile }) => {
        if (profile) {
          setForm({
            full_name: profile.full_name ?? '',
            phone: profile.phone ?? '',
            school: profile.school ?? '',
            email: profile.email ?? '',
          })
        }
        setLoading(false)
      })
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: err } = await supabase.from('profiles').update({
      full_name: form.full_name,
      phone: form.phone,
      school: form.school,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    if (err) {
      setError('Gagal menyimpan perubahan')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-gray flex items-center justify-center">
        <p className="text-brand-muted">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-gray pt-24 pb-16">
      <div className="max-w-lg mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-black mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Kembali
        </button>

        <div className="bg-white rounded-2xl border border-brand-gray-2 p-8">
          <h1 className="text-2xl font-extrabold text-brand-black mb-6">Edit Profil</h1>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-brand-dark">Nama Lengkap</label>
              <input
                value={form.full_name}
                onChange={(e) => setForm(p => ({ ...p, full_name: e.target.value }))}
                placeholder="Nama lengkap"
                className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-brand-dark">Email</label>
              <input
                value={form.email}
                disabled
                className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm bg-brand-gray text-brand-muted cursor-not-allowed"
              />
              <p className="text-xs text-brand-muted">Email tidak bisa diubah</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-brand-dark">No. WhatsApp</label>
              <input
                value={form.phone}
                onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="08xxxxxxxxxx"
                className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-brand-dark">Asal Sekolah</label>
              <input
                value={form.school}
                onChange={(e) => setForm(p => ({ ...p, school: e.target.value }))}
                placeholder="SMAN 1 Jakarta"
                className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {saved && (
            <div className="mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
              <CheckCircle2 size={15} /> Profil berhasil disimpan
            </div>
          )}

          <Button
            onClick={handleSave}
            loading={saving}
            variant="primary"
            fullWidth
            className="mt-6"
          >
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </div>
  )
}
