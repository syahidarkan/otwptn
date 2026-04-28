'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { PRICING, TIER_LABEL, TIER_DESCRIPTION, TIER_FEATURES } from '@/lib/constants'
import { formatRupiah } from '@/lib/utils'
import type { JalurCategory } from '@/types'

const categories: Array<{ id: JalurCategory; label: string }> = [
  { id: 'essay_only', label: 'Essay Only' },
  { id: 'prestasi_only', label: 'Prestasi Only' },
  { id: 'hybrid', label: 'Hybrid' },
]

const tierKeys = ['review', 'dokumen', 'menyeluruh'] as const

function isNegativeFeature(f: string) {
  return f.startsWith('Tanpa') || f.startsWith('Belum')
}

export default function PricingSection() {
  const [active, setActive] = useState<JalurCategory>('essay_only')

  return (
    <section id="pricing" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-brand-muted text-sm font-bold uppercase tracking-widest mb-3">Harga</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-brand-black">
            Investasi yang Tepat
          </h2>
          <p className="text-brand-muted mt-4">
            Pilih paket sesuai kebutuhanmu.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-brand-gray rounded-xl p-1.5 gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  active === cat.id
                    ? 'bg-brand-black text-white shadow-sm'
                    : 'text-brand-muted hover:text-brand-black'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tier cards — horizontal: Review | Reguler | Intensif */}
        <div className="grid md:grid-cols-3 gap-6">
          {tierKeys.map((tier) => {
            const features = TIER_FEATURES[active][tier] ?? []
            const isFeatured = tier === 'menyeluruh'
            return (
              <div
                key={tier}
                className={`rounded-2xl overflow-hidden flex flex-col ${
                  isFeatured
                    ? 'border-2 border-brand-black shadow-xl'
                    : 'border border-brand-gray-2'
                }`}
              >
                {/* Card header */}
                <div className={`px-6 py-5 ${isFeatured ? 'bg-brand-black' : 'bg-brand-gray'}`}>
                  {isFeatured && (
                    <span className="inline-block text-[10px] font-bold bg-brand-yellow text-brand-black px-2 py-0.5 rounded-full mb-2 uppercase tracking-wide">
                      Paling Direkomendasikan
                    </span>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-xl font-extrabold ${isFeatured ? 'text-white' : 'text-brand-black'}`}>
                      {TIER_LABEL[tier]}
                    </h3>
                    <p className={`text-xl font-extrabold shrink-0 ${isFeatured ? 'text-brand-yellow' : 'text-brand-black'}`}>
                      {formatRupiah(PRICING[active][tier])}
                    </p>
                  </div>
                  <p className={`text-xs mt-2 leading-relaxed ${isFeatured ? 'text-white/70' : 'text-brand-muted'}`}>
                    {TIER_DESCRIPTION[tier]}
                  </p>
                </div>

                {/* Feature list */}
                <div className="px-6 py-5 flex-1">
                  <ul className="flex flex-col gap-2">
                    {features.map((f) => {
                      const negative = isNegativeFeature(f)
                      return (
                        <li key={f} className="text-sm text-brand-muted flex items-start gap-2">
                          <span className={`mt-0.5 shrink-0 font-bold ${negative ? 'text-red-400' : 'text-brand-yellow'}`}>
                            {negative ? '✕' : '✓'}
                          </span>
                          {f}
                        </li>
                      )
                    })}
                  </ul>
                </div>

                {/* CTA */}
                <div className="px-6 py-5 bg-brand-gray border-t border-brand-gray-2">
                  <Button href="/daftar" variant={isFeatured ? 'dark' : 'ghost'} fullWidth size="md">
                    Pilih {TIER_LABEL[tier]}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center text-sm text-brand-muted mt-8">
          Add-on jalur tambahan: <strong>+Rp 50.000</strong> per PTN
        </p>
      </div>
    </section>
  )
}
