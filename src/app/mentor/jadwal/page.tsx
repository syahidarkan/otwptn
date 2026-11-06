'use client'

import Link from 'next/link'
import { CalendarX, ArrowRight } from 'lucide-react'

export default function MentorJadwalPage() {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
        <CalendarX size={30} aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-black text-gray-950">Penjadwalan otomatis belum tersedia</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Saat ini jadwal sesi belum bisa dikelola dari halaman ini. Atur tautan Zoom atau Google Meet dan grup WhatsApp
          untuk setiap mentee langsung dari detail mentee di dashboard mentor.
        </p>
      </div>
      <Link
        href="/mentor/dashboard"
        className="btn-brand-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black"
      >
        Buka Dashboard Mentor <ArrowRight size={14} aria-hidden />
      </Link>
    </div>
  )
}
