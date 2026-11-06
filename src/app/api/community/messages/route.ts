import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const channelId = url.searchParams.get('channelId')
  if (!channelId) {
    return NextResponse.json({ error: 'channelId required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  // Resolve channel UUID
  let channelUuid = channelId
  if (!isUuid(channelId)) {
    const { data: chan } = await db
      .from('community_channels')
      .select('id')
      .eq('identifier', channelId)
      .maybeSingle()

    if (chan) {
      channelUuid = chan.id
    } else {
      // If channel does not exist in DB yet, return empty list cleanly
      return NextResponse.json({ messages: [], members: [] })
    }
  }

  // Fetch messages in this channel
  const { data: messages, error } = await db
    .from('community_messages')
    .select(`
      id,
      content,
      created_at,
      user_id,
      profiles:user_id (id, full_name, avatar_url, school_name, target_ptns)
    `)
    .eq('channel_id', channelUuid)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) {
    console.error('[Community Messages GET]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Extract distinct active members from messages
  const memberMap = new Map<string, { id: string; name: string; avatar: string; ptn: string; role: 'Ketua' | 'Anggota' }>()
  for (const m of messages ?? []) {
    const prof = (m as any).profiles
    if (prof && !memberMap.has(prof.id)) {
      const ptnStr = Array.isArray(prof.target_ptns) && prof.target_ptns.length > 0
        ? prof.target_ptns[0]
        : prof.school_name || 'Pejuang PTN'
      memberMap.set(prof.id, {
        id: prof.id,
        name: prof.full_name || 'Siswa OtwPTN',
        avatar: prof.avatar_url || '/mascot/default-avatar.png',
        ptn: ptnStr,
        role: 'Anggota',
      })
    }
  }

  const members = Array.from(memberMap.values())

  const mapped = (messages ?? []).map((m: any) => {
    const prof = m.profiles
    const ptnStr = Array.isArray(prof?.target_ptns) && prof.target_ptns.length > 0
      ? prof.target_ptns[0]
      : prof?.school_name || 'Target PTN'

    const d = new Date(m.created_at)
    const timeStr = !isNaN(d.getTime())
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : ''

    return {
      id: m.id,
      sender: prof?.full_name || (m.user_id === user.id ? 'Kamu' : 'Siswa OtwPTN'),
      avatar: prof?.avatar_url || '/mascot/default-avatar.png',
      ptn: ptnStr,
      text: m.content || '',
      time: timeStr,
      isMe: m.user_id === user.id,
    }
  })

  return NextResponse.json({ messages: mapped, members })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { channelId, channelName, content } = await request.json()
  if (!channelId || !content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 })
  }
  if (content.length > 1000) {
    return NextResponse.json({ error: 'Pesan maksimal 1000 karakter' }, { status: 400 })
  }

  const db = createServiceClient()

  // Resolve or create channel in DB
  let channelUuid = channelId
  if (!isUuid(channelId)) {
    const { data: existingChan } = await db
      .from('community_channels')
      .select('id')
      .eq('identifier', channelId)
      .maybeSingle()

    if (existingChan) {
      channelUuid = existingChan.id
    } else {
      const { data: newChan, error: chanErr } = await db
        .from('community_channels')
        .insert({
          name: channelName || channelId,
          type: 'jalur',
          identifier: channelId,
          description: `Circle belajar bersama ${channelName || channelId}`,
          is_public: true,
          member_count: 1,
        })
        .select('id')
        .single()

      if (chanErr || !newChan) {
        console.error('[Community Channel Create Error]', chanErr)
        return NextResponse.json({ error: 'Gagal menginisialisasi channel circle' }, { status: 500 })
      }
      channelUuid = newChan.id
    }
  }

  // Insert message
  const { data: msg, error: msgErr } = await db
    .from('community_messages')
    .insert({
      channel_id: channelUuid,
      user_id: user.id,
      content: content.trim(),
    })
    .select(`
      id,
      content,
      created_at,
      user_id,
      profiles:user_id (id, full_name, avatar_url, school_name, target_ptns)
    `)
    .single()

  if (msgErr || !msg) {
    console.error('[Community Message Insert Error]', msgErr)
    return NextResponse.json({ error: 'Gagal mengirim pesan: ' + (msgErr?.message || 'Error') }, { status: 500 })
  }

  // Award XP (fire and forget)
  try {
    db.rpc('increment_xp', { uid: user.id, points: 5 })
  } catch {}

  const prof = (msg as any).profiles
  const ptnStr = Array.isArray(prof?.target_ptns) && prof.target_ptns.length > 0
    ? prof.target_ptns[0]
    : prof?.school_name || 'Target PTN'

  const d = new Date(msg.created_at)
  const timeStr = !isNaN(d.getTime())
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  const formattedMsg = {
    id: msg.id,
    sender: prof?.full_name || 'Kamu',
    avatar: prof?.avatar_url || '/mascot/default-avatar.png',
    ptn: ptnStr,
    text: msg.content,
    time: timeStr,
    isMe: true,
  }

  return NextResponse.json({ message: formattedMsg })
}
