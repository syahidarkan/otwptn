import { redirect } from 'next/navigation'

// Legacy product detail page - consolidated into /upgrade (see /checkout/page.tsx for why).
export default function ProductDetailRedirectPage() {
  redirect('/upgrade')
}
