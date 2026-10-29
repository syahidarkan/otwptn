'use client'

import React, { useState } from 'react'
import { Share2 } from 'lucide-react'
import AjakTemanModal from './AjakTemanModal'

export default function AjakTemanCard({ userRefCode }: { userRefCode?: string }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="glass-panel rounded-2xl p-5 flex items-center justify-between gap-4 cursor-pointer hover:border-amber-300 transition-all group"
      >
        <div>
          <p className="text-sm font-extrabold text-gray-900 group-hover:text-amber-700 transition-colors mb-0.5">
            Ajak teman belajar bareng
          </p>
          <p className="text-xs text-gray-500">
            Dapatkan bonus +50 XP & 30 Koin Otbee untuk setiap teman yang bergabung
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setModalOpen(true)
          }}
          className="glass-btn-primary w-11 h-11 !p-0 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform cursor-pointer"
          aria-label="Ajak Teman"
        >
          <Share2 size={16} />
        </button>
      </div>

      <AjakTemanModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        userRefCode={userRefCode}
      />
    </>
  )
}
