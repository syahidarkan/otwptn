export interface AcademicSubject {
  id: string
  name: string
  category: string
  grade: string
}

export interface AcademicSemester {
  semester: number
  subjects: AcademicSubject[]
}

export interface AcademicCertificate {
  id: string
  name: string
  level: string
  rank: string
  year: string
}

export interface MentorAnalysisData {
  score?: number
  eligibilityStatus?: 'Sangat Kompetitif' | 'Cukup Kompetitif' | 'Berisiko Tinggi'
  linearSubjectsAnalysis?: string
  riskNotes?: string
  alternativeProdi1?: string
  alternativeProdi2?: string
  mentorNotes?: string
  mentorName?: string
  reviewedAt?: string
}

export interface AcademicProfileData {
  schoolName: string
  jurusanSma: string
  eligibleRank: string
  schoolQuota: string
  schoolAccreditation: string
  alumniCount: string
  pilihan1Ptn: string
  pilihan1Prodi: string
  pilihan2Ptn: string
  pilihan2Prodi: string
  semesters: AcademicSemester[]
  certificates: AcademicCertificate[]
  submissionStatus?: 'draft' | 'submitted_to_mentor' | 'analyzed'
  submittedAt?: string
  mentorAnalysis?: MentorAnalysisData
  savedAt?: string
}

export const DEFAULT_ACADEMIC_SUBJECTS: Record<string, string[]> = {
  IPA: ['Matematika Wajib', 'Bahasa Indonesia', 'Bahasa Inggris', 'Fisika', 'Kimia', 'Biologi'],
  IPS: ['Matematika Wajib', 'Bahasa Indonesia', 'Bahasa Inggris', 'Sosiologi', 'Ekonomi', 'Geografi'],
  Bahasa: ['Matematika Wajib', 'Bahasa Indonesia', 'Bahasa Inggris', 'Sastra Indonesia', 'Bahasa Asing', 'Antropologi'],
}

export const ACADEMIC_PROFILE_STORAGE_KEY = 'otwptn_academic_profile_v1'
export const KALKULATOR_DRAFT_KEY = 'otwptn_kalkulator_draft_v1'
export const ACADEMIC_PROFILE_EVENT = 'otwptn_academic_profile_updated'

export function getInitialAcademicProfile(): AcademicProfileData {
  return {
    schoolName: '',
    jurusanSma: 'MIPA',
    eligibleRank: '',
    schoolQuota: '',
    schoolAccreditation: 'A',
    alumniCount: '',
    pilihan1Ptn: '',
    pilihan1Prodi: '',
    pilihan2Ptn: '',
    pilihan2Prodi: '',
    semesters: Array.from({ length: 5 }, (_, i) => ({
      semester: i + 1,
      subjects: [
        { id: `s${i + 1}-1`, name: 'Matematika Wajib', category: 'ipa', grade: '' },
        { id: `s${i + 1}-2`, name: 'Bahasa Indonesia', category: 'bahasa', grade: '' },
        { id: `s${i + 1}-3`, name: 'Bahasa Inggris', category: 'bahasa', grade: '' },
        { id: `s${i + 1}-4`, name: 'Fisika', category: 'ipa', grade: '' },
        { id: `s${i + 1}-5`, name: 'Kimia', category: 'ipa', grade: '' },
      ],
    })),
    certificates: [],
    submissionStatus: 'draft',
  }
}

export function loadStoredAcademicProfile(): AcademicProfileData {
  if (typeof window === 'undefined') return getInitialAcademicProfile()

  try {
    const raw = localStorage.getItem(ACADEMIC_PROFILE_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        return { ...getInitialAcademicProfile(), ...parsed }
      }
    }

    // Fallback to existing kalkulator draft if academic profile has not been initialized
    const kalkulatorRaw = localStorage.getItem(KALKULATOR_DRAFT_KEY)
    if (kalkulatorRaw) {
      const parsedKalkulator = JSON.parse(kalkulatorRaw)
      if (parsedKalkulator) {
        return {
          ...getInitialAcademicProfile(),
          schoolName: parsedKalkulator.schoolName || '',
          jurusanSma: parsedKalkulator.jurusanSma || 'MIPA',
          eligibleRank: parsedKalkulator.eligibleRank || '',
          schoolQuota: parsedKalkulator.schoolQuota || '',
          schoolAccreditation: parsedKalkulator.schoolAccreditation || 'A',
          pilihan1Ptn: parsedKalkulator.pilihan1Ptn || '',
          pilihan1Prodi: parsedKalkulator.pilihan1Prodi || '',
          pilihan2Ptn: parsedKalkulator.pilihan2Ptn || '',
          pilihan2Prodi: parsedKalkulator.pilihan2Prodi || '',
          semesters: Array.isArray(parsedKalkulator.semesters) && parsedKalkulator.semesters.length > 0
            ? parsedKalkulator.semesters
            : getInitialAcademicProfile().semesters,
          certificates: Array.isArray(parsedKalkulator.certificates) ? parsedKalkulator.certificates : [],
        }
      }
    }
  } catch (err) {
    console.warn('[academicProfile] Error reading localStorage:', err)
  }

  return getInitialAcademicProfile()
}

export function saveStoredAcademicProfile(data: Partial<AcademicProfileData>): AcademicProfileData {
  const current = loadStoredAcademicProfile()
  const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  const updated: AcademicProfileData = {
    ...current,
    ...data,
    savedAt: timeStr,
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ACADEMIC_PROFILE_STORAGE_KEY, JSON.stringify(updated))
      // Also update kalkulator draft key for backwards compatibility
      localStorage.setItem(KALKULATOR_DRAFT_KEY, JSON.stringify({
        semesters: updated.semesters,
        jurusanSma: updated.jurusanSma,
        eligibleRank: updated.eligibleRank,
        schoolQuota: updated.schoolQuota,
        schoolAccreditation: updated.schoolAccreditation,
        schoolName: updated.schoolName,
        pilihan1Ptn: updated.pilihan1Ptn,
        pilihan1Prodi: updated.pilihan1Prodi,
        pilihan2Ptn: updated.pilihan2Ptn,
        pilihan2Prodi: updated.pilihan2Prodi,
        certificates: updated.certificates,
        savedAt: timeStr,
      }))
      window.dispatchEvent(new CustomEvent(ACADEMIC_PROFILE_EVENT, { detail: updated }))
    } catch (err) {
      console.warn('[academicProfile] Error writing to localStorage:', err)
    }
  }

  return updated
}
