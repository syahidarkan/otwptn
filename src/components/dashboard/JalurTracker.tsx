'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { JALUR_LIST } from '@/lib/constants'
import { Plus, X, MapPin, Search } from 'lucide-react'

const PTN_LOGO: Record<string, string> = {
  'Universitas Indonesia': '/ptn-logos/ui.png',
  'Institut Teknologi Bandung': '/ptn-logos/itb.png',
  'Institut Teknologi Sepuluh Nopember': '/ptn-logos/its.png',
  'Universitas Diponegoro': '/ptn-logos/undip.png',
  'Universitas Padjadjaran': '/ptn-logos/unpad.png',
  'Universitas Brawijaya': '/ptn-logos/ub.png',
  'Universitas Jenderal Soedirman': '/ptn-logos/unsoed.png',
  'Universitas Sebelas Maret': '/ptn-logos/uns.png',
  'Universitas Andalas': '/ptn-logos/unand.png',
  'IPB University': '/ptn-logos/ipb.png',
  'Universitas Airlangga': '/ptn-logos/unair.png',
  'Universitas Negeri Semarang': '/ptn-logos/unnes.png',
}

interface JalurTrackerProps {
  targetJalurs?: string[]
  onTargetJalursChange?: (next: string[]) => void
}

export default function JalurTracker({
  targetJalurs: propTargetJalurs,
  onTargetJalursChange,
}: JalurTrackerProps = {}) {
  const supabase = createClient()
  const [internalJalurs, setInternalJalurs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [picking, setPicking] = useState(false)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const isControlled = propTargetJalurs !== undefined
  const targetJalurs = isControlled ? propTargetJalurs : internalJalurs

  useEffect(() => {
    if (isControlled) {
      setLoading(false)
      return
    }
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setLoading(false)
        return
      }
      supabase.from('profiles').select('target_jalurs').eq('id', data.user.id).single().then(({ data: profile }) => {
        setInternalJalurs(profile?.target_jalurs ?? [])
        setLoading(false)
      })
    })
  }, [supabase, isControlled])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setPicking(false)
    }
    if (picking) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [picking])

  const chosenJalur = useMemo(
    () => JALUR_LIST.filter(j => targetJalurs.includes(j.id)),
    [targetJalurs]
  )

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase()
    return JALUR_LIST
      .filter(j => !targetJalurs.includes(j.id))
      .filter(j => !q || j.name.toLowerCase().includes(q) || j.ptn.toLowerCase().includes(q))
      .slice(0, 30)
  }, [search, targetJalurs])

  async function persist(next: string[]) {
    if (!isControlled) setInternalJalurs(next)
    if (onTargetJalursChange) onTargetJalursChange(next)
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('profiles').update({ target_jalurs: next }).eq('id', user.id)
    setSaving(false)
  }

  function addJalur(id: string) {
    if (!id || targetJalurs.includes(id)) return
    persist([...targetJalurs, id])
    setSearch('')
    setPicking(false)
  }

  function removeJalur(id: string) {
    persist(targetJalurs.filter(j => j !== id))
  }

  if (loading) return null

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-1 relative">
        <h2 className="text-lg font-extrabold" style={{ color: 'var(--fg)' }}>Jalur yang Diikuti</h2>
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setPicking(p => !p)}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-transform active:scale-95"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            <Plus size={13} /> Tambah Jalur
          </button>

          {picking && (
            <div
              className="absolute right-0 top-[calc(100%+8px)] z-20 rounded-2xl overflow-hidden"
              style={{ width: 320, background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: '0 12px 36px rgba(0,0,0,0.14)' }}
            >
              <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--bg-alt)' }}>
                  <Search size={14} style={{ color: 'var(--muted-2)' }} />
                  <input
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cari jalur atau PTN..."
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: 'var(--fg)' }}
                  />
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {searchResults.length === 0 ? (
                  <p className="text-xs text-center py-6" style={{ color: 'var(--muted-2)' }}>Tidak ada jalur ditemukan</p>
                ) : searchResults.map(j => (
                  <button
                    key={j.id}
                    onClick={() => addJalur(j.id)}
                    disabled={saving}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{ color: 'var(--fg)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-alt)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                      {PTN_LOGO[j.ptn] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={PTN_LOGO[j.ptn]} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                      ) : (
                        <MapPin size={14} style={{ color: 'var(--muted-2)' }} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{j.name}</p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>{j.ptn}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs mb-6" style={{ color: 'var(--muted)' }}>
        Dipakai buat nyambungin progres kamu ke manajemen dokumen & tracking jalur.
      </p>

      {chosenJalur.length === 0 ? (
        <div className="text-center py-8">
          <MapPin size={28} className="mx-auto mb-2" style={{ color: 'var(--muted-2)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Belum ada jalur yang kamu ikuti</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-2)' }}>Tambahkan jalur biar progresmu bisa di-track</p>
        </div>
      ) : (
        <JalurPath chosenJalur={chosenJalur} ptnLogo={PTN_LOGO} onRemove={removeJalur} />
      )}
    </div>
  )
}

// ─── Zigzag road path: mascot + checkpoints connected by a curvy dashed line ──
interface JalurItem { id: string; name: string; ptn: string }

function JalurPath({ chosenJalur, ptnLogo, onRemove }: {
  chosenJalur: JalurItem[]
  ptnLogo: Record<string, string>
  onRemove: (id: string) => void
}) {
  const NODE_W = 150
  const AMP = 50
  const ICON = 64
  const nodeCount = chosenJalur.length + 1
  const width = nodeCount * NODE_W
  const height = AMP + ICON + 64

  const points = Array.from({ length: nodeCount }, (_, i) => ({
    x: i * NODE_W + NODE_W / 2,
    y: (i % 2 === 0 ? 0 : AMP) + ICON / 2,
  }))

  let pathD = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1]
    const p1 = points[i]
    const cx = (p0.x + p1.x) / 2
    pathD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`
  }

  return (
    <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
      <div className="relative" style={{ width, height }}>
        <svg width={width} height={height} className="absolute left-0 top-0" style={{ pointerEvents: 'none' }}>
          <path d={pathD} fill="none" stroke="var(--border)" strokeWidth={3} strokeDasharray="1 11" strokeLinecap="round" />
        </svg>

        {/* Mascot = start of the road */}
        <div className="absolute flex flex-col items-center" style={{ left: 0, top: 0, width: NODE_W }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fitur/tracking-jalur.png" alt="" style={{ height: ICON + 40, width: 'auto' }} />
          <span className="text-xs font-extrabold -mt-1 text-center" style={{ color: 'var(--fg)' }}>Kamu</span>
        </div>

        {chosenJalur.map((j, i) => {
          const idx = i + 1
          const top = idx % 2 === 0 ? 0 : AMP
          return (
            <div
              key={j.id}
              className="absolute flex flex-col items-center"
              style={{ left: idx * NODE_W, top, width: NODE_W }}
            >
              <div className="relative">
                <button
                  onClick={() => onRemove(j.id)}
                  aria-label="Hapus jalur"
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center z-10"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted-2)' }}
                >
                  <X size={11} />
                </button>
                <div
                  className="flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ width: ICON, height: ICON, borderRadius: 18, background: 'var(--bg)', border: '2.5px solid var(--accent)' }}
                >
                  {ptnLogo[j.ptn] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={ptnLogo[j.ptn]} alt="" style={{ width: 34, height: 34, objectFit: 'contain' }} />
                  ) : (
                    <MapPin size={18} style={{ color: 'var(--accent-hover)' }} />
                  )}
                </div>
              </div>
              <span className="text-xs font-bold text-center leading-tight px-1 mt-2" style={{ color: 'var(--fg)' }}>{j.name}</span>
              <span className="text-[10px] text-center leading-tight" style={{ color: 'var(--muted)' }}>{j.ptn}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
