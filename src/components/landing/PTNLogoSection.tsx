'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const PTN = [
  { slug: 'ui', name: 'Universitas Indonesia' },
  { slug: 'ugm', name: 'Universitas Gadjah Mada' },
  { slug: 'itb', name: 'Institut Teknologi Bandung' },
  { slug: 'unpad', name: 'Universitas Padjadjaran' },
  { slug: 'unair', name: 'Universitas Airlangga' },
  { slug: 'undip', name: 'Universitas Diponegoro' },
  { slug: 'ipb', name: 'IPB University' },
  { slug: 'ub', name: 'Universitas Brawijaya' },
  { slug: 'uns', name: 'Universitas Sebelas Maret' },
  { slug: 'unhas', name: 'Universitas Hasanuddin' },
  { slug: 'uny', name: 'Universitas Negeri Yogyakarta' },
]

// Repeat 2x for a perfectly seamless infinite loop without memory bloat
const items = [...PTN, ...PTN]

export default function PTNLogoSection() {
  return (
    <section
      className="py-10 md:py-14 px-4 overflow-hidden"
      style={{
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-center text-xs font-semibold uppercase tracking-widest mb-6 md:mb-8"
        style={{ color: 'var(--muted-2)', letterSpacing: '0.12em' }}
      >
        Alumni & Mentor kami tersebar di semua PTN terbaik Indonesia
      </motion.p>
      <div
        className="animate-marquee flex items-center gap-8 md:gap-14"
        style={{ width: 'max-content' }}
      >
        {items.map((p, i) => (
          <div
            key={i}
            className="flex-shrink-0 h-16 w-16 md:h-20 md:w-20 flex items-center justify-center opacity-70 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300"
          >
            <Image
              src={`/ptn-logos/${p.slug}.png`}
              alt={p.name}
              width={80}
              height={80}
              loading="lazy"
              decoding="async"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
