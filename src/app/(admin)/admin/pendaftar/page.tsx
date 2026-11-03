'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah, formatDateTime } from '@/lib/utils'
import { MENTORS, WA_GROUPS } from '@/lib/constants'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Search, ExternalLink } from 'lucide-react'

const TIER_LABEL: Record<string, string> = {
  dokumen: 'Nectar (Dokumen)',
  menyeluruh: 'Queen Bee (Menyeluruh)',
}

const STATUS_BADGE: Record<string, 'pending' | 'confirmed' | 'rejected' | 'expired'> = {
  pending: 'pending',
  paid: 'confirmed',
  failed: 'rejected',
  expired: 'expired',
}

type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired'

interface OrderRow {
  id: string
  user_id: string
  tier: string
  amount: number
  status: OrderStatus
  created_at: string
  wa_group_link?: string
  notes?: string
  payment_url?: string
  profiles: { full_name: string; email: string; phone?: string; school_name?: string } | null
}

export default function AdminPendaftarPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [filtered, setFiltered] = useState<OrderRow[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [selected, setSelected] = useState<OrderRow | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [waLink, setWaLink] = useState('')
  const [mentorId, setMentorId] = useState(MENTORS[0]?.id ?? '')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const supabase = createClient()

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('id, user_id, tier, amount, status, created_at, wa_group_link, notes, payment_url, profiles!user_id(full_name, email, phone, school_name)')
      .order('created_at', { ascending: false })
    // Normalize profiles from array to single object (Supabase join type)
    const normalized = (data ?? []).map(row => ({
      ...row,
      profiles: Array.isArray(row.profiles) ? (row.profiles[0] ?? null) : row.profiles,
    })) as unknown as OrderRow[]
    setOrders(normalized)
    setFiltered(normalized)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    let list = orders
    if (statusFilter !== 'all') list = list.filter((r) => r.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((r) => {
        const p = r.profiles
        return p?.full_name.toLowerCase().includes(q) || p?.email.toLowerCase().includes(q)
      })
    }
    setFiltered(list)
  }, [search, statusFilter, orders])

  async function handleAction(action: 'confirm' | 'reject') {
    if (!selected) return
    setLoading(true)
    setMsg(null)
    try {
      const mentor = MENTORS.find((m) => m.id === mentorId)
      const res = await fetch('/api/konfirmasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selected.id,
          action,
          wa_group_link: action === 'confirm' ? waLink : undefined,
          mentor_name: action === 'confirm' && mentor ? mentor.label : undefined,
          notes: notes || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMsg(action === 'confirm' ? 'Berhasil dikonfirmasi' : 'Berhasil ditolak')
        setModalOpen(false)
        await load()
      } else {
        setMsg(data.error ?? 'Gagal')
      }
    } finally {
      setLoading(false)
    }
  }

  function openDetail(order: OrderRow) {
    setSelected(order)
    const autoLink = order.wa_group_link || WA_GROUPS.all || ''
    setWaLink(autoLink)
    setMentorId(MENTORS[0]?.id ?? '')
    setNotes(order.notes ?? '')
    setMsg(null)
    setModalOpen(true)
  }

  const profile = selected?.profiles

  function clientWaHref(phone?: string) {
    if (!phone) return null
    const digits = phone.replace(/\D/g, '')
    const intl = digits.startsWith('0') ? '62' + digits.slice(1) : digits
    return `https://wa.me/${intl}`
  }

  return (
    <div className="space-y-6">
      {/* Header Banner Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center p-2.5 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascot-hd/maskot-papan-checklist.png"
              alt="Pendaftar"
              className="w-full h-full object-contain"
              onError={e => { (e.currentTarget as HTMLImageElement).src = '/logo.png' }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500 font-bold">{orders.length} Total Order</span>
            </div>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">
              Data Pendaftar Siswa & Status Order
            </h1>
            <p className="text-xs text-gray-500 font-medium max-w-2xl mt-1">
              Verifikasi pembayaran, assign kakak mentor alumni, dan kirimkan tautan grup WhatsApp 3 pihak.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-500">
            Menunggu: <strong className="text-rose-600 font-black">{orders.filter(r => r.status === 'pending').length}</strong>
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-amber-400 outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {(['all', 'pending', 'paid', 'failed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-amber-400 text-amber-950 shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'all' ? 'Semua' : st === 'paid' ? 'Konfirmasi' : st === 'failed' ? 'Ditolak' : 'Pending'}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-semibold">Nama</th>
                <th className="px-5 py-3 font-semibold">Paket</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Tanggal</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const p = order.profiles
                return (
                  <tr key={order.id} className="border-b border-brand-gray last:border-0 hover:bg-brand-gray/40">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-brand-black">{p?.full_name ?? '-'}</p>
                      <p className="text-xs text-brand-muted">{p?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-brand-dark">
                      {TIER_LABEL[order.tier] ?? order.tier}
                    </td>
                    <td className="px-5 py-3 font-semibold">{formatRupiah(order.amount)}</td>
                    <td className="px-5 py-3 text-brand-muted">{formatDateTime(order.created_at)}</td>
                    <td className="px-5 py-3">
                      <Badge variant={STATUS_BADGE[order.status] ?? 'pending'}>
                        {order.status === 'paid' ? 'Confirmed' : order.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Button onClick={() => openDetail(order)} variant="ghost" size="sm">
                        Lihat Detail
                      </Button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-brand-muted">Tidak ada data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Detail Order" size="lg">
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-brand-muted text-xs">Nama</p>
                <p className="font-semibold">{profile?.full_name}</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs">Email</p>
                <p className="font-semibold">{profile?.email}</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs">WhatsApp</p>
                {clientWaHref(profile?.phone) ? (
                  <a
                    href={clientWaHref(profile?.phone)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-green-700 hover:underline flex items-center gap-1"
                  >
                    {profile?.phone}
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <p className="font-semibold">-</p>
                )}
              </div>
              <div>
                <p className="text-brand-muted text-xs">Asal Sekolah</p>
                <p className="font-semibold">{profile?.school_name ?? '-'}</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs">Paket</p>
                <p className="font-semibold">{TIER_LABEL[selected.tier] ?? selected.tier}</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs">Total Dibayar</p>
                <p className="font-semibold">{formatRupiah(selected.amount)}</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs">No. Order</p>
                <p className="font-semibold font-mono text-xs">{selected.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs">Tanggal Order</p>
                <p className="font-semibold">{formatDateTime(selected.created_at)}</p>
              </div>
            </div>

            {selected.payment_url && (
              <div>
                <p className="text-xs text-brand-muted mb-2">Link Pembayaran DOKU</p>
                <a
                  href={selected.payment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-brand-black font-semibold hover:underline"
                >
                  <ExternalLink size={14} /> Buka Link Pembayaran
                </a>
              </div>
            )}

            {(selected.status === 'pending') && (
              <>
                <div className="border-t border-brand-gray-2 pt-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-brand-dark block mb-1.5">
                      Link Grup WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={waLink}
                      onChange={(e) => setWaLink(e.target.value)}
                      placeholder="https://chat.whatsapp.com/..."
                      className="w-full px-3 py-2.5 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-brand-dark block mb-1.5">Assign Mentor</label>
                    <select
                      value={mentorId}
                      onChange={(e) => setMentorId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-brand-gray-2 text-sm bg-white outline-none focus:border-brand-black"
                    >
                      {MENTORS.map((m) => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-brand-dark block mb-1.5">
                      Catatan Admin (opsional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black resize-none"
                    />
                  </div>
                </div>

                {msg && <p className="text-sm text-red-600 font-medium">{msg}</p>}

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => handleAction('confirm')}
                    variant="primary"
                    loading={loading}
                    disabled={!waLink}
                    fullWidth
                  >
                    ✓ Konfirmasi
                  </Button>
                  <Button onClick={() => handleAction('reject')} variant="danger" loading={loading} fullWidth>
                    ✗ Tolak
                  </Button>
                </div>
              </>
            )}

            {selected.status !== 'pending' && (
              <div className="border-t border-brand-gray-2 pt-4">
                <Badge variant={STATUS_BADGE[selected.status] ?? 'pending'}>
                  {selected.status.toUpperCase()}
                </Badge>
                {selected.notes && <p className="text-sm text-brand-muted mt-2">{selected.notes}</p>}
                {selected.wa_group_link && (
                  <a
                    href={selected.wa_group_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-700 font-semibold hover:underline mt-2"
                  >
                    <ExternalLink size={14} /> Grup WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
