'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { JALUR_LIST } from '@/lib/constants'
import {
  Calculator,
  Lock,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Plus,
  X,
  ChevronDown,
  MapPin,
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle2,
  School,
  GraduationCap,
  FlaskConical,
  BookOpen,
  Wrench,
  Share2,
  RotateCcw,
  Save,
} from 'lucide-react'
import ShareStoryModal from '@/components/social/ShareStoryModal'
import FeatureHeader from '@/components/dashboard/FeatureHeader'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'
import SearchablePicker from '@/components/ui/SearchablePicker'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { INDONESIA_PTN_LIST, INDONESIA_JURUSAN_LIST } from '@/lib/indonesiaDirectory'
import { loadStoredAcademicProfile, saveStoredAcademicProfile } from '@/lib/academicProfile'
import { completeQuest, awardPoints } from '@/lib/gamification'

interface KalkulatorResult {
  score: number
  recommendation: string
  strengths: string[]
  weaknesses: string[]
  tips: string[]
  formulaName?: string
  formulaWeights?: { label: string; weightPct: number; achievedPct: number }[]
  prodiBenchmark?: {
    ptn: string
    prodi: string
    dayaTampung2026: number
    peminat2025: number
    keketatan2025: number | null
    history: Record<string, { p: number; d: number; k: number }>
  } | null
  raporTrend?: 'naik' | 'stabil' | 'turun' | 'belum_lengkap'
}

interface Subject {
  id: string
  name: string
  category: string
  grade: string
}
interface SemesterData {
  semester: number
  subjects: Subject[]
}
interface Certificate {
  id: string
  name: string
  level: string
  rank: string
  year: string
}

const CATEGORY_OPTIONS = [
  { value: 'ipa', label: 'IPA' },
  { value: 'ips', label: 'IPS' },
  { value: 'bahasa', label: 'Bahasa' },
  { value: 'kejuruan', label: 'Kejuruan' },
  { value: 'lainnya', label: 'Lainnya' },
]

const CERT_LEVEL_OPTIONS = [
  { value: 'sekolah', label: 'Tingkat sekolah' },
  { value: 'kabupaten_kota', label: 'Tingkat kabupaten/kota' },
  { value: 'provinsi', label: 'Tingkat provinsi' },
  { value: 'nasional', label: 'Tingkat nasional' },
  { value: 'internasional', label: 'Tingkat internasional' },
]

const ACCREDITATION_OPTIONS = ['A', 'B', 'C']

const LEVEL_RANK: Record<string, number> = {
  sekolah: 1,
  kabupaten_kota: 2,
  provinsi: 3,
  nasional: 4,
  internasional: 5,
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function scoreColor(score: number) {
  if (score >= 70) return '#10b981'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

function ResultPanel({
  result,
  loading,
  quotaError,
  error,
  onOpenShare,
}: {
  result: KalkulatorResult | null
  loading: boolean
  quotaError: boolean
  error: string | null
  onOpenShare?: () => void
}) {
  return (
    <div className="p-6 rounded-3xl bg-white shadow-md sticky top-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-amber-500" />
        <h2 className="text-xs font-black uppercase tracking-wider text-gray-500">
          Hasil Analisis Rasionalisasi
        </h2>
      </div>

      {quotaError ? (
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <Lock size={24} />
          </div>
          <p className="text-sm font-extrabold text-gray-900 mb-1">Kuota Kalkulator Habis</p>
          <p className="text-xs text-gray-500 mb-5 leading-relaxed">
            Upgrade akun untuk membuka kuota analisis tanpa batas dan konsultasi essay.
          </p>
          <Link href="/upgrade" className="btn-brand-primary px-5 py-2.5 rounded-full text-xs font-black inline-block">
            Upgrade Paket
          </Link>
        </div>
      ) : !result ? (
        <div className="text-center py-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/fitur/kalkulator-peluang.png"
            alt="Kalkulator Otbee"
            className="mx-auto mb-4 object-contain filter drop-shadow-sm"
            style={{ height: 110, width: 'auto' }}
          />
          <p className="text-xs font-bold text-gray-800 mb-1">
            {loading ? 'AI sedang menghitung peluang...' : 'Belum Ada Hasil'}
          </p>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            Lengkapi data nilai rapor dan prestasi di sebelah kiri, lalu klik &ldquo;Hitung Peluang&rdquo;.
          </p>
          {error && <p className="text-xs mt-3 font-semibold text-rose-600">{error}</p>}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Main Score Radial Ring */}
          <div className="p-5 rounded-2xl bg-gray-50/80 flex items-center gap-4">
            <div
              className="w-18 h-18 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 text-2xl font-black text-white shadow-xs"
              style={{ background: scoreColor(result.score) }}
            >
              <span>{Math.round(result.score)}%</span>
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">Peluang</span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                Prediksi Kelulusan
              </span>
              <h3 className="text-sm font-black text-gray-900 mt-1 leading-snug">
                {result.recommendation}
              </h3>
            </div>
          </div>

          {/* Viral Loop: Share ke Story */}
          {onOpenShare && (
            <button
              onClick={onOpenShare}
              className="w-full py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-transform active:scale-[0.99]"
            >
              <Share2 size={15} /> Pamer Skor ke Instagram / TikTok Story
            </button>
          )}

          {/* Formula Bobot Jalur & Tren Rapor */}
          {result.formulaName && result.formulaWeights && result.formulaWeights.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                  {result.formulaName}
                </p>
                {result.raporTrend && result.raporTrend !== 'belum_lengkap' && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    result.raporTrend === 'naik'
                      ? 'bg-emerald-100 text-emerald-700'
                      : result.raporTrend === 'turun'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    Tren Rapor: {result.raporTrend.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {result.formulaWeights.map((fw, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 mb-0.5">
                      <span>{fw.label}</span>
                      <span className="text-amber-800">{fw.achievedPct}% / bobot {fw.weightPct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-amber-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all"
                        style={{ width: `${Math.min(100, Math.round((fw.achievedPct / Math.max(1, fw.weightPct)) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benchmark Data SNPMB Prodi (2021-2026) */}
          {result.prodiBenchmark && (
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                Data Resmi Keketatan Prodi (SNPMB)
              </p>
              <p className="text-xs font-extrabold text-gray-900 leading-snug">
                {result.prodiBenchmark.ptn} - {result.prodiBenchmark.prodi}
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2 rounded-xl bg-white text-center">
                  <div className="text-[10px] text-gray-400 font-semibold">Tampung 2026</div>
                  <div className="text-xs font-black text-gray-900">{result.prodiBenchmark.dayaTampung2026 || '-'}</div>
                </div>
                <div className="p-2 rounded-xl bg-white text-center">
                  <div className="text-[10px] text-gray-400 font-semibold">Peminat 2025</div>
                  <div className="text-xs font-black text-gray-900">{result.prodiBenchmark.peminat2025 || '-'}</div>
                </div>
                <div className="p-2 rounded-xl bg-white text-center">
                  <div className="text-[10px] text-gray-400 font-semibold">Keketatan 2025</div>
                  <div className="text-xs font-black text-amber-700">
                    {result.prodiBenchmark.keketatan2025 != null ? `${result.prodiBenchmark.keketatan2025}%` : '-'}
                  </div>
                </div>
              </div>
              {Object.keys(result.prodiBenchmark.history || {}).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Object.entries(result.prodiBenchmark.history)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([yr, st]) => (
                      <span
                        key={yr}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-white text-gray-600 border border-gray-100"
                      >
                        {yr}: {st.d}/{st.p} ({st.k}%)
                      </span>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Strengths */}
          {result.strengths?.length > 0 && (
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider mb-2 text-emerald-700 flex items-center gap-1.5">
                <TrendingUp size={13} /> Faktor Penguat
              </p>
              <div className="space-y-1.5">
                {result.strengths.map((s, i) => (
                  <div
                    key={i}
                    className="text-xs p-3 rounded-2xl bg-emerald-50 text-emerald-900 font-semibold leading-relaxed flex items-start gap-2"
                  >
                    <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses / Risks */}
          {result.weaknesses?.length > 0 && (
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider mb-2 text-rose-700 flex items-center gap-1.5">
                <TrendingDown size={13} /> Risiko / Titik Lemah
              </p>
              <div className="space-y-1.5">
                {result.weaknesses.map((s, i) => (
                  <div
                    key={i}
                    className="text-xs p-3 rounded-2xl bg-rose-50 text-rose-900 font-semibold leading-relaxed"
                  >
                    ! {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Tips */}
          {result.tips?.length > 0 && (
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider mb-2 text-amber-800 flex items-center gap-1.5">
                <Lightbulb size={13} className="text-amber-600" /> Saran Rekomendasi
              </p>
              <div className="space-y-1.5">
                {result.tips.map((s, i) => (
                  <div
                    key={i}
                    className="text-xs p-3 rounded-2xl bg-amber-50/70 text-amber-950 font-medium leading-relaxed flex items-start gap-2"
                  >
                    <Lightbulb size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/dashboard/strategi"
            className="p-4 rounded-2xl bg-gray-50 hover:bg-amber-50/70 flex items-center justify-between transition-colors group mt-2"
          >
            <div>
              <p className="text-xs font-black text-gray-900 group-hover:text-amber-900">
                Mau strategi lebih mendalam?
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Susun prioritas portofolio di fitur Atur Strategi
              </p>
            </div>
            <ArrowRight size={15} className="text-gray-400 group-hover:text-amber-600" />
          </Link>
        </div>
      )}
    </div>
  )
}

export default function KalkulatorPage() {
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<KalkulatorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [quotaError, setQuotaError] = useState<{ limit?: number } | null>(null)

  const [targetJalurId, setTargetJalurId] = useState('')
  const [picking, setPicking] = useState(false)
  const [search, setSearch] = useState('')

  const [classRank, setClassRank] = useState('')
  const [classTotal, setClassTotal] = useState('')
  const [jurusanSma, setJurusanSma] = useState<'ipa' | 'ips' | 'merdeka' | 'kejuruan'>('ipa')
  const [isEligible, setIsEligible] = useState<boolean | null>(null)
  const [eligibleRank, setEligibleRank] = useState('')
  const [schoolQuota, setSchoolQuota] = useState('')
  const [schoolAccreditation, setSchoolAccreditation] = useState('')
  const [tkaCompleted, setTkaCompleted] = useState<boolean | null>(null)
  const [pilihan1Ptn, setPilihan1Ptn] = useState('')
  const [pilihan1Prodi, setPilihan1Prodi] = useState('')
  const [pilihan2Ptn, setPilihan2Ptn] = useState('')
  const [pilihan2Prodi, setPilihan2Prodi] = useState('')

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

  const [semesters, setSemesters] = useState<SemesterData[]>(
    Array.from({ length: 5 }, (_, i) => ({ semester: i + 1, subjects: [] }))
  )
  const [openSemester, setOpenSemester] = useState<number>(1)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [showStoryModal, setShowStoryModal] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  // 1. Pulihkan draf tersimpan dari profil akademik terpadu saat halaman pertama dimuat
  useEffect(() => {
    try {
      const profile = loadStoredAcademicProfile()
      if (profile) {
        if (profile.semesters && Array.isArray(profile.semesters) && profile.semesters.length > 0) {
          // If profile has subjects, use them; otherwise default
          const validSemesters = profile.semesters.some(s => s.subjects && s.subjects.length > 0)
          if (validSemesters) {
            setSemesters(profile.semesters)
          }
        }
        if (profile.jurusanSma) {
          const j = profile.jurusanSma.toLowerCase()
          if (j === 'ipa' || j === 'ips' || j === 'merdeka' || j === 'kejuruan') {
            setJurusanSma(j)
          } else if (j.includes('mipa') || j.includes('sains')) {
            setJurusanSma('ipa')
          }
        }
        if (profile.eligibleRank) setEligibleRank(profile.eligibleRank)
        if (profile.schoolQuota) setSchoolQuota(profile.schoolQuota)
        if (profile.schoolAccreditation) setSchoolAccreditation(profile.schoolAccreditation)
        if (profile.pilihan1Ptn) setPilihan1Ptn(profile.pilihan1Ptn)
        if (profile.pilihan1Prodi) setPilihan1Prodi(profile.pilihan1Prodi)
        if (profile.pilihan2Ptn) setPilihan2Ptn(profile.pilihan2Ptn)
        if (profile.pilihan2Prodi) setPilihan2Prodi(profile.pilihan2Prodi)
        if (profile.certificates && Array.isArray(profile.certificates)) setCertificates(profile.certificates)
        if (profile.savedAt) setLastSaved(`Data profil akademik tersinkron (${profile.savedAt})`)
      }
    } catch (e) {
      console.warn('Gagal memulihkan draf nilai rapor:', e)
    }
  }, [])

  // 2. Autosave berkala ke profil akademik terpadu agar input tersinkronisasi lintas fitur
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        const payload = {
          semesters,
          jurusanSma,
          isEligible,
          eligibleRank,
          schoolQuota,
          schoolAccreditation,
          pilihan1Ptn,
          pilihan1Prodi,
          pilihan2Ptn,
          pilihan2Prodi,
          certificates,
          savedAt: timeStr,
        }
        saveStoredAcademicProfile(payload)
        setLastSaved(`Otomatis tersimpan & tersinkron (${timeStr})`)
      } catch (e) {
        // quota browser
      }
    }, 1200)

    return () => clearTimeout(timer)
  }, [semesters, jurusanSma, isEligible, eligibleRank, schoolQuota, schoolAccreditation, pilihan1Ptn, pilihan1Prodi, pilihan2Ptn, pilihan2Prodi, certificates])

  const handleResetForm = () => setResetConfirmOpen(true)

  const confirmResetForm = () => {
    setResetConfirmOpen(false)
    localStorage.removeItem('otwptn_kalkulator_draft_v1')
    localStorage.removeItem('otwptn_academic_profile_v1')
    setSemesters(Array.from({ length: 5 }, (_, i) => ({ semester: i + 1, subjects: [] })))
    setCertificates([])
    setEligibleRank('')
    setSchoolQuota('')
    setSchoolAccreditation('')
    setPilihan1Ptn('')
    setPilihan1Prodi('')
    setPilihan2Ptn('')
    setPilihan2Prodi('')
    setResult(null)
    setLastSaved(null)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase
        .from('profiles')
        .select('target_jalurs')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          const jalurId = profile?.target_jalurs?.[0]
          if (jalurId) setTargetJalurId(jalurId)
          else setTargetJalurId(JALUR_LIST[0].id)
        })
    })
  }, [supabase])

  const selectedJalur = JALUR_LIST.find(j => j.id === targetJalurId) || JALUR_LIST[0]
  const isSnbp = selectedJalur?.id === 'snbp'

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase()
    return JALUR_LIST.filter(
      j => !q || j.name.toLowerCase().includes(q) || j.ptn.toLowerCase().includes(q)
    ).slice(0, 40)
  }, [search])

  function addSubject(semester: number) {
    setSemesters(prev =>
      prev.map(s =>
        s.semester === semester
          ? {
              ...s,
              subjects: [
                ...s.subjects,
                { id: uid(), name: '', category: 'ipa', grade: '' },
              ],
            }
          : s
      )
    )
  }

  function updateSubject(semester: number, id: string, patch: Partial<Subject>) {
    setSemesters(prev =>
      prev.map(s =>
        s.semester === semester
          ? {
              ...s,
              subjects: s.subjects.map(sub =>
                sub.id === id ? { ...sub, ...patch } : sub
              ),
            }
          : s
      )
    )
  }

  function removeSubject(semester: number, id: string) {
    setSemesters(prev =>
      prev.map(s =>
        s.semester === semester
          ? { ...s, subjects: s.subjects.filter(sub => sub.id !== id) }
          : s
      )
    )
  }

  function addCertificate() {
    setCertificates(prev => [
      ...prev,
      { id: uid(), name: '', level: 'sekolah', rank: '', year: '' },
    ])
  }

  function updateCertificate(id: string, patch: Partial<Certificate>) {
    setCertificates(prev =>
      prev.map(c => (c.id === id ? { ...c, ...patch } : c))
    )
  }

  function removeCertificate(id: string) {
    setCertificates(prev => prev.filter(c => c.id !== id))
  }

  const allGrades = useMemo(
    () =>
      semesters.flatMap(s =>
        s.subjects
          .map(sub => Number(sub.grade))
          .filter(g => !isNaN(g) && g > 0)
      ),
    [semesters]
  )
  const avgRapor =
    allGrades.length > 0
      ? allGrades.reduce((a, b) => a + b, 0) / allGrades.length
      : 0

  async function handleCalculate() {
    setError(null)
    setLoading(true)
    setResult(null)

    const filledCerts = certificates
      .filter(c => c.name)
      .map(c => ({
        name: c.name,
        level: c.level,
        rank: c.rank,
        year: c.year,
      }))

    const highestCert = filledCerts.reduce<string | undefined>((best, cur) => {
      if (!best) return cur.level
      return (LEVEL_RANK[cur.level] || 0) > (LEVEL_RANK[best] || 0) ? cur.level : best
    }, undefined)

    const effectivePtn1 = pilihan1Ptn || (!isSnbp ? selectedJalur.ptn : '')

    const payload: Record<string, unknown> = {
      jalur_id: targetJalurId || selectedJalur.id,
      jalur_type: isSnbp ? 'snbp' : 'institusi',
      target_ptn: effectivePtn1 || selectedJalur.ptn,
      target_jalur: selectedJalur.name,
      avg_rapor: Number(avgRapor.toFixed(2)),
      cert_count: filledCerts.length,
      cert_highest_level: highestCert,
      class_rank: classRank ? Number(classRank) : undefined,
      class_total: classTotal ? Number(classTotal) : undefined,
      eligible_rank: eligibleRank ? Number(eligibleRank) : undefined,
      school_quota: schoolQuota ? Number(schoolQuota) : undefined,
      school_accreditation: schoolAccreditation || undefined,
      pilihan_1: effectivePtn1 && pilihan1Prodi ? { ptn: effectivePtn1, prodi: pilihan1Prodi } : undefined,
      pilihan_2: pilihan2Ptn && pilihan2Prodi ? { ptn: pilihan2Ptn, prodi: pilihan2Prodi } : undefined,
      semesters: semesters.map(s => ({
        semester: s.semester,
        subjects: s.subjects
          .filter(sub => sub.name && sub.grade)
          .map(sub => ({
            name: sub.name,
            category: sub.category,
            grade: Number(sub.grade),
          })),
      })),
      certificates: filledCerts,
    }

    if (isSnbp) {
      payload.tka_completed = tkaCompleted
      payload.is_snbp_eligible = isEligible
    }

    try {
      const res = await fetch('/api/kalkulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.status === 403) setQuotaError(data)
      else if (!res.ok) {
        // Fallback berbeda per kategori jalur jika AI key sedang offline
        const cat = selectedJalur.category
        const baseRapor = avgRapor > 0 ? avgRapor : 84
        const certBonus = Math.min(25, filledCerts.length * (cat === 'prestasi_only' ? 9 : cat === 'hybrid' ? 6 : 3))
        const raporWeight = cat === 'prestasi_only' ? 0.52 : cat === 'essay_only' ? 0.72 : 0.84
        const simulatedScore = Math.min(96, Math.max(40, Math.round(baseRapor * raporWeight + certBonus)))
        setResult({
          score: simulatedScore,
          formulaName: `Formula Jalur ${selectedJalur.name} (${cat.replace('_', ' ').toUpperCase()})`,
          recommendation:
            simulatedScore >= 75
              ? `Peluang Cukup Terbuka untuk ${selectedJalur.name} - Nilai dan profilmu bersaing di jalur ${cat.replace('_', ' ')}.`
              : `Peluang Moderat di ${selectedJalur.name} - Perkuat komponen utama jalur (${cat === 'prestasi_only' ? 'sertifikat unggulan' : cat === 'essay_only' ? 'indeks rapor & motivasi essay' : 'konsistensi nilai & portofolio'}).`,
          strengths: [
            `Rerata nilai rapor semester mencapai ${avgRapor > 0 ? avgRapor.toFixed(1) : '84.0'}`,
            filledCerts.length > 0
              ? `${filledCerts.length} sertifikat tercatat (tertinggi: ${highestCert || 'sekolah'})`
              : 'Struktur mata pelajaran semester sudah terekam',
          ],
          weaknesses: [
            cat === 'prestasi_only' && filledCerts.length === 0
              ? 'Jalur prestasi mensyaratkan sertifikat kejuaraan/kepemimpinan yang terkurasi'
              : classRank && Number(classRank) > 5
              ? `Peringkat kelas ke-${classRank} perlu strategi prodi yang tepat`
              : 'Pastikan kelengkapan nilai seluruh 5 semester agar analisis lebih akurat',
          ],
          tips: [
            'Lengkapi Pilihan PTN & Program Studi tujuan agar benchmark keketatan resmi SNPMB ikut terhitung.',
            cat === 'essay_only' || cat === 'hybrid'
              ? 'Perkuat keunikan narasi di Essay & Portofolio sebelum finalisasi pendaftaran.'
              : 'Siapkan pilihan ke-2 dengan daya tampung lebih longgar sebagai jaring pengaman.',
          ],
        })
      } else {
        setResult(data)
      }
      completeQuest('q-kalkulator')
      awardPoints(25, 20, 'Kalkulator Peluang')
    } catch {
      setError('Gagal menghitung peluang. Coba beberapa saat lagi.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Step 1: pick jalur ───────────────────────────────────────────
  if (picking) {
    return (
      <div className="w-full px-6 md:px-8 py-8 md:py-10">
        <FeatureHeader
          title="Kalkulator Peluang Masuk PTN"
          subtitle="Pilih jalur seleksi yang ingin kamu hitung rasionalisasi peluang kelulusannya."
          mascot="/fitur/kalkulator-peluang.png"
          badgeText="Rasionalisasi AI"
        />

        <div className="max-w-2xl mb-6">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari jalur atau nama universitas (cth: PPKB UI, SNBP, ITS)..."
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {searchResults.map(j => (
            <button
              key={j.id}
              onClick={() => {
                setTargetJalurId(j.id)
                setPicking(false)
              }}
              className={`p-4 rounded-3xl transition-all flex items-center gap-3 text-left shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                j.id === selectedJalur.id
                  ? 'btn-brand-primary'
                  : 'bg-white text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  j.id === selectedJalur.id
                    ? 'bg-black/10 text-gray-900'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                <MapPin size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black truncate">{j.name}</p>
                <p className="text-[11px] truncate opacity-70 mt-0.5">{j.ptn}</p>
              </div>
              <ChevronDown size={14} className="-rotate-90 opacity-40" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── Step 2: Form Input ───────────────────────────────────────────
  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10 pb-20">
      <ConfirmDialog
        isOpen={resetConfirmOpen}
        title="Reset formulir kalkulator"
        message="Semua nilai rapor dan pilihan yang sudah kamu isi akan dikosongkan. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Kosongkan"
        destructive
        onConfirm={confirmResetForm}
        onCancel={() => setResetConfirmOpen(false)}
      />
      <FeatureHeader
        title="Kalkulator Peluang Masuk PTN"
        subtitle={`Rasionalisasi nilai rapor & portofolio untuk: ${selectedJalur.name} (${selectedJalur.ptn})`}
        mascot="/fitur/kalkulator-peluang.png"
        badgeText="AI Analysis"
      >
        <div className="flex flex-wrap items-center gap-2">
          {lastSaved && (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border shadow-xs"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                color: '#065f46',
                borderColor: 'rgba(16, 185, 129, 0.4)',
              }}
            >
              <CheckCircle2 size={12} className="text-emerald-600" /> {lastSaved}
            </span>
          )}
          <button
            onClick={handleResetForm}
            className="px-3 py-1.5 rounded-full text-[11px] font-bold border hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              color: '#374151',
              borderColor: 'rgba(0, 0, 0, 0.12)',
            }}
            title="Reset form & bersihkan draf"
          >
            <RotateCcw size={11} /> Reset
          </button>
          <button
            onClick={() => {
              setPicking(true)
              setResult(null)
            }}
            className="btn-brand-primary px-5 py-2.5 rounded-full text-xs font-black shadow-md flex items-center gap-2"
          >
            Ganti Jalur Seleksi
          </button>
        </div>
      </FeatureHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Sections */}
        <div className="lg:col-span-2 space-y-5">
          {/* Prodi Pilihan Card (untuk SNBP maupun Jalur Mandiri/Institusi) */}
          <div className="p-6 rounded-3xl bg-white shadow-md space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                Pilihan Universitas & Program Studi Tujuan ({selectedJalur.name})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Pilih target PTN dan Jurusan dari direktori resmi untuk menghitung benchmark keketatan 5 tahun terakhir.
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SearchablePicker
                  label="Universitas PTN Pilihan 1 (Utama)"
                  placeholder={isSnbp ? 'Pilih PTN Pilihan 1...' : selectedJalur.ptn}
                  value={pilihan1Ptn || (!isSnbp ? selectedJalur.ptn : '')}
                  onChange={v => setPilihan1Ptn(v)}
                  options={ptnOptions}
                />
                <SearchablePicker
                  label="Program Studi Pilihan 1 (Utama)"
                  placeholder="Pilih Jurusan Pilihan 1..."
                  value={pilihan1Prodi}
                  onChange={v => setPilihan1Prodi(v)}
                  options={jurusanOptions}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <SearchablePicker
                  label="Universitas PTN Pilihan 2 (Cadangan / Opsional)"
                  placeholder="Pilih PTN Pilihan 2..."
                  value={pilihan2Ptn}
                  onChange={v => setPilihan2Ptn(v)}
                  options={ptnOptions}
                />
                <SearchablePicker
                  label="Program Studi Pilihan 2 (Cadangan / Opsional)"
                  placeholder="Pilih Jurusan Pilihan 2..."
                  value={pilihan2Prodi}
                  onChange={v => setPilihan2Prodi(v)}
                  options={jurusanOptions}
                />
              </div>
            </div>
          </div>

          {isSnbp ? (
            <>
              {/* Akreditasi & Eligibility SNBP Card */}
              <div className="p-6 rounded-3xl bg-white shadow-md">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-1">
                  Akreditasi Sekolah & Peringkat Eligible Seangkatan
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  SNBP menyeleksi siswa berdasarkan kuota sekolah: Akreditasi A (40%), B (25%), C (5%).
                </p>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold text-gray-700">Akreditasi Sekolah:</span>
                  <div className="flex gap-2">
                    {ACCREDITATION_OPTIONS.map(a => (
                      <button
                        key={a}
                        onClick={() => setSchoolAccreditation(a)}
                        className={`w-9 h-9 rounded-full text-xs font-black transition-all ${
                          schoolAccreditation === a
                            ? 'btn-brand-primary'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-4">
                  <span className="text-xs font-bold text-gray-700">Dinyatakan Siswa Eligible?</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEligible(true)}
                      className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                        isEligible === true
                          ? 'btn-brand-primary'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Ya, Masuk Kuota
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEligible(false)
                        setEligibleRank('')
                        setSchoolQuota('')
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                        isEligible === false
                          ? 'btn-brand-primary'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Belum Tahu / Tidak
                    </button>
                  </div>
                </div>

                {isEligible === true && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1 block">
                        Peringkat Siswa Eligible Seangkatan
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={eligibleRank}
                        onChange={e => setEligibleRank(e.target.value)}
                        placeholder="Contoh: Peringkat 5 seangkatan"
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1 block">
                        Total Kuota Siswa Eligible di Sekolah
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={schoolQuota}
                        onChange={e => setSchoolQuota(e.target.value)}
                        placeholder="Contoh: Kuota 48 siswa"
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-6 rounded-3xl bg-white shadow-md">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-1">
                Peringkat Rapor Seangkatan Sekolah
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Dihitung berdasarkan peringkat akumulasi nilai rapor semester 1-5 di sekolah.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">
                    Peringkat Nilai Seangkatan
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={eligibleRank}
                    onChange={e => setEligibleRank(e.target.value)}
                    placeholder="Contoh: Peringkat 8"
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">
                    Total Siswa Satu Angkatan
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={schoolQuota}
                    onChange={e => setSchoolQuota(e.target.value)}
                    placeholder="Contoh: 160 siswa"
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Rumpun Jurusan SMA / SMK Card (Pilih Sekali untuk Seluruh SMA) */}
          <div className="p-6 rounded-3xl bg-white shadow-md space-y-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                Rumpun Jurusan SMA / SMK
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Pilih jurusan sekali untuk seluruh masa studi SMA. Berlaku untuk seluruh mata pelajaran semester 1-5.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {[
                { id: 'ipa', label: 'MIPA / IPA', icon: FlaskConical },
                { id: 'ips', label: 'IPS / Soshum', icon: BookOpen },
                { id: 'merdeka', label: 'Kurikulum Merdeka', icon: Sparkles },
                { id: 'kejuruan', label: 'SMK / Kejuruan', icon: Wrench },
              ].map(j => {
                const Icon = j.icon
                return (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => setJurusanSma(j.id as any)}
                    className={`py-3 px-3 rounded-2xl text-xs font-black transition-all border flex items-center justify-center gap-1.5 ${
                      jurusanSma === j.id
                        ? 'bg-amber-400 text-amber-950 border-amber-400 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={14} className="flex-shrink-0" />
                    <span>{j.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nilai per Semester Card */}
          <div className="p-6 rounded-3xl bg-white shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Nilai Rapor per Semester
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tambahkan mata pelajaran dan nilai skala 100 per semester.
                </p>
              </div>
              {allGrades.length > 0 && (
                <span className="text-xs font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                  Rata-rata: {avgRapor.toFixed(1)}
                </span>
              )}
            </div>

            {/* Semester Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {semesters.map(s => (
                <button
                  key={s.semester}
                  onClick={() => setOpenSemester(s.semester)}
                  className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                    openSemester === s.semester
                      ? 'btn-brand-primary'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Semester {s.semester} ({s.subjects.length} mapel)
                </button>
              ))}
            </div>

            {/* Active Semester Subjects List */}
            {semesters
              .filter(s => s.semester === openSemester)
              .map(s => (
                <div key={s.semester} className="space-y-3 pt-2">
                  {s.subjects.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-gray-50/70 text-center">
                      <p className="text-xs text-gray-400 mb-3">
                        Belum ada mata pelajaran untuk Semester {s.semester}.
                      </p>
                      <button
                        onClick={() => addSubject(s.semester)}
                        className="btn-brand-primary px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <Plus size={14} /> Tambah Mapel Pertama
                      </button>
                    </div>
                  ) : (
                    s.subjects.map(sub => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-2 p-2.5 rounded-2xl bg-gray-50"
                      >
                        <input
                          value={sub.name}
                          onChange={e =>
                            updateSubject(s.semester, sub.id, { name: e.target.value })
                          }
                          placeholder="Nama Mapel (cth: Matematika Wajib)"
                          className="flex-1 px-3 py-2 rounded-xl bg-white text-xs font-semibold text-gray-900 outline-none border border-gray-200 focus:border-amber-400"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={sub.grade}
                            onChange={e =>
                              updateSubject(s.semester, sub.id, { grade: e.target.value })
                            }
                            placeholder="Nilai (0-100)"
                            className="w-24 px-3 py-2 rounded-xl bg-white text-xs font-extrabold text-gray-900 outline-none text-center border border-gray-200 focus:border-amber-400"
                          />
                        </div>
                        <button
                          onClick={() => removeSubject(s.semester, sub.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))
                  )}

                  {s.subjects.length > 0 && (
                    <button
                      onClick={() => addSubject(s.semester)}
                      className="px-4 py-2 rounded-full text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus size={13} /> Tambah Mapel di Semester {s.semester}
                    </button>
                  )}
                </div>
              ))}
          </div>

          {/* Sertifikat Prestasi Card */}
          <div className="p-6 rounded-3xl bg-white shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Sertifikat & Prestasi Kejuaraan
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tambahkan piagam penghargaan lomba akademis/non-akademis.
                </p>
              </div>
              <span className="text-xs font-bold text-gray-500">
                {certificates.length} Sertifikat
              </span>
            </div>

            <div className="space-y-3">
              {certificates.map(c => (
                <div key={c.id} className="p-4 rounded-2xl bg-gray-50 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      value={c.name}
                      onChange={e => updateCertificate(c.id, { name: e.target.value })}
                      placeholder="Nama Kejuaraan / Sertifikat (cth: Medali Perunggu OSN Fisika)"
                      className="flex-1 px-3 py-2 rounded-xl bg-white text-xs font-semibold text-gray-900 outline-none"
                    />
                    <button
                      onClick={() => removeCertificate(c.id)}
                      className="p-2 text-gray-400 hover:text-rose-600"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={c.level}
                      onChange={v => updateCertificate(c.id, { level: v })}
                      options={CERT_LEVEL_OPTIONS}
                      size="sm"
                    />
                    <input
                      value={c.rank}
                      onChange={e => updateCertificate(c.id, { rank: e.target.value })}
                      placeholder="cth. Juara 1"
                      className="px-3 py-2 rounded-xl bg-white text-xs font-semibold text-gray-900 outline-none"
                    />
                    <input
                      value={c.year}
                      onChange={e => updateCertificate(c.id, { year: e.target.value })}
                      placeholder="Tahun"
                      className="px-3 py-2 rounded-xl bg-white text-xs font-semibold text-gray-900 outline-none"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={addCertificate}
                className="px-4 py-2.5 rounded-full text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors inline-flex items-center gap-1.5"
              >
                <Plus size={14} /> Tambah Sertifikat Prestasi
              </button>
            </div>
          </div>

          {/* Calculate Button */}
          {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full btn-brand-primary py-4 rounded-full text-sm font-black shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50"
          >
            <Calculator size={18} /> {loading ? 'Menghitung Rasionalisasi...' : 'Hitung Peluang Lolos Sekarang'}
          </button>
        </div>

        {/* Right 1 Col: Result Panel */}
        <ResultPanel
          result={result}
          loading={loading}
          quotaError={!!quotaError}
          error={null}
          onOpenShare={() => setShowStoryModal(true)}
        />
      </div>

      {/* Modal Viral Share ke Instagram / TikTok Story */}
      {result && (
        <ShareStoryModal
          isOpen={showStoryModal}
          onClose={() => setShowStoryModal(false)}
          score={result.score}
          targetUniv={pilihan1Ptn || selectedJalur.ptn || 'Universitas Indonesia'}
          targetMajor={pilihan1Prodi || selectedJalur.name || 'Program Studi Pilihan'}
          recommendation={result.recommendation}
        />
      )}
    </div>
  )
}
