'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Quote, Plus, X } from 'lucide-react'

interface QuoteRow {
  id: string
  text: string
  author: string | null
}

const FALLBACK: QuoteRow = {
  id: 'fallback',
  text: 'Jangan peduli kata orang, buktikan kalau kamu bisa!',
  author: 'Tim otwptn',
}

export default function QuoteCard() {
  const supabase = createClient()
  const [quote, setQuote] = useState<QuoteRow | null>(null)
  const [adding, setAdding] = useState(false)
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadRandomQuote() {
    const { data, error: err } = await supabase.from('quotes').select('id, text, author')
    if (err || !data || data.length === 0) {
      setQuote(FALLBACK)
      return
    }
    setQuote(data[Math.floor(Math.random() * data.length)])
  }

  useEffect(() => { loadRandomQuote() }, [])

  async function handleSubmit() {
    if (!text.trim()) return
    setSaving(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { error: err } = await supabase.from('quotes').insert({
      text: text.trim(),
      author: author.trim() || null,
      user_id: user.id,
    })

    if (err) {
      setError('Gagal menyimpan quote. Coba lagi ya.')
    } else {
      setText('')
      setAuthor('')
      setAdding(false)
      loadRandomQuote()
    }
    setSaving(false)
  }

  return (
    <div className="card p-6 flex-1">
      <div className="flex items-start justify-between mb-2">
        <Quote size={18} style={{ color: 'var(--accent-hover)' }} />
        <button
          onClick={() => setAdding(a => !a)}
          className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: 'var(--bg-alt)', color: 'var(--muted)' }}
        >
          {adding ? <X size={12} /> : <Plus size={12} />}
          {adding ? 'Batal' : 'Tambah'}
        </button>
      </div>

      {adding ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Tulis quote motivasi kamu..."
            rows={2}
            className="input text-sm resize-none"
          />
          <input
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="Nama kamu (opsional)"
            className="input text-sm"
          />
          {error && <p className="text-xs" style={{ color: '#b91c1c' }}>{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={saving || !text.trim()}
            className="btn btn-dark text-xs py-2 disabled:opacity-40"
          >
            {saving ? 'Menyimpan...' : 'Bagikan Quote'}
          </button>
        </div>
      ) : quote ? (
        <>
          <p className="text-sm italic mb-2" style={{ color: 'var(--fg)' }}>&ldquo;{quote.text}&rdquo;</p>
          <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>— {quote.author || 'Anonim'}</p>
        </>
      ) : (
        <div className="h-10" />
      )}
    </div>
  )
}
