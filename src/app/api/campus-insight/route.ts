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

  // 3. Not in database -> Generate via AI
  try {
    const { client, model } = getAiClient('fast')

    const prompt = `Kamu adalah pakar konsultan pendidikan tinggi dan analisis prospek karir kampus Indonesia di platform OTWPTN.
Berikan analisis mendalam, realistis, dan memotivasi mengenai Program Studi: "${jurusan}" di Kampus: "${ptn}".

Balas HANYA dengan format JSON valid tanpa format markdown atau kutip luar tambahan. Skema JSON:
{
  "headline": "Kalimat headline penyemangat yang menyebutkan jurusan dan kampus secara spesifik",
  "gaji": {
    "deskripsi": "Ulasan 2-3 kalimat mengenai peluang pasar kerja dan daya saing lulusan jurusan ini",
    "fresh_grad": "Rp X.000.000 - Rp Y.000.000 / bulan",
    "mid_career": "Rp X.000.000 - Rp Y.000.000 / bulan",
    "senior": "Rp X.000.000 - Rp Y.000.000+ / bulan"
  },
  "lingkungan": {
    "deskripsi": "Ulasan suasana akademik, kultur mahasiswa, dan dinamika kampus di ${ptn}",
    "lokasi": "Deskripsi lokasi kampus ${ptn} dan opsi tempat tinggal/kos mahasiswa sekitar",
    "transportasi": "Kemudahan akses angkutan umum/komuter/shuttle kampus",
    "fasilitas": "Laboratorium, perpustakaan, atau fasilitas penunjang utama di ${ptn}",
    "suasana": "Kultur pertemanan, organisasi, dan gaya hidup mahasiswa di kota tersebut"
  },
  "jalur_dan_biaya": {
    "deskripsi": "Pilihan seleksi masuk dan kebijakan biaya kuliah UKT di ${ptn}",
    "snbp_snbt": "Estimasi rentang UKT per semester jalur nasional",
    "mandiri": "Gambaran jalur mandiri ${ptn} (IPI/uang pangkal atau non-IPI)",
    "biaya_hidup": "Perkiraan biaya hidup kos, makan, dan operasional per bulan di kota tersebut"
  },
  "alumni_dan_prospek": {
    "deskripsi": "Kekuatan ikatan alumni dan sektor industri yang menyerap lulusan",
    "profesi_populer": ["Profesi 1", "Profesi 2", "Profesi 3", "Profesi 4"],
    "alumni_tokoh": ["Sektor Industri / Tokoh 1", "Sektor Industri / Tokoh 2"]
  },
  "tips_lolos": {
    "deskripsi": "Tips persiapan belajar, analisis mapel pendukung rapor, dan strategi lolos seleksi",
    "strategi_khusus": "Trik spesifik untuk menembus persaingan jurusan ${jurusan} di ${ptn}"
  }
}`

    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content:
            'Kamu adalah asisten AI pendidikan tinggi Indonesia. Hasilkan output HANYA dalam JSON murni valid.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 1500,
    })

    const rawText = completion.choices[0]?.message?.content || '{}'
    const cleanJson = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const parsedData: CampusInsightPayload = JSON.parse(cleanJson)

    // Save to server memory cache
    memoryInsightCache[cacheKey] = parsedData

    // Save to Supabase Database (non-blocking)
    try {
      const supabase = await createClient()
      await supabase.from('campus_insights').upsert(
        {
          ptn,
          jurusan,
          insight_data: parsedData,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'ptn,jurusan' }
      )
    } catch (saveErr) {
      console.warn('Could not save campus insight to Supabase:', saveErr)
    }

    return NextResponse.json({
      data: parsedData,
      source: 'ai_generated',
      ptn,
      jurusan,
    })
  } catch (error) {
    console.error('AI insight generation failed, using fallback:', error)

    // Robust heuristic fallback generator
    const fallbackData: CampusInsightPayload = {
      headline: `Raih Impian Menjadi Profesional Unggul di ${jurusan}, ${ptn}!`,
      gaji: {
        deskripsi: `Lulusan ${jurusan} dari ${ptn} memiliki nilai tawar yang kuat di dunia industri modern dengan prospek kerja yang terus berkembang.`,
        fresh_grad: 'Rp 6.500.000 - Rp 12.000.000 / bulan',
        mid_career: 'Rp 15.000.000 - Rp 30.000.000 / bulan',
        senior: 'Rp 35.000.000 - Rp 70.000.000+ / bulan',
      },
      lingkungan: {
        deskripsi: `Kampus ${ptn} menyediakan ekosistem akademik yang dinamis, kolaboratif, dan mendukung perkembangan intelektual mahasiswa.`,
        lokasi: `Kampus utama ${ptn} dengan akses lingkungan asri dan kawasan hunian mahasiswa terjangkau.`,
        transportasi: `Didukung jaringan transportasi publik lokal dan armada mobilitas kampus.`,
        fasilitas: `Perpustakaan digital, pusat kegiatan mahasiswa, laboratorium terpadu, dan fasilitas olahraga.`,
        suasana: `Komunitas mahasiswa aktif dengan beragam organisasi keilmuan dan unit kegiatan seni/olahraga.`,
      },
      jalur_dan_biaya: {
        deskripsi: `Penerimaan mahasiswa baru ${ptn} diselenggarakan melalui jalur prestasi nasional, ujian tes, dan jalur mandiri.`,
        snbp_snbt: 'Rp 500.000 - Rp 15.000.000 / semester (Sesuai Golongan UKT)',
        mandiri: 'Tersedia jalur seleksi mandiri berbasis rapor/portofolio/ujian mandiri.',
        biaya_hidup: 'Rp 1.800.000 - Rp 3.500.000 / bulan (Kos dan kebutuhan dasar)',
      },
      alumni_dan_prospek: {
        deskripsi: `Jaringan alumni ${ptn} tersebar di berbagai institusi pemerintah, BUMN, korporasi swasta, dan industri startup.`,
        profesi_populer: [
          `Spesialis ${jurusan}`,
          'Konsultan & Analis',
          'Peneliti & Akademisi',
          'Manajer Operasional / Project Lead',
        ],
        alumni_tokoh: ['Sektor Industri Nasional', 'Lembaga Pemerintahan & BUMN'],
      },
      tips_lolos: {
        deskripsi: `Pertahankan tren peningkatan nilai rapor pada mata pelajaran pendukung linear dan lengkapi dengan sertifikat prestasi relevan.`,
        strategi_khusus: `Fokus pada optimasi nilai rapor semester 1-5 dan latih konsistensi pemahaman materi di Arena Latihan OTWPTN.`,
      },
    }

    memoryInsightCache[cacheKey] = fallbackData

    return NextResponse.json({
      data: fallbackData,
      source: 'fallback',
      ptn,
      jurusan,
    })
  }
}
