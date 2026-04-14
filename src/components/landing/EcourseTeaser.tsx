import Button from '@/components/ui/Button'

const features = [
  { icon: '📹', label: 'Dokumentasi Mentoring', desc: 'Materi dasar oleh mentor' },
  { icon: '📄', label: 'Template Siap Pakai', desc: 'Kerangka essay & dokumen' },
  { icon: '💬', label: 'Grup WA Mentor', desc: 'Tanya jawab langsung dengan mentor' },
  { icon: '📚', label: 'Panduan Jalur', desc: 'Detail syarat dan tips tiap jalur PTN' },
]

export default function EcourseTeaser() {
  return (
    <section className="bg-brand-yellow py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-brand-black/50 text-sm font-bold uppercase tracking-widest mb-4">E-Course</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-black leading-tight">
              Materi Lengkap,<br />Akses Tidak Terbatas
            </h2>
            <p className="text-brand-black/60 mt-5 leading-relaxed">
              Setelah terdaftar sebagai member, kamu langsung dapat akses penuh ke semua modul dan materi bimbingan. Dipelajari kapan saja, di mana saja.
            </p>
            <div className="mt-8">
              <Button href="/daftar" variant="dark" size="lg">
                Dapatkan Akses Sekarang
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.label} className="bg-brand-black/10 rounded-xl p-5">
                <span className="text-3xl">{f.icon}</span>
                <h4 className="text-brand-black font-bold mt-3 mb-1">{f.label}</h4>
                <p className="text-brand-black/60 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
