'use client'

import { useState } from 'react'
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
} from 'lucide-react'

interface MentorDuty {
  menteeName: string
  menteeAvatar: string
  school: string
  packageName: string
  duties: { title: string; desc: string; done: boolean; deadline: string }[]
}

const INITIAL_DUTIES: MentorDuty[] = [
  {
    menteeName: 'Salma Salsabila',
    menteeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    school: 'SMAN 28 Jakarta · Target: FK UI',
    packageName: 'Queen Bee (Royal Jelly)',
    duties: [
      { title: 'Inisiasi Grup WA Bertiga (Mentor + Admin + Mentee)', desc: 'Buat grup WhatsApp dan perkenalkan diri dalam 1x24 jam', done: true, deadline: '28 Okt' },
      { title: 'Konsultasi Perdana & Audit Berkas Rapor', desc: 'Sesi online orientasi target prodi dan review 3 sertifikat', done: true, deadline: '29 Okt' },
      { title: 'Koreksi Draf 1 Esai Motivasi (Google Docs)', desc: 'Anotasi kalimat per kalimat dan feedback hook pembuka', done: false, deadline: '31 Okt' },
      { title: 'Susun Dokumen Rekomendasi Analisis Pilihan 1 & 2', desc: 'Kewajiban paket VIP: rekomendasi kuota dan peluang FK UI', done: false, deadline: '2 Nov' },
      { title: 'Simulasi Wawancara 1-on-1 Google Meet', desc: 'Latihan wawancara dan pembekalan berkas final sebelum submit', done: false, deadline: '10 Nov' },
    ],
  },
  {
    menteeName: 'Arkan Danendra',
    menteeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    school: 'SMAN 3 Bandung · Target: STEI-R ITB',
    packageName: 'Honeycomb',
    duties: [
      { title: 'Inisiasi Grup WA Bertiga (Mentor + Admin + Mentee)', desc: 'Setup grup koordinasi bimbingan', done: true, deadline: '27 Okt' },
      { title: 'Panduan Kerangka Dokumen & Esai SSU ITB', desc: 'Struktur esai komputasi dan relevansi OSN', done: true, deadline: '29 Okt' },
      { title: 'Sesi Zoom Mentoring 1 dari 2', desc: 'Diskusi tatap muka 60 menit via Zoom/Meet', done: false, deadline: '1 Nov' },
      { title: 'Putaran Revisi Esai 2 & 3', desc: 'Pemantapan portofolio dan bahasa esai', done: false, deadline: '4 Nov' },
      { title: 'Sesi Zoom Mentoring 2 & Verifikasi Final', desc: 'Pengecekan akhir berkas sebelum submit portal ITB', done: false, deadline: '12 Nov' },
    ],
  },
  {
    menteeName: 'Nabila Putri',
    menteeAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    school: 'SMA Taruna Nusantara · Target: Fisipol UGM',
    packageName: 'Nectar',
    duties: [
      { title: 'Free Konsultasi Awal via Chat WhatsApp', desc: 'Perkenalan dan evaluasi draf esai awal', done: true, deadline: '26 Okt' },
      { title: 'Koreksi Dokumen & 2x Putaran Revisi Esai', desc: 'Bedah esai motivasi Fisipol UGM', done: true, deadline: '29 Okt' },
      { title: 'Final Review & Approval Draf Esai', desc: 'Pemberian persetujuan final dokumen', done: true, deadline: '29 Okt' },
    ],
  },
]

export default function MentorMonitoringPage() {
  const [dutiesList, setDutiesList] = useState<MentorDuty[]>(INITIAL_DUTIES)

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
  const progressPercent = Math.round((completedTasks / totalTasks) * 100)

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
        {dutiesList.map((m, mi) => (
          <div key={mi} className="bg-white rounded-3xl p-6 md:p-8 shadow-md space-y-5">
            {/* Mentee Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.menteeAvatar}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover shadow-2xs"
                />
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
          </div>
        ))}
      </div>
    </div>
  )
}
