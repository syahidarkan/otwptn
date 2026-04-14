import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  try {
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

    const supabase = await createAdminClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path = `uploads/${fileName}`

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
