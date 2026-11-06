'use client'

import { useEffect, useState } from 'react'
import { UsersRound, Clock, CheckCircle2, Hourglass, RefreshCw } from 'lucide-react'

interface SquadMember {
  id: string
  status: string
  profiles: { full_name: string; email: string } | null
}

interface SquadRow {
  id: string
  track: string
  tier: string
  invite_code: string
  status: 'forming' | 'active' | 'completed'
  mentor_name: string | null
  created_at: string
  members: SquadMember[]
}

const TIER_LABEL: Record<string, string> = {
  web_premium: 'Web Premium',
  review: 'Review',
  dokumen: 'Reguler',
  menyeluruh: 'Intensif',
}

const TRACK_LABEL: Record<string, string> = {
  essay: 'Essay Only',
  prestasi: 'Prestasi Only',
  hybrid: 'Essay + Prestasi',
}

const STATUS_BADGE: Record<SquadRow['status'], { label: string; cls: string; icon: typeof Clock }> = {
  forming: { label: 'Menunggu Anggota', cls: 'bg-amber-100 text-amber-800', icon: Hourglass },
  active: { label: 'Mentor Ditugaskan', cls: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  completed: { label: 'Selesai', cls: 'bg-gray-100 text-gray-600', icon: CheckCircle2 },
}

export default function AdminSquadPage() {
  const [squads, setSquads] = useState<SquadRow[] | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/squads')
      const data = await res.json()
      setSquads(data.squads ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <UsersRound size={20} className="text-amber-600" /> Dashboard Squad
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Grup mentoring 3-orang: status pembentukan, anggota, dan mentor yang otomatis ditugaskan begitu penuh.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loading && !squads ? (
        <p className="text-xs text-gray-400">Memuat...</p>
      ) : !squads?.length ? (
        <div className="p-10 rounded-2xl bg-gray-50 text-center text-xs text-gray-400">
          Belum ada squad yang dibentuk.
        </div>
      ) : (
        <div className="space-y-4">
          {squads.map(squad => {
            const badge = STATUS_BADGE[squad.status]
            const BadgeIcon = badge.icon
            return (
              <div key={squad.id} className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-gray-900">{TIER_LABEL[squad.tier] ?? squad.tier}</span>
                    <span className="text-xs font-semibold text-gray-400">{TRACK_LABEL[squad.track] ?? squad.track}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-gray-900 text-white">
                      {squad.invite_code}
                    </span>
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${badge.cls}`}>
                    <BadgeIcon size={11} /> {badge.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  {[0, 1, 2].map(i => {
                    const member = squad.members[i]
                    return (
                      <div
                        key={i}
                        className={`flex-1 p-2.5 rounded-xl text-[11px] font-semibold ${
                          member ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-gray-50 text-gray-300 border border-dashed border-gray-200'
                        }`}
                      >
                        {member ? (
                          <>
                            {member.profiles?.full_name ?? 'Tanpa nama'}
                            <span className="block text-[10px] text-amber-600 font-bold uppercase">{member.status}</span>
                          </>
                        ) : (
                          'Kosong'
                        )}
                      </div>
                    )
                  })}
                </div>

                {squad.mentor_name && (
                  <p className="text-[11px] text-gray-500 font-semibold">
                    Mentor: <span className="text-gray-900 font-black">{squad.mentor_name}</span>
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
