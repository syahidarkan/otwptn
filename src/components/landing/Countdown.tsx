'use client'

import { useEffect, useState } from 'react'

const DEADLINE = new Date('2026-06-30T23:59:59+07:00')

function getTimeLeft() {
  const diff = DEADLINE.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function Countdown() {
  const [time, setTime] = useState(getTimeLeft())

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!time) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40">
        <span className="text-red-400 text-sm font-semibold">Pendaftaran SJP UI telah ditutup</span>
      </div>
    )
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex flex-col gap-2">
      <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">
        ⏳ Penutupan Pendaftaran SJP UI
      </p>
      <div className="flex items-center gap-2">
        {[
          { value: time.days, label: 'Hari' },
          { value: time.hours, label: 'Jam' },
          { value: time.minutes, label: 'Menit' },
          { value: time.seconds, label: 'Detik' },
        ].map(({ value, label }, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center bg-white/10 border border-white/20 rounded-lg px-3 py-2 min-w-[52px]">
              <span className="text-brand-yellow font-extrabold text-xl leading-none tabular-nums">
                {pad(value)}
              </span>
              <span className="text-white/40 text-[10px] mt-0.5">{label}</span>
            </div>
            {i < 3 && <span className="text-white/40 font-bold text-lg -mt-3">:</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
