'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  Video,
  Sparkles,
  MapPin,
  Clock,
  DollarSign,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Send,
  HelpCircle,
  Award,
  Users,
  Flame,
  ShieldCheck,
  Star,
  Play,
} from 'lucide-react'
import CardPattern from '@/components/ui/CardPattern'

const QUALIFICATIONS = [
  'Berusia 16 - 24 tahun (Siswa SMA, SMK, Gap Year, atau Mahasiswa aktif).',
  'Percaya diri dan ekspresif berbicara langsung di depan kamera smartphone (on-camera talent).',
  'Memiliki gaya komunikasi santai, menyenangkan, dan relatable bagi pejuang PTN.',
  'Mampu memproduksi dan memposting 5 - 7 video pendek per minggu secara konsisten.',
  'Memiliki HP dengan kualitas rekaman video dan audio yang jernih.',
  'Tidak wajib memiliki banyak followers atau pengalaman sebelumnya (kemauan belajar adalah yang utama).',
]

const RESPONSIBILITIES = [
  'Membuat dan mengunggah 5 - 7 video pendek per minggu untuk akun TikTok dan Instagram OTWPTN.',
  'Membawakan topik seru seputar tips SNBP, bedah esai lolos kampus top, motivasi belajar, dan info seleksi PTN.',
  'Tampil di depan kamera dengan energi positif dan ramah.',
  'Mengikuti sesi weekly sharing dan evaluasi performa video bersama tim marketing OTWPTN.',
]

const PERKS = [
  {
    title: 'Penghasilan Menarik',
    desc: 'Dapatkan Rp 1.000.000 hingga Rp 10.000.000 per bulan berdasarkan performa video dan pencapaian views.',
    icon: DollarSign,
  },
  {
    title: 'Kerja Fleksibel (WFA)',
    desc: 'Kerja dari mana saja tanpa perlu ngantor. Atur waktu rekaman sesuai jadwal sekolah atau kuliah kamu.',
    icon: MapPin,
  },
  {
    title: 'Free Akses Semua Fitur OTWPTN',
    desc: 'Gratis akses seumur hidup ke Modul Lengkap, Essay AI Review, dan Bimbingan Mentor Alumni senilai jutaan rupiah.',
    icon: Sparkles,
  },
  {
    title: 'Sertifikat & Portofolio Resmi',
    desc: 'Mendapatkan sertifikat resmi Marketing Partner dari PT Lembaga Sains Nasional untuk mempercantik CV kamu.',
    icon: Award,
  },
]

export default function ContentCreatorCareerPage() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [educationStatus, setEducationStatus] = useState('Kelas 12 SMA/SMK')
  const [schoolOrCampus, setSchoolOrCampus] = useState('')
  const [instagram, setInstagram] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [portfolioLink, setPortfolioLink] = useState('')
  const [phoneModel, setPhoneModel] = useState('')
  const [reason, setReason] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ referenceId: string; fullName: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)

    if (!fullName || !phone || !email || !age || !schoolOrCampus || !instagram || !tiktok || !portfolioLink || !phoneModel || !reason) {
      setErrorMsg('Mohon lengkapi semua kolom formulir pendaftaran sebelum mengirim.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/career-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          age,
          educationStatus,
          schoolOrCampus,
          instagram,
          tiktok,
          portfolioLink,
          phoneModel,
          reason,
          position: 'Marketing Partner (Content Creator)',
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Gagal mengirim pendaftaran')
      }

      setSuccessData({
        referenceId: json.referenceId || `MP-${Date.now().toString(36).toUpperCase()}`,
        fullName,
      })

      // Also save to localStorage as backup
      try {
        const existing = JSON.parse(localStorage.getItem('my_career_applications') || '[]')
        existing.push({
          referenceId: json.referenceId,
          fullName,
          date: new Date().toISOString(),
          position: 'Marketing Partner (Content Creator)',
        })
        localStorage.setItem('my_career_applications', JSON.stringify(existing))
      } catch {}
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat mengirim data. Silakan coba lagi.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const whatsappConfirmUrl = successData
    ? `https://wa.me/6281283921102?text=${encodeURIComponent(
        `Halo Tim Rekrutmen OTWPTN, nama saya ${successData.fullName} (Ref ID: ${successData.referenceId}). Saya telah mengirimkan pendaftaran sebagai Marketing Partner (Content Creator). Mohon informasi langkah seleksi berikutnya. Terima kasih!`
      )}`
    : '#'

  return (
    <div className="min-h-screen bg-gray-50/60 relative">
      <CardPattern type="pintarly-doodles" opacity={0.35} />

      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/career"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-gray-700 hover:text-gray-950 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Semua Lowongan Karier</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-700">Pendaftaran Terbuka</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 text-amber-950 border border-amber-300 text-xs font-black">
            <Flame size={14} className="text-amber-600 fill-amber-600" />
            <span>HOT OPPORTUNITY · PART TIME / REMOTE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight leading-tight">
            Marketing Partner <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
              (Content Creator / Short-Video Talent)
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-700 max-w-2xl font-medium leading-relaxed">
            Hasilkan <strong>Rp 1.000.000 - Rp 10.000.000 per bulan</strong> dari rumah dengan membuat konten video pendek seputar perjuangan masuk PTN impian. Bantu jutaan pejuang kampus sambil bangun personal branding kamu!
          </p>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Tipe Pekerjaan</span>
              <p className="text-xs sm:text-sm font-black text-gray-900 mt-0.5">Part-time (Fleksibel)</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Lokasi</span>
              <p className="text-xs sm:text-sm font-black text-gray-900 mt-0.5">Work From Anywhere</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Rentang Gaji</span>
              <p className="text-xs sm:text-sm font-black text-emerald-600 mt-0.5">Rp 1jt - Rp 10jt / bln</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Syarat Followers</span>
              <p className="text-xs sm:text-sm font-black text-amber-800 mt-0.5">Tidak Wajib Banyak</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Details Grid */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Role Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* About Role */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-gray-950 flex items-center gap-2">
              <Video className="text-amber-500" size={20} />
              <span>Tentang Peran Marketing Partner</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              Sebagai Marketing Partner di OTWPTN, kamu adalah wajah dan suara dari platform kami. Tugasmu adalah menginspirasi dan mengedukasi para siswa SMA se-Indonesia melalui video pendek di TikTok dan Instagram Reels.
            </p>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              Kamu tidak perlu jago editing yang rumit atau punya kamera DSLR profesional. Yang kami butuhkan adalah kepribadian yang ramah, percaya diri berbicara di depan HP, dan antusiasme untuk membagikan tips lolos PTN.
            </p>
          </div>

          {/* Responsibilities */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-gray-950 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={20} />
              <span>Tanggung Jawab Utama</span>
            </h2>
            <div className="space-y-3">
              {RESPONSIBILITIES.map((resp, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 text-xs font-black mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                    {resp}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Qualifications */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-gray-950 flex items-center gap-2">
              <ShieldCheck className="text-emerald-600" size={20} />
              <span>Kriteria yang Kami Cari</span>
            </h2>
            <div className="space-y-2.5">
              {QUALIFICATIONS.map((q, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                    {q}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Perks Grid */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-5">
            <h2 className="text-lg font-black text-gray-950 flex items-center gap-2">
              <Award className="text-amber-500" size={20} />
              <span>Keuntungan & Benefit Bergabung</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PERKS.map((p, i) => {
                const IconComponent = p.icon
                return (
                  <div key={i} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center">
                      <IconComponent size={16} />
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-gray-950">{p.title}</h4>
                    <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">{p.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Application Form (5 Cols) */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-amber-300 shadow-xl space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider mb-2">
                <span>Formulir Pendaftaran Resmi</span>
              </div>
              <h3 className="text-xl font-black text-gray-950 tracking-tight">
                Daftar Jadi Marketing Partner
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Isi data diri kamu dengan jujur dan lengkap. Tim HR kami akan meninjau dan menghubungi kamu via WhatsApp.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold leading-relaxed">
                {errorMsg}
              </div>
            )}

            {successData ? (
              <div className="p-6 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 size={30} />
                </div>
                <div>
                  <h4 className="text-base font-black text-emerald-950">
                    Pendaftaran Berhasil Terkirim!
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Terima kasih, <strong>{successData.fullName}</strong>. Kode Referensi Pendaftaranmu adalah:
                  </p>
                  <div className="mt-2 py-2 px-3 rounded-xl bg-white border border-emerald-300 text-sm font-black text-emerald-950 font-mono tracking-wider">
                    {successData.referenceId}
                  </div>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Untuk mempercepat proses seleksi, kamu bisa langsung konfirmasi ke WhatsApp tim rekrutmen kami:
                </p>
                <a
                  href={whatsappConfirmUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-full text-xs font-black btn-brand-primary flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Chat WhatsApp Tim HR OTWPTN</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Contoh: Muhammad Arkan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      No. WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="0812xxxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Usia <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={15}
                      max={30}
                      value={age}
                      onChange={e => setAge(e.target.value)}
                      placeholder="Contoh: 18"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Email Aktif <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Status Pendidikan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={educationStatus}
                      onChange={e => setEducationStatus(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 bg-white"
                    >
                      <option value="Kelas 10 SMA/SMK">Kelas 10 SMA/SMK</option>
                      <option value="Kelas 11 SMA/SMK">Kelas 11 SMA/SMK</option>
                      <option value="Kelas 12 SMA/SMK">Kelas 12 SMA/SMK</option>
                      <option value="Gap Year">Gap Year</option>
                      <option value="Mahasiswa Aktif">Mahasiswa Aktif</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Asal Sekolah / Kampus <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={schoolOrCampus}
                      onChange={e => setSchoolOrCampus(e.target.value)}
                      placeholder="SMAN 1 Jakarta"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Akun Instagram <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={instagram}
                      onChange={e => setInstagram(e.target.value)}
                      placeholder="@username"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Akun TikTok <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={tiktok}
                      onChange={e => setTiktok(e.target.value)}
                      placeholder="@username"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Link Video / Portofolio Kamu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={portfolioLink}
                    onChange={e => setPortfolioLink(e.target.value)}
                    placeholder="https://tiktok.com/@... atau link Google Drive"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Sertakan link video tempat kamu berbicara di depan kamera (bisa link TikTok, IG Reels, atau Google Drive yang tidak dikunci).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Tipe Smartphone yang Digunakan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phoneModel}
                    onChange={e => setPhoneModel(e.target.value)}
                    placeholder="Contoh: iPhone 12 / Samsung Galaxy A54"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Kenapa Tertarik Jadi Marketing Partner? <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Ceritakan motivasi kamu dan kenapa kamu cocok untuk peran ini..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full text-xs font-black btn-brand-primary flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Mengirim Pendaftaran...</span>
                  ) : (
                    <>
                      <span>Kirim Pendaftaran Sekarang</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
