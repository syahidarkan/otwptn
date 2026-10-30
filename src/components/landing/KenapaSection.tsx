'use client'

// Adapted from pintarly - "Kenapa Belajarmu Masih Gitu-gitu Aja?" problem cards, glass + hover lift

import { motion } from 'framer-motion'
import Image from 'next/image'

const ITEMS = [
  { img: '/mascot/confused.png', title: 'Info Jalur Berantakan', desc: 'Deadline beda-beda, syarat berubah tiap tahun. Kamu harus ngumpulin sendiri dari ratusan sumber yang gak jelas mana yang update.' },
  { img: '/mascot/reading-books.png', title: 'Gak Tau Essay-mu Layak', desc: 'Nulis essay motivasi tapi gak ada yang review. Kakak atau guru pun belum tentu paham konteks seleksi PTN non-tes.' },
  { img: '/mascot/map-pointing.png', title: 'Strategi Asal-asalan', desc: 'Tanpa data, kamu cuma bisa nebak apakah profil akademikmu cukup kuat buat jalur yang kamu incar.' },
]

export default function KenapaSection() {
  return (
    <section className="section-pad px-4 relative overflow-hidden" style={{ background: 'var(--bg-alt)' }}>
      {/* subtle color blobs so the glass cards have something to refract */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 40% 50% at 15% 20%, rgba(255,212,0,0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 50% at 85% 80%, rgba(255,212,0,0.1) 0%, transparent 70%)',
      }} />

      <div className="max-w-5xl mx-auto relative">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-section-heading text-fg text-center mb-14"
        >
          Kenapa Persiapanmu Masih <span style={{ background: 'linear-gradient(to top, rgba(255,212,0,0.4) 40%, transparent 40%)' }}>Gitu-gitu Aja?</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ITEMS.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * i, ease: 'easeOut' }}
              className="glass hover-lift rounded-2xl p-6 text-center cursor-default"
            >
              <div className="flex justify-center mb-4">
                <Image src={it.img} alt={it.title} width={100} height={120} />
              </div>
              <h3 className="text-base font-bold text-fg mb-2">{it.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
