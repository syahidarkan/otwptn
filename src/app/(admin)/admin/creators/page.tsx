'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Video,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Smartphone,
  GraduationCap,
  Eye,
  RefreshCw,
  Send,
  X,
  UserCheck,
  UserX,
  Calendar,
  Camera,
} from 'lucide-react'

function InstagramIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

interface CareerApplication {
  id: string
  reference_id: string
  position: string
  full_name: string
  phone: string
  email: string
  age: string
  education_status: string
  school_or_campus: string
  instagram: string
  tiktok: string | null
  portfolio_link: string | null
  phone_model: string
  reason: string
  status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected'
  created_at: string
}

export default function AdminCreatorsPage() {
  const [applications, setApplications] = useState<CareerApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedApp, setSelectedApp] = useState<CareerApplication | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/career-applications')
      if (res.ok) {
        const data = await res.json()
        setApplications(data.applications || [])
      }
    } catch (err) {
      console.error('Error fetching applications:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/admin/career-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus as CareerApplication['status'] } : app))
        )
        if (selectedApp?.id === id) {
          setSelectedApp((prev) => (prev ? { ...prev, status: newStatus as CareerApplication['status'] } : null))
        }
        setNotification(`Status pelamar berhasil diperbarui menjadi "${newStatus}"!`)
        setTimeout(() => setNotification(null), 4000)
      } else {
        const errorData = await res.json()
        alert('Gagal update status: ' + (errorData.error || 'Terjadi kesalahan'))
      }
    } catch {
      alert('Gagal memperbarui status. Periksa koneksi.')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatWAUrl = (phone: string, name: string, refId: string, status: string) => {
    let cleanPhone = phone.replace(/[^0-9]/g, '')
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1)
    }

    let message = `Halo Kak ${name}! ✨\n\nKami dari Talent & Marketing Team OTWPTN (Ref: ${refId}).\n\nTerima kasih telah mendaftar sebagai Content Creator / Marketing Partner OTWPTN.`

    if (status === 'interview') {
      message += ` Portofolio kamu menarik sekali! Kami ingin mengundang kamu untuk sesi bincang santai/interview online mengenai kolaborasi pembuatan konten.\n\nKira-kira kapan kamu ada waktu luang untuk briefing singkat? Terima kasih!`
    } else if (status === 'accepted') {
      message += ` Selamat, kamu resmi terpilih untuk bergabung dalam Tim Creator OTWPTN! 🎉\n\nBerikut langkah selanjutnya untuk orientasi dan pembagian brief konten perdana kamu.`
    } else {
      message += ` Kami sedang mereview portofolio kamu. Ada beberapa hal yang ingin kami tanyakan seputar konten yang pernah kamu buat.`
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
  }

  // Filtered applications
  const filtered = applications.filter((app) => {
    const matchSearch =
      app.full_name.toLowerCase().includes(search.toLowerCase()) ||
      app.school_or_campus.toLowerCase().includes(search.toLowerCase()) ||
      app.phone.includes(search) ||
      app.reference_id.toLowerCase().includes(search.toLowerCase()) ||
      (app.tiktok && app.tiktok.toLowerCase().includes(search.toLowerCase())) ||
      (app.instagram && app.instagram.toLowerCase().includes(search.toLowerCase()))

    const matchStatus = statusFilter === 'all' || app.status === statusFilter
    return matchSearch && matchStatus
  })

  // Summary counts
  const total = applications.length
  const pendingCount = applications.filter((a) => a.status === 'pending').length
  const interviewCount = applications.filter((a) => a.status === 'interview').length
  const acceptedCount = applications.filter((a) => a.status === 'accepted').length
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Diterima
          </span>
        )
      case 'interview':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Interview
          </span>
        )
      case 'reviewed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
            <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            Di-review
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
            <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            Ditolak
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Menunggu Review
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary mb-2">
            <Video className="w-3.5 h-3.5" />
            Talent Acquisition & Marketing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Pendaftaran Konten Kreator
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola pendaftar Marketing Partner (Content Creator), review portofolio video, dan hubungi kandidat via WhatsApp.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Pelamar</p>
          <p className="text-2xl font-black text-foreground mt-1">{total}</p>
        </div>
        <div className="bg-card border border-amber-200/50 dark:border-amber-900/40 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Menunggu Review</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-card border border-blue-200/50 dark:border-blue-900/40 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Interview</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{interviewCount}</p>
        </div>
        <div className="bg-card border border-emerald-200/50 dark:border-emerald-900/40 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Diterima</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{acceptedCount}</p>
        </div>
        <div className="bg-card border border-red-200/50 dark:border-red-900/40 rounded-2xl p-4 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs font-medium text-red-700 dark:text-red-400">Ditolak</p>
          <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama, kampus, WhatsApp, ID, atau medsos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0 ml-1" />
          {(
            [
              { id: 'all', label: 'Semua' },
              { id: 'pending', label: 'Menunggu' },
              { id: 'interview', label: 'Interview' },
              { id: 'accepted', label: 'Diterima' },
              { id: 'rejected', label: 'Ditolak' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-card border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-primary mb-3" />
            <p className="text-sm text-muted-foreground font-medium">Memuat data pendaftar...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center px-4">
            <Video className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-base font-bold text-foreground">Tidak ada pendaftar ditemukan</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || statusFilter !== 'all'
                ? 'Coba ganti filter atau kata kunci pencarian kamu.'
                : 'Belum ada pengajuan pendaftaran konten kreator baru.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Pelamar & Ref ID</th>
                  <th className="py-3.5 px-4">Pendidikan & Umur</th>
                  <th className="py-3.5 px-4">Device HP</th>
                  <th className="py-3.5 px-4">Portofolio & Sosmed</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 align-top">
                      <div className="font-bold text-foreground">{app.full_name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{app.reference_id}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(app.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    <td className="py-4 px-4 align-top">
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        <GraduationCap className="w-4 h-4 text-brand-primary shrink-0" />
                        <span className="truncate max-w-[200px]" title={app.school_or_campus}>
                          {app.school_or_campus}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {app.education_status} • {app.age} tahun
                      </div>
                    </td>

                    <td className="py-4 px-4 align-top">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs font-medium text-foreground">
                        <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
                        {app.phone_model}
                      </div>
                    </td>

                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-col gap-1.5">
                        {app.portfolio_link ? (
                          <a
                            href={app.portfolio_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Buka Portofolio Video
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {app.instagram && (
                            <span className="inline-flex items-center gap-1">
                              <InstagramIcon className="w-3 h-3 text-pink-500" />
                              {app.instagram}
                            </span>
                          )}
                          {app.tiktok && (
                            <span className="inline-flex items-center gap-1">
                              <Video className="w-3 h-3 text-cyan-500" />
                              {app.tiktok}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 align-top">{getStatusBadge(app.status)}</td>

                    <td className="py-4 px-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Lihat Detail Lengkap"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={formatWAUrl(app.phone, app.full_name, app.reference_id, app.status)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                          title="Chat via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-muted px-2.5 py-1 rounded-md text-foreground">
                    {selectedApp.reference_id}
                  </span>
                  {getStatusBadge(selectedApp.status)}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground mt-2">{selectedApp.full_name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mendaftar pada{' '}
                  {new Date(selectedApp.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 text-sm">
              <div className="p-3.5 bg-muted/40 rounded-2xl">
                <p className="text-xs text-muted-foreground font-medium">Asal Sekolah / Kampus</p>
                <p className="font-bold text-foreground mt-1">{selectedApp.school_or_campus}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedApp.education_status}</p>
              </div>
              <div className="p-3.5 bg-muted/40 rounded-2xl">
                <p className="text-xs text-muted-foreground font-medium">Usia & Perangkat HP</p>
                <p className="font-bold text-foreground mt-1">{selectedApp.age} Tahun</p>
                <p className="text-xs text-muted-foreground mt-0.5">Device: {selectedApp.phone_model}</p>
              </div>
              <div className="p-3.5 bg-muted/40 rounded-2xl">
                <p className="text-xs text-muted-foreground font-medium">Kontak & WhatsApp</p>
                <p className="font-bold text-foreground mt-1">{selectedApp.phone}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedApp.email}</p>
              </div>
              <div className="p-3.5 bg-muted/40 rounded-2xl">
                <p className="text-xs text-muted-foreground font-medium">Media Sosial</p>
                <p className="font-bold text-foreground mt-1">IG: {selectedApp.instagram}</p>
                <p className="text-xs text-muted-foreground mt-0.5">TikTok: {selectedApp.tiktok || '-'}</p>
              </div>
            </div>

            {/* Portofolio & Link */}
            <div className="p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl mb-5">
              <p className="text-xs font-semibold text-brand-primary mb-1">Link Portofolio Video</p>
              {selectedApp.portfolio_link ? (
                <a
                  href={selectedApp.portfolio_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-brand-primary hover:underline break-all inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  {selectedApp.portfolio_link}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">Tidak melampirkan link</p>
              )}
            </div>

            {/* Alasan Bergabung */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Alasan & Minat Bergabung
              </h3>
              <div className="p-4 bg-muted/50 rounded-2xl text-sm text-foreground whitespace-pre-wrap leading-relaxed border border-border">
                {selectedApp.reason}
              </div>
            </div>

            {/* Status Change & Actions */}
            <div className="border-t border-border pt-5">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Ubah Status & Kontak Kandidat
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  disabled={updatingId === selectedApp.id}
                  onClick={() => handleUpdateStatus(selectedApp.id, 'reviewed')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    selectedApp.status === 'reviewed'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'border-border text-foreground hover:bg-muted'
                  }`}
                >
                  Tandai Di-review
                </button>
                <button
                  disabled={updatingId === selectedApp.id}
                  onClick={() => handleUpdateStatus(selectedApp.id, 'interview')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    selectedApp.status === 'interview'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-border text-foreground hover:bg-muted'
                  }`}
                >
                  Jadwalkan Interview
                </button>
                <button
                  disabled={updatingId === selectedApp.id}
                  onClick={() => handleUpdateStatus(selectedApp.id, 'accepted')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    selectedApp.status === 'accepted'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-border text-foreground hover:bg-muted'
                  }`}
                >
                  Terima (Accepted)
                </button>
                <button
                  disabled={updatingId === selectedApp.id}
                  onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    selectedApp.status === 'rejected'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'border-border text-foreground hover:bg-muted'
                  }`}
                >
                  Tolak (Rejected)
                </button>

                <div className="flex-1 min-w-[20px]" />

                <a
                  href={formatWAUrl(selectedApp.phone, selectedApp.full_name, selectedApp.reference_id, selectedApp.status)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Hubungi via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
