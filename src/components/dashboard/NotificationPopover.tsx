'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Bell, GraduationCap, FileCheck2, Sparkles, Compass, Check,
  X, ExternalLink, ChevronRight, CheckCheck
} from 'lucide-react'

export interface NotificationItem {
  id: string
  title: string
  message: string
  timeText: string
  href: string
  icon: any
  iconBg: string
  iconColor: string
  isUnread: boolean
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-snbp-deadline',
    title: '⏰ SNBP 2025: Pendaftaran Dibuka Januari 2025',
    message: 'SNPMB resmi mengumumkan jadwal SNBP 2025. Pastikan rapor semester 1–5 dan data NISN-mu sudah valid di sekolah. Cek panduan lengkapnya.',
    timeText: 'Hari ini',
    href: '/panduan',
    icon: Compass,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-800',
    isUnread: true,
  },
  {
    id: 'notif-essay-tip',
    title: '✍️ Tips Essay: Hindari 5 Kesalahan Fatal Ini',
    message: 'AI kami menganalisis ratusan essay — 78% yang ditolak punya kalimat pembuka klise. Pelajari cara menulis hook yang langsung memukau reviewer.',
    timeText: '1 jam lalu',
    href: '/dashboard/essay',
    icon: FileCheck2,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-800',
    isUnread: true,
  },
  {
    id: 'notif-ecourse',
    title: '📚 Modul Baru: Strategi PPKB UI 2025 Tersedia',
    message: 'Unit 1–3 modul PPKB UI sudah dapat diakses. Mulai dari memahami sistem penilaian essay hingga cara highlight prestasi yang relevan.',
    timeText: '3 jam lalu',
    href: '/dashboard/ecourse',
    icon: GraduationCap,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-800',
    isUnread: true,
  },
  {
    id: 'notif-kalkulator',
    title: '📊 Cek Peluangmu Sekarang',
    message: 'Masukkan nilai rapor semester 1–5 di Kalkulator Peluang untuk tahu estimasi peluang masuk prodi tujuanmu. Gratis untuk semua pengguna.',
    timeText: 'Kemarin',
    href: '/dashboard/kalkulator',
    icon: Sparkles,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-800',
    isUnread: false,
  },
  {
    id: 'notif-dokumen',
    title: '📋 Checklist Dokumen: 3 Item Belum Dicentang',
    message: 'Berdasarkan jalur yang kamu pilih, ada 3 dokumen penting yang belum disiapkan. Segera lengkapi agar tidak ketinggalan deadline.',
    timeText: '2 hari lalu',
    href: '/dashboard/dokumen',
    icon: Compass,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-800',
    isUnread: false,
  },
]

interface NotificationPopoverProps {
  isOpen: boolean
  onClose: () => void
  onUpdateUnreadCount?: (count: number) => void
}

export default function NotificationPopover({
  isOpen,
  onClose,
  onUpdateUnreadCount,
}: NotificationPopoverProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)

  const unreadCount = notifications.filter(n => n.isUnread).length

  useEffect(() => {
    onUpdateUnreadCount?.(unreadCount)
  }, [unreadCount, onUpdateUnreadCount])

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })))
    onUpdateUnreadCount?.(0)
  }

  const handleItemClick = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isUnread: false } : n))
    )
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-2xs"
        onClick={onClose}
      />

      {/* Popover Card - ZERO OUTLINES */}
      <div
        className="fixed z-50 bottom-20 left-4 md:left-64 w-80 md:w-96 bg-white rounded-3xl p-4 animate-in fade-in slide-in-from-bottom-3 duration-200 border-0"
        style={{
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.25)',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-gray-900">Notifikasi Saya</h3>
            {unreadCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] border-0">
                {unreadCount} baru
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold text-[10px] border-0">
                Semua dibaca
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-black text-amber-700 hover:text-amber-800 transition-colors cursor-pointer border-0"
              >
                Tandai semua dibaca
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer border-0"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Soft Divider */}
        <div className="h-px bg-gray-100 my-1" />

        {/* Notifications Scroll Area */}
        <div className="overflow-y-auto flex-1 py-2 space-y-2 pr-1" style={{ maxHeight: '60vh' }}>
          {notifications.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => handleItemClick(item.id)}
                className={`block p-3.5 rounded-2xl transition-all cursor-pointer relative border-0 shadow-2xs ${
                  item.isUnread
                    ? 'bg-amber-50/90 hover:bg-amber-100/80'
                    : 'bg-gray-50/70 hover:bg-gray-100'
                }`}
              >
                {item.isUnread && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-amber-500" />
                )}

                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border-0 ${item.iconBg} ${item.iconColor}`}
                  >
                    <Icon size={16} strokeWidth={2.4} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-gray-900 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-gray-600 font-medium leading-relaxed mt-0.5 line-clamp-2">
                      {item.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-gray-400 font-bold">{item.timeText}</span>
                      <span className="font-extrabold text-amber-800 flex items-center gap-0.5">
                        Buka Fitur <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-2 mt-1 border-t border-gray-100/60 text-center">
          <span className="text-[10px] font-semibold text-gray-400">
            Notifikasi otomatis tersinkronisasi dengan akun OtwPTN
          </span>
        </div>
      </div>
    </>
  )
}
