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
    const rootRef = useRef<HTMLDivElement>(null)
    const fxLayerRef = useRef<SVGSVGElement>(null)
    const facingRef = useRef(facing)
    const pausedRef = useRef(paused)
    const progressRef = useRef(growthProgress)

    // Direct DOM element refs for 60 FPS zero-re-render animation performance
    const wholeRigRef = useRef<HTMLDivElement>(null)
    const canvasWrapRef = useRef<HTMLDivElement>(null)
    const wingsRef = useRef<HTMLDivElement>(null)
    const bodyRef = useRef<HTMLDivElement>(null)
    const headRef = useRef<HTMLDivElement>(null)
    const antLRef = useRef<HTMLDivElement>(null)
    const antRRef = useRef<HTMLDivElement>(null)
    const cheekLRef = useRef<HTMLDivElement>(null)
    const cheekRRef = useRef<HTMLDivElement>(null)
    const eyeLRef = useRef<HTMLDivElement>(null)
    const eyeRRef = useRef<HTMLDivElement>(null)
    const pupilLRef = useRef<SVGGElement>(null)
    const pupilRRef = useRef<SVGGElement>(null)
    const eyeLSvgRef = useRef<SVGPathElement>(null)
    const eyeRSvgRef = useRef<SVGPathElement>(null)
    const mouthRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      facingRef.current = facing
    }, [facing])

    const wakeLoopRef = useRef<() => void>(() => {})
    useEffect(() => {
      pausedRef.current = paused
      if (!paused) wakeLoopRef.current()
    }, [paused])

    useEffect(() => {
      progressRef.current = growthProgress
    }, [growthProgress])

    useEffect(() => {
      if (action) mixer.play(action)
    }, [action, mixer])

    // Particle FX generator
    const spawnFx = (type: FxEvent['type'], side: -1 | 1 = 1) => {
      const svg = fxLayerRef.current
      if (!svg) return
      const S = (size || 118) / 160
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

    // Normalized pointer tracking: clamped strictly to [-1, 1] so eyes never detach
    useEffect(() => {
      if (!followPointer || paused) {
        mixer.setPointer(null)
        return
      }

      let cachedRect: DOMRect | null = null
      let lastRectCheck = 0

      const move = (e: PointerEvent) => {
        const el = rootRef.current
        if (!el) return
        const now = performance.now()
        if (!cachedRect || now - lastRectCheck > 50) {
          cachedRect = el.getBoundingClientRect()
          lastRectCheck = now
        }
        const cx = cachedRect.left + cachedRect.width / 2
        const cy = cachedRect.top + cachedRect.height * 0.45

        const x = clamp((e.clientX - cx) / (window.innerWidth * 0.35), -1, 1) * facingRef.current
        const y = clamp((e.clientY - cy) / (window.innerHeight * 0.35), -1, 1)
        mixer.setPointer({ x, y })
      }

      const onScrollOrResize = () => { cachedRect = null }
      window.addEventListener('scroll', onScrollOrResize, { passive: true })
      window.addEventListener('resize', onScrollOrResize, { passive: true })
      window.addEventListener('pointermove', move, { passive: true })
      return () => {
        window.removeEventListener('scroll', onScrollOrResize)
        window.removeEventListener('resize', onScrollOrResize)
        window.removeEventListener('pointermove', move)
        mixer.setPointer(null)
      }
    }, [followPointer, paused, mixer])

    // HIGH-PERFORMANCE ANIMATION LOOP: Direct DOM transforms (Zero React re-renders)
    useEffect(() => {
      let raf = 0
      let prev = performance.now()
      let run = true
      let lastW = -1
      let lastH = -1
      let lastCanvasY = -9999
      let lastK = -1

      const frame = (now: number) => {
        if (!run || pausedRef.current) return
        raf = requestAnimationFrame(frame)
        const dt = Math.min(0.1, (now - prev) / 1000)
        prev = now
        const P = mixer.update(dt)

        const p = clamp(progressRef.current, 0, 1)

        // Emergence calculations:
        // Stage 0 (p = 0): Head only (145px)
        // Stage 1 (p: 0.05 -> 0.65): Body emerges seamlessly downward from behind neck
        // Stage 2 (p: 0.50 -> 0.95): Wings unfold from back & flutter
        // Stage 3 (p >= 0.95): Full body active
        const tBody = clamp((p - 0.05) / 0.6)
        const eBody = tBody * tBody * (3 - 2 * tBody)

        const tWings = clamp((p - 0.5) / 0.45)
        const eWings = tWings * tWings * (3 - 2 * tWings)

        const targetSize = size || 118
        const heroHeadHeight = (targetSize === 118 && p > 0) ? 140 : targetSize
        const currentHeight = heroHeadHeight - (heroHeadHeight - targetSize) * p
        const viewH = 760 + (BD.h - 760) * p
        const k = currentHeight / viewH
        const currentWidth = BD.w * k

        const centerY = 380 + (BD.h / 2 - 380) * p
        const canvasOffsetY = -(centerY - viewH / 2) * k

        // Update root container width & height ONLY when changed (avoids 60fps layout recalculation)
        if (rootRef.current && (Math.abs(currentWidth - lastW) > 0.4 || Math.abs(currentHeight - lastH) > 0.4)) {
          lastW = currentWidth
          lastH = currentHeight
          rootRef.current.style.width = `${currentWidth.toFixed(1)}px`
          rootRef.current.style.height = `${currentHeight.toFixed(1)}px`
        }

        // Canvas wrapper transform ONLY when changed
        if (canvasWrapRef.current && (Math.abs(canvasOffsetY - lastCanvasY) > 0.4 || Math.abs(k - lastK) > 0.0004)) {
          lastCanvasY = canvasOffsetY
          lastK = k
          canvasWrapRef.current.style.transform = `translateX(-50%) translateY(${canvasOffsetY.toFixed(1)}px) scale(${k.toFixed(5)})`
        }

        // Whole rig
        const FH = BD.feet[1] - BD.figTop
        const [fx, fy] = BD.feet
        const rotCenterY = 500 + (BD.figTop + FH * 0.6 - 500) * p
        const centre = { x: fx, y: rotCenterY }
        const whole = [
          `translate(${(P.x * FH * 0.5).toFixed(2)}px, ${(P.y * FH * 0.5).toFixed(2)}px)`,
          about(fx, fy, `scale(${P.sx.toFixed(4)}, ${P.sy.toFixed(4)})`),
          about(centre.x, centre.y, `rotate(${P.rot.toFixed(2)}deg)`),
        ].join(' ')

        if (wholeRigRef.current) {
          wholeRigRef.current.style.transform = whole
        }

        // Wings: Flap flutter and unfold
        if (wingsRef.current) {
          if (eWings <= 0.01) {
            wingsRef.current.style.opacity = '0'
            wingsRef.current.style.display = 'none'
          } else {
            wingsRef.current.style.display = 'block'
            wingsRef.current.style.opacity = `${eWings.toFixed(3)}`
            const wingFlap = about(
              centre.x,
              BD.figTop + FH * 0.5,
              `scale(${(1 + clamp(P.wing / 260, -0.25, 0.25)).toFixed(3)}, 1)`
            )
            wingsRef.current.style.transform = `${wingFlap} ${about(centre.x, 700, `scale(${eWings.toFixed(4)})`)}`
          }
        }

        // Body: Complete seamless body with arms and legs emerging from under chin/neck
        if (bodyRef.current) {
          if (eBody <= 0.01) {
            bodyRef.current.style.opacity = '0'
            bodyRef.current.style.display = 'none'
          } else {
            bodyRef.current.style.display = 'block'
            bodyRef.current.style.opacity = `${eBody.toFixed(3)}`
            const slideY = (1 - eBody) * -110
            bodyRef.current.style.transform = `translateY(${slideY.toFixed(1)}px) ${about(BD.neck[0], BD.neck[1], `scale(${(0.55 + 0.45 * eBody).toFixed(4)}, ${eBody.toFixed(4)})`)}`
          }
        }

        // Head and face: Natural pitch & gaze lifting towards cursor
        const yaw = clamp(P.headYaw, -1, 1)
        const pit = clamp(P.headPitch, -1, 1)
        const headTf = `translate(${(P.headX * FH * 0.6 + yaw * 14).toFixed(2)}px, ${(P.headY * FH * 0.6 - pit * 22).toFixed(2)}px) ${about(600, 480, `rotate(${(P.headRot * 0.4 + yaw * 2.0).toFixed(2)}deg)`)}`
        const faceTf = `translate(${(yaw * 20).toFixed(1)}px, ${(-pit * 18).toFixed(1)}px)`

        if (headRef.current) headRef.current.style.transform = headTf
        if (antLRef.current) {
          antLRef.current.style.transform = about(BD.antL.pivot[0], BD.antL.pivot[1], `rotate(${(-P.antL * 0.9).toFixed(2)}deg)`)
        }
        if (antRRef.current) {
          antRRef.current.style.transform = about(BD.antR.pivot[0], BD.antR.pivot[1], `rotate(${(P.antR * 0.9).toFixed(2)}deg)`)
        }
        if (cheekLRef.current) {
          cheekLRef.current.style.transform = `${faceTf} ${about(BD.cheekL.c[0], BD.cheekL.c[1], `scale(${P.cheek.toFixed(3)})`)}`
        }
        if (cheekRRef.current) {
          cheekRRef.current.style.transform = `${faceTf} ${about(BD.cheekR.c[0], BD.cheekR.c[1], `scale(${P.cheek.toFixed(3)})`)}`
        }

        // Eyes: Blink, wink, dynamic iris/pupil tracking inside the socket
        const sc = P.eyeScale
        const lookTf = `translate(${(P.lookX * 8).toFixed(1)}px, ${(P.lookY * 6).toFixed(1)}px)`
        const pupilDx = (P.lookX * 18).toFixed(1)
        const pupilDy = (P.lookY * 14).toFixed(1)
        if (pupilLRef.current) {
          pupilLRef.current.setAttribute('transform', `translate(${pupilDx}, ${pupilDy})`)
        }
        if (pupilRRef.current) {
          pupilRRef.current.setAttribute('transform', `translate(${pupilDx}, ${pupilDy})`)
        }

        const updateEye = (
          wink: number,
          eyeEl: HTMLDivElement | null,
          svgPath: SVGPathElement | null,
          eData: typeof BD.eyeL
        ) => {
          if (!eyeEl) return
          const [cx, cy] = eData.c
          const closing = Math.max(clamp(P.blink + wink), P.eyeArc)
          const arc = smooth(0.86, 0.97, closing)
          const happy = P.eyeArc >= clamp(P.blink + wink)
          const ew = (eData.box[2] - eData.box[0]) * 0.86
          const eh = eData.box[3] - eData.box[1]

          eyeEl.style.opacity = `${(1 - arc).toFixed(3)}`
          eyeEl.style.transform = `${faceTf} ${lookTf} ${about(cx, cy, `scale(${sc}, ${(sc * Math.max(0.04, 1 - closing * 0.96)).toFixed(4)})`)}`

          if (svgPath) {
            svgPath.parentElement!.style.opacity = `${arc.toFixed(3)}`
            svgPath.parentElement!.style.transform = faceTf
            svgPath.setAttribute(
              'd',
              happy
                ? `M ${cx - ew / 2} ${cy + eh * 0.12} Q ${cx} ${cy - eh * 0.42} ${cx + ew / 2} ${cy + eh * 0.12}`
                : `M ${cx - ew / 2} ${cy - eh * 0.04} Q ${cx} ${cy + eh * 0.36} ${cx + ew / 2} ${cy - eh * 0.04}`
            )
          }
        }

        updateEye(P.winkL, eyeLRef.current, eyeLSvgRef.current, BD.eyeL)
        updateEye(P.winkR, eyeRRef.current, eyeRSvgRef.current, BD.eyeR)

        // Mouth
        if (mouthRef.current) {
          const open = clamp(P.mouthOpen)
          mouthRef.current.style.transform = `${faceTf} ${about(BD.mouth.c[0], BD.mouth.box[1], `scale(${(1 + open * 0.12).toFixed(3)}, ${(0.92 + open * 0.75).toFixed(3)})`)}`
        }
      }

      wakeLoopRef.current = () => {
        prev = performance.now()
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(frame)
      }
      if (!pausedRef.current) {
        raf = requestAnimationFrame(frame)
      }
      return () => {
        run = false
        cancelAnimationFrame(raf)
      }
    }, [mixer, size])

    // Lightweight asset helper (prefers WebP, falls back cleanly)
    const layerImg = (name: string) => (
      <picture>
        <source srcSet={`/brand/body/${name}.webp`} type="image/webp" />
        <img
          src={`/brand/body/${name}.png`}
          alt=""
          draggable={false}
          style={{
            width: BD.w,
            height: BD.h,
            display: 'block',
            imageRendering: 'auto',
          }}
        />
      </picture>
    )

    const layerStyle: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      transformOrigin: '0 0',
      pointerEvents: 'none',
      userSelect: 'none',
    }

    const initialH = size || 118
    const initialViewH = 760 + (BD.h - 760) * growthProgress
    const initialW = BD.w * (initialH / initialViewH)

    return (
      <div
        ref={rootRef}
        onClick={onClick}
        className={`relative overflow-visible select-none flex items-center justify-center ${className ?? ''}`}
        style={{
          width: initialW,
          height: initialH,
          ...style,
        }}
      >
        <div
          ref={canvasWrapRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            width: BD.w,
            height: BD.h,
            transformOrigin: 'top center',
            transform: 'translateX(-50%) scale(0.19)',
          }}
        >
          <div ref={wholeRigRef} style={{ position: 'absolute', inset: 0, transformOrigin: '0 0' }}>
            {/* Stage 2: Wings (Behind figure, unfold & flap) */}
            <div ref={wingsRef} style={{ ...layerStyle, opacity: growthProgress > 0.5 ? 1 : 0, display: growthProgress > 0.5 ? 'block' : 'none' }}>
              {layerImg('wings')}
            </div>

            {/* Stage 1: Seamless Complete Body with Arms and Legs */}
            <div ref={bodyRef} style={{ ...layerStyle, opacity: growthProgress > 0.05 ? 1 : 0, display: growthProgress > 0.05 ? 'block' : 'none' }}>
              {layerImg('body')}
            </div>

            {/* Stage 0: 4K Head & Face (Always visible, interactive, smiling & blinking) */}
            <div ref={headRef} style={{ position: 'absolute', inset: 0, transformOrigin: '0 0' }}>
              <div ref={antLRef} style={layerStyle}>
                {layerImg('antL')}
              </div>
              <div ref={antRRef} style={layerStyle}>
                {layerImg('antR')}
              </div>
              <div style={layerStyle}>
                {layerImg('head')}
              </div>
              <div ref={cheekLRef} style={layerStyle}>
                {layerImg('cheekL')}
              </div>
              <div ref={cheekRRef} style={layerStyle}>
                {layerImg('cheekR')}
              </div>

              {/* Eye Left: Solid Sclera + Clipped Moving Pupil */}
              <div ref={eyeLRef} style={layerStyle}>
                <svg
                  viewBox={`0 0 ${BD.w} ${BD.h}`}
                  width={BD.w}
                  height={BD.h}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'visible',
                    pointerEvents: 'none',
                  }}
                >
                  <defs>
                    <clipPath id="otbee-eyeL-socket">
                      <ellipse cx="517" cy="488" rx="72" ry="68" />
                    </clipPath>
                  </defs>
                  {/* Solid White Sclera with natural black eyelid/eyelashes */}
                  <image href="/brand/body/sclera_solid_eyeL.webp" width={BD.w} height={BD.h} />
                  {/* Clipped Pupil & Iris: Actively Glides Following Cursor */}
                  <g clipPath="url(#otbee-eyeL-socket)">
                    <g ref={pupilLRef}>
                      <image href="/brand/body/pupil_eyeL.webp" width={BD.w} height={BD.h} />
                    </g>
                  </g>
                </svg>
              </div>
              <svg
                width={BD.w}
                height={BD.h}
                style={{
                  position: 'absolute',
                  inset: 0,
                  overflow: 'visible',
                  opacity: 0,
                  pointerEvents: 'none',
                }}
              >
                <path
                  ref={eyeLSvgRef}
                  fill="none"
                  stroke="#141010"
                  strokeWidth={(BD.eyeL.box[3] - BD.eyeL.box[1]) * 0.12}
                  strokeLinecap="round"
                />
              </svg>

              {/* Eye Right: Solid Sclera + Clipped Moving Pupil */}
              <div ref={eyeRRef} style={layerStyle}>
                <svg
                  viewBox={`0 0 ${BD.w} ${BD.h}`}
                  width={BD.w}
                  height={BD.h}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'visible',
                    pointerEvents: 'none',
                  }}
                >
                  <defs>
                    <clipPath id="otbee-eyeR-socket">
                      <ellipse cx="792" cy="471" rx="70" ry="66" />
                    </clipPath>
                  </defs>
                  {/* Solid White Sclera with natural black eyelid/eyelashes */}
                  <image href="/brand/body/sclera_solid_eyeR.webp" width={BD.w} height={BD.h} />
                  {/* Clipped Pupil & Iris: Actively Glides Following Cursor */}
                  <g clipPath="url(#otbee-eyeR-socket)">
                    <g ref={pupilRRef}>
                      <image href="/brand/body/pupil_eyeR.webp" width={BD.w} height={BD.h} />
                    </g>
                  </g>
                </svg>
              </div>
              <svg
                width={BD.w}
                height={BD.h}
                style={{
                  position: 'absolute',
                  inset: 0,
                  overflow: 'visible',
                  opacity: 0,
                  pointerEvents: 'none',
                }}
              >
                <path
                  ref={eyeRSvgRef}
                  fill="none"
                  stroke="#141010"
                  strokeWidth={(BD.eyeR.box[3] - BD.eyeR.box[1]) * 0.12}
                  strokeLinecap="round"
                />
              </svg>

              {/* Mouth */}
              <div ref={mouthRef} style={layerStyle}>
                {layerImg('mouth')}
              </div>
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
          }}
        />
      </div>
    )
  }
)

Otbee4KPuppet.displayName = 'Otbee4KPuppet'
