import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { processPackageReminders, getTierDisplayName } from '@/lib/packageLifecycle'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  // Lazy-check H-7 / H-5 / H-3 / H-1 reminders for this user/mentor safely in background
  processPackageReminders(db, user.id).catch(() => {})

  const [{ data: profile }, { data: mentoring }] = await Promise.all([
    db
      .from('profiles')
      .select('tier, tier_starts_at, tier_expires_at, pending_activation_tier, onboarding_completed_at')
      .eq('id', user.id)
      .maybeSingle(),
    db
      .from('mentoring')
      .select('id, tier, mentor_id, mentor_name, wa_group_link, wa_group_joined_at, package_starts_at, package_expires_at, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const tier = profile?.tier || 'free'
  const startsAt = mentoring?.package_starts_at || profile?.tier_starts_at || null
  const expiresAt = mentoring?.package_expires_at || profile?.tier_expires_at || null

  let status: 'free' | 'awaiting_onboarding' | 'awaiting_wa_link' | 'awaiting_wa_join' | 'active' | 'expired' = 'free'

  if (tier !== 'free') {
    const now = Date.now()
    if (expiresAt) {
      status = new Date(expiresAt).getTime() > now ? 'active' : 'expired'
    } else if (tier === 'web_premium') {
      status = 'awaiting_onboarding'
    } else if (mentoring) {
      status = mentoring.wa_group_link ? 'awaiting_wa_join' : 'awaiting_wa_link'
    } else {
      status = 'awaiting_wa_link'
    }
  }

  return NextResponse.json({
    tier,
    tierLabel: getTierDisplayName(tier),
    status,
    startsAt,
    expiresAt,
    pendingActivationTier: profile?.pending_activation_tier ?? null,
    onboardingCompletedAt: profile?.onboarding_completed_at ?? null,
    mentoring: mentoring ?? null,
  })
}

