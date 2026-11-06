'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Megaphone, Bell, Mail, MessageSquare, AlertCircle, CheckCircle2,
  Send, Sparkles, Copy, Check, Info, Loader2, RefreshCw, XCircle, FlaskConical,
} from 'lucide-react'

type Channel = 'in_app' | 'email' | 'banner' | 'whatsapp'
type Audience =
  | 'all' | 'paid' | 'premium' | 'nectar' | 'honeycomb' | 'queen_bee' | 'mentors' | 'ambassador'

interface AudienceCount {
  total: number
  withEmail: number
  withPhone: number
}

interface HistoryRow {
  id: string
  title: string
  message: string
  cta_url: string | null
  channel: Channel
  audience: Audience | 'self'
  recipient_count: number
  sent_count: number
  failed_count: number
  status: 'sending' | 'sent' | 'partial' | 'failed'
  is_test: boolean
  banner_active: boolean
  error_note: string | null
  created_at: string
}

interface BroadcastData {
  counts: Record<Audience, AudienceCount>
  history: HistoryRow[]
  capabilities: { email: boolean; whatsapp: 'not_configured' | 'disconnected' | 'connected' }
  limits: { email: number; whatsapp: number }
}

const AUDIENCE_OPTIONS: { value: Audience; label: string }[] = [
  { value: 'all', label: 'Semua siswa terdaftar' },
  { value: 'paid', label: 'Siswa paket berbayar (Premium, Nectar, Honeycomb, Queen Bee)' },
  { value: 'premium', label: 'Akun Premium' },
  { value: 'nectar', label: 'Paket Nectar' },
  { value: 'honeycomb', label: 'Paket Honeycomb' },
  { value: 'queen_bee', label: 'Paket Queen Bee' },
  { value: 'mentors', label: 'Mentor alumni' },
  { value: 'ambassador', label: 'Student Ambassador' },
]

const AUDIENCE_LABEL: Record<string, string> = {
  ...Object.fromEntries(AUDIENCE_OPTIONS.map(o => [o.value, o.label])),
  all: 'Semua siswa',
  paid: 'Siswa paket berbayar',
  self: 'Akun admin (tes)',
}

const CHANNEL_LABEL: Record<Channel, string> = {
  in_app: 'Lonceng in-app',
  email: 'Email',
  banner: 'Banner beranda',
  whatsapp: 'WhatsApp',
}

const STATUS_STYLE: Record<HistoryRow['status'], { label: string; cls: string }> = {
  sending: { label: 'Mengirim', cls: 'bg-blue-100 text-blue-800' },
  sent: { label: 'Terkirim', cls: 'bg-emerald-100 text-emerald-800' },
  partial: { label: 'Sebagian gagal', cls: 'bg-amber-100 text-amber-900' },
  failed: { label: 'Gagal', cls: 'bg-rose-100 text-rose-800' },
}

const PRESET_TEMPLATES = [
  {
    title: 'Cek peluangmu di Kalkulator Peluang',
    channel: 'in_app' as const,
    target: 'all' as Audience,
    message: 'Halo Pejuang PTN! Sebelum finalisasi pilihan prodi, cek dulu rasio peluangmu di Kalkulator Peluang OtwPTN berdasarkan nilai rapor dan mapel pendukung.',
    cta_url: '/dashboard/kalkulator',
  },
  {
    title: 'Jadwal mentoring privat sudah dibuka',
    channel: 'in_app' as const,
    target: 'queen_bee' as Audience,
    message: 'Khusus siswa Queen Bee: jadwal mentoring privat minggu ini sudah dirilis oleh kakak mentor alumni. Booking sesi bimbinganmu sebelum slot penuh.',
    cta_url: '/dashboard/mentor',
  },
  {
    title: 'Fitur baru di OtwPTN',
    channel: 'email' as const,
    target: 'paid' as Audience,
    message: 'Halo! Ada pembaruan fitur di OtwPTN yang bisa langsung kamu pakai. Buka dashboard untuk melihat detailnya.',
    cta_url: '/dashboard',
  },
  {
    title: 'Komisi Student Ambassador sudah diproses',
    channel: 'whatsapp' as const,
    target: 'ambassador' as Audience,
    message: 'Halo Sobat Ambassador OtwPTN! Penarikan komisi kamu sudah diverifikasi dan diproses transfer. Cek riwayatnya di dashboard Ambassador.',
    cta_url: '/dashboard/ambassador',
  },
]

function newKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `bc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  })
}

export default function AdminBroadcastPage() {
  const [channel, setChannel] = useState<Channel>('in_app')
  const [targetAudience, setTargetAudience] = useState<Audience>('all')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')
  const [testMode, setTestMode] = useState(false)

  const [data, setData] = useState<BroadcastData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [confirming, setConfirming] = useState(false)
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [trackedId, setTrackedId] = useState<string | null>(null)
  const [copiedWA, setCopiedWA] = useState(false)
  const [busyBanner, setBusyBanner] = useState<string | null>(null)

  // One key per distinct draft: retrying the same draft (double click, flaky network) can never send twice.
  const keyRef = useRef<string>(newKey())
  useEffect(() => {
    keyRef.current = newKey()
    setConfirming(false)
  }, [channel, targetAudience, title, message, ctaUrl, testMode])

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch('/api/admin/broadcast', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Gagal memuat data')
      setData(json as BroadcastData)
      setLoadError(null)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const hasSending = !!data?.history.some(h => h.status === 'sending')
  useEffect(() => {
    if (!hasSending) return
    const timer = setInterval(() => void load(true), 3000)
    return () => clearInterval(timer)
  }, [hasSending, load])

  const count = data?.counts[targetAudience]
  const reach: number | null = testMode
    ? 1
    : !count
    ? null
    : channel === 'email'
    ? count.withEmail
    : channel === 'whatsapp'
    ? count.withPhone
    : count.total

  const skipped = !testMode && count && reach !== null ? count.total - reach : 0

  const blockReason = ((): string | null => {
    if (!data) return 'Data penerima belum dimuat'
    if (channel === 'email' && !data.capabilities.email) {
      return 'Email belum dikonfigurasi di server (RESEND_API_KEY atau GMAIL_USER dan GMAIL_APP_PASSWORD kosong).'
    }
    if (channel === 'whatsapp') {
      if (data.capabilities.whatsapp === 'not_configured') {
        return 'WhatsApp belum terhubung (WA_SERVICE_URL atau WA_SERVICE_TOKEN belum diset).'
      }
      if (data.capabilities.whatsapp === 'disconnected') {
        return 'WhatsApp belum terhubung. Scan QR dulu di menu WhatsApp Admin.'
      }
    }
    if (testMode && channel === 'banner') return 'Banner tidak bisa dikirim sebagai tes.'
    if (!reach) return 'Tidak ada penerima yang bisa dijangkau lewat channel ini.'
    if (!testMode && channel === 'email' && reach > data.limits.email) {
      return `Email maksimal ${data.limits.email} penerima sekali kirim. Pilih segmen yang lebih kecil.`
    }
    if (!testMode && channel === 'whatsapp' && reach > data.limits.whatsapp) {
      return `WhatsApp maksimal ${data.limits.whatsapp} penerima sekali kirim supaya nomor aman. Pilih segmen yang lebih kecil.`
    }
    return null
  })()

  const canSubmit = !sending && title.trim().length >= 3 && message.trim().length >= 3 && !blockReason

  const handleApplyTemplate = (tmpl: (typeof PRESET_TEMPLATES)[number]) => {
    setTitle(tmpl.title)
    setMessage(tmpl.message)
    setChannel(tmpl.channel)
    setTargetAudience(tmpl.target)
    setCtaUrl(tmpl.cta_url)
    setTestMode(false)
  }

  const submit = async () => {
    if (!canSubmit || reach === null) return
    setSending(true)
    setFormError(null)
    setConfirming(false)
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          audience: targetAudience,
          title: title.trim(),
          message: message.trim(),
          ctaUrl: ctaUrl.trim(),
          expectedRecipients: reach,
          idempotencyKey: keyRef.current,
          test: testMode,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setFormError(json.error ?? 'Gagal mengirim broadcast')
        if (json.code === 'RECIPIENT_MISMATCH') await load(true)
        return
      }
      setTrackedId(json.broadcast?.id ?? null)
      await load(true)
      setTitle('')
      setMessage('')
      setCtaUrl('')
    } catch {
      setFormError('Koneksi gagal. Periksa riwayat di bawah sebelum mengirim ulang.')
    } finally {
      setSending(false)
    }
  }

  const handleSendClick = () => {
    if (!canSubmit) return
    if (testMode) void submit()
    else setConfirming(true)
  }

  const deactivateBanner = async (id: string) => {
    setBusyBanner(id)
    try {
      const res = await fetch(`/api/admin/broadcast?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      await load(true)
    } catch {
      setLoadError('Gagal menonaktifkan banner')
    } finally {
      setBusyBanner(null)
    }
  }

  const handleCopyWA = () => {
    const link = ctaUrl.trim()
      ? ctaUrl.trim().startsWith('http')
        ? ctaUrl.trim()
        : `https://otwptn.com${ctaUrl.trim()}`
      : ''
    const formatted = `*${title}*\n\n${message}${link ? `\n\n${link}` : ''}`
    void navigator.clipboard.writeText(formatted)
    setCopiedWA(true)
    setTimeout(() => setCopiedWA(false), 2000)
  }

  const tracked = data?.history.find(h => h.id === trackedId) ?? null
  const history = data?.history ?? []

  const channelButtons: { id: Channel; label: string; hint: string; Icon: typeof Bell }[] = [
    { id: 'in_app', label: 'Lonceng In-App', hint: 'Notif di dashboard', Icon: Bell },
    { id: 'email', label: 'Email', hint: 'Inbox siswa', Icon: Mail },
    { id: 'banner', label: 'Banner Beranda', hint: 'Pengumuman aktif', Icon: Megaphone },
    { id: 'whatsapp', label: 'WhatsApp', hint: 'Lewat nomor admin', Icon: MessageSquare },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center p-2.5 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascot-hd/megaphone-community.png"
              alt="Megaphone"
              className="w-full h-full object-contain"
              onError={e => {
                ;(e.currentTarget as HTMLImageElement).src = '/logo.png'
              }}
            />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold">Multi-Channel Broadcast</span>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">Broadcast & Notifikasi Masal</h1>
            <p className="text-xs text-gray-500 font-medium max-w-2xl mt-1">
              Kirim pengumuman ke lonceng dashboard, email, banner beranda, dan WhatsApp. Jumlah penerima dihitung langsung dari database.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3 flex-shrink-0">
          <div className="min-w-10 h-10 px-2 rounded-xl bg-amber-400 text-amber-950 font-black flex items-center justify-center text-sm">
            {loading ? <Loader2 size={16} className="animate-spin" /> : reach !== null ? reach.toLocaleString('id-ID') : '-'}
          </div>
          <div>
            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Jangkauan segmen ini</div>
            <div className="text-xs font-black text-gray-900">{CHANNEL_LABEL[channel]}</div>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" /> {loadError}
          </span>
          <button
            type="button"
            onClick={() => void load()}
            className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-800 font-black text-[11px] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={12} /> Coba lagi
          </button>
        </div>
      )}

      {/* Templates */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-amber-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">Template cepat</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_TEMPLATES.map(tmpl => (
            <button
              type="button"
              key={tmpl.title}
              onClick={() => handleApplyTemplate(tmpl)}
              className="text-left p-3.5 rounded-2xl bg-gray-50 hover:bg-amber-50/80 border border-gray-200/60 hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <h4 className="text-xs font-black text-gray-900 group-hover:text-amber-950 leading-snug line-clamp-2">{tmpl.title}</h4>
                <p className="text-[11px] text-gray-500 font-medium line-clamp-2 mt-1">{tmpl.message}</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-gray-400 group-hover:text-amber-800">
                <span>{CHANNEL_LABEL[tmpl.channel]}</span>
                <span className="font-black">Pakai template</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Composer */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xs space-y-5">
          <h2 className="text-base font-black text-gray-950">Formulir pesan broadcast</h2>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Saluran pengiriman</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {channelButtons.map(({ id, label, hint, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setChannel(id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                    channel === id
                      ? 'border-amber-400 bg-amber-50/80 text-amber-950 shadow-xs'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon size={16} className={channel === id ? 'text-amber-600' : 'text-gray-400'} />
                  <span className="text-xs font-black leading-tight">{label}</span>
                  <span className="text-[9px] text-gray-500 font-medium">{hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="bc-audience" className="text-xs font-bold text-gray-700 block mb-1.5">
              Segmentasi penerima
            </label>
            <select
              id="bc-audience"
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value as Audience)}
              disabled={testMode}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 focus:bg-white focus:border-amber-400 outline-none cursor-pointer disabled:opacity-50"
            >
              {AUDIENCE_OPTIONS.map(opt => {
                const c = data?.counts[opt.value]
                const n = !c ? null : channel === 'email' ? c.withEmail : channel === 'whatsapp' ? c.withPhone : c.total
                return (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}{n !== null ? ` (${n.toLocaleString('id-ID')} penerima)` : ''}
                  </option>
                )
              })}
            </select>
            {skipped > 0 && (
              <p className="text-[11px] text-amber-800 font-semibold mt-1.5">
                {skipped.toLocaleString('id-ID')} dari {count?.total.toLocaleString('id-ID')} orang di segmen ini dilewati karena tidak punya {channel === 'email' ? 'email' : 'nomor WhatsApp valid'}.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="bc-title" className="text-xs font-bold text-gray-700 block mb-1">
              Judul pengumuman / subject <span className="text-rose-500">*</span>
            </label>
            <input
              id="bc-title"
              type="text"
              value={title}
              maxLength={120}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Webinar bedah jurusan dibuka minggu ini"
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label htmlFor="bc-message" className="text-xs font-bold text-gray-700 block mb-1">
              Isi pesan <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="bc-message"
              value={message}
              maxLength={2000}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tulis isi pengumuman yang jelas dan singkat..."
              rows={6}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none resize-none leading-relaxed"
            />
            <p className="text-[10px] text-gray-400 font-semibold mt-1 text-right">{message.length}/2000</p>
          </div>

          <div>
            <label htmlFor="bc-cta" className="text-xs font-bold text-gray-700 block mb-1">
              Tautan tujuan (opsional)
            </label>
            <input
              id="bc-cta"
              type="text"
              value={ctaUrl}
              onChange={e => setCtaUrl(e.target.value)}
              placeholder="/dashboard/mentor atau https://zoom.us/..."
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
            />
          </div>

          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={testMode}
              onChange={e => setTestMode(e.target.checked)}
              className="mt-0.5 accent-amber-500"
            />
            <span>
              <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <FlaskConical size={13} className="text-amber-600" /> Kirim tes ke saya saja
              </span>
              <span className="text-[11px] text-gray-500 font-medium block mt-0.5">
                Pesan hanya dikirim ke akun adminmu sendiri lewat channel yang dipilih. Tidak mengenai siswa.
              </span>
            </span>
          </label>

          {blockReason && data && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-start gap-2">
              <AlertCircle size={15} className="text-amber-700 flex-shrink-0 mt-0.5" />
              <span>{blockReason}</span>
            </div>
          )}

          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
              <XCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {tracked && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-start gap-2 ${
                tracked.status === 'sending'
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : tracked.status === 'sent'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : tracked.status === 'partial'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {tracked.status === 'sending' ? (
                <Loader2 size={16} className="animate-spin flex-shrink-0 mt-0.5" />
              ) : tracked.status === 'sent' ? (
                <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              )}
              <span>
                {tracked.is_test ? 'Tes ke akunmu: ' : ''}
                {tracked.channel === 'banner'
                  ? tracked.banner_active
                    ? `Banner aktif untuk ${tracked.recipient_count.toLocaleString('id-ID')} penerima.`
                    : 'Banner sudah dinonaktifkan.'
                  : tracked.status === 'sending'
                  ? `Mengirim... ${(tracked.sent_count + tracked.failed_count).toLocaleString('id-ID')} dari ${tracked.recipient_count.toLocaleString('id-ID')} diproses (terkirim ${tracked.sent_count.toLocaleString('id-ID')}, gagal ${tracked.failed_count.toLocaleString('id-ID')}).`
                  : `Terkirim ${tracked.sent_count.toLocaleString('id-ID')}, gagal ${tracked.failed_count.toLocaleString('id-ID')} dari ${tracked.recipient_count.toLocaleString('id-ID')} penerima via ${CHANNEL_LABEL[tracked.channel]}.`}
                {tracked.error_note ? ` ${tracked.error_note}.` : ''}
              </span>
            </div>
          )}

          {confirming && reach !== null && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3">
              <p className="text-xs font-black text-amber-950">
                Kirim ke {reach.toLocaleString('id-ID')} penerima ({AUDIENCE_LABEL[targetAudience]}) lewat {CHANNEL_LABEL[channel]}?
              </p>
              <p className="text-[11px] text-amber-900 font-medium">
                Pesan masal tidak bisa ditarik setelah terkirim.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={sending}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs cursor-pointer disabled:opacity-50"
                >
                  Ya, kirim sekarang
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-black text-xs cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            {channel === 'whatsapp' && (
              <button
                type="button"
                onClick={handleCopyWA}
                disabled={!title || !message}
                className="py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-800 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedWA ? <Check size={15} /> : <Copy size={15} />}
                <span>{copiedWA ? 'Tersalin' : 'Salin teks'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleSendClick}
              disabled={!canSubmit}
              className="flex-1 py-3 px-5 rounded-2xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-amber-950 font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              <span>
                {sending
                  ? 'Mengirim...'
                  : testMode
                  ? 'Kirim tes ke saya'
                  : channel === 'banner'
                  ? `Aktifkan banner untuk ${reach !== null ? reach.toLocaleString('id-ID') : '-'} penerima`
                  : `Kirim ke ${reach !== null ? reach.toLocaleString('id-ID') : '-'} penerima`}
              </span>
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-7 border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <Info size={15} className="text-amber-500" />
              Pratinjau tampilan
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase">{CHANNEL_LABEL[channel]}</span>
          </div>

          {channel === 'in_app' && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/70 space-y-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Di popover lonceng notifikasi siswa:</div>
              <div className="bg-white rounded-2xl p-3.5 border border-amber-200/80 shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                  <Bell size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-gray-900 leading-snug">{title || 'Judul notifikasi'}</h4>
                  <p className="text-[11px] text-gray-600 font-medium leading-relaxed mt-1">
                    {message || 'Isi pesan pemberitahuan dari tim OtwPTN...'}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 font-semibold">Baru saja</span>
                    {ctaUrl && <span className="text-amber-700 font-black">Buka halaman</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {channel === 'banner' && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/70 space-y-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Banner pengumuman aktif:</div>
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl p-4 text-amber-950 shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Megaphone size={16} />
                  <span className="text-xs font-black">{title || 'Pengumuman resmi OtwPTN'}</span>
                </div>
                <p className="text-xs font-semibold leading-relaxed">{message || 'Isi pesan banner pengumuman...'}</p>
                {ctaUrl && (
                  <div className="mt-2 text-right">
                    <span className="inline-block px-3 py-1 bg-amber-950 text-white rounded-full text-[10px] font-black">Lihat selengkapnya</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {channel === 'email' && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/70 space-y-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tampilan di email penerima:</div>
              <div className="bg-white rounded-2xl p-5 border border-gray-200 text-xs text-gray-800 space-y-3 shadow-xs">
                <div className="font-extrabold text-amber-900 border-b border-gray-100 pb-2">otwptn</div>
                <div className="font-black text-sm text-gray-950">{title || 'Subject email'}</div>
                <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {message || 'Halo,\n\nBerikut pengumuman penting dari OtwPTN...'}
                </div>
                {ctaUrl && (
                  <div className="pt-2">
                    <span className="inline-block bg-amber-400 text-amber-950 font-black px-4 py-2 rounded-xl text-xs">Buka tautan</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {channel === 'whatsapp' && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/70 space-y-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Format pesan WhatsApp:</div>
              <div className="bg-[#e6f4ea] rounded-2xl p-4 border border-emerald-200 text-[11px] text-gray-800 whitespace-pre-wrap leading-relaxed shadow-xs">
                <p className="font-bold text-gray-950">*{title || 'Judul broadcast'}*</p>
                <p className="mt-2 text-gray-700">{message || 'Isi pesan teks...'}</p>
                {ctaUrl && (
                  <p className="mt-3 text-emerald-800 font-bold">
                    {ctaUrl.startsWith('http') ? ctaUrl : `https://otwptn.com${ctaUrl}`}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/50 text-[11px] text-amber-900 font-medium flex items-start gap-2">
            <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
            <span>
              {channel === 'in_app'
                ? 'Notifikasi disimpan per penerima di database. Badge lonceng diperbarui otomatis sekitar tiap 1 menit, atau langsung saat lonceng dibuka.'
                : channel === 'banner'
                ? 'Hanya satu banner yang aktif. Mengaktifkan banner baru menggantikan yang lama, dan banner bisa dimatikan dari riwayat.'
                : channel === 'email'
                ? 'Email dikirim satu per satu ke tiap penerima dengan jeda supaya tidak kena batas pengirim.'
                : 'Pesan dikirim lewat nomor WhatsApp yang terhubung, dengan jeda antar penerima supaya nomor aman.'}
            </span>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-gray-950">Riwayat pengiriman broadcast</h2>
            <p className="text-xs text-gray-500 font-medium">Dicatat dari database, termasuk jumlah yang benar-benar terkirim dan gagal.</p>
          </div>
          <button
            type="button"
            onClick={() => void load(true)}
            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-[11px] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={12} /> Muat ulang
          </button>
        </div>

        {loading && !data ? (
          <div className="py-10 flex items-center justify-center gap-2 text-xs font-bold text-gray-400">
            <Loader2 size={16} className="animate-spin" /> Memuat riwayat...
          </div>
        ) : history.length === 0 ? (
          <div className="py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
              <Megaphone size={20} />
            </div>
            <p className="text-xs font-black text-gray-800">Belum ada broadcast terkirim</p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">Riwayat akan muncul di sini setelah kamu mengirim pesan pertama.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-[11px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <th className="py-3 px-4 rounded-l-xl">Judul</th>
                  <th className="py-3 px-4">Saluran</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Hasil</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map(item => {
                  const st = STATUS_STYLE[item.status]
                  return (
                    <tr key={item.id} className="hover:bg-amber-50/30 transition-colors align-top">
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        <div className="line-clamp-1 max-w-xs">
                          {item.title}
                          {item.is_test && (
                            <span className="ml-2 px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[9px] font-black uppercase">Tes</span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium line-clamp-1 mt-0.5 max-w-xs">{item.message}</div>
                        {item.error_note && (
                          <div className="text-[10px] text-amber-800 font-semibold mt-1 max-w-xs">{item.error_note}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-[10px] font-black">
                          {CHANNEL_LABEL[item.channel]}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-600">{AUDIENCE_LABEL[item.audience] ?? item.audience}</td>
                      <td className="py-3.5 px-4 font-black text-gray-900">
                        {item.channel === 'banner' ? (
                          <span>{item.recipient_count.toLocaleString('id-ID')} penerima</span>
                        ) : (
                          <span>
                            {item.sent_count.toLocaleString('id-ID')} / {item.recipient_count.toLocaleString('id-ID')}
                            {item.failed_count > 0 && (
                              <span className="block text-[10px] text-rose-600 font-bold">{item.failed_count.toLocaleString('id-ID')} gagal</span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 font-medium whitespace-nowrap">{formatDate(item.created_at)}</td>
                      <td className="py-3.5 px-4">
                        {item.channel === 'banner' ? (
                          item.banner_active ? (
                            <div className="flex flex-col items-start gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px]">
                                <Check size={11} /> Banner aktif
                              </span>
                              <button
                                type="button"
                                onClick={() => void deactivateBanner(item.id)}
                                disabled={busyBanner === item.id}
                                className="text-[10px] font-black text-rose-700 hover:underline cursor-pointer disabled:opacity-50"
                              >
                                {busyBanner === item.id ? 'Mematikan...' : 'Matikan banner'}
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-black text-[10px]">Nonaktif</span>
                          )
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[10px] ${st.cls}`}>
                            {item.status === 'sending' && <Loader2 size={10} className="animate-spin" />}
                            {st.label}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
