'use client'

// Adapted from user-provided bento reference — asymmetric glass pricing grid (Free biggest, Reguler highlighted)

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Link from 'next/link'

const FREE = { name: 'Akun Gratis', price: 'Rp0', desc: 'Mulai eksplorasi tanpa bayar sepeser pun.', feats: ['Kalkulator Peluang 1x/bulan', 'Chat Otbee AI 3x/hari', 'Essay AI Review 1x/bulan', 'Akses modul preview'], href: '/register' }
const WEB = { name: 'Akun Premium', price: 'Rp49.000', desc: 'Akses penuh ke seluruh fitur platform cerdas tanpa mentor alumni.', feats: ['Kalkulator & AI Unlimited', 'Bebas buat Circle', 'Unlock 100% modul e-course', 'Buka Atur Strategi'], href: '/upgrade' }
const SMALL = [
  { key: 'review', name: 'Nectar (Review)', price: 'Rp99.000', feats: ['Termasuk Akun Premium', '2x Revisi Esai via WA', 'Cek validasi dokumen'], href: '/upgrade', highlight: false },
  { key: 'reguler', name: 'Honeycomb (Reguler)', price: 'Rp199.000', feats: ['Termasuk Akun Premium', '5x Putaran Revisi Esai', '2x Sesi Privat Zoom', 'Grup WA Eksklusif'], href: '/upgrade', highlight: false },
  { key: 'intensif', name: 'Queen Bee (Royal Jelly)', price: 'Rp399.000', feats: ['Termasuk Akun Premium', 'Unlimited Revisi + Meet', 'Wajib Analisis Pil 1 & 2', 'Exclusive Trip ke UI'], href: '/upgrade', highlight: true },
]

function Feats({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mb-5">
      {items.map(f => (
        <li key={f} className="flex items-start gap-2 text-xs">
          <Check size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
          <span style={{ color: 'var(--muted)' }}>{f}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PricingSection() {
  return (
    <section id="harga" className="section-pad px-4" style={{ background: 'var(--hero-grad)' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <h2 className="text-section-heading text-fg mb-3">Pilih sesuai kebutuhanmu</h2>
          <p className="text-body">Sekali bayar, akses selamanya. Bisa upgrade kapan aja.</p>
        </motion.div>

        {/* Desktop bento */}
        <div className="hidden lg:grid gap-4" style={{ gridTemplateColumns: '1.3fr 1fr 1fr 1fr', gridTemplateRows: 'auto auto', gridTemplateAreas: `"free web web web" "free review reguler intensif"` }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
            style={{ gridArea: 'free' }} className="glass hover-lift rounded-2xl p-7 flex flex-col">
            <div className="text-sm font-bold text-fg mb-1">{FREE.name}</div>
            <div className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>{FREE.price}</div>
            <p className="text-xs mb-6" style={{ color: 'var(--muted)' }}>{FREE.desc}</p>
            <div className="flex-1"><Feats items={FREE.feats} /></div>
            <Link href={FREE.href} className="btn btn-dark text-sm py-3 w-full text-center">Mulai Gratis</Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.08 }}
            style={{ gridArea: 'web' }} className="glass hover-lift rounded-2xl p-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-sm font-bold text-fg mb-1">{WEB.name}</div>
                <div className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>{WEB.price}</div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{WEB.desc}</p>
              </div>
              <Link href={WEB.href} className="btn btn-outline text-xs py-2.5 px-5 flex-shrink-0 mt-1">Pilih Ini</Link>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {WEB.feats.map(f => (
                <span key={f} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,212,0,0.15)', color: '#92600a' }}>{f}</span>
              ))}
            </div>
          </motion.div>

          {SMALL.map((t, i) => (
            <motion.div key={t.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.14 + i * 0.06 }}
              style={{
                gridArea: t.key,
                border: t.highlight ? '2px solid var(--accent)' : undefined,
                boxShadow: t.highlight ? '0 8px 32px rgba(255,212,0,0.22)' : undefined,
              }}
              className="glass hover-lift rounded-2xl p-5 flex flex-col relative"
            >
              {t.highlight && (
                <span className="absolute -top-3 left-4 text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>PALING LARIS</span>
              )}
              <div className="text-sm font-bold text-fg mb-1">{t.name}</div>
              <div className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>{t.price}</div>
              <div className="flex-1"><Feats items={t.feats} /></div>
              <Link href={t.href} className={t.highlight ? 'btn btn-primary text-xs py-2 w-full text-center' : 'btn btn-outline text-xs py-2 w-full text-center'}>Pilih</Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile stacked */}
        <div className="lg:hidden flex flex-col gap-4">
          <div className="glass hover-lift rounded-2xl p-6">
            <div className="text-sm font-bold text-fg mb-1">{FREE.name}</div>
            <div className="text-2xl font-bold mb-2">{FREE.price}</div>
            <Feats items={FREE.feats} />
            <Link href={FREE.href} className="btn btn-dark text-sm py-3 w-full text-center">Mulai Gratis</Link>
          </div>
          <div className="glass hover-lift rounded-2xl p-6">
            <div className="text-sm font-bold text-fg mb-1">{WEB.name}</div>
            <div className="text-2xl font-bold mb-2">{WEB.price}</div>
            <Feats items={WEB.feats} />
            <Link href={WEB.href} className="btn btn-outline text-sm py-3 w-full text-center">Pilih Ini</Link>
          </div>
          {SMALL.map(t => (
            <div key={t.key} className="glass hover-lift rounded-2xl p-5 relative"
              style={{ border: t.highlight ? '2px solid var(--accent)' : undefined }}>
              {t.highlight && (
                <span className="absolute -top-3 left-4 text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>PALING LARIS</span>
              )}
              <div className="text-sm font-bold text-fg mb-1">{t.name}</div>
              <div className="text-lg font-bold mb-2">{t.price}</div>
              <Feats items={t.feats} />
              <Link href={t.href} className={t.highlight ? 'btn btn-primary text-xs py-2.5 w-full text-center' : 'btn btn-outline text-xs py-2.5 w-full text-center'}>Pilih</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
