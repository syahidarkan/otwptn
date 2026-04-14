import { JALUR_LIST, CATEGORY_LABEL } from '@/lib/constants'
import type { JalurCategory } from '@/types'
import Badge from '@/components/ui/Badge'

const categoryOrder: JalurCategory[] = ['essay_only', 'prestasi_only', 'hybrid']

const badgeVariant: Record<JalurCategory, 'essay' | 'prestasi' | 'hybrid'> = {
  essay_only: 'essay',
  prestasi_only: 'prestasi',
  hybrid: 'hybrid',
}

export default function JalurDirectory() {
  const grouped = categoryOrder.map((cat) => ({
    category: cat,
    jalurs: JALUR_LIST.filter((j) => j.category === cat),
  }))

  return (
    <section className="bg-brand-black py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-brand-yellow text-sm font-bold uppercase tracking-widest mb-3">Direktori Jalur</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">
            30+ Jalur PTN Tersedia
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {grouped.map(({ category, jalurs }) => (
            <div key={category} className="bg-brand-dark rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-5">
                <Badge variant={badgeVariant[category]}>{CATEGORY_LABEL[category]}</Badge>
              </div>
              <ul className="flex flex-col gap-3">
                {jalurs.map((jalur) => (
                  <li key={jalur.id} className="flex flex-col">
                    <span className="text-white font-semibold text-sm">{jalur.name}</span>
                    <span className="text-white/40 text-xs">{jalur.ptn}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
