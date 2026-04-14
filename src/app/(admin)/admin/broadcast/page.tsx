'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { AlertTriangle } from 'lucide-react'

export default function AdminBroadcastPage() {
  const [memberCount, setMemberCount] = useState(0)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [confirm, setConfirm] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'member')
      .then(({ count }) => setMemberCount(count ?? 0))
  }, [])

  async function handleSend() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      })
      const data = await res.json()
      setResult(data.success ? `Berhasil kirim ke ${memberCount} member.` : (data.error ?? 'Gagal'))
    } finally {
      setLoading(false)
      setConfirm(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-brand-black mb-6">Broadcast Email</h1>

      {memberCount > 2500 && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6">
          <AlertTriangle size={18} className="text-yellow-600 shrink-0" />
          <p className="text-sm text-yellow-800">
            <strong>Peringatan:</strong> {memberCount} member mendekati limit 3.000 email/bulan Resend free tier.
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-brand-gray-2 p-6 flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold text-brand-dark block mb-1.5">Subject Email</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject email..."
            className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-brand-dark block mb-1.5">Pesan</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Isi pesan yang akan dikirim ke semua member..."
            rows={8}
            className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black resize-none"
          />
        </div>

        {/* Preview */}
        {body && (
          <div className="bg-brand-gray rounded-xl p-4">
            <p className="text-xs font-bold text-brand-muted mb-2 uppercase tracking-widest">Preview</p>
            <p className="text-sm text-brand-dark whitespace-pre-wrap">{body}</p>
          </div>
        )}

        {result && (
          <div className={`text-sm font-medium px-4 py-3 rounded-lg ${
            result.startsWith('Berhasil') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {result}
          </div>
        )}

        {!confirm ? (
          <Button
            onClick={() => setConfirm(true)}
            variant="primary"
            disabled={!subject || !body}
          >
            Kirim ke Semua Member ({memberCount})
          </Button>
        ) : (
          <div className="border border-red-200 rounded-xl p-4 bg-red-50">
            <p className="text-sm font-semibold text-red-800 mb-3">
              Yakin kirim ke <strong>{memberCount} member</strong>?
            </p>
            <div className="flex gap-3">
              <Button onClick={handleSend} variant="danger" loading={loading} fullWidth>
                Ya, Kirim Sekarang
              </Button>
              <Button onClick={() => setConfirm(false)} variant="ghost" fullWidth>
                Batal
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
