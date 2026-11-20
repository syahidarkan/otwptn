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

    // 3. Auto-activate or deactivate the creator profile and grant Web Premium.
    // When accepted, their account is automatically upgraded to Premium so they
    // can explore and showcase all OTWPTN features (calculator, essay review, etc.).
    if (application) {
      try {
        if (status === 'accepted') {
          const targets = [application.user_id, application.email].filter(Boolean)
          const now = new Date()
          const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
          for (const key of targets) {
            const col = key === application.user_id ? 'id' : 'email'
            const { data: existing } = await supabase.from('profiles').select('role, tier').eq(col, key).single()
            const roleUpdate = !existing?.role || existing.role === 'user' ? { role: 'creator' } : {}
            // Auto upgrade account to web_premium if currently free or unset
            const tierUpdate = (!existing?.tier || existing.tier === 'free') ? {
              tier: 'web_premium',
              tier_starts_at: now.toISOString(),
              tier_expires_at: expiresAt,
              pending_activation_tier: null,
            } : {}
            await supabase.from('profiles').update({
              is_creator: true,
              is_active: true,
              ...roleUpdate,
              ...tierUpdate,
            }).eq(col, key)
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
