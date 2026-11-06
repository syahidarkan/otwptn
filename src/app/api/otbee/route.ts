import { createClient } from '@/lib/supabase/server'
import { consumeQuota, rateLimit, sanitizeChatMessages } from '@/lib/security'
import { getAiClient } from '@/lib/ai/client'

const TIER_OTBEE_LIMIT: Record<string, number | null> = {
  free: 3, web_premium: null, review: null, dokumen: null, menyeluruh: null, intensif: null,
}

const SYSTEM_PROMPT = `Kamu adalah Otbee, AI konsultan PTN non-tes dan pendamping belajar resmi otwptn (PT. Lembaga Sains Nasional).

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

  const { data: profile } = await supabase.from('profiles').select('tier, role').eq('id', user.id).maybeSingle()
  const isStaff = profile?.role === 'superadmin' || profile?.role === 'mentor'
  const tier = profile?.tier ?? 'free'
  const limit = isStaff ? null : (TIER_OTBEE_LIMIT[tier] ?? null)

  if (!isStaff && tier === 'free') {
    // 3 chats per 2 days (48 hours = 172800 seconds)
    const allowed = await rateLimit('otbee_free', user.id, 3, 172800)
    if (!allowed) {
      return new Response(JSON.stringify({
        error: 'quota_exceeded',
        message: 'Batas chat gratis (3 pesan per 2 hari) telah tercapai. Upgrade ke Akun Premium untuk chat tanpa batas.',
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } else if (!isStaff) {
    // Claude-style protection for premium: 5-hour limit and weekly limit to prevent bot abuse
    const allowed5h = await rateLimit('otbee_premium_5h', user.id, 60, 5 * 3600)
    const allowedWeek = await rateLimit('otbee_premium_week', user.id, 300, 7 * 86400)
    if (!allowed5h || !allowedWeek) {
      return new Response(JSON.stringify({
        error: 'rate_limited',
        message: 'Batas frekuensi chat tercapai (perlindungan 5 jam / mingguan). Silakan coba lagi beberapa saat lagi.',
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  const body = await request.json()
  const conversation_id = typeof body?.conversation_id === 'string' ? body.conversation_id : null
  // Untrusted history: strip system/tool roles (prompt override) and cap size.
  const messages = sanitizeChatMessages(body?.messages)
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return new Response(JSON.stringify({ error: 'invalid_messages' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  if (!(await consumeQuota(user.id, 'otbee_chat', limit))) {
    return new Response(JSON.stringify({ error: 'quota_exceeded', limit }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

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

      if (conversation_id) {
        const allMessages = [...messages, { role: 'assistant', content: fullContent, created_at: new Date().toISOString() }]
        await supabase.from('otbee_conversations').update({ messages: allMessages, updated_at: new Date().toISOString() }).eq('id', conversation_id).eq('user_id', user.id)
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
