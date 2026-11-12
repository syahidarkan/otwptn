import type { SupabaseClient } from '@supabase/supabase-js'
import { creditAmbassadorCommission } from '@/lib/commission'
import { autoAssignIndividuMentor, handleSquadPayment } from '@/lib/mentorAssignment'
import { getDurationDaysForTier, sendPackageStartedNotifications } from '@/lib/packageLifecycle'
import { TIER_SESSION_CONFIG, type Tier } from '@/lib/pricing'

const TIER_RANK: Record<string, number> = { free: 0, web_premium: 1, review: 2, dokumen: 3, menyeluruh: 4, intensif: 4 }

interface PaidOrder {
  id: string
  user_id: string
  tier: string
  amount: number
  referral_code: string | null
  mode: string | null
  track: string | null
  squad_group_id: string | null
  notes?: string | null
}

function parseNotesMeta(notes?: string | null): {
  is_renewal?: boolean
  renewal_mentor_choice?: 'same' | 'different'
  previous_mentor_id?: string | null
} {
  if (!notes) return {}
  try {
    const parsed = JSON.parse(notes)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

// Atomically flips pending -> paid. Only the request that wins the flip gets the row back,
// so a replayed or concurrent webhook can never credit commission / assign a mentor twice.
export async function claimOrderPaid(db: SupabaseClient, orderId: string): Promise<PaidOrder | null> {
  const { data } = await db
    .from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', orderId)
    .in('status', ['pending', 'expired'])
    .select('id, user_id, tier, amount, referral_code, mode, track, squad_group_id, notes')
    .maybeSingle()
  return (data as PaidOrder | null) ?? null
}

// Everything that must happen once a payment is confirmed (shared by all payment webhooks).
export async function fulfillPaidOrder(db: SupabaseClient, order: PaidOrder): Promise<void> {
  const meta = parseNotesMeta(order.notes)
  const isRenewal = Boolean(meta.is_renewal)
  const days = getDurationDaysForTier(order.tier)
  const now = new Date()
  const nowIso = now.toISOString()

  const { data: current } = await db
    .from('profiles')
    .select('id, full_name, email, tier, tier_expires_at, onboarding_completed')
    .eq('id', order.user_id)
    .maybeSingle()

  if (isRenewal) {
    // Perpanjangan: perpanjang dari max(sekarang, expires_at lama)
    const baseMs = current?.tier_expires_at
      ? Math.max(now.getTime(), new Date(current.tier_expires_at).getTime())
      : now.getTime()
    const newExpiresAt = new Date(baseMs + days * 24 * 60 * 60 * 1000).toISOString()

    await db.from('profiles').update({
      tier: order.tier,
      tier_expires_at: newExpiresAt,
    }).eq('id', order.user_id)

    await creditAmbassadorCommission(db, order)

    if (order.tier !== 'web_premium') {
      if (meta.renewal_mentor_choice === 'same') {
        const { data: existingMentoring } = await db
          .from('mentoring')
          .select('id, mentor_id, mentor_name, mentor_email, zoom_sessions_total, revision_count_total')
          .eq('user_id', order.user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (existingMentoring) {
          const cfg = TIER_SESSION_CONFIG[order.tier as Tier] ?? TIER_SESSION_CONFIG.review
          await db.from('mentoring').update({
            tier: order.tier,
            status: 'active',
            zoom_sessions_total: (existingMentoring.zoom_sessions_total ?? 0) + cfg.zoom,
            revision_count_total: (existingMentoring.revision_count_total ?? 0) + cfg.revisions,
            package_expires_at: newExpiresAt,
            updated_at: nowIso,
          }).eq('id', existingMentoring.id)
        } else {
          await autoAssignIndividuMentor(db, { ...order, track: order.track ?? 'essay' })
        }
      } else {
        // Pilih mentor berbeda -> assign ulang dengan mengecualikan mentor sebelumnya
        await autoAssignIndividuMentor(db, {
          ...order,
          track: order.track ?? 'essay',
          excludeMentorId: meta.previous_mentor_id ?? null,
        })
      }
    }

    await sendPackageStartedNotifications(db, {
      userId: order.user_id,
      userEmail: current?.email,
      userName: current?.full_name,
      tier: order.tier,
      startsAt: nowIso,
      expiresAt: newExpiresAt,
    })
    return
  }

  // Pembelian baru (bukan perpanjangan)
  if ((TIER_RANK[order.tier] ?? 0) >= (TIER_RANK[current?.tier ?? 'free'] ?? 0)) {
    if (order.tier === 'web_premium') {
      const hasFinishedOnboarding = Boolean(current?.onboarding_completed)
      if (hasFinishedOnboarding) {
        const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
        await db.from('profiles').update({
          tier: order.tier,
          tier_starts_at: nowIso,
          tier_expires_at: expiresAt,
          pending_activation_tier: null,
        }).eq('id', order.user_id)

        await sendPackageStartedNotifications(db, {
          userId: order.user_id,
          userEmail: current?.email,
          userName: current?.full_name,
          tier: order.tier,
          startsAt: nowIso,
          expiresAt,
        })
      } else {
        // Akun Premium baru: masa aktif menunggu user menyelesaikan onboarding pertama kali
        await db.from('profiles').update({
          tier: order.tier,
          pending_activation_tier: order.tier,
          tier_starts_at: null,
          tier_expires_at: null,
        }).eq('id', order.user_id)
      }
    } else {
      // Paket mentoring (Nectar, Honeycomb, Royal Jelly):
      // Tier fitur web aktif, tetapi countdown baru dimulai setelah mentor input link WA & user klik Join WA
      await db.from('profiles').update({
        tier: order.tier,
        pending_activation_tier: order.tier,
        tier_starts_at: null,
        tier_expires_at: null,
      }).eq('id', order.user_id)
    }
  }

  await creditAmbassadorCommission(db, order)

  const assignable = { ...order, track: order.track ?? 'essay' }
  if (order.mode === 'squad' && order.squad_group_id) {
    await handleSquadPayment(db, { ...assignable, squad_group_id: order.squad_group_id })
  } else {
    await autoAssignIndividuMentor(db, assignable)
  }
}
