import { createClient, createServiceClient } from '@/lib/supabase/server'
import { consumeQuota, rateLimit } from '@/lib/security'
import { NextResponse } from 'next/server'
import { getAiClient, extractJsonFromAi } from '@/lib/ai/client'
import { analyzeEssayWithNLP } from '@/lib/nlp/essayNlpEngine'

const TIER_ESSAY_LIMIT: Record<string, number | null> = {
  free: 1, web_premium: null, review: null, dokumen: null, menyeluruh: null, intensif: null,
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
  const limit = isUnlimited ? null : TIER_ESSAY_LIMIT[tier]

  if (!isUnlimited && tier === 'free') {
    // 1 review per week (7 days = 604800 seconds)
    const allowed = await rateLimit('essay_free', user.id, 1, 7 * 86400)
    if (!allowed) {
      return NextResponse.json({
        error: 'quota_exceeded',
        message: 'Batas review esai gratis (1x per minggu) sudah tercapai. Upgrade ke Akun Premium untuk review AI tanpa batas.',
      }, { status: 403 })
    }
  }

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

  // Execute NLP Engine against 100 Accepted PPKB UI Essays Benchmark
  const nlpBenchmark = analyzeEssayWithNLP(content)

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const { client, model } = getAiClient('complex')
  const prompt = `Kamu adalah Kurator Senior & Penilai Esai Motivasi / Personal Statement PTN Seleksi Non-Tes Indonesia (PPKB UI, PBUB UGM, SJP IPB, Golden Ticket UNAIR, SIMAK UI) di platform otwptn (PT. Lembaga Sains Nasional).

TUGAS: Evaluasi draf esai berikut secara KRITIS dan JUJUR. Jangan memberikan skor tinggi untuk esai yang tidak layak. Bersikaplah seperti kurator seleksi PTN yang ketat.

INFORMASI ESAI:
- Jumlah kata: ${wordCount} kata

HASIL ANALISIS NLP BENCHMARK (100 ESAI LOLOS PPKB UI):
- Skor Kemiripan Vektor Kosinus (TF-IDF vs Korpus Lolos): ${nlpBenchmark.similarityScore}/100
- Klaster Fakultas/Prodi Terdekat: ${nlpBenchmark.topMatchingFaculty} - ${nlpBenchmark.topMatchingMajor}
- Profil Rujukan Korpus Terdekat: ${nlpBenchmark.matchedAuthorContext}
- Kutipan Benchmark Esai Lolos: "${nlpBenchmark.matchedWinningExcerpt}"
- Relevansi Isu Strategis 5 Tahun: ${nlpBenchmark.temporalAnalysis.temporalScore}/100 (${nlpBenchmark.temporalAnalysis.trendAlignment}) - Tema: ${nlpBenchmark.temporalAnalysis.matchedThemes.join(', ') || 'Umum'}
- Tahapan Retorika 5 Paragraf: ${nlpBenchmark.rhetoricalStages.map(s => `${s.stage} (${s.status})`).join('; ')}
- Kepadatan Aksi STAR: ${nlpBenchmark.starScore}/100 (Kata kerja aksi terdeteksi: ${nlpBenchmark.starActionVerbs.join(', ') || 'Belum ada'})
- Bukti Angka / Metrik Terukur: ${nlpBenchmark.metricsFound.join(', ') || 'Belum ditemukan'}
- Alur & Irama Kalimat (Rhetorical Cadence): ${nlpBenchmark.sentenceFlowScore}/100 (Rata-rata ${nlpBenchmark.avgSentenceLength} kata/kalimat, ${nlpBenchmark.runawaySentencesCount} kalimat terlalu panjang)
- Kata Penghubung / Transisi Terdeteksi: ${nlpBenchmark.transitionWordsFound.join(', ') || 'Minim'}
- Spesifisitas Istilah Prodi: ${nlpBenchmark.domainSpecificityScore}/100 (${nlpBenchmark.detectedDomainTerms.join(', ') || 'Umum'})
- Frasa Klise Terdeteksi: ${nlpBenchmark.clichesFound.join(', ') || 'Nihil (Bagus)'}
- Peringkat Persentil Benchmark: Persentil ke-${nlpBenchmark.benchmarkRankPercentile} (${nlpBenchmark.verdict})

PANDUAN SKOR BERDASARKAN PANJANG ESAI:
- < 100 kata: MAKSIMAL skor 45 untuk semua dimensi. Ini bukan esai, hanya draft kasar.
- 100-199 kata: MAKSIMAL skor 62. Terlalu pendek untuk menunjukkan bukti nyata.
- 200-299 kata: MAKSIMAL skor 75. Masih sangat kurang dari standar minimal esai PTN (300-600 kata).
- 300-499 kata: Skor bisa 60-82 tergantung kualitas konten.
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
      "quote": "<KUTIP PERSIS kata-per-kata 3 sampai 12 kata dari teks esai di atas yang memiliki kelemahan>",
      "category": "<pilih salah satu: structure | coherence | argument | language>",
      "problem": "<penjelasan singkat mengapa kalimat ini lemah / bermasalah, misalnya: 'Format surat dinas resmi, bukan gaya esai personal', 'Klaim abstrak tanpa bukti data metrik', 'Metafora hiperbolis berlebihan', dll>",
      "suggestion": "<rekomendasi kalimat alternatif pengganti yang siap pakai dan jauh lebih berbobot>",
      "otbeeRant": "<celotehan komik marah-marah organik, savage, dan lucu ala AI Coach GoSpeak (bukan template kaku, JANGAN pakai kata 'woyy woyy' berulang-ulang!). Gunakan bahasa gaul santai, tajam, sarkastik tapi membangun layaknya teman ambis yang gregetan. Contoh gaya: 'Astaga naga... lu nulis esai seleksi PTN apa surat permohonan bansos ke kelurahan?! Hapus pembuka kayak gini, bikin panitia auto ngantuk!', 'Klaim lu setinggi langit tapi buktinya nol besar anjir! Panitia butuh data & karya konkret, bukan janji manis doang!', 'Bisa-bisanya metafora selebay ini masuk esai? Jurusan lu Sistem Informasi bukan sastra pujangga, to the point aja ngapa!', 'Vibes penutupnya pasrah banget, lu mau masuk kampus impian apa mau pamit pensiun dini?! Bikin komitmen visi yang berani!'>",
      "comment": "<saran kalimat pengganti atau catatan perbaikan spesifik, 1 kalimat tegas>"
    }
  ]
}

PERINGATAN KHUSUS UNTUK ARRAY "issues":
- Hasilkan antara 8 sampai 15 issues yang tersebar di seluruh paragraf esai (pembuka, isi, studi kasus, alasan memilih kampus, hingga penutup).
- Nilai field "quote" WAJIB merupakan kutipan persis (exact match kata, huruf, tanda baca) yang ada dalam teks esai di atas agar sistem bisa melakukan highlight otomatis pada teks.`

  let result: any = null

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 2500,
    })

    const rawContent = completion.choices[0].message.content ?? '{}'
    result = extractJsonFromAi(rawContent)
    if (!result || typeof result.overall !== 'number' || !result.feedback) {
      throw new Error('AI response missing required JSON fields')
    }
    result.nlpBenchmark = nlpBenchmark
    result.isFallback = false
  } catch (apiErr) {
    console.warn('[AI Essay Review] Primary AI call failed, generating heuristic evaluation:', apiErr)
    const sentences = content.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 15)
    const firstSentence = sentences[0] || content.slice(0, 40)
    const midSentence = sentences[Math.floor(sentences.length / 2)] || content.slice(40, 90)
    const lastSentence = sentences[sentences.length - 1] || content.slice(-40)

    // Calibrated heuristic scores based on word count & NLP benchmark
    const baseScore = wordCount < 100 ? 35 : wordCount < 200 ? 52 : wordCount < 300 ? 65 : wordCount < 500 ? 72 : 78

    const generatedIssues = [
      {
        quote: firstSentence.slice(0, 45).trim(),
        category: 'structure',
        problem: 'Kalimat pembuka klise dan generik, belum langsung memikat rasa ingin tahu panitia.',
        suggestion: 'Mulai dengan momen observasi spesifik atau insiden nyata yang mengubah cara pandangmu.',
        otbeeRant: 'Astaga naga... lu nulis esai seleksi PTN apa surat permohonan bansos ke kelurahan?! Hapus pembuka kayak gini, panitia auto ngantuk!',
        comment: 'Kalimat pembuka klise dan generik. Mulailah dengan momen spesifik yang mengubah cara pandangmu.',
      },
      {
        quote: midSentence.slice(0, 45).trim(),
        category: 'argument',
        problem: 'Klaim motivasi tanpa menyertakan bukti aksi nyata (STAR) dan angka terukur.',
        suggestion: 'Sertakan nama proyek, kompetisi, atau peran konkret beserta dampaknya (misal jumlah partisipan/efisiensi).',
        otbeeRant: 'Klaim lu setinggi langit tapi buktinya nol besar anjir! Panitia butuh metrik dan karya nyata, bukan dongeng pengantar tidur!',
        comment: 'Klaim tanpa bukti konkret. Cantumkan nama kegiatan nyata dan metrik yang pernah kamu hasilkan.',
      },
      {
        quote: lastSentence.slice(0, 45).trim(),
        category: 'structure',
        problem: 'Penutup terlalu mirip surat permohonan resmi dan kurang menunjukkan visi kontribusi terukur.',
        suggestion: 'Ubah penutup menjadi komitmen visi 5 tahun ke depan bagi almamater dan masyarakat luas.',
        otbeeRant: 'Vibes penutupnya pasrah banget, lu mau masuk kampus impian apa mau pamit pensiun dini?! Tulis visi kontribusi yang berani!',
        comment: 'Penutup menyerupai surat dinas. Ganti dengan pernyataan visi dan kontribusi spesifik di masa depan.',
      },
    ]

    result = {
      structure: Math.min(baseScore + 2, 80),
      coherence: Math.min(baseScore - 2, 78),
      argument: Math.min(baseScore - 4, 76),
      language: Math.min(baseScore + 4, 82),
      overall: Math.round((baseScore + nlpBenchmark.benchmarkRankPercentile) / 2),
      feedback: wordCount < 200
        ? `Esai kamu baru ${wordCount} kata - jauh di bawah standar minimal esai PTN non-tes (300-600 kata). Pada tahap ini, evaluasi mendalam belum bisa dilakukan karena konten yang ada terlalu sedikit untuk menunjukkan kemampuan argumentasi dan storytelling kamu. Prioritas utama: tulis lebih banyak, ceritakan pengalaman nyata dengan metode STAR.`
        : `Esai kamu (${wordCount} kata) memiliki keselarasan narasi ${nlpBenchmark.similarityScore}% terhadap profil esai lolos seleksi PTN bidang ${nlpBenchmark.topMatchingFaculty}. Perkuat aksi nyata terukur dan eliminasi frasa klise sebelum masuk kurasi final.`,
      suggestions: [
        'Tambah panjang esai minimal 300 kata - esai terlalu pendek tidak akan lolos kurasi awal panitia seleksi.',
        'Gunakan pendekatan STAR (Situation, Task, Action, Result) untuk menceritakan capaianmu secara terukur dengan data.',
        'Jelaskan alasan spesifik mengapa kurikulum atau laboratorium di kampus target sangat kamu butuhkan.',
        'Perhalus kalimat pembuka - hindari klise pembuka dan ganti dengan hook observasi masalah nyata.',
      ],
      issues: generatedIssues,
      nlpBenchmark,
      isFallback: true,
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
