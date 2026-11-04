'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle2,
  Check,
  Download,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CreditCard,
  Building2,
  User,
  Mail,
  Phone,
  FileCheck,
  Sparkles,
} from 'lucide-react'
import { LEGAL_ENTITY } from '@/lib/constants'

export default function SummaryClient({
  orderId = "OTW-2026-88192",
  tier = "nectar",
  name = "Arvel Valerian",
  paymentMethod = "bca_va",
  amount = "99000"
}: {
  orderId?: string;
  tier?: string;
  name?: string;
  paymentMethod?: string;
  amount?: string;
}) {

  const formattedAmount = `Rp ${parseInt(amount, 10).toLocaleString('id-ID')}`

  const getTierTitle = (t: string) => {
    switch (t) {
      case 'premium': return 'Akun Premium Platform Cerdas'
      case 'nectar': return 'Paket Nectar: Review Dokumen & Esai PTN'
      case 'honeycomb': return 'Paket Honeycomb: Bimbingan Intensif Reguler'
      case 'queen-bee': return 'Paket Queen Bee: VIP All-In'
      default: return 'Paket Nectar: Review Dokumen & Esai PTN'
    }
  }

  const getPaymentName = (p: string) => {
    switch (p) {
      case 'bca_va': return 'BCA Virtual Account (Midtrans)'
      case 'mandiri_va': return 'Mandiri Virtual Account (Midtrans)'
      case 'bni_va': return 'BNI Virtual Account (Midtrans)'
      case 'bri_va': return 'BRI Virtual Account (Midtrans)'
      case 'permata_va': return 'Permata Virtual Account (Midtrans)'
      case 'qris': return 'QRIS Instan (Midtrans)'
      case 'credit_card': return 'Kartu Kredit / Debit (Midtrans)'
      default: return 'BCA Virtual Account (Midtrans)'
    }
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold mb-6 text-gray-500">
          <Link href="/" className="hover:text-amber-600 transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/katalog" className="hover:text-amber-600 transition-colors">Katalog</Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">Ringkasan Pesanan (Order Summary)</span>
        </nav>

        {/* Confirmation Card */}
        <div className="rounded-3xl p-6 sm:p-10 bg-white border border-gray-100 shadow-xl mb-8">
          {/* Success Banner */}
          <div className="text-center pb-8 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
              Pembayaran Berhasil Dikonfirmasi
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Pesananmu telah resmi tercatat di sistem <strong>{LEGAL_ENTITY.name}</strong> melalui verifikasi otomatis Midtrans Payment Gateway.
            </p>
          </div>

          {/* Order Meta Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-gray-100 text-xs">
            <div>
              <span className="text-gray-400 block font-medium">Order Number:</span>
              <span className="font-mono font-black text-gray-900">{orderId}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Tanggal Transaksi:</span>
              <span className="font-bold text-gray-900">2 Nov 2026, 13:45</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Metode Pembayaran:</span>
              <span className="font-bold text-gray-900 truncate block">{getPaymentName(paymentMethod)}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Status Transaksi:</span>
              <span className="font-black text-emerald-600 uppercase">Lunas (Paid)</span>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="py-6 border-b border-gray-100">
            <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-4">
              Rincian Layanan / Produk:
            </h3>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white p-1 border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/mascot-hd/review-draft.png"
                    alt="Paket"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-gray-900">{getTierTitle(tier)}</h4>
                  <p className="text-[11px] text-gray-500 font-medium">Termasuk Akses Penuh Akun Premium & Mentoring 1-on-1</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs sm:text-sm font-black text-gray-900">{formattedAmount}</span>
                <span className="text-[10px] text-gray-400 block">Kuantitas: 1x</span>
              </div>
            </div>
          </div>

          {/* Customer & Billing Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-gray-100 text-xs">
            <div>
              <h4 className="font-extrabold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User size={14} className="text-amber-600" /> Data Customer (Billing Info)
              </h4>
              <p className="font-bold text-gray-900">{name}</p>
              <p className="text-gray-600">SMAN 8 Jakarta</p>
              <p className="text-gray-600">DKI Jakarta, Indonesia</p>
              <p className="text-gray-500 mt-1">Target: Universitas Indonesia (PPKB UI)</p>
            </div>

            <div>
              <h4 className="font-extrabold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mail size={14} className="text-amber-600" /> Kontak Konfirmasi
              </h4>
              <p className="text-gray-600"><span className="font-medium text-gray-400">Email:</span> arvel.valerian@gmail.com</p>
              <p className="text-gray-600"><span className="font-medium text-gray-400">WhatsApp:</span> 0812-8716-2819</p>
              <p className="inline-flex items-center gap-1 text-emerald-600 font-semibold mt-1">
                <Check size={13} className="text-emerald-600" /> Notifikasi & Invoice telah terkirim via Email
              </p>
            </div>
          </div>

          {/* Summary Price Table */}
          <div className="py-6 border-b border-gray-100 text-xs space-y-2">
            <h4 className="font-extrabold text-gray-900 uppercase tracking-wider mb-3">Ringkasan Pembayaran:</h4>
            <div className="flex justify-between text-gray-600">
              <span>Subtotal Produk</span>
              <span className="font-bold text-gray-900">{formattedAmount}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Biaya Pengiriman Dokumen (Digital Delivery)</span>
              <span className="font-bold text-emerald-600">Rp 0 (Gratis)</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Biaya Layanan Midtrans Gateway</span>
              <span className="font-bold text-emerald-600">Rp 0 (Gratis)</span>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
              <span className="font-black text-gray-900">Total Transaksi Selesai</span>
              <span className="text-xl font-black text-amber-600">{formattedAmount}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="flex-1 py-3.5 rounded-full text-xs font-black text-center bg-amber-400 text-gray-950 hover:bg-amber-300 transition-all shadow-md flex items-center justify-center gap-2"
            >
              Masuk ke Dashboard Siswa Sekarang <ArrowRight size={14} />
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="py-3.5 px-6 rounded-full text-xs font-bold text-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-1.5"
            >
              <Download size={14} /> Cetak Bukti Transaksi
            </button>
          </div>
        </div>

        {/* Legal Footer Info */}
        <div className="text-center text-xs text-gray-400 space-y-1">
          <p>© {new Date().getFullYear()} {LEGAL_ENTITY.brand} - Diselenggarakan resmi oleh <strong>{LEGAL_ENTITY.name}</strong>.</p>
          <p>Terima kasih telah mempercayakan persiapan seleksi PTN non-tes bersama OtwPTN.</p>
        </div>
      </div>
    </div>
  )
}

