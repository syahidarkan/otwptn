'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Mixer, type ClipName, type PlayOpts, type Pose } from '@/components/mascot/otbee/engine'
import BD from '@/components/mascot/otbee/body.json'

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v))
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

const about = (cx: number, cy: number, inner: string) =>
  `translate(${cx}px, ${cy}px) ${inner} translate(${-cx}px, ${-cy}px)`

export default function HeroMascotGuide() {
  const mixer = useMemo(() => new Mixer(), [])
  const [pose, setPose] = useState<Pose>(() => mixer.pose)
  const rootRef = useRef<HTMLDivElement>(null)
  const [bubbleText, setBubbleText] = useState<string | null>('Halo pejuang PTN! 🐝✨')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Scroll transition progress (0 = in hero at top, 1 = scrolled past hero zone)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isHandedOver, setIsHandedOver] = useState(false)

  // 1. Scroll listener
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      // 0px -> 260px is the organic growth zone
      const p = clamp(y / 260)
      setScrollProgress(p)

      if (p >= 0.98 && !isHandedOver) {
        setIsHandedOver(true)
      } else if (p < 0.88 && isHandedOver) {
        setIsHandedOver(false)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHandedOver])

  // 2. Cursor tracking with normalized deltas so eyes NEVER detach
  useEffect(() => {
    if (scrollProgress > 0.4) {
      mixer.setPointer(null)
      return
    }

    const move = (e: PointerEvent) => {
      const el = rootRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height * 0.45

      // Strictly normalize cursor delta to [-1, 1] relative to viewport
      const dx = clamp((e.clientX - cx) / (window.innerWidth * 0.35), -1, 1)
      const dy = clamp((e.clientY - cy) / (window.innerHeight * 0.35), -1, 1)
      mixer.setPointer({ x: dx, y: dy })
    }

    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      mixer.setPointer(null)
    }
  }, [scrollProgress, mixer])

  // 3. RAF Animation Loop
  useEffect(() => {
    let raf = 0
    let prev = performance.now()
    let run = true

    const frame = (now: number) => {
      if (!run) return
      raf = requestAnimationFrame(frame)
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

  // 4. Interactive Click Reactions
  const handleMascotClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const reactions: { text: string; clip: ClipName }[] = [
      { text: 'Semangat belajar yaa! 🚀🔥', clip: 'cheer' },
      { text: 'Otbee siap nemenin kamu lolos PTN! 💛', clip: 'shy' },
      { text: 'Fokus & konsisten, PTN impian pasti tercapai! 🌟', clip: 'nod' },
      { text: 'Ayo gasspol latihan soal hari ini! 🐝💪', clip: 'cheer' },
      { text: 'Jangan lupa istirahat & jaga kesehatan yaa! ☕✨', clip: 'nod' },
    ]
    const r = reactions[Math.floor(Math.random() * reactions.length)]
    mixer.play(r.clip, {
      onDone: () => mixer.play('idle'),
    })
    setBubbleText(r.text)
    timerRef.current = setTimeout(() => {
      setBubbleText(null)
    }, 3800)
  }

  const P = pose
  const p = scrollProgress

  // ----------------------------------------------------------------
  // Organic Stage Progressions (1 per 1 piece-by-piece growth):
  // Stage 0: Head only
  // Stage 1: Torso grows downward from under the neck (p: 0.08 -> 0.40)
  // Stage 2: Limbs (arms and legs) pop out from torso (p: 0.38 -> 0.72)
  // Stage 3: Wings unfurl and begin to flap (p: 0.68 -> 0.98)
  // ----------------------------------------------------------------
  const tTorso = clamp((p - 0.08) / 0.32)
  const eTorso = tTorso * tTorso * (3 - 2 * tTorso) // smooth ease-in-out

  const tLimbs = clamp((p - 0.38) / 0.34)
  // Bouncy pop-out for arms and legs
  const eLimbs = tLimbs <= 0
    ? 0
    : tLimbs < 0.75
    ? (tLimbs / 0.75) * 1.08
    : 1.08 - ((tLimbs - 0.75) / 0.25) * 0.08

  const tWings = clamp((p - 0.68) / 0.28)
  const eWings = tWings * tWings * (3 - 2 * tWings)

  // Camera viewport framing: transitions from head-focus (top 760px) to full-body (1408px)
  const viewH = 760 + (BD.h - 760) * p
  const currentHeight = 145 - 27 * p // 145px down to 118px
  const k = currentHeight / viewH
  const currentWidth = BD.w * k

  // Center Y transitions from head center (380px) to full-body center (BD.h / 2 = 704px)
  const centerY = 380 + (BD.h / 2 - 380) * p
  const canvasOffsetY = -(centerY - viewH / 2) * k

  // Whole figure rig transforms
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

  // Official 4K layer generator
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

  // 4K Eye with normalized bounded look vector (impossible to detach)
  const eye = (name: 'eyeL' | 'eyeR', wink: number) => {
    const e = BD[name]
    const [cx, cy] = e.c
    const closing = Math.max(clamp(P.blink + wink), P.eyeArc)
    const arc = smooth(0.86, 0.97, closing)
    const happy = P.eyeArc >= clamp(P.blink + wink)
    // Locked within +-11px horizontally and +-8px vertically
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

  // Wing flap animation
  const wingFlap = about(
    centre.x,
    BD.figTop + FH * 0.5,
    `scale(${(1 + clamp(P.wing / 260, -0.25, 0.25)).toFixed(3)}, 1)`
  )

  // Organic Part Transforms:
  // 1. Torso emerging from neck
  const torsoTf = about(
    BD.neck[0],
    BD.neck[1],
    `scale(${(0.45 + 0.55 * eTorso).toFixed(4)}, ${eTorso.toFixed(4)})`
  )

  // 2. Arms popping out from shoulders
  const armLTf = about(
    BD.armL.pivot[0],
    BD.armL.pivot[1],
    `scale(${eLimbs.toFixed(4)}) rotate(${(-22 * (1 - Math.min(1, tLimbs)) + P.armL * 0.3).toFixed(2)}deg)`
  )
  const armRTf = about(
    BD.armR.pivot[0],
    BD.armR.pivot[1],
    `scale(${eLimbs.toFixed(4)}) rotate(${(22 * (1 - Math.min(1, tLimbs)) - P.armR * 0.3).toFixed(2)}deg)`
  )

  // 3. Legs dropping down from beneath torso
  const legsTf = about(centre.x, 1030, `scale(${eLimbs.toFixed(4)})`)

  // 4. Wings unfolding from back
  const wingsTf = `${wingFlap} ${about(centre.x, 700, `scale(${eWings.toFixed(4)})`)}`

  return (
    <div
      id="hero-feature-guide"
      ref={rootRef}
      className="w-full flex flex-col items-center justify-center relative select-none py-2"
      style={{
        opacity: isHandedOver ? 0 : 1,
        transition: 'opacity 0.22s ease-out',
        pointerEvents: isHandedOver ? 'none' : 'auto',
      }}
    >
      {/* Ambient Glow Aura */}
      <div
        className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-amber-400/30 via-amber-300/20 to-pink-300/10 blur-3xl -z-10 pointer-events-none"
        style={{
          opacity: 1 - p * 0.8,
          transform: `scale(${1 - p * 0.18})`,
          transition: 'transform 0.15s ease-out',
        }}
      />

      {/* Speech Bubble (fades out as user scrolls) */}
      {bubbleText && p < 0.25 && (
        <div className="mb-2 z-20 px-4 py-1.5 rounded-2xl bg-white/95 text-gray-900 text-xs font-black border border-amber-300/80 shadow-md backdrop-blur-md animate-bounce relative">
          {bubbleText}
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-r border-b border-amber-300/80 rotate-45" />
        </div>
      )}

      {/* Interactive Mascot Stage (Unified 4K Puppet: Head -> Torso -> Limbs -> Wings) */}
      <div
        onClick={handleMascotClick}
        className="cursor-pointer relative overflow-visible flex items-center justify-center"
        style={{
          width: currentWidth,
          height: currentHeight,
        }}
        title="Klik Otbee!"
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
            {eLimbs > 0.01 && layer('legs', legsTf, Math.min(1, tLimbs * 1.5))}

            {/* Stage 1: Torso (Grows downward from under neck at p > 0.08) */}
            {eTorso > 0.01 && layer('torso', torsoTf, eTorso)}

            {/* Stage 2: Limbs - Arms (Pop out from sides at p > 0.38) */}
            {eLimbs > 0.01 && layer('armL', armLTf, Math.min(1, tLimbs * 1.5))}
            {eLimbs > 0.01 && layer('armR', armRTf, Math.min(1, tLimbs * 1.5))}

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
      </div>
    </div>
  )
}
