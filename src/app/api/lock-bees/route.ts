import { NextResponse } from 'next/server'

// This endpoint wrote to source files via fs.writeFileSync — disabled for security.
// Source files must not be modified at runtime from an API route.
export async function POST() {
  return NextResponse.json({ error: 'Endpoint disabled' }, { status: 410 })
}
