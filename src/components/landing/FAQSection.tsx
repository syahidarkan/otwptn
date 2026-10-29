'use client'

// Adapted from pintarly / eja — FAQ accordion (white card, subtle shadow, no gradient)

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const FAQS = [
  { q: 'Apa itu jalur non-tes PTN?', a: 'Jalur non-tes adalah cara masuk PTN tanpa ujian tulis seperti SNBT — contohnya PPKB UI, PBUB UGM, SMUP Unpad. Seleksinya berdasarkan rapor, portofolio, dan essay motivasi.' },
  { q: 'Apakah otwptn gratis?', a: 'Ada paket gratis yang langsung bisa dipakai. Upgrade ke paket berbayar mulai Rp30.000 — sekali bayar, tanpa subscription.' },
  { q: 'Seberapa akurat estimasi peluangnya?', a: 'Kalkulator membandingkan profilmu dengan data historis. Bukan jaminan, tapi sangat membantu untuk strategi dan prioritas jalur.' },
  { q: 'Bagaimana cara kerja Essay AI Review?', a: 'Paste essay-mu, AI analisis dari 4 dimensi: struktur, koherensi, argumen, dan bahasa — lengkap dengan skor dan saran perbaikan.' },
  { q: 'Apakah data saya aman?', a: 'Data dan essay disimpan terenkripsi dan hanya bisa diakses olehmu. Tidak dibagikan ke pihak ketiga.' },
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="pt-16 pb-20 md:pb-28 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-section-heading text-fg text-center mb-10"
        >
          Pertanyaan yang sering ditanyakan
        </motion.h2>

        <div className="space-y-2">
          {FAQS.map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.05 * i, ease: 'easeOut' }}
              className="card overflow-hidden"
            >
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
                <span className="text-sm font-semibold text-fg">{f.q}</span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-alt)' }}>
                  {open === i ? <Minus size={11} /> : <Plus size={11} />}
                </div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{f.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
