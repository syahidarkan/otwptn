'use client'

// Adapted from pintarly - flagship feature intro with interactive demo

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, Lock, FileText } from 'lucide-react'

const SAMPLE_ESSAY = `Motivasi saya memilih Program Studi Kedokteran Universitas Indonesia berawal dari pengalaman merawat kakek saya yang menderita penyakit kronis. Pengalaman itu membuat saya ingin memahami dunia medis lebih dalam. Saya percaya pendidikan di UI akan membentuk saya menjadi dokter yang kompeten dan peduli pada masyarakat.`

export default function EssayCheckerSection() {
  const [text, setText] = useState(SAMPLE_ESSAY)
  const [checking, setChecking] = useState(false)
  const [checked, setChecked] = useState(false)

  function handleCheck() {
    if (!text.trim()) return
    setChecking(true)
    setTimeout(() => { setChecking(false); setChecked(true) }, 1200)
  }

  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  const colors = ['rgba(34,197,94,0.16)', 'rgba(255,212,0,0.22)', 'rgba(239,68,68,0.13)']

  return (
    <section className="section-pad px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <h2 className="text-section-heading text-fg mb-4">Coba Cek Essay-mu Sekarang, Gratis!</h2>
          <p className="text-body max-w-md mx-auto">
            Paste essay motivasimu dan lihat gimana AI otwptn menilai strukturnya sesuai pengalaman para alumni yang sudah lolos melalui jalur tersebut.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="max-w-xl mx-auto relative"
        >
          <motion.div
            className="absolute -right-8 md:-right-16 -bottom-10 md:-bottom-14 z-20"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image src="/mascot/thumbsup.png" alt="Maskot otwptn" width={150} height={192} />
          </motion.div>

          <div className="card p-5 md:p-6 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-alt)' }}>
                <FileText size={15} style={{ color: 'var(--fg)' }} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-fg">Essay AI Review</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>Dilatih dari data kelulusan tahun-tahun sebelumnya</div>
              </div>
            </div>

            {!checked ? (
              <>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  rows={6}
                  placeholder="Paste essay motivasimu di sini..."
                  className="input resize-none mb-4 text-left"
                  style={{ fontSize: '13px', lineHeight: 1.6 }}
                />
                <button onClick={handleCheck} disabled={checking} className="btn btn-primary w-full py-3 text-sm disabled:opacity-60">
                  {checking ? 'AI sedang menganalisis...' : <><Sparkles size={15} /> Cek dengan AI</>}
                </button>
              </>
            ) : (
              <div className="relative">
                <div className="space-y-2 select-none text-left" style={{ filter: 'blur(3.5px)' }}>
                  {sentences.map((s, i) => (
                    <p key={i} className="text-sm leading-relaxed px-2 py-1.5 rounded-lg" style={{ background: colors[i % colors.length] }}>{s}</p>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="glass rounded-2xl p-5 text-center max-w-[260px]"
                    style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
                  >
                    <Lock className="mx-auto mb-2.5" size={20} style={{ color: 'var(--fg)' }} />
                    <p className="text-sm font-bold text-fg mb-1">Hasil analisis siap!</p>
                    <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Masuk dulu buat lihat skor dan saran perbaikan lengkapnya.</p>
                    <Link href="/register" className="btn btn-primary w-full py-2.5 text-xs">Masuk & Lihat Hasil</Link>
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
