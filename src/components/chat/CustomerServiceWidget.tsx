'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  MessageCircle, X, Send, Sparkles, ShieldCheck, Mail,
  ChevronDown, Bot, RefreshCw, ExternalLink
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import 3D Mascot canvas so SSR runs cleanly
const Mascot3DCanvas = dynamic(() => import('./Mascot3DCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-24 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
    </div>
  ),
})

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

export default function CustomerServiceWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [showTeaser, setShowTeaser] = useState(true)
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen])

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

  return (
    <div className="fixed z-50 bottom-5 right-5 sm:bottom-6 sm:right-6 font-sans">
      {/* Floating Teaser Callout (Only visible when closed) */}
      {!isOpen && showTeaser && (
        <div className="absolute bottom-[calc(100%+12px)] right-0 bg-white rounded-2xl p-3 shadow-xl border border-amber-200/80 w-64 animate-in fade-in slide-in-from-bottom-2 duration-300">
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

      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true)
            setShowTeaser(false)
          }}
          aria-label="Buka Chatbot Customer Service"
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-amber-950 shadow-xl hover:shadow-2xl hover:scale-103 active:scale-97 transition-all cursor-pointer border border-amber-300"
          style={{ boxShadow: '0 12px 30px -6px rgba(245, 194, 66, 0.45)' }}
        >
          <div className="w-9 h-9 rounded-full bg-white/90 p-0.5 shadow-xs flex items-center justify-center relative overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/avatars/avatar-1.png"
              alt="Otbee CS"
              className="w-full h-full object-contain"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div className="text-left pr-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-900/80 leading-none">
              Tanya CS
            </div>
            <div className="text-xs font-black text-gray-950 flex items-center gap-1">
              Otbee AI <Sparkles size={12} className="text-amber-700" />
            </div>
          </div>
        </button>
      )}

      {/* Opened Chat Window */}
      {isOpen && (
        <div
          className="w-[350px] sm:w-[410px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-250"
          style={{ boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.28)' }}
        >
          {/* Header with Aesthetic 3D Mascot Canvas */}
          <div className="relative bg-gradient-to-b from-amber-300 via-amber-200/90 to-amber-100/60 p-4 border-b border-amber-200/50 flex-shrink-0">
            {/* Top row: Status & Actions */}
            <div className="flex items-center justify-between relative z-10 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-950">
                  Otbee CS AI · Resmi
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/70 hover:bg-white text-gray-700 flex items-center justify-center transition-colors cursor-pointer shadow-3xs"
                  aria-label="Tutup Chat"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Aesthetic 3D Character Viewport */}
            <div className="w-full h-28 relative my-1">
              <Mascot3DCanvas className="w-full h-full" interactive={true} />
            </div>

            {/* Identity Bar */}
            <div className="text-center relative z-10 -mt-1">
              <h3 className="text-sm font-black text-gray-950 tracking-tight flex items-center justify-center gap-1">
                Customer Service OtwPTN <ShieldCheck size={14} className="text-emerald-700" />
              </h3>
              <p className="text-[10px] font-bold text-amber-900/80 mt-0.5">
                PT. Lembaga Sains Nasional · otwptn.com@gmail.com
              </p>
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
                  <div className="w-7 h-7 rounded-full bg-amber-100 p-0.5 flex-shrink-0 flex items-center justify-center shadow-3xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/avatars/avatar-1.png"
                      alt="Otbee"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-amber-400 text-amber-950 font-semibold rounded-tr-none shadow-xs'
                      : 'bg-white text-gray-800 font-medium rounded-tl-none border border-gray-100 shadow-xs'
                  }`}
                >
                  {msg.content}
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
                <div className="w-7 h-7 rounded-full bg-amber-100 p-0.5 flex-shrink-0 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/avatars/avatar-1.png"
                    alt="Otbee"
                    className="w-full h-full object-contain"
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
  )
}
