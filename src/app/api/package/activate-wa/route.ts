import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getDurationDaysForTier, sendPackageStartedNotifications } from '@/lib/packageLifecycle'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  const { data: mentoring } = await db
    .from('mentoring')
    .select('id, user_id, mentor_id, mentor_name, mentor_email, tier, wa_group_link, wa_group_joined_at, package_starts_at, package_expires_at')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!mentoring) {
    return NextResponse.json({ error: 'Data mentoring aktif tidak ditemukan.' }, { status: 404 })
  }

  if (!mentoring.wa_group_link) {
    return NextResponse.json({ error: 'Link Grup WhatsApp belum diinput oleh mentor.' }, { status: 400 })
  }

  // Jika sudah pernah join sebelumnya, langsung kembalikan link tanpa mereset tanggal mulai
  if (mentoring.wa_group_joined_at && mentoring.package_expires_at) {
    return NextResponse.json({
      ok: true,
      alreadyActivated: true,
      wa_group_link: mentoring.wa_group_link,
      starts_at: mentoring.package_starts_at,
      expires_at: mentoring.package_expires_at,
    })
  }

  const now = new Date()
  const days = getDurationDaysForTier(mentoring.tier)
  const startsAt = now.toISOString()
  const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()

  await Promise.all([
    db.from('mentoring').update({
      wa_group_joined_at: startsAt,
      package_starts_at: startsAt,
      package_expires_at: expiresAt,
      start_notified_at: startsAt,
      updated_at: startsAt,
    }).eq('id', mentoring.id),
    db.from('profiles').update({
      tier_starts_at: startsAt,
      tier_expires_at: expiresAt,
    }).eq('id', user.id),
  ])

  const [{ data: userProfile }, { data: mentorProfile }] = await Promise.all([
    db.from('profiles').select('full_name, email').eq('id', user.id).maybeSingle(),
    mentoring.mentor_id
      ? db.from('profiles').select('full_name, email').eq('id', mentoring.mentor_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  await sendPackageStartedNotifications(db, {
    userId: user.id,
    userEmail: userProfile?.email || user.email,
    userName: userProfile?.full_name || user.user_metadata?.full_name,
    tier: mentoring.tier,
    startsAt,
    expiresAt,
    mentorId: mentoring.mentor_id,
    mentorEmail: mentoring.mentor_email || mentorProfile?.email,
    mentorName: mentoring.mentor_name || mentorProfile?.full_name,
  })

  return NextResponse.json({
    ok: true,
    alreadyActivated: false,
    wa_group_link: mentoring.wa_group_link,
    starts_at: startsAt,
    expires_at: expiresAt,
  })
}

