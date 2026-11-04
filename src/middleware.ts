import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require an active session (any role)
const AUTH_REQUIRED = ['/dashboard', '/admin', '/mentor', '/onboarding', '/profil', '/akun']

// Routes that require the superadmin role
const ADMIN_ONLY = ['/admin']

// Routes that require mentor or superadmin role
const MENTOR_ONLY = ['/mentor']

// Public routes that logged-in users should be redirected away from
const AUTH_REDIRECT = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // If logged in and hitting login/register, redirect to dashboard
  if (user && AUTH_REDIRECT.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If not logged in and hitting protected route, redirect to login
  const needsAuth = AUTH_REQUIRED.some(r => pathname.startsWith(r))
  if (!user && needsAuth) {
    // Mentor has its own auth page
    if (pathname.startsWith('/mentor')) {
      return NextResponse.redirect(new URL('/mentor/auth', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based protection for admin routes
  if (user && ADMIN_ONLY.some(r => pathname.startsWith(r))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin || profile?.role === 'superadmin' || user.email === 'admin@otwptn.id'
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Role-based protection for mentor routes (allow superadmin too)
  if (user && MENTOR_ONLY.some(r => pathname.startsWith(r))) {
    // Skip auth and apply pages
    if (pathname === '/mentor/auth' || pathname === '/mentor/apply') {
      return response
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_mentor, role, is_admin')
      .eq('id', user.id)
      .single()

    const isMentor = profile?.is_mentor || profile?.role === 'mentor' || profile?.is_admin || profile?.role === 'superadmin' || user.email === 'admin@otwptn.id'
    if (!isMentor) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|mp4|pdf)).*)',
  ],
}
