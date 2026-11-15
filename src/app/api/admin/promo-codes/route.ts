import { NextResponse } from 'next/server'
import { z } from 'zod'
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

const createSchema = z.object({
  code: z.string().min(3).max(30).transform(v => v.trim().toUpperCase()),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().positive(),
  max_uses: z.number().int().positive().nullable().optional(),
  valid_until: z.string().nullable().optional(),
  notes: z.string().max(500).optional(),
  is_active: z.boolean().default(true),
})

export async function GET() {
  const { supabase, isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // Table might not be migrated yet in Supabase SQL editor
      if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
        return NextResponse.json({ promoCodes: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ promoCodes: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { supabase, isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: parsed.error.flatten() }, { status: 400 })
    }

    const { code, discount_type, discount_value, max_uses, valid_until, notes, is_active } = parsed.data

    if (discount_type === 'percentage' && discount_value > 100) {
      return NextResponse.json({ error: 'Diskon persentase maksimal 100%' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('promo_codes')
      .insert({
        code,
        discount_type,
        discount_value,
        max_uses: max_uses ?? null,
        valid_until: valid_until ? new Date(valid_until).toISOString() : null,
        notes: notes || null,
        is_active: is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique')) {
        return NextResponse.json({ error: `Kode promo "${code}" sudah pernah dibuat.` }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, promoCode: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const { supabase, isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { id, is_active, max_uses, valid_until, notes } = await request.json()
    if (!id) return NextResponse.json({ error: 'ID promo wajib diisi' }, { status: 400 })

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    if (typeof is_active === 'boolean') updates.is_active = is_active
    if (max_uses !== undefined) updates.max_uses = max_uses
    if (valid_until !== undefined) updates.valid_until = valid_until ? new Date(valid_until).toISOString() : null
    if (notes !== undefined) updates.notes = notes

    const { data, error } = await supabase
      .from('promo_codes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, promoCode: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { supabase, isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID promo wajib diisi' }, { status: 400 })

    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
