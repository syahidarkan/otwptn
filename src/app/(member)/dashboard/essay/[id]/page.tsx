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
  Download, FileText, Printer, Copy, Check, FileDown
} from 'lucide-react'

interface Issue {
  quote: string
  category: string
  comment: string
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
}

const CATEGORY_LABEL: Record<string, string> = {
  structure: 'Struktur Esai',
  coherence: 'Koherensi Paragraf',
  argument: 'Kekuatan Argumen',
  language: 'Tata Bahasa',
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

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [targetPtn, setTargetPtn] = useState('')
  const [targetJalur, setTargetJalur] = useState('')
  const [saving, setSaving] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<string>('Baru saja')

  // AI Review State
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [reviewing, setReviewing] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeIssueIndex, setActiveIssueIndex] = useState<number | null>(null)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [copiedText, setCopiedText] = useState(false)

  const handleExportTxt = () => {
    if (!editor) return
    const plain = editor.getText()
    const content = `=====================================================\nJUDUL: ${title || 'Personal Statement'}\nTARGET PTN: ${targetPtn} | JALUR: ${targetJalur}\nKATA: ${editor.storage.characterCount?.words() ?? 0} kata\nPLATFORM: otwptn — PT. Lembaga Sains Nasional\n=====================================================\n\n${plain}`
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
      <head><meta charset='utf-8'><title>${title || 'Personal Statement'}</title>
      <style>
        body { font-family: 'Calibri', Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #111; margin: 1in; }
        h1 { font-size: 18pt; font-weight: bold; margin-bottom: 4pt; }
        .meta { font-size: 9pt; color: #555; margin-bottom: 24pt; border-bottom: 1px solid #ccc; padding-bottom: 8pt; }
        p { margin-bottom: 12pt; text-align: justify; }
      </style>
      </head>
      <body>
        <h1>${title || 'Personal Statement'}</h1>
        <div class="meta">Target PTN: ${targetPtn} (${targetJalur}) &bull; ${words} kata &bull; otwptn.id</div>
        ${editor.getHTML()}
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
        // ALWAYS crisp black font on white paper — never inverted by dark mode
        class: 'prose max-w-none focus:outline-none min-h-[600px] text-base leading-relaxed font-sans !text-slate-900',
        style: 'color: #0f172a;',
      },
    },
    onUpdate: () => setTick(t => t + 1),
    onSelectionUpdate: () => setTick(t => t + 1),
  })

  // Load Initial Document Data
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

      const { data: fb } = await supabase
        .from('essay_feedback')
        .select('feedback_json')
        .eq('essay_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (fb?.feedback_json) {
        const loadedFb = fb.feedback_json as unknown as Feedback
        setFeedback(loadedFb)
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

  // Click on highlighted text inside editor -> Focus AI issue card
  useEffect(() => {
    const el = editorRef.current
    if (!el) return

    function handleEditorClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('[data-comment-id]')
      if (target) {
        const commentId = target.getAttribute('data-comment-id')
        if (commentId && commentId.startsWith('ai-')) {
          const idx = parseInt(commentId.replace('ai-', ''), 10)
          if (!isNaN(idx)) {
            setActiveIssueIndex(idx)
            setSidebarOpen(true)
            target.classList.add('ai-mark-flash')
            setTimeout(() => target.classList.remove('ai-mark-flash'), 1000)
          }
        }
      }
    }

    el.addEventListener('click', handleEditorClick)
    return () => el.removeEventListener('click', handleEditorClick)
  }, [])

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
    setActiveIssueIndex(index)
    const el = editorRef.current?.querySelector(`[data-comment-id="ai-${index}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ai-mark-flash')
      setTimeout(() => el.classList.remove('ai-mark-flash'), 1000)
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
        if (data.issues && data.issues.length > 0) {
          applyAiHighlights(data.issues)
        }
      } else {
        setError(data.error || 'Gagal memproses review AI.')
      }
    } catch {
      setError('Terjadi kendala jaringan saat review AI.')
    }
    setReviewing(false)
  }

  if (loading || !editor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700">Membuka Lembar Kerja Essay AI Review...</p>
      </div>
    )
  }

  const wordCount = editor.storage.characterCount?.words() ?? 0
  const charCount = editor.storage.characterCount?.characters() ?? 0

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-200/90 text-slate-900 font-sans">
      
      {/* 1. TOP HEADER BAR: ALWAYS HIGH CONTRAST */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 md:px-6 py-2.5 shadow-xs flex items-center justify-between gap-4">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href="/dashboard/essay"
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors flex-shrink-0"
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
                className="text-base font-black text-slate-950 bg-transparent outline-none hover:bg-slate-50 px-2 py-0.5 rounded-lg focus:ring-2 focus:ring-amber-400 w-full max-w-md truncate"
                style={{ color: '#090d16' }}
              />
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex-shrink-0">
                <Cloud size={12} className="text-emerald-600" /> Tersimpan
              </span>
            </div>

            {/* Sub-bar: Targets & Last Saved */}
            <div className="flex items-center gap-2 text-xs font-semibold pl-2 pt-0.5 text-slate-600">
              <span className="text-amber-900 font-bold">{targetPtn}</span>
              <span>·</span>
              <span className="text-slate-700">{targetJalur}</span>
              <span>·</span>
              <span className="text-slate-400 font-normal text-[11px]">Tersimpan {lastSavedTime}</span>
            </div>
          </div>
        </div>

        {/* Right: AI Score Badge, Review AI & Save */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* AI Score Badge */}
          {feedback && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="px-3.5 py-1.5 rounded-full text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
              style={{ background: '#fef3c7', color: scoreColor(feedback.overall), border: '1px solid #fde68a' }}
            >
              <Sparkles size={13} className="text-amber-600" />
              Skor AI: {Math.round(feedback.overall)}/100
            </button>
          )}

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
            className="px-4 py-2 rounded-full text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Save size={14} />
            <span className="hidden sm:inline">{saving ? 'Menyimpan...' : 'Simpan'}</span>
          </button>

          {/* Export & Download Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(o => !o)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              title="Unduh & Export Dokumen"
            >
              <Download size={14} className="text-amber-700" />
              <span>Export</span>
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 animate-in fade-in slide-in-from-top-1 text-xs">
                <button
                  onClick={handleExportDoc}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-amber-50 text-slate-800 font-bold transition-colors cursor-pointer"
                >
                  <FileText size={15} className="text-blue-600" />
                  <div>
                    <p className="leading-tight">Unduh Microsoft Word</p>
                    <span className="text-[10px] text-slate-400 font-normal">Format .DOCX / .DOC</span>
                  </div>
                </button>

                <button
                  onClick={handleExportPdf}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-amber-50 text-slate-800 font-bold transition-colors cursor-pointer"
                >
                  <Printer size={15} className="text-rose-600" />
                  <div>
                    <p className="leading-tight">Cetak / Simpan PDF</p>
                    <span className="text-[10px] text-slate-400 font-normal">Cetak lembar A4 bersih</span>
                  </div>
                </button>

                <button
                  onClick={handleExportTxt}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-amber-50 text-slate-800 font-bold transition-colors cursor-pointer"
                >
                  <FileDown size={15} className="text-emerald-600" />
                  <div>
                    <p className="leading-tight">Unduh Teks Polos</p>
                    <span className="text-[10px] text-slate-400 font-normal">Format .TXT</span>
                  </div>
                </button>

                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={handleCopyText}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 text-slate-700 font-semibold transition-colors cursor-pointer"
                >
                  {copiedText ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                  <span>{copiedText ? 'Teks Tersalin!' : 'Salin Semua Teks'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. GOOGLE DOCS TOOLBAR: FORMATTING & WORD COUNT */}
      <div className="sticky top-[57px] z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-1.5 flex items-center justify-between gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex items-center gap-1 min-w-max text-slate-700">
          {/* Undo / Redo */}
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer text-slate-700"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer text-slate-700"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={15} />
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Heading Style buttons */}
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 1 }) ? 'bg-amber-100 text-amber-950' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Heading 1"
          >
            <Heading1 size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 2 }) ? 'bg-amber-100 text-amber-950' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Heading 2"
          >
            <Heading2 size={15} />
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Formatting: Bold, Italic, Lists */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('bold') ? 'bg-amber-100 text-amber-950 font-black' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Tebal (Ctrl+B)"
          >
            <Bold size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('italic') ? 'bg-amber-100 text-amber-950 font-black' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Miring (Ctrl+I)"
          >
            <Italic size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('bulletList') ? 'bg-amber-100 text-amber-950' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Daftar Poin"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('orderedList') ? 'bg-amber-100 text-amber-950' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Daftar Angka"
          >
            <ListOrdered size={15} />
          </button>
        </div>

        {/* Word Counter & Word Goal */}
        <div className="flex items-center gap-3 text-xs text-slate-600 font-bold min-w-max">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-900 font-mono border border-slate-200">
            {wordCount} kata
          </span>
          <span className="text-slate-500 hidden sm:inline">({charCount} karakter)</span>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: WHITE PAPER CANVAS & AI SIDEBAR */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* CENTER: Google Docs Clean White Paper Sheet Canvas */}
        <div
          ref={editorRef}
          className="flex-1 overflow-y-auto py-8 md:py-12 px-4 md:px-8 flex justify-center bg-slate-200/80"
        >
          {/* THE PAPER SHEET: ALWAYS PURE WHITE WITH PURE BLACK TEXT */}
          <div
            className="rounded-2xl shadow-xl border border-slate-300/80 w-full max-w-3xl min-h-[920px] p-8 md:p-16 flex flex-col justify-between transition-all"
            style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)'
            }}
          >
            <div>
              {/* Document Subheader / Meta Info */}
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

              {/* Tiptap Rich Editor Body: Enforce Pure Black Color */}
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

        {/* RIGHT: AI REVIEW RESULTS SIDEBAR */}
        {sidebarOpen && (
          <aside className="w-80 md:w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg z-10 flex-shrink-0 animate-in slide-in-from-right duration-200">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 flex-shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Hasil Review Otbee AI
                </h3>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
                title="Tutup Kolom Review"
              >
                <X size={16} />
              </button>
            </div>

            {/* TAB CONTENT: AI REVIEW RESULTS */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
                  <AlertCircle size={15} className="flex-shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {!feedback ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-3">
                    <Sparkles size={24} />
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Belum Ada Review AI</h4>
                  <p className="text-xs text-slate-500 mt-1.5 mb-5 max-w-xs mx-auto leading-relaxed">
                    Tulis esaimu di lembar dokumen, lalu klik &ldquo;Review dengan AI&rdquo; untuk mendapatkan evaluasi 4 dimensi seketika.
                  </p>
                  <button
                    onClick={handleReviewAI}
                    disabled={reviewing}
                    className="btn btn-primary text-xs font-black px-5 py-2.5 rounded-full shadow-sm"
                  >
                    {reviewing ? 'Menganalisis...' : 'Mulai Review Sekarang'}
                  </button>
                </div>
              ) : (
                <>
                  {/* Overall Score Card */}
                  <div className="card p-5 rounded-2xl bg-gradient-to-br from-amber-50/60 to-yellow-50/60 border border-amber-200/80 shadow-2xs text-center">
                    <p className="text-[11px] font-black text-amber-900 uppercase tracking-wider">
                      Skor Total Kelolosan
                    </p>
                    <div className="text-4xl font-black my-1.5" style={{ color: scoreColor(feedback.overall) }}>
                      {Math.round(feedback.overall)}<span className="text-base text-slate-400 font-normal">/100</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed mt-2 pt-2 border-t border-amber-200/60">
                      {feedback.feedback}
                    </p>
                  </div>

                  {/* 4 Dimension Bars */}
                  <div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2.5">
                      Analisis 4 Dimensi Esai
                    </p>
                    <div className="space-y-2.5">
                      {[
                        { key: 'structure', label: 'Struktur Esai', score: feedback.structure },
                        { key: 'coherence', label: 'Koherensi Paragraf', score: feedback.coherence },
                        { key: 'argument', label: 'Kekuatan Argumen', score: feedback.argument },
                        { key: 'language', label: 'Tata Bahasa & Diksi', score: feedback.language },
                      ].map(dim => (
                        <div key={dim.key} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                          <div className="flex items-center justify-between font-bold mb-1.5">
                            <span className="text-slate-800">{dim.label}</span>
                            <span className="font-mono font-black" style={{ color: scoreColor(dim.score) }}>
                              {Math.round(dim.score)}/100
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${dim.score}%`, background: scoreColor(dim.score) }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Highlighted Issues */}
                  {feedback.issues && feedback.issues.length > 0 && (
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2.5">
                        Sorotan Kalimat & Rekomendasi ({feedback.issues.length})
                      </p>
                      <div className="space-y-2.5">
                        {feedback.issues.map((issue, i) => (
                          <div
                            key={i}
                            onClick={() => focusIssueInEditor(i)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs ${
                              activeIssueIndex === i
                                ? 'bg-amber-50/70 border-amber-400 shadow-md ring-2 ring-amber-300'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md inline-block mb-1.5">
                              {CATEGORY_LABEL[issue.category] || issue.category}
                            </span>
                            <p className="italic text-slate-600 text-[11px] my-1 font-serif border-l-2 border-amber-400 pl-2">
                              &ldquo;{issue.quote}&rdquo;
                            </p>
                            <p className="font-semibold text-slate-900 leading-relaxed mt-1.5">
                              {issue.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* General Suggestions */}
                  {feedback.suggestions && feedback.suggestions.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                        Saran Penyempurnaan Umum
                      </p>
                      <div className="space-y-2">
                        {feedback.suggestions.map((sug, i) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="leading-relaxed font-medium">{sug}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
