import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createAdminClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, isAdmin: false }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, role')
    .eq('id', user.id)
    .single()

  const isAdmin = !!profile?.is_admin || profile?.role === 'superadmin' || profile?.role === 'admin'
  return { supabase, user, isAdmin }
}

export async function GET() {
  const { supabase, isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { data: submissions, error } = await supabase
      .from('creator_submissions')
      .select('*, profiles:user_id(full_name, email, phone, referral_code, avatar_url)')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ submissions: [], error: error.message })
    }

    return NextResponse.json({ submissions: submissions || [] })
  } catch (err: any) {
    return NextResponse.json({ submissions: [], error: err.message })
  }
}

export async function PATCH(request: Request) {
  const { supabase, isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { id, status, reward_amount, admin_notes, view_count } = await request.json()
    if (!id) return NextResponse.json({ error: 'Parameter id wajib diisi' }, { status: 400 })

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (typeof reward_amount === 'number') updates.reward_amount = reward_amount
    if (typeof admin_notes === 'string') updates.admin_notes = admin_notes
    if (typeof view_count === 'number') updates.view_count = view_count

    const { data, error } = await supabase
      .from('creator_submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, submission: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal update submission' }, { status: 500 })
  }
}
