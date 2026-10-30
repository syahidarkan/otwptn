import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Support reverse proxies / production domains (e.g. Vercel)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const redirectBase = isLocalEnv
    ? origin
    : forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : origin

  if (code) {
    let redirectUrl = `${redirectBase}${next}`
    let response = NextResponse.redirect(redirectUrl)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set({ name, value, ...options })
              response.cookies.set({ name, value, ...options })
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Ensure user row exists in profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, onboarding_completed, is_admin')
          .eq('id', user.id)
          .maybeSingle()

        if (!profile) {
          // Auto-register user into profiles table
          try {
            await supabase.from('profiles').insert({
              id: user.id,
              email: user.email || '',
              full_name:
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split('@')[0] ||
                'Pejuang PTN',
              avatar_url:
                user.user_metadata?.avatar_url ||
                user.user_metadata?.picture ||
                '/avatars/avatar-1.png',
              onboarding_completed: false,
              role: 'user',
              tier: 'free',
            })
          } catch (insertErr) {
            console.error('Failed to auto-insert profile:', insertErr)
          }
        }

        const targetUrl = profile?.is_admin
          ? `${redirectBase}/admin`
          : !profile || !profile.onboarding_completed
            ? `${redirectBase}/onboarding`
            : `${redirectBase}${next}`

        const finalResponse = NextResponse.redirect(targetUrl)
        // Forward all authenticated session cookies to final redirect
        response.cookies.getAll().forEach(cookie => {
          finalResponse.cookies.set(cookie.name, cookie.value, cookie)
        })
        return finalResponse
      }

      return response
    } else {
      console.error('exchangeCodeForSession error:', error.message)
    }
  }

  return NextResponse.redirect(`${redirectBase}/login?error=auth_callback_failed`)
}
