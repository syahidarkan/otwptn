import { NextRequest, NextResponse } from 'next/server'

const INDEXNOW_KEY = 'b6a8276f5713426cb789ce89f3ec8791'
const HOST = 'otwptn.com'
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`

// Default high-priority pages to submit
const CORE_URLS = [
  `https://${HOST}`,
  `https://${HOST}/kalkulator`,
  `https://${HOST}/essay-review`,
  `https://${HOST}/jalur`,
  `https://${HOST}/panduan`,
  `https://${HOST}/upgrade`,
  `https://${HOST}/tanya-otbee`,
  `https://${HOST}/latihan-seleksi`,
  `https://${HOST}/tracking-jalur`,
  `https://${HOST}/artikel`,
  `https://${HOST}/kebijakan-privasi`,
  `https://${HOST}/kebijakan-pengembalian-dana`,
  `https://${HOST}/syarat-ketentuan`,
  `https://${HOST}/llms.txt`,
]

export async function POST(req: NextRequest) {
  try {
    let customUrls: string[] = []
    try {
      const body = await req.json()
      if (Array.isArray(body?.urls) && body.urls.length > 0) {
        customUrls = body.urls
      }
    } catch {}

    const urlList = Array.from(new Set([...CORE_URLS, ...customUrls]))

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }

    // Submit to IndexNow API (shared across Bing, Yandex, Seznam, Naver)
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    })

    return NextResponse.json({
      success: res.ok,
      status: res.status,
      message: res.ok
        ? `Berhasil submit ${urlList.length} URL ke IndexNow (Bing & AI Search Partner)!`
        : `IndexNow responded with status ${res.status}`,
      submittedCount: urlList.length,
      sampleUrls: urlList.slice(0, 5),
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menghubungi server IndexNow' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return POST(new NextRequest(`https://${HOST}/api/indexnow`, { method: 'POST' }))
}
