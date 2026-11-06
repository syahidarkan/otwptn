'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import FeatureHeader from '@/components/dashboard/FeatureHeader'
import PadananKataGame from '@/components/games/PadananKataGame'
import OmegleSection from '@/components/landing/OmegleSection'
import { StudyCamWebRTC, PeerInfo } from '@/lib/studyCam/webrtcManager'
import { getSafeMediaStream } from '@/lib/studyCam/mediaUtils'
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  UserPlus,
  Check,
  Send,
  Sparkles,
  Flame,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Users,
  Search,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  X,
  Volume2,
  VolumeX,
  Swords,
  Target,
} from 'lucide-react'

interface PeerProfile {
  id: string
  name: string
  school: string
  city: string
  targetPTN: string
  targetMajor: string
  streak: number
  topic: string
  videoUrl?: string
  avatar: string
}

const ALL_PTNS = [
  { id: 'UI', label: 'UI' },
  { id: 'ITB', label: 'ITB' },
  { id: 'UGM', label: 'UGM' },
  { id: 'ITS', label: 'ITS' },
  { id: 'UNAIR', label: 'UNAIR' },
  { id: 'UNDIP', label: 'UNDIP' },
  { id: 'UNPAD', label: 'UNPAD' },
  { id: 'UB', label: 'UB' },
  { id: 'IPB', label: 'IPB' },
  { id: 'UNS', label: 'UNS' },
  { id: 'UNHAS', label: 'UNHAS' },
  { id: 'UNAND', label: 'UNAND' },
  { id: 'UNNES', label: 'UNNES' },
  { id: 'UNY', label: 'UNY' },
  { id: 'UPI', label: 'UPI' },
  { id: 'USU', label: 'USU' },
  { id: 'UDAYANA', label: 'UDAYANA' },
  { id: 'UNSOED', label: 'UNSOED' },
]

const PEER_POOL: PeerProfile[] = [
  {
    id: 'p-1',
    name: 'Dinda Ayuningtyas',
    school: 'SMAN 3 Bandung',
    city: 'Bandung',
    targetPTN: 'Institut Teknologi Bandung (ITB)',
    targetMajor: 'SBM ITB',
    streak: 14,
    topic: 'Fokus Bikin Portofolio & Latsol Matematika',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-2',
    name: 'Fajar Nugraha',
    school: 'SMAN 8 Jakarta',
    city: 'Jakarta Selatan',
    targetPTN: 'Universitas Indonesia (UI)',
    targetMajor: 'Ilmu Komputer',
    streak: 21,
    topic: 'Review Draf Esai PPKB UI Paragraf 3-4',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-3',
    name: 'Keisha Maharani',
    school: 'MAN 2 Surabaya',
    city: 'Surabaya',
    targetPTN: 'Universitas Airlangga (UNAIR)',
    targetMajor: 'Kedokteran',
    streak: 18,
    topic: 'Latihan Biologi Rapor & Bedah Syarat Mandiri',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-4',
    name: 'Bima Pratama',
    school: 'SMA Taruna Nusantara',
    city: 'Magelang',
    targetPTN: 'Universitas Gadjah Mada (UGM)',
    targetMajor: 'Teknik Sipil',
    streak: 9,
    topic: 'Bahas Latsol Fisika & Susun Rencana Belajar 7 Hari',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-5',
    name: 'Nayla Zahira',
    school: 'SMAN 1 Yogyakarta',
    city: 'Yogyakarta',
    targetPTN: 'Universitas Indonesia (UI)',
    targetMajor: 'Psikologi',
    streak: 11,
    topic: 'Menulis Motivation Letter & Brainstorming Ide',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-6',
    name: 'Raffi Kurniawan',
    school: 'SMAN 1 Surabaya',
    city: 'Surabaya',
    targetPTN: 'Institut Teknologi Sepuluh Nopember (ITS)',
    targetMajor: 'Informatika ITS',
    streak: 15,
    topic: 'Simulasi Seleksi Prestasi Mandiri Rapor',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-7',
    name: 'Siti Nurhaliza',
    school: 'SMAN 1 Semarang',
    city: 'Semarang',
    targetPTN: 'Universitas Diponegoro (UNDIP)',
    targetMajor: 'Kesehatan Masyarakat',
    streak: 8,
    topic: 'Merapikan Berkas Legalisir & Sertifikat O2SN',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-8',
    name: 'Alifian Rasyid',
    school: 'SMAN 3 Malang',
    city: 'Malang',
    targetPTN: 'Universitas Brawijaya (UB)',
    targetMajor: 'Teknologi Informasi',
    streak: 12,
    topic: 'Diskusi Nilai Rapor Eligible SNBP',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
  },
]

// Canvas animated TV static noise effect for matching state
function StaticNoise() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf: number

    function draw() {
      const w = canvas!.width
      const h = canvas!.height
      const img = ctx!.createImageData(w, h)
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 100 + 30
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v
        img.data[i + 3] = 255
      }
      ctx!.putImageData(img, 0, 0)
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={240}
      className="absolute inset-0 w-full h-full object-cover opacity-60"
    />
  )
}

interface ChatMessage {
  id: string
  sender: 'you' | 'peer'
  text: string
  time: string
}

export default function CariTemanBelajarPage() {
  const [activeTab, setActiveTab] = useState<'study-cam' | 'friends-list'>('study-cam')
  const [showBattleModal, setShowBattleModal] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'searching' | 'connected' | 'timeout'>('idle')
  const [currentPeer, setCurrentPeer] = useState<PeerProfile | null>(null)
  const [selectedPTNs, setSelectedPTNs] = useState<string[]>([])
  const [showFocusModal, setShowFocusModal] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cam & Mic states
  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [camDenied, setCamDenied] = useState(false)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const webrtcRef = useRef<StudyCamWebRTC | null>(null)
  const myId = useRef('user_' + Math.random().toString(36).substring(2, 9))
  const [isAudioBlocked, setIsAudioBlocked] = useState(false)
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false)

  // In-session Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')

  // Friends List
  const [friends, setFriends] = useState<PeerProfile[]>([
    {
      id: 'f-1',
      name: 'Dimas Wicaksono',
      school: 'SMAN 8 Jakarta',
      city: 'Jakarta',
      targetPTN: 'Universitas Indonesia',
      targetMajor: 'Ilmu Komputer',
      streak: 12,
      topic: 'Sedang belajar esai',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    },
  ])
  const [addedCurrent, setAddedCurrent] = useState(false)
  const [activeFriendChat, setActiveFriendChat] = useState<PeerProfile | null>(null)
  const [friendChatMessages, setFriendChatMessages] = useState<Record<string, string[]>>({
    'f-1': ['Halo! Makasih ya udah belajar bareng kemarin.', 'Sama-sama! Esai kamu udah oke banget kok.'],
  })
  const [friendChatInput, setFriendChatInput] = useState('')

  // Pomodoro Focus Timer
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60)
  const [timerRunning, setTimerRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => setPomodoroSeconds(s => s - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [timerRunning, pomodoroSeconds])

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Camera initialization with multi-tier fallback for Windows, Mac, iOS, Android
  async function initCamera(): Promise<MediaStream | null> {
    const res = await getSafeMediaStream()
    if (res.stream) {
      streamRef.current = res.stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = res.stream
        localVideoRef.current.play().catch(() => {})
      }
      setCamOn(res.hasVideo)
      setMicOn(res.hasAudio)
      setCamDenied(false)
      webrtcRef.current?.setLocalStream(res.stream)
      return res.stream
    } else {
      setCamDenied(true)
      setCamOn(false)
      return null
    }
  }

  function toggleCam() {
    if (!streamRef.current) {
      initCamera()
      return
    }
    const next = !camOn
    streamRef.current.getVideoTracks().forEach(t => {
      t.enabled = next
    })
    setCamOn(next)
  }

  function toggleMic() {
    if (!streamRef.current) return
    const next = !micOn
    streamRef.current.getAudioTracks().forEach(t => {
      t.enabled = next
    })
    setMicOn(next)
  }

  async function handleStartSearch() {
    myId.current = 'user_' + Math.random().toString(36).substring(2, 9)
    let stream = streamRef.current
    if (!stream && !camDenied) {
      stream = await initCamera()
    }
    setPhase('searching')
    setCurrentPeer(null)
    setAddedCurrent(false)
    setChatMessages([])

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }

    if (webrtcRef.current) {
      webrtcRef.current.cleanup()
    }

    const myProfile: PeerInfo = {
      id: myId.current,
      name: typeof window !== 'undefined' ? (localStorage.getItem('otwptn_user_name') || 'Pejuang PTN') : 'Pejuang PTN',
      school: 'SMA Indonesia',
      city: 'Online',
      targetPTN: selectedPTNs.length > 0 ? selectedPTNs.join(', ') : 'Semua PTN',
    }

    const rtc = new StudyCamWebRTC(myProfile, stream, {
      onMatchFound: (foundPeer) => {
        setCurrentPeer({
          id: foundPeer.id,
          name: foundPeer.name,
          school: foundPeer.school,
          city: foundPeer.city,
          targetPTN: foundPeer.targetPTN,
          targetMajor: 'Siswa Pejuang PTN',
          streak: 9,
          topic: 'Fokus Belajar & Latsol',
          avatar: '',
        })
        setChatMessages([
          {
            id: 'm1',
            sender: 'peer',
            text: `Halo! Salam kenal, aku ${foundPeer.name.split(' ')[0]} dari ${foundPeer.school}. Lagi fokus belajar bareng ya! Targetku di ${foundPeer.targetPTN}.`,
            time: 'Baru saja',
          },
        ])
        setPhase('connected')
      },
      onRemoteStream: (remoteStream) => {
        remoteStreamRef.current = remoteStream
        setPhase('connected')

        // 1. Video playback via remote stream
        const videoEl = remoteVideoRef.current
        if (videoEl && videoEl.srcObject !== remoteStream) {
          videoEl.srcObject = remoteStream
          videoEl.muted = false
          videoEl.play().catch(() => {
            console.warn('[StudyCam] Unmuted autoplay blocked by browser policy. Fallback to muted video + tap to unmute.')
            videoEl.muted = true
            videoEl.play().catch(e => console.error('[StudyCam] Failed muted play:', e))
            setIsAudioBlocked(true)
          })
        }

        // 2. Audio playback via dedicated element
        const audioEl = remoteAudioRef.current
        if (audioEl && audioEl.srcObject !== remoteStream) {
          audioEl.srcObject = remoteStream
          audioEl.play().catch(() => {
            setIsAudioBlocked(true)
          })
        }
        if (remoteStream.getVideoTracks().length > 0) {
          setHasRemoteVideo(true)
        }
      },
      onPeerLeft: () => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null
        }
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = null
        }
        remoteStreamRef.current = null
        setCurrentPeer(null)
        setPhase('idle')
        setIsAudioBlocked(false)
        setHasRemoteVideo(false)
      },
      onTimeout: () => {
        setPhase('timeout')
        setHasRemoteVideo(false)
      },
    })

    webrtcRef.current = rtc
    rtc.startMatchmaking()
  }

  // Ensure remote stream is mounted and playing once phase switches to connected
  useEffect(() => {
    if (phase !== 'connected') {
      setHasRemoteVideo(false)
      return
    }

    const checkAndMount = () => {
      const s = remoteStreamRef.current
      const videoEl = remoteVideoRef.current
      const audioEl = remoteAudioRef.current

      if (s) {
        const vTracks = s.getVideoTracks()
        if (vTracks.length > 0) {
          setHasRemoteVideo(true)
          if (videoEl) {
            if (videoEl.srcObject !== s) {
              videoEl.srcObject = s
            }
            if (videoEl.paused) {
              videoEl.play().catch(() => {})
            }
          }
        } else if (videoEl && videoEl.srcObject !== s) {
          videoEl.srcObject = s
          if (videoEl.paused) {
            videoEl.play().catch(() => {})
          }
        }

        if (audioEl && audioEl.srcObject !== s) {
          audioEl.srcObject = s
          if (audioEl.paused) {
            audioEl.play().catch(() => {})
          }
        }

        if (vTracks.length > 0) {
          const vt = vTracks[0]
          if (vt.readyState === 'live' && !vt.muted) {
            setHasRemoteVideo(true)
          }
          vt.onunmute = () => {
            setHasRemoteVideo(true)
            if (videoEl && videoEl.paused) {
              videoEl.play().catch(() => {})
            }
          }
        }
      }

      if (videoEl && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
        setHasRemoteVideo(true)
      }
    }

    const interval = setInterval(checkAndMount, 350)
    checkAndMount()

    return () => clearInterval(interval)
  }, [phase])

  function togglePTN(id: string) {
    setSelectedPTNs(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function handleNext() {
    handleStop()
    setTimeout(() => {
      handleStartSearch()
    }, 400)
  }

  function handleStop() {
    if (webrtcRef.current) {
      webrtcRef.current.disconnect()
      webrtcRef.current = null
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null
    }
    remoteStreamRef.current = null
    setIsAudioBlocked(false)
    setHasRemoteVideo(false)
    setPhase('idle')
    setCurrentPeer(null)
    setAddedCurrent(false)
  }

  function handleAddFriend() {
    if (!currentPeer) return
    if (!friends.some(f => f.id === currentPeer.id)) {
      setFriends(prev => [currentPeer, ...prev])
    }
    setAddedCurrent(true)
  }

  function handleSendInRoomChat(e: React.FormEvent) {
    e.preventDefault()
    if (!chatInput.trim()) return

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'you',
      text: chatInput.trim(),
      time: 'Baru saja',
    }
    setChatMessages(prev => [...prev, newMsg])
    setChatInput('')

    // Simulated reply after 1.5s
    setTimeout(() => {
      if (currentPeer) {
        setChatMessages(prev => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            sender: 'peer',
            text: 'Semangat ya! Lanjut fokus belajar lagi!',
            time: 'Baru saja',
          },
        ])
      }
    }, 1500)
  }

  function handleSendFriendMessage(friendId: string) {
    if (!friendChatInput.trim()) return
    setFriendChatMessages(prev => ({
      ...prev,
      [friendId]: [...(prev[friendId] || []), friendChatInput.trim()],
    }))
    setFriendChatInput('')
  }

  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10">
      <FeatureHeader
        title="Otbee TV - Cari Teman Belajar"
        subtitle="Rasakan serunya belajar bareng via video call acak layaknya Otbee TV, temukan rekan satu target PTN, tambahkan ke kontak teman, dan jaga fokus belajar bersama."
        mascot="/fitur/cari-teman-belajar.png"
        badgeText="Interactive Video Matching"
      />

      {/* Tabs Switcher */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setActiveTab('study-cam')}
          className={`px-5 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'study-cam'
              ? 'btn-brand-primary'
              : 'bg-white text-gray-700 shadow-xs hover:bg-gray-50'
          }`}
        >
          <Video size={16} /> Live Study Cam (Otbee TV)
        </button>

        <button
          onClick={() => setActiveTab('friends-list')}
          className={`px-5 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'friends-list'
              ? 'btn-brand-primary'
              : 'bg-white text-gray-700 shadow-xs hover:bg-gray-50'
          }`}
        >
          <Users size={16} /> Teman Saya & Chat ({friends.length})
        </button>
      </div>

      {activeTab === 'study-cam' ? (
        <OmegleSection />
      ) : (
        /* TAB 2: TEMAN SAYA & CHAT */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Friend List Column */}
          <div className="p-6 rounded-3xl bg-white shadow-md space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-extrabold text-gray-900">Daftar Kontak Teman</h3>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
                {friends.length} Teman
              </span>
            </div>

            <div className="space-y-2">
              {friends.map(friend => (
                <div
                  key={friend.id}
                  onClick={() => setActiveFriendChat(friend)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                    activeFriendChat?.id === friend.id
                      ? 'bg-amber-100/70 shadow-xs'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-11 h-11 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-gray-900 truncate">{friend.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {friend.targetPTN} · {friend.targetMajor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active 1-on-1 Chat Area */}
          <div className="md:col-span-2 p-6 rounded-3xl bg-white shadow-md flex flex-col justify-between min-h-[420px]">
            {activeFriendChat ? (
              <>
                <div>
                  {/* Friend Header */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeFriendChat.avatar}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900">
                          {activeFriendChat.name}
                        </h3>
                        <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online · {activeFriendChat.school}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('study-cam')}
                      className="btn-brand-primary text-xs !py-2 !px-4 inline-flex items-center gap-1.5"
                    >
                      <Video size={14} /> Ajak On-Cam
                    </button>
                  </div>

                  {/* Messages Feed */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-4">
                    {(friendChatMessages[activeFriendChat.id] || []).map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${idx % 2 === 1 ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs font-medium ${
                            idx % 2 === 1
                              ? 'bg-amber-400 text-gray-950 font-semibold rounded-tr-xs'
                              : 'bg-gray-100 text-gray-800 rounded-tl-xs'
                          }`}
                        >
                          {msg}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Send Input */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <input
                    value={friendChatInput}
                    onChange={e => setFriendChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSendFriendMessage(activeFriendChat.id)
                    }}
                    placeholder={`Kirim pesan belajar ke ${activeFriendChat.name.split(' ')[0]}...`}
                    className="flex-1 px-4 py-2.5 rounded-full bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    onClick={() => handleSendFriendMessage(activeFriendChat.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center btn-brand-primary !p-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
                <Users size={32} className="text-gray-300 mb-2" />
                <p className="text-sm font-extrabold text-gray-900">Pilih Teman Belajar</p>
                <p className="text-xs text-gray-500 max-w-xs mt-1">
                  Pilih salah satu kontak di sisi kiri untuk melanjutkan diskusi atau berbagi bahan belajar.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLOATING IN-CAMERA BATTLE MODAL */}
      {showBattleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl my-auto animate-in fade-in zoom-in-95 duration-200">
            <PadananKataGame
              initialMode="matching"
              opponentPreset={{
                name: currentPeer ? currentPeer.name : 'Partner Belajar',
                avatar: currentPeer ? currentPeer.avatar : undefined,
              }}
              onExit={() => setShowBattleModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
