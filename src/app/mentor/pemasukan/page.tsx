'use client'

import { useState } from 'react'
import {
  DollarSign,
  Wallet,
  TrendingUp,
  Users,
  Copy,
  Check,
  Share2,
  Download,
  Building,
  CheckCircle2,
  X,
  Sparkles,
  Award,
} from 'lucide-react'

export default function MentorPemasukanPage() {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)

  // Mentor financial monitoring states
  const totalMentees = 3
  const honorPerMentee = [
    { name: 'Salma Salsabila', pkg: 'Queen Bee (Royal Jelly)', honor: 750000, date: '28 Okt 2026', status: 'Siap Cair' },
    { name: 'Arkan Danendra', pkg: 'Honeycomb', honor: 450000, date: '27 Okt 2026', status: 'Siap Cair' },
    { name: 'Nabila Putri', pkg: 'Nectar', honor: 250000, date: '26 Okt 2026', status: 'Selesai Dicairkan' },
  ]
  const totalHonor = 1450000
  const alreadyPaid = 250000
  const activeBalance = totalHonor - alreadyPaid // Rp 1.200.000

  // Mentor Ambassador states
  const mentorAmbassadorCode = 'RAYHANOTW01'
  const mentorAmbassadorUrl = `https://otwptn.id/r/${mentorAmbassadorCode}`
  const ambassadorEarnings = 300000 // Dari referral tambahan

  function handleCopyCode() {
    navigator.clipboard.writeText(mentorAmbassadorCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(mentorAmbassadorUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  function handleWithdrawSubmit(e: React.FormEvent) {
    e.preventDefault()
    setWithdrawSuccess(true)
    setTimeout(() => {
      setWithdrawSuccess(false)
      setWithdrawModalOpen(false)
    }, 2500)
  }

  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10 space-y-8">
      {/* Header & Financial Overview */}
      <div className="p-8 rounded-3xl bg-white shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight">
              Pemasukan & Honorarium Mentor
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Transparansi honor mentoring resmi dari <strong>PT. Lembaga Sains Nasional</strong> dan penghasilan tambahan program Mentor Ambassador.
            </p>
          </div>

          <button
            onClick={() => setWithdrawModalOpen(true)}
            className="btn-brand-primary px-6 py-3 rounded-full text-xs font-black shadow-md flex items-center gap-2 self-start sm:self-auto"
          >
            <Wallet size={16} /> Tarik Honor (Rp {activeBalance.toLocaleString('id-ID')})
          </button>
        </div>

        {/* 4 Financial Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-gray-50 space-y-1">
            <span className="text-[11px] font-bold text-gray-500">Mentee Dibimbing</span>
            <p className="text-2xl font-black text-gray-900">{totalMentees} Siswa</p>
            <p className="text-[10px] text-emerald-600 font-bold">● Seluruh sesi aktif</p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 space-y-1">
            <span className="text-[11px] font-bold text-gray-500">Total Akumulasi Honor</span>
            <p className="text-2xl font-black text-gray-900">Rp {totalHonor.toLocaleString('id-ID')}</p>
            <p className="text-[10px] text-gray-400 font-medium">Bulan Oktober 2026</p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 space-y-1">
            <span className="text-[11px] font-bold text-gray-500">Sudah Masuk Rekening</span>
            <p className="text-2xl font-black text-emerald-600">Rp {alreadyPaid.toLocaleString('id-ID')}</p>
            <p className="text-[10px] text-gray-400 font-medium">Rekening BCA 8720192831</p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/60 space-y-1">
            <span className="text-[11px] font-bold text-amber-900">Saldo Siap Ditarik</span>
            <p className="text-2xl font-black text-amber-950 font-mono">
              Rp {activeBalance.toLocaleString('id-ID')}
            </p>
            <p className="text-[10px] text-amber-800 font-bold">Transfer instan 1-15 menit</p>
          </div>
        </div>
      </div>

      {/* RINCIAN HONOR PER MENTEE */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md space-y-5">
        <h2 className="text-sm font-black text-gray-900">
          Rincian Honorarium per Mentee
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-black uppercase text-gray-400 bg-gray-50/50">
                <th className="py-3 px-4">Nama Mentee</th>
                <th className="py-3 px-4">Paket Bimbingan</th>
                <th className="py-3 px-4">Tanggal Assign</th>
                <th className="py-3 px-4">Besaran Honor</th>
                <th className="py-3 px-4">Status Pencairan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-900">
              {honorPerMentee.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-3.5 px-4 font-black">{item.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-950">
                      {item.pkg}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 font-normal">{item.date}</td>
                  <td className="py-3.5 px-4 font-black font-mono text-emerald-700">
                    Rp {item.honor.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        item.status === 'Siap Cair'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MENTOR AMBASSADOR PROGRAM (MENTOR JUGA BISA JADI AMBASSADOR) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 text-[10px] font-black mb-1">
              <Sparkles size={12} className="text-amber-700" /> Ekstra Income untuk Mentor
            </div>
            <h2 className="text-base font-black text-gray-950">
              Program Mentor Ambassador
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Bagikan kode promo mentormu ke adik kelas atau pengikut media sosialmu. Dapatkan komisi uang tunai tambahan setiap ada yang mendaftar paket bimbingan.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-950 text-center min-w-[140px]">
            <span className="text-[10px] font-bold text-emerald-800 uppercase">Komisi Tambahan</span>
            <p className="text-xl font-black text-emerald-700 font-mono">
              Rp {ambassadorEarnings.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Mentor Promo Code Box */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 gap-3">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Kode Referral Khusus Mentormu:
            </span>
            <span className="text-xl font-black text-gray-950 font-mono tracking-widest">
              {mentorAmbassadorCode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-full text-xs font-bold bg-white hover:bg-gray-100 text-gray-800 shadow-2xs border border-gray-200 flex items-center gap-1.5"
            >
              {copiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              Salin Kode
            </button>
            <button
              onClick={handleCopyLink}
              className="btn-brand-primary px-5 py-2 rounded-full text-xs font-black shadow-2xs flex items-center gap-1.5"
            >
              <Share2 size={14} /> Bagikan Link Promo
            </button>
          </div>
        </div>
      </div>

      {/* WITHDRAWAL MODAL */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative space-y-5">
            <button
              onClick={() => setWithdrawModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                Pencairan Honorarium Mentor
              </span>
              <h3 className="text-lg font-black text-gray-900 mt-1">
                Tarik Saldo ke Rekening Bank
              </h3>
              <p className="text-xs text-gray-500">
                Saldo aktif siap dicairkan: <strong>Rp {activeBalance.toLocaleString('id-ID')}</strong>.
              </p>
            </div>

            {withdrawSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-50 text-emerald-950 text-center space-y-2">
                <p className="text-sm font-black">Permintaan Pencairan Diproses!</p>
                <p className="text-xs text-emerald-800">
                  Honorarium sebesar <strong>Rp {activeBalance.toLocaleString('id-ID')}</strong> sedang diproses oleh keuangan <strong>PT. Lembaga Sains Nasional</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Nominal Pencairan</label>
                  <input
                    disabled
                    value={`Rp ${activeBalance.toLocaleString('id-ID')}`}
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-100 text-xs font-bold text-gray-700 outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Bank Tujuan</label>
                  <input
                    disabled
                    value="BCA - 8720192831 a.n Rayhan Fadillah"
                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-100 text-xs font-bold text-gray-700 outline-none cursor-not-allowed"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 btn-brand-primary py-3 rounded-full text-xs font-black shadow-md"
                  >
                    Konfirmasi Pencairan Honor
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawModalOpen(false)}
                    className="px-5 py-3 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
