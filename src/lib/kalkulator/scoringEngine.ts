import snpmbStatsRaw from '@/lib/kalkulator/snpmbStats.json'
import { JALUR_LIST } from '@/lib/constants'

export interface ProdiStatRecord {
  ptn: string
  prodi: string
  jenjang: string
  dt26: number
  pem25: number
  k25: number | null
  portofolio: boolean
  hist: Record<string, { p: number; d: number; k: number }>
}

const SNPMB_STATS = snpmbStatsRaw as ProdiStatRecord[]

export interface KalkulatorInput {
  jalur_id?: string
  jalur_type?: 'snbp' | 'institusi'
  target_ptn?: string
  target_jalur?: string
  avg_rapor: number
  school_rank_tier?: string
  cert_count: number
  cert_highest_level?: string
  semesters?: { semester: number; subjects: { name: string; category: string; grade: number }[] }[]
  certificates?: { name: string; level: string; rank: string; year: string }[]
  class_rank?: number
  class_total?: number
  is_snbp_eligible?: boolean
  eligible_rank?: number
  school_quota?: number
  school_accreditation?: string
  tka_completed?: boolean
  pilihan_1?: { ptn: string; prodi: string }
  pilihan_2?: { ptn: string; prodi: string }
}

export interface DeterministicScoreResult {
  score: number
  formulaName: string
  formulaWeights: { label: string; weightPct: number; achievedPct: number }[]
  prodiBenchmark: {
    ptn: string
    prodi: string
    dayaTampung2026: number
    peminat2025: number
    keketatan2025: number | null
    history: Record<string, { p: number; d: number; k: number }>
  } | null
  raporTrend: 'naik' | 'stabil' | 'turun' | 'belum_lengkap'
  semesterAverages: number[]
}

function normalizePtnName(s: string): string {
  return s
    .toLowerCase()
    .replace(/universitas negeri /g, 'universitas negeri ')
    .replace(/universitas /g, '')
    .replace(/institut teknologi /g, '')
    .replace(/\([^)]*\)/g, '')
    .trim()
}

export function findProdiStats(ptnName?: string, prodiName?: string): ProdiStatRecord | null {
  if (!ptnName || !prodiName) return null
  const pLower = ptnName.toLowerCase().trim()
  const pNorm = normalizePtnName(ptnName)
  const mLower = prodiName.toLowerCase().trim()

  const ptnMatches = SNPMB_STATS.filter(r => {
    const rp = r.ptn.toLowerCase()
    return rp === pLower || rp.includes(pNorm) || pLower.includes(normalizePtnName(rp))
  })

  if (ptnMatches.length === 0) return null

  const exact = ptnMatches.find(r => r.prodi.toLowerCase() === mLower)
  if (exact) return exact

  const includes = ptnMatches.find(
    r => r.prodi.toLowerCase().includes(mLower) || mLower.includes(r.prodi.toLowerCase())
  )
  if (includes) return includes

  // Token overlap fallback
  const tokens = mLower.split(/\s+/).filter(t => t.length > 2)
  let best: ProdiStatRecord | null = null
  let bestHits = 0
  for (const r of ptnMatches) {
    const rp = r.prodi.toLowerCase()
    const hits = tokens.filter(t => rp.includes(t)).length
    if (hits > bestHits) {
      bestHits = hits
      best = r
    }
  }
  return bestHits > 0 ? best : null
}

function computeRaporMetrics(input: KalkulatorInput) {
  const sems = (input.semesters ?? [])
    .slice()
    .sort((a, b) => a.semester - b.semester)

  const semesterAverages: number[] = []
  const allGrades: number[] = []

  for (const s of sems) {
    const valid = s.subjects.map(sub => Number(sub.grade)).filter(g => !isNaN(g) && g > 0 && g <= 100)
    if (valid.length > 0) {
      allGrades.push(...valid)
      semesterAverages.push(Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2)))
    }
  }

  const avgRapor =
    allGrades.length > 0
      ? Number((allGrades.reduce((a, b) => a + b, 0) / allGrades.length).toFixed(2))
      : Number(input.avg_rapor || 0)

  let trend: 'naik' | 'stabil' | 'turun' | 'belum_lengkap' = 'belum_lengkap'
  if (semesterAverages.length >= 2) {
    const first = semesterAverages[0]
    const last = semesterAverages[semesterAverages.length - 1]
    const diff = last - first
    if (diff >= 1.0) trend = 'naik'
    else if (diff <= -1.0) trend = 'turun'
    else trend = 'stabil'
  }

  return { avgRapor, semesterAverages, trend }
}

function computeCertScore(input: KalkulatorInput): number {
  const levelScoreMap: Record<string, number> = {
    internasional: 96,
    nasional: 86,
    provinsi: 72,
    kabupaten_kota: 52,
    kab_kota: 52,
    sekolah: 36,
  }
  const highestKey = (input.cert_highest_level || '').toLowerCase()
  let base = levelScoreMap[highestKey] ?? 0

  const certs = input.certificates ?? []
  if (certs.length > 0) {
    const scores = certs.map(c => levelScoreMap[c.level.toLowerCase()] ?? 35)
    base = Math.max(base, ...scores)
  }

  const count = Math.max(input.cert_count || 0, certs.length)
  if (count === 0) return 15
  const extraBonus = Math.min(8, (count - 1) * 3)
  return Math.min(100, base + extraBonus)
}

function computeSchoolRankScore(input: KalkulatorInput): number {
  if (input.class_rank && input.class_total && input.class_total > 0) {
    const pct = (input.class_rank / input.class_total) * 100
    if (pct <= 5) return 96
    if (pct <= 10) return 88
    if (pct <= 20) return 78
    if (pct <= 40) return 65
    return 48
  }
  if (input.eligible_rank && input.school_quota && input.school_quota > 0) {
    const pct = (input.eligible_rank / input.school_quota) * 100
    if (pct <= 15) return 94
    if (pct <= 40) return 82
    if (pct <= 75) return 70
    return 58
  }
  const tierMap: Record<string, number> = {
    top5: 94,
    top10: 86,
    top25: 74,
    average: 60,
    below: 45,
  }
  return tierMap[(input.school_rank_tier || '').toLowerCase()] ?? 65
}

export function calculateDeterministicChance(input: KalkulatorInput): DeterministicScoreResult {
  const jalurObj = JALUR_LIST.find(
    j =>
      j.id === input.jalur_id ||
      j.name.toLowerCase() === (input.target_jalur || '').toLowerCase()
  )
  const category = jalurObj?.category ?? (input.jalur_type === 'snbp' ? 'snbp' : 'essay_only')
  const isInter = Boolean(jalurObj?.isInter)

  const targetPtn = input.pilihan_1?.ptn || input.target_ptn || jalurObj?.ptn || ''
  const targetProdi = input.pilihan_1?.prodi || ''
  const stats = findProdiStats(targetPtn, targetProdi)

  const { avgRapor, semesterAverages, trend } = computeRaporMetrics(input)
  const certScore = computeCertScore(input)
  const rankScore = computeSchoolRankScore(input)

  // Normalized rapor component (70 -> 30, 85 -> 72, 92 -> 90, 96 -> 98)
  const raporNorm = avgRapor > 0
    ? Math.max(20, Math.min(99, (avgRapor - 60) * 2.4))
    : 60
  const trendAdj = trend === 'naik' ? 5 : trend === 'turun' ? -5 : 0
  const raporComponent = Math.max(20, Math.min(100, raporNorm + trendAdj))

  const accredBonus =
    input.school_accreditation === 'A' ? 92 : input.school_accreditation === 'B' ? 74 : input.school_accreditation === 'C' ? 55 : 75

  // Real official keketatan difficulty factor (from 5,142 SNPMB records)
  let keketatanFactor = 0
  if (stats && stats.k25 !== null) {
    if (stats.k25 < 3) keketatanFactor = -10
    else if (stats.k25 < 6) keketatanFactor = -6
    else if (stats.k25 < 12) keketatanFactor = -2
    else if (stats.k25 >= 25) keketatanFactor = +4
  }

  let rawScore = 65
  let formulaName = 'Formula Standar Seleksi Non-Tes'
  let formulaWeights: { label: string; weightPct: number; achievedPct: number }[] = []

  if (category === 'snbp') {
    formulaName = 'Formula SNBP Resmi (Komponen 1 Rapor 50% + Pendukung/Peringkat 30% + Sekolah 10% + Prestasi 10%)'
    const tkaPenalty = input.tka_completed === false ? -15 : 0
    const eligiblePenalty = input.is_snbp_eligible === false ? -20 : 0
    rawScore =
      raporComponent * 0.50 +
      rankScore * 0.30 +
      accredBonus * 0.10 +
      certScore * 0.10 +
      keketatanFactor +
      tkaPenalty +
      eligiblePenalty

    formulaWeights = [
      { label: 'Rerata & Tren Rapor Sem 1-5', weightPct: 50, achievedPct: Math.round(raporComponent) },
      { label: 'Peringkat Paralel & Mapel Pendukung', weightPct: 30, achievedPct: Math.round(rankScore) },
      { label: 'Indeks & Akreditasi Sekolah', weightPct: 10, achievedPct: Math.round(accredBonus) },
      { label: 'Prestasi Linier (Maks 3 Terbaik)', weightPct: 10, achievedPct: Math.round(certScore) },
    ]
  } else if (category === 'prestasi_only') {
    formulaName = 'Formula Jalur Prestasi (Sertifikat/Kepemimpinan 55% + Rapor KKM 30% + Indeks & Peringkat 15%)'
    // Hard check: many PTN prestasi paths (like SBUB UNDIP) require avg >= 70
    const belowMinRapor = avgRapor > 0 && avgRapor < 70 ? -25 : 0
    rawScore =
      certScore * 0.55 +
      raporComponent * 0.30 +
      rankScore * 0.15 +
      keketatanFactor +
      belowMinRapor

    formulaWeights = [
      { label: 'Bobot Sertifikat & Kejuaraan / Ketua OSIS', weightPct: 55, achievedPct: Math.round(certScore) },
      { label: 'Kestabilan Rapor Sem 1-5 (Ambang KKM)', weightPct: 30, achievedPct: Math.round(raporComponent) },
      { label: 'Peringkat Sekolah & Linieritas Prodi', weightPct: 15, achievedPct: Math.round(rankScore) },
    ]
  } else if (category === 'hybrid' || isInter) {
    formulaName = isInter
      ? 'Formula Jalur Internasional / IUP (Rapor & Akademik 40% + Sertifikat/Profil 30% + Kesiapan Esai/Inggris 30%)'
      : 'Formula Jalur Hybrid (Rapor 35% + Sertifikat Prestasi 35% + Esai & Peringkat 30%)'
    const essayPrepBaseline = 72
    rawScore =
      raporComponent * (isInter ? 0.40 : 0.35) +
      certScore * (isInter ? 0.30 : 0.35) +
      ((rankScore + essayPrepBaseline) / 2) * 0.30 +
      keketatanFactor

    formulaWeights = [
      { label: 'Nilai Rapor & Konsistensi 5 Semester', weightPct: isInter ? 40 : 35, achievedPct: Math.round(raporComponent) },
      { label: 'Portofolio Sertifikat & Prestasi', weightPct: isInter ? 30 : 35, achievedPct: Math.round(certScore) },
      { label: 'Peringkat Sekolah & Kesiapan Esai/Wawancara', weightPct: 30, achievedPct: Math.round((rankScore + essayPrepBaseline) / 2) },
    ]
  } else {
    // essay_only (PPKB UI, SSU ITB, SMITS FLAT ITS)
    formulaName = 'Formula Jalur Essay (Rapor & Tren 5 Sem 50% + Peringkat & Indeks Sekolah 30% + Faktor Esai/Prestasi 20%)'
    const supportScore = Math.max(certScore, 65)
    rawScore =
      raporComponent * 0.50 +
      rankScore * 0.30 +
      supportScore * 0.20 +
      keketatanFactor

    formulaWeights = [
      { label: 'Rerata & Grafik Tren Rapor 5 Semester', weightPct: 50, achievedPct: Math.round(raporComponent) },
      { label: 'Indeks Sekolah & Peringkat Paralel', weightPct: 30, achievedPct: Math.round(rankScore) },
      { label: 'Sertifikat & Kesiapan Esai Motivasi', weightPct: 20, achievedPct: Math.round(supportScore) },
    ]
  }

  const finalScore = Math.max(15, Math.min(96, Math.round(rawScore)))

  return {
    score: finalScore,
    formulaName,
    formulaWeights,
    prodiBenchmark: stats
      ? {
          ptn: stats.ptn,
          prodi: stats.prodi,
          dayaTampung2026: stats.dt26,
          peminat2025: stats.pem25,
          keketatan2025: stats.k25,
          history: stats.hist,
        }
      : null,
    raporTrend: trend,
    semesterAverages,
  }
}
