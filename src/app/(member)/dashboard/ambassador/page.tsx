'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Copy,
  Check,
  Share2,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Wallet,
  X,
  Sparkles,
  FileText,
} from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ReferralPromoKit from '@/components/dashboard/ReferralPromoKit'
import { TIER_COMMISSION } from '@/lib/pricing'

export default function AmbassadorDashboardPage() {
  const [termsOpen, setTermsOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Monitoring Stats & Financials (loaded from API)
  const [totalReferred, setTotalReferred] = useState(0)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [alreadyWithdrawn, setAlreadyWithdrawn] = useState(0)
  const [activeBalance, setActiveBalance] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)

  // Referral code (loaded from DB)
  const [referralCode, setReferralCode] = useState('')
  const referralUrl = referralCode ? `https://otwptn.com/upgrade?ref=${referralCode}` : ''

  // Withdrawal Modal State
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [bankTarget, setBankTarget] = useState('BCA')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [withdrawError, setWithdrawError] = useState('')

  useEffect(() => {
    fetch('/api/ambassador')
      .then(r => r.json())
      .then(data => {
        setReferralCode(data.referralCode ?? '')
        setTotalReferred(data.totalReferred ?? 0)
        setTotalEarnings(data.totalEarnings ?? 0)
        setAlreadyWithdrawn(data.alreadyWithdrawn ?? 0)
        setActiveBalance(data.activeBalance ?? 0)
        setWithdrawAmount(String(data.activeBalance ?? 0))
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false))
  }, [])

  function handleCopyCode() {
    navigator.clipboard.writeText(referralCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(referralUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  async function handleWithdrawSubmit(e: React.FormEvent) {
    e.preventDefault()
    setWithdrawError('')
    try {
      const res = await fetch('/api/ambassador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(withdrawAmount),
          bank_name: bankTarget,
          account_number: accountNumber,
          account_holder: accountHolder,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setWithdrawError(data.error ?? 'Gagal mengajukan penarikan')
        return
      }
      setWithdrawSuccess(true)
      const statsRes = await fetch('/api/ambassador')
      const statsData = await statsRes.json()
      setAlreadyWithdrawn(statsData.alreadyWithdrawn ?? 0)
      setActiveBalance(statsData.activeBalance ?? 0)
      setTimeout(() => {
        setWithdrawSuccess(false)
        setWithdrawModalOpen(false)
      }, 2000)
    } catch {
      setWithdrawError('Terjadi kesalahan. Coba lagi.')
    }
  }

  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10 space-y-10 max-w-5xl mx-auto">
      {/* 1. HEADER & MONITORING OVERVIEW (BERSIH & ELEGAN) */}
      <div className="p-8 rounded-3xl bg-white shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-black mb-2">
              <Sparkles size={14} className="text-amber-600" /> Program Student Ambassador Resmi otwptn
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight">
              Dashboard Student Ambassador
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Dapatkan komisi uang tunai nyata setiap 1 siswa mendaftar paket menggunakan kodemu.
            </p>
          </div>

          {/* Tarik Saldo Button */}
          <button
            onClick={() => setWithdrawModalOpen(true)}
            className="btn-brand-primary px-6 py-3 rounded-full text-xs font-black shadow-md flex items-center gap-2 self-start sm:self-auto"
          >
            <Wallet size={16} /> Tarik Saldo (Rp {activeBalance.toLocaleString('id-ID')})
          </button>
        </div>

        {/* 4 Cards Monitoring Keuangan & Pendaftar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-gray-50/80 space-y-1">
            <span className="text-[11px] font-bold text-gray-500">Pendaftar Pakai Kodemu</span>
            <p className="text-2xl font-black text-gray-950">{totalReferred} Siswa</p>
            <p className="text-[10px] text-emerald-600 font-bold">● Terverifikasi aktif</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/80 space-y-1">
            <span className="text-[11px] font-bold text-gray-500">Total Komisi Masuk</span>
            <p className="text-2xl font-black text-emerald-600">Rp {totalEarnings.toLocaleString('id-ID')}</p>
            <p className="text-[10px] text-gray-400 font-medium">Akumulasi komisi tunai</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/80 space-y-1">
            <span className="text-[11px] font-bold text-gray-500">Sudah Dicairkan</span>
            <p className="text-2xl font-black text-gray-700">Rp {alreadyWithdrawn.toLocaleString('id-ID')}</p>
            <p className="text-[10px] text-gray-400 font-medium">Masuk ke rekening BCA</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/50 space-y-1">
            <span className="text-[11px] font-bold text-amber-900">Saldo Siap Ditarik</span>
            <p className="text-2xl font-black text-amber-950">Rp {activeBalance.toLocaleString('id-ID')}</p>
            <p className="text-[10px] text-amber-800 font-bold">0 hari penahanan · Langsung cair</p>
          </div>
        </div>

        {/* Skema Komisi Resmi Transparan */}
        <div className="p-4 rounded-2xl bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="font-black text-gray-900">Skema Komisi Uang Tunai Per Pendaftaran:</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white font-bold text-gray-800 shadow-2xs">
              Nectar (Review): <strong className="text-emerald-700">Rp 15.000</strong>/org
            </span>
            <span className="px-3 py-1 rounded-full bg-white font-bold text-gray-800 shadow-2xs">
              Honeycomb (Reguler): <strong className="text-emerald-700">Rp 35.000</strong>/org
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black shadow-2xs">
              Queen Bee (VIP): <strong className="text-black">Rp 75.000</strong>/org
            </span>
          </div>
        </div>
      </div>

      {/* 2. GRID 2 KOLOM ATAS (SESUAI PINTARLY SCREENSHOT 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* KOLOM KIRI (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          {/* CARD 1: KIRIM KODEMU KE SATU TEMAN */}
          <div className="rounded-3xl bg-white p-6 shadow-md space-y-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mascot/otbee-phone.png"
                alt="Otbee"
                className="w-12 h-12 object-contain"
              />
              <h3 className="text-sm font-black text-gray-900">
                Kirim kodemu ke satu teman
              </h3>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-white hover:bg-gray-50 text-gray-800 shadow-xs border border-gray-100 flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 size={14} /> {copiedLink ? 'Link Pendaftaran Berhasil Disalin!' : 'Bagikan link pendaftaran'}
            </button>

            {/* Big Code Box: Format [NAMA]OTW[ANGKA] -> ACANOTW01 */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/90 border border-gray-100">
              <span className="text-lg font-black tracking-widest text-gray-950 font-mono">
                {referralCode}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-xl hover:bg-gray-200 text-gray-600 transition-colors"
                  title="Salin Kode"
                >
                  {copiedCode ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl hover:bg-gray-200 text-gray-600 transition-colors"
                  title="Bagikan"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* CARD 2: LANGKAH BERIKUTNYA */}
          <div className="rounded-3xl bg-white p-6 shadow-md space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Langkah Berikutnya
            </span>

            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mascot/review-draft.png"
                alt="Otbee Draft"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h4 className="text-xs font-black text-gray-900">
                  Bagikan &ldquo;Audit Rapor & Essay Review AI&rdquo;
                </h4>
                <p className="text-[11px] text-gray-500 font-medium">
                  Materi teratas untuk modemu, kodemu sudah tertera.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById('katalog-harga-section')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="w-full btn-brand-primary py-3 rounded-full text-xs font-black shadow-xs"
            >
              Lihat materi & katalog harga
            </button>
          </div>

          {/* CARD 3: MULAI (3 STEPS) */}
          <div className="rounded-3xl bg-white p-6 shadow-md space-y-4">
            <h4 className="text-xs font-black text-gray-900">Mulai</h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 font-bold text-gray-700 flex items-center justify-center text-[11px]">
                  1
                </div>
                <span className="font-semibold text-gray-800">Kode dibagikan ke pejuang PTN</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 font-bold text-gray-700 flex items-center justify-center text-[11px]">
                    2
                  </div>
                  <span className="font-semibold text-gray-800">Teman mendaftar akun pakai kodemu</span>
                </div>
                <span className="font-black text-gray-900">{totalReferred}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 font-bold text-amber-800 flex items-center justify-center text-[11px]">
                    3
                  </div>
                  <span className="font-semibold text-gray-800">Teman berlangganan paket</span>
                </div>
                <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Komisi Tunai s.d Rp 75.000 / org
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (5 COLS): TANGGA KOMISI (SISTEM REWARD PER SISWA MENTOR) */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl bg-white p-6 shadow-md space-y-6">
            <div>
              <h3 className="text-xs font-black text-gray-900">Tangga komisi (Pendaftaran Paket Mentor)</h3>
              <div className="mt-2">
                <span className="text-4xl font-black text-gray-950 font-mono">1</span>
                <p className="text-xs font-bold text-gray-800 leading-snug mt-1">
                  1 Siswa Daftar Mentor = Komisi Tunai Langsung Rp 75.000 Cair
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Komisi uang beneran masuk ke saldo siap tarik</p>
              </div>
            </div>

            {/* Timeline Milestones per Mentor Referral */}
            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {/* Step 1: 1 Siswa Mentor */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-xs z-10 flex-shrink-0">
                  1
                </div>
                <div className="flex-1 flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="font-bold text-gray-900">1 Siswa Mentor</span>
                    <p className="text-[10px] text-gray-400">Pendaftaran pertama</p>
                  </div>
                  <span className="font-black text-emerald-600">Rp 75.000 Cair</span>
                </div>
              </div>

              {/* Step 2: 3 Siswa Mentor */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs shadow-xs z-10 flex-shrink-0">
                  3
                </div>
                <div className="flex-1 flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="font-bold text-gray-900">3 Siswa Mentor</span>
                    <span className="ml-2 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                      Target Saat Ini
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">Rp 225.000</p>
                    <p className="text-[10px] text-amber-700 font-bold">+ Bonus Rp 50.000</p>
                  </div>
                </div>
              </div>

              {/* Step 3: 5 Siswa Mentor */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs z-10 flex-shrink-0">
                  5
                </div>
                <div className="flex-1 flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="font-semibold text-gray-700">5 Siswa Mentor</span>
                    <p className="text-[10px] text-gray-400">Total Rp 375.000</p>
                  </div>
                  <span className="font-black text-amber-800">+ Bonus Rp 100k</span>
                </div>
              </div>

              {/* Step 4: 10 Siswa Mentor */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs z-10 flex-shrink-0">
                  10
                </div>
                <div className="flex-1 flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="font-bold text-gray-900">10 Siswa Mentor</span>
                    <p className="text-[10px] text-gray-400">Total Rp 750.000</p>
                  </div>
                  <span className="font-black text-amber-800">+ Bonus Rp 250k & Merch</span>
                </div>
              </div>

              {/* Step 5: 25 Siswa Mentor */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs z-10 flex-shrink-0">
                  25
                </div>
                <div className="flex-1 flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="font-bold text-gray-900">25 Siswa Mentor</span>
                    <p className="text-[10px] text-gray-400">Total Rp 1.875.000</p>
                  </div>
                  <span className="font-black text-amber-800">+ Jaket Eksklusif</span>
                </div>
              </div>

              {/* Step 6: 50 Siswa Mentor */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs z-10 flex-shrink-0">
                  50
                </div>
                <div className="flex-1 flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="font-bold text-gray-900">50 Siswa Mentor</span>
                    <p className="text-[10px] text-gray-400">Total Rp 3.750.000</p>
                  </div>
                  <span className="font-black text-emerald-700">+ Laptop / Tablet PTN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3+4. MATERI PROMOSI & KATALOG HARGA (shared with mentor/creator dashboards) */}
      <div id="katalog-harga-section">
        <ReferralPromoKit referralCode={referralCode} />
      </div>

      {/* 5. TAUTAN FOOTER (PERSIS PINTARLY) */}
      <div className="rounded-3xl bg-white shadow-md divide-y divide-gray-100 overflow-hidden">
        <a
          href="https://wa.me/6285121659182?text=Halo+Kak%2C+saya+ingin+bergabung+grup+Student+Ambassador+OTWPTN"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageCircle size={18} className="text-emerald-600" />
            <span className="text-xs font-black text-gray-900">Grup WhatsApp Student Ambassador</span>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </a>

        <Link
          href="/dashboard/komunitas"
          className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ExternalLink size={18} className="text-amber-600" />
            <span className="text-xs font-black text-gray-900">Lihat halaman temanmu</span>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </Link>

        <button
          onClick={() => setTermsOpen(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-gray-500" />
            <span className="text-xs font-black text-gray-900">Syarat & Ketentuan</span>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </button>
      </div>

      {/* WITHDRAWAL MODAL */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18191e] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative space-y-5 border border-gray-150 dark:border-neutral-800 animate-in zoom-in-95 duration-200 text-gray-900 dark:text-neutral-100">
            <button
              onClick={() => setWithdrawModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                Pencairan Komisi Tunai
              </span>
              <h3 className="text-lg font-black text-gray-900 dark:text-neutral-100 mt-1.5 tracking-tight">
                Tarik Saldo Komisi ke Rekening
              </h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                Saldo aktif kamu: <strong className="text-gray-900 dark:text-neutral-200">Rp {activeBalance.toLocaleString('id-ID')}</strong>. Bebas biaya admin.
              </p>
            </div>

            {withdrawSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 text-center space-y-2 border border-emerald-200 dark:border-emerald-800/60">
                <p className="text-sm font-black">Permintaan Pencairan Berhasil!</p>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Dana sebesar <strong>Rp {Number(withdrawAmount).toLocaleString('id-ID')}</strong> sedang diproses ke {bankTarget} ({accountNumber} a.n {accountHolder}). Estimasi masuk 1–15 menit.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-neutral-200 mb-1 block">
                    Jumlah Pencairan (Rp)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    max={activeBalance}
                    min="20000"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50/80 dark:bg-neutral-900/80 border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-900 dark:text-neutral-100 outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-neutral-200 mb-1 block">
                    Bank / E-Wallet Tujuan
                  </label>
                  <select
                    value={bankTarget}
                    onChange={e => setBankTarget(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50/80 dark:bg-neutral-900/80 border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-900 dark:text-neutral-100 outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-all"
                  >
                    <option value="BCA">BCA (Bank Central Asia)</option>
                    <option value="Mandiri">Bank Mandiri</option>
                    <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                    <option value="BNI">BNI (Bank Negara Indonesia)</option>
                    <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                    <option value="GoPay">GoPay</option>
                    <option value="OVO">OVO</option>
                    <option value="Dana">DANA</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-neutral-200 mb-1 block">
                    Nomor Rekening / Nomor HP
                  </label>
                  <input
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50/80 dark:bg-neutral-900/80 border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-900 dark:text-neutral-100 outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-neutral-200 mb-1 block">
                    Nama Pemilik Rekening
                  </label>
                  <input
                    value={accountHolder}
                    onChange={e => setAccountHolder(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50/80 dark:bg-neutral-900/80 border border-gray-200 dark:border-neutral-700 text-xs font-semibold text-gray-900 dark:text-neutral-100 outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-all"
                  />
                </div>

                {withdrawError && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-3 py-2 rounded-xl">{withdrawError}</p>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-black shadow-md shadow-amber-400/20 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    Konfirmasi Pencairan Dana
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawModalOpen(false)}
                    className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={termsOpen} onClose={() => setTermsOpen(false)} title="Syarat & Ketentuan Student Ambassador" size="md">
        <ol className="list-decimal pl-5 space-y-2.5 text-sm text-gray-700 leading-relaxed">
          <li>Teman yang membeli paket bermentor (mode Individu) dengan kodemu mendapat potongan harga langsung di halaman pembayaran.</li>
          <li>
            Kamu mendapat komisi tunai per siswa yang berhasil membayar:
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>Paket Nectar (Review): Rp {TIER_COMMISSION.review.toLocaleString('id-ID')}</li>
              <li>Paket Honeycomb (Reguler): Rp {TIER_COMMISSION.dokumen.toLocaleString('id-ID')}</li>
              <li>Paket Queen Bee (Intensif): Rp {TIER_COMMISSION.menyeluruh.toLocaleString('id-ID')}</li>
              <li>Akun Premium: Rp {TIER_COMMISSION.web_premium.toLocaleString('id-ID')}</li>
            </ul>
          </li>
          <li>Komisi masuk ke saldo setelah pembayaran terkonfirmasi.</li>
          <li>Penarikan saldo diproses admin setelah kamu mengajukan permintaan dari halaman ini.</li>
        </ol>
      </Modal>
    </div>
  )
}
