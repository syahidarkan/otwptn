import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const WA_URL = process.env.WA_SERVICE_URL || 'https://otwptn.onrender.com'
const WA_TOKEN = process.env.WA_SERVICE_TOKEN

function waHeaders(): Record<string, string> {
  return WA_TOKEN ? { 'x-service-token': WA_TOKEN } : {}
}

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return null
  return user
}

export async function GET() {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (!WA_URL) return NextResponse.json({ messages: [] })

  try {
    const res = await fetch(`${WA_URL}/messages`, { headers: waHeaders(), cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ messages: [], error: 'WA service tidak bisa dihubungi' })
  }
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (!WA_URL) return NextResponse.json({ error: 'WA_SERVICE_URL tidak dikonfigurasi' }, { status: 503 })

  const { to, text } = await request.json()
  if (!to || !text) return NextResponse.json({ error: 'Missing to or text' }, { status: 400 })

  try {
    const res = await fetch(`${WA_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...waHeaders() },
      body: JSON.stringify({ to, text }),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'WA service tidak bisa dihubungi' }, { status: 503 })
  }
}
