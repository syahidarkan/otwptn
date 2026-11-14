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
import { OtbeeAvatar } from '@/components/mascot/otbee'
import type { ClipName, OtbeeHandle } from '@/components/mascot/otbee'

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
  const [isShrinkingHead, setIsShrinkingHead] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const heroAvatarRef = useRef<OtbeeHandle>(null)

  const handleHeadLoveReaction = () => {
    heroAvatarRef.current?.fx('heart', 1)
    heroAvatarRef.current?.play('shy', {
      onDone: () => heroAvatarRef.current?.play('idle'),
    })
  }

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

    if (messages.length === 0) {
      setIsShrinkingHead(true)
      setTimeout(() => setIsShrinkingHead(false), 480)
    }

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
      <style>{`
        @keyframes otbee-float-heart {
          0% { transform: translate(0, 0) scale(0.6) rotate(0deg); opacity: 1; }
          50% { opacity: 0.95; }
          100% { transform: translate(15px, -85px) scale(1.3) rotate(25deg); opacity: 0; }
        }
        @keyframes otbee-shrink-to-avatar {
          0% {
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            top: 90px;
            left: 50px;
            transform: translate(0, 0) scale(0.24);
            opacity: 0.85;
          }
        }
      `}</style>
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
            className="hidden md:flex flex-col flex-shrink-0 rounded-3xl backdrop-blur-2xl bg-white/80 dark:bg-[#16171b]/95 border border-white/80 dark:border-[#27272a] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 relative z-10 overflow-hidden text-slate-800 dark:text-slate-100"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between pb-3 px-1 border-b border-gray-100 dark:border-[#27272a]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  <MessageSquare size={15} />
                </div>
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                  Riwayat Diskusi
                </h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-[#23252c] transition-colors cursor-pointer"
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
                className="w-full !rounded-2xl !bg-gray-50/80 dark:!bg-[#22242b] !border-gray-200/80 dark:!border-[#2e313c] !text-xs !py-2 text-slate-900 dark:text-white"
              />
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {loading ? (
                <div className="text-center py-10 space-y-2">
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-[11px] font-bold text-gray-400 dark:text-slate-500">Memuat riwayat...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-10 px-4 space-y-1">
                  <p className="text-xs font-bold text-gray-500 dark:text-slate-400">Belum ada obrolan</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">Tanyakan apapun seputar strategi lolos PTN impianmu.</p>
                </div>
              ) : (
                filteredConversations.map(c => (
                  <button
                    key={c.id}
                    onClick={() => openConversation(c)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      activeId === c.id
                        ? 'bg-amber-400/20 text-amber-950 dark:text-amber-300 font-black border border-amber-400/40 shadow-xs'
                        : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100/70 dark:hover:bg-[#23252c] font-semibold'
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
            <div className="pt-3 border-t border-gray-100 dark:border-[#27272a] flex items-center gap-2 text-[10px] text-gray-500 dark:text-slate-400 font-bold">
              <ShieldCheck size={13} className="text-emerald-500 flex-shrink-0" />
              <span>Privasi data & draft esai terenkripsi aman</span>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main chat arena - Glassmorphic Container */}
      <div className="flex-1 min-w-0 flex flex-col rounded-3xl backdrop-blur-2xl bg-white/80 dark:bg-[#16171b]/95 border border-white/80 dark:border-[#27272a] shadow-[0_8px_30px_rgb(0,0,0,0.05)] overflow-hidden relative z-10 text-slate-800 dark:text-slate-100">
        {/* Sleek Topbar */}
        <div className="flex items-center justify-between px-5 md:px-7 py-3.5 border-b border-gray-100/80 dark:border-[#27272a] bg-white/60 dark:bg-[#1a1b22]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden md:flex w-8 h-8 rounded-xl items-center justify-center text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#23252c] transition-colors cursor-pointer"
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
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#16171b] ring-1 ring-emerald-500/20" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">Otbee AI</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-900 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                  Tutor SNBP & UTBK
                </span>
              </div>
              <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>Rasionalisasi Nilai & Pembimbing Esai</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-600" />
                <span className="text-emerald-600 dark:text-emerald-400 font-black">Aktif Siaga</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startNew}
              className="px-3 py-1.5 rounded-xl bg-gray-100/80 dark:bg-[#23252c] hover:bg-gray-200/80 dark:hover:bg-[#2e313c] text-gray-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Reset Sesi</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 space-y-6 relative">
          {/* Transient Shrinking Head (Animates when first message is sent from Attempt 1 into Attempt 2) */}
          {isShrinkingHead && (
            <div
              className="absolute pointer-events-none z-50 select-none"
              style={{
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: 'otbee-shrink-to-avatar 0.48s cubic-bezier(0.2, 0.9, 0.3, 1) forwards',
                transformOrigin: 'top left',
              }}
            >
              <OtbeeAvatar headOnly size={150} view="front" action="cheer" />
            </div>
          )}

          {messages.length === 0 && !streamingText ? (
            /* Welcome / Zero State (Attempt 1 Layout) */
            <div className="max-w-3xl mx-auto py-2 sm:py-4 space-y-6">
              {/* Hero mascot & greetings */}
              <div className="text-center space-y-4">
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                  Your <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 bg-clip-text text-transparent">Smart Assistant</span> for<br />
                  Any Tasks
                </h1>

                {/* Big Interactive Head (Attempt 1) */}
                <div className="relative flex flex-col items-center justify-center py-4 my-2">
                  {/* Speech Bubble "Hello!" */}
                  <div className="absolute top-2 left-1/2 -translate-x-28 sm:-translate-x-32 z-20 bg-white dark:bg-zinc-800 px-3.5 py-1 rounded-2xl shadow-md border border-gray-100 dark:border-zinc-700 text-xs font-black text-gray-800 dark:text-zinc-100 animate-bounce">
                    Hello!
                    <span className="absolute -bottom-1 left-4 w-2.5 h-2.5 bg-white dark:bg-zinc-800 border-r border-b border-gray-100 dark:border-zinc-700 rotate-45" />
                  </div>

                  {/* Soft Glowing Ambient Background */}
                  <div className="absolute w-52 h-52 rounded-full bg-gradient-to-tr from-amber-300/35 via-amber-400/25 to-pink-300/20 blur-2xl -z-10" />

                  {/* Interactive Head with Love Click */}
                  <div
                    onClick={handleHeadLoveReaction}
                    className="cursor-pointer transition-transform hover:scale-105 active:scale-95 relative"
                    title="Klik kepala Otbee!"
                  >
                    <OtbeeAvatar
                      ref={heroAvatarRef}
                      headOnly
                      size={150}
                      followPointer
                      view="front"
                    />
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mt-3">
                    Get instant help and support with any task or problem
                  </p>
                </div>
              </div>

              {/* Quick Prompt Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                {PROMPT_CATEGORIES.map((cat, idx) => {
                  const Icon = cat.icon
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl p-4 bg-white/70 dark:bg-[#1e2028] backdrop-blur-md border border-white/90 dark:border-[#2e313d] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-xs flex-shrink-0`}
                        >
                          <Icon size={14} className="stroke-[2.5]" />
                        </div>
                        <h3 className="text-xs font-black text-gray-900 dark:text-white truncate">{cat.category}</h3>
                      </div>

                      <div className="space-y-2">
                        {cat.prompts.map((p, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleSend(p)}
                            className="w-full text-left p-2.5 rounded-xl bg-gray-50/80 dark:bg-[#252834] hover:bg-amber-50 dark:hover:bg-amber-950/40 text-gray-800 dark:text-slate-200 text-[11px] font-bold leading-snug border border-gray-200/50 dark:border-[#353846] hover:border-amber-300 dark:hover:border-amber-600/50 transition-all flex items-start justify-between gap-1 group cursor-pointer"
                          >
                            <span>{p}</span>
                            <ArrowRight
                              size={12}
                              className="text-gray-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex-shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5"
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
                    <div className="flex-shrink-0 -mt-1 select-none">
                      <OtbeeAvatar headOnly size={36} paused={!sending} action={sending ? 'talk' : 'idle'} />
                    </div>
                  )}

                  <div className={`group relative max-w-[85%] sm:max-w-[78%]`}>
                    <div
                      className={`text-xs sm:text-sm leading-relaxed px-5 py-4 whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 text-gray-950 font-bold rounded-3xl rounded-tr-xs shadow-md shadow-amber-400/10'
                          : 'backdrop-blur-xl bg-white/95 dark:bg-[#1e2028] border border-white/90 dark:border-[#2e313d] text-gray-900 dark:text-slate-100 rounded-3xl rounded-tl-xs shadow-sm font-medium'
                      }`}
                    >
                      {m.content}
                    </div>

                    {/* Copy action on assistant responses */}
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => copyToClipboard(m.content, i)}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-gray-100 dark:bg-[#252834] hover:bg-gray-200 dark:hover:bg-[#2e313d] text-gray-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="Salin jawaban"
                      >
                        {copiedIdx === i ? <Check size={12} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>

                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-2xl bg-gray-900 dark:bg-amber-400 text-white dark:text-amber-950 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs font-black">
                      <User size={15} />
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming Assistant Response */}
              {streamingText && (
                <div className="flex gap-3 items-start justify-start">
                  <div className="flex-shrink-0 -mt-1 select-none">
                    <OtbeeAvatar headOnly size={36} action="talk" />
                  </div>
                  <div className="max-w-[85%] sm:max-w-[78%] backdrop-blur-xl bg-white/95 dark:bg-[#1e2028] border border-white/90 dark:border-[#2e313d] text-gray-900 dark:text-slate-100 rounded-3xl rounded-tl-xs shadow-sm p-5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {streamingText}
                    <span className="inline-block w-1.5 h-4 bg-amber-500 ml-1 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Loading Thinking Indicator */}
              {sending && !streamingText && (
                <div className="flex gap-3 items-start justify-start">
                  <div className="flex-shrink-0 -mt-1 select-none">
                    <OtbeeAvatar headOnly size={36} action="thinking" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white/90 dark:bg-[#1e2028] border border-white/90 dark:border-[#2e313d] shadow-sm text-gray-600 dark:text-slate-300 text-xs font-bold flex items-center gap-2">
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
        <div className="px-4 sm:px-6 md:px-8 pb-4 pt-2 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-[#16171b] dark:via-[#16171b]/90 dark:to-transparent">
          <div className="max-w-3xl mx-auto">
            {quotaError ? (
              <div className="flex items-center justify-between gap-3 p-4 rounded-3xl bg-amber-400/15 border border-amber-400/40 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-gray-950 flex items-center justify-center">
                    <Lock size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-950 dark:text-white">Kuota Harian Otbee AI Habis</h4>
                    <p className="text-[11px] text-gray-700 dark:text-slate-300 font-semibold">
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
              <div className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#1e2028] border border-gray-200/80 dark:border-[#2e313d] shadow-[0_12px_40px_rgba(0,0,0,0.08)] p-2 transition-all focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20">
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
                    className="flex-1 bg-transparent text-xs sm:text-sm font-semibold outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 resize-none max-h-28 py-1.5 leading-relaxed"
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

            <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-gray-400 dark:text-slate-500 font-bold">
              <span>Otbee ditenagai kecerdasan buatan & bank data rasionalisasi PTN 2026/2027</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
