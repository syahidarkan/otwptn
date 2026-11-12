import { createClient, createServiceClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/security'
import { NextResponse } from 'next/server'
import { MODES, TRACKS, TIERS, TIER_LABELS, getPrice, getAddonPrice, getInterSurcharge, type Mode, type Track, type Tier } from '@/lib/pricing'
import { JALUR_LIST } from '@/lib/constants'

function isMode(v: unknown): v is Mode {
  return typeof v === 'string' && (MODES as readonly string[]).includes(v)
}
function isTrack(v: unknown): v is Track {
  return typeof v === 'string' && (TRACKS as readonly string[]).includes(v)
}
function isTier(v: unknown): v is Tier {
  return typeof v === 'string' && (TIERS as readonly string[]).includes(v)
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I ambiguity
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // RLS only lets a user read/write their own rows, so referral lookup, squad create/join and
  // order insert run through the service client AFTER the auth check above. Amounts are always
  // recomputed from the server-side price matrix, never taken from the client.
  const db = createServiceClient()

  if (!(await rateLimit('checkout', user.id, 20, 600))) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan. Tunggu beberapa menit.' }, { status: 429 })
  }

  const {
    tier,
    mode = 'individu',
    track = 'essay',
    payment_method = 'mayar',
    referral_code,
    squad_action,
    squad_invite_code,
    main_jalur,
    addon_jalurs = [],
    target_ptn,
    target_faculty,
    target_major,
  } = await request.json()

  if (!isTier(tier)) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  if (!isMode(mode)) return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  if (!isTrack(track)) return NextResponse.json({ error: 'Invalid track' }, { status: 400 })
  if (!['mayar'].includes(payment_method)) {
    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
  }

  const priceEntry = getPrice(mode, track, tier)
  const tierName = `${TIER_LABELS[tier]}${mode === 'squad' ? ' (Squad)' : ''}`

  // Referral discount only applies to Individu - Squad pricing is already fixed/discounted.
  let appliedReferralCode: string | null = null
  let baseAmount = priceEntry.amount
  if (mode === 'individu' && typeof referral_code === 'string' && referral_code.trim()) {
    const code = referral_code.trim().toUpperCase()
    if (!(await rateLimit('referral_lookup', user.id, 15, 600))) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan kode referral. Coba lagi nanti.' }, { status: 429 })
    }
    const { data: ambassador } = await db
      .from('profiles')
      .select('id, referral_code')
      .eq('referral_code', code)
      .maybeSingle()
    if (ambassador && ambassador.id !== user.id && priceEntry.referralAmount) {
      appliedReferralCode = code
      baseAmount = priceEntry.referralAmount
    }
  }

  // Check main jalur for International surcharge
  let mainJalurObj = null
  let interSurcharge = 0
  if (typeof main_jalur === 'string' && main_jalur.trim()) {
    mainJalurObj = JALUR_LIST.find(j => j.id === main_jalur.trim())
    if (mainJalurObj?.isInter) {
      interSurcharge = getInterSurcharge(tier)
    }
  }

  // Check addon jalurs
  let addonTotal = 0
  const validAddons: string[] = []
  if (Array.isArray(addon_jalurs)) {
    for (const addonId of addon_jalurs) {
      if (typeof addonId === 'string') {
        const found = JALUR_LIST.find(j => j.id === addonId)
        if (found && found.id !== main_jalur) {
          validAddons.push(found.id)
          const addonTrack: Track = found.category === 'hybrid' ? 'hybrid' : (found.category === 'prestasi_only' ? 'prestasi' : 'essay')
          addonTotal += getAddonPrice(addonTrack, found.isInter)
        }
      }
    }
  }

  baseAmount += interSurcharge + addonTotal

  // Sync user's selected/edited target PTN, major, and jalur back to their profile
  const cleanTargetPtn = typeof target_ptn === 'string' ? target_ptn.trim().slice(0, 120) : ''
  const cleanTargetFaculty = typeof target_faculty === 'string' ? target_faculty.trim().slice(0, 150) : ''
  const cleanTargetMajor = typeof target_major === 'string' ? target_major.trim().slice(0, 150) : ''
  const cleanMainJalur = typeof main_jalur === 'string' ? main_jalur.trim() : ''

  if (cleanTargetPtn || cleanTargetMajor || cleanMainJalur) {
    const { data: existingProf } = await db
      .from('profiles')
      .select('target_ptns, target_majors, target_jalurs')
      .eq('id', user.id)
      .maybeSingle()

    const profUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (cleanTargetPtn) {
      const prevPtns = Array.isArray(existingProf?.target_ptns) ? existingProf.target_ptns : []
      profUpdate.target_ptns = [cleanTargetPtn, ...prevPtns.filter((p: string) => p !== cleanTargetPtn)].slice(0, 4)
    }
    if (cleanTargetMajor) {
      const prevMajs = Array.isArray(existingProf?.target_majors) ? existingProf.target_majors : []
      profUpdate.target_majors = [cleanTargetMajor, ...prevMajs.filter((m: string) => m !== cleanTargetMajor)].slice(0, 4)
    }
    if (cleanMainJalur) {
      const prevJalurs = Array.isArray(existingProf?.target_jalurs) ? existingProf.target_jalurs : []
      profUpdate.target_jalurs = [cleanMainJalur, ...prevJalurs.filter((j: string) => j !== cleanMainJalur)].slice(0, 6)
    }
    await db.from('profiles').update(profUpdate).eq('id', user.id)

    await db.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        ...(profUpdate.target_ptns ? { target_ptns: profUpdate.target_ptns } : {}),
        ...(profUpdate.target_majors ? { target_majors: profUpdate.target_majors } : {}),
        ...(profUpdate.target_jalurs ? { target_jalurs: profUpdate.target_jalurs } : {}),
      },
    }).catch(() => {})
  }

  // Squad: create a new group, or join an existing one by invite code.
  let squadGroupId: string | null = null
  if (mode === 'squad') {
    if (squad_action === 'join') {
      if (typeof squad_invite_code !== 'string' || !squad_invite_code.trim()) {
        return NextResponse.json({ error: 'Kode undangan squad wajib diisi' }, { status: 400 })
      }
      // Invite codes are 6 chars: throttle guessing per user.
      if (!(await rateLimit('squad_join', user.id, 10, 900))) {
        return NextResponse.json({ error: 'Terlalu banyak percobaan kode. Coba lagi dalam 15 menit.' }, { status: 429 })
      }
      const { data: squad } = await db
        .from('squads')
        .select('id, track, tier, status')
        .eq('invite_code', squad_invite_code.trim().toUpperCase())
        .maybeSingle()

      if (!squad) return NextResponse.json({ error: 'Kode undangan squad tidak ditemukan' }, { status: 404 })
      if (squad.track !== track || squad.tier !== tier) {
        return NextResponse.json({ error: 'Track/tier squad ini beda sama pilihanmu' }, { status: 400 })
      }
      if (squad.status !== 'forming') {
        return NextResponse.json({ error: 'Squad ini sudah penuh atau sudah berjalan' }, { status: 400 })
      }
      const { count: seatCount } = await db
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('squad_group_id', squad.id)
        .in('status', ['pending', 'paid'])
      if ((seatCount ?? 0) >= 3) {
        return NextResponse.json({ error: 'Squad ini sudah penuh (maks 3 orang)' }, { status: 400 })
      }
      const { count: ownSeat } = await db
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('squad_group_id', squad.id)
        .eq('user_id', user.id)
        .eq('status', 'paid')
      if ((ownSeat ?? 0) > 0) {
        return NextResponse.json({ error: 'Kamu sudah terdaftar di squad ini' }, { status: 400 })
      }
      squadGroupId = squad.id
    } else {
      const { data: newSquad, error: squadError } = await db
        .from('squads')
        .insert({ track, tier, invite_code: generateInviteCode(), status: 'forming' })
        .select('id')
        .single()
      if (squadError || !newSquad) {
        return NextResponse.json({ error: 'Gagal membuat squad' }, { status: 500 })
      }
      squadGroupId = newSquad.id
    }
  }

  // Reuse existing pending order for the same tier/mode/track (avoids duplicate payment links)
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id, payment_url, doku_reference')
    .eq('user_id', user.id)
    .eq('tier', tier)
    .eq('mode', mode)
    .eq('track', track)
    .eq('status', 'pending')
    .eq('payment_method', payment_method)
    .gte('created_at', thirtyMinutesAgo)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Only reuse if the stored URL uses the correct Mayar /pl/ format
  if (existingOrder?.payment_url && existingOrder.payment_url.includes('/pl/')) {
    return NextResponse.json({
      payment_method,
      payment_url: existingOrder.payment_url,
      order_id: existingOrder.id,
    })
  }

  // Rate limit: max 5 pending orders per user per 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { count: recentOrders } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .gte('created_at', tenMinutesAgo)
  if ((recentOrders ?? 0) >= 5) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan. Tunggu beberapa menit.' }, { status: 429 })
  }

  const invoiceNumber = `INV-${Date.now()}-${user.id.slice(0, 8).toUpperCase()}`

  // Jago bank transfer: unique amount (base + random 3-digit suffix) for matching
  const uniqueAmount = payment_method === 'transfer'
    ? baseAmount + Math.floor(Math.random() * 900) + 100
    : baseAmount

  const { data: order, error: orderError } = await db.from('orders').insert({
    user_id: user.id,
    tier,
    mode,
    track,
    squad_group_id: squadGroupId,
    referral_code: appliedReferralCode,
    amount: uniqueAmount,
    status: 'pending',
    invoice_number: invoiceNumber,
    payment_method,
    notes: JSON.stringify({
      main_jalur: mainJalurObj?.id ?? main_jalur ?? null,
      addon_jalurs: validAddons,
      inter_surcharge: interSurcharge,
      addon_total: addonTotal,
      target_ptn: cleanTargetPtn || null,
      target_faculty: cleanTargetFaculty || null,
      target_major: cleanTargetMajor || null,
    }),
  }).select('id').single()

  if (orderError || !order) {
    console.error('[checkout] insert error:', orderError)
    return NextResponse.json({ error: 'Failed to create order', details: orderError?.message }, { status: 500 })
  }

  if (payment_method === 'transfer') {
    return NextResponse.json({
      payment_method: 'transfer',
      order_id: order.id,
      invoice_number: invoiceNumber,
      bank_name: 'Bank Jago',
      account_number: process.env.JAGO_ACCOUNT_NUMBER ?? '',
      account_name: process.env.JAGO_ACCOUNT_NAME ?? '',
      amount: uniqueAmount,
      base_amount: baseAmount,
      tier_name: tierName,
    })
  }

  // Mayar payment link
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  try {
    const mayarRes = await fetch('https://api.mayar.id/hl/v1/product/paymentlink/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MAYAR_API_KEY ?? ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `OTWPTN ${tierName} - ${invoiceNumber}`,
        description: `Paket ${tierName} otwptn.com`,
        amount: baseAmount,
        redirectUrl: `${appUrl}/dashboard?payment=success`,
      }),
    })

    const mayarData = await mayarRes.json()

    if (!mayarRes.ok || !mayarData?.data?.id) {
      await db.from('orders').update({ status: 'failed' }).eq('id', order.id)
      return NextResponse.json({ error: 'Gagal membuat payment link', details: mayarData }, { status: 502 })
    }

    // data.link is the full payment page URL returned by Mayar create API
    // e.g. https://otwptn.myr.id/pl/{slug} - use it directly, /pay/{uuid} is not a valid format
    const paymentUrl = mayarData.data.link as string

    await db.from('orders').update({
      doku_reference: mayarData.data.id,
      payment_url: paymentUrl,
    }).eq('id', order.id)

    return NextResponse.json({
      payment_method: 'mayar',
      payment_url: paymentUrl,
      order_id: order.id,
    })
  } catch {
    await db.from('orders').update({ status: 'failed' }).eq('id', order.id)
    return NextResponse.json({ error: 'Gagal terhubung ke Mayar' }, { status: 503 })
  }
}
