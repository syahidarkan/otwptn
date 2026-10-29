'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

// Animated "Hari 1 -> Hari 7 -> Hari 30 -> Target" growth projection curve.
// SVG path is drawn in with GSAP on mount; the headline number counts up alongside it.
export default function GrowthCurve({ totalQuestions, daysLeft }: { totalQuestions: number; daysLeft: number }) {
  const pathRef = useRef<SVGPathElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)
  const [count, setCount] = useState(0)

  const W = 320
  const H = 140
  const PATH = `M 12 118 C 90 112, 150 96, 200 62 S 280 18, ${W - 14} 14`

  useEffect(() => {
    const path = pathRef.current
    const dot = dotRef.current
    if (!path) return

    const len = path.getTotalLength()
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })

    const counter = { val: 0 }
    const tl = gsap.timeline()
    tl.to(path, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.out' })
    if (dot) {
      tl.to({}, {
        duration: 1.3,
        ease: 'power2.out',
        onUpdate: function () {
          const p = this.progress()
          const point = path.getPointAtLength(len * p)
          dot.setAttribute('cx', String(point.x))
          dot.setAttribute('cy', String(point.y))
        },
      }, '<')
    }
    tl.to(counter, {
      val: totalQuestions,
      duration: 1.1,
      ease: 'power1.out',
      onUpdate: () => setCount(Math.round(counter.val)),
    }, '<0.2')

    return () => { tl.kill() }
  }, [totalQuestions])

  return (
    <div className="flex flex-col items-center">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <path d={PATH} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={3} />
        <path ref={pathRef} d={PATH} fill="none" stroke="#ffd400" strokeWidth={4} strokeLinecap="round" />
        {[12, 118].map((_, i) => null)}
        <circle ref={dotRef} r={7} fill="#111111" stroke="#ffd400" strokeWidth={3} cx={12} cy={118} />
      </svg>
      <div className="flex justify-between w-full text-[11px] font-semibold mt-1" style={{ color: 'var(--muted)', maxWidth: W }}>
        <span>Minggu 1</span>
        <span>Bulan 1</span>
        <span>Bulan 3</span>
        <span>Deadline</span>
      </div>
      <div className="text-center mt-5">
        <div
          className="font-extrabold"
          style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 8vw, 2.6rem)', letterSpacing: '-0.03em', color: 'var(--fg)' }}
        >
          {count.toLocaleString('id-ID')} jam
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
          total persiapan yang kamu punya sampai ±{daysLeft} hari lagi
        </p>
      </div>
    </div>
  )
}
