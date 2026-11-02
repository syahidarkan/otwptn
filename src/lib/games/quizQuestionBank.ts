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

  // Shuffle and slice
  return pool.sort(() => Math.random() - 0.5).slice(0, count)
}
