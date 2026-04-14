const testimonials = [
  {
    name: 'Aisha R.',
    school: 'SMAN 1 Jakarta',
    ptn: 'Diterima PPKB UI — Ilmu Komputer',
    quote: 'Esai saya sebelumnya sangat generik. Setelah dibimbing, hasilnya jauh lebih personal dan berkesan. Alhamdulillah keterima!',
    featured: true,
  },
  {
    name: 'Farhan M.',
    school: 'MAN 2 Surabaya',
    ptn: 'Diterima PIN IPB — Teknologi Pangan',
    quote: 'Proses pendampingannya cepat dan responsif. Mentor paham betul apa yang dicari juri jalur prestasi.',
    featured: false,
  },
  {
    name: 'Dinda P.',
    school: 'SMAN 3 Bandung',
    ptn: 'Diterima SJP UI — Psikologi',
    quote: 'Jalur Hybrid memang susah, tapi dengan strategi yang diajarkan mentor, sertifikat saya bisa dikemas dengan sangat baik.',
    featured: false,
  },
]

export default function TestimonialSection() {
  const featured = testimonials.find((t) => t.featured)!
  const rest = testimonials.filter((t) => !t.featured)

  return (
    <section className="bg-brand-gray py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-brand-muted text-sm font-bold uppercase tracking-widest mb-3">Testimoni</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-brand-black">
            Mereka Sudah Membuktikan
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Featured blockquote */}
          <div className="bg-brand-black rounded-2xl p-8 flex flex-col justify-between md:row-span-2">
            <blockquote className="text-white text-xl md:text-2xl font-bold leading-relaxed">
              "{featured.quote}"
            </blockquote>
            <div className="mt-8">
              <p className="text-brand-yellow font-bold">{featured.name}</p>
              <p className="text-white/50 text-sm">{featured.school}</p>
              <span className="inline-block mt-2 text-xs bg-brand-yellow text-brand-black px-2.5 py-1 rounded-full font-bold">
                {featured.ptn}
              </span>
            </div>
          </div>

          {/* Other testimonials */}
          {rest.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-6 border border-brand-gray-2">
              <p className="text-brand-dark leading-relaxed">"{t.quote}"</p>
              <div className="mt-5">
                <p className="font-bold text-brand-black">{t.name}</p>
                <p className="text-brand-muted text-sm">{t.school}</p>
                <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold">
                  {t.ptn}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
