import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

const CATEGORY_LABEL: Record<string, string> = {
  essay_only: 'Essay Only',
  prestasi_only: 'Prestasi Only',
  hybrid: 'Hybrid',
}

const CATEGORY_COLOR: Record<string, string> = {
  essay_only: 'bg-blue-100 text-blue-700',
  prestasi_only: 'bg-green-100 text-green-700',
  hybrid: 'bg-purple-100 text-purple-700',
}

export default async function JalurPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>
}) {
  const { kategori } = await searchParams
  const supabase = await createAdminClient()

  let query = supabase
    .from('jalur_pages')
    .select('*')
    .eq('is_active', true)
    .order('university')

  if (kategori && ['essay_only', 'prestasi_only', 'hybrid'].includes(kategori)) {
    query = query.eq('category', kategori)
  }

  const { data: jalurList } = await query

  const categories = [
    { value: '', label: 'Semua Jalur' },
    { value: 'essay_only', label: 'Essay Only' },
    { value: 'prestasi_only', label: 'Prestasi Only' },
    { value: 'hybrid', label: 'Hybrid' },
  ]

  return (
    <div className="min-h-screen bg-brand-gray pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-brand-muted text-sm mb-3">
            <MapPin size={14} />
            <span>Direktori Jalur Masuk PTN</span>
          </div>
          <h1 className="text-4xl font-extrabold text-brand-black mb-3">Jalur Masuk PTN</h1>
          <p className="text-brand-muted max-w-2xl">
            Informasi lengkap jalur masuk PTN non-test — persyaratan, biaya, dan jadwal pendaftaran terbaru.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              href={cat.value ? `/jalur?kategori=${cat.value}` : '/jalur'}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                (kategori ?? '') === cat.value
                  ? 'bg-brand-black text-white border-brand-black'
                  : 'bg-white text-brand-muted border-brand-gray-2 hover:border-brand-black hover:text-brand-black'
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Grid */}
        {!jalurList || jalurList.length === 0 ? (
          <div className="text-center py-20 text-brand-muted">
            Belum ada data jalur.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jalurList.map((jalur) => (
              <Link
                key={jalur.id}
                href={`/jalur/${jalur.id}`}
                className="bg-white rounded-2xl border border-brand-gray-2 p-5 hover:border-brand-black hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLOR[jalur.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {CATEGORY_LABEL[jalur.category] ?? jalur.category}
                  </span>
                  <span className="text-xs font-semibold text-brand-muted bg-brand-gray px-2 py-0.5 rounded-full">
                    Lihat Detail →
                  </span>
                </div>
                <p className="text-xs text-brand-muted font-medium mb-1">{jalur.university}</p>
                <h3 className="font-extrabold text-brand-black text-base leading-snug group-hover:text-brand-yellow transition-colors">
                  {jalur.name}
                </h3>
                <p className="text-xs text-brand-muted mt-2">Info lengkap tersedia untuk member</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
