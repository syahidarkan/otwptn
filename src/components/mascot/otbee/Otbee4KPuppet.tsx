'use client'

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Mixer, type ClipName, type FxEvent, type PlayOpts, type Pose } from './engine'
import BD from './body.json'

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v))
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

const about = (cx: number, cy: number, inner: string) =>
  `translate(${cx}px, ${cy}px) ${inner} translate(${-cx}px, ${-cy}px)`

export interface Otbee4KPuppetHandle {
  play: (name: ClipName, opts?: PlayOpts) => void
  setView: (v: string) => void
  fx: (type: FxEvent['type'], side?: -1 | 1) => void
  setFacing: (f: 1 | -1) => void
  mixer: Mixer
}

export interface Otbee4KPuppetProps {
  growthProgress?: number // 0 = head only, 1 = full body
  size?: number // target full-body rendered height (e.g. 118)
  followPointer?: boolean
  action?: ClipName
  facing?: 1 | -1
  paused?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  onClipDone?: () => void
  onErraticPointer?: () => void
}

export const Otbee4KPuppet = forwardRef<Otbee4KPuppetHandle, Otbee4KPuppetProps>(
  function Otbee4KPuppet(
    {
      growthProgress = 1,
      size = 118,
      followPointer = true,
      action = 'idle',
      facing = 1,
      paused = false,
      className,
      style,
      onClick,
      onClipDone,
      onErraticPointer,
    },
    ref
  ) {
    const mixer = useMemo(() => new Mixer(), [])
    const [pose, setPose] = useState<Pose>(() => mixer.pose)
    const rootRef = useRef<HTMLDivElement>(null)
    const fxLayerRef = useRef<SVGSVGElement>(null)
    const facingRef = useRef(facing)
    const pausedRef = useRef(paused)

    useEffect(() => {
      facingRef.current = facing
    }, [facing])

    useEffect(() => {
      pausedRef.current = paused
    }, [paused])

    useEffect(() => {
      if (action) mixer.play(action)
    }, [action, mixer])

    // Particle FX generator
    const spawnFx = (type: FxEvent['type'], side: -1 | 1 = 1) => {
      const svg = fxLayerRef.current
      if (!svg) return
      const S = size / 160
      const hcx = BD.w / 2
      const hcy = BD.h * 0.35

      const mk = (tag: string, attrs: Record<string, string | number>) => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag)
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v))
        return el
      }

      const add = (
        el: SVGElement,
        keyframes: Keyframe[],
        dur: number,
        ease = 'ease-out',
        delay = 0
      ) => {
        svg.appendChild(el)
        const a = el.animate(keyframes, {
          duration: dur,
          easing: ease,
          fill: 'forwards',
          delay,
        })
        a.onfinish = () => el.remove()
      }

      if (type === 'smoke' || type === 'dust') {
        const n = 8
        for (let i = 0; i < n; i++) {
          const r = (10 + Math.random() * 14) * S
          const el = mk('circle', {
            r,
            cx: hcx + (Math.random() - 0.5) * 60 * S,
            cy: hcy + (Math.random() - 0.5) * 40 * S,
            fill: '#fef08a',
            opacity: 0.8,
          }) as SVGElement
          const angle = (i / n) * Math.PI * 2
          const dist = (35 + Math.random() * 45) * S
          const tx = Math.cos(angle) * dist
          const ty = Math.sin(angle) * dist
          add(
            el,
            [
              { transform: 'translate(0, 0) scale(0.3)', opacity: 0.9 },
              { transform: `translate(${tx}px, ${ty}px) scale(1.15)`, opacity: 0.6, offset: 0.5 },
              { transform: `translate(${tx * 1.4}px, ${ty * 1.4}px) scale(1.4)`, opacity: 0 },
            ],
            540 + Math.random() * 200
          )
        }
      } else if (type === 'sparkle' || type === 'stars') {
        for (let i = 0; i < 5; i++) {
          const el = mk('polygon', {
            points: '0,-8 2.4,-2.4 8,0 2.4,2.4 0,8 -2.4,2.4 -8,0 -2.4,-2.4',
            fill: '#fbbf24',
          }) as SVGElement
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8
          const dist = (25 + Math.random() * 40) * S
          const tx = Math.cos(angle) * dist * side
          const ty = Math.sin(angle) * dist
          add(
            el,
            [
              { transform: `translate(${hcx}px, ${hcy}px) scale(0.2) rotate(0deg)`, opacity: 1 },
              {
                transform: `translate(${hcx + tx}px, ${hcy + ty}px) scale(${1.2 * S}) rotate(${90 + Math.random() * 90}deg)`,
                opacity: 0.9,
                offset: 0.6,
              },
              {
                transform: `translate(${hcx + tx * 1.2}px, ${hcy + ty * 1.2}px) scale(0.2) rotate(180deg)`,
                opacity: 0,
              },
            ],
            750 + Math.random() * 250
          )
        }
      }
    }

    useImperativeHandle(ref, () => ({
      play: (name, opts) => mixer.play(name, opts),
      setView: () => {},
      fx: (type, side) => spawnFx(type, side),
      setFacing: (f) => {
        facingRef.current = f
      },
      mixer,
    }))

    // Pointer cursor tracking (strictly normalized to [-1, 1] so eyes NEVER detach)
    useEffect(() => {
      if (!followPointer) {
        mixer.setPointer(null)
        return
      }

      const move = (e: PointerEvent) => {
        const el = rootRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height * 0.45

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

    // Animation RAF loop
    useEffect(() => {
      let raf = 0
      let prev = performance.now()
      let run = true

      const frame = (now: number) => {
        if (!run) return
        raf = requestAnimationFrame(frame)
        if (pausedRef.current) return
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
    const p = clamp(growthProgress, 0, 1)

    // ----------------------------------------------------------------
    // 1-by-1 Organic Emergence Progressions:
    // Stage 0 (p = 0): Head only (145px)
    // Stage 1 (p: 0.08 -> 0.40): Torso grows downward from neck
    // Stage 2 (p: 0.38 -> 0.72): Arms and Legs pop out with bouncy ease
    // Stage 3 (p: 0.68 -> 0.98): Wings unfold from back and flap
    // Stage 4 (p >= 0.98): Full body (118px roaming size)
    // ----------------------------------------------------------------
    const tTorso = clamp((p - 0.08) / 0.32)
    const eTorso = tTorso * tTorso * (3 - 2 * tTorso)

    const tLimbs = clamp((p - 0.38) / 0.34)
    const eLimbs =
      tLimbs <= 0
        ? 0
        : tLimbs < 0.75
        ? (tLimbs / 0.75) * 1.08
        : 1.08 - ((tLimbs - 0.75) / 0.25) * 0.08

    const tWings = clamp((p - 0.68) / 0.28)
    const eWings = tWings * tWings * (3 - 2 * tWings)

    // Dynamic framing & scale
    const heroSize = 145
    const targetSize = size || 118
    const currentHeight = heroSize - (heroSize - targetSize) * p
    const viewH = 760 + (BD.h - 760) * p
    const k = currentHeight / viewH
    const currentWidth = BD.w * k

    const centerY = 380 + (BD.h / 2 - 380) * p
    const canvasOffsetY = -(centerY - viewH / 2) * k

    // Whole body rig transforms
    const FH = BD.feet[1] - BD.figTop
    const [fx, fy] = BD.feet
    const centre = { x: fx, y: BD.figTop + FH * 0.6 }
    const whole = [
      `translate(${(P.x * FH * 0.5).toFixed(2)}px, ${(P.y * FH * 0.5).toFixed(2)}px)`,
      about(fx, fy, `scale(${P.sx.toFixed(4)}, ${P.sy.toFixed(4)})`),
      about(centre.x, centre.y, `rotate(${(P.rot * 0.5).toFixed(2)}deg)`),
    ].join(' ')

    const yaw = clamp(P.headYaw, -1, 1)
    const pit = clamp(P.headPitch, -1, 1)
    const headTransform = `translate(${(P.headX * FH * 0.6).toFixed(2)}px, ${(P.headY * FH * 0.6).toFixed(2)}px) ${about(BD.neck[0], BD.neck[1], `rotate(${(P.headRot + yaw * 3.5).toFixed(2)}deg)`)}`
    const face = `translate(${(yaw * 18).toFixed(1)}px, ${(-pit * 14).toFixed(1)}px)`

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
          src={`/brand/body/${n}.png`}
          alt=""
          draggable={false}
          style={{
            width: BD.w,
            height: BD.h,
            display: 'block',
            imageRendering: 'auto',
          }}
        />
      </div>
    )

    // Eye with strictly bounded gaze vector
    const eye = (name: 'eyeL' | 'eyeR', wink: number) => {
      const e = BD[name]
      const [cx, cy] = e.c
      const closing = Math.max(clamp(P.blink + wink), P.eyeArc)
      const arc = smooth(0.86, 0.97, closing)
      const happy = P.eyeArc >= clamp(P.blink + wink)
      const look = `translate(${(P.lookX * 10).toFixed(1)}px, ${(P.lookY * 7.5).toFixed(1)}px)`
      const sc = P.eyeScale
      const ew = (e.box[2] - e.box[0]) * 0.86
      const eh = e.box[3] - e.box[1]

      return (
        <React.Fragment key={name}>
          {layer(
            name,
            `${face} ${look} ${about(cx, cy, `scale(${sc}, ${(sc * Math.max(0.04, 1 - closing * 0.96)).toFixed(4)})`)}`,
            1 - arc
          )}
          <svg
            width={BD.w}
            height={BD.h}
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

    const m = BD.mouth
    const open = clamp(P.mouthOpen)

    // Wing flutter
    const wingFlap = about(
      centre.x,
      BD.figTop + FH * 0.5,
      `scale(${(1 + clamp(P.wing / 260, -0.25, 0.25)).toFixed(3)}, 1)`
    )

    // Part Transforms:
    // 1. Torso grows downward from neck
    const torsoTf = about(
      BD.neck[0],
      BD.neck[1],
      `scale(${(0.45 + 0.55 * eTorso).toFixed(4)}, ${eTorso.toFixed(4)})`
    )

    // 2. Arms (with walk/run swings when full body, or pop-out ease during emergence)
    const armLRot = p >= 0.98 ? -P.armL * 0.7 : -22 * (1 - Math.min(1, tLimbs)) + P.armL * 0.3
    const armRRot = p >= 0.98 ? P.armR * 0.7 : 22 * (1 - Math.min(1, tLimbs)) - P.armR * 0.3
    const armLTf = about(
      BD.armL.pivot[0],
      BD.armL.pivot[1],
      `scale(${eLimbs.toFixed(4)}) rotate(${armLRot.toFixed(2)}deg)`
    )
    const armRTf = about(
      BD.armR.pivot[0],
      BD.armR.pivot[1],
      `scale(${eLimbs.toFixed(4)}) rotate(${armRRot.toFixed(2)}deg)`
    )

    // 3. Legs (with walk/run leg swing when full body)
    const legLRot = p >= 0.98 ? P.legL * 0.8 : 0
    const legRRot = p >= 0.98 ? P.legR * 0.8 : 0
    const legLTf = about(
      BD.legL.pivot[0],
      BD.legL.pivot[1],
      `scale(${eLimbs.toFixed(4)}) rotate(${legLRot.toFixed(2)}deg)`
    )
    const legRTf = about(
      BD.legR.pivot[0],
      BD.legR.pivot[1],
      `scale(${eLimbs.toFixed(4)}) rotate(${legRRot.toFixed(2)}deg)`
    )

    // 4. Wings unfolding from back
    const wingsTf = `${wingFlap} ${about(centre.x, 700, `scale(${eWings.toFixed(4)})`)}`

    return (
      <div
        ref={rootRef}
        onClick={onClick}
        className={`relative overflow-visible select-none flex items-center justify-center ${className ?? ''}`}
        style={{
          width: currentWidth,
          height: currentHeight,
          ...style,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            width: BD.w,
            height: BD.h,
            transformOrigin: 'top center',
            transform: `translateX(-50%) translateY(${canvasOffsetY}px) scale(${k})`,
          }}
        >
          <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: whole }}>
            {/* Stage 3: Wings (Behind figure, unfold & flap at p > 0.68) */}
            {eWings > 0.01 && layer('wings', wingsTf, eWings)}

            {/* Stage 2: Limbs - Legs (Under torso, pop out at p > 0.38) */}
            {eLimbs > 0.01 && (
              <>
                {layer('legL', legLTf, Math.min(1, tLimbs * 1.5))}
                {layer('legR', legRTf, Math.min(1, tLimbs * 1.5))}
              </>
            )}

            {/* Stage 1: Torso (Grows downward from under neck at p > 0.08) */}
            {eTorso > 0.01 && layer('torso', torsoTf, eTorso)}

            {/* Stage 2: Limbs - Arms (Pop out from sides at p > 0.38) */}
            {eLimbs > 0.01 && (
              <>
                {layer('armL', armLTf, Math.min(1, tLimbs * 1.5))}
                {layer('armR', armRTf, Math.min(1, tLimbs * 1.5))}
              </>
            )}

            {/* Stage 0: 4K Head & Face (Always visible, interactive, smiling & blinking) */}
            <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: headTransform }}>
              {layer(
                'antL',
                about(BD.antL.pivot[0], BD.antL.pivot[1], `rotate(${(-P.antL * 0.9).toFixed(2)}deg)`)
              )}
              {layer(
                'antR',
                about(BD.antR.pivot[0], BD.antR.pivot[1], `rotate(${(P.antR * 0.9).toFixed(2)}deg)`)
              )}
              {layer('head')}
              {layer(
                'cheekL',
                `${face} ${about(BD.cheekL.c[0], BD.cheekL.c[1], `scale(${P.cheek.toFixed(3)})`)}`
              )}
              {layer(
                'cheekR',
                `${face} ${about(BD.cheekR.c[0], BD.cheekR.c[1], `scale(${P.cheek.toFixed(3)})`)}`
              )}
              {eye('eyeL', P.winkL)}
              {eye('eyeR', P.winkR)}
              {layer(
                'mouth',
                `${face} ${about(m.c[0], m.box[1], `scale(${(1 + open * 0.12).toFixed(3)}, ${(0.92 + open * 0.75).toFixed(3)})`)}`
              )}
            </div>
          </div>
        </div>

        {/* Particle Effects Layer */}
        <svg
          ref={fxLayerRef}
          width={BD.w}
          height={BD.h}
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            overflow: 'visible',
            pointerEvents: 'none',
            transformOrigin: 'top center',
            transform: `translateX(-50%) translateY(${canvasOffsetY}px) scale(${k})`,
          }}
        />
      </div>
    )
  }
)

Otbee4KPuppet.displayName = 'Otbee4KPuppet'
