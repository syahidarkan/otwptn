import Link from 'next/link'

const columns = [
  {
    title: 'Platform',
    links: [
      { href: '/#how-it-works', label: 'Cara Kerja' },
      { href: '/#kategori', label: 'Kategori Jalur' },
      { href: '/#pricing', label: 'Harga' },
      { href: '/jalur', label: 'Direktori Jalur' },
    ],
  },
  {
    title: 'Mulai',
    links: [
      { href: '/daftar', label: 'Daftar Sekarang' },
      { href: '/login', label: 'Masuk Akun' },
      { href: '/dashboard', label: 'Dashboard Member' },
      { href: '/ecourse', label: 'E-Course' },
    ],
  },
  {
    title: 'Jalur Populer',
    links: [
      { href: '/jalur', label: 'PPKB UI' },
      { href: '/jalur', label: 'SJP UI' },
      { href: '/jalur', label: 'PBUB UGM' },
      { href: '/jalur', label: 'PIN IPB' },
    ],
  },
  {
    title: 'Kontak',
    links: [
      { href: 'mailto:hello@otwptn.vercel.app', label: 'Email Kami' },
      { href: '#', label: 'Instagram' },
      { href: '#', label: 'TikTok' },
      { href: '#faq', label: 'FAQ' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-brand-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <span className="text-white font-extrabold text-2xl">otw<span className="text-brand-yellow">ptn</span></span>
            </Link>
            <p className="mt-3 text-sm text-white/50 leading-relaxed max-w-xs">
              Platform bimbingan masuk PTN jalur non-test terpercaya. Bantu ratusan siswa tembus PTN impian tanpa UTBK.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-white mb-4">{col.title}</h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/50 hover:text-brand-yellow transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} otwptn. Semua hak dilindungi.
          </p>
          <p className="text-xs text-white/40">
            Platform bimbingan jalur non-test PTN Indonesia
          </p>
        </div>
      </div>
    </footer>
  )
}
