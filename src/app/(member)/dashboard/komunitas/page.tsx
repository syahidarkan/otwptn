'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Search,
  Plus,
  Send,
  Users,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  Info,
  X,
  Share2,
  Lock,
  Sparkles,
  MessageCircle,
  ChevronRight,
  School,
  ArrowLeft,
  Heart,
  Repeat2,
  Bookmark,
  Crown,
  Link as LinkIcon,
  CheckCircle2,
} from 'lucide-react'

interface CircleItem {
  id: string
  name: string
  category: string
  avatar: string
  univBadge?: string
  membersCount: number
  onlineCount: number
  description: string
  ptnTarget: string
  joined: boolean
  isOfficial?: boolean
  members: { name: string; avatar: string; ptn: string; role: 'Ketua' | 'Anggota' }[]
}

const INITIAL_CIRCLES: CircleItem[] = [
  {
    id: 'c-ugm',
    name: 'Pejuang TKA UGM',
    category: 'Kampus',
    avatar: '/mascot/trophy-graduate.png',
    univBadge: 'UGM',
    membersCount: 9,
    onlineCount: 4,
    description: 'Circle resmi pejuang SNBP & UM UGM. Diskusi nilai rapor saintek/soshum dan persiapan tes substantif.',
    ptnTarget: 'Universitas Gadjah Mada',
    joined: false,
    isOfficial: true,
    members: [
      { name: 'Rian Pratama', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', ptn: 'Teknik Sipil UGM', role: 'Ketua' },
      { name: 'Siti Rahma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', ptn: 'Kedokteran UGM', role: 'Anggota' },
    ],
  },
  {
    id: 'c-itb',
    name: 'Pejuang TKA ITB',
    category: 'Kampus',
    avatar: '/mascot/glasses-writing-desk.png',
    univBadge: 'ITB',
    membersCount: 9,
    onlineCount: 3,
    description: 'Kupas tuntas kuota eligible sekolah, rekam jejak alumni di ITB, dan portofolio lomba riset BPTI.',
    ptnTarget: 'Institut Teknologi Bandung',
    joined: false,
    isOfficial: true,
    members: [
      { name: 'Kevin Marvel', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80', ptn: 'STEI-R ITB', role: 'Ketua' },
    ],
  },
  {
    id: 'c-unpad',
    name: 'Pejuang TKA Unpad',
    category: 'Kampus',
    avatar: '/mascot/review-draft.png',
    univBadge: 'UNPAD',
    membersCount: 6,
    onlineCount: 2,
    description: 'Fokus seleksi nilai rapor dan prestasi SNBP serta SMUP Unpad Jatinangor.',
    ptnTarget: 'Universitas Padjadjaran',
    joined: false,
    isOfficial: true,
    members: [
      { name: 'Alifia Putri', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', ptn: 'Farmasi Unpad', role: 'Ketua' },
    ],
  },
  {
    id: 'circle-1',
    name: 'Pejuang Fasilkom UI 2026',
    category: 'Teknik',
    avatar: '/mascot/ai-robot.png',
    univBadge: 'UI',
    membersCount: 42,
    onlineCount: 8,
    description: 'Circle khusus pejuang PPKB & SNBP Fasilkom UI. Saling review essay, bedah passing grade rapor, dan sharing sertifikat Puspresnas.',
    ptnTarget: 'Universitas Indonesia (Fasilkom)',
    joined: true,
    isOfficial: true,
    members: [
      { name: 'Arkan Danendra', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', ptn: 'Ilmu Komputer UI', role: 'Ketua' },
      { name: 'Nadhira Putri', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', ptn: 'Sistem Informasi UI', role: 'Anggota' },
      { name: 'Dimas Setiawan', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', ptn: 'Ilmu Komputer UI', role: 'Anggota' },
      { name: 'Salwa Khairunnisa', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80', ptn: 'Fasilkom UI', role: 'Anggota' },
    ],
  },
  {
    id: 'c-act-1',
    name: "D'SPARSV - 14",
    category: 'Aktif',
    avatar: '/mascot/roadmap-flags.png',
    membersCount: 37,
    onlineCount: 13,
    description: 'Study circle privat belajar intensif non-tes setiap malam jam 20:00 WIB.',
    ptnTarget: 'Multi Kampus Top',
    joined: false,
    members: [
      { name: 'Fikri Aditya', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80', ptn: 'Teknik Mesin UI', role: 'Ketua' },
    ],
  },
  {
    id: 'c-act-2',
    name: 'bebek ayu',
    category: 'Aktif',
    avatar: '/mascot/thumbsup.png',
    membersCount: 40,
    onlineCount: 4,
    description: 'Circle santai tapi konsisten, sharing rekap materi rapor dan tips essay.',
    ptnTarget: 'Semua PTN',
    joined: false,
    members: [
      { name: 'Ayu Lestari', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80', ptn: 'Manajemen UGM', role: 'Ketua' },
    ],
  },
  {
    id: 'c-act-3',
    name: 'yg mau tau lebih, CHAT!',
    category: 'Aktif',
    avatar: '/mascot/otbee-phone.png',
    membersCount: 10,
    onlineCount: 1,
    description: 'Tanya jawab seputar kurasi sertifikat dan verifikasi berkas SNBP.',
    ptnTarget: 'Kampus Saintek',
    joined: false,
    members: [
      { name: 'Bagas Seto', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', ptn: 'Teknik Elektro ITS', role: 'Ketua' },
    ],
  },
]

interface MessageItem {
  id: string
  sender: string
  avatar: string
  ptn: string
  text: string
  time: string
  isMe: boolean
}

const INITIAL_MESSAGES: Record<string, MessageItem[]> = {
  'circle-1': [
    {
      id: 'm1',
      sender: 'Arkan Danendra',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      ptn: 'Ilmu Komputer UI',
      text: 'Halo teman-teman pejuang Fasilkom! Draf esai PPKB kalian udah sampai berapa kata? Jangan lupa fokus di hook paragraf pertama ya.',
      time: '12:05',
      isMe: false,
    },
    {
      id: 'm2',
      sender: 'Nadhira Putri',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      ptn: 'Sistem Informasi UI',
      text: 'Punya aku baru 350 kata nih, kemarin pas konsul mentor dibilang jangan terlalu banyak cerita waktu kecil, harus lebih ke problem nyata.',
      time: '12:12',
      isMe: false,
    },
    {
      id: 'm3',
      sender: 'Kamu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      ptn: 'Ilmu Komputer UI',
      text: 'Sama! Mentor Rayhan juga nyaranin cantumin metrik konkret dari proyek aplikasi yang pernah kita bikin biar nilainya kuat.',
      time: '12:18',
      isMe: true,
    },
    {
      id: 'm4',
      sender: 'Arkan Danendra',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      ptn: 'Ilmu Komputer UI',
      text: 'Nilai rapor semester 5 buat Matematika udah pada di-submit belum?',
      time: '12:24',
      isMe: false,
    },
  ],
}

interface CuitanPost {
  id: string
  author: string
  handle: string
  avatar: string
  targetPTN: string
  time: string
  content: string
  likes: number
  replies: number
  liked?: boolean
}

const INITIAL_CUITAN: CuitanPost[] = [
  {
    id: 'post-1',
    author: 'Fajar Nugraha',
    handle: '@fajarnug',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    targetPTN: 'UI · Ilmu Komputer',
    time: '15m yang lalu',
    content: 'Alhamdulillah hasil audit rapor 5 semester di otwptn keluar, linieritas prodi tembus 94%! Bismillah PPKB UI tahun ini eligible aman.',
    likes: 24,
    replies: 5,
  },
  {
    id: 'post-2',
    author: 'Keisha Maharani',
    handle: '@keishamhrn',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    targetPTN: 'UNAIR · Kedokteran',
    time: '42m yang lalu',
    content: 'Teman-teman pejuang FK, sertifikat Puspresnas tingkat provinsi lebih baik ditaruh di slot nomor berapa ya? Ada yang pernah konsul ke mentor?',
    likes: 18,
    replies: 7,
  },
  {
    id: 'post-3',
    author: 'Dinda Ayuningtyas',
    handle: '@dindaayuu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    targetPTN: 'ITB · SBM',
    time: '2j yang lalu',
    content: 'Tadi barusan kelar sesi Google Meet 1-on-1 sama Kak Amanda alumni SBM ITB. Hook esai kepemimpinanku langsung dirombak jadi data-driven! Kerasa banget bedanya.',
    likes: 31,
    replies: 9,
  },
]

export default function KomunitasPage() {
  const supabase = createClient()
  const [tier, setTier] = useState<string>('free')
  const [mainView, setMainView] = useState<'feed' | 'circle'>('feed')

  // Circle Navigation States
  const [circles, setCircles] = useState<CircleItem[]>(INITIAL_CIRCLES)
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null)
  const [searchCircle, setSearchCircle] = useState('')

  // Chat message state
  const [messageText, setMessageText] = useState('')
  const [messagesMap, setMessagesMap] = useState<Record<string, MessageItem[]>>(INITIAL_MESSAGES)

  // Cuitan Social Feed State
  const [cuitanList, setCuitanList] = useState<CuitanPost[]>(INITIAL_CUITAN)
  const [newCuitanText, setNewCuitanText] = useState('')
  const [cuitanFilter, setCuitanFilter] = useState<'Semua' | 'SNBP' | 'Esai' | 'Mentor'>('Semua')

  // Gating & Creation Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [upgradeAlertOpen, setUpgradeAlertOpen] = useState(false)
  const [newCircleName, setNewCircleName] = useState('')
  const [newCirclePtn, setNewCirclePtn] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase
        .from('profiles')
        .select('tier')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile?.tier) setTier(profile.tier)
        })
    })
  }, [supabase])

  const isPremiumUser = tier !== 'free' && tier !== ''

  const activeCircle = circles.find(c => c.id === selectedCircleId)
  const currentMessages = selectedCircleId ? messagesMap[selectedCircleId] || [] : []

  function handlePostCuitan() {
    if (!newCuitanText.trim()) return
    const newPost: CuitanPost = {
      id: 'post-' + Date.now(),
      author: 'Kamu',
      handle: '@pejuangptn',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      targetPTN: 'UI · Target Pilihan',
      time: 'Baru saja',
      content: newCuitanText.trim(),
      likes: 1,
      replies: 0,
      liked: true,
    }
    setCuitanList([newPost, ...cuitanList])
    setNewCuitanText('')
  }

  function handleToggleLike(id: string) {
    setCuitanList(prev =>
      prev.map(p => {
        if (p.id === id) {
          const liked = !p.liked
          return { ...p, liked, likes: liked ? p.likes + 1 : p.likes - 1 }
        }
        return p
      })
    )
  }

  function handleJoinCircle(circleId: string) {
    setCircles(prev =>
      prev.map(c => (c.id === circleId ? { ...c, joined: true, membersCount: c.membersCount + 1 } : c))
    )
    setSelectedCircleId(circleId)
  }

  function handleSendMessage() {
    if (!messageText.trim() || !selectedCircleId) return
    const newMsg: MessageItem = {
      id: 'm-' + Date.now(),
      sender: 'Kamu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      ptn: activeCircle?.ptnTarget || 'Target PTN',
      text: messageText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    }

    setMessagesMap(prev => ({
      ...prev,
      [selectedCircleId]: [...(prev[selectedCircleId] || []), newMsg],
    }))

    setMessageText('')
  }

  function handleOpenCreateModal() {
    if (!isPremiumUser) {
      setUpgradeAlertOpen(true)
      return
    }
    setCreateModalOpen(true)
  }

  function handleCreateCircle() {
    if (!newCircleName.trim()) return
    const newC: CircleItem = {
      id: 'c-' + Date.now(),
      name: newCircleName.trim(),
      category: 'Aktif',
      avatar: '/mascot/check-paper-happy.png',
      membersCount: 1,
      onlineCount: 1,
      description: 'Circle belajar bersama persiapan lolos seleksi PTN non-tes.',
      ptnTarget: newCirclePtn.trim() || 'Universitas Pilihan',
      joined: true,
      members: [
        { name: 'Kamu (Pembuat Circle)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', ptn: newCirclePtn || 'Target PTN', role: 'Ketua' },
      ],
    }
    setCircles([newC, ...circles])
    setSelectedCircleId(newC.id)
    setCreateModalOpen(false)
    setNewCircleName('')
    setNewCirclePtn('')
  }

  const myJoinedCircles = circles.filter(c => c.joined)
  const campusCircles = circles.filter(c => c.category === 'Kampus')
  const activeCircles = circles.filter(c => c.category === 'Aktif')

  return (
    <div className="w-full px-6 md:px-8 py-6 md:py-8 space-y-6">
      {/* TOP HEADER WITH FEED / CIRCLE TOGGLE SWITCH (PERSIS SCREENSHOT 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Toggle Pill Button: Feed vs Circle */}
        <div className="inline-flex items-center p-1.5 rounded-full bg-gray-100/90 shadow-2xs">
          <button
            onClick={() => {
              setMainView('feed')
              setSelectedCircleId(null)
            }}
            className={`px-8 py-2 rounded-full text-xs font-black transition-all ${
              mainView === 'feed'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Feed
          </button>
          <button
            onClick={() => setMainView('circle')}
            className={`px-8 py-2 rounded-full text-xs font-black transition-all ${
              mainView === 'circle'
                ? 'btn-brand-primary shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Circle
          </button>
        </div>

        {/* Right side: Search bar & + Buat button ONLY when in Circle tab */}
        {mainView === 'circle' && !selectedCircleId && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchCircle}
                onChange={e => setSearchCircle(e.target.value)}
                placeholder="Cari circle atau kampus"
                className="w-56 sm:w-64 pl-9 pr-3 py-2 rounded-full bg-white text-xs font-medium text-gray-900 shadow-xs outline-none border border-gray-100 focus:border-amber-400"
              />
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="btn-brand-primary px-5 py-2 rounded-full text-xs font-black shadow-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus size={15} /> Buat
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          VIEW A: CUITAN SOCIAL FEED (FULL WIDTH TO RIGHT SCREEN)
          ========================================================================= */}
      {mainView === 'feed' && (
        <div className="space-y-6 w-full">
          {/* Post New Cuitan Box */}
          <div className="p-6 rounded-3xl bg-white shadow-md space-y-4">
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt=""
                className="w-10 h-10 rounded-full object-cover shadow-2xs"
              />
              <textarea
                value={newCuitanText}
                onChange={e => setNewCuitanText(e.target.value)}
                rows={3}
                placeholder="Apa yang lagi kamu pikirkan seputar persiapan PTN non-tes?"
                className="flex-1 p-3 rounded-2xl bg-gray-50 text-xs font-medium text-gray-900 outline-none resize-none focus:ring-2 focus:ring-amber-400/40"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-[11px] text-gray-400 font-medium">
                💡 Cuitanmu akan dilihat oleh seluruh pejuang PTN di dashboard.
              </span>
              <button
                onClick={handlePostCuitan}
                className="btn-brand-primary px-5 py-2 rounded-full text-xs font-black shadow-xs"
              >
                Posting Cuitan
              </button>
            </div>
          </div>

          {/* Cuitan Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {(['Semua', 'SNBP', 'Esai', 'Mentor'] as const).map(f => (
              <button
                key={f}
                onClick={() => setCuitanFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-colors ${
                  cuitanFilter === f
                    ? 'btn-brand-primary'
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-2xs'
                }`}
              >
                {f === 'Semua' ? '🌟 Semua Cuitan' : `# ${f}`}
              </button>
            ))}
          </div>

          {/* Cuitan Posts List */}
          <div className="space-y-4">
            {cuitanList.map(post => (
              <div key={post.id} className="p-6 rounded-3xl bg-white shadow-md space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-gray-900">{post.author}</span>
                        <span className="text-[11px] text-gray-400">{post.handle}</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.2 rounded-full">
                        🎯 {post.targetPTN}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">{post.time}</span>
                </div>

                <p className="text-xs text-gray-800 leading-relaxed font-medium pl-13">
                  {post.content}
                </p>

                <div className="flex items-center gap-6 pt-3 border-t border-gray-100 pl-13 text-xs text-gray-500">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 hover:text-rose-500 transition-colors ${
                      post.liked ? 'text-rose-500 font-black' : ''
                    }`}
                  >
                    <Heart size={15} fill={post.liked ? 'currentColor' : 'none'} />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-amber-600 transition-colors">
                    <MessageCircle size={15} />
                    <span>{post.replies} Balasan</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                    <Repeat2 size={15} />
                    <span>Bagikan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW B: CIRCLE DIRECTORY (SCREENSHOT 1) - IF NO CIRCLE IS OPENED
          ========================================================================= */}
      {mainView === 'circle' && !selectedCircleId && (
        <div className="space-y-8">
          {/* SECTION 1: CIRCLE SAYA */}
          <div className="space-y-3">
            <h2 className="text-base font-black text-gray-950">Circle saya</h2>

            {myJoinedCircles.length === 0 ? (
              <p className="text-xs text-gray-400 font-medium">Belum ada circle</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myJoinedCircles.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCircleId(c.id)}
                    className="p-5 rounded-3xl bg-white shadow-md flex items-center justify-between cursor-pointer hover-lift border border-amber-200/60"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.avatar}
                        alt=""
                        className="w-12 h-12 object-contain"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-gray-900 truncate flex items-center gap-1">
                          {c.name}
                          <CheckCircle2 size={13} className="text-emerald-500 inline flex-shrink-0" />
                        </h4>
                        <p className="text-[11px] text-gray-500 font-medium">{c.membersCount} anggota</p>
                      </div>
                    </div>
                    <button className="btn-brand-primary px-3.5 py-1.5 rounded-full text-[11px] font-black shadow-2xs">
                      Buka Chat →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: CIRCLE KAMPUS (PERSIS SCREENSHOT 1) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-950">Circle kampus</h2>
              <button className="text-xs font-black text-gray-500 hover:text-gray-900 flex items-center gap-0.5">
                Semua kampus <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {campusCircles.map(c => (
                <div
                  key={c.id}
                  className="p-5 rounded-3xl bg-white shadow-md flex flex-col justify-between space-y-4 hover-lift"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Circle Avatar with University Badge */}
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.avatar}
                        alt=""
                        className="w-14 h-14 object-contain rounded-2xl bg-amber-50 p-1"
                      />
                      {c.univBadge && (
                        <span className="absolute -bottom-1 -right-1 text-[9px] font-black bg-white text-gray-900 px-1.5 py-0.2 rounded-full shadow-2xs border border-gray-100">
                          {c.univBadge}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-gray-900 truncate flex items-center gap-1">
                        {c.name}
                        <CheckCircle2 size={13} className="text-blue-500 inline flex-shrink-0" />
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                        {c.membersCount} anggota
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinCircle(c.id)}
                    className="w-full btn-brand-primary py-2 rounded-full text-xs font-black shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <Crown size={13} /> {c.joined ? 'Buka Chat Circle' : 'Gabung'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: CIRCLE AKTIF (PERSIS SCREENSHOT 1) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-950">Circle aktif</h2>
              <button className="text-xs font-black text-gray-500 hover:text-gray-900 flex items-center gap-0.5">
                Jelajahi semua <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCircles.map(c => (
                <div
                  key={c.id}
                  className="p-5 rounded-3xl bg-white shadow-md flex flex-col justify-between space-y-4 hover-lift"
                >
                  <div className="flex items-center gap-3.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.avatar}
                      alt=""
                      className="w-14 h-14 object-contain rounded-2xl bg-gray-50 p-1"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-gray-900 truncate">{c.name}</h4>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                        {c.onlineCount}/{c.membersCount} · 2j aktif
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinCircle(c.id)}
                    className="w-full py-2 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LinkIcon size={13} /> {c.joined ? 'Buka Chat' : 'Gabung'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW C: CHATBOX VIEW (SCREENSHOT 2) - WITHOUT LEFT LIST!
          ========================================================================= */}
      {mainView === 'circle' && selectedCircleId && activeCircle && (
        <div className="space-y-4">
          {/* Back button */}
          <button
            onClick={() => setSelectedCircleId(null)}
            className="text-xs font-black text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={15} /> Kembali ke Daftar Circle
          </button>

          {/* Split 2-Column: Left Chat Box (Flex-1) + Right Info Drawer (Screenshot 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT / CENTER: CHAT BOX AREA */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-md overflow-hidden flex flex-col min-h-[580px] max-h-[720px]">
              {/* Header (Screenshot 2) */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeCircle.avatar}
                    alt=""
                    className="w-11 h-11 rounded-2xl object-contain bg-amber-50 p-1 shadow-2xs"
                  />
                  <div>
                    <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                      {activeCircle.name}
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        ● {activeCircle.onlineCount} Online
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-500 font-medium">
                      {activeCircle.membersCount} Anggota · Fokus: {activeCircle.ptnTarget}
                    </p>
                  </div>
                </div>

                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-xl">
                  <Info size={18} />
                </button>
              </div>

              {/* Chat Messages Stream (Screenshot 2) */}
              <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-gray-50/30">
                {currentMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-lg ${msg.isMe ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    {!msg.isMe && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={msg.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover shadow-2xs flex-shrink-0 mt-1"
                      />
                    )}

                    <div className={`space-y-1 ${msg.isMe ? 'items-end' : ''}`}>
                      {!msg.isMe && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black text-gray-900">{msg.sender}</span>
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.2 rounded-full">
                            {msg.ptn}
                          </span>
                        </div>
                      )}

                      {/* Bubble: Golden yellow for me, clean white with shadow for others (Screenshot 2) */}
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.isMe
                            ? 'bg-amber-400 text-amber-950 font-medium rounded-tr-none shadow-xs'
                            : 'bg-white text-gray-800 font-medium rounded-tl-none shadow-sm'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <div
                          className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                            msg.isMe ? 'text-amber-900/80 font-bold' : 'text-gray-400 font-mono'
                          }`}
                        >
                          <span>{msg.time}</span>
                          {msg.isMe && <CheckCheck size={13} className="text-amber-900" />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Input Bar (Screenshot 2) */}
              <div className="p-4 border-t border-gray-100 flex items-center gap-2 bg-white">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
                  <Smile size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
                  <Paperclip size={18} />
                </button>

                <input
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSendMessage()
                  }}
                  placeholder={`Tulis pesan di ${activeCircle.name}...`}
                  className="flex-1 px-4 py-2.5 rounded-full bg-gray-50 text-xs font-medium text-gray-900 outline-none focus:ring-2 focus:ring-amber-400/40"
                />

                <button
                  onClick={handleSendMessage}
                  className="btn-brand-primary w-10 h-10 rounded-full flex items-center justify-center shadow-xs flex-shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>

            {/* RIGHT SIDEBAR / DETAILS DRAWER (PERSIS SCREENSHOT 2) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-md space-y-6">
              <div className="text-center space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeCircle.avatar}
                  alt=""
                  className="w-16 h-16 object-contain rounded-3xl bg-amber-50 p-2 mx-auto shadow-2xs"
                />
                <h3 className="text-sm font-black text-gray-950">{activeCircle.name}</h3>
                <span className="inline-block text-[10px] font-black uppercase text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                  KATEGORI {activeCircle.category}
                </span>
              </div>

              {/* TENTANG CIRCLE */}
              <div className="p-4 rounded-2xl bg-gray-50/70 space-y-1">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  Tentang Circle
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  {activeCircle.description}
                </p>
              </div>

              {/* TARGET KAMPUS UTAMA */}
              <div className="p-4 rounded-2xl bg-gray-50/70 space-y-1">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  Target Kampus Utama
                </h4>
                <p className="text-xs font-black text-amber-900">
                  🎯 {activeCircle.ptnTarget}
                </p>
              </div>

              {/* Anggota Circle list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-gray-900">
                    Anggota Circle ({activeCircle.membersCount})
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">Terverifikasi</span>
                </div>

                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {activeCircle.members.map((m, mi) => (
                    <div key={mi} className="flex items-center justify-between p-2 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.avatar}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover shadow-2xs"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{m.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{m.ptn}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salin Tautan Undangan Button */}
              <button
                onClick={() => alert('Link undangan circle berhasil disalin!')}
                className="w-full py-2.5 rounded-full text-xs font-bold bg-white hover:bg-gray-50 text-gray-800 shadow-xs border border-gray-100 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 size={13} className="text-amber-600" /> Salin Tautan Undangan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CIRCLE MODAL (PREMIUM ONLY) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                Fitur Eksklusif Member Paket
              </span>
              <h3 className="text-lg font-black text-gray-900 mt-1">
                Bikin Circle Belajar Baru
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Nama Circle</label>
                <input
                  value={newCircleName}
                  onChange={e => setNewCircleName(e.target.value)}
                  placeholder="Misal: Pejuang FKG UI 2026"
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Target Kampus</label>
                <input
                  value={newCirclePtn}
                  onChange={e => setNewCirclePtn(e.target.value)}
                  placeholder="Misal: Universitas Indonesia"
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleCreateCircle}
                className="flex-1 btn-brand-primary py-3 rounded-full text-xs font-black shadow-md"
              >
                Buat Circle Sekarang
              </button>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="px-5 py-3 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPGRADE GATING ALERT MODAL */}
      {upgradeAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl relative text-center space-y-4">
            <button
              onClick={() => setUpgradeAlertOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <div className="w-14 h-14 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-sm">
              <Lock size={26} />
            </div>

            <div>
              <h3 className="text-lg font-black text-gray-900">
                Fitur Eksklusif Member Paket
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mt-2">
                Pembuatan Circle baru hanya dapat dilakukan oleh pengguna <strong>Paket Review, Reguler, atau VIP Mentorship</strong>. Pengguna gratis tetap dapat bergabung di circle kampus manapun!
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <Link
                href="/upgrade"
                className="w-full btn-brand-primary py-3 rounded-full text-xs font-black shadow-md text-center"
              >
                Upgrade Paket Sekarang
              </Link>
              <button
                onClick={() => setUpgradeAlertOpen(false)}
                className="w-full sm:w-auto px-5 py-3 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
