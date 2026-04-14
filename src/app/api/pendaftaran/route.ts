import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import PendaftaranDiterima from '@/lib/email/templates/PendaftaranDiterima'
import { generateRandomPassword } from '@/lib/utils'
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
  phone: z.string().min(8),
  school: z.string().min(2),
  payment_proof_url: z.string().url(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const supabase = await createAdminClient()

    // 1. Check / create user account
    let userId: string

    // Check if email already has an account via profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', data.email)
      .single()

    if (existingProfile?.id) {
      userId = existingProfile.id
    } else {
      // Create new account with random password → user resets via email
      const tempPassword = generateRandomPassword()
      const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: tempPassword,
        user_metadata: { full_name: data.full_name },
        email_confirm: true,
      })

      if (signUpError || !newUser?.user) {
        return NextResponse.json({ error: 'Gagal membuat akun' }, { status: 500 })
      }

      userId = newUser.user.id

      // Update profile with phone and school
      await supabase.from('profiles').upsert({
        id: userId,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        school: data.school,
      })

      // Send password reset so user can set their own password
      await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: data.email,
      })
    }

    // 2. Find package id by category + tier
    const { data: pkg } = await supabase
      .from('packages')
      .select('id')
      .eq('category', data.category)
      .eq('tier', data.tier)
      .eq('is_active', true)
      .single()

    // 3. Find jalur_utama id — stored as string id from constants, match by name pattern or fallback null
    // The jalur ids in constants are string slugs, map them to DB or store as-is
    const jalurUtamaId: string | null = pkg ? null : null // filled below

    // Insert registration with jalur_utama_id as text (id from JALUR_LIST constants)
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        user_id: userId,
        package_id: pkg?.id ?? null,
        jalur_utama_id: data.jalur_utama_id as unknown as string,
        addon_jalur_ids: data.addon_jalur_ids,
        total_price: data.total_price,
        status: 'pending',
        payment_proof: data.payment_proof_url,
        payment_method: 'transfer',
      })
      .select('id')
      .single()

    if (regError || !registration) {
      return NextResponse.json({ error: 'Gagal menyimpan pendaftaran' }, { status: 500 })
    }

    // 4. Send confirmation email
    await sendEmail({
      to: data.email,
      subject: 'Pendaftaran Bimbingan Diterima — otwptn',
      react: createElement(PendaftaranDiterima, {
        full_name: data.full_name,
        category: data.category as JalurCategory,
        tier: data.tier as PackageTier,
        total_price: data.total_price,
        registration_id: registration.id,
      }),
    })

    return NextResponse.json({ success: true, registration_id: registration.id })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
