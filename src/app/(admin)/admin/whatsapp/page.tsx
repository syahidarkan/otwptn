'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageCircle,
  Send,
  RefreshCw,
  Wifi,
  WifiOff,
  LogOut,
  Loader2,
  Phone,
  CheckCircle2,
  AlertCircle,
  ServerCrash,
  Smartphone,
} from 'lucide-react'
import Image from 'next/image'

interface WAState {
  status: 'server_not_running' | 'disconnected' | 'connecting' | 'qr' | 'connected' | 'reconnecting'
  qr?: string
  phone?: string
  messageCount?: number
  message?: string
}

interface WAMessage {
  id: string
  from: string
  fromName?: string
  text: string
  timestamp: number
  isOutgoing?: boolean
}

export default function WhatsAppAdminPage() {
  const [state, setState] = useState<WAState>({ status: 'disconnected' })
  const [messages, setMessages] = useState<WAMessage[]>([])
  const [sendTo, setSendTo] = useState('')
  const [sendText, setSendText] = useState('')
  const [sending, setSending] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const msgEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchStatus()
    fetchMessages()
    connectSSE()
    return () => { eventSourceRef.current?.close() }
  }, [])

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

    es.addEventListener('state', (e) => {
      try { setState(JSON.parse(e.data)) } catch {}
    })
    es.addEventListener('message', (e) => {
      try {
        const msg = JSON.parse(e.data)
        setMessages(prev => [...prev.slice(-199), msg])
      } catch {}
    })
    es.onerror = () => { es.close() }
  }

  async function doAction(action: string) {
    setActionLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/wa-admin/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!data.ok) setError(data.error || 'Gagal')
      else {
        await fetchStatus()
        connectSSE()
      }
    } catch (e) {
      setError('Request gagal')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!sendTo.trim() || !sendText.trim()) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/wa-admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: sendTo.trim(), text: sendText.trim() }),
      })
      const data = await res.json()
      if (!data.ok) setError(data.error || 'Gagal kirim')
      else setSendText('')
    } catch {
      setError('Request gagal')
    } finally {
      setSending(false)
    }
  }

  const statusConfig = {
    server_not_running: { label: 'Server tidak aktif', color: 'text-red-600', bg: 'bg-red-50', icon: ServerCrash },
    disconnected: { label: 'Belum terhubung', color: 'text-gray-500', bg: 'bg-gray-50', icon: WifiOff },
    connecting: { label: 'Menghubungkan...', color: 'text-blue-600', bg: 'bg-blue-50', icon: Loader2 },
    reconnecting: { label: 'Menyambungkan ulang...', color: 'text-orange-600', bg: 'bg-orange-50', icon: Loader2 },
    qr: { label: 'Scan QR', color: 'text-purple-600', bg: 'bg-purple-50', icon: Smartphone },
    connected: { label: 'Terhubung', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
  }

  const st = statusConfig[state.status] || statusConfig.disconnected
  const StatusIcon = st.icon

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center">
          <MessageCircle size={20} className="text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">WhatsApp Admin</h1>
          <p className="text-xs text-gray-500">Kelola pesan WhatsApp OTWPTN dari satu dashboard</p>
        </div>
      </div>

      {/* Server not running notice */}
      {state.status === 'server_not_running' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800 space-y-1">
            <p className="font-bold">Custom server belum berjalan</p>
            <p className="text-xs text-red-700">
              WhatsApp Web (Baileys) butuh proses yang hidup terus-menerus — tidak kompatibel dengan Vercel serverless.
              Jalankan di Railway/VPS dengan:
            </p>
            <code className="block bg-red-100 rounded-lg px-3 py-2 text-xs font-mono mt-1">
              npm run start:wa
            </code>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: status + QR */}
        <div className="space-y-4">
          {/* Status card */}
          <div className={`rounded-2xl border p-4 ${st.bg}`}>
            <div className="flex items-center gap-2 mb-3">
              <StatusIcon size={16} className={`${st.color} ${state.status === 'connecting' || state.status === 'reconnecting' ? 'animate-spin' : ''}`} />
              <span className={`text-sm font-bold ${st.color}`}>{st.label}</span>
            </div>
            {state.phone && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-3">
                <Phone size={12} />
                <span>{state.phone}</span>
              </div>
            )}
            {state.messageCount !== undefined && (
              <p className="text-xs text-gray-500 mb-3">{state.messageCount} pesan tersimpan</p>
            )}

            <div className="flex gap-2 flex-wrap">
              {state.status === 'disconnected' && (
                <button
                  onClick={() => doAction('connect')}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-full bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                >
                  {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <Wifi size={12} />}
                  Hubungkan
                </button>
              )}
              {(state.status === 'connected' || state.status === 'qr' || state.status === 'connecting') && (
                <button
                  onClick={() => doAction('disconnect')}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-full bg-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-300 disabled:opacity-50 flex items-center gap-1"
                >
                  {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <WifiOff size={12} />}
                  Putuskan
                </button>
              )}
              {state.status === 'connected' && (
                <button
                  onClick={() => { if (confirm('Logout WA? Harus scan QR lagi.')) doAction('logout') }}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200 disabled:opacity-50 flex items-center gap-1"
                >
                  <LogOut size={12} /> Logout
                </button>
              )}
              <button
                onClick={() => { fetchStatus(); fetchMessages() }}
                className="px-3 py-1.5 rounded-full bg-white border text-gray-600 text-xs font-bold hover:bg-gray-50 flex items-center gap-1"
              >
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
          </div>

          {/* QR Code */}
          {state.status === 'qr' && state.qr && (
            <div className="rounded-2xl border border-purple-200 bg-white p-4 text-center space-y-2">
              <p className="text-xs font-bold text-purple-700">Scan dengan WhatsApp di HP kamu</p>
              <div className="relative w-48 h-48 mx-auto rounded-xl overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={state.qr} alt="QR Code WhatsApp" className="w-full h-full object-contain" />
              </div>
              <p className="text-[10px] text-gray-500">
                Buka WA → Perangkat Tertaut → Tautkan Perangkat
              </p>
            </div>
          )}
        </div>

        {/* Right: messages + send */}
        <div className="lg:col-span-2 space-y-4">
          {/* Messages list */}
          <div className="rounded-2xl border bg-white overflow-hidden flex flex-col" style={{ height: '380px' }}>
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">Pesan Masuk</span>
              <span className="text-xs text-gray-400">{messages.length} pesan</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs text-gray-400 text-center">
                    {state.status === 'connected' ? 'Belum ada pesan masuk' : 'Hubungkan WA untuk mulai menerima pesan'}
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isOutgoing ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${msg.isOutgoing ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-800'}`}>
                      {!msg.isOutgoing && (
                        <p className="text-[10px] font-bold text-gray-500 mb-0.5">{msg.fromName || msg.from}</p>
                      )}
                      <p>{msg.text}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={msgEndRef} />
            </div>
          </div>

          {/* Send form */}
          <form onSubmit={handleSend} className="rounded-2xl border bg-white p-4 space-y-3">
            <p className="text-xs font-bold text-gray-700">Kirim Pesan</p>
            <input
              type="text"
              placeholder="Nomor tujuan (628xxx)"
              value={sendTo}
              onChange={e => setSendTo(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Pesan..."
                value={sendText}
                onChange={e => setSendText(e.target.value)}
                className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <button
                type="submit"
                disabled={sending || state.status !== 'connected'}
                className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Kirim
              </button>
            </div>
          </form>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
