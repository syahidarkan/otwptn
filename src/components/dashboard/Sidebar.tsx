'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Home, FileCheck2, Calculator, Sparkles, PlayCircle, GraduationCap,
  Compass, FolderLock, Users, MessageCircle, Menu, X, Target,
  Star, ArrowRight, UserCircle2, BarChart3, Moon,
  MessageSquare, LogOut, Crown, Bell, HelpCircle, Swords,
  ChevronDown, PanelLeftClose, PanelLeftOpen,
  Coins,
} from 'lucide-react'
import SidebarPromoCard from './SidebarPromoCard'
import NotificationPopover from './NotificationPopover'
import XPQuestModal from './XPQuestModal'
import { getAllNotifications, EVENT_NOTIF_UPDATE } from '@/lib/notifications'

interface SubNavItem {
  id: string
  label: string
  href: string
}

interface NavItem {
  id: string
  label: string
  href: string
  icon: any
  badge?: string
  children?: SubNavItem[]
}

interface NavGroup {
  category?: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { id: 'nav-beranda', label: 'Beranda', href: '/dashboard', icon: Home },
    ],
  },
  {
    category: 'Belajar & Latihan',
    items: [
      { id: 'nav-essay', label: 'Essay AI Review', href: '/dashboard/essay', icon: FileCheck2 },
      { id: 'nav-otbee', label: 'Otbee AI Asisten', href: '/dashboard/otbee', icon: Sparkles },
      {
        id: 'nav-modul',
        label: 'Modul & Video',
        href: '/dashboard/ecourse',
        icon: PlayCircle,
        children: [
          { id: 'sub-modul-snbp', label: 'SNBP', href: '/dashboard/ecourse?cat=snbp' },
          { id: 'sub-modul-jalur-essay', label: 'Jalur Essay', href: '/dashboard/ecourse?cat=jalur-essay' },
          { id: 'sub-modul-jalur-prestasi', label: 'Jalur Prestasi', href: '/dashboard/ecourse?cat=jalur-prestasi' },
          { id: 'sub-modul-basic-essay', label: 'Basic Essay (PPU & PBM)', href: '/dashboard/ecourse?cat=basic-essay' },
          { id: 'sub-modul-essay', label: 'Essay', href: '/dashboard/ecourse?cat=essay' },
        ],
      },
      {
        id: 'nav-latihan',
        label: 'Arena Latihan PPU & PBM',
        href: '/dashboard/latihan',
        icon: Swords,
      },
    ],
  },
  {
    category: 'Bimbingan & Seleksi',
    items: [
      { id: 'nav-kalkulator', label: 'Kalkulator Peluang', href: '/dashboard/kalkulator', icon: Calculator },
      { id: 'nav-strategi', label: 'Atur Strategi', href: '/dashboard/strategi', icon: Target },
      { id: 'nav-mentor', label: 'Mentor Alumni', href: '/dashboard/mentor', icon: GraduationCap },
      { id: 'nav-tracking', label: 'Tracking Jalur', href: '/dashboard/tracking-jalur', icon: Compass },
      { id: 'nav-dokumen', label: 'Penyimpanan Dokumen', href: '/dashboard/dokumen', icon: FolderLock },
    ],
  },
  {
    category: 'Komunitas & Bantuan',
    items: [
      { id: 'nav-teman', label: 'Cari Teman Belajar', href: '/dashboard/teman', icon: Users },
      { id: 'nav-komunitas', label: 'Komunitas', href: '/dashboard/komunitas', icon: MessageCircle },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')
  const [tier, setTier] = useState('free')
  const [isAdmin, setIsAdmin] = useState(false)
  const [avatar, setAvatar] = useState('/avatars/avatar-1.png')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Notifications state
  const [notifOpen, setNotifOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Gamification XP state
  const [xpModalOpen, setXpModalOpen] = useState(false)
  const [xp, setXp] = useState(75)
  const [level, setLevel] = useState(1)
  const [coins, setCoins] = useState(250)

  // Default dropdown closed - only opens when clicked by user
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }))
  }

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

      // Restore collapse state
      const savedCollapsed = localStorage.getItem('sidebar_collapsed') === 'true'
      setCollapsed(savedCollapsed)
      document.documentElement.setAttribute('data-sidebar-collapsed', savedCollapsed ? 'true' : 'false')

      // Load avatar from localStorage
      const localAvatar = localStorage.getItem('otwptn_user_avatar')
      if (localAvatar) setAvatar(localAvatar)

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

    const handleAvatarUpdate = (e: any) => {
      if (e?.detail) setAvatar(e.detail)
    }

    const handleStorageUpdate = () => {
      try {
        const a = localStorage.getItem('otwptn_user_avatar')
        if (a) setAvatar(a)
      } catch {}
    }

    window.addEventListener('otwptn_xp_updated', handleXpUpdate)
    window.addEventListener('otwptn_avatar_update', handleAvatarUpdate)
    window.addEventListener('storage', handleStorageUpdate)

    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      const userMetaName = data.user.user_metadata?.full_name || data.user.user_metadata?.name
      const userEmailFallback = data.user.email?.split('@')[0]
      supabase.from('profiles').select('full_name, tier, avatar_url, school_name, school, is_admin').eq('id', data.user.id).maybeSingle().then(({ data: profile }) => {
        const finalName = profile?.full_name || userMetaName || userEmailFallback || 'Pejuang PTN'
        setName(finalName)
        setSchool(profile?.school_name || profile?.school || '')
        setTier(profile?.tier || 'free')
        setIsAdmin(!!profile?.is_admin)
        if (profile?.avatar_url) {
          setAvatar(profile.avatar_url)
          try { localStorage.setItem('otwptn_user_avatar', profile.avatar_url) } catch {}
        }
      })
    })

    return () => {
      window.removeEventListener('otwptn_xp_updated', handleXpUpdate)
      window.removeEventListener('otwptn_avatar_update', handleAvatarUpdate)
      window.removeEventListener('storage', handleStorageUpdate)
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

  function toggleCollapse() {
    const next = !collapsed
    setCollapsed(next)
    try { localStorage.setItem('sidebar_collapsed', next ? 'true' : 'false') } catch {}
    document.documentElement.setAttribute('data-sidebar-collapsed', next ? 'true' : 'false')
  }

  const initial = (name || 'U').trim().charAt(0).toUpperCase()

  const content = (
    <>
      {/* Logo + Collapse Toggle */}
      <div className={`flex items-center ${collapsed ? 'flex-col gap-2 px-2 pt-5 pb-3' : 'justify-between px-4 pt-5 pb-4'} flex-shrink-0`}>
        <Link href="/" className="flex items-center">
          {collapsed ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src="/favicon.png" alt="otwptn" className="transition-transform hover:scale-105" style={{ width: 32, height: 32 }} />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src="/logo.png" alt="otwptn" className="logo-adaptive transition-transform hover:scale-105" style={{ height: 40, width: 'auto' }} />
          )}
        </Link>
        <button
          onClick={toggleCollapse}
          title={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
          style={{ color: 'var(--muted)' }}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 flex flex-col gap-2 pb-2" style={{ scrollbarWidth: 'none' }}>
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-0.5">
            {!collapsed && group.category && (
              <p className="px-3 pt-2.5 pb-1 text-[10px] font-black uppercase tracking-wider text-gray-400 select-none">
                {group.category}
              </p>
            )}
            {collapsed && group.category && <div className="pt-2" />}
            {group.items.map(item => {
              const { id, label, href, icon: Icon, children } = item
              const isDirectActive = pathname === href
              const isParentActive = isDirectActive || (href !== '/dashboard' && pathname?.startsWith(href))
              const isExpanded = !!expandedMenus[id]

              return (
                <div key={id} className="space-y-1">
                  {children && children.length > 0 ? (
                    <div className="flex items-center">
                      <button
                        id={id}
                        type="button"
                        onClick={() => collapsed ? null : toggleExpand(id)}
                        title={collapsed ? label : undefined}
                        className={`w-full flex items-center ${collapsed ? 'justify-center px-0 py-2.5' : 'justify-between gap-3 px-3 py-2'} rounded-xl text-sm font-semibold transition-colors group cursor-pointer text-left`}
                        style={{
                          color: isParentActive ? 'var(--accent-ink)' : 'var(--muted)',
                          background: isParentActive ? 'var(--accent)' : 'transparent',
                        }}
                      >
                        {collapsed ? (
                          <Icon size={18} strokeWidth={2.2} className="flex-shrink-0" />
                        ) : (
                          <>
                            <div className="flex items-center gap-3 min-w-0">
                              <Icon size={17} strokeWidth={2.2} className="flex-shrink-0" />
                              <span className="truncate">{label}</span>
                            </div>
                            <div className="p-1 rounded-md text-gray-400 group-hover:text-gray-900 transition-colors">
                              <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-amber-700' : ''}`}
                              />
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                  ) : id === 'nav-mentor' ? (
                    collapsed ? (
                      <Link
                        id={id}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        title={label}
                        className={`flex items-center justify-center py-2.5 rounded-xl text-sm font-extrabold transition-all border shadow-sm ${
                          isParentActive
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 border-amber-500 shadow-md ring-2 ring-amber-300/60'
                            : 'bg-gradient-to-r from-amber-50 via-amber-100 to-yellow-100 text-amber-950 border-amber-300/80 hover:border-amber-400 hover:shadow-md'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center flex-shrink-0">
                          <GraduationCap size={15} strokeWidth={2.4} />
                        </div>
                      </Link>
                    ) : (
                      <Link
                        id={id}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-extrabold transition-all border shadow-sm group ${
                          isParentActive
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 border-amber-500 shadow-md ring-2 ring-amber-300/60'
                            : 'bg-gradient-to-r from-amber-50 via-amber-100 to-yellow-100 text-amber-950 border-amber-300/80 hover:border-amber-400 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-110 transition-transform">
                            <GraduationCap size={15} strokeWidth={2.4} />
                          </div>
                          <span className="truncate tracking-tight font-black">{label}</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-950 text-amber-300 shadow-2xs">
                          VIP 1-ON-1
                        </span>
                      </Link>
                    )
                  ) : (
                    <Link
                      id={id}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? label : undefined}
                      className={`flex items-center ${collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2'} rounded-xl text-sm font-semibold transition-colors`}
                      style={{
                        color: isParentActive ? 'var(--accent-ink)' : 'var(--muted)',
                        background: isParentActive ? 'var(--accent)' : 'transparent',
                      }}
                    >
                      <Icon size={collapsed ? 18 : 17} strokeWidth={2.2} />
                      {!collapsed && <span className="truncate">{label}</span>}
                    </Link>
                  )}

                  {/* Sub-menu (only shown when expanded and not collapsed) */}
                  {!collapsed && children && isExpanded && (
                    <div className="ml-5 pl-3 py-1 space-y-1 border-l-2 border-amber-300 dark:border-amber-700/60 animate-in fade-in slide-in-from-top-1 duration-150">
                      {children.map(sub => {
                        const isSubActive =
                          pathname === sub.href ||
                          (typeof window !== 'undefined' &&
                            sub.href.includes('?') &&
                            `${pathname}${window.location.search}` === sub.href)
                        return (
                          <Link
                            key={sub.id}
                            href={sub.href}
                            onClick={() => setMobileOpen(false)}
                            className={`block px-3 py-2 rounded-xl text-xs font-bold transition-all truncate cursor-pointer ${
                              isSubActive
                                ? 'text-amber-950 bg-amber-300 shadow-2xs font-black'
                                : 'text-gray-600 hover:text-gray-950 hover:bg-amber-50/70 dark:text-gray-400 dark:hover:text-white'
                            }`}
                          >
                            {sub.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Auto-Sliding Promo Cards (hidden when collapsed) */}
      {!collapsed && <SidebarPromoCard />}

      {/* Premium Pill Button */}
      <div className={`${collapsed ? 'px-2' : 'px-3'} pb-2.5 flex-shrink-0`}>
        <Link
          id="nav-upgrade"
          href="/upgrade"
          onClick={() => setMobileOpen(false)}
          title={collapsed ? 'Premium' : undefined}
          className={`w-full flex items-center ${collapsed ? 'justify-center py-2.5' : 'gap-3 px-4 py-2.5'} rounded-full text-sm font-black transition-all hover:brightness-95 group shadow-2xs`}
          style={{ background: '#fff9db', color: '#7c5500', border: '1px solid #ffec99' }}
        >
          <Crown size={18} strokeWidth={2.6} className="text-amber-600 fill-amber-400 flex-shrink-0" />
          {!collapsed && <span className="truncate">Premium</span>}
        </Link>
      </div>

      {/* Profile Bar with Notification Bell */}
      <div className={`${collapsed ? 'px-2 py-2.5' : 'px-3 py-2.5'} flex-shrink-0 relative`} style={{ borderTop: '1px solid var(--border)' }}>
        {collapsed ? (
          /* Collapsed: avatar + bell stacked */
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setProfileMenuOpen(p => !p)}
              title={name || 'Profil'}
              className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border border-amber-200 hover:ring-2 hover:ring-amber-300 transition-all"
              style={{ background: '#fef3c7' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar}
                alt="Avatar"
                className="w-full h-full object-contain p-0.5"
                onError={e => { (e.currentTarget as HTMLImageElement).src = '/logo.png' }}
              />
            </button>
            <div className="relative">
              <button
                onClick={() => setNotifOpen(prev => !prev)}
                aria-label="Notifikasi"
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
              >
                <Bell size={16} />
              </button>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        ) : (
          /* Expanded: full profile bar */
          <div className="flex items-center justify-between gap-2">
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
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-contain p-0.5"
                  onError={e => { (e.currentTarget as HTMLImageElement).src = '/logo.png' }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-black truncate text-gray-900 group-hover:text-amber-900 leading-tight">
                    {name || 'Pejuang PTN'}
                  </p>
                  {isAdmin ? (
                    <span className="flex-shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none bg-gray-900 text-amber-300">
                      SUPERADMIN
                    </span>
                  ) : tier && tier !== 'free' ? (
                    <span className={`flex-shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none ${
                      tier === 'menyeluruh' ? 'bg-purple-100 text-purple-700' :
                      tier === 'dokumen' ? 'bg-blue-100 text-blue-700' :
                      tier === 'review' ? 'bg-amber-100 text-amber-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {tier === 'menyeluruh' ? 'QUEEN BEE' :
                       tier === 'dokumen' ? 'HONEYCOMB' :
                       tier === 'review' ? 'NECTAR' :
                       tier === 'web_premium' ? 'PREMIUM' : tier.toUpperCase()}
                    </span>
                  ) : null}
                </div>
                <p className="text-[10px] font-semibold text-gray-400 truncate">
                  {school || '+ Tambahkan sekolah...'}
                </p>
              </div>
            </button>

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
        )}

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
                minWidth: '220px',
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
                    src={avatar}
                    alt="Otbee"
                    className="w-9 h-9 object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black text-gray-900 group-hover:text-amber-950 truncate">
                    {name || 'Pejuang PTN'}
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
                  <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center">
                    <Coins size={13} className="text-amber-800" />
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
                  Profil & Target PTN
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
                  try {
                    localStorage.removeItem('otwptn_user_avatar')
                    localStorage.removeItem('otwptn_xp')
                    localStorage.removeItem('otwptn_level')
                    localStorage.removeItem('otwptn_coins')
                  } catch {}
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
        <img src="/logo.png" alt="otwptn" className="logo-adaptive" style={{ height: 39, width: 'auto' }} />
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
        className={`hidden md:flex md:flex-col fixed top-0 left-0 h-screen flex-shrink-0 z-30 transition-[width] duration-200 ease-in-out ${collapsed ? 'w-16' : 'w-64'}`}
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
