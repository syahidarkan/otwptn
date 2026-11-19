import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CreatorDashboardClient from './CreatorDashboardClient'

// Server-side gate: this page is reserved for applicants who were approved as
// Content Creator / Marketing Partner via /career/content-creator + admin approval
// (src/app/api/admin/career-applications PATCH sets profiles.role='creator' and
// profiles.is_active=true on acceptance). Regular members must never reach this
// page just because they are logged in.
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
    .select('role, is_active')
    .eq('id', user.id)
    .maybeSingle()

  const isApprovedCreator = profile?.role === 'creator' && profile?.is_active === true

  if (!isApprovedCreator) {
    redirect('/career/content-creator')
  }

  return <CreatorDashboardClient />
}
