import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const postId = url.searchParams.get('postId')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  // Helper to resolve missing/empty profile name from auth user metadata
  async function enrichMissingAuthors(rows: Record<string, unknown>[]) {
    const missingIds = Array.from(
      new Set(
        rows
          .filter(r => {
            const prof = r.profiles as { full_name?: string | null } | null
            return !prof || !prof.full_name || !prof.full_name.trim()
          })
          .map(r => r.user_id as string)
          .filter(Boolean)
      )
    )
    if (missingIds.length === 0) return

    const fallbackMap = new Map<string, { full_name: string; avatar_url: string | null }>()
    await Promise.all(
      missingIds.slice(0, 20).map(async uid => {
        try {
          const { data } = await db.auth.admin.getUserById(uid)
          const u = data?.user
          if (u) {
            const name =
              (u.user_metadata?.full_name as string | undefined)?.trim() ||
              (u.user_metadata?.name as string | undefined)?.trim() ||
              (u.email ? u.email.split('@')[0] : '') ||
              'Pejuang PTN'
            const avatar = (u.user_metadata?.avatar_url as string | undefined) || null
            fallbackMap.set(uid, { full_name: name, avatar_url: avatar })
          }
        } catch {}
      })
    )

    for (const r of rows) {
      const uid = r.user_id as string
      const prof = (r.profiles as Record<string, unknown> | null) ?? {}
      const fallback = fallbackMap.get(uid)
      if (fallback && (!(prof.full_name as string | undefined)?.trim())) {
        r.profiles = {
          ...prof,
          id: uid,
          full_name: fallback.full_name,
          avatar_url: (prof.avatar_url as string | null) ?? fallback.avatar_url,
        }
      }
    }
  }

  if (postId) {
    const { data: replies, error } = await db
      .from('community_post_replies')
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles:user_id (id, full_name, avatar_url, school_name, target_ptns)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[Community Replies GET]', error)
      return NextResponse.json({ replies: [] })
    }
    const list = (replies ?? []) as Record<string, unknown>[]
    await enrichMissingAuthors(list)
    return NextResponse.json({ replies: list })
  }

  const { data: posts, error } = await db
    .from('community_posts')
    .select(`
      *,
      profiles:user_id (id, full_name, avatar_url, school_name, target_ptns),
      community_post_replies (count)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[Community GET]', error)
  }

  const postRows = (posts ?? []) as Record<string, unknown>[]
  await enrichMissingAuthors(postRows)

  const mapped = postRows.map((p: Record<string, unknown>) => {
    const repliesCount = Array.isArray(p.community_post_replies) && p.community_post_replies[0]
      ? (p.community_post_replies[0] as { count: number }).count
      : 0
    return {
      id: p.id,
      content: p.content,
      likes: (p.likes as number | undefined) ?? (p.likes_count as number | undefined) ?? 0,
      replies: repliesCount,
      created_at: p.created_at,
      profiles: p.profiles ?? null,
    }
  })

  return NextResponse.json({ posts: mapped })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, postId } = await request.json()

  // Handle reply submission
  if (postId) {
    if (!content || typeof content !== 'string' || content.trim().length < 1) {
      return NextResponse.json({ error: 'Balasan tidak boleh kosong' }, { status: 400 })
    }
    if (content.length > 500) {
      return NextResponse.json({ error: 'Balasan terlalu panjang (maksimal 500 karakter)' }, { status: 400 })
    }
    const db = createServiceClient()
    const { data: reply, error } = await db
      .from('community_post_replies')
      .insert({ post_id: postId, user_id: user.id, content: content.trim() })
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles:user_id (id, full_name, avatar_url, school_name, target_ptns)
      `)
      .single()

    if (error) {
      console.error('[Community Reply POST]', error)
      return NextResponse.json({ error: 'Gagal mengirim balasan: ' + error.message }, { status: 500 })
    }

    db.rpc('increment_xp', { uid: user.id, points: 5 })
    return NextResponse.json({ reply })
  }

  // Rate limit: max 5 posts per user per minute
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
  const { count: recentPosts } = await supabase
    .from('community_posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', oneMinuteAgo)
  if ((recentPosts ?? 0) >= 5) {
    return NextResponse.json({ error: 'Terlalu banyak postingan. Tunggu sebentar.' }, { status: 429 })
  }

  if (!content || typeof content !== 'string' || content.trim().length < 3) {
    return NextResponse.json({ error: 'Konten terlalu pendek (minimal 3 karakter)' }, { status: 400 })
  }
  if (content.length > 500) {
    return NextResponse.json({ error: 'Konten terlalu panjang (maksimal 500 karakter)' }, { status: 400 })
  }

  const db = createServiceClient()
  const { data: post, error } = await db
    .from('community_posts')
    .insert({ user_id: user.id, content: content.trim() })
    .select(`
      *,
      profiles:user_id (id, full_name, avatar_url, school_name, target_ptns)
    `)
    .single()

  if (error) {
    console.error('[Community POST]', error)
    return NextResponse.json({ error: 'Gagal menyimpan postingan: ' + error.message }, { status: 500 })
  }

  // Award XP for posting (fire and forget)
  db.rpc('increment_xp', { uid: user.id, points: 10 })

  const normalized = {
    id: post.id,
    content: post.content,
    likes: (post as Record<string, unknown>).likes ?? (post as Record<string, unknown>).likes_count ?? 0,
    replies: 0,
    created_at: post.created_at,
    profiles: (post as Record<string, unknown>).profiles ?? null,
  }

  return NextResponse.json({ post: normalized })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: 'Gagal menghapus' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
