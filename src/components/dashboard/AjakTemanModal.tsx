'use client'

import React, { useState } from 'react'
import {
  X, Share2, Copy, Check, Users, Sparkles, Send, Gift, MessageCircle
} from 'lucide-react'

interface AjakTemanModalProps {
  isOpen: boolean
  onClose: () => void
  userRefCode?: string
}

export default function AjakTemanModal({
  isOpen,
  onClose,
  userRefCode = 'PEJUANG2026',
}: AjakTemanModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const shareUrl = `https://otwptn.com/register?ref=${userRefCode}`
  const shareText = `Halo! Yuk persiapan masuk PTN jalur non-tes (SNBP, PPKB UI, SJP IPB, PBUB UGM) bareng aku di otwptn. Ada Essay AI Review, Kalkulator Peluang, dan bimbingan mentor alumni. Daftar lewat link ini biar kita dapet bonus XP bareng: ${shareUrl}`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`
    window.open(waUrl, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 border border-gray-100 dark:border-gray-800 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 absolute top-5 right-5 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Mascot & Header */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-2 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascot-hd/share-icon.png"
              alt="Ajak Teman"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/90 dark:bg-amber-950/60 dark:text-amber-300 px-3 py-0.5 rounded-full inline-block mb-1.5">
            Undang Teman Pejuang PTN
          </span>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            Ajak Teman Belajar Bareng!
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1 leading-relaxed">
            Perjuangan masuk kampus impian terasa jauh lebih seru jika saling menyemangati. Bagikan tautan unikmu ke grup kelas atau sahabatmu!
          </p>
        </div>

        {/* Reward Highlight Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center flex-shrink-0 shadow-xs font-black">
            <Gift size={20} />
          </div>
          <div>
            <p className="text-xs font-black text-amber-950 dark:text-amber-200">
              Bonus Bersama: +50 XP & +30 Koin Otbee
            </p>
            <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 leading-snug mt-0.5">
              Setiap kali 1 teman mendaftar lewat kodemu, kalian berdua masing-masing langsung menerima bonus XP & koin untuk membuka modul rahasia!
            </p>
          </div>
        </div>

        {/* Share Link Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
            Tautan Undangan Khusus Kamu:
          </label>
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <input
              readOnly
              value={shareUrl}
              className="bg-transparent px-3 py-1 text-xs font-mono font-bold text-gray-800 dark:text-gray-200 flex-1 outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'btn-brand-primary'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 py-3 rounded-full text-xs font-black bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <MessageCircle size={16} />
            <span>Bagikan Langsung ke WhatsApp</span>
          </button>
        </div>

        {/* Footer Subtext */}
        <p className="text-[11px] text-center text-gray-400 font-medium">
          Sudah mengundang teman? Cek perolehan XP dan misi harian di ikon profilmu.
        </p>
      </div>
    </div>
  )
}
