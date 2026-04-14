import Button from '@/components/ui/Button'
import { PRICING, TIER_LABEL, TIER_DESCRIPTION, TIER_FEATURES } from '@/lib/constants'
import { formatRupiah } from '@/lib/utils'
import type { JalurCategory } from '@/types'

const categories: Array<{ id: JalurCategory; label: string; featured: boolean }> = [
  { id: 'essay_only', label: 'Essay Only', featured: false },
  { id: 'prestasi_only', label: 'Prestasi Only', featured: false },
  { id: 'hybrid', label: 'Hybrid', featured: true },
]

const tierKeys = ['review', 'dokumen', 'menyeluruh'] as const

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-brand-muted text-sm font-bold uppercase tracking-widest mb-3">Harga</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-brand-black">
            Investasi yang Tepat
          </h2>
          <p className="text-brand-muted mt-4">
            Pilih paket sesuai kebutuhanmu.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`rounded-2xl overflow-hidden ${
                cat.featured
                  ? 'ring-2 ring-brand-black shadow-xl'
                  : 'border border-brand-gray-2'
              }`}
            >
              {/* Header */}
              <div className={`px-6 py-5 ${cat.featured ? 'bg-brand-black' : 'bg-brand-gray'}`}>
                {cat.featured && (
                  <span className="text-xs font-bold text-brand-black bg-brand-yellow px-2 py-0.5 rounded-full mb-2 inline-block">
                    Paling Kompetitif
                  </span>
                )}
                <h3 className={`text-xl font-extrabold ${cat.featured ? 'text-white' : 'text-brand-black'}`}>
                  {cat.label}
                </h3>
              </div>

              {/* Tiers */}
              <div className="divide-y divide-brand-gray-2">
                {tierKeys.map((tier) => {
                  const features = TIER_FEATURES[cat.id][tier] ?? []
                  return (
                    <div key={tier} className="px-6 py-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-bold text-brand-black">{TIER_LABEL[tier]}</p>
                          <p className="text-xs text-brand-muted">{TIER_DESCRIPTION[tier]}</p>
                        </div>
                        <p className="text-lg font-extrabold text-brand-black shrink-0">
                          {formatRupiah(PRICING[cat.id][tier])}
                        </p>
                      </div>
                      <ul className="mt-3 flex flex-col gap-1">
                        {features.map((f) => (
                          <li key={f} className="text-xs text-brand-muted flex items-center gap-2">
                            <span className={f.startsWith('Tanpa') ? 'text-red-400 font-bold' : 'text-brand-yellow font-bold'}>
                              {f.startsWith('Tanpa') ? '✕' : '✓'}
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>

              <div className="px-6 py-5 bg-brand-gray">
                <Button href="/daftar" variant={cat.featured ? 'dark' : 'ghost'} fullWidth size="md">
                  Pilih {cat.label}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-brand-muted mt-8">
          Add-on jalur tambahan: <strong>+Rp 50.000</strong> per PTN
        </p>
      </div>
    </section>
  )
}
