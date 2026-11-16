'use client'

import { useState, useEffect } from 'react'
import {
  Ticket,
  Plus,
  Copy,
  Check,
  Trash2,
  Power,
  RefreshCw,
  Calendar,
  Users,
  Percent,
  DollarSign,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react'

interface PromoCode {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses: number | null
  used_count: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
  notes: string | null
  created_at: string
}

export default function AdminPromoPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [formCode, setFormCode] = useState('')
  const [formType, setFormType] = useState<'percentage' | 'fixed'>('percentage')
  const [formValue, setFormValue] = useState<number>(100)
  const [formMaxUses, setFormMaxUses] = useState<string>('')
  const [formValidUntil, setFormValidUntil] = useState<string>('')
  const [formNotes, setFormNotes] = useState<string>('')

  const fetchPromoCodes = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/promo-codes')
      const json = await res.json()
      if (res.ok) {
        setPromoCodes(json.promoCodes || [])
      } else {
        setError(json.error || 'Gagal memuat data kode promo')
      }
    } catch {
      setError('Gagal menghubungi server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromoCodes()
  }, [])

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleGenerateRandomCode = () => {
    const prefix = formType === 'percentage' && formValue === 100 ? 'OTW100' : 'PROMO'
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    setFormCode(`${prefix}-${rand}`)
  }

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formCode.trim().toUpperCase(),
          discount_type: formType,
          discount_value: Number(formValue),
          max_uses: formMaxUses ? parseInt(formMaxUses, 10) : null,
          valid_until: formValidUntil ? new Date(formValidUntil).toISOString() : null,
          notes: formNotes.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal membuat kode promo')
        return
      }

      setIsModalOpen(false)
      setFormCode('')
      setFormValue(100)
      setFormMaxUses('')
      setFormValidUntil('')
      setFormNotes('')
      fetchPromoCodes()
    } catch {
      setError('Terjadi kendala saat mengirim data.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (promo: PromoCode) => {
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: promo.id, is_active: !promo.is_active }),
      })
      if (res.ok) {
        setPromoCodes(prev =>
          prev.map(p => (p.id === promo.id ? { ...p, is_active: !p.is_active } : p))
        )
      }
    } catch {
      alert('Gagal mengubah status promo')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kode promo ini secara permanen?')) return
    try {
      const res = await fetch(`/api/admin/promo-codes?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPromoCodes(prev => prev.filter(p => p.id !== id))
      }
    } catch {
      alert('Gagal menghapus kode promo')
    }
  }

  // Summary KPIs
  const totalCodes = promoCodes.length
  const activeCodes = promoCodes.filter(p => p.is_active).length
  const totalUsed = promoCodes.reduce((sum, p) => sum + (p.used_count || 0), 0)
  const free100Codes = promoCodes.filter(p => p.discount_type === 'percentage' && p.discount_value >= 100).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Ticket className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight">
              Manajemen Kode Promo & Diskon Khusus
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-1">
            Generate kode diskon fleksibel (potongan 100% gratis, persentase %, atau nominal Rp) dengan batas kuota dan durasi waktu.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchPromoCodes}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#18191e] text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-400 hover:bg-amber-500 text-gray-950 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Generate Kode Baru
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#18191e] border border-gray-150 dark:border-neutral-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-gray-500 dark:text-neutral-400">Total Kode Promo</p>
          <p className="text-2xl font-black text-gray-950 dark:text-white mt-1">{totalCodes}</p>
        </div>
        <div className="bg-white dark:bg-[#18191e] border border-emerald-200/50 dark:border-emerald-900/40 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Kode Aktif</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeCodes}</p>
        </div>
        <div className="bg-white dark:bg-[#18191e] border border-blue-200/50 dark:border-blue-900/40 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Total Kali Dipakai (Redeem)</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{totalUsed}</p>
        </div>
        <div className="bg-white dark:bg-[#18191e] border border-amber-200/50 dark:border-amber-900/40 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Kupon Gratis 100%</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{free100Codes}</p>
        </div>
      </div>

      {/* Promo Codes Table */}
      <div className="bg-white dark:bg-[#18191e] border border-gray-150 dark:border-neutral-800 rounded-3xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-3" />
            <p className="text-sm text-gray-500 dark:text-neutral-400 font-medium">Memuat kode promo...</p>
          </div>
        ) : promoCodes.length === 0 ? (
          <div className="py-20 text-center px-4">
            <Ticket className="w-12 h-12 mx-auto text-gray-300 dark:text-neutral-600 mb-3" />
            <p className="text-base font-bold text-gray-950 dark:text-white">Belum ada kode promo khusus</p>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
              Klik tombol &quot;Generate Kode Baru&quot; untuk membuat voucher diskon atau akses gratis 100%.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 dark:bg-neutral-900/60 border-b border-gray-150 dark:border-neutral-800 text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Kode Promo &amp; Catatan</th>
                  <th className="py-3.5 px-4">Besaran Diskon</th>
                  <th className="py-3.5 px-4">Penggunaan (Kuota)</th>
                  <th className="py-3.5 px-4">Masa Berlaku</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60">
                {promoCodes.map(promo => {
                  const isExpired = promo.valid_until && new Date(promo.valid_until).getTime() < Date.now()
                  const isFull = promo.max_uses !== null && promo.used_count >= promo.max_uses
                  const isFree = promo.discount_type === 'percentage' && promo.discount_value >= 100

                  return (
                    <tr key={promo.id} className="hover:bg-amber-50/20 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-base text-gray-950 dark:text-white tracking-wider bg-gray-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-neutral-700">
                            {promo.code}
                          </span>
                          <button
                            onClick={() => handleCopy(promo.code, promo.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                            title="Salin Kode"
                          >
                            {copiedId === promo.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        {promo.notes && (
                          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1.5 max-w-xs">{promo.notes}</p>
                        )}
                      </td>

                      <td className="py-4 px-4 align-top">
                        {isFree ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                            <Sparkles className="w-3.5 h-3.5" /> 100% GRATIS
                          </span>
                        ) : promo.discount_type === 'percentage' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                            <Percent className="w-3 h-3" /> Diskon {promo.discount_value}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                            Potongan Rp {Number(promo.discount_value).toLocaleString('id-ID')}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 align-top">
                        <div className="font-semibold text-gray-900 dark:text-neutral-100">
                          {promo.used_count} {promo.max_uses ? `/ ${promo.max_uses}` : 'kali (unlimited)'}
                        </div>
                        {promo.max_uses && (
                          <div className="w-28 bg-gray-100 dark:bg-neutral-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-amber-400'}`}
                              style={{ width: `${Math.min(100, (promo.used_count / promo.max_uses) * 100)}%` }}
                            />
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 align-top">
                        {promo.valid_until ? (
                          <div className={`text-xs ${isExpired ? 'text-red-600 font-bold' : 'text-gray-500 dark:text-neutral-400'}`}>
                            {new Date(promo.valid_until).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {isExpired && <span className="block text-[10px] text-red-500 font-bold">Kedaluwarsa</span>}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-neutral-400">Aktif Selamanya</span>
                        )}
                      </td>

                      <td className="py-4 px-4 align-top">
                        {!promo.is_active ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-150 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400">
                            Nonaktif
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700">
                            Kedaluwarsa
                          </span>
                        ) : isFull ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                            Kuota Habis
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Aktif
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(promo)}
                            className={`p-2 rounded-xl transition-colors ${
                              promo.is_active
                                ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                            }`}
                            title={promo.is_active ? 'Nonaktifkan Kode' : 'Aktifkan Kode'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(promo.id)}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Hapus Kode"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Generate Promo Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18191e] border border-gray-200 dark:border-neutral-700/80 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 text-gray-950 dark:text-white">
            <div className="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-neutral-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-400/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-950 dark:text-white tracking-tight">Generate Kode Promo Khusus</h2>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">Buat voucher diskon atau akses 100% gratis</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-800 dark:text-neutral-200">Kode Promo (Referral Code)</label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomCode}
                    className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-400/20 text-amber-800 dark:text-amber-300 hover:bg-amber-200 font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Acak Kode
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={e => setFormCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: OTW100, BEASISWA, TIKTOK20"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono font-bold uppercase tracking-wider text-sm text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:border-amber-400 dark:focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-400/15 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-neutral-200 mb-1.5">Tipe Diskon</label>
                  <select
                    value={formType}
                    onChange={e => {
                      const t = e.target.value as 'percentage' | 'fixed'
                      setFormType(t)
                      if (t === 'percentage') setFormValue(100)
                      else setFormValue(50000)
                    }}
                    className="w-full px-3.5 py-3 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-bold text-gray-950 dark:text-white focus:border-amber-400 dark:focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-400/15 transition-all cursor-pointer"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Nominal Tetap (Rp)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-neutral-200 mb-1.5">
                    {formType === 'percentage' ? 'Besar Diskon (%)' : 'Besar Potongan (Rp)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={formType === 'percentage' ? 100 : 10000000}
                    value={formValue}
                    onChange={e => setFormValue(Number(e.target.value))}
                    placeholder={formType === 'percentage' ? '100' : '50000'}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-bold text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:border-amber-400 dark:focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-400/15 transition-all"
                  />
                </div>
              </div>

              {formType === 'percentage' && formValue === 100 && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/60 rounded-2xl text-xs text-amber-950 dark:text-amber-200 font-semibold flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Kupon ini memberikan akses 100% GRATIS (Total tagihan Rp 0 &amp; auto-aktif).</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-neutral-200 mb-1.5">
                    Batas Kuota Pengguna
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formMaxUses}
                    onChange={e => setFormMaxUses(e.target.value)}
                    placeholder="Kosongkan jika unlimited"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:border-amber-400 dark:focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-400/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-neutral-200 mb-1.5">
                    Kedaluwarsa (Expired Date)
                  </label>
                  <input
                    type="datetime-local"
                    value={formValidUntil}
                    onChange={e => setFormValidUntil(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium text-gray-950 dark:text-white [color-scheme:light] dark:[color-scheme:dark] focus:border-amber-400 dark:focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-400/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-neutral-200 mb-1.5">Catatan / Keperluan</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Contoh: Beasiswa Juara OSN / Promo Live TikTok"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-medium text-gray-950 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:border-amber-400 dark:focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-400/15 transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-sm shadow-md shadow-amber-400/20 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan & Aktifkan Kode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
