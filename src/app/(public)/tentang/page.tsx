'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play } from 'lucide-react'

interface TeamMember {
  name: string
  role: string
  avatar: string
  hasQuote?: boolean
  quote?: string
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Syahid Arkan',
    role: 'Founder & Product',
    avatar: '/avatars/avatar-4.png',
  },
  {
    name: 'Nadia Safira',
    role: 'Mentor SNBP UI',
    avatar: '/avatars/avatar-13.png',
  },
  {
    name: 'Reza Pratama',
    role: 'Mentor ITB',
    avatar: '/avatars/avatar-15.png',
    hasQuote: true,
    quote:
      'Melihat siswa dari daerah yang awalnya ragu bisa tersenyum saat pengumuman adalah kepuasan terbesar kami.',
  },
  {
    name: 'Alifia Maharani',
    role: 'Mentor UGM',
    avatar: '/avatars/avatar-14.png',
  },
]

const VALUES = [
  { text: 'Review esai tanpa ribet', emoji: '✍️', bg: 'bg-[#fef8ee]', border: 'border-[#fae8cb]', textCol: 'text-[#92400e]' },
  { text: 'Rasionalisasi data riil', emoji: '📊', bg: 'bg-[#f0fdf4]', border: 'border-[#dcfce7]', textCol: 'text-[#166534]' },
  { text: 'Hemat ratusan jam', emoji: '⏳', bg: 'bg-[#f4f7fb]', border: 'border-[#e2e8f0]', textCol: 'text-[#334155]' },
  { text: 'Personal untuk profilmu', emoji: '🪡', bg: 'bg-[#fdf4ff]', border: 'border-[#f5d0fe]', textCol: 'text-[#86198f]' },
  { text: 'Dibuat untuk kelulusan nyata', emoji: '📈', bg: 'bg-[#eff6ff]', border: 'border-[#dbeafe]', textCol: 'text-[#1e40af]' },
  { text: 'Didampingi kakak tingkat PTN', emoji: '🎓', bg: 'bg-[#fff1f2]', border: 'border-[#ffe4e6]', textCol: 'text-[#9f1239]' },
  { text: 'Bebas stres ujian tertulis', emoji: '🧘', bg: 'bg-[#faf5ff]', border: 'border-[#f3e8ff]', textCol: 'text-[#6b21a8]' },
]

export default function TentangPage() {
  const [activeQuoteIndex, setActiveQuoteIndex] = useState<number | null>(2)

  return (
    <main className="min-h-screen bg-white text-gray-900 pt-32 pb-24 selection:bg-amber-100 selection:text-amber-900 font-sans">
      {/* ── 1. Hero Header ────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 text-center mb-10 sm:mb-14">
        <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-gray-950 leading-[1.12] mb-3 sm:mb-4">
          Kami di sini untuk membantumu bersinar
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-medium max-w-md mx-auto">
          Misi kami sederhana: membuat perjalanan masuk PTN lebih terarah, tenang, dan bebas stres.
        </p>
      </section>

      {/* ── 2. Featured Showcase Card (Sky Blue Pastel with Video) ────── */}
      <section className="max-w-4xl mx-auto px-4 mb-20 sm:mb-28">
        <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden bg-gradient-to-b from-[#dce8f8] via-[#e8f1fc] to-[#d7e6f8] border border-blue-100/80 p-5 sm:p-10 shadow-sm flex flex-col items-center justify-center">
          {/* Subtle cloud ambience */}
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent_70%)]" />

          {/* Floating Pill Badges around Showcase */}
          <div className="hidden sm:flex items-center justify-between w-full max-w-2xl text-[11px] font-semibold text-gray-600 mb-4 px-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs shadow-xs border border-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Review Esai AI
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs shadow-xs border border-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Rasionalisasi SNBP
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs shadow-xs border border-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Mentor Alumni PTN
            </span>
          </div>

          {/* Clean 16:9 Video Frame */}
          <div className="relative w-full max-w-2xl aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-white/80 bg-black z-10 group">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/nLaq2c4v3yU?si=0wrXzzSin4bXIIXJ"
              title="Official Launching OTWPTN"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full block"
            />
          </div>

          <div className="hidden sm:flex items-center justify-center gap-6 w-full text-[11px] font-semibold text-gray-500 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-white/60 shadow-xs">
              ✦ 25+ Direktori Kampus
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-white/60 shadow-xs">
              ✦ Rekomendasi Personal Rapor
            </span>
          </div>
        </div>
      </section>

      {/* ── 3. Editorial Story ────────────────────────────────────────── */}
      <section className="max-w-xl mx-auto px-6 text-center space-y-6 mb-24 sm:mb-32">
        <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-normal">
          Berjuang masuk PTN sendirian itu berat. Itulah alasan utama OTWPTN didirikan: membuat prosesnya jauh lebih mudah, cerdas, dan menyenangkan.
        </p>
        <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-normal">
          Kami memulai OTWPTN dengan satu gagasan sederhana: membantu setiap pejuang PTN fokus pada potensi autentik, capaian prestasi, dan mimpi besarnya — bukan pusing memikirkan syarat berkas yang membingungkan atau tebak-tebakan kuota. Kami percaya, perpaduan teknologi analitis dengan bimbingan tulus alumni kampus impian mampu membuang rasa cemas dan mengeluarkan versi terbaik dari cerita setiap siswa.
        </p>
      </section>

      {/* ── 4. Our Value (Less "ugh", more "yay!") ─────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 text-center mb-28 sm:mb-36">
        <div className="mb-7">
          <p className="text-[11px] font-semibold text-gray-400 tracking-wider mb-1">
            Nilai Kami.
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Lebih sedikit &ldquo;aduh&rdquo;, lebih banyak &ldquo;hore!&rdquo;
          </h2>
        </div>

        {/* Sticker badges with subtle pastel colors */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 max-w-xl mx-auto">
          {VALUES.map((item, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border ${item.bg} ${item.border} ${item.textCol} transition-transform hover:-translate-y-0.5`}
            >
              <span>{item.text}</span>
              <span>{item.emoji}</span>
            </span>
          ))}
        </div>
      </section>

      {/* ── 5. Meet The Team (Smart minds, big hearts.) ───────────────── */}
      <section className="max-w-4xl mx-auto px-4 text-center mb-20">
        <div className="mb-12">
          <p className="text-[11px] font-semibold text-gray-400 tracking-wider mb-1">
            Kenalan dengan tim.
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Pikiran cerdas, hati yang hangat.
          </h2>
        </div>

        {/* 4 Team Members Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-3xl mx-auto items-end mb-16">
          {TEAM_MEMBERS.map((member, idx) => {
            const isQuoting = activeQuoteIndex === idx
            return (
              <div
                key={member.name}
                className="flex flex-col items-center relative group cursor-pointer"
                onClick={() => setActiveQuoteIndex(isQuoting ? null : idx)}
              >
                {/* Speech Bubble Quote Card */}
                {member.hasQuote && member.quote && (
                  <div
                    className={`absolute bottom-full mb-3 w-52 sm:w-56 p-3 rounded-2xl bg-white shadow-xl border border-gray-100 text-left transition-all z-20 ${
                      isQuoting ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                  >
                    <p className="text-[11px] leading-relaxed text-gray-600 font-medium">
                      &ldquo;{member.quote}&rdquo;
                    </p>
                    <div className="w-2.5 h-2.5 bg-white border-r border-b border-gray-100 transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
                  </div>
                )}

                {/* Avatar portrait container */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center mb-3 transition-transform group-hover:scale-105">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name & Role */}
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-800 hover:text-amber-600 transition-colors">
                    {member.name}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {member.role}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Founder's Letter / Heartfelt Note */}
        <div className="max-w-lg mx-auto text-center px-4 space-y-3 text-xs text-gray-400 leading-relaxed">
          <p>
            Kami membangun OTWPTN untuk menghilangkan stres dari persiapan masuk universitas. Ini bukan sekadar alat; ini adalah cara agar setiap anak muda Indonesia bisa bermimpi lebih besar dan melangkah lebih percaya diri.
          </p>
          <p>
            Di balik setiap esai dan rapor ada cerita nyata, ada perjuangan orang tua, dan cita-cita masa depan. Misi kami adalah memastikan setiap cerita itu bersinar.
          </p>
          <p className="pt-2 font-semibold text-gray-600 text-xs">
            — Syahid Arkan, Founder OTWPTN
          </p>
        </div>
      </section>

      {/* ── 6. Minimalist Bottom Action ─────────────────────────────────── */}
      <section className="text-center pt-8">
        <Link
          href="/register"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-sm"
        >
          Mulai Perjalananmu Sekarang
        </Link>
      </section>
    </main>
  )
}
