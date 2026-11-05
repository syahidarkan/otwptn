'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Send, RefreshCw, Loader2, Phone, CheckCircle2,
  AlertCircle, ServerCrash, Smartphone, LogOut,
  WifiOff, Wifi, Search, MessageCircle, ChevronDown,
} from 'lucide-react'

interface WAState {
  status: 'server_not_running' | 'disconnected' | 'connecting' | 'qr' | 'connected' | 'reconnecting'
  qr?: string
  phone?: string
  messageCount?: number
}

interface WAMessage {
  id: string
  from: string
  fromName?: string
  text: string
  timestamp: number
  isMe?: boolean
  isGroup?: boolean
  groupName?: string
}

type Conversation = {
  jid: string
  name: string
  messages: WAMessage[]
  unread: number
  lastMsg: WAMessage | null
}

function groupConversations(messages: WAMessage[]): Conversation[] {
  const map = new Map<string, Conversation>()
  for (const msg of messages) {
    const jid = msg.isGroup ? (msg.groupName || msg.from) : msg.from
    const name = msg.isGroup ? (msg.groupName || msg.from) : (msg.fromName || msg.from)
    if (!map.has(jid)) map.set(jid, { jid, name, messages: [], unread: 0, lastMsg: null })
    const conv = map.get(jid)!
    conv.messages.push(msg)
    conv.lastMsg = msg
    if (!msg.isMe) conv.unread++
  }
  return Array.from(map.values()).sort((a, b) =>
    (b.lastMsg?.timestamp ?? 0) - (a.lastMsg?.timestamp ?? 0)
  )
}

function timeLabel(ts: number) {
  const d = new Date(ts)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  return isToday
    ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

export default function WhatsAppAdminPage() {
  const [state, setState] = useState<WAState>({ status: 'disconnected' })
  const [messages, setMessages] = useState<WAMessage[]>([])
  const [activeJid, setActiveJid] = useState<string | null>(null)
  const [sendText, setSendText] = useState('')
  const [sending, setSending] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const msgEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    fetchStatus()
    fetchMessages()
    connectSSE()
    return () => eventSourceRef.current?.close()
  }, [])

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeJid, messages])

  const conversations = groupConversations(messages)
  const filteredConvs = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.jid.includes(search)
  )
  const activeConv = conversations.find(c => c.jid === activeJid)

  async function fetchStatus() {
    try {
      const res = await fetch('/api/wa-admin/status')
      const data = await res.json()
      setState(data)
    } catch {}
  }

  async function fetchMessages() {
    try {
      const res = await fetch('/api/wa-admin/messages')
      const data = await res.json()
      if (data.messages) setMessages(data.messages)
    } catch {}
  }

  function connectSSE() {
    eventSourceRef.current?.close()
    const es = new EventSource('/api/wa-admin/events')
    eventSourceRef.current = es
    es.addEventListener('state', e => { try { setState(JSON.parse(e.data)) } catch {} })
    es.addEventListener('message', e => {
      try {
        const msg: WAMessage = JSON.parse(e.data)
        setMessages(prev => [msg, ...prev.slice(0, 199)])
      } catch {}
    })
    es.onerror = () => es.close()
  }

  async function doAction(action: string) {
    setActionLoading(true); setError(null)
    try {
      const res = await fetch('/api/wa-admin/status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!data.ok) setError(data.error || 'Gagal')
      else { await fetchStatus(); connectSSE() }
    } catch { setError('Request gagal') }
    finally { setActionLoading(false) }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!activeJid || !sendText.trim()) return
    setSending(true); setError(null)
    try {
      const res = await fetch('/api/wa-admin/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: activeJid, text: sendText.trim() }),
      })
      const data = await res.json()
      if (!data.ok) setError(data.error || 'Gagal kirim')
      else {
        // Optimistic update
        const outMsg: WAMessage = {
          id: Date.now().toString(), from: state.phone || 'me',
          text: sendText.trim(), timestamp: Date.now(), isMe: true,
        }
        setMessages(prev => [outMsg, ...prev])
        setSendText('')
      }
    } catch { setError('Request gagal') }
    finally { setSending(false) }
  }

  const isConnected = state.status === 'connected'
  const isQR = state.status === 'qr'
  const isNotRunning = state.status === 'server_not_running'
  const isLoading = state.status === 'connecting' || state.status === 'reconnecting'

  // ── QR / Not Connected overlay ────────────────────────────────────────────
  if (isNotRunning) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-3 max-w-sm">
          <ServerCrash size={40} className="text-red-400 mx-auto" />
          <p className="font-bold text-gray-800">WA Service belum aktif</p>
          <p className="text-sm text-gray-500">Set <code className="bg-gray-100 px-1 rounded">WA_SERVICE_URL</code> di Vercel env.</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f0f2f5]">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <MessageCircle size={30} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">WhatsApp Admin</h2>
            <p className="text-sm text-gray-500 mt-1">Hubungkan WhatsApp untuk mulai</p>
          </div>

          {isQR && state.qr ? (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-green-200 overflow-hidden p-2 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={state.qr} alt="QR Code" className="w-52 h-52 object-contain" />
              </div>
              <p className="text-xs text-gray-500">
                Buka WhatsApp di HP → <strong>Perangkat Tertaut</strong> → <strong>Tautkan Perangkat</strong>
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center gap-2 text-blue-600 py-4">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm font-medium">Menghubungkan...</span>
            </div>
          ) : (
            <div className="text-gray-400 py-4">
              <WifiOff size={32} className="mx-auto mb-2" />
              <p className="text-sm">Belum terhubung ke WhatsApp</p>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            {!isLoading && !isQR && (
              <button
                onClick={() => doAction('connect')}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-full bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
                Hubungkan
              </button>
            )}
            <button
              onClick={() => { fetchStatus(); connectSSE() }}
              className="px-4 py-2.5 rounded-full border text-gray-600 text-sm font-bold hover:bg-gray-50 flex items-center gap-1"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    )
  }

  // ── WhatsApp Web layout ──────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0f2f5' }}>

      {/* Left sidebar — conversation list */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white border-r border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#f0f2f5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <Phone size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">{state.phone}</p>
              <p className="text-[10px] text-green-600 font-semibold">● Online</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { if (confirm('Logout WA? Harus scan QR lagi.')) doAction('logout') }}
              title="Logout"
              className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-600"
            >
              <LogOut size={15} />
            </button>
            <button
              onClick={() => { fetchStatus(); fetchMessages(); connectSSE() }}
              title="Refresh"
              className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-600"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2 bg-[#f0f2f5] rounded-full px-3 py-1.5">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari atau mulai chat baru"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <MessageCircle size={28} />
              <p className="text-xs">{messages.length === 0 ? 'Belum ada pesan masuk' : 'Tidak ditemukan'}</p>
            </div>
          ) : (
            filteredConvs.map(conv => (
              <button
                key={conv.jid}
                onClick={() => setActiveJid(conv.jid)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left ${activeJid === conv.jid ? 'bg-gray-100' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-green-700">
                  {(conv.name[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-gray-900 truncate">{conv.name}</span>
                    {conv.lastMsg && (
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                        {timeLabel(conv.lastMsg.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {conv.lastMsg?.isMe && <span className="text-green-600">Kamu: </span>}
                    {conv.lastMsg?.text}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right — chat window */}
      <div className="flex-1 flex flex-col">
        {activeConv ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#f0f2f5] border-b border-gray-200">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-700">
                {(activeConv.name[0] || '?').toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{activeConv.name}</p>
                <p className="text-[11px] text-gray-500">{activeConv.jid}</p>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
              style={{ background: '#efeae2', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23e5ddd5' opacity='0.3'/%3E%3C/svg%3E\")" }}
            >
              {[...activeConv.messages].reverse().map(msg => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[65%] rounded-2xl px-3 py-2 shadow-xs text-sm ${msg.isMe ? 'bg-[#d9fdd3] text-gray-800 rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm'}`}>
                    {!msg.isMe && msg.fromName && (
                      <p className="text-[10px] font-bold text-green-600 mb-0.5">{msg.fromName}</p>
                    )}
                    <p className="leading-snug">{msg.text}</p>
                    <p className="text-[9px] text-gray-400 text-right mt-0.5">
                      {timeLabel(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={msgEndRef} />
            </div>

            {/* Send bar */}
            <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 bg-[#f0f2f5] border-t border-gray-200">
              <input
                type="text"
                placeholder="Ketik pesan"
                value={sendText}
                onChange={e => setSendText(e.target.value)}
                className="flex-1 bg-white rounded-full px-4 py-2.5 text-sm focus:outline-none shadow-xs"
              />
              <button
                type="submit"
                disabled={sending || !sendText.trim()}
                className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 disabled:opacity-50 flex-shrink-0"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
            {error && <p className="px-4 pb-2 text-xs text-red-600">{error}</p>}
          </>
        ) : (
          /* No chat selected */
          <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ background: '#f0f2f5' }}>
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <MessageCircle size={36} className="text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-700">WhatsApp Admin</p>
              <p className="text-sm text-gray-400 mt-1">Pilih chat di kiri untuk mulai balas</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
              <CheckCircle2 size={13} />
              Terhubung sebagai {state.phone}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
