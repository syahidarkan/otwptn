const steps = [
  {
    number: '01',
    title: 'Pilih Paket & Jalur',
    desc: 'Pilih kategori jalur (Essay Only, Prestasi Only, atau Hybrid) dan tier bimbingan yang sesuai kebutuhan dan anggaran.',
  },
  {
    number: '02',
    title: 'Daftar & Bayar',
    desc: 'Isi data diri, lakukan transfer, dan upload bukti pembayaran. Admin memverifikasi dalam 1×24 jam.',
  },
  {
    number: '03',
    title: 'Dapat Akses & Bimbingan',
    desc: 'Langsung dapat akses grup WhatsApp dan kontak mentor serta akses e-course. Bimbingan dimulai!',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-brand-black py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-brand-yellow text-sm font-bold uppercase tracking-widest mb-3">Cara Kerja</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">
            Hanya 3 Langkah
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="relative bg-brand-dark rounded-2xl p-8 border border-white/10">
              <span className="text-7xl font-extrabold text-brand-yellow/20 leading-none block mb-4">
                {step.number}
              </span>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-white/50 leading-relaxed text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
