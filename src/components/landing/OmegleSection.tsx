'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { MicOff, VideoOff, Swords, RefreshCw, Volume2 } from 'lucide-react'
import { StudyCamWebRTC, PeerInfo } from '@/lib/studyCam/webrtcManager'

// TV static noise - used on the RIGHT (stranger) side while searching
function StaticNoise() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    function draw() {
      const w = canvas!.width, h = canvas!.height
      const img = ctx.createImageData(w, h)
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 110 + 30
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v
        img.data[i + 3] = 255
      }
      ctx.putImageData(img, 0, 0)
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas ref={canvasRef} width={320} height={240}
      className="absolute inset-0 w-full h-full" style={{ opacity: 0.65 }} />
  )
}

export default function OmegleSection() {
  const [phase, setPhase] = useState<'idle' | 'searching' | 'connecting' | 'connected' | 'timeout'>('idle')
  const [peer, setPeer] = useState<PeerInfo | null>(null)
  const [micOn, setMicOn] = useState(false)
  const [camOn, setCamOn] = useState(false)
  const [camDenied, setCamDenied] = useState(false)
  const [isAudioBlocked, setIsAudioBlocked] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const webrtcRef = useRef<StudyCamWebRTC | null>(null)

  const myProfile = useRef<PeerInfo>({
    id: 'user_' + Math.random().toString(36).substring(2, 9),
    name: 'Pejuang PTN ' + Math.floor(Math.random() * 900 + 100),
    school: 'SMA Negeri',
    city: 'Indonesia',
    targetPTN: 'PTN Impian',
  })

  async function startCam(): Promise<MediaStream | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 480, max: 640 },
          height: { ideal: 360, max: 480 },
          frameRate: { ideal: 24, max: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
      setCamOn(true)
      setMicOn(true)
      setCamDenied(false)
      return stream
    } catch {
      setCamDenied(true)
      return null
    }
  }

  async function handleStart() {
    let localStream = streamRef.current
    if (!localStream) {
      localStream = await startCam()
    }

    setPhase('searching')
    setPeer(null)
    setIsAudioBlocked(false)

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }

    if (webrtcRef.current) {
      webrtcRef.current.cleanup()
    }

    const rtc = new StudyCamWebRTC(myProfile.current, localStream, {
      onMatchFound: (foundPeer) => {
        setPeer(foundPeer)
        setPhase('connecting')
      },
      onRemoteStream: (remoteStream) => {
        if (remoteVideoRef.current) {
          const vid = remoteVideoRef.current
          if (vid.srcObject !== remoteStream) {
            vid.srcObject = remoteStream
          }
          vid.muted = false
          const playPromise = vid.play()
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Autoplay with audio was restricted by browser, fallback to muted so video renders
              vid.muted = true
              setIsAudioBlocked(true)
              vid.play().catch(() => {})
            })
          }
        }
        setPhase('connected')
      },
      onPeerLeft: () => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null
        }
        setPeer(null)
        setPhase('idle')
        setIsAudioBlocked(false)
      },
      onTimeout: () => {
        setPhase('timeout')
      },
    })

    webrtcRef.current = rtc
    rtc.startMatchmaking()
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
    setPeer(null)
  }

  function handleNext() {
    handleStop()
    setTimeout(() => {
      handleStart()
    }, 400)
  }

  function toggleMic() {
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !micOn })
    setMicOn(m => !m)
  }

  function toggleCam() {
    if (!streamRef.current) { startCam(); return }
    const next = !camOn
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = next })
    if (videoRef.current) videoRef.current.style.opacity = next ? '1' : '0'
    setCamOn(next)
  }

  useEffect(() => {
    return () => {
      webrtcRef.current?.cleanup()
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const glassBtn = {
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(12px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(12px) saturate(1.8)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
  } as React.CSSProperties

  return (
    <section className="section-pad" style={{ background: 'var(--bg)' }}>
      {/* Heading */}
      <div className="max-w-5xl mx-auto px-4 text-center mb-10">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
          <h2 className="text-section-heading text-fg mb-3">Cari Temen Belajar Bareng.</h2>
          <p className="text-body max-w-md mx-auto">Bisa belajar dan tambah relasi dari sesama pejuang PTN se-Indonesia secara live!</p>
        </motion.div>
      </div>

      {/* OmeTV frame */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
        className="mx-auto px-4 md:px-8"
        style={{ maxWidth: 1200 }}
      >
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0a0a0a', boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}>
          {/* Two camera panels with gap - responsive stack on mobile, side-by-side on tablet/desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 sm:p-3 min-h-[460px] sm:min-h-0 sm:h-[clamp(320px,42vw,540px)]">

            {/* LEFT - user's camera */}
            <div className="rounded-xl relative flex items-center justify-center overflow-hidden min-h-[220px] sm:min-h-0" style={{ background: '#1a1a1a' }}>
              <video ref={videoRef} autoPlay muted playsInline
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: camOn ? 1 : 0 }} />

              {/* Placeholder when cam off */}
              {!camOn && (
                <div className="relative z-10 flex flex-col items-center gap-2.5 p-4 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>K</div>
                  <button onClick={startCam}
                    className="px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                    style={{ background: 'var(--accent)', color: '#111' }}>
                    {camDenied ? 'Kamera ditolak' : 'Aktifkan Kamera'}
                  </button>
                  <p className="text-xs text-white font-medium max-w-[220px]" style={{ color: '#ffffff' }}>Kamu bisa belajar tatap muka virtual langsung</p>
                </div>
              )}

              {/* Name tag */}
              <div className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: '#fff' }}>
                {!micOn && <MicOff size={10} />}
                {!camOn && <VideoOff size={10} />}
                Kamu (Online)
              </div>
            </div>

            {/* RIGHT - stranger / remote live WebRTC video */}
            <div
              onClick={() => {
                if (remoteVideoRef.current && isAudioBlocked) {
                  remoteVideoRef.current.muted = false
                  remoteVideoRef.current.play().catch(() => {})
                  setIsAudioBlocked(false)
                }
              }}
              className="rounded-xl relative flex items-center justify-center overflow-hidden min-h-[220px] sm:min-h-0 cursor-pointer"
              style={{ background: '#111' }}
            >
              {/* Remote live video feed */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300 ${
                  phase === 'connected' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              />

              {/* Unmute prompt if browser blocked audio */}
              {isAudioBlocked && phase === 'connected' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (remoteVideoRef.current) {
                      remoteVideoRef.current.muted = false
                      remoteVideoRef.current.play().catch(() => {})
                      setIsAudioBlocked(false)
                    }
                  }}
                  className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-400 text-gray-950 shadow-xl flex items-center gap-1.5 animate-bounce"
                >
                  <Volume2 size={13} /> Ketuk untuk Aktifkan Suara
                </button>
              )}

              {/* Static noise always present underneath when searching/idle */}
              {(phase === 'searching' || phase === 'connecting' || phase === 'idle') && <StaticNoise />}

              <AnimatePresence mode="wait">
                {phase === 'idle' && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="relative z-10 flex flex-col items-center gap-3 px-4 text-center">
                    <div className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold"
                      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Tekan <b style={{ color: '#fff' }}>Start</b> untuk mencari partner
                    </div>
                  </motion.div>
                )}

                {(phase === 'searching' || phase === 'connecting') && (
                  <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
                    <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-1" />
                    <div className="px-4 py-2 rounded-full text-xs sm:text-sm font-black"
                      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.95)' }}>
                      {phase === 'connecting' ? 'Menghubungkan Video WebRTC...' : 'Mencari Pejuang PTN yang Sedang Online...'}
                    </div>
                  </motion.div>
                )}

                {phase === 'timeout' && (
                  <motion.div key="timeout" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="relative z-10 flex flex-col items-center gap-3 p-5 text-center max-w-sm">
                    <div className="w-14 h-14 relative animate-bounce">
                      <Image src="/mascot/reading-clock.png" alt="" width={56} height={56} className="object-contain" />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-black/75 border border-white/10 text-center space-y-1">
                      <h4 className="text-xs sm:text-sm font-black text-amber-300">Belum Ada Partner Online</h4>
                      <p className="text-xs text-white/90 leading-relaxed font-medium">
                        User lain sedang fokus belajar, jadi gaada yang main fitur ini, coba beberapa saat lagi!
                      </p>
                    </div>
                    <button
                      onClick={handleStart}
                      className="btn-brand-primary text-xs py-2 px-4 rounded-full flex items-center gap-1.5 shadow-md"
                    >
                      <RefreshCw size={13} /> Coba Cari Lagi
                    </button>
                  </motion.div>
                )}

                {phase === 'connected' && peer && (
                  <motion.div key={peer.id} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
                    <div className="px-3 py-1.5 rounded-xl text-left" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
                      <div className="text-xs sm:text-sm font-black text-white truncate">{peer.name}</div>
                      <div className="text-[10px] text-gray-300">{peer.school} · {peer.city}</div>
                      <div className="text-[10px] mt-0.5 flex items-center gap-1 font-bold" style={{ color: '#4ade80' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live WebRTC
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stranger label */}
              <div className="absolute bottom-2.5 left-2.5 z-20 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.6)' }}>
                Teman Belajar
              </div>
            </div>
          </div>

          {/* Glass control bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={phase === 'idle' || phase === 'timeout' ? handleStart : handleNext}
              disabled={phase === 'searching' || phase === 'connecting'}
              className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: '#3a9b5c', color: '#fff', boxShadow: '0 4px 16px rgba(58,155,92,0.4)' }}
            >
              {phase === 'idle' || phase === 'timeout' ? 'Start' : 'Next'}
            </button>
            <button onClick={handleStop}
              className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all hover:scale-105"
              style={{ background: '#c97b6a', color: '#fff', boxShadow: '0 4px 16px rgba(201,123,106,0.4)' }}>
              Stop
            </button>
            {phase === 'connected' && (
              <Link
                href="/dashboard/latihan"
                className="flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-full text-xs font-black transition-all hover:scale-105 bg-amber-400 text-gray-950 shadow-md"
              >
                <Swords size={14} /> Tantang Battle PPU
              </Link>
            )}
            <div className="hidden sm:block w-px h-6 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <button onClick={toggleMic}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
              style={{ ...glassBtn, color: micOn ? 'rgba(255,255,255,0.8)' : '#f87171' }}>
              {micOn ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              ) : <MicOff size={14} />}
              Mic
            </button>
            <button onClick={toggleCam}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
              style={{ ...glassBtn, color: camOn ? 'rgba(255,255,255,0.8)' : '#f87171' }}>
              {camOn ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              ) : <VideoOff size={14} />}
              Kamera
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
