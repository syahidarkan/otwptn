'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { RotateCcw, Home, MessageSquare, AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <AlertTriangle size={28} />
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100/70 px-2.5 py-0.5 rounded-full">
            Terjadi Kendala Sistem
          </span>
          <h1 className="text-xl font-black text-gray-950 mt-2">
            Ups! Ada yang Kurang Beres
          </h1>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Sistem mendeteksi kendala saat memuat halaman ini. Data akun dan progres belajarmu tetap aman.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="btn-brand-primary w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <RotateCcw size={15} /> Muat Ulang Halaman
          </button>

          <Link
            href="/dashboard"
            className="w-full py-3.5 rounded-2xl text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={15} /> Kembali ke Dashboard
          </Link>

          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20OtwPTN%2C%20saya%20mengalami%20kendala%20saat%20membuka%20web"
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 rounded-2xl text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center gap-1.5"
          >
            <MessageSquare size={13} className="text-emerald-600" /> Laporkan ke WhatsApp Admin
          </a>
        </div>
      </div>
    </div>
  )
}
