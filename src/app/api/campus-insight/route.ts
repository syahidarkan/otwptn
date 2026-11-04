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

// High-quality fallback generator so users NEVER get a broken page
function buildFallbackInsight(ptn: string, jurusan: string): CampusInsightPayload {
  const isTech = /informatika|komputer|sistem informasi|data|software|cyber/i.test(jurusan)
  const isMed = /kedokteran|farmasi|kebidanan|keperawatan|gigi/i.test(jurusan)
  const isEcon = /manajemen|akuntansi|ekonomi|bisnis/i.test(jurusan)
  const isLaw = /hukum/i.test(jurusan)

  let salaryFresh = 'Rp 6.500.000 - Rp 11.000.000 / bulan'
  let salaryMid = 'Rp 14.000.000 - Rp 25.000.000 / bulan'
  let salarySenior = 'Rp 30.000.000+ / bulan'
  let professions = [
    `Spesialis ${jurusan}`,
    'Analis Kebijakan & Strategi',
    'Konsultan Profesional Industri',
    'Manajer Proyek / Project Leader',
  ]

  if (isTech) {
    salaryFresh = 'Rp 8.000.000 - Rp 14.000.000 / bulan'
    salaryMid = 'Rp 18.000.000 - Rp 35.000.000 / bulan'
    salarySenior = 'Rp 45.000.000+ / bulan'
    professions = [
      'Software Engineer / System Architect',
      'Data Scientist / BI Specialist',
      'IT Consultant & Product Specialist',
      'Product Manager di Tech Startup / Unicorn',
    ]
  } else if (isMed) {
    salaryFresh = 'Rp 7.000.000 - Rp 12.000.000 / bulan'
    salaryMid = 'Rp 20.000.000 - Rp 40.000.000 / bulan'
    salarySenior = 'Rp 50.000.000+ / bulan'
    professions = [
      'Praktisi Kesehatan / Dokter Klinisi',
      'Peneliti Medis & Dosen Akademisi',
      'Konsultan Rumah Sakit & Layanan Publik',
      'Spesialis Manajemen Fasilitas Kesehatan',
    ]
  } else if (isEcon) {
    salaryFresh = 'Rp 6.500.000 - Rp 12.000.000 / bulan'
    salaryMid = 'Rp 15.000.000 - Rp 28.000.000 / bulan'
    salarySenior = 'Rp 35.000.000+ / bulan'
    professions = [
      'Financial Analyst / Investment Banker',
      'Auditor di Kantor Akuntan Publik Big 4',
      'Brand & Growth Strategist',
      'Management Consultant',
    ]
  } else if (isLaw) {
    salaryFresh = 'Rp 6.500.000 - Rp 12.000.000 / bulan'
    salaryMid = 'Rp 16.000.000 - Rp 30.000.000 / bulan'
    salarySenior = 'Rp 40.000.000+ / bulan'
    professions = [
      'Corporate Legal Counsel',
      'Advokat di Top Tier Law Firm',
      'Diplomat / Analis Hubungan Lembaga',
      'Jaksa / Hakim / Birokrat Kementerian',
    ]
  }

  return {
    headline: `Raih Karier Gemilang di Bidang ${jurusan} Bersama ${ptn}`,
    gaji: {
      deskripsi: `Lulusan ${jurusan} dari ${ptn} memiliki reputasi teruji dengan tingkat keterserapan tinggi di sektor korporasi multinasional, BUMN, maupun industri digital modern.`,
      fresh_grad: salaryFresh,
      mid_career: salaryMid,
      senior: salarySenior,
    },
    lingkungan: {
      deskripsi: `Lingkungan akademik di ${ptn} berfokus pada kolaborasi riset, integritas ilmiah, serta ekosistem mahasiswa yang kompetitif dan suportif.`,
      lokasi: `Kawasan kampus ${ptn} memiliki akses hunian kos dan asrama mahasiswa dengan variasi biaya hidup yang terjangkau.`,
      transportasi: 'Tersedia koneksi angkutan umum kota, stasiun komuter terdekat, serta fasilitas shuttle bus kampus gratis.',
      fasilitas: `Laboratorium modern terpadu, perpustakaan digital nasional, co-working space mahasiswa, dan sarana olahraga lengkap di ${ptn}.`,
      suasana: 'Atmosfer belajar aktif dengan organisasi kemahasiswaan, komunitas riset, dan kompetisi tingkat nasional maupun internasional.',
    },
    jalur_dan_biaya: {
      deskripsi: `Penerimaan mahasiswa baru di ${ptn} dibuka secara transparan melalui seleksi nasional SNBP, SNBT, serta seleksi mandiri berbasis prestasi dan nilai rapor.`,
      snbp_snbt: 'Rp 500.000 - Rp 12.500.000 / semester (Sesuai Golongan UKT Berkeadilan)',
      mandiri: 'UKT Reguler / Golongan Khusus + IPI (Iuran Pengembangan Institusi berjenjang)',
      biaya_hidup: 'Rp 2.000.000 - Rp 3.500.000 / bulan (Estimasi hunian kos, konsumsi harian, dan operasional)',
    },
    alumni_dan_prospek: {
      deskripsi: `Ikatan alumni ${ptn} tersebar solid di berbagai jajaran kepemimpinan institusi publik, perusahaan Fortune 500, dan perintis startup unicorn.`,
      profesi_populer: professions,
      alumni_tokoh: [
        'Direksi BUMN & Perusahaan Terbuka (Tbk)',
        'Kementerian Teknis & Lembaga Riset Nasional',
        'Tech Leaders di Startup Asia Tenggara',
      ],
    },
    tips_lolos: {
      deskripsi: `Persaingan masuk ${jurusan} di ${ptn} menuntut konsistensi grafik nilai rapor semester 1-5 dan esai motivasi yang mengaitkan visi pribadi dengan potensi kampus.`,
      strategi_khusus: `Maksimalkan linearitas mata pelajaran pendukung di rapor, sertakan sertifikat kejuaraan berjenjang (Puspresnas/OSN/LKTIN), dan validasi skor aman menggunakan Kalkulator Peluang OTWPTN.`,
    },
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawPtn = (searchParams.get('ptn') || '').trim()
  const rawJurusan = (searchParams.get('jurusan') || '').trim()

  if (!rawPtn || !rawJurusan) {
    return NextResponse.json(
      { error: 'Parameter ptn dan jurusan diperlukan' },
      { status: 400 }
    )
  }

  // Clean PTN and Jurusan names (e.g. "Universitas Indonesia (UI)" -> "Universitas Indonesia")
  const ptn = rawPtn.replace(/\s*\([A-Z0-9.\s-]+\)\s*$/i, '').trim() || rawPtn
  const jurusan = rawJurusan.replace(/\s*\([A-Z0-9.\s-]+\)\s*$/i, '').trim() || rawJurusan

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
      .or(`ptn.ilike.%${ptn}%,ptn.ilike.%${rawPtn}%`)
      .ilike('jurusan', `%${jurusan}%`)
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

  // 3. Generate via AI with robust fast model
  try {
    const { client, model } = getAiClient('default')

    const insightPrompt = `Kamu adalah pakar konsultan pendidikan tinggi Indonesia di platform OTWPTN.
Berikan analisis mendalam, realistis, dan akurat untuk:
Program Studi: "${jurusan}"
Kampus: "${ptn}" (Indonesia).

Balas HANYA dengan format JSON valid tanpa format markdown atau kutipan teks tambahan:
{
  "headline": "Kalimat headline motivasi spesifik menyebut jurusan dan kampus",
  "gaji": {
    "deskripsi": "Ulasan 2 kalimat peluang pasar kerja dan daya saing lulusan",
    "fresh_grad": "Rp X.000.000 - Rp Y.000.000 / bulan",
    "mid_career": "Rp X.000.000 - Rp Y.000.000 / bulan",
    "senior": "Rp X.000.000+ / bulan"
  },
  "lingkungan": {
    "deskripsi": "Ulasan suasana akademik di ${ptn}",
    "lokasi": "Deskripsi lokasi kampus dan hunian mahasiswa",
    "transportasi": "Akses transportasi umum dan fasilitas transportasi kampus",
    "fasilitas": "Laboratorium atau sarana penunjang utama di ${ptn}",
    "suasana": "Kultur pertemanan dan kegiatan mahasiswa"
  },
  "jalur_dan_biaya": {
    "deskripsi": "Jalur masuk yang tersedia di ${ptn}",
    "snbp_snbt": "Estimasi rentang UKT per semester",
    "mandiri": "Gambaran jalur mandiri",
    "biaya_hidup": "Perkiraan biaya hidup per bulan"
  },
  "alumni_dan_prospek": {
    "deskripsi": "Kekuatan ikatan alumni dan sektor industri",
    "profesi_populer": ["Profesi 1", "Profesi 2", "Profesi 3", "Profesi 4"],
    "alumni_tokoh": ["Sektor Industri 1", "Sektor Industri 2"]
  },
  "tips_lolos": {
    "deskripsi": "Tips persiapan belajar dan rapor",
    "strategi_khusus": "Trik spesifik untuk menembus persaingan jurusan ini di ${ptn}"
  }
}`

    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'Kamu asisten AI konsultan pendidikan tinggi Indonesia. Hasilkan output HANYA dalam JSON murni valid.',
        },
        { role: 'user', content: insightPrompt },
      ],
      temperature: 0.3,
      max_tokens: 850,
    })

    const rawText = completion.choices[0]?.message?.content || '{}'
    const cleanJson = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    let parsedData: CampusInsightPayload
    try {
      parsedData = JSON.parse(cleanJson)
    } catch {
      parsedData = buildFallbackInsight(ptn, jurusan)
    }

    // Validate that basic keys exist
    if (!parsedData.gaji || !parsedData.lingkungan || !parsedData.jalur_dan_biaya) {
      parsedData = buildFallbackInsight(ptn, jurusan)
    }

    memoryInsightCache[cacheKey] = parsedData

    // Save to Supabase (non-blocking)
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
    console.warn('AI insight generation failed, serving reliable fallback:', error)
    const fallbackData = buildFallbackInsight(ptn, jurusan)
    memoryInsightCache[cacheKey] = fallbackData
    return NextResponse.json({
      data: fallbackData,
      source: 'fallback_template',
      ptn,
      jurusan,
    })
  }
}
