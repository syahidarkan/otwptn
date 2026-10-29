import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAiClient } from '@/lib/ai/client'

const TIER_STRATEGI_LIMIT: Record<string, number | null> = {
  free: 1, web_premium: 3, review: 5, reguler: null, intensif: null,
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single()
  const tier = profile?.tier ?? 'free'
  const limit = TIER_STRATEGI_LIMIT[tier]

  if (limit !== null) {
    const { data: quota } = await supabase
      .from('usage_quotas')
      .select('used_count')
      .eq('user_id', user.id)
      .eq('feature', 'ai_strategi')
      .single()
    const used = quota?.used_count ?? 0
    if (used >= limit) return NextResponse.json({ error: 'quota_exceeded', limit }, { status: 403 })
  }

  const { kalkulator_session_id, input_data } = await request.json() as {
    kalkulator_session_id?: string
    input_data: Record<string, unknown>
  }

  const isSnbp = input_data.jalur_type === 'snbp'
  const certificates = (input_data.certificates as { name: string; level: string; rank: string; year: string }[] | undefined) ?? []
  const certBreakdown = certificates.map(c => `  - ${c.name} — tingkat ${c.level}, ${c.rank}, tahun ${c.year}`).join('\n')

  const prompt = isSnbp ? `Kamu adalah Pakar Konsultan Strategi SNBP Indonesia di platform otwptn (PT. Lembaga Sains Nasional).

Berdasarkan profil siswa berikut, susun strategi penetapan prodi pilihan 1 & 2 serta portofolio sertifikat yang taktis dan realistis:
- Rerata Rapor: ${input_data.avg_rapor}/100
- Peringkat Paralel Sekolah: ${input_data.school_rank_tier}
- Akreditasi Sekolah: ${input_data.school_accreditation ?? 'tidak diisi'}
- Pilihan 1 saat ini (jika ada): ${(input_data.pilihan_1 as { ptn: string; prodi: string } | undefined)?.prodi ?? '-'} — ${(input_data.pilihan_1 as { ptn: string; prodi: string } | undefined)?.ptn ?? '-'}
- Pilihan 2 saat ini (jika ada): ${(input_data.pilihan_2 as { ptn: string; prodi: string } | undefined)?.prodi ?? '-'} — ${(input_data.pilihan_2 as { ptn: string; prodi: string } | undefined)?.ptn ?? '-'}
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

    const result = JSON.parse(completion.choices[0].message.content ?? '{}')

    await supabase.from('strategi_sessions').insert({
      user_id: user.id,
      kalkulator_session_id: kalkulator_session_id ?? null,
      input_data,
      result_json: result,
    })

    const curUsed = (await supabase.from('usage_quotas').select('used_count').eq('user_id', user.id).eq('feature', 'ai_strategi').single()).data?.used_count ?? 0
    await supabase.from('usage_quotas').upsert({ user_id: user.id, feature: 'ai_strategi', used_count: curUsed + 1 }, { onConflict: 'user_id,feature' })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
  }
}
