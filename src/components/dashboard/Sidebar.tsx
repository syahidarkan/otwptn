'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Home, FileCheck2, Calculator, Sparkles, PlayCircle, GraduationCap,
  Compass, FolderLock, Users, MessageCircle, Settings, Menu, X, Target,
  Star, ArrowRight, UserCircle2, BarChart3, Clock, Bookmark, Moon,
  MessageSquare, Download, LogOut, Crown, Bell, HelpCircle,
} from 'lucide-react'
import SidebarPromoCard from './SidebarPromoCard'
import NotificationPopover from './NotificationPopover'
import XPQuestModal from './XPQuestModal'
import { getAllNotifications, EVENT_NOTIF_UPDATE } from '@/lib/notifications'

const NAV = [
  { id: 'nav-beranda', label: 'Beranda', href: '/dashboard', icon: Home },
  { id: 'nav-essay', label: 'Essay AI Review', href: '/dashboard/essay', icon: FileCheck2 },
  { id: 'nav-kalkulator', label: 'Kalkulator Peluang', href: '/dashboard/kalkulator', icon: Calculator },
  { id: 'nav-strategi', label: 'Atur Strategi', href: '/dashboard/strategi', icon: Target },
  { id: 'nav-otbee', label: 'Otbee AI', href: '/dashboard/otbee', icon: Sparkles },
  { id: 'nav-modul', label: 'Modul & Video', href: '/dashboard/ecourse', icon: PlayCircle },
  { id: 'nav-mentor', label: 'Mentor Alumni', href: '/dashboard/mentor', icon: GraduationCap },
  { id: 'nav-tracking', label: 'Tracking Jalur', href: '/dashboard/tracking-jalur', icon: Compass },
  { id: 'nav-dokumen', label: 'Penyimpanan Dokumen', href: '/dashboard/dokumen', icon: FolderLock },
  { id: 'nav-teman', label: 'Cari Teman Belajar', href: '/dashboard/teman', icon: Users },
  { id: 'nav-komunitas', label: 'Komunitas', href: '/dashboard/komunitas', icon: MessageCircle },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [name, setName] = useState('')
  const [tier, setTier] = useState('free')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Notifications state
  const [notifOpen, setNotifOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Gamification XP state
  const [xpModalOpen, setXpModalOpen] = useState(false)
  const [xp, setXp] = useState(75)
  const [level, setLevel] = useState(1)
  const [coins, setCoins] = useState(250)

  useEffect(() => {
    // Initial sync for unread notification count
    const syncCount = () => {
      const items = getAllNotifications()
      setUnreadCount(items.filter(n => n.isUnread).length)
    }
    syncCount()

    window.addEventListener(EVENT_NOTIF_UPDATE, syncCount)
    window.addEventListener('storage', syncCount)
    return () => {
      window.removeEventListener(EVENT_NOTIF_UPDATE, syncCount)
      window.removeEventListener('storage', syncCount)
    }
  }, [])


  useEffect(() => {
    try {
      const isDarkStored = localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark')
      setIsDark(isDarkStored)
      if (isDarkStored) {
        document.documentElement.classList.add('dark')
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.setAttribute('data-theme', 'light')
      }

      // Load stored XP and gamification stats
      const storedXP = localStorage.getItem('otwptn_xp')
      if (storedXP) setXp(Number(storedXP))

      const storedLevel = localStorage.getItem('otwptn_level')
      if (storedLevel) setLevel(Number(storedLevel))

      const storedCoins = localStorage.getItem('otwptn_coins')
      if (storedCoins) setCoins(Number(storedCoins))
    } catch {}

    const handleXpUpdate = () => {
      try {
        const storedXP = localStorage.getItem('otwptn_xp')
        if (storedXP) setXp(Number(storedXP))
        const storedLevel = localStorage.getItem('otwptn_level')
        if (storedLevel) setLevel(Number(storedLevel))
        const storedCoins = localStorage.getItem('otwptn_coins')
        if (storedCoins) setCoins(Number(storedCoins))
      } catch {}
    }

    window.addEventListener('otwptn_xp_updated', handleXpUpdate)

    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase.from('profiles').select('full_name, tier').eq('id', data.user.id).single().then(({ data: profile }) => {
        if (profile) {
          setName(profile.full_name || '')
          setTier(profile.tier || 'free')
        }
      })
    })

    return () => {
      window.removeEventListener('otwptn_xp_updated', handleXpUpdate)
    }
  }, [])

  function toggleDarkMode() {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  }

  const initial = (name || 'U').trim().charAt(0).toUpperCase()

  const content = (
    <>
      <Link href="/" className="flex items-center gap-2 px-5 pt-6 pb-4 flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="otwptn" style={{ height: 45, width: 'auto' }} className="transition-transform hover:scale-105" />
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-0.5">
        {NAV.map(({ id, label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname?.startsWith(href))
          return (
            <Link
              id={id}
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
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

      {/* Auto-Sliding 4 Promo Cards (Gambar 1) */}
      <SidebarPromoCard />

      {/* Premium Pill Button (Gambar 1 style) */}
      <div className="px-3 pb-2.5 flex-shrink-0">
        <Link
          id="nav-upgrade"
          href="/upgrade"
          onClick={() => setMobileOpen(false)}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-black transition-all hover:brightness-95 group shadow-2xs"
          style={{ background: '#fff9db', color: '#7c5500', border: '1px solid #ffec99' }}
        >
          <Crown size={18} strokeWidth={2.6} className="text-amber-600 fill-amber-400 flex-shrink-0" />
          <span className="truncate">Premium</span>
        </Link>
      </div>

      {/* Profile Bar with Notification Bell (Gambar 1 style) */}
      <div className="px-3 py-2.5 flex-shrink-0 relative" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between gap-2">
          {/* Profile Trigger Button */}
          <button
            onClick={() => setProfileMenuOpen(p => !p)}
            className="flex-1 flex items-center gap-2.5 p-1 rounded-2xl hover:bg-gray-100/80 transition-all text-left group min-w-0"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border border-amber-200"
              style={{ background: '#fef3c7' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mascot-hd/maskot-kepala-logo-avatar.png"
                alt="Avatar"
                className="w-full h-full object-contain"
                onError={e => {
                  ;(e.currentTarget as HTMLImageElement).src = '/logo.png'
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black truncate text-gray-900 group-hover:text-amber-900 leading-tight">
                {name || 'syahid arkan'}
              </p>
              <p className="text-[10px] font-semibold text-gray-400 truncate">
                + Tambahkan sekolah...
              </p>
            </div>
          </button>

          {/* Notification Bell with Badge 3 (Gambar 1) */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setNotifOpen(prev => !prev)}
              aria-label="Notifikasi"
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
            >
              <Bell size={18} />
            </button>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Profile Popover Modal / Dropdown */}
        {profileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setProfileMenuOpen(false)}
            />
            <div
              className="absolute left-3 right-3 bottom-[calc(100%+8px)] z-50 rounded-3xl bg-white shadow-2xl p-4 text-gray-900 animate-in fade-in slide-in-from-bottom-2 duration-200"
              style={{
                boxShadow: '0 20px 48px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
            >
              {/* Header: User Info & Interactive XP Level */}
              <div
                onClick={() => {
                  setProfileMenuOpen(false)
                  setXpModalOpen(true)
                }}
                className="flex items-center gap-3 pb-3 p-2 -mx-2 rounded-2xl hover:bg-amber-50/60 transition-colors cursor-pointer group"
                title="Buka Pusat XP & Misi Harian"
              >
                <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/maskot-fitur-kalkulator-peluang.png"
                    alt="Otbee"
                    className="w-9 h-9 object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black text-gray-900 group-hover:text-amber-950 truncate">
                    {name || 'syahid arkan'}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <Star size={12} className="fill-amber-400 text-amber-500" /> Level {level}
                    </span>
                    <span className="font-semibold text-gray-400">{xp} dari 100 XP</span>
                  </div>
                  {/* XP Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-gray-100 mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(5, xp))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Coin / Token Balance Card */}
              <div
                onClick={() => {
                  setProfileMenuOpen(false)
                  setXpModalOpen(true)
                }}
                className="flex items-center justify-between px-3 py-2 rounded-2xl bg-gray-50 hover:bg-amber-50/80 transition-colors cursor-pointer mb-3"
                title="Buka Misi Koin Otbee"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-xs font-bold">
                    🪙
                  </div>
                  <span className="text-sm font-extrabold text-gray-900">{coins} Koin</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800">
                  <span>Misi</span>
                  <ArrowRight size={13} />
                </div>
              </div>

              <div className="h-px bg-gray-100 my-2" />

              {/* Menu Items List */}
              <div className="space-y-0.5">
                <Link
                  href="/profil"
                  onClick={() => setProfileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-extrabold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <UserCircle2 size={17} className="text-gray-600" />
                  Profil Saya
                </Link>

                <Link
                  href="/dashboard/leaderboard"
                  onClick={() => setProfileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-extrabold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <BarChart3 size={17} className="text-gray-600" />
                  Papan peringkat
                </Link>

                <Link
                  href="/profil"
                  onClick={() => setProfileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-extrabold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <Settings size={17} className="text-gray-600" />
                  Pengaturan
                </Link>

                <Link
                  href="/dashboard/ambassador"
                  onClick={() => setProfileMenuOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold text-gray-700 hover:bg-amber-50 hover:text-amber-950 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Users size={17} className="text-amber-600 group-hover:scale-110 transition-transform" />
                    <span>Student Ambassador</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    Komisi Tunai
                  </span>
                </Link>

                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Moon size={17} className={isDark ? 'text-amber-500 fill-amber-400' : 'text-gray-600'} />
                    <span>Mode Gelap</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isDark ? 'bg-amber-400 text-amber-950 font-black' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isDark ? 'Aktif' : 'Off'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setProfileMenuOpen(false)
                    if (typeof window !== 'undefined' && (window as any).startOtbeeTour) {
                      (window as any).startOtbeeTour()
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold text-gray-700 hover:bg-amber-50 hover:text-amber-900 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle size={17} className="text-amber-600" />
                    <span>Panduan Tur Fitur</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    Mulai
                  </span>
                </button>

                <Link
                  href="/dashboard/laporan"
                  onClick={() => setProfileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-extrabold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <MessageSquare size={17} className="text-gray-600" />
                  Saran & Laporan
                </Link>
              </div>

              <div className="h-px bg-gray-100 my-2" />

              {/* Logout Option */}
              <button
                onClick={async () => {
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  window.location.href = '/login'
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut size={17} className="text-rose-600" />
                Keluar
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="otwptn" style={{ height: 39, width: 'auto' }} />
        <button onClick={() => setMobileOpen(true)} aria-label="Buka menu" style={{ color: 'var(--fg)' }}>
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full flex flex-col" style={{ background: 'var(--bg)' }}>
            <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-4" aria-label="Tutup menu" style={{ color: 'var(--fg)' }}>
              <X size={20} />
            </button>
            {content}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex md:flex-col fixed top-0 left-0 h-screen w-64 flex-shrink-0 z-30"
        style={{ background: 'var(--bg)', borderRight: '1px solid var(--border)' }}
      >
        {content}
      </aside>

      {/* Floating Interactive Notification Popover */}
      <NotificationPopover
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        onUpdateUnreadCount={setUnreadCount}
      />

      {/* Interactive XP & Misi Harian Gamification Modal */}
      <XPQuestModal
        isOpen={xpModalOpen}
        onClose={() => setXpModalOpen(false)}
        currentXP={xp}
        currentLevel={level}
        currentCoins={coins}
        onUpdate={(newXP, newLevel, newCoins) => {
          setXp(newXP)
          setLevel(newLevel)
          setCoins(newCoins)
        }}
      />
    </>
  )
}
