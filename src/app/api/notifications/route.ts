import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/app/api/admin/broadcast/serviceClient'
import { userMatchesAudience, AUDIENCES, type Audience } from '@/app/api/admin/broadcast/audience'

const NOTIFICATION_FIELDS = 'id, broadcast_id, title, message, cta_url, kind, read_at, created_at'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // RLS limits this to the caller's own rows.
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select(NOTIFICATION_FIELDS)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[notifications] list failed:', error.message)
    return NextResponse.json({ error: 'Gagal memuat notifikasi' }, { status: 500 })
  }

  // Active banner: broadcasts is admin-only under RLS, so read it with the service role and
  // only hand back the fields the banner needs, and only to users in the target audience.
  let banner: { id: string; title: string; message: string; cta_url: string | null } | null = null
  try {
    const db = createServiceClient()
    const { data: row } = await db
      .from('broadcasts')
      .select('id, title, message, cta_url, audience')
      .eq('channel', 'banner')
      .eq('banner_active', true)
      .eq('is_test', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (row && (AUDIENCES as readonly string[]).includes(row.audience)) {
      if (await userMatchesAudience(db, user.id, row.audience as Audience)) {
        banner = { id: row.id, title: row.title, message: row.message, cta_url: row.cta_url }
      }
    }
  } catch (err) {
    console.error('[notifications] banner lookup failed:', err)
  }

  return NextResponse.json({ userId: user.id, notifications: notifications ?? [], banner })
}

const markSchema = z.union([
  z.object({ all: z.literal(true) }),
  z.object({ ids: z.array(z.string().uuid()).min(1).max(200) }),
])

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  const parsed = markSchema.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })

  let query = supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)

  if ('ids' in parsed.data) query = query.in('id', parsed.data.ids)

  const { error } = await query
  if (error) {
    console.error('[notifications] mark read failed:', error.message)
    return NextResponse.json({ error: 'Gagal menandai dibaca' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
