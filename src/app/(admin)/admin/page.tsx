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
  if (!user) redirect('/login')

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
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-brand-black mb-8">Dashboard</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={`bg-white rounded-2xl p-5 border ${m.alert ? 'border-red-300 bg-red-50' : 'border-brand-gray-2'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <m.icon size={20} className={m.color} />
              {m.alert && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">Perlu perhatian</span>}
            </div>
            <p className="text-2xl font-extrabold text-brand-black">
              {m.isText ? m.value : m.value.toLocaleString()}
            </p>
            <p className="text-xs text-brand-muted mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Recent registrations */}
      <div className="bg-white rounded-2xl border border-brand-gray-2 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-brand-black">5 Pendaftaran Terbaru</h2>
          <a href="/admin/pendaftar" className="text-sm text-brand-muted hover:text-brand-black font-medium">
            Lihat semua →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-brand-muted border-b border-brand-gray-2">
                <th className="pb-3 font-semibold">Nama</th>
                <th className="pb-3 font-semibold">Paket</th>
                <th className="pb-3 font-semibold">Total</th>
                <th className="pb-3 font-semibold">Waktu</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRegs?.map((reg: Registration) => {
                const profile = reg.profiles as { full_name: string } | null
                const pkg = reg.packages as { category: JalurCategory; tier: string } | null
                return (
                  <tr key={reg.id} className="border-b border-brand-gray last:border-0">
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
