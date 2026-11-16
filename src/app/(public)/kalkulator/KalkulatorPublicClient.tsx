'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Calculator,
  Sparkles,
  School,
  GraduationCap,
  Award,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  FileCheck2,
} from 'lucide-react'
import { INDONESIA_PTN_LIST, INDONESIA_JURUSAN_LIST } from '@/lib/indonesiaDirectory'
import AuthGateModal from '@/components/auth/AuthGateModal'

export default function KalkulatorPublicClient() {
  const [jurusanSma, setJurusanSma] = useState('IPA')
  const [akreditasi, setAkreditasi] = useState('A')
  const [rerataRapor, setRerataRapor] = useState('88.5')
  const [ptn1, setPtn1] = useState('Universitas Indonesia (UI)')
  const [prodi1, setProdi1] = useState('Ilmu Komputer')
  const [ptn2, setPtn2] = useState('Institut Teknologi Bandung (ITB)')
  const [prodi2, setProdi2] = useState('Teknik Informatika')
  const [prestasi, setPrestasi] = useState('Juara Nasional / Puspresnas')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Real-time dynamic preview estimation based on current input
  const estimatedReadiness = useMemo(() => {
    let score = 50
    const numRapor = parseFloat(rerataRapor) || 75
    score += (numRapor - 75) * 2.2
    if (akreditasi === 'A') score += 12
    else if (akreditasi === 'B') score += 6
    if (prestasi.includes('Nasional') || prestasi.includes('Puspresnas')) score += 14
    else if (prestasi.includes('Provinsi')) score += 9
    else if (prestasi.includes('Kota')) score += 5
    else if (prestasi.includes('OSIS')) score += 8
    return Math.min(Math.max(Math.round(score), 45), 98)
  }, [rerataRapor, akreditasi, prestasi])

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      jurusanSma,
      akreditasi,
      rerataRapor: parseFloat(rerataRapor) || 85,
      ptn1,
      prodi1,
      ptn2,
      prodi2,
      prestasi,
      source: 'public_preview',
      timestamp: new Date().toISOString(),
    }

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('otwptn_pending_kalkulator', JSON.stringify(payload))
      }
    } catch (err) {
      console.error('Failed to save pending kalkulator data:', err)
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
            Kalkulator Peluang SNBP & Seleksi Non-Tes PTN 2025/2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Cek Peluang Lolos ke <span className="text-amber-500">PTN Impianmu</span> Sebelum Terlambat
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Rasionalisasi nilai rapor semester 1-5, akreditasi sekolah, rekam jejak alumni, dan sertifikat prestasi secara objektif dan instan.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-600">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-3xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Rubrik SNBP 2026 Terbaru
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-3xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Bebas Tabrakan Satu Sekolah
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-3xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Data 80+ PTN Se-Indonesia
            </span>
          </div>
        </div>
      </section>

      {/* Main Interactive Form */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <form onSubmit={handleCalculate} className="space-y-7">
          {/* Card 1: Profil Sekolah & Akademik */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-150 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">1. Profil Akademik & Sekolah</h2>
                <p className="text-xs text-gray-500 font-medium">Dasar penilaian persentase indeks sekolah dan nilai rapor</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Jurusan SMA / SMK</label>
                <select
                  value={jurusanSma}
                  onChange={(e) => setJurusanSma(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                >
                  <option value="IPA">IPA / MIPA</option>
                  <option value="IPS">IPS / Sosial</option>
                  <option value="Bahasa">Bahasa & Budaya</option>
                  <option value="SMK - Rekayasa/IT">SMK - Rekayasa & IT</option>
                  <option value="SMK - Bisnis & Manajemen">SMK - Bisnis & Manajemen</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">Akreditasi Sekolah</label>
                <select
                  value={akreditasi}
                  onChange={(e) => setAkreditasi(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                >
                  <option value="A">Akreditasi A (Eligible 40%)</option>
                  <option value="B">Akreditasi B (Eligible 25%)</option>
                  <option value="C">Akreditasi C (Eligible 5%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  Rata-rata Nilai Rapor (Sem 1-5)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="60"
                    max="100"
                    value={rerataRapor}
                    onChange={(e) => setRerataRapor(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-bold focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                  />
                  <span className="absolute right-4 top-3 text-xs text-gray-400 font-bold">/ 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Pilihan Program Studi & PTN */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-150 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">2. Target PTN & Program Studi</h2>
                <p className="text-xs text-gray-500 font-medium">Pilihan 1 dan 2 yang ingin kamu uji rasionalisasinya</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Pilihan 1 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60">
                <span className="text-xs font-black text-amber-800 uppercase tracking-wider block mb-3">
                  Pilihan 1 (Prioritas Utama)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nama PTN</label>
                    <input
                      type="text"
                      list="ptn-list"
                      value={ptn1}
                      onChange={(e) => setPtn1(e.target.value)}
                      placeholder="Ketik nama PTN..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Program Studi</label>
                    <input
                      type="text"
                      list="jurusan-list"
                      value={prodi1}
                      onChange={(e) => setProdi1(e.target.value)}
                      placeholder="Ketik jurusan impian..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Pilihan 2 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-black text-gray-600 uppercase tracking-wider block mb-3">
                  Pilihan 2 (Cadangan / Strategis)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nama PTN</label>
                    <input
                      type="text"
                      list="ptn-list"
                      value={ptn2}
                      onChange={(e) => setPtn2(e.target.value)}
                      placeholder="Ketik nama PTN..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Program Studi</label>
                    <input
                      type="text"
                      list="jurusan-list"
                      value={prodi2}
                      onChange={(e) => setProdi2(e.target.value)}
                      placeholder="Ketik jurusan cadangan..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Datalists for quick suggestions */}
            <datalist id="ptn-list">
              {INDONESIA_PTN_LIST.slice(0, 40).map((ptn, idx) => (
                <option key={idx} value={`${ptn.name} (${ptn.shortName})`} />
              ))}
            </datalist>
            <datalist id="jurusan-list">
              {INDONESIA_JURUSAN_LIST.slice(0, 50).map((jurusan, idx) => (
                <option key={idx} value={jurusan} />
              ))}
            </datalist>
          </div>

          {/* Card 3: Sertifikat & Prestasi Tambahan */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-150 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">3. Prestasi Tertinggi (Opsional)</h2>
                <p className="text-xs text-gray-500 font-medium">Sertifikat resmi Puspresnas / instansi dapat melipatgandakan peluang kelulusan</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-2">Tingkat Prestasi Tertinggi</label>
              <select
                value={prestasi}
                onChange={(e) => setPrestasi(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-medium focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
              >
                <option value="Juara Nasional / Puspresnas">Juara 1/2/3 Nasional (OSN/O2SN/FLS2N/Puspresnas)</option>
                <option value="Juara Provinsi">Juara Tingkat Provinsi</option>
                <option value="Juara Kota / Kabupaten">Juara Tingkat Kota / Kabupaten</option>
                <option value="Ketua OSIS / MPK / Organisasi">Ketua OSIS / Pengurus Organisasi Sekolah</option>
                <option value="Belum Ada Sertifikat">Belum Memiliki Sertifikat Prestasi</option>
              </select>
            </div>
          </div>

          {/* Interactive Readiness Live Bar */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-100/70 via-amber-50 to-white border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black text-xl shadow-xs">
                {estimatedReadiness}%
              </div>
              <div>
                <div className="text-sm font-black text-gray-900 flex items-center gap-2">
                  Indikator Daya Saing Awal
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-black uppercase">
                    Live
                  </span>
                </div>
                <p className="text-xs text-gray-600 font-medium mt-0.5">
                  Profilmu siap dihitung mencakup riwayat alumni dan tingkat keketatan prodi.
                </p>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="text-center pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-base sm:text-lg transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
            >
              <Calculator className="w-5 h-5 text-neutral-950" />
              <span>Hitung Peluang Lolos & Rasionalisasi Lengkap</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="mt-3 text-xs text-gray-500 font-medium">
              Data tersimpan otomatis. Buka hasil breakdown lengkap secara gratis tanpa biaya.
            </p>
          </div>
        </form>

        {/* FAQ Section */}
        <div className="mt-20 pt-12 border-t border-gray-150">
          <h3 className="text-xl font-black text-gray-900 mb-6 text-center">
            Pertanyaan Seputar Kalkulator Peluang SNBP
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-sm">
              <h4 className="font-bold text-gray-900 mb-2">Bagaimana algoritma menghitung peluang saya?</h4>
              <p className="text-gray-600 text-xs leading-relaxed">
                Algoritma menggabungkan rerata nilai rapor mata pelajaran pendukung prodi, bobot akreditasi sekolah, rekam jejak alumni di PTN target, serta sertifikat prestasi sesuai pedoman resmi SNPMB.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-sm">
              <h4 className="font-bold text-gray-900 mb-2">Apakah aman dari bentrok dengan teman sekolah?</h4>
              <p className="text-gray-600 text-xs leading-relaxed">
                Di dashboard lengkap kamu bisa membandingkan posisi paralel sekolahmu sehingga tidak saling jegal pada prodi dan PTN yang sama.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Gate Modal Handover */}
      <AuthGateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Peluang Lolos Kamu Sudah Siap Dihitung!"
        subtitle="Draf nilai dan pilihan prodimu sudah tersimpan. Masuk atau daftar gratis sekarang untuk melihat detail rasionalisasi & strategi anti-tabrakan."
        featureBadge="Kalkulator Peluang SNBP"
        redirectPath="/dashboard/kalkulator"
        payloadPreview={[
          { label: 'Pilihan 1', value: `${prodi1} - ${ptn1}` },
          { label: 'Pilihan 2', value: `${prodi2} - ${ptn2}` },
          { label: 'Rerata Rapor', value: `${rerataRapor} (Akred ${akreditasi})` },
        ]}
      />
    </div>
  )
}
