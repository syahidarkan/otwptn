import Button from '@/components/ui/Button'
import { JALUR_LIST } from '@/lib/constants'
import Image from 'next/image'

export default function HeroSection() {
  const marqueeItems = [...JALUR_LIST, ...JALUR_LIST]

  return (
    <section className="bg-brand-black min-h-screen flex flex-col justify-center pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left — text */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse" />
              <span className="text-brand-yellow text-sm font-semibold">Buka Pendaftaran 2025/2026</span>
            </div>

            <h1 className="text-display text-white max-w-xl">
              Masuk PTN Impian.<br />
              <span className="text-brand-yellow">Tanpa Tes.</span>
            </h1>

            <p className="text-white/60 text-lg mt-6 max-w-lg leading-relaxed">
              Bimbingan intensif untuk jalur non-test — essay, prestasi, dan hybrid.
              Ratusan alumni berhasil tembus UI, ITB, ITS, dan 30+ PTN top Indonesia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Button href="/daftar" variant="primary" size="lg">
                Mulai Bimbingan Sekarang
              </Button>
              <Button href="/#how-it-works" variant="outline" size="lg">
                Pelajari Lebih Lanjut
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-10 text-white/40 text-sm">
              <span>✓ Tanpa UTBK</span>
              <span>✓ Garansi Revisi</span>
              <span>✓ Mentor Berpengalaman</span>
            </div>
          </div>

          {/* Right — image */}
          <div className="hidden lg:flex justify-end">
            <div className="relative w-full max-w-lg aspect-4/5 rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/rektorat-ui.jpeg"
                alt="Gedung Rektorat Universitas Indonesia"
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-brand-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-white/80 text-xs font-semibold bg-brand-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  Gedung Rektorat Universitas Indonesia
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee ticker */}
      <div className="bg-brand-yellow py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-0">
          {marqueeItems.map((jalur, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-6 text-brand-black font-bold text-sm">
              {jalur.name} — {jalur.ptn}
              <span className="text-brand-black/40">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
