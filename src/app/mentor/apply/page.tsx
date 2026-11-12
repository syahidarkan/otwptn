'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  CheckCircle2,
  Check,
  School,
  Award,
  Loader2,
  LogOut,
  Mail,
  Lock,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'
import { LEGAL_ENTITY, JALUR_LIST } from '@/lib/constants'
import { INDONESIA_PTN_LIST, INDONESIA_JURUSAN_LIST } from '@/lib/indonesiaDirectory'

export default function MentorApplyPage() {
  const [loaFile, setLoaFile] = useState<File | null>(null)
  const [essayFile, setEssayFile] = useState<File | null>(null)
  const [certFile, setCertFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isAdminSession, setIsAdminSession] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false)

  const [password, setPassword] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    university: '',
    major: '',
    track: '',
    gradYear: '',
    sopAgreed: true,
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setCheckingSession(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, school_name, email, role, is_admin')
        .eq('id', data.user.id)
        .maybeSingle()

      const adminDetected = Boolean(
        profile?.is_admin || profile?.role === 'superadmin' || profile?.role === 'admin'
      )

      if (adminDetected) {
        // Security guard: NEVER auto-fill or connect a Superadmin/Admin session to mentor application
        setIsAdminSession(true)
        setAdminEmail(profile?.email || data.user.email || 'Superadmin')
        setCheckingSession(false)
        return
      }

      setUserId(data.user.id)
      setUserRole(profile?.role || 'member')

      const { data: app } = await supabase
        .from('mentor_applications')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (app) {
        setForm(prev => ({
          ...prev,
          fullName: app.full_name || prev.fullName,
          email: app.email || prev.email,
          phone: app.phone || prev.phone,
          university: app.university || prev.university,
          major: app.major || prev.major,
          track: app.track || prev.track,
          gradYear: app.grad_year || prev.gradYear,
        }))
        if (app.status === 'pending' || app.status === 'approved') {
          setSubmitted(true)
        }
      }

      setForm(prev => ({
        ...prev,
        fullName: prev.fullName || profile?.full_name || data.user?.user_metadata?.full_name || '',
        email: prev.email || profile?.email || data.user?.email || '',
        university: prev.university || profile?.school_name || data.user?.user_metadata?.university || '',
        major: prev.major || data.user?.user_metadata?.major || '',
        track: prev.track || data.user?.user_metadata?.track || '',
      }))

      setCheckingSession(false)
    })
  }, [])

  async function handleSignOutAdmin() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsAdminSession(false)
    setAdminEmail('')
    setUserId(null)
    setUserRole(null)
    setForm({
      fullName: '',
      email: '',
      phone: '',
      university: '',
      major: '',
      track: '',
      gradYear: '',
      sopAgreed: true,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isAdminSession) return

    setErrorMsg(null)
    setLoading(true)
    const supabase = createClient()

    try {
      let activeUserId = userId

      // Jika pengunjung belum login, buat akun mentor baru terlebih dahulu
      if (!activeUserId) {
        if (!form.email.trim()) {
          setErrorMsg('Email wajib diisi untuk pembuatan akun mentor.')
          setLoading(false)
          return
        }
        if (password.length < 8) {
          setErrorMsg('Password minimal 8 karakter.')
          setLoading(false)
          return
        }

        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: form.email.trim(),
          password,
          options: {
            data: {
              full_name: form.fullName,
              university: form.university,
              major: form.major,
              track: form.track,
              role: 'mentor',
            },
          },
        })

        if (signUpErr) {
          setErrorMsg(signUpErr.message)
          setLoading(false)
          return
        }

        if (!signUpData.session || !signUpData.user) {
          setNeedsEmailConfirm(true)
          setSubmitted(true)
          setLoading(false)
          return
        }

        activeUserId = signUpData.user.id
        setUserId(activeUserId)
      }

      await supabase.from('profiles').update({
        full_name: form.fullName,
        school_name: form.university,
      }).eq('id', activeUserId)

      const { error: upsertErr } = await supabase.from('mentor_applications').upsert({
        user_id: activeUserId,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        university: form.university,
        major: form.major,
        track: form.track,
        grad_year: form.gradYear,
        status: 'pending',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

      if (upsertErr) {
        setErrorMsg('Gagal menyimpan pengajuan mentor: ' + upsertErr.message)
        setLoading(false)
        return
      }

      setSubmitted(true)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat mengirim formulir.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg-alt)', minHeight: '100vh' }}>
      {/* Public Top Navigation Bar (Isolated from Mentor/Admin Sidebar) */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="otwptn" width={120} height={36} className="h-8 w-auto" />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 uppercase tracking-wider">
              Rekrutmen Mentor
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {userRole === 'mentor' ? (
              <Link
                href="/mentor/dashboard"
                className="text-xs font-black text-amber-800 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-full transition-colors"
              >
                Dashboard Mentor
              </Link>
            ) : (
              <Link
                href="/mentor/auth"
                className="text-xs font-bold text-gray-700 hover:text-amber-700 px-3 py-2 rounded-full transition-colors"
              >
                Sudah jadi mentor? Login
              </Link>
            )}
            <Link
              href="/"
              className="text-xs font-bold text-gray-500 hover:text-gray-900 inline-flex items-center gap-1"
            >
              <ArrowLeft size={13} /> Beranda
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="p-7 rounded-3xl bg-white shadow-md space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 shadow-2xs">
            <ShieldCheck size={13} className="text-amber-600" /> Pendaftaran Resmi Mentor Alumni
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
            Daftar & Verifikasi LOA Mentor OTWPTN
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
            Lengkapi asal PTN, jurusan, jalur masuk yang kamu kuasai, serta bukti kelulusan (Letter of Acceptance) untuk diverifikasi tim supervisi akademik <strong>{LEGAL_ENTITY.name}</strong>.
          </p>
        </div>

        {checkingSession ? (
          <div className="p-10 rounded-3xl bg-white shadow-md flex items-center justify-center gap-2 text-xs font-bold text-gray-500">
            <Loader2 size={16} className="animate-spin text-amber-500" /> Memeriksa sesi...
          </div>
        ) : isAdminSession ? (
          <div className="p-8 rounded-3xl bg-white shadow-md border border-amber-200 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldAlert size={28} />
            </div>
            <h2 className="text-lg font-black text-gray-950">
              Sesi Admin/Superadmin Terdeteksi
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
              Saat ini browser kamu sedang login sebagai <strong>{adminEmail}</strong> (Superadmin/Admin). Demi keamanan, formulir pendaftaran mentor tidak menggunakan sesi admin. Silakan keluar terlebih dahulu untuk mendaftar sebagai mentor baru.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSignOutAdmin}
                className="btn-brand-primary px-6 py-3 rounded-full text-xs font-black shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <LogOut size={14} /> Keluar dari Akun Admin & Daftar Mentor
              </button>
              <Link
                href="/admin"
                className="px-6 py-3 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Kembali ke Panel Admin
              </Link>
            </div>
          </div>
        ) : submitted ? (
          <div className="p-8 rounded-3xl bg-white shadow-md text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-xl font-black text-gray-950">
              {needsEmailConfirm ? 'Cek Email untuk Konfirmasi Akun Mentor!' : 'Pengajuan Mentor Berhasil Dikirim!'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
              {needsEmailConfirm
                ? 'Akun mentor kamu telah dibuat. Silakan klik link verifikasi di inbox email kamu, lalu login di Portal Mentor untuk mengunggah dokumen LOA jika belum.'
                : `Tim supervisi akademik ${LEGAL_ENTITY.name} akan memeriksa keaslian bukti LOA dan profil jurusanmu dalam 1x24 jam kerja.`}
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              {userRole === 'mentor' ? (
                <Link
                  href="/mentor/dashboard"
                  className="btn-brand-primary px-7 py-3 rounded-full text-xs font-black shadow-md inline-block"
                >
                  Kembali ke Workspace Mentor
                </Link>
              ) : (
                <Link
                  href="/mentor/auth"
                  className="btn-brand-primary px-7 py-3 rounded-full text-xs font-black shadow-md inline-block"
                >
                  Masuk ke Portal Mentor
                </Link>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Akun Mentor Baru (hanya tampil jika belum login) */}
            {!userId && (
              <div className="p-7 rounded-3xl bg-white shadow-md space-y-4">
                <h2 className="text-base font-black text-gray-950 flex items-center gap-2">
                  <Mail size={18} className="text-amber-500" />
                  0. Buat Akun Login Mentor
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                  <div>
                    <label className="block mb-1.5">Email Aktif</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      required
                      placeholder="nama@alumni.ac.id"
                      className="w-full p-3 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-amber-400/40"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 flex items-center gap-1">
                      <Lock size={12} /> Password Akun (Min. 8 karakter)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Minimal 8 karakter"
                      className="w-full p-3 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-amber-400/40"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Card 1: Identitas, PTN, Jurusan & Jalur */}
            <div className="p-7 rounded-3xl bg-white shadow-md space-y-5">
              <h2 className="text-base font-black text-gray-950 flex items-center gap-2">
                <School size={18} className="text-amber-500" />
                1. Identitas, Asal PTN, Jurusan & Jalur Masuk
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                <div>
                  <label className="block mb-1.5">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    required
                    placeholder="Contoh: Muhammad Ihsan, S.T."
                    className="w-full p-3 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-amber-400/40"
                  />
                </div>

                <div>
                  <label className="block mb-1.5">Nomor WhatsApp Aktif</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    required
                    placeholder="08xxxxxxxxxx"
                    className="w-full p-3 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-amber-400/40"
                  />
                </div>

                <div>
                  <label className="block mb-1.5">Perguruan Tinggi Negeri (PTN)</label>
                  <input
                    type="text"
                    list="apply-ptn-options"
                    value={form.university}
                    onChange={e => setForm({ ...form, university: e.target.value })}
                    required
                    placeholder="Pilih atau ketik nama PTN..."
                    className="w-full p-3 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-amber-400/40"
                  />
                  <datalist id="apply-ptn-options">
                    {INDONESIA_PTN_LIST.map(p => (
                      <option key={p.shortName} value={p.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block mb-1.5">Program Studi / Jurusan</label>
                  <input
                    type="text"
                    list="apply-jurusan-options"
                    value={form.major}
                    onChange={e => setForm({ ...form, major: e.target.value })}
                    required
                    placeholder="Contoh: Ilmu Komputer / Kedokteran"
                    className="w-full p-3 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-amber-400/40"
                  />
                  <datalist id="apply-jurusan-options">
                    {INDONESIA_JURUSAN_LIST.map(j => (
                      <option key={j} value={j} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block mb-1.5">Jalur Kelulusan / Jalur yang Dikuasai</label>
                  <input
                    type="text"
                    list="jalur-options"
                    value={form.track}
                    onChange={e => setForm({ ...form, track: e.target.value })}
                    placeholder="Misal: PPKB UI, Talent Scouting UI, IUP UGM, SNBP"
                    required
                    className="w-full p-3 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-amber-400/40"
                  />
                  <datalist id="jalur-options">
                    {JALUR_LIST.map(j => (
                      <option key={j.id} value={j.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block mb-1.5">Tahun Masuk / Angkatan</label>
                  <input
                    type="text"
                    value={form.gradYear}
                    onChange={e => setForm({ ...form, gradYear: e.target.value })}
                    required
                    placeholder="Contoh: 2023"
                    className="w-full p-3 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-amber-400/40"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Upload Dokumen LOA & Portofolio */}
            <div className="p-7 rounded-3xl bg-white shadow-md space-y-5">
              <h2 className="text-base font-black text-gray-950 flex items-center gap-2">
                <Award size={18} className="text-amber-500" />
                2. Upload Bukti LOA & Portofolio Esai
              </h2>

              <div className="p-5 rounded-2xl bg-amber-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <FileText size={15} className="text-amber-600" />
                    Bukti Letter of Acceptance (LOA) / Bukti Kelulusan PTN <span className="text-rose-500">*Wajib</span>
                  </label>
                  {loaFile && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"><Check size={12} /> {loaFile.name}</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500">
                  Upload screenshot atau scan PDF pengumuman resmi penerimaan mahasiswa baru.
                </p>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={e => setLoaFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-amber-400 file:text-amber-950 hover:file:bg-amber-300"
                />
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                    <FileText size={15} className="text-gray-500" />
                    Draf Esai Motivasi / Motivation Letter Pribadi <span className="text-gray-400 font-medium">(Opsional)</span>
                  </label>
                  {essayFile && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"><Check size={12} /> {essayFile.name}</span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={e => setEssayFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-gray-200 file:text-gray-800 hover:file:bg-gray-300"
                />
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                    <Award size={15} className="text-gray-500" />
                    Sertifikat Prestasi / Kejuaraan <span className="text-gray-400 font-medium">(Opsional)</span>
                  </label>
                  {certFile && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"><Check size={12} /> {certFile.name}</span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,.zip"
                  onChange={e => setCertFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-gray-200 file:text-gray-800 hover:file:bg-gray-300"
                />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white shadow-md flex items-start gap-3">
              <input
                type="checkbox"
                id="sop"
                checked={form.sopAgreed}
                onChange={e => setForm({ ...form, sopAgreed: e.target.checked })}
                required
                className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
              />
              <label htmlFor="sop" className="text-xs font-semibold text-gray-700 leading-relaxed cursor-pointer">
                Saya menyetujui seluruh <Link href="/mentor/sop" className="text-amber-700 font-black underline">Standard Operating Procedure (SOP) Mentor Alumni</Link> di bawah naungan <strong>{LEGAL_ENTITY.name}</strong>, termasuk respon 1x24 jam, larangan joki, dan kewajiban pembuatan grup WhatsApp bertiga.
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-brand-primary px-8 py-3.5 rounded-full text-xs font-black shadow-md disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? 'Mengirim...' : 'Kirim Pendaftaran & Dokumen LOA'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
