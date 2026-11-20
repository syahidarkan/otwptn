'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDateTime } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

const ROLE_LABEL: Record<string, string> = {
  user: 'Member',
  mentor: 'Mentor',
  creator: 'Konten Kreator',
  admin: 'Admin',
  superadmin: 'Super Admin',
}

const TIER_LABEL: Record<string, string> = {
  free: 'Gratis',
  web_premium: 'Premium',
  review: 'Review',
  reguler: 'Reguler',
  intensif: 'Intensif',
}

interface UserRow {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  school_name: string | null
  tier: string
  tier_expires_at: string | null
  role: string
  is_admin: boolean
  is_active: boolean
  created_at: string
}

const ROLE_FILTERS = ['all', 'user', 'mentor', 'creator', 'admin', 'superadmin'] as const

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(30)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<typeof ROLE_FILTERS[number]>('all')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (p: number, q: string, role: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), role })
      if (q) params.set('search', q)
      const res = await fetch(`/api/admin/users?${params.toString()}`)
      const data = await res.json()
      setUsers(data.users ?? [])
      setTotal(data.total ?? 0)
      setPageSize(data.pageSize ?? 30)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page, search, roleFilter) }, [page, load])

  useEffect(() => {
    setPage(0)
    load(0, search, roleFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 font-bold">{total} Total User</span>
          </div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">
            Semua User OtwPTN
          </h1>
          <p className="text-xs text-gray-500 font-medium max-w-2xl mt-1">
            Daftar seluruh akun terdaftar di platform, lintas role dan tier.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau no. HP..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-amber-400 outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {ROLE_FILTERS.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                roleFilter === r
                  ? 'bg-amber-400 text-amber-950 shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r === 'all' ? 'Semua' : ROLE_LABEL[r] ?? r}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-semibold">Nama</th>
                <th className="px-5 py-3 font-semibold">Kontak</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Tier</th>
                <th className="px-5 py-3 font-semibold">Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-900">{u.full_name ?? '-'}</p>
                    <p className="text-xs text-gray-400">{u.school_name ?? ''}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    <p>{u.email ?? '-'}</p>
                    <p className="text-gray-400">{u.phone ?? ''}</p>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={u.role === 'superadmin' || u.role === 'admin' || u.is_admin ? 'confirmed' : 'pending'}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{TIER_LABEL[u.tier] ?? u.tier}</td>
                  <td className="px-5 py-3 text-gray-500">{formatDateTime(u.created_at)}</td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">Tidak ada data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500 font-semibold">
          <span>Halaman {page + 1} dari {totalPages}</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>
              <ChevronLeft size={14} />
            </Button>
            <Button variant="ghost" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
