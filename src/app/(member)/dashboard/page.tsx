import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate, formatRupiah } from '@/lib/utils'
import { CATEGORY_LABEL, TIER_LABEL } from '@/lib/constants'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { Registration, RegistrationStatus, JalurCategory } from '@/types'
import { BookOpen, MessageCircle, User } from 'lucide-react'

const statusBadge: Record<RegistrationStatus, 'pending' | 'confirmed' | 'rejected' | 'expired'> = {
  pending: 'pending',
  confirmed: 'confirmed',
  rejected: 'rejected',
  expired: 'expired',
}

const statusLabel: Record<RegistrationStatus, string> = {
  pending: 'Menunggu Verifikasi',
  confirmed: 'Aktif',
  rejected: 'Ditolak',
  expired: 'Kadaluarsa',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: registrations }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('registrations')
      .select('*, packages(name, category, tier)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const activeReg = registrations?.find((r: Registration) => r.status === 'confirmed')

  return (
    <div className="min-h-screen bg-brand-gray">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-brand-black">
            Halo, {profile?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-brand-muted mt-1">Selamat datang di dashboard bimbinganmu</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Main column */}
          <div className="md:col-span-2 flex flex-col gap-5">
            {/* Active registration */}
            {activeReg ? (
              <div className="bg-white rounded-2xl border border-brand-gray-2 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-brand-black">Paket Aktif</h2>
                  <Badge variant="confirmed">Aktif</Badge>
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Kategori</span>
                    <span className="font-semibold">
                      {activeReg.packages ? CATEGORY_LABEL[(activeReg.packages as { category: JalurCategory }).category] : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Tier</span>
                    <span className="font-semibold">
                      {activeReg.packages ? TIER_LABEL[(activeReg.packages as { tier: string }).tier] : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Total Dibayar</span>
                    <span className="font-semibold">{formatRupiah(activeReg.total_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Bergabung</span>
                    <span className="font-semibold">{activeReg.confirmed_at ? formatDate(activeReg.confirmed_at) : '-'}</span>
                  </div>
                </div>

                {activeReg.wa_group_link && (
                  <Button
                    href={activeReg.wa_group_link}
                    variant="primary"
                    fullWidth
                    className="mt-5"
                  >
                    <MessageCircle size={16} />
                    Buka Grup WhatsApp Mentor
                  </Button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-brand-gray-2 p-8 text-center">
                <p className="text-brand-muted mb-4">Belum ada paket aktif</p>
                <Button href="/daftar" variant="primary">Daftar Bimbingan</Button>
              </div>
            )}

            {/* Quick links */}
            <div className="bg-brand-black rounded-2xl p-6">
              <h2 className="font-bold text-white mb-4">Akses Cepat</h2>
              <div className="grid grid-cols-2 gap-3">
                <Button href="/ecourse" variant="primary" size="sm" fullWidth>
                  <BookOpen size={15} />
                  E-Course
                </Button>
                <Button href="/profil" variant="outline" size="sm" fullWidth>
                  <User size={15} />
                  Edit Profil
                </Button>
              </div>
            </div>

            {/* All registrations */}
            {registrations && registrations.length > 0 && (
              <div className="bg-white rounded-2xl border border-brand-gray-2 p-6">
                <h2 className="font-bold text-brand-black mb-4">Riwayat Pendaftaran</h2>
                <div className="flex flex-col gap-3">
                  {registrations.map((reg: Registration) => (
                    <div key={reg.id} className="flex items-center justify-between py-3 border-b border-brand-gray last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-brand-black">
                          {reg.packages ? `${CATEGORY_LABEL[(reg.packages as { category: JalurCategory }).category]} — ${TIER_LABEL[(reg.packages as { tier: string }).tier]}` : 'Pendaftaran'}
                        </p>
                        <p className="text-xs text-brand-muted">{formatDate(reg.created_at)}</p>
                      </div>
                      <Badge variant={statusBadge[reg.status as RegistrationStatus]}>
                        {statusLabel[reg.status as RegistrationStatus]}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile card */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-brand-gray-2 p-6">
              <div className="w-14 h-14 rounded-full bg-brand-yellow flex items-center justify-center text-brand-black font-extrabold text-xl mb-4">
                {profile?.full_name?.charAt(0) ?? '?'}
              </div>
              <p className="font-bold text-brand-black">{profile?.full_name}</p>
              <p className="text-xs text-brand-muted mt-0.5">{profile?.email}</p>
              {profile?.school && (
                <p className="text-xs text-brand-muted mt-0.5">{profile.school}</p>
              )}
              <div className="mt-4">
                <Badge variant={profile?.role === 'admin' ? 'hybrid' : profile?.role === 'member' ? 'confirmed' : 'pending'}>
                  {profile?.role === 'admin' ? 'Admin' : profile?.role === 'member' ? 'Member Aktif' : 'Belum Aktif'}
                </Badge>
              </div>
              <Button href="/profil" variant="ghost" size="sm" fullWidth className="mt-5">
                Edit Profil
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
