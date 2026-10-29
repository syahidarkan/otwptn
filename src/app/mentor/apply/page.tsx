'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  UploadCloud,
  FileText,
  CheckCircle2,
  BookOpen,
  School,
  Sparkles,
  Award,
} from 'lucide-react'
import { LEGAL_ENTITY } from '@/lib/constants'

export default function MentorApplyPage() {
  const [loaFile, setLoaFile] = useState<File | null>(null)
  const [essayFile, setEssayFile] = useState<File | null>(null)
  const [certFile, setCertFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    fullName: 'Rayhan Fakhri Pratama',
    email: 'rayhan.f@alumni.ui.ac.id',
    phone: '081234567890',
    university: 'Universitas Indonesia',
    major: 'Ilmu Komunikasi (Reguler)',
    track: 'PPKB UI (Prestasi & Pemerataan)',
    gradYear: '2025',
    sopAgreed: true,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner (No border, soft shadow, same as member dashboard) */}
      <div className="p-7 rounded-3xl bg-white shadow-md space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 shadow-2xs">
          <ShieldCheck size={13} className="text-amber-600" /> Verifikasi Resmi Mentor Alumni
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
          Formulir Pengajuan & Kelengkapan LOA Mentor
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
          Seluruh calon mentor alumni wajib diverifikasi bukti kelulusan (Letter of Acceptance) oleh tim supervisi akademik <strong>{LEGAL_ENTITY.name}</strong> sebelum dapat membimbing mentee.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-3xl bg-white shadow-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-xl font-black text-gray-950">Dokumen Berhasil Dikirim!</h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
            Tim supervisi akademik <strong>{LEGAL_ENTITY.name}</strong> akan memeriksa keaslian bukti LOA dan portofolio dalam 1x24 jam kerja. Status approval dapat kamu pantau langsung di portal ini.
          </p>
          <div className="pt-2">
            <Link
              href="/mentor/dashboard"
              className="btn-brand-primary px-7 py-3 rounded-full text-xs font-black shadow-md inline-block"
            >
              Kembali ke Workspace Mentor
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Data Almamater (No border lines) */}
          <div className="p-7 rounded-3xl bg-white shadow-md space-y-5">
            <h2 className="text-base font-black text-gray-950 flex items-center gap-2">
              <School size={18} className="text-amber-500" />
              1. Identitas & Riwayat Almamater
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
              <div>
                <label className="block mb-1.5">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  required
                  className="w-full p-3 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>

              <div>
                <label className="block mb-1.5">Nomor WhatsApp Aktif</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  required
                  className="w-full p-3 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>

              <div>
                <label className="block mb-1.5">Perguruan Tinggi Negeri (PTN)</label>
                <input
                  type="text"
                  value={form.university}
                  onChange={e => setForm({ ...form, university: e.target.value })}
                  required
                  className="w-full p-3 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>

              <div>
                <label className="block mb-1.5">Program Studi / Jurusan</label>
                <input
                  type="text"
                  value={form.major}
                  onChange={e => setForm({ ...form, major: e.target.value })}
                  required
                  className="w-full p-3 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>

              <div>
                <label className="block mb-1.5">Jalur Kelulusan Saat Diterima</label>
                <input
                  type="text"
                  value={form.track}
                  onChange={e => setForm({ ...form, track: e.target.value })}
                  placeholder="Misal: PPKB UI, SNBP, SM ITB, PBUB UGM"
                  required
                  className="w-full p-3 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>

              <div>
                <label className="block mb-1.5">Tahun Masuk / Angkatan</label>
                <input
                  type="text"
                  value={form.gradYear}
                  onChange={e => setForm({ ...form, gradYear: e.target.value })}
                  required
                  className="w-full p-3 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Upload Dokumen LOA & Portofolio (No border) */}
          <div className="p-7 rounded-3xl bg-white shadow-md space-y-5">
            <h2 className="text-base font-black text-gray-950 flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              2. Upload Bukti LOA & Portofolio Esai
            </h2>

            {/* Bukti LOA Wajib */}
            <div className="p-5 rounded-2xl bg-amber-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <FileText size={15} className="text-amber-600" />
                  Bukti Letter of Acceptance (LOA) / Bukti Kelulusan PTN <span className="text-rose-500">*Wajib</span>
                </label>
                {loaFile && (
                  <span className="text-[11px] font-bold text-emerald-700">✓ {loaFile.name}</span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                Upload screenshot atau scan PDF pengumuman resmi penerimaan mahasiswa baru.
              </p>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={e => setLoaFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-amber-400 file:text-amber-950 hover:file:bg-amber-300"
              />
            </div>

            {/* Draf Esai Dulu (Opsional) */}
            <div className="p-5 rounded-2xl bg-gray-50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                  <FileText size={15} className="text-gray-500" />
                  Draf Esai Motivasi / Motivation Letter Pribadi <span className="text-gray-400 font-medium">(Opsional)</span>
                </label>
                {essayFile && (
                  <span className="text-[11px] font-bold text-emerald-700">✓ {essayFile.name}</span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                Esai yang dulu kamu gunakan saat berhasil lolos. Berguna sebagai referensi kurasi materi bimbingan.
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={e => setEssayFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-gray-200 file:text-gray-800 hover:file:bg-gray-300"
              />
            </div>

            {/* Sertifikat (Opsional) */}
            <div className="p-5 rounded-2xl bg-gray-50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                  <Award size={15} className="text-gray-500" />
                  Sertifikat Prestasi / Kejuaraan <span className="text-gray-400 font-medium">(Opsional)</span>
                </label>
                {certFile && (
                  <span className="text-[11px] font-bold text-emerald-700">✓ {certFile.name}</span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                Gabungan sertifikat juara lomba atau keorganisasian (format PDF).
              </p>
              <input
                type="file"
                accept=".pdf,.zip"
                onChange={e => setCertFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-gray-200 file:text-gray-800 hover:file:bg-gray-300"
              />
            </div>
          </div>

          {/* SOP Agreement */}
          <div className="p-6 rounded-3xl bg-white shadow-md flex items-start gap-3">
            <input
              type="checkbox"
              id="sop"
              checked={form.sopAgreed}
              onChange={e => setForm({ ...form, sopAgreed: e.target.checked })}
              required
              className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
            />
            <label htmlFor="sop" className="text-xs font-semibold text-gray-700 leading-relaxed cursor-pointer">
              Saya menyetujui seluruh <Link href="/mentor/sop" className="text-amber-700 font-black underline">Standard Operating Procedure (SOP) Mentor Alumni</Link> di bawah naungan <strong>{LEGAL_ENTITY.name}</strong>, termasuk respon 1x24 jam, larangan joki, dan kewajiban pembuatan grup WhatsApp bertiga.
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-brand-primary px-8 py-3.5 rounded-full text-xs font-black shadow-md"
            >
              Kirim Dokumen Verifikasi LOA
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
