import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, isAdmin: false }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.is_admin || profile?.role === 'superadmin' || profile?.role === 'admin'
  return { user, isAdmin }
}

export async function GET() {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('jalur_pages')
    .select('*')
    .order('university', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ jalurs: data ?? [] })
}

export async function POST(request: Request) {
  const { user, isAdmin } = await requireAdmin()
  if (!isAdmin || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { action = 'save', id, payload, is_active } = body
  const db = createServiceClient()

  try {
    if (action === 'toggle') {
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
      const { error } = await db
        .from('jalur_pages')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === 'save') {
      if (!payload || !payload.university || !payload.name) {
        return NextResponse.json({ error: 'Nama universitas dan nama jalur wajib diisi' }, { status: 400 })
      }

      if (id) {
        // Update existing
        const { error } = await db
          .from('jalur_pages')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', id)

        if (error) throw error
      } else {
        // Insert new
        const { error } = await db
          .from('jalur_pages')
          .insert({ ...payload, is_active: true, created_at: new Date().toISOString() })

        if (error) throw error
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'delete') {
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
      const { error } = await db.from('jalur_pages').delete().eq('id', id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 })
  } catch (err: any) {
    console.error('[Admin Jalur Error]', err)
    return NextResponse.json({ error: err?.message || 'Gagal memproses jalur' }, { status: 500 })
  }
}
