'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Megaphone, Bell, Mail, MessageSquare, AlertCircle, CheckCircle2,
  Send, Users, Sparkles, Clock, ExternalLink, Copy, Check, Info,
  Flame, ShieldCheck, ChevronRight
} from 'lucide-react'

interface BroadcastRecord {
  id: string
  title: string
  message: string
  channel: 'in_app' | 'email' | 'banner' | 'whatsapp'
  target_audience: string
  sent_at: string
  recipient_count: number
  status: 'sent' | 'scheduled' | 'draft'
}

const PRESET_TEMPLATES = [
  {
    title: '⏳ Pengingat Deadline SNBP 2025 Tinggal 3 Hari!',
    channel: 'in_app' as const,
    target: 'all',
    message: 'Halo Pejuang PTN! Jangan sampai kelewatan simpan permanen akun dan finalisasi pilihan prodi SNBP kamu. Segera cek rasio peluang di Kalkulator Peluang OtwPTN sekarang!',
    cta_url: '/dashboard/kalkulator',
  },
  {
    title: '🎓 Bimbingan 1-on-1 Bersama Mentor UI & UGM Dibuka',
    channel: 'in_app' as const,
    target: 'queen_bee',
    message: 'Khusus siswa Queen Bee VIP: Jadwal mentoring privat minggu ini telah dirilis oleh kakak mentor alumni. Silakan booking sesi bimbingan Zoom kamu sebelum slot penuh!',
    cta_url: '/dashboard/mentor',
  },
  {
    title: '🤖 Bonus 5.000 Kredit Otbee AI Tambahan!',
    channel: 'in_app' as const,
    target: 'paid',
    message: 'Kabar gembira! Kredit AI Otbee kamu sudah ditambah 5.000 kredit untuk generate soal dan review essay motivasimu sampai hari H.',
    cta_url: '/dashboard/otbee',
  },
  {
    title: '💰 Pencairan Komisi Student Ambassador Periode Ini',
    channel: 'whatsapp' as const,
    target: 'ambassador',
    message: 'Halo Sobat Ambassador OtwPTN! Penarikan komisi tunai kamu sudah kami verifikasi dan diproses transfer ke rekening/e-wallet terdaftar. Cek bukti transfer di dashboard.',
    cta_url: '/dashboard/ambassador',
  },
]

const INITIAL_HISTORY: BroadcastRecord[] = [
  {
    id: 'bc-1',
    title: 'Pembaruan Fitur Essay AI Review 2.0',
    message: 'Algoritma review essay kini dilengkapi dengan deteksi hook pembuka dan analisis skor 4 dimensi.',
    channel: 'in_app',
    target_audience: 'Semua Siswa',
    sent_at: '28 Okt 2026, 14:30 WIB',
    recipient_count: 1420,
    status: 'sent',
  },
  {
    id: 'bc-2',
    title: 'Rilis Video E-Course Bedah Rasio Keketatan SNBP',
    message: 'Modul baru telah diunggah di menu Modul & Video untuk persiapan lintas jurusan.',
    channel: 'banner',
    target_audience: 'Paket Berbayar',
    sent_at: '26 Okt 2026, 09:15 WIB',
    recipient_count: 680,
    status: 'sent',
  },
  {
    id: 'bc-3',
    title: 'SOP Mentoring & Kewajiban Hubungi Mentee 6 Jam',
    message: 'Peringatan resmi kepada seluruh mentor alumni untuk segera membuat WhatsApp Group 3 pihak.',
    channel: 'email',
    target_audience: 'Khusus Mentor Alumni',
    sent_at: '24 Okt 2026, 19:00 WIB',
    recipient_count: 24,
    status: 'sent',
  },
]

export default function AdminBroadcastPage() {
  const [channel, setChannel] = useState<'in_app' | 'email' | 'banner' | 'whatsapp'>('in_app')
  const [targetAudience, setTargetAudience] = useState('all')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')
  const [history, setHistory] = useState<BroadcastRecord[]>(INITIAL_HISTORY)
  const [sending, setSending] = useState(false)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)
  const [copiedWA, setCopiedWA] = useState(false)

  // Estimated reach numbers
  const audienceReach: Record<string, number> = {
    all: 1850,
    paid: 680,
    queen_bee: 140,
    honeycomb: 280,
    nectar: 260,
    mentors: 28,
    ambassador: 94,
  }

  const currentReach = audienceReach[targetAudience] || 1850

  const handleApplyTemplate = (tmpl: typeof PRESET_TEMPLATES[0]) => {
    setTitle(tmpl.title)
    setMessage(tmpl.message)
    setChannel(tmpl.channel)
    setTargetAudience(tmpl.target)
    setCtaUrl(tmpl.cta_url)
  }

  const handleSendBroadcast = async () => {
    if (!title || !message) return alert('Mohon isi judul dan pesan broadcast!')

    setSending(true)
    setSuccessNotice(null)

    // Simulate sending API call
    setTimeout(() => {
      const newRecord: BroadcastRecord = {
        id: `bc-${Date.now()}`,
        title,
        message,
        channel,
        target_audience:
          targetAudience === 'all'
            ? 'Semua Siswa'
            : targetAudience === 'queen_bee'
            ? 'Khusus Queen Bee VIP'
            : targetAudience === 'mentors'
            ? 'Khusus Mentor Alumni'
            : targetAudience === 'ambassador'
            ? 'Khusus Student Ambassador'
            : 'Paket Berbayar',
        sent_at: 'Baru saja',
        recipient_count: currentReach,
        status: 'sent',
      }

      setHistory(prev => [newRecord, ...prev])
      setSending(false)
      setSuccessNotice(
        `Broadcast berhasil dikirim ke ${currentReach.toLocaleString()} penerima via ${
          channel === 'in_app'
            ? 'Notifikasi Lonceng In-App'
            : channel === 'email'
            ? 'Email Blast'
            : channel === 'banner'
            ? 'Banner Dashboard'
            : 'WhatsApp Blast'
        }!`
      )

      // Reset form
      setTitle('')
      setMessage('')
      setCtaUrl('')
    }, 800)
  }

  const handleCopyWA = () => {
    const formatted = `*${title}*\n\n${message}\n\n👉 Buka tautan berikut: https://otwptn.com${ctaUrl || '/dashboard'}`
    navigator.clipboard.writeText(formatted)
    setCopiedWA(true)
    setTimeout(() => setCopiedWA(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner Card */}
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
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                Pusat Komunikasi & Notifikasi
              </span>
              <span className="text-xs text-gray-400 font-bold">•</span>
              <span className="text-xs text-gray-500 font-bold">Multi-Channel Broadcast</span>
            </div>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">
              Broadcast & Notifikasi Masal
            </h1>
            <p className="text-xs text-gray-500 font-medium max-w-2xl mt-1">
              Kirim pengumuman penting, notifikasi lonceng dashboard, email blast, dan template WhatsApp secara tersegmentasi kepada siswa dan mentor.
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 font-black flex items-center justify-center text-sm">
            {currentReach}
          </div>
          <div>
            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              Estimasi Jangkauan
            </div>
            <div className="text-xs font-black text-gray-900">Penerima Aktif</div>
          </div>
        </div>
      </div>

      {/* Preset Templates Row */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-amber-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">
            Template Cepat Broadcast:
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_TEMPLATES.map((tmpl, idx) => (
            <div
              key={idx}
              onClick={() => handleApplyTemplate(tmpl)}
              className="p-3.5 rounded-2xl bg-gray-50 hover:bg-amber-50/80 border border-gray-200/60 hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <h4 className="text-xs font-black text-gray-900 group-hover:text-amber-950 leading-snug line-clamp-2">
                  {tmpl.title}
                </h4>
                <p className="text-[11px] text-gray-500 font-medium line-clamp-2 mt-1">
                  {tmpl.message}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-gray-400 group-hover:text-amber-800">
                <span className="capitalize">{tmpl.channel.replace('_', ' ')}</span>
                <span className="font-black">Gunakan Template →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Broadcast Composer & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Broadcast Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xs space-y-5">
          <h2 className="text-base font-black text-gray-950">Formulir Pesan Broadcast</h2>

          {/* Channel Selector Pills */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">
              Pilih Saluran Distribusi (Channel):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setChannel('in_app')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  channel === 'in_app'
                    ? 'border-amber-400 bg-amber-50/80 text-amber-950 shadow-xs'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Bell size={16} className={channel === 'in_app' ? 'text-amber-600' : 'text-gray-400'} />
                <span className="text-xs font-black leading-tight">Lonceng In-App</span>
                <span className="text-[9px] text-gray-500 font-medium">Notif merah</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('email')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  channel === 'email'
                    ? 'border-amber-400 bg-amber-50/80 text-amber-950 shadow-xs'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Mail size={16} className={channel === 'email' ? 'text-amber-600' : 'text-gray-400'} />
                <span className="text-xs font-black leading-tight">Email Blast</span>
                <span className="text-[9px] text-gray-500 font-medium">Inbox siswa</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('banner')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  channel === 'banner'
                    ? 'border-amber-400 bg-amber-50/80 text-amber-950 shadow-xs'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Megaphone size={16} className={channel === 'banner' ? 'text-amber-600' : 'text-gray-400'} />
                <span className="text-xs font-black leading-tight">Banner Beranda</span>
                <span className="text-[9px] text-gray-500 font-medium">Sticky alert</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  channel === 'whatsapp'
                    ? 'border-amber-400 bg-amber-50/80 text-amber-950 shadow-xs'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <MessageSquare size={16} className={channel === 'whatsapp' ? 'text-amber-600' : 'text-gray-400'} />
                <span className="text-xs font-black leading-tight">WhatsApp Blast</span>
                <span className="text-[9px] text-gray-500 font-medium">Format copy</span>
              </button>
            </div>
          </div>

          {/* Target Audience Segment */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">
              Segmentasi Penerima (Target Audience):
            </label>
            <select
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 focus:bg-white focus:border-amber-400 outline-none cursor-pointer"
            >
              <option value="all">Semua Siswa Terdaftar (1.850 Penerima)</option>
              <option value="paid">Khusus Siswa Paket Berbayar (VIP, Reguler, Review - 680 Penerima)</option>
              <option value="queen_bee">Khusus Siswa Paket Queen Bee VIP (140 Penerima)</option>
              <option value="honeycomb">Khusus Siswa Paket Honeycomb Reguler (280 Penerima)</option>
              <option value="nectar">Khusus Siswa Paket Nectar Review (260 Penerima)</option>
              <option value="mentors">Khusus Para Mentor Alumni PTN (28 Mentor)</option>
              <option value="ambassador">Khusus Student Ambassador (94 Ambassador)</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Judul Pengumuman / Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Pengumuman Webinar Eksklusif Bedah Jurusan"
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
            />
          </div>

          {/* Message Body */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Isi Pesan Lengkap <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tuliskan isi pengumuman atau instruksi yang jelas kepada siswa..."
              rows={6}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* CTA Link */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Tautan Tujuan / Action Link (Opsional)
            </label>
            <input
              type="text"
              value={ctaUrl}
              onChange={e => setCtaUrl(e.target.value)}
              placeholder="/dashboard/mentor atau /upgrade atau https://zoom.us/..."
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
            />
          </div>

          {/* Success Alert */}
          {successNotice && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Action Button Row */}
          <div className="flex items-center gap-3 pt-2">
            {channel === 'whatsapp' ? (
              <button
                type="button"
                onClick={handleCopyWA}
                className="flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
              >
                {copiedWA ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedWA ? 'Teks WhatsApp Berhasil Disalin!' : 'Salin Format Pesan WhatsApp'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={sending || !title || !message}
                className="flex-1 py-3 px-5 rounded-2xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-amber-950 font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                <Send size={16} />
                <span>
                  {sending
                    ? 'Sedang Mengirim...'
                    : `Kirim Sekarang ke ${currentReach.toLocaleString()} Penerima`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Live Preview Box (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-7 border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <Info size={15} className="text-amber-500" />
              Pratinjau Tampilan (Live Preview)
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              Mode: {channel.replace('_', ' ')}
            </span>
          </div>

          {channel === 'in_app' && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/70 space-y-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Di Popover Lonceng Notifikasi Siswa:
              </div>
              <div className="bg-white rounded-2xl p-3.5 border border-amber-200/80 shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                  <Bell size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-gray-900 leading-snug">
                    {title || 'Judul Notifikasi Masal'}
                  </h4>
                  <p className="text-[11px] text-gray-600 font-medium leading-relaxed mt-1">
                    {message || 'Isi pesan pemberitahuan yang dikirimkan oleh Super Admin OtwPTN...'}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 font-semibold">Baru saja</span>
                    {ctaUrl && (
                      <span className="text-amber-700 font-black hover:underline cursor-pointer">
                        Buka Halaman →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {channel === 'banner' && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/70 space-y-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Sticky Banner di Atas Dashboard Siswa:
              </div>
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl p-4 text-amber-950 shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Megaphone size={16} />
                  <span className="text-xs font-black">{title || 'Pengumuman Resmi OtwPTN'}</span>
                </div>
                <p className="text-xs font-semibold leading-relaxed">
                  {message || 'Isi pesan banner pengumuman yang muncul di bagian paling atas...'}
                </p>
                {ctaUrl && (
                  <div className="mt-2 text-right">
                    <span className="inline-block px-3 py-1 bg-amber-950 text-white rounded-full text-[10px] font-black">
                      Lihat Selengkapnya
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {channel === 'email' && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/70 space-y-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Tampilan di Email Siswa:
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-200 text-xs text-gray-800 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="font-extrabold text-amber-900">OtwPTN Notification</span>
                  <span className="text-[10px] text-gray-400">halo@otwptn.com</span>
                </div>
                <div className="font-black text-sm text-gray-950">
                  {title || 'Subject Email Broadcast'}
                </div>
                <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {message || 'Halo Pejuang PTN,\n\nBerikut pengumuman penting terkait persiapan seleksi masuk kampus impianmu...'}
                </div>
                {ctaUrl && (
                  <div className="pt-2">
                    <span className="inline-block bg-amber-400 text-amber-950 font-black px-4 py-2 rounded-xl text-xs">
                      Buka Tautan Resmi
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {channel === 'whatsapp' && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/70 space-y-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Format Pesan WhatsApp Broadcast:
              </div>
              <div className="bg-[#e6f4ea] rounded-2xl p-4 border border-emerald-200 font-mono text-[11px] text-gray-800 whitespace-pre-wrap leading-relaxed shadow-xs">
                <p className="font-bold text-gray-950">*{title || 'Judul Broadcast'}*</p>
                <p className="mt-2 text-gray-700">
                  {message || 'Isi pesan teks yang rapi dan siap di-forward ke grup siswa atau broadcast WA...'}
                </p>
                <p className="mt-3 text-emerald-800 font-bold">
                  👉 Buka tautan berikut: https://otwptn.com{ctaUrl || '/dashboard'}
                </p>
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/50 text-[11px] text-amber-900 font-medium">
            💡 <strong>Info:</strong> Notifikasi in-app akan langsung menambahkan badge merah pada lonceng di pojok kiri bawah dashboard siswa secara real-time.
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-gray-950">Riwayat Pengiriman Broadcast</h2>
            <p className="text-xs text-gray-500 font-medium">Catatan pengumuman dan pesan masal yang telah disiarkan ke pengguna.</p>
          </div>
          <span className="text-xs font-bold text-gray-400">Total {history.length} Terkirim</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="py-3 px-4 rounded-l-xl">Judul Broadcast</th>
                <th className="py-3 px-4">Saluran Channel</th>
                <th className="py-3 px-4">Target Penerima</th>
                <th className="py-3 px-4">Jangkauan</th>
                <th className="py-3 px-4">Waktu Pengiriman</th>
                <th className="py-3 px-4 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map(item => (
                <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    <div className="line-clamp-1 max-w-xs">{item.title}</div>
                    <div className="text-[10px] text-gray-400 font-medium line-clamp-1 mt-0.5">
                      {item.message}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-[10px] uppercase font-black">
                      {item.channel.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-600">
                    {item.target_audience}
                  </td>
                  <td className="py-3.5 px-4 font-black text-gray-900">
                    {item.recipient_count.toLocaleString()} Siswa
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 font-medium">
                    {item.sent_at}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px]">
                      ✓ Terkirim
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
