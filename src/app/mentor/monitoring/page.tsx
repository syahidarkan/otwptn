'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Video,
  MessageCircle,
  Sparkles,
  Users,
  Crown,
  ArrowRight,
} from 'lucide-react'

interface MentorDuty {
  mentoringId?: string
  menteeName: string
  menteeAvatar: string
  school: string
  packageName: string
  duties: { title: string; desc: string; done: boolean; deadline: string }[]
}

const PACKAGE_LABELS: Record<string, string> = {
  review: 'Nectar',
  dokumen: 'Honeycomb',
  menyeluruh: 'Royal Jelly',
  intensif: 'Royal Jelly',
}

export default function MentorMonitoringPage() {
  const [dutiesList, setDutiesList] = useState<MentorDuty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/mentor/mentees')
      .then(res => res.json())
      .then(data => {
        if (data.mentees && Array.isArray(data.mentees)) {
          const mapped: MentorDuty[] = data.mentees.map((rec: {
            id: string
            tier: string
            wa_group_link?: string
            checklist?: { task: string; done: boolean }[]
            profiles?: {
              full_name?: string
              avatar_url?: string
              school_name?: string
              target_ptns?: string[]
            }
          }) => {
            const p = rec.profiles
            const defaultDuties = [
              { title: 'Inisiasi Grup WA Bertiga (Mentor + Admin + Mentee)', desc: 'Buat grup WhatsApp dan perkenalkan diri dalam 1x24 jam', done: !!rec.wa_group_link, deadline: 'H+1' },
              { title: 'Konsultasi Perdana & Audit Berkas Rapor', desc: 'Sesi online orientasi target prodi dan review berkas prestasi', done: false, deadline: 'H+3' },
              { title: 'Koreksi Draf 1 Esai Motivasi', desc: 'Anotasi kalimat per kalimat dan feedback hook pembuka', done: false, deadline: 'H+5' },
              { title: 'Sesi Mentoring Zoom / Google Meet', desc: 'Diskusi privat 1-on-1 dan pembahasan esai', done: false, deadline: 'Jadwal Meet' },
              { title: 'Review Final & Verifikasi Berkas', desc: 'Pengecekan akhir berkas sebelum submit pendaftaran PTN', done: false, deadline: 'Finalisasi' },
            ]
            return {
              mentoringId: rec.id,
              menteeName: p?.full_name ?? 'Mentee',
              menteeAvatar: p?.avatar_url ?? '',
              school: `${p?.school_name ?? '-'} · Target: ${p?.target_ptns?.[0] ?? '-'}`,
              packageName: PACKAGE_LABELS[rec.tier] ?? rec.tier,
              duties: defaultDuties,
            }
          })
          setDutiesList(mapped)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleToggleDuty(menteeIdx: number, dutyIdx: number) {
    const updated = [...dutiesList]
    updated[menteeIdx].duties[dutyIdx].done = !updated[menteeIdx].duties[dutyIdx].done
    setDutiesList(updated)
  }

  const totalTasks = dutiesList.reduce((acc, m) => acc + m.duties.length, 0)
  const completedTasks = dutiesList.reduce(
    (acc, m) => acc + m.duties.filter(d => d.done).length,
    0
  )
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight">
            Checklist Monitoring Kewajiban Mentor
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Pastikan seluruh kewajiban bimbingan (grup WA bertiga, sesi Zoom/Meet, revisi esai, dan rekomendasi pilihan jurusan) terselesaikan tepat waktu.
          </p>
        </div>

        {/* Overall Progress Box */}
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/50 min-w-[220px] text-center space-y-1">
          <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
            Total Progres Kewajiban
          </span>
          <p className="text-3xl font-black text-amber-950 font-mono">{progressPercent}%</p>
          <p className="text-xs font-bold text-amber-800">
            {completedTasks} dari {totalTasks} Kewajiban Selesai
          </p>
        </div>
      </div>

      {/* Per Mentee Duty Cards */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-8 rounded-3xl bg-white shadow-md text-center text-xs text-gray-400">
            Memuat data mentee...
          </div>
        ) : dutiesList.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white shadow-md text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Users size={24} />
            </div>
            <h3 className="text-sm font-black text-gray-950">Belum Ada Mentee yang Ditugaskan</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Saat ada mentee baru yang mendaftar paket bimbingan dan diverifikasi admin, daftar kewajiban dan tugas mentoring kamu akan muncul otomatis di sini.
            </p>
          </div>
        ) : (
          dutiesList.map((m, mi) => (
            <div key={mi} className="bg-white rounded-3xl p-6 md:p-8 shadow-md space-y-5">
              {/* Mentee Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center flex-shrink-0">
                    {m.menteeAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.menteeAvatar} alt="" className="w-12 h-12 rounded-full object-cover shadow-2xs" />
                    ) : (
                      m.menteeName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-950">{m.menteeName}</h3>
                    <p className="text-xs text-gray-500 font-medium">{m.school}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-900">
                    Paket {m.packageName}
                  </span>
                  <span className="text-xs font-bold text-gray-500">
                    {m.duties.filter(d => d.done).length}/{m.duties.length} Selesai
                  </span>
                </div>
              </div>

              {/* Checklist Duties */}
              <div className="space-y-2.5">
                {m.duties.map((duty, di) => (
                  <div
                    key={di}
                    onClick={() => handleToggleDuty(mi, di)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all flex items-start justify-between gap-4 border ${
                      duty.done
                        ? 'bg-emerald-50/50 border-emerald-100'
                        : 'bg-gray-50/60 border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={duty.done}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <h4
                          className={`text-xs font-black ${
                            duty.done ? 'line-through text-gray-400' : 'text-gray-900'
                          }`}
                        >
                          {duty.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          {duty.desc}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap bg-white px-2.5 py-1 rounded-lg shadow-2xs">
                      Deadline: {duty.deadline}
                    </span>
                  </div>
                ))}
              </div>

              {m.packageName === 'Royal Jelly' && (
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Crown size={14} className="text-amber-600" /> Wajib: Audit Rapor &amp; Analisis Linieritas Mentor
                  </span>
                  <Link
                    href="/mentor/dashboard"
                    className="btn-brand-primary px-4 py-2 rounded-full text-xs font-black inline-flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
                  >
                    Buka Detail &amp; Input Audit Rapor <ArrowRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
