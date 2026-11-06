'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

// Last-resort boundary: replaces the root layout, so it must render its own <html>/<body>
// and cannot rely on app CSS, fonts or next/link.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Root layout error:', error.digest ?? '', error.message)
  }, [error])

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#FFFDF7',
          color: '#111827',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#FFF1F2',
              color: '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <AlertTriangle size={28} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>Situs sedang bermasalah</h1>
          <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: '0 0 20px' }}>
            Terjadi kendala saat memuat aplikasi. Data akunmu aman. Coba muat ulang, dan jika masih terjadi
            hubungi kami lewat WhatsApp admin.
          </p>
          <button
            onClick={() => reset()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              borderRadius: 16,
              border: 'none',
              background: '#FED45B',
              color: '#111827',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={15} /> Muat Ulang
          </button>
        </div>
      </body>
    </html>
  )
}
