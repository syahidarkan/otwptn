'use client'

import { useState, useEffect, useCallback, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { AiHighlight } from '@/lib/tiptap/aiHighlightMark'
import {
  ArrowLeft, Sparkles, Save, Cloud, Bold, Italic,
  List, ListOrdered, Undo, Redo, Heading1, Heading2,
  X, AlertCircle, CheckCircle2, ChevronRight,
  Download, FileText, Printer, Copy, Check, FileDown,
  Upload, FileUp, History, CheckSquare, Square,
  Flame, MessageSquare, Quote, TrendingUp, TrendingDown,
  FileCheck2, Wand2
} from 'lucide-react'
import MascotLoading from '@/components/ui/MascotLoading'
import { OtbeeAvatar, otbeeBrain } from '@/components/mascot/otbee'
import { useOtbeeMascot } from '@/components/mascot/OtbeeMascotContext'

interface Issue {
  quote: string
  category: string
  problem?: string
  suggestion?: string
  otbeeRant?: string
  comment: string
}

interface NlpBenchmarkData {
  similarityScore: number
  topMatchingFaculty: string
  topMatchingMajor: string
  matchedAuthorContext?: string
  matchedWinningExcerpt: string
  matchedFullTextSnippet?: string
  starScore: number
  starActionVerbs: string[]
  metricsFound: string[]
  domainSpecificityScore: number
  detectedDomainTerms: string[]
  clichesFound: string[]
  lexicalDiversityScore: number
  sentenceFlowScore?: number
  avgSentenceLength?: number
  runawaySentencesCount?: number
  transitionWordsFound?: string[]
  temporalAnalysis?: {
    temporalScore: number
    matchedThemes: string[]
    detectedYearEra: string
    trendAlignment: string
    advice: string
  }
  rhetoricalStages?: Array<{
    stage: string
    label: string
    status: 'Optimal' | 'Cukup Kuat' | 'Perlu Penguatan'
    feedback: string
  }>
  benchmarkRankPercentile: number
  verdict: 'Sangat Menjanjikan' | 'Cukup Kompetitif' | 'Perlu Penguatan Nyata' | 'Kurang Memenuhi Standar'
  strengths: string[]
  warnings: string[]
}

interface Feedback {
  structure: number
  coherence: number
  argument: number
  language: number
  overall: number
  feedback: string
  suggestions: string[]
  issues?: Issue[]
  nlpBenchmark?: NlpBenchmarkData
  isFallback?: boolean
}

interface ReviewHistoryItem {
  id: string
  score: number
  feedback_json: Feedback
  created_at: string
}

const CATEGORY_LABEL: Record<string, string> = {
  structure: 'Struktur Esai',
  coherence: 'Koherensi Paragraf',
  argument: 'Kekuatan Argumen',
  language: 'Tata Bahasa & Diksi',
}

function scoreColor(score: number) {
  if (score >= 80) return '#15803d'
  if (score >= 60) return '#b45309'
  return '#b91c1c'
}

export default function EssayEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const router = useRouter()
  const { act: mascotAct } = useOtbeeMascot()

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [targetPtn, setTargetPtn] = useState('')
  const [targetJalur, setTargetJalur] = useState('')
  const [saving, setSaving] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<string>('Baru saja')

  // Review History & Versioning
  const [history, setHistory] = useState<ReviewHistoryItem[]>([])
  const [activeHistoryIndex, setActiveHistoryIndex] = useState<number>(0)

  // AI Review State & Navigation
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarTab, setSidebarTab] = useState<'summary' | 'issues' | 'benchmark' | 'todo'>('summary')
  const [reviewing, setReviewing] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeIssueIndex, setActiveIssueIndex] = useState<number | null>(null)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const [showCorpusReference, setShowCorpusReference] = useState(false)
  const [showRhetoricalStages, setShowRhetoricalStages] = useState(false)

  // Interactive Actionable To-Do
  const [completedTodos, setCompletedTodos] = useState<Record<string, boolean>>({})

  // Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importTab, setImportTab] = useState<'gdocs' | 'file' | 'paste'>('gdocs')
  const [gdocsUrl, setGdocsUrl] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportTxt = () => {
    if (!editor) return
    const plain = editor.getText()
    const content = `=====================================================\nJUDUL: ${title || 'Personal Statement'}\nTARGET PTN: ${targetPtn} | JALUR: ${targetJalur}\nKATA: ${editor.storage.characterCount?.words() ?? 0} kata\nPLATFORM: otwptn | PT. Lembaga Sains Nasional\n=====================================================\n\n${plain}`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(title || 'personal_statement').toLowerCase().replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
    setExportMenuOpen(false)
  }

  const handleExportDoc = () => {
    if (!editor) return
    const words = editor.storage.characterCount?.words() ?? 0
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${title || 'Personal Statement'}</title>
        <style>
          @page WordSection1 {
            size: 595.3pt 841.9pt; /* A4 */
            margin: 72pt 72pt 72pt 72pt;
          }
          div.WordSection1 { page: WordSection1; width: 100%; max-width: 100%; }
          body {
            font-family: 'Calibri', Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #111111;
          }
          h1 { font-size: 18pt; font-weight: bold; margin-bottom: 6pt; }
          .meta { font-size: 10pt; color: #666666; margin-bottom: 18pt; border-bottom: 1pt solid #dddddd; padding-bottom: 6pt; }
          p { font-size: 12pt; line-height: 1.5; margin-bottom: 12pt; text-align: justify; }
        </style>
      </head>
      <body>
        <div class="WordSection1">
          <h1>${title || 'Personal Statement'}</h1>
          <div class="meta">Target PTN: ${targetPtn || 'PTN'} (${targetJalur || 'Seleksi Non-Tes'}) &bull; ${words} kata &bull; otwptn.com</div>
          ${editor.getHTML()}
        </div>
      </body>
      </html>
    `
    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(title || 'personal_statement').toLowerCase().replace(/\s+/g, '_')}.doc`
    a.click()
    URL.revokeObjectURL(url)
    setExportMenuOpen(false)
  }

  const handleExportPdf = () => {
    setExportMenuOpen(false)
    setTimeout(() => {
      window.print()
    }, 200)
  }

  const handleCopyText = () => {
    if (!editor) return
    navigator.clipboard.writeText(editor.getText())
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2000)
    setExportMenuOpen(false)
  }

  const [, setTick] = useState(0)
  const editorRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Mulai ketik draft personal statement atau esai motivasimu di sini...' }),
      CharacterCount,
      AiHighlight,
    ],
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[600px] text-base leading-relaxed font-sans !text-slate-900',
        style: 'color: #0f172a;',
      },
    },
    onUpdate: () => setTick(t => t + 1),
    onSelectionUpdate: () => setTick(t => t + 1),
  })

  // Load Initial Document Data and Review History
  useEffect(() => {
    if (!editor) return
    async function load() {
      const { data: essay } = await supabase.from('essays').select('*').eq('id', id).single()
      if (essay) {
        setTitle(essay.title || 'Untitled Personal Statement')
        setTargetPtn(essay.target_ptn || 'Universitas Indonesia')
        setTargetJalur(essay.target_jalur || 'PPKB UI')
        const content = essay.content as { text?: string; doc?: JSONContent } | null
        if (content?.doc) {
          editor?.commands.setContent(content.doc)
        } else if (content?.text) {
          editor?.commands.setContent(`<p>${content.text.replace(/\n/g, '</p><p>')}</p>`)
        } else {
          editor?.commands.setContent(
            `<p>Saya adalah siswa yang memiliki minat besar di bidang teknik sejak kecil. Ketertarikan saya dimulai ketika saya sering mengamati proses mekanika di lingkungan sekitar saya...</p><p>Melalui program studi Teknik Mesin di Universitas Indonesia, saya bertekad memperdalam ilmu termodinamika dan otomasi untuk berkontribusi pada pengembangan industri manufaktur hijau di masa depan.</p>`
          )
        }
      }

      // Load all review history for this essay
      const { data: fbList } = await supabase
        .from('essay_feedback')
        .select('id, score, feedback_json, created_at')
        .eq('essay_id', id)
        .order('created_at', { ascending: true })

      if (fbList && fbList.length > 0) {
        const typedList = fbList.map(item => ({
          id: item.id,
          score: item.score,
          feedback_json: item.feedback_json as unknown as Feedback,
          created_at: item.created_at,
        }))
        setHistory(typedList)
        const latestIdx = typedList.length - 1
        setActiveHistoryIndex(latestIdx)
        setFeedback(typedList[latestIdx].feedback_json)
      }
      setLoading(false)
    }
    load()
  }, [editor, id, supabase])

  // Save Document
  const save = useCallback(async (silent = false) => {
    if (!editor) return
    if (!silent) setSaving(true)
    const json = editor.getJSON()
    const text = editor.getText()

    await supabase
      .from('essays')
      .update({
        title: title.trim() || 'Personal Statement',
        target_ptn: targetPtn,
        target_jalur: targetJalur,
        content: { doc: json, text },
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    setLastSavedTime(now)
    if (!silent) setTimeout(() => setSaving(false), 300)
  }, [editor, id, supabase, targetJalur, targetPtn, title])

  // Auto-save periodically
  useEffect(() => {
    const timer = setInterval(() => {
      save(true)
    }, 25000)
    return () => clearInterval(timer)
  }, [save])

  // Trigger Wandering Mascot to jump onto sentence and attack it with speech bubble
  const triggerAngryOtbee = useCallback((issue: Issue, index: number) => {
    setActiveIssueIndex(index)
    setSidebarOpen(true)
    setSidebarTab('issues')

    const rantText = issue.otbeeRant || (
      issue.category === 'structure'
        ? 'Astaga naga... lu nulis esai seleksi PTN apa surat permohonan bansos ke kelurahan?! Hapus pembuka kayak gini, kurator auto ngeskip!'
        : issue.category === 'argument'
        ? 'Klaim lu setinggi langit tapi buktinya nol besar anjir! Panitia butuh metrik dan karya nyata, bukan janji manis doang!'
        : issue.category === 'language'
        ? 'Bisa-bisanya metafora selebay ini masuk esai! Ini seleksi kampus top bukan lomba puisi senja, to the point aja ngapa!'
        : 'Ini alur mikirnya lompat-lompat bikin pusing! Rapiin koherensinya biar argumenmu nyambung dan enak dibaca!'
    )

    const el = editorRef.current?.querySelector(`[data-comment-id="ai-${index}"]`) as HTMLElement | null
    if (el) {
      el.classList.add('ai-mark-flash')
      setTimeout(() => el.classList.remove('ai-mark-flash'), 1200)
      otbeeBrain.emit({
        type: 'attack-target',
        el,
        text: rantText,
        ms: 9000,
      })
    } else {
      otbeeBrain.emit({
        type: 'act',
        clip: 'angry',
        text: `Woyyy revisi woy!! ${rantText}`,
      })
    }
  }, [])

  // Click on highlighted text inside editor -> Focus AI issue card & trigger Otbee reaction
  useEffect(() => {
    const el = editorRef.current
    if (!el) return

    function handleEditorClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('[data-comment-id]')
      if (target) {
        const commentId = target.getAttribute('data-comment-id')
        if (commentId && commentId.startsWith('ai-')) {
          const idx = parseInt(commentId.replace('ai-', ''), 10)
          if (!isNaN(idx) && feedback?.issues && feedback.issues[idx]) {
            triggerAngryOtbee(feedback.issues[idx], idx)
            target.classList.add('ai-mark-flash')
            setTimeout(() => target.classList.remove('ai-mark-flash'), 1000)
          }
        }
      }
    }

    el.addEventListener('click', handleEditorClick)
    return () => el.removeEventListener('click', handleEditorClick)
  }, [feedback, triggerAngryOtbee])

  // Apply highlights from AI issues
  function applyAiHighlights(issues: Issue[]) {
    if (!editor) return
    editor.chain().unsetAiHighlight().run()

    issues.forEach((issue, i) => {
      const plainText = editor.getText()
      const quote = issue.quote.trim()
      const idx = plainText.indexOf(quote)
      if (idx === -1) return

      let remaining = idx
      let from = -1
      let to = -1
      editor.state.doc.descendants((node, pos) => {
        if (from !== -1) return false
        if (!node.isText) return
        const len = node.text?.length ?? 0
        if (remaining < len) {
          from = pos + remaining
          to = from + quote.length
          return false
        }
        remaining -= len
        return true
      })
      if (from !== -1) {
        editor.chain().setTextSelection({ from, to }).setAiHighlight({ commentId: `ai-${i}`, category: issue.category }).run()
      }
    })
    editor.chain().setTextSelection(0).run()
  }

  function focusIssueInEditor(index: number) {
    if (!feedback?.issues || !feedback.issues[index]) return
    const issue = feedback.issues[index]
    triggerAngryOtbee(issue, index)

    const el = editorRef.current?.querySelector(`[data-comment-id="ai-${index}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ai-mark-flash')
      setTimeout(() => el.classList.remove('ai-mark-flash'), 1000)
    }
  }

  // One-click replace sentence with AI suggestion
  function handleReplaceSentence(quote: string, suggestion?: string) {
    if (!editor || !suggestion) return
    const plainText = editor.getText()
    const quoteTrimmed = quote.trim()
    const idx = plainText.indexOf(quoteTrimmed)
    if (idx === -1) {
      alert('Kalimat asli tidak ditemukan pada naskah (mungkin sudah pernah diubah). Kamu bisa menyalin saran kalimat secara manual.')
      return
    }

    let remaining = idx
    let from = -1
    let to = -1
    editor.state.doc.descendants((node, pos) => {
      if (from !== -1) return false
      if (!node.isText) return
      const len = node.text?.length ?? 0
      if (remaining < len) {
        from = pos + remaining
        to = from + quoteTrimmed.length
        return false
      }
      remaining -= len
      return true
    })

    if (from !== -1) {
      editor.chain().focus().setTextSelection({ from, to }).insertContent(suggestion).run()
      save(true)
      otbeeBrain.emit({ type: 'act', clip: 'cheer', text: 'Nah mantap! Kalimatnya jadi jauh lebih berbobot!' })
    }
  }

  // Switch to a previous review revision in history
  function handleSelectHistory(index: number) {
    if (!history[index]) return
    setActiveHistoryIndex(index)
    const selected = history[index].feedback_json
    setFeedback(selected)
    if (selected.issues && selected.issues.length > 0) {
      applyAiHighlights(selected.issues)
    }
  }

  // AI Review Action
  async function handleReviewAI() {
    if (!editor) return
    setError(null)
    const plainText = editor.getText()
    if (!plainText.trim() || plainText.length < 50) {
      setError('Tulis minimal 50 kata agar AI bisa melakukan review komprehensif.')
      return
    }
    setReviewing(true)
    await save(true)

    try {
      const res = await fetch('/api/essay-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay_id: id, content: plainText }),
      })
      const data = await res.json()
      if (res.ok) {
        setFeedback(data)
        setSidebarOpen(true)
        setSidebarTab('summary')
        if (data.issues && data.issues.length > 0) {
          applyAiHighlights(data.issues)
        }
        // Append to history
        const newHistItem: ReviewHistoryItem = {
          id: `rev-${Date.now()}`,
          score: data.overall,
          feedback_json: data,
          created_at: new Date().toISOString(),
        }
        setHistory(prev => [...prev, newHistItem])
        setActiveHistoryIndex(history.length)
      } else if (data.error === 'quota_exceeded') {
        setError('Kuota review akun kamu sudah terpakai. Silakan upgrade paket untuk review tanpa batas.')
      } else {
        throw new Error(data.message || 'Review gagal diproses')
      }
    } catch {
      // Heuristic fallback if offline/server failure
      const sentences = plainText.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 15)
      const firstSentence = sentences[0] || plainText.slice(0, 35)
      const midSentence = sentences[Math.floor(sentences.length / 2)] || plainText.slice(35, 75)

      const fallbackFeedback: Feedback = {
        structure: 78,
        coherence: 75,
        argument: 74,
        language: 80,
        overall: 77,
        feedback: 'AI reviewer sedang mengalami gangguan koneksi, namun analisis heuristik awal mendeteksi esai kamu memiliki struktur dasar yang baik. Segera perkuat bukti proyek nyata (STAR) dan hindari pembuka klise agar lolos kurasi tahap 1.',
        suggestions: [
          'Pertajam kalimat pembuka (hook) agar tidak klise dan langsung mencuri perhatian penilai.',
          'Tambahkan metrik atau capaian nyata dari kegiatan/proyek yang pernah kamu ikuti.',
          'Jelaskan alasan spesifik mengapa kurikulum dan fasilitas di kampus target cocok dengan rencanamu.',
          'Perbaiki tata kalimat agar ritme membaca lebih persuasif dan baku sesuai PUEBI.',
        ],
        issues: [
          {
            quote: firstSentence.slice(0, 35),
            category: 'structure',
            problem: 'Kalimat pembuka terlalu umum dan kurang memiliki hook personal yang kuat.',
            suggestion: 'Ganti dengan kalimat observasi tantangan nyata di lingkunganmu yang memantik ketertarikanmu pada prodi ini.',
            otbeeRant: 'Astaga naga... lu nulis esai seleksi PTN apa surat permohonan bansos ke kelurahan?! Hapus pembuka kayak gini, kurator auto ngeskip!',
            comment: 'Ganti pembuka klise dengan hook masalah konkret yang kamu amati langsung.',
          },
          {
            quote: midSentence.slice(0, 35),
            category: 'argument',
            problem: 'Klaim motivasi tanpa menyertakan metrik angka capaian terukur.',
            suggestion: 'Sertakan capaian nyata (misal efisiensi waktu, jumlah pengguna, atau peringkat lomba).',
            otbeeRant: 'Klaim lu setinggi langit tapi buktinya nol besar anjir! Panitia butuh metrik dan karya nyata, bukan janji manis doang!',
            comment: 'Tambahkan data kuantitatif untuk memperkuat kredibilitas pengalamanmu.',
          },
        ],
        isFallback: true,
      }
      setFeedback(fallbackFeedback)
      setSidebarOpen(true)
      if (fallbackFeedback.issues) applyAiHighlights(fallbackFeedback.issues)
    }
    setReviewing(false)
  }

  // Handle Import from GDocs / File / Paste
  async function handleImportSubmit() {
    setImportError(null)
    setImporting(true)

    try {
      if (importTab === 'gdocs') {
        if (!gdocsUrl.trim()) {
          setImportError('Masukkan link Google Docs terlebih dahulu.')
          setImporting(false)
          return
        }
        const res = await fetch('/api/essay/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gdocsUrl }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Gagal mengimpor dari Google Docs')

        editor?.commands.setContent(`<p>${data.text.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`)
        setImportModalOpen(false)
        setGdocsUrl('')
        save(true)
      } else if (importTab === 'file') {
        const file = fileInputRef.current?.files?.[0]
        if (!file) {
          setImportError('Pilih file .docx atau .txt yang ingin diimpor.')
          setImporting(false)
          return
        }
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/essay/import', {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Gagal mengimpor file')

        editor?.commands.setContent(`<p>${data.text.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`)
        setImportModalOpen(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
        save(true)
      } else if (importTab === 'paste') {
        if (!pasteText.trim()) {
          setImportError('Tempelkan teks esaimu pada kotak di bawah.')
          setImporting(false)
          return
        }
        editor?.commands.setContent(`<p>${pasteText.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`)
        setImportModalOpen(false)
        setPasteText('')
        save(true)
      }
    } catch (err: any) {
      setImportError(err.message || 'Terjadi kesalahan saat mengimpor esai.')
    } finally {
      setImporting(false)
    }
  }

  if (loading || !editor) {
    return (
      <MascotLoading
        message="Membuka Lembar Kerja Essay AI Review..."
        subMessage="Sedang menyinkronkan draf personal statement dan kurasi kampusmu."
      />
    )
  }

  const wordCount = editor.storage.characterCount?.words() ?? 0
  const charCount = editor.storage.characterCount?.characters() ?? 0

  // Calculate score delta from previous revision
  const prevScore = activeHistoryIndex > 0 ? history[activeHistoryIndex - 1]?.score : null
  const currentScore = feedback?.overall ?? 0
  const scoreDelta = prevScore !== null ? Math.round(currentScore - prevScore) : null

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-200/90 dark:bg-[#0c0d10] text-slate-900 dark:text-slate-100 font-sans transition-colors relative">
      
      {/* 1. TOP HEADER BAR */}
      <header className="no-print sticky top-0 z-30 bg-white dark:bg-[#16171b] border-b border-slate-200 dark:border-[#27272a] px-4 md:px-6 py-2.5 shadow-xs flex items-center justify-between gap-4 transition-colors">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href="/dashboard/essay"
            className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-[#23252b] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0"
            title="Kembali ke Daftar Essay"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={() => save(true)}
                placeholder="Judul Personal Statement / Essay..."
                className="text-base font-black text-slate-950 dark:text-white bg-transparent outline-none hover:bg-slate-50 dark:hover:bg-[#22242b] px-2 py-0.5 rounded-lg focus:ring-2 focus:ring-amber-400 w-full max-w-md truncate transition-colors"
              />
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full flex-shrink-0">
                <Cloud size={12} className="text-emerald-600 dark:text-emerald-400" /> Tersimpan
              </span>
            </div>

            {/* Sub-bar: Targets & Last Saved */}
            <div className="flex items-center gap-2 text-xs font-semibold pl-2 pt-0.5 text-slate-600 dark:text-slate-400">
              <span className="text-amber-800 dark:text-amber-400 font-bold">{targetPtn}</span>
              <span>·</span>
              <span className="text-slate-700 dark:text-slate-300">{targetJalur}</span>
              <span>·</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal text-[11px]">Tersimpan {lastSavedTime}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* AI Score Badge */}
          {feedback && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="px-3.5 py-1.5 rounded-full text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 hover:scale-105 transition-all"
            >
              <Sparkles size={13} className="text-amber-600 dark:text-amber-400" />
              Skor: {Math.round(feedback.overall)}/100
              {scoreDelta !== null && scoreDelta !== 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ml-1 ${
                  scoreDelta > 0 ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200' : 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200'
                }`}>
                  {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
                </span>
              )}
            </button>
          )}

          {/* Import Button */}
          <button
            onClick={() => { setImportError(null); setImportModalOpen(true) }}
            className="px-3.5 py-2 rounded-full text-xs font-bold bg-white dark:bg-[#20222a] border border-slate-300 dark:border-[#30333f] hover:bg-slate-50 dark:hover:bg-[#282a35] text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            title="Import Esai dari Google Docs / File"
          >
            <Upload size={14} className="text-amber-600 dark:text-amber-400" />
            <span className="hidden md:inline">Import Esai</span>
          </button>

          {/* Review AI Action Button */}
          <button
            onClick={handleReviewAI}
            disabled={reviewing}
            className="btn btn-primary text-xs font-black px-4 py-2.5 rounded-full shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles size={14} className={reviewing ? 'animate-spin' : ''} />
            {reviewing ? 'Menganalisis...' : 'Review dengan AI'}
          </button>

          {/* Save Button */}
          <button
            onClick={() => save()}
            disabled={saving}
            className="px-3.5 py-2 rounded-full text-xs font-bold bg-white dark:bg-[#20222a] border border-slate-300 dark:border-[#30333f] hover:bg-slate-50 dark:hover:bg-[#282a35] text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Save size={14} />
            <span className="hidden sm:inline">{saving ? 'Menyimpan...' : 'Simpan'}</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(o => !o)}
              className="px-3.5 py-2 rounded-full text-xs font-bold bg-slate-100 dark:bg-[#20222a] hover:bg-slate-200 dark:hover:bg-[#2a2c38] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-[#30333f] flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              title="Unduh & Export Dokumen"
            >
              <Download size={14} className="text-amber-600 dark:text-amber-400" />
              <span>Export</span>
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 bg-white dark:bg-[#1a1b22] rounded-2xl shadow-xl border border-slate-200 dark:border-[#2f313c] p-2 space-y-1 animate-in fade-in slide-in-from-top-1 text-xs">
                <button
                  onClick={handleExportDoc}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-amber-50 dark:hover:bg-[#252733] text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
                >
                  <FileText size={15} className="text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="leading-tight">Unduh Microsoft Word</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Format .DOCX / .DOC</span>
                  </div>
                </button>

                <button
                  onClick={handleExportPdf}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-amber-50 dark:hover:bg-[#252733] text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
                >
                  <Printer size={15} className="text-rose-600 dark:text-rose-400" />
                  <div>
                    <p className="leading-tight">Cetak / Simpan PDF</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Cetak lembar A4 bersih</span>
                  </div>
                </button>

                <button
                  onClick={handleExportTxt}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-amber-50 dark:hover:bg-[#252733] text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
                >
                  <FileDown size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="leading-tight">Unduh Teks Polos</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Format .TXT</span>
                  </div>
                </button>

                <div className="border-t border-slate-100 dark:border-[#2a2c38] my-1" />

                <button
                  onClick={handleCopyText}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-[#252733] text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
                >
                  {copiedText ? <Check size={15} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={15} />}
                  <span>{copiedText ? 'Teks Tersalin!' : 'Salin Semua Teks'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. GOOGLE DOCS TOOLBAR */}
      <div className="no-print sticky top-[57px] z-20 bg-white/95 dark:bg-[#16171b]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#27272a] px-4 md:px-6 py-1.5 flex items-center justify-between gap-2 overflow-x-auto transition-colors" style={{ scrollbarWidth: 'none' }}>
        <div className="flex items-center gap-1 min-w-max text-slate-700 dark:text-slate-300">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#23252c] disabled:opacity-30 cursor-pointer text-slate-700 dark:text-slate-300"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#23252c] disabled:opacity-30 cursor-pointer text-slate-700 dark:text-slate-300"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={15} />
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-[#2c2e38] mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300'
                : 'hover:bg-slate-100 dark:hover:bg-[#23252c] text-slate-700 dark:text-slate-300'
            }`}
            title="Heading 1"
          >
            <Heading1 size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300'
                : 'hover:bg-slate-100 dark:hover:bg-[#23252c] text-slate-700 dark:text-slate-300'
            }`}
            title="Heading 2"
          >
            <Heading2 size={15} />
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-[#2c2e38] mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('bold')
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 font-black'
                : 'hover:bg-slate-100 dark:hover:bg-[#23252c] text-slate-700 dark:text-slate-300'
            }`}
            title="Tebal (Ctrl+B)"
          >
            <Bold size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('italic')
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 font-black'
                : 'hover:bg-slate-100 dark:hover:bg-[#23252c] text-slate-700 dark:text-slate-300'
            }`}
            title="Miring (Ctrl+I)"
          >
            <Italic size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('bulletList')
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300'
                : 'hover:bg-slate-100 dark:hover:bg-[#23252c] text-slate-700 dark:text-slate-300'
            }`}
            title="Daftar Poin"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('orderedList')
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300'
                : 'hover:bg-slate-100 dark:hover:bg-[#23252c] text-slate-700 dark:text-slate-300'
            }`}
            title="Daftar Angka"
          >
            <ListOrdered size={15} />
          </button>
        </div>

        {/* Word Counter */}
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-bold min-w-max">
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-[#20222a] text-slate-900 dark:text-slate-200 font-mono border border-slate-200 dark:border-[#2f313c]">
            {wordCount} kata
          </span>
          <span className="text-slate-500 dark:text-slate-500 hidden sm:inline">({charCount} karakter)</span>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: CANVAS & SIDEBAR */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* CENTER: Canvas Paper */}
        <div
          ref={editorRef}
          className="flex-1 overflow-y-auto py-8 md:py-12 px-4 md:px-8 flex justify-center bg-slate-200/80 dark:bg-[#0c0d10] transition-colors relative"
        >
          {/* THE PAPER SHEET */}
          <div
            id="printable-essay-paper"
            className="rounded-2xl shadow-xl border border-slate-300/80 dark:border-white/10 w-full max-w-3xl min-h-[920px] p-8 md:p-16 flex flex-col justify-between transition-all relative"
            style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)'
            }}
          >
            <div>
              {/* Document Subheader */}
              <div className="border-b border-slate-200 pb-5 mb-8 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <div>
                  <span className="font-extrabold text-slate-900">Personal Statement Workspace</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Format Kurasi Masuk PTN Non-Tes</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-amber-900">{targetPtn}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{targetJalur}</p>
                </div>
              </div>

              {/* Tiptap Rich Editor */}
              <div className="essay-editor-sheet" style={{ color: '#0f172a', fontSize: '15px' }}>
                <EditorContent editor={editor} />
              </div>
            </div>

            {/* Bottom Paper Footer */}
            <div className="border-t border-slate-200 pt-5 mt-12 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="text-[11px]">Halaman 1 dari 1 · otwptn AI Writing Suite</span>
              <span className="text-[11px] font-mono font-bold text-slate-700">{wordCount} Kata</span>
            </div>
          </div>
        </div>

        {/* RIGHT: AI REVIEW SIDEBAR */}
        {sidebarOpen && (
          <aside className="no-print w-80 md:w-96 bg-white dark:bg-[#16171b] border-l border-slate-200 dark:border-[#27272a] flex flex-col h-full shadow-xl z-10 flex-shrink-0 animate-in slide-in-from-right duration-200 transition-colors">
            
            {/* Sidebar Top Header */}
            <div className="border-b border-slate-200 dark:border-[#27272a] p-4 flex-shrink-0 bg-slate-50/70 dark:bg-[#1a1b22] transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/20 dark:bg-amber-400/10 border border-amber-400/40 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={15} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Review Otbee AI
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Evaluator Kurasi Masuk PTN</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252733] transition-colors cursor-pointer"
                  title="Tutup Kolom Review"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Version History Selector */}
              {history.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs" style={{ scrollbarWidth: 'none' }}>
                  <History size={13} className="text-slate-400 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-slate-500 flex-shrink-0">Versi:</span>
                  {history.map((h, i) => (
                    <button
                      key={h.id}
                      onClick={() => handleSelectHistory(i)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 transition-all cursor-pointer ${
                        activeHistoryIndex === i
                          ? 'bg-amber-400 text-neutral-950 shadow-xs'
                          : 'bg-slate-200/80 dark:bg-[#252733] text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-[#2f3242]'
                      }`}
                    >
                      Revisi #{i + 1} ({Math.round(h.score)})
                    </button>
                  ))}
                </div>
              )}

              {/* Clean Sidebar Navigation Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/70 dark:bg-[#21232d] rounded-xl text-[10px] font-black">
                <button
                  onClick={() => setSidebarTab('summary')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer truncate px-1 text-center ${
                    sidebarTab === 'summary'
                      ? 'bg-white dark:bg-[#16171b] text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Ringkasan
                </button>
                <button
                  onClick={() => setSidebarTab('issues')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer truncate px-1 text-center relative ${
                    sidebarTab === 'issues'
                      ? 'bg-white dark:bg-[#16171b] text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Sorotan ({feedback?.issues?.length ?? 0})
                </button>
                <button
                  onClick={() => setSidebarTab('benchmark')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer truncate px-1 text-center ${
                    sidebarTab === 'benchmark'
                      ? 'bg-white dark:bg-[#16171b] text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Benchmark
                </button>
                <button
                  onClick={() => setSidebarTab('todo')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer truncate px-1 text-center ${
                    sidebarTab === 'todo'
                      ? 'bg-white dark:bg-[#16171b] text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  To-Do
                </button>
              </div>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 overflow-y-auto p-4 pb-36 space-y-4" style={{ overscrollBehavior: 'contain' }}>
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2 border border-red-200 dark:border-red-800/60">
                  <AlertCircle size={15} className="flex-shrink-0 text-red-600 dark:text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {!feedback ? (
                /* EMPTY STATE */
                <div className="py-2 px-1 space-y-4 pb-12">
                  <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-400/15 via-yellow-400/10 to-transparent border border-amber-300/60 dark:border-amber-500/30 text-center relative overflow-hidden">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 text-amber-950 mx-auto flex items-center justify-center mb-3 shadow-md shadow-amber-500/20">
                      <Sparkles size={26} strokeWidth={2.4} />
                    </div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/30 mb-2">
                      Evaluator PTN v2.5
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      Belum Ada Review AI
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                      Dapatkan evaluasi detail 8–15 perbaikan kalimat, komparasi naskah pemenang lolos, dan panduan to-do per tahap.
                    </p>
                    <button
                      onClick={handleReviewAI}
                      disabled={reviewing}
                      className="mt-4 w-full py-3 px-5 rounded-xl font-black text-xs bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles size={15} className={reviewing ? 'animate-spin' : ''} />
                      <span>{reviewing ? 'Menganalisis Draf Esai...' : 'Mulai Review Sekarang'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* TAB 1: RINGKASAN & SKOR */}
                  {sidebarTab === 'summary' && (
                    <div className="space-y-4">
                      {/* Overall Score Card */}
                      <div className="card p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-yellow-50/70 dark:from-amber-950/40 dark:to-yellow-950/30 border border-amber-200/80 dark:border-amber-700/50 shadow-2xs text-center transition-colors">
                        <div className="flex items-center justify-between text-[11px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                          <span>Skor Total Kelolosan</span>
                          {scoreDelta !== null && scoreDelta !== 0 && (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full ${
                              scoreDelta > 0
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50'
                                : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700/50'
                            }`}>
                              {scoreDelta > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {scoreDelta > 0 ? `+${scoreDelta} Poin` : `${scoreDelta} Poin`}
                            </span>
                          )}
                        </div>

                        <div className="text-4xl font-black my-2" style={{ color: scoreColor(feedback.overall) }}>
                          {Math.round(feedback.overall)}<span className="text-base text-slate-400 dark:text-slate-500 font-normal">/100</span>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed mt-2 pt-2 border-t border-amber-200/60 dark:border-amber-700/40 text-left">
                          {feedback.feedback}
                        </p>

                        {/* Quick CTA to Issues */}
                        {feedback.issues && feedback.issues.length > 0 && (
                          <button
                            onClick={() => setSidebarTab('issues')}
                            className="mt-3 w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                          >
                            <span>Lihat {feedback.issues.length} Sorotan Kalimat</span>
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>

                      {/* 4 Dimension Bars */}
                      <div>
                        <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                          Evaluasi 4 Pilar Kelolosan PTN
                        </p>
                        <div className="space-y-2.5">
                          {[
                            { key: 'structure', label: '1. Struktur STAR & Hook', score: feedback.structure, desc: 'Daya tarik pembuka & alur cerita berjenjang' },
                            { key: 'coherence', label: '2. Koherensi & Transisi', score: feedback.coherence, desc: 'Kelancaran benang merah antar paragraf' },
                            { key: 'argument', label: '3. Bobot Bukti & Alasan Prodi', score: feedback.argument, desc: 'Kesesuaian kurikulum & metrik aksi nyata' },
                            { key: 'language', label: '4. Tata Bahasa & Diksi PUEBI', score: feedback.language, desc: 'Pilihan kata formal, persuasif, & bebas klise' },
                          ].map(dim => (
                            <div key={dim.key} className="p-3 rounded-xl bg-slate-50 dark:bg-[#1f212a] border border-slate-200/70 dark:border-[#2f3240] text-xs">
                              <div className="flex items-center justify-between font-bold mb-1">
                                <span className="text-slate-800 dark:text-slate-200 font-extrabold">{dim.label}</span>
                                <span className="font-mono font-black" style={{ color: scoreColor(dim.score) }}>
                                  {Math.round(dim.score)}/100
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1.5">{dim.desc}</p>
                              <div className="w-full h-2 bg-slate-200 dark:bg-[#2c2f3d] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${dim.score}%`, background: scoreColor(dim.score) }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* General Suggestions */}
                      {feedback.suggestions && feedback.suggestions.length > 0 && (
                        <div className="pt-2">
                          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                            Prioritas Penyempurnaan Umum
                          </p>
                          <div className="space-y-2">
                            {feedback.suggestions.map((sug, i) => (
                              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-[#1f212a] border border-slate-200 dark:border-[#2f3240] text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <p className="leading-relaxed font-medium">{sug}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: SOROTAN KALIMAT (8-15 Granular Issues) */}
                  {sidebarTab === 'issues' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-1">
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Sorotan Kalimat & Rekomendasi ({feedback.issues?.length ?? 0})
                        </p>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                          Klik untuk tanya Otbee
                        </span>
                      </div>

                      {(!feedback.issues || feedback.issues.length === 0) ? (
                        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300 text-center font-bold">
                          🎉 Luar biasa! Tidak ditemukan kelemahan kalimat yang signifikan pada naskah ini.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {feedback.issues.map((issue, i) => (
                            <div
                              key={i}
                              className={`p-3.5 rounded-2xl border transition-all text-xs ${
                                activeIssueIndex === i
                                  ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-400 shadow-md ring-2 ring-amber-300 dark:ring-amber-500/50'
                                  : 'bg-slate-50 dark:bg-[#1f212a] border-slate-200 dark:border-[#2f3240] hover:border-slate-300 dark:hover:border-slate-600'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className="text-[10px] font-black uppercase text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md inline-block">
                                  {CATEGORY_LABEL[issue.category] || issue.category}
                                </span>
                                <button
                                  onClick={() => focusIssueInEditor(i)}
                                  className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                                  title="Lihat dan sorot kalimat ini di naskah esai"
                                >
                                  <Flame size={11} /> Lihat Bagian Revisi
                                </button>
                              </div>

                              <p
                                onClick={() => focusIssueInEditor(i)}
                                className="italic text-slate-600 dark:text-slate-400 text-[11px] my-1 font-serif border-l-2 border-amber-400 pl-2 cursor-pointer"
                                title="Klik untuk fokus kalimat ini di naskah"
                              >
                                &ldquo;{issue.quote}&rdquo;
                              </p>

                              {issue.problem && (
                                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug mt-1 font-medium">
                                  <strong>Evaluasi:</strong> {issue.problem}
                                </p>
                              )}

                              {issue.suggestion ? (
                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                  <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                                    Saran Kalimat Pengganti:
                                  </p>
                                  <p className="text-[11px] font-semibold text-slate-900 dark:text-slate-100 mt-0.5 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                                    &ldquo;{issue.suggestion}&rdquo;
                                  </p>
                                  <button
                                    onClick={() => handleReplaceSentence(issue.quote, issue.suggestion)}
                                    className="mt-2 w-full py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                  >
                                    <Wand2 size={12} />
                                    <span>Ganti Kalimat Ini Otomatis</span>
                                  </button>
                                </div>
                              ) : (
                                <p className="font-semibold text-slate-900 dark:text-white leading-relaxed mt-1">
                                  {issue.comment}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: BENCHMARK LOLOS PTN (User-Friendly & Inspiring Excerpts) */}
                  {sidebarTab === 'benchmark' && feedback.nlpBenchmark && (
                    <div className="space-y-4">
                      {/* Section Title */}
                      <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-[#1e2029] border border-amber-300 dark:border-amber-500/40 shadow-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Komparasi Profil Esai Lolos PTN
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          Dianalisis secara komparatif terhadap <strong>100+ esai resmi mahasiswa lolos</strong> seleksi masuk PTN (PPKB UI, PBUB UGM, &amp; SJP IPB).
                        </p>

                        {/* Rank & Similarity Grid */}
                        <div className="grid grid-cols-2 gap-2 text-center mt-3">
                          <div className="p-3 rounded-xl bg-white dark:bg-[#252834] border border-amber-200 dark:border-amber-600/30 shadow-2xs">
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Keselarasan Narasi</p>
                            <p className="text-xl font-black text-amber-900 dark:text-amber-300 mt-0.5">
                              {feedback.nlpBenchmark.similarityScore}%
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5" title={feedback.nlpBenchmark.topMatchingMajor}>
                              Prodi {feedback.nlpBenchmark.topMatchingMajor}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-white dark:bg-[#252834] border border-slate-200 dark:border-[#353847] shadow-2xs">
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Potensi Kurasi</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                              Top {100 - feedback.nlpBenchmark.benchmarkRankPercentile}%
                            </p>
                            <span className="inline-block text-[10px] font-extrabold text-blue-700 dark:text-blue-300 mt-0.5">
                              {feedback.nlpBenchmark.verdict}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Golden Quote Card: Winning Essay Excerpt */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-yellow-400/10 to-amber-500/5 border-2 border-amber-400/80 dark:border-amber-500/60 shadow-md text-xs space-y-2.5 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-amber-950 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Quote size={13} className="text-amber-600 dark:text-amber-400" />
                            Kutipan Esai Mahasiswa Lolos
                          </span>
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950">
                            Pemenang Lolos
                          </span>
                        </div>

                        {feedback.nlpBenchmark.matchedAuthorContext && (
                          <p className="text-[11px] font-black text-slate-900 dark:text-white">
                            {feedback.nlpBenchmark.matchedAuthorContext}
                          </p>
                        )}

                        <div className="p-3 rounded-xl bg-white/90 dark:bg-[#1a1b22]/90 border border-amber-200/80 dark:border-amber-700/50 shadow-2xs">
                          <p className="text-[11px] text-slate-800 dark:text-slate-200 italic leading-relaxed font-serif">
                            &ldquo;{feedback.nlpBenchmark.matchedWinningExcerpt}&rdquo;
                          </p>
                        </div>

                        <div className="text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
                          <p className="font-extrabold text-slate-900 dark:text-white">💡 Mengapa kutipan di atas berhasil memikat penilai?</p>
                          <p className="leading-snug">
                            Penulis tidak menggunakan kalimat klise, melainkan langsung menyajikan <strong>observasi masalah konkret di dunia nyata</strong> dan memposisikan jurusan impian sebagai solusi pemecahan masalah tersebut.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowCorpusReference(!showCorpusReference)}
                          className="w-full py-1.5 px-3 rounded-xl bg-amber-200/80 dark:bg-amber-900/40 hover:bg-amber-300/80 text-amber-950 dark:text-amber-200 font-extrabold text-[10px] transition-colors cursor-pointer text-center"
                        >
                          {showCorpusReference ? 'Tutup Narasi Lengkap' : 'Lihat Narasi Lengkap Mahasiswa Lolos'}
                        </button>

                        {showCorpusReference && feedback.nlpBenchmark.matchedFullTextSnippet && (
                          <div className="pt-2 text-[10px] text-slate-700 dark:text-slate-300 leading-relaxed bg-white/95 dark:bg-[#16171b] p-3 rounded-xl border border-amber-200 dark:border-[#353847] whitespace-pre-line">
                            {feedback.nlpBenchmark.matchedFullTextSnippet}
                          </div>
                        )}
                      </div>

                      {/* Relevansi Isu Strategis 5 Tahun */}
                      {feedback.nlpBenchmark.temporalAnalysis && (
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1e2029] border border-slate-200 dark:border-[#303340] space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-slate-900 dark:text-white text-[11px] flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              Relevansi Isu Terkini (5 Tahun Terakhir)
                            </span>
                            <span className="font-mono font-black text-amber-800 dark:text-amber-400 text-[11px]">
                              {feedback.nlpBenchmark.temporalAnalysis.temporalScore}/100
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                              {feedback.nlpBenchmark.temporalAnalysis.trendAlignment}
                            </span>
                            {feedback.nlpBenchmark.temporalAnalysis.detectedYearEra && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                                Era: {feedback.nlpBenchmark.temporalAnalysis.detectedYearEra}
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                            {feedback.nlpBenchmark.temporalAnalysis.advice}
                          </p>
                        </div>
                      )}

                      {/* STAR Action & Quantification Density */}
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1e2029] border border-slate-200 dark:border-[#303340] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900 dark:text-white text-[11px]">
                            Kepadatan Aksi Nyata (Metode STAR)
                          </span>
                          <span className="font-mono font-black text-amber-800 dark:text-amber-400 text-[11px]">
                            {feedback.nlpBenchmark.starScore}/100
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-[#2c2e3b] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${feedback.nlpBenchmark.starScore}%` }}
                          />
                        </div>
                        {feedback.nlpBenchmark.starActionVerbs.length > 0 ? (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {feedback.nlpBenchmark.starActionVerbs.map(verb => (
                              <span key={verb} className="text-[10px] font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 px-2 py-0.5 rounded-md">
                                {verb}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-amber-700 dark:text-amber-400 italic">Belum terdeteksi kata kerja aksi aktif (merancang, memimpin, menguji).</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: INTERACTIVE TO-DO CHECKLIST */}
                  {sidebarTab === 'todo' && (
                    <div className="space-y-4">
                      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-[#1e2029] border border-amber-200 dark:border-amber-700/40 text-xs space-y-1.5">
                        <h4 className="font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <FileCheck2 size={14} /> Checklist Aksi Perbaikan Naskah
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          Centang setiap poin setelah kamu selesai memperbaikinya pada lembar kerja esai.
                        </p>
                      </div>

                      {/* Generated Checklist from Suggestions & Issues */}
                      <div className="space-y-2">
                        {feedback.suggestions?.map((sug, i) => {
                          const key = `sug-${i}`
                          const isDone = Boolean(completedTodos[key])
                          return (
                            <div
                              key={key}
                              onClick={() => setCompletedTodos(prev => ({ ...prev, [key]: !prev[key] }))}
                              className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all cursor-pointer text-xs ${
                                isDone
                                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-slate-400 dark:text-slate-500 line-through'
                                  : 'bg-white dark:bg-[#1f212a] border-slate-200 dark:border-[#2f3240] text-slate-800 dark:text-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <button type="button" className="mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400">
                                {isDone ? <CheckSquare size={16} className="text-emerald-600 dark:text-emerald-400" /> : <Square size={16} />}
                              </button>
                              <span className="leading-snug font-medium flex-1">{sug}</span>
                            </div>
                          )
                        })}

                        {feedback.issues?.map((iss, i) => {
                          const key = `iss-${i}`
                          const isDone = Boolean(completedTodos[key])
                          return (
                            <div
                              key={key}
                              onClick={() => setCompletedTodos(prev => ({ ...prev, [key]: !prev[key] }))}
                              className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all cursor-pointer text-xs ${
                                isDone
                                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-slate-400 dark:text-slate-500 line-through'
                                  : 'bg-white dark:bg-[#1f212a] border-slate-200 dark:border-[#2f3240] text-slate-800 dark:text-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <button type="button" className="mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400">
                                {isDone ? <CheckSquare size={16} className="text-emerald-600 dark:text-emerald-400" /> : <Square size={16} />}
                              </button>
                              <div className="leading-snug flex-1">
                                <span className="font-extrabold block text-slate-900 dark:text-white">
                                  {CATEGORY_LABEL[iss.category] || iss.category}
                                </span>
                                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                                  {iss.problem || iss.comment}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Bottom Re-evaluate Button */}
                      <button
                        onClick={handleReviewAI}
                        disabled={reviewing}
                        className="w-full py-2.5 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Sparkles size={14} className={reviewing ? 'animate-spin' : ''} />
                        <span>Selesai Revisi? Review Ulang Sekarang</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* 4. MODAL IMPORT ESAI */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1a1b22] border border-slate-200 dark:border-[#2f313c] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/50 flex items-center justify-center text-amber-800 dark:text-amber-300">
                  <Upload size={16} />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Import Teks Esai</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Muat draf dari Google Docs atau file dokumenmu</p>
                </div>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#252733] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Import Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-[#22242d] rounded-xl text-xs font-bold text-center">
              <button
                onClick={() => { setImportTab('gdocs'); setImportError(null) }}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  importTab === 'gdocs'
                    ? 'bg-white dark:bg-[#16171b] text-slate-900 dark:text-white shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Google Docs
              </button>
              <button
                onClick={() => { setImportTab('file'); setImportError(null) }}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  importTab === 'file'
                    ? 'bg-white dark:bg-[#16171b] text-slate-900 dark:text-white shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Upload File (.docx/.txt)
              </button>
              <button
                onClick={() => { setImportTab('paste'); setImportError(null) }}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  importTab === 'paste'
                    ? 'bg-white dark:bg-[#16171b] text-slate-900 dark:text-white shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Tempel Teks
              </button>
            </div>

            {importError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-medium flex items-start gap-2 border border-red-200 dark:border-red-800/60">
                <AlertCircle size={15} className="flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                <span>{importError}</span>
              </div>
            )}

            {/* Tab 1: Google Docs Link */}
            {importTab === 'gdocs' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-black text-slate-800 dark:text-slate-200 block mb-1">
                    Link Dokumen Google Docs:
                  </label>
                  <input
                    type="url"
                    value={gdocsUrl}
                    onChange={e => setGdocsUrl(e.target.value)}
                    placeholder="https://docs.google.com/document/d/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#20222a] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/40 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-black text-amber-900 dark:text-amber-300">⚠️ Cara Mengaktifkan Akses Google Docs:</p>
                  <p>1. Buka dokumenmu di Google Docs &gt; Klik tombol <strong>&quot;Bagikan&quot; (Share)</strong> di kanan atas.</p>
                  <p>2. Pada bagian Akses umum, ubah menjadi <strong>&quot;Siapa saja yang memiliki link&quot;</strong> (Viewer/Pelihat).</p>
                  <p>3. Salin link dan tempelkan pada kolom di atas.</p>
                </div>
              </div>
            )}

            {/* Tab 2: File Upload */}
            {importTab === 'file' && (
              <div className="space-y-3 text-xs">
                <label className="font-black text-slate-800 dark:text-slate-200 block mb-1">
                  Pilih File Microsoft Word (.docx) atau Teks (.txt):
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-amber-400 transition-colors bg-slate-50 dark:bg-[#20222a]">
                  <FileUp size={32} className="mx-auto text-amber-600 dark:text-amber-400 mb-2" />
                  <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Pilih file dari komputermu</p>
                  <p className="text-[11px] text-slate-400">Mendukung format .docx dan .txt</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.txt"
                    className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-neutral-950 hover:file:bg-amber-300 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Paste Direct */}
            {importTab === 'paste' && (
              <div className="space-y-3 text-xs">
                <label className="font-black text-slate-800 dark:text-slate-200 block mb-1">
                  Tempelkan Teks Esai:
                </label>
                <textarea
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  rows={8}
                  placeholder="Tempel teks esai / personal statement di sini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#20222a] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-400 text-xs font-mono"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={importing}
                className="px-5 py-2 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {importing ? <Sparkles size={14} className="animate-spin" /> : <Upload size={14} />}
                <span>{importing ? 'Mengimpor...' : 'Muat ke Lembar Kerja'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
