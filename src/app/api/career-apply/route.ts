import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { getClientIp, rateLimit, verifyTurnstileToken } from '@/lib/security'

const schema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  phone: z.string().min(8, 'Nomor WhatsApp minimal 8 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  age: z.string().min(1, 'Usia wajib diisi'),
  educationStatus: z.string().min(1, 'Status pendidikan wajib dipilih'),
  schoolOrCampus: z.string().min(2, 'Asal sekolah atau kampus wajib diisi'),
  instagram: z.string().min(1, 'Username Instagram wajib diisi'),
  tiktok: z.string().min(1, 'Username TikTok wajib diisi'),
  portfolioLink: z.string().url('Link video atau portofolio harus berupa URL yang valid (Google Drive, TikTok, atau IG)'),
  phoneModel: z.string().min(2, 'Tipe HP wajib diisi'),
  reason: z.string().max(3000).min(10, 'Ceritakan alasan kamu minimal 10 karakter'),
  position: z.string().default('Marketing Partner (Content Creator)'),
  turnstileToken: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const ip = getClientIp(request)

    if (parsed.data.turnstileToken) {
      const turnstileOk = await verifyTurnstileToken(parsed.data.turnstileToken, ip)
      if (!turnstileOk) {
        return NextResponse.json({ error: 'Verifikasi bot gagal. Muat ulang halaman dan coba lagi.' }, { status: 400 })
      }
    }

    if (!(await rateLimit('career_apply', ip, 5, 3600))) {
      return NextResponse.json({ error: 'Terlalu banyak pengiriman. Coba lagi nanti.' }, { status: 429 })
    }

    const data = parsed.data
    const referenceId = `MP-${Date.now().toString(36).toUpperCase()}`

    const supabase = createServiceClient()

    // 1. Create Auth User account via Admin API (pre-created, marked inactive until approved)
    let userId: string | null = null
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.fullName,
        phone: data.phone,
        role: 'creator',
      },
    })

    if (authError) {
      const isAlreadyRegistered =
        authError.message?.toLowerCase().includes('already registered') ||
        authError.message?.toLowerCase().includes('already exists')
      if (isAlreadyRegistered) {
        return NextResponse.json(
          { error: 'Email ini sudah terdaftar sebagai akun OtwPTN. Silakan gunakan email lain atau login.' },
          { status: 400 }
        )
      }
      console.error('[Career Application Auth Creation Error]', authError)
      return NextResponse.json(
        { error: `Gagal membuat akun kreator: ${authError.message}` },
        { status: 500 }
      )
    }

    userId = authUser.user.id

    // 2. Set profile status to inactive (pending admin approval)
    try {
      await supabase.from('profiles').upsert({
        id: userId,
        email: data.email,
        full_name: data.fullName,
        phone: data.phone,
        role: 'creator',
        is_active: false,
      })
    } catch (profErr) {
      console.warn('[Career Apply Profile Update Warn]', profErr)
    }

    // 3. Store career application record
    const { error: dbError } = await supabase.from('career_applications').insert({
      reference_id: referenceId,
      user_id: userId,
      position: data.position,
      full_name: data.fullName,
      phone: data.phone,
      email: data.email,
      age: data.age,
      education_status: data.educationStatus,
      school_or_campus: data.schoolOrCampus,
      instagram: data.instagram,
      tiktok: data.tiktok,
      portfolio_link: data.portfolioLink,
      phone_model: data.phoneModel,
      reason: data.reason,
      status: 'pending',
      created_at: new Date().toISOString(),
    })

    if (dbError) {
      console.error('[Career Application DB Error]', dbError)
      return NextResponse.json(
        { error: 'Gagal menyimpan pendaftaran ke database: ' + dbError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      referenceId,
      message: 'Pendaftaran dan pembuatan akun Marketing Partner berhasil dikirim.',
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        position: data.position,
      },
    })
  } catch (error) {
    console.error('Error submitting career application:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memproses formulir.' },
      { status: 500 }
    )
  }
}

