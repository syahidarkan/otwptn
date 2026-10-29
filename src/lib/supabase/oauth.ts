import { createClient } from '@/lib/supabase/client'

/**
 * Trigger Login dengan Akun Google melalui Supabase Auth
 */
export async function signInWithGoogle(redirectTo?: string) {
  const supabase = createClient()
  const redirectUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ''}`
    : undefined

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    throw error
  }

  return data
}
