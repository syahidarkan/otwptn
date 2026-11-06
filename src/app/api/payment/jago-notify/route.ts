import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { safeEqual } from '@/lib/security'
import { claimOrderPaid, fulfillPaidOrder } from '@/lib/orderFulfillment'

// Called by Google Apps Script when it detects a Jago transfer email
// POST body: { amount: number, secret: string }
export async function POST() {
  return NextResponse.json(
    { error: 'Jago payment notification temporarily disabled. Please use Mayar.' },
    { status: 503 }
  )
}
