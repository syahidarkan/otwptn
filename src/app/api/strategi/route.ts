import { createClient } from '@/lib/supabase/server'
import { consumeQuota } from '@/lib/security'
import { NextResponse } from 'next/server'
import { getAiClient, extractJsonFromAi } from '@/lib/ai/client'

const TIER_STRATEGI_LIMIT: Record<string, number | null> = {
  free: 0, web_premium: null, review: null, dokumen: null, menyeluruh: null, intensif: null,
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier, role, is_mentor, is_admin, is_creator')
    .eq('id', user.id)
    .maybeSingle()

  const isStaff = Boolean(
    profile?.is_admin ||
    profile?.role === 'admin' ||
    profile?.role === 'superadmin' ||
    profile?.role === 'mentor' ||
    profile?.is_mentor === true ||
    profile?.is_creator === true
  )
  const tier = profile?.tier ?? 'free'
  const isUnlimited = isStaff || (tier !== 'free')

  if (!isUnlimited && tier === 'free') {
    return NextResponse.json({
      error: 'tier_restricted',
      message: 'Fitur Atur Strategi hanya tersedia untuk Akun Premium ke atas. Upgrade sekarang untuk membuka analisis strategi prodi.',
    }, { status: 403 })
  }

  const limit = isUnlimited ? null : (TIER_STRATEGI_LIMIT[tier] ?? null)

  if (!(await consumeQuota(user.id, 'ai_strategi', limit))) {
    return NextResponse.json({ error: 'quota_exceeded', limit }, { status: 403 })
  }

  const { kalkulator_session_id, input_data } = await request.json() as {
    kalkulator_session_id?: string
    input_data: Record<string, unknown>
  }

  const isSnbp = input_data.jalur_type === 'snbp'
  const certificates = (input_data.certificates as { name: string; level: string; rank: string; year: string }[] | undefined) ?? []
  const certBreakdown = certificates.map(c => `  - ${c.name} - tingkat ${c.level}, ${c.rank}, tahun ${c.year}`).join('\n')

  const prompt = isSnbp ? `Kamu adalah Pakar Konsultan Strategi SNBP Indonesia di platform otwptn (PT. Lembaga Sains Nasional).

Berdasarkan profil siswa berikut, susun strategi penetapan prodi pilihan 1 & 2 serta portofolio sertifikat yang taktis dan realistis:
- Rerata Rapor: ${input_data.avg_rapor}/100
- Peringkat Paralel Sekolah: ${input_data.school_rank_tier}
- Akreditasi Sekolah: ${input_data.school_accreditation ?? 'tidak diisi'}
- Pilihan 1 saat ini (jika ada): ${(input_data.pilihan_1 as { ptn: string; prodi: string } | undefined)?.prodi ?? '-'} - ${(input_data.pilihan_1 as { ptn: string; prodi: string } | undefined)?.ptn ?? '-'}
- Pilihan 2 saat ini (jika ada): ${(input_data.pilihan_2 as { ptn: string; prodi: string } | undefined)?.prodi ?? '-'} - ${(input_data.pilihan_2 as { ptn: string; prodi: string } | undefined)?.ptn ?? '-'}
${certBreakdown ? `\nSertifikat/Prestasi yang dimiliki:\n${certBreakdown}` : '\nBelum ada sertifikat yang diinput.'}

Berikan rekomendasi strategi dalam JSON valid berikut (HANYA JSON):
{
  "pilihan_1": { "prodi": "<rekomendasi prodi>", "ptn": "<rekomendasi PTN>", "alasan": "<kenapa ini pilihan aman/realistis>" },
  "pilihan_2": { "prodi": "<rekomendasi prodi>", "ptn": "<rekomendasi PTN>", "alasan": "<kenapa ini pilihan alternatif/cadangan>" },
  "sertifikat_utama": "<sertifikat mana yang paling layak ditonjolkan, atau null kalau tidak ada>",
  "sertifikat_kedua": "<sertifikat kedua terkuat, atau null>",
  "sertifikat_pendukung": ["<sertifikat lain yang masih relevan sebagai pendukung>"],
  "catatan_strategi": "<2-3 kalimat strategi keseluruhan, termasuk rasionalitas pilihan 1 vs 2 (aman vs ambisius)>",
  "action_items": ["<langkah konkret 1>", "<langkah 2>", "<langkah 3>"]
}` : `Kamu adalah Pakar Konsultan Strategi Seleksi Mandiri & Non-Tes PTN di platform otwptn.

Berdasarkan profil siswa berikut untuk jalur "${input_data.target_jalur}" di ${input_data.target_ptn}, susun strategi pendaftaran yang konkret:
- Rerata Rapor: ${input_data.avg_rapor}/100
- Peringkat Sekolah: ${input_data.school_rank_tier}
${certBreakdown ? `\nSertifikat/Prestasi yang dimiliki:\n${certBreakdown}` : '\nBelum ada sertifikat yang diinput.'}

Berikan rekomendasi strategi dalam JSON valid berikut (HANYA JSON):
{
  "pilihan_1": null,
  "pilihan_2": null,
  "sertifikat_utama": "<sertifikat mana yang paling layak ditonjolkan di berkas pendaftaran/essay, atau null kalau tidak ada>",
  "sertifikat_kedua": "<sertifikat kedua terkuat, atau null>",
  "sertifikat_pendukung": ["<sertifikat lain yang masih relevan sebagai pendukung>"],
  "catatan_strategi": "<2-3 kalimat strategi keseluruhan untuk jalur ini>",
  "action_items": ["<langkah konkret 1>", "<langkah 2>", "<langkah 3>"]
}`

  const { client, model } = getAiClient('complex')

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1200,
    })

    const result = extractJsonFromAi(completion.choices[0].message.content ?? '{}')

    if (!result || !result.catatan_strategi) {
      throw new Error('AI returned empty strategy payload')
    }

    await supabase.from('strategi_sessions').insert({
      user_id: user.id,
      kalkulator_session_id: kalkulator_session_id ?? null,
      input_data,
      result_json: result,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.warn('[AI Strategi Fallback]:', err)
    const p1 = (input_data.pilihan_1 as { ptn: string; prodi: string } | undefined)
    const p2 = (input_data.pilihan_2 as { ptn: string; prodi: string } | undefined)
    const certs = (input_data.certificates as Array<{ title: string; category?: string }> | undefined) ?? []

    const fallbackResult = {
      pilihan_1: p1 ? {
        prodi: p1.prodi,
        ptn: p1.ptn,
        alasan: `Pilihan 1 fokus pada jurusan impian utama. Pastikan konsistensi nilai rapor mata pelajaran pendukung prodi di atas rerata ${input_data.avg_rapor}.`,
      } : null,
      pilihan_2: p2 ? {
        prodi: p2.prodi,
        ptn: p2.ptn,
        alasan: 'Pilihan 2 berfungsi sebagai jaring pengaman strategis dengan keketatan yang lebih moderat dibandingkan pilihan 1.',
      } : null,
      sertifikat_utama: certs[0]?.title ?? null,
      sertifikat_kedua: certs[1]?.title ?? null,
      sertifikat_pendukung: certs.slice(2).map(c => c.title),
      catatan_strategi: `Dengan rerata rapor ${input_data.avg_rapor} dan posisi paralel ${input_data.school_rank_tier}, optimalkan portofolio sertifikat yang paling linear dengan prodi pilihan dan hindari memilih dua prodi dengan keketatan super tinggi di kampus yang sama.`,
      action_items: [
        'Pastikan urutan sertifikat diunggah sesuai linearitas mata pelajaran pendukung prodi.',
        'Kroscek kuota daya tampung SNBP 2026 dan peminat tahun sebelumnya di portal resmi SNPMB.',
        'Siapkan opsi alternatif jalur mandiri prestasi (PPKB, PBUB, atau SJP) sebagai rencana akselerasi.',
      ],
      isFallback: true,
    }

    try {
      await supabase.from('strategi_sessions').insert({
        user_id: user.id,
        kalkulator_session_id: kalkulator_session_id ?? null,
        input_data,
        result_json: fallbackResult,
      })
    } catch {}

    return NextResponse.json(fallbackResult)
  }
}
