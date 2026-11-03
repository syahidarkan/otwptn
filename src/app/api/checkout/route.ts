import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const TIER_PRICES: Record<string, { amount: number; name: string }> = {
  web_premium: { amount: 49000, name: 'Web Premium' },
  review: { amount: 99000, name: 'Review' },
  dokumen: { amount: 199000, name: 'Reguler' },
  menyeluruh: { amount: 399000, name: 'Intensif' },
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tier, payment_method = 'mayar' } = await request.json()
  const tierInfo = TIER_PRICES[tier]
  if (!tierInfo) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  if (!['transfer', 'mayar'].includes(payment_method)) {
    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
  }

  // Rate limit: max 3 pending orders per user per 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { count: recentOrders } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .gte('created_at', tenMinutesAgo)
  if ((recentOrders ?? 0) >= 3) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan. Tunggu beberapa menit.' }, { status: 429 })
  }

  const invoiceNumber = `INV-${Date.now()}-${user.id.slice(0, 8).toUpperCase()}`

  // Jago bank transfer: unique amount (base + random 3-digit suffix) for matching
  const uniqueAmount = payment_method === 'transfer'
    ? tierInfo.amount + Math.floor(Math.random() * 900) + 100
    : tierInfo.amount

  const { data: order, error: orderError } = await supabase.from('orders').insert({
    user_id: user.id,
    tier,
    amount: uniqueAmount,
    status: 'pending',
    invoice_number: invoiceNumber,
    payment_method,
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
      base_amount: tierInfo.amount,
      tier_name: tierInfo.name,
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
        name: `OTWPTN ${tierInfo.name} - ${invoiceNumber}`,
        description: `Paket ${tierInfo.name} otwptn.com`,
        amount: tierInfo.amount,
        redirectUrl: `${appUrl}/dashboard?payment=success`,
      }),
    })

    const mayarData = await mayarRes.json()

    if (!mayarRes.ok || !mayarData?.data?.id) {
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id)
      return NextResponse.json({ error: 'Gagal membuat payment link', details: mayarData }, { status: 502 })
    }

    console.log('[checkout] mayar response:', JSON.stringify(mayarData.data))

    const paymentUrl = mayarData.data.link as string

    await supabase.from('orders').update({
      doku_reference: mayarData.data.id,
      payment_url: paymentUrl,
    }).eq('id', order.id)

    return NextResponse.json({
      payment_method: 'mayar',
      payment_url: paymentUrl,
      order_id: order.id,
      _debug_mayar: { id: mayarData.data.id, link: mayarData.data.link },
    })
  } catch {
    await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id)
    return NextResponse.json({ error: 'Gagal terhubung ke Mayar' }, { status: 503 })
  }
}
