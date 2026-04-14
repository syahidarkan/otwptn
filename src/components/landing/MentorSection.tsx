import Link from 'next/link'
import { Trophy, GraduationCap, Star, Award } from 'lucide-react'

const mentors = [
  {
    label: 'Mentor Essay',
    jalur: 'Essay Only (Motivation Letter & Personal Statement)',
    achievements: [
      { icon: 'uni', text: 'Diterima di Universitas Indonesia melalui PPKB UI 2025' },
      { icon: 'uni', text: 'Diterima di Institut Teknologi Sepuluh Nopember melalui UTBK-SNBT 2025' },
      { icon: 'essay', text: 'Parlemen Remaja DPR RI 2024' },
      { icon: 'essay', text: 'Delegasi AFS Global STEM Academies 2024' },
    ],
    categories: ['Essay Only', 'Hybrid'],
  },
  {
    label: 'Mentor Prestasi',
    jalur: 'Prestasi & Hybrid (Portofolio & Sertifikat Kejuaraan)',
    achievements: [
      { icon: 'uni', text: 'Diterima di Universitas Indonesia melalui Seleksi Jalur Prestasi (SJP) 2025' },
      { icon: 'uni', text: 'Diterima di Universitas Padjadjaran melalui SMUP Jalur Prestasi 2025' },
      { icon: 'uni', text: 'Diterima di Universitas Diponegoro melalui SBUB 2025' },
      { icon: 'uni', text: 'Diterima di IPB University UTBK-SNBT 2025' },
    ],
    categories: ['Prestasi Only', 'Hybrid'],
  },
]

const categoryColor: Record<string, string> = {
  'Essay Only': 'bg-blue-100 text-blue-700',
  'Prestasi Only': 'bg-green-100 text-green-700',
  'Hybrid': 'bg-purple-100 text-purple-700',
}

function AchievementIcon({ type }: { type: string }) {
  if (type === 'essay') return <Trophy size={15} className="text-brand-yellow shrink-0 mt-0.5" />
  return <GraduationCap size={15} className="text-brand-yellow shrink-0 mt-0.5" />
}

export default function MentorSection() {
  return (
    <section className="bg-brand-gray py-24" id="mentor">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-brand-muted text-sm font-bold uppercase tracking-widest mb-3">Tim Mentor</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-brand-black mb-4">
            Dibimbing oleh Mereka<br className="hidden sm:block" /> yang Sudah Melewatinya
          </h2>
          <p className="text-brand-muted max-w-xl mx-auto text-base leading-relaxed">
            Mentor otwptn adalah alumni yang dirinya sendiri diterima melalui jalur-jalur non-test
            yang sama dengan yang akan kamu tempuh.
          </p>
        </div>

        {/* Mentor Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {mentors.map((mentor) => (
            <div key={mentor.label} className="bg-white rounded-2xl border border-brand-gray-2 overflow-hidden flex flex-col">
              {/* Card Header */}
              <div className="bg-brand-black px-6 py-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center shrink-0">
                    <Star size={18} className="text-brand-black" fill="currentColor" />
                  </div>
                  <div>
                    <p className="font-extrabold text-white text-base">{mentor.label}</p>
                    <p className="text-white/50 text-xs">{mentor.jalur}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {mentor.categories.map((cat) => (
                    <span key={cat} className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${categoryColor[cat]}`}>
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="px-6 py-5 flex flex-col gap-2.5">
                <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-1">Pencapaian</p>
                {mentor.achievements.map((ach, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <AchievementIcon type={ach.icon} />
                    <span className="text-sm text-brand-black leading-snug">{ach.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Why section */}
        <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-2xl px-6 py-8 mb-10">
          <div className="flex items-center gap-3 mb-5">
            <Award size={20} className="text-brand-black" />
            <h3 className="font-extrabold text-brand-black text-base">Kenapa Ini Penting?</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { title: 'Pengalaman Nyata', desc: 'Mentor tahu persis apa yang dicari PTN karena pernah lolos seleksi yang sama.' },
              { title: 'Feedback Relevan', desc: 'Bukan sekedar koreksi kalimat, tapi masukan substansi yang berpengaruh ke keputusan seleksi.' },
              { title: 'Strategi Terbukti', desc: 'Strategi yang sudah terbukti berhasil membawa mereka diterima di berbagai PTN.' },
            ].map((item) => (
              <div key={item.title}>
                <p className="font-bold text-brand-black text-sm mb-1">{item.title}</p>
                <p className="text-brand-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/tentang-mentor"
            className="inline-block text-sm font-bold text-brand-black underline underline-offset-4 hover:text-brand-yellow transition-colors"
          >
            Lihat profil lengkap mentor →
          </Link>
        </div>
      </div>
    </section>
  )
}
