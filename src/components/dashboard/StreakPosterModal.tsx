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
  const [imageLoaded, setImageLoaded] = useState(false)
  const mascotImgRef = useRef<HTMLImageElement | null>(null)

  // Preload Otbee mascot image for canvas rendering
  useEffect(() => {
    if (typeof window === 'undefined') return
    const img = new Image()
    img.src = '/mascot-hd/maskot-piala-toga-juara.png'
    img.onload = () => {
      mascotImgRef.current = img
      setImageLoaded(true)
    }
  }, [])

  // Draw high-resolution poster to canvas (1080x1920 Instagram Story / TikTok format)
  // Vibrant signature light-mode OtwPTN golden honey theme
  const drawPoster = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1920

    // 1. Warm Golden Cream Gradient Background (Signature OtwPTN Light Mode)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920)
    bgGrad.addColorStop(0, '#FFFDF7')
    bgGrad.addColorStop(0.25, '#FFFBEB')
    bgGrad.addColorStop(0.65, '#FEF3C7')
    bgGrad.addColorStop(1, '#FDE68A')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, 1080, 1920)

    // 2. Subtle Honeycomb Hexagon Pattern
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.08)'
    ctx.lineWidth = 2
    const hexR = 38
    const hexW = Math.sqrt(3) * hexR
    const hexH = 2 * hexR
    for (let y = 0; y < 1920 + hexH; y += hexH * 0.75) {
      for (let x = 0; x < 1080 + hexW; x += hexW) {
        const xOffset = Math.floor(y / (hexH * 0.75)) % 2 === 0 ? 0 : hexW / 2
        drawHexagon(ctx, x + xOffset, y, hexR)
      }
    }

    // 3. Ambient Golden Sunburst Glow in Upper Center
    const sunGlow = ctx.createRadialGradient(540, 520, 40, 540, 520, 520)
    sunGlow.addColorStop(0, 'rgba(251, 191, 36, 0.45)')
    sunGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.20)')
    sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = sunGlow
    ctx.fillRect(0, 0, 1080, 1100)

    // 4. Header Badge (Signature Otbee Pill)
    ctx.save()
    ctx.shadowColor = 'rgba(217, 119, 6, 0.18)'
    ctx.shadowBlur = 18
    ctx.shadowOffsetY = 6
    ctx.fillStyle = '#FFFFFF'
    ctx.strokeStyle = '#F59E0B'
    ctx.lineWidth = 3
    roundRect(ctx, 190, 140, 700, 76, 38)
    ctx.fill()
    ctx.stroke()
    ctx.restore()

    ctx.fillStyle = '#B45309'
    ctx.font = '900 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('OTBEENATION · STREAK JUARA NON-TES', 540, 188)

    // 5. 3D Otbee Mascot with Trophy & Toga Cap
    if (mascotImgRef.current) {
      ctx.save()
      ctx.shadowColor = 'rgba(180, 83, 9, 0.25)'
      ctx.shadowBlur = 32
      ctx.shadowOffsetY = 16
      const mw = 360
      const mh = 433
      ctx.drawImage(mascotImgRef.current, 540 - mw / 2, 260, mw, mh)
      ctx.restore()
    } else {
      // Fallback celebratory icon if image is still loading
      ctx.fillStyle = '#F59E0B'
      ctx.font = '100px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('🏆', 540, 500)
    }

    // 6. Streak Number Card
    ctx.save()
    ctx.shadowColor = 'rgba(217, 119, 6, 0.22)'
    ctx.shadowBlur = 28
    ctx.shadowOffsetY = 10
    ctx.fillStyle = '#FFFFFF'
    ctx.strokeStyle = '#FCD34D'
    ctx.lineWidth = 3
    roundRect(ctx, 160, 730, 760, 310, 40)
    ctx.fill()
    ctx.stroke()
    ctx.restore()

    // Flame Icon
    ctx.fillStyle = '#F59E0B'
    ctx.font = 'bold 54px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('🔥', 540, 805)

    // Big Streak Number
    ctx.fillStyle = '#0F172A'
    ctx.font = '900 135px sans-serif'
    ctx.fillText(`${streak}`, 540, 935)

    // Streak Label
    ctx.fillStyle = '#D97706'
    ctx.font = '900 38px sans-serif'
    ctx.fillText('HARI BERTURUT-TURUT', 540, 995)

    ctx.fillStyle = '#78350F'
    ctx.font = '600 24px sans-serif'
    ctx.fillText('Konsisten Belajar & Bimbingan Jalur Non-Tes', 540, 1025)

    // 7. Student Profile Card
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.06)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetY = 8
    ctx.fillStyle = '#FFFFFF'
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 2
    roundRect(ctx, 140, 1080, 800, 270, 36)
    ctx.fill()
    ctx.stroke()
    ctx.restore()

    ctx.fillStyle = '#0F172A'
    ctx.font = '900 44px sans-serif'
    ctx.fillText(userName, 540, 1160)

    ctx.fillStyle = '#D97706'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText(`🎯 Target: ${targetPTN}`, 540, 1220)

    ctx.fillStyle = '#4B5563'
    ctx.font = '600 26px sans-serif'
    ctx.fillText(`${completedModulesCount} Modul Tuntas  ·  ${activeDaysCount}/7 Hari Aktif Minggu Ini`, 540, 1290)

    // 8. Punchy Viral Quote Box
    ctx.save()
    ctx.fillStyle = 'rgba(254, 243, 199, 0.85)'
    ctx.strokeStyle = '#F59E0B'
    ctx.lineWidth = 2.5
    roundRect(ctx, 140, 1390, 800, 230, 32)
    ctx.fill()
    ctx.stroke()
    ctx.restore()

    ctx.fillStyle = '#92400E'
    ctx.font = 'italic bold 34px sans-serif'
    ctx.fillText('“Orang lain nunggu ujian tulis,', 540, 1485)
    ctx.fillText('gue udah kunci strategi dari sekarang.”', 540, 1545)

    // 9. Footer Watermark & Branding
    ctx.fillStyle = '#0F172A'
    ctx.font = '900 38px sans-serif'
    ctx.fillText('otwptn.com', 540, 1750)

    ctx.fillStyle = '#78350F'
    ctx.font = 'bold 26px sans-serif'
    ctx.fillText('Platform #1 Persiapan Masuk PTN Tanpa Tes', 540, 1800)
  }

  function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i
      const hx = x + r * Math.cos(angle)
      const hy = y + r * Math.sin(angle)
      if (i === 0) ctx.moveTo(hx, hy)
      else ctx.lineTo(hx, hy)
    }
    ctx.closePath()
    ctx.stroke()
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
      setTimeout(drawPoster, 60)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, streak, userName, targetPTN, completedModulesCount, activeDaysCount, imageLoaded])

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative text-center text-gray-900 space-y-4 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer w-8 h-8 rounded-full bg-amber-50 hover:bg-amber-100 flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            <Sparkles size={11} className="text-amber-600" /> Format Instagram Story &amp; TikTok
          </span>
          <h3 className="text-lg font-black text-gray-900">Pamerkan Streak Belajar Kamu</h3>
          <p className="text-xs text-gray-500">Download poster vertikal 9:16 atau bagikan langsung ke Story media sosialmu!</p>
        </div>

        {/* Poster Canvas Preview with Warm Golden Shadow */}
        <div className="relative mx-auto rounded-2xl overflow-hidden border-2 border-amber-200 shadow-xl bg-amber-50 max-w-[260px] aspect-[9/16]">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain block"
          />
        </div>

        {/* Action Buttons in Signature OtwPTN Style */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-amber-950 font-black text-xs shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Download size={15} /> Download Poster Story (PNG)
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleShareMobile}
              className="py-2.5 px-3 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 size={13} className="text-amber-700" /> Share Langsung
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="py-2.5 px-3 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} className="text-amber-700" />}
              {copied ? 'Tersalin!' : 'Salin Caption'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
