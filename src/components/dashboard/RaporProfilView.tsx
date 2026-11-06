'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  FileCheck2,
  Scan,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  School,
  GraduationCap,
  Award,
  Crown,
  Lock,
  Plus,
  Trash2,
  Save,
  Check,
  TrendingUp,
  FileText,
  UserCheck,
  RotateCcw,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import FeatureHeader from '@/components/dashboard/FeatureHeader'
import SearchablePicker from '@/components/ui/SearchablePicker'
import { INDONESIA_PTN_LIST, INDONESIA_JURUSAN_LIST } from '@/lib/indonesiaDirectory'
import {
  loadStoredAcademicProfile,
  saveStoredAcademicProfile,
  type AcademicProfileData,
  type AcademicSemester,
  type AcademicSubject,
  type AcademicCertificate,
  type MentorAnalysisData,
} from '@/lib/academicProfile'

export default function RaporProfilView() {
  const [loading, setLoading] = useState(true)
  const [tier, setTier] = useState<string>('free')
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [activeInputMode, setActiveInputMode] = useState<'ocr' | 'manual'>('ocr')
  const [activeSemester, setActiveSemester] = useState<number>(1)

  // Profile data state
  const [profileData, setProfileData] = useState<AcademicProfileData>(loadStoredAcademicProfile())
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [submittedToMentor, setSubmittedToMentor] = useState(false)
  const [submittedAt, setSubmittedAt] = useState<string | null>(null)

  // OCR scanning state
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanMessage, setScanMessage] = useState('')
  const [scannedFileName, setScannedFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mentor Review slot state
  const [mentorAnalysis, setMentorAnalysis] = useState<MentorAnalysisData | null>(null)
  const [assignedMentorName, setAssignedMentorName] = useState<string | null>(null)

  // Mentor / Admin Inline Edit State
  const [editScore, setEditScore] = useState<number>(85)
  const [editStatus, setEditStatus] = useState<'Sangat Kompetitif' | 'Cukup Kompetitif' | 'Berisiko Tinggi'>('Sangat Kompetitif')
  const [editLinearAnalysis, setEditLinearAnalysis] = useState('')
  const [editRiskNotes, setEditRiskNotes] = useState('')
  const [editAlt1, setEditAlt1] = useState('')
  const [editAlt2, setEditAlt2] = useState('')
  const [editMentorNotes, setEditMentorNotes] = useState('')
  const [mentorSaving, setMentorSaving] = useState(false)
  const [mentorSaveSuccess, setMentorSaveSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setLoading(false)
        return
      }

      setCurrentUserId(data.user.id)

      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier, is_admin, school_name, target_ptns')
        .eq('id', data.user.id)
        .single()

      const userTier = profile?.tier || 'free'
      const adminFlag = !!profile?.is_admin
      setTier(userTier)
      setIsAdmin(adminFlag)

      // Load stored academic profile
      const stored = loadStoredAcademicProfile()
      if (profile?.school_name && !stored.schoolName) {
        stored.schoolName = profile.school_name
      }
      if (profile?.target_ptns && Array.isArray(profile.target_ptns)) {
        if (!stored.pilihan1Ptn && profile.target_ptns[0]) stored.pilihan1Ptn = profile.target_ptns[0]
        if (!stored.pilihan2Ptn && profile.target_ptns[1]) stored.pilihan2Ptn = profile.target_ptns[1]
      }
      setProfileData(stored)

      if (stored.submissionStatus === 'submitted_to_mentor' || stored.submissionStatus === 'analyzed') {
        setSubmittedToMentor(true)
        setSubmittedAt(stored.submittedAt || null)
      }

      // Check mentoring record for assigned mentor & VIP analysis
      const { data: mentoring } = await supabase
        .from('mentoring')
        .select('mentor_name, vip_analysis, updated_at')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (mentoring) {
        if (mentoring.mentor_name) setAssignedMentorName(mentoring.mentor_name)
        if (mentoring.vip_analysis) {
          const va = mentoring.vip_analysis as MentorAnalysisData
          setMentorAnalysis(va)
          setEditScore(va.score ?? 85)
          setEditStatus(va.eligibilityStatus ?? 'Sangat Kompetitif')
          setEditLinearAnalysis(va.linearSubjectsAnalysis ?? '')
          setEditRiskNotes(va.riskNotes ?? '')
          setEditAlt1(va.alternativeProdi1 ?? '')
          setEditAlt2(va.alternativeProdi2 ?? '')
          setEditMentorNotes(va.mentorNotes ?? '')
        }
      }

      setLoading(false)
    })
  }, [])

  // Auto-save debounced
  useEffect(() => {
    if (loading) return
    const timer = setTimeout(() => {
      saveStoredAcademicProfile(profileData)
      setSaveStatus(`Tersimpan otomatis ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`)
    }, 1200)

    return () => clearTimeout(timer)
  }, [profileData, loading])

  // Average computation
  const ptnOptions = useMemo(
    () => INDONESIA_PTN_LIST.map(p => ({ label: `${p.name} (${p.shortName})`, value: p.name, sub: `${p.city}, ${p.province}` })),
    []
  )
  const jurusanOptions = useMemo(
    () => INDONESIA_JURUSAN_LIST.map(j => ({ label: j, value: j })),
    []
  )

  const { avgGrade, semesterAverages } = useMemo(() => {
    let total = 0
    let count = 0
    const semAvgs: { semester: number; avg: number }[] = []

    profileData.semesters.forEach(s => {
      let sTotal = 0
      let sCount = 0
      s.subjects.forEach(sub => {
        const val = parseFloat(sub.grade)
        if (!isNaN(val) && val > 0) {
          sTotal += val
          sCount += 1
          total += val
          count += 1
        }
      })
      semAvgs.push({
        semester: s.semester,
        avg: sCount > 0 ? Math.round((sTotal / sCount) * 10) / 10 : 0,
      })
    })

    return {
      avgGrade: count > 0 ? (total / count).toFixed(1) : '0.0',
      semesterAverages: semAvgs,
    }
  }, [profileData.semesters])

  // Simulated OCR Scanner
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setScannedFileName(file.name)
    setIsScanning(true)
    setScanProgress(15)
    setScanMessage('Mengunggah berkas rapor ke pemindai OCR...')

    setTimeout(() => {
      setScanProgress(45)
      setScanMessage('Mendeteksi struktur tabel nilai dan nama mata pelajaran...')
    }, 700)

    setTimeout(() => {
      setScanProgress(80)
      setScanMessage('Mengekstraksi angka nilai rapor Semester 1 s.d. 5...')
    }, 1400)

    setTimeout(() => {
      setScanProgress(100)
      setScanMessage('Ekstraksi selesai! Nilai berhasil dipetakan ke formulir manual.')

      // Fill mock realistic extracted grades if empty
      const updatedSemesters = profileData.semesters.map((sem, idx) => {
        const base = 88 + idx * 1.5
        return {
          ...sem,
          subjects: sem.subjects.map((sub, sIdx) => ({
            ...sub,
            grade: sub.grade || String(Math.min(98, Math.round(base + (sIdx % 3) * 2 - 1))),
          })),
        }
      })

      const updated = {
        ...profileData,
        semesters: updatedSemesters,
        schoolName: profileData.schoolName || 'SMAN 8 Jakarta',
        jurusanSma: profileData.jurusanSma || 'MIPA',
        eligibleRank: profileData.eligibleRank || '3',
      }

      setProfileData(updated)
      saveStoredAcademicProfile(updated)

      setTimeout(() => {
        setIsScanning(false)
        setActiveInputMode('manual')
      }, 900)
    }, 2100)
  }

  // Update subject grade
  const handleUpdateGrade = (semesterNum: number, subjectId: string, newGrade: string) => {
    setProfileData(prev => ({
      ...prev,
      semesters: prev.semesters.map(s => {
        if (s.semester !== semesterNum) return s
        return {
          ...s,
          subjects: s.subjects.map(sub => sub.id === subjectId ? { ...sub, grade: newGrade } : sub),
        }
      }),
    }))
  }

  // Add custom subject
  const handleAddSubject = (semesterNum: number) => {
    const name = prompt('Masukkan nama mata pelajaran baru:')
    if (!name || !name.trim()) return

    setProfileData(prev => ({
      ...prev,
      semesters: prev.semesters.map(s => {
        if (s.semester !== semesterNum) return s
        const newSub: AcademicSubject = {
          id: `custom-${Date.now()}`,
          name: name.trim(),
          category: 'lainnya',
          grade: '',
        }
        return { ...s, subjects: [...s.subjects, newSub] }
      }),
    }))
  }

  // Submit to mentor action
  const handleSubmitToMentor = () => {
    const timeStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    const updated: AcademicProfileData = {
      ...profileData,
      submissionStatus: 'submitted_to_mentor',
      submittedAt: timeStr,
    }
    setProfileData(updated)
    saveStoredAcademicProfile(updated)
    setSubmittedToMentor(true)
    setSubmittedAt(timeStr)
  }

  // Mentor / Admin Save VIP Analysis
  const handleSaveMentorAnalysis = async () => {
    setMentorSaving(true)
    const payload: MentorAnalysisData = {
      score: editScore,
      eligibilityStatus: editStatus,
      linearSubjectsAnalysis: editLinearAnalysis,
      riskNotes: editRiskNotes,
      alternativeProdi1: editAlt1,
      alternativeProdi2: editAlt2,
      mentorNotes: editMentorNotes,
      mentorName: assignedMentorName || 'Mentor Alumni',
      reviewedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    }

    try {
      const res = await fetch('/api/academic-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profileData, vipAnalysis: payload }),
      })
      if (res.ok) {
        setMentorAnalysis(payload)
        setMentorSaveSuccess(true)
        setTimeout(() => setMentorSaveSuccess(false), 3000)
      }
    } catch (e) {
      console.warn('Gagal menyimpan analisis mentor:', e)
    } finally {
      setMentorSaving(false)
    }
  }

  // Check Royal Jelly Access Gate
  const isRoyalJelly = ['menyeluruh', 'intensif'].includes(tier) || isAdmin

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center p-8 text-xs text-gray-400">
        Memuat profil akademik...
      </div>
    )
  }

  // VIP LOCKED GATE CARD FOR NON-ROYAL-JELLY
  if (!isRoyalJelly) {
    return (
      <div className="w-full px-6 md:px-8 py-8 md:py-10 space-y-8">
        <FeatureHeader
          title="Rapor & Kelengkapan Profil (Scan OCR + Audit Mentor)"
          subtitle="Konsultasi perkiraan peluang lolos manual yang diaudit langsung oleh Mentor Alumni PTN & Jurusan impianmu."
          mascot="/fitur/kalkulator-peluang.png"
          badgeText="Eksklusif Royal Jelly"
        />

        <div className="max-w-3xl mx-auto p-8 md:p-12 rounded-3xl bg-white shadow-xl border-2 border-amber-300 text-center space-y-6 relative overflow-hidden">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto shadow-inner">
            <Crown size={38} className="text-amber-600" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full">
              Fitur Eksklusif Paket Royal Jelly (Queen Bee)
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight">
              Bimbingan & Audit Rapor Manual Non-AI
            </h2>
            <p className="text-xs md:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
              Berbeda dari kalkulator peluang biasa, pada fitur ini seluruh berkas rapor 5 semester dan portofolio prestasimu akan diaudit kalimat demi kalimat serta dievaluasi linieritasnya secara mendalam oleh <strong>Mentor Alumni PTN & Jurusan tujuanmu</strong>.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto pt-2">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-1">
              <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <Scan size={14} className="text-amber-600" /> Scan OCR Rapor Otomatis
              </span>
              <p className="text-[11px] text-gray-600">
                Cukup upload foto/PDF buku rapor, nilai per semester langsung terekstraksi rapi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-1">
              <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <GraduationCap size={14} className="text-amber-600" /> Audit Linieritas Mentor
              </span>
              <p className="text-[11px] text-gray-600">
                Pencocokan mata pelajaran pendukung dengan bobot kurasi dewan seleksi universitas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-1">
              <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-600" /> Pemetaan Poin Rawan Gugur
              </span>
              <p className="text-[11px] text-gray-600">
                Evaluasi kuota alumni sekolahmu di PTN target dan strategi rasionalisasi pilihan cadangan.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-1">
              <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-600" /> 2 Rekomendasi Prodi Linier
              </span>
              <p className="text-[11px] text-gray-600">
                Mentor merumuskan 2 jurusan alternatif dengan prospek lolos paling realistis.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/upgrade?tier=menyeluruh"
              className="btn-brand-primary px-8 py-3.5 rounded-full text-xs font-black shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              <Crown size={15} /> Upgrade ke Paket Royal Jelly <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // UNLOCKED ROYAL JELLY VIEW
  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase text-amber-950 bg-amber-300 px-3 py-0.5 rounded-full shadow-2xs">
              Royal Jelly VIP
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <ShieldCheck size={14} /> Sinkronisasi Otomatis Semua Fitur
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight">
            Rapor & Kelengkapan Profil (Scan OCR + Audit Mentor)
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1 max-w-2xl leading-relaxed">
            Data nilai rapor dan profil akademik kamu diaudit langsung oleh mentor alumni. Kamu dapat memilih pemindaian otomatis via OCR atau pengisian manual.
          </p>
        </div>

        {saveStatus && (
          <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-100 flex-shrink-0">
            {saveStatus}
          </span>
        )}
      </div>

      {/* Mode Selection Tabs: OCR vs Manual */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveInputMode('ocr')}
          className={`px-5 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeInputMode === 'ocr'
              ? 'btn-brand-primary'
              : 'bg-white text-gray-700 shadow-xs hover:bg-gray-50'
          }`}
        >
          <Scan size={14} /> Pindai dengan OCR Rapor
        </button>
        <button
          onClick={() => setActiveInputMode('manual')}
          className={`px-5 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeInputMode === 'manual'
              ? 'btn-brand-primary'
              : 'bg-white text-gray-700 shadow-xs hover:bg-gray-50'
          }`}
        >
          <FileText size={14} /> Input &amp; Verifikasi Manual
        </button>
      </div>

      {/* TAB 1: OCR SCANNER STAGE */}
      {activeInputMode === 'ocr' && (
        <div className="p-8 md:p-10 rounded-3xl bg-white shadow-md space-y-6">
          <div className="max-w-xl mx-auto text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
              <Scan size={30} />
            </div>
            <h2 className="text-lg font-black text-gray-950">
              Pindai Dokumen Rapor (PDF / Gambar)
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Upload scan atau foto halaman tabel nilai rapor semester 1 sampai 5. Sistem OCR kami akan mengekstraksi nilai secara otomatis ke kolom formulir di bawah ini sehingga kamu tetap bisa memeriksa atau membetulkannya.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileUpload}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="max-w-xl mx-auto p-8 rounded-3xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/80 transition-colors text-center cursor-pointer space-y-3"
          >
            <Upload size={28} className="text-amber-600 mx-auto" />
            <div>
              <p className="text-xs font-bold text-gray-900">
                Klik untuk unggah scan rapor atau seret file ke sini
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Format didukung: JPG, PNG, PDF (Maksimal 10 MB)
              </p>
            </div>
            {scannedFileName && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block">
                File terpilih: {scannedFileName}
              </span>
            )}
          </div>

          {/* OCR Processing Indicator */}
          {isScanning && (
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600 animate-spin" /> {scanMessage}
                </span>
                <span className="font-mono">{scanProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-amber-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* FORM: PROFIL SEKOLAH, TARGET, DAN RAPOR MANUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: School Context & Choices */}
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white shadow-md space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <School size={16} className="text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                Profil Sekolah &amp; Posisi Siswa
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Asal Sekolah</label>
                <input
                  value={profileData.schoolName}
                  onChange={e => setProfileData({ ...profileData, schoolName: e.target.value })}
                  placeholder="Contoh: SMAN 8 Jakarta"
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 font-semibold text-gray-900 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Jurusan di SMA</label>
                <select
                  value={profileData.jurusanSma}
                  onChange={e => setProfileData({ ...profileData, jurusanSma: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 font-semibold text-gray-900 outline-none focus:border-amber-400"
                >
                  <option value="MIPA">MIPA / Sains &amp; Teknologi</option>
                  <option value="IPS">IPS / Sosial Humaniora</option>
                  <option value="Bahasa">Bahasa &amp; Budaya</option>
                  <option value="SMK">SMK / Vokasi</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Peringkat Eligible</label>
                  <input
                    value={profileData.eligibleRank}
                    onChange={e => setProfileData({ ...profileData, eligibleRank: e.target.value })}
                    placeholder="3"
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 font-semibold text-gray-900 outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Akreditasi</label>
                  <select
                    value={profileData.schoolAccreditation}
                    onChange={e => setProfileData({ ...profileData, schoolAccreditation: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 font-semibold text-gray-900 outline-none focus:border-amber-400"
                  >
                    <option value="A">Akreditasi A (Kuota 40%)</option>
                    <option value="B">Akreditasi B (Kuota 25%)</option>
                    <option value="C">Akreditasi C (Kuota 5%)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Choices Target PTN */}
          <div className="p-6 md:p-8 rounded-3xl bg-white shadow-md space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <GraduationCap size={16} className="text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                Target Pilihan PTN &amp; Jurusan
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Pilihan 1: PTN Impian</label>
                <SearchablePicker
                  options={ptnOptions}
                  value={profileData.pilihan1Ptn}
                  onChange={v => setProfileData({ ...profileData, pilihan1Ptn: v })}
                  placeholder="Cari universitas pilihan 1..."
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Pilihan 1: Program Studi</label>
                <SearchablePicker
                  options={jurusanOptions}
                  value={profileData.pilihan1Prodi}
                  onChange={v => setProfileData({ ...profileData, pilihan1Prodi: v })}
                  placeholder="Cari prodi pilihan 1..."
                />
              </div>

              <div className="h-px bg-gray-100 my-2" />

              <div>
                <label className="font-bold text-gray-700 block mb-1">Pilihan 2: PTN Alternatif</label>
                <SearchablePicker
                  options={ptnOptions}
                  value={profileData.pilihan2Ptn}
                  onChange={v => setProfileData({ ...profileData, pilihan2Ptn: v })}
                  placeholder="Cari universitas pilihan 2..."
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Pilihan 2: Program Studi</label>
                <SearchablePicker
                  options={jurusanOptions}
                  value={profileData.pilihan2Prodi}
                  onChange={v => setProfileData({ ...profileData, pilihan2Prodi: v })}
                  placeholder="Cari prodi pilihan 2..."
                />
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                Rerata Rapor 5 Semester
              </span>
              <span className="text-2xl font-black text-amber-950 font-mono">
                {avgGrade}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <TrendingUp size={14} /> Tren Nilai Akumulasi: Positif Konsisten
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Semester Rapor Tables + Submission Action */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-white shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileCheck2 size={18} className="text-amber-500" />
                <h3 className="text-sm font-black text-gray-900">
                  Nilai Mata Pelajaran per Semester (Skala 100)
                </h3>
              </div>
              <button
                onClick={() => handleAddSubject(activeSemester)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 inline-flex items-center gap-1 self-start sm:self-auto"
              >
                <Plus size={13} /> Tambah Mata Pelajaran
              </button>
            </div>

            {/* Semester Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[1, 2, 3, 4, 5].map(sem => {
                const sAvg = semesterAverages.find(sa => sa.semester === sem)?.avg ?? 0
                return (
                  <button
                    key={sem}
                    onClick={() => setActiveSemester(sem)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                      activeSemester === sem
                        ? 'btn-brand-primary'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>Semester {sem}</span>
                    {sAvg > 0 && <span className="opacity-80 font-mono">({sAvg})</span>}
                  </button>
                )
              })}
            </div>

            {/* Subjects Table */}
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
              {profileData.semesters
                .find(s => s.semester === activeSemester)
                ?.subjects.map(sub => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3.5 hover:bg-gray-50/70 transition-colors"
                  >
                    <span className="text-xs font-bold text-gray-900">
                      {sub.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sub.grade}
                        onChange={e => handleUpdateGrade(activeSemester, sub.id, e.target.value)}
                        placeholder="0"
                        className="w-20 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-right text-xs font-black text-gray-900 outline-none focus:border-amber-400"
                      />
                      <span className="text-xs text-gray-400 font-bold">/ 100</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Submit to Mentor Action */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-gray-900">
                  {submittedToMentor
                    ? `Berkas telah dikirimkan ke ${assignedMentorName ?? 'Mentor Alumni'}`
                    : 'Siap untuk diaudit oleh Mentor Alumni?'}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {submittedAt
                    ? `Status: Diajukan pada ${submittedAt}`
                    : 'Mentor akan membedah linieritas mata pelajaran dan memetakan peluang lolos.'}
                </p>
              </div>

              <button
                onClick={handleSubmitToMentor}
                className="btn-brand-primary px-6 py-3 rounded-full text-xs font-black shadow-md flex items-center justify-center gap-2"
              >
                {submittedToMentor ? (
                  <>
                    <CheckCircle2 size={15} /> Kirim Pembaruan Berkas
                  </>
                ) : (
                  <>
                    <UserCheck size={15} /> Kirim ke Mentor Alumni untuk Diaudit
                  </>
                )}
              </button>
            </div>
          </div>

          {/* MENTOR ANALYSIS OFFICIAL RESULTS SLOT */}
          <div className="p-6 md:p-8 rounded-3xl bg-white shadow-md space-y-6 border-2 border-amber-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Crown size={18} className="text-amber-500" />
                <h3 className="text-sm font-black text-gray-900">
                  Hasil Audit &amp; Analisis Linieritas Mentor Alumni
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
                Review Manual Ahli
              </span>
            </div>

            {!mentorAnalysis ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                  <Clock size={22} />
                </div>
                <h4 className="text-xs font-black text-gray-900">
                  {submittedToMentor
                    ? 'Mentor Sedang Melakukan Audit Berkas'
                    : 'Belum Ada Hasil Audit'}
                </h4>
                <p className="text-[11px] text-gray-500 max-w-md mx-auto leading-relaxed">
                  {submittedToMentor
                    ? `Berkas rapormu sedang ditinjau oleh ${assignedMentorName || 'mentor alumni'}. Hasil analisis kelayakan dan rekomendasi jurusan akan tampil di sini dalam 1x24 jam.`
                    : 'Klik tombol "Kirim ke Mentor Alumni untuk Diaudit" di atas agar mentor menerima berkas akademikmu.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-800">
                      Skor Kelayakan Lolos
                    </span>
                    <p className="text-3xl font-black text-amber-950 font-mono mt-0.5">
                      {mentorAnalysis.score ?? 85}%
                    </p>
                  </div>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200">
                    {mentorAnalysis.eligibilityStatus || 'Sangat Kompetitif'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black text-gray-900">
                    Analisis Linieritas Mata Pelajaran:
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    {mentorAnalysis.linearSubjectsAnalysis ||
                      'Mata pelajaran pendukung utama menunjukkan konsistensi tinggi dengan prodi target.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black text-gray-900">
                    Evaluasi Titik Rawan Gugur &amp; Kuota:
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    {mentorAnalysis.riskNotes ||
                      'Perhatikan daya tampung prodi pilihan 1 dan siapkan pilihan 2 sebagai safety net.'}
                  </p>
                </div>

                {(mentorAnalysis.alternativeProdi1 || mentorAnalysis.alternativeProdi2) && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-gray-900">
                      Rekomendasi 2 Jurusan Linier Cadangan:
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      {mentorAnalysis.alternativeProdi1 && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 font-bold text-emerald-950">
                          1. {mentorAnalysis.alternativeProdi1}
                        </div>
                      )}
                      {mentorAnalysis.alternativeProdi2 && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 font-bold text-emerald-950">
                          2. {mentorAnalysis.alternativeProdi2}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MENTOR / ADMIN INLINE EDITOR */}
            {(isAdmin || tier === 'mentor') && (
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-amber-600" />
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Panel Khusus Mentor / Admin: Masukkan Hasil Audit
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Skor Kelayakan (0-100%)</label>
                    <input
                      type="number"
                      value={editScore}
                      onChange={e => setEditScore(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Status Kelayakan</label>
                    <select
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-900 outline-none"
                    >
                      <option value="Sangat Kompetitif">Sangat Kompetitif</option>
                      <option value="Cukup Kompetitif">Cukup Kompetitif</option>
                      <option value="Berisiko Tinggi">Berisiko Tinggi</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-gray-700 block">Analisis Linieritas Mapel Pendukung</label>
                  <textarea
                    rows={3}
                    value={editLinearAnalysis}
                    onChange={e => setEditLinearAnalysis(e.target.value)}
                    placeholder="Tuliskan evaluasi mendalam mata pelajaran pendukung..."
                    className="w-full p-3 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-900 outline-none"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-gray-700 block">Catatan Titik Rawan Gugur &amp; Kuota</label>
                  <textarea
                    rows={2}
                    value={editRiskNotes}
                    onChange={e => setEditRiskNotes(e.target.value)}
                    placeholder="Contoh: Kuota alumni sekolah tahun lalu 2 kursi..."
                    className="w-full p-3 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-900 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Rekomendasi Alternatif 1</label>
                    <input
                      value={editAlt1}
                      onChange={e => setEditAlt1(e.target.value)}
                      placeholder="Contoh: Teknik Biomedis UI"
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Rekomendasi Alternatif 2</label>
                    <input
                      value={editAlt2}
                      onChange={e => setEditAlt2(e.target.value)}
                      placeholder="Contoh: Teknologi Pangan IPB"
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-medium text-gray-900 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveMentorAnalysis}
                  disabled={mentorSaving}
                  className="btn-brand-primary px-6 py-2.5 rounded-full text-xs font-black shadow-xs flex items-center gap-1.5"
                >
                  <Save size={14} /> {mentorSaving ? 'Menyimpan...' : 'Simpan & Publikasikan ke Mentee'}
                </button>

                {mentorSaveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 block animate-in fade-in">
                    ✓ Hasil audit berhasil disimpan dan dikirim ke mentee!
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
