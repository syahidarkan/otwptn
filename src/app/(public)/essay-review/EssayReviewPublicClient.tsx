'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Award,
  PenTool,
  RotateCcw,
} from 'lucide-react'
import AuthGateModal from '@/components/auth/AuthGateModal'

const SAMPLE_ESSAY = `Sejak duduk di bangku kelas 10, saya mendedikasikan waktu saya untuk mendalami bidang sains komputasi melalui proyek otomatisasi sistem hidroponik sekolah. Dengan memanfaatkan mikrokontroler berbasis IoT, saya memimpin tim yang terdiri dari 4 siswa untuk memprogram sensor kelembapan dan pH air. Kami berhasil meningkatkan efisiensi penggunaan air sebesar 32% dan memenangkan medali perak pada Olimpiade Penelitian Siswa Indonesia (OPSI) tingkat provinsi.

Melalui program studi Ilmu Komputer di Universitas Indonesia, saya bertekad memperdalam machine learning dan algoritma terdistribusi di bawah bimbingan para profesor terkemuka. Saya percaya bahwa rekam jejak riset, konsistensi kepemimpinan, dan etos belajar mandiri saya akan memberikan kontribusi nyata bagi ekosistem akademik fakultas.`

export default function EssayReviewPublicClient() {
  const [targetPtn, setTargetPtn] = useState('Universitas Indonesia (UI) - PPKB')
  const [title, setTitle] = useState('Kontribusi IoT Sains Komputasi untuk Solusi Berkelanjutan')
  const [content, setContent] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0
  }, [content])

  const charCount = useMemo(() => content.length, [content])

  // Evaluasi sederhana kesiapan draft essay
  const readiness = useMemo(() => {
    if (wordCount === 0) return { score: 0, label: 'Kosong', color: 'text-gray-400' }
    if (wordCount < 150) return { score: 40, label: 'Terlalu Singkat (Butuh Elaborasi)', color: 'text-amber-600' }
    if (wordCount > 700) return { score: 65, label: 'Melebihi Batas Ideal', color: 'text-amber-600' }
    return { score: 92, label: 'Panjang Ideal (300-600 Kata)', color: 'text-emerald-600' }
  }, [wordCount])

  const handleUseSample = () => {
    setContent(SAMPLE_ESSAY)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      alert('Tuliskan atau tempel draft essay kamu terlebih dahulu!')
      return
    }

    const payload = {
      targetPtn,
      title: title || 'Draft Essay PTN',
      content,
      wordCount,
      timestamp: new Date().toISOString(),
    }

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('otwptn_pending_essay', JSON.stringify(payload))
      }
    } catch (err) {
      console.error('Gagal menyimpan draf essay:', err)
    }

    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-amber-300 selection:text-neutral-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-14 px-4 sm:px-6 lg:px-8 border-b border-gray-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/70 via-amber-50/30 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300/80 text-amber-900 text-xs font-black uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            AI Essay Reviewer Standar Penguji PTN
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Review & Sempurnakan <span className="text-amber-500">Essay Motivasi PTN</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Dapatkan koreksi instan dengan rubrik penilaian PPKB UI, PBUB UGM, SJP IPB, dan beasiswa: deteksi kalimat klise, metode STAR, dan saran perbaikan per paragraf.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-600">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-3xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Analisis STAR Method
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-3xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Deteksi Kalimat Klise & Pasif
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-3xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Database 500+ Essay Lolos
            </span>
          </div>
        </div>
      </section>

      {/* Main Interactive Form */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Metadata Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-gray-150 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  Target Jalur & PTN
                </label>
                <select
                  value={targetPtn}
                  onChange={(e) => setTargetPtn(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                >
                  <option value="Universitas Indonesia (UI) - PPKB">Universitas Indonesia (UI) - PPKB</option>
                  <option value="Universitas Indonesia (UI) - Talent Scouting">UI - Talent Scouting (English Essay)</option>
                  <option value="Universitas Gadjah Mada (UGM) - PBUB">Universitas Gadjah Mada (UGM) - PBUB</option>
                  <option value="IPB University - SJP (Ketua OSIS)">IPB University - SJP Ketua OSIS</option>
                  <option value="Universitas Airlangga (UNAIR) - Golden Ticket">UNAIR - Golden Ticket Prestasi</option>
                  <option value="Institut Teknologi Sepuluh Nopember (ITS) - Mandiri Prestasi">ITS - Mandiri Prestasi</option>
                  <option value="Beasiswa Unggulan / Indonesia Maju (BIM)">Beasiswa Unggulan / BIM Puspresnas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  Judul Essay (Opsional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Mengabdi Lewat Sains & Teknologi"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Essay Editor Area */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-150 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-black text-gray-900">Draft Essay Motivasi</h2>
              </div>
              <button
                type="button"
                onClick={handleUseSample}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Coba Contoh Essay Lolos
              </button>
            </div>

            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder="Tulis atau tempel draft essay kamu di sini. Ceritakan latar belakang, tantangan, aksi nyata yang telah kamu lakukan, serta alasan memilih prodi tujuan..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:bg-white leading-relaxed font-sans transition-all"
              />
            </div>

            {/* Word count & Status bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-150 text-xs">
              <div className="flex items-center gap-4 text-gray-600 font-medium">
                <span>
                  <strong className="text-gray-900">{wordCount}</strong> kata
                </span>
                <span>
                  <strong className="text-gray-900">{charCount}</strong> karakter
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Status Panjang:</span>
                <span className={`font-bold ${readiness.color}`}>{readiness.label}</span>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="text-center pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-base sm:text-lg transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-neutral-950" />
              <span>Review Essay dengan AI & Dapatkan Skor Rubrik</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="mt-3 text-xs text-gray-500 font-medium">
              Draft essay kamu tersimpan otomatis. Buka hasil review lengkap gratis tanpa kartu kredit.
            </p>
          </div>
        </form>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1.5">Penilaian 5 Dimensi</h4>
            <p className="text-gray-600 text-xs leading-relaxed">
              Kesesuaian visi prodi, originalitas cerita, metode STAR, kekayaan kosakata teknis, dan kejelasan struktur narasi.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1.5">Deteksi Klise & AI-Plagiarisme</h4>
            <p className="text-gray-600 text-xs leading-relaxed">
              Mendeteksi frasa generik seperti &quot;Sejak kecil saya bercita-cita...&quot; agar essay kamu terdengar otentik dan menonjol.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1.5">Benchmark Essay Juara</h4>
            <p className="text-gray-600 text-xs leading-relaxed">
              Bandingkan struktur dan kekuatan bukti konkret essay kamu dengan kutipan essay peserta yang benar-benar diterima di PTN idaman.
            </p>
          </div>
        </div>
      </section>

      {/* Auth Gate Modal Handover */}
      <AuthGateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Hasil Review Essay AI Kamu Sudah Siap!"
        subtitle="Draft essay kamu telah disimpan aman. Masuk atau daftar gratis sekarang untuk melihat detail skor rubrik, koreksi per kalimat, dan rekomendasi revisi."
        featureBadge="AI Essay Review"
        redirectPath="/dashboard/essay"
        payloadPreview={[
          { label: 'Target Jalur', value: targetPtn },
          { label: 'Jumlah Kata', value: `${wordCount} kata` },
          { label: 'Judul', value: title || 'Draft Essay' },
        ]}
      />
    </div>
  )
}
