'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Award,
  ExternalLink,
  Search,
  Filter,
  UserCheck,
  UserX,
  Clock,
  ChevronRight,
  School,
  Sparkles,
  Layers,
  MessageCircle,
  Eye,
  Activity,
  CreditCard,
  Copy,
  Send,
  Video,
  FileEdit,
  CheckSquare,
  AlertCircle,
  ThumbsUp,
  Phone,
  Zap,
} from 'lucide-react'
import { LEGAL_ENTITY } from '@/lib/constants'
import { autoAssignBatchMentees, type MenteeMatchProfile, type MentorMatchProfile } from '@/lib/mentor-matching'

export interface MenteeWorkItem {
  id: string
  menteeName: string
  school: string
  package: 'Nectar' | 'Honeycomb' | 'Queen Bee'
  targetPTN: string
  assignedDate: string
  zoomStatus: 'done' | 'scheduled' | 'pending'
  zoomDate?: string
  essayStatus: 'done' | 'in_review' | 'waiting_mentee'
  essayFeedback: string
  waGroupStatus: 'active' | 'pending'
  portfolioStatus: 'validated' | 'pending'
  overallProgress: number // 0 - 100
  menteeRating?: number
  menteeReview?: string
}

export interface MentorCandidate {
  id: string
  fullName: string
  email: string
  whatsapp: string
  university: string
  major: string
  admissionTrack: string
  graduationYear: string
  loaUrl: string
  essayUrl?: string
  certUrl?: string
  status: 'pending' | 'approved' | 'rejected'
  appliedAt: string
  menteeCount: number
  isOnline: boolean
  lastActive: string
  bankName: string
  accountNumber: string
  accountHolder: string
  accumulatedPayout: number
  payoutStatus: 'ready' | 'processing' | 'completed'
  mentees: MenteeWorkItem[]
}

const MOCK_MENTORS: MentorCandidate[] = [
  {
    id: 'm-01',
    fullName: 'Rayhan Fakhri Pratama',
    email: 'rayhan.f@alumni.ui.ac.id',
    whatsapp: '081234567890',
    university: 'Universitas Indonesia',
    major: 'Ilmu Komunikasi (Reguler)',
    admissionTrack: 'PPKB UI (Prestasi & Pemerataan)',
    graduationYear: '2025',
    loaUrl: '#loa-preview-rayhan',
    essayUrl: '#essay-preview-rayhan',
    certUrl: '#cert-preview-rayhan',
    status: 'approved',
    appliedAt: '24 Okt 2026',
    menteeCount: 3,
    isOnline: true,
    lastActive: 'Aktif 5 menit lalu',
    bankName: 'Bank Mandiri',
    accountNumber: '137001928374',
    accountHolder: 'Rayhan Fakhri Pratama',
    accumulatedPayout: 240000,
    payoutStatus: 'ready',
    mentees: [
      {
        id: 'mentee-01',
        menteeName: 'Syahid Arkan',
        school: 'SMAN 2 Jakarta',
        package: 'Queen Bee',
        targetPTN: 'Ilmu Komunikasi UI (PPKB) / Hubungan Internasional UGM',
        assignedDate: '25 Okt 2026',
        zoomStatus: 'done',
        zoomDate: '28 Okt 2026, 19:30 WIB (Zoom 60 Menit)',
        essayStatus: 'done',
        essayFeedback: 'Draft esai motivasi PPKB UI sudah direvisi hook & personal branding.',
        waGroupStatus: 'active',
        portfolioStatus: 'validated',
        overallProgress: 90,
        menteeRating: 5,
        menteeReview: 'Kak Rayhan insightful banget bedah essay PPKB UI saya!',
      },
      {
        id: 'mentee-02',
        menteeName: 'Alya Ramadhani',
        school: 'SMA Labschool Cibubur',
        package: 'Honeycomb',
        targetPTN: 'Ilmu Komunikasi UNAIR / FISIP UI',
        assignedDate: '27 Okt 2026',
        zoomStatus: 'scheduled',
        zoomDate: '30 Okt 2026, 16:00 WIB',
        essayStatus: 'in_review',
        essayFeedback: 'Sedang memeriksa paragraf alasan memilih jurusan komunikasi.',
        waGroupStatus: 'active',
        portfolioStatus: 'validated',
        overallProgress: 60,
      },
      {
        id: 'mentee-03',
        menteeName: 'Bima Satria',
        school: 'SMAN 1 Depok',
        package: 'Honeycomb',
        targetPTN: 'Sastra Inggris UI / Komunikasi UNDIP',
        assignedDate: '28 Okt 2026',
        zoomStatus: 'pending',
        essayStatus: 'waiting_mentee',
        essayFeedback: 'Menunggu mentee submit draft pertama.',
        waGroupStatus: 'active',
        portfolioStatus: 'pending',
        overallProgress: 30,
      },
    ],
  },
  {
    id: 'm-02',
    fullName: 'Clarissa Amanda Putri',
    email: 'clarissa.amanda@alumni.itb.ac.id',
    whatsapp: '081399881122',
    university: 'Institut Teknologi Bandung',
    major: 'Sekolah Farmasi (SF)',
    admissionTrack: 'SNBP & SM ITB Peminatan',
    graduationYear: '2024',
    loaUrl: '#loa-preview-clarissa',
    essayUrl: '#essay-preview-clarissa',
    status: 'pending',
    appliedAt: '28 Okt 2026',
    menteeCount: 0,
    isOnline: false,
    lastActive: 'Aktif kemarin',
    bankName: 'BCA',
    accountNumber: '5221948201',
    accountHolder: 'Clarissa Amanda Putri',
    accumulatedPayout: 0,
    payoutStatus: 'completed',
    mentees: [],
  },
  {
    id: 'm-03',
    fullName: 'Bagas Aditya Nugraha',
    email: 'bagas.aditya@mail.ugm.ac.id',
    whatsapp: '082188776655',
    university: 'Universitas Gadjah Mada',
    major: 'Manajemen & Kebijakan Publik',
    admissionTrack: 'PBUB UGM (Bibit Unggul Berprestasi)',
    graduationYear: '2025',
    loaUrl: '#loa-preview-bagas',
    status: 'pending',
    appliedAt: '29 Okt 2026',
    menteeCount: 0,
    isOnline: true,
    lastActive: 'Online sekarang',
    bankName: 'BNI',
    accountNumber: '0829148201',
    accountHolder: 'Bagas Aditya Nugraha',
    accumulatedPayout: 0,
    payoutStatus: 'completed',
    mentees: [],
  },
  {
    id: 'm-04',
    fullName: 'Nadhifa Zahra Siregar',
    email: 'nadhifa.siregar@alumni.unair.ac.id',
    whatsapp: '081277334411',
    university: 'Universitas Airlangga',
    major: 'Kedokteran Gigi',
    admissionTrack: 'Golden Ticket UNAIR (Ketua OSIS)',
    graduationYear: '2025',
    loaUrl: '#loa-preview-nadhifa',
    status: 'rejected',
    appliedAt: '20 Okt 2026',
    menteeCount: 0,
    isOnline: false,
    lastActive: 'Aktif 3 hari lalu',
    bankName: 'Bank Syariah Indonesia (BSI)',
    accountNumber: '7192849102',
    accountHolder: 'Nadhifa Zahra Siregar',
    accumulatedPayout: 0,
    payoutStatus: 'completed',
    mentees: [],
  },
]

interface UnassignedMentee {
  id: string
  name: string
  school: string
  package: 'Nectar' | 'Honeycomb' | 'Queen Bee'
  targetPTN: string
  registeredAt: string
}

const UNASSIGNED_MENTEES: UnassignedMentee[] = [
  {
    id: 'mentee-101',
    name: 'Kezia Aurelia Simanjuntak',
    school: 'SMA Taruna Nusantara Magelang',
    package: 'Queen Bee',
    targetPTN: 'FK UI (PPKB) / Kedokteran UNAIR',
    registeredAt: '29 Okt 2026, 11:20',
  },
  {
    id: 'mentee-102',
    name: 'Dimas Wicaksono',
    school: 'SMAN 3 Yogyakarta',
    package: 'Honeycomb',
    targetPTN: 'STEI ITB / Teknik Elektro UGM',
    registeredAt: '29 Okt 2026, 14:05',
  },
]

export default function SuperAdminMentorsPage() {
  const [activeTab, setActiveTab] = useState<'verification' | 'work_monitoring' | 'payouts'>('verification')
  const [mentors, setMentors] = useState<MentorCandidate[]>(MOCK_MENTORS)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [inspectMentor, setInspectMentor] = useState<MentorCandidate | null>(null)
  const [workMonitorMentor, setWorkMonitorMentor] = useState<MentorCandidate | null>(null)
  const [assignMenteeModal, setAssignMenteeModal] = useState<UnassignedMentee | null>(null)
  const [selectedMentorForAssignment, setSelectedMentorForAssignment] = useState('')
  const [notification, setNotification] = useState<string | null>(null)
  const [unassignedList, setUnassignedList] = useState<UnassignedMentee[]>(UNASSIGNED_MENTEES)
  const [copiedBank, setCopiedBank] = useState<string | null>(null)

  const filteredMentors = mentors.filter(m => {
    const matchesFilter = filterStatus === 'all' ? true : m.status === filterStatus
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.major.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleApprove = (id: string) => {
    setMentors(prev => prev.map(m => m.id === id ? { ...m, status: 'approved' } : m))
    setNotification('✓ Mentor berhasil diapprove! Akses dashboard & pembagian mentee aktif.')
    setInspectMentor(null)
    setTimeout(() => setNotification(null), 4000)
  }

  const handleReject = (id: string) => {
    setMentors(prev => prev.map(m => m.id === id ? { ...m, status: 'rejected' } : m))
    setNotification('✕ Pengajuan mentor ditolak.')
    setInspectMentor(null)
    setTimeout(() => setNotification(null), 4000)
  }

  const handleAssignMentee = () => {
    if (!selectedMentorForAssignment || !assignMenteeModal) return
    const targetMentor = mentors.find(m => m.id === selectedMentorForAssignment)
    
    // Add to mentor's mentees list
    setMentors(prev => prev.map(m => {
      if (m.id === selectedMentorForAssignment) {
        const newMentee: MenteeWorkItem = {
          id: assignMenteeModal.id,
          menteeName: assignMenteeModal.name,
          school: assignMenteeModal.school,
          package: assignMenteeModal.package,
          targetPTN: assignMenteeModal.targetPTN,
          assignedDate: 'Hari ini',
          zoomStatus: 'pending',
          essayStatus: 'waiting_mentee',
          essayFeedback: 'Baru di-assign, menunggu submission draft essay mentee.',
          waGroupStatus: 'pending',
          portfolioStatus: 'pending',
          overallProgress: 10,
        }
        const payoutAdd = assignMenteeModal.package === 'Queen Bee' ? 120000 : assignMenteeModal.package === 'Honeycomb' ? 60000 : 25000
        return {
          ...m,
          menteeCount: m.menteeCount + 1,
          accumulatedPayout: m.accumulatedPayout + payoutAdd,
          mentees: [newMentee, ...m.mentees],
        }
      }
      return m
    }))

    setUnassignedList(prev => prev.filter(u => u.id !== assignMenteeModal.id))
    setNotification(`Mentee ${assignMenteeModal.name} berhasil di-assign ke mentor ${targetMentor?.fullName}!`)
    setAssignMenteeModal(null)
    setSelectedMentorForAssignment('')
    setTimeout(() => setNotification(null), 4000)
  }

  const handleAutoAssignAll = () => {
    if (unassignedList.length === 0) return
    const approvedMentors = mentors.filter(m => m.status === 'approved')
    if (approvedMentors.length === 0) {
      setNotification('Belum ada mentor yang diapprove untuk menerima mentee.')
      return
    }

    const menteeProfiles: MenteeMatchProfile[] = unassignedList.map(u => ({
      id: u.id,
      name: u.name,
      school: u.school,
      targetPTN: u.targetPTN,
      targetJalur: u.targetPTN.includes('PPKB') ? 'PPKB UI' : u.targetPTN.includes('ITB') ? 'SNBP' : 'Jalur Prestasi',
      package: u.package,
    }))

    const mentorProfiles: MentorMatchProfile[] = approvedMentors.map(m => ({
      id: m.id,
      fullName: m.fullName,
      campus: m.university,
      faculty: m.major.includes('Kedokteran') ? 'Fakultas Kedokteran' : 'Fakultas Teknik',
      major: m.major,
      expertJalur: m.admissionTrack ? [m.admissionTrack, 'SNBP', 'PPKB UI', 'SJP IPB', 'PBUB UGM'] : ['SNBP', 'PPKB UI'],
      activeMenteesCount: m.menteeCount,
      isAvailable: m.status === 'approved',
    }))

    const { assigned } = autoAssignBatchMentees(menteeProfiles, mentorProfiles)

    if (assigned.length === 0) {
      setNotification('Tidak ada mentor yang cocok secara spesifikasi dengan antrean mentee saat ini.')
      return
    }

    setMentors(prev => prev.map(m => {
      const assignedToThisMentor = assigned.filter(a => a.mentorId === m.id)
      if (assignedToThisMentor.length > 0) {
        const newMentees: MenteeWorkItem[] = assignedToThisMentor.map(a => {
          const original = unassignedList.find(u => u.id === a.menteeId)!
          return {
            id: a.menteeId,
            menteeName: a.menteeName,
            school: original.school,
            package: original.package,
            targetPTN: a.targetPTN,
            assignedDate: 'Hari ini (Auto-Match)',
            zoomStatus: 'pending',
            essayStatus: 'waiting_mentee',
            essayFeedback: `Auto-assigned: ${a.matchReasons.join(', ')}`,
            waGroupStatus: 'pending',
            portfolioStatus: 'pending',
            overallProgress: 10,
          }
        })

        const addedPayout = assignedToThisMentor.reduce((acc, a) => {
          const original = unassignedList.find(u => u.id === a.menteeId)!
          return acc + (original.package === 'Queen Bee' ? 120000 : original.package === 'Honeycomb' ? 60000 : 25000)
        }, 0)

        return {
          ...m,
          menteeCount: m.menteeCount + assignedToThisMentor.length,
          accumulatedPayout: m.accumulatedPayout + addedPayout,
          mentees: [...newMentees, ...m.mentees],
        }
      }
      return m
    }))

    const assignedIds = new Set(assigned.map(a => a.menteeId))
    setUnassignedList(prev => prev.filter(u => !assignedIds.has(u.id)))
    setNotification(`⚡ Sukses! ${assigned.length} Mentee berhasil di-assign otomatis ke mentor terbaik berdasarkan kecocokan jalur & jurusan!`)
    setTimeout(() => setNotification(null), 5000)
  }

  const handleCopyAccount = (accountNo: string) => {
    navigator.clipboard.writeText(accountNo)
    setCopiedBank(accountNo)
    setTimeout(() => setCopiedBank(null), 2500)
  }

  const handleCompletePayout = (mentorId: string) => {
    setMentors(prev => prev.map(m => m.id === mentorId ? { ...m, payoutStatus: 'completed' } : m))
    setNotification('✓ Status transfer honorarium berhasil diperbarui menjadi SELESAI!')
    setTimeout(() => setNotification(null), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-7 rounded-3xl bg-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border-0">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black mb-2 shadow-2xs border-0">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Super Admin Control Center · {LEGAL_ENTITY.name}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-950">
            Manajemen Mentor & Pengawasan Mentee
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            Audit verifikasi LOA, monitoring progress bimbingan per mentee, dan eksekusi pencairan honorarium mentor.
          </p>
        </div>

        {/* Global Quick Stats */}
        <div className="flex items-center gap-2.5">
          <div className="px-4 py-2.5 rounded-2xl bg-amber-50 text-xs shadow-2xs border-0">
            <span className="text-gray-500 font-semibold">Pending LOA:</span>{' '}
            <strong className="text-amber-800 font-black">
              {mentors.filter(m => m.status === 'pending').length} Mentor
            </strong>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 text-xs shadow-2xs border-0">
            <span className="text-emerald-700 font-semibold">Mentor Aktif:</span>{' '}
            <strong className="text-emerald-900 font-black">
              {mentors.filter(m => m.status === 'approved').length} Mentor
            </strong>
          </div>
        </div>
      </div>

      {/* Main 3 Top Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl shadow-2xs w-full md:w-fit overflow-x-auto border-0">
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border-0 shrink-0 ${
            activeTab === 'verification'
              ? 'bg-amber-400 text-amber-950 shadow-xs'
              : 'text-gray-600 hover:text-gray-950 font-bold'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Verifikasi Mentor & LOA ({mentors.filter(m => m.status === 'pending').length} Baru)</span>
        </button>

        <button
          onClick={() => setActiveTab('work_monitoring')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border-0 shrink-0 ${
            activeTab === 'work_monitoring'
              ? 'bg-amber-400 text-amber-950 shadow-xs'
              : 'text-gray-600 hover:text-gray-950 font-bold'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Monitoring Kerja & Layanan Mentee</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border-0 shrink-0 ${
            activeTab === 'payouts'
              ? 'bg-amber-400 text-amber-950 shadow-xs'
              : 'text-gray-600 hover:text-gray-950 font-bold'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Pencairan Honor Mentor (Tinggal TF)</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-between shadow-md border-0 animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {notification}
          </span>
          <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* TAB 1: VERIFIKASI MENTOR & LOA */}
      {activeTab === 'verification' && (
        <>
          {/* Unassigned Mentees Queue */}
          <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4 border-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold border-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-black text-gray-950 text-sm">Antrean Mentee Baru (Perlu Diberi Mentor)</h2>
                  <p className="text-xs text-gray-400 font-medium">Mentee yang sudah checkout paket Nectar, Honeycomb, atau Queen Bee.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleAutoAssignAll}
                  disabled={unassignedList.length === 0}
                  className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-amber-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
                  title="Assign otomatis berdasarkan kecocokan jalur seleksi dan jurusan mentor"
                >
                  <Zap className="w-3.5 h-3.5 fill-amber-950" />
                  Auto-Assign Cerdas (Match Jalur & Jurusan)
                </button>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-900 shadow-2xs border-0">
                  {unassignedList.length} Mentee Siap di-Assign
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-100/70">
              {unassignedList.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400 font-semibold">
                  ✓ Semua antrean mentee telah berhasil ter-assign ke mentor alumni masing-masing.
                </div>
              ) : (
                unassignedList.map(mentee => (
                  <div key={mentee.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{mentee.name}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border-0 ${
                          mentee.package === 'Queen Bee' ? 'bg-amber-100 text-amber-900' :
                          mentee.package === 'Honeycomb' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          Paket {mentee.package}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
                        <span>{mentee.school}</span>
                        <span>•</span>
                        <span>Target: {mentee.targetPTN}</span>
                        <span>•</span>
                        <span>Daftar: {mentee.registeredAt}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setAssignMenteeModal(mentee)}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs flex items-center gap-1.5 transition shrink-0 border-0 shadow-2xs cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Assign Manual
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Filter and Search Mentors */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-2xl text-xs font-bold w-full md:w-auto shadow-2xs border-0">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`px-3.5 py-1.5 rounded-xl capitalize transition-all cursor-pointer border-0 ${
                    filterStatus === tab
                      ? 'bg-amber-400 text-amber-950 font-black shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 font-bold'
                  }`}
                >
                  {tab === 'all' ? 'Semua Status' : tab}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari mentor, PTN, atau jurusan..."
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-2xl bg-white text-gray-900 shadow-2xs outline-none focus:ring-2 focus:ring-amber-400/40 border-0"
              />
            </div>
          </div>

          {/* Mentors Table with NEAT ALIGNED BUTTONS */}
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden border-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100/70 bg-gray-50/70 text-left text-gray-500 font-bold">
                    <th className="p-4">Nama & Kontak</th>
                    <th className="p-4">Almamater & Jurusan</th>
                    <th className="p-4">Jalur Diterima</th>
                    <th className="p-4">Bukti Dokumen</th>
                    <th className="p-4">Mentee Aktif</th>
                    <th className="p-4">Status Akun</th>
                    <th className="p-4 text-right w-64 min-w-[260px]">Aksi Keputusan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/70">
                  {filteredMentors.map(mentor => (
                    <tr key={mentor.id} className="hover:bg-amber-50/30 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-sm">{mentor.fullName}</p>
                          {mentor.isOnline && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
                          )}
                        </div>
                        <p className="text-gray-500 text-[11px]">{mentor.email}</p>
                        <p className="text-gray-500 text-[11px] mt-0.5">WA: {mentor.whatsapp}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5 text-gray-400" /> {mentor.university}
                        </p>
                        <p className="text-gray-500">{mentor.major} (Angkatan {mentor.graduationYear})</p>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 font-bold shadow-2xs border-0 inline-block">
                          {mentor.admissionTrack}
                        </span>
                      </td>
                      <td className="p-4 space-y-1">
                        <button
                          onClick={() => setInspectMentor(mentor)}
                          className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 text-[11px] cursor-pointer border-0"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Lihat LOA & Portofolio
                        </button>
                        {mentor.essayUrl && (
                          <span className="text-[10px] text-emerald-600 font-medium block">✓ Esai Terlampir</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-gray-900 text-sm">{mentor.menteeCount}</span>
                        <span className="text-gray-400"> mentee</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border-0 ${
                          mentor.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          mentor.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {mentor.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {/* NEAT ALIGNED BUTTON CONTAINER */}
                        <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                          <button
                            onClick={() => setInspectMentor(mentor)}
                            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors cursor-pointer border-0 shadow-2xs inline-flex items-center gap-1"
                            title="Audit Bukti LOA & Portofolio"
                          >
                            <Eye className="w-3 h-3 text-gray-500" />
                            <span>Audit</span>
                          </button>

                          {mentor.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApprove(mentor.id)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer border-0 shadow-2xs"
                                title="Terima dan Aktifkan Akun Mentor"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Terima</span>
                              </button>
                              <button
                                onClick={() => handleReject(mentor.id)}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer border-0 shadow-2xs"
                                title="Tolak Pendaftaran"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Tolak</span>
                              </button>
                            </>
                          ) : mentor.status === 'approved' ? (
                            <button
                              onClick={() => {
                                setWorkMonitorMentor(mentor)
                                setActiveTab('work_monitoring')
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs inline-flex items-center gap-1 transition-colors cursor-pointer border-0 shadow-2xs"
                            >
                              <Activity className="w-3 h-3" />
                              <span>Monitor Mentee ({mentor.menteeCount})</span>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: MONITORING KERJA & LAYANAN MENTOR DENGAN MENTEE (ITEM 2) */}
      {activeTab === 'work_monitoring' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl shadow-sm border-0 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-gray-950">
                  Panel Pengawasan Aktivitas Kerja Mentor Alumni
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Pastikan seluruh mentor alumni menjalankan 5 SOP wajib: Grup WhatsApp 3 Pihak, Mentoring Zoom 1-on-1, Review Esai, Portofolio, dan Evaluasi Akhir.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Pilih Mentor:</span>
                <select
                  value={workMonitorMentor ? workMonitorMentor.id : 'all'}
                  onChange={e => {
                    const found = mentors.find(m => m.id === e.target.value)
                    setWorkMonitorMentor(found || null)
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-bold text-gray-800 border-0 outline-none cursor-pointer"
                >
                  <option value="all">Semua Mentor ({mentors.filter(m => m.status === 'approved').length})</option>
                  {mentors.filter(m => m.status === 'approved').map(m => (
                    <option key={m.id} value={m.id}>{m.fullName} ({m.university})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mentors Work Cards */}
            <div className="space-y-5 pt-2">
              {(workMonitorMentor ? [workMonitorMentor] : mentors.filter(m => m.status === 'approved')).map(mentor => (
                <div key={mentor.id} className="p-5 rounded-3xl bg-gray-50/70 border-0 space-y-4 shadow-2xs">
                  {/* Mentor Header Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/60">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-400 text-amber-950 font-black flex items-center justify-center text-sm shadow-xs">
                        {mentor.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-gray-900 text-base">{mentor.fullName}</h3>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border-0 ${
                            mentor.isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {mentor.isOnline ? '● Online' : 'Offline'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{mentor.university} · {mentor.major} · {mentor.lastActive}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${mentor.whatsapp}?text=Halo%20Kak%20${encodeURIComponent(mentor.fullName)},%20ini%20Super%20Admin%20OtwPTN.%20Mau%20cek%20update%20progress%20mentee%20kamu...`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 border-0 shadow-2xs cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Nudge via WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* List of Mentees under this Mentor */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-amber-500" />
                        Daftar Mentee Ter-assign ({mentor.mentees.length} Siswa)
                      </h4>
                      <span className="text-[11px] font-semibold text-gray-400">Status 5 Layanan Bimbingan</span>
                    </div>

                    {mentor.mentees.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-white text-center text-xs text-gray-400">
                        Belum ada mentee yang di-assign ke kakak mentor ini.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {mentor.mentees.map(mentee => (
                          <div key={mentee.id} className="p-4 rounded-2xl bg-white shadow-2xs border-0 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-sm text-gray-900">{mentee.menteeName}</span>
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                    Paket {mentee.package}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{mentee.school} · Target: {mentee.targetPTN}</p>
                              </div>

                              <div className="text-right">
                                <div className="text-xs font-black text-gray-900">Progress: {mentee.overallProgress}%</div>
                                <div className="w-32 h-2 rounded-full bg-gray-100 overflow-hidden mt-1">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                                    style={{ width: `${mentee.overallProgress}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* 5 Layanan Checklist Pills */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                              {/* 1. Grup WA */}
                              <div className={`p-2 rounded-xl flex items-center gap-1.5 ${
                                mentee.waGroupStatus === 'active' ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'
                              }`}>
                                <MessageCircle className="w-3.5 h-3.5" />
                                <div>
                                  <span className="font-bold block">Grup WA 3 Pihak</span>
                                  <span className="text-[10px]">{mentee.waGroupStatus === 'active' ? 'Sudah Aktif ✓' : 'Belum Dibuat ✕'}</span>
                                </div>
                              </div>

                              {/* 2. Zoom 1-on-1 */}
                              <div className={`p-2 rounded-xl flex items-center gap-1.5 ${
                                mentee.zoomStatus === 'done' ? 'bg-emerald-50 text-emerald-900' :
                                mentee.zoomStatus === 'scheduled' ? 'bg-sky-50 text-sky-900' : 'bg-amber-50 text-amber-900'
                              }`}>
                                <Video className="w-3.5 h-3.5" />
                                <div>
                                  <span className="font-bold block">Mentoring Zoom</span>
                                  <span className="text-[10px]">{mentee.zoomStatus === 'done' ? 'Terlaksana (60m) ✓' : mentee.zoomStatus === 'scheduled' ? 'Terjadwal' : 'Menunggu Booking'}</span>
                                </div>
                              </div>

                              {/* 3. Review Esai */}
                              <div className={`p-2 rounded-xl flex items-center gap-1.5 ${
                                mentee.essayStatus === 'done' ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'
                              }`}>
                                <FileEdit className="w-3.5 h-3.5" />
                                <div>
                                  <span className="font-bold block">Review Esai</span>
                                  <span className="text-[10px]">{mentee.essayStatus === 'done' ? 'Draf Direvisi ✓' : 'Dalam Proses'}</span>
                                </div>
                              </div>

                              {/* 4. Portofolio */}
                              <div className={`p-2 rounded-xl flex items-center gap-1.5 ${
                                mentee.portfolioStatus === 'validated' ? 'bg-emerald-50 text-emerald-900' : 'bg-gray-100 text-gray-700'
                              }`}>
                                <Award className="w-3.5 h-3.5" />
                                <div>
                                  <span className="font-bold block">Portofolio</span>
                                  <span className="text-[10px]">{mentee.portfolioStatus === 'validated' ? 'Tervalidasi ✓' : 'Menunggu File'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Mentee Review & Mentor Note */}
                            {mentee.menteeReview && (
                              <div className="p-2.5 rounded-xl bg-amber-50/70 text-xs flex items-center gap-2 text-amber-950 font-medium">
                                <ThumbsUp className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                <span><strong>Review Mentee ({mentee.menteeRating}★):</strong> &ldquo;{mentee.menteeReview}&rdquo;</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MANAJEMEN HONOR & TRANSFER PAYOUT MENTOR (ITEM 3) */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl shadow-sm border-0 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-gray-950">
                  Manajemen Honorarium & Eksekusi Transfer Mentor
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Honor dihitung otomatis berdasarkan jumlah mentee dan paket bimbingan (Queen Bee: Rp120.000, Honeycomb: Rp60.000, Nectar: Rp25.000). Salin rekening dan eksekusi transfer langsung.
                </p>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-amber-100 text-amber-950 text-xs font-black">
                Total Payout Siap TF: Rp {mentors.filter(m => m.payoutStatus === 'ready').reduce((sum, m) => sum + m.accumulatedPayout, 0).toLocaleString('id-ID')}
              </div>
            </div>

            {/* Payouts Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100/70 bg-gray-50/70 text-left text-gray-500 font-bold">
                    <th className="p-4">Nama Mentor</th>
                    <th className="p-4">Almamater</th>
                    <th className="p-4">Total Mentee</th>
                    <th className="p-4">Nominal Honor</th>
                    <th className="p-4">Rekening Tujuan TF</th>
                    <th className="p-4">Status Payout</th>
                    <th className="p-4 text-right">Aksi Eksekusi Transfer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/70">
                  {mentors.filter(m => m.status === 'approved').map(mentor => (
                    <tr key={mentor.id} className="hover:bg-amber-50/20 transition">
                      <td className="p-4">
                        <p className="font-bold text-gray-900 text-sm">{mentor.fullName}</p>
                        <p className="text-[11px] text-gray-500">WA: {mentor.whatsapp}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-gray-900">{mentor.university}</p>
                        <p className="text-[11px] text-gray-500">{mentor.major}</p>
                      </td>
                      <td className="p-4">
                        <span className="font-black text-sm text-gray-900">{mentor.menteeCount}</span>
                        <span className="text-gray-400"> mentee</span>
                      </td>
                      <td className="p-4">
                        <p className="text-base font-black text-amber-950">
                          Rp {mentor.accumulatedPayout.toLocaleString('id-ID')}
                        </p>
                        <span className="text-[10px] text-gray-400 font-semibold">Akumulasi aktif</span>
                      </td>
                      <td className="p-4">
                        <div className="p-2.5 rounded-2xl bg-gray-50 space-y-1">
                          <p className="font-extrabold text-gray-900 text-xs">{mentor.bankName}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-amber-900">{mentor.accountNumber}</span>
                            <button
                              onClick={() => handleCopyAccount(mentor.accountNumber)}
                              className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center gap-1 cursor-pointer border-0"
                            >
                              <Copy className="w-2.5 h-2.5" />
                              <span>{copiedBank === mentor.accountNumber ? 'Tersalin!' : 'Salin'}</span>
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-500">a.n. {mentor.accountHolder}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border-0 ${
                          mentor.payoutStatus === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          mentor.payoutStatus === 'processing' ? 'bg-sky-100 text-sky-800' :
                          'bg-amber-100 text-amber-900'
                        }`}>
                          {mentor.payoutStatus === 'completed' ? 'Sudah Ditransfer' :
                           mentor.payoutStatus === 'processing' ? 'Sedang Diproses' : 'Siap Ditransfer'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {mentor.payoutStatus !== 'completed' && mentor.accumulatedPayout > 0 ? (
                            <button
                              onClick={() => handleCompletePayout(mentor.id)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer border-0 shadow-2xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Tandai Sudah TF</span>
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-gray-400">
                              Lunas / Tidak ada tagihan
                            </span>
                          )}

                          <a
                            href={`https://wa.me/${mentor.whatsapp}?text=Halo%20Kak%20${encodeURIComponent(mentor.fullName)},%20honorarium%20mentoring%20OtwPTN%20sebesar%20Rp${encodeURIComponent(mentor.accumulatedPayout.toLocaleString('id-ID'))}%20ke%20rekening%20${encodeURIComponent(mentor.bankName)}%20sudah%20ditransfer%20oleh%20keuangan%20PT.%20Lembaga%20Sains%20Nasional.%20Terima%20kasih!`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs inline-flex items-center gap-1 cursor-pointer border-0 shadow-2xs"
                            title="Kirim Bukti Transfer via WhatsApp"
                          >
                            <Send className="w-3 h-3 text-emerald-600" />
                            <span>Kirim Bukti</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Audit LOA & Portofolio Mentor */}
      {inspectMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-5 border-0 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-950">Audit Verifikasi Dokumen Calon Mentor</h3>
                <p className="text-xs text-gray-500 font-medium">Periksa keabsahan bukti Letter of Acceptance (LOA) & portofolio prestasi.</p>
              </div>
              <button onClick={() => setInspectMentor(null)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 cursor-pointer border-0">
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 space-y-2 border-0">
              <p className="text-xs text-gray-400 font-bold uppercase">Biodata Calon Mentor</p>
              <p className="text-sm font-black text-gray-900">{inspectMentor.fullName}</p>
              <p className="text-xs text-gray-600">{inspectMentor.university} · {inspectMentor.major} · Angkatan {inspectMentor.graduationYear}</p>
              <p className="text-xs text-amber-900 font-bold">Jalur: {inspectMentor.admissionTrack}</p>
            </div>

            <div className="p-5 rounded-2xl border border-dashed border-gray-200 text-center space-y-2 bg-amber-50/40">
              <FileText className="w-8 h-8 text-amber-600 mx-auto" />
              <p className="text-xs font-black text-gray-900">Letter of Acceptance (LOA) Resmi Kampus</p>
              <p className="text-[11px] text-gray-500">File PDF Terenkripsi & Terverifikasi Digital</p>
              <a
                href={inspectMentor.loaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-bold shadow-2xs border-0"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Buka Dokumen LOA
              </a>
            </div>

            {inspectMentor.status === 'approved' && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-900 flex items-center justify-between border-0 shadow-2xs">
                <span className="text-xs font-bold">Status: Akun Mentor Sudah Terverifikasi</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setInspectMentor(null)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold border-0 cursor-pointer"
              >
                Tutup
              </button>
              {inspectMentor.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleReject(inspectMentor.id)}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold border-0 cursor-pointer shadow-2xs"
                  >
                    Tolak Pendaftaran
                  </button>
                  <button
                    onClick={() => handleApprove(inspectMentor.id)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black border-0 cursor-pointer shadow-2xs"
                  >
                    Approve Mentor Alumni
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Assign Mentee ke Mentor */}
      {assignMenteeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-5 border-0 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-950">Penugasan Mentee ke Mentor Alumni</h3>
              <button onClick={() => setAssignMenteeModal(null)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 cursor-pointer border-0">
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 text-xs space-y-1 border-0 shadow-2xs">
              <p className="font-bold text-amber-950">Mentee: {assignMenteeModal.name}</p>
              <p className="text-gray-600">Asal: {assignMenteeModal.school}</p>
              <p className="text-gray-600">Target PTN: {assignMenteeModal.targetPTN}</p>
              <p className="font-black text-amber-900">Paket: {assignMenteeModal.package}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-800 block">Pilih Mentor Alumni Sesuai Target:</label>
              <select
                value={selectedMentorForAssignment}
                onChange={e => setSelectedMentorForAssignment(e.target.value)}
                className="w-full p-3 rounded-2xl bg-gray-50 text-xs text-gray-900 focus:bg-white outline-none border-0 shadow-2xs"
              >
                <option value="">-- Pilih Kakak Mentor --</option>
                {mentors.filter(m => m.status === 'approved').map(m => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.university} · {m.major}) - {m.menteeCount} Mentee Aktif
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setAssignMenteeModal(null)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold border-0 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleAssignMentee}
                disabled={!selectedMentorForAssignment}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-amber-950 text-xs font-black border-0 shadow-2xs cursor-pointer"
              >
                Assign & Buat Ruang Bimbingan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
