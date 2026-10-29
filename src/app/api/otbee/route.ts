import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const TIER_OTBEE_LIMIT: Record<string, number | null> = {
  free: 3, web_premium: null, review: null, reguler: null, intensif: null,
}

const SYSTEM_PROMPT = `Kamu adalah Otbee, AI konsultan PTN non-tes Indonesia. Bantu siswa mempersiapkan jalur essay, prestasi, dan hybrid. Kamu tahu tentang PPKB UI, PBUB UGM, SMUP Unpad, SJP UI, PM UGM, PSSB Unair, SPMK ITB, dan jalur non-tes lainnya. Berikan informasi yang akurat, spesifik, dan actionable. Gunakan bahasa Indonesia yang ramah dan semangat. Jika tidak tahu informasi spesifik, katakan dengan jujur dan sarankan cek website resmi PTN tersebut.`

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single()
  const tier = profile?.tier ?? 'free'
  const limit = TIER_OTBEE_LIMIT[tier]

  if (limit !== null) {
    const { data: quota } = await supabase
      .from('usage_quotas')
      .select('used_count')
      .eq('user_id', user.id)
      .eq('feature', 'otbee_chat')
      .single()
    const used = quota?.used_count ?? 0
    if (used >= limit) {
      return new Response(JSON.stringify({ error: 'quota_exceeded', limit }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  const { messages, conversation_id } = await request.json()

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ],
    stream: true,
    max_tokens: 1000,
  })

  const encoder = new TextEncoder()
  let fullContent = ''

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? ''
        if (delta) {
          fullContent += delta
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`))
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()

      const curUsed = (await supabase.from('usage_quotas').select('used_count').eq('user_id', user.id).eq('feature', 'otbee_chat').single()).data?.used_count ?? 0
      await supabase.from('usage_quotas').upsert({ user_id: user.id, feature: 'otbee_chat', used_count: curUsed + 1 }, { onConflict: 'user_id,feature' })

      if (conversation_id) {
        const allMessages = [...messages, { role: 'assistant', content: fullContent, created_at: new Date().toISOString() }]
        await supabase.from('otbee_conversations').update({ messages: allMessages, updated_at: new Date().toISOString() }).eq('id', conversation_id)
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
