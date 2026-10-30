import { NextResponse } from 'next/server'
import { getAiClient } from '@/lib/ai/client'

const SYSTEM_PROMPT = `Kamu adalah Otbee CS, Customer Service AI resmi dari platform OtwPTN (dikelola resmi oleh PT. Lembaga Sains Nasional).

TUGAS UTAMA:
Memberikan informasi yang ramah, sopan, antusias, solutif, dan profesional layaknya customer service resmi kepada calon siswa, pejuang PTN, orang tua, maupun pengguna terdaftar.

PENGETAHUAN LENGKAP OTWPTN:
1. Identitas & Legalitas:
   - Nama: OtwPTN (Platform #1 Lolos Masuk PTN Jalur Non-Tes)
   - Perusahaan Pengelola: PT. Lembaga Sains Nasional
   - Email Resmi: otwptn.com@gmail.com
   - Website Resmi: https://otwptn.id (atau otwptn.com)

2. Fokus & Spesialisasi:
   - Bimbingan intensif persiapan masuk PTN jalur NON-TES (tanpa ujian tulis/CBT).
   - Jalur yang didampingi: SNBP (Seleksi Nasional Berdasarkan Prestasi), PPKB UI, Talent Scouting UI, SJP IPB (Ketua OSIS, Pramuka, Prestasi), PBUB UGM (Bibit Unggul), Golden Ticket UNAIR, SMUP Unpad, SBUB Undip, SIMAK UI Non-Tes, dan seluruh seleksi mandiri rapor/prestasi se-Indonesia.

3. Pilihan Paket & Biaya Investasi:
   - Akun Gratis: Kuota uji coba (kalkulator peluang 1x/bulan, chat AI 3x/hari, review essay 1x/bulan, join circle).
   - Akun Premium (Rp 49.000 sekali bayar): Akses mandiri tak terbatas tanpa mentor. Kalkulator Peluang Rapor Unlimited, Chat AI Otbee Unlimited, AI Review Essay Unlimited, Buka 100% Modul & Video E-Course, Fitur Atur Strategi.
   - Paket Nectar (Rp 159.000 total / Rp 53.000 per bulan): Sudah termasuk Akun Premium + 2x Putaran Revisi Dokumen & Essay via chat WhatsApp bersama Mentor Alumni UI ITB UGM.
   - Paket Honeycomb (Rp 299.000): Paket terpopuler. Sudah termasuk Akun Premium + 5x Putaran Revisi Dokumen & Essay + 2x Sesi Mentoring Zoom 1-on-1 + Akses WhatsApp Group Eksklusif 3 Pihak (Mentor + Admin + Mentee).
   - Royal Jelly VIP / Queen Bee (Rp 599.000): Paket terlengkap & paling eksklusif. Bimbingan 1-on-1 Unlimited sampai hari H pengumuman, Zoom tanpa batas, Dokumen Analisis Rekomendasi Pilihan 1 & 2 dari Mentor, Prioritas 24/7, plus Tiket Trip Campus Tour ke Universitas Indonesia (UI).
   *Catatan Penting: Seluruh paket bimbingan mentor (Nectar, Honeycomb, Queen Bee) SUDAH OTOMATIS MENDAPATKAN AKUN PREMIUM gratis!

4. Fitur-Fitur Utama Platform:
   - Kalkulator Peluang Rapor 2026: Rasionalisasi nilai semester 1-5, kuota akreditasi sekolah (A: 40%, B: 25%, C: 5%), bobot mapel pendukung prodi SNPMB, dan kurasi Puspresnas.
   - AI Essay Review 2.0: Evaluasi 4 dimensi (Hook pembuka, alur storytelling, relevansi prodi, tata bahasa) dan deteksi kalimat klise.
   - Mentor Alumni UI ITB UGM: Lulusan berprestasi jalur non-tes yang siap membimbing step-by-step.
   - Cari Teman Belajar Virtual: Study room virtual untuk peer review dan diskusi bersama pejuang PTN se-Indonesia tanpa login rumit.
   - Modul & Video E-Course: Pembelajaran terstruktur bedah strategi seleksi.
   - Tracking Jalur & Penyimpanan Dokumen: Checklist syarat berkas dan pengingat deadline.
   - Student Ambassador: Komisi tunai 15% untuk setiap referral teman yang mendaftar.

BATASAN & GUARDRAILS KETAT:
- Kamu HANYA menjawab pertanyaan seputar OtwPTN, paket belajar, bimbingan mentor, seleksi masuk PTN jalur non-tes, dan kontak bantuan OtwPTN.
- JIKA USER BERTANYA DI LUAR OTWPTN (misal: soal PR matematika umum di luar rapor, coding bahasa pemrograman, resep masakan, politik, gosip artis, jokes di luar konteks):
  Tolak dengan SANGAT RAMAH, SOPAN, dan arahkan kembali ke OtwPTN:
  "Halo Kak! Sebagai Customer Service resmi OtwPTN, saya khusus bertugas membantu seputar layanan OtwPTN, paket bimbingan, strategi seleksi PTN jalur non-tes (SNBP, PPKB UI, PBUB UGM, dll), dan persiapan rapor/esai. Ada yang ingin Kakak tanyakan seputar OtwPTN atau persiapan masuk kampus impian?"
- DILARANG KERAS menggunakan karakter em-dash (tanda hubung panjang). Selalu gunakan tanda hubung biasa "-" atau titik dua ":" atau koma.
- Gunakan sapaan yang hangat seperti "Halo Kak!", "Pejuang PTN", dengan nada profesional, ramah, dan solutif.`

function generateRuleBasedReply(query: string): string | null {
  const q = query.toLowerCase()

  // Guardrail check: out-of-domain topics
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
  ) && !q.includes('otwptn') && !q.includes('ptn') && !q.includes('snbp')

  if (isOffTopic) {
    return 'Halo Kak! Sebagai Customer Service resmi OtwPTN, saya khusus bertugas membantu seputar layanan OtwPTN, paket bimbingan, strategi seleksi PTN jalur non-tes (SNBP, PPKB UI, PBUB UGM, dll), dan persiapan rapor/esai. Ada yang ingin Kakak tanyakan seputar OtwPTN atau persiapan masuk kampus impian?'
  }

  // Email / Kontak
  if (q.includes('email') || q.includes('kontak') || q.includes('hubungi') || q.includes('cs') || q.includes('admin')) {
    return 'Halo Pejuang PTN! Kamu dapat menghubungi tim resmi kami melalui:\n\n• **Email Resmi:** otwptn.com@gmail.com\n• **WhatsApp Support:** Terhubung langsung via dashboard atau halaman Komunitas OtwPTN.\n• **Layanan:** PT. Lembaga Sains Nasional\n\nAda kendala atau pertanyaan yang bisa Otbee bantu sekarang?'
  }

  // Harga & Paket
  if (q.includes('harga') || q.includes('biaya') || q.includes('paket') || q.includes('bayar') || q.includes('upgrade') || q.includes('nectar') || q.includes('honeycomb') || q.includes('queen bee')) {
    return 'Halo Kak! OtwPTN menyediakan pilihan paket belajar yang fleksibel:\n\n1. **Akun Premium (Rp 49.000 sekali bayar):** Akses mandiri tak terbatas ke seluruh fitur cerdas (Kalkulator Peluang Rapor Unlimited, Review Essay AI 2.0 Unlimited, Chat AI Otbee Unlimited, 100% Video & Modul E-Course).\n2. **Paket Nectar (Rp 159.000 total / Rp 53.000/bln):** Termasuk Akun Premium + 2x Putaran Revisi Essay & Berkas via WhatsApp bersama Mentor Alumni UI ITB UGM.\n3. **Paket Honeycomb (Rp 299.000 - Paling Populer):** Termasuk Akun Premium + 5x Revisi Berkas + 2x Sesi Mentoring Zoom 1-on-1 + WhatsApp Group 3 Pihak (Mentor + Siswa + Admin).\n4. **Royal Jelly VIP (Rp 599.000):** Paket terlengkap dengan Bimbingan 1-on-1 Unlimited sampai hari H, Zoom tanpa batas, Dokumen Analisis Pilihan 1 & 2 dari Mentor, plus Tiket Trip Campus Tour ke UI!\n\n*Catatan:* Semua paket bimbingan mentor sudah otomatis termasuk Akun Premium!'
  }

  // Kalkulator Peluang
  if (q.includes('kalkulator') || q.includes('peluang') || q.includes('rapor')) {
    return 'Halo Kak! Fitur **Kalkulator Peluang Rapor OtwPTN** bekerja dengan menganalisis:\n\n• Rata-rata nilai rapor semester 1-5.\n• Mata pelajaran pendukung program studi pilihan sesuai regulasi SNPMB 2026/2027.\n• Kuota siswa eligible sekolah (Akreditasi A: 40%, B: 25%, C: 5%).\n• Kurasi sertifikat prestasi lomba berskala Puspresnas/provinsi/nasional.\n\nHasil kalkulasi memberikan estimasi rasio kelolosan yang realistis dan saran strategi pemilihan prodi agar tidak saling bentrok dengan teman satu sekolah.'
  }

  // Essay / Personal Statement
  if (q.includes('essay') || q.includes('esai') || q.includes('personal statement') || q.includes('ppkb')) {
    return 'Halo Kak! Untuk persiapan esai masuk PTN (seperti PPKB UI, Talent Scouting, atau IUP UGM), OtwPTN memiliki dua solusi unggulan:\n\n1. **AI Essay Review 2.0:** Deteksi hook pembuka instan, analisis 4 dimensi, skor originalitas ide, dan koreksi kalimat klise secara otomatis.\n2. **Bimbingan Mentor Alumni UI/ITB/UGM (Paket Nectar, Honeycomb, VIP):** Esai motivasimu akan dibedah langsung kalimat demi kalimat oleh kakak mentor yang sudah berpengalaman lolos seleksi.\n\nKamu bisa mencoba editor esai di menu *Essay AI Review* di dashboard!'
  }

  // Apa itu SNBP / Non-tes
  if (q.includes('apa itu') || q.includes('snbp') || q.includes('non tes') || q.includes('tanpa tes')) {
    return 'Halo Pejuang PTN! Jalur **Non-Tes (Tanpa Tes)** adalah mekanisme seleksi masuk PTN tanpa ujian tulis (CBT/UTBK). Komponen penilaian utamanya mencakup:\n\n• Nilai rapor konsisten dari semester 1 sampai 5.\n• Sertifikat kejuaraan sains, olahraga, seni, hafiz Quran, atau kepemimpinan (Ketua OSIS).\n• Essay motivasi / personal statement untuk jalur mandiri prestasi (seperti PPKB UI).\n\nOtwPTN adalah platform spesialis nomor satu di Indonesia yang mendampingi persiapan seluruh jalur non-tes tersebut!'
  }

  return null
}

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Pesan tidak valid' }, { status: 400 })
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
              content: String(h.content),
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
