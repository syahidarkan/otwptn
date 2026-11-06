import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const REQUIRED_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'MAYAR_API_KEY',
  'MAYAR_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_APP_URL',
]

// Public liveness/readiness probe for uptime monitors. Reports only coarse status, never
// variable names, versions or error details.
export async function GET() {
  const started = Date.now()

  let db: 'ok' | 'down' = 'down'
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (url && anon) {
    try {
      const res = await fetch(`${url}/auth/v1/health`, {
        headers: { apikey: anon },
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      })
      db = res.ok ? 'ok' : 'down'
    } catch {
      db = 'down'
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const configComplete =
    REQUIRED_ENV.every(name => !!process.env[name]) &&
    (process.env.NODE_ENV !== 'production' || appUrl.startsWith('https://'))

  const healthy = db === 'ok' && configComplete
  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      db,
      config: configComplete ? 'ok' : 'incomplete',
      latency_ms: Date.now() - started,
    },
    { status: healthy ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  )
}
