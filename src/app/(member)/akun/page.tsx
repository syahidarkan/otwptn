'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  Mail,
  Shield,
  KeyRound,
  LogOut,
  Sparkles,
  CheckCircle2,
  Crown,
  Lock,
  ArrowRight,
} from 'lucide-react'
import FeatureHeader from '@/components/dashboard/FeatureHeader'

export default function AkunPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [tier, setTier] = useState('free')
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
        return
      }
      setEmail(data.user.email || '')
      supabase
        .from('profiles')
        .select('full_name, tier')
        .eq('id', data.user.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          setFullName(profile?.full_name || data.user.user_metadata?.full_name || 'Pejuang PTN')
          setTier(profile?.tier || 'free')
          setLoading(false)
        })
    })
  }, [supabase, router])

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }
    setPasswordLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setPasswordSaved(true)
      setNewPassword('')
      setTimeout(() => setPasswordSaved(false), 3000)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    try {
      localStorage.removeItem('otwptn_user_avatar')
      localStorage.removeItem('otwptn_xp')
      localStorage.removeItem('otwptn_level')
      localStorage.removeItem('otwptn_coins')
    } catch {}
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex items-center justify-center min-h-[300px]">
        <div className="text-xs font-bold text-gray-400 animate-pulse">Memuat data akun...</div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <FeatureHeader
        title="Pengaturan Akun & Keamanan"
        subtitle="Kelola informasi login, status paket langganan, dan keamanan akunmu."
        mascot="/mascot-hd/standing-badge.png"
        badgeText="Akun & Keamanan"
      />

      {/* Account Info Card */}
      <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-5">
        <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
          <User size={16} className="text-amber-500" /> Informasi Pengguna
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 block mb-1">Nama Pengguna</span>
            <span className="text-sm font-black text-gray-900">{fullName}</span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 block mb-1">Email Terdaftar</span>
            <span className="text-sm font-black text-gray-900">{email}</span>
          </div>
        </div>

        {/* Tier Status */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/60 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-gray-950 flex items-center justify-center font-black">
              <Crown size={20} />
            </div>
            <div>
              <span className="text-xs font-black text-amber-950 uppercase tracking-wider block">
                Paket Aktif: {tier.toUpperCase()}
              </span>
              <span className="text-[11px] text-amber-800 font-medium">
                {tier === 'free' ? 'Akun gratis reguler. Upgrade untuk akses mentor 1-on-1.' : 'Akses penuh fitur premium aktif.'}
              </span>
            </div>
          </div>
          {tier === 'free' && (
            <Link
              href="/upgrade"
              className="px-4 py-2 rounded-full text-xs font-black bg-amber-400 text-gray-950 hover:bg-amber-300 transition-all shadow-xs flex items-center gap-1.5"
            >
              <Sparkles size={13} /> Upgrade Paket
            </Link>
          )}
        </div>
      </div>

      {/* Security & Password Card */}
      <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-5">
        <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
          <KeyRound size={16} className="text-amber-500" /> Ganti Password
        </h2>

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Password Baru (Minimal 8 Karakter)
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold">
              {error}
            </div>
          )}

          {passwordSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Password berhasil diperbarui!
            </div>
          )}

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-5 py-3 rounded-2xl text-xs font-black bg-gray-900 text-white hover:bg-black transition-all disabled:opacity-40"
          >
            {passwordLoading ? 'Menyimpan...' : 'Perbarui Password'}
          </button>
        </form>
      </div>

      {/* Logout Card */}
      <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-sm font-black text-gray-900">Keluar dari Akun</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Sesi kamu akan diakhiri dan harus login kembali untuk mengakses dashboard.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all flex items-center gap-2"
        >
          <LogOut size={14} /> Keluar Akun
        </button>
      </div>
    </div>
  )
}
