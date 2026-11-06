import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { getClientIp, matchesFileSignature, rateLimit } from '@/lib/security'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
}
const MAX_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  try {
    // Registration flow allows unauthenticated uploads, so throttle per IP.
    const ip = getClientIp(request)
    if (!(await rateLimit('upload_payment', ip, 10, 3600))) {
      return NextResponse.json({ error: 'Terlalu banyak upload. Coba lagi nanti.' }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    }

    const ext = ALLOWED_TYPES[file.type]
    if (!ext) {
      return NextResponse.json({ error: 'Tipe file tidak didukung. Gunakan JPG, PNG, atau PDF.' }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5MB.' }, { status: 400 })
    }

    const bytes = new Uint8Array(await file.arrayBuffer())
    // The browser-declared MIME type is attacker controlled: verify the real file signature.
    if (!matchesFileSignature(bytes, file.type)) {
      return NextResponse.json({ error: 'Isi file tidak sesuai dengan tipenya.' }, { status: 400 })
    }

    // Extension comes from the verified type (never from the client file name) and the
    // object name is an unguessable UUID, so proofs cannot be enumerated via the public URL.
    const path = `uploads/${randomUUID()}.${ext}`

    const supabase = createServiceClient()
    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(path, bytes, { contentType: file.type, upsert: false })

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
