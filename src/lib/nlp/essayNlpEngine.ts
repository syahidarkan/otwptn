import { ACCEPTED_PPKB_CORPUS, BANNED_CLICHES, type AcceptedEssayPattern } from './ppkbAcceptedCorpus'

// Indonesian Stopwords for accurate NLP TF-IDF weighting
const INDO_STOPWORDS = new Set([
  'ada', 'adalah', 'adanya', 'adapun', 'agak', 'agar', 'akan', 'akankah', 'akhir', 'akhiri', 'akhirnya',
  'aku', 'akulah', 'amat', 'amatlah', 'anda', 'andalah', 'antar', 'antara', 'antaranya', 'apa', 'apaan',
  'apabila', 'apakah', 'apalagi', 'apatah', 'artinya', 'asal', 'asalkan', 'atas', 'atau', 'ataukah',
  'ataupun', 'awal', 'awalnya', 'bagai', 'bagaikan', 'bagaimana', 'bagaimanakah', 'bagaimanapun', 'bagi',
  'bagian', 'bahkan', 'bahwa', 'bahwasanya', 'baik', 'bakalan', 'banyak', 'banyaknya', 'bapak', 'beberapa',
  'begini', 'beginian', 'beginikah', 'beginilah', 'begitu', 'begitukah', 'begitulah', 'begitupun', 'bekerja',
  'belakang', 'belakangan', 'belum', 'belumlah', 'benar', 'benarkah', 'benarlah', 'berada', 'berakhir',
  'berakhirlah', 'berakhirnya', 'berapa', 'berapakah', 'berapalah', 'berapapun', 'berarti', 'berawal',
  'berbagai', 'berdatangan', 'beri', 'berikan', 'berikut', 'berikutnya', 'berjumlah', 'berkala', 'berkali',
  'berkata', 'berkehendak', 'berkeinginan', 'berkenaan', 'berlainan', 'berlalu', 'berlangsung', 'berlebihan',
  'bermacam', 'bermaksud', 'bermula', 'bersama', 'bersiap', 'bertanya', 'berturut', 'bertutur', 'berujar',
  'berupa', 'besar', 'betul', 'betulkah', 'biasa', 'biasanya', 'bila', 'bilakah', 'bisa', 'bisakah',
  'boleh', 'bolehlah', 'bolehkah', 'bukan', 'bukankah', 'bukanlah', 'bukannya', 'cara', 'caranya',
  'cukup', 'cukupkah', 'cukuplah', 'cuma', 'dahulu', 'dalam', 'dan', 'dapat', 'dari', 'daripada',
  'dekat', 'demi', 'demikian', 'demikianlah', 'dengan', 'depan', 'di', 'dia', 'diakhiri', 'diakhirinya',
  'dialah', 'diantara', 'diantaranya', 'diberi', 'diberikan', 'diberikannya', 'dibuat', 'dibuatnya',
  'didapat', 'didatangkan', 'digunakan', 'diibaratkan', 'diibaratkannya', 'diingat', 'diingatkan',
  'diinginkan', 'dijawab', 'dijelaskan', 'dijelaskannya', 'dikarenakan', 'dikatakan', 'dikatakannya',
  'dikerjakan', 'diketahui', 'diketahuinya', 'dikira', 'dilakukan', 'dilalui', 'dilihat', 'dimaksud',
  'dimaksudkan', 'dimaksudkannya', 'dimaksudnya', 'diminta', 'dimintai', 'dimisalkan', 'dimulai',
  'dimulailah', 'dimulainya', 'dimungkinkan', 'dini', 'dipastikan', 'diperbuat', 'diperbuatnya',
  'dipergunakan', 'diperkirakan', 'diperlihatkan', 'diperlukan', 'diperlukannya', 'dipersoalkan',
  'dipunyai', 'diri', 'dirinya', 'disampaikan', 'disebut', 'disebutkan', 'disebutkannya', 'disini',
  'disinilah', 'disitulah', 'ditambahkan', 'ditandaskan', 'ditanya', 'ditanyai', 'ditanyakan',
  'ditegaskan', 'ditemukan', 'ditentukan', 'ditentukannya', 'dituturkan', 'dituturkannya', 'diucapkan',
  'diucapkannya', 'diungkapkan', 'dong', 'dua', 'dulu', 'empat', 'enggak', 'enggaknya', 'entah',
  'entahlah', 'hal', 'hampir', 'hanya', 'hanyalah', 'hari', 'harus', 'haruslah', 'harusnya', 'hendak',
  'hendaklah', 'hendaknya', 'hingga', 'ia', 'ialah', 'ibarat', 'ibaratkan', 'ibaratnya', 'ibu', 'ikut',
  'ingat', 'ingin', 'inginkah', 'inginkan', 'ini', 'inikah', 'inilah', 'itu', 'itukah', 'itulah', 'jadi',
  'jadilah', 'jadinya', 'jangan', 'jangankan', 'janganlah', 'jauh', 'jawab', 'jawaban', 'jawabnya',
  'jelas', 'jelaskan', 'jelaslah', 'jelasnya', 'jika', 'jikalau', 'juga', 'jumlah', 'jumlahnya', 'justru',
  'kala', 'kalau', 'kalaulah', 'kalaupun', 'kalian', 'kami', 'kamilah', 'kamu', 'kamulah', 'kan',
  'kapan', 'kapankah', 'kapanpun', 'karena', 'karenanya', 'kasus', 'kata', 'katakan', 'katakanlah',
  'katanya', 'ke', 'keadaan', 'kebetulan', 'kecil', 'kedua', 'keduanya', 'keinginan', 'kelamaan',
  'kelihatan', 'kelihatannya', 'kelima', 'keluar', 'kembali', 'kemudian', 'kemungkinan', 'kemungkinannya',
  'kenapa', 'kepada', 'kepadanya', 'kesampaian', 'keseluruhan', 'keseluruhannya', 'keterlaluan',
  'ketika', 'khususnya', 'kini', 'kinilah', 'kira', 'kiranya', 'kita', 'kitalah', 'kurang', 'lagi',
  'lagian', 'lah', 'lain', 'lainnya', 'lalu', 'lama', 'lamanya', 'lanjut', 'lanjutnya', 'lebih',
  'lewat', 'lima', 'luar', 'macam', 'maka', 'makanya', 'makin', 'malah', 'malahan', 'mampu', 'mampukah',
  'mana', 'manakala', 'manalagi', 'masih', 'masihkah', 'masing', 'mau', 'maupun', 'melainkan',
  'melalui', 'melihat', 'melihatnya', 'memang', 'memastikan', 'memberi', 'memberikan', 'membuat',
  'memerlukan', 'memihak', 'meminta', 'memintakan', 'memisalkan', 'memperbuat', 'mempergunakan',
  'memperkirakan', 'memperlihatkan', 'mempersiapkan', 'mempersoalkan', 'mempertanyakan', 'mempunyai',
  'memulai', 'memungkinkan', 'menaiki', 'menandaskan', 'menanti', 'menantikan', 'menanya', 'menanyai',
  'menanyakan', 'mendapat', 'mendapatkan', 'mendatang', 'mendatangi', 'mendatangkan', 'menegaskan',
  'mengakhiri', 'mengapa', 'mengatakan', 'mengatakannya', 'mengenai', 'mengerjakan', 'mengetahui',
  'mengira', 'mengucapkan', 'mengucapkannya', 'mengungkapkan', 'menjadi', 'menjawab', 'menuju',
  'menunjuk', 'menunjuki', 'menunjukkan', 'menunjuknya', 'menurut', 'menurutnya', 'menuturkan',
  'menyampaikan', 'menyangkut', 'menyatakan', 'menyebutkan', 'menyeluruh', 'menyiapkan', 'merasa',
  'mereka', 'merekalah', 'merupakan', 'meski', 'meskipun', 'meyakini', 'meyakinkan', 'minta', 'mirip',
  'misal', 'misalkan', 'misalnya', 'mula', 'mulai', 'mulailah', 'mulanya', 'mungkin', 'mungkinkah',
  'nah', 'naik', 'namun', 'nanti', 'nantinya', 'nyaris', 'nyatanya', 'oleh', 'olehnya', 'pada',
  'padahal', 'padanya', 'pak', 'paling', 'panjang', 'pantas', 'para', 'pasti', 'pastilah', 'penting',
  'pentingnya', 'per', 'para', 'pernah', 'persoalan', 'pertama', 'pertanyaan', 'pihak', 'pihaknya',
  'pukul', 'pula', 'pun', 'punya', 'rasa', 'rasanya', 'rata', 'rupanya', 'saat', 'saatnya', 'saja',
  'sajalah', 'saling', 'sama', 'sampai', 'sanad', 'sangat', 'sangatlah', 'satu', 'saya', 'sayalah',
  'se', 'sebab', 'sebabnya', 'sebagai', 'sebagaimana', 'sebagainya', 'sebagian', 'sebaik', 'sebaiknya',
  'sebaliknya', 'sebanyak', 'sebegini', 'sebegitu', 'sebelum', 'sebelumnya', 'sebenarnya', 'seberapa',
  'sebesar', 'sebetulnya', 'sebisanya', 'sebuah', 'sebut', 'sebutlah', 'sebutnya', 'secara', 'secukupnya',
  'sedang', 'sedangkan', 'sedemikian', 'sedikit', 'sedikitnya', 'seenaknya', 'segala', 'segalanya',
  'segera', 'seharusnya', 'sehingga', 'seingat', 'sejak', 'sejauh', 'sejenak', 'sejumlah', 'sekadar',
  'sekadarnya', 'sekali', 'sekalian', 'sekaligus', 'sekalipun', 'sekarang', 'sekaranglah', 'sekecil',
  'seketika', 'sekiranya', 'sekitar', 'sekitarnya', 'sekurang', 'sela', 'selain', 'selaku', 'selalu',
  'selama', 'selamanya', 'selanjutnya', 'seluruh', 'seluruhnya', 'semacam', 'semakin', 'semampu',
  'semampunya', 'semasa', 'semasih', 'semata', 'semaunya', 'sementara', 'semisal', 'semisalnya',
  'sempat', 'semua', 'semuanya', 'semula', 'sendiri', 'sendirinya', 'seolah', 'seorang', 'sepanjang',
  'sepantasnya', 'sepantasnyalah', 'seperlunya', 'seperti', 'sepertinya', 'sepihak', 'sering', 'seringnya',
  'serta', 'serupa', 'sesaat', 'sesama', 'sesampai', 'sesegera', 'sesekali', 'seseorang', 'sesuatu',
  'sesuatunya', 'sesudah', 'sesudahnya', 'setelah', 'setempat', 'setengah', 'seterusnya', 'setiap',
  'setiba', 'setibanya', 'setidak', 'setidaknya', 'setinggi', 'seusai', 'sewaktu', 'siap', 'siapa',
  'siapakah', 'siapapun', 'sini', 'sinilah', 'suatu', 'sudah', 'sudahkah', 'sudahlah', 'supaya',
  'tadi', 'tadinya', 'tahu', 'tahun', 'tak', 'tambah', 'tambahnya', 'tampak', 'tampaknya', 'tandas',
  'tandasnya', 'tanpa', 'tanya', 'tanyakan', 'tanyanya', 'tapi', 'tegas', 'tegasnya', 'telah',
  'tempat', 'tengah', 'tentang', 'tentu', 'tentulah', 'tentunya', 'tepat', 'terakhir', 'terasa',
  'terbanyak', 'terdahulu', 'terdapat', 'terdiri', 'terhadap', 'terhadapnya', 'teringat', 'terjadi',
  'terjadilah', 'terjadinya', 'terkira', 'terlalu', 'terlebih', 'terlihat', 'termasuk', 'ternyata',
  'tersampaikan', 'tersebut', 'tersebutlah', 'tertentu', 'tertuju', 'terus', 'terutama', 'tetap',
  'tetapi', 'tiap', 'tiba', 'tidak', 'tidakkah', 'tidaklah', 'tidaknya', 'toh', 'waduh', 'wah',
  'wahai', 'waktu', 'waktunya', 'walau', 'walaupun', 'wong', 'yaitu', 'yakin', 'yakni', 'yang'
])

// STAR Action Verbs curated from winning student applications
const STAR_ACTION_VERBS = [
  'merancang', 'mengembangkan', 'membangun', 'menganalisis', 'menginisiasi',
  'mengorganisasi', 'mengoordinasikan', 'memimpin', 'meneliti', 'menguji',
  'mengoptimasi', 'mengimplementasikan', 'mendirikan', 'memublikasikan',
  'mempresentasikan', 'memenangkan', 'menjuarai', 'merumuskan', 'menyelesaikan',
  'menggagas', 'mengadvokasi', 'mentransformasi', 'mengintegrasikan',
  'mengevaluasi', 'membina', 'membimbing', 'mengedukasi', 'menggalang',
  'menghasilkan', 'mencetuskan', 'merintis', 'menginovasi', 'mengkaji'
]

export interface NlpAnalysisResult {
  similarityScore: number // 0-100 cosine similarity against 100 accepted PPKB UI corpus
  topMatchingFaculty: string
  topMatchingMajor: string
  matchedWinningExcerpt: string
  starScore: number // 0-100 STAR Action & Quantification Density
  starActionVerbs: string[]
  metricsFound: string[]
  domainSpecificityScore: number // 0-100
  detectedDomainTerms: string[]
  clichesFound: string[]
  lexicalDiversityScore: number // 0-100 (Type-Token Ratio)
  benchmarkRankPercentile: number // e.g. 84th percentile of applicants
  verdict: 'Sangat Menjanjikan' | 'Cukup Kompetitif' | 'Perlu Penguatan Nyata' | 'Kurang Memenuhi Standar'
  strengths: string[]
  warnings: string[]
}

// Helper: Tokenize and normalize text
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2)
}

// Helper: Get term frequency map
function getTermFrequencies(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>()
  for (const token of tokens) {
    if (!INDO_STOPWORDS.has(token)) {
      tf.set(token, (tf.get(token) || 0) + 1)
    }
  }
  return tf
}

// Compute Cosine Similarity between two term frequency vectors
function cosineSimilarity(tf1: Map<string, number>, tf2: Map<string, number>): number {
  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0

  for (const [, val] of tf1) {
    norm1 += val * val
  }
  for (const [, val] of tf2) {
    norm2 += val * val
  }

  if (norm1 === 0 || norm2 === 0) return 0

  for (const [key, val1] of tf1) {
    const val2 = tf2.get(key)
    if (val2) {
      dotProduct += val1 * val2
    }
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
}

// Pre-build term frequencies for all 100 corpus entries
const CORPUS_TF_MAPS = ACCEPTED_PPKB_CORPUS.map(entry => {
  const combinedText = [
    ...entry.keyVocabulary,
    ...entry.starIndicators,
    entry.winningExcerpt,
    entry.faculty,
    entry.major,
  ].join(' ')
  return {
    entry,
    tf: getTermFrequencies(tokenize(combinedText)),
  }
})

/**
 * Main NLP Analysis Function for Essay Review
 */
export function analyzeEssayWithNLP(essayText: string): NlpAnalysisResult {
  const normalized = essayText.toLowerCase()
  const tokens = tokenize(essayText)
  const userTf = getTermFrequencies(tokens)

  // 1. Cosine Similarity vs 100 Accepted PPKB UI Corpus
  let maxSim = 0
  let topMatch: AcceptedEssayPattern = ACCEPTED_PPKB_CORPUS[0]
  let totalSim = 0

  for (const { entry, tf } of CORPUS_TF_MAPS) {
    const sim = cosineSimilarity(userTf, tf)
    totalSim += sim
    if (sim > maxSim) {
      maxSim = sim
      topMatch = entry
    }
  }

  // Rescale cosine similarity into a standard 0-100 benchmark score
  // Typical text cosine similarity ranges between 0.10 and 0.45 for sparse domain vocabularies
  const scaledSimilarity = Math.min(
    98,
    Math.max(35, Math.round(maxSim * 140 + (tokens.length >= 350 ? 25 : 10)))
  )

  // 2. STAR Method Action Verbs & Metric Quantification
  const detectedActionVerbs: string[] = []
  for (const verb of STAR_ACTION_VERBS) {
    if (normalized.includes(verb)) {
      detectedActionVerbs.push(verb)
    }
  }

  // Detect quantitative metrics: percentages (e.g. 25%), counts, currency, rankings (juara 1, 100 orang)
  const metricRegex = /(\b\d+(?:[.,]\d+)?%|\b(?:juara|peringkat|top)\s+\d+|\b\d+\s+(?:orang|peserta|siswa|anggota|sekolah|responden|dokumen|artikel|data|jam|hari|minggu|bulan|tahun))/gi
  const metricsFound: string[] = []
  let match: RegExpExecArray | null
  while ((match = metricRegex.exec(essayText)) !== null) {
    if (!metricsFound.includes(match[0].trim()) && metricsFound.length < 8) {
      metricsFound.push(match[0].trim())
    }
  }

  // Calculate STAR score: action verbs weight 50%, quantitative proof weight 50%
  const verbScore = Math.min(50, detectedActionVerbs.length * 10)
  const metricScore = Math.min(50, metricsFound.length * 12.5)
  const starScore = Math.min(100, Math.max(30, verbScore + metricScore))

  // 3. Domain Vocabulary Specificity
  const detectedDomainTerms: string[] = []
  for (const term of topMatch.keyVocabulary) {
    if (normalized.includes(term.toLowerCase())) {
      detectedDomainTerms.push(term)
    }
  }
  // Check cross-faculty technical terms
  for (const entry of ACCEPTED_PPKB_CORPUS) {
    for (const term of entry.keyVocabulary) {
      if (normalized.includes(term.toLowerCase()) && !detectedDomainTerms.includes(term) && detectedDomainTerms.length < 10) {
        detectedDomainTerms.push(term)
      }
    }
  }

  const domainSpecificityScore = Math.min(
    96,
    Math.max(35, Math.round(detectedDomainTerms.length * 12 + 25))
  )

  // 4. Cliché phrase detector
  const clichesFound: string[] = []
  for (const cliche of BANNED_CLICHES) {
    if (normalized.includes(cliche)) {
      clichesFound.push(cliche)
    }
  }

  // 5. Lexical Diversity (Type-Token Ratio / TTR)
  const uniqueTokens = new Set(tokens.filter(t => !INDO_STOPWORDS.has(t)))
  const meaningfulTokensCount = tokens.filter(t => !INDO_STOPWORDS.has(t)).length
  const ttr = meaningfulTokensCount > 0 ? uniqueTokens.size / meaningfulTokensCount : 0
  const lexicalDiversityScore = Math.min(95, Math.max(40, Math.round(ttr * 110)))

  // 6. Overall Percentile Ranking Calculation
  // Weighted aggregate: Similarity (35%), STAR action (30%), Specificity (20%), Lexical (15%) - Cliche penalty
  const rawAggregate =
    scaledSimilarity * 0.35 +
    starScore * 0.30 +
    domainSpecificityScore * 0.20 +
    lexicalDiversityScore * 0.15 -
    clichesFound.length * 8

  const benchmarkRankPercentile = Math.min(99, Math.max(25, Math.round(rawAggregate)))

  // 7. Qualitative Verdict & Actionable Strengths/Warnings
  let verdict: NlpAnalysisResult['verdict'] = 'Kurang Memenuhi Standar'
  if (benchmarkRankPercentile >= 82) {
    verdict = 'Sangat Menjanjikan'
  } else if (benchmarkRankPercentile >= 68) {
    verdict = 'Cukup Kompetitif'
  } else if (benchmarkRankPercentile >= 50) {
    verdict = 'Perlu Penguatan Nyata'
  }

  const strengths: string[] = []
  const warnings: string[] = []

  if (detectedActionVerbs.length >= 3) {
    strengths.push(`Memiliki ${detectedActionVerbs.length} kata kerja aksi nyata (STAR), menunjukkan proaktifitas tinggi.`)
  }
  if (metricsFound.length >= 2) {
    strengths.push(`Didukung data kuantitatif konkret (${metricsFound.slice(0, 3).join(', ')}).`)
  }
  if (detectedDomainTerms.length >= 3) {
    strengths.push(`Penguasaan diksi prodi kuat selaras korpus ${topMatch.faculty}.`)
  }

  if (clichesFound.length > 0) {
    warnings.push(`Terdeteksi ${clichesFound.length} frasa pembuka klise ("${clichesFound[0]}") yang menurunkan keunikan esai di mata kurator.`)
  }
  if (detectedActionVerbs.length < 2) {
    warnings.push('Kurang kata kerja aksi metode STAR. Banyak klaim masih bersifat narasi pasif.')
  }
  if (metricsFound.length === 0) {
    warnings.push('Belum ada metrik angka atau bukti kuantitatif (contoh: persentase, jumlah orang, capaian lomba).')
  }
  if (tokens.length < 300) {
    warnings.push(`Panjang teks (${tokens.length} kata) masih di bawah batas aman korpus esai lolos PPKB (350-600 kata).`)
  }

  return {
    similarityScore: scaledSimilarity,
    topMatchingFaculty: topMatch.faculty,
    topMatchingMajor: topMatch.major,
    matchedWinningExcerpt: topMatch.winningExcerpt,
    starScore,
    starActionVerbs: detectedActionVerbs,
    metricsFound,
    domainSpecificityScore,
    detectedDomainTerms,
    clichesFound,
    lexicalDiversityScore,
    benchmarkRankPercentile,
    verdict,
    strengths,
    warnings,
  }
}
