'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Clock,
  MapPin,
  Video,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'

export default function CareerPage() {
  return (
    <div className="min-h-screen bg-white relative">

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-10 text-center">
        <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight leading-tight max-w-2xl mx-auto">
          Dibayar Per Video.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
            Kerja dari Mana Saja.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto mt-4 leading-relaxed font-medium">
          Satu posisi yang terbuka sekarang. Tidak ada target follower, tidak perlu studio. Yang dibutuhkan adalah energi, HP, dan keinginan untuk bantu jutaan pejuang PTN.
        </p>
      </section>

      {/* Single Role Card */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl border-2 border-amber-400 bg-white shadow-xl overflow-hidden">
          {/* Top banner */}
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-950 animate-pulse" />
            <span className="text-xs font-black text-amber-950">Pendaftaran Sedang Terbuka</span>
          </div>

          <div className="p-6 sm:p-8">
            {/* Role header */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Video size={26} className="text-amber-700" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-700">Marketing & Media</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">Part-time · Remote</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-950 leading-snug">
                  Marketing Partner<br />
                  <span className="text-amber-600">(Content Creator / Short-Video Talent)</span>
                </h2>
              </div>
            </div>

            {/* Compensation highlight */}
            <div className="mt-6 p-5 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-amber-700" />
                <span className="text-xs font-black text-amber-900 uppercase tracking-wide">Sistem Kompensasi</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
                <div className="text-3xl font-black text-amber-700">Rp 35.000</div>
                <div>
                  <div className="text-sm font-black text-gray-900">per video yang diterima</div>
                  <div className="text-xs text-gray-600 mt-0.5">5–7 video/minggu = Rp 700.000 – Rp 980.000/minggu · tanpa batas maksimal</div>
                </div>
              </div>
            </div>

            {/* Quick info row */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold">
                <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                <span>Work From Anywhere</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold">
                <Clock size={14} className="text-gray-400 flex-shrink-0" />
                <span>Fleksibel · Jam bebas</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold">
                <Video size={14} className="text-gray-400 flex-shrink-0" />
                <span>5–7 video/minggu</span>
              </div>
            </div>

            {/* What you'll do */}
            <div className="mt-6 space-y-2">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wide">Yang akan kamu lakukan</p>
              {[
                'Buat dan upload 5–7 video pendek per minggu di TikTok & Instagram OTWPTN',
                'Bawakan tips SNBP, bedah esai, motivasi, dan info seleksi PTN',
                'Tampil on-camera dengan energi positif, tidak perlu skill editing rumit',
                'Ikut evaluasi video mingguan bersama tim marketing',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/career/content-creator"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-black btn-brand-primary flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span>Lihat Detail & Lamar Sekarang</span>
                <ArrowRight size={16} />
              </Link>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-700">Pendaftaran masih terbuka</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer: other roles closed */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Posisi lain (Academic Content Creator, Campus Ambassador) sedang tidak aktif. Pantau terus halaman ini untuk info pembukaan berikutnya.
        </p>
      </section>
    </div>
  )
}
