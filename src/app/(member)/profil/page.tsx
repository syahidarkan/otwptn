'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import FeatureHeader from '@/components/dashboard/FeatureHeader'

const OTBEE_AVATARS = [
  { id: 'av-1', src: '/maskot-fitur-kalkulator-peluang.png', label: 'Otbee Kacamata Pintar' },
  { id: 'av-2', src: '/mascot/check-paper-happy.png', label: 'Otbee Cek Essay' },
  { id: 'av-3', src: '/mascot/headset-wave.png', label: 'Otbee Headset Study' },
  { id: 'av-4', src: '/mascot/thinking-idea.png', label: 'Otbee Ide Juara' },
]

export default function ProfilPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
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
    eligible_rank: '3',
    province: 'DKI Jakarta',
    target_ptn_1: 'Universitas Indonesia',
    target_prodi_1: 'Kecerdasan Artifisial',
    target_ptn_2: 'Institut Teknologi Bandung',
    target_prodi_2: 'STEI-R Komputasi',
    avatar: '/maskot-fitur-kalkulator-peluang.png',
  })

  // Password update states
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
        return
      }
      supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            setForm(prev => ({
              ...prev,
              full_name: profile.full_name ?? '',
              phone: profile.phone ?? '',
              school: profile.school ?? profile.school_name ?? '',
              email: data.user.email ?? profile.email ?? '',
            }))
          }
          setLoading(false)
        })
    })
  }, [supabase, router])

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error: err } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone,
        school: form.school,
        school_name: form.school,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (err) {
      setError('Gagal menyimpan perubahan. Coba beberapa saat lagi.')
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
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Asal Sekolah</label>
              <input
                value={form.school}
                onChange={e => setForm({ ...form, school: e.target.value })}
                placeholder="Contoh: SMAN 8 Jakarta"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Email Terdaftar</label>
              <input
                value={form.email}
                disabled
                className="w-full px-4 py-3 rounded-2xl bg-gray-100 text-xs font-semibold text-gray-500 outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Provinsi Sekolah</label>
              <input
                value={form.province}
                onChange={e => setForm({ ...form, province: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
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
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-xl font-black shadow-xs">
                UI
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  Target Kuliah Utama
                </span>
                <h3 className="text-lg font-black text-gray-950 mt-1">
                  {form.target_ptn_1}
                </h3>
                <p className="text-xs font-bold text-amber-700">
                  {form.target_prodi_1}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditingTarget(!isEditingTarget)}
              className="px-5 py-2.5 rounded-full text-xs font-black bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Edit3 size={14} /> Ubah Target Kuliah
            </button>
          </div>

          {/* Form Ubah Target (Toggleable) */}
          {isEditingTarget && (
            <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/60 space-y-4">
              <h4 className="text-xs font-black text-gray-900">Ubah Universitas & Program Studi</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Pilihan PTN 1</label>
                  <input
                    value={form.target_ptn_1}
                    onChange={e => setForm({ ...form, target_ptn_1: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white text-xs font-semibold text-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Program Studi 1</label>
                  <input
                    value={form.target_prodi_1}
                    onChange={e => setForm({ ...form, target_prodi_1: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white text-xs font-semibold text-gray-900 outline-none"
                  />
                </div>
              </div>
              <button
                onClick={() => setIsEditingTarget(false)}
                className="btn-brand-primary px-5 py-2 rounded-full text-xs font-bold"
              >
                Selesai Mengubah
              </button>
            </div>
          )}

          {/* DOSSIER HERO BANNER */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-950 shadow-lg space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-black/10 px-3 py-1 rounded-full inline-block">
              Insight Karir & Lingkungan Kampus
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-snug">
              Wujudkan Mimpi Jadi Ahli AI di Kampus Perjuangan: Menuju Masa Depan Cerah Bersama UI!
            </h2>
            <p className="text-xs md:text-sm font-bold opacity-90">
              KECERDASAN ARTIFISIAL, Universitas Indonesia
            </p>
          </div>

          {/* 5 STRUCTURED INSIGHT SECTIONS (PERSIS PERMINTAAN USER) */}
          <div className="space-y-6">
            {/* 1. PERKIRAAN GAJI ALUMNI */}
            <div className="p-7 rounded-3xl bg-white shadow-md space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <span className="w-8 h-8 rounded-2xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center">
                  1
                </span>
                <h3 className="text-base font-black text-gray-950">
                  Perkiraan Gaji Alumni
                </h3>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Lulusan Kecerdasan Artifisial UI berada di garda terdepan revolusi teknologi. Dengan keahlian yang sangat dicari di era digital, masa depan finansialmu sangat menjanjikan baik di dalam maupun luar negeri.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-gray-50/80 space-y-1">
                  <p className="text-xs font-bold text-gray-700">Fresh Graduate (AI Engineer/Data Scientist)</p>
                  <p className="text-sm font-black text-emerald-700 font-mono">
                    Rp 10.000.000 - Rp 18.000.000 / bulan
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/80 space-y-1">
                  <p className="text-xs font-bold text-gray-700">Mid-Career (3-5 tahun)</p>
                  <p className="text-sm font-black text-amber-800 font-mono">
                    Rp 25.000.000 - Rp 45.000.000 / bulan
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/80 space-y-1">
                  <p className="text-xs font-bold text-gray-700">Senior (5+ tahun/Lead AI)</p>
                  <p className="text-sm font-black text-rose-700 font-mono">
                    Rp 50.000.000 - Rp 100.000.000+ / bulan
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
                  Kondisi Daerah Kampus
                </h3>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Kampus UI Depok menawarkan harmoni antara rimbunnya hutan kota dan fasilitas teknologi modern. Kamu akan merasakan atmosfer akademik yang kental namun tetap santai dengan ikon &lsquo;Bikun&rsquo; yang siap mengantarmu kuliah.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                <div className="p-4 rounded-2xl bg-gray-50 space-y-1">
                  <span className="font-black text-gray-900 block">📍 Lokasi</span>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    Kampus UI Depok yang asri dengan luas 320 hektar, paru-paru hijau di perbatasan Jakarta-Depok.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 space-y-1">
                  <span className="font-black text-gray-900 block">🚆 Transportasi</span>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    Akses mudah dengan KRL (Stasiun UI & Pondok Cina), serta Bis Kuning (Bikun) gratis di dalam area kampus.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 space-y-1">
                  <span className="font-black text-gray-900 block">🏛️ Fasilitas</span>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    Perpustakaan &lsquo;The Crystal of Knowledge&rsquo;, laboratorium AI canggih di Fasilkom, dan area olahraga lengkap.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 space-y-1">
                  <span className="font-black text-gray-900 block">🌳 Lingkungan</span>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    Lingkungan belajar yang tenang, inklusif, dan dikelilingi banyak tempat makan mahasiswa yang terjangkau.
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
                  Jalur Masuk & Biaya
                </h3>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                UI membuka pintu bagi talenta terbaik melalui berbagai jalur seleksi. Persiapkan dirimu dengan matang karena setiap usaha yang kamu lakukan hari ini adalah investasi untuk masa depanmu.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
                <div className="p-4 rounded-2xl bg-gray-50 space-y-1.5">
                  <span className="font-black text-gray-900 block">SNBP & SNBT</span>
                  <p className="text-emerald-700 font-black font-mono">Rp 0 - Rp 20.000.000 / semester</p>
                  <p className="text-gray-500 font-medium">Berdasarkan kemampuan ekonomi (UKT berkeadilan) tanpa uang pangkal.</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 space-y-1.5">
                  <span className="font-black text-gray-900 block">SIMAK UI (Mandiri)</span>
                  <p className="text-amber-800 font-black font-mono">Rp 15.000.000 - Rp 25.000.000 / semester</p>
                  <p className="text-gray-500 font-medium">Terdapat Iuran Pengembangan Institusi (IPI) yang dibayarkan satu kali di awal.</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 space-y-1.5">
                  <span className="font-black text-gray-900 block">Biaya Hidup</span>
                  <p className="text-gray-900 font-black font-mono">Rp 2.500.000 - Rp 4.500.000 / bulan</p>
                  <p className="text-gray-500 font-medium">(Kos: 1.5-2.5jt, Makan & Transport: 1-2jt di sekitar Depok).</p>
                </div>
              </div>
            </div>

            {/* 4. ALUMNI TERKENAL & INSPIRASI */}
            <div className="p-7 rounded-3xl bg-white shadow-md space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <span className="w-8 h-8 rounded-2xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center">
                  4
                </span>
                <h3 className="text-base font-black text-gray-950">
                  Alumni Terkenal & Inspirasi
                </h3>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Fasilkom UI telah melahirkan tokoh-tokoh hebat yang mengubah lanskap teknologi Indonesia. Kamu adalah calon penerus yang akan menuliskan sejarah baru di bidang kecerdasan buatan.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                {[
                  { name: 'Shinta Dhanuwardoyo', role: 'Founder Bubu.com', desc: 'Pelopor industri digital Indonesia' },
                  { name: 'Natali Ardianto', role: 'Co-Founder Tiket.com', desc: 'Tokoh startup unicorn tanah air' },
                  { name: 'Dondi Hananto', role: 'Partner Patamar Capital', desc: 'Venture Capitalist ternama' },
                  { name: 'Alamanda Shantika', role: 'Founder Binar Academy', desc: 'Alumni Fasilkom UI inspiratif' },
                ].map((alumni, ai) => (
                  <div key={ai} className="p-4 rounded-2xl bg-gray-50 space-y-1">
                    <h5 className="text-xs font-black text-gray-900">{alumni.name}</h5>
                    <p className="text-[11px] font-bold text-amber-800">{alumni.role}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{alumni.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. PELUANG KARIR GLOBAL & DISCLAIMER */}
            <div className="p-7 rounded-3xl bg-white shadow-md space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <span className="w-8 h-8 rounded-2xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center">
                  5
                </span>
                <h3 className="text-base font-black text-gray-950">
                  Peluang Karir Global
                </h3>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                Gelar dari UI adalah paspor untuk berkarir di perusahaan teknologi raksasa dunia atau membangun startup unicorn-mu sendiri. Bidang AI mencakup sektor kesehatan, finansial, hingga pemerintahan.
              </p>

              <div className="p-3.5 rounded-2xl bg-gray-50 text-[11px] text-gray-500 font-medium flex items-center gap-2">
                <HelpCircle size={15} className="text-amber-600 flex-shrink-0" />
                <span>Dirangkum KakAI dari artikel di Google. Cek lagi ke situs resmi kampus.</span>
              </div>
            </div>

            {/* BAGIKAN KE TEMAN (WHATSAPP, X, INSTAGRAM, SALIN TEKS) */}
            <div className="p-7 rounded-3xl bg-white shadow-md space-y-4">
              <h4 className="text-xs font-black text-gray-900">Bagikan ke teman</h4>

              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareTextContent)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextContent)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full text-xs font-black bg-black hover:bg-gray-800 text-white flex items-center gap-1.5 transition-colors"
                >
                  <Globe2 size={14} /> X (Twitter)
                </a>

                <button
                  onClick={handleCopyShareText}
                  className="px-5 py-2.5 rounded-full text-xs font-black bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white flex items-center gap-1.5 shadow-xs"
                >
                  <Camera size={14} /> Instagram Story
                </button>

                <button
                  onClick={handleCopyShareText}
                  className="px-5 py-2.5 rounded-full text-xs font-black bg-gray-100 hover:bg-gray-200 text-gray-900 flex items-center gap-1.5 transition-colors"
                >
                  <Copy size={14} /> {copiedShareText ? 'Teks Tersalin!' : 'Salin teks'}
                </button>
              </div>

              {/* Hashtags pill */}
              <div className="p-3 rounded-2xl bg-gray-50 font-mono text-[11px] text-amber-900/80 break-words leading-relaxed">
                #UniversitasIndonesia #KecerdasanArtifisial #AIIndonesia #PejuangPTN2026 #FasilkomUI #InfoKuliah #SNBT #SIMAKUI
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PILIH MASKOT OTBEE */}
      {activeTab === 'avatar' && (
        <div className="p-6 md:p-8 rounded-3xl bg-white shadow-md space-y-6">
          <div>
            <h3 className="text-sm font-black text-gray-900">Pilih Avatar Maskot Otbee</h3>
            <p className="text-xs text-gray-500 mt-1">
              Avatar ini akan tampil pada profile bar, komentar cuitan komunitas, dan room video study cam.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {OTBEE_AVATARS.map(av => (
              <div
                key={av.id}
                onClick={() => setForm({ ...form, avatar: av.src })}
                className={`p-5 rounded-3xl cursor-pointer flex flex-col items-center text-center space-y-3 transition-all ${
                  form.avatar === av.src
                    ? 'bg-amber-50 border-2 border-amber-500 shadow-sm'
                    : 'bg-gray-50 hover:bg-gray-100/80 border-2 border-transparent'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={av.src}
                  alt={av.label}
                  className="w-16 h-16 object-contain"
                />
                <span className="text-xs font-bold text-gray-800">{av.label}</span>
                {form.avatar === av.src && (
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ✓ Aktif
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
