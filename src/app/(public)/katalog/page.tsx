import { redirect } from 'next/navigation'

// Legacy product catalog - consolidated into /upgrade (see /checkout/page.tsx).
export default function KatalogRedirectPage() {
  redirect('/upgrade')
}
