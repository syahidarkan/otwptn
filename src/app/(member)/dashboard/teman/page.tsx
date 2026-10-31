'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import FeatureHeader from '@/components/dashboard/FeatureHeader'
import PadananKataGame from '@/components/games/PadananKataGame'
import { StudyCamWebRTC, PeerInfo } from '@/lib/studyCam/webrtcManager'
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
  const streamRef = useRef<MediaStream | null>(null)
  const webrtcRef = useRef<StudyCamWebRTC | null>(null)
  const myId = useRef('user_' + Math.random().toString(36).substring(2, 9))

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

  // Camera initialization
  async function initCamera(): Promise<MediaStream | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      })
      streamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
        localVideoRef.current.play().catch(() => {})
      }
      setCamOn(true)
      setMicOn(true)
      setCamDenied(false)
      webrtcRef.current?.setLocalStream(stream)
      return stream
    } catch {
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
      },
      onRemoteStream: (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream
          remoteVideoRef.current.play().catch(() => {})
        }
        setPhase('connected')
      },
      onPeerLeft: () => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null
        }
        setCurrentPeer(null)
        setPhase('idle')
      },
      onTimeout: () => {
        setPhase('timeout')
      },
    })

    webrtcRef.current = rtc
    rtc.startMatchmaking()
  }

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
            text: 'Semangat ya! Lanjut fokus belajar lagi 💪',
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
        title="Study Cam - Cari Teman Belajar"
        subtitle="Rasakan serunya belajar bareng via video call acak layaknya OmeTV / Umigle, temukan rekan satu target PTN, tambahkan ke kontak teman, dan jaga fokus belajar bersama."
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
          <Video size={16} /> Live Study Cam (Ome Study)
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
        <div className="space-y-6">
          {/* Target Filter & Pomodoro Bar */}
          <div className="p-5 rounded-3xl bg-white shadow-md space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                    Filter Target PTN
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                    {selectedPTNs.length === 0
                      ? 'Semua PTN Terpilih'
                      : `${selectedPTNs.length} PTN Dipilih (Multi-Select)`}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Pilih satu atau beberapa PTN sekaligus untuk mencocokkan teman belajar dengan target yang sama.
                </p>
              </div>

              {/* Pomodoro Focus Timer with Explanation Modal Trigger */}
              <div className="flex items-center gap-3 self-start lg:self-auto bg-amber-50/80 px-4 py-2.5 rounded-2xl flex-shrink-0">
                <Clock size={16} className="text-amber-600" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-950 font-mono">
                      {formatTimer(pomodoroSeconds)}
                    </span>
                    <button
                      onClick={() => setShowFocusModal(true)}
                      title="Pelajari Metode Fokus Pomodoro"
                      className="text-amber-600 hover:text-amber-800"
                    >
                      <HelpCircle size={13} />
                    </button>
                  </div>
                  <span className="text-[10px] text-amber-800 font-bold block">Sesi Fokus Pomodoro</span>
                </div>
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="w-7 h-7 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-xs hover:bg-amber-100"
                >
                  {timerRunning ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
                </button>
                <button
                  onClick={() => {
                    setTimerRunning(false)
                    setPomodoroSeconds(25 * 60)
                  }}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            </div>

            {/* PTN Selection Multi-Select Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedPTNs([])}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedPTNs.length === 0
                    ? 'btn-brand-primary'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Semua PTN
              </button>
              {ALL_PTNS.map(ptn => {
                const isSelected = selectedPTNs.includes(ptn.id)
                return (
                  <button
                    key={ptn.id}
                    onClick={() => togglePTN(ptn.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-500 text-white font-black shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    {ptn.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Pomodoro Focus Explanation Modal */}
          {showFocusModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => setShowFocusModal(false)}
                  className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                  <Clock size={24} />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">
                  Apa Maksud Mode Fokus (Pomodoro)?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Mode Fokus dirancang untuk mencegah kamu dan teman belajarmu terdistraksi atau hanya mengobrol santai tanpa hasil belajar nyata.
                </p>
                <div className="space-y-3 mb-5">
                  <div className="p-3 rounded-2xl bg-amber-50/70 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                      1
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">25 Menit Sesi Fokus Hening</h4>
                      <p className="text-[11px] text-gray-600">
                        Kamu dan teman belajar menyalakan kamera, saling memantau komitmen, dan fokus membaca draf / mengerjakan latsol tanpa membuka sosmed.
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50/70 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                      2
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">5 Menit Sesi Review & Diskusi</h4>
                      <p className="text-[11px] text-gray-600">
                        Setelah 25 menit selesai, kalian bisa mic on untuk berdiskusi materi yang baru dipelajari, cek esai, atau saling memberi tips lolos.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowFocusModal(false)}
                  className="w-full btn-brand-primary py-3 rounded-full text-xs font-black"
                >
                  Mengerti, Mulai Sesi Belajar!
                </button>
              </div>
            </div>
          )}

          {/* DUAL WEBCAM STAGE (Omegle / OmeTV Split Screen) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Screen: Kamera Kamu */}
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gray-950 shadow-xl flex items-center justify-center text-white">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover transition-opacity ${
                  camOn && !camDenied ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {(!camOn || camDenied) && (
                <div className="flex flex-col items-center justify-center p-6 text-center z-10">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-3">
                    <VideoOff size={32} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-extrabold text-white">Kamera Dimatikan</p>
                  <p className="text-xs text-gray-400 max-w-xs mt-1">
                    Aktifkan kamera untuk mulai belajar tatap muka dengan teman barumu.
                  </p>
                </div>
              )}

              {/* Top Badges */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-black/60 backdrop-blur-md text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Kamu
                </span>
                {!micOn && (
                  <span className="p-1 rounded-full bg-rose-600/80 text-white">
                    <MicOff size={13} />
                  </span>
                )}
              </div>

              {/* Bottom Quick Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full">
                <button
                  onClick={toggleMic}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    micOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-rose-500 text-white'
                  }`}
                  aria-label="Toggle Mic"
                >
                  {micOn ? <Mic size={16} /> : <MicOff size={16} />}
                </button>
                <button
                  onClick={toggleCam}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    camOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-rose-500 text-white'
                  }`}
                  aria-label="Toggle Cam"
                >
                  {camOn ? <Video size={16} /> : <VideoOff size={16} />}
                </button>
              </div>
            </div>

            {/* Right Screen: Stranger / Partner Belajar */}
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gray-950 shadow-xl flex items-center justify-center text-white">
              {phase === 'idle' && (
                <div className="flex flex-col items-center justify-center p-6 text-center z-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/mascot/headset-wave.png"
                    alt=""
                    className="w-28 h-auto mb-3 filter drop-shadow-md animate-float"
                  />
                  <h3 className="text-base font-extrabold text-white mb-1">
                    Siap Belajar Bareng?
                  </h3>
                  <p className="text-xs text-gray-400 max-w-xs mb-5">
                    Klik tombol di bawah untuk mencari partner belajar secara acak se-Indonesia.
                  </p>
                  <button
                    onClick={handleStartSearch}
                    className="btn-brand-primary text-xs !py-3 !px-6"
                  >
                    Mulai Cari Partner Belajar
                  </button>
                </div>
              )}

              {phase === 'searching' && (
                <>
                  <StaticNoise />
                  <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-amber-400/20 flex items-center justify-center mb-3 animate-spin">
                      <Sparkles size={28} className="text-amber-400" />
                    </div>
                    <p className="text-base font-black text-white tracking-tight">
                      Mencari Partner Belajar...
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      Menghubungkan ke pejuang PTN yang sedang online
                    </p>
                  </div>
                </>
              )}

              {phase === 'timeout' && (
                <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 relative mb-3">
                    <Image
                      src="/mascot/reading-clock.png"
                      alt="Timeout mascot"
                      width={64}
                      height={64}
                      className="object-contain animate-bounce"
                    />
                  </div>
                  <h3 className="text-base font-black text-white mb-1.5">
                    Belum Ada Partner Online
                  </h3>
                  <div className="bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 max-w-xs mb-5">
                    <p className="text-xs text-amber-300 font-semibold leading-relaxed">
                      User lain sedang fokus belajar, jadi gaada yang main fitur ini, coba beberapa saat lagi!
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleStartSearch}
                      className="btn-brand-primary text-xs !py-2.5 !px-5"
                    >
                      Coba Cari Lagi 🔄
                    </button>
                    <button
                      onClick={handleStop}
                      className="px-4 py-2.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {phase === 'connected' && currentPeer && (
                <>
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Gradient shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

                  {/* Top Peer Info & Add Friend Button */}
                  <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-2">
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-2xl">
                      <p className="text-xs font-black text-white leading-tight">
                        {currentPeer.name}
                      </p>
                      <p className="text-[10px] text-gray-300">
                        {currentPeer.school} · {currentPeer.city}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowBattleModal(true)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 transition-all hover:scale-105 active:scale-95"
                      >
                        <Swords size={13} /> Tantang Battle PPU
                      </button>

                      <button
                        onClick={handleAddFriend}
                        disabled={addedCurrent}
                        className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all ${
                          addedCurrent
                            ? 'bg-emerald-500 text-white'
                            : 'btn-brand-primary'
                        }`}
                      >
                        {addedCurrent ? (
                          <>
                            <Check size={14} /> Berteman
                          </>
                        ) : (
                          <>
                            <UserPlus size={14} /> + Tambah Teman
                          </>
                        )}
                      </button>
                    </div>
                  </div>


                  {/* Bottom Peer Goal & Study Topic */}
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <div className="bg-black/60 backdrop-blur-md p-3 rounded-2xl flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[11px] font-black text-amber-400">
                            🎯 {currentPeer.targetPTN} - {currentPeer.targetMajor}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-200 truncate max-w-xs font-medium">
                          {currentPeer.topic}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 flex-shrink-0">
                        <Flame size={12} className="fill-amber-400 text-amber-400" /> {currentPeer.streak} hari
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Controls Bar & In-Room Chat Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Matching Control Buttons */}
            <div className="lg:col-span-1 p-6 rounded-3xl bg-white shadow-md flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-1">Kontrol Sesi Belajar</h3>
                <p className="text-xs text-gray-500 mb-5">
                  Ganti partner belajar kapan saja bila topik belajarmu berbeda atau ingin bertemu siswa lain.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={phase === 'connected' ? handleNext : handleStartSearch}
                    className="w-full py-3.5 rounded-full text-sm font-extrabold btn-brand-primary"
                  >
                    {phase === 'connected'
                      ? 'Lewati / Cari yang Lain (Next)'
                      : phase === 'searching'
                      ? 'Sedang Mencari Partner...'
                      : phase === 'timeout'
                      ? 'Coba Cari Lagi'
                      : 'Mulai Cari Partner'}
                  </button>

                  {phase === 'connected' && (
                    <button
                      onClick={handleStop}
                      className="w-full py-3 rounded-full text-xs font-extrabold btn-brand-dark"
                    >
                      Berhenti Belajar
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500 font-medium">
                <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Ruang belajar aman & termonitor. Jaga etika kesopanan saat on-cam.</span>
              </div>
            </div>

            {/* In-Room Live Text Chat */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white shadow-md flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} className="text-amber-500" />
                    <h3 className="text-sm font-extrabold text-gray-900">
                      Obrolan Ruang Belajar {currentPeer ? `dengan ${currentPeer.name.split(' ')[0]}` : ''}
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400">
                    {phase === 'connected' ? 'Terhubung' : 'Tidak Terhubung'}
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 mb-4">
                  {chatMessages.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8">
                      Mulai sesi untuk bertukar pesan dengan rekan belajarmu di sini.
                    </p>
                  ) : (
                    chatMessages.map(m => (
                      <div
                        key={m.id}
                        className={`flex ${m.sender === 'you' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed ${
                            m.sender === 'you'
                              ? 'bg-amber-400 text-gray-950 font-semibold rounded-tr-xs'
                              : 'bg-gray-100 text-gray-800 rounded-tl-xs'
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendInRoomChat} className="flex items-center gap-2 pt-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={
                    phase === 'connected'
                      ? 'Ketik pesan belajar...'
                      : 'Hubungkan sesi untuk mengobrol...'
                  }
                  disabled={phase !== 'connected'}
                  className="flex-1 px-4 py-2.5 rounded-full bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={phase !== 'connected' || !chatInput.trim()}
                  className="w-9 h-9 rounded-full flex items-center justify-center btn-brand-primary !p-0 disabled:opacity-40"
                  aria-label="Kirim"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: TEMAN SAYA & CHAT PERSISTENT */
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
