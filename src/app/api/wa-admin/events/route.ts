import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const WA_URL = process.env.WA_SERVICE_URL
const WA_TOKEN = process.env.WA_SERVICE_TOKEN

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (!WA_URL) {
    // No Railway configured — send one state event then close
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`event: state\ndata: ${JSON.stringify({ status: 'server_not_running' })}\n\n`))
        controller.close()
      },
    })
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    })
  }

  // Proxy SSE from Railway WA service
  const headers: Record<string, string> = { Accept: 'text/event-stream' }
  if (WA_TOKEN) headers['x-service-token'] = WA_TOKEN

  let upstream: Response
  try {
    upstream = await fetch(`${WA_URL}/events`, { headers, cache: 'no-store' })
  } catch {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`event: state\ndata: ${JSON.stringify({ status: 'server_not_running' })}\n\n`))
        controller.close()
      },
    })
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    })
  }

  // Pass upstream SSE body straight through to the browser
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
