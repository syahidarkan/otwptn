import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/security'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()

  // Fetch basic profile info
  const { data: profile } = await service
    .from('profiles')
    .select('full_name, school_name, target_ptns, tier')
    .eq('id', user.id)
    .maybeSingle()

  // Check if there is an active mentoring record with VIP analysis
  const { data: mentoring } = await service
    .from('mentoring')
    .select('vip_analysis, mentor_name, updated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({
    profile: profile || null,
    mentorAnalysis: mentoring?.vip_analysis || null,
    mentorName: mentoring?.mentor_name || null,
    updatedAt: mentoring?.updated_at || null,
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!(await rateLimit('academic_profile_save', user.id, 30, 60))) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan simpan.' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const service = createServiceClient()

  // Sync school_name and target_ptns to user profiles table if provided
  const schoolName = typeof body.schoolName === 'string' ? body.schoolName.trim().slice(0, 150) : null
  const pilihan1Ptn = typeof body.pilihan1Ptn === 'string' ? body.pilihan1Ptn.trim().slice(0, 100) : null
  const pilihan2Ptn = typeof body.pilihan2Ptn === 'string' ? body.pilihan2Ptn.trim().slice(0, 100) : null

  const targetPtns = [pilihan1Ptn, pilihan2Ptn].filter(Boolean) as string[]

  const profileUpdates: Record<string, unknown> = {}
  if (schoolName) profileUpdates.school_name = schoolName
  if (targetPtns.length > 0) profileUpdates.target_ptns = targetPtns

  if (Object.keys(profileUpdates).length > 0) {
    await service.from('profiles').update(profileUpdates).eq('id', user.id)
  }

  return NextResponse.json({ ok: true, savedAt: new Date().toISOString() })
}

