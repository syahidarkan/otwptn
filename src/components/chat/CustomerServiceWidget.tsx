'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  X, Send, Sparkles, ShieldCheck, Mail, Bot
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-welcome-1',
    role: 'assistant',
    content:
      'Halo Pejuang PTN! Saya **Otbee CS**, asisten customer service resmi dari **OtwPTN** (PT. Lembaga Sains Nasional).\n\nAda yang ingin kamu ketahui seputar paket belajar, bimbingan mentor alumni, atau fitur Kalkulator Peluang & Review Essay kami?',
    timestamp: 'Baru saja',
  },
]

const QUICK_QUESTIONS = [
  'Berapa harga paket & fiturnya?',
  'Apa beda paket Nectar & Honeycomb?',
  'Cara kerja Kalkulator Peluang Rapor',
  'Gimana bimbingan essay sama mentor?',
  'Email resmi OtwPTN',
]

function formatChatText(content: string) {
  const paragraphs = content.split('\n\n')
  return (
    <div className="space-y-1.5">
      {paragraphs.map((p, pIdx) => {
        const parts = p.split(/(\*\*[^*]+\*\*)/g)
        return (
          <p key={pIdx} className="leading-relaxed">
            {parts.map((part, partIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={partIdx} className="font-extrabold text-inherit">
                    {part.slice(2, -2)}
                  </strong>
                )
              }
              return part
            })}
          </p>
        )
      })}
    </div>
  )
}

export default function CustomerServiceWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isOpening, setIsOpening] = useState(false) // Trigger sequence state
  const [openingPhase, setOpeningPhase] = useState<'idle' | 'body-appear' | 'salto' | 'card-emerge' | 'dissolve'>('idle')
  const [showTeaser, setShowTeaser] = useState(true)
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [isTyping, setIsTyping] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen])

  // Sequence: Head click -> body appear -> salto -> card emerge -> dissolve
  const handleOpenChat = () => {
    if (isOpening || isOpen) return
    setShowTeaser(false)
    setIsOpening(true)
    setOpeningPhase('body-appear')

    // Phase 1: Body attaches (0 - 180ms)
    setTimeout(() => {
      // Phase 2: Acrobatic salto (180ms - 550ms)
      setOpeningPhase('salto')
    }, 180)

    // Phase 3: White card emerges at apex (520ms)
    setTimeout(() => {
      setOpeningPhase('card-emerge')
    }, 520)

    // Phase 4: Mascot dissolves into card header (750ms)
    setTimeout(() => {
      setOpeningPhase('dissolve')
    }, 750)

    // Phase 5: Fully open (920ms)
    setTimeout(() => {
      setIsOpen(true)
      setIsOpening(false)
      setOpeningPhase('idle')
    }, 920)
  }

  const handleCloseChat = () => {
    setIsOpen(false)
    setIsOpening(false)
    setOpeningPhase('idle')
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim()
    if (!text || isTyping) return

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInputMessage('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/cs-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: nextMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      const replyContent =
        data.reply ||
        'Halo Kak! Otbee siap membantu informasi seputar OtwPTN. Silakan tanyakan seputar paket bimbingan atau hubungi email resmi kami di otwptn.com@gmail.com.'

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages(prev => [...prev, botMsg])
    } catch (err) {
      console.error('Chat error:', err)
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'Mohon maaf, terjadi kendala saat menghubungkan ke server CS. Kamu tetap bisa berkonsultasi langsung via email resmi kami di **otwptn.com@gmail.com**.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Do not render on full-screen editor workspace or admin
  if (pathname?.startsWith('/dashboard/essay/') || pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <>
      <style>{`
        @keyframes otbee-head-bob {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(2deg); }
        }
        @keyframes otbee-antenna-twitch {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04) rotate(-1deg); }
        }
        @keyframes otbee-salto-anim {
          0% { transform: translateY(0px) rotate(0deg) scale(1); opacity: 1; }
          20% { transform: translateY(12px) scaleX(1.25) scaleY(0.75); }
          50% { transform: translateY(-110px) rotate(190deg) scale(1.15); opacity: 1; }
          75% { transform: translateY(-90px) rotate(340deg) scale(1.05); opacity: 0.95; }
          90% { transform: translateY(-40px) rotate(360deg) scale(0.9); opacity: 0.7; }
          100% { transform: translateY(0px) rotate(360deg) scale(0.3); opacity: 0; }
        }
        @keyframes otbee-card-emerge-anim {
          0% { transform: scale(0.15) translateY(60px); opacity: 0; }
          65% { transform: scale(1.02) translateY(-6px); opacity: 1; }
          100% { transform: scale(1) translateY(0px); opacity: 1; }
        }
        @keyframes otbee-stardust-burst {
          0% { transform: scale(0.4) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.3) rotate(60deg); opacity: 1; }
          100% { transform: scale(1.6) rotate(120deg); opacity: 0; }
        }
      `}</style>

      <div id="cs-chat-widget" className="fixed z-30 bottom-5 right-5 sm:bottom-6 sm:right-6 font-sans">
        {/* Floating Teaser Callout */}
        {!isOpen && !isOpening && showTeaser && (
          <div className="hidden sm:block absolute bottom-[calc(100%+14px)] right-0 bg-white rounded-2xl p-3 shadow-xl border border-amber-200/90 w-64 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              onClick={() => setShowTeaser(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={12} />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                Otbee CS AI Aktif
              </span>
            </div>
            <p className="text-xs font-bold text-gray-800 leading-snug">
              Ada pertanyaan seputar OtwPTN & seleksi non-tes? Tanya AI kami yuk!
            </p>
          </div>
        )}

        {/* 1. RESTING STATE: Just the Head Icon (No neck, no body) */}
        {!isOpen && !isOpening && (
          <button
            onClick={handleOpenChat}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Buka Chatbot Customer Service"
            className="group relative flex items-center justify-center cursor-pointer transition-transform duration-200 active:scale-95"
            style={{
              width: '68px',
              height: '68px',
            }}
          >
            {/* Glowing Golden Ring Background */}
            <div
              className="absolute inset-0 rounded-full transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                boxShadow: isHovered
                  ? '0 10px 30px -4px rgba(245, 158, 11, 0.65), 0 0 20px rgba(251, 191, 36, 0.45)'
                  : '0 8px 24px -4px rgba(245, 158, 11, 0.45)',
                transform: isHovered ? 'scale(1.08)' : 'scale(1)',
              }}
            />

            {/* Inner Circular Frame cropping strictly to Otbee's HEAD (No neck/torso) */}
            <div
              className="relative w-14 h-14 rounded-full bg-gradient-to-b from-amber-50 to-amber-100/90 overflow-hidden border-2 border-white/95 shadow-inner flex items-center justify-center"
              style={{
                animation: 'otbee-head-bob 3.2s ease-in-out infinite',
              }}
            >
              <div
                className="relative w-16 h-16 pointer-events-none"
                style={{
                  marginTop: '12px', // Shift up so only head/goggles/eyes/antennae are framed
                  transform: 'scale(1.22)',
                }}
              >
                <Image
                  src="/mascot-hd/otbee-logo-head.png"
                  alt="Otbee Head"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain object-top"
                  priority
                  unoptimized
                />
              </div>
            </div>

            {/* Online Green Pulsing Indicator */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs animate-pulse" />

            {/* Tiny "Tanya CS" label badge below icon */}
            <span className="absolute -bottom-2 bg-amber-950/90 text-amber-300 text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-400/30 shadow-xs pointer-events-none whitespace-nowrap">
              Tanya CS
            </span>
          </button>
        )}

        {/* 2. THE ACROBATIC SALTO STAGE (When opening) */}
        {isOpening && (
          <div className="relative w-24 h-24 flex items-center justify-center pointer-events-none">
            {/* Stardust Burst at launch */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ animation: 'otbee-stardust-burst 0.7s ease-out forwards' }}
            >
              <span className="text-xl">✨</span>
              <span className="text-xl">⭐</span>
            </div>

            {/* Full Otbee Performing Salto */}
            <div
              className="relative w-24 h-24"
              style={{
                animation: 'otbee-salto-anim 0.85s cubic-bezier(0.25, 1, 0.5, 1) forwards',
              }}
            >
              <Image
                src="/mascot-hd/maskot-lolos-ptn-loncat.png"
                alt="Otbee Salto"
                width={96}
                height={96}
                className="w-full h-full object-contain"
                priority
                unoptimized
              />
            </div>
          </div>
        )}

        {/* 3. OPENED CHAT WINDOW (Emerged from the salto) */}
        {isOpen && (
          <div
            className="w-[350px] sm:w-[410px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden"
            style={{
              boxShadow: '0 25px 65px -12px rgba(0, 0, 0, 0.3), 0 0 25px rgba(245, 158, 11, 0.15)',
              transformOrigin: 'bottom right',
              animation: 'otbee-card-emerge-anim 0.35s cubic-bezier(0.34, 1.4, 0.64, 1) forwards',
            }}
          >
            {/* Header with 2D Illustrated Otbee CS Hero (No 3D canvas) */}
            <div className="relative bg-gradient-to-br from-amber-400 via-amber-300 to-amber-200/90 p-4 border-b border-amber-300/60 flex-shrink-0">
              {/* Top row: Status Badge & Close button */}
              <div className="flex items-center justify-between relative z-10 mb-2">
                <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/60 shadow-3xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-emerald-700" /> CS AI RESMI
                  </span>
                </div>
                <button
                  onClick={handleCloseChat}
                  className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center transition-all cursor-pointer shadow-3xs hover:scale-105 active:scale-95"
                  aria-label="Tutup Chat"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Middle row: Brand info on left + 2D Otbee CS Mascot Avatar on right */}
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-gray-950 tracking-tight leading-tight">
                    Customer Service OtwPTN
                  </h3>
                  <p className="text-[11px] font-bold text-amber-950/85 mt-1 line-clamp-1">
                    Asisten Pintar 24/7 Masuk Kampus
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-[9.5px] font-semibold text-amber-900/75">
                    <span className="truncate">otwptn.com@gmail.com</span>
                  </div>
                </div>

                {/* 2D Otbee CS Avatar Badge (Dissolved target from salto) */}
                <div
                  className="relative w-20 h-20 rounded-2xl bg-gradient-to-b from-white via-amber-50 to-amber-100/70 p-1 shadow-md border-2 border-white flex-shrink-0 overflow-hidden flex items-center justify-center"
                  style={{
                    animation: 'otbee-head-bob 3s ease-in-out infinite',
                  }}
                >
                  <Image
                    src="/mascot-hd/support-headset.png"
                    alt="Otbee CS 2D"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain filter drop-shadow-sm"
                    priority
                    unoptimized
                  />
                  <div className="absolute bottom-1 right-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block border-2 border-white shadow-xs" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick FAQ Suggestion Pills */}
            <div className="bg-amber-50/60 p-2.5 border-b border-amber-200/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isTyping}
                  className="px-3 py-1 rounded-full bg-white hover:bg-amber-100 text-gray-800 text-[10px] font-bold whitespace-nowrap shadow-3xs transition-colors cursor-pointer border border-amber-200/50"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gray-50/50">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-amber-100 p-0.5 flex-shrink-0 flex items-center justify-center shadow-3xs overflow-hidden">
                      <Image
                        src="/mascot-hd/otbee-logo-head.png"
                        alt="Otbee"
                        width={28}
                        height={28}
                        className="w-full h-full object-contain"
                        unoptimized
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-amber-400 text-amber-950 font-semibold rounded-tr-none shadow-xs'
                        : 'bg-white text-gray-800 font-medium rounded-tl-none border border-gray-100 shadow-xs'
                    }`}
                  >
                    {formatChatText(msg.content)}
                    <div
                      className={`mt-1.5 text-[9px] font-bold text-right ${
                        msg.role === 'user' ? 'text-amber-900/60' : 'text-gray-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-2.5 items-center">
                  <div className="w-7 h-7 rounded-full bg-amber-100 p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <Image
                      src="/mascot-hd/otbee-logo-head.png"
                      alt="Otbee"
                      width={28}
                      height={28}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="bg-white rounded-2xl p-3 rounded-tl-none border border-gray-100 shadow-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[10px] font-bold text-gray-400 ml-1">Otbee sedang mengetik...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input & Footer Controls */}
            <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tanyakan seputar OtwPTN, paket, atau SNBP..."
                  disabled={isTyping}
                  className="flex-1 px-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:border-amber-400 outline-none"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isTyping || !inputMessage.trim()}
                  className="w-9 h-9 rounded-full bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-amber-950 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 shadow-xs"
                  aria-label="Kirim Pesan"
                >
                  <Send size={15} />
                </button>
              </div>
              <div className="text-[9px] text-center text-gray-400 font-medium">
                CS AI khusus melayani panduan & paket bimbingan resmi OtwPTN
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
