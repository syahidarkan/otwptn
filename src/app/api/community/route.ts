import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const postId = url.searchParams.get('postId')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (postId) {
    const { data: replies, error } = await supabase
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
    return NextResponse.json({ replies: replies ?? [] })
  }

  const { data: posts, error } = await supabase
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

  const mapped = (posts ?? []).map((p: Record<string, unknown>) => {
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
