'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Package,
  Wallet,
  Clock,
  ReceiptText,
  UsersRound,
  ShieldCheck,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserCog,
  Gauge,
} from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import {
  MODES,
  TRACKS,
  TIERS,
  TIER_LABELS,
  PRICE_MATRIX,
  type Mode,
  type Track,
  type Tier,
} from '@/lib/pricing'

interface RecentOrder {
  id: string
  tier: string
  mode: string | null
  track: string | null
  amount: number
  status: string
  payment_method: string | null
  created_at: string
  paid_at: string | null
  profiles: { full_name: string | null; email: string | null } | null
}

interface MentorLoad {
  mentor_id: string
  name: string
  active: number
  capacity: number
}

interface PaketData {
  stats: { paidOrders: number; manualGrants: number; pendingOrders: number; revenue: number }
  subscribers: Record<Tier, number>
  squads: { forming: number; active: number; completed: number }
  mentorUtilisation: MentorLoad[]
  recentOrders: RecentOrder[]
}

const MODE_LABEL: Record<Mode, string> = { individu: 'Individu', squad: 'Squad' }
const TRACK_LABEL: Record<Track, string> = {
  essay: 'Essay Only',
  prestasi: 'Prestasi Only',
  hybrid: 'Essay + Prestasi',
}

const STATUS_STYLE: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-600',
}

function tierLabel(tier: string): string {
  return TIER_LABELS[tier as Tier] ?? tier
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export default function AdminPaketPage() {
  const [data, setData] = useState<PaketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [email, setEmail] = useState('')
  const [grantTier, setGrantTier] = useState<Tier>('web_premium')
  const [pendingAction, setPendingAction] = useState<'grant' | 'revoke' | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await fetch('/api/admin/paket', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) {
        setLoadError(json.error ?? 'Gagal memuat data paket')
        return
      }
      setData(json)
    } catch {
      setLoadError('Koneksi gagal. Coba muat ulang.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function submitAction() {
    if (!pendingAction) return
    setSubmitting(true)
    setNotice(null)
    try {
      const res = await fetch('/api/admin/paket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: pendingAction,
          email: email.trim(),
          tier: pendingAction === 'grant' ? grantTier : undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setNotice({ type: 'error', text: json.error ?? 'Aksi gagal dijalankan' })
      } else {
        setNotice({ type: 'success', text: json.message ?? 'Aksi berhasil' })
        setEmail('')
        load()
      }
    } catch {
      setNotice({ type: 'error', text: 'Koneksi gagal. Coba lagi.' })
    } finally {
      setSubmitting(false)
      setPendingAction(null)
    }
  }

  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim())

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Package size={20} className="text-amber-600" /> Manajemen Paket
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Statistik penjualan dan pelanggan dari database langsung, plus akses manual untuk kasus khusus.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 disabled:opacity-60"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          <AlertCircle size={15} className="flex-shrink-0" /> {loadError}
        </div>
      )}

      {loading && !data ? (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 size={14} className="animate-spin" /> Memuat data...
        </div>
      ) : data ? (
        <>
          {/* Headline stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Wallet} label="Total Pendapatan" value={formatRupiah(data.stats.revenue)} hint="Dari order berstatus paid" />
            <StatCard icon={ReceiptText} label="Order Dibayar" value={String(data.stats.paidOrders)} hint={`${data.stats.manualGrants} akses manual tidak dihitung`} />
            <StatCard icon={Clock} label="Order Pending" value={String(data.stats.pendingOrders)} hint="Belum dibayar" />
            <StatCard
              icon={UsersRound}
              label="Squad"
              value={`${data.squads.forming} / ${data.squads.active}`}
              hint="Menunggu anggota / mentor ditugaskan"
            />
          </div>

          {/* Subscribers per tier */}
          <section>
            <h2 className="text-sm font-black text-gray-900 mb-3">Pelanggan Aktif per Paket</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {TIERS.map(tier => (
                <div key={tier} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">{TIER_LABELS[tier]}</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{data.subscribers[tier]}</p>
                  <p className="text-[11px] text-gray-500 font-medium">akun</p>
                </div>
              ))}
            </div>
          </section>

          {/* Mentor utilisation */}
          <section>
            <h2 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
              <Gauge size={15} className="text-amber-600" /> Beban Mentor
            </h2>
            {data.mentorUtilisation.length === 0 ? (
              <div className="p-6 rounded-2xl bg-gray-50 text-center text-xs text-gray-400">
                Belum ada mentor yang disetujui.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {data.mentorUtilisation.map(m => {
                  const pct = Math.min(100, Math.round((m.active / Math.max(1, m.capacity)) * 100))
                  return (
                    <div key={m.mentor_id} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-gray-900 truncate">{m.name}</span>
                        <span className="text-[11px] font-bold text-gray-500">{m.active} / {m.capacity} mentee</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Recent orders */}
          <section>
            <h2 className="text-sm font-black text-gray-900 mb-3">25 Order Terbaru</h2>
            {data.recentOrders.length === 0 ? (
              <div className="p-6 rounded-2xl bg-gray-50 text-center text-xs text-gray-400">Belum ada order.</div>
            ) : (
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500">
                      <th className="py-3 px-4 font-bold">Pembeli</th>
                      <th className="py-3 px-4 font-bold">Paket</th>
                      <th className="py-3 px-4 font-bold">Mode</th>
                      <th className="py-3 px-4 font-bold">Cakupan</th>
                      <th className="py-3 px-4 font-bold text-right">Nominal</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.recentOrders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50/60">
                        <td className="py-3 px-4">
                          <p className="font-bold text-gray-900">{o.profiles?.full_name ?? 'Tanpa nama'}</p>
                          <p className="text-[11px] text-gray-400">{o.profiles?.email ?? '-'}</p>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-800">{tierLabel(o.tier)}</td>
                        <td className="py-3 px-4 text-gray-600">{MODE_LABEL[(o.mode ?? 'individu') as Mode] ?? o.mode}</td>
                        <td className="py-3 px-4 text-gray-600">{TRACK_LABEL[(o.track ?? 'essay') as Track] ?? o.track}</td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">
                          {o.payment_method === 'manual' ? 'Manual' : formatRupiah(o.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${STATUS_STYLE[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{formatDateTime(o.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}

      {/* Manual grant / revoke */}
      <section className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm">
        <h2 className="text-sm font-black text-gray-900 mb-1 flex items-center gap-2">
          <UserCog size={15} className="text-amber-600" /> Akses Manual
        </h2>
        <p className="text-[11px] text-gray-500 font-medium mb-4 max-w-xl">
          Untuk kompensasi, partner, atau pembayaran transfer yang belum ke-detect. Pemberian paket dicatat sebagai order
          manual bernilai nol dan setiap aksi masuk ke audit log.
        </p>

        <div className="grid gap-3 md:grid-cols-[1fr_200px]">
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setPendingAction(null) }}
            placeholder="Email akun yang dituju"
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-amber-400"
          />
          <select
            value={grantTier}
            onChange={e => { setGrantTier(e.target.value as Tier); setPendingAction(null) }}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold bg-white focus:outline-none focus:border-amber-400"
          >
            {TIERS.map(tier => (
              <option key={tier} value={tier}>{TIER_LABELS[tier]}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          {pendingAction ? (
            <>
              <span className="text-xs font-bold text-gray-700">
                {pendingAction === 'grant'
                  ? `Berikan paket ${TIER_LABELS[grantTier]} ke ${email.trim()}?`
                  : `Kembalikan ${email.trim()} ke Free?`}
              </span>
              <button
                onClick={submitAction}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-black hover:bg-black disabled:opacity-60"
              >
                {submitting ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />} Ya, jalankan
              </button>
              <button
                onClick={() => setPendingAction(null)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200"
              >
                Batal
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setNotice(null); setPendingAction('grant') }}
                disabled={!emailValid}
                className="px-4 py-2 rounded-xl bg-amber-400 text-amber-950 text-xs font-black hover:bg-amber-500 disabled:opacity-50"
              >
                Berikan Paket
              </button>
              <button
                onClick={() => { setNotice(null); setPendingAction('revoke') }}
                disabled={!emailValid}
                className="px-4 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-black hover:bg-red-100 disabled:opacity-50"
              >
                Cabut ke Free
              </button>
            </>
          )}
        </div>

        {notice && (
          <div
            className={`mt-3 flex items-center gap-2 p-3 rounded-xl text-xs font-semibold ${
              notice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {notice.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} {notice.text}
          </div>
        )}
      </section>

      {/* Read-only pricing reference */}
      <section>
        <h2 className="text-sm font-black text-gray-900 mb-1">Matriks Harga</h2>
        <p className="text-[11px] text-gray-500 font-medium mb-3 max-w-xl">
          Hanya referensi. Harga diubah lewat kode di <span className="font-black">src/lib/pricing.ts</span> lalu
          di-deploy, supaya halaman upgrade dan checkout selalu memakai angka yang sama.
        </p>
        <div className="space-y-4">
          {MODES.map(mode => (
            <div key={mode} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-x-auto">
              <div className="px-4 pt-4 pb-2 text-[11px] font-black uppercase tracking-wider text-gray-400">
                Mode {MODE_LABEL[mode]}{mode === 'squad' ? ' (harga per orang, tetap di semua cakupan)' : ''}
              </div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="py-2.5 px-4 font-bold">Paket</th>
                    {TRACKS.map(track => (
                      <th key={track} className="py-2.5 px-4 font-bold">{TRACK_LABEL[track]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {TIERS.map(tier => (
                    <tr key={tier}>
                      <td className="py-2.5 px-4 font-black text-gray-900">{TIER_LABELS[tier]}</td>
                      {TRACKS.map(track => {
                        const entry = PRICE_MATRIX[mode][track][tier]
                        return (
                          <td key={track} className="py-2.5 px-4">
                            <span className="font-bold text-gray-800">{formatRupiah(entry.amount)}</span>
                            {entry.referralAmount ? (
                              <span className="block text-[10px] text-emerald-600 font-semibold">
                                Referral {formatRupiah(entry.referralAmount)}
                              </span>
                            ) : null}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Wallet
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-gray-400">
        <Icon size={13} className="text-amber-600" /> {label}
      </div>
      <p className="text-xl font-black text-gray-900 mt-2">{value}</p>
      <p className="text-[11px] text-gray-500 font-medium mt-0.5">{hint}</p>
    </div>
  )
}
