'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  BookOpen, Plus, Trash2, Edit3, ExternalLink, Link2, PlayCircle,
  Video, FileText, ChevronDown, Eye, CheckCircle2, Search, Filter,
  Sparkles, Crown, Flame, Shield, X, HelpCircle
} from 'lucide-react'

// Convert Google Drive share link to direct image thumbnail
function convertDriveThumb(url: string): string {
  if (!url) return ''
  const match = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
  if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`
  return url
}

const CATEGORIES = [
  { id: 'all', label: 'Semua Kategori' },
  { id: 'strategi_snbp', label: 'Strategi SNBP & SNBT' },
  { id: 'bedah_jurusan', label: 'Bedah Jurusan & Kuota' },
  { id: 'bedah_rapor', label: 'Bedah Rapor 5 Semester' },
  { id: 'mastery_essay', label: 'Mastery Essay & Portofolio' },
  { id: 'wawancara_mandiri', label: 'Wawancara Jalur Mandiri' },
  { id: 'sop_mentee', label: 'Bimbingan Teknis & SOP' },
]

const TIERS = [
  { id: 'free', label: 'Gratis (Semua Siswa)', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'nectar', label: 'Nectar Review ke atas', color: 'bg-sky-100 text-sky-800' },
  { id: 'honeycomb', label: 'Honeycomb Reguler ke atas', color: 'bg-amber-100 text-amber-900' },
  { id: 'queen_bee', label: 'Queen Bee VIP Only', color: 'bg-purple-100 text-purple-900' },
]

interface LessonItem {
  id: string
  title: string
  description?: string
  content_type: 'video' | 'pdf' | 'text'
  content_url?: string
  file_url?: string
  duration_text?: string
  order_index: number
  thumbnail_url?: string
}

interface ModuleItem {
  id: string
  title: string
  description?: string
  category: string
  tier_access: 'free' | 'nectar' | 'honeycomb' | 'queen_bee'
  order_index: number
  thumbnail_url?: string
  file_url?: string
  is_active: boolean
  lessons: LessonItem[]
}

const INITIAL_MODULES: ModuleItem[] = [
  {
    id: 'mod-1',
    title: 'Strategi Lolos SNBP 2025: Analisis Rasio Keketatan & Kuota Sekolah',
    description: 'Panduan lengkap membaca peluang lolos SNBP tanpa tes berdasarkan data historis kuota sekolah dan nilai rerata alumni.',
    category: 'strategi_snbp',
    tier_access: 'free',
    order_index: 1,
    thumbnail_url: '/mascot-hd/modul-video.png',
    file_url: 'https://drive.google.com/file/d/sample-snbp-guide/view',
    is_active: true,
    lessons: [
      {
        id: 'les-101',
        title: 'Mengenal Sistem Kuota Akreditasi Sekolah (40% vs 25% vs 5%)',
        description: 'Cara memastikan posisimu masuk dalam kuota eligible sekolah.',
        content_type: 'video',
        content_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration_text: '12:45',
        order_index: 1,
      },
      {
        id: 'les-102',
        title: 'Bedah Aturan Lintas Jurusan & Portofolio Seni Olahraga',
        description: 'Risiko memilih prodi lintas rumpun dan syarat wajib portofolio.',
        content_type: 'video',
        content_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration_text: '15:20',
        order_index: 2,
      },
    ],
  },
  {
    id: 'mod-2',
    title: 'Bedah Rapor 5 Semester: Pola Nilai Konsisten & Indeks Sekolah',
    description: 'Menilai apakah grafik rapor semester 1 sampai 5 memenuhi kriteria prodi kedokteran, teknik, hukum, dan fkg.',
    category: 'bedah_rapor',
    tier_access: 'nectar',
    order_index: 2,
    thumbnail_url: '/mascot-hd/kalkulator-peluang.png',
    file_url: '',
    is_active: true,
    lessons: [
      {
        id: 'les-201',
        title: 'Rumus Pembobotan Mapel Pendukung Prodi SNBP 2025',
        description: 'Tabel mapel utama penentu kelulusan per rumpun ilmu.',
        content_type: 'video',
        content_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration_text: '18:10',
        order_index: 1,
      },
    ],
  },
  {
    id: 'mod-3',
    title: 'Mastery Essay PPKB UI & SIMAK: Struktur Star Model & Personal Story',
    description: 'Teknik menyusun motivation letter dan essay reflektif yang memukau dewan juri seleksi mandiri PTN ternama.',
    category: 'mastery_essay',
    tier_access: 'honeycomb',
    order_index: 3,
    thumbnail_url: '/mascot-hd/maskot-nulis-essay-meja.png',
    file_url: 'https://drive.google.com/file/d/sample-essay/view',
    is_active: true,
    lessons: [
      {
        id: 'les-301',
        title: 'Formula Hook Pembuka Essay dalam 3 Detik Pertama',
        description: 'Menghindari klise pembuka essay motivasi.',
        content_type: 'video',
        content_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration_text: '21:05',
        order_index: 1,
      },
      {
        id: 'les-302',
        title: 'Contoh 10 Essay Lolos PPKB UI Fakultas Kedokteran & FH',
        description: 'Analisis kata per kata draft essay yang terbukti lolos.',
        content_type: 'pdf',
        file_url: 'https://drive.google.com/file/d/sample-pdf/view',
        duration_text: 'PDF 45 Hal',
        order_index: 2,
      },
    ],
  },
  {
    id: 'mod-4',
    title: 'VIP Masterclass: Simulasi Wawancara Jalur Mandiri & Portfolio Review',
    description: 'Eksklusif bagi siswa paket Queen Bee VIP bersama para mentor alumni berprestasi.',
    category: 'wawancara_mandiri',
    tier_access: 'queen_bee',
    order_index: 4,
    thumbnail_url: '/mascot-hd/maskot-fitur-mentor-alumni.png',
    is_active: true,
    lessons: [
      {
        id: 'les-401',
        title: 'Pertanyaan Jebakan Pewawancara Dosen & Cara Menjawabnya',
        description: 'Simulasi interaktif menjawab pertanyaan kelemahan diri dan rencana kontribusi kampus.',
        content_type: 'video',
        content_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration_text: '28:30',
        order_index: 1,
      },
    ],
  },
]

export default function AdminEcoursePage() {
  const [modules, setModules] = useState<ModuleItem[]>(INITIAL_MODULES)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTier, setSelectedTier] = useState('all')
  const [expandedModId, setExpandedModId] = useState<string | null>('mod-1')

  // Modals
  const [modModalOpen, setModModalOpen] = useState(false)
  const [editingMod, setEditingMod] = useState<ModuleItem | null>(null)
  const [modForm, setModForm] = useState({
    title: '',
    description: '',
    category: 'strategi_snbp',
    tier_access: 'free' as 'free' | 'nectar' | 'honeycomb' | 'queen_bee',
    order_index: 1,
    thumbnail_url: '',
    file_url: '',
    is_active: true,
  })

  const [lessonModalOpen, setLessonModalOpen] = useState(false)
  const [activeModuleForLesson, setActiveModuleForLesson] = useState<string | null>(null)
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content_type: 'video' as 'video' | 'pdf' | 'text',
    content_url: '',
    file_url: '',
    duration_text: '',
    order_index: 1,
  })

  // Load from Supabase or fallback to mock
  const supabase = createClient()
  const loadData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*, lessons(*)')
        .order('order_index')
      if (!error && data && data.length > 0) {
        setModules(
          data.map((m: any) => ({
            ...m,
            tier_access: m.tier_access || 'free',
            lessons: (m.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index),
          }))
        )
      }
    } catch {}
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter modules
  const filteredModules = modules.filter(m => {
    const matchCat = selectedCategory === 'all' || m.category === selectedCategory
    const matchTier = selectedTier === 'all' || m.tier_access === selectedTier
    const matchSearch =
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.description || '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchTier && matchSearch
  })

  const handleOpenAddModule = () => {
    setEditingMod(null)
    setModForm({
      title: '',
      description: '',
      category: 'strategi_snbp',
      tier_access: 'free',
      order_index: modules.length + 1,
      thumbnail_url: '',
      file_url: '',
      is_active: true,
    })
    setModModalOpen(true)
  }

  const handleOpenEditModule = (mod: ModuleItem) => {
    setEditingMod(mod)
    setModForm({
      title: mod.title,
      description: mod.description || '',
      category: mod.category,
      tier_access: mod.tier_access,
      order_index: mod.order_index,
      thumbnail_url: mod.thumbnail_url || '',
      file_url: mod.file_url || '',
      is_active: mod.is_active,
    })
    setModModalOpen(true)
  }

  const handleSaveModule = async () => {
    if (!modForm.title) return alert('Mohon isi judul modul!')

    const payload: Partial<ModuleItem> = {
      title: modForm.title,
      description: modForm.description,
      category: modForm.category,
      tier_access: modForm.tier_access,
      order_index: Number(modForm.order_index),
      thumbnail_url: convertDriveThumb(modForm.thumbnail_url),
      file_url: modForm.file_url,
      is_active: modForm.is_active,
    }

    if (editingMod) {
      setModules(prev =>
        prev.map(m => (m.id === editingMod.id ? { ...m, ...payload } : m))
      )
      try {
        await supabase.from('modules').update(payload).eq('id', editingMod.id)
      } catch {}
    } else {
      const newMod: ModuleItem = {
        id: `mod-${Date.now()}`,
        ...(payload as any),
        lessons: [],
      }
      setModules(prev => [...prev, newMod])
      try {
        await supabase.from('modules').insert(payload)
      } catch {}
    }
    setModModalOpen(false)
  }

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Yakin ingin menghapus modul ini beserta seluruh lessonnya?')) return
    setModules(prev => prev.filter(m => m.id !== id))
    try {
      await supabase.from('modules').delete().eq('id', id)
    } catch {}
  }

  const handleOpenAddLesson = (modId: string) => {
    const parentMod = modules.find(m => m.id === modId)
    setActiveModuleForLesson(modId)
    setLessonForm({
      title: '',
      description: '',
      content_type: 'video',
      content_url: '',
      file_url: '',
      duration_text: '',
      order_index: (parentMod?.lessons.length || 0) + 1,
    })
    setLessonModalOpen(true)
  }

  const handleSaveLesson = async () => {
    if (!lessonForm.title || !activeModuleForLesson) return alert('Mohon isi judul lesson!')

    const newLesson: LessonItem = {
      id: `les-${Date.now()}`,
      title: lessonForm.title,
      description: lessonForm.description,
      content_type: lessonForm.content_type,
      content_url: lessonForm.content_url,
      file_url: lessonForm.file_url,
      duration_text: lessonForm.duration_text || (lessonForm.content_type === 'video' ? '10:00' : 'PDF Materi'),
      order_index: Number(lessonForm.order_index),
    }

    setModules(prev =>
      prev.map(m => {
        if (m.id === activeModuleForLesson) {
          return {
            ...m,
            lessons: [...m.lessons, newLesson].sort((a, b) => a.order_index - b.order_index),
          }
        }
        return m
      })
    )

    try {
      await supabase.from('lessons').insert({
        ...newLesson,
        module_id: activeModuleForLesson,
      })
    } catch {}

    setLessonModalOpen(false)
  }

  const handleDeleteLesson = async (modId: string, lessonId: string) => {
    if (!confirm('Hapus materi lesson ini?')) return
    setModules(prev =>
      prev.map(m => {
        if (m.id === modId) {
          return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
        }
        return m
      })
    )
    try {
      await supabase.from('lessons').delete().eq('id', lessonId)
    } catch {}
  }

  // Calculate totals
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const totalVipModules = modules.filter(m => m.tier_access === 'queen_bee').length

  return (
    <div className="space-y-6">
      {/* Header Banner Card (Brand OtwPTN standard) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center p-2.5 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascot-hd/modul-video.png"
              alt="Modul"
              className="w-full h-full object-contain"
              onError={e => {
                ;(e.currentTarget as HTMLImageElement).src = '/logo.png'
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500 font-bold">{modules.length} Modul Aktif</span>
            </div>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">
              Kelola Modul & Video Pembahasan
            </h1>
            <p className="text-xs text-gray-500 font-medium max-w-2xl mt-1">
              Atur kurikulum video strategi non-tes, panduan bedah jurusan, analisis rapor 5 semester, dan file modul per tingkat paket belajar.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModule}
          className="bg-amber-400 hover:bg-amber-500 active:scale-95 text-amber-950 font-black px-5 py-3 rounded-2xl text-xs md:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Tambah Modul Baru</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-400 mb-1">Total Modul Belajar</div>
          <div className="text-2xl font-black text-gray-900">{modules.length}</div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1">Tersedia untuk Pejuang PTN</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-400 mb-1">Total Lesson & Video</div>
          <div className="text-2xl font-black text-gray-900">{totalLessons}</div>
          <div className="text-[10px] font-semibold text-sky-600 mt-1">Video & Modul PDF</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-400 mb-1">Khusus Queen Bee VIP</div>
          <div className="text-2xl font-black text-purple-900">{totalVipModules}</div>
          <div className="text-[10px] font-semibold text-purple-600 mt-1">Masterclass & Wawancara</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-400 mb-1">Akses Bebas / Gratis</div>
          <div className="text-2xl font-black text-emerald-800">
            {modules.filter(m => m.tier_access === 'free').length}
          </div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1">Strategi Dasar Terbuka</div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul modul atau materi..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-amber-400 outline-none transition-all"
          />
        </div>

        {/* Category & Tier Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800 outline-none cursor-pointer focus:bg-white focus:border-amber-400"
          >
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={selectedTier}
            onChange={e => setSelectedTier(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800 outline-none cursor-pointer focus:bg-white focus:border-amber-400"
          >
            <option value="all">Semua Hak Akses Paket</option>
            <option value="free">Gratis (Semua Siswa)</option>
            <option value="nectar">Nectar (Review)</option>
            <option value="honeycomb">Honeycomb (Reguler)</option>
            <option value="queen_bee">Queen Bee (VIP)</option>
          </select>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {filteredModules.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
            <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">Tidak ada modul yang cocok</h3>
            <p className="text-xs text-gray-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter kategori.</p>
          </div>
        ) : (
          filteredModules.map((mod, idx) => {
            const isExpanded = expandedModId === mod.id
            const tierBadge = TIERS.find(t => t.id === mod.tier_access)

            return (
              <div
                key={mod.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                {/* Module Card Header */}
                <div
                  onClick={() => setExpandedModId(isExpanded ? null : mod.id)}
                  className="p-5 md:p-6 flex items-start gap-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
                >
                  {/* Thumbnail / Mascot */}
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-amber-50 flex items-center justify-center p-2 flex-shrink-0 border border-amber-100/60 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mod.thumbnail_url || '/mascot-hd/modul-video.png'}
                      alt={mod.title}
                      className="w-full h-full object-contain filter drop-shadow-xs"
                      onError={e => {
                        ;(e.currentTarget as HTMLImageElement).src = '/logo.png'
                      }}
                    />
                  </div>

                  {/* Main Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        Urutan #{mod.order_index}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/50">
                        {CATEGORIES.find(c => c.id === mod.category)?.label || mod.category}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${tierBadge?.color || 'bg-gray-100 text-gray-700'}`}>
                        {tierBadge?.label || mod.tier_access}
                      </span>
                      {!mod.is_active && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          Nonaktif
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-gray-950 leading-snug line-clamp-2">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium line-clamp-1 mt-1">
                      {mod.description || 'Tidak ada deskripsi modul.'}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-xs font-semibold text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <PlayCircle size={14} className="text-amber-500" />
                        <strong>{mod.lessons.length}</strong> Materi Pembelajaran
                      </span>
                      {mod.file_url && (
                        <a
                          href={mod.file_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-sky-600 hover:text-sky-800 font-bold"
                        >
                          <Link2 size={13} />
                          <span>Link Materi PDF</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    className="flex items-center gap-2 flex-shrink-0"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleOpenAddLesson(mod.id)}
                      className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs transition-colors"
                    >
                      <Plus size={14} />
                      <span>Lesson</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditModule(mod)}
                      className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                      title="Edit Modul"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteModule(mod.id)}
                      className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors"
                      title="Hapus Modul"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Lessons Table */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-5 md:p-6 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-700">
                        Daftar Materi Lesson ({mod.lessons.length})
                      </h4>
                      <button
                        onClick={() => handleOpenAddLesson(mod.id)}
                        className="text-xs font-extrabold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                      >
                        <Plus size={14} />
                        <span>Tambah Lesson</span>
                      </button>
                    </div>

                    {mod.lessons.length === 0 ? (
                      <div className="p-6 text-center bg-white rounded-2xl border border-gray-200/60 text-xs text-gray-500">
                        Belum ada materi lesson di modul ini. Klik tombol Tambah Lesson di atas untuk mulai mengisi.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {mod.lessons.map(les => (
                          <div
                            key={les.id}
                            className="bg-white rounded-2xl p-3.5 border border-gray-100 flex items-center justify-between gap-3 shadow-2xs hover:border-amber-200 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xs flex-shrink-0">
                                {les.order_index}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-md bg-gray-100 text-gray-700">
                                    {les.content_type}
                                  </span>
                                  <h5 className="text-xs font-extrabold text-gray-900 truncate">
                                    {les.title}
                                  </h5>
                                </div>
                                <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
                                  {les.description || 'Tidak ada deskripsi.'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                {les.duration_text || '10 menit'}
                              </span>

                              {les.content_url && (
                                <a
                                  href={les.content_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 flex items-center justify-center"
                                  title="Tonton Video"
                                >
                                  <ExternalLink size={13} />
                                </a>
                              )}

                              {les.file_url && (
                                <a
                                  href={les.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center"
                                  title="Download File"
                                >
                                  <FileText size={13} />
                                </a>
                              )}

                              <button
                                onClick={() => handleDeleteLesson(mod.id, les.id)}
                                className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center"
                                title="Hapus Lesson"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Module Add/Edit Modal (Clean Otbee styling) */}
      {modModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-950">
                {editingMod ? 'Edit Modul Pembahasan' : 'Tambah Modul Pembahasan Baru'}
              </h3>
              <button
                onClick={() => setModModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Judul Modul <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={modForm.title}
                  onChange={e => setModForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Contoh: Strategi Pemetaan Kuota SNBP 2025"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Deskripsi Modul</label>
                <textarea
                  value={modForm.description}
                  onChange={e => setModForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Ringkasan apa yang dipelajari siswa di modul ini..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Kategori Modul</label>
                  <select
                    value={modForm.category}
                    onChange={e => setModForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3.5 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Akses Paket Minimal</label>
                  <select
                    value={modForm.tier_access}
                    onChange={e =>
                      setModForm(p => ({ ...p, tier_access: e.target.value as any }))
                    }
                    className="w-full px-3.5 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                  >
                    <option value="free">Gratis (Semua Siswa)</option>
                    <option value="nectar">Nectar (Review)</option>
                    <option value="honeycomb">Honeycomb (Reguler)</option>
                    <option value="queen_bee">Queen Bee (VIP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Urutan Modul (#)</label>
                  <input
                    type="number"
                    min={1}
                    value={modForm.order_index}
                    onChange={e => setModForm(p => ({ ...p, order_index: Number(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Status Visibilitas</label>
                  <select
                    value={modForm.is_active ? 'active' : 'inactive'}
                    onChange={e => setModForm(p => ({ ...p, is_active: e.target.value === 'active' }))}
                    className="w-full px-3.5 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                  >
                    <option value="active">Aktif (Dipublikasikan)</option>
                    <option value="inactive">Nonaktif (Draft)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Thumbnail URL (Google Drive / Image Link)
                </label>
                <input
                  type="text"
                  value={modForm.thumbnail_url}
                  onChange={e => setModForm(p => ({ ...p, thumbnail_url: e.target.value }))}
                  placeholder="https://drive.google.com/file/d/... atau /mascot-hd/modul-video.png"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Link Lampiran Modul PDF / Slide PPT
                </label>
                <input
                  type="text"
                  value={modForm.file_url}
                  onChange={e => setModForm(p => ({ ...p, file_url: e.target.value }))}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => setModModalOpen(false)}
                className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 font-extrabold text-xs text-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveModule}
                className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 font-black text-xs text-amber-950 transition-all shadow-xs"
              >
                Simpan Modul
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Add Modal */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-950">Tambah Lesson Baru</h3>
              <button
                onClick={() => setLessonModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Judul Lesson <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={e => setLessonForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Contoh: Bedah Aturan Lintas Jurusan SNBP"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Deskripsi Singkat</label>
                <textarea
                  value={lessonForm.description}
                  onChange={e => setLessonForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Poin penting yang dibahas pada video ini..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Tipe Konten</label>
                  <select
                    value={lessonForm.content_type}
                    onChange={e =>
                      setLessonForm(p => ({ ...p, content_type: e.target.value as any }))
                    }
                    className="w-full px-3.5 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                  >
                    <option value="video">Video (YouTube / Vimeo)</option>
                    <option value="pdf">Modul PDF / Dokumen</option>
                    <option value="text">Artikel / Rangkuman Teks</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Durasi / Halaman</label>
                  <input
                    type="text"
                    value={lessonForm.duration_text}
                    onChange={e => setLessonForm(p => ({ ...p, duration_text: e.target.value }))}
                    placeholder="Contoh: 14:20 atau 25 Halaman"
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  URL Video (YouTube / Embed Link)
                </label>
                <input
                  type="text"
                  value={lessonForm.content_url}
                  onChange={e => setLessonForm(p => ({ ...p, content_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Link File PDF / Materi Downloadable (Opsional)
                </label>
                <input
                  type="text"
                  value={lessonForm.file_url}
                  onChange={e => setLessonForm(p => ({ ...p, file_url: e.target.value }))}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => setLessonModalOpen(false)}
                className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 font-extrabold text-xs text-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveLesson}
                className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 font-black text-xs text-amber-950 transition-all shadow-xs"
              >
                Simpan Lesson
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
