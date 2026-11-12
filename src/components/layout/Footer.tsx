'use client'

import Link from 'next/link'
import { Mail, Phone, ArrowRight } from 'lucide-react'

const COLS = [
  {
    heading: 'Fitur',
    links: [
      { label: 'Essay AI Review', href: '/dashboard/essay' },
      { label: 'Kalkulator Peluang', href: '/dashboard/kalkulator' },
      { label: 'Otbee AI Chat', href: '/dashboard/otbee' },
      { label: 'E-course', href: '/dashboard/ecourse' },
      { label: 'Direktori Jalur', href: '/direktori' },
    ],
  },
  {
    heading: 'Jalur SNBP',
    links: [
      { label: 'Jalur Prestasi', href: '/direktori' },
      { label: 'Jalur Essay', href: '/direktori' },
      { label: 'Jalur Hybrid', href: '/direktori' },
      { label: 'Panduan SNBP', href: '/panduan' },
      { label: 'Direktori PTN', href: '/direktori' },
    ],
  },
  {
    heading: 'Persiapan',
    links: [
      { label: 'Latihan Essay', href: '/dashboard/essay' },
      { label: 'Persiapan Rapor', href: '/onboarding' },
      { label: 'Komunitas', href: '/komunitas' },
      { label: 'Paket Mentor', href: '/upgrade' },
      { label: 'Harga & Paket', href: '/upgrade' },
    ],
  },
  {
    heading: 'Bantuan',
    links: [
      { label: 'FAQ', href: '/panduan' },
      { label: 'Komunitas WhatsApp', href: '/komunitas' },
      { label: 'Career', href: '/career' },
      { label: 'Daftar Mentor', href: '/mentor/apply' },
      { label: 'Login', href: '/login' },
      { label: 'Daftar Gratis', href: '/register' },
    ],
  },
]

const SEO_COLS = [
  {
    heading: 'SNBP & Jalur Non-Tes',
    links: [
      { label: 'Apa itu SNBP', href: '/artikel/apa-itu-snbp' },
      { label: 'Jalur Prestasi 2026', href: '/artikel/jalur-prestasi-2026' },
      { label: 'Jalur Essay 2026', href: '/artikel/jalur-essay-2026' },
      { label: 'Syarat SNBP', href: '/artikel/syarat-snbp' },
      { label: 'Cara Daftar SNBP', href: '/artikel/cara-daftar-snbp' },
    ],
  },
  {
    heading: 'Essay SNBP',
    links: [
      { label: 'Contoh Essay SNBP', href: '/artikel' },
      { label: 'Tips Essay Lolos', href: '/artikel' },
      { label: 'Review Essay AI', href: '/dashboard/essay' },
      { label: 'Essay ITB', href: '/artikel' },
      { label: 'Essay UI', href: '/artikel' },
    ],
  },
  {
    heading: 'PTN Tujuan',
    links: [
      { label: 'Masuk UI', href: '/direktori' },
      { label: 'Masuk ITB', href: '/direktori' },
      { label: 'Masuk UGM', href: '/direktori' },
      { label: 'Masuk ITS', href: '/direktori' },
      { label: 'Masuk UNAIR', href: '/direktori' },
    ],
  },
  {
    heading: 'Persiapan',
    links: [
      { label: 'Kalkulator Peluang PTN', href: '/dashboard/kalkulator' },
      { label: 'Nilai Rapor Ideal', href: '/panduan' },
      { label: 'Strategi Jalur Non-Tes', href: '/panduan' },
      { label: 'Panduan Prestasi', href: '/panduan' },
    ],
  },
  {
    heading: 'Tentang',
    links: [
      { label: 'Tentang otwptn', href: '/tentang' },
      { label: 'Karier (Marketing Partner)', href: '/career/content-creator' },
      { label: 'Daftar Mentor', href: '/mentor/apply' },
      { label: 'Paket & Harga', href: '/upgrade' },
      { label: 'Testimoni', href: '/#testimoni' },
      { label: 'Komunitas', href: '/komunitas' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="pt-8 md:pt-14">
      {/* Flower PNG - transparent bg */}
      <div style={{ lineHeight: 0, background: 'transparent', position: 'relative', zIndex: 1 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/footer-flowers.png"
          alt=""
          aria-hidden
          style={{ width: '100%', display: 'block' }}
        />
      </div>

      {/* Main footer - bg matches bottom pixel of PNG (#583219), -2px kills seam */}
      <div className="dark-section" style={{ background: '#583219', color: '#fff', marginTop: -2 }}>
        <div className="max-w-6xl mx-auto px-6 py-14">

          {/* Top row: brand + nav columns */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
            {/* Brand col - spans 2 on md */}
            <div className="col-span-2">
              <div className="mb-4 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-footer.png" alt="otwptn" style={{ height: 48, width: 'auto', display: 'block' }} />
              </div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: '#ffffff', fontWeight: 600, maxWidth: 240, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                Platform persiapan masuk PTN jalur non-tes - essay, prestasi, dan strategi personal.
              </p>
              <div className="space-y-1.5 mb-4">
                <div className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <Mail size={13} className="text-amber-300" />
                  <a href="mailto:otwptn.com@gmail.com" className="hover:underline text-amber-300">otwptn.com@gmail.com</a>
                </div>
                <div className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <Phone size={13} className="text-amber-300" />
                  <a href="https://wa.me/6285121659182" target="_blank" rel="noopener noreferrer" className="hover:underline text-amber-300">+62 851-2165-9182 (WhatsApp CS)</a>
                </div>
              </div>
              {/* Social icons - lengkap */}
              <div className="flex flex-wrap items-center gap-2.5 mb-5">
                {[
                  { label: 'Instagram', href: 'https://instagram.com/otwptn', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                  { label: 'TikTok', href: 'https://tiktok.com/@otwptn', path: 'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z' },
                  { label: 'YouTube', href: 'https://youtube.com/@otwptn', path: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                  { label: 'X (Twitter)', href: 'https://x.com/otwptn', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                  { label: 'LinkedIn', href: 'https://linkedin.com/company/otwptn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                  { label: 'WhatsApp', href: 'https://wa.me/6285121659182', path: 'M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.344 5l-1.406 5.156 5.281-1.375c1.469.797 3.109 1.219 4.75 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.813 14.125c-.25.703-1.438 1.344-2 1.422-.516.078-1.172.109-1.906-.125-.453-.141-1.031-.328-1.766-.656-3.094-1.328-5.109-4.469-5.266-4.672-.156-.203-1.266-1.688-1.266-3.219 0-1.531.797-2.281 1.078-2.594.281-.312.609-.391.813-.391.203 0 .406 0 .594.016.188.015.438-.078.688.531.25.609.859 2.094.938 2.25.078.156.125.344.016.547-.109.203-.156.328-.313.516-.156.188-.328.406-.469.547-.156.156-.328.328-.141.656.188.328.844 1.391 1.813 2.25 1.25 1.109 2.297 1.453 2.625 1.609.328.156.516.125.703-.094.188-.219.813-.953 1.031-1.281.219-.328.438-.266.734-.156.297.109 1.891.891 2.219 1.047.328.156.547.234.625.375.078.141.078.813-.172 1.516z' },
                ].map(({ label, href, path }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,212,0,0.22)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.88)">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
              <Link href="/register"
                className="inline-block text-xs font-bold px-4 py-2 rounded-full"
                style={{ background: '#ffd400', color: '#111' }}>
                Daftar Gratis <ArrowRight size={14} className="inline-block ml-1 align-[-2px]" aria-hidden />
              </Link>
            </div>

            {/* Nav columns */}
            {COLS.map(col => (
              <div key={col.heading}>
                <div className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: '#ffd400', letterSpacing: '0.1em' }}>
                  {col.heading}
                </div>
                <ul className="space-y-2.5">
                  {col.links.map(l => (
                    <li key={l.label}>
                      <Link href={l.href}
                        className="text-sm font-semibold transition-colors"
                        style={{ color: 'rgba(255,255,255,0.85)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ffd400')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', marginBottom: '2rem' }} />

          {/* Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-10">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              © {new Date().getFullYear()} otwptn · PT. Lembaga Sains Nasional · Dibuat oleh para Alumni Fasilkom UI untuk pejuang PTN Indonesia
            </p>
            <div className="flex gap-5">
              {[
                { label: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
                { label: 'Syarat & Ketentuan', href: '/syarat-ketentuan' },
              ].map(l => (
                <Link key={l.label} href={l.href} className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* SEO link grid */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2rem' }}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {SEO_COLS.map(col => (
                <div key={col.heading}>
                  <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>
                    {col.heading}
                  </div>
                  <ul className="space-y-2">
                    {col.links.map(l => (
                      <li key={l.label}>
                        <Link href={l.href} className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}
