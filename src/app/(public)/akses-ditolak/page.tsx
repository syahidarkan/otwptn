'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShieldAlert,
  ArrowLeft,
  Lock,
  ExternalLink,
  Sparkles,
  UserCheck,
  Home,
} from 'lucide-react'
import { LEGAL_ENTITY } from '@/lib/constants'

export default function AksesDitolakPage() {
  const router = useRouter()

  function enableDevSuperAdmin() {
    document.cookie = 'otwptn_dev_admin=1; path=/; max-age=86400'
    router.push('/admin/mentors')
  }

  return (
    <div className="min-h-screen bg-[#fcfcfb] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-7 sm:p-8 shadow-xl text-center space-y-6 border-0">
        {/* Brand Logo */}
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="otwptn" style={{ height: 32, width: 'auto' }} />
        </div>

        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
          <ShieldAlert size={36} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-900">
            <Lock size={12} /> Halaman Dibatasi
          </div>
          <h1 className="text-2xl font-black text-gray-950">Akses Super Admin Terbatas</h1>
          <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">
            Halaman ini hanya dapat diakses oleh administrator resmi <strong>{LEGAL_ENTITY.name}</strong> yang memiliki hak akses level Super Admin.
          </p>
        </div>

        {/* Local Developer Quick-Unlock Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 text-left space-y-2 border-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-600" /> Akses Khusus Developer / Pemilik Web
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">Local Dev</span>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
            Jika kamu sedang menguji web di localhost, klik tombol di bawah untuk langsung mengaktifkan sesi Super Admin tanpa perlu login ulang.
          </p>
          <button
            onClick={enableDevSuperAdmin}
            className="w-full py-2.5 rounded-full btn-brand-primary text-xs font-black shadow-xs flex items-center justify-center gap-2"
          >
            <UserCheck size={14} /> Aktifkan Mode Super Admin & Buka Panel
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors inline-flex items-center justify-center gap-2"
          >
            <Home size={14} /> Ke Dashboard Siswa
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-2 shadow-xs"
          >
            Login dengan Akun Admin
          </Link>
        </div>
      </div>
    </div>
  )
}
