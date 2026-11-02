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
  Link2,
  FileText,
  Trash2,
  X,
  UploadCloud,
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

interface DocAttachment {
  link?: string
  fileName?: string
  uploadedAt: string
}

export default function DokumenPage() {
  const supabase = createClient()
  const [targetJalurs, setTargetJalurs] = useState<string[]>([])
  const [progress, setProgress] = useState<ProgressRow[]>([])
  const [attachments, setAttachments] = useState<Record<string, DocAttachment>>({})
  const [activeModal, setActiveModal] = useState<{ jalurId: string; docName: string } | null>(null)
  const [modalLink, setModalLink] = useState('')
  const [modalFileName, setModalFileName] = useState('')
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

      // Load local vault attachments
      try {
        const stored = localStorage.getItem(`otwptn_doc_vault_${data.user.id}`)
        if (stored) {
          setAttachments(JSON.parse(stored))
        }
      } catch (e) {
        console.warn('Failed loading local doc vault:', e)
      }

      const [{ data: profile }, { data: prog }] = await Promise.all([
        supabase.from('profiles').select('target_jalurs').eq('id', data.user.id).maybeSingle(),
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
    const key = `${jalurId}::${docName}`
    if (attachments[key]?.link || attachments[key]?.fileName) return true
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

    try {
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
    } catch (e) {
      console.warn('Upsert document progress error:', e)
    }
  }

  function handleOpenModal(jalurId: string, docName: string) {
    const key = `${jalurId}::${docName}`
    const existing = attachments[key]
    setModalLink(existing?.link || '')
    setModalFileName(existing?.fileName || '')
    setActiveModal({ jalurId, docName })
  }

  function handleSaveAttachment(e: React.FormEvent) {
    e.preventDefault()
    if (!activeModal || !userId) return
    const key = `${activeModal.jalurId}::${activeModal.docName}`

    const updated = {
      ...attachments,
      [key]: {
        link: modalLink.trim() || undefined,
        fileName: modalFileName.trim() || undefined,
        uploadedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      },
    }

    setAttachments(updated)
    try {
      localStorage.setItem(`otwptn_doc_vault_${userId}`, JSON.stringify(updated))
    } catch {}

    // Automatically mark as done
    if (!isDone(activeModal.jalurId, activeModal.docName)) {
      toggle(activeModal.jalurId, activeModal.docName)
    }

    setActiveModal(null)
  }

  function handleDeleteAttachment(jalurId: string, docName: string) {
    if (!userId) return
    const key = `${jalurId}::${docName}`
    const updated = { ...attachments }
    delete updated[key]
    setAttachments(updated)
    try {
      localStorage.setItem(`otwptn_doc_vault_${userId}`, JSON.stringify(updated))
    } catch {}
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
                    const key = `${j.id}::${doc}`
                    const att = attachments[key]

                    return (
                      <div
                        key={doc}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/60 rounded-2xl px-3 transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-3 text-left flex-1 min-w-0">
                          <button
                            onClick={() => toggle(j.id, doc)}
                            className="mt-0.5 sm:mt-0 flex-shrink-0 cursor-pointer"
                          >
                            {done ? (
                              <CheckCircle2 size={19} className="text-emerald-500" />
                            ) : (
                              <Circle size={19} className="text-gray-300 hover:text-amber-500" />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <span
                              className={`text-xs sm:text-sm font-semibold leading-snug block ${
                                done ? 'text-gray-900 font-bold' : 'text-gray-700'
                              }`}
                            >
                              {doc}
                            </span>

                            {/* Attached Link / File Pill */}
                            {att && (att.link || att.fileName) && (
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {att.link && (
                                  <a
                                    href={att.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10.5px] font-bold transition-colors"
                                  >
                                    <Link2 size={12} />
                                    <span>Buka Link Drive ↗</span>
                                  </a>
                                )}
                                {att.fileName && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10.5px] font-bold">
                                    <FileText size={12} />
                                    <span className="truncate max-w-[140px]">{att.fileName}</span>
                                  </span>
                                )}
                                <span className="text-[10px] text-gray-400">
                                  Tersimpan {att.uploadedAt}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(j.id, doc)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              att && (att.link || att.fileName)
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            <Link2 size={12} />
                            <span>{att && (att.link || att.fileName) ? 'Ubah Berkas' : '+ Tautkan Drive / Upload'}</span>
                          </button>

                          {att && (att.link || att.fileName) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAttachment(j.id, doc)}
                              className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                              title="Hapus tautan berkas"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}

                          <button
                            onClick={() => toggle(j.id, doc)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                              done
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 hover:bg-amber-100 text-gray-700'
                            }`}
                          >
                            {done ? 'Selesai ✓' : 'Tandai Siap'}
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
          Pastikan scan rapor menggunakan format PDF dengan orientasi tegak (portrait), resolusi minimal 150 DPI agar tulisan dan stempel kepala sekolah terbaca jelas. Selalu simpan backup dokumen di Google Drive pribadi dan tempelkan linknya di sini agar tidak tercecer saat pendaftaran dibuka.
        </div>
      </div>

      {/* Attachment Upload / Link Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Link2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-950">Simpan Berkas Dokumen</h3>
                  <p className="text-[11px] text-gray-500 truncate max-w-[260px]">{activeModal.docName}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveAttachment} className="space-y-4 text-xs font-bold text-gray-700">
              {/* Slot 1: Google Drive Link */}
              <div>
                <label className="block mb-1.5 text-gray-900">
                  Tautkan Link Google Drive / Cloud <span className="text-amber-600 font-normal">(Direkomendasikan)</span>
                </label>
                <input
                  type="url"
                  value={modalLink}
                  onChange={e => setModalLink(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view"
                  className="w-full p-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 outline-none focus:bg-white focus:border-amber-400"
                />
                <p className="text-[10px] text-gray-400 mt-1 font-normal">
                  Pastikan akses link Google Drive diatur ke &ldquo;Siapa saja yang memiliki link&rdquo;.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-[10px] uppercase text-gray-400">Atau</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              {/* Slot 2: File Upload (Simpan nama file & metadata) */}
              <div>
                <label className="block mb-1.5 text-gray-900">
                  Upload File Langsung <span className="text-gray-400 font-normal">(PDF / JPG / PNG)</span>
                </label>
                <div className="p-3 rounded-2xl bg-gray-50 border border-dashed border-gray-300 text-center">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) setModalFileName(file.name)
                    }}
                    className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-black file:bg-amber-400 file:text-amber-950 hover:file:bg-amber-300"
                  />
                  {modalFileName && (
                    <p className="mt-2 text-[11px] text-emerald-700 font-bold">
                      ✓ File dipilih: {modalFileName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!modalLink.trim() && !modalFileName.trim()}
                  className="btn-brand-primary px-5 py-2.5 rounded-full text-xs font-black shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  Simpan ke Brankas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
