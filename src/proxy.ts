import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/onboarding', '/akun', '/profil']
const AUTH_PATHS = ['/login', '/register']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Redirect logged-in users away from auth pages
  if (user && AUTH_PATHS.some(p => pathname === p)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users away from protected pages
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin routes - unauthenticated. Server components under /admin read data with the service
  // client, so anonymous visitors must be stopped here, not by the client-side layout.
  if (!user && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Mentor routes - unauthenticated
  if (!user && pathname.startsWith('/mentor') && pathname !== '/mentor/auth' && pathname !== '/mentor/apply') {
    return NextResponse.redirect(new URL('/mentor/auth', request.url))
  }

  // Admin RBAC
  if (user && pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin || profile?.role === 'superadmin'
    if (!isAdmin) return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Mentor RBAC
  if (user && pathname.startsWith('/mentor') && pathname !== '/mentor/auth' && pathname !== '/mentor/apply') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_admin')
      .eq('id', user.id)
      .single()

    const isMentor = profile?.role === 'mentor' || profile?.is_admin || profile?.role === 'superadmin' || profile?.role === 'admin'
    if (!isMentor) return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|mp4|pdf)).*)',],
}
