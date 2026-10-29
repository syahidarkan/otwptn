'use client'

import React, { useState } from 'react'
import {
  Package, Crown, Sparkles, Flame, Check, Edit3, Plus,
  ShieldCheck, AlertCircle, ArrowUpRight, CheckCircle2, X
} from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

interface PackageData {
  id: string
  name: string
  subtitle: string
  tier: 'queen_bee' | 'honeycomb' | 'nectar' | 'premium'
  originalPrice: number
  promoPrice: number
  discountPercent: number
  isActive: boolean
  badgeTag: string
  features: string[]
}

const DEFAULT_PACKAGES: PackageData[] = [
  {
    id: 'pkg-queen-bee',
    name: 'Queen Bee (VIP)',
    subtitle: 'Bimbingan 1-on-1 Intensif bersama Mentor Alumni Top PTN',
    tier: 'queen_bee',
    originalPrice: 799000,
    promoPrice: 359100,
    discountPercent: 55,
    isActive: true,
    badgeTag: 'Paling Diminati (VIP)',
    features: [
      'Bimbingan 1-on-1 Intensif via Zoom dengan Mentor UI/ITB/UGM',
      'Pembuatan WhatsApp Group 3 Pihak (Siswa, Mentor, Admin) max 6 jam',
      'Bedah Essay Motivasi tak terbatas hingga final submit LOA',
      'Analisis Rapor 5 Semester mendalam untuk Prodi Pilihan 1 & 2',
      'Akses Seluruh Video Modul E-Course & Masterclass Wawancara',
      '20.000 Kredit Otbee AI per bulan',
      'Akses Circle Kampus Eksklusif & Komunitas Pejuang PTN',
    ],
  },
  {
    id: 'pkg-honeycomb',
    name: 'Honeycomb (Reguler)',
    subtitle: 'Review Essay Mendalam & Analisis Rapor 5 Semester',
    tier: 'honeycomb',
    originalPrice: 399000,
    promoPrice: 179100,
    discountPercent: 55,
    isActive: true,
    badgeTag: 'Best Seller',
    features: [
      'Review & Koreksi Detail Essay Motivasi oleh Tim Reviewer',
      'Analisis Peluang Rapor 5 Semester & Rekomendasi Cadangan',
      'Akses Modul Video E-Course Strategi SNBP & Non-Tes',
      '10.000 Kredit Otbee AI per bulan',
      'Akses Circle Komunitas & Cari Teman Belajar On-Cam',
    ],
  },
  {
    id: 'pkg-nectar',
    name: 'Nectar (Review)',
    subtitle: 'Simulasi Kuota & AI Proofreading Cepat',
    tier: 'nectar',
    originalPrice: 199000,
    promoPrice: 89100,
    discountPercent: 55,
    isActive: true,
    badgeTag: 'Favorit Pemula',
    features: [
      'Simulasi Rasio Kuota & Peluang Lolos Kalkulator PTN',
      'Essay AI Review 4 Dimensi dengan Skor & Masukan Logika',
      '5.000 Kredit Otbee AI per bulan',
      'Akses Komunitas Pejuang PTN',
    ],
  },
  {
    id: 'pkg-premium',
    name: 'Akun Premium',
    subtitle: 'Akses Pustaka Modul Video & Tryout Simulasi',
    tier: 'premium',
    originalPrice: 99000,
    promoPrice: 44100,
    discountPercent: 55,
    isActive: true,
    badgeTag: 'Paling Hemat',
    features: [
      'Akses Lengkap Ratusan Video Pembahasan & Materi E-Course',
      'Simulasi Tryout & Bank Soal Latihan Harian',
      '2.000 Kredit Otbee AI per bulan',
      'Akses Circle Kampus',
    ],
  },
]

export default function AdminPaketPage() {
  const [packages, setPackages] = useState<PackageData[]>(DEFAULT_PACKAGES)
  const [editingPkg, setEditingPkg] = useState<PackageData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    subtitle: '',
    originalPrice: 0,
    promoPrice: 0,
    discountPercent: 0,
    badgeTag: '',
    featuresText: '',
    isActive: true,
  })

  const handleOpenEdit = (pkg: PackageData) => {
    setEditingPkg(pkg)
    setForm({
      name: pkg.name,
      subtitle: pkg.subtitle,
      originalPrice: pkg.originalPrice,
      promoPrice: pkg.promoPrice,
      discountPercent: pkg.discountPercent,
      badgeTag: pkg.badgeTag,
      featuresText: pkg.features.join('\n'),
      isActive: pkg.isActive,
    })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name || form.promoPrice <= 0) return alert('Mohon isi nama paket dan harga promo yang valid!')

    const updatedFeatures = form.featuresText.split('\n').filter(Boolean)

    if (editingPkg) {
      setPackages(prev =>
        prev.map(p =>
          p.id === editingPkg.id
            ? {
                ...p,
                name: form.name,
                subtitle: form.subtitle,
                originalPrice: Number(form.originalPrice),
                promoPrice: Number(form.promoPrice),
                discountPercent: Number(form.discountPercent),
                badgeTag: form.badgeTag,
                isActive: form.isActive,
                features: updatedFeatures,
              }
            : p
        )
      )
    }
    setModalOpen(false)
  }

  const handleToggleActive = (id: string) => {
    setPackages(prev =>
      prev.map(p => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Banner Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center p-2.5 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascot-hd/maskot-kantong-koin-emas.png"
              alt="Paket"
              className="w-full h-full object-contain"
              onError={e => {
                ;(e.currentTarget as HTMLImageElement).src = '/logo.png'
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                Katalog Paket Resmi OtwPTN
              </span>
              <span className="text-xs text-gray-400 font-bold">•</span>
              <span className="text-xs text-gray-500 font-bold">4 Paket Bimbingan Belajar</span>
            </div>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">
              Manajemen 4 Paket Bimbingan Belajar
            </h1>
            <p className="text-xs text-gray-500 font-medium max-w-2xl mt-1">
              Sinkronisasi harga core, benefit mentoring, kuota kredit AI, dan diskon paket Queen Bee, Honeycomb, Nectar, dan Akun Premium.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Perusahaan Legal</div>
            <div className="text-xs font-black text-gray-900">PT. Lembaga Sains Nasional</div>
          </div>
        </div>
      </div>

      {/* 4 Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map(pkg => (
          <div
            key={pkg.id}
            className={`rounded-3xl p-6 md:p-7 border transition-all duration-200 flex flex-col justify-between ${
              pkg.tier === 'queen_bee'
                ? 'bg-gradient-to-b from-amber-50/50 to-white border-amber-300 shadow-sm'
                : 'bg-white border-gray-100 shadow-xs'
            }`}
          >
            <div>
              {/* Header Row: Badge & Status */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    pkg.tier === 'queen_bee'
                      ? 'bg-amber-400 text-amber-950'
                      : pkg.tier === 'honeycomb'
                      ? 'bg-amber-100 text-amber-900'
                      : pkg.tier === 'nectar'
                      ? 'bg-sky-100 text-sky-900'
                      : 'bg-purple-100 text-purple-900'
                  }`}
                >
                  {pkg.badgeTag}
                </span>

                <button
                  onClick={() => handleToggleActive(pkg.id)}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                    pkg.isActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {pkg.isActive ? '● Aktif Dijual' : '○ Nonaktif'}
                </button>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl font-black text-gray-950">{pkg.name}</h3>
              <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
                {pkg.subtitle}
              </p>

              {/* Pricing Box */}
              <div className="my-5 p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-baseline gap-3">
                <div className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight">
                  {formatRupiah(pkg.promoPrice)}
                </div>
                <div className="text-xs text-gray-400 line-through font-semibold">
                  {formatRupiah(pkg.originalPrice)}
                </div>
                <div className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full ml-auto">
                  Diskon {pkg.discountPercent}%
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2 mb-6">
                <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">
                  Benefit yang didapatkan:
                </div>
                {pkg.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2 text-xs font-semibold text-gray-700">
                    <Check
                      size={14}
                      strokeWidth={3}
                      className="text-emerald-600 flex-shrink-0 mt-0.5"
                    />
                    <span className="leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Edit Trigger */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400">
                ID Paket: <code className="font-mono text-gray-600">{pkg.tier}</code>
              </span>
              <button
                onClick={() => handleOpenEdit(pkg)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-amber-100 text-gray-800 hover:text-amber-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 size={13} />
                <span>Ubah Harga & Benefit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Package Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-lg font-black text-gray-950">
                Ubah Detail Paket: {editingPkg?.name}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nama Paket</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Subjudul / Slogan</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Harga Asli (Rp)</label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={e => setForm(p => ({ ...p, originalPrice: Number(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Harga Promo (Rp)</label>
                  <input
                    type="number"
                    value={form.promoPrice}
                    onChange={e => setForm(p => ({ ...p, promoPrice: Number(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Diskon (%)</label>
                  <input
                    type="number"
                    value={form.discountPercent}
                    onChange={e => setForm(p => ({ ...p, discountPercent: Number(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tag / Lencana</label>
                <input
                  type="text"
                  value={form.badgeTag}
                  onChange={e => setForm(p => ({ ...p, badgeTag: e.target.value }))}
                  placeholder="Contoh: Paling Diminati (VIP)"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Daftar Benefit (1 baris per poin)
                </label>
                <textarea
                  value={form.featuresText}
                  onChange={e => setForm(p => ({ ...p, featuresText: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 font-extrabold text-xs text-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 font-black text-xs text-amber-950 transition-all shadow-xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
