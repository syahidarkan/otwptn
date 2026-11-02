'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheck,
  Check,
  ArrowRight,
  CreditCard,
  QrCode,
  Building2,
  Lock,
  ChevronLeft,
  X,
  Copy,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react'
import { LEGAL_ENTITY } from '@/lib/constants'

interface TierItem {
  id: string
  name: string
  subtitle: string
  price: string
  priceNum: number
  image: string
}

const TIERS_DATA: Record<string, TierItem> = {
  'premium': {
    id: 'premium',
    name: 'Akun Premium Platform Cerdas',
    subtitle: 'Akses Mandiri Fitur AI & E-Course Lengkap',
    price: 'Rp 49.000',
    priceNum: 49000,
    image: '/mascot-hd/maskot-upgrade-bintang-emas.png',
  },
  'nectar': {
    id: 'nectar',
    name: 'Paket Nectar: Review Dokumen & Esai',
    subtitle: 'Review & Koreksi Mendalam Bersama Mentor Alumni',
    price: 'Rp 99.000',
    priceNum: 99000,
    image: '/mascot-hd/review-draft.png',
  },
  'honeycomb': {
    id: 'honeycomb',
    name: 'Paket Honeycomb: Bimbingan Intensif',
    subtitle: 'Bimbingan Step-by-Step + 2x Sesi Privat Zoom',
    price: 'Rp 199.000',
    priceNum: 199000,
    image: '/mascot-hd/trio-mentor.png',
  },
  'queen-bee': {
    id: 'queen-bee',
    name: 'Paket Queen Bee: VIP All-In',
    subtitle: 'Mentor Senior Tanpa Batas Sampai Pengumuman',
    price: 'Rp 399.000',
    priceNum: 399000,
    image: '/mascot-hd/maskot-piala-toga-juara.png',
  },
}

const PAYMENT_METHODS = [
  { id: 'bca_va', name: 'BCA Virtual Account', type: 'va', badge: 'Verifikasi Otomatis', icon: Building2 },
  { id: 'mandiri_va', name: 'Mandiri Virtual Account', type: 'va', badge: 'Verifikasi Otomatis', icon: Building2 },
  { id: 'bni_va', name: 'BNI Virtual Account', type: 'va', badge: 'Verifikasi Otomatis', icon: Building2 },
  { id: 'bri_va', name: 'BRI Virtual Account', type: 'va', badge: 'Verifikasi Otomatis', icon: Building2 },
  { id: 'permata_va', name: 'Permata Virtual Account', type: 'va', badge: 'Verifikasi Otomatis', icon: Building2 },
  { id: 'qris', name: 'QRIS (GoPay, OVO, Dana, LinkAja, BCA)', type: 'qris', badge: 'Scan Instan', icon: QrCode },
  { id: 'credit_card', name: 'Kartu Kredit / Debit (Visa, Mastercard)', type: 'card', badge: 'Instan', icon: CreditCard },
]

export default function CheckoutClient({ initialTier = "nectar", initialSnapOpen = false }: { initialTier?: string; initialSnapOpen?: boolean }) {
  const router = useRouter()
  const tierKey = initialTier
  const selectedTier = TIERS_DATA[tierKey] || TIERS_DATA['nectar']

  // Form states
  const [fullName, setFullName] = useState('Arvel Valerian')
  const [email, setEmail] = useState('arvel.valerian@gmail.com')
  const [phone, setPhone] = useState('081287162819')
  const [school, setSchool] = useState('SMAN 8 Jakarta')
  const [targetPTN, setTargetPTN] = useState('Universitas Indonesia (PPKB UI)')
  const [targetMajor, setTargetMajor] = useState('Ilmu Komputer')
  const [agreeTerms, setAgreeTerms] = useState(true)

  // Payment Selection
  const [selectedPayment, setSelectedPayment] = useState('bca_va')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSnapModal, setShowSnapModal] = useState(initialSnapOpen)
  const [orderId, setOrderId] = useState('OTW-2026-88192')
  const [copiedVa, setCopiedVa] = useState(false)

  // Virtual Account Generator
  const getVaNumber = () => {
    switch (selectedPayment) {
      case 'bca_va': return '8800 1293 8472 9102'
      case 'mandiri_va': return '8910 8829 3471 0021'
      case 'bni_va': return '9880 1293 8472 9102'
      case 'bri_va': return '1280 8829 3471 0021'
      default: return '8800 1293 8472 9102'
    }
  }

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreeTerms) {
      alert('Mohon menyetujui syarat dan ketentuan layanan.')
      return
    }
    setIsSubmitting(true)
    const newOrderId = `OTW-2026-${Math.floor(10000 + Math.random() * 90000)}`
    setOrderId(newOrderId)

    // Simulate opening Midtrans Snap interface
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSnapModal(true)
    }, 400)
  }

  const handleSimulatePaymentSuccess = () => {
    setShowSnapModal(false)
    router.push(
      `/checkout/summary?order_id=${orderId}&tier=${selectedTier.id}&name=${encodeURIComponent(fullName)}&payment_method=${selectedPayment}&amount=${selectedTier.priceNum}`
    )
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold mb-6 text-gray-500">
          <Link href="/" className="hover:text-amber-600 transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/katalog" className="hover:text-amber-600 transition-colors">Katalog</Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">Checkout & Pembayaran Midtrans</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">
            Formulir Pendaftaran & Checkout Pesanan
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Lengkapi data pendaftaran siswa dan pilih metode pembayaran resmi via Payment Gateway Midtrans.
          </p>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Customer Details & Payment Method (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Data Identitas Siswa */}
              <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-gray-950 font-black text-xs flex items-center justify-center">1</div>
                  <h2 className="text-sm font-extrabold text-gray-900">Data Identitas Siswa / Billing Information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Nama Lengkap Siswa *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Alamat Email Aktif *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Nomor WhatsApp Aktif *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Asal Sekolah (SMA / SMK / MA) *</label>
                    <input
                      type="text"
                      required
                      value={school}
                      onChange={e => setSchool(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Target PTN Impian *</label>
                    <input
                      type="text"
                      required
                      value={targetPTN}
                      onChange={e => setTargetPTN(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Target Program Studi *</label>
                    <input
                      type="text"
                      required
                      value={targetMajor}
                      onChange={e => setTargetMajor(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Pilihan Metode Pembayaran Midtrans */}
              <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-gray-950 font-black text-xs flex items-center justify-center">2</div>
                    <h2 className="text-sm font-extrabold text-gray-900">Metode Pembayaran (Payment Method)</h2>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Powered by Midtrans
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-4 font-medium">
                  Pilih kanal pembayaran yang kamu inginkan. Pembayaran diverifikasi otomatis 24/7.
                </p>

                <div className="space-y-2.5">
                  {PAYMENT_METHODS.map(method => {
                    const isSelected = selectedPayment === method.id
                    const Icon = method.icon
                    return (
                      <label
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-amber-50/50 shadow-xs'
                            : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={isSelected}
                            onChange={() => setSelectedPayment(method.id)}
                            className="accent-amber-500 w-4 h-4"
                          />
                          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                            <Icon size={16} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 block leading-tight">{method.name}</span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {method.type === 'va' ? 'Nomor VA Bank Otomatis' : method.type === 'qris' ? 'Scan Semua Aplikasi e-Wallet & Bank' : 'Visa / Mastercard / JCB'}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                          {method.badge}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Action (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card 3: Shopping Cart & Price Breakdown */}
              <div className="rounded-3xl p-6 bg-white border border-gray-100 shadow-sm sticky top-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-extrabold text-gray-900">Ringkasan Pesanan (Order Summary)</h3>
                  <Link href="/katalog" className="text-xs font-bold text-amber-600 hover:underline">
                    Ganti Paket
                  </Link>
                </div>

                {/* Selected Item Card */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 rounded-xl bg-white p-1 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <Image
                      src={selectedTier.image}
                      alt={selectedTier.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-gray-900 truncate">{selectedTier.name}</h4>
                    <p className="text-[11px] text-gray-500 truncate">{selectedTier.subtitle}</p>
                    <span className="text-xs font-extrabold text-amber-700 block mt-0.5">{selectedTier.price}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">1x</span>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs mb-5">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal Produk</span>
                    <span className="font-bold text-gray-900">{selectedTier.price}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Biaya Pengiriman Dokumen (Digital Delivery)</span>
                    <span className="font-bold text-emerald-600">Gratis (IDR 0)</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Biaya Layanan Midtrans Gateway</span>
                    <span className="font-bold text-emerald-600">Gratis (IDR 0)</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                    <span className="font-black text-gray-900">Total Pembayaran</span>
                    <span className="text-xl font-black text-amber-600">{selectedTier.price}</span>
                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="mb-6 pt-3 border-t border-gray-100">
                  <label className="flex items-start gap-2.5 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={e => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 accent-amber-500 w-4 h-4 rounded"
                    />
                    <span className="leading-snug">
                      Saya menyetujui <Link href="/syarat-ketentuan" target="_blank" className="font-bold underline text-gray-900">Syarat dan Ketentuan</Link> serta <Link href="/kebijakan-privasi" target="_blank" className="font-bold underline text-gray-900">Kebijakan Privasi</Link> layanan bimbingan <strong>{LEGAL_ENTITY.name}</strong>.
                    </span>
                  </label>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-full text-sm font-black text-center block bg-amber-400 text-gray-950 hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses ke Midtrans...' : 'Submit Order & Lanjutkan Pembayaran →'}
                </button>

                <div className="mt-4 p-3 rounded-xl bg-gray-50 text-[11px] text-gray-500 text-center font-medium">
                  🛡️ Transaksi aman terenkripsi 256-bit SSL melalui <strong>Midtrans Payment Gateway</strong> berlisensi Bank Indonesia.
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* MIDTRANS SNAP POPUP INTERFACE MODAL */}
        {showSnapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl bg-white overflow-hidden shadow-2xl relative border border-gray-200">
              {/* Midtrans Snap Header */}
              <div className="bg-[#002855] text-white p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black tracking-tight">{LEGAL_ENTITY.brand}</span>
                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded text-white/90">Midtrans Snap</span>
                  </div>
                  <span className="text-[11px] text-white/70 block mt-0.5">Order ID: {orderId}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/70 block">Total Tagihan</span>
                  <span className="text-lg font-black text-amber-400">{selectedTier.price}</span>
                </div>
              </div>

              {/* Countdown bar */}
              <div className="bg-amber-50 px-5 py-2 border-b border-amber-100 flex items-center justify-between text-xs text-amber-900 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-amber-600" /> Selesaikan pembayaran dalam
                </span>
                <span className="font-mono font-bold text-amber-800">23:59:55</span>
              </div>

              {/* Snap Body */}
              <div className="p-6">
                {selectedPayment === 'qris' ? (
                  /* QRIS Interface */
                  <div className="text-center py-2">
                    <h4 className="text-sm font-extrabold text-gray-900 mb-1">Scan QRIS untuk Membayar</h4>
                    <p className="text-xs text-gray-500 mb-4">
                      Buka aplikasi BCA Mobile, GoPay, OVO, Dana, LinkAja, atau ShopeePay
                    </p>
                    <div className="w-48 h-48 mx-auto p-3 bg-white border-2 border-gray-900 rounded-2xl shadow-sm flex items-center justify-center mb-4">
                      <Image
                        src="/mascot-hd/checklist.png"
                        alt="QRIS Code"
                        width={160}
                        height={160}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                      NMID: ID1029384758921
                    </span>
                  </div>
                ) : (
                  /* Virtual Account Interface */
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {PAYMENT_METHODS.find(m => m.id === selectedPayment)?.name || 'Virtual Account'}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        Dicek Otomatis
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-4 font-medium">
                      Lakukan transfer pembayaran ke nomor Virtual Account di bawah ini:
                    </p>

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between mb-5">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-bold">Nomor Virtual Account:</span>
                        <span className="text-lg font-mono font-black text-gray-900 tracking-wider">
                          {getVaNumber()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(getVaNumber().replace(/\s/g, ''))
                          setCopiedVa(true)
                          setTimeout(() => setCopiedVa(false), 2000)
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 flex items-center gap-1.5"
                      >
                        {copiedVa ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        {copiedVa ? 'Tersalin' : 'Salin'}
                      </button>
                    </div>

                    {/* How to pay instructions */}
                    <div className="space-y-2 mb-6 text-xs text-gray-600">
                      <span className="font-bold text-gray-900 block">Petunjuk Pembayaran:</span>
                      <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
                        <li>Buka aplikasi Mobile Banking / ATM bank kamu.</li>
                        <li>Pilih menu <strong>Transfer &gt; Virtual Account</strong>.</li>
                        <li>Masukkan nomor Virtual Account: <strong>{getVaNumber()}</strong>.</li>
                        <li>Periksa rincian: nama penerima <strong>PT. Lembaga Sains Nasional</strong>.</li>
                        <li>Konfirmasi transaksi dan simpan bukti transfer.</li>
                      </ol>
                    </div>
                  </div>
                )}

                {/* Action buttons inside Snap */}
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleSimulatePaymentSuccess}
                    className="w-full py-3.5 rounded-full text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={16} /> Saya Sudah Membayar (Simulasi Sukses)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSnapModal(false)}
                    className="w-full py-2.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all text-center block"
                  >
                    Kembali ke Merchant
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

