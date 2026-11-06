import { getFacultyForMajor } from '@/lib/facultyMajorDirectory'

/**
 * SMART MENTOR-MENTEE MATCHING ENGINE
 * 
 * Aturan Hierarki Pencocokan Resmi OtwPTN:
 * 1. Match Jalur (WAJIB / PASTI):
 *    Mentor wajib memiliki keahlian atau merupakan alumni jalur masuk yang dituju mentee
 *    (misal: PPKB UI, SNBP, SJP IPB, PBUB UGM, IUP, dsb).
 * 
 * 2. Match Fakultas (PRIORITAS UTAMA SETELAH JALUR):
 *    Jika fakultas mentee cocok dengan mentor alumni (cth: FK, FT, FEB, Fasilkom/STEI),
 *    diberikan bobot poin terbesar (+50).
 * 
 * 3. Match Jurusan (PRIORITAS KETIGA):
 *    Jika program studi mentee selaras spesifik dengan mentor (+30).
 * 
 * 4. Match Kampus Target (+20):
 *    Mentor merupakan alumni PTN impian mentee.
 * 
 * 5. Workload Balancing (+0 s/d +15):
 *    Pilih mentor dengan jumlah mentee aktif paling sedikit agar kualitas bimbingan tetap terjaga.
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

/**
 * Menghitung skor kecocokan antara 1 mentee dengan 1 mentor
 * Berdasarkan hierarki ketat: Jalur -> Fakultas -> Jurusan -> Kampus -> Workload
 */
export function calculateMatchScore(
  mentee: MenteeMatchProfile,
  mentor: MentorMatchProfile
): { score: number; reasons: string[] } {
  // Jika mentor tidak tersedia atau sudah penuh kapasitas
  if (!mentor.isAvailable) {
    return { score: -1, reasons: ['Mentor sedang cuti/tidak tersedia'] }
  }

  const maxCap = mentor.maxMenteesCapacity || 15
  if (mentor.activeMenteesCount >= maxCap) {
    return { score: -1, reasons: ['Kapasitas bimbingan mentor sudah penuh'] }
  }

  let score = 0
  const reasons: string[] = []

  // 1. MATCH JALUR (WAJIB - PRIORITAS PERTAMA)
  const normMenteeJalur = (mentee.targetJalur || '').toLowerCase()
  const hasExactJalur = mentor.expertJalur.some(j =>
    normMenteeJalur.includes(j.toLowerCase()) || j.toLowerCase().includes(normMenteeJalur)
  )

  if (!hasExactJalur) {
    // Jika jalur tidak ada yang cocok sama sekali, tidak bisa di-assign
    return { score: 0, reasons: ['Jalur tidak cocok'] }
  }

  score += 100
  reasons.push(`Cocok Jalur ${mentee.targetJalur}`)

  // Kumpulkan target fakultas & jurusan dari choice 1 maupun field langsung
  const primaryChoice = mentee.targetChoices?.[0]
  const targetFac = (mentee.targetFaculty || primaryChoice?.faculty || (mentee.targetMajor ? getFacultyForMajor(mentee.targetMajor, mentee.targetPTN) : '')).toLowerCase()
  const targetMaj = (mentee.targetMajor || primaryChoice?.major || '').toLowerCase()
  const targetCampus = (mentee.targetPTN || primaryChoice?.ptn || '').toLowerCase()

  // 2. MATCH FAKULTAS (PRIORITAS KEDUA SETELAH JALUR)
  const mentorFac = (mentor.faculty || '').toLowerCase()
  if (targetFac && mentorFac) {
    const isFacMatch =
      mentorFac.includes(targetFac) ||
      targetFac.includes(mentorFac) ||
      // Normalisasi akronim populer
      (targetFac.includes('kedokteran gigi') && mentorFac.includes('kedokteran gigi')) ||
      (!targetFac.includes('gigi') && targetFac.includes('kedokteran') && !mentorFac.includes('gigi') && mentorFac.includes('kedokteran')) ||
      (targetFac.includes('teknik') && mentorFac.includes('teknik')) ||
      ((targetFac.includes('ilmu komputer') || targetFac.includes('informatika') || targetFac.includes('stei') || targetFac.includes('fasilkom') || targetFac.includes('filkom')) &&
       (mentorFac.includes('ilmu komputer') || mentorFac.includes('informatika') || mentorFac.includes('stei') || mentorFac.includes('fasilkom') || mentorFac.includes('filkom'))) ||
      ((targetFac.includes('ekonomi') || targetFac.includes('feb') || targetFac.includes('sbm')) &&
       (mentorFac.includes('ekonomi') || mentorFac.includes('feb') || mentorFac.includes('sbm'))) ||
      (targetFac.includes('hukum') && mentorFac.includes('hukum'))

    if (isFacMatch) {
      score += 50
      reasons.push(`Fakultas Sama (${mentor.faculty})`)
    }
  }

  // 3. MATCH JURUSAN (PRIORITAS KETIGA SETELAH FAKULTAS)
  const mentorMaj = (mentor.major || '').toLowerCase()
  if (targetMaj && mentorMaj) {
    if (targetMaj.includes(mentorMaj) || mentorMaj.includes(targetMaj)) {
      score += 30
      reasons.push(`Jurusan Selaras (${mentor.major})`)
    }
  }

  // 4. MATCH KAMPUS TARGET
  const mentorCampus = (mentor.campus || '').toLowerCase()
  if (targetCampus && (mentorCampus.includes(targetCampus) || targetCampus.includes(mentorCampus))) {
    score += 20
    reasons.push(`Alumni Kampus Tujuan (${mentor.campus})`)
  }

  // Cek juga pilihan 2 jika ada
  const secondaryChoice = mentee.targetChoices?.[1]
  if (secondaryChoice) {
    const secFac = (secondaryChoice.faculty || getFacultyForMajor(secondaryChoice.major, secondaryChoice.ptn)).toLowerCase()
    if (secFac && mentorFac && (mentorFac.includes(secFac) || secFac.includes(mentorFac))) {
      score += 15
      reasons.push(`Cocok Fakultas Pilihan 2 (${secondaryChoice.faculty})`)
    }
  }

  // 5. WORKLOAD BALANCING (Makin sedikit mentee aktif, makin diprioritaskan)
  const workloadBonus = Math.max(0, 15 - mentor.activeMenteesCount * 2)
  score += workloadBonus
  if (workloadBonus >= 10) {
    reasons.push(`Beban Bimbingan Ringan (${mentor.activeMenteesCount} mentee)`)
  }

  return { score, reasons }
}

/**
 * Mencari 1 mentor terbaik untuk 1 mentee
 */
export function findBestMentorForMentee(
  mentee: MenteeMatchProfile,
  mentors: MentorMatchProfile[]
): MatchResult | null {
  let highestScore = 0
  let bestMentor: MentorMatchProfile | null = null
  let bestReasons: string[] = []

  for (const mentor of mentors) {
    const { score, reasons } = calculateMatchScore(mentee, mentor)
    if (score > highestScore) {
      highestScore = score
      bestMentor = mentor
      bestReasons = reasons
    }
  }

  if (!bestMentor || highestScore <= 0) return null

  return {
    menteeId: mentee.id,
    mentorId: bestMentor.id,
    mentorName: bestMentor.fullName,
    matchScore: highestScore,
    matchReasons: bestReasons,
  }
}

/**
 * Otomatis memetakan seluruh antrean mentee ke mentor terbaik secara adil & berimbang
 */
export function autoAssignBatchMentees(
  unassignedMentees: MenteeMatchProfile[],
  mentors: MentorMatchProfile[]
): {
  assigned: Array<MatchResult & { menteeName: string; targetPTN: string; targetJalur: string }>
  unmatched: MenteeMatchProfile[]
} {
  const assigned: Array<MatchResult & { menteeName: string; targetPTN: string; targetJalur: string }> = []
  const unmatched: MenteeMatchProfile[] = []

  // Salin mentor agar bisa melacak penambahan beban secara dinamis selama batch
  const liveMentors = mentors.map(m => ({ ...m }))

  for (const mentee of unassignedMentees) {
    const match = findBestMentorForMentee(mentee, liveMentors)
    if (match) {
      assigned.push({
        ...match,
        menteeName: mentee.name,
        targetPTN: mentee.targetPTN,
        targetJalur: mentee.targetJalur,
      })

      // Update beban mentor yang terpilih agar tidak overload
      const targetM = liveMentors.find(m => m.id === match.mentorId)
      if (targetM) {
        targetM.activeMenteesCount += 1
      }
    } else {
      unmatched.push(mentee)
    }
  }

  return { assigned, unmatched }
}
