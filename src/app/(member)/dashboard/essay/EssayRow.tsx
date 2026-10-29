'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FileText, Star, Trash2, Copy } from 'lucide-react'

interface EssayRowProps {
  id: string
  title: string
  targetPtn: string | null
  targetJalur: string | null
  latestScore: number | null
}

export default function EssayRow({ id, title, targetPtn, targetJalur, latestScore }: EssayRowProps) {
  const supabase = createClient()
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleDelete() {
    setBusy(true)
    await supabase.from('essays').delete().eq('id', id)
    router.refresh()
  }

  async function handleDuplicate(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setBusy(true)
    const { data: original } = await supabase.from('essays').select('title, content, target_ptn, target_jalur').eq('id', id).single()
    const { data: { user } } = await supabase.auth.getUser()
    if (original && user) {
      const { data: copy } = await supabase.from('essays').insert({
        user_id: user.id,
        title: `${original.title} (Salinan)`,
        content: original.content,
        target_ptn: original.target_ptn,
        target_jalur: original.target_jalur,
      }).select('id').single()
      if (copy) router.push(`/dashboard/essay/${copy.id}`)
    }
    setBusy(false)
  }

  if (confirming) {
    return (
      <div className="p-5 rounded-3xl bg-rose-50/70 shadow-md flex items-center justify-between gap-4">
        <p className="text-xs font-bold text-rose-800">
          Hapus &ldquo;{title}&rdquo;? Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setConfirming(false)}
            disabled={busy}
            className="text-xs font-bold px-4 py-2 rounded-full bg-white text-gray-700 shadow-xs hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={busy}
            className="text-xs font-black px-4 py-2 rounded-full bg-rose-600 text-white shadow-xs hover:bg-rose-700 disabled:opacity-50"
          >
            {busy ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/dashboard/essay/${id}`}
      className="rounded-3xl bg-white shadow-md hover:shadow-xl transition-all p-5 flex items-center gap-4 group hover:-translate-y-0.5"
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-amber-100 text-amber-700 shadow-xs">
        <FileText size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-extrabold text-gray-900 truncate group-hover:text-amber-900">
            {title}
          </p>
          {targetPtn && (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
              {targetPtn}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate font-medium">
          {targetJalur ? `Jalur: ${targetJalur}` : 'Belum diatur jalur seleksi'}
        </p>
      </div>
      {latestScore != null && (
        <div className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 font-black text-xs">
          <Star size={13} fill="currentColor" stroke="none" /> {Math.round(latestScore)}/100
        </div>
      )}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleDuplicate}
          disabled={busy}
          aria-label="Duplikat essay"
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Copy size={16} />
        </button>
        <button
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            setConfirming(true)
          }}
          aria-label="Hapus essay"
          className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </Link>
  )
}
