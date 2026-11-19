import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  // 1. Fetch user profile
  let { data: profile } = await db
    .from('profiles')
    .select('id, full_name, avatar_url, role, is_active, referral_code, school_name, phone')
    .eq('id', user.id)
    .maybeSingle()

  // Only users approved as Content Creator (via /career/content-creator + admin
  // approval in /api/admin/career-applications) may read the creator dashboard data.
  if (profile?.role !== 'creator' || profile?.is_active !== true) {
    return NextResponse.json({ error: 'Forbidden: bukan content creator yang disetujui' }, { status: 403 })
  }

  // Auto-generate referral code if not present yet
  let referralCode = profile?.referral_code
  if (!referralCode) {
    const cleanName = (profile?.full_name || 'CREATOR')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 6)
      .toUpperCase()
    referralCode = `OTW-${cleanName}-${user.id.slice(0, 4).toUpperCase()}`

    await db
      .from('profiles')
      .update({ referral_code: referralCode })
      .eq('id', user.id)
  }

  // 2. Fetch referral commissions
  const { data: commissions } = await db
    .from('ambassador_commissions')
    .select('id, amount, status, tier_purchased, created_at')
    .eq('ambassador_id', user.id)
    .order('created_at', { ascending: false })

  const totalReferred = (commissions ?? []).length
  const totalReferralEarnings = (commissions ?? []).reduce((sum, c) => sum + (c.amount || 0), 0)

  // 3. Fetch withdrawal requests
  const { data: withdrawals } = await db
    .from('withdrawal_requests')
    .select('id, amount, status, bank_name, account_number, account_holder, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const alreadyWithdrawn = (withdrawals ?? [])
    .filter((w) => w.status === 'paid')
    .reduce((sum, w) => sum + (w.amount || 0), 0)

  const pendingWithdrawal = (withdrawals ?? [])
    .filter((w) => w.status === 'pending' || w.status === 'approved')
    .reduce((sum, w) => sum + (w.amount || 0), 0)

  // 4. Fetch video submissions
  let submissions: any[] = []
  try {
    const { data: subData, error: subError } = await db
      .from('creator_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!subError && subData) {
      submissions = subData
    }
  } catch (err) {
    console.warn('creator_submissions table not yet ready or empty:', err)
  }

  const totalVideosSubmitted = submissions.length
  const totalVideosApproved = submissions.filter((s) => s.status === 'approved' || s.status === 'rewarded').length
  const totalContentReward = submissions
    .filter((s) => s.status === 'rewarded')
    .reduce((sum, s) => sum + (s.reward_amount || 0), 0)

  const grandTotalEarnings = totalReferralEarnings + totalContentReward
  const activeBalance = grandTotalEarnings - alreadyWithdrawn - pendingWithdrawal

  return NextResponse.json({
    profile: {
      id: user.id,
      name: profile?.full_name || 'Creator OtwPTN',
      avatar: profile?.avatar_url || '/avatars/avatar-1.png',
      role: profile?.role || 'creator',
      referralCode,
      referralUrl: `https://otwptn.com/upgrade?ref=${referralCode}`,
    },
    financials: {
      totalEarnings: grandTotalEarnings,
      referralEarnings: totalReferralEarnings,
      contentRewards: totalContentReward,
      alreadyWithdrawn,
      pendingWithdrawal,
      activeBalance: Math.max(0, activeBalance),
    },
    metrics: {
      totalReferred,
      totalVideosSubmitted,
      totalVideosApproved,
      totalPendingReview: submissions.filter((s) => s.status === 'pending').length,
    },
    submissions,
    recentCommissions: (commissions ?? []).slice(0, 8),
    recentWithdrawals: (withdrawals ?? []).slice(0, 5),
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db0 = createServiceClient()
  const { data: callerProfile } = await db0
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .maybeSingle()

  if (callerProfile?.role !== 'creator' || callerProfile?.is_active !== true) {
    return NextResponse.json({ error: 'Forbidden: bukan content creator yang disetujui' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { title, platform, video_url, campaign_topic, caption_used, view_count } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Judul video wajib diisi' }, { status: 400 })
    }

    if (!video_url || typeof video_url !== 'string' || !video_url.trim().startsWith('http')) {
      return NextResponse.json({ error: 'Link video valid (diawali http/https) wajib diisi' }, { status: 400 })
    }

    const validPlatforms = ['tiktok', 'instagram', 'youtube', 'other']
    const cleanPlatform = validPlatforms.includes(platform) ? platform : 'tiktok'

    const db = createServiceClient()

    const { data: newSubmission, error } = await db
      .from('creator_submissions')
      .insert({
        user_id: user.id,
        title: title.trim().slice(0, 200),
        platform: cleanPlatform,
        video_url: video_url.trim(),
        campaign_topic: (campaign_topic || 'Umum').trim().slice(0, 100),
        caption_used: (caption_used || '').trim().slice(0, 1000),
        view_count: Number(view_count) || 0,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting creator submission:', error)
      return NextResponse.json(
        { error: 'Gagal menyimpan submission video. Hubungi admin atau coba lagi.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Video konten berhasil disubmit! Tim kami akan meninjau dan memperbarui statusnya.',
      submission: newSubmission,
    })
  } catch (err: any) {
    console.error('Creator submission POST error:', err)
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan sistem' }, { status: 500 })
  }
}
