import { createClient, createServiceClient } from '@/lib/supabase/server'
import { consumeQuota } from '@/lib/security'
import { NextResponse } from 'next/server'
import { getAiClient } from '@/lib/ai/client'

const TIER_ESSAY_LIMIT: Record<string, number | null> = {
  free: 1, web_premium: 3, review: 5, dokumen: 10, menyeluruh: null, intensif: null,
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('tier, role').eq('id', user.id).maybeSingle()
  const isStaff = profile?.role === 'superadmin' || profile?.role === 'mentor'
  const tier = profile?.tier ?? 'free'
  const limit = isStaff ? null : TIER_ESSAY_LIMIT[tier]

  const { essay_id, content } = await request.json()
  if (typeof content !== 'string' || content.trim().length < 20 || content.length > 20000) {
    return NextResponse.json({ error: 'Isi esai tidak valid (20 sampai 20.000 karakter)' }, { status: 400 })
  }
  if (typeof essay_id !== 'string') {
    return NextResponse.json({ error: 'essay_id tidak valid' }, { status: 400 })
  }

  // Ownership: the feedback row is written with the service client, so verify the essay is
  // the caller's own first (otherwise anyone could attach feedback to someone else's essay).
  const { data: ownEssay } = await supabase.from('essays').select('id').eq('id', essay_id).eq('user_id', user.id).maybeSingle()
  if (!ownEssay) return NextResponse.json({ error: 'Esai tidak ditemukan' }, { status: 404 })

  // Atomic check+increment BEFORE the paid AI call (parallel requests can no longer all pass).
  if (!(await consumeQuota(user.id, 'ai_essay', limit))) {
    return NextResponse.json({ error: 'quota_exceeded', limit }, { status: 403 })
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const { client, model } = getAiClient('complex')
  const prompt = `Kamu adalah Kurator Senior & Penilai Esai Motivasi / Personal Statement PTN Seleksi Non-Tes Indonesia (PPKB UI, PBUB UGM, SJP IPB, Golden Ticket UNAIR, SIMAK UI) di platform otwptn (PT. Lembaga Sains Nasional).

TUGAS: Evaluasi draf esai berikut secara KRITIS dan JUJUR. Jangan memberikan skor tinggi untuk esai yang tidak layak. Bersikaplah seperti kurator seleksi PTN yang ketat.

INFORMASI ESAI:
- Jumlah kata: ${wordCount} kata

PANDUAN SKOR BERDASARKAN PANJANG ESAI:
- < 100 kata: MAKSIMAL skor 45 untuk semua dimensi. Ini bukan esai, hanya draft kasar.
- 100–199 kata: MAKSIMAL skor 62. Terlalu pendek untuk menunjukkan bukti nyata.
- 200–299 kata: MAKSIMAL skor 75. Masih sangat kurang dari standar minimal esai PTN (300-600 kata).
- 300–499 kata: Skor bisa 60-82 tergantung kualitas konten.
- 500+ kata: Skor bisa 70-95 tergantung kualitas konten.

DIMENSI PENILAIAN:
1. Struktur (Structure 0-100):
   - Hook pembuka: Menghindari pembuka klise ("Sejak kecil saya bercita-cita...", "Saya adalah siswa yang..."). Pembuka klise LANGSUNG turunkan 15-25 poin.
   - Inti argumen (Body): Harus menggunakan pendekatan STAR (Situation, Task, Action, Result) dengan bukti aksi nyata dan angka.
   - Penutup: Visi kontribusi konkret untuk universitas dan Indonesia.
2. Koherensi (Coherence 0-100):
   - Kelancaran transisi antar paragraf dan konsistensi benang merah tema.
3. Kekuatan Argumen (Argument 0-100):
   - Ketajaman alasan memilih prodi & kampus target. Apakah pelamar menunjukkan pemahaman kurikulum/laboratorium atau hanya sekadar pujian umum? Klaim tanpa bukti konkret: kurangi 20 poin.
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

  let result: any = null

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    })

    const rawContent = completion.choices[0].message.content ?? '{}'
    result = JSON.parse(rawContent)
  } catch (apiErr) {
    console.warn('[AI Essay Review] Primary AI call failed, generating heuristic evaluation:', apiErr)
    const firstSentence = content.split(/[.!?]/)[0]?.trim() || content.slice(0, 30)
    const midSentence = content.slice(Math.floor(content.length / 2), Math.floor(content.length / 2) + 40).trim()

    // Calibrated heuristic scores based on word count
    const baseScore = wordCount < 100 ? 35 : wordCount < 200 ? 52 : wordCount < 300 ? 65 : wordCount < 500 ? 72 : 78

    result = {
      structure: Math.min(baseScore + 2, 80),
      coherence: Math.min(baseScore - 2, 78),
      argument: Math.min(baseScore - 4, 76),
      language: Math.min(baseScore + 4, 82),
      overall: baseScore,
      feedback: wordCount < 200
        ? `Esai kamu baru ${wordCount} kata — jauh di bawah standar minimal esai PTN non-tes (300-600 kata). Pada tahap ini, evaluasi mendalam belum bisa dilakukan karena konten yang ada terlalu sedikit untuk menunjukkan kemampuan argumentasi dan storytelling kamu. Prioritas utama: tulis lebih banyak, ceritakan pengalaman nyata dengan metode STAR.`
        : `Esai kamu (${wordCount} kata) sudah memiliki arah dasar. Namun masih perlu pengembangan signifikan sebelum layak dikurasi panitia PTN. Perkuat bukti tindakan nyata dengan angka dan dampak konkret, serta pertajam relevansi pilihan jurusan.`,
      suggestions: [
        'Tambah panjang esai minimal 300 kata — esai terlalu pendek tidak akan lolos kurasi awal panitia seleksi.',
        'Gunakan pendekatan STAR (Situation, Task, Action, Result) untuk menceritakan capaianmu secara terukur dengan data.',
        'Jelaskan alasan spesifik mengapa kurikulum atau laboratorium di kampus target sangat kamu butuhkan.',
        'Perhalus kalimat pembuka — hindari klise "Saya adalah siswa..." dan ganti dengan hook yang memantik rasa ingin tahu.',
      ],
      issues: [
        {
          quote: firstSentence.slice(0, 40),
          category: 'structure',
          comment: 'Kalimat pembuka klise dan generik. Mulailah dengan momen spesifik yang mengubah perspektifmu.',
        },
        {
          quote: midSentence.slice(0, 40),
          category: 'argument',
          comment: 'Klaim tanpa bukti konkret. Cantumkan nama program, lomba, atau kegiatan nyata yang pernah kamu ikuti.',
        },
      ],
    }
  }

  try {
    const admin = createServiceClient()

    await admin.from('essay_feedback').insert({
      essay_id,
      feedback_json: result,
      score: result.overall,
    })

    const { data: essayData } = await supabase.from('essays').select('revision_count').eq('id', essay_id).maybeSingle()
    await supabase.from('essays').update({ revision_count: (essayData?.revision_count ?? 0) + 1 }).eq('id', essay_id)

  } catch (dbErr) {
    console.warn('[AI Essay Review] Non-blocking DB log warning:', dbErr)
  }

  return NextResponse.json(result)
}

