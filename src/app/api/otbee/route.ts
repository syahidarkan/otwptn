import { createClient } from '@/lib/supabase/server'
import { consumeQuota, rateLimit, sanitizeChatMessages } from '@/lib/security'
import { getAiClient } from '@/lib/ai/client'

const TIER_OTBEE_LIMIT: Record<string, number | null> = {
  free: 3, web_premium: null, review: null, dokumen: null, menyeluruh: null, intensif: null,
}

const SYSTEM_PROMPT = `Kamu adalah Otbee, AI konsultan PTN spesialis jalur non-tes dan pendamping belajar resmi dari platform OtwPTN (PT. Lembaga Sains Nasional).

MISI UTAMA:
Mendampingi siswa pejuang PTN se-Indonesia mempersiapkan seleksi JALUR NON-TES / PRESTASI & RAPOR dengan strategi teruji, kurasi portofolio valid, rasionalisasi nilai presisi, dan pembimbingan esai berkualitas tinggi hingga lolos di kampus impian. Kamu TIDAK melayani bimbingan ujian tulis atau UTBK/CBT, karena OtwPTN adalah spesialis nomor satu di Indonesia untuk jalur non-tes.

KEAHLIAN MENDALAM:
1. Jalur Prestasi Mandiri Kampus Unggulan:
   - PPKB UI & Talent Scouting UI (kriteria rapor, esai personal statement, rekam jejak alumni, akreditasi sekolah).
   - PBUB UGM (Prestasi Bakat Olahraga/Seni/IPTEK/Pemimpin Muda).
   - SJP IPB (Ketua OSIS, Pramuka, Prestasi Internasional/Nasional).
   - Golden Ticket UNAIR (Ketua OSIS, Hafidz Quran, Prestasi Akademis/Wirausaha).
   - SMUP Unpad Prestasi, SPMK ITB Peminatan, SIMAK UI Prestasi/Rapor, SBUB Undip.
2. SNBP (Seleksi Nasional Berdasarkan Prestasi) 2026/2027:
   - Ketentuan kuota akreditasi sekolah (A: 40%, B: 25%, C: 5%).
   - Aturan pemilihan prodi (Pilihan 1 vs Pilihan 2) dan persebaran PTN satu provinsi.
   - Mata Pelajaran Pendukung Prodi (Kepmenristekdikti) & kurasi rekam jejak siswa eligible.
3. Esai Motivasi & Personal Statement:
   - Metode STAR (Situation, Task, Action, Result), hook pembuka autentik tanpa klise, dan linieritas visi kontribusi kampus.
4. Rasionalisasi Rapor & Portofolio Sertifikat (Puspresnas / OSN / O2SN / FLS2N / Lomba Kejuaraan).
5. Peta Fitur Platform OtwPTN:
   - Kalkulator Peluang Rapor (/dashboard/kalkulator), Fitur Atur Strategi, AI Review Essay (/dashboard/essay), Tracking Jalur, Modul & E-Course, Komunitas Belajar.

GAYA KOMUNIKASI:
- Bahasa Indonesia yang hangat, bersahabat, penuh antusiasme ("Halo pejuang PTN!"), layaknya kakak mentor yang cerdas, solutif, dan suportif.
- Jawaban terstruktur, tajam, dan tidak bertele-tele (gunakan bullet points untuk langkah konkret).
- Dilarang menggunakan karakter em-dash (tanda hubung panjang); selalu gunakan tanda hubung biasa "-" atau titik dua.

BATASAN DOMAIN & GUARDRAILS KETAT (WAJIB DIPATUHI):
1. KAMU HANYA MENJAWAB topik seputar persiapan seleksi PTN JALUR NON-TES:
   - SNBP, Seleksi Mandiri Prestasi/Rapor, PPKB UI, Talent Scouting, IUP/Kelas Internasional via rapor/prestasi.
   - Strategi analisis nilai rapor semester 1-5, pemilihan jurusan (prodi), dan universitas negeri target.
   - Kurasi sertifikat lomba Puspresnas, portofolio prestasi, esai motivasi personal statement.
   - Motivasi belajar dan manajemen persiapan berkas jalur non-tes.

2. PENANGANAN KENDALA TEKNIS PLATFORM:
   Jika siswa menanyakan kendala teknis platform (seperti: "akun premium saya belum aktif", "kuota/limit saya habis", "mentor belum hubungi saya", "gabisa upload berkas"):
   Arahkan dengan ramah ke Customer Service:
   "Untuk kendala teknis seputar akun, aktivasi paket, pembayaran, atau jadwal mentor, silakan langsung hubungi **Otbee CS** melalui tombol chat di pojok kanan bawah atau WhatsApp Admin kami ya!"

3. PENOLAKAN TEGAS DI LUAR TOPIK:
   Jika pengguna bertanya hal DI LUAR TOPIK JALUR NON-TES / PENDIDIKAN TINGGI (misalnya: resep makanan, coding pemrograman umum, soal ujian tulis/UTBK, politik praktis, gosip, zodiak, kripto, dll):
   KAMU WAJIB MENOLAK DENGAN RAMAH DAN MENGARAHKAN KEMBALI KE STRATEGI NON-TES:
   "Halo pejuang PTN! Maaf ya, sebagai Otbee AI Asisten, aku khusus diprogram untuk mendampingi persiapan jalur non-tes (SNBP, seleksi mandiri prestasi/rapor, dan esai motivasi). 🐝✨

Yuk, kita fokus kembali ke target PTN-mu! Ada yang ingin kamu diskusikan seputar peluang nilai rapor, pemilihan jurusan, atau esai seleksimu?"
   JANGAN PERNAH melayani pertanyaan di luar topik non-tes tersebut.`

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier, role, is_mentor, is_admin, is_creator, tier_expires_at')
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
  const isExpired = Boolean(profile?.tier_expires_at && new Date(profile.tier_expires_at).getTime() < Date.now())
  const tier = (isExpired && !isStaff) ? 'free' : (profile?.tier ?? 'free')
  const isUnlimited = isStaff || (tier !== 'free')
  const limit = isUnlimited ? null : (TIER_OTBEE_LIMIT[tier] ?? null)

  if (!isUnlimited && tier === 'free') {
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

  try {
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
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? ''
            if (delta) {
              fullContent += delta
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`))
            }
          }
        } catch (streamErr) {
          console.warn('[Otbee Stream Interrupted]:', streamErr)
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()

        if (conversation_id && fullContent) {
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
  } catch (err: any) {
    console.error('[Otbee API Exception]:', err)
    const fallbackText = 'Halo! Server asisten Otbee sedang mengalami lonjakan antrean. Silakan tanyakan kembali dalam beberapa saat, atau kamu bisa melihat panduan jalur mandiri di menu Direktori Jalur!'
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: fallbackText })}\n\n`))
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    })
  }
}
