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

export async function POST() {
  return NextResponse.json(
    { error: 'DOKU payment method temporarily disabled. Please use Mayar.' },
    { status: 503 }
  )
}
