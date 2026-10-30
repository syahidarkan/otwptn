import Link from 'next/link'
import { JALUR_LIST, PRICING, CATEGORY_LABEL } from '@/lib/constants'
import type { JalurCategory } from '@/types'
import type { Metadata } from 'next'
import { BookOpen, Award, Layers, ArrowRight, Lock, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Direktori Jalur PTN Non-Tes 2025 | otwptn',
  description: 'Daftar lengkap jalur masuk PTN non-tes: PPKB UI, SSU ITB, SJP UI, Jalur Prestasi, Hybrid. Cek persyaratan, harga bimbingan, dan kategori jalur.',
}

const CAT_META: Record<JalurCategory, { label: string; desc: string; color: string; icon: React.ElementType }> = {
  essay_only:    { label: 'Essay / Portofolio',  desc: 'Motivation letter, personal statement, esai diri', color: '#0ea5e9', icon: BookOpen },
  prestasi_only: { label: 'Prestasi / Sertifikat', desc: 'Olimpiade, kejuaraan, hafidz, ketua OSIS', color: '#f59e0b', icon: Award },
  hybrid:        { label: 'Hybrid (Essay + Prestasi)', desc: 'Kombinasi dokumen, essay, dan sertifikat', color: '#8b5cf6', icon: Layers },
}

function formatRp(n: number) {
  return 'Rp' + n.toLocaleString('id-ID')
}

export default function DirekturiPage() {
  const cats: JalurCategory[] = ['essay_only', 'prestasi_only', 'hybrid']

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ background: 'rgba(245,158,11,0.12)', color: '#92400e' }}>
            Direktori Jalur
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3" style={{ color: 'var(--fg)' }}>
            Semua Jalur PTN Non-Tes
          </h1>
          <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
            Pilih jalur yang sesuai dengan profilmu. Jalur dikelompokkan berdasarkan tipe seleksi dan jenis dokumen yang dibutuhkan.
          </p>
        </div>

        {cats.map((cat) => {
          const { label, desc, color, icon: Icon } = CAT_META[cat]
          const jalurs = JALUR_LIST.filter(j => j.category === cat)

          return (
            <div key={cat} className="mb-12">
              {/* Category header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, color }}>
                  <Icon size={18} />
                </div>
                <div>
                  <h2 className="font-extrabold text-base" style={{ color: 'var(--fg)' }}>{label}</h2>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{desc}</p>
                </div>
                <div className="ml-auto flex flex-col items-end">
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--muted)' }}>Mulai dari</span>
                  <span className="text-sm font-extrabold" style={{ color }}>{formatRp(PRICING[cat].review)}</span>
                </div>
              </div>

              {/* Jalur cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {jalurs.map((j) => (
                  <div
                    key={j.id}
                    className="card p-5 flex items-start justify-between gap-3"
                    style={{ opacity: j.closed ? 0.55 : 1 }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-sm truncate" style={{ color: 'var(--fg)' }}>{j.name}</span>
                        {j.closed && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#fee2e2', color: '#dc2626' }}>
                            <Lock size={10} /> Ditutup
                          </span>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>{j.ptn}</p>

                      {/* Tier pricing */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(['review', 'dokumen', 'menyeluruh'] as const).map((tier) => {
                          const tierLabel = { review: 'Review', dokumen: 'Reguler', menyeluruh: 'Intensif (VIP)' }[tier]
                          return (
                            <span key={tier} className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}12`, color }}>
                              {tierLabel}: {formatRp(PRICING[cat][tier])}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    {!j.closed && (
                      <Link
                        href={`/daftar?jalur=${j.id}&category=${cat}`}
                        className="flex-shrink-0 flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                        style={{ background: `${color}15`, color }}
                      >
                        Daftar <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* SNBP section */}
        <div className="mt-2 mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="font-extrabold text-base" style={{ color: 'var(--fg)' }}>SNBP (Seleksi Nasional Berbasis Prestasi)</h2>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Jalur nasional berbasis nilai rapor & prestasi sekolah - dikelola SNPMB</p>
            </div>
          </div>
          <div className="card p-5">
            <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>
              SNBP adalah jalur seleksi nasional yang menggunakan nilai rapor semester 1–5 dan mempertimbangkan akreditasi serta rekam jejak sekolah.
              Tidak ada tes masuk - seleksi murni berbasis dokumen akademik.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/panduan" className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                <BookOpen size={13} /> Panduan SNBP
              </Link>
              <Link href="/artikel" className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                <ExternalLink size={13} /> Artikel Strategi SNBP
              </Link>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 rounded-2xl" style={{ background: 'var(--bg-alt)', border: '1.5px solid var(--border)' }}>
          <h3 className="font-extrabold text-lg mb-2" style={{ color: 'var(--fg)' }}>Belum tahu mau pilih jalur mana?</h3>
          <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>Pakai kalkulator peluang untuk estimasi jalur yang paling sesuai profilmu.</p>
          <Link href="/dashboard/kalkulator" className="btn btn-primary px-6 py-3 text-sm inline-block">
            Cek Kalkulator Peluang →
          </Link>
        </div>
      </div>
    </div>
  )
}
