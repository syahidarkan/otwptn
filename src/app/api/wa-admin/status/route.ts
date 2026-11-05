import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getWAManager() {
  try {
    // Only available when running with custom server (not Vercel serverless)
    return global.__waManager ?? null
  } catch {
    return null
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const mgr = getWAManager()
  if (!mgr) {
    return NextResponse.json({ status: 'server_not_running', message: 'WhatsApp service requires custom server. Run: npm run start:wa' })
  }

  const state = mgr.getState()
  return NextResponse.json({
    status: state.status,
    qr: state.qr,
    phone: state.phone,
    messageCount: state.messages.length,
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const mgr = getWAManager()
  if (!mgr) return NextResponse.json({ error: 'WA service not running' }, { status: 503 })

  const { action } = await request.json()

  if (action === 'connect') {
    await mgr.connect()
    return NextResponse.json({ ok: true })
  }
  if (action === 'disconnect') {
    mgr.disconnect()
    return NextResponse.json({ ok: true })
  }
  if (action === 'logout') {
    mgr.clearSession()
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
