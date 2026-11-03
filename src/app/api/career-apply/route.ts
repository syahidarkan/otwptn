import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'

const schema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  phone: z.string().min(8, 'Nomor WhatsApp minimal 8 karakter'),
  email: z.string().email('Format email tidak valid'),
  age: z.string().min(1, 'Usia wajib diisi'),
  educationStatus: z.string().min(1, 'Status pendidikan wajib dipilih'),
  schoolOrCampus: z.string().min(2, 'Asal sekolah atau kampus wajib diisi'),
  instagram: z.string().min(1, 'Username Instagram wajib diisi'),
  tiktok: z.string().min(1, 'Username TikTok wajib diisi'),
  portfolioLink: z.string().url('Link video atau portofolio harus berupa URL yang valid (Google Drive, TikTok, atau IG)'),
  phoneModel: z.string().min(2, 'Tipe HP wajib diisi'),
  reason: z.string().min(10, 'Ceritakan alasan kamu minimal 10 karakter'),
  position: z.string().default('Marketing Partner (Content Creator)'),
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

    const data = parsed.data
    const referenceId = `MP-${Date.now().toString(36).toUpperCase()}`

    // Try saving to Supabase if table exists
    try {
      const supabase = await createAdminClient()
      await supabase.from('career_applications').insert({
        reference_id: referenceId,
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
        created_at: new Date().toISOString(),
      })
    } catch {
      // Graceful fallback if table does not exist yet
      console.warn('career_applications table not found, fallback to reference ID response')
    }

    return NextResponse.json({
      success: true,
      referenceId,
      message: 'Pendaftaran Marketing Partner berhasil diterima.',
      data: {
        fullName: data.fullName,
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

