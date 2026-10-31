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

// Transform Padanan Kata
const padananQuestions: QuizQuestion[] = padananData.map(item => ({
  id: item.id,
  category: 'PPU - Analogi & Padanan Kata',
  prompt: item.prompt,
  question: item.question,
  options: item.options,
  correctIndex: item.correctIndex,
  explanation: item.explanation,
}))

// Transform Baku atau Nggak into multiple choice
const bakuQuestions: QuizQuestion[] = bakuData.map(item => {
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
})

// Transform Benerin Kalimat into multiple choice
const kalimatQuestions: QuizQuestion[] = kalimatData.map(item => ({
  id: item.id,
  category: `PBM - ${item.category}`,
  prompt: `Perbaikan Kalimat (${item.category})`,
  question: `Perbaiki kata yang salah pada kalimat: "${item.sentence}"`,
  options: item.options,
  correctIndex: item.options.indexOf(item.correctOption) !== -1 ? item.options.indexOf(item.correctOption) : 0,
  explanation: item.explanation,
}))

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
