'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface MascotLoadingProps {
  message?: string
  subMessage?: string
  fullScreen?: boolean
}

export default function MascotLoading({
  message = 'Menyiapkan Lembar Kerja...',
  subMessage = 'Sedang menyinkronkan data dan materi persiapanmu.',
  fullScreen = true,
}: MascotLoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none max-w-sm mx-auto">
      {/* Floating Animated OtBee Mascot */}
      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [0, 4, -4, 0],
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-36 h-36 mb-5 flex items-center justify-center"
      >
        {/* Soft golden aura pulse */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-amber-300/40 blur-xl pointer-events-none"
        />

        <Image
          src="/mascot-hd/graduation-trophy.png"
          alt="OtBee Loading"
          width={140}
          height={140}
          className="relative z-10 drop-shadow-lg object-contain"
          priority
        />
      </motion.div>

      {/* Status Pill with Spinner */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-950 text-xs font-black mb-3 shadow-2xs">
        <Loader2 size={14} className="animate-spin text-amber-600" />
        <span>{message}</span>
      </div>

      {/* Subtitle */}
      {subMessage && (
        <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs">
          {subMessage}
        </p>
      )}

      {/* Gentle Pulsing Progress Line */}
      <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-4 shadow-inner">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-1/2 h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
        />
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50/90 backdrop-blur-xs">
        {content}
      </div>
    )
  }

  return content
}

