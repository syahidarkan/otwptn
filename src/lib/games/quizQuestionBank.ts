import bankSoalData from '@/lib/games/bank-soal-arena-kuis.json'
import padananData from '@/lib/games/padanan-kata.json'
import bakuData from '@/lib/games/baku-atau-nggak.json'
import kalimatData from '@/lib/games/benerin-kalimat.json'

export interface QuizQuestion {
  id: string
  category: string
  prompt: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

// ─── Additional Curated Question Bank (UTBK SNBT & PTN Non-Tes PPU / PUEBI / PBM) ───
const CURATED_ADDITIONAL_QUESTIONS: QuizQuestion[] = [
  // PPU - Analogi & Padanan Kata
  {
    id: 'PPU_EXT_01',
    category: 'PPU - Analogi & Padanan Kata',
    prompt: 'Kamera : Lensa = Manusia : ?',
    question: 'Pilihlah pasangan analogis yang setara fungsinya:',
    options: ['Mata', 'Otak', 'Jantung', 'Telinga'],
    correctIndex: 0,
    explanation: 'Lensa adalah bagian penangkap cahaya pada kamera, setara dengan mata pada manusia.',
  },
  {
    id: 'PPU_EXT_02',
    category: 'PPU - Analogi & Padanan Kata',
    prompt: 'Komposer : Simfoni = Sutradara : ?',
    question: 'Pilihlah pasangan analogis pelaku dan karya seninya:',
    options: ['Film', 'Aktor', 'Naskah', 'Kamera'],
    correctIndex: 0,
    explanation: 'Komposer memproduksi simfoni musik, sedangkan sutradara memproduksi film.',
  },
  {
    id: 'PPU_EXT_03',
    category: 'PPU - Analogi & Padanan Kata',
    prompt: 'Insomnia : Tidur = Anoreksia : ?',
    question: 'Pilihlah pasangan gangguan medis dan kebutuhannya:',
    options: ['Makan', 'Minum', 'Istirahat', 'Olahraga'],
    correctIndex: 0,
    explanation: 'Insomnia adalah gangguan tidur, sedangkan anoreksia adalah gangguan makan.',
  },
  {
    id: 'PPU_EXT_04',
    category: 'PPU - Analogi & Padanan Kata',
    prompt: 'Ekskavasi : Arkeolog = Diagnosis : ?',
    question: 'Pilihlah hubungan tindakan profesional dan pelakunya:',
    options: ['Dokter', 'Apoteker', 'Pasien', 'Perawat'],
    correctIndex: 0,
    explanation: 'Ekskavasi dilakukan oleh arkeolog, sedangkan diagnosis dilakukan oleh dokter.',
  },
  {
    id: 'PPU_EXT_05',
    category: 'PPU - Analogi & Padanan Kata',
    prompt: 'Tenggelam : Kapal = Runtuh : ?',
    question: 'Pilihlah analogi kerusakan pada subjek benda:',
    options: ['Gedung', 'Pesawat', 'Jalan', 'Mobil'],
    correctIndex: 0,
    explanation: 'Kapal yang mengalami kehancuran fatal disebut tenggelam, gedung disebut runtuh.',
  },
  {
    id: 'PPU_EXT_06',
    category: 'PPU - Analogi & Padanan Kata',
    prompt: 'Kardiologi : Jantung = Nefrologi : ?',
    question: 'Pilihlah cabang ilmu kedokteran dan organ telaahnya:',
    options: ['Ginjal', 'Paru-paru', 'Hati', 'Otak'],
    correctIndex: 0,
    explanation: 'Kardiologi mempelajari jantung, sedangkan nefrologi mempelajari ginjal.',
  },
  {
    id: 'PPU_EXT_07',
    category: 'PPU - Analogi & Padanan Kata',
    prompt: 'Bait : Puisi = Bab : ?',
    question: 'Pilihlah hubungan unit pembangun dan karyanya:',
    options: ['Novel', 'Lirik', 'Paragraf', 'Kalimat'],
    correctIndex: 0,
    explanation: 'Puisi tersusun atas bait-bait, sedangkan novel tersusun atas bab-bab.',
  },
  {
    id: 'PPU_EXT_08',
    category: 'PPU - Analogi & Padanan Kata',
    prompt: 'Merah : Berani = Putih : ?',
    question: 'Pilihlah makna simbolik warna dalam konvensi resmi:',
    options: ['Suci', 'Damai', 'Duka', 'Terang'],
    correctIndex: 0,
    explanation: 'Merah melambangkan keberanian, sedangkan putih melambangkan kesucian.',
  },
  {
    id: 'PPU_EXT_09',
    category: 'PPU - Analogi & Padanan Kata',
    prompt: 'Padi : Beras = Gandum : ?',
    question: 'Pilihlah hubungan bahan baku dan hasil olahan pokoknya:',
    options: ['Tepung terigu', 'Roti', 'Kue', 'Oatmeal'],
    correctIndex: 0,
    explanation: 'Padi diolah menjadi beras, sedangkan gandum diolah menjadi tepung terigu.',
  },
  {
    id: 'PPU_EXT_10',
    category: 'PPU - Analogi & Padanan Kata',
    prompt: 'Stetoskop : Suara Jantung = Barometer : ?',
    question: 'Pilihlah alat ukur dan besaran fisika yang dideteksinya:',
    options: ['Tekanan Udara', 'Suhu Udara', 'Kelembapan', 'Kecepatan Angin'],
    correctIndex: 0,
    explanation: 'Stetoskop mendengarkan detak jantung, barometer mengukur tekanan udara.',
  },

  // PUEBI - Kata Baku vs Tidak Baku
  {
    id: 'PUEBI_EXT_01',
    category: 'PUEBI - Kata Baku vs Tidak Baku',
    prompt: 'Ejaan Resmi KBBI',
    question: 'Pilihlah kata yang berstatus BAKU menurut KBBI:',
    options: ['Analisis', 'Analisa'],
    correctIndex: 0,
    explanation: 'Bentuk baku adalah "analisis" (menyerap dari bahasa Inggris "analysis" dengan akhiran -is).',
  },
  {
    id: 'PUEBI_EXT_02',
    category: 'PUEBI - Kata Baku vs Tidak Baku',
    prompt: 'Ejaan Resmi KBBI',
    question: 'Pilihlah kata yang berstatus BAKU menurut KBBI:',
    options: ['Antre', 'Antri'],
    correctIndex: 0,
    explanation: 'Bentuk baku menurut KBBI adalah "antre" dengan huruf "e", bukan "antri".',
  },
  {
    id: 'PUEBI_EXT_03',
    category: 'PUEBI - Kata Baku vs Tidak Baku',
    prompt: 'Ejaan Resmi KBBI',
    question: 'Pilihlah kata yang berstatus BAKU menurut KBBI:',
    options: ['Cedera', 'Cidera'],
    correctIndex: 0,
    explanation: 'Bentuk baku menurut KBBI adalah "cedera" dengan vokal e di awal.',
  },
  {
    id: 'PUEBI_EXT_04',
    category: 'PUEBI - Kata Baku vs Tidak Baku',
    prompt: 'Ejaan Resmi KBBI',
    question: 'Pilihlah kata yang berstatus BAKU menurut KBBI:',
    options: ['Cenderamata', 'Cinderamata'],
    correctIndex: 0,
    explanation: 'Bentuk baku adalah "cenderamata" ditulis serangkai dan diawali huruf e.',
  },
  {
    id: 'PUEBI_EXT_05',
    category: 'PUEBI - Kata Baku vs Tidak Baku',
    prompt: 'Ejaan Resmi KBBI',
    question: 'Pilihlah kata yang berstatus BAKU menurut KBBI:',
    options: ['Objektif', 'Obyektif'],
    correctIndex: 0,
    explanation: 'Bentuk baku menggunakan huruf "j" yakni "objektif", bukan huruf "y".',
  },
  {
    id: 'PUEBI_EXT_06',
    category: 'PUEBI - Kata Baku vs Tidak Baku',
    prompt: 'Ejaan Resmi KBBI',
    question: 'Pilihlah kata yang berstatus BAKU menurut KBBI:',
    options: ['Risiko', 'Resiko'],
    correctIndex: 0,
    explanation: 'Bentuk baku adalah "risiko" dengan vokal "i" di awal, bukan "resiko".',
  },
  {
    id: 'PUEBI_EXT_07',
    category: 'PUEBI - Kata Baku vs Tidak Baku',
    prompt: 'Ejaan Resmi KBBI',
    question: 'Pilihlah kata yang berstatus BAKU menurut KBBI:',
    options: ['Zaman', 'Jaman'],
    correctIndex: 0,
    explanation: 'Bentuk baku menggunakan huruf "z" yakni "zaman", bukan "jaman".',
  },
  {
    id: 'PUEBI_EXT_08',
    category: 'PUEBI - Kata Baku vs Tidak Baku',
    prompt: 'Ejaan Resmi KBBI',
    question: 'Pilihlah kata yang berstatus BAKU menurut KBBI:',
    options: ['Sekadar', 'Sekedar'],
    correctIndex: 0,
    explanation: 'Kata dasar adalah "kadar", sehingga bentuk turunan yang baku adalah "sekadar".',
  },
  {
    id: 'PUEBI_EXT_09',
    category: 'PUEBI - Kata Baku vs Tidak Baku',
    prompt: 'Ejaan Resmi KBBI',
    question: 'Pilihlah kata yang berstatus BAKU menurut KBBI:',
    options: ['Hierarki', 'Hirarki'],
    correctIndex: 0,
    explanation: 'Bentuk baku mempertahankan diftong ie yakni "hierarki".',
  },
  {
    id: 'PUEBI_EXT_10',
    category: 'PUEBI - Kata Baku vs Tidak Baku',
    prompt: 'Ejaan Resmi KBBI',
    question: 'Pilihlah kata yang berstatus BAKU menurut KBBI:',
    options: ['Kuitansi', 'Kwitansi'],
    correctIndex: 0,
    explanation: 'Bentuk baku menurut KBBI adalah "kuitansi" dengan huruf "u", bukan "w".',
  },

  // PBM - Pemahaman Bacaan & Menulis (Efektivitas Kalimat)
  {
    id: 'PBM_EXT_01',
    category: 'PBM - Keefektifan Kalimat',
    prompt: 'Kalimat: "Meskipun lelah sekali, namun atlet itu tetap berlari kencang."',
    question: 'Manakah bentuk perbaikan kalimat efektif yang tepat?',
    options: [
      'Meskipun lelah sekali, atlet itu tetap berlari kencang.',
      'Meskipun lelah sekali, tapi atlet itu tetap berlari kencang.',
      'Walau lelah sekali, namun atlet itu tetap berlari kencang.',
      'Lelah sekali, meskipun atlet itu tetap berlari kencang.',
    ],
    correctIndex: 0,
    explanation: 'Konjungsi subordinatif "meskipun" tidak boleh disandingkan dengan konjungsi antarklausa "namun" dalam satu kalimat majemuk bertingkat.',
  },
  {
    id: 'PBM_EXT_02',
    category: 'PBM - Pemilihan Konjungsi',
    prompt: 'Kalimat: "Rapat ditunda oleh karena pimpinan sedang dinas luar kota."',
    question: 'Kata penghubung yang berlebihan dan tidak baku pada kalimat tersebut adalah:',
    options: ['oleh karena', 'karena', 'oleh sebab itu', 'sebab'],
    correctIndex: 0,
    explanation: 'Frasa "oleh karena" berlebihan; cukup gunakan "karena" atau "sebab".',
  },
  {
    id: 'PBM_EXT_03',
    category: 'PBM - Kelogisan Kalimat',
    prompt: 'Kalimat: "Bagi yang membawa kendaraan bermotor harap dikunci ganda."',
    question: 'Perbaikan kalimat di atas agar memiliki subjek yang jelas adalah:',
    options: [
      'Pengendara yang membawa kendaraan bermotor harap mengunci ganda kendaraannya.',
      'Yang membawa kendaraan bermotor harap dikunci ganda.',
      'Bagi pembawa kendaraan harap dikunci ganda.',
      'Kendaraan bermotor harap mengunci ganda bagi yang membawa.',
    ],
    correctIndex: 0,
    explanation: 'Menghilangkan preposisi "bagi" dan mengubah predikat menjadi aktif agar kalimat memiliki subjek yang jelas dan logis.',
  },
  {
    id: 'PBM_EXT_04',
    category: 'PBM - Bentuk Jamak Efektif',
    prompt: 'Kalimat: "Para hadirin sekalian dipersilakan menempati kursi yang telah disediakan."',
    question: 'Frasa berlebihan (pleonasme) pada kalimat tersebut adalah:',
    options: ['Para hadirin sekalian', 'telah disediakan', 'menempati kursi', 'dipersilakan'],
    correctIndex: 0,
    explanation: '"Hadirin" sudah bermakna jamak, sehingga tidak perlu diawali "para" dan diakhiri "sekalian". Cukup: "Hadirin dipersilakan...".',
  },
  {
    id: 'PBM_EXT_05',
    category: 'PBM - Penulisan Kata Depan',
    prompt: 'Kalimat: "Penelitian ini dilakukan di laboratorium dan bertujuan meneliti sel."',
    question: 'Penulisan kata depan "di" pada kalimat di atas sudah benar karena:',
    options: [
      '"di" dipisah dari kata tempat "laboratorium"',
      '"di" digabung dengan kata "laboratorium"',
      '"di" merupakan imbuhan pasif',
      '"di" membentuk kata kerja aktif',
    ],
    correctIndex: 0,
    explanation: 'Kata depan "di" yang menyatakan tempat (laboratorium) wajib ditulis terpisah.',
  },
]

// Transform bank-soal-arena-kuis.json questions
const bankQuestions: QuizQuestion[] = (bankSoalData.soal as any[]).map(item => {
  if (item.kategori === 'PPU') {
    const opts = (item.opsi || []).map((o: any) => o.text)
    const kunciId = item.kunci
    const kunciIdx = (item.opsi || []).findIndex((o: any) => o.id === kunciId)
    return {
      id: item.id,
      category: `PPU - ${item.subjenis || 'Padanan Kata'}`,
      prompt: item.prompt || 'Pilih padanan kata atau analogi yang tepat:',
      question: item.prompt || 'Manakah pasangan kata yang memiliki hubungan analogis setara?',
      options: opts.length > 0 ? opts : ['A', 'B', 'C', 'D'],
      correctIndex: kunciIdx !== -1 ? kunciIdx : 0,
      explanation: item.pembahasan || 'Pembahasan kunci jawaban.',
    }
  }

  if (item.kategori === 'PUEBI') {
    const opts = (item.opsi || []).map((o: any) => o.text)
    const kunciId = item.kunci
    const kunciIdx = (item.opsi || []).findIndex((o: any) => o.id === kunciId)
    return {
      id: item.id,
      category: `PUEBI - ${item.subjenis || 'Kata Baku'}`,
      prompt: item.prompt || 'Pilih kata baku yang sesuai KBBI:',
      question: item.prompt || 'Pilihlah bentuk kata baku yang sesuai kaidah resmi KBBI:',
      options: opts.length > 0 ? opts : ['A', 'B', 'C', 'D'],
      correctIndex: kunciIdx !== -1 ? kunciIdx : 0,
      explanation: item.pembahasan || 'Pembahasan ejaan kata baku.',
    }
  }

  // PBM
  if (item.tipe === 'kalimat_hapus') {
    const opts = (item.opsi_jawaban || []).map((o: any) => o.text)
    const correctIdx = (item.opsi_jawaban || []).findIndex((o: any) => o.benar)
    return {
      id: item.id,
      category: `PBM - ${item.subtopik || 'Kalimat Tidak Efektif'}`,
      prompt: `Periksa kalimat: "${item.kalimat}"`,
      question: `Kalimat ini punya kata berlebihan (${item.kata_berlebihan}). Tentukan perbaikannya:`,
      options: opts.length > 0 ? opts : ['Hapus kata ini', 'Biarkan saja'],
      correctIndex: correctIdx !== -1 ? correctIdx : 0,
      explanation: item.pembahasan,
    }
  }

  // kalimat_ganti
  const kunci = item.kunci || ''
  const kataSalah = item.kata_salah || ''
  const distractor = kataSalah.replace(/-/g, '').replace(/\s+/g, '')
  const options = [kunci, distractor, kataSalah].filter(Boolean)
  const uniqueOpts = Array.from(new Set(options))
  return {
    id: item.id,
    category: `PBM - ${item.subtopik || 'Perbaikan Kalimat'}`,
    prompt: `Perbaiki kalimat: "${item.kalimat}"`,
    question: `Kata "${kataSalah}" kurang tepat. Bentuk yang benar adalah:`,
    options: uniqueOpts,
    correctIndex: uniqueOpts.indexOf(kunci) !== -1 ? uniqueOpts.indexOf(kunci) : 0,
    explanation: item.pembahasan,
  }
})

// Transform legacy Padanan Kata
const padananQuestions: QuizQuestion[] = [
  ...CURATED_ADDITIONAL_QUESTIONS.filter(q => q.category.startsWith('PPU')),
  ...bankQuestions.filter(q => q.category.startsWith('PPU')),
  ...padananData.map(item => ({
    id: item.id,
    category: 'PPU - Analogi & Padanan Kata',
    prompt: item.prompt,
    question: item.question,
    options: item.options,
    correctIndex: item.correctIndex,
    explanation: item.explanation,
  })),
]

// Transform legacy Baku atau Nggak
const bakuQuestions: QuizQuestion[] = [
  ...CURATED_ADDITIONAL_QUESTIONS.filter(q => q.category.startsWith('PUEBI')),
  ...bankQuestions.filter(q => q.category.startsWith('PUEBI')),
  ...bakuData.map(item => {
    const isTargetFirst = Math.random() > 0.5
    const options = isTargetFirst
      ? [item.targetWord, item.commonMistake]
      : [item.commonMistake, item.targetWord]
    const correctIndex = isTargetFirst ? 0 : 1

    return {
      id: item.id,
      category: 'PUEBI - Kata Baku vs Tidak Baku',
      prompt: `Kosakata: ${item.definition}`,
      question: `Pilihlah bentuk kata baku yang sesuai dengan KBBI dan kaidah ejaan resmi:`,
      options: options,
      correctIndex: correctIndex,
      explanation: `${item.targetWord} adalah bentuk baku. ${item.hints.join(' ')}`,
    }
  }),
]

// Transform legacy Benerin Kalimat
const kalimatQuestions: QuizQuestion[] = [
  ...CURATED_ADDITIONAL_QUESTIONS.filter(q => q.category.startsWith('PBM')),
  ...bankQuestions.filter(q => q.category.startsWith('PBM')),
  ...kalimatData.map(item => ({
    id: item.id,
    category: `PBM - ${item.category}`,
    prompt: `Perbaikan Kalimat (${item.category})`,
    question: `Perbaiki kata yang salah pada kalimat: "${item.sentence}"`,
    options: item.options,
    correctIndex: item.options.indexOf(item.correctOption) !== -1 ? item.options.indexOf(item.correctOption) : 0,
    explanation: item.explanation,
  })),
]

// In-session anti-repetition memory so 5 consecutive games never repeat recently seen questions
const seenQuestionIds = new Set<string>()

export function getQuizQuestions(
  type: 'padanan' | 'baku' | 'kalimat' | 'mixed' = 'mixed',
  count = 8
): QuizQuestion[] {
  let pool: QuizQuestion[] = []
  if (type === 'padanan') {
    pool = [...padananQuestions]
  } else if (type === 'baku') {
    pool = [...bakuQuestions]
  } else if (type === 'kalimat') {
    pool = [...kalimatQuestions]
  } else {
    // Mixed: combine all
    pool = [...padananQuestions, ...bakuQuestions, ...kalimatQuestions]
  }

  // De-duplicate by ID
  const uniqueMap = new Map<string, QuizQuestion>()
  for (const q of pool) {
    if (!uniqueMap.has(q.id)) {
      uniqueMap.set(q.id, q)
    }
  }
  const uniquePool = Array.from(uniqueMap.values())

  // Separate into unvisited and visited
  const unvisited = uniquePool.filter(q => !seenQuestionIds.has(q.id))

  let selected: QuizQuestion[] = []
  if (unvisited.length >= count) {
    // Pick from unvisited questions first
    const shuffled = [...unvisited].sort(() => Math.random() - 0.5)
    selected = shuffled.slice(0, count)
  } else {
    // Pool exhausted, reset memory and shuffle all
    seenQuestionIds.clear()
    const shuffled = [...uniquePool].sort(() => Math.random() - 0.5)
    selected = shuffled.slice(0, count)
  }

  // Record selected questions into seen memory
  for (const q of selected) {
    seenQuestionIds.add(q.id)
  }

  return selected
}
