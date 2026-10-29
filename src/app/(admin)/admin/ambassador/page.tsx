'use client'

import React, { useState } from 'react'
import {
  Sparkles, Users, DollarSign, ArrowUpRight, CheckCircle2,
  Clock, Search, Filter, ShieldCheck, Download, AlertCircle,
  Copy, Check, ExternalLink, CheckCheck
} from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

interface AmbassadorUser {
  id: string
  fullName: string
  email: string
  phone: string
  school: string
  referralCode: string
  totalInvited: number
  paidInvited: number
  breakdown: {
    review: number // Nectar
    reguler: number // Honeycomb
    vip: number // Queen Bee
  }
  totalCommission: number
  withdrawnCommission: number
  pendingWithdraw: number
  bankInfo: string
  status: 'active' | 'suspended'
}

const MOCK_AMBASSADORS: AmbassadorUser[] = [
  {
    id: 'amb-1',
    fullName: 'Syahid Arkan Pratama',
    email: 'syahid.arkan@gmail.com',
    phone: '081298765432',
    school: 'SMAN 8 Jakarta',
    referralCode: 'ARKANVIP',
    totalInvited: 28,
    paidInvited: 12,
    breakdown: { review: 5, reguler: 4, vip: 3 },
    totalCommission: 5 * 15000 + 4 * 35000 + 3 * 75000, // 75rb + 140rb + 225rb = 440.000
    withdrawnCommission: 250000,
    pendingWithdraw: 190000,
    bankInfo: 'BCA - 8735281920 a.n Syahid Arkan',
    status: 'active',
  },
  {
    id: 'amb-2',
    fullName: 'Nabila Zahra Putri',
    email: 'nabila.zahra@gmail.com',
    phone: '081377889900',
    school: 'SMAN 3 Bandung',
    referralCode: 'NABILAOTW',
    totalInvited: 42,
    paidInvited: 18,
    breakdown: { review: 8, reguler: 6, vip: 4 },
    totalCommission: 8 * 15000 + 6 * 35000 + 4 * 75000, // 120rb + 210rb + 300rb = 630.000
    withdrawnCommission: 500000,
    pendingWithdraw: 130000,
    bankInfo: 'GoPay / ShopeePay - 081377889900',
    status: 'active',
  },
  {
    id: 'amb-3',
    fullName: 'Dimas Kevin Saputra',
    email: 'dimas.kevin@gmail.com',
    phone: '085712345678',
    school: 'SMAN 1 Surabaya',
    referralCode: 'DIMASJUARA',
    totalInvited: 15,
    paidInvited: 5,
    breakdown: { review: 2, reguler: 2, vip: 1 },
    totalCommission: 2 * 15000 + 2 * 35000 + 1 * 75000, // 30rb + 70rb + 75rb = 175.000
    withdrawnCommission: 100000,
    pendingWithdraw: 75000,
    bankInfo: 'Mandiri - 1320098765432 a.n Dimas Kevin',
    status: 'active',
  },
  {
    id: 'amb-4',
    fullName: 'Fathia Rahmawati',
    email: 'fathia.rahma@gmail.com',
    phone: '082199887766',
    school: 'SMAN 1 Yogyakarta',
    referralCode: 'FATHIASNBP',
    totalInvited: 19,
    paidInvited: 7,
    breakdown: { review: 3, reguler: 3, vip: 1 },
    totalCommission: 3 * 15000 + 3 * 35000 + 1 * 75000, // 45rb + 105rb + 75rb = 225.000
    withdrawnCommission: 225000,
    pendingWithdraw: 0,
    bankInfo: 'BNI - 0987654321 a.n Fathia Rahma',
    status: 'active',
  },
]

export default function AdminAmbassadorPage() {
  const [ambassadors, setAmbassadors] = useState<AmbassadorUser[]>(MOCK_AMBASSADORS)
  const [search, setSearch] = useState('')
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null)

  const handleApproveWithdraw = (amb: AmbassadorUser) => {
    if (!confirm(`Konfirmasi transfer penarikan komisi tunai sebesar ${formatRupiah(amb.pendingWithdraw)} ke ${amb.bankInfo}?`)) return

    setAmbassadors(prev =>
      prev.map(a =>
        a.id === amb.id
          ? {
              ...a,
              withdrawnCommission: a.withdrawnCommission + a.pendingWithdraw,
              pendingWithdraw: 0,
            }
          : a
      )
    )

    setPayoutSuccess(`Berhasil menyetujui transfer ${formatRupiah(amb.pendingWithdraw)} ke rekening ${amb.fullName}!`)
    setTimeout(() => setPayoutSuccess(null), 4000)
  }

  // Aggregate stats
  const totalAmb = ambassadors.length
  const totalCommissionsEarned = ambassadors.reduce((s, a) => s + a.totalCommission, 0)
  const totalWithdrawn = ambassadors.reduce((s, a) => s + a.withdrawnCommission, 0)
  const totalPendingPayout = ambassadors.reduce((s, a) => s + a.pendingWithdraw, 0)

  const filtered = ambassadors.filter(
    a =>
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.referralCode.toLowerCase().includes(search.toLowerCase()) ||
      a.school.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header Banner Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center p-2.5 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascot-hd/maskot-kantong-koin-emas.png"
              alt="Ambassador"
              className="w-full h-full object-contain"
              onError={e => {
                ;(e.currentTarget as HTMLImageElement).src = '/logo.png'
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                Program Student Ambassador
              </span>
              <span className="text-xs text-gray-400 font-bold">•</span>
              <span className="text-xs text-gray-500 font-bold">Komisi Tunai Rp 15rb - Rp 75rb</span>
            </div>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">
              Manajemen Student Ambassador & Pencairan Komisi
            </h1>
            <p className="text-xs text-gray-500 font-medium max-w-2xl mt-1">
              Pantau siswa yang aktif membagikan kode referral, verifikasi pendaftaran berbayar teman yang diajak, dan setujui penarikan saldo komisi tunai.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-right">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
            Sistem Komisi OtwPTN
          </div>
          <div className="text-xs font-black text-gray-950 mt-0.5">
            Review Rp15k • Reguler Rp35k • VIP Rp75k
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {payoutSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCheck size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{payoutSuccess}</span>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-400 mb-1">Total Ambassador</div>
          <div className="text-2xl font-black text-gray-900">{totalAmb} Siswa</div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1">Aktif membagikan referral</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-400 mb-1">Total Komisi Dihasilkan</div>
          <div className="text-2xl font-black text-gray-900">{formatRupiah(totalCommissionsEarned)}</div>
          <div className="text-[10px] font-semibold text-sky-600 mt-1">Akumulasi seluruh komisi</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-400 mb-1">Komisi Sudah Ditransfer</div>
          <div className="text-2xl font-black text-emerald-800">{formatRupiah(totalWithdrawn)}</div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1">Telah dicairkan ke bank</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-400 mb-1">Menunggu Pencairan</div>
          <div className="text-2xl font-black text-rose-600">{formatRupiah(totalPendingPayout)}</div>
          <div className="text-[10px] font-semibold text-rose-500 mt-1">Perlu tindakan transfer</div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-gray-950">Daftar Student Ambassador & Saldo</h2>
            <p className="text-xs text-gray-500 font-medium">Klik &quot;Setujui Transfer&quot; untuk mencairkan saldo komisi yang diminta.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, kode referral, sekolah..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-amber-400 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="py-3 px-4 rounded-l-xl">Nama & Asal Sekolah</th>
                <th className="py-3 px-4">Kode Referral</th>
                <th className="py-3 px-4">Siswa Mendaftar</th>
                <th className="py-3 px-4">Total Komisi</th>
                <th className="py-3 px-4">Rekening Tujuan</th>
                <th className="py-3 px-4">Menunggu Transfer</th>
                <th className="py-3 px-4 rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(amb => (
                <tr key={amb.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    <div>{amb.fullName}</div>
                    <div className="text-[11px] text-gray-400 font-medium">{amb.school} • {amb.phone}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-black text-xs font-mono">
                      {amb.referralCode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-gray-900">
                      {amb.paidInvited} / {amb.totalInvited} Siswa
                    </div>
                    <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                      Review: {amb.breakdown.review} • Reguler: {amb.breakdown.reguler} • VIP: {amb.breakdown.vip}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-black text-gray-950">
                    {formatRupiah(amb.totalCommission)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-600 max-w-xs">
                    {amb.bankInfo}
                  </td>
                  <td className="py-3.5 px-4 font-black">
                    {amb.pendingWithdraw > 0 ? (
                      <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-xs">
                        {formatRupiah(amb.pendingWithdraw)}
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        ✓ Lunas
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {amb.pendingWithdraw > 0 ? (
                      <button
                        onClick={() => handleApproveWithdraw(amb)}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 font-black text-amber-950 text-xs transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
                      >
                        Setujui Transfer
                      </button>
                    ) : (
                      <span className="text-gray-400 font-semibold text-xs">Tidak ada aksi</span>
                    )}
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
