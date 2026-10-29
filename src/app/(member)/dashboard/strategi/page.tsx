'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Compass, Lock, Sparkles, ListChecks, Award, ArrowRight } from 'lucide-react'
import FeatureHeader from '@/components/dashboard/FeatureHeader'

interface StrategiResult {
  pilihan_1: { prodi: string; ptn: string; alasan: string } | null
  pilihan_2: { prodi: string; ptn: string; alasan: string } | null
  sertifikat_utama: string | null
  sertifikat_kedua: string | null
  sertifikat_pendukung: string[]
  catatan_strategi: string
  action_items: string[]
}

interface KalkulatorSessionRow {
  id: string
  input_data: Record<string, unknown>
  result_json: { score: number; recommendation: string }
  created_at: string
}

export default function StrategiPage() {
  const supabase = createClient()
  const [session, setSession] = useState<KalkulatorSessionRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<StrategiResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [quotaError, setQuotaError] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoading(false); return }
      const { data: last } = await supabase
        .from('kalkulator_sessions')
        .select('id, input_data, result_json, created_at')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      setSession(last as KalkulatorSessionRow | null)
      setLoading(false)
    })
  }, [])

  async function handleGenerate() {
    if (!session) return
    setError(null)
    setQuotaError(false)
    setGenerating(true)
    const res = await fetch('/api/strategi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kalkulator_session_id: session.id, input_data: session.input_data }),
    })
    const data = await res.json()
    if (res.status === 403) setQuotaError(true)
    else if (!res.ok) setError('Gagal membuat strategi. Coba lagi ya.')
    else setResult(data)
    setGenerating(false)
  }

  const isSnbp = session?.input_data?.jalur_type === 'snbp'

  if (loading) {
    return <div className="w-full px-6 md:px-8 py-10"><p className="text-sm" style={{ color: 'var(--muted)' }}>Memuat...</p></div>
  }

  if (!session) {
    return (
      <div className="w-full px-6 md:px-8 py-10">
        <FeatureHeader
          title="Atur Strategi"
          subtitle="Belum ada data untuk disusun strateginya."
          mascot="/fitur/tracking-jalur.png"
        />
        <div className="card p-8 text-center">
          <Compass size={32} className="mx-auto mb-4" style={{ color: 'var(--muted-2)' }} />
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--fg)' }}>Hitung peluangmu dulu</p>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Isi profil di Kalkulator Peluang dulu, baru balik ke sini untuk dapat strategi detail.</p>
          <Link href="/dashboard/kalkulator" className="btn btn-primary text-sm px-5 py-2.5 inline-flex">Ke Kalkulator Peluang</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-6 md:px-8 py-10">
      <FeatureHeader
        title="Atur Strategi"
        subtitle="Saran konkret berdasarkan data terakhir yang kamu masukkan di Kalkulator Peluang."
        mascot="/fitur/tracking-jalur.png"
      />

      {/* Summary of last kalkulator session */}
      <div className="card p-5 flex items-center justify-between gap-4 mb-6">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold" style={{ color: 'var(--muted)' }}>
            {isSnbp ? 'SNBP' : String(session.input_data.target_jalur ?? '-')}
          </p>
          <p className="text-sm font-extrabold truncate" style={{ color: 'var(--fg)' }}>{session.result_json?.recommendation}</p>
        </div>
        <div className="text-lg font-black flex-shrink-0" style={{ color: 'var(--accent-hover)' }}>{Math.round(session.result_json?.score ?? 0)}%</div>
        <Link href="/dashboard/kalkulator" className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--muted)' }}>Ubah</Link>
      </div>

      {!result ? (
        <div className="card p-10 text-center">
          {quotaError ? (
            <>
              <Lock size={28} className="mx-auto mb-3" style={{ color: 'var(--muted-2)' }} />
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--fg)' }}>Kuota Atur Strategi kamu habis</p>
              <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Upgrade paket untuk dapat lebih banyak kuota.</p>
              <Link href="/checkout/intensif" className="btn btn-primary text-xs px-4 py-2 inline-flex">Lihat Paket</Link>
            </>
          ) : (
            <>
              <Sparkles size={28} className="mx-auto mb-3" style={{ color: 'var(--accent-hover)' }} />
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--fg)' }}>Siap disusun strateginya</p>
              <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>AI akan menyusun rekomendasi pilihan dan prioritas sertifikat berdasarkan data di atas.</p>
              {error && <p className="text-xs mb-3" style={{ color: '#b91c1c' }}>{error}</p>}
              <button onClick={handleGenerate} disabled={generating} className="btn btn-dark text-sm px-5 py-2.5 inline-flex disabled:opacity-50">
                <Sparkles size={15} /> {generating ? 'Menyusun...' : 'Buat Strategi'}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {isSnbp && (result.pilihan_1 || result.pilihan_2) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.pilihan_1 && (
                <div className="card p-5">
                  <p className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: 'var(--accent-hover)', letterSpacing: '0.06em' }}>Rekomendasi Pilihan 1</p>
                  <p className="text-sm font-extrabold mb-0.5" style={{ color: 'var(--fg)' }}>{result.pilihan_1.prodi}</p>
                  <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{result.pilihan_1.ptn}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{result.pilihan_1.alasan}</p>
                </div>
              )}
              {result.pilihan_2 && (
                <div className="card p-5">
                  <p className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: 'var(--muted)', letterSpacing: '0.06em' }}>Rekomendasi Pilihan 2</p>
                  <p className="text-sm font-extrabold mb-0.5" style={{ color: 'var(--fg)' }}>{result.pilihan_2.prodi}</p>
                  <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{result.pilihan_2.ptn}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{result.pilihan_2.alasan}</p>
                </div>
              )}
            </div>
          )}

          {(result.sertifikat_utama || result.sertifikat_kedua || result.sertifikat_pendukung?.length > 0) && (
            <div className="card p-6">
              <p className="text-sm font-extrabold mb-4 flex items-center gap-2" style={{ color: 'var(--fg)' }}><Award size={16} style={{ color: 'var(--accent-hover)' }} /> Prioritas Sertifikat</p>
              <div className="flex flex-col gap-2.5">
                {result.sertifikat_utama && (
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-alt)' }}>
                    <span className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>Utama</span>
                    <span className="text-sm" style={{ color: 'var(--fg)' }}>{result.sertifikat_utama}</span>
                  </div>
                )}
                {result.sertifikat_kedua && (
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-alt)' }}>
                    <span className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)' }}>Kedua</span>
                    <span className="text-sm" style={{ color: 'var(--fg)' }}>{result.sertifikat_kedua}</span>
                  </div>
                )}
                {result.sertifikat_pendukung?.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-alt)' }}>
                    <span className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0" style={{ color: 'var(--muted)' }}>Pendukung</span>
                    <span className="text-sm" style={{ color: 'var(--fg)' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card p-6">
            <p className="text-sm font-extrabold mb-2" style={{ color: 'var(--fg)' }}>Catatan Strategi</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{result.catatan_strategi}</p>
          </div>

          {result.action_items?.length > 0 && (
            <div className="card p-6">
              <p className="text-sm font-extrabold mb-4 flex items-center gap-2" style={{ color: 'var(--fg)' }}><ListChecks size={16} style={{ color: 'var(--accent-hover)' }} /> Langkah Selanjutnya</p>
              <div className="flex flex-col gap-2">
                {result.action_items.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--fg)' }}>
                    <ArrowRight size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-hover)' }} />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
