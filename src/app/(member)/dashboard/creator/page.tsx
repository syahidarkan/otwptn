'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Video,
  Copy,
  Check,
  Share2,
  ExternalLink,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Wallet,
  Sparkles,
  TrendingUp,
  Users,
  Film,
  Download,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Smartphone,
  ChevronRight,
  ArrowUpRight,
  Send,
  Eye,
} from 'lucide-react'
import { formatIDR } from '@/lib/pricing'

interface CreatorSubmission {
  id: string
  title: string
  platform: 'tiktok' | 'instagram' | 'youtube' | 'other'
  video_url: string
  campaign_topic?: string
  caption_used?: string
  view_count?: number
  like_count?: number
  status: 'pending' | 'reviewed' | 'approved' | 'rewarded' | 'rejected'
  reward_amount?: number
  admin_notes?: string
  created_at: string
}

interface CreatorData {
  profile: {
    id: string
    name: string
    avatar: string
    role: string
    referralCode: string
    referralUrl: string
  }
  financials: {
    totalEarnings: number
    referralEarnings: number
    contentRewards: number
    alreadyWithdrawn: number
    pendingWithdrawal: number
    activeBalance: number
  }
  metrics: {
    totalReferred: number
    totalVideosSubmitted: number
    totalVideosApproved: number
    totalPendingReview: number
  }
  submissions: CreatorSubmission[]
  recentCommissions: Array<{
    id: string
    amount: number
    status: string
    tier_purchased: string
    created_at: string
  }>
  recentWithdrawals: Array<{
    id: string
    amount: number
    status: string
    bank_name: string
    account_number: string
    account_holder: string
    created_at: string
  }>
}

export default function ContentCreatorDashboardPage() {
  const [data, setData] = useState<CreatorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null)

  // Active Tab: 'submissions' | 'referral' | 'creator-kit' | 'payout'
  const [activeTab, setActiveTab] = useState<'submissions' | 'referral' | 'creator-kit' | 'payout'>('submissions')

  // Filter Submissions
  const [platformFilter, setPlatformFilter] = useState<'all' | 'tiktok' | 'instagram' | 'youtube'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Submit Video Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formPlatform, setFormPlatform] = useState<'tiktok' | 'instagram' | 'youtube' | 'other'>('tiktok')
  const [formUrl, setFormUrl] = useState('')
  const [formTopic, setFormTopic] = useState('Rasionalisasi SNBP')
  const [formCaption, setFormCaption] = useState('')
  const [formViews, setFormViews] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  // Withdrawal Modal State
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [bankTarget, setBankTarget] = useState('BCA')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [withdrawError, setWithdrawError] = useState('')

  const loadCreatorData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/creator')
      if (res.ok) {
        const json = await res.json()
        setData(json)
        setWithdrawAmount(String(json.financials?.activeBalance || 50000))
      }
    } catch (err) {
      console.error('Failed to load creator data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCreatorData()
  }, [loadCreatorData])

  // Copy referral code
  const handleCopyCode = () => {
    if (!data?.profile?.referralCode) return
    navigator.clipboard.writeText(data.profile.referralCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // Copy referral link
  const handleCopyLink = () => {
    if (!data?.profile?.referralUrl) return
    navigator.clipboard.writeText(data.profile.referralUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Copy sample viral hook script
  const handleCopyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedScriptId(id)
    setTimeout(() => setCopiedScriptId(null), 2000)
  }

  // Handle Video Submission
  const handleSubmitVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess('')

    if (!formTitle.trim()) {
      setSubmitError('Judul konten wajib diisi.')
      return
    }

    if (!formUrl.trim() || !formUrl.trim().startsWith('http')) {
      setSubmitError('Harap masukkan URL video yang valid (dimulai dengan http/https).')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          platform: formPlatform,
          video_url: formUrl,
          campaign_topic: formTopic,
          caption_used: formCaption,
          view_count: formViews ? parseInt(formViews) : 0,
        }),
      })

      const result = await res.json()
      if (res.ok && result.success) {
        setSubmitSuccess(result.message || 'Konten berhasil disubmit!')
        setFormTitle('')
        setFormUrl('')
        setFormCaption('')
        setFormViews('')
        await loadCreatorData()
        setTimeout(() => {
          setSubmitModalOpen(false)
          setSubmitSuccess('')
        }, 1800)
      } else {
        setSubmitError(result.error || 'Gagal mengirimkan submission.')
      }
    } catch {
      setSubmitError('Terjadi kesalahan jaringan. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Withdrawal Submission
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setWithdrawError('')
    setWithdrawSuccess(false)

    const amountNum = parseInt(withdrawAmount.replace(/[^0-9]/g, ''))
    if (!amountNum || amountNum < 50000) {
      setWithdrawError('Minimal penarikan adalah Rp 50.000')
      return
    }

    if (data && amountNum > (data.financials.activeBalance || 0)) {
      setWithdrawError('Saldo aktif kamu tidak mencukupi untuk penarikan ini.')
      return
    }

    if (!accountNumber.trim() || !accountHolder.trim()) {
      setWithdrawError('Nomor rekening dan nama pemilik rekening wajib diisi.')
      return
    }

    setWithdrawing(true)
    try {
      const res = await fetch('/api/ambassador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNum,
          bank_name: bankTarget,
          account_number: accountNumber.trim(),
          account_holder: accountHolder.trim(),
        }),
      })

      const result = await res.json()
      if (res.ok) {
        setWithdrawSuccess(true)
        await loadCreatorData()
        setTimeout(() => {
          setWithdrawModalOpen(false)
          setWithdrawSuccess(false)
        }, 2200)
      } else {
        setWithdrawError(result.error || 'Gagal memproses penarikan.')
      }
    } catch {
      setWithdrawError('Terjadi kesalahan koneksi.')
    } finally {
      setWithdrawing(false)
    }
  }

  // Filtered submissions
  const filteredSubmissions = (data?.submissions || []).filter((s) => {
    if (platformFilter !== 'all' && s.platform !== platformFilter) return false
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    return true
  })

  // Sample Hook Scripts
  const HOOK_SCRIPTS = [
    {
      id: 'hook-1',
      title: 'Bongkar Masuk UI Jalur Rapor Non-Tes',
      hook: '“Lu kira masuk UI harus ujian tulis CBT atau UTBK doang? Kenalin jalur PPKB UI & Talent Scouting yang cuma modal nilai rapor sama esai!”',
      desc: 'Cocok untuk video edukasi jalur prestasi, sorot keunggulan tidak perlu tes pusing.',
    },
    {
      id: 'hook-2',
      title: 'Kalkulator Rasionalisasi SNBP Otbee',
      hook: '“Jangan nekat pilih prodi impian sebelum lu cek peluang rapor di kalkulator ini! Gratis, dan langsung tau potensi lolos lu berapa persen.”',
      desc: 'Cocok untuk format screen recording / tutorial cek peluang di web OtwPTN.',
    },
    {
      id: 'hook-3',
      title: 'Struktur Esai Motivasi Lolos Fakultas Impian',
      hook: '“Rahasia esai motivasi yang bikin mentee OtwPTN tembus FK & FKM UI: metode STAR tanpa kata-kata klise! Cek AI reviewernya di link bio.”',
      desc: 'Cocok untuk edukasi penulisan esai, personal statement, dan portofolio.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#faf8f4] dark:bg-[#121318] text-gray-900 dark:text-gray-100 font-sans pb-20">
      {/* ── Top Header & Hero Card ────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white p-6 sm:p-10 shadow-xl shadow-amber-500/15">
          {/* Subtle background glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-amber-200 text-xs font-black uppercase tracking-wider border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Official Content Creator Partner</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Halo, {data?.profile?.name || 'Creator OtwPTN'}! 🎬
              </h1>
              <p className="text-sm sm:text-base text-amber-100 font-medium max-w-xl leading-relaxed">
                Kelola submit link konten video kamu, pantau hasil review admin, sebarkan kode referral creator, dan cairkan komisi tunai kamu di sini.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <button
                onClick={() => setSubmitModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-amber-950 font-black text-sm shadow-lg hover:bg-amber-50 active:scale-95 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-amber-600" />
                <span>+ Submit Link Video</span>
              </button>
              <button
                onClick={() => setWithdrawModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-950/40 backdrop-blur-md text-white font-black text-sm border border-white/20 hover:bg-amber-950/60 active:scale-95 transition-all cursor-pointer"
              >
                <Wallet className="w-4 h-4 text-amber-300" />
                <span>Tarik Saldo</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── KPI Stats Cards Grid ────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
          {/* Card 1: Saldo Aktif Siap Cair */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1a1c24] border border-gray-200/90 dark:border-gray-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Saldo Siap Cair</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white">
              {loading ? '...' : formatIDR(data?.financials?.activeBalance || 0)}
            </div>
            <p className="text-[11px] text-gray-400 font-medium mt-1">Bisa ditarik ke rekening / e-wallet</p>
          </div>

          {/* Card 2: Total Penghasilan */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1a1c24] border border-gray-200/90 dark:border-gray-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Penghasilan</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
              {loading ? '...' : formatIDR(data?.financials?.totalEarnings || 0)}
            </div>
            <p className="text-[11px] text-gray-400 font-medium mt-1">Komisi referral + reward konten</p>
          </div>

          {/* Card 3: Total Video Terkirim */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1a1c24] border border-gray-200/90 dark:border-gray-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Video Di-submit</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
                <Film className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white">
              {loading ? '...' : data?.metrics?.totalVideosSubmitted || 0}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              {data?.metrics?.totalVideosApproved || 0} Video disetujui
            </p>
          </div>

          {/* Card 4: Total Mentee / Referral */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1a1c24] border border-gray-200/90 dark:border-gray-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Mentee Terdaftar</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white">
              {loading ? '...' : data?.metrics?.totalReferred || 0}
            </div>
            <p className="text-[11px] text-gray-400 font-medium mt-1">Beli paket pakai kode creator</p>
          </div>
        </div>

        {/* ── Referral Link Quick Share Bar ─────────────────────────────── */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-[#23201a] dark:to-[#1f1b16] border border-amber-200/80 dark:border-amber-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-amber-950 dark:text-amber-200 tracking-wider">
                  Kode Referral Creator Kamu:
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-900 dark:text-amber-300 font-black text-xs font-mono">
                  {data?.profile?.referralCode || 'MEMUAT...'}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                Siswa dapat diskon spesial & kamu dapat komisi uang tunai setiap kali mereka upgrade.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 text-xs font-bold hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-black shadow-xs hover:bg-amber-600 active:scale-95 transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Tersalin!' : 'Salin Link Bio'}</span>
            </button>
          </div>
        </div>

        {/* ── Main Dashboard Tabs Navigation ────────────────────────────── */}
        <div className="flex items-center gap-2 mt-8 border-b border-gray-200 dark:border-gray-800 pb-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'submissions', label: 'Tracking Video Konten', icon: Video, badge: data?.submissions?.length },
            { id: 'referral', label: 'Komisi & Referral', icon: Users },
            { id: 'creator-kit', label: 'Creator Kit & Materi', icon: Download },
            { id: 'payout', label: 'Tarik Saldo', icon: Wallet },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      active ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── TAB 1: SUBMISSIONS & TRACKING ─────────────────────────────── */}
        {activeTab === 'submissions' && (
          <div className="mt-6 space-y-6">
            {/* Filter & Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-400 mr-1">Platform:</span>
                {(['all', 'tiktok', 'instagram', 'youtube'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatformFilter(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                      platformFilter === p
                        ? 'bg-gray-950 dark:bg-white text-white dark:text-gray-950'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {p === 'all' ? 'Semua Platform' : p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSubmitModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-black shadow-xs hover:bg-amber-600 active:scale-95 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Submit Konten Baru</span>
              </button>
            </div>

            {/* Submissions List Card */}
            <div className="bg-white dark:bg-[#1a1c24] rounded-2xl border border-gray-200/90 dark:border-gray-800 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-950 dark:text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-500" />
                  <span>Daftar Konten yang Di-submit ({filteredSubmissions.length})</span>
                </h3>
                <span className="text-xs text-gray-400 font-medium">Review admin maksimal 1x24 jam kerja</span>
              </div>

              {filteredSubmissions.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 mx-auto flex items-center justify-center">
                    <Video className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Belum ada video yang disubmit</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Kirimkan link konten TikTok, Reels, atau YouTube Shorts kamu sekarang untuk ditinjau oleh tim marketing OtwPTN.
                  </p>
                  <button
                    onClick={() => setSubmitModalOpen(true)}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Submit Konten Sekarang</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredSubmissions.map((sub) => {
                    const statusConfig = {
                      pending: { label: 'Menunggu Review', bg: 'bg-amber-100 dark:bg-amber-950/50', text: 'text-amber-800 dark:text-amber-300', icon: Clock },
                      reviewed: { label: 'Sedang Ditinjau', bg: 'bg-blue-100 dark:bg-blue-950/50', text: 'text-blue-800 dark:text-blue-300', icon: Eye },
                      approved: { label: 'Disetujui & Aktif', bg: 'bg-emerald-100 dark:bg-emerald-950/50', text: 'text-emerald-800 dark:text-emerald-300', icon: CheckCircle2 },
                      rewarded: { label: 'Reward Cair', bg: 'bg-purple-100 dark:bg-purple-950/50', text: 'text-purple-800 dark:text-purple-300', icon: Award },
                      rejected: { label: 'Perlu Revisi', bg: 'bg-red-100 dark:bg-red-950/50', text: 'text-red-800 dark:text-red-300', icon: XCircle },
                    }[sub.status] || { label: sub.status, bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock }

                    const StatusIcon = statusConfig.icon

                    return (
                      <div key={sub.id} className="p-4 sm:p-5 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10.5px] font-black uppercase tracking-wider">
                              {sub.platform}
                            </span>
                            {sub.campaign_topic && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[10.5px] font-bold">
                                {sub.campaign_topic}
                              </span>
                            )}
                            <span className="text-[11px] text-gray-400">
                              {new Date(sub.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {sub.title}
                          </h4>

                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <a
                              href={sub.video_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold hover:underline"
                            >
                              <span>Buka Video URL</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            {sub.view_count ? (
                              <span>• {sub.view_count.toLocaleString('id-ID')} views</span>
                            ) : null}
                          </div>

                          {sub.admin_notes && (
                            <div className="mt-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300">
                              <span className="font-bold text-amber-600 dark:text-amber-400">Catatan Admin: </span>
                              {sub.admin_notes}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0 self-start md:self-center">
                          {sub.reward_amount ? (
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-gray-400 block">Reward Fee</span>
                              <span className="text-sm font-black text-purple-600 dark:text-purple-400">
                                +{formatIDR(sub.reward_amount)}
                              </span>
                            </div>
                          ) : null}

                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{statusConfig.label}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: REFERRAL & KOMISI ──────────────────────────────────── */}
        {activeTab === 'referral' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Kolom 1: Skema Komisi Creator */}
              <div className="md:col-span-1 p-6 rounded-2xl bg-white dark:bg-[#1a1c24] border border-gray-200/90 dark:border-gray-800 space-y-4">
                <h3 className="text-base font-black text-gray-950 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Skema Komisi Creator</span>
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Dapatkan komisi uang tunai setiap kali ada siswa yang mendaftar paket bimbingan menggunakan kode referral unik kamu:
                </p>

                <div className="space-y-2.5 pt-2">
                  {[
                    { tier: 'Paket Intensif Royal Jelly', komisi: 'Rp 200.000 / siswa', badge: 'Terbesar' },
                    { tier: 'Paket Menyeluruh (Honeycomb)', komisi: 'Rp 100.000 / siswa', badge: 'Populer' },
                    { tier: 'Paket Dokumen / Esai (Nectar)', komisi: 'Rp 50.000 / siswa' },
                    { tier: 'Akun Web Premium', komisi: 'Rp 15.000 / siswa' },
                  ].map((row, i) => (
                    <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span>{row.tier}</span>
                          {row.badge && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500 text-white">
                              {row.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {row.komisi}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kolom 2: Riwayat Komisi Masuk */}
              <div className="md:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#1a1c24] border border-gray-200/90 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-gray-950 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <span>Riwayat Komisi Referral ({data?.recentCommissions?.length || 0})</span>
                  </h3>
                  <span className="text-xs text-gray-400 font-medium">Terhubung otomatis ke checkout</span>
                </div>

                {(!data?.recentCommissions || data.recentCommissions.length === 0) ? (
                  <div className="p-10 text-center space-y-2">
                    <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Belum ada transaksi referral.</p>
                    <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                      Cantumkan link referral di bio Instagram & video TikTok kamu untuk mulai mengumpulkan komisi.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {data.recentCommissions.map((comm) => (
                      <div key={comm.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">
                            Upgrade Paket: {comm.tier_purchased}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {new Date(comm.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                            +{formatIDR(comm.amount)}
                          </span>
                          <span className="text-[10px] font-bold block text-gray-400 uppercase">
                            {comm.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: CREATOR KIT & MATERI PROMOSI ────────────────────────── */}
        {activeTab === 'creator-kit' && (
          <div className="mt-6 space-y-6">
            {/* Asset Bank Download */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1a1c24] border border-gray-200/90 dark:border-gray-800 space-y-4">
              <h3 className="text-base font-black text-gray-950 dark:text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-500" />
                <span>Asset Bank & Logo Transparan HD</span>
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Gunakan aset resmi OtwPTN untuk dimasukkan ke dalam video TikTok, Reels, atau thumbnail YouTube kamu:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {[
                  { name: 'Maskot Otbee 3D HD', format: 'PNG Transparan (High Res)', link: '/brand/body/body.webp' },
                  { name: 'Logo OtwPTN Utama', format: 'PNG Transparan (Adaptive)', link: '/logo.png' },
                  { name: 'Icon Otbee Launcher', format: 'Icon Maskot 512x512', link: '/icon.png' },
                ].map((asset, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 dark:text-white">{asset.name}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">{asset.format}</p>
                    </div>
                    <a
                      href={asset.link}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Aset</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Viral Hook Script Templates */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1a1c24] border border-gray-200/90 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-gray-950 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Formula Hook 3 Detik Pertama (Terbukti Viral)</span>
                </h3>
                <span className="text-xs text-gray-400 font-medium">Bisa langsung disalin</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {HOOK_SCRIPTS.map((script) => (
                  <div key={script.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-black text-amber-900 dark:text-amber-200">{script.title}</h4>
                      <p className="text-xs text-gray-800 dark:text-gray-200 font-medium leading-relaxed italic">
                        {script.hook}
                      </p>
                      <p className="text-[10.5px] text-gray-400">{script.desc}</p>
                    </div>

                    <button
                      onClick={() => handleCopyScript(script.id, script.hook)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      {copiedScriptId === script.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScriptId === script.id ? 'Tersalin!' : 'Salin Script Hook'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Do's and Don'ts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>DO&apos;S (Sangat Disarankan)</span>
                </h4>
                <ul className="text-xs text-emerald-950 dark:text-emerald-200 space-y-1.5 list-disc pl-4">
                  <li>Tampilkan demonstrasi web langsung (Kalkulator Peluang / Essay Review).</li>
                  <li>Sertakan kode referral di caption dan link pendaftaran di bio akunmu.</li>
                  <li>Gunakan sound trending dengan volume latar belakang 15-20%.</li>
                  <li>Tag akun resmi @otwptn di caption dan deskripsi video.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 space-y-2">
                <h4 className="text-xs font-black text-red-900 dark:text-red-300 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>DON&apos;TS (Dilarang Keras)</span>
                </h4>
                <ul className="text-xs text-red-950 dark:text-red-200 space-y-1.5 list-disc pl-4">
                  <li>Jangan menjanjikan klaim palsu 100% lolos tanpa seleksi resmi universitas.</li>
                  <li>Jangan menjelekkan atau merendahkan bimbingan belajar atau universitas lain.</li>
                  <li>Jangan memakai visual vulgar atau melanggar hak cipta musik tanpa lisensi.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: TARIK SALDO & PAYOUT ───────────────────────────────── */}
        {activeTab === 'payout' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Form Penarikan */}
              <div className="md:col-span-1 p-6 rounded-2xl bg-white dark:bg-[#1a1c24] border border-gray-200/90 dark:border-gray-800 space-y-4">
                <h3 className="text-base font-black text-gray-950 dark:text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-500" />
                  <span>Tarik Saldo Komisi</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Saldo aktif kamu: <strong>{formatIDR(data?.financials?.activeBalance || 0)}</strong>. Minimal penarikan Rp 50.000.
                </p>

                <button
                  onClick={() => setWithdrawModalOpen(true)}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 text-white font-black text-xs shadow-md hover:bg-amber-600 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Ajukan Penarikan Dana</span>
                </button>
              </div>

              {/* Riwayat Penarikan */}
              <div className="md:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#1a1c24] border border-gray-200/90 dark:border-gray-800 space-y-4">
                <h3 className="text-base font-black text-gray-950 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>Riwayat Pengajuan Penarikan</span>
                </h3>

                {(!data?.recentWithdrawals || data.recentWithdrawals.length === 0) ? (
                  <div className="p-8 text-center text-xs text-gray-400">
                    Belum ada riwayat penarikan dana.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {data.recentWithdrawals.map((w) => (
                      <div key={w.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">
                            {w.bank_name} - {w.account_number} ({w.account_holder})
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {new Date(w.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-gray-900 dark:text-white">
                            {formatIDR(w.amount)}
                          </span>
                          <span className={`text-[10px] font-bold block uppercase ${
                            w.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {w.status === 'paid' ? 'Berhasil Ditransfer' : 'Menunggu Transfer'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: SUBMIT LINK VIDEO KONTEN ───────────────────────────── */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1c24] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-950 dark:text-white">Submit Video Konten Baru</h3>
                  <p className="text-xs text-gray-400">Kirimkan link konten yang sudah kamu upload</p>
                </div>
              </div>
              <button
                onClick={() => setSubmitModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitVideo} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Judul / Hook Video <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rahasia Masuk UI Jalur Rapor Tanpa Tes!"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Platform <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-hidden"
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram Reels</option>
                    <option value="youtube">YouTube Shorts</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Topik Campaign
                  </label>
                  <select
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-hidden"
                  >
                    <option value="Rasionalisasi SNBP">Rasionalisasi SNBP</option>
                    <option value="Review Esai UI (PPKB)">Review Esai UI (PPKB)</option>
                    <option value="Jalur Ketua OSIS & Prestasi">Jalur Ketua OSIS & Prestasi</option>
                    <option value="Unboxing Mentor OtwPTN">Unboxing Mentor OtwPTN</option>
                    <option value="Diskon & Promo Referral">Diskon & Promo Referral</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Link Video URL (TikTok / Reels / Shorts) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://vt.tiktok.com/... atau https://instagram.com/reel/..."
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Estimasi Views Saat Ini (Opsional)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 15000"
                  value={formViews}
                  onChange={(e) => setFormViews(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Catatan untuk Tim Admin (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Sudah tag @otwptn dan link referral ada di bio ya kak!"
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-white text-xs font-black shadow-md hover:bg-amber-600 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Video</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: TARIK SALDO ────────────────────────────────────────── */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1c24] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-950 dark:text-white">Tarik Saldo Komisi</h3>
                  <p className="text-xs text-gray-400">Transfer ke rekening bank atau e-wallet kamu</p>
                </div>
              </div>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {withdrawError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                {withdrawError}
              </div>
            )}

            {withdrawSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Pengajuan berhasil! Dana akan ditransfer dalam 1x24 jam kerja.</span>
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Nominal Penarikan (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={50000}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
                <span className="text-[10.5px] text-gray-400 mt-1 block">
                  Saldo aktif saat ini: {formatIDR(data?.financials?.activeBalance || 0)}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Bank / E-Wallet Tujuan <span className="text-red-500">*</span>
                </label>
                <select
                  value={bankTarget}
                  onChange={(e) => setBankTarget(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                >
                  <option value="BCA">BCA (Bank Central Asia)</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                  <option value="BNI">BNI (Bank Negara Indonesia)</option>
                  <option value="Bank Jago">Bank Jago</option>
                  <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                  <option value="GoPay">GoPay</option>
                  <option value="OVO">OVO</option>
                  <option value="DANA">DANA</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Nomor Rekening / No. HP E-Wallet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1234567890"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Nama Lengkap Pemilik Rekening <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Harus sesuai dengan buku tabungan / e-wallet"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={withdrawing}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-md hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {withdrawing ? 'Memproses...' : 'Kirim Permintaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
