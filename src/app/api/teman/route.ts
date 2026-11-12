import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const q = (url.searchParams.get('q') || '').trim().toLowerCase()

  const db = createServiceClient()
  const { data: rows, error } = await db
    .from('profiles')
    .select('id, full_name, avatar_url, school, school_name, province, target_ptns, target_majors, streak_days')
    .neq('id', user.id)
    .order('updated_at', { ascending: false })
    .limit(40)

  if (error) {
    console.error('[Teman GET]', error)
    return NextResponse.json({ peers: [] })
  }

  const peers = (rows ?? [])
    .filter(p => (p.full_name && p.full_name.trim().length > 0))
    .map(p => {
      const targetPTN = Array.isArray(p.target_ptns) && p.target_ptns.length > 0 ? p.target_ptns[0] : 'Belum diset'
      const targetMajor = Array.isArray(p.target_majors) && p.target_majors.length > 0 ? p.target_majors[0] : 'Pejuang PTN'
      return {
        id: p.id as string,
        name: (p.full_name as string).trim(),
        school: (p.school_name || p.school || 'SMA Indonesia') as string,
        city: (p.province || 'Indonesia') as string,
        targetPTN,
        targetMajor,
        streak: typeof p.streak_days === 'number' ? p.streak_days : 1,
        topic: 'Persiapan Seleksi PTN Non-Tes',
        avatar: (p.avatar_url as string | null) || '/avatars/avatar-1.png',
      }
    })
    .filter(p => {
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.school.toLowerCase().includes(q) ||
        p.targetPTN.toLowerCase().includes(q) ||
        p.targetMajor.toLowerCase().includes(q)
      )
    })

  return NextResponse.json({ peers })
}
