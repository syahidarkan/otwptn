'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Compass,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Target,
  Award,
  BookOpen,
  Split,
} from 'lucide-react'
import AuthGateModal from '@/components/auth/AuthGateModal'
import { INDONESIA_PTN_LIST } from '@/lib/indonesiaDirectory'

export default function AturStrategiPublicClient() {
  const [ptn1, setPtn1] = useState('Universitas Gadjah Mada (UGM)')
  const [prodi1, setProdi1] = useState('Kedokteran')
  const [ptn2, setPtn2] = useState('Universitas Diponegoro (UNDIP)')
  const [prodi2, setProdi2] = useState('Kesehatan Masyarakat')
  const [sertifikat, setSertifikat] = useState('Olimpiade Sains (OSN/Puspresnas)')
  const [strategyMode, setStrategyMode] = useState('balanced')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ptn1,
      prodi1,
      ptn2,
      prodi2,
      sertifikat,
      strategyMode,
      timestamp: new Date().toISOString(),
    }

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('otwptn_pending_strategi', JSON.stringify(payload))
      }
    } catch (err) {
      console.error('Gagal menyimpan strategi:', err)
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
            AI Strategy Generator Jalur Non-Tes PTN 2025/2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Atur Strategi Formasi Pilihan <span className="text-amber-500">Anti-Gugur</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Kombinasikan pilihan prodi ambis vs aman, urutan pembobotan sertifikat, dan jalur mandiri non-tes paralel agar tidak saling sikut dengan teman satu sekolah.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-600">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-3xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Analisis Formasi Pilihan 1 vs Pilihan 2
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-3xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Kurasi Pembobotan 3 Sertifikat
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-3xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Jalur Cadangan Mandiri Prestasi
            </span>
          </div>
        </div>
      </section>

      {/* Main Interactive Form */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-150 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">Formasi Target Kampus & Jurusan</h2>
                <p className="text-xs text-gray-500 font-medium">Susunan jurusan impian yang akan diuji taktik kelulusannya</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Pilihan 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">PTN Pilihan 1 (Prioritas)</label>
                  <input
                    type="text"
                    value={ptn1}
                    onChange={(e) => setPtn1(e.target.value)}
                    placeholder="Contoh: Universitas Gadjah Mada (UGM)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">Program Studi Pilihan 1</label>
                  <input
                    type="text"
                    value={prodi1}
                    onChange={(e) => setProdi1(e.target.value)}
                    placeholder="Contoh: Kedokteran"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Pilihan 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">PTN Pilihan 2 (Pengaman)</label>
                  <input
                    type="text"
                    value={ptn2}
                    onChange={(e) => setPtn2(e.target.value)}
                    placeholder="Contoh: Universitas Diponegoro (UNDIP)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">Program Studi Pilihan 2</label>
                  <input
                    type="text"
                    value={prodi2}
                    onChange={(e) => setProdi2(e.target.value)}
                    placeholder="Contoh: Kesehatan Masyarakat"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Sertifikat & Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">Sertifikat Portofolio Utama</label>
                  <select
                    value={sertifikat}
                    onChange={(e) => setSertifikat(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                  >
                    <option value="Olimpiade Sains (OSN/Puspresnas)">Olimpiade Sains (OSN/Puspresnas)</option>
                    <option value="Lomba Karya Ilmiah Remaja (LKIR/OPSI)">Lomba Karya Ilmiah (LKIR / OPSI)</option>
                    <option value="Kepemimpinan (Ketua OSIS / MPK)">Kepemimpinan (Ketua OSIS / MPK)</option>
                    <option value="Olahraga / Seni (O2SN/FLS2N)">Olahraga / Seni (O2SN / FLS2N)</option>
                    <option value="Hafalan Al-Qur'an / Keagamaan">Tahfidz / Keagamaan</option>
                    <option value="Belum Ada Sertifikat">Belum Memiliki Sertifikat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">Gaya Strategi yang Diinginkan</label>
                  <select
                    value={strategyMode}
                    onChange={(e) => setStrategyMode(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                  >
                    <option value="balanced">Seimbang (Ambis Pilihan 1 + Rasional Pilihan 2)</option>
                    <option value="safe">Maksimal Lolos (Prioritaskan Peluang Tertinggi)</option>
                    <option value="aggressive">All-in Impian (Fokus Prodi Top Keketatan Tinggi)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Preview Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
              <span className="text-amber-700 font-bold block mb-1">Pilar 1: Formasi SNBP</span>
              <p className="text-gray-600 leading-relaxed">
                Menghindari aturan gugur massal di pilihan 2 jika pilihan 1 memiliki keketatan di bawah pilihan 2.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
              <span className="text-amber-700 font-bold block mb-1">Pilar 2: Sertifikat Match</span>
              <p className="text-gray-600 leading-relaxed">
                Memastikan jenis piagam linier dengan program studi tujuan agar mendapat bobot maksimal dari dewan juri.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
              <span className="text-amber-700 font-bold block mb-1">Pilar 3: Jalur Mandiri Rapor</span>
              <p className="text-gray-600 leading-relaxed">
                Pemetaan 5 jalur mandiri non-tes alternatif (PPKB UI, PBUB UGM, SJP IPB) yang bisa didaftar bersamaan.
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="text-center pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-base sm:text-lg transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
            >
              <Compass className="w-5 h-5 text-neutral-950" />
              <span>Buat Blueprint Strategi Kelulusan</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="mt-3 text-xs text-gray-500 font-medium">
              Formasi tersimpan otomatis. Buka rekomendasi taktis lengkap secara gratis.
            </p>
          </div>
        </form>
      </section>

      {/* Auth Gate Modal Handover */}
      <AuthGateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Blueprint Strategi Kelulusan Kamu Siap Dibuat!"
        subtitle="Formasi pilihan dan data sertifikat sudah tersimpan aman. Masuk atau daftar gratis sekarang untuk melihat simulasi strategi anti-gugur."
        featureBadge="Atur Strategi PTN"
        redirectPath="/dashboard/strategi"
        payloadPreview={[
          { label: 'Pilihan 1', value: `${prodi1} - ${ptn1}` },
          { label: 'Pilihan 2', value: `${prodi2} - ${ptn2}` },
          { label: 'Sertifikat Utama', value: sertifikat },
        ]}
      />
    </div>
  )
}
