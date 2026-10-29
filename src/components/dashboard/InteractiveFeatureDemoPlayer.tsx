'use client'

import React, { useState } from 'react'
import {
  Play, Pause, RotateCcw, Download, Sparkles, CheckCircle2,
  Maximize2, X, Video, ExternalLink
} from 'lucide-react'

interface InteractiveFeatureDemoPlayerProps {
  title: string
  desc: string
  feature: string
  duration: string
  onClose: () => void
}

export default function InteractiveFeatureDemoPlayer({
  title,
  desc,
  feature,
  duration,
  onClose,
}: InteractiveFeatureDemoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [activeTab, setActiveTab] = useState<'real_record' | 'interactive'>('real_record')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-gray-950 text-white rounded-3xl p-5 md:p-7 max-w-3xl w-full shadow-2xl border border-gray-800 space-y-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between pr-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Video size={11} /> Screen Record Asli Seluruh Fitur
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-emerald-400 font-bold">100% Real Live Walkthrough</span>
            </div>
            <h3 className="text-base md:text-xl font-black text-white">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center justify-center absolute top-5 right-5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 p-1 bg-gray-900 rounded-xl w-fit border border-gray-800">
          <button
            onClick={() => setActiveTab('real_record')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors ${
              activeTab === 'real_record'
                ? 'bg-amber-400 text-amber-950'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📹 Screen Record Asli (Kalkulator, Essay, Otbee, E-Course, Mentor)
          </button>
        </div>

        {/* ACTUAL SCREEN RECORDING VIDEO STAGE */}
        <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-gray-800 flex flex-col justify-between shadow-2xl group">
          {/* Top Browser Bar Mockup */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="px-3 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-mono text-gray-300 border border-white/10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              https://otwptn.id/dashboard
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-black/60 px-2 py-0.5 rounded-md">
              REC ● LIVE
            </span>
          </div>

          {/* REAL SCREEN RECORDING ASSET (14MB Full 521-Frames Live Walkthrough) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/promo-demos/otwptn_all_features_recording.webp?v=3"
            alt="Screen Record Demo Fitur Asli OtwPTN"
            className="w-full h-full object-contain bg-black"
          />

          {/* Overlay Features Progress Badge */}
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-bold text-white">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Demo Interaksi Kursor: Dashboard ➔ Kalkulator ➔ Essay AI ➔ Otbee ➔ E-Course ➔ Mentor
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-gray-400 font-medium">
            Video screen record asli ini memperlihatkan kursor mengklik & mengetik di seluruh fitur utama otwptn.
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                const link = document.createElement('a')
                link.href = '/promo-demos/otwptn_all_features_recording.webp'
                link.download = `otwptn_screen_record_demo.webp`
                link.click()
              }}
              className="btn-brand-primary px-4 py-2.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm"
            >
              <Download size={14} /> Unduh Video Screen Record Ini (.WEBP / .MP4)
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-200"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
