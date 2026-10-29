import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAiClient } from '@/lib/ai/client'

const TIER_ESSAY_LIMIT: Record<string, number | null> = {
  free: 1, web_premium: 3, review: 5, reguler: 10, intensif: null,
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('tier, role').eq('id', user.id).single()
  const isStaff = profile?.role === 'superadmin' || profile?.role === 'mentor'
  const tier = profile?.tier ?? 'free'
  const limit = isStaff ? null : TIER_ESSAY_LIMIT[tier]

  if (limit !== null) {
    const { data: quota } = await supabase
      .from('usage_quotas')
      .select('used_count')
      .eq('user_id', user.id)
      .eq('feature', 'ai_essay')
      .single()
    const used = quota?.used_count ?? 0
    if (used >= limit) return NextResponse.json({ error: 'quota_exceeded', limit }, { status: 403 })
  }

  const { essay_id, content } = await request.json()

  const { client, model } = getAiClient('complex')
  const prompt = `Kamu adalah Kurator Senior & Penilai Esai Motivasi / Personal Statement PTN Seleksi Non-Tes Indonesia (PPKB UI, PBUB UGM, SJP IPB, Golden Ticket UNAIR, SIMAK UI) di platform otwptn (PT. Lembaga Sains Nasional).

TUGAS: Evaluasi draf esai berikut secara kritis, analitis, mendalam, dan berikan feedback konstruktif yang actionable.

DIMENSI PENILAIAN:
1. Struktur (Structure 0-100):
   - Hook pembuka: Menghindari pembuka klise ("Sejak kecil saya bercita-cita..."), memiliki pemantik emosional/intelektual yang autentik.
   - Inti argumen (Body): Menggunakan pendekatan STAR (Situation, Task, Action, Result) dengan bukti aksi nyata.
   - Penutup: Visi kontribusi konkret untuk universitas dan Indonesia.
2. Koherensi (Coherence 0-100):
   - Kelancaran transisi antar paragraf dan konsistensi benang merah tema.
3. Kekuatan Argumen (Argument 0-100):
   - Ketajaman alasan memilih prodi & kampus target. Apakah pelamar menunjukkan pemahaman kurikulum/laboratorium atau hanya sekadar pujian umum?
4. Bahasa & Diksi (Language 0-100):
   - Standar PUEBI, pilihan kata formal namun persuasif, ritme kalimat yang hidup, bebas dari typo dan frasa ambigu.

TEKS ESAI SISWA:
"""
${content}
"""

Berikan respons HANYA dalam JSON valid (tanpa markdown backtick):
{
  "structure": <skor integer 0-100>,
  "coherence": <skor integer 0-100>,
  "argument": <skor integer 0-100>,
  "language": <skor integer 0-100>,
  "overall": <skor integer keseluruhan 0-100 (rata-rata terbobot)>,
  "feedback": "<Ulasan mendalam 2-3 paragraf mencakup apresiasi kekuatan utama, titik evaluasi paling mendesak, dan saran strategis agar esai lolos kurasi>",
  "suggestions": [
    "<saran konkret 1 untuk perbaikan paragraf pembuka>",
    "<saran konkret 2 untuk memperkuat bukti tindakan nyata>",
    "<saran konkret 3 untuk mempertajam alasan pemilihan jurusan>",
    "<saran konkret 4 untuk penyempurnaan diksi atau kalimat penutup>"
  ],
  "issues": [
    {
      "quote": "<KUTIP PERSIS kata-per-kata maksimal 12 kata dari teks esai di atas yang memiliki kelemahan kalimat/diksi>",
      "category": "<pilih salah satu: structure | coherence | argument | language>",
      "comment": "<saran kalimat pengganti atau catatan perbaikan spesifik, 1 kalimat tegas>"
    }
  ]
}

PERINGATAN KHUSUS UNTUK ARRAY "issues":
- Hasilkan antara 4 sampai 8 issues.
- Nilai field "quote" WAJIB merupakan kutipan persis (exact match kata, huruf, tanda baca) yang ada dalam teks esai di atas agar sistem bisa melakukan highlight otomatis pada teks.`

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    })

    const rawContent = completion.choices[0].message.content ?? '{}'
    const result = JSON.parse(rawContent)

    try {
      await supabase.from('essay_feedback').insert({
        essay_id,
        feedback_json: result,
        score: result.overall,
      })

      const { data: essayData } = await supabase.from('essays').select('revision_count').eq('id', essay_id).single()
      await supabase.from('essays').update({ revision_count: (essayData?.revision_count ?? 0) + 1 }).eq('id', essay_id)

      if (!isStaff) {
        const curUsed = (await supabase.from('usage_quotas').select('used_count').eq('user_id', user.id).eq('feature', 'ai_essay').single()).data?.used_count ?? 0
        await supabase.from('usage_quotas').upsert({ user_id: user.id, feature: 'ai_essay', used_count: curUsed + 1 }, { onConflict: 'user_id,feature' })
      }
    } catch (dbErr) {
      console.warn('[AI Essay Review] Non-blocking DB log warning:', dbErr)
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[AI Essay Review Error]:', err)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
  }
}

