import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { processPackageReminders } from '@/lib/packageLifecycle'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Trigger lazy reminder check for this mentor in background
  processPackageReminders(createServiceClient(), user.id).catch(() => {})

  // Get mentoring records where mentor_id = current user
  const { data: records } = await supabase
    .from('mentoring')
    .select(`
      id, tier, wa_group_link, wa_group_joined_at, package_starts_at, package_expires_at,
      mentor_name, status, zoom_sessions_total, zoom_sessions_used,
      revision_count_total, revision_count_used, checklist,
      profiles:user_id (id, full_name, avatar_url, school_name, target_ptns, email, phone)
    `)
    .eq('mentor_id', user.id)
    .eq('status', 'active')

  return NextResponse.json({ mentees: records ?? [] })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { mentoring_id, checklist, wa_group_link, zoom_link, vip_analysis } = body

  if (!mentoring_id) return NextResponse.json({ error: 'Missing mentoring_id' }, { status: 400 })

  // Verify this mentor owns this mentoring record
  const { data: record } = await supabase
    .from('mentoring')
    .select('mentor_id')
    .eq('id', mentoring_id)
    .single()

  if (!record || record.mentor_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const isShortText = (v: unknown) => v === null || (typeof v === 'string' && v.length <= 500)
  if (
    (checklist !== undefined && JSON.stringify(checklist ?? null).length > 20000) ||
    (wa_group_link !== undefined && !isShortText(wa_group_link)) ||
    (zoom_link !== undefined && !isShortText(zoom_link)) ||
    (vip_analysis !== undefined && JSON.stringify(vip_analysis ?? null).length > 50000)
  ) {
    return NextResponse.json({ error: 'Data terlalu besar atau tidak valid' }, { status: 400 })
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (checklist !== undefined) updates.checklist = checklist
  if (wa_group_link !== undefined) updates.wa_group_link = wa_group_link
  if (zoom_link !== undefined) updates.zoom_link = zoom_link
  if (vip_analysis !== undefined) updates.vip_analysis = vip_analysis

  const { error } = await supabase
    .from('mentoring')
    .update(updates)
    .eq('id', mentoring_id)

  if (error) return NextResponse.json({ error: 'Gagal menyimpan' }, { status: 500 })
  return NextResponse.json({ success: true })
}
