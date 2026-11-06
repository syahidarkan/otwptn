import { createAdminClient, createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await auth.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = await createAdminClient()

  const { data: squads } = await supabase
    .from('squads')
    .select('id, track, tier, invite_code, status, mentor_id, mentor_name, created_at')
    .order('created_at', { ascending: false })

  const squadIds = (squads ?? []).map(s => s.id)
  const { data: members } = squadIds.length
    ? await supabase
        .from('orders')
        .select('id, squad_group_id, status, user_id, profiles!user_id(full_name, email)')
        .in('squad_group_id', squadIds)
    : { data: [] }

  const membersBySquad = new Map<string, unknown[]>()
  for (const m of members ?? []) {
    const list = membersBySquad.get(m.squad_group_id as string) ?? []
    list.push(m)
    membersBySquad.set(m.squad_group_id as string, list)
  }

  const result = (squads ?? []).map(s => ({
    ...s,
    members: membersBySquad.get(s.id) ?? [],
  }))

  return NextResponse.json({ squads: result })
}
