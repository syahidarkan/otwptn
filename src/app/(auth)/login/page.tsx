'use client'

// Adapted from aimasukptn - centered auth card, mascot, floating symbols

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: err } = await createClient().auth.signInWithPassword({ email, password })
    if (err) { setError('Email atau password salah.'); setLoading(false); return }
    router.refresh()
    router.push('/dashboard')
  }

  async function handleGoogle() {
    await createClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: 'var(--hero-grad)' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm card p-8 text-center"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex justify-center mb-5">
          <Image src="/logo.png" alt="otwptn" width={180} height={60}  />
        </div>

        <h1 className="text-xl font-bold text-fg mb-1" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>Sudah siap lolos PTN?</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Otbee siap bantu kamu sampai diterima.</p>

        <button onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-full text-sm font-semibold mb-3"
          style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--fg)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Masuk dengan Google
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--muted)' }}>atau</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleLogin} className="space-y-3 text-left">
          <div>
            <label className="block text-xs font-semibold text-fg mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="kamu@email.com" className="input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-fg mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Password" className="input" />
          </div>
          {error && <div className="text-xs px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#b91c1c' }}>{error}</div>}
          <button type="submit" disabled={loading} className="btn btn-dark w-full py-3 text-sm disabled:opacity-40">{loading ? 'Masuk...' : 'Masuk'}</button>
        </form>

        <div className="mt-4"><Link href="/auth/reset-password" className="text-xs" style={{ color: 'var(--muted)' }}>Lupa password?</Link></div>
        <p className="text-xs mt-4" style={{ color: 'var(--muted)' }}>Belum punya akun? <Link href="/register" className="font-bold text-fg hover:underline">Daftar gratis</Link></p>
        <p className="text-xs mt-5" style={{ color: 'var(--muted-2)' }}>Dipercaya 500+ pelajar kejar PTN impian</p>
      </motion.div>
    </div>
  )
}
