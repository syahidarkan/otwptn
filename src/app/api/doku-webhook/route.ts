import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { safeEqual } from '@/lib/security'
import { claimOrderPaid, fulfillPaidOrder } from '@/lib/orderFulfillment'

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
  return safeEqual(expected, signatureHeader)
}

export async function POST(request: Request) {
  const rawBody = await request.text()

  const clientId = process.env.DOKU_CLIENT_ID ?? ''
  const secretKey = process.env.DOKU_SECRET_KEY ?? ''
  const signatureHeader = request.headers.get('Signature') ?? ''
  const requestId = request.headers.get('Request-Id') ?? ''
  const requestTimestamp = request.headers.get('Request-Timestamp') ?? ''

  // In production, always require a secret key and valid signature
  if (!secretKey && process.env.NODE_ENV !== 'development') {
    console.error('[DOKU Webhook] DOKU_SECRET_KEY not configured in production')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const shouldVerify = process.env.NODE_ENV !== 'development'
  if (shouldVerify && !verifyDokuSignature(rawBody, signatureHeader, requestId, requestTimestamp, clientId, secretKey)) {
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

  const supabase = createServiceClient()

  const { data: order } = await supabase
    .from('orders')
    .select('id, status, amount')
    .eq('invoice_number', invoiceNumber)
    .maybeSingle()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  if (status === 'SUCCESS') {
    if (order.status === 'paid') return NextResponse.json({ ok: true, already_paid: true })
    const paidAmount = Number((body?.order as Record<string, unknown>)?.amount ?? NaN)
    if (Number.isFinite(paidAmount) && paidAmount < order.amount) {
      console.warn(`[DOKU Webhook] Underpaid order ${order.id}: ${paidAmount} < ${order.amount}`)
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 409 })
    }
    const claimed = await claimOrderPaid(supabase, order.id)
    if (claimed) await fulfillPaidOrder(supabase, claimed)
  } else if ((status === 'FAILED' || status === 'EXPIRED') && order.status === 'pending') {
    await supabase.from('orders').update({ status: status.toLowerCase() }).eq('id', order.id).eq('status', 'pending')
  }

  return NextResponse.json({ ok: true })
}
