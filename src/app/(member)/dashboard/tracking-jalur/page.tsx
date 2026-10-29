'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { JALUR_LIST } from '@/lib/constants'
import { getJalurDocuments } from '@/lib/jalurDocuments'
import FeatureHeader from '@/components/dashboard/FeatureHeader'
import JalurTracker from '@/components/dashboard/JalurTracker'
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
} from 'lucide-react'

interface Checkpoint {
  id: string
  title: string
  desc: string
  timeline: string
  status: 'selesai' | 'sedang-berjalan' | 'akan-datang'
  requiredDocs?: string[]
}

const CHECKPOINTS_DATA: Record<string, Checkpoint[]> = {
  default: [
    {
      id: 'cp-1',
      title: 'Pembuatan Akun & Registrasi Portal',
      desc: 'Daftar akun di portal resmi pendaftaran menggunakan NIK, NISN, dan NPSN sekolah.',
      timeline: 'Minggu ke-1 Pendaftaran',
      status: 'selesai',
    },
    {
      id: 'cp-2',
      title: 'Pengisian Nilai Rapor & Prestasi',
      desc: 'Input nilai rapor semester 1 s.d. 5 skala 100 untuk mata pelajaran wajib dan pendukung prodi tujuan.',
      timeline: 'Minggu ke-2 Pendaftaran',
      status: 'sedang-berjalan',
    },
    {
      id: 'cp-3',
      title: 'Unggah Berkas Persyaratan & Portofolio',
      desc: 'Upload seluruh scan dokumen legalisir, surat rekomendasi, dan portofolio sesuai ketentuan ukuran file.',
      timeline: 'Minggu ke-3 Pendaftaran',
      status: 'sedang-berjalan',
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
  const supabase = createClient()
  const [targetJalurs, setTargetJalurs] = useState<string[]>([])
  const [activeJalurId, setActiveJalurId] = useState<string>('')
  const [completedSteps, setCompletedSteps] = useState<string[]>(['cp-1'])
  const [loading, setLoading] = useState(true)

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
      supabase
        .from('profiles')
        .select('target_jalurs')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          const tj = profile?.target_jalurs ?? []
          if (tj.length > 0) {
            setTargetJalurs(tj)
            setActiveJalurId(tj[0])
          }
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
    setCompletedSteps(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
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
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('profiles').update({ target_jalurs: next }).eq('id', data.user.id)
      }
    })
    // Automatically switch to the newly added jalur
    const newlyAdded = next.find(id => !prev.includes(id))
    if (newlyAdded) {
      setActiveJalurId(newlyAdded)
    } else if (!next.includes(activeJalurId)) {
      setActiveJalurId(next.length > 0 ? next[0] : JALUR_LIST[0].id)
    }
  }

  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10">
      <FeatureHeader
        title="Tracking Jalur Masuk PTN"
        subtitle="Pantau setiap tahapan seleksi, timeline jadwal pendaftaran, dan kelengkapan berkas untuk semua jalur impianmu."
        mascot="/fitur/tracking-jalur.png"
        badgeText="Roadmap Seleksi"
      />

      {/* Interactive Jalur Timeline Road with Real-time Sync */}
      <div className="mb-8">
        <JalurTracker
          targetJalurs={targetJalurs}
          onTargetJalursChange={handleJalursChange}
        />
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status Dokumen</p>
          <p className="text-xl font-black text-gray-900 mt-0.5">{docReqs.documents.length} Berkas</p>
        </div>
      </div>

      {/* Jalur Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6" style={{ scrollbarWidth: 'none' }}>
        {(targetJalurs.length > 0
          ? JALUR_LIST.filter(j => targetJalurs.includes(j.id))
          : JALUR_LIST.slice(0, 5)
        ).map(j => (
          <button
            key={j.id}
            onClick={() => setActiveJalurId(j.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
              activeJalurId === j.id
                ? 'btn-brand-primary'
                : 'bg-white text-gray-700 shadow-xs hover:bg-gray-50'
            }`}
          >
            {j.name} ({j.ptn})
          </button>
        ))}
      </div>

      {/* Main Grid: Checkpoint Steps + Sidebar Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Step-by-Step Checkpoints */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progress Card */}
          <div className="p-6 rounded-3xl bg-white shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Progres Pendaftaran
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

        {/* Right 1 Col: Quick Requirements & Document Sync */}
        <div className="space-y-6">
          {/* Document Requirements Card */}
          <div className="p-6 rounded-3xl bg-white shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-amber-500" />
                <h3 className="text-sm font-extrabold text-gray-900">Dokumen Wajib</h3>
              </div>
              <Link
                href="/dashboard/dokumen"
                className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
              >
                Penyimpanan <ChevronRight size={14} />
              </Link>
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

            <Link
              href="/dashboard/dokumen"
              className="w-full py-2.5 rounded-full text-xs font-extrabold btn-brand-primary text-center inline-flex items-center justify-center gap-1.5"
            >
              Buka Checklist Dokumen <ArrowRight size={14} />
            </Link>
          </div>

          {/* Need Help CTA */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-amber-600" />
              <h3 className="text-sm font-extrabold text-gray-900">Butuh Bantuan Essay?</h3>
            </div>
            <p className="text-xs text-gray-700 font-medium leading-relaxed mb-4">
              Gunakan Essay AI Review untuk mengecek struktur esai motivasimu atau konsultasikan langsung dengan alumni mentor.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard/essay"
                className="w-full py-2 rounded-full text-xs font-extrabold btn-brand-dark text-center"
              >
                Coba Essay AI Review
              </Link>
              <Link
                href="/dashboard/mentor"
                className="w-full py-2 rounded-full text-xs font-extrabold btn-brand-primary text-center"
              >
                Konsultasi Alumni PTN
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
