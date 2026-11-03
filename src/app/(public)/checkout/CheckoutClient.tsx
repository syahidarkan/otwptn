'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Check, Building2, QrCode, CreditCard, Loader2 } from 'lucide-react'
import { LEGAL_ENTITY } from '@/lib/constants'

interface TierItem {
  id: string
  name: string
  subtitle: string
  price: string
  priceNum: number
  image: string
  backendKey: string
}

const TIERS_DATA: Record<string, TierItem> = {
  premium: {
    id: 'premium',
    name: 'Akun Premium Platform Cerdas',
    subtitle: 'Akses Mandiri Fitur AI & E-Course Lengkap',
    price: 'Rp 49.000',
    priceNum: 49000,
    image: '/mascot-hd/maskot-upgrade-bintang-emas.png',
    backendKey: 'web_premium',
  },
  nectar: {
    id: 'nectar',
    name: 'Paket Nectar: Review Dokumen & Esai',
    subtitle: 'Review & Koreksi Mendalam Bersama Mentor Alumni',
    price: 'Rp 99.000',
    priceNum: 99000,
    image: '/mascot-hd/review-draft.png',
    backendKey: 'review',
  },
  honeycomb: {
    id: 'honeycomb',
    name: 'Paket Honeycomb: Bimbingan Intensif',
    subtitle: 'Bimbingan Step-by-Step + 2x Sesi Privat Zoom',
    price: 'Rp 199.000',
    priceNum: 199000,
    image: '/mascot-hd/trio-mentor.png',
    backendKey: 'dokumen',
  },
  'queen-bee': {
    id: 'queen-bee',
    name: 'Paket Queen Bee: VIP All-In',
    subtitle: 'Mentor Senior Tanpa Batas Sampai Pengumuman',
    price: 'Rp 399.000',
    priceNum: 399000,
    image: '/mascot-hd/maskot-piala-toga-juara.png',
    backendKey: 'menyeluruh',
  },
}

export default function CheckoutClient({ initialTier = 'nectar' }: { initialTier?: string; initialSnapOpen?: boolean }) {
  const router = useRouter()
  const selectedTier = TIERS_DATA[initialTier] ?? TIERS_DATA.nectar

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedTier.backendKey, payment_method: 'mayar' }),
      })
      const data = await res.json()
      if (res.status === 401) {
        router.push(`/login?redirect=/checkout?tier=${selectedTier.id}`)
        return
      }
      if (!res.ok) {
        setError(data.error ?? 'Gagal memproses pembayaran. Coba lagi.')
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

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto">
        <nav className="flex items-center gap-2 text-xs font-semibold mb-6" style={{ color: 'var(--muted)' }}>
          <Link href="/" className="hover:opacity-70 transition-opacity">Beranda</Link>
          <span>/</span>
          <Link href="/katalog" className="hover:opacity-70 transition-opacity">Katalog</Link>
          <span>/</span>
          <span style={{ color: 'var(--fg)', fontWeight: 700 }}>Checkout</span>
        </nav>

        <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--fg)' }}>Checkout Pesanan</h1>
        <p className="text-xs mb-8" style={{ color: 'var(--muted)' }}>
          Pembayaran diproses via Mayar — VA Bank, QRIS, GoPay, OVO, Dana, Kartu Kredit.
        </p>

        {/* Selected Product */}
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-4" style={{ background: 'var(--bg-alt)', border: '1.5px solid var(--border)' }}>
          <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border" style={{ borderColor: 'var(--border)' }}>
            <Image src={selectedTier.image} alt={selectedTier.name} width={52} height={52} className="object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-black truncate" style={{ color: 'var(--fg)' }}>{selectedTier.name}</h2>
            <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{selectedTier.subtitle}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-base font-black" style={{ color: '#f59e0b' }}>{selectedTier.price}</span>
            <Link href="/katalog" className="text-[10px] font-bold block mt-0.5 hover:opacity-70" style={{ color: 'var(--muted)' }}>Ganti</Link>
          </div>
        </div>

        {/* Payment methods info */}
        <div className="rounded-2xl p-4 mb-5" style={{ background: 'var(--bg-alt)', border: '1.5px solid var(--border)' }}>
          <p className="text-xs font-bold mb-3" style={{ color: 'var(--muted)' }}>Metode Pembayaran Tersedia:</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { Icon: Building2, label: 'Virtual Account', sub: 'BCA, Mandiri, BNI, BRI' },
              { Icon: QrCode, label: 'QRIS', sub: 'GoPay, OVO, Dana, dll' },
              { Icon: CreditCard, label: 'Kartu Kredit', sub: 'Visa, Mastercard' },
            ].map(({ Icon, label, sub }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <Icon size={16} className="mx-auto mb-1" style={{ color: '#f59e0b' }} />
                <p className="text-[11px] font-bold" style={{ color: 'var(--fg)' }}>{label}</p>
                <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{sub}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] mt-3" style={{ color: 'var(--muted)' }}>
            Biaya layanan gateway ditambahkan saat checkout di halaman Mayar.
          </p>
        </div>

        {/* Order Summary */}
        <div className="rounded-2xl p-4 mb-5" style={{ background: 'var(--bg-alt)', border: '1.5px solid var(--border)' }}>
          <h3 className="text-sm font-extrabold mb-3" style={{ color: 'var(--fg)' }}>Ringkasan Pesanan</h3>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: 'var(--muted)' }}>{selectedTier.name}</span>
            <span className="font-bold" style={{ color: 'var(--fg)' }}>{selectedTier.price}</span>
          </div>
          <div className="flex justify-between text-xs mb-3">
            <span style={{ color: 'var(--muted)' }}>Biaya gateway</span>
            <span className="font-semibold" style={{ color: 'var(--muted)' }}>Ditambahkan saat checkout</span>
          </div>
          <div className="flex justify-between text-sm font-black pt-3" style={{ borderTop: '1px solid var(--border)', color: 'var(--fg)' }}>
            <span>Total</span>
            <span style={{ color: '#f59e0b' }}>{selectedTier.price}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl text-sm font-black text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mb-3"
          style={{ background: '#f59e0b' }}
        >
          {isSubmitting ? (
            <><Loader2 size={16} className="animate-spin" /> Memproses...</>
          ) : (
            <>Lanjutkan Pembayaran →</>
          )}
        </button>

        <div className="p-3 rounded-xl text-center text-[11px]" style={{ background: 'var(--bg-alt)', color: 'var(--muted)' }}>
          <ShieldCheck size={13} className="inline mr-1 mb-0.5" />
          Transaksi aman via <strong>Mayar</strong> — terdaftar & diawasi OJK.
          Akun kamu otomatis diupgrade setelah pembayaran dikonfirmasi.
        </div>

        <p className="text-center text-[11px] mt-4" style={{ color: 'var(--muted)' }}>
          Dengan melanjutkan, kamu menyetujui{' '}
          <Link href="/syarat-ketentuan" className="underline font-bold" style={{ color: 'var(--fg)' }}>Syarat & Ketentuan</Link>
          {' '}dan{' '}
          <Link href="/kebijakan-privasi" className="underline font-bold" style={{ color: 'var(--fg)' }}>Kebijakan Privasi</Link>{' '}
          <strong>{LEGAL_ENTITY.name}</strong>.
        </p>
      </div>
    </div>
  )
}
