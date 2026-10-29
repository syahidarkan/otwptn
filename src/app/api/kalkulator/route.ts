import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

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

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const semesterBreakdown = (semesters ?? [])
    .filter(s => s.subjects.length > 0)
    .map(s => {
      const bySubject = s.subjects.map(sub => `${sub.name} (${sub.category}): ${sub.grade}`).join(', ')
      const avg = (s.subjects.reduce((sum, sub) => sum + sub.grade, 0) / s.subjects.length).toFixed(1)
      return `  Semester ${s.semester} (rata-rata ${avg}): ${bySubject}`
    })
    .join('\n')

  const certBreakdown = (certificates ?? [])
    .map(c => `  - ${c.name} — tingkat ${c.level}, ${c.rank}, tahun ${c.year}`)
    .join('\n')

  const rankText = class_rank && class_total ? `Peringkat ${class_rank} dari ${class_total} siswa (${((class_rank / class_total) * 100).toFixed(1)}% teratas)` : school_rank_tier

  let prompt: string

  if (jalur_type === 'snbp') {
    const quotaPct: Record<string, string> = { A: '40%', B: '25%', C: '5% (+5% jika sekolah pakai e-Rapor)' }
    const eligibilityText = is_snbp_eligible === true
      ? `Menurut sekolah, siswa termasuk eligible (peringkat ke-${eligible_rank ?? '?'} dari kuota ${school_quota ?? '?'} siswa eligible)`
      : is_snbp_eligible === false
        ? 'Menurut info yang dimiliki siswa, belum termasuk eligible'
        : 'Status eligible belum dipastikan siswa'

    prompt = `Kamu adalah konsultan SNBP (Seleksi Nasional Berdasarkan Prestasi) Indonesia yang berpengalaman dan jujur soal keterbatasan data publik.

KONTEKS PENTING yang harus kamu pegang (hasil riset terverifikasi, JANGAN menyimpang dari ini):
- Kuota siswa eligible per sekolah ditentukan oleh akreditasi: akreditasi A dapat kuota ~40% siswa terbaik, B ~25%, C ~5% (+5% bonus jika sekolah pakai e-Rapor). Ini MENENTUKAN siapa yang BISA eligible, bukan skor akhir.
- SIAPA yang masuk peringkat eligible di dalam kuota itu DITENTUKAN OLEH SEKOLAH masing-masing, bukan SNPMB — kriteria persis tiap sekolah tidak dipublikasikan, jadi jangan berpura-pura tahu persis.
- Nilai rapor adalah komponen BERBOBOT TERBESAR (diperkirakan minimal 50%, tapi angka pasti tidak dipublikasikan resmi — sampaikan sebagai perkiraan, bukan fakta pasti).
- Sisa bobot (prestasi, mapel pendukung sesuai prodi, portofolio) BERBEDA-BEDA tiap PTN/prodi dan tidak terpusat — jangan mengarang persentase pasti.
- Sertifikat/prestasi BUKAN syarat wajib SNBP dan TIDAK punya bobot angka resmi — hanya nilai tambah kualitatif jika levelnya diakui (OSN/O2SN, tingkat provinsi/nasional), bukan sertifikat partisipasi/seminar biasa.
- TKA (Tes Kemampuan Akademik) BUKAN komponen skor SNBP — ini syarat WAJIB (lulus/tidak) untuk bisa mendaftar SNBP 2026, terpisah dari UTBK/SNBT. Jangan beri bobot persentase ke TKA, cukup jadikan itu syarat administratif yang harus dipenuhi.

Data siswa:
- Akreditasi Sekolah: ${school_accreditation ?? 'tidak diisi'} (kuota eligible sekitar ${school_accreditation ? quotaPct[school_accreditation] ?? 'tidak diketahui' : 'tidak diketahui'})
- Peringkat di Sekolah: ${rankText}
- Status Eligible: ${eligibilityText}
- Sudah mengikuti TKA: ${tka_completed === true ? 'Sudah' : tka_completed === false ? 'Belum' : 'Tidak diisi'}
- Rata-rata Rapor Keseluruhan: ${avg_rapor}/100
- Jumlah Sertifikat/Prestasi: ${cert_count}
- Level Prestasi Tertinggi: ${cert_highest_level || 'tidak ada'}
- Pilihan 1: ${pilihan_1 ? `${pilihan_1.prodi} — ${pilihan_1.ptn}` : 'belum diisi'}
- Pilihan 2: ${pilihan_2 ? `${pilihan_2.prodi} — ${pilihan_2.ptn}` : 'belum diisi'}
${semesterBreakdown ? `\nRincian Nilai per Semester per Mata Pelajaran:\n${semesterBreakdown}` : ''}
${certBreakdown ? `\nRincian Sertifikat/Prestasi:\n${certBreakdown}` : ''}

Analisis peluang SNBP siswa ini untuk pilihan 1 dan pilihan 2 yang dipilih. Ingatkan di bagian "weaknesses" atau "tips" kalau TKA belum diselesaikan (karena itu syarat wajib), dan jangan mengarang angka weight pasti yang tidak ada sumbernya — sampaikan sebagai estimasi kualitatif.

Berikan respons dalam format JSON berikut (HANYA JSON, tidak ada teks lain):
{
  "score": <angka 0-100 estimasi persentase peluang keseluruhan>,
  "recommendation": "<rekomendasi strategi utama, termasuk evaluasi singkat pilihan 1 vs pilihan 2>",
  "strengths": ["<kekuatan 1>", "<kekuatan 2>", "<kekuatan 3>"],
  "weaknesses": ["<kelemahan/risiko 1>", "<kelemahan 2>"],
  "tips": ["<tips spesifik 1>", "<tips 2>", "<tips 3>"]
}`
  } else {
    prompt = `Kamu adalah konsultan penerimaan PTN non-tes Indonesia yang berpengalaman.

Analisis profil siswa berikut secara detail dan berikan estimasi peluang masuk jalur yang dituju:
- Target PTN: ${target_ptn}
- Target Jalur: ${target_jalur}
- Rata-rata Rapor Keseluruhan: ${avg_rapor}/100
- Peringkat di Sekolah: ${rankText}
- Jumlah Sertifikat/Prestasi: ${cert_count}
- Level Prestasi Tertinggi: ${cert_highest_level || 'tidak ada'}
${semesterBreakdown ? `\nRincian Nilai per Semester per Mata Pelajaran:\n${semesterBreakdown}` : ''}
${certBreakdown ? `\nRincian Sertifikat/Prestasi:\n${certBreakdown}` : ''}

Perhatikan tren nilai antar semester (naik/turun/stabil) dan relevansi mata pelajaran dengan jurusan yang dituju, serta relevansi sertifikat dengan target jalur, dalam analisismu.

Berikan respons dalam format JSON berikut (HANYA JSON, tidak ada teks lain):
{
  "score": <angka 0-100 estimasi persentase peluang>,
  "recommendation": "<rekomendasi jalur/strategi utama>",
  "strengths": ["<kekuatan 1>", "<kekuatan 2>", "<kekuatan 3>"],
  "weaknesses": ["<kelemahan/risiko 1>", "<kelemahan 2>"],
  "tips": ["<tips spesifik 1>", "<tips 2>", "<tips 3>"]
}`
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 600,
    })

    const result = JSON.parse(completion.choices[0].message.content ?? '{}')

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

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
  }
}
