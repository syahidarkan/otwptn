'use client'

import { useState } from 'react'
import Link from 'next/link'
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
} from 'lucide-react'

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

const INITIAL_MENTEES: MenteeItem[] = [
  {
    id: 'mentee-1',
    name: 'Salma Salsabila',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    school: 'SMAN 28 Jakarta',
    targetPtn1: 'Universitas Indonesia',
    targetProdi1: 'Pendidikan Dokter (FK UI)',
    targetPtn2: 'Universitas Indonesia',
    targetProdi2: 'Farmasi UI',
    track: 'PPKB UI & SNBP',
    packageName: 'Queen Bee (Royal Jelly)',
    status: 'Perlu Review Esai',
    whatsapp: '6281234567891',
    waGroupLink: 'https://chat.whatsapp.com/sample-group-salma-ui',
    zoomLink: 'https://meet.google.com/abc-defg-hij',
    essayTitle: 'Esai Motivasi PPKB UI: Dedikasi Bidang Preventif Kesehatan',
    essayContent: `Sejak duduk di bangku kelas 10, saya menaruh minat mendalam pada integrasi kecerdasan buatan dalam pemrosesan data kesehatan. Saat mengamati sistem pendaftaran puskesmas di daerah saya yang masih mengalami antrean berulang, saya menyadari bahwa efisiensi sistem informasi bukan sekadar kemudahan teknologi, melainkan hak layanan publik yang mendesak.\n\nMelalui keikutsertaan saya dalam Olimpiade Biologi dan pengembangan proyek mini pencegahan stunting sekolah, saya belajar bagaimana pemahaman biologi molekuler dapat memecahkan masalah nyata.\n\nMemilih Fakultas Kedokteran Universitas Indonesia adalah keputusan terencana untuk mendalami profesi dokter di bawah bimbingan para klinisi terbaik tanah air.`,
    raporSummary: 'Rata-rata Semester 1-5: 93.4 (Biologi 96, Kimia 94, Matematika 92). Peringkat eligible 2 di SMAN 28 Jakarta.',
    certificates: [
      { name: 'Medali Perak Olimpiade Sains Nasional (OSN) Biologi', level: 'Nasional', score: 100 },
      { name: 'Juara 1 Karya Tulis Ilmiah Kesehatan Remaja', level: 'Provinsi', score: 85 },
      { name: 'Ketua Divisi PMR SMAN 28 Jakarta', level: 'Sekolah', score: 70 },
    ],
    checklist: [
      { task: 'Kirim link grup WA (Mentor + Admin + Mentee)', done: true },
      { task: 'Sesi konsultasi awal & bedah target', done: true },
      { task: 'Koreksi esai draf 1 (Google Docs)', done: false },
      { task: 'Wajib susun Analisis Rekomendasi Pilihan 1 & 2 (VIP)', done: false },
      { task: 'Simulasi Wawancara 1-on-1 Meet', done: false },
    ],
    vipAnalysis: {
      recommendationPil1: 'Peluang lolos di FK UI sangat kompetitif (rekomendasi kuota sekolah eligible peringkat 1-2). Pertahankan sertifikat OSN Biologi pada slot upload 1.',
      recommendationPil2: 'Farmasi UI sangat aman sebagai pilihan cadangan linier dengan nilai Kimia 94.',
      riskNotes: 'Perhatikan riwayat alumni SMAN 28 Jakarta di FK UI tahun lalu ada 3 orang diterima.',
      submittedAt: 'Belum difinalisasi mentor',
    },
  },
  {
    id: 'mentee-2',
    name: 'Arkan Danendra',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    school: 'SMAN 3 Bandung',
    targetPtn1: 'Institut Teknologi Bandung',
    targetProdi1: 'STEI-R (Rekayasa Komputasi)',
    targetPtn2: 'Universitas Indonesia',
    targetProdi2: 'Fasilkom UI (Ilmu Komputer)',
    track: 'SNBP & SSU ITB',
    packageName: 'Honeycomb',
    status: 'Jadwal Meet Mendatang',
    whatsapp: '6281398765432',
    waGroupLink: 'https://chat.whatsapp.com/sample-group-arkan-itb',
    zoomLink: 'https://meet.google.com/xyz-uvwx-rst',
    essayTitle: 'Personal Statement SSU ITB: Arsitektur Cloud & Big Data',
    essayContent: `Ketertarikan saya pada sistem terdistribusi bermula ketika membangun server lokal untuk olimpiade informatika sekolah. Saya ingin mendalami rekayasa perangkat lunak di STEI ITB untuk berkontribusi pada infrastruktur teknologi Indonesia.`,
    raporSummary: 'Rata-rata Semester 1-5: 92.8 (Matematika 95, Fisika 93, Bahasa Inggris 94). Peringkat eligible 5 di SMAN 3 Bandung.',
    certificates: [
      { name: 'Juara 1 Lomba Web Design Tingkat Provinsi Jabar', level: 'Provinsi', score: 90 },
      { name: 'Finalis Olimpiade Informatika Nasional', level: 'Nasional', score: 95 },
    ],
    checklist: [
      { task: 'Kirim link grup WA (Mentor + Admin + Mentee)', done: true },
      { task: 'Panduan kerangka dokumen & esai', done: true },
      { task: 'Koreksi esai draf 1 (5x putaran revisi)', done: true },
      { task: 'Sesi Zoom 1 dari 2 sesi', done: false },
      { task: 'Finalisasi berkas sebelum submit', done: false },
    ],
  },
  {
    id: 'mentee-3',
    name: 'Nabila Putri',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    school: 'SMA Taruna Nusantara',
    targetPtn1: 'Universitas Gadjah Mada',
    targetProdi1: 'Ilmu Komunikasi (Fisipol UGM)',
    targetPtn2: 'Universitas Padjadjaran',
    targetProdi2: 'Hubungan Masyarakat Unpad',
    track: 'Jalur Prestasi Mandiri UGM',
    packageName: 'Nectar',
    status: 'Selesai Direvisi',
    whatsapp: '6281122334455',
    essayTitle: 'Esai Motivasi UGM: Diplomasi Publik & Literasi Media',
    essayContent: `Media massa memiliki kekuatan diplomasi yang krusial di era disinformasi digital. Memilih Fisipol UGM adalah langkah awal mengasah keahlian komunikasi strategis.`,
    raporSummary: 'Rata-rata Semester 1-5: 91.2 (Sosiologi 94, Bhs Indonesia 95, Bhs Inggris 96).',
    certificates: [
      { name: 'Medali Emas FLS2N Tingkat Nasional Debat Bahasa Inggris', level: 'Nasional', score: 100 },
    ],
    checklist: [
      { task: 'Free konsultasi awal via chat WA', done: true },
      { task: 'Koreksi dokumen & 2x revisi draf esai', done: true },
      { task: 'Review final esai', done: true },
    ],
  },
]

export default function MentorDashboardPage() {
  const [mentees, setMentees] = useState<MenteeItem[]>(INITIAL_MENTEES)
  const [search, setSearch] = useState('')
  const [filterPackage, setFilterPackage] = useState<'Semua' | 'Nectar' | 'Honeycomb' | 'Queen Bee (Royal Jelly)'>('Semua')

  // Selected Mentee Modal States
  const [activeMentee, setActiveMentee] = useState<MenteeItem | null>(null)
  const [activeModalTab, setActiveModalTab] = useState<'data' | 'essay-gdocs' | 'vip-analysis' | 'meet-link'>('data')

  // GDocs Editor in Modal
  const [gdocsContent, setGdocsContent] = useState('')
  const [annotations, setAnnotations] = useState<{ id: string; quote: string; note: string; tag: string }[]>([
    { id: 'a1', quote: 'anak yang rajin dan berbakti', note: 'Hindari klise, ganti dengan bukti nyata minatmu di bidang kesehatan.', tag: 'HAPUS' },
    { id: 'a2', quote: 'proyek mini pencegahan stunting', note: 'Sangat bagus! Cantumkan metrik berapa orang yang teredukasi.', tag: 'PERLU BUKTI' },
  ])
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
    setMentees(prev =>
      prev.map(m => {
        if (m.id === menteeId) {
          const updatedChecklist = [...m.checklist]
          updatedChecklist[taskIdx].done = !updatedChecklist[taskIdx].done
          return { ...m, checklist: updatedChecklist }
        }
        return m
      })
    )
    if (activeMentee?.id === menteeId) {
      const updated = { ...activeMentee }
      updated.checklist[taskIdx].done = !updated.checklist[taskIdx].done
      setActiveMentee(updated)
    }
  }

  function handleSaveVipAnalysis() {
    if (!activeMentee) return
    const updated = {
      ...activeMentee,
      vipAnalysis: {
        recommendationPil1: vipPil1,
        recommendationPil2: vipPil2,
        riskNotes: vipRisk,
        submittedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      },
    }
    setActiveMentee(updated)
    setMentees(prev => prev.map(m => (m.id === activeMentee.id ? updated : m)))
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
            <Sparkles size={14} className="text-amber-600" /> Workspace Mentor Resmi PT. Lembaga Sains Nasional
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight">
            Dashboard Mentee Ter-assign
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Pantau progres bimbingan esai, jadwal sesi Meet, kurasi berkas, dan rekomendasi pilihan jurusan menteemu.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gray-50 text-center min-w-[100px]">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Mentee Aktif</span>
            <p className="text-xl font-black text-gray-900">{mentees.length} Siswa</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 text-center min-w-[100px]">
            <span className="text-[10px] font-bold text-amber-800 uppercase">Honor Mentoring</span>
            <p className="text-xl font-black text-amber-950">Rp 1.450.000</p>
          </div>
        </div>
      </div>

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
              {pkg === 'Semua' ? '🌟 Semua Paket' : `Paket ${pkg}`}
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
              {filteredMentees.map(m => (
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
              ))}
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
                      <span className="font-black text-gray-900 block">📊 Ringkasan Audit Nilai Rapor:</span>
                      <p className="text-gray-700 leading-relaxed font-medium">
                        {activeMentee.raporSummary}
                      </p>
                    </div>

                    {/* Sertifikat */}
                    <div className="p-5 rounded-2xl bg-gray-50 space-y-2">
                      <span className="font-black text-gray-900 block">🏆 Kurasi Sertifikat Prestasi ({activeMentee.certificates.length}):</span>
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
                    <p className="text-xs text-emerald-700 font-bold">
                      ✓ Analisis rekomendasi berhasil disimpan dan terkirim ke dashboard mentee!
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
                      <p className="text-xs text-emerald-600 font-bold">
                        ✓ Tautan grup WhatsApp dan Zoom berhasil diperbarui!
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
