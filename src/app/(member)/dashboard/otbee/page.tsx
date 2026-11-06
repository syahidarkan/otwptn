'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  Send,
  Lock,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  Bot,
  User,
  Copy,
  Check,
  Zap,
  BookOpen,
  Compass,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'
import SearchInput from '@/components/ui/SearchInput'
import { completeQuest, awardPoints } from '@/lib/gamification'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ConversationRow {
  id: string
  title: string
  messages: ChatMessage[]
  updated_at: string
}

const PROMPT_CATEGORIES = [
  {
    category: 'Strategi Jalur SNBP & SNBT',
    icon: Compass,
    color: 'from-amber-400 to-amber-500',
    prompts: [
      'Berapa rata-rata nilai rapor aman untuk lolos SNBP di Fasilkom UI?',
      'Kasih aku strategi memilih jurusan pilihan 1 dan pilihan 2 agar peluang maksimal.',
    ],
  },
  {
    category: 'Bedah Esai Motivasi',
    icon: BookOpen,
    color: 'from-blue-400 to-indigo-500',
    prompts: [
      'Gimana cara bikin hook pembuka essay motivasi PPKB UI yang tidak klise?',
      'Format paragraf essay motivasi yang disukai reviewer akademik kampus top.',
    ],
  },
  {
    category: 'Portofolio & Prestasi',
    icon: Zap,
    color: 'from-emerald-400 to-teal-500',
    prompts: [
      'Sertifikat lomba apa saja yang paling bernilai tinggi untuk jalur SNBP/Prestasi?',
      'Cara menjelaskan peran kepemimpinan di OSIS agar relevan dengan jurusan teknik.',
    ],
  },
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
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const loadConversations = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('otbee_conversations')
      .select('id, title, messages, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    setConversations((data as ConversationRow[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

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
    setInput('')
  }

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
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
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!conversationId && user) {
      const { data } = await supabase
        .from('otbee_conversations')
        .insert({ user_id: user.id, title: content.slice(0, 40), messages: nextMessages })
        .select('id')
        .single()
      if (data) {
        conversationId = data.id
        setActiveId(data.id)
      }
    } else if (conversationId) {
      await supabase
        .from('otbee_conversations')
        .update({ messages: nextMessages, updated_at: new Date().toISOString() })
        .eq('id', conversationId)
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
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Maaf, Otbee lagi gangguan sejenak. Coba kirim ulang beberapa saat lagi ya.' },
      ])
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
        } catch {
          // ignore partial chunk
        }
      }
    }

    setMessages(prev => [...prev, { role: 'assistant', content: full }])
    setStreamingText('')
    setSending(false)
    completeQuest('q-otbee')
    awardPoints(20, 15, 'Tanya Otbee AI')
    loadConversations()
  }

  const filteredConversations = conversations.filter(
    c => !search.trim() || c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative flex h-[calc(100vh-64px)] md:h-[calc(100vh-40px)] p-2 md:p-4 gap-4 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-amber-300/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-sky-300/15 blur-3xl pointer-events-none" />

      {/* Conversation history sidebar - Glassmorphic floating card */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ opacity: 0, x: -20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 288 }}
            exit={{ opacity: 0, x: -20, width: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="hidden md:flex flex-col flex-shrink-0 rounded-3xl backdrop-blur-2xl bg-white/80 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 relative z-10 overflow-hidden"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between pb-3 px-1 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-700">
                  <MessageSquare size={15} />
                </div>
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-900">
                  Riwayat Diskusi
                </h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100/80 transition-colors cursor-pointer"
                aria-label="Tutup panel riwayat"
              >
                <PanelLeftClose size={15} />
              </button>
            </div>

            {/* Action Bar: New Chat */}
            <div className="mt-3 mb-2.5">
              <button
                onClick={startNew}
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 font-black text-xs inline-flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Plus size={15} className="stroke-[2.5]" />
                <span>Percakapan Baru</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="mb-3">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Cari topik diskusi..."
                className="w-full !rounded-2xl !bg-gray-50/80 !border-gray-200/80 !text-xs !py-2"
              />
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {loading ? (
                <div className="text-center py-10 space-y-2">
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-[11px] font-bold text-gray-400">Memuat riwayat...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-10 px-4 space-y-1">
                  <p className="text-xs font-bold text-gray-500">Belum ada obrolan</p>
                  <p className="text-[10px] text-gray-400">Tanyakan apapun seputar strategi lolos PTN impianmu.</p>
                </div>
              ) : (
                filteredConversations.map(c => (
                  <button
                    key={c.id}
                    onClick={() => openConversation(c)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      activeId === c.id
                        ? 'bg-amber-400/20 text-amber-950 font-black border border-amber-400/40 shadow-xs'
                        : 'text-gray-700 hover:bg-gray-100/70 font-semibold'
                    }`}
                  >
                    <span className="truncate flex-1">{c.title || 'Percakapan Baru'}</span>
                    {activeId === c.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 animate-pulse" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Sidebar Footer Badge */}
            <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-[10px] text-gray-500 font-bold">
              <ShieldCheck size={13} className="text-emerald-500 flex-shrink-0" />
              <span>Privasi data & draft esai terenkripsi aman</span>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main chat arena - Glassmorphic Container */}
      <div className="flex-1 min-w-0 flex flex-col rounded-3xl backdrop-blur-2xl bg-white/80 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.05)] overflow-hidden relative z-10">
        {/* Sleek Topbar */}
        <div className="flex items-center justify-between px-5 md:px-7 py-3.5 border-b border-gray-100/80 bg-white/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden md:flex w-8 h-8 rounded-xl items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Buka panel riwayat"
                title="Buka Riwayat Diskusi"
              >
                <PanelLeftOpen size={17} />
              </button>
            )}

            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 p-1 flex items-center justify-center shadow-sm">
                <Image
                  src="/mascot/thumbsup.png"
                  alt="Otbee AI"
                  width={32}
                  height={32}
                  className="object-contain drop-shadow"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/20" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-gray-900 tracking-tight">Otbee AI</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                  Tutor SNBP & UTBK
                </span>
              </div>
              <p className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5 mt-0.5">
                <span>Rasionalisasi Nilai & Pembimbing Esai</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-emerald-600 font-black">Aktif Siaga</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startNew}
              className="px-3 py-1.5 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Reset Sesi</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
          {messages.length === 0 && !streamingText ? (
            /* Welcome / Zero State with Glass cards */
            <div className="max-w-3xl mx-auto py-4 sm:py-6 space-y-8">
              {/* Hero mascot & greetings */}
              <div className="text-center space-y-3">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="inline-block relative"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto relative">
                    <Image
                      src="/fitur/otbee-ai.png"
                      alt="Otbee Assistant"
                      fill
                      className="object-contain drop-shadow-xl animate-float"
                    />
                  </div>
                </motion.div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                  Halo Pejuang PTN! Ada yang mau kamu diskusikan?
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 max-w-xl mx-auto leading-relaxed">
                  Otbee siap bantu cek rasionalisasi nilai rapor, bedah struktur esai motivasi, hingga strategi memilih kombinasi prodi pilihan 1 & 2.
                </p>
              </div>

              {/* Quick Prompt Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                {PROMPT_CATEGORIES.map((cat, idx) => {
                  const Icon = cat.icon
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl p-4 bg-white/70 backdrop-blur-md border border-white/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-xs flex-shrink-0`}
                        >
                          <Icon size={14} className="stroke-[2.5]" />
                        </div>
                        <h3 className="text-xs font-black text-gray-900 truncate">{cat.category}</h3>
                      </div>

                      <div className="space-y-2">
                        {cat.prompts.map((p, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleSend(p)}
                            className="w-full text-left p-2.5 rounded-xl bg-gray-50/80 hover:bg-amber-50 text-gray-800 text-[11px] font-bold leading-snug border border-gray-200/50 hover:border-amber-300 transition-all flex items-start justify-between gap-1 group cursor-pointer"
                          >
                            <span>{p}</span>
                            <ArrowRight
                              size={12}
                              className="text-gray-400 group-hover:text-amber-600 flex-shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Active Message Flow */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3 items-start ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-2xl bg-amber-400/20 border border-amber-400/40 p-1 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <Image
                        src="/mascot/thumbsup.png"
                        alt="Otbee"
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                  )}

                  <div className={`group relative max-w-[85%] sm:max-w-[78%]`}>
                    <div
                      className={`text-xs sm:text-sm leading-relaxed px-5 py-4 whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 text-gray-950 font-bold rounded-3xl rounded-tr-xs shadow-md shadow-amber-400/10'
                          : 'backdrop-blur-xl bg-white/95 border border-white/90 text-gray-900 rounded-3xl rounded-tl-xs shadow-sm font-medium'
                      }`}
                    >
                      {m.content}
                    </div>

                    {/* Copy action on assistant responses */}
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => copyToClipboard(m.content, i)}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="Salin jawaban"
                      >
                        {copiedIdx === i ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>

                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-2xl bg-gray-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      <User size={15} />
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming Assistant Response */}
              {streamingText && (
                <div className="flex gap-3 items-start justify-start">
                  <div className="w-8 h-8 rounded-2xl bg-amber-400/20 border border-amber-400/40 p-1 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <Image
                      src="/mascot/thinking-idea.png"
                      alt="Otbee Thinking"
                      width={24}
                      height={24}
                      className="object-contain animate-pulse"
                    />
                  </div>
                  <div className="max-w-[85%] sm:max-w-[78%] backdrop-blur-xl bg-white/95 border border-white/90 text-gray-900 rounded-3xl rounded-tl-xs shadow-sm p-5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {streamingText}
                    <span className="inline-block w-1.5 h-4 bg-amber-500 ml-1 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Loading Thinking Indicator */}
              {sending && !streamingText && (
                <div className="flex gap-3 items-start justify-start">
                  <div className="w-8 h-8 rounded-2xl bg-amber-400/20 border border-amber-400/40 p-1 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <Image
                      src="/mascot/thinking-idea.png"
                      alt="Otbee Thinking"
                      width={24}
                      height={24}
                      className="object-contain animate-bounce"
                    />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white/90 border border-white/90 shadow-sm text-gray-600 text-xs font-bold flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    <span>Otbee sedang merumuskan jawaban terbaik...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Bar Dock - Elevated Glass Floating Capsule */}
        <div className="px-4 sm:px-6 md:px-8 pb-4 pt-2 bg-gradient-to-t from-white via-white/90 to-transparent">
          <div className="max-w-3xl mx-auto">
            {quotaError ? (
              <div className="flex items-center justify-between gap-3 p-4 rounded-3xl bg-amber-400/15 border border-amber-400/40 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-gray-950 flex items-center justify-center">
                    <Lock size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-950">Kuota Harian Otbee AI Habis</h4>
                    <p className="text-[11px] text-gray-700 font-semibold">
                      Akun Free memiliki kuota terbatas. Upgrade ke Akun Premium untuk akses tanpa batas.
                    </p>
                  </div>
                </div>
                <Link
                  href="/upgrade"
                  className="px-4 py-2 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-gray-950 shadow-sm transition-all flex-shrink-0"
                >
                  Buka Akses Unlimited
                </Link>
              </div>
            ) : (
              <div className="rounded-3xl backdrop-blur-2xl bg-white/95 border border-gray-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.08)] p-2 transition-all focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
                <div className="flex items-end gap-2 px-2 py-1">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={e => {
                      setInput(e.target.value)
                      e.target.style.height = 'auto'
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Tulis pertanyaanmu seputar SNBP, essay, rapor, atau UTBK..."
                    disabled={sending}
                    className="flex-1 bg-transparent text-xs sm:text-sm font-semibold outline-none text-gray-900 placeholder:text-gray-400 resize-none max-h-28 py-1.5 leading-relaxed"
                  />

                  <button
                    onClick={() => handleSend()}
                    disabled={sending || !input.trim()}
                    className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all hover:scale-105 active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer"
                    aria-label="Kirim pesan"
                  >
                    <Send size={16} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-gray-400 font-bold">
              <span>Otbee ditenagai kecerdasan buatan & bank data rasionalisasi PTN 2026/2027</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
