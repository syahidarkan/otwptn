import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
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

  const { data: applications, error } = await supabase
    .from('career_applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ applications: applications || [] })
}

export async function PATCH(request: Request) {
  const { supabase, isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { id, status } = await request.json()
    if (!id || !status) {
      return NextResponse.json({ error: 'Parameter id dan status wajib diisi' }, { status: 400 })
    }

    const validStatuses = ['pending', 'reviewed', 'interview', 'accepted', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
    }

    const { error } = await supabase
      .from('career_applications')
      .update({ status })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id, status })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 })
  }
}
