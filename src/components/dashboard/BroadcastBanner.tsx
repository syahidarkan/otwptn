'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Megaphone, X, ArrowRight } from 'lucide-react'

interface BannerData {
  id: string
  title: string
  message: string
  cta_url: string | null
}

export default function BroadcastBanner() {
  const [banner, setBanner] = useState<BannerData | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.banner && data.banner.id) {
          const isDismissed = typeof window !== 'undefined'
            ? localStorage.getItem(`otwptn_banner_dismiss_${data.banner.id}`) === '1'
            : false
          if (!isDismissed) {
            setBanner(data.banner)
          }
        }
      })
      .catch(() => {})
  }, [])

  if (!banner || dismissed) return null

  function handleDismiss() {
    if (typeof window !== 'undefined' && banner) {
      localStorage.setItem(`otwptn_banner_dismiss_${banner.id}`, '1')
    }
    setDismissed(true)
  }

  return (
    <div className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-amber-950 px-4 py-2.5 text-xs font-semibold shadow-xs flex items-center justify-between gap-3 relative z-30">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="w-6 h-6 rounded-full bg-amber-900/10 flex items-center justify-center flex-shrink-0">
          <Megaphone size={13} className="text-amber-950" />
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
          <span className="font-extrabold uppercase tracking-wide text-[11px] bg-amber-950/10 px-2 py-0.5 rounded-full">
            {banner.title}
          </span>
          <span className="truncate max-w-xl text-amber-950/90 font-medium">
            {banner.message}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {banner.cta_url && (
          <Link
            href={banner.cta_url}
            className="px-3 py-1 rounded-full bg-amber-950 text-white text-[11px] font-bold hover:bg-black transition-colors inline-flex items-center gap-1 shadow-xs"
          >
            Lihat <ArrowRight size={11} />
          </Link>
        )}
        <button
          onClick={handleDismiss}
          className="w-6 h-6 rounded-full flex items-center justify-center text-amber-950/70 hover:text-amber-950 hover:bg-amber-950/10 transition-colors cursor-pointer"
          aria-label="Tutup Banner"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}

