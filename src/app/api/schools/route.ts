import { NextRequest, NextResponse } from 'next/server'
import { ALL_SCHOOLS } from './data'

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim().toLowerCase()
  if (!q || q.length < 2) return NextResponse.json([])

  const results = ALL_SCHOOLS.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.kota.toLowerCase().includes(q) ||
    s.prov.toLowerCase().includes(q)
  ).slice(0, 20)

  return NextResponse.json(results)
}
