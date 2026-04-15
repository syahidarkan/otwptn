import Button from '@/components/ui/Button'

const categories = [
  {
    id: 'essay_only',
    label: 'Essay Only',
    emoji: '✍️',
    desc: 'Jalur berbasis penulisan motivation letter, personal statement, atau esai diri.',
    examples: ['PPKB UI', 'SSU ITB', 'SMITS FLAT ITS'],
    highlight: false,
  },
  {
    id: 'hybrid',
    label: 'Hybrid',
    emoji: '🏆',
    desc: 'Jalur paling kompetitif — wajib punya sertifikat kejuaraan DAN menulis essay kuat.',
    examples: ['SSU Talenta Sains ITB', 'SSU Talenta ITB'],
    highlight: true,
  },
  {
    id: 'prestasi_only',
    label: 'Prestasi Only',
    emoji: '🎖️',
    desc: 'Jalur berbasis sertifikat kejuaraan, hafidz Qur\'an, atau status OSIS.',
    examples: ['SBUB UNDIP', 'Jalur Talenta IPB', 'Ketua OSIS IPB', 'SMUA UNAIR', 'SM Prestasi UNNES'],
    highlight: false,
  },
]

export default function KategoriSection() {
  return (
    <section id="kategori" className="bg-brand-gray py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-brand-muted text-sm font-bold uppercase tracking-widest mb-3">Kategori Jalur</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-brand-black">
            3 Jenis, 1 Tujuan
          </h2>
          <p className="text-brand-muted mt-4 max-w-2xl mx-auto">
            Setiap siswa punya kelebihan berbeda. Kami melayani ketiganya.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`rounded-2xl p-8 flex flex-col ${
                cat.highlight
                  ? 'bg-brand-black text-white ring-2 ring-brand-yellow'
                  : 'bg-white border border-brand-gray-2'
              }`}
            >
              <span className="text-4xl mb-4">{cat.emoji}</span>
              <h3 className={`text-2xl font-extrabold mb-3 ${cat.highlight ? 'text-brand-yellow' : 'text-brand-black'}`}>
                {cat.label}
              </h3>
              <p className={`text-sm leading-relaxed mb-6 ${cat.highlight ? 'text-white/60' : 'text-brand-muted'}`}>
                {cat.desc}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                {cat.examples.map((ex) => (
                  <span
                    key={ex}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      cat.highlight
                        ? 'bg-white/10 text-white/80'
                        : 'bg-brand-gray text-brand-dark'
                    }`}
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button href="/daftar" variant="dark" size="lg">
            Pilih Jalur & Mulai Daftar
          </Button>
        </div>
      </div>
    </section>
  )
}
