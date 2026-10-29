import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export type UserRole = 'superadmin' | 'mentor' | 'member'
export type UserTier = 'free' | 'review' | 'dokumen' | 'menyeluruh'

export interface UserContext {
  id: string
  email: string
  fullName: string
  role: UserRole
  tier: UserTier
  isApprovedMentor?: boolean
}

/**
 * Mendapatkan profil lengkap dan role pengguna dari session Supabase
 */
export async function getCurrentUserContext(): Promise<UserContext | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, role, tier, is_mentor, is_admin')
      .eq('id', user.id)
      .single()

    let role: UserRole = 'member'
    if (profile?.is_admin || profile?.role === 'superadmin' || user.email === 'admin@otwptn.id') {
      role = 'superadmin'
    } else if (profile?.is_mentor || profile?.role === 'mentor') {
      role = 'mentor'
    }

    return {
      id: user.id,
      email: user.email || '',
      fullName: profile?.full_name || user.user_metadata?.full_name || 'Pejuang PTN',
      role,
      tier: (profile?.tier as UserTier) || 'free',
      isApprovedMentor: !!profile?.is_mentor,
    }
  } catch (err) {
    console.error('Error in getCurrentUserContext:', err)
    return null
  }
}

/**
 * Guard authorization untuk Next.js Route Handlers / Server Actions
 */
export async function requireAuth(allowedRoles: UserRole[] = ['member', 'mentor', 'superadmin']) {
  const user = await getCurrentUserContext()
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized: Harap login terlebih dahulu' }, { status: 401 }),
      user: null,
    }
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      authorized: false,
      response: NextResponse.json({ error: `Forbidden: Hak akses role ${user.role} tidak diizinkan` }, { status: 403 }),
      user,
    }
  }

  return { authorized: true, response: null, user }
}

/**
 * Helper untuk verifikasi akses fitur berdasarkan tier berlangganan
 */
export function canAccessTier(userTier: UserTier, requiredTier: UserTier): boolean {
  const tierLevels: Record<UserTier, number> = {
    free: 0,
    review: 1,
    dokumen: 2,
    menyeluruh: 3,
  }
  return tierLevels[userTier] >= tierLevels[requiredTier]
}
