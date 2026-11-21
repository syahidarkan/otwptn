import { rateLimit } from '@/lib/security'
import { NextResponse } from 'next/server'
import { getAiClient } from '@/lib/ai/client'
import { OFFICIAL_WA } from '@/lib/constants'

// Simple in-memory rate limiter: max 20 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 20) return false
  entry.count++
  return true
}

const SYSTEM_PROMPT = `Kamu adalah Otbee Helpdesk CS, AI Customer Service resmi khusus Bantuan Teknis dan Operasional Platform OtwPTN (dikelola oleh PT. Lembaga Sains Nasional).

TUGAS UTAMA & RUANG LINGKUP (KHUSUS KENDALA TEKNIS & LAYANAN OTWPTN):
Kamu HANYA melayani kendala teknis, status akun, pembayaran, dan operasional layanan platform OtwPTN:
1. Akun Premium Belum Aktif / Pembayaran:
   - Sistem aktivasi otomatis 1-3 menit setelah pembayaran sukses.
   - Jika belum aktif, sarankan siswa logout dan login kembali / refresh browser. Jika via transfer bank manual, arahkan kirim bukti bayar ke WhatsApp Admin Resmi: ${OFFICIAL_WA.display} (${OFFICIAL_WA.url}) untuk verifikasi instan.
2. Limit / Kuota Habis:
   - Akun gratis memiliki kuota terbatas. Untuk akses tanpa batas (unlimited), sarankan upgrade ke Akun Premium (Rp 29.000/bulan) di menu /upgrade.
   - Jika siswa sudah berlangganan paket berbayar namun muncul notifikasi kuota habis, jelaskan itu kendala sinkronisasi sesi dan sarankan refresh atau hubungi admin WA.
3. Kendala Bimbingan Mentor (Belum Kirim Link WA):
   - Setelah checkout paket Nectar / Honeycomb / Royal Jelly, tim admin akan membuatkan WhatsApp Group 3 Pihak (Siswa + Mentor + Admin) maksimal 1x24 jam kerja.
   - Jika belum dihubungi, sarankan siswa langsung chat WA Admin ${OFFICIAL_WA.display} dengan mengirimkan nomor invoice atau email terdaftar agar langsung di-invite ke grup mentor.
4. Kendala Fitur Platform (Tidak Bisa Upload / Error AI Reviewer / Tombol Macet):
   - Pastikan file berkas format PDF atau DOCX dengan ukuran maksimal 10MB.
   - Coba bersihkan cache browser, gunakan mode Incognito, atau gunakan Google Chrome versi terbaru di PC/Laptop.
   - Jika masih bermasalah, laporkan ke tim teknis via WhatsApp Admin.
5. Akun Bermasalah / Kendala Login:
   - Gunakan fitur "Lupa Password" di halaman /login atau hubungi WA Admin untuk bantuan reset akun manual.
6. Kontak Resmi & Biaya Paket OtwPTN:
   - WhatsApp Admin Resmi: ${OFFICIAL_WA.display} (${OFFICIAL_WA.url})
   - Email: otwptn.com@gmail.com
   - Paket: Akun Premium (Rp 29rb/bln), Paket Nectar (mulai Rp 89rb), Honeycomb (mulai Rp 179rb), Royal Jelly (mulai Rp 349rb).

ATURAN MUTLAK & GUARDRAIL KETAT (WAJIB DIPATUHI):
- KAMU DILARANG KERAS MENJAWAB PERTANYAAN DI LUAR KENDALA TEKNIS PLATFORM OTWPTN!
- JIKA USER BERTANYA TENTANG STRATEGI PTN (misal: rekomendasi jurusan, peluang nilai rapor, cara nulis esai motivasi, apa itu SNBP, dsb):
  KAMU WAJIB MENOLAK DENGAN RAMAH DAN MENGARAHKAN KE OTBEE AI ASISTEN:
  "Halo Kak! Sebagai Customer Service Teknis OtwPTN, saya khusus menangani kendala teknis akun, status aktivasi paket, pembayaran, dan kendala fitur platform.

Untuk konsultasi strategi seleksi masuk PTN jalur non-tes, analisis nilai rapor, dan bimbingan esai motivasi, silakan gunakan fitur **Otbee AI Asisten** di dashboard kamu (/dashboard/otbee) atau gunakan **Kalkulator Peluang Rapor** ya Kak! 🐝✨

Apakah ada kendala teknis seputar akun atau fitur OtwPTN yang bisa saya bantu?"
- JIKA USER BERTANYA HAL LAIN DI LUAR OTWPTN (resep masakan, koding/pemrograman, politik, lirik lagu, gosip, pacaran, curhat, tugas sekolah umum):
  TOLAK DENGAN TEGAS BAHWA CS HANYA MENANGANI KENDALA TEKNIS OTWPTN.
- Dilarang menggunakan karakter em-dash (tanda hubung panjang); selalu gunakan tanda hubung biasa "-" atau titik dua ":".`

function generateRuleBasedReply(query: string): string | null {
  const q = query.toLowerCase()

  // 1. Jika bertanya strategi akademik / rekomendasi prodi / esai / snbp -> alihkan ke Otbee AI Asisten
  const isAcademicTopic = (
    (q.includes('rekomendasi prodi') || q.includes('pilihan 1') || q.includes('pilihan 2') || q.includes('peluang lolos') || q.includes('nilai aman') || q.includes('cara nulis esai') || q.includes('hook esai') || q.includes('struktur esai') || q.includes('cara hitung rapor')) &&
    !q.includes('error') && !q.includes('gabisa') && !q.includes('gak bisa') && !q.includes('rusak') && !q.includes('bug')
  )
  if (isAcademicTopic) {
    return 'Halo Kak! Sebagai Customer Service Teknis OtwPTN, saya khusus menangani kendala teknis akun, aktivasi pembayaran, limit kuota, dan kendala fitur platform.\n\nUntuk konsultasi mendalam seputar **strategi seleksi non-tes, rasionalisasi nilai rapor, dan bedah esai motivasi**, silakan buka fitur **Otbee AI Asisten** di dashboard (`/dashboard/otbee`) atau gunakan menu **Kalkulator Peluang Rapor** ya Kak! 🐝✨\n\nAda kendala teknis akun atau fitur yang bisa saya bantu?'
  }

  // 2. Guardrail check: topik umum di luar OtwPTN
  const isOffTopic = (
    q.includes('resep') ||
    q.includes('masak') ||
    q.includes('koding') ||
    q.includes('coding') ||
    q.includes('python') ||
    q.includes('javascript') ||
    q.includes('politik') ||
    q.includes('presiden') ||
    q.includes('lagu') ||
    q.includes('lirik') ||
    q.includes('ramalan') ||
    q.includes('pacar') ||
    q.includes('jodoh')
  ) && !q.includes('otwptn')
  if (isOffTopic) {
    return 'Halo Kak! Mohon maaf, Customer Service OtwPTN hanya melayani kendala teknis, status akun, pembayaran, dan operasional layanan OtwPTN. Ada kendala teknis seputar akun atau fitur OtwPTN yang sedang Kakak alami?'
  }

  // 3. Akun Premium belum aktif / sudah bayar tapi belum aktif
  if ((q.includes('belum aktif') || q.includes('blm aktif') || q.includes('udah bayar') || q.includes('sudah bayar') || q.includes('belum masuk') || q.includes('konfirmasi bayar')) && (q.includes('premium') || q.includes('paket') || q.includes('akun') || q.includes('bayar'))) {
    return `Halo Kak! Aktivasi akun berbayar di OtwPTN umumnya berlangsung otomatis dalam 1-3 menit setelah pembayaran berhasil.\n\nJika status akun Kakak belum ter-upgrade:\n1. Coba logout lalu login kembali, atau refresh halaman dashboard.\n2. Cek status di menu Akun atau Riwayat Transaksi.\n3. Jika pembayaran via transfer bank/QRIS dan belum berubah statusnya, silakan kirimkan bukti transfer dan email terdaftar ke **WhatsApp Admin Resmi OtwPTN:** ${OFFICIAL_WA.display} ([klik di sini untuk chat langsung](${OFFICIAL_WA.url})). Tim kami akan mengaktivasi akun Kakak secara instan!`
  }

  // 4. Limit / Kuota habis
  if (q.includes('limit') || q.includes('kuota') || q.includes('token habis') || q.includes('kredit habis') || q.includes('habis')) {
    return `Halo Kak! Pada **Akun Gratis**, fitur kalkulator dan review AI memiliki kuota uji coba terbatas.\n\nSolusi agar bisa menggunakan fitur tanpa batas:\n• Upgrade ke **Akun Premium (hanya Rp 29.000/bulan)** di menu Upgrade (/upgrade) untuk akses Unlimited ke seluruh fitur AI Reviewer, Kalkulator Rapor, dan Modul E-Course.\n• Jika Kakak sudah berlangganan paket berbayar tetapi muncul peringatan kuota habis, coba refresh halaman atau hubungi **WhatsApp Admin:** ${OFFICIAL_WA.display} ([chat di sini](${OFFICIAL_WA.url})) agar tim teknis langsung mereset sesi akun Kakak!`
  }

  // 5. Mentor belum kirim link WA / grup mentoring
  if (q.includes('mentor') && (q.includes('link') || q.includes('wa') || q.includes('whatsapp') || q.includes('grup') || q.includes('hubungi') || q.includes('kirim') || q.includes('jadwal') || q.includes('belum'))) {
    return `Halo Kak! Untuk paket bimbingan bersama Mentor Alumni (Nectar, Honeycomb, dan Royal Jelly):\n\n• Tim Admin OtwPTN akan membuatkan **WhatsApp Group Eksklusif 3 Pihak (Siswa + Mentor + Admin)** maksimal dalam 1x24 jam kerja setelah transaksi terverifikasi.\n• Jika sudah lebih dari 24 jam Kakak belum menerima undangan link grup WA, mohon langsung konfirmasi ke **WhatsApp Admin:** ${OFFICIAL_WA.display} ([klik di sini](${OFFICIAL_WA.url})) dengan mencantumkan Nomor Pesanan atau Email terdaftar agar langsung disambungkan dengan mentor Kakak!`
  }

  // 6. Tidak bisa upload dokumen / fitur AI Reviewer bermasalah
  if ((q.includes('upload') || q.includes('unggah') || q.includes('loa') || q.includes('dokumen') || q.includes('ai review') || q.includes('reviewer') || q.includes('gabisa') || q.includes('ga bisa') || q.includes('error') || q.includes('macet'))) {
    return `Halo Kak! Jika mengalami kendala saat upload dokumen atau menggunakan fitur AI Reviewer:\n\n1. Pastikan file dalam format **PDF atau DOCX** dengan ukuran di bawah **10 MB**.\n2. Pastikan koneksi internet stabil dan teks naskah esai tidak kosong.\n3. Coba bersihkan cache browser atau gunakan Google Chrome pada PC/Laptop.\n4. Jika tombol tetap tidak merespon, kirimkan tangkapan layar (screenshot) kendala ke **WhatsApp Admin:** ${OFFICIAL_WA.display} ([chat langsung](${OFFICIAL_WA.url})) agar tim developer kami segera membantu pengecekan akun!`
  }

  // 7. Kontak / CS / WhatsApp Admin
  if (q.includes('email') || q.includes('kontak') || q.includes('hubungi') || q.includes('cs') || q.includes('admin') || q.includes('nomor wa')) {
    return `Halo Pejuang PTN! Kakak dapat menghubungi tim bantuan teknis resmi kami melalui:\n\n• **WhatsApp Admin Resmi:** ${OFFICIAL_WA.display} - [klik di sini untuk chat langsung](${OFFICIAL_WA.url})\n• **Email Resmi:** otwptn.com@gmail.com\n• **Operasional:** PT. Lembaga Sains Nasional\n\nTim kami siap membantu menyelesaikan kendala akun Kakak!`
  }

  // 8. Info Harga & Paket Langganan
  if (q.includes('harga') || q.includes('biaya') || q.includes('paket') || q.includes('bayar') || q.includes('upgrade') || q.includes('nectar') || q.includes('honeycomb') || q.includes('royal jelly')) {
    return `Halo Kak! Berikut rincian paket resmi OtwPTN:\n\n1. **Akun Premium (Rp 29.000/bulan):** Akses mandiri Unlimited tanpa mentor ke Kalkulator Peluang Rapor, AI Essay Reviewer, Chat AI Otbee, dan Modul E-Course.\n2. **Paket Nectar (mulai Rp 89.000):** Akun Premium + 2x Putaran Revisi Dokumen via WhatsApp bersama Mentor Alumni UI ITB UGM.\n3. **Paket Honeycomb (mulai Rp 179.000 - Paling Populer):** Akun Premium + 5x Revisi Berkas + 2x Sesi Mentoring Zoom 1-on-1 + WhatsApp Group 3 Pihak.\n4. **Royal Jelly VIP (mulai Rp 349.000):** Paket terlengkap dengan Bimbingan Unlimited sampai hari H pengumuman, Zoom tanpa batas, plus Tiket Trip Campus Tour ke UI!\n\nUntuk aktivasi atau upgrade, silakan kunjungi menu Upgrade (/upgrade).`
  }

  return null
}

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi dalam 1 menit.' }, { status: 429 })
    }

    const { message, history } = await request.json()

    if (!message || typeof message !== 'string' || message.length > 1000) {
      return NextResponse.json({ error: 'Pesan tidak valid' }, { status: 400 })
    }
    // Public endpoint that spends AI credits: the in-memory limiter below is per serverless
    // instance, so also throttle through the shared DB limiter.
    if (!(await rateLimit('cs_chat', ip, 20, 600))) {
      return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi nanti.' }, { status: 429 })
    }

    // 1. Check quick rule-based customer service knowledge first
    const ruleReply = generateRuleBasedReply(message)
    if (ruleReply) {
      return NextResponse.json({ reply: ruleReply })
    }

    // 2. Otherwise invoke AI client
    try {
      const { client, model } = getAiClient('fast')

      const formattedMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...(Array.isArray(history)
          ? history.slice(-6).map((h: any) => ({
              role: h.role === 'user' ? ('user' as const) : ('assistant' as const),
              content: String(h.content).slice(0, 1000),
            }))
          : []),
        { role: 'user' as const, content: message },
      ]

      const completion = await client.chat.completions.create({
        model,
        messages: formattedMessages,
        max_tokens: 600,
        temperature: 0.7,
      })

      let text = completion.choices[0]?.message?.content || ''
      // Guard against em-dash
      text = text.replace(/\u2014/g, '-')

      if (text.trim()) {
        return NextResponse.json({ reply: text })
      }
    } catch (aiErr) {
      console.warn('AI Client fallback triggered:', aiErr)
    }

    // 3. Fallback answer if external LLM fails
    const fallbackAnswer =
      'Halo Pejuang PTN! Otbee siap mendampingi persiapanmu masuk PTN jalur non-tes (SNBP, PPKB UI, PBUB UGM, dll). Kamu bisa cek peluang rapor di Kalkulator Peluang, review esai di AI Reviewer, atau konsultasi paket bimbingan mentor alumni kami. Hubungi email resmi kami di otwptn.com@gmail.com jika membutuhkan bantuan khusus. Ada yang ingin kamu tanyakan lebih lanjut?'

    return NextResponse.json({ reply: fallbackAnswer })
  } catch (err: any) {
    console.error('CS Chat error:', err)
    return NextResponse.json(
      {
        reply:
          'Halo Pejuang PTN! Ada kendala teknis saat memproses pesanmu. Silakan tanyakan seputar fitur OtwPTN, paket bimbingan, atau hubungi kami di otwptn.com@gmail.com.',
      },
      { status: 200 }
    )
  }
}
