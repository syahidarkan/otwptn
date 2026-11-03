'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Sparkles,
  ArrowRight,
  Flame,
  Users,
  Video,
  Award,
  BookOpen,
  MapPin,
  Clock,
  DollarSign,
  ChevronRight,
} from 'lucide-react'
import CardPattern from '@/components/ui/CardPattern'

const ROLES = [
  {
    id: 'content-creator',
    title: 'Marketing Partner (Content Creator / Short-Video Talent)',
    category: 'Marketing & Media',
    type: 'Part-time',
    location: 'Remote (WFA)',
    salary: 'Rp 1.000.000 - Rp 10.000.000 / bln',
    desc: 'Membuat 5 - 7 konten video pendek per minggu di TikTok & Instagram OTWPTN untuk membagikan tips SNBP, bedah esai, dan motivasi pejuang PTN.',
    isHot: true,
    href: '/career/content-creator',
  },
  {
    id: 'academic-tutor',
    title: 'Academic Content & Question Creator (PPU / PBM)',
    category: 'Curriculum & Education',
    type: 'Freelance / Remote',
    location: 'Remote (WFA)',
    salary: 'Rp 2.000.000 - Rp 6.000.000 / bln',
    desc: 'Menyusun bank soal penalaran bahasa, kisi-kisi terstandar SNPMB, dan pembahasan mendalam untuk persiapan SNBT dan jalur mandiri.',
    isHot: false,
    href: '/career/content-creator',
  },
  {
    id: 'campus-ambassador',
    title: 'Campus Ambassador Lead',
    category: 'Community & Growth',
    type: 'Part-time',
    location: 'Hybrid / Kampus',
    salary: 'Komisi Menarik + Bonus Gadget',
    desc: 'Menjadi perwakilan resmi OTWPTN di lingkungan SMA/kampus kamu, mengkoordinir try out, dan membangun circle belajar.',
    isHot: false,
    href: '/dashboard/ambassador',
  },
]

export default function CareerPage() {
  return (
    <div className="min-h-screen bg-gray-50/60 relative pb-20">
      <CardPattern type="pintarly-doodles" opacity={0.35} />

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-xs font-black mb-4">
          <Sparkles size={14} className="text-amber-600 fill-amber-600" />
          <span>Karier di OTWPTN</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight leading-tight max-w-3xl mx-auto">
          Tumbuh Bersama OTWPTN, Bantu Jutaan Pelajar{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
            Lolos Kampus Impian
          </span>
        </h1>

        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mt-4 leading-relaxed font-medium">
          Kami mencari individu kreatif, bersemangat, dan ingin menciptakan dampak nyata di bidang edukasi dan persiapan perguruan tinggi di Indonesia.
        </p>

        {/* Culture / Values summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 max-w-4xl mx-auto text-left">
          <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-2xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-3">
              <Clock size={20} />
            </div>
            <h3 className="text-sm font-black text-gray-950">Jam Kerja Fleksibel</h3>
            <p className="text-xs text-gray-600 mt-1">
              Bekerja secara remote (WFA) dengan ritme yang bisa disesuaikan dengan perkuliahan atau aktivitasmu.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-2xs">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-900 flex items-center justify-center mb-3">
              <DollarSign size={20} />
            </div>
            <h3 className="text-sm font-black text-gray-950">Kompensasi Kompetitif</h3>
            <p className="text-xs text-gray-600 mt-1">
              Insentif dan reward berbasis performa yang transparan dan dibayarkan tepat waktu setiap bulannya.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-2xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center mb-3">
              <Users size={20} />
            </div>
            <h3 className="text-sm font-black text-gray-950">Dampak Nyata</h3>
            <p className="text-xs text-gray-600 mt-1">
              Karyamu dinikmati dan menjadi jembatan sukses bagi ribuan pejuang PTN dari Sabang sampai Merauke.
            </p>
          </div>
        </div>
      </section>

      {/* Open Positions List */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 mt-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-black text-gray-950">Lowongan yang Sedang Dibuka</h2>
            <p className="text-xs text-gray-500">Pilih posisi yang sesuai dengan bakat dan minatmu.</p>
          </div>
          <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            {ROLES.length} Posisi Aktif
          </span>
        </div>

        <div className="space-y-4">
          {ROLES.map(role => (
            <div
              key={role.id}
              className={`p-6 rounded-3xl bg-white transition-all duration-200 border ${
                role.isHot
                  ? 'border-2 border-amber-400 shadow-md hover:shadow-lg'
                  : 'border-gray-200/80 shadow-2xs hover:shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-700">
                      {role.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800">
                      {role.type}
                    </span>
                    {role.isHot && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 flex items-center gap-1">
                        <Flame size={12} className="fill-amber-950" /> HOT ROLE
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-gray-950 leading-snug">
                    {role.title}
                  </h3>

                  <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
                    {role.desc}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-gray-400" /> {role.location}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <DollarSign size={13} className="text-emerald-500" /> {role.salary}
                    </span>
                  </div>
                </div>

                <div className="sm:self-center flex-shrink-0">
                  <Link
                    href={role.href}
                    className={`px-5 py-2.5 rounded-full text-xs font-black inline-flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 ${
                      role.isHot
                        ? 'btn-brand-primary shadow-sm'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    <span>Lihat & Lamar</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
