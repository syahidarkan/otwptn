'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, X, Share2, Copy, Sparkles, ArrowRight, Scan, FileText, Calendar, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface OrderInfo {
  tier_name: string
  tier_code?: string
  mode: 'individu' | 'squad'
  squad_invite_code: string | null
  squad_status: string | null
}

const TIER_ONBOARDING: Record<string, { title: string; subtitle: string; tasks: { title: string; desc: string; href: string }[] }> = {
  web_premium: {
    title: 'Selamat Datang di Akun Premium!',
    subtitle: 'Seluruh fitur AI dan modul materi telah terbuka penuh untukmu.',
    tasks: [
      { title: 'Hitung Peluang Rapor 5 Semester', desc: 'Gunakan kalkulator AI untuk menganalisis akurasi nilai dan konsistensi tren.', href: '/dashboard/kalkulator' },
      { title: 'Review Esai Otomatis dengan AI', desc: 'Koreksi hook pembuka dan struktur esai motivasi secara instan.', href: '/dashboard/essay' },
      { title: 'Pelajari 110 Modul E-Course', desc: 'Buka strategi lengkap lolos seleksi SNBP dan jalur mandiri top PTN.', href: '/dashboard/ecourse' },
    ],
  },
  review: {
    title: 'Selamat Datang di Paket Nectar!',
    subtitle: 'Esai dan berkas prestasimu akan direview langsung kalimat demi kalimat oleh mentor alumni.',
    tasks: [
      { title: 'Siapkan Draf Esai Motivasi', desc: 'Tulis naskah esaimu minimal 250 kata untuk diulas secara mendalam.', href: '/dashboard/mentor' },
      { title: 'Submit ke Mentor Alumni', desc: 'Kirim dokumen di tab Dokumen Bimbingan untuk mendapatkan revisi 2 putaran.', href: '/dashboard/mentor' },
      { title: 'Cek Rekomendasi Validasi Berkas', desc: 'Pantau catatan kurasi mentor sebelum berkas diunggah ke portal resmi.', href: '/dashboard/tracking-jalur' },
    ],
  },
  dokumen: {
    title: 'Selamat Datang di Paket Honeycomb!',
    subtitle: 'Bimbingan intensif 5x putaran revisi plus 2x sesi privat Zoom bersama mentor alumni.',
    tasks: [
      { title: 'Lengkapi Data Profil & Rapor', desc: 'Isi profil sekolah dan target prodi agar mentor memahami latar belakangmu.', href: '/profil' },
      { title: 'Upload 3 Sertifikat Tertinggi', desc: 'Kurasi sertifikat Puspresnas atau kejuaraan untuk dibedah bobot poinnya.', href: '/dashboard/tracking-jalur' },
      { title: 'Booking Sesi Google Meet 1-on-1', desc: 'Pilih jadwal bimbingan privat 45 menit langsung dengan kakak mentor.', href: '/dashboard/mentor?tab=booking' },
    ],
  },
  menyeluruh: {
    title: 'Selamat Datang di Paket Royal Jelly (VIP)!',
    subtitle: 'Pendampingan prioritas penuh: Unlimited revisi, sesi privat, dan audit rapor non-AI.',
    tasks: [
      { title: 'Scan OCR Rapor 5 Semester', desc: 'Ekstraksi otomatis nilai bukumu untuk diaudit linieritasnya oleh mentor.', href: '/dashboard/mentor?tab=profile-rapor' },
      { title: 'Jadwalkan Konsultasi Prioritas', desc: 'Temui mentor alumni prodi impianmu via Google Meet untuk evaluasi total.', href: '/dashboard/mentor?tab=booking' },
      { title: 'Siapkan Portofolio & Esai Lengkap', desc: 'Manfaatkan revisi tanpa batas hingga naskah 100% sempurna dan siap kirim.', href: '/dashboard/mentor' },
    ],
  },
}

export default function PaymentSuccessBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderInfo | null>(null)
  const [activeTier, setActiveTier] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const isPaymentSuccess = searchParams.get('payment') === 'success' || searchParams.get('upgrade_success') === '1'
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single()
      const currentTier = profile?.tier || 'free'

      if (currentTier !== 'free') {
        const seenTier = typeof window !== 'undefined' ? localStorage.getItem('otwptn_welcome_seen_tier') : null
        if (isPaymentSuccess || seenTier !== currentTier) {
          setActiveTier(currentTier)
          setIsOpen(true)
        }
      }

      if (isPaymentSuccess) {
        fetch('/api/payment/latest-order')
          .then(res => res.json())
          .then(data => {
            if (data.order) setOrder(data.order)
            router.replace('/dashboard', { scroll: false })
          })
          .catch(() => {})
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isOpen || !activeTier) return null

  const tierKey = activeTier === 'intensif' ? 'menyeluruh' : activeTier
  const onboarding = TIER_ONBOARDING[tierKey] ?? TIER_ONBOARDING.web_premium

  function dismiss() {
    if (typeof window !== 'undefined' && activeTier) {
      localStorage.setItem('otwptn_welcome_seen_tier', activeTier)
    }
    setIsOpen(false)
    setOrder(null)
  }

  function copyCode() {
    if (!order?.squad_invite_code) return
    navigator.clipboard.writeText(order.squad_invite_code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {})
  }

  function shareWhatsApp() {
    if (!order?.squad_invite_code) return
    const text = `Yuk gabung squad bimbingan ${order.tier_name} di otwptn bareng aku! Pakai kode undangan: ${order.squad_invite_code}\n\nDaftar & masukkan kodenya di: ${window.location.origin}/upgrade`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl p-6 md:p-8 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={dismiss}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer transition-colors"
          aria-label="Tutup"
        >
          <X size={15} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md">
            <Sparkles size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block">
              Akun Resmi Aktif
            </span>
            <h3 className="text-lg md:text-xl font-black text-gray-950 leading-tight">
              {onboarding.title}
            </h3>
          </div>
        </div>

        <p className="text-xs text-gray-600 font-medium mb-6 leading-relaxed">
          {onboarding.subtitle}
        </p>

        {order?.mode === 'squad' && order.squad_invite_code && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-3 mb-6">
            <p className="text-[11px] font-black uppercase tracking-wider text-amber-700">
              {order.squad_status === 'active' ? 'Squad Kamu Sudah Lengkap' : 'Ajak 2 Teman ke Squad-mu'}
            </p>
            {order.squad_status !== 'active' && (
              <>
                <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-200">
                  <span className="text-xl font-black tracking-widest text-amber-900">{order.squad_invite_code}</span>
                  <button onClick={copyCode} className="text-amber-700 hover:text-amber-900 cursor-pointer">
                    <Copy size={16} />
                  </button>
                </div>
                {copied && <p className="text-[10px] text-emerald-600 font-bold">Kode berhasil disalin!</p>}
                <button
                  onClick={shareWhatsApp}
                  className="w-full py-2.5 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors cursor-pointer"
                >
                  <Share2 size={14} /> Bagikan Undangan ke WhatsApp
                </button>
              </>
            )}
          </div>
        )}

        {/* Step checklist */}
        <div className="space-y-2.5 mb-6">
          <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
            Langkah Awal yang Disarankan
          </p>
          {onboarding.tasks.map((task, i) => (
            <Link
              key={i}
              href={task.href}
              onClick={dismiss}
              className="flex items-start gap-3 p-3.5 rounded-2xl border border-gray-100 hover:border-amber-300 bg-gray-50/70 hover:bg-amber-50/40 transition-colors group cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0 text-[10px] font-black mt-0.5 group-hover:bg-amber-400">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-900 group-hover:text-amber-950 flex items-center justify-between">
                  <span>{task.title}</span>
                  <ArrowRight size={13} className="text-gray-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
                </p>
                <p className="text-[11px] text-gray-500 font-medium leading-snug mt-0.5">{task.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={dismiss}
            className="flex-1 py-3 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-extrabold transition-colors cursor-pointer"
          >
            Masuk ke Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
