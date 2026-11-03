import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

function verifyDokuSignature(
  requestBody: string,
  signatureHeader: string,
  requestId: string,
  requestTimestamp: string,
  clientId: string,
  secretKey: string,
): boolean {
  const digest = 'SHA-256=' + crypto.createHash('sha256').update(requestBody).digest('base64')
  const componentToSign = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${requestTimestamp}`,
    `Request-Target:/api/doku-webhook`,
    `Digest:${digest}`,
  ].join('\n')
  const expected = 'HMACSHA256=' + crypto.createHmac('sha256', secretKey).update(componentToSign).digest('base64')
  return expected === signatureHeader
}

export async function POST(request: Request) {
  const rawBody = await request.text()

  const clientId = process.env.DOKU_CLIENT_ID ?? ''
  const secretKey = process.env.DOKU_SECRET_KEY ?? ''
  const signatureHeader = request.headers.get('Signature') ?? ''
  const requestId = request.headers.get('Request-Id') ?? ''
  const requestTimestamp = request.headers.get('Request-Timestamp') ?? ''

  // Skip verification in dev mode without secret key configured
  const skipVerification = !secretKey || process.env.NODE_ENV === 'development'

  if (!skipVerification && !verifyDokuSignature(rawBody, signatureHeader, requestId, requestTimestamp, clientId, secretKey)) {
    console.warn('[DOKU Webhook] Invalid signature — rejected')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const invoiceNumber = (body?.order as Record<string, unknown>)?.invoice_number as string | undefined
  const status = (body?.transaction as Record<string, unknown>)?.status as string | undefined

  if (!invoiceNumber || !status) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('id, user_id, tier')
    .eq('invoice_number', invoiceNumber)
    .maybeSingle()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  if (status === 'SUCCESS') {
    await Promise.all([
      supabase.from('orders').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', order.id),
      supabase.from('profiles').update({ tier: order.tier }).eq('id', order.user_id),
    ])

    // Credit ambassador commission if there's a referral on the order
    const { data: orderFull } = await supabase
      .from('orders')
      .select('referral_code')
      .eq('id', order.id)
      .maybeSingle()

    if (orderFull?.referral_code) {
      const { data: ambassador } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', orderFull.referral_code)
        .maybeSingle()

      if (ambassador) {
        const commissionRate =
          order.tier === 'menyeluruh' ? 75000 :
          order.tier === 'dokumen' ? 35000 :
          order.tier === 'review' ? 15000 : 10000

        await supabase.from('ambassador_commissions').insert({
          ambassador_id: ambassador.id,
          referred_user_id: order.user_id,
          order_id: order.id,
          amount: commissionRate,
          tier_purchased: order.tier,
          status: 'cleared',
        })
      }
    }
  } else if (status === 'FAILED' || status === 'EXPIRED') {
    await supabase.from('orders').update({ status: status.toLowerCase() }).eq('id', order.id)
  }

  return NextResponse.json({ ok: true })
}
