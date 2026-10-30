import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAiClient } from '@/lib/ai/client'

const TIER_KALKULATOR_LIMIT: Record<string, number | null> = {
  free: 1, web_premium: 5, review: 10, reguler: null, intensif: null,
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single()
  const tier = profile?.tier ?? 'free'
  const limit = TIER_KALKULATOR_LIMIT[tier]

  if (limit !== null) {
    const { data: quota } = await supabase
      .from('usage_quotas')
      .select('used_count')
      .eq('user_id', user.id)
      .eq('feature', 'ai_kalkulator')
      .single()

    const used = quota?.used_count ?? 0
    if (used >= limit) {
      return NextResponse.json({ error: 'quota_exceeded', limit }, { status: 403 })
    }
  }

  const body = await request.json()
  const {
    jalur_type, target_ptn, target_jalur, avg_rapor, school_rank_tier,
    cert_count, cert_highest_level,
    semesters, certificates, class_rank, class_total,
    is_snbp_eligible, eligible_rank, school_quota,
    school_accreditation, tka_completed, pilihan_1, pilihan_2,
  } = body as {
    jalur_type?: 'snbp' | 'institusi'
    target_ptn: string; target_jalur: string; avg_rapor: number; school_rank_tier: string
    cert_count: number; cert_highest_level?: string
    semesters?: { semester: number; subjects: { name: string; category: string; grade: number }[] }[]
    certificates?: { name: string; level: string; rank: string; year: string }[]
    class_rank?: number; class_total?: number
    is_snbp_eligible?: boolean; eligible_rank?: number; school_quota?: number
    school_accreditation?: string; tka_completed?: boolean
    pilihan_1?: { ptn: string; prodi: string }; pilihan_2?: { ptn: string; prodi: string }
  }

  const { client, model } = getAiClient('complex')

  const semesterBreakdown = (semesters ?? [])
    .filter(s => s.subjects.length > 0)
    .map(s => {
      const bySubject = s.subjects.map(sub => `${sub.name} (${sub.category}): ${sub.grade}`).join(', ')
      const avg = (s.subjects.reduce((sum, sub) => sum + sub.grade, 0) / s.subjects.length).toFixed(1)
      return `  Semester ${s.semester} (rata-rata ${avg}): ${bySubject}`
    })
    .join('\n')

  const certBreakdown = (certificates ?? [])
    .map(c => `  - ${c.name} - tingkat ${c.level}, ${c.rank}, tahun ${c.year}`)
    .join('\n')

  const rankText = class_rank && class_total ? `Peringkat ${class_rank} dari ${class_total} siswa (${((class_rank / class_total) * 100).toFixed(1)}% teratas)` : school_rank_tier

  let prompt: string

  if (jalur_type === 'snbp') {
    const quotaPct: Record<string, string> = { A: '40%', B: '25%', C: '5% (+5% jika sekolah pakai e-Rapor)' }
    const eligibilityText = is_snbp_eligible === true
      ? `Eligible resmi sekolah (peringkat ke-${eligible_rank ?? '?'} dari kuota ${school_quota ?? '?'} siswa)`
      : is_snbp_eligible === false
        ? 'Belum termasuk kuota eligible sekolah'
        : 'Status eligible belum diverifikasi sekolah'

    prompt = `Kamu adalah Pakar & Konsultan Senior Rasionalisasi SNBP (Seleksi Nasional Berdasarkan Prestasi) & PTN Indonesia di platform otwptn (PT. Lembaga Sains Nasional).
Lakukan evaluasi multi-faktor yang mendalam, realistis, dan presisi tinggi sesuai dinamika seleksi SNPMB.

FRAMEWORK EVALUASI MULTI-FAKTOR:
1. Validasi Administratif & Kuota Sekolah:
   - Akreditasi A (kuota 40% siswa paralel terbaik), B (25%), C (5%).
   - TKA (Tes Kemampuan Akademik) merupakan syarat wajib administratif. Jika belum selesai, wajib diingatkan sebagai risiko gugur administrasi.
2. Analisis Akademik & Mata Pelajaran Pendukung (Kepmenristekdikti):
   - Jangan hanya melihat rata-rata umum rapor, tapi analisis tren grafik semester 1-5 (apakah naik stabil, turun, atau stagnan).
   - Evaluasi nilai mata pelajaran pendukung spesifik untuk Program Studi Pilihan 1 & 2 (contoh: Kedokteran -> Biologi & Kimia; Teknik/Informatika -> Matematika & Fisika; Manajemen/Hukum/Sosial -> Ekonomi, Sosiologi, Bhs. Inggris).
3. Evaluasi Sertifikat & Prestasi:
   - Tier 1: Lomba resmi Puspresnas / BPTI / Kemendikbudristek (OSN, O2SN, FLS2N, KSM) tingkat Nasional/Internasional (bobot penguat tertinggi).
   - Tier 2: Kejuaraan tingkat Provinsi atau kompetisi resmi universitas negeri ternama.
   - Tier 3: Kejuaraan tingkat Kota/Kabupaten atau sertifikat non-kejuaraan.
   - Evaluasi linieritas bidang sertifikat terhadap prodi yang dipilih.
4. Strategi Piramida Pilihan 1 vs Pilihan 2:
   - Pilihan 1 harus prodi idaman (dream/ambisius).
   - Pilihan 2 wajib menjadi safety net yang lebih rasional dengan persaingan lebih terkendali agar tidak gugur di kedua pilihan.
   - Deteksi risiko persaingan sesama rekan satu sekolah ("saling bunuh" di jurusan & PTN yang sama).

DATA PROFIL SISWA:
- Akreditasi Sekolah: ${school_accreditation ?? 'tidak diisi'} (kuota eligible sekolah sekitar ${school_accreditation ? quotaPct[school_accreditation] ?? 'tidak diketahui' : 'tidak diketahui'})
- Peringkat Paralel di Sekolah: ${rankText}
- Status Siswa Eligible: ${eligibilityText}
- Status Pelaksanaan TKA (Tes Kemampuan Akademik): ${tka_completed === true ? 'Sudah Selesai (Memenuhi Syarat)' : tka_completed === false ? 'BELUM MENGIKUTI (Risiko Gugur Syarat Wajib)' : 'Belum Terdata'}
- Rerata Rapor Keseluruhan: ${avg_rapor}/100
- Jumlah Sertifikat Prestasi: ${cert_count}
- Level Prestasi Tertinggi: ${cert_highest_level || 'Belum ada'}
- Prodi Pilihan 1: ${pilihan_1 ? `${pilihan_1.prodi} (${pilihan_1.ptn})` : 'Belum diisi'}
- Prodi Pilihan 2: ${pilihan_2 ? `${pilihan_2.prodi} (${pilihan_2.ptn})` : 'Belum diisi'}
${semesterBreakdown ? `\nRincian Nilai per Semester per Mata Pelajaran:\n${semesterBreakdown}` : ''}
${certBreakdown ? `\nRincian Sertifikat/Prestasi Kejuaraan:\n${certBreakdown}` : ''}

INSTRUKSI SKOR:
- Berikan estimasi angka 'score' 0-100 secara rasional dan objektif.
- Hindari angka generik atau terlalu optimis tanpa dasar data.
- Skor 85-96% hanya untuk kombinasi ranking top 5% di sekolah A, nilai rapor tinggi stabil/naik, dan didukung sertifikat linier.
- Skor 65-80% untuk profil kompetitif menengah dengan catatan strategi pemilihan prodi.
- Skor di bawah 65% jika terdapat mismatch prodi, tren nilai menurun, atau pilihan prodi terlalu ambisius dibanding peringkat.

Berikan respons HANYA dalam format JSON valid berikut (tanpa markdown backtick):
{
  "score": <angka integer/float 0-100>,
  "recommendation": "<rekomendasi strategi utama 1-2 kalimat tajam dan lugas>",
  "strengths": [
    "<keunggulan spesifik 1 tentang nilai rapor / mapel pendukung>",
    "<keunggulan spesifik 2 tentang prestasi / posisi sekolah>",
    "<keunggulan spesifik 3 tentang pilihan prodi>"
  ],
  "weaknesses": [
    "<risiko konkret 1 tentang persaingan kuota / mapel>",
    "<risiko konkret 2 tentang pilihan 2 atau administrasi TKA>"
  ],
  "tips": [
    "<tindakan strategis 1 yang harus segera dilakukan>",
    "<tindakan strategis 2 untuk optimasi pilihan>",
    "<tindakan strategis 3 untuk jalur cadangan>"
  ]
}`
  } else {
    prompt = `Kamu adalah Pakar Konsultan Seleksi Mandiri & Non-Tes PTN (PPKB UI, PBUB UGM, SJP IPB, Golden Ticket UNAIR, SMUP Unpad, SIMAK Prestasi) di platform otwptn.

Analisis profil calon mahasiswa berikut secara komprehensif, berbasis data dan kriteria khusus jalur target:
- Target Jalur: ${target_jalur}
- Target PTN: ${target_ptn}
- Rerata Rapor Keseluruhan: ${avg_rapor}/100
- Peringkat di Sekolah: ${rankText}
- Jumlah Sertifikat/Prestasi: ${cert_count}
- Level Prestasi Tertinggi: ${cert_highest_level || 'Belum ada'}
${semesterBreakdown ? `\nRincian Nilai Rapor per Semester:\n${semesterBreakdown}` : ''}
${certBreakdown ? `\nRincian Sertifikat Prestasi:\n${certBreakdown}` : ''}

Analisis mencakup:
1. Relevansi nilai rapor mapel spesifik terhadap jurusan yang dituju di ${target_ptn}.
2. Kesesuaian sertifikat dengan ketentuan regulasi ${target_jalur} (apakah jalur ini mensyaratkan piagam kejuaraan, kepemimpinan organisasi, atau portofolio khusus).
3. Tren konsistensi nilai 5 semester.

Berikan respons HANYA dalam format JSON valid (tanpa markdown backtick):
{
  "score": <angka 0-100 estimasi peluang lolos>,
  "recommendation": "<rekomendasi strategi utama untuk jalur ini>",
  "strengths": ["<poin kekuatan 1>", "<poin kekuatan 2>", "<poin kekuatan 3>"],
  "weaknesses": ["<kelemahan/risiko seleksi 1>", "<kelemahan/risiko 2>"],
  "tips": ["<langkah taktis persiapan esai/berkas 1>", "<langkah 2>", "<langkah 3>"]
}`
  }

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1200,
    })

    const rawContent = completion.choices[0].message.content ?? '{}'
    const result = JSON.parse(rawContent)

    try {
      await supabase.from('kalkulator_sessions').insert({
        user_id: user.id,
        input_data: body,
        result_json: result,
      })

      await supabase.from('usage_quotas').upsert({
        user_id: user.id,
        feature: 'ai_kalkulator',
        used_count: (TIER_KALKULATOR_LIMIT[tier] === null ? 0 : ((await supabase.from('usage_quotas').select('used_count').eq('user_id', user.id).eq('feature', 'ai_kalkulator').single()).data?.used_count ?? 0)) + 1,
      }, { onConflict: 'user_id,feature' })
    } catch (dbErr) {
      console.warn('[AI Kalkulator] Non-blocking DB quota log warning:', dbErr)
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[AI Kalkulator Error]:', err)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
  }
}

