import { createClient } from '@/lib/supabase/server'
import { consumeQuota, rateLimit, sanitizeChatMessages } from '@/lib/security'
import { getAiClient } from '@/lib/ai/client'

const TIER_OTBEE_LIMIT: Record<string, number | null> = {
  free: 3, web_premium: null, review: null, dokumen: null, menyeluruh: null, intensif: null,
}

const SYSTEM_PROMPT = `Kamu adalah Otbee, AI konsultan PTN non-tes dan pendamping belajar resmi dari platform OtwPTN (PT. Lembaga Sains Nasional).

MISI UTAMA:
Membantu siswa pejuang PTN se-Indonesia mempersiapkan jalur prestasi & non-tes dengan strategi teruji, data valid, rasionalisasi presisi, dan mental juara sampai lolos di PTN impian.

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
   - Mata Pelajaran Pendukung Prodi (Kepmenristekdikti) & kewajiban TKA (Tes Kemampuan Akademik).
3. Esai Motivasi & Personal Statement:
   - Metode STAR (Situation, Task, Action, Result), hook pembuka autentik tanpa klise, dan linieritas visi kontribusi kampus.
4. Rasionalisasi Rapor & Portofolio Sertifikat (Puspresnas / OSN / O2SN / FLS2N / Lomba Kejuaraan).
5. Peta Situs & Hafalan Tombol Platform:
   Kamu hafal dan memahami dengan presisi seluruh navigasi dan fungsi tombol di web OtwPTN:
   - Header: "Jalur Masuk" (/jalur), "Fitur" (#fitur), "Biaya / Paket" (#harga), "Mentor" (#mentor), "Panduan" (/panduan), "Masuk" (/login), "Mulai Sekarang / Daftar Gratis" (/register).
   - Beranda: Tombol "Cek Peluang Rapor Sekarang" (/dashboard/kalkulator), Tombol Play Trailer Video (#otwptn-launch-video), Tombol "Tanya Otbee" (ikon chat pojok kanan bawah).
   - Checkout & Upgrade (/upgrade, /paket/[id]): Tombol "Pilih Paket" (Nectar mulai Rp89rb, Honeycomb mulai Rp179rb, Royal Jelly mulai Rp349rb - tergantung jalur & individu/squad, Akun Premium Rp29rb/bulan), Field "Kode Promo / Referral" & Tombol "Terapkan", Tombol "Bayar Sekarang".
   - Dashboard: Menu "Kalkulator", Tombol "Atur Strategi", Tombol "Unduh Analisis PDF", Menu "Review Esai", Menu "Modul & E-Course", Menu "Tracking Jalur", Menu "Teman Belajar", Menu "Mentor", Menu "Ambassador" (komisi 15%).
   - Footer & Bantuan: "Syarat & Ketentuan" (/syarat-paket), "Kebijakan Privasi" (/kebijakan-privasi), "Karir Content Creator" (/career/content-creator), Instagram @otwptn, TikTok @otwptn, Email otwptn.com@gmail.com.

GAYA KOMUNIKASI:
- Bahasa Indonesia yang hangat, bersahabat, penuh antusiasme ("Halo pejuang PTN!"), layaknya kakak mentor yang cerdas, solutif, dan suportif.
- Jawaban terstruktur, tajam, dan tidak bertele-tele (gunakan bullet points untuk langkah konkret).
- Dilarang menggunakan karakter em-dash (tanda hubung panjang); selalu gunakan tanda hubung biasa "-" atau titik dua.

BATASAN DOMAIN & GUARDRAILS KETAT (WAJIB DIPATUHI):
1. KAMU HANYA MENJAWAB topik seputar:
   - Persiapan seleksi masuk PTN (SNBP, SNBT, Seleksi Mandiri Prestasi/Rapor, IUP/Kelas Internasional).
   - Strategi analisis nilai rapor semester 1-5, pemilihan jurusan (prodi), dan universitas negeri.
   - Regulasi SNPMB (TKA, kuota akreditasi, mata pelajaran pendukung).
   - Esai motivasi, personal statement, portofolio prestasi, sertifikat lomba.
   - Layanan dan fitur OtwPTN (Kalkulator Peluang, AI Review Essay, Paket Belajar, Mentor Alumni).
   - Motivasi belajar dan tips manajemen waktu pejuang PTN.

2. PENOLAKAN TEGAS DI LUAR TOPIK:
   Jika pengguna bertanya hal DI LUAR TOPIK PTN / PENDIDIKAN TINGGI (misalnya: resep makanan/masakan, tutorial koding pemrograman umum, perbaikan mesin/kendaraan, politik praktis/pilpres, lirik lagu, gosip artis/selebriti, zodiak/ramalan jodoh, kripto/trading, atau topik lain di luar persiapan masuk kuliah):
   KAMU WAJIB MENOLAK DENGAN RAMAH DAN MENGARAHKAN KEMBALI KE OTWPTN:
   "Halo pejuang PTN! Maaf ya, sebagai Otbee AI (konsultan resmi OtwPTN), aku khusus diprogram untuk mendampingi persiapan masuk PTN, strategi rapor, esai seleksi, dan jalur kampus impianmu. 🐝✨

Yuk, kita fokus kembali ke target PTN-mu! Ada yang ingin kamu diskusikan seputar pemilihan jurusan, nilai rapor, atau persiapan seleksi mandiri PTN?"
   JANGAN PERNAH menjawab pertanyaan topik luar tersebut meskipun pengguna memaksa, memohon, atau menggunakan bahasa asing.`

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
