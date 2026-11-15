import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getClientIp, rateLimit } from '@/lib/security'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!(await rateLimit('promo_validate', ip, 30, 600))) {
      return NextResponse.json({ error: 'Terlalu banyak permintaan validasi kode. Coba lagi sebentar lagi.' }, { status: 429 })
    }

    const { code, amount } = await request.json()
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'Kode tidak valid' }, { status: 400 })
    }

    const cleanCode = code.trim().toUpperCase()
    const supabase = createServiceClient()

    // 1. Check promo_codes table
    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', cleanCode)
      .maybeSingle()

    if (error && error.code !== 'PGRST205') {
      console.warn('[Promo Validate Error]', error)
    }

    if (promo) {
      if (!promo.is_active) {
        return NextResponse.json({ valid: false, error: 'Kode promo ini sudah dinonaktifkan.' })
      }

      if (promo.valid_until && new Date(promo.valid_until).getTime() < Date.now()) {
        return NextResponse.json({ valid: false, error: 'Kode promo ini sudah kedaluwarsa.' })
      }

      if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
        return NextResponse.json({ valid: false, error: 'Batas kuota pemakaian kode ini sudah habis.' })
      }

      const originalAmount = typeof amount === 'number' && amount > 0 ? amount : 0
      let discountAmount = 0

      if (promo.discount_type === 'percentage') {
        const pct = Math.min(100, Math.max(0, Number(promo.discount_value)))
        discountAmount = Math.round(originalAmount * (pct / 100))
      } else {
        discountAmount = Math.min(originalAmount, Number(promo.discount_value))
      }

      const finalAmount = Math.max(0, originalAmount - discountAmount)
      const isFree = promo.discount_type === 'percentage' && Number(promo.discount_value) >= 100

      return NextResponse.json({
        valid: true,
        type: 'promo',
        code: promo.code,
        discountType: promo.discount_type,
        discountValue: Number(promo.discount_value),
        discountAmount,
        finalAmount,
        isFree,
        notes: promo.notes,
        label: isFree
          ? 'Potongan 100% (GRATIS)'
          : promo.discount_type === 'percentage'
          ? `Diskon ${promo.discount_value}%`
          : `Potongan Rp ${Number(promo.discount_value).toLocaleString('id-ID')}`,
      })
    }

    // 2. Check ambassador / creator referral code in profiles
    const { data: ambassador } = await supabase
      .from('profiles')
      .select('id, referral_code, full_name')
      .eq('referral_code', cleanCode)
      .maybeSingle()

    if (ambassador) {
      return NextResponse.json({
        valid: true,
        type: 'referral',
        code: ambassador.referral_code,
        label: `Kode Referral Sahabat (${ambassador.full_name || 'Kreator OtwPTN'})`,
      })
    }

    return NextResponse.json({ valid: false, error: 'Kode referral atau kupon tidak ditemukan.' })
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: err?.message || 'Gagal memvalidasi kode' }, { status: 500 })
  }
}
