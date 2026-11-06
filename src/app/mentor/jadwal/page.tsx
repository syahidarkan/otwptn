'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar as CalendarIcon,
  CalendarX,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Save,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function MentorJadwalPage() {
  const [blackoutDates, setBlackoutDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [reason, setReason] = useState('')
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage or profile settings
    try {
      const stored = localStorage.getItem('otwptn_mentor_blackout_dates')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setBlackoutDates(parsed)
      }
    } catch {}
    setLoading(false)
  }, [])

  const handleAddDate = () => {
    if (!selectedDate) return
    if (!blackoutDates.includes(selectedDate)) {
      const updated = [...blackoutDates, selectedDate].sort()
      setBlackoutDates(updated)
      setSelectedDate('')
      setReason('')
      saveDates(updated)
    }
  }

  const handleRemoveDate = (dateToRemove: string) => {
    const updated = blackoutDates.filter(d => d !== dateToRemove)
    setBlackoutDates(updated)
    saveDates(updated)
  }

  const saveDates = (dates: string[]) => {
    setSaving(true)
    try {
      localStorage.setItem('otwptn_mentor_blackout_dates', JSON.stringify(dates))
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (e) {
      console.warn('Gagal menyimpan blackout dates:', e)
    } finally {
      setSaving(false)
    }
  }

  const formatDateIndo = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
              Ketersediaan Jadwal & Blackout
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <ShieldCheck size={14} /> Bebas Atur Kapan Saja
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight">
            Pengaturan Blackout Dates Mentor
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1 max-w-2xl leading-relaxed">
            Tandai tanggal ketika kamu berhalangan melakukan sesi bimbingan 1-on-1 (ujian kampus, kegiatan praktikum, dsb). Tanggal yang ditandai otomatis terkunci dan tidak dapat dipilih oleh mentee saat booking.
          </p>
        </div>

        <Link
          href="/mentor/dashboard"
          className="btn btn-outline text-xs py-2.5 px-5 rounded-full inline-flex items-center gap-1.5 flex-shrink-0"
        >
          Kembali ke Dashboard <ArrowRight size={14} />
        </Link>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form to Add Blackout Date */}
        <div className="p-6 md:p-8 rounded-3xl bg-white shadow-md space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <CalendarX size={18} className="text-rose-500" />
            <h2 className="text-sm font-black text-gray-900">Tambah Tanggal Berhalangan</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                Pilih Tanggal Berhalangan
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                Catatan Alasan (Opsional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Contoh: Ujian Tengah Semester (UTS)"
                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 outline-none focus:border-amber-400"
              />
            </div>

            <button
              onClick={handleAddDate}
              disabled={!selectedDate}
              className="w-full btn-brand-primary py-3 rounded-full text-xs font-black shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus size={15} /> Kunci Tanggal Ini
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/50 space-y-2 text-xs text-amber-900">
            <p className="font-bold flex items-center gap-1.5">
              <Clock size={14} /> Aturan SOP Mentor:
            </p>
            <p className="leading-relaxed text-[11px] text-amber-800">
              Sesuai panduan SOP OtwPTN, harap menandai tanggal berhalangan minimal H-2 sebelum hari H agar mentee tidak memesan slot waktu tersebut secara mendadak.
            </p>
          </div>
        </div>

        {/* Right Column: List of Locked Blackout Dates */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-white shadow-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-amber-500" />
              <h2 className="text-sm font-black text-gray-900">
                Daftar Tanggal Terkunci ({blackoutDates.length})
              </h2>
            </div>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 size={14} /> Tersimpan
              </span>
            )}
          </div>

          {blackoutDates.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
                <CalendarIcon size={22} />
              </div>
              <p className="text-xs font-bold text-gray-700">Belum Ada Tanggal Blackout</p>
              <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                Kamu saat ini berstatus tersedia di semua hari kalender. Tambahkan tanggal di panel sebelah kiri jika ada hari kamu berhalangan.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {blackoutDates.map(dateStr => (
                <div
                  key={dateStr}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                      <CalendarX size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-900">
                        {formatDateIndo(dateStr)}
                      </h4>
                      <span className="text-[11px] font-mono text-gray-400">
                        {dateStr} • Slot Booking Ditutup
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveDate(dateStr)}
                    className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Buka kembali tanggal ini"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
