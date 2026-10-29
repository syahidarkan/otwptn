'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus } from 'lucide-react'

export default function NewEssayButton() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('essays')
      .insert({ user_id: user.id, title: 'Essay Tanpa Judul' })
      .select('id')
      .single()
    setLoading(false)
    if (!error && data) router.push(`/dashboard/essay/${data.id}`)
  }

  return (
    <button
      onClick={handleCreate}
      disabled={loading}
      className="btn-brand-primary px-6 py-2.5 rounded-full text-xs sm:text-sm font-black shadow-md flex items-center gap-2 disabled:opacity-50 flex-shrink-0"
    >
      <Plus size={16} /> {loading ? 'Membuat...' : 'Essay Baru'}
    </button>
  )
}
