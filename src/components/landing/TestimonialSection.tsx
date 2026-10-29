'use client'

// Adapted from aimasukptn — two-row opposite-direction testimonial marquee

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const ROW1 = [
  { n: 'Camaba UGM, Farmasi \'26', t: 'App Store', q: 'Essay-ku di-review AI 4x, skor naik dari 71 ke 93. Alhamdulillah diterima!' },
  { n: 'Nikeisha Michaela', t: 'App Store', q: 'Penjelasannya enak banget, mudah dimengerti, dan fitur kalkulatornya ngebantu banget.' },
  { n: 'Fillenour', t: 'App Store', q: 'Aplikasinya bagus banget, membantu aku yang lagi persiapan PPKB UI. Fiturnya lengkap!' },
  { n: 'Cashewyy', t: 'App Store', q: 'Worth it banget buat ngejar PTN impian. Pembahasannya mudah dipahami dan detail.' },
  { n: 'Arsunhye', t: 'App Store', q: 'Aplikasinya bagus bgt, membantu persiapan jalur non-tes, sesuai sama kelemahan aku.' },
]

const ROW2 = [
  { n: 'Adinda Sahda N.', t: 'Google Play', q: 'Makasih kakak-kakak otwptn, berkat aplikasi ini aku lolos PPKB UI! Bank soalnya lengkap.' },
  { n: 'Shabri Channel', t: 'Google Play', q: 'Terima kasih otwptn, berkat aplikasi ini saya lolos seleksi. Fiturnya disesuaikan sama kebutuhan.' },
  { n: 'Alycia Kc', t: 'Google Play', q: 'Salah satu aplikasi yang worth it banget buat persiapan masuk PTN! Bisa tracking progres.' },
  { n: 'Rahma Nabila', t: 'Google Play', q: 'Aplikasinya bagus, bisa ngebantu banget buat belajar, fiturnya mantap dan lengkap.' },
  { n: 'Ahmad Fairuz J.', t: 'Google Play', q: 'Udah paling semenanjung itu. Tipe otbee-nya naik, nggak cuma teori tapi bener ngasih logic.' },
]

function Card({ n, t, q }: { n: string; t: string; q: string }) {
  return (
    <div className="flex-shrink-0 w-80 rounded-2xl p-5" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="#ffd400" stroke="none" />)}
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--muted-2)' }}>{t}</span>
      </div>
      <p className="text-sm leading-relaxed text-fg mb-4">{q}</p>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>{n[0]}</div>
        <span className="text-xs font-semibold text-fg">{n}</span>
      </div>
    </div>
  )
}

export default function TestimonialSection() {
  const row1 = [...ROW1, ...ROW1]
  const row2 = [...ROW2, ...ROW2]

  return (
    <section className="py-16 overflow-hidden" style={{ background: 'var(--bg-alt)' }}>
      <div className="max-w-4xl mx-auto px-4 text-center mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-section-heading text-fg"
        >
          500+ camaba <span className="pill-highlight">udah buktiin</span>
        </motion.h2>
      </div>

      <div className="relative mb-4">
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--bg-alt), transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--bg-alt), transparent)' }} />
        <div className="animate-marquee flex gap-4" style={{ width: 'max-content' }}>
          {row1.map((c, i) => <Card key={i} {...c} />)}
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--bg-alt), transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--bg-alt), transparent)' }} />
        <div className="animate-marquee-reverse flex gap-4" style={{ width: 'max-content' }}>
          {row2.map((c, i) => <Card key={i} {...c} />)}
        </div>
      </div>
    </section>
  )
}
