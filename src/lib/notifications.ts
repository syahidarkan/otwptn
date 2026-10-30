import { ARTICLES } from '@/lib/articlesData'

export type NotificationType = 'broadcast' | 'article' | 'update' | 'system'

export interface NotificationItem {
  id: string
  title: string
  message: string
  timeText: string
  createdAt: number
  href: string
  type: NotificationType
  badgeLabel: string
  iconKey: 'megaphone' | 'newspaper' | 'sparkles' | 'calculator' | 'file' | 'users' | 'graduation' | 'bot' | 'compass'
  iconBg: string
  iconColor: string
  isUnread: boolean
}

const STORAGE_KEY_READ = 'otwptn_read_notif_ids'
const STORAGE_KEY_BROADCASTS = 'otwptn_inweb_broadcasts'
export const EVENT_NOTIF_UPDATE = 'otwptn_notification_update'

// Built-in announcements & updates
const BASE_SYSTEM_NOTIFICATIONS: Omit<NotificationItem, 'isUnread'>[] = [
  // 1. Core Feature Update: Kalkulator Peluang 2026
  {
    id: 'upd-kalkulator-2026',
    title: '📊 Kalkulator Peluang 2026 Siap Digunakan',
    message: 'Hitung peluang lolosmu di prodi impian berdasarkan nilai rapor semester 1–5, mapel pendukung, dan sertifikat kurasi Puspresnas.',
    timeText: '10 menit lalu',
    createdAt: Date.now() - 10 * 60 * 1000,
    href: '/dashboard/kalkulator',
    type: 'update',
    badgeLabel: 'Update Fitur',
    iconKey: 'calculator',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-800',
  },
  // 2. Official Admin Broadcast: Sinkronisasi Rapor
  {
    id: 'bc-snbp-2026-sync',
    title: '📢 Broadcast Admin: Panduan Finalisasi Rapor SNBP 2026',
    message: 'Peringatan resmi: Pastikan periksa nilai rata-rata dan mapel pendukung sebelum finalisasi PDSS di sekolah masing-masing.',
    timeText: '30 menit lalu',
    createdAt: Date.now() - 30 * 60 * 1000,
    href: '/artikel/panduan-lolos-snbp-2026-strategi-rapor-dan-prodi',
    type: 'broadcast',
    badgeLabel: 'Broadcast',
    iconKey: 'megaphone',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-800',
  },
  // 3. New Article: 5 Kesalahan Fatal Essay
  {
    id: 'art-5-kesalahan-essay',
    title: '✍️ Artikel Baru: 5 Kesalahan Fatal Esai Masuk PTN',
    message: 'Reviewer mengungkapkan 78% esai ditolak karena pembuka klise & kurang riset jurusan. Baca panduan menulis hook yang kuat.',
    timeText: '2 jam lalu',
    createdAt: Date.now() - 2 * 3600 * 1000,
    href: '/artikel/5-kesalahan-fatal-essay-seleksi-non-tes',
    type: 'article',
    badgeLabel: 'Artikel Baru',
    iconKey: 'newspaper',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-800',
  },
  // 4. Feature Update: AI Review Essay 2.0
  {
    id: 'upd-essay-ai-2',
    title: '✨ Fitur Baru: AI Review Essay 2.0 dengan Feedback 4D',
    message: 'Cek personal statement dan essay motivasimu langsung dengan AI. Dapatkan skor struktur, originalitas ide, dan koreksi tata bahasa.',
    timeText: '5 jam lalu',
    createdAt: Date.now() - 5 * 3600 * 1000,
    href: '/dashboard/essay',
    type: 'update',
    badgeLabel: 'Update Fitur',
    iconKey: 'sparkles',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-800',
  },
  // 5. New Article: Apa itu SNBP 2026
  {
    id: 'art-apa-itu-snbp',
    title: '📖 Artikel Baru: Apa itu SNBP 2026? Aturan & Syarat Resmi',
    message: 'Penjelasan resmi skema 50% nilai rapor, 50% mapel pendukung prodi, dan aturan kuota siswa eligible per akreditasi sekolah.',
    timeText: 'Kemarin',
    createdAt: Date.now() - 24 * 3600 * 1000,
    href: '/artikel/apa-itu-snbp',
    type: 'article',
    badgeLabel: 'Artikel Baru',
    iconKey: 'newspaper',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-800',
  },
  // 6. Broadcast: Mentoring 1-on-1 Alumni UI ITB UGM
  {
    id: 'bc-mentoring-alumni',
    title: '🎓 Broadcast Admin: Jadwal Mentoring Privat Alumni Dibuka',
    message: 'Slot bimbingan 1-on-1 via Zoom bersama mentor alumni UI, ITB, dan UGM telah tersedia. Booking sesimu sekarang.',
    timeText: 'Kemarin',
    createdAt: Date.now() - 28 * 3600 * 1000,
    href: '/dashboard/mentor',
    type: 'broadcast',
    badgeLabel: 'Broadcast',
    iconKey: 'graduation',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-900',
  },
  // 7. Feature Update: Teman Belajar Virtual
  {
    id: 'upd-teman-belajar',
    title: '👥 Fitur Baru: Cari Teman Belajar & Peer Review Rapor',
    message: 'Temukan partner belajar se-Indonesia dengan target kampus yang sama untuk sharing strategi dan bedah berkas tanpa login rumit.',
    timeText: '2 hari lalu',
    createdAt: Date.now() - 48 * 3600 * 1000,
    href: '/dashboard/teman',
    type: 'update',
    badgeLabel: 'Update Fitur',
    iconKey: 'users',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-800',
  },
  // 8. New Article: Kupas Tuntas Personal Statement PPKB UI
  {
    id: 'art-ppkb-ui',
    title: '🏛️ Artikel Baru: Kupas Tuntas Personal Statement PPKB UI',
    message: 'Format, struktur, dan contoh kalimat pembuka esai motivasi yang disukai reviewer Universitas Indonesia jalur PPKB.',
    timeText: '3 hari lalu',
    createdAt: Date.now() - 72 * 3600 * 1000,
    href: '/artikel/tips-menulis-personal-statement-ppkb-ui',
    type: 'article',
    badgeLabel: 'Artikel Baru',
    iconKey: 'newspaper',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-800',
  },
  // 9. Feature Update: Otbee AI Chat 24/7
  {
    id: 'upd-otbee-chat',
    title: '🤖 Tanya Otbee AI: Konsultasi Jalur Mandiri & Rapor Kapan Saja',
    message: 'Otbee siap menjawab seputar keketatan prodi, syarat sertifikat Puspresnas, dan rekomendasi alternatif PTN.',
    timeText: '4 hari lalu',
    createdAt: Date.now() - 96 * 3600 * 1000,
    href: '/dashboard/otbee',
    type: 'update',
    badgeLabel: 'Update Fitur',
    iconKey: 'bot',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-800',
  },
]

// Generate dynamic article notifications for any articles in ARTICLES not covered above
function getDynamicArticleNotifications(): Omit<NotificationItem, 'isUnread'>[] {
  const coveredSlugs = new Set([
    'panduan-lolos-snbp-2026-strategi-rapor-dan-prodi',
    '5-kesalahan-fatal-essay-seleksi-non-tes',
    'apa-itu-snbp',
    'tips-menulis-personal-statement-ppkb-ui',
  ])

  return ARTICLES.filter(a => !coveredSlugs.has(a.slug)).map((art, idx) => ({
    id: `art-${art.slug}`,
    title: `📖 Artikel: ${art.title}`,
    message: art.excerpt,
    timeText: art.date || `${idx + 3} hari lalu`,
    createdAt: Date.now() - (idx + 3) * 86400 * 1000,
    href: `/artikel/${art.slug}`,
    type: 'article' as const,
    badgeLabel: 'Artikel Baru',
    iconKey: 'newspaper' as const,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-800',
  }))
}

export function getReadNotificationIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY_READ)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

export function getStoredAdminBroadcasts(): Omit<NotificationItem, 'isUnread'>[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BROADCASTS)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function getAllNotifications(): NotificationItem[] {
  const readIds = getReadNotificationIds()
  const customBroadcasts = getStoredAdminBroadcasts()
  const dynamicArticles = getDynamicArticleNotifications()

  const allItems = [
    ...customBroadcasts,
    ...BASE_SYSTEM_NOTIFICATIONS,
    ...dynamicArticles,
  ]

  // Sort by createdAt descending (newest first)
  allItems.sort((a, b) => b.createdAt - a.createdAt)

  return allItems.map(item => ({
    ...item,
    isUnread: !readIds.has(item.id),
  }))
}

export function markNotificationAsRead(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const readIds = getReadNotificationIds()
    readIds.add(id)
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify(Array.from(readIds)))
    dispatchNotificationUpdate()
  } catch (err) {
    console.error('Failed to mark notification as read:', err)
  }
}

export function markAllNotificationsAsRead(): void {
  if (typeof window === 'undefined') return
  try {
    const all = getAllNotifications()
    const allIds = all.map(n => n.id)
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify(allIds))
    dispatchNotificationUpdate()
  } catch (err) {
    console.error('Failed to mark all as read:', err)
  }
}

export function addAdminBroadcast(params: {
  title: string
  message: string
  ctaUrl?: string
  channel?: string
  targetAudience?: string
}): NotificationItem {
  const customBroadcasts = getStoredAdminBroadcasts()
  
  // Format destination URL nicely
  let targetHref = params.ctaUrl?.trim() || '/dashboard'
  if (!targetHref.startsWith('/') && !targetHref.startsWith('http')) {
    targetHref = `/${targetHref}`
  }

  const newBroadcast: Omit<NotificationItem, 'isUnread'> = {
    id: `bc-${Date.now()}`,
    title: params.title.startsWith('📢') ? params.title : `📢 ${params.title}`,
    message: params.message,
    timeText: 'Baru saja',
    createdAt: Date.now(),
    href: targetHref,
    type: 'broadcast',
    badgeLabel: params.channel === 'banner' ? 'Banner Pengumuman' : 'Broadcast Admin',
    iconKey: 'megaphone',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-900',
  }

  try {
    const updated = [newBroadcast, ...customBroadcasts]
    localStorage.setItem(STORAGE_KEY_BROADCASTS, JSON.stringify(updated))
    dispatchNotificationUpdate()
  } catch (err) {
    console.error('Failed to save broadcast to localStorage:', err)
  }

  return {
    ...newBroadcast,
    isUnread: true,
  }
}

export function dispatchNotificationUpdate(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(EVENT_NOTIF_UPDATE))
}
