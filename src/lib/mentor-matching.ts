import { getFacultyForMajor } from '@/lib/facultyMajorDirectory'
import { JALUR_LIST } from '@/lib/constants'

/**
 * SMART MENTOR-MENTEE MATCHING ENGINE (HIERARKI 5 TAHAP RESMI OTWPTN)
 *
 * Aturan Hierarki Pencocokan:
 * 1. Kesamaan Kategori Jalur (TAHAP 1 - WAJIB):
 *    Cocokkan berdasarkan kategori jalur:
 *    - prestasi_only (cth: SJP UI bisa mentorin SBUB UNDIP, PBUB UGM, Talenta IPB, SMUB UB)
 *    - essay_only (cth: PPKB UI, SSU Rapor/Tes ITB, SMITS ITS)
 *    - hybrid (cth: SSU Talenta Sains ITB, IUP UGM, IUP IPB, IUP ITB)
 *    - inter_iup (Talent Scouting UI bisa mentorin IUP UGM, IUP UNAIR, IUP ITS, dll)
 *    - snbp (SNBP Nasional)
 *    Mentor 'hybrid' / generalist dapat menangani jalur essay maupun prestasi.
 *
 * 2. Kesamaan Jalur Spesifik (TAHAP 2 - +120):
 *    Jika jalur spesifik sama persis (misal sama-sama PPKB UI atau sama-sama SNBP).
 *
 * 3. Kesamaan Rumpun Ilmu: Saintek / Soshum / Vokasi (TAHAP 3 - +80):
 *    Memastikan kesesuaian keilmuan antara mentee dan mentor.
 *
 * 4. Kesamaan Fakultas (TAHAP 4 - +50):
 *    Jika rumpun sama, cari fakultas yang sama (FK, FT, FEB, Fasilkom/STEI, FH, FISIP, FMIPA, dll).
 *
 * 5. Kesamaan Jurusan / Program Studi (TAHAP 5 - +40):
 *    Jika fakultas sama, cari program studi yang identik atau serumpun dekat.
 *
 * 6. Kampus Target (+15) & Workload Balancing (+0 s/d +15):
 *    Alumni PTN impian + pilih mentor dengan beban mentee aktif paling sedikit.
 */

export interface TargetChoice {
  ptn: string
  faculty: string
  major: string
}

export interface MenteeMatchProfile {
  id: string
  name: string
  school: string
  targetPTN: string
  targetJalur: string
  targetTrack?: 'essay' | 'prestasi' | 'hybrid' | string
  targetFaculty?: string
  targetMajor?: string
  targetChoices?: TargetChoice[]
  package: 'Queen Bee' | 'Honeycomb' | 'Nectar'
  registeredDate?: string
}

export interface MentorMatchProfile {
  id: string
  fullName: string
  campus: string
  faculty: string
  major: string
  expertJalur: string[]
  activeMenteesCount: number
  maxMenteesCapacity?: number
  isAvailable: boolean
}

export interface MatchResult {
  menteeId: string
  mentorId: string
  mentorName: string
  matchScore: number
  matchReasons: string[]
}

export type NormalizedCategory = 'prestasi_only' | 'essay_only' | 'hybrid' | 'snbp' | 'inter_iup'
export type RumpunIlmu = 'saintek' | 'soshum' | 'vokasi' | 'umum'

export function getRumpunForMajorOrFaculty(major?: string, faculty?: string): RumpunIlmu {
  const combined = `${major || ''} ${faculty || ''}`.toLowerCase()
  if (!combined.trim()) return 'umum'

  if (
    combined.includes('vokasi') ||
    combined.includes('d3') ||
    combined.includes('d4') ||
    combined.includes('terapan') ||
    combined.includes('politeknik')
  ) {
    return 'vokasi'
  }

  const saintekKeys = [
    'kedokteran', 'dokter', 'farmasi', 'keperawatan', 'gizi', 'kesehatan',
    'fisioterapi', 'kebidanan', 'radiologi', 'teknik', 'arsitektur', 'pwk',
    'komputer', 'informatika', 'sistem informasi', 'sains data', 'stei',
    'fasilkom', 'filkom', 'fmipa', 'matematika', 'statistika', 'aktuaria',
    'fisika', 'kimia', 'biologi', 'geofisika', 'astronomi', 'bioteknologi',
    'pertanian', 'agronomi', 'agribisnis', 'peternakan', 'perikanan', 'kelautan',
    'kehutanan', 'fkm', 'fk', 'ft', 'fttm', 'ftsl', 'fti', 'sf', 'sith',
  ]
  if (saintekKeys.some(k => combined.includes(k))) {
    return 'saintek'
  }

  const soshumKeys = [
    'ekonomi', 'manajemen', 'akuntansi', 'bisnis', 'keuangan', 'kewirausahaan',
    'feb', 'sbm', 'hukum', 'fisip', 'psikologi', 'sosial', 'politik',
    'komunikasi', 'hubungan internasional', 'hi', 'administrasi', 'sosiologi',
    'kriminologi', 'antropologi', 'sastra', 'budaya', 'sejarah', 'filsafat',
    'pendidikan', 'pgsd', 'bimbingan', 'fh', 'fib', 'fpsi', 'fkip',
  ]
  if (soshumKeys.some(k => combined.includes(k))) {
    return 'soshum'
  }

  return 'umum'
}

export function extractJalurInfo(rawInput?: string): {
  categories: NormalizedCategory[]
  tokens: string[]
} {
  const norm = (rawInput || '').toLowerCase().trim()
  if (!norm) {
    return { categories: ['essay_only', 'prestasi_only', 'hybrid'], tokens: [] }
  }

  const categories = new Set<NormalizedCategory>()
  const tokens: string[] = []

  // Match against known JALUR_LIST items
  for (const j of JALUR_LIST) {
    if (norm.includes(j.id.toLowerCase()) || norm.includes(j.name.toLowerCase())) {
      categories.add(j.category)
      if (j.isInter) categories.add('inter_iup')
      tokens.push(j.id.toLowerCase(), j.name.toLowerCase())
    }
  }

  if (norm.includes('talent') || norm.includes('iup') || norm.includes('inter') || norm.includes('kki') || norm.includes('icp')) {
    categories.add('inter_iup')
    categories.add('essay_only')
  }
  if (norm.includes('ppkb') || norm.includes('ssu') || norm.includes('smits') || norm.includes('essay') || norm.includes('esai')) {
    categories.add('essay_only')
  }
  if (
    norm.includes('sjp') || norm.includes('sbub') || norm.includes('pbub') ||
    norm.includes('smup') || norm.includes('smub') || norm.includes('spmb') ||
    norm.includes('smjki') || norm.includes('sima') || norm.includes('talenta') ||
    norm.includes('osis') || norm.includes('smua') || norm.includes('prestasi') ||
    norm.includes('golden ticket') || norm.includes('olimpiade') || norm.includes('juara')
  ) {
    categories.add('prestasi_only')
  }
  if (norm.includes('snbp')) {
    categories.add('snbp')
    categories.add('prestasi_only')
  }
  if (norm.includes('hybrid')) {
    categories.add('hybrid')
    categories.add('essay_only')
    categories.add('prestasi_only')
  }

  if (categories.size === 0) {
    categories.add('essay_only')
  }

  return { categories: Array.from(categories), tokens }
}

/**
 * Menghitung skor kecocokan antara 1 mentee dengan 1 mentor
 * Berdasarkan hierarki 5 tahap:
 * 1. Kesamaan Kategori Jalur -> 2. Kesamaan Jalur Spesifik -> 3. Rumpun -> 4. Fakultas -> 5. Jurusan -> 6. Kampus & Workload
 */
export function calculateMatchScore(
  mentee: MenteeMatchProfile,
  mentor: MentorMatchProfile
): { score: number; reasons: string[] } {
  if (!mentor.isAvailable) {
    return { score: -1, reasons: ['Mentor sedang cuti/tidak tersedia'] }
  }

  const maxCap = mentor.maxMenteesCapacity || 15
  if (mentor.activeMenteesCount >= maxCap) {
    return { score: -1, reasons: ['Kapasitas bimbingan mentor sudah penuh'] }
  }

  let score = 0
  const reasons: string[] = []

  // TAHAP 1: KESAMAAN KATEGORI JALUR (WAJIB / PRIORITAS PERTAMA)
  const menteeJalurText = `${mentee.targetJalur || ''} ${mentee.targetTrack || ''}`.trim()
  const menteeJalurInfo = extractJalurInfo(menteeJalurText)
  const mentorJalurJoined = mentor.expertJalur.join(' ')
  const mentorJalurInfo = extractJalurInfo(mentorJalurJoined)

  const isMentorGeneralist = mentor.expertJalur.length === 0 || mentorJalurInfo.categories.includes('hybrid')
  const sharedCategories = menteeJalurInfo.categories.filter(c => mentorJalurInfo.categories.includes(c))

  if (sharedCategories.length === 0 && !isMentorGeneralist) {
    return { score: 0, reasons: ['Kategori jalur tidak cocok'] }
  }

  score += sharedCategories.length > 0 ? 200 : 140
  reasons.push(
    sharedCategories.length > 0
      ? `Tahap 1 Lolos: Kesamaan Kategori Jalur (${sharedCategories[0]})`
      : 'Tahap 1 Lolos: Mentor Generalist / Hybrid'
  )

  // TAHAP 2: KESAMAAN JALUR SPESIFIK
  const normMenteeJalur = (mentee.targetJalur || '').toLowerCase()
  const hasExactJalur = normMenteeJalur
    ? mentor.expertJalur.some(j => {
        const jl = j.toLowerCase().trim()
        return jl && (normMenteeJalur.includes(jl) || jl.includes(normMenteeJalur))
      }) || menteeJalurInfo.tokens.some(tok => mentorJalurJoined.toLowerCase().includes(tok))
    : false

  if (hasExactJalur) {
    score += 120
    reasons.push(`Tahap 2: Jalur Spesifik Sama (${mentee.targetJalur})`)
  }

  // Kumpulkan target fakultas & jurusan dari choice 1 maupun field langsung
  const primaryChoice = mentee.targetChoices?.[0]
  const targetCampus = (mentee.targetPTN || primaryChoice?.ptn || '').trim()
  const targetMaj = (mentee.targetMajor || primaryChoice?.major || '').trim()
  const targetFac = (
    mentee.targetFaculty ||
    primaryChoice?.faculty ||
    (targetMaj ? getFacultyForMajor(targetMaj, targetCampus) : '')
  ).trim()

  // TAHAP 3: KESAMAAN RUMPUN ILMU (SAINTEK / SOSHUM / VOKASI)
  const menteeRumpun = getRumpunForMajorOrFaculty(targetMaj, targetFac)
  const mentorFac = (mentor.faculty || getFacultyForMajor(mentor.major, mentor.campus)).trim()
  const mentorRumpun = getRumpunForMajorOrFaculty(mentor.major, mentorFac)

  if (menteeRumpun !== 'umum' && mentorRumpun !== 'umum') {
    if (menteeRumpun === mentorRumpun) {
      score += 80
      reasons.push(`Tahap 3: Kesamaan Rumpun (${menteeRumpun.toUpperCase()})`)
    } else {
      // Penalti jika beda rumpun (misal Saintek vs Soshum)
      score -= 30
    }
  }

  // TAHAP 4: KESAMAAN FAKULTAS
  const normTargetFac = targetFac.toLowerCase()
  const normMentorFac = mentorFac.toLowerCase()
  if (normTargetFac && normMentorFac && normTargetFac !== 'fakultas terkait' && normMentorFac !== 'fakultas terkait') {
    const isFacMatch =
      normMentorFac.includes(normTargetFac) ||
      normTargetFac.includes(normMentorFac) ||
      (normTargetFac.includes('kedokteran gigi') && normMentorFac.includes('kedokteran gigi')) ||
      (!normTargetFac.includes('gigi') && normTargetFac.includes('kedokteran') && !normMentorFac.includes('gigi') && normMentorFac.includes('kedokteran')) ||
      (normTargetFac.includes('teknik') && normMentorFac.includes('teknik')) ||
      ((normTargetFac.includes('ilmu komputer') || normTargetFac.includes('informatika') || normTargetFac.includes('stei') || normTargetFac.includes('fasilkom') || normTargetFac.includes('filkom')) &&
       (normMentorFac.includes('ilmu komputer') || normMentorFac.includes('informatika') || normMentorFac.includes('stei') || normMentorFac.includes('fasilkom') || normMentorFac.includes('filkom'))) ||
      ((normTargetFac.includes('ekonomi') || normTargetFac.includes('feb') || normTargetFac.includes('sbm')) &&
       (normMentorFac.includes('ekonomi') || normMentorFac.includes('feb') || normMentorFac.includes('sbm'))) ||
      (normTargetFac.includes('hukum') && normMentorFac.includes('hukum'))

    if (isFacMatch) {
      score += 50
      reasons.push(`Tahap 4: Kesamaan Fakultas (${mentorFac})`)
    }
  }

  // TAHAP 5: KESAMAAN JURUSAN / PRODI SPESIFIK
  const normTargetMaj = targetMaj.toLowerCase()
  const normMentorMaj = (mentor.major || '').toLowerCase()
  if (normTargetMaj && normMentorMaj) {
    if (normMentorMaj.includes(normTargetMaj) || normTargetMaj.includes(normMentorMaj)) {
      score += 40
      reasons.push(`Tahap 5: Jurusan Identik (${mentor.major})`)
    }
  }

  // BONUS: ALUMNI PTN TARGET (+15)
  const normTargetCampus = targetCampus.toLowerCase()
  const normMentorCampus = (mentor.campus || '').toLowerCase()
  if (normTargetCampus && normMentorCampus) {
    const isCampusMatch =
      normMentorCampus.includes(normTargetCampus) ||
      normTargetCampus.includes(normMentorCampus) ||
      (normTargetCampus.includes('indonesia') && normMentorCampus === 'ui') ||
      (normTargetCampus.includes('bandung') && normMentorCampus === 'itb') ||
      (normTargetCampus.includes('gadjah mada') && normMentorCampus === 'ugm') ||
      (normTargetCampus.includes('airlangga') && normMentorCampus === 'unair') ||
      (normTargetCampus.includes('diponegoro') && normMentorCampus === 'undip') ||
      (normTargetCampus.includes('padjadjaran') && normMentorCampus === 'unpad') ||
      (normTargetCampus.includes('sepuluh nopember') && normMentorCampus === 'its') ||
      (normTargetCampus.includes('brawijaya') && normMentorCampus === 'ub') ||
      (normTargetCampus.includes('ipb') && normMentorCampus.includes('ipb'))

    if (isCampusMatch) {
      score += 15
      reasons.push(`Alumni PTN Tujuan (${mentor.campus})`)
    }
  }

  // WORKLOAD BALANCING (+0 s/d +15)
  const availabilityBonus = Math.max(0, 15 - mentor.activeMenteesCount)
  score += availabilityBonus

  return { score, reasons }
}

/**
 * Mencari 1 mentor terbaik dari pool mentor aktif untuk 1 mentee
 */
export function findBestMentorForMentee(
  mentee: MenteeMatchProfile,
  mentors: MentorMatchProfile[]
): MatchResult | null {
  let bestMentor: MentorMatchProfile | null = null
  let bestScore = -1
  let bestReasons: string[] = []

  for (const mentor of mentors) {
    const { score, reasons } = calculateMatchScore(mentee, mentor)
    if (score > bestScore) {
      bestScore = score
      bestMentor = mentor
      bestReasons = reasons
    }
  }

  if (!bestMentor || bestScore <= 0) {
    return null
  }

  return {
    menteeId: mentee.id,
    mentorId: bestMentor.id,
    mentorName: bestMentor.fullName,
    matchScore: bestScore,
    matchReasons: bestReasons,
  }
}

/**
 * Menjalankan Auto-Match massal untuk seluruh daftar mentee sekaligus
 * (Secara dinamis menaikkan activeMenteesCount agar beban tersebar merata)
 */
export function runBulkAutoMatch(
  mentees: MenteeMatchProfile[],
  mentors: MentorMatchProfile[]
): Record<string, MatchResult> {
  const liveMentors = mentors.map(m => ({ ...m }))
  const assignments: Record<string, MatchResult> = {}

  const priorityWeight = (pkg: string) =>
    pkg === 'Queen Bee' ? 3 : pkg === 'Honeycomb' ? 2 : 1

  const sortedMentees = [...mentees].sort(
    (a, b) => priorityWeight(b.package) - priorityWeight(a.package)
  )

  for (const mentee of sortedMentees) {
    const match = findBestMentorForMentee(mentee, liveMentors)
    if (match) {
      assignments[mentee.id] = match
      const chosen = liveMentors.find(m => m.id === match.mentorId)
      if (chosen) {
        chosen.activeMenteesCount += 1
      }
    }
  }

  return assignments
}

export interface BatchAssignmentItem {
  menteeId: string
  menteeName: string
  mentorId: string
  mentorName: string
  targetPTN: string
  matchScore: number
  matchReasons: string[]
}

/**
 * Wrapper kompatibilitas untuk batch assignment di halaman admin mentor
 */
export function autoAssignBatchMentees(
  mentees: MenteeMatchProfile[],
  mentors: MentorMatchProfile[]
): { assigned: BatchAssignmentItem[]; unassigned: MenteeMatchProfile[] } {
  const resultMap = runBulkAutoMatch(mentees, mentors)
  const assigned: BatchAssignmentItem[] = []
  const unassigned: MenteeMatchProfile[] = []

  for (const mentee of mentees) {
    const match = resultMap[mentee.id]
    if (match) {
      assigned.push({
        menteeId: mentee.id,
        menteeName: mentee.name,
        mentorId: match.mentorId,
        mentorName: match.mentorName,
        targetPTN: mentee.targetPTN,
        matchScore: match.matchScore,
        matchReasons: match.matchReasons,
      })
    } else {
      unassigned.push(mentee)
    }
  }

  return { assigned, unassigned }
}
