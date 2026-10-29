'use client'

import { useState } from 'react'
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
  Plus,
  Trash2,
  Save,
  Check,
} from 'lucide-react'

interface BookingSlot {
  id: string
  menteeName: string
  menteeAvatar: string
  school: string
  targetPtn: string
  date: string
  time: string
  topic: string
  meetLink: string
  status: 'Terkonfirmasi' | 'Selesai'
}

export default function MentorJadwalPage() {
  // Blackout dates / Jam berhalangan
  const [blackoutDates, setBlackoutDates] = useState<string[]>([
    '2026-11-04 (Rabu Pagi - Kuliah)',
    '2026-11-08 (Minggu Sore - Acara Keluarga)',
  ])
  const [newBlackoutInput, setNewBlackoutInput] = useState('')

  // Mentee Bookings list
  const [bookings, setBookings] = useState<BookingSlot[]>([
    {
      id: 'b1',
      menteeName: 'Salma Salsabila',
      menteeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      school: 'SMAN 28 Jakarta',
      targetPtn: 'Pendidikan Dokter UI',
      date: 'Sabtu, 31 Okt 2026',
      time: '14:00 - 15:00 WIB',
      topic: 'Bedah Esai Motivasi & Rasionalisasi Nilai Rapor Semester 1-5',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      status: 'Terkonfirmasi',
    },
    {
      id: 'b2',
      menteeName: 'Arkan Danendra',
      menteeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      school: 'SMAN 3 Bandung',
      targetPtn: 'STEI-R ITB',
      date: 'Minggu, 1 Nov 2026',
      time: '19:30 - 20:30 WIB',
      topic: 'Sesi Zoom 1: Kurasi Sertifikat Olimpiade & Kerangka Esai SSU ITB',
      meetLink: 'https://meet.google.com/xyz-uvwx-rst',
      status: 'Terkonfirmasi',
    },
  ])

  function handleAddBlackout() {
    if (!newBlackoutInput.trim()) return
    setBlackoutDates([...blackoutDates, newBlackoutInput.trim()])
    setNewBlackoutInput('')
  }

  function handleRemoveBlackout(idx: number) {
    setBlackoutDates(blackoutDates.filter((_, i) => i !== idx))
  }

  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-white shadow-md space-y-2">
        <h1 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight">
          Jadwal Mentoring & Ketersediaan Mentor
        </h1>
        <p className="text-xs text-gray-500 font-medium">
          Tandai tanggal di mana kamu berhalangan (blackout dates) agar mentee tidak bisa booking di jam tersebut, dan pantau jadwal sesi Google Meet yang sudah terkonfirmasi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* KOLOM KIRI (7 COLS): SESI MENTEE YANG SUDAH BOOKING */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <CalendarIcon size={16} className="text-amber-600" />
              Sesi Mentoring yang Sudah di-Booking ({bookings.length})
            </h2>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Sinkronisasi Google Calendar
            </span>
          </div>

          <div className="space-y-3.5">
            {bookings.map(b => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-gray-50 hover:bg-amber-50/50 transition-colors border border-gray-100/80 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.menteeAvatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover shadow-2xs"
                    />
                    <div>
                      <h4 className="text-xs font-black text-gray-900">{b.menteeName}</h4>
                      <p className="text-[11px] text-gray-400 font-medium">{b.school}</p>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.2 rounded-full">
                        🎯 {b.targetPtn}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                    ✓ {b.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white text-xs space-y-1">
                  <div className="flex items-center gap-2 text-gray-700 font-semibold">
                    <Clock size={13} className="text-amber-600" />
                    <span>{b.date} · {b.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Topik: &ldquo;{b.topic}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={b.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-brand-primary px-4 py-2 rounded-full text-xs font-black shadow-2xs flex items-center gap-1.5"
                  >
                    <Video size={13} /> Masuk Google Meet
                  </a>
                  <button
                    onClick={() => alert(`Tautan meet telah dikirimkan ulang ke mentee ${b.menteeName}!`)}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  >
                    Kirim Ulang Link ke WA
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KOLOM KANAN (5 COLS): BLACKOUT DATES (TANDAI TANGGAL TIDAK BISA) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-md space-y-5">
          <div className="pb-3 border-b border-gray-100">
            <h2 className="text-sm font-black text-gray-900">
              Tandai Tanggal yang Kamu Gabisa (Blackout)
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Slot tanggal yang kamu tambahkan di sini akan otomatis terkunci di kalender mentee.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block">
              Tambah Tanggal / Jam Berhalangan:
            </label>
            <div className="flex items-center gap-2">
              <input
                value={newBlackoutInput}
                onChange={e => setNewBlackoutInput(e.target.value)}
                placeholder="Misal: 2026-11-12 (UTS Kampus UI)"
                className="flex-1 px-4 py-2.5 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none border border-gray-100 focus:border-amber-400"
              />
              <button
                onClick={handleAddBlackout}
                className="btn-brand-primary p-2.5 rounded-2xl shadow-xs"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* List Blackout Dates */}
          <div className="space-y-2.5 pt-2">
            <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider block">
              Daftar Tanggal Berhalangan Aktif:
            </span>

            {blackoutDates.map((date, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs font-bold text-rose-900"
              >
                <span>🚫 {date}</span>
                <button
                  onClick={() => handleRemoveBlackout(idx)}
                  className="text-rose-500 hover:text-rose-700 p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 text-[11px] text-gray-500 font-medium leading-relaxed">
            💡 <strong>Tips Mentor:</strong> Usahakan untuk mengupdate jadwal berhalangan minimal 2 hari sebelumnya agar mentee dapat mengatur waktu bimbingan dengan nyaman.
          </div>
        </div>
      </div>
    </div>
  )
}
