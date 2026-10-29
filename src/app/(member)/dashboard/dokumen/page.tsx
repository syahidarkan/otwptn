'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { JALUR_LIST } from '@/lib/constants'
import { getJalurDocuments, type DocConfidence } from '@/lib/jalurDocuments'
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  FolderLock,
  Upload,
  FileCheck,
  Search,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import FeatureHeader from '@/components/dashboard/FeatureHeader'

const CONFIDENCE_LABEL: Record<DocConfidence | 'generik', { label: string; color: string; bg: string }> = {
  tinggi: { label: 'Sumber Resmi PTN', color: '#15803d', bg: '#dcfce7' },
  sedang: { label: 'Cek Ulang Disarankan', color: '#b45309', bg: '#fef3c7' },
  rendah: { label: 'Perlu Verifikasi', color: '#b91c1c', bg: '#fee2e2' },
  generik: { label: 'Checklist Standar', color: '#4b5563', bg: '#f3f4f6' },
}

interface ProgressRow {
  jalur_id: string
  doc_name: string
  completed: boolean
}

export default function DokumenPage() {
  const supabase = createClient()
  const [targetJalurs, setTargetJalurs] = useState<string[]>([])
  const [progress, setProgress] = useState<ProgressRow[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setLoading(false)
        return
      }
      setUserId(data.user.id)
      const [{ data: profile }, { data: prog }] = await Promise.all([
        supabase.from('profiles').select('target_jalurs').eq('id', data.user.id).single(),
        supabase.from('jalur_document_progress').select('jalur_id, doc_name, completed').eq('user_id', data.user.id),
      ])
      const tj = profile?.target_jalurs ?? []
      setTargetJalurs(tj.length > 0 ? tj : ['snbp', 'ppkb-ui'])
      setProgress(prog ?? [])
      setLoading(false)
    })
  }, [supabase])

  const chosenJalur = useMemo(
    () => JALUR_LIST.filter(j => targetJalurs.includes(j.id)),
    [targetJalurs]
  )

  function isDone(jalurId: string, docName: string) {
    return progress.some(p => p.jalur_id === jalurId && p.doc_name === docName && p.completed)
  }

  async function toggle(jalurId: string, docName: string) {
    if (!userId) return
    const current = isDone(jalurId, docName)
    setProgress(prev => {
      const exists = prev.find(p => p.jalur_id === jalurId && p.doc_name === docName)
      if (exists) {
        return prev.map(p =>
          p.jalur_id === jalurId && p.doc_name === docName ? { ...p, completed: !current } : p
        )
      }
      return [...prev, { jalur_id: jalurId, doc_name: docName, completed: !current }]
    })

    await supabase.from('jalur_document_progress').upsert(
      {
        user_id: userId,
        jalur_id: jalurId,
        doc_name: docName,
        completed: !current,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,jalur_id,doc_name' }
    )
  }

  const allDocumentsList = useMemo(() => {
    return chosenJalur.flatMap(j => {
      const { documents, confidence, note } = getJalurDocuments(j.id, j.category)
      return documents.map(doc => ({
        jalurId: j.id,
        jalurName: j.name,
        ptn: j.ptn,
        docName: doc,
        confidence,
        note,
      }))
    })
  }, [chosenJalur])

  const totalDocs = allDocumentsList.length
  const completedDocs = allDocumentsList.filter(d => isDone(d.jalurId, d.docName)).length
  const overallPercentage = totalDocs ? Math.round((completedDocs / totalDocs) * 100) : 0

  if (loading) {
    return (
      <div className="w-full px-6 md:px-8 py-10">
        <p className="text-sm text-gray-500">Memuat penyimpanan dokumen...</p>
      </div>
    )
  }

  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10">
      <FeatureHeader
        title="Penyimpanan & Checklist Dokumen"
        subtitle="Lacak seluruh berkas rapor legalisir, surat rekomendasi, portofolio, dan sertifikat yang disinkronkan otomatis dengan target jalurmu."
        mascot="/fitur/penyimpanan-dokumen.png"
        badgeText="Arsip & Persyaratan"
      />

      {/* Overview Stat Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-3xl bg-white shadow-md">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Total Dokumen
          </p>
          <p className="text-2xl font-black text-gray-900">{totalDocs} Berkas</p>
          <p className="text-xs text-gray-500 mt-1">Dari {chosenJalur.length} jalur pilihanmu</p>
        </div>

        <div className="p-5 rounded-3xl bg-white shadow-md">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Status Terverifikasi
          </p>
          <p className="text-2xl font-black text-emerald-600">{completedDocs} Selesai</p>
          <p className="text-xs text-gray-500 mt-1">{totalDocs - completedDocs} berkas belum disiapkan</p>
        </div>

        <div className="p-5 rounded-3xl bg-white shadow-md">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Kesiapan Berkas
          </p>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-2xl font-black text-amber-500">{overallPercentage}%</p>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-gray-100">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${overallPercentage}%`,
                background: 'linear-gradient(90deg, #ffd700 0%, #f59e0b 100%)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Jalur Filter Pill Tabs */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
              activeFilter === 'all'
                ? 'btn-brand-primary'
                : 'bg-white text-gray-700 shadow-xs hover:bg-gray-50'
            }`}
          >
            Semua Jalur ({chosenJalur.length})
          </button>
          {chosenJalur.map(j => (
            <button
              key={j.id}
              onClick={() => setActiveFilter(j.id)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
                activeFilter === j.id
                  ? 'btn-brand-primary'
                  : 'bg-white text-gray-700 shadow-xs hover:bg-gray-50'
              }`}
            >
              {j.name}
            </button>
          ))}
        </div>

        <Link
          href="/dashboard/tracking-jalur"
          className="btn-brand-dark text-xs !py-2 !px-4 inline-flex items-center gap-1.5"
        >
          + Tambah Jalur Lain
        </Link>
      </div>

      {/* Document Sections per Jalur */}
      <div className="space-y-6">
        {chosenJalur
          .filter(j => activeFilter === 'all' || activeFilter === j.id)
          .map(j => {
            const { documents, confidence, note } = getJalurDocuments(j.id, j.category)
            const doneCount = documents.filter(d => isDone(j.id, d)).length
            const conf = CONFIDENCE_LABEL[confidence]
            const jalurPercentage = documents.length
              ? Math.round((doneCount / documents.length) * 100)
              : 0

            return (
              <div key={j.id} className="p-6 rounded-3xl bg-white shadow-md">
                {/* Header per Jalur */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-extrabold text-gray-900">{j.name}</h3>
                      <span
                        className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                        style={{ color: conf.color, backgroundColor: conf.bg }}
                      >
                        {conf.label}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-500">{j.ptn}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-black text-gray-900">
                        {doneCount} / {documents.length} Berkas
                      </p>
                      <p className="text-[11px] font-semibold text-emerald-600">
                        {jalurPercentage}% Siap
                      </p>
                    </div>
                  </div>
                </div>

                {note && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50 text-amber-900 text-xs mb-4 leading-relaxed font-medium">
                    <AlertTriangle size={15} className="flex-shrink-0 text-amber-600 mt-0.5" />
                    <span>{note}</span>
                  </div>
                )}

                {/* Document Items List */}
                <div className="divide-y divide-gray-100">
                  {documents.map(doc => {
                    const done = isDone(j.id, doc)
                    return (
                      <div
                        key={doc}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/60 rounded-xl px-2 transition-colors"
                      >
                        <button
                          onClick={() => toggle(j.id, doc)}
                          className="flex items-start sm:items-center gap-3 text-left flex-1 min-w-0"
                        >
                          {done ? (
                            <CheckCircle2 size={19} className="text-emerald-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                          ) : (
                            <Circle size={19} className="text-gray-300 hover:text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                          )}
                          <span
                            className={`text-xs sm:text-sm font-semibold leading-snug ${
                              done ? 'line-through text-gray-400' : 'text-gray-800'
                            }`}
                          >
                            {doc}
                          </span>
                        </button>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => toggle(j.id, doc)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                              done
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 hover:bg-amber-100 text-gray-700'
                            }`}
                          >
                            {done ? 'Sudah Siap' : 'Tandai Siap'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
      </div>

      {/* Helpful Tips Card */}
      <div className="mt-8 p-5 rounded-3xl bg-gray-50 shadow-xs flex items-start gap-3 text-xs text-gray-600 font-medium leading-relaxed">
        <FolderLock size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-gray-900 mb-0.5">Tips Persiapan Berkas:</p>
          Pastikan scan rapor menggunakan format PDF dengan orientasi tegak (portrait), resolusi minimal 150 DPI agar tulisan dan stempel kepala sekolah terbaca jelas. Selalu simpan backup dokumen di Google Drive pribadi.
        </div>
      </div>
    </div>
  )
}
