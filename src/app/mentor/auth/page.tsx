'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  School,
  BookOpen,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  LogOut,
} from 'lucide-react'
import { LEGAL_ENTITY, JALUR_LIST } from '@/lib/constants'
import { INDONESIA_PTN_LIST, INDONESIA_JURUSAN_LIST } from '@/lib/indonesiaDirectory'

export default function MentorAuthPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [adminSessionEmail, setAdminSessionEmail] = useState<string | null>(null)

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [university, setUniversity] = useState('Universitas Indonesia')
  const [major, setMajor] = useState('')
  const [track, setTrack] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_admin, email')
        .eq('id', data.user.id)
        .maybeSingle()

      const isAdmin = Boolean(profile?.is_admin || profile?.role === 'superadmin' || profile?.role === 'admin')
      if (isAdmin) {
        setAdminSessionEmail(profile?.email || data.user.email || 'Admin')
      }
    })
  }, [supabase])

  async function handleSignOutAdmin() {
    await supabase.auth.signOut()
    setAdminSessionEmail(null)
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    if (isRegister) {
      if (password.length < 8) {
        setError('Password minimal 8 karakter.')
        setLoading(false)
        return
      }
      if (!university.trim() || !major.trim() || !track.trim()) {
        setError('Mohon lengkapi asal PTN, Jurusan, dan Jalur Masuk terlebih dahulu.')
        setLoading(false)
        return
      }

      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            university,
            major,
            track,
            role: 'mentor',
          },
        },
      })

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      if (data.session) {
        await supabase.from('profiles').update({
          full_name: fullName,
          school_name: university,
        }).eq('id', data.session.user.id)

        await supabase.from('mentor_applications').upsert({
          user_id: data.session.user.id,
          full_name: fullName,
          email,
          university,
          major,
          track,
          status: 'pending',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

        router.push('/mentor/apply')
        return
      }

      setSuccessMsg('Pendaftaran mentor berhasil! Silakan cek email kamu untuk konfirmasi lalu lengkapi LOA.')
      setLoading(false)
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (err) {
        setError('Email atau password salah. Pastikan kamu sudah mendaftar.')
        setLoading(false)
        return
      }

      router.push('/mentor/dashboard')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--hero-grad)' }}
    >
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-7 sm:p-8 shadow-2xl border border-white/60 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <Image src="/logo.png" alt="otwptn" width={160} height={50} priority />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900">
            <GraduationCap size={14} className="text-amber-600" /> Portal Khusus Mentor Alumni
          </div>
          <h1 className="text-xl font-black text-gray-900">
            {isRegister ? 'Registrasi Mentor Baru' : 'Masuk Workspace Mentor'}
          </h1>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            {isRegister
              ? 'Isi identitas PTN, jurusan, jalur masuk, lalu unggah bukti LOA kamu.'
              : 'Akses daftar mentee, jadwal konsultasi Zoom, dan catatan evaluasi esai.'}
          </p>
        </div>

        {adminSessionEmail && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-start gap-2 font-bold">
              <ShieldAlert size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <span>Kamu sedang login sebagai Admin ({adminSessionEmail}). Keluar dulu jika ingin mendaftar atau masuk dengan akun mentor.</span>
            </div>
            <button
              type="button"
              onClick={handleSignOutAdmin}
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut size={13} /> Keluar dari Sesi Admin
            </button>
          </div>
        )}

        {/* Auth Tabs */}
        <div className="flex p-1 rounded-2xl bg-gray-100 text-xs font-black">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null) }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              !isRegister ? 'bg-white text-gray-950 shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Masuk Mentor
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null) }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              isRegister ? 'bg-white text-gray-950 shadow-xs' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Daftar Mentor Baru
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold flex items-center gap-2">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 size={15} className="flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-3.5">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap & Gelar</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    placeholder="Contoh: Muhammad Ihsan, S.T."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Asal PTN Almamater</label>
                <div className="relative">
                  <School size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    list="mentor-ptn-list"
                    value={university}
                    onChange={e => setUniversity(e.target.value)}
                    required
                    placeholder="Pilih atau ketik nama PTN..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:border-amber-400"
                  />
                  <datalist id="mentor-ptn-list">
                    {INDONESIA_PTN_LIST.map(p => (
                      <option key={p.shortName} value={p.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Jurusan / Program Studi</label>
                <div className="relative">
                  <BookOpen size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    list="mentor-jurusan-list"
                    value={major}
                    onChange={e => setMajor(e.target.value)}
                    required
                    placeholder="Contoh: Ilmu Komputer / Kedokteran"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:border-amber-400"
                  />
                  <datalist id="mentor-jurusan-list">
                    {INDONESIA_JURUSAN_LIST.map(j => (
                      <option key={j} value={j} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Jalur Masuk PTN</label>
                <div className="relative">
                  <Compass size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    list="mentor-jalur-list"
                    value={track}
                    onChange={e => setTrack(e.target.value)}
                    required
                    placeholder="Contoh: PPKB UI, Talent Scouting UI, SNBP, IUP UGM"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:border-amber-400"
                  />
                  <datalist id="mentor-jalur-list">
                    {JALUR_LIST.map(j => (
                      <option key={j.id} value={j.name} />
                    ))}
                  </datalist>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Mentor / Alumni</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="email.kamu@alumni.ac.id"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Minimal 8 karakter"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full text-xs font-black bg-amber-400 text-gray-950 hover:bg-amber-300 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading ? 'Memproses...' : isRegister ? 'Lanjut Isi LOA Mentor' : 'Masuk ke Workspace'}
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 text-[11px] text-gray-400 space-y-1">
          <p>© {new Date().getFullYear()} {LEGAL_ENTITY.brand} Mentor Network</p>
          <Link href="/dashboard" className="text-amber-700 font-bold hover:underline block">
            Bukan Mentor? Masuk ke Portal Siswa <ArrowRight size={14} className="inline-block ml-1 align-[-2px]" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  )
}
