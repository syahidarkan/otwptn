import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const TIER_PRICES: Record<string, { amount: number; name: string }> = {
  web_premium: { amount: 30000, name: 'Web Premium' },
  review: { amount: 89000, name: 'Review' },
  dokumen: { amount: 179000, name: 'Reguler' },
  menyeluruh: { amount: 349000, name: 'Intensif' },
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tier, payment_method = 'doku' } = await request.json()
  const tierInfo = TIER_PRICES[tier]
  if (!tierInfo) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  if (!['doku', 'transfer', 'mayar'].includes(payment_method)) {
    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
  }

  const { data: profile } = await supabase.from('profiles').select('full_name, tier').eq('id', user.id).maybeSingle()

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

  // For bank transfer, append random 3-digit suffix (100-999) to create a unique amount
  // This allows matching the transfer back to a specific order
  const uniqueAmount = payment_method === 'transfer'
    ? tierInfo.amount + Math.floor(Math.random() * 900) + 100
    : tierInfo.amount

  const { data: order } = await supabase.from('orders').insert({
    user_id: user.id,
    tier,
    amount: uniqueAmount,
    status: 'pending',
    invoice_number: invoiceNumber,
    payment_method,
  }).select('id').single()

  if (!order) return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })

  // Bank transfer: return account details + unique amount, no API call needed
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Mayar: create a payment link, get back a URL + unique product ID for webhook matching
  if (payment_method === 'mayar') {
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
          redirectUrl: `${appUrl}/dashboard/upgrade?status=success`,
          expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      })

      const mayarData = await mayarRes.json()

      if (!mayarRes.ok || !mayarData?.data?.id) {
        await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id)
        return NextResponse.json({ error: 'Gagal membuat payment link', details: mayarData }, { status: 502 })
      }

      await supabase.from('orders').update({
        doku_reference: mayarData.data.id,
        payment_url: mayarData.data.link,
      }).eq('id', order.id)

      return NextResponse.json({
        payment_method: 'mayar',
        payment_url: mayarData.data.link,
        order_id: order.id,
      })
    } catch {
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id)
      return NextResponse.json({ error: 'Gagal terhubung ke Mayar' }, { status: 503 })
    }
  }

  const dokuPayload = {
    order: {
      invoice_number: invoiceNumber,
      line_items: [{
        name: `otwptn ${tierInfo.name}`,
        price: tierInfo.amount,
        quantity: 1,
      }],
      amount: tierInfo.amount,
      currency: 'IDR',
      callback_url: `${appUrl}/api/doku-webhook`,
      auto_redirect: true,
      disable_retry_payment: true,
      session_id: order.id,
    },
    customer: {
      id: user.id,
      name: profile?.full_name ?? user.email?.split('@')[0] ?? 'Customer',
      email: user.email ?? '',
    },
    payment: {
      payment_due_date: 60,
    },
  }

  const requestTimestamp = new Date().toISOString()

  try {
    const dokuRes = await fetch(`${process.env.DOKU_BASE_URL}/checkout/v1/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': process.env.DOKU_CLIENT_ID ?? '',
        'Request-Id': invoiceNumber,
        'Request-Timestamp': requestTimestamp,
        'Signature': generateDokuSignature(dokuPayload, process.env.DOKU_SECRET_KEY ?? '', invoiceNumber, requestTimestamp),
      },
      body: JSON.stringify(dokuPayload),
    })

    const dokuData = await dokuRes.json()

    if (!dokuRes.ok) {
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id)
      return NextResponse.json({ error: 'Payment gateway error', details: dokuData }, { status: 502 })
    }

    await supabase.from('orders').update({
      doku_reference: dokuData.response?.payment?.token_id ?? null,
      payment_url: dokuData.response?.payment?.url ?? null,
    }).eq('id', order.id)

    return NextResponse.json({ payment_url: dokuData.response?.payment?.url, order_id: order.id })
  } catch {
    return NextResponse.json({ error: 'Failed to connect to payment gateway' }, { status: 503 })
  }
}

function generateDokuSignature(
  payload: Record<string, unknown>,
  secretKey: string,
  requestId: string,
  timestamp: string,
): string {
  const body = JSON.stringify(payload)
  const digest = 'SHA-256=' + crypto.createHash('sha256').update(body).digest('base64')
  const signatureRaw = `Client-Id:${process.env.DOKU_CLIENT_ID}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:/checkout/v1/payment\nDigest:${digest}`
  return 'HMACSHA256=' + crypto.createHmac('sha256', secretKey).update(signatureRaw).digest('base64')
}
