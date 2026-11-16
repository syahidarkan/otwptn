'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight, X, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AuthGateModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  featureBadge?: string
  redirectPath: string
  payloadPreview?: { label: string; value: string }[]
}

export default function AuthGateModal({
  isOpen,
  onClose,
  title,
  subtitle = 'Draf dan analisis kamu sudah tersimpan aman. Masuk atau daftar gratis dalam 10 detik untuk membuka hasil lengkap.',
  featureBadge = 'Akses Hasil Lengkap',
  redirectPath,
  payloadPreview = [],
}: AuthGateModalProps) {
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogleAuth() {
    setLoadingGoogle(true)
    setError(null)
    try {
      const supabase = createClient()
      const origin = window.location.origin
      const { error: gErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
        },
      })
      if (gErr) setError(gErr.message)
    } catch (err: any) {
      setError(err?.message || 'Gagal menghubungkan Google')
      setLoadingGoogle(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/75 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#18191e] p-6 sm:p-8 shadow-2xl border border-amber-100 dark:border-neutral-800 z-10 my-auto text-left text-neutral-900 dark:text-neutral-100"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Tutup popup"
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge & Icon */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              {featureBadge}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Data Tersimpan
            </span>
          </div>

          {/* Title & Subtitle */}
          <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight leading-snug">
            {title}
          </h3>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {subtitle}
          </p>

          {/* Preview data pill if any */}
          {payloadPreview.length > 0 && (
            <div className="mt-4 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-150 dark:border-neutral-800 space-y-1.5 text-xs">
              {payloadPreview.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-neutral-700 dark:text-neutral-300">
                  <span className="text-neutral-500 dark:text-neutral-400 font-medium">{item.label}</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[200px]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="mt-6 space-y-3">
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={loadingGoogle}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl text-sm font-bold bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 border-2 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shadow-sm active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loadingGoogle ? 'Menghubungkan...' : 'Lanjut dengan Google (1 Klik)'}
            </button>

            {/* Email / Manual Login Button */}
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl text-sm font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-all shadow-md shadow-amber-400/20 active:scale-[0.99]"
            >
              <span>Masuk atau Buat Akun Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Social Proof & Trust Footer */}
          <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              100% Gratis & Tanpa Komitmen
            </span>
            <span className="font-medium text-neutral-600 dark:text-neutral-400">
              12.500+ Siswa Bergabung
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
