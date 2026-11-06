import { redirect } from 'next/navigation'

// Legacy member checkout entry point — consolidated into /upgrade (see /checkout/page.tsx).
export default function MemberCheckoutRedirectPage() {
  redirect('/upgrade')
}
