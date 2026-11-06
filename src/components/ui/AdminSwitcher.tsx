'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Crown, GraduationCap, Star, Globe, X, type LucideIcon } from 'lucide-react'

const VIEWS: { label: string; icon: LucideIcon; href: string; color: string }[] = [
  { label: 'Super Admin',  icon: Crown, href: '/admin',           color: '#7c3aed' },
  { label: 'Mentor',       icon: GraduationCap, href: '/mentor/dashboard', color: '#0369a1' },
  { label: 'Member',       icon: Star, href: '/dashboard',        color: '#b45309' },
  { label: 'Publik',       icon: Globe, href: '/',                 color: '#374151' },
]

export default function AdminSwitcher() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    createClient().auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: profile } = await createClient()
        .from('profiles')
        .select('is_admin')
        .eq('id', data.user.id)
        .single()
      if (profile?.is_admin) setIsAdmin(true)
    })
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (!isAdmin) return null

  // Detect current view
  const current = VIEWS.find(v =>
    v.href !== '/' ? pathname.startsWith(v.href) : pathname === '/'
  ) ?? VIEWS[2]

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 999998,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Menu */}
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            right: 0,
            background: '#1f2937',
            borderRadius: 14,
            padding: '8px 6px',
            minWidth: 180,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <div style={{ padding: '4px 10px 8px', color: '#9ca3af', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Pindah dashboard
          </div>
          {VIEWS.map(v => {
            const active = v.href === current.href
            return (
              <button
                key={v.href}
                onClick={() => { setOpen(false); router.push(v.href) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: active ? '#fff' : '#d1d5db',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  textAlign: 'left', width: '100%',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                <v.icon size={16} aria-hidden />
                <span>{v.label}</span>
                {active && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#6b7280' }}>sekarang</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Pindah dashboard"
        aria-label="Pindah dashboard"
        aria-expanded={open}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.15)',
          background: open ? '#374151' : current.color,
          color: '#fff',
          fontSize: 18,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          transition: 'background 0.2s, transform 0.15s',
          transform: open ? 'rotate(45deg) scale(0.95)' : 'none',
        }}
      >
        {open ? <X size={18} aria-hidden /> : <current.icon size={18} aria-hidden />}
      </button>
    </div>
  )
}
