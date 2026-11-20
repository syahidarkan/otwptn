import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CreatorDashboardClient from './CreatorDashboardClient'

// Server-side gate: this page is reserved for applicants who were approved as
// Content Creator / Marketing Partner via /career/content-creator + admin approval
// (src/app/api/admin/career-applications PATCH sets profiles.is_creator=true on
// acceptance). Regular members must never reach this page just because they are
// logged in. is_creator (not role) is checked so an account that holds another
// role too (mentor, admin) keeps creator access instead of losing it.
export default async function ContentCreatorDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard/creator')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_creator, is_active, is_admin, role')
    .eq('id', user.id)
    .maybeSingle()

  // Admin/superadmin can always preview this dashboard (e.g. via the AdminSwitcher),
  // same bypass pattern as the mentor gate in proxy.ts / mentor/layout.tsx.
  const isAdmin = profile?.is_admin || profile?.role === 'superadmin' || profile?.role === 'admin'
  const isApprovedCreator = (profile?.is_creator === true && profile?.is_active === true) || isAdmin

  if (!isApprovedCreator) {
    redirect('/career/content-creator')
  }

  return <CreatorDashboardClient />
}
