import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { matchesFileSignature, rateLimit } from '@/lib/security'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const MAX_BYTES = 5 * 1024 * 1024 // 5MB

function isWebp(bytes: Uint8Array): boolean {
  // RIFF....WEBP
  return (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  )
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!(await rateLimit('upload_avatar', user.id, 15, 3600))) {
    return NextResponse.json({ error: 'Terlalu sering mengganti foto profil. Coba lagi nanti.' }, { status: 429 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File gambar tidak ditemukan' }, { status: 400 })
    }

    const ext = ALLOWED_TYPES[file.type]
    if (!ext) {
      return NextResponse.json({ error: 'Format gambar harus JPG, PNG, atau WebP.' }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Ukuran gambar maksimal 5MB.' }, { status: 400 })
    }

    const bytes = new Uint8Array(await file.arrayBuffer())
    const validSig = file.type === 'image/webp' ? isWebp(bytes) : matchesFileSignature(bytes, file.type)
    if (!validSig) {
      return NextResponse.json({ error: 'Isi file gambar tidak valid.' }, { status: 400 })
    }

    const db = createServiceClient()
    const bucketName = 'avatars'

    // Ensure avatars public bucket exists
    const { data: buckets } = await db.storage.listBuckets()
    const hasBucket = (buckets ?? []).some(b => b.name === bucketName)
    if (!hasBucket) {
      await db.storage.createBucket(bucketName, { public: true }).catch(() => {})
    }

    const filePath = `${user.id}/avatar-${Date.now()}.${ext}`
    let publicUrl = ''

    const { error: uploadErr } = await db.storage
      .from(bucketName)
      .upload(filePath, bytes, { contentType: file.type, upsert: true })

    if (!uploadErr) {
      const { data: urlData } = db.storage.from(bucketName).getPublicUrl(filePath)
      publicUrl = urlData.publicUrl
    } else {
      // Fallback to 'uploads' bucket if 'avatars' bucket creation was restricted
      const fallbackPath = `avatars/${user.id}/avatar-${Date.now()}.${ext}`
      const { error: fallbackErr } = await db.storage
        .from('uploads')
        .upload(fallbackPath, bytes, { contentType: file.type, upsert: true })
      if (!fallbackErr) {
        const { data: urlData } = db.storage.from('uploads').getPublicUrl(fallbackPath)
        publicUrl = urlData.publicUrl
      } else {
        return NextResponse.json({ error: 'Gagal menyimpan foto profil ke storage.' }, { status: 500 })
      }
    }

    await db
      .from('profiles')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    await db.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        avatar_url: publicUrl,
      },
    }).catch(() => {})

    return NextResponse.json({ avatarUrl: publicUrl })
  } catch (err) {
    console.error('[Avatar Upload Error]', err)
    return NextResponse.json({ error: 'Terjadi kesalahan saat mengunggah foto.' }, { status: 500 })
  }
}

