'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Compass,
  BookOpen,
  DollarSign,
  GraduationCap,
} from 'lucide-react'
import AuthGateModal from '@/components/auth/AuthGateModal'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const PRESET_QUESTIONS = [
  'Jalur mandiri non-tes mana saja yang tanpa uang pangkal (IPI)?',
  'Berapa rata-rata nilai rapor aman untuk lolos Kedokteran jalur non-tes?',
  'Apakah sertifikat Ketua OSIS bisa dipakai di PPKB UI dan SJP IPB?',
  'Apa bedanya seleksi SNBP dengan jalur PPKB UI & PBUB UGM?',
]

export default function TanyaOtbeePublicClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Halo pejuang PTN! Aku Otbee, AI konsultan resmi spesialis seleksi masuk PTN jalur mandiri & non-tes. Mau tanya tentang syarat nilai rapor, jalur tanpa uang pangkal, atau trik lolos PPKB UI dan PBUB UGM?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userQueryCount, setUserQueryCount] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim()
    if (!q || loading) return

    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: q }]
    setMessages(newMessages)
    setLoading(true)

    const nextCount = userQueryCount + 1
    setUserQueryCount(nextCount)

    try {
      const res = await fetch('/api/cs-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const botReply = data.reply || 'Maaf, Otbee sedang menyiapkan data terbaru. Coba lagi sebentar ya!'
        setMessages([...newMessages, { role: 'assistant', content: botReply }])

        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'otwptn_pending_chat',
              JSON.stringify({
                messages: [...newMessages, { role: 'assistant', content: botReply }],
                lastQuestion: q,
                timestamp: new Date().toISOString(),
              })
            )
          }
        } catch (e) {}

        if (nextCount >= 2) {
          setTimeout(() => {
            setIsModalOpen(true)
          }, 1200)
        }
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content:
              'Jaringan sedang padat. Yuk masuk atau daftar gratis di dashboard agar sesi konsultasi kita tersimpan dan tidak hilang!',
          },
        ])
        setIsModalOpen(true)
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Terjadi sedikit kendala koneksi. Silakan buka dashboard lengkap untuk konsultasi 24 jam bersama Otbee!',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenGate = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'otwptn_pending_chat',
          JSON.stringify({
            messages,
            timestamp: new Date().toISOString(),
          })
        )
      }
    } catch (e) {}
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-amber-300 selection:text-neutral-950">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-28 pb-10 px-4 sm:px-6 lg:px-8 border-b border-gray-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/70 via-amber-50/30 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300/80 text-amber-900 text-xs font-black uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            AI Konsultan Seleksi Mandiri & Non-Tes PTN #1
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Tanya Otbee: Konsultasi <span className="text-amber-500">Jalur Mandiri PTN</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Dapatkan jawaban akurat seputar syarat rapor, jadwal pendaftaran PPKB UI, PBUB UGM, SJP IPB, Golden Ticket UNAIR, hingga tips lolos tanpa tes tulis.
          </p>
        </div>
      </section>

      {/* Main Chat Interface */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="rounded-3xl bg-white border border-gray-200 shadow-xl overflow-hidden flex flex-col h-[580px]">
          {/* Chat Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center overflow-hidden relative shadow-3xs">
                <Image src="/mascot/otbee-icon.png" alt="Otbee" width={32} height={32} className="object-contain" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                  Otbee AI Konsultan
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">Online - Ahli SNBP & Seleksi Mandiri Non-Tes</p>
              </div>
            </div>

            <button
              onClick={handleOpenGate}
              className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-3xs transition-all cursor-pointer"
            >
              Simpan Obrolan
            </button>
          </div>

          {/* Chat Message History */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/40">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center flex-shrink-0 mt-1 shadow-3xs">
                    <Bot className="w-4 h-4 text-amber-700" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-amber-400 text-neutral-950 font-bold rounded-tr-none shadow-xs'
                      : 'bg-white text-gray-900 border border-gray-200 shadow-sm rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-amber-700" />
                </div>
                <div className="rounded-2xl rounded-tl-none bg-white border border-gray-200 p-4 text-xs text-gray-500 shadow-sm flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                  <span>Otbee sedang meracik jawaban terbaik...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Preset Chips */}
          <div className="p-3 border-t border-gray-150 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="whitespace-nowrap px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-900 text-[11px] font-medium border border-gray-200 transition-colors cursor-pointer flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input Field */}
          <div className="p-3 sm:p-4 border-t border-gray-150 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan prodi tujuan, syarat nilai, atau jalur mandiri..."
                disabled={loading}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:bg-white disabled:opacity-50 transition-all font-medium"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-all font-bold disabled:opacity-40 cursor-pointer active:scale-95 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Action Link to Full Dashboard Chat */}
        <div className="mt-6 text-center">
          <button
            onClick={handleOpenGate}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-amber-600 transition-colors cursor-pointer"
          >
            <span>Buka Riwayat Konsultasi & Tanya Sepuasnya di Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
          </button>
        </div>
      </section>

      {/* Auth Gate Modal Handover */}
      <AuthGateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Simpan Sesi Obrolan Bersama Otbee!"
        subtitle="Pertanyaan dan jawaban pentingmu sudah tersimpan. Masuk atau daftar gratis sekarang untuk melanjutkan konsultasi tanpa batas waktu."
        featureBadge="AI Konsultan Mandiri PTN"
        redirectPath="/dashboard/otbee"
        payloadPreview={[
          { label: 'Topik Bahasan', value: 'Konsultasi Jalur Mandiri & Rapor PTN' },
          { label: 'Status AI', value: 'Sesi Aktif & Tersimpan' },
        ]}
      />
    </div>
  )
}
