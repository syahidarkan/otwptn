'use client'

import React, { useRef, useState } from 'react'
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  Trophy,
  Target,
  GraduationCap,
} from 'lucide-react'

interface ShareStoryProps {
  score: number
  targetUniv: string
  targetMajor: string
  recommendation: string
  isOpen: boolean
  onClose: () => void
}

export default function ShareStoryModal({
  score,
  targetUniv,
  targetMajor,
  recommendation,
  isOpen,
  onClose,
}: ShareStoryProps) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const shareText = `Alhamdulillah dapet prediksi peluang lolos ${Math.round(score)}% di ${targetMajor} - ${targetUniv}! Cek peluang rapor dan strategi masuk PTN kamu gratis di https://otwptn.com 🎓🐝`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Peluang Lolos ${targetUniv} - OtwPTN`,
          text: shareText,
          url: 'https://otwptn.com',
        })
      } catch (err) {
        // Ignored or canceled by user
      }
    } else {
      handleCopy()
    }
  }

  // Draw card to canvas and download PNG
  const handleDownloadImage = () => {
    setDownloading(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1920
      const ctx = canvas.getContext('2d')

      if (!ctx) return

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 1920)
      grad.addColorStop(0, '#111827')
      grad.addColorStop(0.5, '#1e293b')
      grad.addColorStop(1, '#0f172a')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 1080, 1920)

      // Accent amber glows
      const glow = ctx.createRadialGradient(540, 600, 50, 540, 600, 500)
      glow.addColorStop(0, 'rgba(255, 212, 0, 0.25)')
      glow.addColorStop(1, 'rgba(255, 212, 0, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, 1080, 1920)

      // Brand Title Header
      ctx.fillStyle = '#ffd400'
      ctx.font = 'bold 50px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
      ctx.textAlign = 'center'
      ctx.fillText('otwptn.com', 540, 220)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
      ctx.fillText('AI PTN CHANCE CALCULATOR', 540, 280)

      // Score Circle Box
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(540, 680, 250, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#ffd400'
      ctx.lineWidth = 14
      ctx.stroke()

      ctx.fillStyle = '#111827'
      ctx.font = '900 130px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
      ctx.fillText(`${Math.round(score)}%`, 540, 710)

      ctx.fillStyle = '#b45309'
      ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
      ctx.fillText('PELUANG LOLOS', 540, 780)

      // PTN Target Card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
      ctx.beginPath()
      ctx.roundRect(140, 1040, 800, 360, 40)
      ctx.fill()

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = '#ffd400'
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
      ctx.fillText('TARGET KAMPUS & PRODI IMPIAN', 540, 1120)

      ctx.fillStyle = '#ffffff'
      ctx.font = '900 50px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
      ctx.fillText(targetMajor || 'Program Studi Impian', 540, 1210)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
      ctx.fillText(targetUniv || 'Universitas Indonesia', 540, 1280)

      // Call to action banner at bottom
      ctx.fillStyle = '#ffd400'
      ctx.beginPath()
      ctx.roundRect(140, 1520, 800, 130, 999)
      ctx.fill()

      ctx.fillStyle = '#111827'
      ctx.font = '900 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
      ctx.fillText('Cek Peluang Rapor Kamu di otwptn.com', 540, 1600)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
      ctx.fillText('Platform Bimbingan Jalur Non-Tes PTN No. 1 di Indonesia', 540, 1750)

      // Trigger download
      const link = document.createElement('a')
      link.download = `Peluang_Lolos_${targetMajor.replace(/\s+/g, '_')}_otwptn.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Failed to generate story image:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-amber-500" />
            <span className="text-xs font-black text-gray-900">
              Pamer Skor ke Story
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* 9:16 Preview Card */}
        <div
          ref={cardRef}
          className="relative rounded-2xl p-6 text-center text-white overflow-hidden shadow-lg border border-gray-800"
          style={{
            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
            aspectRatio: '9/14',
          }}
        >
          {/* Otbee Brand Watermark */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            <Sparkles size={13} className="text-amber-400" />
            <span className="text-xs font-black tracking-widest text-amber-400">
              otwptn.com
            </span>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">
            AI Rasionalisasi Peluang PTN
          </p>

          {/* Radial Ring Center Score */}
          <div className="my-6">
            <div className="w-28 h-28 rounded-full bg-white text-gray-950 flex flex-col items-center justify-center mx-auto shadow-md border-4 border-amber-400">
              <span className="text-3xl font-black">{Math.round(score)}%</span>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-800">
                Peluang Lolos
              </span>
            </div>
          </div>

          {/* Target Box */}
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10 space-y-1">
            <span className="text-[9px] font-black uppercase text-amber-300 tracking-wider block">
              Target Pilihan Utama
            </span>
            <p className="text-sm font-black text-white leading-tight">
              {targetMajor || 'Program Studi Impian'}
            </p>
            <p className="text-xs text-gray-300 font-semibold">
              {targetUniv || 'Universitas Indonesia'}
            </p>
          </div>

          {/* Bottom Watermark Tag */}
          <div className="absolute bottom-4 inset-x-4">
            <div className="py-2 px-3 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] shadow-xs">
              Cek Peluang Rapor Kamu di otwptn.com
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="btn-brand-primary w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Download size={14} /> {downloading ? 'Memproses Kartu...' : 'Simpan Foto Story (PNG HD)'}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleNativeShare}
              className="py-2.5 px-3 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 size={13} /> Share Story
            </button>
            <button
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              {copied ? 'Tersalin' : 'Salin Teks'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
