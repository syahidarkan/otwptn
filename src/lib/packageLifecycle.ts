import type { SupabaseClient } from '@supabase/supabase-js'
import { sendUniversalEmail } from '@/lib/email/send'
import { TIER_LABELS, TIER_DURATION_DAYS, type Tier } from '@/lib/pricing'

export const PACKAGE_REMINDER_MILESTONES = [7, 5, 3, 1] as const

export function formatIdDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })
}

export function getTierDisplayName(tier: string | null | undefined): string {
  if (!tier) return 'Paket OTWPTN'
  if (tier === 'intensif') return 'Royal Jelly'
  return TIER_LABELS[tier as Tier] || tier.toUpperCase()
}

export function getDurationDaysForTier(tier: string | null | undefined): number {
  if (!tier) return 30
  return TIER_DURATION_DAYS[tier] ?? 30
}

export interface MentoringTaskCheckInput {
  tier?: string | null
  wa_group_link?: string | null
  zoom_sessions_total?: number | null
  zoom_sessions_used?: number | null
  revision_count_total?: number | null
  revision_count_used?: number | null
  checklist?: { task?: string; done?: boolean }[] | null
  vip_analysis?: unknown
}

/**
 * Mengecek tanggung jawab mentor yang belum diselesaikan untuk seorang mentee
 */
export function getPendingMentorTasks(m: MentoringTaskCheckInput): string[] {
  const pending: string[] = []

  if (!m.wa_group_link) {
    pending.push('Mengirim link Grup WhatsApp bertiga (Mentor + Admin + Mentee)')
  }

  const zoomTotal = Number(m.zoom_sessions_total ?? 0)
  const zoomUsed = Number(m.zoom_sessions_used ?? 0)
  if (zoomTotal > 0 && zoomUsed < zoomTotal) {
    pending.push(`Sesi Zoom Mentoring (${zoomUsed}/${zoomTotal} terlaksana, kurang ${zoomTotal - zoomUsed} sesi)`)
  }

  const revTotal = Number(m.revision_count_total ?? 0)
  const revUsed = Number(m.revision_count_used ?? 0)
  if (revTotal > 0 && revUsed < revTotal) {
    pending.push(`Revisi Essay / Berkas (${revUsed}/${revTotal} selesai, sisa ${revTotal - revUsed} putaran)`)
  }

  if (Array.isArray(m.checklist)) {
    for (const item of m.checklist) {
      if (item?.task && !item.done) {
        pending.push(`Checklist: ${item.task}`)
      }
    }
  }

  if ((m.tier === 'menyeluruh' || m.tier === 'intensif') && !m.vip_analysis) {
    pending.push('Dokumen Analisis Strategi Pilihan 1 & 2 (VIP Royal Jelly)')
  }

  return pending
}

async function insertInAppNotification(
  db: SupabaseClient,
  params: {
    userId: string
    title: string
    message: string
    ctaUrl: string
    kind?: string
  }
) {
  try {
    await db.from('notifications').insert({
      user_id: params.userId,
      title: params.title,
      message: params.message,
      cta_url: params.ctaUrl,
      kind: params.kind || 'package_alert',
    })
  } catch (err) {
    console.warn('[packageLifecycle] gagal insert notification:', err)
  }
}

export async function sendPackageStartedNotifications(
  db: SupabaseClient,
  params: {
    userId: string
    userEmail?: string | null
    userName?: string | null
    tier: string
    startsAt: string
    expiresAt: string
    mentorId?: string | null
    mentorEmail?: string | null
    mentorName?: string | null
  }
) {
  const tierName = getTierDisplayName(params.tier)
  const startStr = formatIdDate(params.startsAt)
  const endStr = formatIdDate(params.expiresAt)
  const isMentoring = params.tier !== 'web_premium'
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.otwptn.com'

  // 1. Notifikasi ke User (In-App + Email)
  await insertInAppNotification(db, {
    userId: params.userId,
    title: `Masa Aktif ${tierName} Resmi Dimulai!`,
    message: `Countdown paket ${tierName} kamu mulai berjalan sejak ${startStr} dan aktif hingga ${endStr}.`,
    ctaUrl: isMentoring ? '/dashboard/mentor' : '/dashboard',
    kind: 'package_started',
  })

  if (params.userEmail) {
    await sendUniversalEmail({
      to: params.userEmail,
      subject: `[OTWPTN] Masa Aktif ${tierName} Dimulai (Berakhir ${endStr})`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827">
          <h2 style="margin:0 0 12px">Masa Aktif Paket ${tierName} Sudah Dimulai!</h2>
          <p>Halo <strong>${params.userName || 'Pejuang PTN'}</strong>,</p>
          <p>Perhitungan masa aktif paket <strong>${tierName}</strong> kamu telah resmi dimulai pada <strong>${startStr}</strong>.</p>
          <div style="background:#fef3c7;border-radius:12px;padding:16px;margin:16px 0">
            <p style="margin:0;font-size:14px"><strong>Berlaku hingga:</strong> ${endStr}</p>
          </div>
          <p>Maksimalkan seluruh sesi dan fitur sebelum masa aktif berakhir.</p>
          <a href="${baseUrl}${isMentoring ? '/dashboard/mentor' : '/dashboard'}" style="display:inline-block;background:#f59e0b;color:#111827;font-weight:700;padding:12px 20px;border-radius:999px;text-decoration:none;margin-top:8px">Buka Dashboard</a>
        </div>
      `,
    }).catch(() => {})
  }

  // 2. Notifikasi ke Mentor (jika paket mentoring)
  if (isMentoring && params.mentorId) {
    await insertInAppNotification(db, {
      userId: params.mentorId,
      title: `Mentee ${params.userName || 'Baru'} Sudah Join Grup WA!`,
      message: `Masa aktif bimbingan ${tierName} untuk ${params.userName || 'mentee'} resmi dimulai (${startStr} s/d ${endStr}).`,
      ctaUrl: '/mentor/dashboard',
      kind: 'package_started',
    })

    if (params.mentorEmail) {
      await sendUniversalEmail({
        to: params.mentorEmail,
        subject: `[OTWPTN Mentor] Bimbingan ${tierName} Dimulai - ${params.userName || 'Mentee'}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827">
            <h2 style="margin:0 0 12px">Masa Aktif Bimbingan Dimulai</h2>
            <p>Halo Kak <strong>${params.mentorName || 'Mentor'}</strong>,</p>
            <p>Mentee <strong>${params.userName || 'Pejuang PTN'}</strong> (${tierName}) baru saja menekan tombol Join Grup WA.</p>
            <div style="background:#fef3c7;border-radius:12px;padding:16px;margin:16px 0">
              <p style="margin:0 0 4px"><strong>Mulai:</strong> ${startStr}</p>
              <p style="margin:0"><strong>Berakhir:</strong> ${endStr}</p>
            </div>
            <p>Silakan mulai pendampingan sesuai SOP dan pantau checklist kewajiban di Dashboard Mentor.</p>
            <a href="${baseUrl}/mentor/dashboard" style="display:inline-block;background:#f59e0b;color:#111827;font-weight:700;padding:12px 20px;border-radius:999px;text-decoration:none;margin-top:8px">Buka Dashboard Mentor</a>
          </div>
        `,
      }).catch(() => {})
    }
  }
}

async function tryClaimReminderLog(
  db: SupabaseClient,
  row: {
    target_type: 'user_renewal' | 'mentor_task'
    user_id: string
    mentoring_id?: string | null
    milestone_day: number
    expires_at: string
  }
): Promise<boolean> {
  try {
    const { error } = await db.from('package_reminder_logs').insert({
      target_type: row.target_type,
      user_id: row.user_id,
      mentoring_id: row.mentoring_id ?? null,
      milestone_day: row.milestone_day,
      expires_at: row.expires_at,
    })
    return !error
  } catch {
    return false
  }
}

function resolveMilestone(daysLeft: number): 7 | 5 | 3 | 1 | null {
  if (daysLeft <= 0) return null
  if (daysLeft <= 1) return 1
  if (daysLeft <= 3) return 3
  if (daysLeft <= 5) return 5
  if (daysLeft <= 7) return 7
  return null
}

/**
 * Memproses pengingat H-7, H-5, H-3, H-1 untuk user (tawaran perpanjangan diskon)
 * dan mentor (pengingat tanggung jawab yang belum selesai).
 */
export async function processPackageReminders(
  db: SupabaseClient,
  filterUserId?: string
): Promise<{ userRemindersSent: number; mentorRemindersSent: number }> {
  let userRemindersSent = 0
  let mentorRemindersSent = 0
  const nowMs = Date.now()
  const maxWindowIso = new Date(nowMs + 7 * 24 * 60 * 60 * 1000).toISOString()
  const nowIso = new Date(nowMs).toISOString()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.otwptn.com'

  // 1. User Renewal Reminders (Akun Premium & Paket Mentoring)
  let profileQuery = db
    .from('profiles')
    .select('id, full_name, email, tier, tier_expires_at')
    .neq('tier', 'free')
    .not('tier_expires_at', 'is', null)
    .gt('tier_expires_at', nowIso)
    .lte('tier_expires_at', maxWindowIso)

  if (filterUserId) {
    profileQuery = profileQuery.eq('id', filterUserId)
  }

  const { data: expiringUsers } = await profileQuery

  for (const u of expiringUsers ?? []) {
    if (!u.tier_expires_at || !u.tier || u.tier === 'free') continue
    const daysLeft = Math.ceil((new Date(u.tier_expires_at).getTime() - nowMs) / (24 * 60 * 60 * 1000))
    const milestone = resolveMilestone(daysLeft)
    if (!milestone) continue

    const claimed = await tryClaimReminderLog(db, {
      target_type: 'user_renewal',
      user_id: u.id,
      milestone_day: milestone,
      expires_at: u.tier_expires_at,
    })
    if (!claimed) continue

    const tierName = getTierDisplayName(u.tier)
    const expStr = formatIdDate(u.tier_expires_at)
    const promoText =
      u.tier === 'web_premium'
        ? 'Perpanjang Akun Premium sekarang hanya Rp25.000/bulan (lebih hemat Rp4.000)!'
        : `Perpanjang paket ${tierName} sekarang dapat potongan harga Rp15.000, dan kamu bisa pilih tetap dengan mentor yang sama atau ganti mentor baru!`

    await insertInAppNotification(db, {
      userId: u.id,
      title: `H-${daysLeft} Masa Aktif ${tierName} Berakhir!`,
      message: `Paketmu berakhir pada ${expStr}. ${promoText}`,
      ctaUrl: '/upgrade?renewal=1',
      kind: 'renewal_reminder',
    })

    if (u.email) {
      await sendUniversalEmail({
        to: u.email,
        subject: `[H-${daysLeft}] Paket ${tierName} Segera Berakhir - Perpanjang Lebih Murah!`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827">
            <h2 style="margin:0 0 12px">Sisa ${daysLeft} Hari Lagi Paket ${tierName} Berakhir</h2>
            <p>Halo <strong>${u.full_name || 'Pejuang PTN'}</strong>,</p>
            <p>Masa aktif paket <strong>${tierName}</strong> kamu akan berakhir pada <strong>${expStr}</strong>.</p>
            <div style="background:#fef3c7;border-radius:12px;padding:16px;margin:16px 0">
              <p style="margin:0;font-weight:700">Promo Khusus Perpanjangan:</p>
              <p style="margin:6px 0 0">${promoText}</p>
            </div>
            <a href="${baseUrl}/upgrade?renewal=1" style="display:inline-block;background:#f59e0b;color:#111827;font-weight:700;padding:12px 20px;border-radius:999px;text-decoration:none">Perpanjang Sekarang</a>
          </div>
        `,
      }).catch(() => {})
    }
    userRemindersSent++
  }

  // 2. Mentor Responsibility Reminders (H-7, H-5, H-3, H-1)
  let mentoringQuery = db
    .from('mentoring')
    .select(`
      id, user_id, mentor_id, mentor_name, mentor_email, tier, wa_group_link,
      zoom_sessions_total, zoom_sessions_used, revision_count_total, revision_count_used,
      checklist, vip_analysis, package_expires_at,
      profiles:user_id (full_name)
    `)
    .eq('status', 'active')
    .not('mentor_id', 'is', null)
    .not('package_expires_at', 'is', null)
    .gt('package_expires_at', nowIso)
    .lte('package_expires_at', maxWindowIso)

  if (filterUserId) {
    mentoringQuery = mentoringQuery.or(`mentor_id.eq.${filterUserId},user_id.eq.${filterUserId}`)
  }

  const { data: expiringMentoring } = await mentoringQuery

  for (const m of expiringMentoring ?? []) {
    if (!m.mentor_id || !m.package_expires_at) continue
    const pendingTasks = getPendingMentorTasks(m)
    if (pendingTasks.length === 0) continue

    const daysLeft = Math.ceil((new Date(m.package_expires_at).getTime() - nowMs) / (24 * 60 * 60 * 1000))
    const milestone = resolveMilestone(daysLeft)
    if (!milestone) continue

    const claimed = await tryClaimReminderLog(db, {
      target_type: 'mentor_task',
      user_id: m.mentor_id,
      mentoring_id: m.id,
      milestone_day: milestone,
      expires_at: m.package_expires_at,
    })
    if (!claimed) continue

    const menteeObj = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
    const menteeName = (menteeObj as { full_name?: string } | null)?.full_name || 'Mentee'
    const tierName = getTierDisplayName(m.tier)
    const expStr = formatIdDate(m.package_expires_at)

    // Lookup mentor email jika belum ada di row mentoring
    let mentorEmail = m.mentor_email
    if (!mentorEmail) {
      const { data: mp } = await db.from('profiles').select('email').eq('id', m.mentor_id).maybeSingle()
      mentorEmail = mp?.email ?? null
    }

    await insertInAppNotification(db, {
      userId: m.mentor_id,
      title: `Pengingat H-${daysLeft}: Kewajiban Mentee ${menteeName}`,
      message: `Paket ${tierName} berakhir ${expStr}. Masih ada ${pendingTasks.length} tugas belum selesai: ${pendingTasks.join('; ')}.`,
      ctaUrl: '/mentor/dashboard',
      kind: 'mentor_reminder',
    })

    if (mentorEmail) {
      const listHtml = pendingTasks.map(t => `<li style="margin-bottom:4px">${t}</li>`).join('')
      await sendUniversalEmail({
        to: mentorEmail,
        subject: `[H-${daysLeft} Pengingat Mentor] Kewajiban Belum Selesai untuk ${menteeName}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827">
            <h2 style="margin:0 0 12px">Pengingat Kewajiban Mentor (H-${daysLeft})</h2>
            <p>Halo Kak <strong>${m.mentor_name || 'Mentor'}</strong>,</p>
            <p>Masa aktif paket <strong>${tierName}</strong> untuk mentee <strong>${menteeName}</strong> akan berakhir pada <strong>${expStr}</strong>.</p>
            <p>Berikut tanggung jawab yang terdeteksi <strong>belum diselesaikan</strong>:</p>
            <ul style="background:#fff1f2;border-radius:12px;padding:16px 24px;color:#9f1239;font-size:13px">${listHtml}</ul>
            <p>Mohon segera selesaikan dan perbarui checklist di Dashboard Mentor.</p>
            <a href="${baseUrl}/mentor/dashboard" style="display:inline-block;background:#f59e0b;color:#111827;font-weight:700;padding:12px 20px;border-radius:999px;text-decoration:none">Buka Dashboard Mentor</a>
          </div>
        `,
      }).catch(() => {})
    }

    mentorRemindersSent++
  }

  return { userRemindersSent, mentorRemindersSent }
}

