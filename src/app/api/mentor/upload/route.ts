import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { getClientIp, rateLimit } from '@/lib/security'

const ALLOWED_EXTS = ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'zip']
const MAX_BYTES = 10 * 1024 * 1024 // 10MB

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!(await rateLimit('mentor_doc_upload', ip, 15, 3600))) {
      return NextResponse.json({ error: 'Terlalu banyak upload. Coba lagi nanti.' }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const type = (formData.get('type') as string) || 'doc'

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    }

    const nameParts = file.name.split('.')
    const ext = (nameParts[nameParts.length - 1] || '').toLowerCase()

    if (!ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json(
        { error: 'Tipe file tidak didukung. Gunakan PDF, JPG, PNG, DOC, atau ZIP.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Ukuran file maksimal 10MB.' }, { status: 400 })
    }

    const bytes = new Uint8Array(await file.arrayBuffer())
    const path = `mentors/${type}-${randomUUID()}.${ext}`

    const supabase = createServiceClient()
    const bucketName = 'uploads'

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(path, bytes, { contentType: file.type || 'application/octet-stream', upsert: false })

    if (uploadError) {
      console.error('[Mentor Upload Error]', uploadError)
      return NextResponse.json({ error: 'Gagal mengunggah file dokumen: ' + uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path)

    return NextResponse.json({ url: publicUrl })
  } catch (err: any) {
    console.error('[Mentor Upload Exception]', err)
    return NextResponse.json({ error: err?.message || 'Gagal mengunggah file' }, { status: 500 })
  }
}
