'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah, formatDateTime } from '@/lib/utils'
import { CATEGORY_LABEL, TIER_LABEL, MENTORS, WA_GROUPS, JALUR_LIST } from '@/lib/constants'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import type { Registration, RegistrationStatus, JalurCategory } from '@/types'
import { Search, ExternalLink } from 'lucide-react'

const statusBadge: Record<RegistrationStatus, 'pending' | 'confirmed' | 'rejected' | 'expired'> = {
  pending: 'pending', confirmed: 'confirmed', rejected: 'rejected', expired: 'expired',
}

export default function AdminPendaftarPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filtered, setFiltered] = useState<Registration[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'all'>('all')
  const [selected, setSelected] = useState<Registration | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [waLink, setWaLink] = useState('')
  const [mentorId, setMentorId] = useState(MENTORS[0].id)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const supabase = createClient()

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('registrations')
      .select('*, profiles!user_id(full_name, email, phone, school), packages(category, tier)')
      .order('created_at', { ascending: false })
    setRegistrations(data ?? [])
    setFiltered(data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    let list = registrations
    if (statusFilter !== 'all') list = list.filter((r) => r.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((r) => {
        const p = r.profiles as { full_name: string; email: string } | null
        return p?.full_name.toLowerCase().includes(q) || p?.email.toLowerCase().includes(q)
      })
    }
    setFiltered(list)
  }, [search, statusFilter, registrations])

  const isReview = (selected?.packages as { tier?: string } | null)?.tier === 'review'

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
          registration_id: selected.id,
          action,
          wa_group_link: action === 'confirm'
            ? (isReview ? `https://wa.me/${mentor?.wa}` : waLink)
            : undefined,
          mentor_name: action === 'confirm' && isReview ? mentor?.name : undefined,
          is_review: isReview,
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

  function openDetail(reg: Registration) {
    setSelected(reg)
    const category = (reg.packages as { category?: string } | null)?.category
    const autoLink = reg.wa_group_link || (category ? WA_GROUPS[category] : WA_GROUPS.all) || ''
    setWaLink(autoLink)
    setMentorId(MENTORS[0].id)
    setNotes(reg.notes ?? '')
    setMsg(null)
    setModalOpen(true)
  }

  const profile = selected?.profiles as { full_name: string; email: string; phone?: string; school?: string } | null

  function clientWaHref(phone?: string) {
    if (!phone) return null
    const digits = phone.replace(/\D/g, '')
    const intl = digits.startsWith('0') ? '62' + digits.slice(1) : digits
    return `https://wa.me/${intl}`
  }
  const pkg = selected?.packages as { category: JalurCategory; tier: string } | null
  const jalurUtama = selected ? JALUR_LIST.find((j) => j.id === selected.jalur_utama_id) : null
  const jalurAddon = selected?.addon_jalur_ids?.map((id) => JALUR_LIST.find((j) => j.id === id)).filter(Boolean) ?? []

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
              onError={e => {
                ;(e.currentTarget as HTMLImageElement).src = '/logo.png'
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500 font-bold">{registrations.length} Total Registrasi</span>
            </div>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">
              Data Pendaftar Siswa & Status Paket
            </h1>
            <p className="text-xs text-gray-500 font-medium max-w-2xl mt-1">
              Verifikasi bukti bayar paket bimbingan, assign kakak mentor alumni, dan kirimkan tautan grup WhatsApp 3 pihak.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-500">
            Menunggu: <strong className="text-rose-600 font-black">{registrations.filter(r => r.status === 'pending').length}</strong>
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
            placeholder="Cari nama, email, atau asal sekolah..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-amber-400 outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['all', 'pending', 'confirmed', 'rejected'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-amber-400 text-amber-950 shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'all' ? 'Semua Status' : st}
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
              {filtered.map((reg) => {
                const p = reg.profiles as { full_name: string; email: string } | null
                const pk = reg.packages as { category: JalurCategory; tier: string } | null
                return (
                  <tr key={reg.id} className="border-b border-brand-gray last:border-0 hover:bg-brand-gray/40">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-brand-black">{p?.full_name ?? '—'}</p>
                      <p className="text-xs text-brand-muted">{p?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-brand-dark">
                      {pk ? `${CATEGORY_LABEL[pk.category]} — ${TIER_LABEL[pk.tier]}` : '—'}
                    </td>
                    <td className="px-5 py-3 font-semibold">{formatRupiah(reg.total_price)}</td>
                    <td className="px-5 py-3 text-brand-muted">{formatDateTime(reg.created_at)}</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusBadge[reg.status as RegistrationStatus]}>{reg.status}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Button onClick={() => openDetail(reg)} variant="ghost" size="sm">
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
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Detail Pendaftaran" size="lg">
        {selected && (
          <div className="flex flex-col gap-4">
            {/* User info */}
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
                  <p className="font-semibold">—</p>
                )}
              </div>
              <div>
                <p className="text-brand-muted text-xs">Asal Sekolah</p>
                <p className="font-semibold">{profile?.school ?? '—'}</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs">Paket</p>
                <p className="font-semibold">{pkg ? `${CATEGORY_LABEL[pkg.category]} — ${TIER_LABEL[pkg.tier]}` : '—'}</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs">Total Dibayar</p>
                <p className="font-semibold">{formatRupiah(selected.total_price)}</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs">No. Pendaftaran</p>
                <p className="font-semibold font-mono text-xs">{selected.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-brand-muted text-xs">Tanggal Daftar</p>
                <p className="font-semibold">{formatDateTime(selected.created_at)}</p>
              </div>
            </div>

            {/* Jalur info */}
            <div className="bg-brand-gray rounded-xl p-4 text-sm flex flex-col gap-2">
              <div>
                <p className="text-brand-muted text-xs mb-0.5">Jalur Utama</p>
                {jalurUtama ? (
                  <p className="font-semibold text-brand-black">{jalurUtama.name} <span className="text-brand-muted font-normal">— {jalurUtama.ptn}</span></p>
                ) : (
                  <p className="font-semibold text-brand-muted">{selected.jalur_utama_id ?? '—'}</p>
                )}
              </div>
              {jalurAddon.length > 0 && (
                <div>
                  <p className="text-brand-muted text-xs mb-1">Jalur Tambahan ({jalurAddon.length})</p>
                  <div className="flex flex-col gap-1">
                    {jalurAddon.map((j) => j && (
                      <p key={j.id} className="text-brand-dark">• {j.name} <span className="text-brand-muted">— {j.ptn}</span></p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bukti transfer */}
            {selected.payment_proof && (
              <div>
                <p className="text-xs text-brand-muted mb-2">Bukti Transfer</p>
                <a
                  href={selected.payment_proof}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-brand-black font-semibold hover:underline"
                >
                  <ExternalLink size={14} /> Buka Bukti Transfer
                </a>
              </div>
            )}

            {selected.status === 'pending' && (
              <>
                <div className="border-t border-brand-gray-2 pt-4">
                  {isReview ? (
                    <>
                      <label className="text-xs font-semibold text-brand-dark block mb-1.5">
                        Assign Mentor <span className="text-red-500">*</span>
                        <span className="ml-2 text-brand-muted font-normal">(Paket Review — mentor langsung, tanpa group WA)</span>
                      </label>
                      <select
                        value={mentorId}
                        onChange={(e) => setMentorId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-brand-gray-2 text-sm bg-white outline-none focus:border-brand-black"
                      >
                        {MENTORS.map((m) => (
                          <option key={m.id} value={m.id}>{m.label}</option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <label className="text-xs font-semibold text-brand-dark block mb-1.5">
                        Link Grup WhatsApp <span className="text-red-500">*</span>
                        <span className="ml-2 font-normal text-brand-muted">(auto-filled sesuai kategori)</span>
                      </label>
                      <input
                        value={waLink}
                        onChange={(e) => setWaLink(e.target.value)}
                        placeholder="https://chat.whatsapp.com/..."
                        className="w-full px-3 py-2.5 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black"
                      />
                      {pkg && (
                        <p className="text-xs text-green-700 mt-1">
                          ✓ Group {CATEGORY_LABEL[pkg.category]} ({pkg.category === 'essay_only' ? 'Essay' : pkg.category === 'prestasi_only' ? 'Prestasi' : 'Hybrid'})
                        </p>
                      )}
                    </>
                  )}
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

                {msg && <p className="text-sm text-red-600 font-medium">{msg}</p>}

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => handleAction('confirm')}
                    variant="primary"
                    loading={loading}
                    disabled={!isReview && !waLink}
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
                <Badge variant={statusBadge[selected.status as RegistrationStatus]}>
                  {selected.status.toUpperCase()}
                </Badge>
                {selected.notes && <p className="text-sm text-brand-muted mt-2">{selected.notes}</p>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
