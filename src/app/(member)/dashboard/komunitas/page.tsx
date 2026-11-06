'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/useToast'
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
  MessageSquare,
  ChevronRight,
  School,
  ArrowLeft,
  Heart,
  Repeat2,
  Bookmark,
  Crown,
  Link as LinkIcon,
  CheckCircle2,
  Target,
  Lightbulb,
  ArrowRight,
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
    membersCount: 1,
    onlineCount: 1,
    description: 'Circle resmi pejuang SNBP & UM UGM. Diskusi nilai rapor saintek/soshum dan persiapan tes substantif.',
    ptnTarget: 'Universitas Gadjah Mada',
    joined: false,
    isOfficial: true,
    members: [],
  },
  {
    id: 'c-itb',
    name: 'Pejuang TKA ITB',
    category: 'Kampus',
    avatar: '/mascot/glasses-writing-desk.png',
    univBadge: 'ITB',
    membersCount: 1,
    onlineCount: 1,
    description: 'Kupas tuntas kuota eligible sekolah, rekam jejak alumni di ITB, dan portofolio lomba riset BPTI.',
    ptnTarget: 'Institut Teknologi Bandung',
    joined: false,
    isOfficial: true,
    members: [],
  },
  {
    id: 'c-unpad',
    name: 'Pejuang TKA Unpad',
    category: 'Kampus',
    avatar: '/mascot/review-draft.png',
    univBadge: 'UNPAD',
    membersCount: 1,
    onlineCount: 1,
    description: 'Fokus seleksi nilai rapor dan prestasi SNBP serta SMUP Unpad Jatinangor.',
    ptnTarget: 'Universitas Padjadjaran',
    joined: false,
    isOfficial: true,
    members: [],
  },
  {
    id: 'circle-1',
    name: 'Pejuang Fasilkom UI 2026',
    category: 'Teknik',
    avatar: '/mascot/ai-robot.png',
    univBadge: 'UI',
    membersCount: 1,
    onlineCount: 1,
    description: 'Circle khusus pejuang PPKB & SNBP Fasilkom UI. Saling review essay, bedah passing grade rapor, dan sharing sertifikat Puspresnas.',
    ptnTarget: 'Universitas Indonesia (Fasilkom)',
    joined: true,
    isOfficial: true,
    members: [],
  },
  {
    id: 'c-act-1',
    name: 'Pejuang Kedokteran Se-Indonesia 2026',
    category: 'Kedokteran',
    avatar: '/mascot/trophy-graduate.png',
    univBadge: 'FK',
    membersCount: 1,
    onlineCount: 1,
    description: 'Circle pejuang FK UI, FK UGM, FK Unair, dan FK Unpad via SNBP & Jalur Prestasi. Diskusi kurasi portofolio biologi-kimia dan rekap passing grade rapor.',
    ptnTarget: 'FK UI, UGM, Unair, Unpad',
    joined: false,
    members: [],
  },
  {
    id: 'c-act-2',
    name: 'Squad FEB & Hukum UI-UGM-Unpad 2026',
    category: 'Soshum',
    avatar: '/mascot/glasses-writing-desk.png',
    univBadge: 'FEB/FH',
    membersCount: 1,
    onlineCount: 1,
    description: 'Fokus bedah esai reflektif PPKB UI, IUP FEB UGM, dan strategi seleksi rapor rumpun soshum ekonomi dan hukum.',
    ptnTarget: 'FEB & FH UI, FEB UGM, FH Unpad',
    joined: false,
    members: [],
  },
  {
    id: 'c-act-3',
    name: 'International Program (IUP & Talent Scouting)',
    category: 'Internasional',
    avatar: '/mascot/roadmap-flags.png',
    univBadge: 'IUP',
    membersCount: 1,
    onlineCount: 1,
    description: 'Sharing kurasi sertifikat internasional, Motivation Letter bahasa Inggris, dan latihan interview seleksi KKI UI & IUP UGM/ITB.',
    ptnTarget: 'KKI UI, IUP UGM, IUP ITB, IUP ITS',
    joined: false,
    members: [],
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
  const { showToast, toastHost } = useToast()
  const supabase = createClient()
  const [tier, setTier] = useState<string>('free')
  const [myProfile, setMyProfile] = useState<{ name: string; avatar: string; targetPTN: string } | null>(null)
  const [mainView, setMainView] = useState<'feed' | 'circle'>('feed')

  // Circle Navigation States
  const [circles, setCircles] = useState<CircleItem[]>(INITIAL_CIRCLES)
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null)
  const [searchCircle, setSearchCircle] = useState('')

  // Chat message state
  const [messageText, setMessageText] = useState('')
  const [messagesMap, setMessagesMap] = useState<Record<string, MessageItem[]>>({})
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [circleMembersMap, setCircleMembersMap] = useState<Record<string, { name: string; avatar: string; ptn: string; role: 'Ketua' | 'Anggota' }[]>>({})

  const loadCircleMessages = useCallback(async (circleId: string) => {
    setMessagesLoading(true)
    try {
      const res = await fetch(`/api/community/messages?channelId=${encodeURIComponent(circleId)}`)
      const data = await res.json()
      if (data.messages) {
        setMessagesMap(prev => ({ ...prev, [circleId]: data.messages }))
      }
      if (data.members) {
        setCircleMembersMap(prev => ({ ...prev, [circleId]: data.members }))
      }
    } catch (err) {
      console.error('[Load Circle Messages Error]', err)
    } finally {
      setMessagesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedCircleId) {
      loadCircleMessages(selectedCircleId)
    }
  }, [selectedCircleId, loadCircleMessages])

  // Cuitan Social Feed State
  const [cuitanList, setCuitanList] = useState<CuitanPost[]>([])
  const [cuitanFetchDone, setCuitanFetchDone] = useState(false)
  const [newCuitanText, setNewCuitanText] = useState('')
  const [cuitanFilter, setCuitanFilter] = useState<'Semua' | 'SNBP' | 'Esai' | 'Mentor'>('Semua')
  const [cuitanLoading, setCuitanLoading] = useState(false)

  // Inline Reply Thread States (Twitter/X style)
  const [expandedReplyPostId, setExpandedReplyPostId] = useState<string | null>(null)
  const [repliesList, setRepliesList] = useState<{
    id: string
    content: string
    created_at: string
    profiles: { full_name?: string; avatar_url?: string; school_name?: string; target_ptns?: string[] } | null
  }[]>([])
  const [repliesLoading, setRepliesLoading] = useState(false)
  const [replyInputText, setReplyInputText] = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)

  async function handleToggleReplies(post: CuitanPost) {
    if (expandedReplyPostId === post.id) {
      setExpandedReplyPostId(null)
      setRepliesList([])
      setReplyInputText('')
      return
    }
    setExpandedReplyPostId(post.id)
    setRepliesLoading(true)
    setReplyInputText('')
    try {
      const res = await fetch(`/api/community?postId=${post.id}`)
      const data = await res.json()
      setRepliesList(data.replies ?? [])
    } catch {
      setRepliesList([])
    } finally {
      setRepliesLoading(false)
    }
  }

  async function handleSendReply(postId: string) {
    if (!postId || !replyInputText.trim() || replySubmitting) return
    setReplySubmitting(true)
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content: replyInputText.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.reply) {
        setRepliesList(prev => [...prev, data.reply])
        setReplyInputText('')
        setCuitanList(prev =>
          prev.map(p => (p.id === postId ? { ...p, replies: p.replies + 1 } : p))
        )
        showToast('Balasan berhasil dikirim!')
      } else {
        showToast(data.error || 'Gagal mengirim balasan')
      }
    } catch {
      showToast('Koneksi gagal saat mengirim balasan')
    } finally {
      setReplySubmitting(false)
    }
  }

  // Gating & Creation Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [upgradeAlertOpen, setUpgradeAlertOpen] = useState(false)
  const [circleToJoin, setCircleToJoin] = useState<CircleItem | null>(null)
  const [newCircleName, setNewCircleName] = useState('')
  const [newCirclePtn, setNewCirclePtn] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier, full_name, avatar_url, target_ptns')
        .eq('id', data.user.id)
        .single()
      if (profile?.tier) setTier(profile.tier)
      setMyProfile({
        name: profile?.full_name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Pejuang PTN',
        avatar: profile?.avatar_url ?? '',
        targetPTN: (profile?.target_ptns as string[] | null)?.[0] ?? '-',
      })
    })
  }, [supabase])

  useEffect(() => {
    // Load real community posts from DB
    fetch('/api/community')
      .then(r => r.json())
      .then(data => {
        if (data.posts?.length > 0) {
          const mapped: CuitanPost[] = data.posts.map((p: {
            id: string
            content: string
            likes: number
            replies?: number
            created_at: string
            profiles: { full_name?: string; avatar_url?: string; target_ptns?: string[]; target_majors?: string[] } | null
          }) => {
            const prof = p.profiles
            const ptn = prof?.target_ptns?.[0] ?? '-'
            const name = prof?.full_name ?? 'Pejuang PTN'
            const handle = '@' + name.toLowerCase().replace(/\s+/g, '')
            const elapsed = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 60000)
            const timeStr = elapsed < 1 ? 'Baru saja' : elapsed < 60 ? `${elapsed}m yang lalu` : elapsed < 1440 ? `${Math.floor(elapsed / 60)}j yang lalu` : `${Math.floor(elapsed / 1440)}h yang lalu`
            return {
              id: p.id,
              author: name,
              handle,
              avatar: prof?.avatar_url ?? '',
              targetPTN: ptn,
              time: timeStr,
              content: p.content,
              likes: p.likes,
              replies: p.replies ?? 0,
              liked: false,
            }
          })
          setCuitanList(mapped)
        }
        setCuitanFetchDone(true)
      })
      .catch(() => { setCuitanFetchDone(true) })
  }, [])

  const isPremiumUser = tier !== 'free' && tier !== ''

  const activeCircle = circles.find(c => c.id === selectedCircleId)
  const currentMessages = selectedCircleId ? messagesMap[selectedCircleId] || [] : []

  async function handlePostCuitan() {
    if (!newCuitanText.trim() || cuitanLoading) return
    setCuitanLoading(true)
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newCuitanText.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.post) {
        const p = data.post
        const prof = p.profiles
        // Prefer cached myProfile if the join returned null (e.g. RLS or missing profile row)
        const name = prof?.full_name ?? myProfile?.name ?? 'Kamu'
        const avatar = prof?.avatar_url ?? myProfile?.avatar ?? ''
        const targetPTN = (prof?.target_ptns as string[] | undefined)?.[0] ?? myProfile?.targetPTN ?? '-'
        const handle = '@' + name.toLowerCase().replace(/\s+/g, '')
        const newPost: CuitanPost = {
          id: p.id,
          author: name,
          handle,
          avatar,
          targetPTN,
          time: 'Baru saja',
          content: p.content,
          likes: 0,
          replies: 0,
          liked: false,
        }
        setCuitanList(prev => [newPost, ...prev])
        setNewCuitanText('')
        showToast('Cuitan berhasil diposting!')
      } else {
        showToast(data.error || 'Gagal memposting cuitan. Coba lagi.')
      }
    } catch {
      showToast('Gagal memposting cuitan. Periksa koneksi internetmu.')
    } finally {
      setCuitanLoading(false)
    }
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

  async function handleSendMessage() {
    if (!messageText.trim() || !selectedCircleId) return
    const textToSend = messageText.trim()
    setMessageText('')

    const tempId = 'm-' + Date.now()
    const optimisticMsg: MessageItem = {
      id: tempId,
      sender: myProfile?.name || 'Kamu',
      avatar: myProfile?.avatar || '/mascot/default-avatar.png',
      ptn: activeCircle?.ptnTarget || 'Target PTN',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    }

    setMessagesMap(prev => ({
      ...prev,
      [selectedCircleId]: [...(prev[selectedCircleId] || []), optimisticMsg],
    }))

    try {
      const res = await fetch('/api/community/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: selectedCircleId,
          channelName: activeCircle?.name || selectedCircleId,
          content: textToSend,
        }),
      })
      const data = await res.json()
      if (data.message) {
        setMessagesMap(prev => ({
          ...prev,
          [selectedCircleId]: (prev[selectedCircleId] || []).map(m => m.id === tempId ? data.message : m),
        }))
        if (selectedCircleId) {
          loadCircleMessages(selectedCircleId)
        }
      }
    } catch (err) {
      console.error('[Send Message Error]', err)
    }
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
        { name: myProfile?.name ? `${myProfile.name} (Ketua)` : 'Kamu (Ketua)', avatar: myProfile?.avatar || '', ptn: newCirclePtn || 'Target PTN', role: 'Ketua' },
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
      {toastHost}
      {/* Header with Feed / Circle toggle */}
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
              {myProfile?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={myProfile.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover shadow-2xs flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                  {myProfile?.name ? myProfile.name.slice(0, 2).toUpperCase() : 'PTN'}
                </div>
              )}
              <textarea
                value={newCuitanText}
                onChange={e => setNewCuitanText(e.target.value)}
                rows={3}
                placeholder="Apa yang lagi kamu pikirkan seputar persiapan PTN non-tes?"
                className="flex-1 p-3 rounded-2xl bg-gray-50 text-xs font-medium text-gray-900 outline-none resize-none focus:ring-2 focus:ring-amber-400/40"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                <Lightbulb size={12} className="text-amber-500" /> Cuitanmu akan dilihat oleh seluruh pejuang PTN di dashboard.
              </span>
              <button
                onClick={handlePostCuitan}
                disabled={cuitanLoading}
                className="btn-brand-primary px-5 py-2 rounded-full text-xs font-black shadow-xs disabled:opacity-60"
              >
                {cuitanLoading ? 'Posting...' : 'Posting Cuitan'}
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
                {f === 'Semua' ? 'Semua Cuitan' : `# ${f}`}
              </button>
            ))}
          </div>

          {/* Cuitan Posts List */}
          <div className="space-y-4">
            {!cuitanFetchDone && (
              <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Memuat postingan...</div>
            )}
            {cuitanFetchDone && cuitanList.length === 0 && (
              <div className="p-8 text-center text-xs text-gray-400">Belum ada postingan. Jadilah yang pertama!</div>
            )}
            {cuitanList.map(post => (
              <div key={post.id} className="p-6 rounded-3xl bg-white shadow-md space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {post.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover shadow-2xs"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-400 text-amber-950 font-black text-sm flex items-center justify-center shadow-2xs flex-shrink-0">
                        {post.author.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-gray-900">{post.author}</span>
                        <span className="text-[11px] text-gray-400">{post.handle}</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.2 rounded-full flex items-center gap-1">
                        <Target size={11} /> {post.targetPTN}
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
                  <button
                    type="button"
                    onClick={() => handleToggleReplies(post)}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                      expandedReplyPostId === post.id ? 'text-amber-600 font-bold' : 'hover:text-amber-600'
                    }`}
                  >
                    <MessageCircle size={15} aria-hidden />
                    <span>{post.replies} Balasan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `${post.content ?? ''}`.slice(0, 200)
                      navigator.clipboard.writeText(`${text}\n\n${window.location.origin}/dashboard/komunitas`).then(
                        () => showToast('Cuitan disalin ke clipboard.', 'success'),
                        () => showToast('Gagal menyalin cuitan.', 'error'),
                      )
                    }}
                    className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
                  >
                    <Repeat2 size={15} aria-hidden />
                    <span>Bagikan</span>
                  </button>
                </div>

                {/* Inline Replies Thread (Twitter/X style) */}
                {expandedReplyPostId === post.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 pl-4 sm:pl-12 space-y-3 animate-fade-in">
                    {/* Existing replies */}
                    {repliesLoading ? (
                      <div className="py-4 text-center text-xs text-gray-400 animate-pulse">
                        Memuat balasan...
                      </div>
                    ) : repliesList.length > 0 ? (
                      <div className="space-y-2.5">
                        {repliesList.map(r => {
                          const author = r.profiles?.full_name ?? 'Pejuang PTN'
                          const handle = '@' + author.toLowerCase().replace(/\s+/g, '')
                          const elapsed = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 60000)
                          const timeStr = elapsed < 1 ? 'Baru saja' : elapsed < 60 ? `${elapsed}m lalu` : `${Math.floor(elapsed / 60)}j lalu`
                          return (
                            <div key={r.id} className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {r.profiles?.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={r.profiles.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold text-[9px] flex items-center justify-center">
                                      {author.slice(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                  <span className="text-xs font-bold text-gray-900">{author}</span>
                                  <span className="text-[10px] text-gray-400">{handle}</span>
                                </div>
                                <span className="text-[10px] text-gray-400">{timeStr}</span>
                              </div>
                              <p className="text-xs text-gray-700 leading-relaxed pl-7">
                                {r.content}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400 italic py-1">
                        Belum ada balasan. Jadilah yang pertama membalas cuitan ini!
                      </p>
                    )}

                    {/* Inline reply input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={replyInputText}
                        onChange={e => setReplyInputText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendReply(post.id)
                          }
                        }}
                        placeholder={`Balas ${post.author}...`}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-amber-400 text-gray-900 placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendReply(post.id)}
                        disabled={replySubmitting || !replyInputText.trim()}
                        className="btn-brand-primary px-4 py-2 rounded-full text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1 flex-shrink-0"
                      >
                        {replySubmitting ? 'Mengirim...' : 'Balas'}
                      </button>
                    </div>
                  </div>
                )}
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
                    <span className="btn-brand-primary px-3.5 py-1.5 rounded-full text-[11px] font-black shadow-2xs">
                      Buka Chat <ArrowRight size={14} className="inline-block ml-1 align-[-2px]" aria-hidden />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: CIRCLE KAMPUS  */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-950">Circle kampus</h2>
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
                    onClick={() => {
                      if (c.joined) {
                        setSelectedCircleId(c.id)
                      } else {
                        setCircleToJoin(c)
                      }
                    }}
                    className="w-full btn-brand-primary py-2 rounded-full text-xs font-black shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Crown size={13} /> {c.joined ? 'Buka Chat Circle' : 'Gabung'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: CIRCLE AKTIF  */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-950">Circle aktif</h2>
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
                    onClick={() => {
                      if (c.joined) {
                        setSelectedCircleId(c.id)
                      } else {
                        setCircleToJoin(c)
                      }
                    }}
                    className="w-full py-2 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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

          {/* Split 2-Column: Left Chat Box (Flex-1) + Right Info Drawer  */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT / CENTER: CHAT BOX AREA */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-md overflow-hidden flex flex-col min-h-[580px] max-h-[720px]">
              {/* Header  */}
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

              </div>

              {/* Chat Messages Stream  */}
              <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-gray-50/30">
                {messagesLoading ? (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400 space-y-2">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold text-gray-500">Memuat pesan circle...</p>
                  </div>
                ) : currentMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center text-gray-400 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-2xs">
                      <MessageSquare size={26} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-gray-800">Belum ada percakapan di Circle ini</p>
                      <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                        Mulai obrolan pertamamu untuk saling bertukar tips, passing grade, atau kurasi berkas dengan pejuang PTN lainnya!
                      </p>
                    </div>
                  </div>
                ) : (
                  currentMessages.map(msg => (
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

                        {/* Bubble: Golden yellow for me, clean white with shadow for others  */}
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
                  ))
                )}
              </div>

              {/* Bottom Input Bar  */}
              <div className="p-4 border-t border-gray-100 flex items-center gap-2 bg-white">
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
                <p className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <Target size={13} className="text-amber-700" />
                  <span>{activeCircle.ptnTarget}</span>
                </p>
              </div>

              {/* Anggota Circle list */}
              {(() => {
                const membersFromApi = circleMembersMap[selectedCircleId] || []
                const isMeIncluded = membersFromApi.some(
                  m => myProfile?.name && m.name.toLowerCase().includes(myProfile.name.toLowerCase())
                )
                const realMembers = [
                  ...membersFromApi,
                  ...(activeCircle.joined && myProfile && !isMeIncluded ? [{
                    name: `${myProfile.name} (Kamu)`,
                    avatar: myProfile.avatar || '/mascot/default-avatar.png',
                    ptn: myProfile.targetPTN || activeCircle.ptnTarget,
                    role: 'Anggota' as const,
                  }] : []),
                ]

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-gray-900">
                        Anggota Circle ({realMembers.length})
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">Terverifikasi</span>
                    </div>

                    {realMembers.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-gray-50/80 text-center space-y-1">
                        <p className="text-xs font-bold text-gray-700">Belum ada anggota terdaftar</p>
                        <p className="text-[11px] text-gray-400">Jadilah yang pertama bergabung dan mulai berdiskusi!</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                        {realMembers.map((m, mi) => (
                          <div key={mi} className="flex items-center justify-between p-2 rounded-xl bg-gray-50">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={m.avatar || '/mascot/default-avatar.png'}
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
                    )}
                  </div>
                )
              })()}

              {/* Salin Tautan Undangan Button */}
              <button
                onClick={() => {
                  const url = `${window.location.origin}/dashboard/komunitas`
                  navigator.clipboard.writeText(url).then(
                    () => showToast('Tautan komunitas disalin.', 'success'),
                    () => showToast('Gagal menyalin tautan. Salin manual dari address bar.', 'error'),
                  )
                }}
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
                Pembuatan Circle baru dapat dilakukan oleh pengguna <strong>Akun Premium, Nectar, Honeycomb, atau Royal Jelly</strong>. Pengguna gratis tetap dapat bergabung di circle kampus manapun!
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

      {/* KONFIRMASI GABUNG CIRCLE MODAL (ITEM 9) */}
      {circleToJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl relative text-center space-y-4">
            <button
              onClick={() => setCircleToJoin(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-amber-100 p-2 mx-auto flex items-center justify-center shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={circleToJoin.avatar} alt="" className="w-full h-full object-contain" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                Konfirmasi Bergabung
              </span>
              <h3 className="text-base font-black text-gray-950 mt-1.5 leading-snug">
                Gabung ke Circle &ldquo;{circleToJoin.name}&rdquo;?
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Circle ini fokus pada <strong>{circleToJoin.ptnTarget}</strong> dengan {circleToJoin.membersCount} anggota aktif. Dengan bergabung, kamu bisa ikut berdiskusi di grup chat komunitas ini.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  handleJoinCircle(circleToJoin.id)
                  setCircleToJoin(null)
                }}
                className="w-full btn-brand-primary py-3 rounded-full text-xs font-black shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={15} /> Ya, Gabung Circle Sekarang
              </button>
              <button
                type="button"
                onClick={() => setCircleToJoin(null)}
                className="w-full py-2.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
