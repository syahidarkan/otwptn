import { redirect } from 'next/navigation'

// Legacy checkout entry point - consolidated into /upgrade, the single source of truth
// for pricing (mode x track x tier). Keeping a separate hardcoded price table here
// caused it to drift out of sync with /api/checkout's authoritative pricing matrix.
export default function CheckoutRedirectPage() {
  redirect('/upgrade')
}
