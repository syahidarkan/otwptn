import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getWAManager() {
  try { return global.__waManager ?? null } catch { return null }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const mgr = getWAManager()
  if (!mgr) return NextResponse.json({ messages: [], error: 'WA service not running' })

  return NextResponse.json({ messages: mgr.getState().messages })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const mgr = getWAManager()
  if (!mgr) return NextResponse.json({ error: 'WA service not running' }, { status: 503 })

  const { to, text } = await request.json()
  if (!to || !text) return NextResponse.json({ error: 'Missing to or text' }, { status: 400 })

  const ok = await mgr.sendMessage(to, text)
  return NextResponse.json({ ok })
}
