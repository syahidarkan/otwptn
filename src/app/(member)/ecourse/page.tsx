import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CATEGORY_LABEL } from '@/lib/constants'
import Badge from '@/components/ui/Badge'
import type { Module, JalurCategory } from '@/types'
import { BookOpen, FileText, Video, Download } from 'lucide-react'
import Link from 'next/link'

const categoryBadge: Record<string, 'essay' | 'prestasi' | 'hybrid' | 'general'> = {
  essay_only: 'essay',
  prestasi_only: 'prestasi',
  hybrid: 'hybrid',
  general: 'general',
}

export default async function EcoursePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: modules } = await supabase
    .from('modules')
    .select('*, lessons(id)')
    .eq('is_active', true)
    .order('order_index')

  return (
    <div className="min-h-screen bg-brand-gray">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-brand-black">E-Course</h1>
          <p className="text-brand-muted mt-1">Materi bimbingan lengkap untuk jalur non-test PTN</p>
        </div>

        {!modules || modules.length === 0 ? (
          <div className="bg-white rounded-2xl border border-brand-gray-2 p-12 text-center">
            <BookOpen size={40} className="mx-auto text-brand-muted mb-4" />
            <p className="text-brand-muted">Materi sedang disiapkan. Pantau terus!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((mod: Module & { lessons: { id: string }[] }) => (
              <Link key={mod.id} href={`/ecourse/${mod.id}`}>
                <div className="bg-white rounded-2xl border border-brand-gray-2 p-6 hover:shadow-md hover:border-brand-black transition-all cursor-pointer h-full flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant={categoryBadge[mod.category ?? 'general']}>
                      {mod.category === 'general' ? 'Umum' : CATEGORY_LABEL[mod.category as JalurCategory]}
                    </Badge>
                    <span className="text-xs text-brand-muted">{mod.lessons?.length ?? 0} materi</span>
                  </div>
                  <h3 className="font-bold text-brand-black text-lg mb-2">{mod.title}</h3>
                  {mod.description && (
                    <p className="text-sm text-brand-muted leading-relaxed flex-1">{mod.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
