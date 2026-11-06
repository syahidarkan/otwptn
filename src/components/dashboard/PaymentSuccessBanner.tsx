'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, X, Share2, Copy } from 'lucide-react'

interface OrderInfo {
  tier_name: string
  mode: 'individu' | 'squad'
  squad_invite_code: string | null
  squad_status: string | null
}

export default function PaymentSuccessBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderInfo | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (searchParams.get('payment') !== 'success') return
    fetch('/api/payment/latest-order')
      .then(res => res.json())
      .then(data => {
        if (data.order) setOrder(data.order)
        // Clean the query param so a refresh doesn't re-show this
        router.replace('/dashboard', { scroll: false })
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!order) return null

  function copyCode() {
    if (!order?.squad_invite_code) return
    navigator.clipboard.writeText(order.squad_invite_code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {})
  }

  function shareWhatsApp() {
    if (!order?.squad_invite_code) return
    const text = `Yuk gabung squad bimbingan ${order.tier_name} di otwptn bareng aku! Pakai kode undangan: ${order.squad_invite_code}\n\nDaftar & masukin kodenya di: ${window.location.origin}/upgrade`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 relative">
        <button
          onClick={() => setOrder(null)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
        >
          <X size={15} />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
          <CheckCircle2 size={28} />
        </div>
        <h3 className="text-lg font-black text-gray-900 mb-1">Pembayaran Berhasil!</h3>
        <p className="text-xs text-gray-500 font-medium mb-4">
          Paket <strong>{order.tier_name}</strong> kamu sudah aktif.
        </p>

        {order.mode === 'squad' && order.squad_invite_code && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-amber-700">
              {order.squad_status === 'active' ? 'Squad Kamu Sudah Lengkap' : 'Ajak 2 Teman Lagi'}
            </p>
            {order.squad_status !== 'active' && (
              <>
                <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-200">
                  <span className="text-xl font-black tracking-widest text-amber-900">{order.squad_invite_code}</span>
                  <button onClick={copyCode} className="text-amber-700 hover:text-amber-900">
                    <Copy size={16} />
                  </button>
                </div>
                {copied && <p className="text-[10px] text-emerald-600 font-bold">Kode disalin!</p>}
                <button
                  onClick={shareWhatsApp}
                  className="w-full py-2.5 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
                >
                  <Share2 size={14} /> Share ke WhatsApp
                </button>
                <p className="text-[10px] text-amber-700 leading-relaxed">
                  Mentor otomatis ditugaskan begitu squad kamu lengkap bertiga.
                </p>
              </>
            )}
          </div>
        )}

        <button
          onClick={() => setOrder(null)}
          className="w-full mt-4 py-3 rounded-full bg-gray-900 text-white text-xs font-black hover:bg-black transition-colors"
        >
          Oke, Lanjutkan
        </button>
      </div>
    </div>
  )
}
