'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Quote, Plus, X, User, EyeOff } from 'lucide-react'

interface QuoteRow {
  id: string
  text: string
  author: string | null
}

const FALLBACK: QuoteRow = {
  id: 'fallback',
  text: 'Jangan peduli kata orang, buktikan kalau kamu bisa!',
  author: 'Tim OtwPTN',
}

function maskName(fullName: string): string {
  if (!fullName) return 'P****** P**'
  return fullName
    .trim()
    .split(/\s+/)
    .map(word => {
      if (word.length <= 1) return word
      return word[0] + '*'.repeat(Math.max(1, word.length - 1))
    })
    .join(' ')
}

export default function QuoteCard() {
  const supabase = createClient()
  const [quote, setQuote] = useState<QuoteRow | null>(null)
  const [adding, setAdding] = useState(false)
  const [text, setText] = useState('')
  const [userFullName, setUserFullName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
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

  useEffect(() => {
    loadRandomQuote()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          'Pejuang PTN'
        setUserFullName(name)
      }
    })
  }, [])

  async function handleSubmit() {
    if (!text.trim()) return
    setSaving(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const finalAuthor = isAnonymous ? maskName(userFullName) : (userFullName || 'Pejuang PTN')

    const { error: err } = await supabase.from('quotes').insert({
      text: text.trim(),
      author: finalAuthor,
      user_id: user.id,
    })

    if (err) {
      setError('Gagal menyimpan quote. Coba lagi ya.')
    } else {
      setText('')
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
          className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors"
          style={{ background: 'var(--bg-alt)', color: 'var(--muted)' }}
        >
          {adding ? <X size={12} /> : <Plus size={12} />}
          {adding ? 'Batal' : 'Tambah'}
        </button>
      </div>

      {adding ? (
        <div className="flex flex-col gap-2.5">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Tulis quote motivasi kamu..."
            rows={2}
            className="input text-sm resize-none"
          />

          {/* Opsi Tampilan Nama: Full Name vs Anonim S**** A*** */}
          <div className="flex flex-col gap-1.5 pt-1">
            <p className="text-[11px] font-bold text-gray-500">Tampilkan Nama Sebagai:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsAnonymous(false)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                  !isAnonymous
                    ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium mb-0.5">
                  <User size={11} /> Nama Lengkap
                </div>
                <span className="truncate block font-bold text-xs">{userFullName || 'Nama Saya'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAnonymous(true)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                  isAnonymous
                    ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-amber-700 font-medium mb-0.5">
                  <EyeOff size={11} /> Anonim Disamarkan
                </div>
                <span className="truncate block font-bold text-xs font-mono text-amber-900">
                  {maskName(userFullName)}
                </span>
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={saving || !text.trim()}
            className="btn btn-dark text-xs py-2 disabled:opacity-40 cursor-pointer"
          >
            {saving ? 'Menyimpan...' : 'Bagikan Quote'}
          </button>
        </div>
      ) : quote ? (
        <>
          <p className="text-sm italic mb-2 leading-relaxed" style={{ color: 'var(--fg)' }}>
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
            - {quote.author || 'Anonim'}
          </p>
        </>
      ) : (
        <div className="h-10" />
      )}
    </div>
  )
}
