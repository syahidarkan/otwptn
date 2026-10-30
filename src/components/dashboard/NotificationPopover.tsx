'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell, GraduationCap, FileCheck2, Sparkles, Compass, Check,
  X, ExternalLink, ChevronRight, CheckCheck, Megaphone, Newspaper,
  Calculator, Users, Bot
} from 'lucide-react'
import {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  EVENT_NOTIF_UPDATE,
  type NotificationItem,
  type NotificationType,
} from '@/lib/notifications'

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
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'broadcast' | 'article' | 'update'>('all')

  const refreshNotifications = () => {
    const items = getAllNotifications()
    setNotifications(items)
  }

  // Initial load and event listeners
  useEffect(() => {
    refreshNotifications()

    const handleUpdate = () => {
      refreshNotifications()
    }

    window.addEventListener(EVENT_NOTIF_UPDATE, handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener(EVENT_NOTIF_UPDATE, handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const unreadCount = useMemo(() => {
    return notifications.filter(n => n.isUnread).length
  }, [notifications])

  useEffect(() => {
    onUpdateUnreadCount?.(unreadCount)
  }, [unreadCount, onUpdateUnreadCount])

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications
    return notifications.filter(n => n.type === activeTab)
  }, [notifications, activeTab])

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead()
    refreshNotifications()
  }

  const handleItemClick = (e: React.MouseEvent, item: NotificationItem) => {
    e.preventDefault()
    markNotificationAsRead(item.id)
    onClose()
    router.push(item.href)
  }

  const renderIcon = (key: NotificationItem['iconKey']) => {
    switch (key) {
      case 'megaphone':
        return <Megaphone size={16} strokeWidth={2.4} />
      case 'newspaper':
        return <Newspaper size={16} strokeWidth={2.4} />
      case 'calculator':
        return <Calculator size={16} strokeWidth={2.4} />
      case 'sparkles':
        return <Sparkles size={16} strokeWidth={2.4} />
      case 'file':
        return <FileCheck2 size={16} strokeWidth={2.4} />
      case 'users':
        return <Users size={16} strokeWidth={2.4} />
      case 'graduation':
        return <GraduationCap size={16} strokeWidth={2.4} />
      case 'bot':
        return <Bot size={16} strokeWidth={2.4} />
      default:
        return <Compass size={16} strokeWidth={2.4} />
    }
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
        className="fixed z-50 bottom-20 left-4 md:left-64 w-[340px] md:w-[420px] bg-white rounded-3xl p-4 md:p-5 animate-in fade-in slide-in-from-bottom-3 duration-200 border-0"
        style={{
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.25)',
          maxHeight: '84vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-0">
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

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-1.5 pb-2.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-amber-400 text-amber-950 shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
            }`}
          >
            Semua ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('broadcast')}
            className={`px-3 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'broadcast'
                ? 'bg-amber-400 text-amber-950 shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
            }`}
          >
            📢 Broadcast
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('article')}
            className={`px-3 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'article'
                ? 'bg-amber-400 text-amber-950 shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
            }`}
          >
            📖 Artikel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('update')}
            className={`px-3 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'update'
                ? 'bg-amber-400 text-amber-950 shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
            }`}
          >
            ✨ Update
          </button>
        </div>

        {/* Soft Divider */}
        <div className="h-px bg-gray-100 mb-2" />

        {/* Notifications Scroll Area */}
        <div className="overflow-y-auto flex-1 space-y-2.5 pr-1" style={{ maxHeight: '58vh' }}>
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
                <Bell size={20} />
              </div>
              <p className="text-xs font-black text-gray-800">Belum ada notifikasi di kategori ini</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                Pilih tab &apos;Semua&apos; untuk melihat pengumuman lainnya
              </p>
            </div>
          ) : (
            filteredNotifications.map(item => (
              <div
                key={item.id}
                onClick={(e) => handleItemClick(e, item)}
                className={`block p-3.5 rounded-2xl transition-all cursor-pointer relative border-0 shadow-2xs group ${
                  item.isUnread
                    ? 'bg-amber-50/90 hover:bg-amber-100/90'
                    : 'bg-gray-50/70 hover:bg-gray-100'
                }`}
              >
                {item.isUnread && (
                  <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                )}

                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border-0 ${item.iconBg} ${item.iconColor}`}
                  >
                    {renderIcon(item.iconKey)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-white/80 text-gray-700 shadow-3xs">
                        {item.badgeLabel}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-gray-900 group-hover:text-amber-950 leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-gray-600 font-medium leading-relaxed mt-1 line-clamp-2">
                      {item.message}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between text-[10px]">
                      <span className="text-gray-400 font-bold">{item.timeText}</span>
                      <span className="font-extrabold text-amber-800 group-hover:text-amber-950 flex items-center gap-0.5">
                        Buka Halaman <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-2 mt-2 border-t border-gray-100/70 text-center">
          <span className="text-[10px] font-semibold text-gray-400">
            Semua link mengarah langsung ke artikel dan fitur resmi OtwPTN
          </span>
        </div>
      </div>
    </>
  )
}
