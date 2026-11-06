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

export interface ActiveBanner {
  id: string
  title: string
  message: string
  cta_url: string | null
}

interface ServerNotification {
  id: string
  broadcast_id: string | null
  title: string
  message: string
  cta_url: string | null
  kind: NotificationType
  read_at: string | null
  created_at: string
}

interface ServerCache {
  userId: string | null
  notifications: ServerNotification[]
  banner: ActiveBanner | null
}

const STORAGE_KEY_READ = 'otwptn_read_notif_ids'
const STORAGE_KEY_SERVER = 'otwptn_server_notifications_v1'
const SYNC_INTERVAL_MS = 60_000
export const EVENT_NOTIF_UPDATE = 'otwptn_notification_update'

const day = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d)

export function formatRelativeTime(ms: number): string {
  const diff = Date.now() - ms
  if (diff < 60_000) return 'Baru saja'
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Kemarin'
  if (days < 30) return `${days} hari lalu`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} bulan lalu`
  return `${Math.floor(months / 12)} tahun lalu`
}

// Built-in product updates & article announcements (static catalog, not admin broadcasts).
// Admin broadcasts come from the database and never live in this list.
const BASE_SYSTEM_NOTIFICATIONS: Omit<NotificationItem, 'isUnread' | 'timeText'>[] = [
  {
    id: 'upd-kalkulator-2026',
    title: 'Kalkulator Peluang 2026 Siap Digunakan',
    message: 'Hitung peluang lolosmu di prodi impian berdasarkan nilai rapor semester 1-5, mapel pendukung, dan sertifikat kurasi Puspresnas.',
    createdAt: day(2026, 10, 12),
    href: '/dashboard/kalkulator',
    type: 'update',
    badgeLabel: 'Update Fitur',
    iconKey: 'calculator',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-800',
  },
  {
    id: 'art-5-kesalahan-essay',
    title: 'Artikel Baru: 5 Kesalahan Fatal Esai Masuk PTN',
    message: 'Reviewer mengungkapkan 78% esai ditolak karena pembuka klise & kurang riset jurusan. Baca panduan menulis hook yang kuat.',
    createdAt: day(2026, 10, 10),
    href: '/artikel/5-kesalahan-fatal-essay-seleksi-non-tes',
    type: 'article',
    badgeLabel: 'Artikel Baru',
    iconKey: 'newspaper',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-800',
  },
  {
    id: 'upd-essay-ai-2',
    title: 'Fitur Baru: AI Review Essay 2.0 dengan Feedback 4D',
    message: 'Cek personal statement dan essay motivasimu langsung dengan AI. Dapatkan skor struktur, originalitas ide, dan koreksi tata bahasa.',
    createdAt: day(2026, 10, 8),
    href: '/dashboard/essay',
    type: 'update',
    badgeLabel: 'Update Fitur',
    iconKey: 'sparkles',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-800',
  },
  {
    id: 'art-apa-itu-snbp',
    title: 'Artikel Baru: Apa itu SNBP 2026? Aturan & Syarat Resmi',
    message: 'Penjelasan resmi skema 50% nilai rapor, 50% mapel pendukung prodi, dan aturan kuota siswa eligible per akreditasi sekolah.',
    createdAt: day(2026, 10, 6),
    href: '/artikel/apa-itu-snbp',
    type: 'article',
    badgeLabel: 'Artikel Baru',
    iconKey: 'newspaper',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-800',
  },
  {
    id: 'upd-teman-belajar',
    title: 'Fitur Baru: Cari Teman Belajar & Peer Review Rapor',
    message: 'Temukan partner belajar se-Indonesia dengan target kampus yang sama untuk sharing strategi dan bedah berkas tanpa login rumit.',
    createdAt: day(2026, 10, 4),
    href: '/dashboard/teman',
    type: 'update',
    badgeLabel: 'Update Fitur',
    iconKey: 'users',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-800',
  },
  {
    id: 'art-ppkb-ui',
    title: 'Artikel Baru: Kupas Tuntas Personal Statement PPKB UI',
    message: 'Format, struktur, dan contoh kalimat pembuka esai motivasi yang disukai reviewer Universitas Indonesia jalur PPKB.',
    createdAt: day(2026, 10, 2),
    href: '/artikel/tips-menulis-personal-statement-ppkb-ui',
    type: 'article',
    badgeLabel: 'Artikel Baru',
    iconKey: 'newspaper',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-800',
  },
  {
    id: 'upd-otbee-chat',
    title: 'Tanya Otbee AI: Konsultasi Jalur Mandiri & Rapor Kapan Saja',
    message: 'Otbee siap menjawab seputar keketatan prodi, syarat sertifikat Puspresnas, dan rekomendasi alternatif PTN.',
    createdAt: day(2026, 9, 28),
    href: '/dashboard/otbee',
    type: 'update',
    badgeLabel: 'Update Fitur',
    iconKey: 'bot',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-800',
  },
]

// Articles in ARTICLES that are not already covered by the hand-written entries above.
function getDynamicArticleNotifications(): Omit<NotificationItem, 'isUnread' | 'timeText'>[] {
  const coveredSlugs = new Set([
    '5-kesalahan-fatal-essay-seleksi-non-tes',
    'apa-itu-snbp',
    'tips-menulis-personal-statement-ppkb-ui',
  ])

  return ARTICLES.filter(a => !coveredSlugs.has(a.slug)).map((art, idx) => ({
    id: `art-${art.slug}`,
    title: `Artikel: ${art.title}`,
    message: art.excerpt,
    createdAt: day(2026, 9, 25) - idx * 86_400_000,
    href: `/artikel/${art.slug}`,
    type: 'article' as const,
    badgeLabel: 'Artikel Baru',
    iconKey: 'newspaper' as const,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-800',
  }))
}

// ── Server notification cache (hydrated from /api/notifications) ──────────────

function readCache(): ServerCache {
  const empty: ServerCache = { userId: null, notifications: [], banner: null }
  if (typeof window === 'undefined') return empty
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SERVER)
    if (!raw) return empty
    const parsed = JSON.parse(raw) as Partial<ServerCache>
    return {
      userId: parsed.userId ?? null,
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      banner: parsed.banner ?? null,
    }
  } catch {
    return empty
  }
}

function writeCache(cache: ServerCache): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_SERVER, JSON.stringify(cache))
  } catch {
    // storage full or blocked; the next sync just refetches
  }
}

const SERVER_KIND_STYLE: Record<
  NotificationType,
  { badgeLabel: string; iconKey: NotificationItem['iconKey']; iconBg: string; iconColor: string }
> = {
  broadcast: { badgeLabel: 'Broadcast Admin', iconKey: 'megaphone', iconBg: 'bg-amber-100', iconColor: 'text-amber-900' },
  update: { badgeLabel: 'Update Fitur', iconKey: 'sparkles', iconBg: 'bg-purple-100', iconColor: 'text-purple-800' },
  article: { badgeLabel: 'Artikel Baru', iconKey: 'newspaper', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-800' },
  system: { badgeLabel: 'Sistem', iconKey: 'compass', iconBg: 'bg-gray-100', iconColor: 'text-gray-700' },
}

function toItem(n: ServerNotification): NotificationItem {
  const style = SERVER_KIND_STYLE[n.kind] ?? SERVER_KIND_STYLE.broadcast
  const createdAt = Date.parse(n.created_at) || Date.now()
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    timeText: formatRelativeTime(createdAt),
    createdAt,
    href: n.cta_url?.trim() || '/dashboard',
    type: n.kind in SERVER_KIND_STYLE ? n.kind : 'broadcast',
    ...style,
    isUnread: !n.read_at,
  }
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

// Admin broadcasts the signed-in user actually received (from the database).
export function getStoredAdminBroadcasts(): Omit<NotificationItem, 'isUnread'>[] {
  return readCache()
    .notifications.filter(n => n.kind === 'broadcast')
    .map(toItem)
}

export function getActiveBanner(): ActiveBanner | null {
  return readCache().banner
}

export function getAllNotifications(): NotificationItem[] {
  ensureNotificationSync()

  const readIds = getReadNotificationIds()
  const serverItems = readCache().notifications.map(toItem)
  const staticItems: NotificationItem[] = [...BASE_SYSTEM_NOTIFICATIONS, ...getDynamicArticleNotifications()].map(
    item => ({
      ...item,
      timeText: formatRelativeTime(item.createdAt),
      isUnread: !readIds.has(item.id),
    }),
  )

  return [...serverItems, ...staticItems].sort((a, b) => b.createdAt - a.createdAt)
}

// Ids marked read locally whose POST has not finished yet; a sync must not flip them back to unread.
const pendingRead = new Set<string>()

async function postRead(payload: { ids: string[] } | { all: true }): Promise<void> {
  try {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(String(res.status))
  } catch (err) {
    console.error('Failed to save read state:', err)
  } finally {
    if ('ids' in payload) payload.ids.forEach(id => pendingRead.delete(id))
    else pendingRead.clear()
    void syncNotificationsFromServer()
  }
}

export function markNotificationAsRead(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const cache = readCache()
    const serverItem = cache.notifications.find(n => n.id === id)

    if (serverItem) {
      if (!serverItem.read_at) {
        serverItem.read_at = new Date().toISOString()
        pendingRead.add(id)
        writeCache(cache)
        dispatchNotificationUpdate()
        void postRead({ ids: [id] })
      }
      return
    }

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
    const staticIds = [...BASE_SYSTEM_NOTIFICATIONS, ...getDynamicArticleNotifications()].map(n => n.id)
    const readIds = getReadNotificationIds()
    staticIds.forEach(id => readIds.add(id))
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify(Array.from(readIds)))

    const cache = readCache()
    const unreadServer = cache.notifications.filter(n => !n.read_at)
    if (unreadServer.length > 0) {
      const now = new Date().toISOString()
      unreadServer.forEach(n => {
        n.read_at = now
        pendingRead.add(n.id)
      })
      writeCache(cache)
      void postRead({ all: true })
    }

    dispatchNotificationUpdate()
  } catch (err) {
    console.error('Failed to mark all as read:', err)
  }
}

/**
 * @deprecated Broadcasts are created through /api/admin/broadcast now, which stores them in the
 * database and delivers them per user. This no longer persists anything; it only builds the item.
 */
export function addAdminBroadcast(params: {
  title: string
  message: string
  ctaUrl?: string
  channel?: string
  targetAudience?: string
}): NotificationItem {
  const now = Date.now()
  return {
    id: `bc-${now}`,
    title: params.title,
    message: params.message,
    timeText: 'Baru saja',
    createdAt: now,
    href: params.ctaUrl?.trim() || '/dashboard',
    type: 'broadcast',
    ...SERVER_KIND_STYLE.broadcast,
    isUnread: true,
  }
}

export function dispatchNotificationUpdate(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(EVENT_NOTIF_UPDATE))
}

// ── Sync ──────────────────────────────────────────────────────────────────────

let syncing = false
let syncStarted = false

export async function syncNotificationsFromServer(): Promise<void> {
  if (typeof window === 'undefined' || syncing) return
  syncing = true
  try {
    const res = await fetch('/api/notifications', { cache: 'no-store' })

    if (res.status === 401) {
      // Signed out (or session expired): drop the previous user's cached notifications.
      const cache = readCache()
      if (cache.userId || cache.notifications.length > 0 || cache.banner) {
        localStorage.removeItem(STORAGE_KEY_SERVER)
        dispatchNotificationUpdate()
      }
      return
    }
    if (!res.ok) return

    const data = (await res.json()) as {
      userId: string
      notifications: ServerNotification[]
      banner: ActiveBanner | null
    }

    const notifications = (data.notifications ?? []).map(n =>
      pendingRead.has(n.id) && !n.read_at ? { ...n, read_at: new Date().toISOString() } : n,
    )
    const next: ServerCache = { userId: data.userId, notifications, banner: data.banner ?? null }

    if (JSON.stringify(readCache()) !== JSON.stringify(next)) {
      writeCache(next)
      dispatchNotificationUpdate()
    }
  } catch {
    // offline or transient error: keep showing the cached list
  } finally {
    syncing = false
  }
}

// Starts background hydration the first time anything in the browser asks for notifications.
export function ensureNotificationSync(): void {
  if (typeof window === 'undefined' || syncStarted) return
  syncStarted = true

  setTimeout(() => void syncNotificationsFromServer(), 0)
  window.setInterval(() => {
    if (!document.hidden) void syncNotificationsFromServer()
  }, SYNC_INTERVAL_MS)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) void syncNotificationsFromServer()
  })
}
