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
  const pkg = selected?.packages as { category: JalurCategory; tier: string } | null
  const jalurUtama = selected ? JALUR_LIST.find((j) => j.id === selected.jalur_utama_id) : null
  const jalurAddon = selected?.addon_jalur_ids?.map((id) => JALUR_LIST.find((j) => j.id === id)).filter(Boolean) ?? []

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-brand-black mb-6">Pendaftar</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RegistrationStatus | 'all')}
          className="px-4 py-2.5 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black bg-white"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-brand-gray-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-brand-gray-2 bg-brand-gray">
              <tr className="text-left text-brand-muted">
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
                <p className="font-semibold">{profile?.phone ?? '—'}</p>
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
