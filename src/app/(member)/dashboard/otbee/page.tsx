'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Send, Lock, Sparkles, PanelLeftClose, PanelLeftOpen, MessageSquare, Bot, User } from 'lucide-react'
import SearchInput from '@/components/ui/SearchInput'

interface ChatMessage { role: 'user' | 'assistant'; content: string }
interface ConversationRow { id: string; title: string; messages: ChatMessage[]; updated_at: string }

const SUGGESTIONS = [
  'Apa saja dokumen yang perlu disiapkan untuk PPKB UI?',
  'Gimana cara bikin essay motivasi yang kuat?',
  'Kasih aku strategi belajar 7 hari buat persiapan jalur prestasi.',
  'Berapa rata-rata nilai rapor aman untuk lolos SNBP?',
]

export default function OtbeePage() {
  const supabase = createClient()
  const [conversations, setConversations] = useState<ConversationRow[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [quotaError, setQuotaError] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadConversations = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('otbee_conversations')
      .select('id, title, messages, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    setConversations((data as ConversationRow[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadConversations() }, [loadConversations])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streamingText])

  function openConversation(c: ConversationRow) {
    setActiveId(c.id)
    setMessages(c.messages ?? [])
    setQuotaError(false)
  }

  function startNew() {
    setActiveId(null)
    setMessages([])
    setQuotaError(false)
  }

  async function handleSend(text?: string) {
    const content = (text ?? input).trim()
    if (!content || sending) return
    setInput('')
    setQuotaError(false)

    const userMsg: ChatMessage = { role: 'user', content }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setSending(true)
    setStreamingText('')

    let conversationId = activeId
    const { data: { user } } = await supabase.auth.getUser()
    if (!conversationId && user) {
      const { data } = await supabase
        .from('otbee_conversations')
        .insert({ user_id: user.id, title: content.slice(0, 40), messages: nextMessages })
        .select('id')
        .single()
      if (data) { conversationId = data.id; setActiveId(data.id) }
    } else if (conversationId) {
      await supabase.from('otbee_conversations').update({ messages: nextMessages, updated_at: new Date().toISOString() }).eq('id', conversationId)
    }

    const res = await fetch('/api/otbee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: nextMessages, conversation_id: conversationId }),
    })

    if (res.status === 403) {
      setQuotaError(true)
      setSending(false)
      return
    }
    if (!res.ok || !res.body) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, Otbee lagi gangguan. Coba lagi beberapa saat ya.' }])
      setSending(false)
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let full = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop() ?? ''
      for (const part of parts) {
        const line = part.trim()
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (payload === '[DONE]') continue
        try {
          const json = JSON.parse(payload)
          if (json.content) {
            full += json.content
            setStreamingText(full)
          }
        } catch { /* ignore partial chunk */ }
      }
    }

    setMessages(prev => [...prev, { role: 'assistant', content: full }])
    setStreamingText('')
    setSending(false)
    loadConversations()
  }

  const filteredConversations = conversations.filter(c => !search.trim() || c.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex h-[calc(100vh-56px)] md:h-screen p-3 md:p-6 gap-4">
      {/* Conversation history panel — Borderless floating card with soft shadow */}
      {sidebarOpen && (
        <div className="hidden md:flex flex-col flex-shrink-0 w-72 rounded-3xl bg-white shadow-md p-4">
          <div className="flex items-center justify-between pb-3 px-1">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-amber-500" />
              <h2 className="text-sm font-extrabold text-gray-900">Riwayat Chat</h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Tutup panel riwayat"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>

          <div className="mb-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Cari percakapan..." className="w-full" />
          </div>

          <div className="mb-3">
            <button
              onClick={startNew}
              className="btn-brand-primary w-full text-xs py-2.5 inline-flex items-center justify-center gap-1.5"
            >
              <Plus size={14} /> Percakapan Baru
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {loading ? (
              <p className="text-xs text-center py-6 text-gray-400">Memuat riwayat...</p>
            ) : filteredConversations.length === 0 ? (
              <p className="text-xs text-center py-6 text-gray-400">Belum ada percakapan</p>
            ) : filteredConversations.map(c => (
              <button
                key={c.id}
                onClick={() => openConversation(c)}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold truncate transition-all ${
                  activeId === c.id
                    ? 'bg-amber-100/70 text-amber-950 font-bold shadow-xs'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {c.title || 'Percakapan Baru'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main chat area — Borderless floating container */}
      <div className="flex-1 min-w-0 flex flex-col rounded-3xl bg-white shadow-md overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden md:flex w-8 h-8 rounded-full items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                aria-label="Buka panel riwayat"
              >
                <PanelLeftOpen size={18} />
              </button>
            )}
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mascot/thumbsup.png" alt="" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-gray-900">Otbee AI</span>
                <Sparkles size={13} className="text-amber-500" />
              </div>
              <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Siap Membantu
              </p>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
          {messages.length === 0 && !streamingText ? (
            <div className="max-w-xl mx-auto text-center pt-8 pb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fitur/otbee-ai.png" alt="" className="mx-auto mb-4 filter drop-shadow-md animate-float" style={{ height: 140, width: 'auto' }} />
              <h1 className="text-xl md:text-2xl font-extrabold mb-2 text-gray-900 tracking-tight">
                Ada yang ingin kamu tanyakan ke Otbee?
              </h1>
              <p className="text-xs mb-8 text-gray-500 leading-relaxed max-w-md mx-auto">
                Tanyakan seputar strategi SNBP, essay PPKB UI, seleksi mandiri rapor, atau perhitungan peluang PTN impianmu.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="p-3.5 rounded-2xl bg-gray-50 hover:bg-amber-50 text-gray-800 text-xs font-semibold shadow-xs hover:shadow-md transition-all text-left"
                  >
                    💡 {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto flex flex-col gap-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/mascot/thumbsup.png" alt="" className="w-6 h-6 object-contain" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] text-sm leading-relaxed px-5 py-3.5 rounded-3xl whitespace-pre-wrap shadow-xs ${
                      m.role === 'user'
                        ? 'bg-amber-400 text-gray-950 font-medium rounded-tr-xs'
                        : 'bg-gray-100/80 text-gray-900 rounded-tl-xs'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {streamingText && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/mascot/thumbsup.png" alt="" className="w-6 h-6 object-contain" />
                  </div>
                  <div className="max-w-[82%] text-sm leading-relaxed px-5 py-3.5 rounded-3xl rounded-tl-xs bg-gray-100/80 text-gray-900 whitespace-pre-wrap shadow-xs">
                    {streamingText}
                  </div>
                </div>
              )}
              {sending && !streamingText && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/mascot/thumbsup.png" alt="" className="w-6 h-6 object-contain" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-gray-100/80 text-gray-500 text-xs font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    Otbee sedang mengetik...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-100 bg-white">
          <div className="max-w-2xl mx-auto">
            {quotaError ? (
              <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50">
                <div className="flex items-center gap-2">
                  <Lock size={15} className="text-amber-700" />
                  <span className="text-xs font-bold text-amber-900">
                    Kuota chat Otbee kamu habis hari ini.
                  </span>
                </div>
                <Link href="/dashboard/mentor" className="btn-brand-primary text-xs !py-2 !px-4">
                  Upgrade Kuota
                </Link>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 pl-5 pr-2 rounded-full bg-gray-50 shadow-md transition-shadow"
                style={{ height: 54 }}
              >
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Tanya apa saja ke Otbee..."
                  disabled={sending}
                  className="flex-1 bg-transparent text-sm font-medium outline-none text-gray-900 placeholder:text-gray-400"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={sending || !input.trim()}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-transform active:scale-90 btn-brand-primary !p-0"
                  aria-label="Kirim pesan"
                >
                  <Send size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
