'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { JALUR_LIST } from '@/lib/constants'
import { getJalurDocuments, type DocConfidence } from '@/lib/jalurDocuments'
import FeatureHeader from '@/components/dashboard/FeatureHeader'
import JalurTracker from '@/components/dashboard/JalurTracker'
import { useToast } from '@/components/ui/useToast'
import { completeQuest } from '@/lib/gamification'
import {
  saveDocToLocalVault,
  getDocFromLocalVault,
  deleteDocFromLocalVault,
  formatFileSize,
} from '@/lib/localFileVault'
import {
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  FileText,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Upload,
  FolderLock,
  Link2,
  Trash2,
  X,
  Download,
  HardDrive,
  Check,
  Search,
  ShieldCheck,
  Layers,
} from 'lucide-react'

interface Checkpoint {
  id: string
  title: string
  desc: string
  timeline: string
  status: 'selesai' | 'sedang-berjalan' | 'akan-datang'
  requiredDocs?: string[]
}

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
  fileSize?: number
  isLocalDevice?: boolean
  uploadedAt: string
}

const CHECKPOINTS_DATA: Record<string, Checkpoint[]> = {
  default: [
    {
      id: 'cp-1',
      title: 'Pembuatan Akun & Registrasi Portal',
      desc: 'Daftar akun di portal resmi pendaftaran menggunakan NIK, NISN, dan NPSN sekolah.',
      timeline: 'Minggu ke-1 Pendaftaran',
      status: 'akan-datang',
    },
    {
      id: 'cp-2',
      title: 'Pengisian Nilai Rapor & Prestasi',
      desc: 'Input nilai rapor semester 1 s.d. 5 skala 100 untuk mata pelajaran wajib dan pendukung prodi tujuan.',
      timeline: 'Minggu ke-2 Pendaftaran',
      status: 'akan-datang',
    },
    {
      id: 'cp-3',
      title: 'Unggah Berkas Persyaratan & Portofolio',
      desc: 'Upload seluruh scan dokumen legalisir, surat rekomendasi, dan portofolio sesuai ketentuan ukuran file.',
      timeline: 'Minggu ke-3 Pendaftaran',
      status: 'akan-datang',
    },
    {
      id: 'cp-4',
      title: 'Penulisan & Review Essay Motivasi',
      desc: 'Tulis essay atau motivation letter yang terstruktur menjawab prompt resmi, lalu review bersama Otbee / Mentor.',
      timeline: 'Minggu ke-3 Pendaftaran',
      status: 'akan-datang',
    },
    {
      id: 'cp-5',
      title: 'Finalisasi & Cetak Kartu Tanda Peserta',
      desc: 'Cek ulang seluruh isian data sebelum mengunci pendaftaran (permanen) dan mencetak kartu bukti peserta.',
      timeline: 'Batas Akhir Penutupan',
      status: 'akan-datang',
    },
    {
      id: 'cp-6',
      title: 'Verifikasi Berkas & Sidang Pleno PTN',
      desc: 'Panitia seleksi PTN melakukan verifikasi nilai rapor, keabsahan sertifikat, dan penilaian essay calon mahasiswa.',
      timeline: 'Masa Evaluasi Panitia',
      status: 'akan-datang',
    },
    {
      id: 'cp-7',
      title: 'Pengumuman Kelulusan & Registrasi Ulang',
      desc: 'Akses pengumuman hasil seleksi melalui portal resmi dan persiapkan dokumen registrasi ulang serta UKT.',
      timeline: 'Hari Pengumuman',
      status: 'akan-datang',
    },
  ],
}

export default function TrackingJalurPage() {
  const { showToast, toastHost } = useToast()
  const supabase = createClient()
  const [targetJalurs, setTargetJalurs] = useState<string[]>([])
  const [activeJalurId, setActiveJalurId] = useState<string>('')
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // Sub-view: Timeline vs Dokumen Storage
  const [viewTab, setViewTab] = useState<'timeline' | 'dokumen'>('timeline')

  // Document vault states
  const [docProgress, setDocProgress] = useState<ProgressRow[]>([])
  const [attachments, setAttachments] = useState<Record<string, DocAttachment>>({})
  const [docSearch, setDocSearch] = useState('')
  const [activeModal, setActiveModal] = useState<{ jalurId: string; docName: string } | null>(null)
  const [modalLink, setModalLink] = useState('')
  const [modalFileName, setModalFileName] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingUploadDoc, setPendingUploadDoc] = useState<{ jalurId: string; docName: string } | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('otwptn_target_jalurs')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTargetJalurs(parsed)
          setActiveJalurId(parsed[0])
        }
      }
    } catch {}

    supabase.auth.getUser().then(({ data }) => {
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

      Promise.all([
        supabase.from('profiles').select('target_jalurs').eq('id', data.user.id).maybeSingle(),
        supabase.from('jalur_checkpoint_progress').select('jalur_id, completed_checkpoint_ids').eq('user_id', data.user.id),
        supabase.from('jalur_document_progress').select('jalur_id, doc_name, completed').eq('user_id', data.user.id),
      ]).then(([profileRes, progressRes, docProgRes]) => {
        const tj = profileRes.data?.target_jalurs ?? []
        if (tj.length > 0) {
          setTargetJalurs(tj)
          const firstJalur = tj[0]
          setActiveJalurId(firstJalur)
          const progress = progressRes.data?.find((p: { jalur_id: string }) => p.jalur_id === firstJalur)
          if (progress?.completed_checkpoint_ids?.length) {
            setCompletedSteps(progress.completed_checkpoint_ids)
          }
        }
        if (docProgRes.data) {
          setDocProgress(docProgRes.data)
        }
        completeQuest('q-tracking')
        setLoading(false)
      })
    })
  }, [supabase])

  const currentJalur = useMemo(
    () => JALUR_LIST.find(j => j.id === activeJalurId) ?? JALUR_LIST[0],
    [activeJalurId]
  )

  const docReqs = useMemo(
    () => getJalurDocuments(currentJalur.id, currentJalur.category),
    [currentJalur]
  )

  const checkpoints = CHECKPOINTS_DATA[currentJalur.id] ?? CHECKPOINTS_DATA.default

  function toggleStep(id: string) {
    setCompletedSteps(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      if (userId && activeJalurId) {
        supabase.from('jalur_checkpoint_progress').upsert({
          user_id: userId,
          jalur_id: activeJalurId,
          completed_checkpoint_ids: next,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,jalur_id' }).then(() => {})
      }
      return next
    })
  }

  const progressPercent = Math.round(
    (completedSteps.length / checkpoints.length) * 100
  )

  function handleJalursChange(next: string[]) {
    const prev = targetJalurs
    setTargetJalurs(next)
    try {
      localStorage.setItem('otwptn_target_jalurs', JSON.stringify(next))
    } catch {}
    if (userId) {
      supabase.from('profiles').update({ target_jalurs: next }).eq('id', userId)
    }
    const newlyAdded = next.find(id => !prev.includes(id))
    if (newlyAdded) {
      setActiveJalurId(newlyAdded)
    } else if (!next.includes(activeJalurId)) {
      setActiveJalurId(next.length > 0 ? next[0] : JALUR_LIST[0].id)
    }
  }

  // --- Document Storage Vault Operations ---
  function isDocDone(jalurId: string, docName: string) {
    const key = `${jalurId}::${docName}`
    if (attachments[key]?.link || attachments[key]?.fileName) return true
    return docProgress.some(p => p.jalur_id === jalurId && p.doc_name === docName && p.completed)
  }

  async function toggleDoc(jalurId: string, docName: string) {
    if (!userId) return
    const current = isDocDone(jalurId, docName)
    setDocProgress(prev => {
      const exists = prev.find(p => p.jalur_id === jalurId && p.doc_name === docName)
      if (exists) {
        return prev.map(p =>
          p.jalur_id === jalurId && p.doc_name === docName ? { ...p, completed: !current } : p
        )
      }
      return [...prev, { jalur_id: jalurId, doc_name: docName, completed: !current }]
    })

    await supabase.from('jalur_document_progress').upsert({
      user_id: userId,
      jalur_id: jalurId,
      doc_name: docName,
      completed: !current,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,jalur_id,doc_name' })
  }

  function handleSaveLink() {
    if (!activeModal || !userId) return
    const key = `${activeModal.jalurId}::${activeModal.docName}`
    const updated = {
      ...attachments,
      [key]: {
        ...attachments[key],
        link: modalLink.trim() || undefined,
        fileName: modalFileName.trim() || attachments[key]?.fileName || undefined,
        uploadedAt: new Date().toISOString(),
      },
    }
    setAttachments(updated)
    try {
      localStorage.setItem(`otwptn_doc_vault_${userId}`, JSON.stringify(updated))
    } catch {}

    if (!docProgress.some(p => p.jalur_id === activeModal.jalurId && p.doc_name === activeModal.docName && p.completed)) {
      toggleDoc(activeModal.jalurId, activeModal.docName)
    }

    showToast('Tautan dokumen berhasil disimpan!')
    setActiveModal(null)
    setModalLink('')
    setModalFileName('')
  }

  function handleTriggerUpload(jalurId: string, docName: string) {
    setPendingUploadDoc({ jalurId, docName })
    fileInputRef.current?.click()
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !pendingUploadDoc || !userId) return

    if (file.size > 15 * 1024 * 1024) {
      showToast('Ukuran file maksimal 15MB.')
      e.target.value = ''
      return
    }

    try {
      await saveDocToLocalVault(userId, pendingUploadDoc.jalurId, pendingUploadDoc.docName, file)
      const key = `${pendingUploadDoc.jalurId}::${pendingUploadDoc.docName}`
      const updated = {
        ...attachments,
        [key]: {
          ...attachments[key],
          fileName: file.name,
          fileSize: file.size,
          isLocalDevice: true,
          uploadedAt: new Date().toISOString(),
        },
      }
      setAttachments(updated)
      try {
        localStorage.setItem(`otwptn_doc_vault_${userId}`, JSON.stringify(updated))
      } catch {}

      if (!docProgress.some(p => p.jalur_id === pendingUploadDoc.jalurId && p.doc_name === pendingUploadDoc.docName && p.completed)) {
        toggleDoc(pendingUploadDoc.jalurId, pendingUploadDoc.docName)
      }
      showToast(`Berkas "${file.name}" berhasil disimpan di Local Vault!`)
    } catch (err) {
      console.error(err)
      showToast('Gagal menyimpan file ke penyimpanan lokal.')
    } finally {
      e.target.value = ''
      setPendingUploadDoc(null)
    }
  }

  async function handleDownloadFile(jalurId: string, docName: string) {
    if (!userId) return
    const file = await getDocFromLocalVault(userId, jalurId, docName)
    if (!file) {
      showToast('File tidak ditemukan di penyimpanan lokal perangkat ini.')
      return
    }
    const url = URL.createObjectURL(file.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleDeleteAttachment(jalurId: string, docName: string) {
    if (!userId) return
    const key = `${jalurId}::${docName}`
    await deleteDocFromLocalVault(userId, jalurId, docName)
    const updated = { ...attachments }
    delete updated[key]
    setAttachments(updated)
    try {
      localStorage.setItem(`otwptn_doc_vault_${userId}`, JSON.stringify(updated))
    } catch {}
    showToast('Lampiran dokumen dihapus.')
  }

  const filteredDocs = docReqs.documents.filter(d =>
    !docSearch || d.toLowerCase().includes(docSearch.toLowerCase())
  )

  const docCompletedCount = docReqs.documents.filter(d => isDocDone(currentJalur.id, d)).length

  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10 space-y-6">
      {toastHost}
      <FeatureHeader
        title="Tracking Jalur & Dokumen Seleksi"
        subtitle="Pantau alur tahapan seleksi, timeline pendaftaran, dan kelola slot penyimpanan dokumen persyaratan resmi PTN dalam 1 halaman."
        mascot="/fitur/tracking-jalur.png"
        badgeText="Roadmap & Vault"
      />

      {/* Interactive Jalur Timeline Road */}
      <div className="mb-2">
        <JalurTracker
          targetJalurs={targetJalurs}
          onTargetJalursChange={handleJalursChange}
        />
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white shadow-xs">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Jalur Diikuti</p>
          <p className="text-xl font-black text-gray-900 mt-0.5">{targetJalurs.length} Jalur</p>
        </div>
        <div className="p-4 rounded-3xl bg-white shadow-xs">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Jalur Terpilih</p>
          <p className="text-sm font-extrabold text-amber-600 truncate mt-1">{currentJalur.name}</p>
        </div>
        <div className="p-4 rounded-3xl bg-white shadow-xs">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Progres Tahapan</p>
          <p className="text-xl font-black text-emerald-600 mt-0.5">{progressPercent}% Selesai</p>
        </div>
        <div className="p-4 rounded-3xl bg-white shadow-xs">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Kesiapan Berkas</p>
          <p className="text-xl font-black text-amber-600 mt-0.5">{docCompletedCount} / {docReqs.documents.length} Siap</p>
        </div>
      </div>

      {/* Jalur Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {(targetJalurs.length > 0
          ? JALUR_LIST.filter(j => targetJalurs.includes(j.id))
          : JALUR_LIST.slice(0, 5)
        ).map(j => (
          <button
            key={j.id}
            onClick={() => {
              setActiveJalurId(j.id)
              setCompletedSteps([])
              if (userId) {
                supabase.from('jalur_checkpoint_progress')
                  .select('completed_checkpoint_ids')
                  .eq('user_id', userId)
                  .eq('jalur_id', j.id)
                  .maybeSingle()
                  .then(({ data: progress }) => {
                    if (progress?.completed_checkpoint_ids?.length) {
                      setCompletedSteps(progress.completed_checkpoint_ids)
                    }
                  })
              }
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
              activeJalurId === j.id
                ? 'btn-brand-primary shadow-xs'
                : 'bg-white text-gray-700 shadow-2xs hover:bg-gray-50'
            }`}
          >
            {j.name} ({j.ptn})
          </button>
        ))}
      </div>

      {/* VIEW SUB-NAV TABS: Timeline vs Dokumen */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewTab('timeline')}
            className={`px-5 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
              viewTab === 'timeline'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-2xs'
            }`}
          >
            <Clock size={14} />
            <span>Tahapan & Timeline Seleksi ({progressPercent}%)</span>
          </button>
          <button
            onClick={() => setViewTab('dokumen')}
            className={`px-5 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
              viewTab === 'dokumen'
                ? 'bg-amber-400 text-amber-950 shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-2xs'
            }`}
          >
            <FolderLock size={14} />
            <span>Penyimpanan Dokumen & Berkas ({docCompletedCount}/{docReqs.documents.length})</span>
          </button>
        </div>

        {viewTab === 'dokumen' && (
          <div className="relative min-w-[220px] hidden sm:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={docSearch}
              onChange={e => setDocSearch(e.target.value)}
              placeholder="Cari nama dokumen..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-900 outline-none"
            />
          </div>
        )}
      </div>

      {/* HIDDEN FILE INPUT FOR VAULT UPLOADS */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        className="hidden"
        onChange={onFileSelected}
      />

      {/* =====================================================================
          TAB 1: TIMELINE & CHECKPOINTS ROADMAP
          ===================================================================== */}
      {viewTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Step-by-Step Checkpoints */}
          <div className="lg:col-span-2 space-y-4">
            {/* Progress Card */}
            <div className="p-6 rounded-3xl bg-white shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Progres Tahapan Pendaftaran
                  </span>
                  <h2 className="text-lg font-extrabold text-gray-900">{currentJalur.name}</h2>
                </div>
                <span className="text-sm font-black text-amber-600 bg-amber-50 px-3.5 py-1 rounded-full">
                  {progressPercent}% Selesai
                </span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden bg-gray-100">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, #ffd700 0%, #f59e0b 100%)',
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                {completedSteps.length} dari {checkpoints.length} tahapan telah kamu selesaikan
              </p>
            </div>

            {/* Checkpoint Steps List */}
            <div className="space-y-3">
              {checkpoints.map((cp, idx) => {
                const isDone = completedSteps.includes(cp.id)
                return (
                  <div
                    key={cp.id}
                    onClick={() => toggleStep(cp.id)}
                    className={`p-5 rounded-3xl bg-white shadow-md transition-all cursor-pointer flex items-start gap-4 hover-lift ${
                      isDone ? 'opacity-90' : ''
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isDone ? (
                        <CheckCircle2 size={22} className="text-emerald-500" />
                      ) : (
                        <Circle size={22} className="text-gray-300 hover:text-amber-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          Tahap 0{idx + 1} · {cp.timeline}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {isDone ? 'Selesai' : 'Perlu Dikerjakan'}
                        </span>
                      </div>
                      <h3
                        className={`text-sm font-extrabold text-gray-900 leading-snug mb-1 ${
                          isDone ? 'line-through text-gray-400' : ''
                        }`}
                      >
                        {cp.title}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">
                        {cp.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right 1 Col: Quick Requirements & Document Peek */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-amber-500" />
                  <h3 className="text-sm font-extrabold text-gray-900">Dokumen Wajib</h3>
                </div>
                <button
                  onClick={() => setViewTab('dokumen')}
                  className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
                >
                  Buka Vault <ChevronRight size={14} />
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-4 font-medium">
                Persyaratan dokumen resmi untuk <strong>{currentJalur.name}</strong>:
              </p>

              <ul className="space-y-2.5 mb-6 text-xs text-gray-700">
                {docReqs.documents.slice(0, 5).map((doc, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
                {docReqs.documents.length > 5 && (
                  <li className="text-[11px] font-semibold text-gray-400 italic">
                    +{docReqs.documents.length - 5} dokumen lainnya
                  </li>
                )}
              </ul>

              <button
                onClick={() => setViewTab('dokumen')}
                className="w-full py-2.5 rounded-full text-xs font-extrabold btn-brand-primary text-center inline-flex items-center justify-center gap-1.5"
              >
                Buka & Unggah Berkas <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: PENYIMPANAN DOKUMEN & CHECKLIST BERKAS
          ===================================================================== */}
      {viewTab === 'dokumen' && (
        <div className="space-y-6">
          {/* Header Vault Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                Vault Dokumen Terenkripsi Local Device
              </span>
              <h2 className="text-xl md:text-2xl font-black text-gray-900">
                Berkas Persyaratan {currentJalur.name} ({currentJalur.ptn})
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Simpan scan sertifikat, rapor, surat rekomendasi, atau tautan Google Drive langsung di slot per dokumen.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/60 min-w-[200px] text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                Kesiapan Berkas
              </span>
              <p className="text-2xl font-black text-amber-950 font-mono">
                {docCompletedCount} / {docReqs.documents.length}
              </p>
              <p className="text-[11px] font-bold text-amber-800">
                {Math.round((docCompletedCount / Math.max(1, docReqs.documents.length)) * 100)}% Berkas Siap
              </p>
            </div>
          </div>

          {/* List of Documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocs.map((docName, idx) => {
              const done = isDocDone(currentJalur.id, docName)
              const key = `${currentJalur.id}::${docName}`
              const att = attachments[key]
              const conf = docReqs.confidence ?? 'generik'
              const confBadge = CONFIDENCE_LABEL[conf]

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-3xl bg-white shadow-md border transition-all flex flex-col justify-between space-y-3 ${
                    done ? 'border-emerald-200 bg-emerald-50/20' : 'border-gray-100'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => toggleDoc(currentJalur.id, docName)}
                          className="mt-0.5 text-gray-400 hover:text-emerald-600 transition-colors"
                        >
                          {done ? (
                            <CheckCircle2 size={20} className="text-emerald-500" />
                          ) : (
                            <Circle size={20} />
                          )}
                        </button>
                        <div>
                          <h4 className={`text-xs font-black ${done ? 'text-gray-900' : 'text-gray-800'}`}>
                            {docName}
                          </h4>
                          <span
                            className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{ color: confBadge.color, backgroundColor: confBadge.bg }}
                          >
                            {confBadge.label}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        done ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {done ? 'Siap' : 'Belum'}
                      </span>
                    </div>

                    {/* Attached file / link badge */}
                    {att && (
                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5 text-xs">
                        {att.fileName && (
                          <div className="flex items-center justify-between text-gray-800 font-semibold">
                            <span className="truncate flex items-center gap-1.5">
                              <HardDrive size={13} className="text-amber-600 flex-shrink-0" />
                              {att.fileName}
                              {att.fileSize && (
                                <span className="text-[10px] text-gray-400 font-normal">
                                  ({formatFileSize(att.fileSize)})
                                </span>
                              )}
                            </span>
                            <div className="flex items-center gap-1">
                              {att.isLocalDevice && (
                                <button
                                  onClick={() => handleDownloadFile(currentJalur.id, docName)}
                                  title="Unduh berkas"
                                  className="p-1 hover:bg-gray-200 rounded text-gray-600"
                                >
                                  <Download size={13} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAttachment(currentJalur.id, docName)}
                                title="Hapus berkas"
                                className="p-1 hover:bg-rose-100 rounded text-rose-600"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                        {att.link && (
                          <div className="flex items-center justify-between text-sky-800 font-semibold">
                            <a
                              href={att.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate flex items-center gap-1.5 hover:underline"
                            >
                              <Link2 size={13} className="text-sky-600 flex-shrink-0" />
                              {att.link}
                            </a>
                            <ExternalLink size={12} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action buttons: Upload file & Link Drive */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs">
                    <button
                      onClick={() => handleTriggerUpload(currentJalur.id, docName)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <Upload size={12} /> Unggah File
                    </button>
                    <button
                      onClick={() => {
                        setActiveModal({ jalurId: currentJalur.id, docName })
                        setModalLink(att?.link || '')
                        setModalFileName(att?.fileName || '')
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <Link2 size={12} /> Tautkan Drive
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* MODAL LINK DRIVE / CLOUD URL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Tautan Cloud Storage
                </span>
                <h3 className="text-base font-black text-gray-950 mt-1">
                  {activeModal.docName}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Masukkan tautan Google Drive, Dropbox, atau folder cloud berkas untuk dokumen ini.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Nama Label File (opsional)
                </label>
                <input
                  value={modalFileName}
                  onChange={e => setModalFileName(e.target.value)}
                  placeholder="Contoh: Sertifikat_OSN_Biologi.pdf"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Tautan Google Drive / Cloud URL *
                </label>
                <input
                  value={modalLink}
                  onChange={e => setModalLink(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSaveLink}
                className="btn-brand-primary flex-1 py-2.5 rounded-full text-xs font-black shadow-xs"
              >
                Simpan Tautan Dokumen
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
