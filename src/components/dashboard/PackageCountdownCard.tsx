'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Sparkles, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react'

interface PackageStatusData {
  tier: string
  tierLabel: string
  status: 'free' | 'awaiting_onboarding' | 'awaiting_wa_link' | 'awaiting_wa_join' | 'active' | 'expired'
  startsAt: string | null
  expiresAt: string | null
}

function formatCountdown(expiresAt: string): { days: number; hours: number; expired: boolean } {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, expired: true }
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  return { days, hours, expired: false }
}

export default function PackageCountdownCard() {
  const [pkg, setPkg] = useState<PackageStatusData | null>(null)

  useEffect(() => {
    fetch('/api/package/status')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d) setPkg(d) })
      .catch(() => {})
  }, [])

  if (!pkg || pkg.tier === 'free') return null

  const cd = pkg.expiresAt ? formatCountdown(pkg.expiresAt) : null
  const isExpiringSoon = Boolean(cd && !cd.expired && cd.days <= 7)
  const isExpired = pkg.status === 'expired' || Boolean(cd?.expired)

  const endDateStr = pkg.expiresAt
    ? new Date(pkg.expiresAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs border ${
        isExpired || isExpiringSoon
          ? 'bg-rose-50/80 border-rose-200'
          : 'bg-amber-50/70 border-amber-200/80'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isExpired || isExpiringSoon
              ? 'bg-rose-100 text-rose-600'
              : 'bg-amber-400/20 text-amber-700'
          }`}
        >
          {isExpired || isExpiringSoon ? <AlertTriangle size={18} /> : <Clock size={18} />}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-amber-900 border border-amber-200">
              Paket {pkg.tierLabel}
            </span>
            {pkg.status === 'active' && !isExpired && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                <CheckCircle2 size={11} /> Aktif
              </span>
            )}
          </div>

          {pkg.status === 'awaiting_onboarding' && (
            <p className="text-xs font-bold text-gray-800 mt-1">
              Masa aktif 1 bulan akan dimulai otomatis setelah kamu menyelesaikan Onboarding.
            </p>
          )}
          {pkg.status === 'awaiting_wa_link' && (
            <p className="text-xs font-bold text-gray-800 mt-1">
              Countdown paket belum berjalan. Menunggu mentor membuat & mengirim link Grup WhatsApp.
            </p>
          )}
          {pkg.status === 'awaiting_wa_join' && (
            <p className="text-xs font-bold text-amber-950 mt-1">
              Link Grup WA sudah tersedia! Klik tombol Join Grup WA di menu Mentor Alumni untuk memulai masa aktif paketmu.
            </p>
          )}
          {pkg.status === 'active' && cd && !cd.expired && (
            <p className="text-xs sm:text-sm font-black text-gray-900 mt-1">
              Sisa Masa Aktif: {cd.days} hari {cd.hours} jam
              {endDateStr && <span className="font-medium text-gray-500"> (berakhir {endDateStr})</span>}
            </p>
          )}
          {isExpired && (
            <p className="text-xs sm:text-sm font-black text-rose-800 mt-1">
              Masa aktif paket {pkg.tierLabel} telah berakhir{endDateStr ? ` pada ${endDateStr}` : ''}. Perpanjang lebih hemat sekarang!
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {pkg.status === 'awaiting_wa_join' && (
          <Link
            href="/dashboard/mentor"
            className="btn-brand-primary px-4 py-2 rounded-full text-xs font-black inline-flex items-center gap-1.5"
          >
            Join Grup WA <ArrowRight size={13} />
          </Link>
        )}
        {(isExpiringSoon || isExpired) && (
          <Link
            href="/upgrade?renewal=1"
            className="px-4 py-2 rounded-full text-xs font-black bg-amber-500 hover:bg-amber-600 text-white shadow-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <Sparkles size={13} />
            {pkg.tier === 'web_premium' ? 'Perpanjang Rp25rb' : 'Perpanjang Hemat Rp15rb'}
          </Link>
        )}
      </div>
    </div>
  )
}

