import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import mammoth from 'mammoth'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const contentType = request.headers.get('content-type') || ''

    // 1. JSON Request: Google Docs URL import
    if (contentType.includes('application/json')) {
      const body = await request.json()
      const { gdocsUrl } = body

      if (!gdocsUrl || typeof gdocsUrl !== 'string') {
        return NextResponse.json({ error: 'URL Google Docs wajib diisi.' }, { status: 400 })
      }

      // Extract Document ID
      const match = gdocsUrl.match(/\/document\/d\/([a-zA-Z0-9_-]+)/)
      if (!match || !match[1]) {
        return NextResponse.json({
          error: 'invalid_url',
          message: 'Format URL Google Docs tidak valid. Pastikan link memiliki format: https://docs.google.com/document/d/...',
        }, { status: 400 })
      }

      const docId = match[1]
      const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`

      try {
        const fetchRes = await fetch(exportUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          redirect: 'follow',
        })

        if (!fetchRes.ok) {
          return NextResponse.json({
            error: 'gdocs_private',
            message: 'Dokumen Google Docs tidak dapat diakses. Pastikan dokumen sudah diatur ke "Siapa saja yang memiliki link dapat melihat" (Anyone with the link).',
          }, { status: 403 })
        }

        const text = await fetchRes.text()
        // If Google redirected to an HTML login screen, text will start with HTML tags
        if (text.includes('<!DOCTYPE html>') || text.includes('<html') || text.includes('accounts.google.com')) {
          return NextResponse.json({
            error: 'gdocs_private',
            message: 'Dokumen Google Docs masih berstatus privat. Buka Google Docs > Klik tombol "Bagikan" (Share) > Ubah Akses Umum menjadi "Siapa saja yang memiliki link" > Salin link lalu coba lagi.',
          }, { status: 403 })
        }

        const cleanText = text.trim()
        if (cleanText.length < 10) {
          return NextResponse.json({
            error: 'empty_doc',
            message: 'Dokumen Google Docs tampak kosong atau tidak berisi teks.',
          }, { status: 400 })
        }

        return NextResponse.json({
          success: true,
          text: cleanText,
          source: 'gdocs',
        })
      } catch (err: any) {
        return NextResponse.json({
          error: 'fetch_failed',
          message: 'Gagal mengambil konten dari Google Docs: ' + (err.message || 'Koneksi terputus'),
        }, { status: 500 })
      }
    }

    // 2. Multipart Form Data: File Upload (.docx or .txt)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 400 })
      }

      const fileName = file.name || 'document'
      const ext = fileName.split('.').pop()?.toLowerCase()

      if (ext === 'txt') {
        const text = await file.text()
        return NextResponse.json({
          success: true,
          text: text.trim(),
          fileName,
          source: 'txt',
        })
      }

      if (ext === 'docx') {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const result = await mammoth.extractRawText({ buffer })
        const text = result.value.trim()

        return NextResponse.json({
          success: true,
          text,
          fileName,
          source: 'docx',
        })
      }

      return NextResponse.json({
        error: 'unsupported_format',
        message: 'Format file tidak didukung. Harap upload file berekstensi .docx atau .txt.',
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Content-Type tidak didukung.' }, { status: 400 })
  } catch (error: any) {
    console.error('[Essay Import Error]:', error)
    return NextResponse.json({
      error: 'server_error',
      message: 'Terjadi kesalahan saat memproses import dokumen: ' + (error.message || 'Error internal'),
    }, { status: 500 })
  }
}
