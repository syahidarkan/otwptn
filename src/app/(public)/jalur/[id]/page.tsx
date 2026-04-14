import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Calendar, Banknote, BookOpen, Lock } from 'lucide-react'
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
  const { id } = await params
  const admin = await createAdminClient()

  const { data: jalur } = await admin
    .from('jalur_pages')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!jalur) notFound()

  // Check if user is a confirmed member
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isMember = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isMember = profile?.role === 'member' || profile?.role === 'admin'
  }

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

        {/* Header card — always visible */}
        <div className="bg-white rounded-2xl border border-brand-gray-2 p-8 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLOR[jalur.category] ?? 'bg-gray-100 text-gray-600'}`}>
              {CATEGORY_LABEL[jalur.category] ?? jalur.category}
            </span>
          </div>
          <p className="text-sm text-brand-muted font-semibold mb-1">{jalur.university}</p>
          <h1 className="text-3xl font-extrabold text-brand-black mb-4">{jalur.name}</h1>

          {isMember && jalur.url && (
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

        {/* Detail content */}
        {isMember ? (
          <>
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
                <div className="flex flex-col gap-2 text-brand-dark leading-relaxed">
                  {jalur.persyaratan.split(' - ').filter(Boolean).map((item: string, i: number) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-brand-yellow font-bold shrink-0 mt-0.5">•</span>
                      <span className="text-sm">{item.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-brand-black rounded-2xl p-6 text-center">
              <p className="text-white font-bold text-lg mb-1">Butuh Bantuan Persiapan?</p>
              <p className="text-white/60 text-sm mb-4">Tim otwptn siap bantu kamu dari nol sampai submit dokumen.</p>
              <Button href="/daftar" variant="primary" size="sm">
                Daftar Bimbingan Sekarang
              </Button>
            </div>
          </>
        ) : (
          /* Blurred preview for non-members */
          <>
            <div className="relative mb-5">
              {/* Blurred content */}
              <div className="blur-sm select-none pointer-events-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div className="bg-white rounded-2xl border border-brand-gray-2 p-5">
                    <div className="flex items-center gap-2 text-brand-muted text-xs font-semibold mb-2">
                      <Calendar size={13} /> Periode Pendaftaran
                    </div>
                    <p className="text-sm font-bold text-brand-black">4–30 Mei 2026</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-brand-gray-2 p-5">
                    <div className="flex items-center gap-2 text-brand-muted text-xs font-semibold mb-2">
                      <Calendar size={13} /> Pengumuman
                    </div>
                    <p className="text-sm font-bold text-brand-black">Paling lambat 1 Juli 2026</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-brand-gray-2 p-5">
                    <div className="flex items-center gap-2 text-brand-muted text-xs font-semibold mb-2">
                      <Banknote size={13} /> Biaya Pendaftaran
                    </div>
                    <p className="text-sm font-bold text-brand-black">Rp 900.000</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-brand-gray-2 p-6">
                  <div className="flex items-center gap-2 text-brand-black font-bold mb-4">
                    <BookOpen size={15} /> Persyaratan & Dokumen
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      'Siswa kelas XII SMA/MA/SMK lulus tahun berjalan',
                      'Prestasi min. juara 3 tingkat nasional atau internasional',
                      'Scan rapor kelas 10–12 (PDF)',
                      'Sertifikat bukti prestasi (PDF)',
                      'Pemilihan prodi sesuai bidang prestasi',
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-brand-yellow font-bold shrink-0">•</span>
                        <span className="text-sm text-brand-dark">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Overlay CTA */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl border border-brand-gray-2 p-8 mx-4 max-w-sm w-full text-center">
                  <div className="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center mx-auto mb-4">
                    <Lock size={20} className="text-brand-black" />
                  </div>
                  <h3 className="font-extrabold text-brand-black text-lg mb-2">
                    Info Lengkap untuk Member
                  </h3>
                  <p className="text-brand-muted text-sm mb-6 leading-relaxed">
                    Jadwal pendaftaran, biaya, dan persyaratan lengkap hanya bisa dilihat setelah bergabung dengan bimbingan otwptn.
                  </p>
                  <Button href="/daftar" variant="primary" fullWidth className="mb-3">
                    Daftar Bimbingan Sekarang
                  </Button>
                  <Button href="/login" variant="ghost" fullWidth>
                    Sudah punya akun? Masuk
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
