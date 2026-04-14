'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

const publicLinks = [
  { href: '/#how-it-works', label: 'Deskripsi' },
  { href: '/#kategori', label: 'Kategori' },
  { href: '/#pricing', label: 'Paket' },
  { href: '/#mentor', label: 'Tentang Mentor' },
]

const memberLinks = [
  { href: '/jalur', label: 'Jalur PTN' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const allLinks = [...publicLinks, ...(user ? memberLinks : [])]

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
      scrolled ? 'bg-brand-black/95 backdrop-blur-sm' : 'bg-brand-black'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-white font-extrabold text-xl">otw<span className="text-brand-yellow">ptn</span></span>
          </Link>

          {/* Nav links desktop */}
          <div className="hidden md:flex items-center gap-6">
            {allLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-white/80 hover:text-brand-yellow transition-colors font-medium"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button href="/dashboard" variant="ghost" size="sm" className="text-white border-white/20 hover:bg-white/10">
                  Dashboard
                </Button>
                <Button onClick={handleLogout} variant="primary" size="sm">
                  Keluar
                </Button>
              </>
            ) : (
              <>
                <Button href="/login" variant="ghost" size="sm" className="text-white border-white/20 hover:bg-white/10">
                  Masuk
                </Button>
                <Button href="/daftar" variant="primary" size="sm">
                  Daftar Sekarang
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden text-white p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-brand-dark border-t border-white/10 px-4 py-4 flex flex-col gap-3">
          {allLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-brand-yellow text-sm font-medium py-2"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            {user ? (
              <>
                <Button href="/dashboard" variant="ghost" size="sm" fullWidth className="text-white border-white/20">
                  Dashboard
                </Button>
                <Button onClick={handleLogout} variant="primary" size="sm" fullWidth>
                  Keluar
                </Button>
              </>
            ) : (
              <>
                <Button href="/login" variant="ghost" size="sm" fullWidth className="text-white border-white/20">
                  Masuk
                </Button>
                <Button href="/daftar" variant="primary" size="sm" fullWidth>
                  Daftar Sekarang
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
