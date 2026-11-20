import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const PAGE_SIZE = 30

async function requireAdmin() {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, isAdmin: false }
  const { data: profile } = await supabase.from('profiles').select('is_admin, role').eq('id', user.id).single()
  const isAdmin = !!profile?.is_admin || profile?.role === 'superadmin' || profile?.role === 'admin'
  return { supabase, isAdmin }
}

export async function GET(req: Request) {
  const { supabase, isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')?.trim() ?? ''
  const role = searchParams.get('role') ?? 'all'
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '0', 10) || 0)

  let query = supabase
    .from('profiles')
    .select('id, full_name, email, phone, school_name, tier, tier_expires_at, role, is_admin, is_active, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    const term = `%${search}%`
    query = query.or(`full_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`)
  }
  if (role !== 'all') {
    query = query.eq('role', role)
  }

  const from = page * PAGE_SIZE
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ users: data ?? [], total: count ?? 0, page, pageSize: PAGE_SIZE })
}
