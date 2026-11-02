'use client'

// Adapted from pintarly - flagship feature intro with interactive demo

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Lock, FileText, CheckCircle2, ArrowRight } from 'lucide-react'

const SAMPLE_ESSAY = `Motivasi saya memilih Program Studi Kedokteran Universitas Indonesia berawal dari pengalaman merawat kakek saya yang menderita penyakit kronis. Pengalaman itu membuat saya ingin memahami dunia medis lebih dalam. Saya percaya pendidikan di UI akan membentuk saya menjadi dokter yang kompeten dan peduli pada masyarakat.`

export default function EssayCheckerSection() {
  const router = useRouter()
  const [checking, setChecking] = useState(false)
  const [checked, setChecked] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  function handleCheck() {
    setChecking(true)
    setTimeout(() => {
      setChecking(false)
      setChecked(true)
      setCountdown(4)
    }, 1200)
  }

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      router.push('/login')
      return
    }
    const timer = setTimeout(() => setCountdown(c => (c !== null ? c - 1 : null)), 1000)
    return () => clearTimeout(timer)
  }, [countdown, router])

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
          <p className="text-body max-w-lg mx-auto leading-relaxed">
            Lihat simulasi bagaimana <span className="bg-amber-100 text-amber-950 font-black px-2 py-0.5 rounded-lg shadow-3xs inline-block">AI otwptn</span> menganalisis struktur esai sesuai standar penilaian kurator alumni PTN.
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
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-50">
                  <FileText size={15} className="text-amber-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-gray-950">Essay AI Review</div>
                  <div className="text-xs text-gray-500">Dilatih dari data kelulusan tahun-tahun sebelumnya</div>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                Demo Analisis
              </span>
            </div>

            {!checked ? (
              <div className="space-y-4">
                {/* Read-only interactive sample essay card */}
                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 text-left relative">
                  <div className="text-[11px] font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Contoh Draf Esai Masuk FK UI:
                  </div>
                  <p className="text-xs leading-relaxed text-gray-700 italic select-none">
                    &ldquo;{SAMPLE_ESSAY}&rdquo;
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={checking}
                  className="btn btn-primary w-full py-3.5 text-sm font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {checking ? (
                    <>
                      <Sparkles size={16} className="animate-spin text-amber-950" />
                      <span>AI sedang membedah struktur & diksi...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Cek dengan AI (Lihat Contoh Hasil)</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 text-left"
              >
                {/* Result Preview Box */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      Hasil Evaluasi AI OtBee:
                    </span>
                    <span className="text-xs font-black bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full">
                      Skor: 88 / 100
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900 font-medium leading-relaxed mb-3">
                    <strong>Kekuatan:</strong> Latar belakang motivasi keluarga sangat autentik dan emosional.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-gray-700">
                    <div className="p-1.5 rounded-xl bg-white shadow-3xs">
                      <span className="text-gray-400 block">Struktur</span>
                      <strong className="text-emerald-700">90% Bagus</strong>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white shadow-3xs">
                      <span className="text-gray-400 block">STAR Flow</span>
                      <strong className="text-amber-700">86% Cukup</strong>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white shadow-3xs">
                      <span className="text-gray-400 block">Relevansi</span>
                      <strong className="text-emerald-700">92% Kuat</strong>
                    </div>
                  </div>
                </div>

                {/* Redirect Prompt Card */}
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-center space-y-2.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/80 text-amber-950 text-xs font-black">
                    <Lock size={12} /> Buka Lembar Kerja Esai Kamu
                  </div>
                  <p className="text-xs text-amber-950 font-bold leading-snug">
                    Ingin menulis dan mengecek esai motivasimu sendiri dengan AI?
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Otomatis dialihkan ke halaman login dalam <strong>{countdown} detik</strong>...
                  </p>
                  <Link
                    href="/login"
                    className="btn btn-primary w-full py-2.5 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Masuk & Tulis Esaimu Sekarang</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
