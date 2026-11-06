'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Search,
  Filter,
  Eye,
  FileText,
  Award,
  Video,
  MessageCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  Edit,
  Save,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  Download,
  Calendar,
  Send,
  Bold,
  Italic,
  Underline,
  List,
  Heading1,
  ShieldAlert,
  BarChart3,
} from 'lucide-react'
import { LEGAL_ENTITY } from '@/lib/constants'

interface MenteeItem {
  id: string
  name: string
  avatar: string
  school: string
  targetPtn1: string
  targetProdi1: string
  targetPtn2: string
  targetProdi2: string
  track: string
  packageName: 'Nectar' | 'Honeycomb' | 'Queen Bee (Royal Jelly)'
  status: 'Perlu Review Esai' | 'Jadwal Meet Mendatang' | 'Analisis Pilihan Siap' | 'Selesai Direvisi'
  whatsapp: string
  waGroupLink?: string
  zoomLink?: string
  essayTitle: string
  essayContent: string
  raporSummary: string
  certificates: { name: string; level: string; score: number }[]
  checklist: { task: string; done: boolean }[]
  // VIP specific analysis
  vipAnalysis?: {
    recommendationPil1: string
    recommendationPil2: string
    riskNotes: string
    submittedAt?: string
  }
}

const TIER_TO_PACKAGE: Record<string, MenteeItem['packageName']> = {
  review: 'Nectar',
  dokumen: 'Honeycomb',
  menyeluruh: 'Queen Bee (Royal Jelly)',
  intensif: 'Queen Bee (Royal Jelly)',
}

export default function MentorDashboardPage() {
  const [mentees, setMentees] = useState<MenteeItem[]>([])
  const [mentoringIds, setMentoringIds] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [filterPackage, setFilterPackage] = useState<'Semua' | 'Nectar' | 'Honeycomb' | 'Queen Bee (Royal Jelly)'>('Semua')
  const [mentorName, setMentorName] = useState('Mentor Alumni')
  const [mentorUni, setMentorUni] = useState('')
  const [isPendingLoa, setIsPendingLoa] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [honorTotal, setHonorTotal] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return

      // Load mentor profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, school_name')
        .eq('id', data.user.id)
        .maybeSingle()

      const name = profile?.full_name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Mentor Alumni'
      setMentorName(name)
      if (profile?.school_name) setMentorUni(profile.school_name)

      // Check application status in DB
      const { data: app } = await supabase
        .from('mentor_applications')
        .select('status')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (app?.status === 'pending') setIsPendingLoa(true)

      // Load real mentees from API
      const res = await fetch('/api/mentor/mentees')
      if (res.ok) {
        const json = await res.json()
        const ids: Record<string, string> = {}
        const mapped: MenteeItem[] = (json.mentees ?? []).map((record: {
          id: string; tier: string; wa_group_link?: string; checklist?: { task: string; done: boolean }[];
          profiles: { id: string; full_name: string; avatar_url?: string; school_name?: string; target_ptns?: string[]; email?: string; phone?: string } | null;
        }) => {
          const p = record.profiles
          const targets = p?.target_ptns ?? []
          ids[p?.id ?? record.id] = record.id
          return {
            id: p?.id ?? record.id,
            name: p?.full_name ?? 'Mentee',
            avatar: p?.avatar_url ?? '',
            school: p?.school_name ?? '-',
            targetPtn1: targets[0] ?? '-',
            targetProdi1: targets[0] ?? '-',
            targetPtn2: targets[1] ?? '-',
            targetProdi2: targets[1] ?? '-',
            track: '-',
            packageName: TIER_TO_PACKAGE[record.tier] ?? 'Nectar',
            status: 'Analisis Pilihan Siap' as MenteeItem['status'],
            whatsapp: (p?.phone ?? '').replace(/\D/g, ''),
            waGroupLink: record.wa_group_link,
            essayTitle: 'Esai Motivasi',
            essayContent: '',
            raporSummary: '-',
            certificates: [],
            checklist: record.checklist ?? [
              { task: 'Kirim link grup WA (Mentor + Admin + Mentee)', done: !!record.wa_group_link },
              { task: 'Sesi konsultasi awal & bedah target', done: false },
              { task: 'Koreksi esai draf 1', done: false },
            ],
          }
        })
        setMentees(mapped)
        setMentoringIds(ids)

        // Load honor total from payouts
        const { data: payouts } = await supabase
          .from('mentor_payouts')
          .select('amount')
          .eq('mentor_id', data.user.id)
          .in('status', ['pending', 'cleared'])
        setHonorTotal(payouts?.reduce((s, p) => s + p.amount, 0) ?? 0)
      }

      setDataLoaded(true)
    })
  }, [])

  // Selected Mentee Modal States
  const [activeMentee, setActiveMentee] = useState<MenteeItem | null>(null)
  const [activeModalTab, setActiveModalTab] = useState<'data' | 'essay-gdocs' | 'vip-analysis' | 'meet-link'>('data')

  // GDocs Editor in Modal
  const [gdocsContent, setGdocsContent] = useState('')
  const [annotations, setAnnotations] = useState<{ id: string; quote: string; note: string; tag: string }[]>([])
  const [newAnnotationTag, setNewAnnotationTag] = useState('PERBAIKI KALIMAT')
  const [annotationInput, setAnnotationInput] = useState('')

  // VIP Analysis form state
  const [vipPil1, setVipPil1] = useState('')
  const [vipPil2, setVipPil2] = useState('')
  const [vipRisk, setVipRisk] = useState('')
  const [vipSaved, setVipSaved] = useState(false)

  // Zoom & WA link form state
  const [zoomLinkInput, setZoomLinkInput] = useState('')
  const [waGroupLinkInput, setWaGroupLinkInput] = useState('')
  const [linkSaved, setLinkSaved] = useState(false)

  function openMenteeModal(m: MenteeItem) {
    setActiveMentee(m)
    setGdocsContent(m.essayContent)
    setZoomLinkInput(m.zoomLink || '')
    setWaGroupLinkInput(m.waGroupLink || '')
    setVipPil1(m.vipAnalysis?.recommendationPil1 || '')
    setVipPil2(m.vipAnalysis?.recommendationPil2 || '')
    setVipRisk(m.vipAnalysis?.riskNotes || '')
    setActiveModalTab('data')
  }

  function handleToggleChecklist(menteeId: string, taskIdx: number) {
    let updatedChecklist: { task: string; done: boolean }[] = []
    setMentees(prev =>
      prev.map(m => {
        if (m.id === menteeId) {
          const cl = [...m.checklist]
          cl[taskIdx] = { ...cl[taskIdx], done: !cl[taskIdx].done }
          updatedChecklist = cl
          return { ...m, checklist: cl }
        }
        return m
      })
    )
    if (activeMentee?.id === menteeId) {
      const cl = [...activeMentee.checklist]
      cl[taskIdx] = { ...cl[taskIdx], done: !cl[taskIdx].done }
      setActiveMentee({ ...activeMentee, checklist: cl })
      updatedChecklist = cl
    }
    const mentoringId = mentoringIds[menteeId]
    if (mentoringId && updatedChecklist.length) {
      fetch('/api/mentor/mentees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentoring_id: mentoringId, checklist: updatedChecklist }),
      })
    }
  }

  function handleSaveVipAnalysis() {
    if (!activeMentee) return
    const vipData = {
      recommendationPil1: vipPil1,
      recommendationPil2: vipPil2,
      riskNotes: vipRisk,
      submittedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    }
    const updated = { ...activeMentee, vipAnalysis: vipData }
    setActiveMentee(updated)
    setMentees(prev => prev.map(m => (m.id === activeMentee.id ? updated : m)))

    const mentoringId = mentoringIds[activeMentee.id]
    if (mentoringId) {
      fetch('/api/mentor/mentees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentoring_id: mentoringId, vip_analysis: vipData }),
      })
    }
    setVipSaved(true)
    setTimeout(() => setVipSaved(false), 2500)
  }

  function handleSaveLinks() {
    if (!activeMentee) return
    const updated = {
      ...activeMentee,
      zoomLink: zoomLinkInput,
      waGroupLink: waGroupLinkInput,
    }
    setActiveMentee(updated)
    setMentees(prev => prev.map(m => (m.id === activeMentee.id ? updated : m)))

    const mentoringId = mentoringIds[activeMentee.id]
    if (mentoringId) {
      fetch('/api/mentor/mentees', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentoring_id: mentoringId,
          wa_group_link: waGroupLinkInput,
          zoom_link: zoomLinkInput,
        }),
      })
    }
    setLinkSaved(true)
    setTimeout(() => setLinkSaved(false), 2500)
  }

  function handleAddAnnotation() {
    if (!annotationInput.trim()) return
    const newA = {
      id: 'a-' + Date.now(),
      quote: 'Paragraf pilihan...',
      note: annotationInput.trim(),
      tag: newAnnotationTag,
    }
    setAnnotations([...annotations, newA])
    setAnnotationInput('')
  }

  const filteredMentees = mentees.filter(m => {
    const matchPkg = filterPackage === 'Semua' || m.packageName === filterPackage
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.school.toLowerCase().includes(search.toLowerCase()) ||
      m.targetPtn1.toLowerCase().includes(search.toLowerCase())
    return matchPkg && matchSearch
  })

  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10 space-y-8">
      {/* Top Banner & Quick Metrics */}
      <div className="p-8 rounded-3xl bg-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-black mb-2">
            <Sparkles size={14} className="text-amber-600" /> Workspace Mentor Resmi {LEGAL_ENTITY.name}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight">
            Selamat Datang, {mentorName}!
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {mentorUni ? `${mentorUni} · ` : ''}Pantau progres bimbingan esai, jadwal sesi Meet, kurasi berkas, dan rekomendasi pilihan jurusan menteemu.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gray-50 text-center min-w-[100px]">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Mentee Aktif</span>
            <p className="text-xl font-black text-gray-900">{dataLoaded ? `${mentees.length} Siswa` : '...'}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 text-center min-w-[100px]">
            <span className="text-[10px] font-bold text-amber-800 uppercase">Honor Mentoring</span>
            <p className="text-xl font-black text-amber-950">
              Rp {honorTotal.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* LOA Verification Status Notice */}
      {isPendingLoa && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5 sm:mt-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-xs font-black text-amber-950">
                Status Akun: Menunggu Verifikasi Dokumen LOA
              </p>
              <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                Dokumen LOA kamu sedang diverifikasi oleh Tim Akademik {LEGAL_ENTITY.name}. Mentee akan ditugaskan otomatis setelah akunmu disetujui.
              </p>
            </div>
          </div>
          <Link
            href="/mentor/apply"
            className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black transition-all flex-shrink-0"
          >
            Lihat Status Pengajuan
          </Link>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Package Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {(['Semua', 'Nectar', 'Honeycomb', 'Queen Bee (Royal Jelly)'] as const).map(pkg => (
            <button
              key={pkg}
              onClick={() => setFilterPackage(pkg)}
              className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-colors ${
                filterPackage === pkg
                  ? 'btn-brand-primary'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-2xs'
              }`}
            >
              {pkg === 'Semua' ? 'Semua Paket' : `Paket ${pkg}`}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama mentee, sekolah, PTN..."
            className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-full bg-white text-xs font-medium text-gray-900 shadow-xs outline-none border border-gray-100 focus:border-amber-400"
          />
        </div>
      </div>

      {/* MENTEE ROSTER TABLE */}
      <div className="bg-white rounded-3xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-gray-900">
            Daftar Mentee Kamu ({filteredMentees.length})
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            Klik tombol &ldquo;Buka Workspace&rdquo; untuk memeriksa esai & rapor
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-black uppercase text-gray-400 bg-gray-50/50">
                <th className="py-3.5 px-6">Mentee & Asal Sekolah</th>
                <th className="py-3.5 px-6">Target PTN Pilihan 1 & 2</th>
                <th className="py-3.5 px-6">Paket Bimbingan</th>
                <th className="py-3.5 px-6">Status Bimbingan</th>
                <th className="py-3.5 px-6">Aksi Mentor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-900">
              {filteredMentees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-6 text-center">
                    <p className="text-xs font-bold text-gray-700">Belum ada mentee yang ditugaskan kepada kamu</p>
                    <p className="text-[11px] text-gray-400 mt-1">Mentee baru akan muncul di sini secara otomatis setelah pesanan dikonfirmasi oleh Admin.</p>
                  </td>
                </tr>
              ) : (
                filteredMentees.map(m => (
                <tr key={m.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover shadow-2xs"
                      />
                      <div>
                        <p className="font-black text-gray-900 text-xs">{m.name}</p>
                        <p className="text-[11px] text-gray-400 font-medium">{m.school}</p>
                        <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.2 rounded-full">
                          Jalur: {m.track}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-gray-900">
                        1. {m.targetProdi1}
                      </p>
                      <p className="text-[11px] text-amber-700">
                        ({m.targetPtn1})
                      </p>
                      <p className="text-[11px] text-gray-500 font-medium pt-1">
                        2. {m.targetProdi2} ({m.targetPtn2})
                      </p>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-black ${
                        m.packageName === 'Queen Bee (Royal Jelly)'
                          ? 'bg-amber-400 text-amber-950 shadow-2xs'
                          : m.packageName === 'Honeycomb'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {m.packageName}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-800">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      {m.status}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <button
                      onClick={() => openMenteeModal(m)}
                      className="btn-brand-primary px-4 py-2 rounded-full text-xs font-black shadow-2xs flex items-center gap-1.5"
                    >
                      <Eye size={13} /> Buka Workspace
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          WORKSPACE & MENTEE DETAIL MODAL (COLLABORATIVE GDOCS + VIP ANALYSIS)
          ========================================================================= */}
      {activeMentee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] shadow-2xl relative flex flex-col space-y-5 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeMentee.avatar}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover shadow-2xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-gray-900">{activeMentee.name}</h3>
                    <span className="text-[10px] font-black uppercase bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full">
                      Paket {activeMentee.packageName}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {activeMentee.school} · Target: {activeMentee.targetProdi1} ({activeMentee.targetPtn1})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveMentee(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Sub-tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-100" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setActiveModalTab('data')}
                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeModalTab === 'data' ? 'btn-brand-primary' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText size={14} /> Berkas Rapor & Sertifikat
              </button>

              <button
                onClick={() => setActiveModalTab('essay-gdocs')}
                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeModalTab === 'essay-gdocs' ? 'btn-brand-primary' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Edit size={14} /> Collaborative Essay Review (GDocs)
              </button>

              {activeMentee.packageName === 'Queen Bee (Royal Jelly)' && (
                <button
                  onClick={() => setActiveModalTab('vip-analysis')}
                  className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    activeModalTab === 'vip-analysis' ? 'btn-brand-primary' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                >
                  <Sparkles size={14} /> Wajib: Analisis Rekomendasi Pilihan 1 & 2
                </button>
              )}

              <button
                onClick={() => setActiveModalTab('meet-link')}
                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeModalTab === 'meet-link' ? 'btn-brand-primary' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Video size={14} /> Setup Link Zoom & Grup WA
              </button>
            </div>

            {/* MODAL BODY (SCROLLABLE) */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-6 text-xs">
              {/* TAB 1: DATA BERKAS & CHECKLIST KEWAJIBAN */}
              {activeModalTab === 'data' && (
                <div className="space-y-6">
                  {/* Checklist Kewajiban Mentor Sesuai Paket */}
                  <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-950 text-xs">
                        Checklist Kewajiban Mentor untuk Paket {activeMentee.packageName}:
                      </span>
                      <span className="text-[10px] text-amber-800 font-bold">
                        {activeMentee.checklist.filter(c => c.done).length}/{activeMentee.checklist.length} Selesai
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activeMentee.checklist.map((item, idx) => (
                        <label
                          key={idx}
                          className="flex items-center gap-2.5 text-xs text-gray-800 cursor-pointer p-2 rounded-xl bg-white shadow-2xs"
                        >
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => handleToggleChecklist(activeMentee.id, idx)}
                            className="rounded text-amber-500 focus:ring-amber-400"
                          />
                          <span className={item.done ? 'line-through text-gray-400' : 'font-semibold'}>
                            {item.task}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rapor & Sertifikat Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Nilai Rapor */}
                    <div className="p-5 rounded-2xl bg-gray-50 space-y-2">
                      <span className="font-black text-gray-900 flex items-center gap-1.5">
                        <BarChart3 size={14} className="text-amber-700" />
                        <span>Ringkasan Audit Nilai Rapor:</span>
                      </span>
                      <p className="text-gray-700 leading-relaxed font-medium">
                        {activeMentee.raporSummary}
                      </p>
                    </div>

                    {/* Sertifikat */}
                    <div className="p-5 rounded-2xl bg-gray-50 space-y-2">
                      <span className="font-black text-gray-900 flex items-center gap-1.5">
                        <Award size={14} className="text-amber-700" />
                        <span>Kurasi Sertifikat Prestasi ({activeMentee.certificates.length}):</span>
                      </span>
                      <div className="space-y-2">
                        {activeMentee.certificates.map((cert, ci) => (
                          <div key={ci} className="p-2.5 rounded-xl bg-white shadow-2xs flex items-center justify-between">
                            <div>
                              <p className="font-bold text-gray-900">{cert.name}</p>
                              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.2 rounded-full">
                                {cert.level}
                              </span>
                            </div>
                            <span className="text-xs font-black text-emerald-700">
                              Bobot: {cert.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COLLABORATIVE GDOCS ESSAY EDITOR */}
              {activeModalTab === 'essay-gdocs' && (
                <div className="space-y-4">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gray-50 rounded-2xl text-xs font-bold text-gray-700">
                    <span className="text-[10px] uppercase font-black text-gray-400 mr-2">Anotasi Mentor:</span>
                    <button
                      onClick={() => setNewAnnotationTag('HAPUS SAJA')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        newAnnotationTag === 'HAPUS SAJA' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Hapus Saja
                    </button>
                    <button
                      onClick={() => setNewAnnotationTag('PERLU BUKTI')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        newAnnotationTag === 'PERLU BUKTI' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      Perlu Bukti
                    </button>
                    <button
                      onClick={() => setNewAnnotationTag('PERBAIKI KALIMAT')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        newAnnotationTag === 'PERBAIKI KALIMAT' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      Perbaiki Kalimat
                    </button>
                    <button
                      onClick={() => setNewAnnotationTag('SUDAH KEREN')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        newAnnotationTag === 'SUDAH KEREN' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Sudah Keren
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Paper Sheet */}
                    <div className="md:col-span-8 p-4 rounded-2xl bg-gray-50">
                      <p className="text-[11px] font-black text-gray-900 mb-2">{activeMentee.essayTitle}</p>
                      <textarea
                        value={gdocsContent}
                        onChange={e => setGdocsContent(e.target.value)}
                        rows={12}
                        className="w-full p-3 rounded-xl bg-white text-xs leading-relaxed text-gray-900 font-serif outline-none resize-none"
                      />
                    </div>

                    {/* Annotation Comments Side Panel */}
                    <div className="md:col-span-4 space-y-3">
                      <span className="font-black text-gray-900 block">Komentar & Anotasi ({annotations.length})</span>

                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {annotations.map(a => (
                          <div key={a.id} className="p-3 rounded-xl bg-amber-50/80 border-l-2 border-amber-400 space-y-1">
                            <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                              {a.tag}
                            </span>
                            <p className="text-[11px] text-gray-800 font-medium">{a.note}</p>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <input
                          value={annotationInput}
                          onChange={e => setAnnotationInput(e.target.value)}
                          placeholder="Tulis catatan feedback..."
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 text-xs font-medium outline-none"
                        />
                        <button
                          onClick={handleAddAnnotation}
                          className="w-full btn-brand-primary py-2 rounded-xl text-xs font-black"
                        >
                          + Tambah Anotasi
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: VIP ANALISIS REKOMENDASI PILIHAN 1 & 2 */}
              {activeModalTab === 'vip-analysis' && (
                <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-300/60 space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      Kewajiban Khusus Paket VIP (Queen Bee)
                    </span>
                    <h4 className="text-sm font-black text-gray-900 mt-1">
                      Formulir Analisis Rekomendasi Pilihan 1 & 2
                    </h4>
                    <p className="text-xs text-gray-600">
                      Sebagai mentor, kamu wajib memberikan pertimbangan rasionalisasi kelolosan berdasarkan data rapor 5 semester, kurasi sertifikat, dan kekuatan esai siswa.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-black text-gray-800 mb-1 block">
                        Analisis Kelayakan Pilihan 1 ({activeMentee.targetProdi1} - {activeMentee.targetPtn1})
                      </label>
                      <textarea
                        value={vipPil1}
                        onChange={e => setVipPil1(e.target.value)}
                        rows={3}
                        placeholder="Ulas kesesuaian nilai rapor, bobot sertifikat, dan peluang kuota eligible sekolah..."
                        className="w-full p-3 rounded-2xl bg-white text-xs font-medium text-gray-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-gray-800 mb-1 block">
                        Analisis Kelayakan Pilihan 2 ({activeMentee.targetProdi2} - {activeMentee.targetPtn2})
                      </label>
                      <textarea
                        value={vipPil2}
                        onChange={e => setVipPil2(e.target.value)}
                        rows={3}
                        placeholder="Ulas peluang prodi pilihan kedua sebagai cadangan aman linier..."
                        className="w-full p-3 rounded-2xl bg-white text-xs font-medium text-gray-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-gray-800 mb-1 block">
                        Catatan Resiko & Strategi Submit
                      </label>
                      <input
                        value={vipRisk}
                        onChange={e => setVipRisk(e.target.value)}
                        placeholder="Misal: Perhatikan tren kuota eligible sekolah 3 tahun terakhir..."
                        className="w-full px-4 py-2.5 rounded-2xl bg-white text-xs font-medium text-gray-900 outline-none"
                      />
                    </div>
                  </div>

                  {vipSaved && (
                    <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                      <Check size={13} />
                      <span>Analisis rekomendasi berhasil disimpan dan terkirim ke dashboard mentee!</span>
                    </p>
                  )}

                  <button
                    onClick={handleSaveVipAnalysis}
                    className="btn-brand-primary px-6 py-2.5 rounded-full text-xs font-black shadow-xs flex items-center gap-1.5"
                  >
                    <Save size={14} /> Simpan & Kirim Analisis ke Mentee
                  </button>
                </div>
              )}

              {/* TAB 4: SETUP LINK ZOOM & GRUP WHATSAPP */}
              {activeModalTab === 'meet-link' && (
                <div className="p-6 rounded-2xl bg-gray-50 space-y-4">
                  <h4 className="text-sm font-black text-gray-900">
                    Setup Tautan Google Meet & WhatsApp Mentee
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1 block">
                        Link Grup WhatsApp (Mentor + Admin + Mentee)*
                      </label>
                      <input
                        value={waGroupLinkInput}
                        onChange={e => setWaGroupLinkInput(e.target.value)}
                        placeholder="https://chat.whatsapp.com/..."
                        className="w-full px-4 py-2.5 rounded-2xl bg-white text-xs font-medium text-gray-900 outline-none"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        SOP: Mentor wajib membuat grup WA bertiga (Mentor, Admin otwptn, Mentee) saat pertama kali ter-assign.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1 block">
                        Link Sesi Zoom / Google Meet Mentoring
                      </label>
                      <input
                        value={zoomLinkInput}
                        onChange={e => setZoomLinkInput(e.target.value)}
                        placeholder="https://meet.google.com/... atau Zoom link"
                        className="w-full px-4 py-2.5 rounded-2xl bg-white text-xs font-medium text-gray-900 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <a
                        href={`https://wa.me/${activeMentee.whatsapp}?text=Halo%20${encodeURIComponent(activeMentee.name)},%20saya%20kak%20Rayhan%20mentor%20otwptn%20kamu.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                      >
                        <MessageCircle size={14} /> Chat Langsung ke WhatsApp Mentee
                      </a>

                      <button
                        onClick={handleSaveLinks}
                        className="btn-brand-primary px-5 py-2.5 rounded-full text-xs font-black shadow-xs flex items-center gap-1.5"
                      >
                        <Save size={14} /> Simpan Tautan
                      </button>
                    </div>

                    {linkSaved && (
                      <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                        <Check size={13} />
                        <span>Tautan grup WhatsApp dan Zoom berhasil diperbarui!</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
