'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Upload, X } from 'lucide-react'

// Retroactive upload for mentors approved before the almet-photo requirement existed
// (new applicants upload it at /mentor/apply instead). Shown on the mentor dashboard
// until profiles.mentor_photo_url is set.
export default function MentorAlmetUploadCard() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setChecked(true); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('mentor_photo_url')
        .eq('id', data.user.id)
        .maybeSingle()
      setPhotoUrl(profile?.mentor_photo_url || null)
      setChecked(true)
    })
  }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'almet')
      const res = await fetch('/api/mentor/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal mengunggah foto')
        return
      }
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        await supabase.from('profiles').update({ mentor_photo_url: data.url }).eq('id', userData.user.id)
      }
      setPhotoUrl(data.url)
    } catch {
      setError('Terjadi kesalahan saat mengunggah')
    } finally {
      setUploading(false)
    }
  }

  if (!checked || photoUrl || dismissed) return null

  return (
    <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0">
          <Camera size={20} />
        </div>
        <div>
          <p className="text-xs font-black text-amber-950">Upload Foto Pakai Jaket Almamater</p>
          <p className="text-[11px] text-amber-800 mt-0.5 max-w-md">
            Profil mentormu belum punya foto formal memakai jaket almamater (almet). Upload sekarang agar ditampilkan sebagai bukti identitas alumni.
          </p>
          {error && <p className="text-[11px] text-rose-600 font-bold mt-1">{error}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <label className="px-4 py-2 rounded-full text-xs font-black bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-2xs cursor-pointer inline-flex items-center gap-1.5">
          {uploading ? 'Mengunggah...' : <><Upload size={13} /> Upload Foto</>}
          <input type="file" accept=".png,.jpg,.jpeg" className="hidden" disabled={uploading} onChange={handleUpload} />
        </label>
        <button onClick={() => setDismissed(true)} className="p-2 rounded-full text-amber-700 hover:bg-amber-100" title="Tutup">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
