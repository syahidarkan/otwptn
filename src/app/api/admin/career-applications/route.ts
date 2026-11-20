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

    // 1. Fetch current application to get associated user_id and email
    const { data: application } = await supabase
      .from('career_applications')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    // 2. Update status in career_applications
    const { error } = await supabase
      .from('career_applications')
      .update({ status })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 3. Auto-activate or deactivate the creator profile. is_creator is the real
    // access flag (dashboard/creator gate checks it), so approving/rejecting a
    // creator application never touches is_active or role for an account that
    // already has standing as a member/mentor under this email.
    if (application) {
      try {
        if (status === 'accepted') {
          const targets = [application.user_id, application.email].filter(Boolean)
          for (const key of targets) {
            const col = key === application.user_id ? 'id' : 'email'
            const { data: existing } = await supabase.from('profiles').select('role').eq(col, key).single()
            const roleUpdate = !existing?.role || existing.role === 'user' ? { role: 'creator' } : {}
            await supabase.from('profiles').update({ is_creator: true, is_active: true, ...roleUpdate }).eq(col, key)
          }
        } else if (status === 'rejected') {
          if (application.user_id) {
            await supabase.from('profiles').update({ is_creator: false }).eq('id', application.user_id)
          }
          if (application.email) {
            await supabase.from('profiles').update({ is_creator: false }).eq('email', application.email)
          }
        }
      } catch (profSyncErr) {
        console.warn('[Admin Career Applications Profile Sync Warn]', profSyncErr)
      }
    }

    return NextResponse.json({ success: true, id, status })
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 })
  }
}
