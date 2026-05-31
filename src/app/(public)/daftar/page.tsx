'use client'

import { useState } from 'react'
import { JALUR_LIST, PRICING, ADDON_PRICE, CATEGORY_LABEL, TIER_LABEL, TIER_DESCRIPTION, BANK_INFO } from '@/lib/constants'
import { formatRupiah } from '@/lib/utils'
import type { JalurCategory, PackageTier } from '@/types'
import Button from '@/components/ui/Button'
import FileUpload from '@/components/ui/FileUpload'
import { CheckCircle2 } from 'lucide-react'

const TOTAL_STEPS = 6

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBar({ current }: { current: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
          <div key={n} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              n < current ? 'bg-brand-black text-white' :
              n === current ? 'bg-brand-yellow text-brand-black' :
              'bg-brand-gray-2 text-brand-muted'
            }`}>
              {n < current ? '✓' : n}
            </div>
            {n < TOTAL_STEPS && (
              <div className={`flex-1 h-1 mx-1 rounded ${n < current ? 'bg-brand-black' : 'bg-brand-gray-2'}`} />
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-brand-muted text-center">Langkah {current} dari {TOTAL_STEPS}</p>
    </div>
  )
}

// ─── State ────────────────────────────────────────────────────────────────────
interface FormState {
  // Step 1
  category: JalurCategory | null
  // Step 2
  tier: PackageTier | null
  jalur_utama_id: string | null
  // Step 3
  addon_jalur_ids: string[]
  // Step 4
  full_name: string
  email: string
  password: string
  confirm_password: string
  phone: string
  school: string
  // Step 5
  payment_file: File | null
  // Computed
  total_price: number
}

const initialState: FormState = {
  category: null,
  tier: null,
  jalur_utama_id: null,
  addon_jalur_ids: [],
  full_name: '',
  email: '',
  password: '',
  confirm_password: '',
  phone: '',
  school: '',
  payment_file: null,
  total_price: 0,
}

function calcTotal(state: FormState): number {
  if (!state.category || !state.tier) return 0
  const base = PRICING[state.category][state.tier]
  const addon = state.addon_jalur_ids.length * ADDON_PRICE[state.category]
  return base + addon
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DaftarPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registrationId, setRegistrationId] = useState<string | null>(null)

  function update(partial: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  async function uploadPayment(): Promise<string | null> {
    if (!form.payment_file) return null
    const fd = new FormData()
    fd.append('file', form.payment_file)
    const res = await fetch('/api/upload-payment', { method: 'POST', body: fd })
    const data = await res.json()
    return data.url ?? null
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const paymentUrl = await uploadPayment()
      if (!paymentUrl) throw new Error('Gagal upload bukti pembayaran')

      const res = await fetch('/api/pendaftaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: form.category,
          tier: form.tier,
          jalur_utama_id: form.jalur_utama_id,
          addon_jalur_ids: form.addon_jalur_ids,
          total_price: calcTotal(form),
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          school: form.school,
          payment_proof_url: paymentUrl,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Gagal submit pendaftaran')

      setRegistrationId(data.registration_id)
      setStep(6)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 6: success ──────────────────────────────────────────────────────────
  if (step === 6) {
    return (
      <div className="min-h-screen bg-brand-gray pt-20 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-brand-gray-2 p-10 max-w-md w-full text-center">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-brand-black mb-3">Pendaftaran Diterima!</h1>
          <p className="text-brand-muted mb-6 leading-relaxed">
            Pendaftaranmu sedang diverifikasi. Kami akan mengabari via email dalam{' '}
            <strong>1×24 jam</strong>.
          </p>
          <div className="bg-brand-gray rounded-xl p-4 text-sm text-brand-dark mb-6">
            Nomor Pendaftaran: <strong>{registrationId?.slice(0, 8).toUpperCase()}</strong>
          </div>
          <Button href="/" variant="dark" fullWidth>Kembali ke Beranda</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-gray pt-20">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-brand-black">Daftar Bimbingan</h1>
          <p className="text-brand-muted mt-2">Ikuti langkah berikut untuk mulai bimbinganmu</p>
        </div>

        <div className="bg-white rounded-2xl border border-brand-gray-2 shadow-sm p-8">
          <StepBar current={step} />

          {/* ── Step 1: Pilih Kategori ─────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-6">Pilih Kategori Jalur</h2>
              <div className="flex flex-col gap-4">
                {(['essay_only', 'prestasi_only', 'hybrid'] as JalurCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => update({ category: cat })}
                    className={`text-left p-5 rounded-xl border-2 transition-all ${
                      form.category === cat
                        ? 'border-brand-black bg-brand-black text-white'
                        : 'border-brand-gray-2 hover:border-brand-black'
                    }`}
                  >
                    <p className="font-bold text-lg">{CATEGORY_LABEL[cat]}</p>
                    <p className={`text-sm mt-1 ${form.category === cat ? 'text-white/60' : 'text-brand-muted'}`}>
                      {cat === 'essay_only' && 'Motivation letter / personal statement / esai diri'}
                      {cat === 'prestasi_only' && 'Sertifikat kejuaraan, hafidz, atau status OSIS'}
                      {cat === 'hybrid' && 'Sertifikat kejuaraan + essay (paling kompetitif)'}
                    </p>
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-8">
                <Button onClick={() => setStep(2)} disabled={!form.category}>
                  Lanjut →
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Tier & Jalur Utama ───────────────────────────────── */}
          {step === 2 && form.category && (
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-6">Pilih Tier & Jalur Utama</h2>

              <p className="text-sm font-semibold text-brand-dark mb-3">Tier Bimbingan</p>
              <div className="flex flex-col gap-3 mb-6">
                {(['review', 'dokumen', 'menyeluruh'] as PackageTier[]).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => update({ tier })}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      form.tier === tier
                        ? 'border-brand-yellow bg-yellow-50'
                        : 'border-brand-gray-2 hover:border-brand-black'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-brand-black">{TIER_LABEL[tier]}</p>
                        <p className="text-xs text-brand-muted mt-0.5">{TIER_DESCRIPTION[tier]}</p>
                      </div>
                      <p className="font-extrabold text-brand-black">
                        {form.category && formatRupiah(PRICING[form.category][tier])}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-sm font-semibold text-brand-dark mb-3">Jalur PTN Utama</p>
              <select
                value={form.jalur_utama_id ?? ''}
                onChange={(e) => update({ jalur_utama_id: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black"
              >
                <option value="">-- Pilih jalur utama --</option>
                {JALUR_LIST.filter((j) => j.category === form.category && !j.closed).map((j) => (
                  <option key={j.id} value={j.id}>{j.name} — {j.ptn}</option>
                ))}
              </select>

              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={() => setStep(1)}>← Kembali</Button>
                <Button onClick={() => setStep(3)} disabled={!form.tier || !form.jalur_utama_id}>
                  Lanjut →
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Add-on Jalur ──────────────────────────────────────── */}
          {step === 3 && form.category && (
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-1">Jalur Tambahan (Opsional)</h2>
              <p className="text-sm text-brand-muted mb-5">
                Bisa pilih jalur dari <strong>kategori manapun</strong> — semuanya +<strong>Rp 50.000</strong> per jalur.
              </p>

              <div className="flex flex-col gap-4 max-h-80 overflow-y-auto pr-2">
                {(['essay_only', 'prestasi_only', 'hybrid'] as JalurCategory[]).map((cat) => {
                  const jalurInCat = JALUR_LIST.filter((j) => j.category === cat && j.id !== form.jalur_utama_id && !j.closed)
                  if (jalurInCat.length === 0) return null
                  return (
                    <div key={cat}>
                      <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">
                        {CATEGORY_LABEL[cat]}
                        {cat !== form.category && <span className="ml-2 normal-case font-normal text-brand-yellow">(beda kategori)</span>}
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {jalurInCat.map((j) => {
                          const checked = form.addon_jalur_ids.includes(j.id)
                          return (
                            <label key={j.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${checked ? 'border-brand-black bg-brand-gray' : 'border-brand-gray-2 hover:bg-brand-gray'}`}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  update({
                                    addon_jalur_ids: checked
                                      ? form.addon_jalur_ids.filter((id) => id !== j.id)
                                      : [...form.addon_jalur_ids, j.id],
                                  })
                                }}
                                className="w-4 h-4 accent-brand-black"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-brand-black">{j.name}</p>
                                <p className="text-xs text-brand-muted">{j.ptn}</p>
                              </div>
                              <span className="text-xs font-semibold text-brand-muted">+Rp 50.000</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 p-4 bg-brand-gray rounded-xl">
                <div className="flex justify-between text-sm">
                  <span>Paket utama ({CATEGORY_LABEL[form.category]})</span>
                  <span>{form.tier ? formatRupiah(PRICING[form.category][form.tier]) : '-'}</span>
                </div>
                {form.addon_jalur_ids.length > 0 && (
                  <div className="flex justify-between text-sm mt-1">
                    <span>Add-on ({form.addon_jalur_ids.length} jalur)</span>
                    <span>{formatRupiah(form.addon_jalur_ids.length * 50000)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-brand-black mt-3 pt-3 border-t border-brand-gray-2">
                  <span>Total</span>
                  <span>{formatRupiah(calcTotal(form))}</span>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="ghost" onClick={() => setStep(2)}>← Kembali</Button>
                <Button onClick={() => setStep(4)}>Lanjut →</Button>
              </div>
            </div>
          )}

          {/* ── Step 4: Data Diri ─────────────────────────────────────────── */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-6">Data Diri & Akun</h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-brand-dark">Nama Lengkap</label>
                  <input
                    value={form.full_name}
                    onChange={(e) => update({ full_name: e.target.value })}
                    placeholder="Nama lengkap sesuai KTP/Ijazah"
                    className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-brand-dark">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update({ email: e.target.value })}
                    placeholder="email@kamu.com"
                    className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-brand-dark">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => update({ password: e.target.value })}
                    placeholder="Minimal 8 karakter"
                    className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-brand-dark">Konfirmasi Password</label>
                  <input
                    type="password"
                    value={form.confirm_password}
                    onChange={(e) => update({ confirm_password: e.target.value })}
                    placeholder="Ulangi password"
                    className={`w-full px-4 py-3 rounded-lg border text-sm outline-none focus:border-brand-black ${
                      form.confirm_password && form.confirm_password !== form.password
                        ? 'border-red-400 bg-red-50'
                        : 'border-brand-gray-2'
                    }`}
                  />
                  {form.confirm_password && form.confirm_password !== form.password && (
                    <p className="text-xs text-red-500">Password tidak cocok</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-brand-dark">No. WhatsApp</label>
                  <input
                    value={form.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-brand-dark">Asal Sekolah</label>
                  <input
                    value={form.school}
                    onChange={(e) => update({ school: e.target.value })}
                    placeholder="SMAN 1 Jakarta"
                    className="w-full px-4 py-3 rounded-lg border border-brand-gray-2 text-sm outline-none focus:border-brand-black"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={() => setStep(3)}>← Kembali</Button>
                <Button
                  onClick={() => setStep(5)}
                  disabled={
                    !form.full_name || !form.email || !form.phone || !form.school ||
                    form.password.length < 8 || form.password !== form.confirm_password
                  }
                >
                  Lanjut →
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 5: Pembayaran ────────────────────────────────────────── */}
          {step === 5 && form.category && form.tier && (
            <div>
              <h2 className="text-xl font-bold text-brand-black mb-6">Pembayaran</h2>

              {/* Ringkasan */}
              <div className="bg-brand-gray rounded-xl p-5 mb-6 text-sm">
                <h3 className="font-bold text-brand-black mb-3">Ringkasan Pesanan</h3>
                <div className="flex flex-col gap-2 text-brand-dark">
                  <div className="flex justify-between">
                    <span>Kategori</span>
                    <span className="font-medium">{CATEGORY_LABEL[form.category]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tier</span>
                    <span className="font-medium">{TIER_LABEL[form.tier]}</span>
                  </div>
                  {form.addon_jalur_ids.length > 0 && (
                    <div className="flex justify-between">
                      <span>Add-on</span>
                      <span className="font-medium">{form.addon_jalur_ids.length} jalur tambahan</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-brand-black pt-2 border-t border-brand-gray-2 mt-1">
                    <span>Total Pembayaran</span>
                    <span>{formatRupiah(calcTotal(form))}</span>
                  </div>
                </div>
              </div>

              {/* Instruksi transfer */}
              <div className="bg-brand-yellow/10 border border-brand-yellow rounded-xl p-5 mb-6">
                <h3 className="font-bold text-brand-black mb-3">Instruksi Transfer</h3>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Bank</span>
                    <span className="font-bold text-brand-black">{BANK_INFO.bank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">No. Rekening</span>
                    <span className="font-bold text-brand-black font-mono">{BANK_INFO.account_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Atas Nama</span>
                    <span className="font-bold text-brand-black">{BANK_INFO.account_name}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-brand-yellow/30 mt-1">
                    <span className="text-brand-muted">Jumlah Transfer</span>
                    <span className="font-extrabold text-brand-black text-lg">{formatRupiah(calcTotal(form))}</span>
                  </div>
                </div>
              </div>

              <FileUpload
                label="Upload Bukti Transfer"
                onFileSelect={(file) => update({ payment_file: file })}
                maxSizeMB={5}
              />

              {error && (
                <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={() => setStep(4)}>← Kembali</Button>
                <Button
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={!form.payment_file}
                >
                  Kirim Pendaftaran
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
