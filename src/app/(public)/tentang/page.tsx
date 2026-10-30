import Link from 'next/link'
import { Shield, Users, Star, Target } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tentang otwptn | Platform Persiapan PTN Non-Tes',
  description: 'Kenali otwptn: platform berbasis AI untuk membantu siswa Indonesia masuk PTN impian lewat jalur non-tes - essay, prestasi, dan strategi personal.',
}

const STATS = [
  { label: 'Siswa Aktif', value: '12.500+' },
  { label: 'Alumni Lolos PTN', value: '2.800+' },
  { label: 'Jalur Non-Tes', value: '20+' },
  { label: 'Satisfaction Rate', value: '94.8%' },
]

const VALUES = [
  { icon: Target, title: 'Fokus & Spesifik', desc: 'Kami hanya mengurus satu hal: membantu siswa lolos PTN lewat jalur non-tes. Bukan platform serba bisa - kami yang paling dalam di bidang ini.' },
  { icon: Shield, title: 'Transparan & Jujur', desc: 'Kami tidak menjanjikan kelulusan 100%. Yang kami janjikan: proses bimbingan terbaik, dokumen berkualitas, dan mentor yang benar-benar pernah ada di posisimu.' },
  { icon: Users, title: 'Alumni, Bukan Guru', desc: 'Mentor kami adalah alumni PTN yang lolos lewat jalur non-tes, bukan pengajar profesional. Mereka berbagi pengalaman nyata, bukan teori.' },
  { icon: Star, title: 'AI + Manusia', desc: 'Teknologi AI kami membantu analisis cepat 24/7. Tapi keputusan manusiawi - revisi essay yang menyentuh hati - tetap di tangan mentor alumni.' },
]

export default function TentangPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4" style={{ color: 'var(--fg)' }}>Tentang otwptn</h1>
          <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--muted)' }}>
            otwptn adalah platform persiapan masuk PTN jalur non-tes berbasis AI - essay, prestasi, dan strategi personal - yang dibangun oleh alumni dan untuk calon mahasiswa Indonesia.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {STATS.map(({ label, value }) => (
            <div key={label} className="card p-5 text-center">
              <p className="text-2xl font-extrabold mb-1" style={{ color: 'var(--fg)' }}>{value}</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="card p-8 mb-10">
          <h2 className="text-xl font-extrabold mb-4" style={{ color: 'var(--fg)' }}>Dari mana otwptn bermula?</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--muted)' }}>
            otwptn lahir dari frustrasi. Saat kami dulu berjuang masuk PTN lewat jalur PPKB UI, tidak ada panduan yang jelas. Informasi tersebar di mana-mana, banyak yang sudah usang, dan tidak ada yang benar-benar paham bedanya jalur essay dengan hybrid.
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--muted)' }}>
            Setelah lolos, kami memutuskan untuk membangun platform yang ingin kami gunakan dulu - lengkap, spesifik, dan dipandu oleh orang yang benar-benar pernah ada di sana.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            Kini otwptn memiliki lebih dari 12.500 pengguna aktif, tim mentor alumni dari UI, ITB, UGM, IPB, dan terus berkembang setiap tahunnya.
          </p>
        </div>

        {/* Values */}
        <h2 className="text-xl font-extrabold mb-6" style={{ color: 'var(--fg)' }}>Nilai-nilai yang kami pegang</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
                  <Icon size={16} />
                </div>
                <h3 className="font-extrabold text-sm" style={{ color: 'var(--fg)' }}>{title}</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-xl font-extrabold mb-3" style={{ color: 'var(--fg)' }}>Siap mulai persiapanmu?</h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="btn btn-primary px-6 py-3 text-sm">Daftar Gratis</Link>
            <Link href="/direktori" className="btn btn-dark px-6 py-3 text-sm">Lihat Semua Jalur</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
