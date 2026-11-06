import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const WA_URL = process.env.WA_SERVICE_URL || 'https://otwptn.onrender.com'
const WA_TOKEN = process.env.WA_SERVICE_TOKEN || '44242acf4e0c406e9f485c68b3981246676039babc02c87c582e240ed24de8b7'

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

  if (!WA_URL) {
    return NextResponse.json({ status: 'server_not_running', message: 'WA_SERVICE_URL tidak dikonfigurasi di environment Vercel.' })
  }

  try {
    const res = await fetch(`${WA_URL}/status`, { headers: waHeaders(), cache: 'no-store' })
    if (res.status === 401) {
      return NextResponse.json({
        status: 'server_not_running',
        message: 'WA_SERVICE_TOKEN salah atau ditolak oleh server Render.',
      })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ status: 'server_not_running', message: 'WA service tidak bisa dihubungi di Render.' })
  }
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (!WA_URL) return NextResponse.json({ error: 'WA_SERVICE_URL tidak dikonfigurasi' }, { status: 503 })

  const body = await request.json()
  try {
    const res = await fetch(`${WA_URL}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...waHeaders() },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'WA service tidak bisa dihubungi' }, { status: 503 })
  }
}
