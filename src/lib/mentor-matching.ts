/**
 * SMART MENTOR-MENTEE MATCHING ENGINE
 * 
 * Aturan Pencocokan:
 * 1. Match Jalur (WAJIB / PASTI):
 *    Mentor wajib memiliki keahlian atau merupakan alumni jalur masuk yang dituju mentee
 *    (misal: PPKB UI, SNBP, SJP IPB, PBUB UGM, dsb).
 * 
 * 2. Match Fakultas & Jurusan (OPSIONAL / BONUS RELEVANSI):
 *    Jika fakultas atau jurusan mentee cocok dengan mentor alumni, berikan bobot relevansi tinggi.
 * 
 * 3. Workload Balancing:
 *    Pilih mentor dengan jumlah mentee aktif paling sedikit agar kualitas bimbingan tetap terjaga.
 */

export interface MenteeMatchProfile {
  id: string
  name: string
  school: string
  targetPTN: string
  targetJalur: string
  targetFaculty?: string
  targetMajor?: string
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

  // 1. MATCH JALUR (WAJIB)
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

  // 2. MATCH KAMPUS TARGET
  const normMenteePTN = (mentee.targetPTN || '').toLowerCase()
  const normMentorCampus = (mentor.campus || '').toLowerCase()
  if (normMenteePTN && (normMentorCampus.includes(normMenteePTN) || normMenteePTN.includes(normMentorCampus))) {
    score += 50
    reasons.push(`Alumni Kampus Tujuan (${mentor.campus})`)
  }

  // 3. MATCH JURUSAN & FAKULTAS (OPSIONAL TAPI BONUS BESAR)
  if (mentee.targetMajor && mentor.major) {
    const mMajor = mentee.targetMajor.toLowerCase()
    const mentorMajor = mentor.major.toLowerCase()
    if (mMajor.includes(mentorMajor) || mentorMajor.includes(mMajor)) {
      score += 40
      reasons.push(`Jurusan Selaras (${mentor.major})`)
    }
  }

  if (mentee.targetFaculty && mentor.faculty) {
    const mFac = mentee.targetFaculty.toLowerCase()
    const mentorFac = mentor.faculty.toLowerCase()
    if (mFac.includes(mentorFac) || mentorFac.includes(mFac)) {
      score += 25
      reasons.push(`Fakultas Sama (${mentor.faculty})`)
    }
  }

  // 4. WORKLOAD BALANCING (Makin sedikit mentee aktif, makin diprioritaskan)
  const workloadBonus = Math.max(0, 30 - mentor.activeMenteesCount * 5)
  score += workloadBonus
  if (workloadBonus > 15) {
    reasons.push(`Beban Bimbingan Rendah (${mentor.activeMenteesCount} mentee)`)
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
