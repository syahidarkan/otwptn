'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import {
  X, Send, ArrowLeft
} from 'lucide-react'
import { OtbeeAvatar, Otbee4KPuppet, type Otbee4KPuppetHandle, otbeeBrain } from '@/components/mascot/otbee'
import type { ClipName, OtbeeHandle } from '@/components/mascot/otbee'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

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
  const [stage, setStage] = useState(false) // the standing mascot is on screen (jump / salto / dissolve)
  const [view, setView] = useState<'welcome' | 'chat'>('welcome')
  const figRef = useRef<HTMLDivElement>(null)
  const figAvatar = useRef<OtbeeHandle>(null)
  const heroAvatarRef = useRef<Otbee4KPuppetHandle>(null)
  const openingRef = useRef(false)
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isShrinkingHead, setIsShrinkingHead] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const STORAGE_KEY = 'otwptn_cs_chat_messages'

  // Restore messages from sessionStorage on initial mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = sessionStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed)
          }
        }
      }
    } catch (e) {
      console.warn('[CS Chat] Failed to restore session messages:', e)
    }
  }, [])

  // Persist messages to sessionStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        if (messages.length > 0) {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
        } else {
          sessionStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch (e) {
      console.warn('[CS Chat] Failed to persist session messages:', e)
    }
  }, [messages])

  // Auto-scroll to bottom on new message or when viewing chat
  useEffect(() => {
    if (isOpen && view === 'chat' && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen, view])

  // Head icon click -> body grows out of the head -> jump + salto -> white card emerges from the body, body melts away
  const handleOpenChat = () => {
    if (openingRef.current || isOpen) return
    openingRef.current = true
    setStage(true)
    // wait one frame so the stage is mounted
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const fig = figRef.current
      figAvatar.current?.fx('smoke')
      fig?.animate([
        { transform: 'translateY(74px) scale(.42)', clipPath: 'inset(0 0 63% 0)', opacity: 0.2 },
        { transform: 'translateY(-10px) scale(1.04)', clipPath: 'inset(-60% -60% -10% -60%)', opacity: 1, offset: 0.7 },
        { transform: 'translateY(0) scale(1)', clipPath: 'inset(-60% -60% -10% -60%)', opacity: 1 },
      ], { duration: 460, easing: 'cubic-bezier(.3,1.3,.5,1)', fill: 'forwards' })
      setTimeout(() => {
        figAvatar.current?.fx('sparkle', -1)
        figAvatar.current?.play('salto', {
          speed: 1.4,
          onDone: () => {
            // card grows out of the standing body while the body dissolves into the card
            setIsOpen(true)
            otbeeBrain.emit({ type: 'cs-chat-open' })
            figAvatar.current?.fx('stars')
            fig?.animate([
              { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0px)' },
              { opacity: 0, transform: 'translateY(26px) scale(.35)', filter: 'blur(5px)' },
            ], { duration: 420, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' })
            setTimeout(() => { setStage(false); openingRef.current = false }, 460)
          },
        })
      }, 440)
    }))
  }

  const handleCloseChat = () => {
    setIsOpen(false)
    otbeeBrain.emit({ type: 'cs-chat-close' })
  }

  const handleBackToWelcome = () => {
    setView('welcome')
  }

  const handleResetChat = () => {
    setMessages([])
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    } catch {}
    setView('welcome')
  }

  // Native vector love reaction using mascot rig fx and shy blushing action
  const handleHeadLoveReaction = () => {
    heroAvatarRef.current?.fx('heart', 1)
    heroAvatarRef.current?.play('shy', {
      onDone: () => heroAvatarRef.current?.play('idle')
    })
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim()
    if (!text || isTyping) return

    if (view === 'welcome') {
      // Trigger the head shrinking animation from center into avatar position
      setIsShrinkingHead(true)
      setTimeout(() => {
        setView('chat')
        setIsShrinkingHead(false)
      }, 420)
    }

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
    otbeeBrain.emit({ type: 'cs-chat-user-message', text })
    otbeeBrain.emit({ type: 'cs-chat-typing' })

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
      otbeeBrain.emit({ type: 'cs-chat-bot-reply', text: replyContent })
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
        @keyframes otbee-card-emerge-anim {
          0% { transform: scale(.12); opacity: 0; border-radius: 60px; }
          55% { transform: scale(1.035); opacity: 1; border-radius: 28px; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes otbee-orb-pop {
          0% { transform: scale(.4); opacity: 0 }
          70% { transform: scale(1.08); opacity: 1 }
          100% { transform: scale(1) }
        }
        @keyframes otbee-shrink-to-avatar {
          0% {
            top: 42%;
            left: 50%;
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          45% {
            transform: translate(-50%, -50%) scale(0.65) rotate(-6deg);
            opacity: 0.95;
          }
          100% {
            top: 74px;
            left: 20px;
            transform: translate(0, 0) scale(0.23);
            opacity: 0.9;
          }
        }
      `}</style>

      <div id="cs-chat-widget" className="fixed z-30 bottom-5 right-5 sm:bottom-6 sm:right-6 font-sans">
        {/* 1. RESTING STATE: just Otbee's head (no neck, no body) */}
        {!isOpen && (
          <button
            onClick={handleOpenChat}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Buka Chatbot Customer Service"
            className="group relative flex items-center justify-center cursor-pointer active:scale-95"
            style={{
              width: '68px', height: '68px',
              opacity: stage ? 0 : 1, transform: stage ? 'scale(.7)' : undefined,
              transition: 'opacity .2s, transform .25s', pointerEvents: stage ? 'none' : 'auto',
              animation: 'otbee-orb-pop .45s cubic-bezier(.34,1.56,.64,1) both',
            }}
          >
            <div
              className="absolute inset-0 rounded-full transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                boxShadow: isHovered ? '0 10px 30px -4px rgba(245,158,11,.65), 0 0 20px rgba(251,191,36,.45)' : '0 8px 24px -4px rgba(245,158,11,.45)',
                transform: isHovered ? 'scale(1.08)' : 'scale(1)',
              }}
            />
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-b from-amber-50 to-amber-100/90 overflow-hidden border-2 border-white/95 shadow-inner flex items-center justify-center">
              <div style={{ transform: 'scaleX(-1)' }}>
                <Otbee4KPuppet
                  growthProgress={0}
                  size={44}
                  facing={-1}
                  followPointer={true}
                  paused={stage}
                />
              </div>
            </div>
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs animate-pulse" />
            <span className="absolute -bottom-2 bg-amber-950/90 text-amber-300 text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-400/30 shadow-xs pointer-events-none whitespace-nowrap">
              Tanya Otbee
            </span>
          </button>
        )}

        {/* 2. STAGE: the full body that grows out of the head, jumps, salto, then melts into the card */}
        {stage && (
          <div ref={figRef} className="pointer-events-none absolute" style={{ right: 6, bottom: 2, zIndex: 2, opacity: 0.2, transformOrigin: '50% 20%' }}>
            <OtbeeAvatar ref={figAvatar} view="front" size={176} />
          </div>
        )}

        {/* 3. OPENED CHAT WINDOW */}
        {isOpen && (
          <div
            className="w-[350px] sm:w-[410px] h-[590px] max-h-[88vh] bg-white rounded-[32px] shadow-2xl flex flex-col border border-gray-100 overflow-hidden relative"
            style={{
              boxShadow: '0 25px 65px -12px rgba(0, 0, 0, 0.3), 0 0 25px rgba(245, 158, 11, 0.15)',
              transformOrigin: 'calc(100% - 34px) calc(100% - 70px)',
              animation: 'otbee-card-emerge-anim 0.5s cubic-bezier(0.34, 1.3, 0.64, 1) forwards',
            }}
          >
            {/* Transient Shrinking Head (Animates when first message is sent from Welcome into Chat) */}
            {isShrinkingHead && (
              <div
                className="absolute pointer-events-none z-50 select-none"
                style={{
                  animation: 'otbee-shrink-to-avatar 0.42s cubic-bezier(0.2, 0.9, 0.3, 1) forwards',
                  transformOrigin: 'top left',
                }}
              >
                <Otbee4KPuppet growthProgress={0} size={145} followPointer={false} />
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 1: WELCOME SCREEN (Interactive Mascot & Quick Start)*/}
            {/* ======================================================== */}
            {view === 'welcome' ? (
              <div className="flex-1 flex flex-col justify-between p-5 select-none relative overflow-hidden bg-gradient-to-b from-white via-amber-50/20 to-white">
                {/* Top Bar with active badge if returning from chat, and Close button */}
                <div className="flex items-center justify-between">
                  {messages.length > 0 ? (
                    <span className="text-[10px] font-bold text-amber-900/70 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200/60 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Chat Aktif ({messages.length} pesan)
                    </span>
                  ) : <span />}
                  <button
                    onClick={handleCloseChat}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-all cursor-pointer"
                    aria-label="Tutup Chat"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Big Title */}
                <div className="text-center pt-1 pb-1">
                  <h2 className="text-[25px] sm:text-[27px] font-black text-gray-950 tracking-tight leading-[1.18]">
                    Your{' '}
                    <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 bg-clip-text text-transparent">
                      Smart Assistant
                    </span>
                    <br />
                    for Any Tasks
                  </h2>
                </div>

                {/* Center Mascot Head: Large, Interactive with cursor & native love reaction */}
                <div className="relative flex flex-col items-center justify-center py-2 my-auto">
                  {/* Speech Bubble "Hello!" */}
                  <div className="absolute -top-1 left-8 sm:left-14 z-20 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-2xl shadow-md border border-gray-100 text-xs font-black text-gray-800 animate-bounce">
                    Hello!
                    <span className="absolute -bottom-1 left-3.5 w-2.5 h-2.5 bg-white border-r border-b border-gray-100 rotate-45" />
                  </div>

                  {/* Soft Glowing Orb Background */}
                  <div className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-amber-300/35 via-amber-400/25 to-pink-300/20 blur-2xl -z-10" />

                  {/* Interactive Head */}
                  <div
                    onClick={handleHeadLoveReaction}
                    className="cursor-pointer transition-transform hover:scale-105 active:scale-95 relative flex items-center justify-center"
                    title="Klik kepala Otbee!"
                  >
                    <Otbee4KPuppet
                      ref={heroAvatarRef}
                      growthProgress={0}
                      size={86}
                      followPointer
                    />
                  </div>

                  {/* Subtitle */}
                  <p className="text-xs font-semibold text-gray-500 text-center max-w-[250px] leading-relaxed mt-2">
                    Get instant help and support with any task or problem
                  </p>

                  {/* If there are existing messages in session, show continue action */}
                  {messages.length > 0 && (
                    <div className="w-full max-w-[290px] mt-2.5 flex flex-col gap-1 items-center animate-in fade-in zoom-in-95 duration-200">
                      <button
                        onClick={() => setView('chat')}
                        className="w-full py-2 px-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-105 text-amber-950 font-black text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                          <span>Lanjutkan Percakapan ({messages.length})</span>
                        </div>
                        <span className="text-xs font-black text-amber-950/70 group-hover:translate-x-0.5 transition-transform">
                          &rarr;
                        </span>
                      </button>
                      <button
                        onClick={handleResetChat}
                        className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors cursor-pointer py-0.5"
                      >
                        Mulai percakapan baru (reset)
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Question Pills */}
                <div className="flex flex-wrap justify-center gap-1.5 pt-1 pb-2">
                  {QUICK_QUESTIONS.slice(0, 3).map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="px-3 py-1 rounded-full bg-white hover:bg-amber-100/70 text-gray-700 text-[10.5px] font-bold border border-gray-200/80 hover:border-amber-300 transition-all cursor-pointer shadow-3xs"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Pill-shaped Input Bar */}
                <div className="w-full">
                  <div className="flex items-center gap-2 bg-gray-100/90 rounded-full pl-4 pr-1.5 py-1.5 border border-gray-200/80 shadow-inner">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Tulis pesan..."
                      className="flex-1 bg-transparent text-xs font-semibold text-gray-900 placeholder:text-gray-400 outline-none min-w-0"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim()}
                      className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 flex items-center justify-center transition-all cursor-pointer shadow-xs disabled:opacity-40 flex-shrink-0"
                      aria-label="Kirim Pesan"
                    >
                      <Send size={13} className="stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ======================================================== */
              /* VIEW 2: ACTIVE CHAT MESSAGES STREAM                      */
              /* ======================================================== */
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                {/* Topbar: Back button, Live Otbee Mascot Avatar + Title, Close button */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white/95 backdrop-blur-md flex-shrink-0">
                  <button
                    onClick={handleBackToWelcome}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-all cursor-pointer"
                    title="Kembali ke Layar Awal (Percakapan Tersimpan)"
                    aria-label="Kembali"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Live Animated Otbee Vector Mascot Head in Header */}
                    <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center overflow-hidden shadow-2xs flex-shrink-0">
                      <Otbee4KPuppet
                        growthProgress={0}
                        size={32}
                        followPointer={true}
                        paused={false}
                      />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight leading-tight">
                        Otbee AI Assistant
                      </h3>
                      <div className="flex items-center gap-1 text-[9.5px] font-bold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Aktif Siaga</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCloseChat}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-all cursor-pointer"
                    aria-label="Tutup"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/40">
                  {messages.map((msg, idx) => {
                    const isLatestBotMsg = msg.role === 'assistant' && idx === messages.length - 1
                    return (
                      <div key={msg.id} className="space-y-1">
                        {msg.role === 'user' ? (
                          /* User message */
                          <div className="flex justify-end">
                            <div className="max-w-[82%] bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-bold rounded-2xl rounded-tr-xs px-4 py-2.5 text-xs shadow-xs leading-relaxed">
                              {msg.content}
                              <div className="text-[9px] font-bold text-amber-950/60 text-right mt-1">
                                {msg.timestamp}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* AI Assistant message: Live Animated Otbee Vector Head Photo Profile */
                          <div className="flex items-start gap-2.5">
                            {/* Live Otbee Vector Mascot Head Photo Profile */}
                            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center overflow-hidden shadow-2xs flex-shrink-0 -mt-0.5 select-none">
                              <Otbee4KPuppet
                                growthProgress={0}
                                size={32}
                                followPointer={true}
                                paused={false}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Timestamp & Name */}
                              <div className="flex items-center gap-1.5 mb-1 text-[10.5px]">
                                <span className="text-gray-400 font-bold">{msg.timestamp}</span>
                                <span className="text-gray-300">•</span>
                                <span className="font-black text-gray-900">Ai-Assistant</span>
                              </div>

                              {/* Message bubble */}
                              <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 text-xs text-gray-800 font-medium border border-gray-100 shadow-3xs leading-relaxed">
                                {formatChatText(msg.content)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center overflow-hidden shadow-2xs flex-shrink-0 -mt-0.5 select-none">
                        <Otbee4KPuppet
                          growthProgress={0}
                          size={32}
                          followPointer={true}
                          paused={false}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 text-[10.5px]">
                          <span className="font-black text-amber-800">Otbee AI</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-amber-600 font-bold">Sedang berpikir...</span>
                        </div>
                        <div className="bg-white rounded-2xl rounded-tl-xs px-4 py-3 border border-gray-100 shadow-3xs flex items-center gap-1.5 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Bottom Pill Input Bar */}
                <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
                  <div className="flex items-center gap-2 bg-gray-100/90 rounded-full pl-4 pr-1.5 py-1.5 border border-gray-200/80 shadow-inner">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Message"
                      disabled={isTyping}
                      className="flex-1 bg-transparent text-xs font-semibold text-gray-900 placeholder:text-gray-400 outline-none min-w-0"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={isTyping || !inputMessage.trim()}
                      className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 flex items-center justify-center transition-all cursor-pointer shadow-xs disabled:opacity-40 flex-shrink-0"
                      aria-label="Kirim Pesan"
                    >
                      <Send size={13} className="stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
