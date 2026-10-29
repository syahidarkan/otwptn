'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users,
  Calendar,
  CheckSquare,
  DollarSign,
  BookOpen,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  ExternalLink,
  ChevronRight,
  GraduationCap,
} from 'lucide-react'

const MENTOR_NAV = [
  { href: '/mentor/dashboard', label: 'Mentee Saya & Workspace', icon: Users },
  { href: '/mentor/jadwal', label: 'Jadwal & Blackout Dates', icon: Calendar },
  { href: '/mentor/monitoring', label: 'Monitoring Kewajiban', icon: CheckSquare },
  { href: '/mentor/pemasukan', label: 'Pemasukan & Ambassador', icon: DollarSign },
  { href: '/mentor/sop', label: 'Panduan SOP Mentor', icon: BookOpen },
  { href: '/mentor/apply', label: 'Pengajuan / Update LOA', icon: ShieldCheck },
]

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const sidebarContent = (
    <>
      {/* Brand Logo (Exact official logo, no custom text) */}
      <div className="flex items-center justify-between px-5 pt-6 pb-5 flex-shrink-0">
        <Link href="/mentor/dashboard" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="otwptn" style={{ height: 45, width: 'auto' }} className="transition-transform hover:scale-105" />
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 uppercase tracking-wider">
            Mentor
          </span>
        </Link>
      </div>

      {/* Nav List (Exact member sidebar design) */}
      <nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-0.5" style={{ scrollbarWidth: 'none' }}>
        {MENTOR_NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/mentor/dashboard' && pathname?.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{
                color: active ? 'var(--accent-ink)' : 'var(--muted)',
                background: active ? 'var(--accent)' : 'transparent',
              }}
            >
              <Icon size={17} strokeWidth={2.2} />
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Switch to Member Dashboard */}
      <div className="px-3 pb-2 flex-shrink-0">
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <GraduationCap size={16} />
          <span>Ke Dashboard Siswa</span>
        </Link>
      </div>

      {/* Profile Trigger (Exact member style) */}
      <div className="px-4 py-4 flex-shrink-0 relative" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => setProfileOpen(p => !p)}
          className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-100/80 transition-all text-left"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            alt="Mentor"
            className="w-10 h-10 rounded-full object-cover shadow-xs flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-gray-900 truncate">Rayhan Fakhri, S.Kom.</p>
            <p className="text-[10px] text-amber-700 font-bold truncate">Alumni UI · Mentor Resmi</p>
          </div>
          <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
        </button>

        {/* Profile Popover */}
        {profileOpen && (
          <div className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl p-3 z-50 animate-fade-up border-0 space-y-2">
            <div className="p-2.5 rounded-xl bg-amber-50">
              <p className="text-xs font-bold text-amber-900">PT. Lembaga Sains Nasional</p>
              <p className="text-[10px] text-amber-700">Akun Mentor Terverifikasi</p>
            </div>
            <Link
              href="/profil"
              className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <span>Pengaturan Akun</span>
              <ExternalLink size={13} />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50"
            >
              <LogOut size={13} /> Keluar
            </Link>
          </div>
        )}
      </div>
    </>
  )

  return (
    <div style={{ background: 'var(--bg-alt)', minHeight: '100vh' }}>
      {/* Mobile Top Header */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <Link href="/mentor/dashboard" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="otwptn" style={{ height: 26, width: 'auto' }} />
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 uppercase">
            Mentor
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="p-2 rounded-xl text-gray-600 hover:bg-gray-100"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Desktop Sidebar (Exact same width & style as member sidebar) */}
      <aside
        className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-30 shadow-xs"
        style={{ background: 'var(--bg)', borderRight: '1px solid var(--border)' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <aside
            className="relative flex flex-col w-64 max-w-full h-full shadow-2xl z-50 animate-fade-up"
            style={{ background: 'var(--bg)' }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area (Exact member padding and layout) */}
      <main className="md:ml-64 pt-14 md:pt-0 min-h-screen">
        <div className="w-full px-6 md:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
