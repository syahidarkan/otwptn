import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatRupiah, formatDateTime } from '@/lib/utils'
import { CATEGORY_LABEL, TIER_LABEL } from '@/lib/constants'
import Badge from '@/components/ui/Badge'
import type { Registration, RegistrationStatus, JalurCategory } from '@/types'
import { Users, Clock, CheckCircle, TrendingUp } from 'lucide-react'

const statusBadge: Record<RegistrationStatus, 'pending' | 'confirmed' | 'rejected' | 'expired'> = {
  pending: 'pending', confirmed: 'confirmed', rejected: 'rejected', expired: 'expired',
}

export default async function AdminDashboard() {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && process.env.NODE_ENV !== 'development') redirect('/login')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalCount },
    { count: pendingCount },
    { count: memberCount },
    { data: recentRegs },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('registrations').select('*', { count: 'exact', head: true }),
    supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'member'),
    supabase
      .from('registrations')
      .select('*, profiles!user_id(full_name, email), packages(category, tier)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('registrations')
      .select('total_price')
      .eq('status', 'confirmed')
      .gte('confirmed_at', startOfMonth),
  ])

const revenue = revenueData?.reduce((sum, r) => sum + (r.total_price ?? 0), 0) ?? 0

  const metrics = [
    { label: 'Total Pendaftar', value: totalCount ?? 0, icon: Users, color: 'text-blue-600' },
    { label: 'Pending Konfirmasi', value: pendingCount ?? 0, icon: Clock, color: (pendingCount ?? 0) > 0 ? 'text-red-600' : 'text-brand-muted', alert: (pendingCount ?? 0) > 0 },
    { label: 'Member Aktif', value: memberCount ?? 0, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Revenue Bulan Ini', value: formatRupiah(revenue), icon: TrendingUp, color: 'text-brand-black', isText: true },
  ]

  return (
    <div className="space-y-6">
      {/* Header Banner Card with Mascot */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center p-2 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascot-hd/maskot-brand-logo-otwptn.png"
              alt="Admin"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                Super Admin Center
              </span>
              <span className="text-xs text-gray-400 font-bold">•</span>
              <span className="text-xs text-gray-500 font-bold">PT. Lembaga Sains Nasional</span>
            </div>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">
              Overview Dashboard Super Admin
            </h1>
            <p className="text-xs text-gray-500 font-medium max-w-2xl mt-1">
              Monitoring pendaftar siswa, revenue 4 paket belajar, verifikasi berkas LOA mentor alumni, komisi ambassador, dan modul video.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/admin/broadcast"
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 font-black text-xs text-amber-950 transition-all shadow-2xs flex items-center gap-1.5"
          >
            <span>+ Buat Broadcast</span>
          </a>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={`rounded-3xl p-6 shadow-md border-0 ${m.alert ? 'bg-rose-50 text-rose-900' : 'bg-white'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <m.icon size={20} className={m.color} />
              {m.alert && <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold">Perlu tindakan</span>}
            </div>
            <p className="text-2xl font-black text-gray-950">
              {m.isText ? m.value : m.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 font-medium mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Recent registrations */}
      <div className="bg-white rounded-3xl shadow-md p-6 border-0 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-gray-950 text-base">5 Pendaftaran Siswa Terbaru</h2>
            <p className="text-xs text-gray-500">Daftar pendaftar teranyar yang masuk ke sistem.</p>
          </div>
          <a href="/admin/pendaftar" className="text-xs text-amber-700 hover:text-amber-800 font-bold">
            Lihat semua →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-semibold">Nama</th>
                <th className="pb-3 font-semibold">Paket</th>
                <th className="pb-3 font-semibold">Total</th>
                <th className="pb-3 font-semibold">Waktu</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentRegs?.map((reg: Registration) => {
                const profile = reg.profiles as { full_name: string } | null
                const pkg = reg.packages as { category: JalurCategory; tier: string } | null
                return (
                  <tr key={reg.id} className="hover:bg-amber-50/20 transition">
                    <td className="py-3 font-medium text-brand-black">{profile?.full_name ?? '—'}</td>
                    <td className="py-3 text-brand-muted">
                      {pkg ? `${CATEGORY_LABEL[pkg.category]} ${TIER_LABEL[pkg.tier]}` : '—'}
                    </td>
                    <td className="py-3">{formatRupiah(reg.total_price)}</td>
                    <td className="py-3 text-brand-muted">{formatDateTime(reg.created_at)}</td>
                    <td className="py-3">
                      <Badge variant={statusBadge[reg.status as RegistrationStatus]}>
                        {reg.status}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
