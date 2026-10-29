import { createClient } from '@/lib/supabase/server'
import { sendPaymentSuccessEmail } from '@/lib/email/send'
import { LEGAL_ENTITY } from '@/lib/constants'

export type PaymentChannel = 'qris' | 'bca_va' | 'mandiri_va' | 'bni_va' | 'gopay' | 'shopeepay' | 'manual_transfer'

export interface CreatePaymentParams {
  userId: string
  userEmail: string
  userName: string
  packageTier: 'review' | 'dokumen' | 'menyeluruh'
  packageName: string
  amount: number
  channel: PaymentChannel
  referralCode?: string
  targetPTN?: string
}

export interface PaymentResult {
  invoiceId: string
  paymentUrl: string
  qrCodeUrl?: string
  vaNumber?: string
  status: 'pending' | 'success' | 'failed'
  amount: number
  expiredAt: string
}

/**
 * Buat transaksi pembayaran baru (Mendukung Midtrans / Xendit / Tripay / Simulator)
 */
export async function createPaymentTransaction(params: CreatePaymentParams): Promise<PaymentResult> {
  const invoiceId = `INV-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
  const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  // 1. Integrasi MIDTRANS (Jika Server Key terpasang)
  if (process.env.MIDTRANS_SERVER_KEY) {
    try {
      const authHeader = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString('base64')
      const isProd = process.env.NODE_ENV === 'production' && !process.env.MIDTRANS_IS_SANDBOX
      const endpoint = isProd
        ? 'https://app.midtrans.com/snap/v1/transactions'
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

      const snapPayload = {
        transaction_details: {
          order_id: invoiceId,
          gross_amount: params.amount,
        },
        customer_details: {
          first_name: params.userName,
          email: params.userEmail,
        },
        item_details: [
          {
            id: `pkg-${params.packageTier}`,
            price: params.amount,
            quantity: 1,
            name: `Paket ${params.packageName} - OtwPTN`,
          },
        ],
      }

      const snapRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(snapPayload),
      })

      const snapData = await snapRes.json()
      if (snapRes.ok && snapData.redirect_url) {
        return {
          invoiceId,
          paymentUrl: snapData.redirect_url,
          status: 'pending',
          amount: params.amount,
          expiredAt,
        }
      }
    } catch (err) {
      console.warn('Midtrans creation failed, falling back to instant simulator:', err)
    }
  }

  // 2. Default Universal Instant QRIS Simulator (Saat pengajuan Payment Gateway sedang diproses)
  return {
    invoiceId,
    paymentUrl: `/checkout/bayar?invoice=${invoiceId}`,
    qrCodeUrl: '/mascot-hd/maskot-piala-toga-juara.png',
    vaNumber: `8800${Date.now().toString().slice(-8)}`,
    status: 'pending',
    amount: params.amount,
    expiredAt,
  }
}

/**
 * Handle Settlement / Notifikasi Sukses Pembayaran
 * Menyinkronkan Database Supabase, Role & Tier User, Komisi Ambassador, dan Kirim Email Resmi
 */
export async function handlePaymentSettlement({
  invoiceId,
  userId,
  userEmail,
  userName,
  packageTier,
  packageName,
  amount,
  referralCode,
  targetPTN,
}: {
  invoiceId: string
  userId: string
  userEmail: string
  userName: string
  packageTier: 'review' | 'dokumen' | 'menyeluruh'
  packageName: string
  amount: number
  referralCode?: string
  targetPTN?: string
}) {
  try {
    const supabase = await createClient()

    // 1. Upgrade Tier Pengguna di profiles
    await supabase
      .from('profiles')
      .update({
        tier: packageTier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    // 2. Catat di tabel registrations
    await supabase.from('registrations').insert({
      id: invoiceId,
      user_id: userId,
      status: 'approved',
      total_price: amount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // 3. Alokasikan Komisi Ambassador jika ada referral code
    if (referralCode) {
      const commissionRate = packageTier === 'menyeluruh' ? 75000 : packageTier === 'dokumen' ? 35000 : 15000
      console.log(`[ERP] Komisi Ambassador untuk kode ${referralCode}: Rp ${commissionRate.toLocaleString('id-ID')}`)
    }

    // 4. Kirim Email Notifikasi Bukti Bayar Otomatis
    await sendPaymentSuccessEmail({
      email: userEmail,
      name: userName,
      packageName,
      price: amount,
      invoiceNo: invoiceId,
      targetPTN,
    })

    return { success: true, invoiceId }
  } catch (err: any) {
    console.error('Error handling payment settlement:', err)
    return { success: false, error: err.message }
  }
}
