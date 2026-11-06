'use client'

import { useRef, useState, useEffect } from 'react'
import { X, Download, Share2, Flame, Sparkles, Check, Copy } from 'lucide-react'
import { useToast } from '@/components/ui/useToast'

interface StreakPosterModalProps {
  isOpen: boolean
  onClose: () => void
  streak: number
  activeDaysCount: number
  completedModulesCount: number
  userName?: string
  targetPTN?: string
}

export default function StreakPosterModal({
  isOpen,
  onClose,
  streak,
  activeDaysCount,
  completedModulesCount,
  userName = 'Pejuang PTN',
  targetPTN = 'Universitas Indonesia',
}: StreakPosterModalProps) {
  const { showToast } = useToast()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Draw high-resolution poster to canvas (1080x1920 Instagram Story / TikTok format)
  const drawPoster = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1920

    // 1. Dark Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920)
    bgGrad.addColorStop(0, '#0f172a')
    bgGrad.addColorStop(0.4, '#1e1b4b')
    bgGrad.addColorStop(0.8, '#171330')
    bgGrad.addColorStop(1, '#090514')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, 1080, 1920)

    // 2. Ambient Amber Glow in the center
    const glowGrad = ctx.createRadialGradient(540, 750, 50, 540, 750, 600)
    glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.28)')
    glowGrad.addColorStop(0.5, 'rgba(217, 119, 6, 0.12)')
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = glowGrad
    ctx.fillRect(0, 0, 1080, 1920)

    // 3. Header badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)'
    ctx.lineWidth = 2
    roundRect(ctx, 240, 160, 600, 70, 35)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('OTWPTN.COM · JALUR NON-TES PTN', 540, 205)

    // 4. Fire icon / Streak number
    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 80px sans-serif'
    ctx.fillText('🔥', 540, 520)

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 160px sans-serif'
    ctx.fillText(`${streak}`, 540, 700)

    ctx.fillStyle = '#fbbf24'
    ctx.font = '900 52px sans-serif'
    ctx.letterSpacing = '4px'
    ctx.fillText('HARI BERTURUT-TURUT', 540, 780)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
    ctx.font = '500 32px sans-serif'
    ctx.fillText('Fokus Belajar & Bimbingan Non-Tes', 540, 835)

    // 5. User Info Card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 2
    roundRect(ctx, 140, 930, 800, 280, 32)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 42px sans-serif'
    ctx.fillText(userName, 540, 1010)

    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 30px sans-serif'
    ctx.fillText(`Target: ${targetPTN}`, 540, 1065)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '500 28px sans-serif'
    ctx.fillText(`${completedModulesCount} Materi Tuntas  ·  ${activeDaysCount}/7 Hari Aktif Minggu Ini`, 540, 1140)

    // 6. Punchy Quote Box
    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)'
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)'
    ctx.lineWidth = 2
    roundRect(ctx, 140, 1270, 800, 240, 32)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#fde68a'
    ctx.font = 'italic bold 34px sans-serif'
    ctx.fillText('“Orang lain nunggu ujian tulis,', 540, 1370)
    ctx.fillText('gue udah kunci strategi dari sekarang.”', 540, 1430)

    // 7. Footer Branding
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText('otwptn.com', 540, 1720)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
    ctx.font = '400 26px sans-serif'
    ctx.fillText('Platform #1 Persiapan Masuk PTN Tanpa Tes', 540, 1770)
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(drawPoster, 100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, streak, userName, targetPTN, completedModulesCount, activeDaysCount])

  if (!isOpen) return null

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setDownloading(true)
    try {
      const dataUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `otwptn-streak-${streak}-hari.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      showToast('Poster streak berhasil di-download! Siap share ke Story IG & TikTok!')
    } catch {
      showToast('Gagal men-download poster')
    } finally {
      setDownloading(false)
    }
  }

  const handleShareMobile = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return
        const file = new File([blob], `otwptn-streak-${streak}-hari.png`, { type: 'image/png' })
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Streak Belajar ${streak} Hari di OtwPTN`,
            text: `Gue udah konsisten belajar ${streak} hari berturut-turut di OtwPTN buat persiapan masuk ${targetPTN}! Kunci strategimu di https://otwptn.com`,
            files: [file],
          })
        } else if (navigator.share) {
          await navigator.share({
            title: `Streak Belajar ${streak} Hari di OtwPTN`,
            text: `Gue udah konsisten belajar ${streak} hari berturut-turut di OtwPTN buat persiapan masuk ${targetPTN}! Cek di https://otwptn.com`,
            url: 'https://otwptn.com',
          })
        } else {
          handleDownload()
        }
      })
    } catch {
      handleDownload()
    }
  }

  const handleCopyText = () => {
    const text = `🔥 Streak Belajar: ${streak} Hari Berturut-turut di OtwPTN!\n\nTarget Kampus: ${targetPTN}\nMateri Tuntas: ${completedModulesCount} Modul\n\n“Orang lain nunggu ujian tulis, gue udah kunci strategi dari sekarang.”\n\nPersiapan masuk PTN tanpa tes bareng mentor UI, ITB & UGM di https://otwptn.com`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      showToast('Caption teks berhasil disalin!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-[#111827] border border-gray-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative text-center text-white space-y-4 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
        >
          <X size={16} />
        </button>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <Sparkles size={11} /> Format Instagram Story & TikTok
          </span>
          <h3 className="text-lg font-black text-white">Pamerkan Streak Belajar Kamu</h3>
          <p className="text-xs text-gray-400">Download poster 9:16 atau bagikan langsung ke Story media sosialmu!</p>
        </div>

        {/* Poster Canvas Preview */}
        <div className="relative mx-auto rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black max-w-[260px] aspect-[9/16]">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain block"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-3 rounded-full btn-brand-primary text-xs font-black shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <Download size={15} /> Download Poster Story (PNG)
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleShareMobile}
              className="py-2.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 size={13} /> Share Langsung
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="py-2.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? 'Tersalin!' : 'Salin Caption'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
