'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  User,
  GraduationCap,
  Lock,
  Sparkles,
  Camera,
  ShieldCheck,
  Save,
  DollarSign,
  MapPin,
  TrendingUp,
  Award,
  Globe2,
  Share2,
  Copy,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Edit3,
  Building,
  Loader2,
  BookOpen,
} from 'lucide-react'
import FeatureHeader from '@/components/dashboard/FeatureHeader'
import SearchablePicker from '@/components/ui/SearchablePicker'
import {
  INDONESIA_PTN_LIST,
  INDONESIA_JURUSAN_LIST,
  TOP_SCHOOLS_LIST,
  PROVINSI_INDONESIA_LIST,
} from '@/lib/indonesiaDirectory'

export const OTBEE_AVATARS = [
  { id: 'av-1', src: '/avatars/avatar-1.png', label: 'Pejuang PTN' },
  { id: 'av-2', src: '/avatars/avatar-2.png', label: 'Calon Wisudawan' },
  { id: 'av-3', src: '/avatars/avatar-3.png', label: 'Petualang' },
  { id: 'av-4', src: '/avatars/avatar-4.png', label: 'Anak Komputer' },
  { id: 'av-5', src: '/avatars/avatar-5.png', label: 'Chill Guy' },
  { id: 'av-6', src: '/avatars/avatar-6.png', label: 'Holiday' },
  { id: 'av-7', src: '/avatars/avatar-7.png', label: 'Calon Peneliti' },
  { id: 'av-8', src: '/avatars/avatar-8.png', label: 'Memasak PTN' },
  { id: 'av-9', src: '/avatars/avatar-9.png', label: 'Anak Seni' },
  { id: 'av-10', src: '/avatars/avatar-10.png', label: 'Pembisnis' },
  { id: 'av-11', src: '/avatars/avatar-11.png', label: 'Calon Profesor' },
  { id: 'av-12', src: '/avatars/avatar-12.png', label: 'Anak Politik' },
  { id: 'av-13', src: '/avatars/avatar-13.png', label: 'Anak UI' },
  { id: 'av-14', src: '/avatars/avatar-14.png', label: 'Anak UGM' },
  { id: 'av-15', src: '/avatars/avatar-15.png', label: 'Anak ITB' },
  { id: 'av-16', src: '/avatars/avatar-16.png', label: 'Anak UNPAD' },
  { id: 'av-17', src: '/avatars/avatar-17.png', label: 'Anak UNDIP' },
  { id: 'av-18', src: '/avatars/avatar-18.png', label: 'Anak UNAIR' },
]

export default function ProfilPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [avatarToast, setAvatarToast] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'biodata' | 'target' | 'avatar' | 'security'>('biodata')

  // Edit target modal
  const [isEditingTarget, setIsEditingTarget] = useState(false)
  const [copiedShareText, setCopiedShareText] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    school: '',
    email: '',
    eligible_rank: '',
    province: '',
    target_ptn_1: '',
    target_prodi_1: '',
    target_ptn_2: '',
    target_prodi_2: '',
    avatar: '/avatars/avatar-1.png',
  })

  // Password update states
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Dynamic AI Campus Insight states
  const [campusInsight, setCampusInsight] = useState<any>(null)
  const [insightLoading, setInsightLoading] = useState(false)

  const ptnOptions = useMemo(() => {
    return INDONESIA_PTN_LIST.map(p => ({
      label: `${p.name} (${p.shortName})`,
      value: p.name,
      sub: `${p.city}, ${p.province}`,
    }))
  }, [])

  const jurusanOptions = useMemo(() => {
    return INDONESIA_JURUSAN_LIST.map(j => ({
      label: j,
      value: j,
    }))
  }, [])

  const schoolOptions = useMemo(() => {
    return TOP_SCHOOLS_LIST.map(s => ({
      label: `${s.name} (${s.kota})`,
      value: s.name,
      sub: `Peringkat #${s.rank} Nasional · ${s.prov}`,
    }))
  }, [])

  const provinsiOptions = useMemo(() => {
    return PROVINSI_INDONESIA_LIST.map(p => ({
      label: p,
      value: p,
    }))
  }, [])

  const fetchCampusInsight = async (ptn: string, prodi: string) => {
    if (!ptn || !prodi) return
    setInsightLoading(true)
    try {
      const res = await fetch(
        `/api/campus-insight?ptn=${encodeURIComponent(ptn)}&jurusan=${encodeURIComponent(prodi)}`
      )
      if (res.ok) {
        const json = await res.json()
        if (json.data) {
          setCampusInsight(json.data)
        }
      }
    } catch (e) {
      console.error('Failed to load campus insight:', e)
    } finally {
      setInsightLoading(false)
    }
  }

  const handleSaveTarget = async () => {
    setIsEditingTarget(false)
    if (form.target_ptn_1 && form.target_prodi_1) {
      fetchCampusInsight(form.target_ptn_1, form.target_prodi_1)
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({
            target_ptns: [form.target_ptn_1, form.target_ptn_2].filter(Boolean),
            target_majors: [form.target_prodi_1, form.target_prodi_2].filter(Boolean),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
      }
    } catch (err) {
      console.warn('Failed saving target ptn to db:', err)
    }
  }

  useEffect(() => {
    // Read local stored avatar first
    try {
      const storedAvatar = localStorage.getItem('otwptn_user_avatar')
      if (storedAvatar) {
        setForm(prev => ({ ...prev, avatar: storedAvatar }))
      }
    } catch {}

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
        return
      }
      supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          if (profile) {
            const targetPtns = (profile.target_ptns as string[]) || []
            const targetMajors = (profile.target_majors as string[]) || []
            setForm(prev => {
              const finalAvatar = profile.avatar_url || prev.avatar
              if (profile.avatar_url) {
                try {
                  localStorage.setItem('otwptn_user_avatar', profile.avatar_url)
                } catch {}
              }
              return {
                ...prev,
                full_name: profile.full_name || data.user.user_metadata?.full_name || '',
                phone: profile.phone || '',
                school: profile.school || profile.school_name || '',
                email: data.user.email || profile.email || '',
                eligible_rank: profile.school_rank_tier || '',
                province: profile.province || '',
                target_ptn_1: targetPtns[0] || '',
                target_prodi_1: targetMajors[0] || '',
                target_ptn_2: targetPtns[1] || '',
                target_prodi_2: targetMajors[1] || '',
                avatar: finalAvatar,
              }
            })
            if (targetPtns[0] && targetMajors[0]) {
              fetchCampusInsight(targetPtns[0], targetMajors[0])
            }
          }
          setLoading(false)
        })
    })
  }, [supabase, router])

  const handleSelectAvatar = async (avatarSrc: string) => {
    setForm(prev => ({ ...prev, avatar: avatarSrc }))
    try {
      localStorage.setItem('otwptn_user_avatar', avatarSrc)
      window.dispatchEvent(new CustomEvent('otwptn_avatar_update', { detail: avatarSrc }))
    } catch {}

    setAvatarToast(true)
    setTimeout(() => setAvatarToast(false), 2500)

    // Save to database in background
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({
            avatar_url: avatarSrc,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
      }
    } catch (e) {
      console.error('Failed to sync avatar to database', e)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      localStorage.setItem('otwptn_user_avatar', form.avatar)
      window.dispatchEvent(new CustomEvent('otwptn_avatar_update', { detail: form.avatar }))
    } catch {}

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      return
    }

    const { error: err } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone,
        school: form.school,
        school_name: form.school,
        avatar_url: form.avatar,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (err) {
      setError('Gagal menyimpan perubahan ke server. Namun avatar dan profil lokalmu sudah tersimpan.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }


  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      alert('Password minimal 6 karakter.')
      return
    }
    setPasswordLoading(true)
    const { error: pErr } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordLoading(false)
    if (pErr) {
      alert('Gagal update password: ' + pErr.message)
    } else {
      setPasswordSaved(true)
      setNewPassword('')
      setTimeout(() => setPasswordSaved(false), 3000)
    }
  }

  const shareTextContent = `Target Kuliah Impianku di UI!
Jurusan: Kecerdasan Artifisial, Universitas Indonesia
"Wujudkan Mimpi Jadi Ahli AI di Kampus Perjuangan: Menuju Masa Depan Cerah Bersama UI!"

#UniversitasIndonesia #KecerdasanArtifisial #AIIndonesia #PejuangPTN2026 #FasilkomUI #InfoKuliah #SNBT #SIMAKUI`

  function handleCopyShareText() {
    navigator.clipboard.writeText(shareTextContent)
    setCopiedShareText(true)
    setTimeout(() => setCopiedShareText(false), 2000)
  }

  if (loading) {
    return (
      <div className="w-full px-6 md:px-8 py-16 text-center">
        <p className="text-xs text-gray-400">Memuat data profil...</p>
      </div>
    )
  }

  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10 space-y-8">
      <FeatureHeader
        title="Pengaturan Akun & Profil"
        subtitle="Kelola identitas diri, asal sekolah, target PTN pilihan, dan preferensi keamanan akunmu."
        mascot="/fitur/kalkulator-peluang.png"
        badgeText="Account Settings"
      />

      {/* Profile Header Banner Card (Full Width) */}
      <div className="p-6 md:p-8 rounded-3xl bg-white shadow-md flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group cursor-pointer flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={form.avatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover shadow-sm bg-amber-100 p-1"
          />
          <button
            onClick={() => setActiveTab('avatar')}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          >
            <Camera size={13} />
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-lg font-black text-gray-900 truncate">
              {form.full_name || 'Pejuang PTN'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-900 flex items-center gap-1">
              <ShieldCheck size={12} className="text-amber-700" /> Siswa Aktif
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            {form.school || 'Belum mengisi sekolah'} · {form.email}
          </p>
          <p className="text-[11px] text-amber-800 font-bold mt-1">
            🎯 Target: {form.target_ptn_1} ({form.target_prodi_1})
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-brand-primary px-6 py-2.5 rounded-full text-xs font-black shadow-xs flex items-center gap-2 self-center sm:self-end"
        >
          <Save size={14} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          Perubahan profil berhasil disimpan!
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-900 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Sub-menu Tabs (Full Width) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {[
          { id: 'biodata', label: 'Data Diri & Sekolah', icon: User },
          { id: 'target', label: 'Target PTN & Jurusan (Dossier Karir)', icon: GraduationCap },
          { id: 'avatar', label: 'Pilih Maskot Otbee', icon: Sparkles },
          { id: 'security', label: 'Keamanan & Password', icon: Lock },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'btn-brand-primary shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-2xs'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: DATA DIRI & SEKOLAH */}
      {activeTab === 'biodata' && (
        <div className="p-6 md:p-8 rounded-3xl bg-white shadow-md space-y-6">
          <h3 className="text-sm font-black text-gray-900 pb-3 border-b border-gray-100">
            Informasi Pribadi & Riwayat Sekolah
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Nama Lengkap</label>
              <input
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Nomor WhatsApp</label>
              <input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="081234567890"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <SearchablePicker
                label="Asal Sekolah SMA / MA / SMK"
                placeholder="Cari atau pilih nama sekolah..."
                value={form.school}
                onChange={v => {
                  const matched = TOP_SCHOOLS_LIST.find(s => s.name.toLowerCase() === v.toLowerCase())
                  setForm(prev => ({
                    ...prev,
                    school: v,
                    province: matched ? matched.prov : prev.province,
                  }))
                }}
                options={schoolOptions}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Email Terdaftar</label>
              <input
                value={form.email}
                disabled
                className="w-full px-4 py-2.5 rounded-2xl bg-gray-100 text-xs font-semibold text-gray-500 outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <SearchablePicker
                label="Provinsi Sekolah"
                placeholder="Pilih provinsi sekolah..."
                value={form.province}
                onChange={v => setForm({ ...form, province: v })}
                options={provinsiOptions}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Peringkat Eligible Sekolah</label>
              <input
                value={form.eligible_rank}
                onChange={e => setForm({ ...form, eligible_rank: e.target.value })}
                placeholder="Misal: Peringkat 3 dari 120 siswa"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TARGET PTN & JURUSAN PILIHAN (FITUR DOSSIER KARIR AI LENGKAP PERSIS PERMINTAAN USER) */}
      {activeTab === 'target' && (
        <div className="space-y-6">
          {/* Target Kuliah Card Header */}
          <div className="p-6 md:p-8 rounded-3xl bg-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-lg font-black shadow-xs flex-shrink-0 uppercase">
                {form.target_ptn_1 ? form.target_ptn_1.substring(0, 3) : 'PTN'}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  Target Kuliah Utama
                </span>
                <h3 className="text-lg font-black text-gray-950 mt-1">
                  {form.target_ptn_1 || 'Pilih PTN Impianmu'}
                </h3>
                <p className="text-xs font-bold text-amber-700">
                  {form.target_prodi_1 || 'Pilih Program Studi'}
                </p>
                {form.target_ptn_2 && (
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    Pilihan 2: {form.target_prodi_2 ? `${form.target_prodi_2} - ` : ''}{form.target_ptn_2}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Ubah Target (Dropdown Pilihan Lengkap Seluruh PTN & Jurusan) */}
          <div className="p-6 md:p-8 rounded-3xl bg-amber-50/70 border border-amber-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200/60">
              <div>
                <h4 className="text-sm md:text-base font-black text-gray-900 flex items-center gap-2">
                  <GraduationCap size={18} className="text-amber-600" />
                  Pilih Universitas & Jurusan PTN Impian
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Pilih dari direktori lengkap 85+ PTN dan 120+ Program Studi di seluruh Indonesia.
                </p>
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full self-start sm:self-auto">
                ⚡ Otomatis Memperbarui AI Insight
              </span>
            </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <SearchablePicker
                    label="Pilihan PTN Utama (Wajib)"
                    placeholder="Ketik atau pilih PTN 1 (contoh: UI, ITB, UGM)..."
                    value={form.target_ptn_1}
                    onChange={v => {
                      const updated = { ...form, target_ptn_1: v }
                      setForm(updated)
                      if (v && updated.target_prodi_1) {
                        fetchCampusInsight(v, updated.target_prodi_1)
                      }
                    }}
                    options={ptnOptions}
                  />
                </div>
                <div>
                  <SearchablePicker
                    label="Program Studi Pilihan 1 (Wajib)"
                    placeholder="Ketik atau pilih Jurusan 1 (contoh: Kedokteran, Ilmu Komputer)..."
                    value={form.target_prodi_1}
                    onChange={v => {
                      const updated = { ...form, target_prodi_1: v }
                      setForm(updated)
                      if (updated.target_ptn_1 && v) {
                        fetchCampusInsight(updated.target_ptn_1, v)
                      }
                    }}
                    options={jurusanOptions}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <SearchablePicker
                    label="Pilihan PTN Cadangan (Pilihan 2)"
                    placeholder="Pilih PTN pilihan 2..."
                    value={form.target_ptn_2}
                    onChange={v => setForm({ ...form, target_ptn_2: v })}
                    options={ptnOptions}
                  />
                </div>
                <div>
                  <SearchablePicker
                    label="Program Studi Cadangan (Pilihan 2)"
                    placeholder="Pilih Jurusan pilihan 2..."
                    value={form.target_prodi_2}
                    onChange={v => setForm({ ...form, target_prodi_2: v })}
                    options={jurusanOptions}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveTarget}
                  className="btn-brand-primary px-6 py-2.5 rounded-full text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Simpan Target & Perbarui AI Insight
                </button>
              </div>
            </div>

          {/* Loading Skeleton during AI Insight fetch */}
          {insightLoading ? (
            <div className="p-10 rounded-3xl bg-white shadow-md text-center space-y-3">
              <Loader2 size={32} className="animate-spin text-amber-500 mx-auto" />
              <h4 className="text-sm font-black text-gray-900">
                Menghubungkan ke Database & Menghitung Insight AI...
              </h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Menganalisis perkiraan gaji, lingkungan kampus, biaya hidup, dan prospek karir untuk {form.target_prodi_1} di {form.target_ptn_1}.
              </p>
            </div>
          ) : (
            <>
              {/* DOSSIER HERO BANNER */}
              <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-950 shadow-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-black/10 px-3 py-1 rounded-full inline-block">
                    Insight Karir & Lingkungan Kampus AI
                  </span>
                  <span className="text-[10px] font-bold bg-white/50 px-2.5 py-0.5 rounded-full text-amber-950">
                    Terkoneksi Database
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight leading-snug">
                  {campusInsight?.headline ||
                    `Wujudkan Mimpi Jadi Profesional Unggul Bersama ${form.target_ptn_1 || 'PTN Impian'}!`}
                </h2>
                <p className="text-xs md:text-sm font-bold opacity-90 uppercase">
                  {form.target_prodi_1 || 'Program Studi'}, {form.target_ptn_1 || 'Universitas Negeri'}
                </p>
              </div>

              {/* 5 STRUCTURED INSIGHT SECTIONS */}
              <div className="space-y-6">
                {/* 1. PERKIRAAN GAJI ALUMNI */}
                <div className="p-7 rounded-3xl bg-white shadow-md space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <span className="w-8 h-8 rounded-2xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-base font-black text-gray-950">
                      Perkiraan Gaji Alumni & Peluang Pasar
                    </h3>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    {campusInsight?.gaji?.deskripsi ||
                      `Lulusan ${form.target_prodi_1} dari ${form.target_ptn_1} memiliki nilai tawar yang kuat di dunia industri modern dengan daya saing tinggi.`}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    <div className="p-4 rounded-2xl bg-gray-50/80 space-y-1">
                      <p className="text-xs font-bold text-gray-700">Fresh Graduate (Tahun 1-2)</p>
                      <p className="text-sm font-black text-emerald-700 font-mono">
                        {campusInsight?.gaji?.fresh_grad || 'Rp 7.000.000 - Rp 14.000.000 / bulan'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50/80 space-y-1">
                      <p className="text-xs font-bold text-gray-700">Mid-Career (3-5 tahun)</p>
                      <p className="text-sm font-black text-amber-800 font-mono">
                        {campusInsight?.gaji?.mid_career || 'Rp 18.000.000 - Rp 35.000.000 / bulan'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50/80 space-y-1">
                      <p className="text-xs font-bold text-gray-700">Senior (5+ tahun / Lead)</p>
                      <p className="text-sm font-black text-rose-700 font-mono">
                        {campusInsight?.gaji?.senior || 'Rp 40.000.000 - Rp 80.000.000+ / bulan'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. KONDISI DAERAH KAMPUS */}
                <div className="p-7 rounded-3xl bg-white shadow-md space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <span className="w-8 h-8 rounded-2xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-base font-black text-gray-950">
                      Kondisi Daerah & Fasilitas Kampus
                    </h3>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    {campusInsight?.lingkungan?.deskripsi ||
                      `Kampus ${form.target_ptn_1} menawarkan atmosfer akademik yang kondusif dengan fasilitas riset dan kegiatan mahasiswa lengkap.`}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                    <div className="p-4 rounded-2xl bg-gray-50 space-y-1">
                      <span className="font-black text-gray-900 block">📍 Lokasi & Hunian Mahasiswa</span>
                      <p className="text-gray-600 leading-relaxed font-medium">
                        {campusInsight?.lingkungan?.lokasi || `Area kampus ${form.target_ptn_1} dengan lingkungan kos mahasiswa terjangkau.`}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 space-y-1">
                      <span className="font-black text-gray-900 block">🚆 Transportasi</span>
                      <p className="text-gray-600 leading-relaxed font-medium">
                        {campusInsight?.lingkungan?.transportasi || 'Akses mudah dengan transportasi umum lokal dan shuttle transportasi kampus.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 space-y-1">
                      <span className="font-black text-gray-900 block">🏛️ Fasilitas Utama</span>
                      <p className="text-gray-600 leading-relaxed font-medium">
                        {campusInsight?.lingkungan?.fasilitas || 'Perpustakaan digital, laboratorium komputasi terpadu, dan fasilitas olahraga.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 space-y-1">
                      <span className="font-black text-gray-900 block">🌳 Suasana & Kultur Belajar</span>
                      <p className="text-gray-600 leading-relaxed font-medium">
                        {campusInsight?.lingkungan?.suasana || 'Ekosistem belajar kolaboratif dengan ragam komunitas dan organisasi keilmuan aktif.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. JALUR MASUK & BIAYA */}
                <div className="p-7 rounded-3xl bg-white shadow-md space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <span className="w-8 h-8 rounded-2xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-base font-black text-gray-950">
                      Jalur Masuk, UKT & Biaya Hidup
                    </h3>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    {campusInsight?.jalur_dan_biaya?.deskripsi ||
                      `Penerimaan mahasiswa baru di ${form.target_ptn_1} dibuka melalui SNBP, SNBT, dan Jalur Mandiri.`}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
                    <div className="p-4 rounded-2xl bg-gray-50 space-y-1.5">
                      <span className="font-black text-gray-900 block">SNBP & SNBT (Nasional)</span>
                      <p className="text-emerald-700 font-black font-mono">
                        {campusInsight?.jalur_dan_biaya?.snbp_snbt || 'Rp 500.000 - Rp 15.000.000 / semester'}
                      </p>
                      <p className="text-gray-500 font-medium">Berdasarkan kelompok UKT berkeadilan tanpa uang pangkal.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 space-y-1.5">
                      <span className="font-black text-gray-900 block">Jalur Mandiri</span>
                      <p className="text-amber-800 font-black font-mono">
                        {campusInsight?.jalur_dan_biaya?.mandiri || 'UKT Kelompok Atas + IPI (Iuran Pengembangan Institusi)'}
                      </p>
                      <p className="text-gray-500 font-medium">Seleksi mandiri berbasis ujian tulis atau portofolio nilai rapor.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 space-y-1.5">
                      <span className="font-black text-gray-900 block">Biaya Hidup Bulanan</span>
                      <p className="text-gray-900 font-black font-mono">
                        {campusInsight?.jalur_dan_biaya?.biaya_hidup || 'Rp 2.000.000 - Rp 3.800.000 / bulan'}
                      </p>
                      <p className="text-gray-500 font-medium">(Estimasi kos, konsumsi harian, dan transport di kota kampus).</p>
                    </div>
                  </div>
                </div>

                {/* 4. PROSPEK KARIR & ALUMNI */}
                <div className="p-7 rounded-3xl bg-white shadow-md space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <span className="w-8 h-8 rounded-2xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center">
                      4
                    </span>
                    <h3 className="text-base font-black text-gray-950">
                      Prospek Karir & Jaringan Alumni
                    </h3>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    {campusInsight?.alumni_dan_prospek?.deskripsi ||
                      `Jaringan alumni ${form.target_ptn_1} tersebar luas di berbagai sektor industri nasional dan multinasional.`}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="p-4 rounded-2xl bg-gray-50 space-y-2">
                      <h5 className="text-xs font-black text-gray-900">Profesi Lulusan Populer</h5>
                      <ul className="text-xs text-gray-700 space-y-1 font-medium list-disc list-inside">
                        {(campusInsight?.alumni_dan_prospek?.profesi_populer || [
                          `Spesialis ${form.target_prodi_1}`,
                          'Konsultan Profesional & Peneliti',
                          'Manajer Operasional / Project Leader',
                          'Technopreneur / Pengusaha Industri',
                        ]).map((prof: string, pi: number) => (
                          <li key={pi} className="truncate">{prof}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 space-y-2">
                      <h5 className="text-xs font-black text-gray-900">Sektor Industri Penyerap</h5>
                      <ul className="text-xs text-gray-700 space-y-1 font-medium list-disc list-inside">
                        {(campusInsight?.alumni_dan_prospek?.alumni_tokoh || [
                          'Perusahaan Multinasional & BUMN',
                          'Instansi Pemerintah & Kementerian',
                          'Perusahaan Teknologi & R&D',
                        ]).map((sec: string, si: number) => (
                          <li key={si} className="truncate">{sec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 5. TIPS LOLOS SELEKSI & STRATEGI KHUSUS */}
                <div className="p-7 rounded-3xl bg-white shadow-md space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <span className="w-8 h-8 rounded-2xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center">
                      5
                    </span>
                    <h3 className="text-base font-black text-gray-950">
                      Tips Lolos & Strategi Khusus Seleksi
                    </h3>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    {campusInsight?.tips_lolos?.deskripsi ||
                      `Pastikan nilai rapor mata pelajaran pendukung linear menunjukkan tren meningkat dan lengkapi esai motivasi personal yang autentik.`}
                  </p>

                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-950 font-medium leading-relaxed">
                    <p className="font-bold text-amber-900 mb-1">💡 Strategi Rekomendasi Konsultan OTWPTN:</p>
                    {campusInsight?.tips_lolos?.strategi_khusus ||
                      `Gunakan fitur Kalkulator Peluang dan Essay AI Review di platform OTWPTN untuk memverifikasi kesiapan berkas sebelum pendaftaran dibuka.`}
                  </div>
                </div>

                {/* BAGIKAN KE TEMAN */}
                <div className="p-7 rounded-3xl bg-white shadow-md space-y-4">
                  <h4 className="text-xs font-black text-gray-900">Bagikan Impian Target Kuliahmu</h4>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Target Kuliah Impianku di ${form.target_ptn_1}!\nJurusan: ${form.target_prodi_1}\n"${campusInsight?.headline || 'Menuju Kampus Impian Bersama OTWPTN'}"\n\n#PejuangPTN2026 #OTWPTN`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-full text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>

                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `Target Kuliah Impianku di ${form.target_ptn_1}! Jurusan: ${form.target_prodi_1} #PejuangPTN2026 #OTWPTN`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-full text-xs font-black bg-black hover:bg-gray-800 text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Globe2 size={14} /> X (Twitter)
                    </a>

                    <button
                      onClick={handleCopyShareText}
                      className="px-5 py-2.5 rounded-full text-xs font-black bg-gray-100 hover:bg-gray-200 text-gray-900 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy size={14} /> {copiedShareText ? 'Teks Tersalin!' : 'Salin teks'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: PILIH MASKOT OTBEE */}
      {activeTab === 'avatar' && (
        <div className="p-6 md:p-8 rounded-3xl bg-white shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-gray-900">Pilih Avatar Maskot Otbee (18 Pilihan HD)</h3>
              <p className="text-xs text-gray-500 mt-1">
                Klik avatar pilihanmu. Avatar langsung tersimpan dan otomatis tampil di profil bar, sidebar, dan room belajar.
              </p>
            </div>
            {avatarToast && (
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center gap-1.5 animate-in fade-in self-start sm:self-auto">
                <CheckCircle2 size={14} className="text-emerald-600" /> Avatar Aktif Diperbarui!
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
            {OTBEE_AVATARS.map(av => (
              <div
                key={av.id}
                onClick={() => handleSelectAvatar(av.src)}
                className={`p-3.5 rounded-3xl cursor-pointer flex flex-col items-center text-center space-y-2 transition-all ${
                  form.avatar === av.src
                    ? 'bg-amber-100/70 border-2 border-amber-500 shadow-md scale-102'
                    : 'bg-gray-50 hover:bg-gray-100/90 border-2 border-transparent hover:scale-101'
                }`}
              >
                <div className="w-18 h-18 rounded-2xl bg-amber-50/60 p-1 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={av.src}
                    alt={av.label}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[11px] font-black text-gray-800 line-clamp-1">{av.label}</span>
                {form.avatar === av.src ? (
                  <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    ✓ Terpilih
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-gray-400">
                    Pilih
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: KEAMANAN & PASSWORD */}
      {activeTab === 'security' && (
        <div className="p-6 md:p-8 rounded-3xl bg-white shadow-md space-y-6">
          <h3 className="text-sm font-black text-gray-900 pb-3 border-b border-gray-100">
            Perbarui Kata Sandi Akun
          </h3>

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Kata Sandi Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {passwordSaved && (
              <p className="text-xs text-emerald-600 font-bold">Password berhasil diperbarui!</p>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-brand-primary px-6 py-2.5 rounded-full text-xs font-black shadow-xs"
            >
              {passwordLoading ? 'Menyimpan...' : 'Perbarui Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
