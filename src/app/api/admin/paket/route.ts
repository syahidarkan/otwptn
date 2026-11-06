import { createAdminClient, createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { TIERS, type Tier } from '@/lib/pricing'

async function requireAdmin() {
  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const { data: profile } = await auth.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  return { user }
}

type AdminClient = Awaited<ReturnType<typeof createAdminClient>>

// PostgREST caps a response at 1000 rows, so page through paid orders to get an honest sum.
async function sumPaidRevenue(supabase: AdminClient): Promise<number> {
  const pageSize = 1000
  let total = 0
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('orders')
      .select('amount')
      .eq('status', 'paid')
      .range(from, from + pageSize - 1)
    if (error || !data) break
    total += data.reduce((sum, row) => sum + (row.amount ?? 0), 0)
    if (data.length < pageSize) break
  }
  return total
}

export async function GET() {
  const guard = await requireAdmin()
  if (guard.error) return guard.error

  const supabase = await createAdminClient()

  const [
    paidRes,
    manualRes,
    pendingRes,
    revenue,
    recentRes,
    squadRes,
    activeMentoringRes,
    mentorRes,
    ...tierCounts
  ] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true })
      .eq('status', 'paid').or('payment_method.is.null,payment_method.neq.manual'),
    supabase.from('orders').select('id', { count: 'exact', head: true })
      .eq('status', 'paid').eq('payment_method', 'manual'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    sumPaidRevenue(supabase),
    supabase.from('orders')
      .select('id, tier, mode, track, amount, status, payment_method, created_at, paid_at, profiles!user_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(25),
    supabase.from('squads').select('status'),
    supabase.from('mentoring').select('mentor_id').eq('status', 'active').not('mentor_id', 'is', null),
    supabase.from('mentor_applications').select('user_id, full_name').eq('status', 'approved'),
    ...TIERS.map(tier =>
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('tier', tier),
    ),
  ])

  const subscribers = Object.fromEntries(
    TIERS.map((tier, i) => [tier, tierCounts[i].count ?? 0]),
  ) as Record<Tier, number>

  const squads = { forming: 0, active: 0, completed: 0 }
  for (const s of squadRes.data ?? []) {
    if (s.status in squads) squads[s.status as keyof typeof squads] += 1
  }

  const mentors = mentorRes.data ?? []
  const mentorIds = mentors.map(m => m.user_id).filter(Boolean)
  const { data: capacityRows } = mentorIds.length
    ? await supabase.from('profiles').select('id, mentor_capacity').in('id', mentorIds)
    : { data: [] as { id: string; mentor_capacity: number | null }[] }

  const capacityMap = new Map((capacityRows ?? []).map(p => [p.id, p.mentor_capacity ?? 5]))
  const loadMap = new Map<string, number>()
  for (const row of activeMentoringRes.data ?? []) {
    if (row.mentor_id) loadMap.set(row.mentor_id, (loadMap.get(row.mentor_id) ?? 0) + 1)
  }

  const mentorUtilisation = mentors
    .map(m => ({
      mentor_id: m.user_id,
      name: m.full_name,
      active: loadMap.get(m.user_id) ?? 0,
      capacity: capacityMap.get(m.user_id) ?? 5,
    }))
    .sort((a, b) => b.active / b.capacity - a.active / a.capacity)

  return NextResponse.json({
    stats: {
      paidOrders: paidRes.count ?? 0,
      manualGrants: manualRes.count ?? 0,
      pendingOrders: pendingRes.count ?? 0,
      revenue,
    },
    subscribers,
    squads,
    mentorUtilisation,
    recentOrders: recentRes.data ?? [],
  })
}

const actionSchema = z.object({
  action: z.enum(['grant', 'revoke']),
  email: z.string().trim().toLowerCase().email(),
  tier: z.enum(TIERS).optional(),
})

export async function POST(request: Request) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error
  const admin = guard.user

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  const parsed = actionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Email atau paket tidak valid' }, { status: 400 })
  }
  const { action, email, tier } = parsed.data

  if (action === 'grant' && !tier) {
    return NextResponse.json({ error: 'Pilih paket yang mau diberikan' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  // Escape LIKE wildcards so the lookup is an exact, case-insensitive email match.
  const escapedEmail = email.replace(/[\\%_]/g, c => `\\${c}`)
  const { data: target } = await supabase
    .from('profiles')
    .select('id, full_name, email, tier')
    .ilike('email', escapedEmail)
    .maybeSingle()

  if (!target) {
    return NextResponse.json({ error: 'Akun dengan email itu tidak ditemukan' }, { status: 404 })
  }

  const now = new Date().toISOString()
  const previousTier = target.tier ?? 'free'

  if (action === 'grant' && tier) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: target.id,
        tier,
        mode: 'individu',
        track: 'essay',
        amount: 0,
        status: 'paid',
        payment_method: 'manual',
        invoice_number: `MAN-${Date.now()}-${target.id.slice(0, 8).toUpperCase()}`,
        notes: `Diberikan manual oleh admin (${admin.email ?? admin.id})`,
        confirmed_by: admin.id,
        confirmed_at: now,
        paid_at: now,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error('[admin/paket] manual order insert failed:', orderError)
      return NextResponse.json({ error: 'Gagal mencatat order manual' }, { status: 500 })
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ tier, updated_at: now })
      .eq('id', target.id)

    if (profileError) {
      console.error('[admin/paket] profile tier update failed:', profileError)
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id)
      return NextResponse.json({ error: 'Gagal mengubah paket akun' }, { status: 500 })
    }

    await writeAudit(supabase, admin.id, 'grant_tier', target.id, {
      email: target.email,
      previous_tier: previousTier,
      new_tier: tier,
      order_id: order.id,
    })

    return NextResponse.json({ ok: true, message: `Paket ${tier} diberikan ke ${target.email}` })
  }

  const { error: revokeError } = await supabase
    .from('profiles')
    .update({ tier: 'free', updated_at: now })
    .eq('id', target.id)

  if (revokeError) {
    console.error('[admin/paket] revoke failed:', revokeError)
    return NextResponse.json({ error: 'Gagal mencabut paket akun' }, { status: 500 })
  }

  await writeAudit(supabase, admin.id, 'revoke_tier', target.id, {
    email: target.email,
    previous_tier: previousTier,
    new_tier: 'free',
  })

  return NextResponse.json({ ok: true, message: `Paket ${target.email} dikembalikan ke Free` })
}

async function writeAudit(
  supabase: AdminClient,
  adminId: string,
  action: string,
  targetUserId: string,
  payload: Record<string, unknown>,
) {
  const { error } = await supabase.from('admin_audit_log').insert({
    admin_id: adminId,
    action,
    target_user_id: targetUserId,
    payload,
  })
  if (error) console.error('[admin/paket] audit log insert failed:', error)
}
