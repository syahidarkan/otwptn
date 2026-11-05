import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Server-Sent Events endpoint for real-time WA updates
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let mgr: ReturnType<typeof import('@/lib/wa/waManager').getWAManager> | null = null
  try { mgr = global.__waManager ?? null } catch {}

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      // Send initial state
      if (mgr) {
        const s = mgr.getState()
        send('state', { status: s.status, qr: s.qr, phone: s.phone })
      } else {
        send('state', { status: 'server_not_running' })
        controller.close()
        return
      }

      const onState = (s: ReturnType<typeof mgr.getState>) => {
        try { send('state', { status: s.status, qr: s.qr, phone: s.phone }) } catch {}
      }
      const onMessage = (msg: unknown) => {
        try { send('message', msg) } catch {}
      }

      mgr!.on('state', onState)
      mgr!.on('message', onMessage)

      // Keep-alive ping every 15s
      const ping = setInterval(() => {
        try { controller.enqueue(encoder.encode(': ping\n\n')) } catch { clearInterval(ping) }
      }, 15000)

      return () => {
        mgr!.off('state', onState)
        mgr!.off('message', onMessage)
        clearInterval(ping)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
