'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface TeamMember {
  name: string
  role: string
  avatar: string
  hasQuote?: boolean
  quote?: string
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Founder OTWPTN',
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
  { text: 'Review esai tanpa ribet', emoji: '✍️' },
  { text: 'Rasionalisasi data riil', emoji: '📊' },
  { text: 'Hemat ratusan jam', emoji: '⏳' },
  { text: 'Personal untuk profilmu', emoji: '🪡' },
  { text: 'Dibuat untuk kelulusan nyata', emoji: '📈' },
  { text: 'Didampingi kakak tingkat PTN', emoji: '🎓' },
  { text: 'Bebas stres ujian tertulis', emoji: '🧘' },
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

      {/* ── 2. Showcase Video (Direct Player without card wrapper or buttons) ─ */}
      <section className="max-w-3xl mx-auto px-4 mb-20 sm:mb-28">
        <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/80 bg-black">
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
      </section>

      {/* ── 3. Editorial Story ────────────────────────────────────────── */}
      <section className="max-w-xl mx-auto px-6 text-center space-y-6 mb-24 sm:mb-32">
        <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-normal">
          Berjuang masuk PTN sendirian itu berat. Itulah alasan utama OTWPTN didirikan: membuat prosesnya jauh lebih mudah, cerdas, dan menyenangkan.
        </p>
        <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-normal">
          Kami memulai OTWPTN dengan satu gagasan sederhana: membantu setiap pejuang PTN fokus pada potensi autentik, capaian prestasi, dan mimpi besarnya, bukan pusing memikirkan syarat berkas yang membingungkan atau tebak-tebakan kuota. Kami percaya, perpaduan teknologi analitis dengan bimbingan tulus alumni kampus impian mampu membuang rasa cemas dan mengeluarkan versi terbaik dari cerita setiap siswa.
        </p>
      </section>

      {/* ── 4. Our Values (Black & Yellow sleek cards) ────────────────── */}
      <section className="max-w-3xl mx-auto px-4 text-center mb-28 sm:mb-36">
        <div className="mb-8">
          <p className="text-[11px] font-semibold text-gray-400 tracking-wider mb-1">
            Nilai Kami.
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Lebih sedikit &ldquo;aduh&rdquo;, lebih banyak &ldquo;hore!&rdquo;
          </h2>
        </div>

        {/* Sleek black-and-amber glass cards */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 max-w-2xl mx-auto">
          {VALUES.map((item, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 text-white border border-zinc-800 shadow-sm hover:border-amber-400 hover:bg-zinc-900 transition-all cursor-default group"
            >
              <span className="text-sm group-hover:scale-110 transition-transform">{item.emoji}</span>
              <span className="text-xs sm:text-sm font-medium tracking-tight text-zinc-200 group-hover:text-amber-300 transition-colors">
                {item.text}
              </span>
            </div>
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
          <p className="pt-2 font-semibold text-gray-700 text-xs">
            - Founder OTWPTN
          </p>
        </div>
      </section>

      {/* ── 6. Bottom CTA Card (Brand Black & Yellow) ──────────────────── */}
      <section className="max-w-4xl mx-auto px-4 mt-8">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 text-white p-8 sm:p-12 text-center shadow-2xl">
          {/* Subtle amber ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-400/10 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[11px] font-semibold mb-4 tracking-wide uppercase">
              🚀 Siap Lolos PTN Impian?
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
              Mulai Perjalananmu Bersama OTWPTN Hari Ini
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-8">
              Dapatkan analisis rasionalisasi rapor SNBP yang akurat, review esai berstandar mentor PTN top, dan bimbingan terarah untuk hasil terbaik.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-amber-400 text-black hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/20"
              >
                Daftar Sekarang - Gratis
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition-all"
              >
                Lihat Pilihan Paket
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
