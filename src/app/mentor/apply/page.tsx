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
  Upload,
  ExternalLink,
} from 'lucide-react'
import { LEGAL_ENTITY, JALUR_LIST } from '@/lib/constants'
import { INDONESIA_PTN_LIST, INDONESIA_JURUSAN_LIST } from '@/lib/indonesiaDirectory'

export default function MentorApplyPage() {
  const [loaFile, setLoaFile] = useState<File | null>(null)
  const [essayFile, setEssayFile] = useState<File | null>(null)
  const [certFile, setCertFile] = useState<File | null>(null)
  const [almetFile, setAlmetFile] = useState<File | null>(null)
  const [existingAlmetUrl, setExistingAlmetUrl] = useState('')
  const [existingLoaUrl, setExistingLoaUrl] = useState('')
  const [singleLoaFile, setSingleLoaFile] = useState<File | null>(null)
  const [uploadingLoa, setUploadingLoa] = useState(false)
  const [singleLoaMsg, setSingleLoaMsg] = useState<{ text: string; isError: boolean } | null>(null)
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
        setExistingAlmetUrl(app.almet_photo_url || '')
        setExistingLoaUrl(app.loa_url || '')
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

  async function uploadDoc(file: File, type: string): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', type)
    const res = await fetch('/api/mentor/upload', {
      method: 'POST',
      body: fd,
    })
    const data = await res.json()
    if (!res.ok || !data.url) {
      throw new Error(data.error || `Gagal mengunggah dokumen ${type}`)
    }
    return data.url
  }

  async function handleUploadSingleLoa() {
    if (!singleLoaFile || !userId) return
    setUploadingLoa(true)
    setSingleLoaMsg(null)
    try {
      const url = await uploadDoc(singleLoaFile, 'loa')
      const supabase = createClient()
      const { error } = await supabase
        .from('mentor_applications')
        .update({
          loa_url: url,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) {
        throw new Error('Gagal menyimpan ke database: ' + error.message)
      }

      setExistingLoaUrl(url)
      setSingleLoaFile(null)
      setSingleLoaMsg({ text: 'Dokumen LOA berhasil diunggah & disimpan!', isError: false })
    } catch (err: any) {
      setSingleLoaMsg({ text: err?.message || 'Gagal mengunggah dokumen LOA', isError: true })
    } finally {
      setUploadingLoa(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isAdminSession) return

    if (!almetFile && !existingAlmetUrl) {
      setErrorMsg('Foto formal memakai jaket almamater (almet) wajib diunggah sebagai bukti identitas alumni.')
      return
    }

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
          const alreadyRegistered = /already registered|already exists|user already registered/i.test(signUpErr.message)

          if (!alreadyRegistered) {
            setErrorMsg(signUpErr.message)
            setLoading(false)
            return
          }

          // Email ini sudah punya akun OtwPTN (misalnya dari pendaftaran member biasa).
          // Coba sambungkan ke akun yang sudah ada alih-alih gagal total, selama password yang
          // dimasukkan memang cocok dengan akun tersebut.
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
            email: form.email.trim(),
            password,
          })

          if (signInErr || !signInData.user) {
            setErrorMsg(
              'Email ini sudah terdaftar sebagai akun OtwPTN. Silakan login dulu lewat tombol "Sudah jadi mentor? Login" di atas (atau /login) dengan password akun kamu yang sudah ada, lalu kembali ke halaman ini untuk mengirim pengajuan mentor.'
            )
            setLoading(false)
            return
          }

          activeUserId = signInData.user.id
          setUserId(activeUserId)
        } else if (!signUpData.session || !signUpData.user) {
          setNeedsEmailConfirm(true)
          setSubmitted(true)
          setLoading(false)
          return
        } else {
          activeUserId = signUpData.user.id
          setUserId(activeUserId)
        }
      }

      await supabase.from('profiles').update({
        full_name: form.fullName,
        school_name: form.university,
      }).eq('id', activeUserId)

      // Upload berkas dokumen jika ada
      let loaUrl = ''
      let essayUrl = ''
      let certUrl = ''
      let almetUrl = existingAlmetUrl

      if (loaFile) {
        loaUrl = await uploadDoc(loaFile, 'loa')
        setExistingLoaUrl(loaUrl)
      }
      if (essayFile) {
        essayUrl = await uploadDoc(essayFile, 'essay')
      }
      if (certFile) {
        certUrl = await uploadDoc(certFile, 'cert')
      }
      if (almetFile) {
        almetUrl = await uploadDoc(almetFile, 'almet')
        setExistingAlmetUrl(almetUrl)
      }

      // Also saved on profiles (not just this one-time application row) so it stays
      // available for display/edit from the mentor dashboard after approval.
      if (almetUrl) {
        await supabase.from('profiles').update({ mentor_photo_url: almetUrl }).eq('id', activeUserId)
      }

      const { error: upsertErr } = await supabase.from('mentor_applications').upsert({
        user_id: activeUserId,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        university: form.university,
        major: form.major,
        track: form.track,
        grad_year: form.gradYear,
        loa_url: loaUrl || existingLoaUrl || undefined,
        essay_url: essayUrl || undefined,
        cert_url: certUrl || undefined,
        almet_photo_url: almetUrl || undefined,
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

        {/* Tahapan Pendaftaran */}
        <div className="p-7 rounded-3xl bg-amber-50/60 border border-amber-200/70 space-y-4">
          <h2 className="text-sm font-black text-gray-950 flex items-center gap-2">
            <FileText size={16} className="text-amber-600" /> Tahapan Pendaftaran Mentor
          </h2>
          <ol className="space-y-3">
            {[
              { title: 'Buat / login akun', desc: 'Isi email dan password. Kalau email kamu sudah terdaftar sebagai member biasa, pengajuan mentor otomatis ditempelkan ke akun itu juga, tanpa perlu akun baru.' },
              { title: 'Isi data diri & jurusan', desc: 'Nama lengkap, nomor WhatsApp aktif, asal kampus, jurusan, jalur masuk yang kamu kuasai (SNBP/PPKB/dll), dan tahun lulus.' },
              { title: 'Upload bukti LOA & portofolio', desc: 'Bukti Letter of Acceptance (LOA) / bukti kelulusan PTN wajib diunggah, ditambah contoh esai atau sertifikat prestasi sebagai portofolio pendukung.' },
              { title: 'Kirim & verifikasi email', desc: 'Setelah submit, cek inbox email untuk klik link konfirmasi akun (jika akun baru dibuat).' },
              { title: 'Ditinjau tim supervisi akademik', desc: `Tim ${LEGAL_ENTITY.name} memverifikasi keaslian LOA dan kesesuaian jurusan dalam 1x24 jam kerja.` },
              { title: 'Disetujui → akses Portal Mentor', desc: 'Begitu disetujui, role akun otomatis berubah jadi Mentor. Wajib baca dan setujui SOP Mentor sebelum menerima mentee pertama.' },
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center flex-shrink-0 text-xs font-black">
                  {i}
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
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
          <div className="space-y-6">
            <div className="p-8 rounded-3xl bg-white shadow-md text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-xl font-black text-gray-950">
                {needsEmailConfirm ? 'Cek Email untuk Konfirmasi Akun Mentor!' : 'Pengajuan Mentor Sedang Ditinjau'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
                {needsEmailConfirm
                  ? 'Akun mentor kamu telah dibuat. Silakan klik link verifikasi di inbox email kamu, lalu login di Portal Mentor untuk mengunggah dokumen LOA jika belum.'
                  : `Tim supervisi akademik ${LEGAL_ENTITY.name} akan memeriksa keaslian bukti LOA dan profil jurusanmu dalam 1x24 jam kerja.`}
              </p>

              {/* Ringkasan Profil */}
              <div className="p-4 rounded-2xl bg-gray-50 text-left max-w-lg mx-auto text-xs space-y-2 border border-gray-100">
                <div className="flex justify-between items-center text-gray-500">
                  <span>Nama Lengkap:</span>
                  <strong className="text-gray-900 font-bold">{form.fullName || 'Calon Mentor'}</strong>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span>Perguruan Tinggi:</span>
                  <strong className="text-gray-900 font-bold">{form.university || '-'}</strong>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span>Program Studi:</span>
                  <strong className="text-gray-900 font-bold">{form.major || '-'}</strong>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span>Jalur Penerimaan:</span>
                  <strong className="text-amber-800 font-bold">{form.track || '-'}</strong>
                </div>
              </div>

              {/* Card Status LOA & Upload Form */}
              <div className={`p-5 rounded-2xl text-left max-w-lg mx-auto border ${
                existingLoaUrl ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/80 border-amber-300'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    existingLoaUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-200 text-amber-800'
                  }`}>
                    {existingLoaUrl ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-black text-gray-950">
                      {existingLoaUrl ? 'Dokumen LOA Resmi Tersimpan' : 'Unggah Dokumen Letter of Acceptance (LOA)'}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-600 mt-1 leading-relaxed">
                      {existingLoaUrl
                        ? 'Dokumen LOA kamu sudah berhasil diunggah ke sistem OtwPTN. Kamu tetap dapat mengganti file jika ingin memperbarui berkas kelulusan.'
                        : 'Bukti Letter of Acceptance (LOA) atau Pengumuman Resmi Kelulusan Kampus wajib diunggah agar tim kurasi dapat memverifikasi profilmu.'}
                    </p>

                    {existingLoaUrl && (
                      <div className="mt-3">
                        <a
                          href={existingLoaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          <ExternalLink size={14} /> Buka / Cek File LOA
                        </a>
                      </div>
                    )}

                    <div className="mt-4 pt-3.5 border-t border-gray-200/60 space-y-2">
                      <label className="block text-[11px] font-bold text-gray-700">
                        {existingLoaUrl ? 'Perbarui / Ganti File LOA (PDF / JPG / PNG, maks 10MB):' : 'Pilih File Dokumen LOA (PDF / JPG / PNG, maks 10MB):'}
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={e => setSingleLoaFile(e.target.files?.[0] || null)}
                          className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-amber-950 hover:file:bg-amber-300"
                        />
                        <button
                          type="button"
                          onClick={handleUploadSingleLoa}
                          disabled={!singleLoaFile || uploadingLoa}
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-amber-950 text-xs font-black shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0"
                        >
                          {uploadingLoa ? (
                            <>
                              <Loader2 size={14} className="animate-spin" /> Mengunggah...
                            </>
                          ) : (
                            <>
                              <Upload size={14} /> Upload LOA
                            </>
                          )}
                        </button>
                      </div>
                      {singleLoaMsg && (
                        <p className={`text-xs font-bold pt-1 ${singleLoaMsg.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {singleLoaMsg.text}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

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
                2. Upload Foto Almet, Bukti LOA & Portofolio Esai
              </h2>

              <div className="p-5 rounded-2xl bg-amber-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <School size={15} className="text-amber-600" />
                    Foto Formal Memakai Jaket Almamater (Almet) <span className="text-rose-500">*Wajib</span>
                  </label>
                  {(almetFile || existingAlmetUrl) && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"><Check size={12} /> {almetFile?.name || 'Sudah diunggah'}</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500">
                  Foto setengah badan memakai jaket almamater kampusmu, wajah terlihat jelas - jadi bukti identitas alumni yang tampil di profil mentor.
                </p>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={e => setAlmetFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-amber-400 file:text-amber-950 hover:file:bg-amber-300"
                />
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <FileText size={15} className="text-amber-600" />
                    Bukti Letter of Acceptance (LOA) / Bukti Kelulusan PTN <span className="text-rose-500">*Wajib</span>
                  </label>
                  {(loaFile || existingLoaUrl) && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"><Check size={12} /> {loaFile?.name || 'Sudah diunggah'}</span>
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
