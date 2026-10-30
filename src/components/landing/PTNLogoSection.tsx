'use client'

// Adapted from pintarly - trust strip with real PTN logos, seamless infinite loop

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

// Repeat 4x so a single copy's width always exceeds the viewport - keeps the
// loop truly circular (no visible seam/reset even on ultra-wide screens).
const items = [...PTN, ...PTN, ...PTN, ...PTN]

export default function PTNLogoSection() {
  return (
    <section className="py-16 px-4 overflow-hidden" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-center text-xs font-semibold uppercase tracking-widest mb-10"
        style={{ color: 'var(--muted-2)', letterSpacing: '0.12em' }}
      >
        Alumni kami tersebar di semua PTN terbaik Indonesia
      </motion.p>
      <div className="animate-marquee-x4 flex items-center gap-16" style={{ width: 'max-content' }}>
        {items.map((p, i) => (
          <div key={i} className="flex-shrink-0 h-32 w-32 flex items-center justify-center grayscale hover:grayscale-0 transition-[filter] duration-300">
            <Image src={`/ptn-logos/${p.slug}.png`} alt={p.name} width={128} height={128} style={{ objectFit: 'contain', maxHeight: '100%', width: 'auto', height: 'auto' }} />
          </div>
        ))}
      </div>
    </section>
  )
}
