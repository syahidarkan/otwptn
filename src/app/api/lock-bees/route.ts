import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  const { bees } = await req.json() as {
    bees: Array<{ left: number; top: number; size: number; rotate: number }>
  }

  const filePath = path.join(process.cwd(), 'src/components/landing/HeroSection.tsx')
  let src = fs.readFileSync(filePath, 'utf-8')

  const re = /\/\* BEE_LOCK \*\/([\s\S]*?)\/\* \/BEE_LOCK \*\//
  const block = `/* BEE_LOCK */
const INITIAL_BEES: BeeCoord[] = [
  { left: ${bees[0].left}, top: ${bees[0].top}, size: ${bees[0].size}, rotate: ${bees[0].rotate} },
  { left: ${bees[1].left}, top: ${bees[1].top}, size: ${bees[1].size}, rotate: ${bees[1].rotate} },
  { left: ${bees[2].left}, top: ${bees[2].top}, size: ${bees[2].size}, rotate: ${bees[2].rotate} },
]
/* /BEE_LOCK */`

  src = src.replace(re, block)
  fs.writeFileSync(filePath, src, 'utf-8')
  return NextResponse.json({ ok: true })
}
