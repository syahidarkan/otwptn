'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Check,
  ShieldCheck,
  Star,
  X,
  Loader2,
  User,
  Mail,
  CreditCard,
  QrCode,
  Building2,
  Smartphone,
  Users,
  UserCircle2,
  Gift,
  ArrowRight,
} from 'lucide-react'
import { LEGAL_ENTITY } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import {
  MODES,
  TRACKS,
  TIERS,
  TIER_LABELS,
  TIER_TAGLINES,
  TIER_PERIOD,
  TIER_BADGE,
  TIER_POPULAR,
  FEATURES,
  getPrice,
  formatIDR,
  type Mode,
  type Track,
  type Tier,
} from '@/lib/pricing'

const MODE_LABELS: Record<Mode, string> = { individu: 'Individu', squad: 'Squad' }
const MODE_SUBTITLE: Record<Mode, string> = {
  individu: 'Satu mentor, 100% fokus ke kamu aja.',
  squad: 'Ajak 2 temen seperjuangan, satu mentor pegang kalian bertiga, lebih hemat.',
}
const TRACK_LABELS: Record<Track, string> = {
  essay: 'Essay Only',
  prestasi: 'Prestasi Only',
  hybrid: 'Essay + Prestasi',
}

interface Selection {
  tier: Tier
  mode: Mode
  track: Track
}

export default function UpgradePage() {
  const [mode, setMode] = useState<Mode>('individu')
  const [track, setTrack] = useState<Track>('essay')
  const [referralCode, setReferralCode] = useState('')
  const [squadAction, setSquadAction] = useState<'create' | 'join'>('create')
  const [squadInviteCode, setSquadInviteCode] = useState('')

  const [selection, setSelection] = useState<Selection | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref')
    if (ref) setReferralCode(ref.trim().toUpperCase().slice(0, 24))
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserInfo({
          name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? 'Pengguna',
          email: user.email ?? '',
        })
      }
    })
  }, [])

  // Squad mode doesn't offer the Hybrid track toggle in the price. Price is flat per tier
  // regardless of track, but we still let people pick which track the squad focuses on.
  useEffect(() => {
    if (mode === 'squad' && track === 'hybrid') setTrack('essay')
  }, [mode, track])

  async function handleCheckout() {
    if (!selection) return
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selection.tier,
          mode: selection.mode,
          track: selection.track,
          payment_method: 'mayar',
          referral_code: selection.mode === 'individu' && referralCode.trim() ? referralCode.trim() : undefined,
          squad_action: selection.mode === 'squad' ? squadAction : undefined,
          squad_invite_code: selection.mode === 'squad' && squadAction === 'join' ? squadInviteCode.trim() : undefined,
        }),
      })
      const data = await res.json()
      if (res.status === 401) {
        window.location.href = `/login?redirect=/upgrade`
        return
      }
      if (!res.ok) {
        setError(data.error ?? 'Gagal memproses. Coba lagi.')
        return
      }
      if (data.payment_url) {
        window.location.href = data.payment_url
      }
    } catch {
      setError('Koneksi gagal. Periksa internet dan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedPrice = selection ? getPrice(selection.mode, selection.track, selection.tier) : null
  const selectedFinalAmount =
    selection?.mode === 'individu' && referralCode.trim() && selectedPrice?.referralAmount
      ? selectedPrice.referralAmount
      : selectedPrice?.amount

  return (
    <div className="min-h-screen bg-[#fcfcfb] pt-24 md:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
            Pilih jalanmu, kami kawal sampai lolos
          </h1>
          <p className="text-sm sm:text-base font-medium text-gray-500 leading-relaxed">
            Dari sekadar cek peluang sendiri sampai digandeng mentor yang udah pernah lolos di jalur yang sama persis. Tinggal pilih seberapa deket kamu mau didampingi, harganya otomatis nyesuain. Diselenggarakan di bawah naungan resmi <strong>{LEGAL_ENTITY.name}</strong>.
          </p>
        </div>

        {/* Langkah 1: Mode Toggle */}
        <div className="max-w-2xl mx-auto mb-8">
          <p className="text-center text-[11px] font-black uppercase tracking-wider text-gray-400 mb-3">
            Langkah 1: Mode Mentoring
          </p>
          <div className="grid grid-cols-2 gap-3">
            {MODES.map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                  mode === m ? 'border-amber-400 bg-amber-50 shadow-md' : 'border-gray-100 bg-white hover:border-amber-200'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  mode === m ? 'bg-amber-400 text-amber-950' : 'bg-gray-100 text-gray-500'
                }`}>
                  {m === 'individu' ? <UserCircle2 size={18} /> : <Users size={18} />}
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">{MODE_LABELS[m]}</p>
                  <p className="text-[10px] text-gray-500 font-medium leading-snug">{MODE_SUBTITLE[m]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Langkah 2: Track Toggle */}
        <div className="max-w-2xl mx-auto mb-4">
          <p className="text-center text-[11px] font-black uppercase tracking-wider text-gray-400 mb-3">
            Langkah 2: Cakupan Bantuan
          </p>
          <div className={`grid gap-2 ${mode === 'squad' ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {TRACKS.filter(t => mode === 'individu' || t !== 'hybrid').map(t => (
              <button
                key={t}
                onClick={() => setTrack(t)}
                className={`py-2.5 rounded-full text-xs font-bold transition-all ${
                  track === t ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {TRACK_LABELS[t]}
              </button>
            ))}
          </div>
          <p className="text-center text-[11px] text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
            {mode === 'individu'
              ? 'Harga di bawah buat satu cakupan aja (Essay atau Prestasi). Butuh dua-duanya? Pilih "Essay + Prestasi". Harga naik, tapi satu mentor pegang semuanya.'
              : 'Mode Squad pakai harga tetap, nggak ikut toggle cakupan ini.'}
          </p>
        </div>

        {/* Squad create/join sub-flow */}
        {mode === 'squad' && (
          <div className="max-w-md mx-auto mb-8 p-4 rounded-2xl bg-white border border-amber-200 shadow-sm">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setSquadAction('create')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  squadAction === 'create' ? 'bg-amber-400 text-amber-950' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Buat Squad Baru
              </button>
              <button
                onClick={() => setSquadAction('join')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  squadAction === 'join' ? 'bg-amber-400 text-amber-950' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Gabung Pakai Kode
              </button>
            </div>
            {squadAction === 'create' ? (
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Kamu bayar duluan, lalu dapat kode undangan buat diteruskan ke 2 temenmu yang incer jalur sama. Satu mentor otomatis ditugaskan begitu squad penuh bertiga.
              </p>
            ) : (
              <div>
                <input
                  value={squadInviteCode}
                  onChange={e => setSquadInviteCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode undangan dari temenmu"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-amber-400"
                  maxLength={6}
                />
                <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                  Track & tier harus sama persis dengan squad yang kamu gabungi.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {TIERS.map(tier => {
            const price = getPrice(mode, track, tier)
            const isPopular = tier === TIER_POPULAR
            const badge = TIER_BADGE[tier]
            const features = FEATURES[track][tier]
            const showReferral = mode === 'individu' && referralCode.trim() && price.referralAmount

            return (
              <div
                key={tier}
                className={`rounded-3xl p-6 flex flex-col justify-between transition-all bg-white ${
                  isPopular ? 'shadow-2xl ring-2 ring-amber-400 relative -translate-y-1.5' : 'shadow-md hover-lift border border-gray-100'
                }`}
              >
                <div>
                  {badge ? (
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-gray-950 mb-3 shadow-xs">
                      <Star size={11} className="fill-gray-950" /> {badge}
                    </div>
                  ) : (
                    <div className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full mb-3 inline-block">
                      {mode === 'squad' ? 'Mode Squad · maks 3 orang' : 'Mode Individu'}
                    </div>
                  )}
                  <h3 className="text-xl font-extrabold text-gray-900 mb-0.5">{TIER_LABELS[tier]}</h3>
                  <p className="text-[11px] text-gray-500 font-medium mb-5 min-h-[36px] leading-relaxed">
                    {TIER_TAGLINES[tier]}
                  </p>

                  <div className="mb-2">
                    <span className="text-2xl sm:text-3xl font-black text-gray-900">
                      {price.weekly.split('/')[0]}
                    </span>
                    <span className="text-sm font-semibold text-gray-400">/{price.weekly.split('/')[1] ?? 'minggu'}</span>
                  </div>
                  <div className="mb-5 pb-5 border-b border-gray-100 text-xs text-gray-500 font-semibold">
                    {showReferral ? (
                      <span>
                        Total <span className="line-through text-gray-400">{formatIDR(price.amount)}</span>{' '}
                        <span className="text-emerald-600 font-black">{formatIDR(price.referralAmount!)}</span>
                        {' '}· sekali bayar
                      </span>
                    ) : (
                      <span>
                        Total {formatIDR(price.amount)}
                        {mode === 'squad' ? ' /orang' : ''} · sekali bayar
                      </span>
                    )}
                    <br />
                    {TIER_PERIOD[tier]}
                  </div>

                  <ul className="space-y-2.5 mb-8">
                    {features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-gray-700 leading-snug">
                        <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={11} className="stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mb-4 text-center">
                    <Link
                      href="/syarat-paket"
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline inline-flex items-center gap-1"
                    >
                      Peraturan & Ketentuan Paket &rarr;
                    </Link>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelection({ tier, mode, track })
                    setError('')
                  }}
                  className={`w-full py-3.5 rounded-full text-xs font-extrabold transition-all shadow-md ${
                    isPopular ? 'btn-brand-primary' : 'bg-gray-900 text-white hover:bg-black'
                  }`}
                >
                  Pilih {TIER_LABELS[tier]}
                </button>
              </div>
            )
          })}
        </div>

        {/* Legal Footer Info */}
        <div className="p-6 rounded-2xl bg-gray-50 text-center text-xs text-gray-400 space-y-1">
          <p>© {new Date().getFullYear()} <strong>{LEGAL_ENTITY.brand}</strong> - Dikelola oleh <strong>{LEGAL_ENTITY.name}</strong>.</p>
          <p>Batas waktu pakai (&ldquo;angus&rdquo;) dihitung dari tanggal transaksi lunas. Benefit yang belum dipakai sampai batas waktu nggak bisa dicairkan lagi.</p>
        </div>
      </div>

      {/* Checkout Modal */}
      {selection && selectedPrice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          onClick={e => { if (e.target === e.currentTarget) { setSelection(null); setError('') } }}
        >
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Konfirmasi Pembelian
                </span>
                <h3 className="text-lg font-extrabold text-gray-900">
                  {TIER_LABELS[selection.tier]} · {MODE_LABELS[selection.mode]}
                </h3>
                <p className="text-xs text-gray-400 font-semibold">{TRACK_LABELS[selection.track]}</p>
              </div>
              <button
                onClick={() => { setSelection(null); setError('') }}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 flex-shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {userInfo && (
                <div className="rounded-2xl bg-gray-50 p-4 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Data Pemesan</p>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <User size={13} className="text-gray-400 flex-shrink-0" />
                    <span className="font-semibold">{userInfo.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <Mail size={13} className="text-gray-400 flex-shrink-0" />
                    <span className="font-semibold">{userInfo.email}</span>
                  </div>
                </div>
              )}

              {selection.mode === 'squad' && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 text-xs text-amber-900 font-semibold">
                  {squadAction === 'create'
                    ? 'Kamu bakal bikin squad baru. Kode undangan buat 2 temenmu muncul setelah pembayaran berhasil.'
                    : `Kamu gabung ke squad dengan kode ${squadInviteCode || '(belum diisi)'}.`}
                </div>
              )}

              {/* What you get */}
              <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 mb-3">Yang Kamu Dapatkan</p>
                <ul className="space-y-1.5">
                  {FEATURES[selection.track][selection.tier].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-amber-900 font-semibold">
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={9} className="stroke-[3] text-amber-950" />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-amber-600 font-semibold mt-2.5">{TIER_PERIOD[selection.tier]}</p>
              </div>

              {/* Referral code (individu only) - di popup */}
              {selection.mode === 'individu' && (
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Kode Referral (opsional)</p>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200">
                    <Gift size={13} className="text-amber-600 flex-shrink-0" />
                    <input
                      value={referralCode}
                      onChange={e => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="Masukkan kode referral teman"
                      className="flex-1 text-xs font-bold tracking-wide uppercase focus:outline-none bg-transparent"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">Diskon hanya berlaku jika kode valid dan paket individu.</p>
                </div>
              )}

              {/* Price breakdown */}
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">Rincian Pembayaran</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>{TIER_LABELS[selection.tier]} - {TRACK_LABELS[selection.track]}</span>
                    <span className={`font-bold ${selectedFinalAmount !== selectedPrice.amount ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {formatIDR(selectedPrice.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Mode</span>
                    <span className="font-semibold">{MODE_LABELS[selection.mode]}</span>
                  </div>
                  {selectedFinalAmount !== selectedPrice.amount && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Diskon kode referral</span>
                      <span>- {formatIDR(selectedPrice.amount - selectedFinalAmount!)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-gray-900 pt-2 border-t border-gray-200 text-sm">
                    <span>Total yang dibayar</span>
                    <span className="text-amber-700">{formatIDR(selectedFinalAmount!)}</span>
                  </div>
                </div>
              </div>

              {/* Payment methods - informational only, NOT clickable cards */}
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Metode Pembayaran yang Tersedia</p>
                <p className="text-xs text-gray-600 font-semibold mb-2">Dibayar lewat Mayar - pilih metode di halaman pembayaran:</p>
                <div className="flex flex-wrap gap-2">
                  {['Virtual Account (BCA, Mandiri, BNI, BRI, BSI)', 'QRIS semua e-wallet', 'GoPay / OVO / Dana / ShopeePay', 'Kartu Kredit/Debit Visa & Mastercard'].map(m => (
                    <span key={m} className="text-[10px] font-semibold text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full">{m}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
              {error && (
                <div className="mb-3 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                  {error}
                </div>
              )}
              <button
                onClick={handleCheckout}
                disabled={isSubmitting || (selection.mode === 'squad' && squadAction === 'join' && !squadInviteCode.trim())}
                className="w-full py-3.5 rounded-full text-sm font-extrabold btn-brand-primary disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><Loader2 size={15} className="animate-spin" /> Memproses...</>
                ) : (
                  <>Bayar & Aktifkan {TIER_LABELS[selection.tier]} <ArrowRight size={14} className="inline-block ml-1 align-[-2px]" aria-hidden /></>
                )}
              </button>
              <p className="text-center text-[11px] text-gray-400 mt-2.5">
                <ShieldCheck size={11} className="inline mr-1 mb-0.5" />
                Aman via Mayar · Akun aktif otomatis setelah bayar · {LEGAL_ENTITY.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
