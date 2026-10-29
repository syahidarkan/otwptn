'use client'

// Adapted from pintarly — navbar: full-width bar at top, shrinks into floating pill on scroll

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const scrolledRef = useRef(false)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUser(data.user))

    const fn = () => {
      const y = window.scrollY
      if (!scrolledRef.current && y > 40) {
        scrolledRef.current = true
        setScrolled(true)
      } else if (scrolledRef.current && y < 12) {
        scrolledRef.current = false
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-0">
      <motion.nav
        className="glass-nav flex items-center justify-between w-full"
        animate={{
          maxWidth: scrolled ? 640 : 10000,
          marginTop: scrolled ? 14 : 0,
          borderRadius: scrolled ? 9999 : 0,
          paddingTop: scrolled ? 8 : 16,
          paddingBottom: scrolled ? 8 : 16,
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.07)' : '0 1px 0 rgba(0,0,0,0.05)',
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ paddingLeft: 24, paddingRight: 24 }}
      >
        <Link href="/" className="flex items-center flex-shrink-0 py-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="otwptn" style={{ height: 52, width: 'auto' }} className="transition-transform hover:scale-105" />
        </Link>

        <div className="hidden md:flex items-center gap-1.5">
          <Link href="/#fitur" className="px-3.5 py-1.5 text-sm font-semibold rounded-full text-gray-700 hover:text-gray-950 hover:bg-black/5 transition-colors">Fitur</Link>
          <Link href="/#harga" className="px-3.5 py-1.5 text-sm font-semibold rounded-full text-gray-700 hover:text-gray-950 hover:bg-black/5 transition-colors">Harga</Link>
          <Link href="/artikel" className="px-3.5 py-1.5 text-sm font-semibold rounded-full text-gray-700 hover:text-gray-950 hover:bg-black/5 transition-colors">Artikel</Link>
        </div>

        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {user ? (
            <Link href="/dashboard" className="btn btn-primary text-sm px-4 py-2 font-bold shadow-sm">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="px-3.5 py-2 text-sm font-bold text-gray-800 hover:text-amber-600 transition-colors">Masuk</Link>
              <Link href="/register" className="btn btn-primary text-sm px-4 py-2 font-black shadow-sm">Daftar</Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2 text-gray-800" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute top-20 w-full max-w-xs mx-4 glass-nav rounded-2xl p-2.5 z-50 shadow-xl"
            style={{ border: '1px solid rgba(0,0,0,0.06)' }}
          >
            {[['Fitur', '/#fitur'], ['Harga', '/#harga'], ['Artikel', '/artikel']].map(([l, h]) => (
              <Link key={h} href={h} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-bold rounded-xl hover:bg-black/5" style={{ color: 'var(--fg)' }}>{l}</Link>
            ))}
            <div className="border-t my-1" style={{ borderColor: 'var(--border)' }} />
            {user ? (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="btn btn-primary w-full py-2.5 text-sm mt-1">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-center" style={{ color: 'var(--fg)' }}>Masuk</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary w-full py-2.5 text-sm mt-1">Daftar</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
