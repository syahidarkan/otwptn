import Link from 'next/link'
import { LayoutDashboard, Users, Package, BookOpen, Megaphone, Settings, MapPin } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pendaftar', label: 'Pendaftar', icon: Users },
  { href: '/admin/paket', label: 'Paket', icon: Package },
  { href: '/admin/jalur', label: 'Jalur Masuk', icon: MapPin },
  { href: '/admin/ecourse', label: 'E-Course', icon: BookOpen },
  { href: '/admin/broadcast', label: 'Broadcast', icon: Megaphone },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-brand-gray">
      {/* Sidebar */}
      <aside className="w-56 bg-brand-black flex flex-col shrink-0 fixed inset-y-0 left-0 z-30">
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/">
            <span className="text-white font-extrabold">otw<span className="text-brand-yellow">ptn</span></span>
          </Link>
          <p className="text-white/30 text-xs mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-white/70 transition-colors text-sm"
          >
            ← Ke Website
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 min-h-screen">
        {children}
      </main>
    </div>
  )
}
