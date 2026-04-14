import { STATS } from '@/lib/constants'

export default function StatsBar() {
  return (
    <section className="bg-white border-b border-brand-gray-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl md:text-5xl font-extrabold text-brand-black">{stat.value}</p>
              <p className="text-brand-muted text-sm mt-2 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
