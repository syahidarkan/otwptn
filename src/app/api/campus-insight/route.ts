import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAiClient } from '@/lib/ai/client'

export const dynamic = 'force-dynamic'

interface CampusInsightPayload {
  headline: string
  gaji: {
    deskripsi: string
    fresh_grad: string
    mid_career: string
    senior: string
  }
  lingkungan: {
    deskripsi: string
    lokasi: string
    transportasi: string
    fasilitas: string
    suasana: string
  }
  jalur_dan_biaya: {
    deskripsi: string
    snbp_snbt: string
    mandiri: string
    biaya_hidup: string
  }
  alumni_dan_prospek: {
    deskripsi: string
    profesi_populer: string[]
    alumni_tokoh: string[]
  }
  tips_lolos: {
    deskripsi: string
    strategi_khusus: string
  }
}

// In-memory server fallback cache to ensure instant retrieval without wasting tokens
const memoryInsightCache: Record<string, CampusInsightPayload> = {}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ptn = (searchParams.get('ptn') || '').trim()
  const jurusan = (searchParams.get('jurusan') || '').trim()

  if (!ptn || !jurusan) {
    return NextResponse.json(
      { error: 'Parameter ptn dan jurusan diperlukan' },
      { status: 400 }
    )
  }

  const cacheKey = `${ptn.toLowerCase()}::${jurusan.toLowerCase()}`

  // 1. Check in-memory server cache
  if (memoryInsightCache[cacheKey]) {
    return NextResponse.json({
      data: memoryInsightCache[cacheKey],
      source: 'memory_cache',
      ptn,
      jurusan,
    })
  }

  // 2. Check Supabase Database
  try {
    const supabase = await createClient()
    const { data: dbRecord } = await supabase
      .from('campus_insights')
      .select('insight_data')
      .ilike('ptn', ptn)
      .ilike('jurusan', jurusan)
      .maybeSingle()

    if (dbRecord?.insight_data) {
      memoryInsightCache[cacheKey] = dbRecord.insight_data
      return NextResponse.json({
        data: dbRecord.insight_data,
        source: 'database_cache',
        ptn,
        jurusan,
      })
    }
  } catch (err) {
    console.warn('Campus insight database check skipped/fallback:', err)
  }

  // 3. Not in database -> Validate then Generate via AI
  try {
    const { client, model } = getAiClient('fast')

    const validationPrompt = `Kamu adalah verifikator data akademik PTN Indonesia yang SANGAT KETAT dan hanya mengandalkan fakta resmi.

TUGAS: Verifikasi apakah program studi "${jurusan}" BENAR-BENAR ADA dan AKTIF di "${ptn}" Indonesia.

ATURAN KETAT:
- Hanya jawab berdasarkan fakta nyata. Jangan menebak.
- Jika ada keraguan sedikit pun, jawab "tidak_valid".
- Nama jurusan yang mirip tapi beda (misal: "Teknik Sipil" ≠ "Rekayasa Sipil") = verifikasi apakah nama itu RESMI.
- Jika PTN yang dimaksud tidak jelas atau tidak dikenal = tidak_valid.
- Jika jurusan itu tidak ada di PTN tersebut (misal: Fisioterapi di ITB, Kedokteran Hewan di UI = tidak ada) = tidak_valid.

Balas HANYA JSON murni tanpa markdown:
{
  "is_valid": true | false,
  "nama_resmi_ptn": "Nama resmi lengkap PTN (null jika tidak valid)",
  "nama_resmi_jurusan": "Nama resmi program studi sesuai Dikti/PDDikti (null jika tidak valid)",
  "fakultas": "Nama fakultas/sekolah (null jika tidak valid)",
  "alasan_tidak_valid": "Penjelasan singkat mengapa tidak valid (null jika valid)"
}`

    const validationCompletion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'Kamu verifikator data akademik PTN Indonesia. Output HANYA JSON murni.' },
        { role: 'user', content: validationPrompt },
      ],
      temperature: 0,
      max_tokens: 300,
    })

    const validationRaw = (validationCompletion.choices[0]?.message?.content ?? '{}')
      .replace(/```json/g, '').replace(/```/g, '').trim()

    let validationResult: { is_valid: boolean; nama_resmi_ptn: string | null; nama_resmi_jurusan: string | null; fakultas: string | null; alasan_tidak_valid: string | null }
    try {
      validationResult = JSON.parse(validationRaw)
    } catch {
      validationResult = { is_valid: false, nama_resmi_ptn: null, nama_resmi_jurusan: null, fakultas: null, alasan_tidak_valid: 'Gagal memverifikasi data' }
    }

    if (!validationResult.is_valid) {
      return NextResponse.json(
        {
          error: 'jurusan_tidak_valid',
          message: `Program studi "${jurusan}" tidak ditemukan di "${ptn}". ${validationResult.alasan_tidak_valid ?? ''}`.trim(),
          ptn,
          jurusan,
        },
        { status: 404 }
      )
    }

    // Use verified official names for accurate data generation
    const verifiedPtn = validationResult.nama_resmi_ptn ?? ptn
    const verifiedJurusan = validationResult.nama_resmi_jurusan ?? jurusan
    const verifiedFakultas = validationResult.fakultas ?? ''

    const insightPrompt = `Kamu adalah pakar konsultan pendidikan tinggi dan analisis prospek karir kampus Indonesia di platform OTWPTN.
Berikan analisis mendalam dan AKURAT mengenai Program Studi: "${verifiedJurusan}"${verifiedFakultas ? ` (${verifiedFakultas})` : ''} di Kampus: "${verifiedPtn}".

PENTING: Berikan informasi faktual dan realistis. Jangan mengarang data gaji atau alumni yang tidak ada dasarnya.

Balas HANYA dengan format JSON valid tanpa format markdown:
{
  "headline": "Kalimat headline penyemangat yang menyebutkan jurusan dan kampus secara spesifik",
  "gaji": {
    "deskripsi": "Ulasan 2-3 kalimat mengenai peluang pasar kerja dan daya saing lulusan jurusan ini secara realistis",
    "fresh_grad": "Rp X.000.000 - Rp Y.000.000 / bulan",
    "mid_career": "Rp X.000.000 - Rp Y.000.000 / bulan",
    "senior": "Rp X.000.000 - Rp Y.000.000+ / bulan"
  },
  "lingkungan": {
    "deskripsi": "Ulasan suasana akademik, kultur mahasiswa, dan dinamika kampus di ${verifiedPtn}",
    "lokasi": "Deskripsi lokasi kampus dan opsi tempat tinggal mahasiswa",
    "transportasi": "Kemudahan akses angkutan umum/komuter/shuttle kampus",
    "fasilitas": "Laboratorium, perpustakaan, atau fasilitas penunjang utama di ${verifiedPtn}",
    "suasana": "Kultur pertemanan, organisasi, dan gaya hidup mahasiswa"
  },
  "jalur_dan_biaya": {
    "deskripsi": "Pilihan seleksi masuk dan kebijakan biaya kuliah UKT di ${verifiedPtn}",
    "snbp_snbt": "Estimasi rentang UKT per semester jalur nasional",
    "mandiri": "Gambaran jalur mandiri (IPI/uang pangkal atau non-IPI)",
    "biaya_hidup": "Perkiraan biaya hidup kos, makan, dan operasional per bulan"
  },
  "alumni_dan_prospek": {
    "deskripsi": "Kekuatan ikatan alumni dan sektor industri yang menyerap lulusan",
    "profesi_populer": ["Profesi 1", "Profesi 2", "Profesi 3", "Profesi 4"],
    "alumni_tokoh": ["Sektor Industri / Tokoh 1", "Sektor Industri / Tokoh 2"]
  },
  "tips_lolos": {
    "deskripsi": "Tips persiapan belajar, analisis mapel pendukung rapor, dan strategi lolos seleksi",
    "strategi_khusus": "Trik spesifik untuk menembus persaingan jurusan ini di ${verifiedPtn}"
  }
}`

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'Kamu adalah asisten AI pendidikan tinggi Indonesia. Hasilkan output HANYA dalam JSON murni valid.' },
        { role: 'user', content: insightPrompt },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    })

    const rawText = completion.choices[0]?.message?.content || '{}'
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsedData: CampusInsightPayload = JSON.parse(cleanJson)

    memoryInsightCache[cacheKey] = parsedData

    // Save to Supabase (non-blocking)
    try {
      const supabase = await createClient()
      await supabase.from('campus_insights').upsert(
        { ptn: verifiedPtn, jurusan: verifiedJurusan, insight_data: parsedData, created_at: new Date().toISOString() },
        { onConflict: 'ptn,jurusan' }
      )
    } catch (saveErr) {
      console.warn('Could not save campus insight to Supabase:', saveErr)
    }

    return NextResponse.json({ data: parsedData, source: 'ai_generated', ptn: verifiedPtn, jurusan: verifiedJurusan })
  } catch (error) {
    console.error('Campus insight generation failed:', error)
    return NextResponse.json(
      { error: 'Gagal menghasilkan insight. Coba lagi beberapa saat.' },
      { status: 500 }
    )
  }
}

