import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  try {
    // For registration flow: allow unauthenticated uploads but rate-limit by IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipe file tidak didukung. Gunakan JPG, PNG, atau PDF.' }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5MB.' }, { status: 400 })
    }

    // Use admin client for storage upload (anon can't upload to private bucket)
    const supabase = await createAdminClient()
    const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') ?? 'jpg'
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path = `uploads/${safeName}`

    const bytes = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(path, bytes, { contentType: file.type })

    if (uploadError) {
      return NextResponse.json({ error: 'Gagal upload file' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(path)

    return NextResponse.json({ url: publicUrl })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
