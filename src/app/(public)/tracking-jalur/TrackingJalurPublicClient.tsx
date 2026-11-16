'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Search,
  Bell,
  CheckSquare,
} from 'lucide-react'
import AuthGateModal from '@/components/auth/AuthGateModal'

const JALUR_ITEMS = [
  {
    id: 'snbp-2026',
    name: 'SNBP 2026 (Seleksi Nasional Berdasarkan Prestasi)',
    ptn: 'Seluruh PTN Nasional',
    status: 'Jadwal Aktif',
    deadline: 'Januari - Februari 2026',
    requirements: ['Nilai Rapor Semester 1-5', 'Akreditasi Sekolah', 'Maksimal 3 Sertifikat Puspresnas / Linier'],
    highlight: 'Kuota 40% (Akred A), 25% (Akred B)',
  },
  {
    id: 'ppkb-ui',
    name: 'PPKB UI 2026 (Program Pemerataan Kesempatan Belajar)',
    ptn: 'Universitas Indonesia (UI)',
    status: 'Segera Dibuka',
    deadline: 'Maret - April 2026',
    requirements: ['Essay Motivasi Khusus UI', 'Rapor Semester 1-5 Konsisten', 'Rekomendasi Kepala Sekolah'],
    highlight: 'Jalur Rapor Mandiri Tanpa Uang Pangkal IPI',
  },
  {
    id: 'pbub-ugm',
    name: 'PBUB UGM (Penelusuran Bibit Unggul Berprestasi)',
    ptn: 'Universitas Gadjah Mada (UGM)',
    status: 'Segera Dibuka',
    deadline: 'Maret - Mei 2026',
    requirements: ['Sertifikat Juara 1/2/3 Provinsi/Nasional', 'Portofolio Bakat / Seni / Olahraga / IPTEK'],
    highlight: 'Tersedia PBUB Tidak Mampu (Gratis UKT)',
  },
  {
    id: 'sjp-ipb',
    name: 'SJP IPB (Seleksi Ketua OSIS & Prestasi)',
    ptn: 'IPB University',
    status: 'Segera Dibuka',
    deadline: 'Februari - April 2026',
    requirements: ['Surat Keputusan (SK) Ketua OSIS / MPK', 'Nilai Rapor Matematika & Sains', 'Pelatihan Kepemimpinan'],
    highlight: 'Peluang Lolos Khusus Aktivis Organisasi',
  },
  {
    id: 'golden-ticket-unair',
    name: 'Golden Ticket UNAIR (Prestasi Luar Biasa)',
    ptn: 'Universitas Airlangga',
    status: 'Segera Dibuka',
    deadline: 'Februari 2026',
    requirements: ['Juara Internasional / Nasional', 'Hafidz Qur\'an / Ketua OSIS', 'Pilihan 1 UNAIR'],
    highlight: 'Pengumuman Mendahului Jalur Mandiri Lainnya',
  },
]

export default function TrackingJalurPublicClient() {
  const [selectedJalur, setSelectedJalur] = useState<string>('snbp-2026')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenGate = (jalurName: string) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'otwptn_pending_tracking',
          JSON.stringify({
            jalurName,
            timestamp: new Date().toISOString(),
          })
        )
      }
    } catch (e) {}

    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-amber-300 selection:text-neutral-950">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-28 pb-14 px-4 sm:px-6 lg:px-8 border-b border-gray-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/70 via-amber-50/30 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300/80 text-amber-900 text-xs font-black uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            Kalender & Deadline Seleksi Non-Tes PTN 2025/2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Pantau Deadline & Persyaratan <span className="text-amber-500">40+ Jalur Non-Tes PTN</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Jangan sampai gugur sebelum bertanding karena terlambat upload berkas atau salah format sertifikat. Kelola seluruh timeline seleksi dalam satu tempat.
          </p>
        </div>
      </section>

      {/* Main Trackers List */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="space-y-5">
          {JALUR_ITEMS.map((item) => (
            <div
              key={item.id}
              className="p-6 sm:p-7 rounded-3xl bg-white border border-gray-200 hover:border-amber-300 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-3xs">
                    {item.ptn}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-3xs">
                    {item.status}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-gray-900">{item.name}</h3>

                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Estimasi Deadline: <strong className="text-gray-900">{item.deadline}</strong></span>
                </div>

                <div className="pt-2">
                  <span className="text-xs text-gray-500 block mb-1.5 font-bold">Berkas Persyaratan Utama:</span>
                  <div className="flex flex-wrap gap-2">
                    {item.requirements.map((req, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-3 flex-shrink-0">
                <button
                  onClick={() => handleOpenGate(item.name)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs sm:text-sm transition-all shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span>Pasang Alarm & Checklist</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Callout */}
        <div className="mt-12 text-center p-8 rounded-3xl bg-amber-50/60 border border-amber-200/80">
          <h3 className="text-lg font-black text-gray-900 mb-2">Ingin Simpan Dokumen Persyaratan di Cloud Aman?</h3>
          <p className="text-xs text-gray-600 max-w-md mx-auto mb-5 leading-relaxed font-medium">
            Di dashboard member, kamu bisa mengunggah rapor, sertifikat, dan draf essay dalam brankas digital yang langsung diverifikasi AI.
          </p>
          <button
            onClick={() => handleOpenGate('Seluruh Jalur Non-Tes PTN')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm text-xs font-black transition-all cursor-pointer"
          >
            <span>Buka Seluruh 40+ Jalur di Dashboard</span>
            <ArrowRight className="w-4 h-4 text-amber-500" />
          </button>
        </div>
      </section>

      {/* Auth Gate Modal Handover */}
      <AuthGateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Aktifkan Notifikasi & Checklist Berkas!"
        subtitle="Jalur pilihanmu sudah tersimpan. Masuk atau buat akun gratis untuk mengaktifkan notifikasi deadline via WhatsApp dan checklist kelengkapan berkas."
        featureBadge="Tracking Jalur Non-Tes"
        redirectPath="/dashboard/tracking-jalur"
        payloadPreview={[
          { label: 'Jalur Dipilih', value: 'SNBP & Jalur Mandiri Prestasi' },
          { label: 'Fitur', value: 'Alarm Deadline & Brankas Dokumen' },
        ]}
      />
    </div>
  )
}
