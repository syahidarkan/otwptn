'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { MicOff, VideoOff } from 'lucide-react'

const PEERS = [
  { name: 'Dinda', school: 'SMAN 3 Bandung', mascot: '/mascot/thinking-idea.png' },
  { name: 'Fajar', school: 'SMAN 8 Jakarta', mascot: '/mascot/headset-wave.png' },
  { name: 'Keisha', school: 'MAN 2 Surabaya', mascot: '/mascot/jump-paper.png' },
  { name: 'Bima', school: 'SMAN 1 Yogyakarta', mascot: '/mascot/check-paper-happy.png' },
]

// TV static noise — used on the RIGHT (stranger) side while searching
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
  const [phase, setPhase] = useState<'idle' | 'searching' | 'connected'>('idle')
  const [peer, setPeer] = useState<typeof PEERS[number] | null>(null)
  const [micOn, setMicOn] = useState(false)
  const [camOn, setCamOn] = useState(false)
  const [camDenied, setCamDenied] = useState(false)
  const seen = useRef<number[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  function pickPeer() {
    let i = Math.floor(Math.random() * PEERS.length)
    if (PEERS.length > 1) {
      let tries = 0
      while (seen.current.includes(i) && tries < 6) { i = Math.floor(Math.random() * PEERS.length); tries++ }
    }
    seen.current = [...seen.current, i].slice(-2)
    return PEERS[i]
  }

  async function startCam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
      setCamOn(true); setMicOn(true)
    } catch { setCamDenied(true) }
  }

  function handleStart() {
    if (!streamRef.current) startCam()
    setPhase('searching')
    setPeer(null)
    setTimeout(() => { setPhase('connected'); setPeer(pickPeer()) }, 2200)
  }

  function handleStop() { setPhase('idle'); setPeer(null) }

  function handleNext() {
    setPhase('searching'); setPeer(null)
    setTimeout(() => { setPhase('connected'); setPeer(pickPeer()) }, 1700)
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

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()) }, [])

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
          <h2 className="text-section-heading text-fg mb-3">Belajar bareng, bukan sendirian.</h2>
          <p className="text-body max-w-md mx-auto">Konsep kayak OmeTV, tapi buat sesama pejuang PTN — gak perlu login.</p>
        </motion.div>
      </div>

      {/* OmeTV frame */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
        className="mx-auto px-4 md:px-8"
        style={{ maxWidth: 1200 }}
      >
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0a0a0a', boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}>
          {/* Two camera panels with gap — responsive stack on mobile, side-by-side on tablet/desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 sm:p-3 min-h-[460px] sm:min-h-0 sm:h-[clamp(320px,42vw,540px)]">

            {/* LEFT — user's camera */}
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
                  <p className="text-[11px] text-white/40 max-w-[200px]">Kamu bisa belajar tatap muka virtual tanpa login</p>
                </div>
              )}
              {/* Name tag */}
              <div className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: '#fff' }}>
                {!micOn && <MicOff size={10} />}
                {!camOn && <VideoOff size={10} />}
                Kamu
              </div>
            </div>

            {/* RIGHT — stranger / searching */}
            <div className="rounded-xl relative flex items-center justify-center overflow-hidden min-h-[220px] sm:min-h-0" style={{ background: '#111' }}>
              {/* Static noise always present underneath */}
              {(phase === 'searching' || phase === 'idle') && <StaticNoise />}

              <AnimatePresence mode="wait">
                {phase === 'idle' && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="relative z-10 flex flex-col items-center gap-3 px-4 text-center">
                    <div className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold"
                      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Tekan <b style={{ color: '#fff' }}>Start</b> untuk mulai
                    </div>
                  </motion.div>
                )}
                {phase === 'searching' && (
                  <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="relative z-10 flex flex-col items-center gap-2 px-4">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-1" />
                    <div className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold"
                      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.85)' }}>
                      Mencari teman pejuang PTN...
                    </div>
                  </motion.div>
                )}
                {phase === 'connected' && peer && (
                  <motion.div key={peer.name} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="relative z-10 flex flex-col items-center gap-2 p-3">
                    <div className="relative w-20 h-24 sm:w-24 sm:h-28">
                      <Image src={peer.mascot} alt={peer.name} fill className="object-contain" />
                    </div>
                    <div className="text-center px-3 py-1.5 rounded-xl max-w-[240px]" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                      <div className="text-xs sm:text-sm font-bold text-white truncate">{peer.name} · {peer.school}</div>
                      <div className="text-[11px] mt-0.5 flex items-center justify-center gap-1" style={{ color: '#4ade80' }}>● Terhubung</div>
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

          {/* Glass control bar — responsive wrapping for mobile */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={phase === 'idle' ? handleStart : handleNext} disabled={phase === 'searching'}
              className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all hover:scale-105 disabled:opacity-50"
              style={{ background: '#3a9b5c', color: '#fff', boxShadow: '0 4px 16px rgba(58,155,92,0.4)' }}>
              {phase === 'idle' ? 'Start' : 'Next'}
            </button>
            <button onClick={handleStop}
              className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all hover:scale-105"
              style={{ background: '#c97b6a', color: '#fff', boxShadow: '0 4px 16px rgba(201,123,106,0.4)' }}>
              Stop
            </button>
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
