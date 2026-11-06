import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { creditAmbassadorCommission } from '@/lib/commission'
import { autoAssignIndividuMentor, handleSquadPayment } from '@/lib/mentorAssignment'

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

  // In production, always require a secret key and valid signature
  if (!secretKey && process.env.NODE_ENV !== 'development') {
    console.error('[DOKU Webhook] DOKU_SECRET_KEY not configured in production')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const shouldVerify = secretKey && process.env.NODE_ENV !== 'development'
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

  const supabase = await createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select('id, user_id, tier, referral_code, mode, track, squad_group_id')
    .eq('invoice_number', invoiceNumber)
    .maybeSingle()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  if (status === 'SUCCESS') {
    await Promise.all([
      supabase.from('orders').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', order.id),
      supabase.from('profiles').update({ tier: order.tier }).eq('id', order.user_id),
    ])

    await creditAmbassadorCommission(supabase, order)

    if (order.mode === 'squad' && order.squad_group_id) {
      await handleSquadPayment(supabase, { ...order, squad_group_id: order.squad_group_id })
    } else {
      await autoAssignIndividuMentor(supabase, order)
    }
  } else if (status === 'FAILED' || status === 'EXPIRED') {
    await supabase.from('orders').update({ status: status.toLowerCase() }).eq('id', order.id)
  }

  return NextResponse.json({ ok: true })
}
