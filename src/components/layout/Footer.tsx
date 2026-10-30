'use client'

import Link from 'next/link'

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
      { label: 'Paket & Harga', href: '/upgrade' },
      { label: 'Testimoni', href: '/#testimoni' },
      { label: 'Komunitas', href: '/komunitas' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="pt-8 md:pt-14">
      {/* Flower PNG — transparent bg */}
      <div style={{ lineHeight: 0, background: 'transparent', position: 'relative', zIndex: 1 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/footer-flowers.png"
          alt=""
          aria-hidden
          style={{ width: '100%', display: 'block' }}
        />
      </div>

      {/* Main footer — bg matches bottom pixel of PNG (#583219), -2px kills seam */}
      <div className="dark-section" style={{ background: '#583219', color: '#fff', marginTop: -2 }}>
        <div className="max-w-6xl mx-auto px-6 py-14">

          {/* Top row: brand + nav columns */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
            {/* Brand col — spans 2 on md */}
            <div className="col-span-2">
              <div className="mb-4 inline-block bg-white rounded-xl p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="otwptn" style={{ height: 40, width: 'auto', display: 'block' }} />
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#ffffff', fontWeight: 600, maxWidth: 220, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                Platform persiapan masuk PTN jalur non-tes — essay, prestasi, dan strategi personal.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3 mb-5">
                {[
                  { label: 'TikTok', path: 'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z' },
                  { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                ].map(({ label, path }) => (
                  <a key={label} href="#" aria-label={label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,212,0,0.2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
              <Link href="/register"
                className="inline-block text-xs font-bold px-4 py-2 rounded-full"
                style={{ background: '#ffd400', color: '#111' }}>
                Daftar Gratis →
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
              © {new Date().getFullYear()} otwptn · PT. Lembaga Sains Nasional · Dibuat dengan ❤ untuk pejuang PTN Indonesia
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
