'use client'

import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  forwardRef
} from 'react'
import { Mixer, type ClipName, type PlayOpts, type Pose, type FxEvent } from './engine'
import H from './head.json'

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v))
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

const about = (cx: number, cy: number, inner: string) =>
  `translate(${cx}px, ${cy}px) ${inner} translate(${-cx}px, ${-cy}px)`

export interface HeadPuppetHandle {
  play: (name: ClipName, opts?: PlayOpts) => void
  fx: (type: FxEvent['type'], side?: -1 | 1) => void
  mixer: Mixer
}

export interface HeadPuppetProps {
  size?: number
  followPointer?: boolean
  action?: ClipName
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  facing?: 1 | -1
  paused?: boolean
}

export const HeadPuppet = forwardRef<HeadPuppetHandle, HeadPuppetProps>(function HeadPuppet(
  {
    size = 145,
    followPointer = false,
    action = 'idle',
    className,
    style,
    onClick,
    facing = 1,
    paused = false,
  },
  ref
) {
  const mixer = useMemo(() => new Mixer(), [])
  const [pose, setPose] = useState<Pose>(() => mixer.pose)
  const rootRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(paused)
  const facingRef = useRef(facing)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    facingRef.current = facing
  }, [facing])

  useEffect(() => {
    if (action) mixer.play(action)
  }, [action, mixer])

  useImperativeHandle(ref, () => ({
    play: (name, opts) => mixer.play(name, opts),
    fx: () => {},
    mixer,
  }))

  // Pointer tracking for cursor follow
  useEffect(() => {
    if (!followPointer) return
    const move = (e: PointerEvent) => {
      const el = rootRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2, cy = r.top + r.height * 0.45
      const dx = clamp((e.clientX - cx) / (window.innerWidth * 0.35), -1, 1) * facingRef.current
      const dy = clamp((e.clientY - cy) / (window.innerHeight * 0.35), -1, 1)
      mixer.setPointer({ x: dx, y: dy })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      mixer.setPointer(null)
    }
  }, [followPointer, mixer])

  // RAF animation loop
  useEffect(() => {
    let raf = 0
    let prev = performance.now()
    let run = true

    const frame = (now: number) => {
      if (!run) return
      raf = requestAnimationFrame(frame)
      if (pausedRef.current) {
        prev = now
        return
      }
      const dt = (now - prev) / 1000
      prev = now
      const p = mixer.update(dt)
      setPose({ ...p })
    }

    raf = requestAnimationFrame(frame)
    return () => {
      run = false
      cancelAnimationFrame(raf)
    }
  }, [mixer])

  const P = pose
  const k = size / H.h
  const neck = { x: H.w * 0.52, y: H.h * 0.86 }

  const whole = [
    `translate(${P.x * H.h * 0.8}px, ${P.y * H.h * 0.8 + P.headY * H.h}px)`,
    about(neck.x, neck.y, `rotate(${(P.rot + P.headRot * 1.2).toFixed(2)}deg)`),
    about(neck.x, H.h, `scale(${P.sx.toFixed(4)}, ${P.sy.toFixed(4)})`),
  ].join(' ')

  const yaw = clamp(P.headYaw, -1, 1), pit = clamp(P.headPitch, -1, 1)
  const face = `translate(${(yaw * 26).toFixed(1)}px, ${(-pit * 20).toFixed(1)}px)`

  const layer = (n: string, tf = '', o = 1) => (
    <div
      key={n}
      style={{
        position: 'absolute',
        inset: 0,
        transformOrigin: '0 0',
        transform: tf,
        opacity: o,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <img
        src={`/brand/head/${n}.png`}
        alt=""
        draggable={false}
        style={{
          width: H.w,
          height: H.h,
          display: 'block',
          imageRendering: 'auto',
        }}
      />
    </div>
  )

  const eye = (name: 'eyeL' | 'eyeR', wink: number) => {
    const e = H[name]
    const [cx, cy] = e.c
    const closing = Math.max(clamp(P.blink + wink), P.eyeArc)
    const arc = smooth(0.86, 0.97, closing)
    const happy = P.eyeArc >= clamp(P.blink + wink)
    const look = `translate(${(P.lookX * 14).toFixed(1)}px, ${(P.lookY * 10).toFixed(1)}px)`
    const sc = P.eyeScale
    const ew = (e.box[2] - e.box[0]) * 0.86, eh = e.box[3] - e.box[1]
    return (
      <React.Fragment key={name}>
        {layer(
          name,
          `${face} ${look} ${about(cx, cy, `scale(${sc}, ${(sc * Math.max(0.04, 1 - closing * 0.96)).toFixed(4)})`)}`,
          1 - arc
        )}
        <svg
          width={H.w}
          height={H.h}
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'visible',
            transform: face,
            opacity: arc,
            pointerEvents: 'none',
          }}
        >
          <path
            d={
              happy
                ? `M ${cx - ew / 2} ${cy + eh * 0.12} Q ${cx} ${cy - eh * 0.42} ${cx + ew / 2} ${cy + eh * 0.12}`
                : `M ${cx - ew / 2} ${cy - eh * 0.04} Q ${cx} ${cy + eh * 0.36} ${cx + ew / 2} ${cy - eh * 0.04}`
            }
            fill="none"
            stroke="#141010"
            strokeWidth={eh * 0.12}
            strokeLinecap="round"
          />
        </svg>
      </React.Fragment>
    )
  }

  const m = H.mouth
  const open = clamp(P.mouthOpen)

  return (
    <div
      ref={rootRef}
      className={className}
      onClick={onClick}
      style={{
        position: 'relative',
        width: H.w * k,
        height: size,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: H.w,
          height: H.h,
          transformOrigin: '0 0',
          transform: `scale(${k})`,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: whole }}>
          {layer('antL', about(H.antL.pivot[0], H.antL.pivot[1], `rotate(${(-P.antL * 0.9).toFixed(2)}deg)`))}
          {layer('antR', about(H.antR.pivot[0], H.antR.pivot[1], `rotate(${(P.antR * 0.9).toFixed(2)}deg)`))}
          {layer('base')}
          {layer('cheekL', `${face} ${about(H.cheekL.c[0], H.cheekL.c[1], `scale(${P.cheek.toFixed(3)})`)}`)}
          {layer('cheekR', `${face} ${about(H.cheekR.c[0], H.cheekR.c[1], `scale(${P.cheek.toFixed(3)})`)}`)}
          {eye('eyeL', P.winkL)}
          {eye('eyeR', P.winkR)}
          {layer('mouth', `${face} ${about(m.c[0], m.box[1], `scale(${(1 + open * 0.12).toFixed(3)}, ${(0.92 + open * 0.75).toFixed(3)})`)}`)}
        </div>
      </div>
    </div>
  )
})
