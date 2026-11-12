import { createClient } from '@/lib/supabase/server'
import { consumeQuota, rateLimit } from '@/lib/security'
import { NextResponse } from 'next/server'
import { getAiClient } from '@/lib/ai/client'
import { calculateDeterministicChance, type KalkulatorInput } from '@/lib/kalkulator/scoringEngine'

const TIER_KALKULATOR_LIMIT: Record<string, number | null> = {
  free: 1, web_premium: null, review: null, dokumen: null, menyeluruh: null, intensif: null,
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('tier, role').eq('id', user.id).maybeSingle()
  const isStaff = profile?.role === 'superadmin' || profile?.role === 'mentor'
  const tier = profile?.tier ?? 'free'
  const limit = isStaff ? null : (TIER_KALKULATOR_LIMIT[tier] ?? null)

  if (!isStaff && tier === 'free') {
    const allowed = await rateLimit('kalkulator_free', user.id, 1, 7 * 86400)
    if (!allowed) {
      return NextResponse.json({
        error: 'quota_exceeded',
        message: 'Batas kalkulator gratis (1x per minggu) sudah tercapai. Upgrade ke Akun Premium untuk kalkulator peluang tanpa batas.',
      }, { status: 403 })
    }
  }

  if (!(await consumeQuota(user.id, 'ai_kalkulator', limit))) {
    return NextResponse.json({ error: 'quota_exceeded', limit }, { status: 403 })
  }

  const body = (await request.json()) as KalkulatorInput
  const {
    jalur_type, target_ptn, target_jalur, avg_rapor, school_rank_tier,
    cert_count, cert_highest_level,
    semesters, certificates, class_rank, class_total,
    is_snbp_eligible, eligible_rank, school_quota,
    school_accreditation, tka_completed, pilihan_1, pilihan_2,
  } = body

  // Compute deterministic pathway-specific score & lookup official 5-year SNPMB data
  const deterministic = calculateDeterministicChance(body)

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

  const rankText = class_rank && class_total
    ? `Peringkat ${class_rank} dari ${class_total} siswa (${((class_rank / class_total) * 100).toFixed(1)}% teratas)`
    : (school_rank_tier || 'Belum diisi')

  const benchmarkText = deterministic.prodiBenchmark
    ? `Data Resmi SNPMB Prodi (${deterministic.prodiBenchmark.prodi} - ${deterministic.prodiBenchmark.ptn}): Daya Tampung 2026 = ${deterministic.prodiBenchmark.dayaTampung2026} kursi, Peminat 2025 = ${deterministic.prodiBenchmark.peminat2025} orang, Rasio Keketatan = ${deterministic.prodiBenchmark.keketatan2025 ?? '-'}%.`
    : 'Data keketatan spesifik prodi tidak ditemukan di lookup lokal, analisis berdasar tingkat kompetisi umum prodi tersebut.'

  const { client, model } = getAiClient('complex')

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

ALGORITMA & BENCHMARK SISTEM:
- Rumus Aktif: ${deterministic.formulaName}
- Skor Baseline Kuantitatif: ${deterministic.score}/100 (Tren rapor: ${deterministic.raporTrend})
- ${benchmarkText}

FRAMEWORK EVALUASI MULTI-FAKTOR SNBP:
1. Validasi Administratif & Kuota Sekolah: Akreditasi ${school_accreditation ?? 'tidak diisi'} (kuota ${school_accreditation ? quotaPct[school_accreditation] ?? '-' : '-'}), status TKA (${tka_completed === true ? 'Sudah Selesai' : tka_completed === false ? 'BELUM MENGIKUTI (Risiko Gugur)' : 'Belum Terdata'}).
2. Analisis Akademik & Mata Pelajaran Pendukung (Komponen 1 50% + Komponen 2 Maks 50%).
3. Evaluasi Sertifikat & Prestasi (Tier 1 Puspresnas OSN/O2SN/FLS2N, Tier 2 Provinsi, Tier 3 Kota/Kab).
4. Strategi Piramida Pilihan 1 vs Pilihan 2.

DATA PROFIL SISWA:
- Peringkat Paralel di Sekolah: ${rankText}
- Status Siswa Eligible: ${eligibilityText}
- Rerata Rapor Keseluruhan: ${avg_rapor}/100
- Jumlah Sertifikat Prestasi: ${cert_count} (Tertinggi: ${cert_highest_level || 'Belum ada'})
- Prodi Pilihan 1: ${pilihan_1 ? `${pilihan_1.prodi} (${pilihan_1.ptn})` : 'Belum diisi'}
- Prodi Pilihan 2: ${pilihan_2 ? `${pilihan_2.prodi} (${pilihan_2.ptn})` : 'Belum diisi'}
${semesterBreakdown ? `\nRincian Nilai per Semester:\n${semesterBreakdown}` : ''}
${certBreakdown ? `\nRincian Sertifikat:\n${certBreakdown}` : ''}

INSTRUKSI SKOR:
- Gunakan skor baseline ${deterministic.score} sebagai jangkar kuantitatif, sesuaikan +-5 poin jika esai/linieritas mapel pendukung sangat menonjol atau sangat lemah.
- Jangan melebih-lebihkan peluang jika keketatan prodi sangat rendah (<5%).

Berikan respons HANYA dalam format JSON valid berikut (tanpa markdown backtick):
{
  "score": <angka integer 0-100>,
  "recommendation": "<rekomendasi strategi utama 1-2 kalimat tajam dan lugas>",
  "strengths": ["<keunggulan spesifik 1>", "<keunggulan spesifik 2>", "<keunggulan spesifik 3>"],
  "weaknesses": ["<risiko konkret 1>", "<risiko konkret 2>"],
  "tips": ["<tindakan strategis 1>", "<tindakan strategis 2>", "<tindakan strategis 3>"]
}`
  } else {
    prompt = `Kamu adalah Pakar Konsultan Seleksi Mandiri & Non-Tes PTN di platform otwptn.

ALGORITMA & BENCHMARK SISTEM:
- Rumus Khusus Jalur: ${deterministic.formulaName}
- Skor Baseline Kuantitatif: ${deterministic.score}/100 (Tren rapor: ${deterministic.raporTrend})
- ${benchmarkText}

DATA PROFIL SISWA:
- Target Jalur: ${target_jalur || 'Seleksi Mandiri PTN'}
- Target PTN: ${target_ptn || pilihan_1?.ptn || '-'}
- Prodi Pilihan 1: ${pilihan_1 ? `${pilihan_1.prodi} (${pilihan_1.ptn})` : 'Belum diisi'}
- Prodi Pilihan 2: ${pilihan_2 ? `${pilihan_2.prodi} (${pilihan_2.ptn})` : 'Belum diisi'}
- Rerata Rapor Keseluruhan: ${avg_rapor}/100
- Peringkat di Sekolah: ${rankText}
- Jumlah Sertifikat/Prestasi: ${cert_count} (Tertinggi: ${cert_highest_level || 'Belum ada'})
${semesterBreakdown ? `\nRincian Nilai Rapor per Semester:\n${semesterBreakdown}` : ''}
${certBreakdown ? `\nRincian Sertifikat Prestasi:\n${certBreakdown}` : ''}

INSTRUKSI:
- Sesuaikan analisis secara spesifik terhadap mekanisme ${target_jalur} (apakah murni prestasi sertifikat seperti SBUB/PBUB/SJP, atau butuh esai kuat seperti PPKB UI/SSU ITB/SMITS, atau jalur internasional/IUP).
- Gunakan skor baseline ${deterministic.score} sebagai jangkar kuantitatif (+-5 poin berdasarkan linieritas mapel pendukung dan kesesuaian syarat sertifikat jalur).

Berikan respons HANYA dalam format JSON valid (tanpa markdown backtick):
{
  "score": <angka integer 0-100 estimasi peluang lolos>,
  "recommendation": "<rekomendasi strategi utama untuk jalur ini>",
  "strengths": ["<poin kekuatan 1>", "<poin kekuatan 2>", "<poin kekuatan 3>"],
  "weaknesses": ["<kelemahan/risiko seleksi 1>", "<kelemahan/risiko 2>"],
  "tips": ["<langkah taktis 1>", "<langkah 2>", "<langkah 3>"]
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
    const aiResult = JSON.parse(rawContent)

    const mergedResult = {
      ...aiResult,
      score: typeof aiResult.score === 'number' ? aiResult.score : deterministic.score,
      formulaName: deterministic.formulaName,
      formulaWeights: deterministic.formulaWeights,
      prodiBenchmark: deterministic.prodiBenchmark,
      raporTrend: deterministic.raporTrend,
    }

    try {
      await supabase.from('kalkulator_sessions').insert({
        user_id: user.id,
        input_data: body,
        result_json: mergedResult,
      })
    } catch (dbErr) {
      console.warn('[AI Kalkulator] Non-blocking DB log warning:', dbErr)
    }

    return NextResponse.json(mergedResult)
  } catch (err) {
    console.error('[AI Kalkulator Error - returning deterministic formula result]:', err)
    // Deterministic pathway-specific fallback (never loses calculation!)
    return NextResponse.json({
      score: deterministic.score,
      formulaName: deterministic.formulaName,
      formulaWeights: deterministic.formulaWeights,
      prodiBenchmark: deterministic.prodiBenchmark,
      raporTrend: deterministic.raporTrend,
      recommendation:
        deterministic.score >= 75
          ? `Peluang kompetitif pada ${target_jalur || 'jalur pilihan'} dengan profil rapor dan bobot jalur saat ini.`
          : `Peluang moderat pada ${target_jalur || 'jalur pilihan'}. Optimalkan faktor pembobot utama jalur ini dan siapkan pilihan ke-2 yang lebih aman.`,
      strengths: [
        `Rerata rapor terhitung ${avg_rapor > 0 ? avg_rapor.toFixed(1) : '-'} dengan tren ${deterministic.raporTrend.replace('_', ' ')}`,
        `Perhitungan menggunakan ${deterministic.formulaName}`,
        deterministic.prodiBenchmark
          ? `Benchmark resmi SNPMB: Daya tampung ${deterministic.prodiBenchmark.dayaTampung2026} kursi vs ${deterministic.prodiBenchmark.peminat2025} peminat`
          : 'Komposisi input semester dan peringkat sudah diperhitungkan',
      ],
      weaknesses: [
        cert_count === 0
          ? 'Belum ada sertifikat prestasi terinput untuk memperkuat portofolio'
          : 'Pastikan seluruh prestasi memiliki bukti dokumen resmi yang linier',
        'Persaingan antar siswa satu sekolah dan indeks sekolah tetap memengaruhi kuota akhir',
      ],
      tips: [
        'Pastikan nilai mata pelajaran pendukung jurusan berada di atas rata-rata keseluruhan.',
        'Sesuaikan pilihan 1 (impian) dan pilihan 2 (safety net) berdasarkan rasio keketatan.',
        'Lanjutkan penyusunan esai atau kurasi sertifikat sesuai bobot jalur target.',
      ],
    })
  }
}
