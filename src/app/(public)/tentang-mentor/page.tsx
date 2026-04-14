import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Trophy, GraduationCap, Star, Award } from 'lucide-react'

const mentors = [
  {
    label: 'Mentor Essay',
    jalur: 'Essay Only (Motivation Letter & Personal Statement)',
    achievements: [
      { icon: 'uni', text: 'Diterima di Universitas Indonesia melalui PPKB UI 2025' },
      { icon: 'uni', text: 'Diterima di Institut Teknologi Sepuluh Nopember melalui UTBK - SNBT 2025' },
      { icon: 'essay', text: 'Parlemen Remaja DPR RI 2024' },
      { icon: 'essay', text: 'Delegasi AFS Global STEM Academies 2024' },
    ],
    description:
      'Berpengalaman langsung melewati proses seleksi berbasis essay dan motivation letter di PTN bergengsi. Memahami apa yang dicari PTN dari setiap baris tulisan pendaftar.',
    categories: ['essay_only', 'hybrid'],
  },
  {
    label: 'Mentor Prestasi',
    jalur: 'Prestasi & Hybrid (Portofolio & Sertifikat Kejuaraan)',
    achievements: [
      { icon: 'uni', text: 'Diterima di Universitas Indonesia melalui Seleksi Jalur Prestasi (SJP) 2025' },
      { icon: 'uni', text: 'Diterima di Universitas Padjadjaran melalui SMUP Jalur Prestasi 2025' },
      { icon: 'uni', text: 'Diterima di Universitas Diponegoro melalui SBUB 2025' },
      { icon: 'uni', text: 'Diterima di IPB University UTBK - SNBT 2025' },
    ],
    description:
      'Melewati berbagai jalur seleksi mandiri berbasis prestasi di beberapa PTN top Indonesia. Mengerti cara menyusun portofolio, dokumen prestasi, serta wawancara yang meyakinkan tim seleksi PTN.',
    categories: ['prestasi_only', 'hybrid'],
  },
]

const categoryBadge: Record<string, string> = {
  essay_only: 'Essay Only',
  prestasi_only: 'Prestasi Only',
  hybrid: 'Hybrid',
}

const categoryColor: Record<string, string> = {
  essay_only: 'bg-blue-100 text-blue-700',
  prestasi_only: 'bg-green-100 text-green-700',
  hybrid: 'bg-purple-100 text-purple-700',
}

function AchievementIcon({ type }: { type: string }) {
  if (type === 'essay') return <Trophy size={16} className="text-brand-yellow shrink-0 mt-0.5" />
  return <GraduationCap size={16} className="text-brand-yellow shrink-0 mt-0.5" />
}

export default function TentangMentorPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-bg pt-24 pb-20">
        {/* Header */}
        <section className="max-w-3xl mx-auto px-4 text-center mb-14">
          <span className="inline-block bg-brand-yellow/20 text-brand-black text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
            Tim Mentor
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-black mb-4">
            Dibimbing oleh Mereka yang Sudah Melewatinya
          </h1>
          <p className="text-brand-muted text-base sm:text-lg leading-relaxed">
            Mentor otwptn bukan sekadar tutor, mereka adalah alumni yang dirinya sendiri diterima
            melalui jalur-jalur non-test yang sama dengan yang akan kamu tempuh.
          </p>
        </section>

        {/* Mentor Cards */}
        <section className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-6 mb-16">
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
                      {categoryBadge[cat]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="px-6 py-5 flex flex-col gap-2.5 flex-1">
                <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-1">Pencapaian</p>
                {mentor.achievements.map((ach, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <AchievementIcon type={ach.icon} />
                    <span className="text-sm text-brand-black leading-snug">{ach.text}</span>
                  </div>
                ))}

                <div className="mt-4 pt-4 border-t border-brand-gray-2">
                  <p className="text-sm text-brand-muted leading-relaxed">{mentor.description}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Why it matters */}
        <section className="max-w-3xl mx-auto px-4 mb-16">
          <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-2xl px-6 py-8">
            <div className="flex items-center gap-3 mb-4">
              <Award size={22} className="text-brand-black" />
              <h2 className="font-extrabold text-brand-black text-lg">Kenapa Ini Penting?</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                {
                  title: 'Pengalaman Nyata',
                  desc: 'Mentor tahu persis apa yang dicari PTN karena pernah lolos seleksi yang sama.',
                },
                {
                  title: 'Feedback Relevan',
                  desc: 'Bukan sekedar koreksi kalimat, tapi masukan substansi yang memang berpengaruh ke keputusan seleksi.',
                },
                {
                  title: 'Strategi Terbukti',
                  desc: 'Strategi menyusun essay dan portofolio yang sudah terbukti berhasil membawa mereka diterima berbagai PTN.',
                },
              ].map((item) => (
                <div key={item.title}>
                  <p className="font-bold text-brand-black text-sm mb-1">{item.title}</p>
                  <p className="text-brand-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-extrabold text-brand-black mb-3">
            Siap Mulai Bimbingan?
          </h2>
          <p className="text-brand-muted mb-6 text-sm">
            Pilih jalur PTN yang kamu tuju dan mulai persiapan bersama mentor yang sudah ada di jalurnya.
          </p>
          <a
            href="/daftar"
            className="inline-block bg-brand-yellow text-brand-black font-extrabold px-8 py-3.5 rounded-xl hover:bg-brand-yellow/90 transition-colors text-sm"
          >
            Daftar Sekarang
          </a>
        </section>
      </main>
      <Footer />
    </>
  )
}
