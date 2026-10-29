import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const TIER_ESSAY_LIMIT: Record<string, number | null> = {
  free: 0, web_premium: 0, review: 3, reguler: 5, intensif: null,
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single()
  const tier = profile?.tier ?? 'free'
  const limit = TIER_ESSAY_LIMIT[tier]

  if (limit === 0) {
    return NextResponse.json({ error: 'quota_exceeded', requiredTier: 'review' }, { status: 403 })
  }

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

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const prompt = `Kamu adalah evaluator essay PTN non-tes Indonesia yang berpengalaman.

Evaluasi essay berikut dan berikan feedback terstruktur:

ESSAY:
${content}

Berikan respons dalam JSON (HANYA JSON):
{
  "structure": <skor 0-100 untuk struktur>,
  "coherence": <skor 0-100 untuk koherensi>,
  "argument": <skor 0-100 untuk kekuatan argumen>,
  "language": <skor 0-100 untuk bahasa dan gaya>,
  "overall": <skor keseluruhan 0-100>,
  "feedback": "<feedback naratif 2-3 paragraf>",
  "suggestions": ["<saran spesifik 1>", "<saran 2>", "<saran 3>", "<saran 4>"],
  "issues": [
    {
      "quote": "<kutip PERSIS kalimat atau frasa pendek (maks 12 kata) dari ESSAY di atas, tanpa perubahan satu huruf pun, yang punya masalah>",
      "category": "<salah satu: structure, coherence, argument, language>",
      "comment": "<saran revisi spesifik untuk bagian ini, 1 kalimat>"
    }
  ]
}

Catatan untuk field "issues": cari 4-8 bagian essay yang paling perlu diperbaiki. Field "quote" WAJIB berupa kutipan kata-per-kata yang persis sama dengan teks di ESSAY (termasuk kapitalisasi dan tanda baca), supaya bisa dicari dan di-highlight otomatis — jangan parafrase atau meringkas kutipannya.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 800,
    })

    const result = JSON.parse(completion.choices[0].message.content ?? '{}')

    await supabase.from('essay_feedback').insert({
      essay_id,
      feedback_json: result,
      score: result.overall,
    })

    const { data: essayData } = await supabase.from('essays').select('revision_count').eq('id', essay_id).single()
    await supabase.from('essays').update({ revision_count: (essayData?.revision_count ?? 0) + 1 }).eq('id', essay_id)

    const curUsed = (await supabase.from('usage_quotas').select('used_count').eq('user_id', user.id).eq('feature', 'ai_essay').single()).data?.used_count ?? 0
    await supabase.from('usage_quotas').upsert({ user_id: user.id, feature: 'ai_essay', used_count: curUsed + 1 }, { onConflict: 'user_id,feature' })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
  }
}
