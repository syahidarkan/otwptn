import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, Banknote, BookOpen } from 'lucide-react'
import Button from '@/components/ui/Button'

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

export default async function JalurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const admin = await createAdminClient()

  const { data: jalur } = await admin
    .from('jalur_pages')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!jalur) notFound()

  return (
    <div className="min-h-screen bg-brand-gray pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          href="/jalur"
          className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-black mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Kembali ke Direktori Jalur
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-brand-gray-2 p-8 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLOR[jalur.category] ?? 'bg-gray-100 text-gray-600'}`}>
              {CATEGORY_LABEL[jalur.category] ?? jalur.category}
            </span>
            {jalur.biaya && (
              <span className="text-xs bg-brand-gray text-brand-dark font-semibold px-2.5 py-1 rounded-full">
                Rp {(jalur.biaya / 1000).toFixed(0)}K
              </span>
            )}
          </div>

          <p className="text-sm text-brand-muted font-semibold mb-1">{jalur.university}</p>
          <h1 className="text-3xl font-extrabold text-brand-black mb-4">{jalur.name}</h1>

          {jalur.url && (
            <a
              href={jalur.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium"
            >
              <ExternalLink size={14} /> Website Resmi
            </a>
          )}
        </div>

        {/* Info cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {jalur.pendaftaran && (
            <div className="bg-white rounded-2xl border border-brand-gray-2 p-5">
              <div className="flex items-center gap-2 text-brand-muted text-xs font-semibold mb-2">
                <Calendar size={13} /> Periode Pendaftaran
              </div>
              <p className="text-sm font-bold text-brand-black">{jalur.pendaftaran}</p>
            </div>
          )}
          {jalur.pengumuman && (
            <div className="bg-white rounded-2xl border border-brand-gray-2 p-5">
              <div className="flex items-center gap-2 text-brand-muted text-xs font-semibold mb-2">
                <Calendar size={13} /> Pengumuman
              </div>
              <p className="text-sm font-bold text-brand-black">{jalur.pengumuman}</p>
            </div>
          )}
          {jalur.biaya && (
            <div className="bg-white rounded-2xl border border-brand-gray-2 p-5">
              <div className="flex items-center gap-2 text-brand-muted text-xs font-semibold mb-2">
                <Banknote size={13} /> Biaya Pendaftaran
              </div>
              <p className="text-sm font-bold text-brand-black">Rp {jalur.biaya.toLocaleString('id-ID')}</p>
            </div>
          )}
        </div>

        {/* Persyaratan */}
        {jalur.persyaratan && (
          <div className="bg-white rounded-2xl border border-brand-gray-2 p-6 mb-5">
            <div className="flex items-center gap-2 text-brand-black font-bold mb-4">
              <BookOpen size={15} /> Persyaratan & Dokumen
            </div>
            <div className="prose prose-sm max-w-none text-brand-dark leading-relaxed">
              {jalur.persyaratan.split(' - ').filter(Boolean).map((item: string, i: number) => (
                <div key={i} className="flex gap-3 mb-2">
                  <span className="text-brand-yellow font-bold shrink-0 mt-0.5">•</span>
                  <span>{item.trim()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-brand-black rounded-2xl p-6 text-center">
          <p className="text-white font-bold text-lg mb-1">Butuh Bantuan Persiapan?</p>
          <p className="text-white/60 text-sm mb-4">Tim otwptn siap bantu kamu dari nol sampai submit dokumen.</p>
          <Button href="/daftar" variant="primary" size="sm">
            Daftar Bimbingan Sekarang
          </Button>
        </div>
      </div>
    </div>
  )
}
