import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { getClientIp, rateLimit } from '@/lib/security'
import { PRICE_MATRIX, type Track } from '@/lib/pricing'
import { sendEmail } from '@/lib/email/send'
import PendaftaranDiterima from '@/lib/email/templates/PendaftaranDiterima'
import { createElement } from 'react'
import type { JalurCategory, PackageTier } from '@/types'

const schema = z.object({
  category: z.enum(['essay_only', 'prestasi_only', 'hybrid']),
  tier: z.enum(['review', 'dokumen', 'menyeluruh']),
  jalur_utama_id: z.string().min(1),
  addon_jalur_ids: z.array(z.string()).default([]),
  total_price: z.number().positive(),
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(8),
  school: z.string().min(2),
  payment_proof_url: z.string().url().max(500),
  referral_code: z.string().max(40).optional(),
})

const CATEGORY_TRACK: Record<string, Track> = { essay_only: 'essay', prestasi_only: 'prestasi', hybrid: 'hybrid' }
const ADDON_PRICE = 50000

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data

    // Unauthenticated endpoint that creates accounts and orders: throttle per IP and per email.
    if (!(await rateLimit('pendaftaran_ip', getClientIp(request), 5, 3600)) ||
        !(await rateLimit('pendaftaran_email', data.email.toLowerCase(), 3, 3600))) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' }, { status: 429 })
    }

    // The amount drives bank-transfer auto-matching, so it must be a real price (+ unique
    // suffix <= 999) and can never be an arbitrary client-chosen number.
    const entry = PRICE_MATRIX.individu[CATEGORY_TRACK[data.category]][data.tier]
    const floor = entry.referralAmount ?? entry.amount
    const ceiling = entry.amount + data.addon_jalur_ids.length * ADDON_PRICE + 999
    if (data.total_price < floor || data.total_price > ceiling) {
      return NextResponse.json({ error: 'Total harga tidak valid' }, { status: 400 })
    }
    // Same pending amount for two people makes transfer matching ambiguous: refuse.
    const supabase = createServiceClient()
    const { count: samePending } = await supabase
      .from('orders').select('id', { count: 'exact', head: true })
      .eq('amount', data.total_price).eq('status', 'pending').eq('payment_method', 'transfer')
    if ((samePending ?? 0) > 0) {
      return NextResponse.json({ error: 'Nominal transfer sedang dipakai pendaftar lain, tambahkan 1 sampai 99 rupiah lalu coba lagi' }, { status: 409 })
    }

    // 1. Check / create user account
    let userId: string

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', data.email)
      .maybeSingle()

    if (existingProfile?.id) {
      userId = existingProfile.id
    } else {
      const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        user_metadata: { full_name: data.full_name },
        email_confirm: true,
      })

      if (signUpError || !newUser?.user) {
        return NextResponse.json({ error: 'Gagal membuat akun' }, { status: 500 })
      }

      userId = newUser.user.id

      await supabase.from('profiles').upsert({
        id: userId,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        school_name: data.school,
      }, { onConflict: 'id' })
    }

    // 2. Create order (manual transfer flow)
    const invoiceNumber = `INV-${Date.now()}-${userId.slice(0, 8).toUpperCase()}`

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        tier: data.tier,
        amount: data.total_price,
        status: 'pending',
        invoice_number: invoiceNumber,
        payment_method: 'transfer',
        referral_code: data.referral_code ?? null,
        notes: JSON.stringify({
          category: data.category,
          jalur_utama_id: data.jalur_utama_id,
          addon_jalur_ids: data.addon_jalur_ids,
          payment_proof_url: data.payment_proof_url,
        }),
      })
      .select('id')
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Gagal menyimpan pendaftaran' }, { status: 500 })
    }

    // 3. Send confirmation email
    try {
      await sendEmail({
        to: data.email,
        subject: 'Pendaftaran Bimbingan Diterima - otwptn',
        react: createElement(PendaftaranDiterima, {
          full_name: data.full_name,
          category: data.category as JalurCategory,
          tier: data.tier as PackageTier,
          total_price: data.total_price,
          registration_id: order.id,
        }),
      })
    } catch {
      // Non-fatal: order already created
    }

    return NextResponse.json({ success: true, registration_id: order.id })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
