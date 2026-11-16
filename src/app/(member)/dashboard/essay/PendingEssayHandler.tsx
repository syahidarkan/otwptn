'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sparkles } from 'lucide-react'

export default function PendingEssayHandler() {
  const router = useRouter()
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const pendingRaw = localStorage.getItem('otwptn_pending_essay')
    if (!pendingRaw) return

    async function importPending() {
      try {
        setImporting(true)
        const pending = JSON.parse(pendingRaw!)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setImporting(false)
          return
        }

        const { data, error } = await supabase
          .from('essays')
          .insert({
            user_id: user.id,
            title: pending.title || 'Draft Essay PTN',
            target_ptn: pending.targetPtn || 'Universitas Indonesia (UI)',
            target_jalur: pending.targetPtn?.includes('PPKB')
              ? 'PPKB'
              : pending.targetPtn?.includes('PBUB')
                ? 'PBUB'
                : 'Jalur Mandiri Prestasi',
            content_json: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: pending.content || '' }],
                },
              ],
            },
          })
          .select('id')
          .single()

        localStorage.removeItem('otwptn_pending_essay')

        if (!error && data) {
          router.push(`/dashboard/essay/${data.id}`)
        } else {
          setImporting(false)
        }
      } catch (err) {
        console.warn('Gagal memproses pending essay:', err)
        setImporting(false)
      }
    }

    importPending()
  }, [router])

  if (!importing) return null

  return (
    <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-700 dark:text-amber-300 flex items-center gap-3 text-sm animate-pulse">
      <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
      <span>Memuat draft essay yang kamu tulis dari halaman preview...</span>
    </div>
  )
}
