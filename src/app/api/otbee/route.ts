import { createClient } from '@/lib/supabase/server'
import { getAiClient } from '@/lib/ai/client'

const TIER_OTBEE_LIMIT: Record<string, number | null> = {
  free: 5, web_premium: null, review: null, reguler: null, intensif: null,
}

const SYSTEM_PROMPT = `Kamu adalah Otbee 🐝, AI konsultan PTN non-tes dan pendamping belajar resmi otwptn (PT. Lembaga Sains Nasional).

MISI UTAMA:
Membantu siswa pejuang PTN mempersiapkan jalur prestasi & non-tes dengan strategi teruji, data valid, dan mental juara.

KEAHLIAN MENDALAM:
1. Jalur Prestasi Mandiri Kampus Unggulan:
   - PPKB UI & Talent Scouting UI (kriteria rapor, esai, akreditasi sekolah).
   - PBUB UGM (Prestasi Bakat Olahraga/Seni/IPTEK/Pemimpin Muda).
   - SJP IPB (Ketua OSIS, Pramuka, Prestasi Internasional/Nasional).
   - Golden Ticket UNAIR (Ketua OSIS, Hafidz Quran, Prestasi Akademis).
   - SMUP Unpad Prestasi, SPMK ITB Peminatan, SIMAK UI Prestasi.
2. SNBP (Seleksi Nasional Berdasarkan Prestasi) 2026/2027:
   - Ketentuan kuota akreditasi sekolah (A: 40%, B: 25%, C: 5%).
   - Aturan pemilihan prodi (Pilihan 1 vs Pilihan 2) dan persebaran PTN satu provinsi.
   - Mata Pelajaran Pendukung Prodi (Kepmenristekdikti) & TKA (Tes Kemampuan Akademik).
3. Esai Motivasi & Personal Statement:
   - Metode STAR (Situation, Task, Action, Result), hook autentik tanpa klise, dan linieritas visi kontribusi.
4. Rasionalisasi Rapor & Portofolio Sertifikat (Puspresnas / OSN / O2SN / FLS2N / Kejuaraan).

GAYA KOMUNIKASI:
- Bahasa Indonesia yang hangat, bersahabat, penuh antusiasme ("Halo pejuang PTN!"), layaknya kakak mentor yang solutif.
- Jawaban terstruktur, tajam, dan tidak bertele-tele (gunakan bullet points untuk langkah konkret).
- Jika ada hal yang belum ada kepastian regulasi resminya, katakan terus terang dan sarankan verifikasi ke portal resmi SNPMB atau universitas terkait.`

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('tier, role').eq('id', user.id).single()
  const isStaff = profile?.role === 'superadmin' || profile?.role === 'mentor'
  const tier = profile?.tier ?? 'free'
  const limit = isStaff ? null : TIER_OTBEE_LIMIT[tier]

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

  const { client, model } = getAiClient('fast')

  const stream = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ],
    stream: true,
    max_tokens: 1500,
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
