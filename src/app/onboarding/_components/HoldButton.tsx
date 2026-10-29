'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ThumbsUp } from 'lucide-react'

const DURATION = 1500
const SIZE = 148
const STROKE = 7
const RADIUS = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * RADIUS

export default function HoldButton({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const [shake, setShake] = useState(false)
  const [done, setDone] = useState(false)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)

  const stop = useCallback((completed: boolean) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setHolding(false)
    if (!completed && progress > 0 && progress < 1) {
      setShake(true)
      setTimeout(() => setShake(false), 420)
    }
    if (!completed) setProgress(0)
  }, [progress])

  const tick = useCallback(() => {
    const elapsed = performance.now() - startRef.current
    const p = Math.min(elapsed / DURATION, 1)
    setProgress(p)
    if (p >= 1) {
      setDone(true)
      setHolding(false)
      onComplete()
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [onComplete])

  const start = useCallback(() => {
    if (done) return
    setHolding(true)
    startRef.current = performance.now() - progress * DURATION
    rafRef.current = requestAnimationFrame(tick)
  }, [done, progress, tick])

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  const offset = CIRC * (1 - progress)
  const scale = done ? 1.08 : holding ? 1 - progress * 0.05 : 1

  let hint = 'Tahan tombolnya'
  if (done) hint = 'Janji tersimpan!'
  else if (holding && progress > 0.7) hint = 'Dikit lagi...'
  else if (holding) hint = 'Tahan terus...'
  else if (progress === 0 && !holding) hint = 'Tahan tombolnya'

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <motion.button
        type="button"
        onPointerDown={start}
        onPointerUp={() => stop(false)}
        onPointerLeave={() => holding && stop(false)}
        onContextMenu={(e) => e.preventDefault()}
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { scale }}
        transition={shake ? { duration: 0.4 } : { duration: 0.1 }}
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: SIZE, height: SIZE,
          background: done ? '#ffd400' : 'rgba(255,255,255,0.7)',
          boxShadow: holding || done ? '0 8px 28px rgba(255,180,0,0.35)' : '0 4px 16px rgba(0,0,0,0.08)',
          cursor: done ? 'default' : 'pointer',
          touchAction: 'none',
        }}
      >
        <svg width={SIZE} height={SIZE} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={STROKE} />
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none"
            stroke="#ffd400" strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={offset}
            style={{ transition: holding ? 'none' : 'stroke-dashoffset 0.25s ease' }}
          />
        </svg>
        <motion.div animate={done ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.4 }}>
          <ThumbsUp size={44} strokeWidth={2.2} color={done ? '#111' : '#111'} fill={done ? '#111' : 'none'} />
        </motion.div>
      </motion.button>
      <motion.p
        key={hint}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-semibold"
        style={{ color: 'var(--muted)' }}
      >
        {hint}
      </motion.p>
    </div>
  )
}
