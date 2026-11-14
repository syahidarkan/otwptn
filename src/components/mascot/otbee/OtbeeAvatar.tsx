'use client'

/**
 * OtbeeAvatar - rigged 2D vector mascot.
 *
 * Geometry is NOT hand-drawn: every part (head, eyes, wings, arms, satchel, ...) is a vector trace of the
 * official character sheet (Maskot/2d all pov.png), see scripts/mascot-trace. This component only assembles
 * those parts into a hierarchy and drives them with the animation engine (engine.ts).
 */

import { useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Ref } from 'react'
import { Mixer, type ClipName, type FxEvent, type PlayOpts, type Pose } from './engine'
import { FACING, getCachedView, loadView } from './views'
import type { PartData, ViewData, ViewName } from './types'
import { skinD } from './skin'

export interface OtbeeHandle {
  play: (name: ClipName, opts?: PlayOpts) => void
  setView: (v: ViewName) => void
  fx: (type: FxEvent['type'], side?: -1 | 1) => void
  /** tell the avatar which way its own body is currently mirrored (scaleX(-1) on an ancestor), so
   *  pointer-follow (head turn / eye look) can correct for it and still point at the real cursor */
  setFacing: (f: 1 | -1) => void
  mixer: Mixer
}

export interface OtbeeAvatarProps {
  view?: ViewName
  /** clip played (and looped if the clip loops) whenever this value changes */
  action?: ClipName
  /** rendered height of the figure in px */
  size?: number
  /** render only the head (no neck / torso) - used for the chatbot launcher */
  headOnly?: boolean
  followPointer?: boolean
  /** initial mirror state (see OtbeeHandle.setFacing) for callers that render a permanently-mirrored avatar */
  facing?: 1 | -1
  paused?: boolean
  shadow?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  ref?: Ref<OtbeeHandle>
  onClipDone?: () => void
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const smooth = (a: number, b: number, v: number) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }
const rot = (a: number, p: [number, number]) => `rotate(${a.toFixed(2)} ${p[0]} ${p[1]})`
const scl = (sx: number, sy: number, p: [number, number]) => `translate(${p[0]} ${p[1]}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-p[0]} ${-p[1]})`

type Side = 'L' | 'R'
const SIDE_VIEWS = new Set<ViewName>(['right', 'left', 'threeQuarter'])
/** which side of the screen a wing belongs to, per view (flap direction mirrors with it) */
function sideOf(name: string, view: ViewName): Side {
  if (SIDE_VIEWS.has(view)) return view === 'left' ? 'R' : 'L'
  return name.endsWith('R') ? 'R' : 'L'
}

export default function OtbeeAvatar({
  view = 'front', action = 'idle', size = 160, headOnly = false, followPointer = false, facing = 1,
  paused = false, shadow = true, className, style, onClick, ref, onClipDone,
}: OtbeeAvatarProps) {
  const uid = useId().replace(/:/g, '')
  const [shown, setShown] = useState<ViewName>(view)
  const [data, setData] = useState<ViewData | undefined>(() => getCachedView(view))
  const mixer = useMemo(() => new Mixer(), [])
  const els = useRef<Record<string, SVGElement | null>>({})
  const last = useRef<Record<string, string>>({})
  const svgRef = useRef<SVGSVGElement>(null)
  const fxRef = useRef<SVGGElement>(null)
  const wantView = useRef<ViewName>(view)
  const ghostRef = useRef<SVGGElement>(null)
  const wrapRef = useRef<SVGGElement>(null)
  const goTo = useRef<(v: ViewName) => void>(() => {})
  const dataRef = useRef<ViewData | undefined>(data)
  const shownRef = useRef<ViewName>(shown)
  const cbDone = useRef(onClipDone)
  useEffect(() => { cbDone.current = onClipDone })
  const facingRef = useRef<1 | -1>(facing)
  useEffect(() => { facingRef.current = facing }, [facing])

  // --- load geometry for the displayed view
  useEffect(() => {
    let live = true
    loadView(shown)
      .then(d => { if (live) { dataRef.current = d; shownRef.current = shown; setData(d) } })
      .catch(e => { console.error('[otbee] failed to load view', shown, e) })
    return () => { live = false }
  }, [shown])

  // --- view change => cross-turn: the old pose is cloned into a ghost that fades/slides out while the new view slides in
  useEffect(() => {
    goTo.current = (v: ViewName) => {
      wantView.current = v
      const from = shownRef.current
      if (v === from) return
      loadView(v).then(nd => {
        if (wantView.current !== v || shownRef.current === v) return
        const fig = els.current.fig, ghost = ghostRef.current, wrap = wrapRef.current
        const dir = Math.sign(FACING[v] - FACING[from]) || 1
        const unit = (dataRef.current?.w ?? 300) * 0.035
        if (fig && ghost && wrap) {
          ghost.getAnimations().forEach(a => a.cancel())
          ghost.replaceChildren()
          const clone = fig.cloneNode(true) as SVGElement
          const idMap = new Map<string, string>()
          clone.querySelectorAll('[id]').forEach(el => { const o = el.id; el.id = o + '-g'; idMap.set(o, o + '-g') })
          clone.querySelectorAll('[clip-path]').forEach(el => {
            const m = /url\(#([^)]+)\)/.exec(el.getAttribute('clip-path') ?? '')
            if (m && idMap.has(m[1])) el.setAttribute('clip-path', `url(#${idMap.get(m[1])})`)
          })
          clone.querySelectorAll('use').forEach(el => {
            const h = (el.getAttribute('href') ?? '').slice(1)
            if (idMap.has(h)) el.setAttribute('href', '#' + idMap.get(h))
          })
          ghost.appendChild(clone)
          const ease = 'cubic-bezier(.45,.05,.25,1)'
          ghost.animate([
            { opacity: 1, transform: 'translateX(0px) scale(1)' },
            { opacity: 0.85, offset: 0.35 },
            { opacity: 0, transform: `translateX(${-dir * unit}px) scale(0.965)` },
          ], { duration: 420, easing: ease, fill: 'forwards' }).onfinish = () => ghost.replaceChildren()
          wrap.getAnimations().forEach(a => a.cancel())
          wrap.animate([
            { opacity: 0, transform: `translateX(${dir * unit}px) scale(0.965)` },
            { opacity: 0.2, offset: 0.25 },
            { opacity: 1, transform: 'translateX(0px) scale(1)' },
          ], { duration: 420, easing: ease })
        }
        dataRef.current = nd; shownRef.current = v
        setShown(v); setData(nd)
      })
    }
  })
  useEffect(() => { goTo.current(view) }, [view])

  // --- declarative action
  useEffect(() => {
    mixer.play(action, { onDone: () => { cbDone.current?.(); mixer.play('idle') } })
  }, [action, mixer])

  // --- particles
  const spawnFx = (type: FxEvent['type'], side: -1 | 1 = 1) => {
    const g = fxRef.current, d = dataRef.current
    if (!g || !d) return
    spawn(g, d, type, side)
  }
  useEffect(() => { mixer.setFxHandler(e => spawnFx(e.type, e.side)) })

  useImperativeHandle(ref, () => ({
    play: (n, o) => mixer.play(n, o),
    setView: v => goTo.current(v),
    fx: (t, s) => spawnFx(t, s ?? 1),
    setFacing: f => { facingRef.current = f },
    mixer,
  }), [mixer])

  // --- pointer following
  useEffect(() => {
    if (!followPointer) { mixer.setPointer(null); return }
    const move = (e: PointerEvent) => {
      const r = svgRef.current?.getBoundingClientRect()
      if (!r) return
      const cx = r.left + r.width / 2, cy = r.top + r.height * 0.3
      // when the body is mirrored (facingRef = -1), the local x-axis renders flipped too, so the
      // raw screen-space x delta must be flipped back here or the head turns the wrong way (towards
      // the cursor on screen, but away from it inside this component's own un-mirrored coordinates).
      const x = clamp((e.clientX - cx) / (window.innerWidth * 0.35), -1, 1) * facingRef.current
      const y = clamp((e.clientY - cy) / (window.innerHeight * 0.35), -1, 1)
      mixer.setPointer({ x, y })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => { window.removeEventListener('pointermove', move); mixer.setPointer(null) }
  }, [followPointer, mixer])

  // --- frame loop
  const pausedRef = useRef(paused)
  useEffect(() => { pausedRef.current = paused })
  useLayoutEffect(() => {
    let raf = 0, prev = performance.now(), run = true
    const setT = (key: string, v: string) => {
      const el = els.current[key]
      if (!el) return
      if (last.current[key] !== v) { last.current[key] = v; el.setAttribute('transform', v) }
    }
    const setO = (key: string, v: number) => {
      const el = els.current[key]; if (!el) return
      const s = v.toFixed(3)
      if (last.current[key + '#o'] !== s) { last.current[key + '#o'] = s; el.setAttribute('opacity', s) }
    }
    const frame = (now: number) => {
      if (!run) return
      raf = requestAnimationFrame(frame)
      if (pausedRef.current) { prev = now; return }
      const dt = (now - prev) / 1000; prev = now
      const P = mixer.update(dt)
      const d = dataRef.current
      if (!d) return
      const tx = 1
      applyPose(d, shownRef.current, P, tx, setT, setO, els.current)
    }
    raf = requestAnimationFrame(frame)
    return () => { run = false; cancelAnimationFrame(raf) }
  }, [mixer])

  if (!data) return <svg ref={svgRef} width={size * 0.88} height={size} className={className} style={style} aria-hidden />

  const { w, h } = data
  const [bx0, by0, bx1, by1] = data.box ?? [0, 0, w, h]
  const fh = by1 - by0
  const headBox = data.parts.head?.bbox ?? [bx0, by0, bx1, by1]
  const hcx = data.parts.head ? (headBox[0] + headBox[2]) / 2 : (bx0 + bx1) / 2
  const flat = shown === 'top' || shown === 'bottom'
  const vbH = fh * (flat ? 1.3 : 1.04)
  const vb = headOnly
    ? { x: headBox[0] - 20, y: headBox[1] - 24, w: headBox[2] - headBox[0] + 40, h: headBox[3] - headBox[1] + 30 }
    : { x: hcx - (vbH * 0.95) / 2, y: by0 - fh * 0.02, w: vbH * 0.95, h: vbH }
  const pxW = (size * vb.w) / vb.h

  const setRef = (k: string) => (el: SVGElement | null) => { if (el) els.current[k] = el; else delete els.current[k]; delete last.current[k] }

  const layers = (ls: { f: string; d?: string }[] | undefined) => ls?.map((l, i) => <path key={i} d={l.d} fill={l.f} fillRule="evenodd" />)

  const renderPart = (name: string): React.ReactNode => {
    const p = data.parts[name]
    if (!p) return null
    if (p.eye) return <Eye key={name} name={name} p={p} uid={uid} reg={setRef} />
    if (name === 'mouth') return <Mouth key={name} p={p} uid={uid} reg={setRef} />
    const kids = data.order.filter(n => data.parts[n].parent === name).map(renderPart)
    if (p.skin) {
      const sk = p.skin
      return (
        <g key={name} ref={setRef(name)} id={name === 'armL' || name === 'armR' ? `${uid}-${name}` : undefined}
          mask={sk.fade ? `url(#${uid}-fm-${name})` : undefined}>
          {p.layers?.map((l, i) => <path key={i} ref={setRef(`${name}#${i}`)} d={skinD(l.s!, sk, 0, 0, 0)} fill={l.f} fillRule="nonzero" />)}
          {kids}
        </g>
      )
    }
    return (
      <g key={name} ref={setRef(name)} id={name === 'armL' || name === 'armR' ? `${uid}-${name}` : undefined}>
        {p.cap && <circle cx={p.cap.c[0]} cy={p.cap.c[1]} r={p.cap.r} fill={p.cap.rim} />}
        {layers(p.layers)}
        {p.cap && <circle cx={p.cap.c[0]} cy={p.cap.c[1]} r={Math.max(1, p.cap.r - 2)} fill={p.cap.f} />}
        {kids}
      </g>
    )
  }
  const top = data.order.filter(n => !data.parts[n].parent)
  const list = headOnly ? top.filter(n => n === 'head') : top

  return (
    <svg
      ref={svgRef}
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      width={pxW}
      height={size}
      className={className}
      style={{ overflow: 'visible', display: 'block', cursor: onClick ? 'pointer' : undefined, ...style }}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
      aria-label="Otbee"
    >
      <defs>
        {data.order.filter(n => data.parts[n].skin?.fade).map(n => {
          const [y0, y1] = data.parts[n].skin!.fade!
          return (
            <mask key={n} id={`${uid}-fm-${n}`} maskUnits="userSpaceOnUse" x={-600} y={-600} width={1800} height={1800}>
              <linearGradient id={`${uid}-fg-${n}`} gradientUnits="userSpaceOnUse" x1={0} y1={y0} x2={0} y2={y1}>
                <stop offset="0" stopColor="#000" /><stop offset="1" stopColor="#fff" />
              </linearGradient>
              <rect x={-600} y={-600} width={1800} height={1800} fill={`url(#${uid}-fg-${n})`} />
            </mask>
          )
        })}
      </defs>
      {shadow && !headOnly && <ellipse ref={setRef('shadow')} cx={hcx} cy={by1 - fh * 0.005} rx={fh * (flat ? 0.3 : 0.24)} ry={fh * 0.022} fill="#000" opacity={0.16} />}
      <g ref={ghostRef} style={{ pointerEvents: 'none', transformBox: 'view-box', transformOrigin: '50% 100%' }} />
      <g ref={wrapRef} style={{ transformBox: 'view-box', transformOrigin: '50% 100%' }}>
      <g ref={setRef('fig')}>
        {list.map(renderPart)}
        {/* raised arms are drawn again above the head (same transform via <use>) */}
        {!headOnly && (['armL', 'armR'] as const).filter(n => data.parts[n]).map(n => (
          <use key={n + 'f'} ref={setRef(n + ':front')} href={`#${uid}-${n}`} display="none" />
        ))}
      </g>
      </g>
      <g ref={fxRef} style={{ pointerEvents: 'none' }} />
    </svg>
  )
}

// ---------------------------------------------------------------- eye
function Eye({ name, p, uid, reg }: { name: string; p: PartData; uid: string; reg: (k: string) => (el: SVGElement | null) => void }) {
  const e = p.eye!
  const [cx, cy] = p.center ?? p.pivot
  const bb = p.bbox ?? [cx - 12, cy - 12, cx + 12, cy + 12]
  const ew = (bb[2] - bb[0]) * 0.78, eh = bb[3] - bb[1]
  const [px, py, rx, ry, ang] = e.pupilE
  const cid = `${uid}-clip-${name}`
  return (
    <g ref={reg(name)}>
      <g ref={reg(name + ':body')}>
        <clipPath id={cid}>{e.shape.map((l, i) => <path key={i} d={l.d} />)}</clipPath>
        {e.shape.map((l, i) => <path key={i} d={l.d} fill={l.f} fillRule="evenodd" />)}
        <g clipPath={`url(#${cid})`}>
          <g ref={reg(name + ':look')}>
            <ellipse cx={px} cy={py} rx={rx} ry={ry} transform={`rotate(${ang} ${px} ${py})`} fill="#0c0b10" />
            {e.hl.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" />)}
          </g>
        </g>
        {e.lash.map((l, i) => <path key={i} d={l.d} fill={l.f} fillRule="evenodd" />)}
      </g>
      {/* closed (u) and happy (n) eye arcs */}
      <path ref={reg(name + ':closed')} d={`M ${cx - ew / 2} ${cy - eh * 0.02} Q ${cx} ${cy + eh * 0.34} ${cx + ew / 2} ${cy - eh * 0.02}`}
        fill="none" stroke="#1a120d" strokeWidth={Math.max(1.6, ew * 0.11)} strokeLinecap="round" opacity={0} />
      <path ref={reg(name + ':happy')} d={`M ${cx - ew / 2} ${cy + eh * 0.16} Q ${cx} ${cy - eh * 0.34} ${cx + ew / 2} ${cy + eh * 0.16}`}
        fill="none" stroke="#1a120d" strokeWidth={Math.max(1.6, ew * 0.11)} strokeLinecap="round" opacity={0} />
    </g>
  )
}

// ---------------------------------------------------------------- mouth
function Mouth({ p, uid, reg }: { p: PartData; uid: string; reg: (k: string) => (el: SVGElement | null) => void }) {
  const bb = p.bbox ?? [0, 0, 20, 10]
  const [cx, cy] = [(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2]
  const cid = `${uid}-mouthclip`
  return (
    <g ref={reg('mouthW')}>
      <g ref={reg('mouth')}>{p.layers?.map((l, i) => <path key={i} d={l.d} fill={l.f} fillRule="evenodd" />)}</g>
      <g ref={reg('mouth:draw')} opacity={0} transform={`translate(${cx} ${cy})`} data-w={Math.max(14, bb[2] - bb[0])}>
        <clipPath id={cid}><path ref={reg('mouth:clip')} d="" /></clipPath>
        <path ref={reg('mouth:fill')} d="" fill="#4a1519" />
        <ellipse ref={reg('mouth:tongue')} cx={0} cy={0} rx={1} ry={1} fill="#ee8a86" clipPath={`url(#${cid})`} />
        <path ref={reg('mouth:line')} d="" fill="none" stroke="#2b1710" strokeLinecap="round" />
      </g>
    </g>
  )
}

// ---------------------------------------------------------------- pose application
function applyPose(
  d: ViewData, view: ViewName, P: Pose, turnX: number,
  setT: (k: string, v: string) => void, setO: (k: string, v: number) => void,
  els: Record<string, SVGElement | null>,
) {
  const bx = d.box ?? [0, 0, d.w, d.h]
  const H = bx[3] - bx[1]
  const hb = d.parts.head?.bbox
  const W = hb ? (hb[0] + hb[2]) : (bx[0] + bx[2])   // = 2 * figure centre x
  const hw = hb ? hb[2] - hb[0] : 180, hh = hb ? hb[3] - hb[1] : 150
  const facing = FACING[view]
  // figure: translate -> squash about the feet -> rotate about body centre
  const feet: [number, number] = [W / 2, bx[3]]
  const centre: [number, number] = [W / 2, bx[1] + H * 0.58]
  // head turn / nod = parallax: surface features slide further than the head silhouette
  const yaw = clamp(P.headYaw, -1, 1), pit = clamp(P.headPitch, -1, 1)
  const sideK = facing !== 0 ? 0.55 : 1
  const tr = (depth: number) => `translate(${(yaw * hw * 0.11 * depth * sideK).toFixed(2)} ${(-pit * hh * 0.1 * depth).toFixed(2)})`
  setT('fig',
    `translate(${(P.x * H).toFixed(2)} ${(P.y * H).toFixed(2)}) ${scl(P.sx * turnX, P.sy, feet)} ${rot(P.rot, centre)}`)
  const lift = clamp(1 + P.y * 1.8, 0.45, 1.1)
  setT('shadow', scl(lift * turnX, lift, [W / 2, bx[3]]))
  setO('shadow', 0.16 * lift)

  const flapUp = (side: Side, k: number) => (side === 'L' ? 1 : -1) * k
  for (const name of d.order) {
    const part = d.parts[name]
    if (!part) continue
    const pv = part.pivot
    if (name === 'head') {
      // the WHOLE head silhouette turns (translate + tilt + an off-centre squash toward the
      // turn direction), not just the surface features -- those add their own small extra
      // parallax on top (nested inside this <g>) so the turn reads as one solid head, not a
      // floating face.
      const originX = pv[0] + yaw * hw * 0.16 * sideK, originY = pv[1] - pit * hh * 0.12
      setT('head', `translate(${(P.headX * H).toFixed(2)} ${(P.headY * H).toFixed(2)}) ${tr(1)} ${rot(P.headRot + yaw * 5 * sideK, pv)} ${scl(1 - 0.09 * Math.abs(yaw) * sideK, 1 - 0.06 * Math.abs(pit), [originX, originY])}`)
    } else if (name === 'goggles') {
      setT(name, `${tr(0.18)} ${scl(1 - 0.04 * Math.abs(yaw), 1, part.center ?? pv)}`)
    } else if (name.startsWith('wing')) {
      const side = sideOf(name, view)
      const isLower = name === 'wingLL' || name === 'wingLR' || (SIDE_VIEWS.has(view) && name === 'wingL')
      const k = view === 'top' || view === 'bottom' ? 0.35 : isLower ? -0.62 : 1
      const a = flapUp(side, P.wing * k)
      const sq = 1 - 0.1 * Math.abs(Math.sin(a * 0.04))
      setT(name, `${rot(a, pv)} ${scl(sq, 1, pv)}`)
    } else if (name === 'antL') {
      setT(name, `${tr(-0.15)} ${rot(P.antL, pv)}`)
    } else if (name === 'antR') {
      setT(name, `${tr(-0.15)} ${rot(-P.antR, pv)}`)
    } else if (part.skin) {
      let al = 0, be = 0, lift = 0
      if (name === 'armL') { al = P.armL; be = P.elbowL }
      else if (name === 'armR') { al = -P.armR; be = -P.elbowR }
      else if (name === 'arm') { const f = facing || 1; al = -f * P.armR; be = -f * P.elbowR }
      else if (name === 'legL' || name === 'legR') {
        const L = name === 'legL', sideView = facing !== 0
        const swing = L ? P.legL : P.legR, k = L ? P.kneeL : P.kneeR
        lift = L ? P.liftL : P.liftR
        al = sideView ? -facing * swing : (L ? 1 : -1) * swing * 0.3
        be = sideView ? facing * k : (L ? -1 : 1) * k * 0.25
      }
      const g = els[name]
      const key = `${al.toFixed(2)}|${be.toFixed(2)}|${lift.toFixed(4)}`
      if (g && g.getAttribute('data-k') !== key) {
        g.setAttribute('data-k', key)
        part.layers?.forEach((l, i) => els[`${name}#${i}`]?.setAttribute('d', skinD(l.s!, part.skin!, al, be, -lift * H)))
      }
      if (name === 'armL' || name === 'armR') {
        const f = els[name + ':front']
        if (f) {
          const want = (name === 'armL' ? P.armL : P.armR) > 52 ? 'inline' : 'none'
          if (f.getAttribute('display') !== want) f.setAttribute('display', want)
        }
      }
    } else if (name === 'bag') {
      setT(name, rot(P.bag, pv))
    } else if (name.startsWith('cheek')) {
      const sxc = 1 - 0.25 * Math.max(0, name === 'cheekL' ? yaw : name === 'cheekR' ? -yaw : 0) - 0.08 * Math.abs(yaw)
      setT(name, `${tr(0)} ${scl(P.cheek * sxc, P.cheek, part.center ?? pv)}`)
    } else if (name.startsWith('eye')) {
      const rawBlink = P.blink + (name === 'eyeL' ? P.winkL : name === 'eyeR' ? P.winkR : Math.max(P.winkL, P.winkR))
      const b = clamp(rawBlink, 0, 1)
      const c = part.center ?? pv
      const es = P.eyeScale
      const sxe = name === 'eyeL' ? 1 - 0.3 * Math.max(0, yaw) - 0.08 * Math.max(0, -yaw) : name === 'eyeR' ? 1 - 0.3 * Math.max(0, -yaw) - 0.08 * Math.max(0, yaw) : 1 - 0.1 * Math.abs(yaw)
      setT(name, `${tr(0)} ${scl(sxe, 1, c)}`)
      // the open eye always squashes shut first, and the arc only appears once it is (almost) flat -> never two eyes at once
      const closing = Math.max(b, P.eyeArc)
      setT(name + ':body', scl(es, es * Math.max(0.05, 1 - closing * 0.95), c))
      const arcAmt = smooth(0.86, 0.97, closing)
      const happy = P.eyeArc >= b
      setO(name + ':body', 1 - arcAmt)
      setO(name + ':closed', happy ? 0 : arcAmt)
      setO(name + ':happy', happy ? arcAmt : 0)
      const pe = part.eye!.pupilE
      setT(name + ':look', `translate(${(P.lookX * pe[2] * 0.42).toFixed(2)} ${(P.lookY * pe[3] * 0.4).toFixed(2)})`)
    } else if (name === 'mouth') {
      setT('mouthW', `${tr(0.05)} ${scl(1 - 0.12 * Math.abs(yaw), 1, part.center ?? pv)}`)
      drawMouth(part, P, els, setO)
    }
  }
}

function drawMouth(part: PartData, P: Pose, els: Record<string, SVGElement | null>, setO: (k: string, v: number) => void) {
  const g = els['mouth:draw']
  if (!g) return
  // traced art mouth is the default expression; the procedural mouth cross-fades in when a clip asks for it
  const amt = Math.max(P.mouthDrawn, smooth(0.03, 0.1, P.mouthOpen), smooth(0.7, 0.3, P.mouthCurve))
  setO('mouth', 1 - amt)
  setO('mouth:draw', amt)
  if (amt < 0.01) return
  const w = Number(g.getAttribute('data-w')) || 18
  const open = clamp(P.mouthOpen, 0, 1), curve = clamp(P.mouthCurve, -1, 1)
  const half = w / 2
  const fill = els['mouth:fill'], line = els['mouth:line'], clip = els['mouth:clip'], tongue = els['mouth:tongue']
  if (open < 0.07) {
    line?.setAttribute('d', `M ${-half * 0.9} ${(-curve * w * 0.05).toFixed(2)} Q 0 ${(curve * w * 0.3).toFixed(2)} ${half * 0.9} ${(-curve * w * 0.05).toFixed(2)}`)
    line?.setAttribute('stroke-width', (w * 0.1).toFixed(2))
    line?.setAttribute('opacity', '1')
    fill?.setAttribute('d', ''); clip?.setAttribute('d', ''); tongue?.setAttribute('opacity', '0')
  } else {
    const depth = w * (0.12 + open * 0.52)
    const corner = -curve * w * 0.06
    const dd = `M ${-half} ${corner.toFixed(2)} Q 0 ${(curve * w * 0.1 + corner).toFixed(2)} ${half} ${corner.toFixed(2)} Q ${(half * 0.9).toFixed(2)} ${(depth * 1.45).toFixed(2)} 0 ${(depth * 1.4).toFixed(2)} Q ${(-half * 0.9).toFixed(2)} ${(depth * 1.45).toFixed(2)} ${-half} ${corner.toFixed(2)} Z`
    fill?.setAttribute('d', dd); clip?.setAttribute('d', dd)
    line?.setAttribute('opacity', '0')
    tongue?.setAttribute('opacity', '1')
    tongue?.setAttribute('cx', '0'); tongue?.setAttribute('cy', (depth * 1.02).toFixed(2))
    tongue?.setAttribute('rx', (w * 0.3).toFixed(2)); tongue?.setAttribute('ry', (depth * 0.5 + 0.5).toFixed(2))
  }
}

// ---------------------------------------------------------------- particles (Web Animations API)
const NS = 'http://www.w3.org/2000/svg'
function mk<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>) {
  const el = document.createElementNS(NS, tag)
  for (const k in attrs) el.setAttribute(k, String(attrs[k]))
  return el
}
const STAR = 'M0,-1 C0.12,-0.3 0.3,-0.12 1,0 C0.3,0.12 0.12,0.3 0,1 C-0.12,0.3 -0.3,0.12 -1,0 C-0.3,-0.12 -0.12,-0.3 0,-1 Z'
const HEART = 'M0,0.9 C-1.4,-0.1 -1.1,-1.1 -0.5,-1 C-0.2,-0.95 0,-0.7 0,-0.5 C0,-0.7 0.2,-0.95 0.5,-1 C1.1,-1.1 1.4,-0.1 0,0.9 Z'
const DROP = 'M0,-1 C0.6,-0.2 0.8,0.2 0,0.9 C-0.8,0.2 -0.6,-0.2 0,-1 Z'

function spawn(g: SVGGElement, d: ViewData, type: FxEvent['type'], side: -1 | 1) {
  const hb = d.parts.head?.bbox ?? [d.w * 0.2, 0, d.w * 0.8, d.h * 0.5]
  const hcx = (hb[0] + hb[2]) / 2, hcy = (hb[1] + hb[3]) / 2, hw = hb[2] - hb[0]
  const S = hw / 180 // scale unit (front head is ~180 wide)
  const add = (el: SVGElement, keyframes: Keyframe[], dur: number, easing = 'cubic-bezier(.2,.7,.3,1)', delay = 0) => {
    g.appendChild(el)
    const a = el.animate(keyframes, { duration: dur, easing, delay, fill: 'both' })
    a.onfinish = () => el.remove()
  }
  const at = (x: number, y: number, s: number) => `translate(${x}px, ${y}px) scale(${s})`
  const star = (x: number, y: number, r: number, c: string, dx: number, dy: number, dur: number, delay = 0) => {
    const el = mk('path', { d: STAR, fill: c }) as SVGElement
    el.style.transformBox = 'fill-box'; el.style.transformOrigin = 'center'
    add(el, [
      { transform: `translate(${x}px,${y}px) scale(0) rotate(0deg)`, opacity: 0 },
      { transform: `translate(${x + dx * 0.4}px,${y + dy * 0.4}px) scale(${r}) rotate(90deg)`, opacity: 1, offset: 0.35 },
      { transform: `translate(${x + dx}px,${y + dy}px) scale(0) rotate(200deg)`, opacity: 0 },
    ], dur, 'ease-out', delay)
  }
  switch (type) {
    case 'sparkle': {
      const x = hcx + side * hw * 0.62, y = hcy - hw * 0.2
      star(x, y, 9 * S, '#FFE27A', side * 6 * S, -10 * S, 900)
      star(x + side * 14 * S, y + 16 * S, 5 * S, '#fff', side * 8 * S, -4 * S, 800, 120)
      break
    }
    case 'stars': {
      const cols = ['#FFE27A', '#fff', '#FFB020', '#FFD1DC']
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + Math.random() * 0.5
        star(hcx, hcy, (5 + Math.random() * 6) * S, cols[i % cols.length], Math.cos(a) * hw * 0.95, Math.sin(a) * hw * 0.8 - 10 * S, 900 + Math.random() * 300)
      }
      break
    }
    case 'smoke': {
      // a soft puff-cloud burst at the feet, used for "spawning" the mascot into a new spot
      const fx0 = d.w / 2, fy0 = d.h * 0.98
      for (let i = 0; i < 9; i++) {
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.15
        const dist = (22 + Math.random() * 30) * S
        const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist * 0.7
        const r = (10 + Math.random() * 14) * S
        const el = mk('circle', { cx: 0, cy: 0, r, fill: i % 2 ? '#C9B8A6' : '#E7DCCF' }) as SVGElement
        el.style.transformBox = 'fill-box'; el.style.transformOrigin = 'center'
        add(el, [
          { transform: at(fx0, fy0, 0.1), opacity: 0 },
          { transform: at(fx0 + dx * 0.3, fy0 + dy * 0.3, 0.9), opacity: 0.85, offset: 0.18 },
          { transform: at(fx0 + dx, fy0 + dy - 10 * S, 1.5), opacity: 0 },
        ], 620 + Math.random() * 180, 'cubic-bezier(.15,.7,.3,1)', i * 14)
      }
      break
    }
    case 'dust': {
      const fy = d.h * 0.975
      for (const sd of [-1, 1] as const) for (let i = 0; i < 3; i++) {
        const el = mk('circle', { cx: 0, cy: 0, r: (4 + i * 1.5) * S, fill: '#fff', opacity: 0.8 }) as SVGElement
        add(el, [
          { transform: at(d.w / 2 + sd * 18 * S, fy, 0.4), opacity: 0.8 },
          { transform: at(d.w / 2 + sd * (46 + i * 16) * S, fy - (6 + i * 6) * S, 1.5), opacity: 0 },
        ], 650, 'ease-out', i * 40)
      }
      break
    }
    case 'zzz': {
      const letters = ['z', 'Z', 'Z']
      letters.forEach((ch, i) => {
        const el = mk('text', { 'font-family': 'ui-rounded, system-ui, sans-serif', 'font-weight': 900, 'font-size': (12 + i * 5) * S, fill: '#7FB2E5', stroke: '#fff', 'stroke-width': 1.2 * S, 'paint-order': 'stroke' }) as SVGElement
        el.textContent = ch
        add(el, [
          { transform: at(hcx + side * hw * 0.5, hcy - hw * 0.1, 0.4), opacity: 0 },
          { transform: at(hcx + side * (hw * 0.62 + i * 12 * S), hcy - hw * 0.35 - i * 20 * S, 1), opacity: 1, offset: 0.4 },
          { transform: at(hcx + side * (hw * 0.7 + i * 16 * S), hcy - hw * 0.7 - i * 24 * S, 1.1), opacity: 0 },
        ], 2200, 'ease-out', i * 420)
      })
      break
    }
    case 'heart': {
      for (let i = 0; i < 3; i++) {
        const el = mk('path', { d: HEART, fill: i % 2 ? '#FF7FA0' : '#FF5A87' }) as SVGElement
        add(el, [
          { transform: at(hcx + side * hw * 0.45, hcy - hw * 0.1, 0), opacity: 0 },
          { transform: at(hcx + side * (hw * 0.55 + i * 10 * S), hcy - hw * 0.45 - i * 14 * S, (6 + i) * S), opacity: 1, offset: 0.4 },
          { transform: at(hcx + side * (hw * 0.6 + i * 14 * S), hcy - hw * 0.85 - i * 18 * S, (5 + i) * S), opacity: 0 },
        ], 1600, 'ease-out', i * 250)
      }
      break
    }
    case 'question':
    case 'exclaim':
    case 'note':
    case 'bulb': {
      const x = hcx + side * hw * 0.62, y = hcy - hw * 0.5
      if (type === 'bulb') {
        const grp = mk('g', {}) as SVGElement
        grp.appendChild(mk('circle', { r: 7, cy: -2, fill: '#FFE26A', stroke: '#F2B01E', 'stroke-width': 1.2 }))
        grp.appendChild(mk('rect', { x: -3.2, y: 4, width: 6.4, height: 4, rx: 1, fill: '#9aa0a6' }))
        grp.appendChild(mk('path', { d: 'M-9,-10 L-12,-13 M9,-10 L12,-13 M0,-12 L0,-16', stroke: '#F2B01E', 'stroke-width': 1.4, 'stroke-linecap': 'round' }))
        add(grp, [
          { transform: at(x, y, 0), opacity: 0 }, { transform: at(x, y - 6 * S, 1.3 * S), opacity: 1, offset: 0.25 },
          { transform: at(x, y - 10 * S, 1.2 * S), opacity: 1, offset: 0.8 }, { transform: at(x, y - 16 * S, 0.6 * S), opacity: 0 },
        ], 1500, 'ease-out')
        break
      }
      const el = mk('text', { 'font-family': 'ui-rounded, system-ui, sans-serif', 'font-weight': 900, 'font-size': 30 * S, fill: type === 'exclaim' ? '#F04438' : type === 'note' ? '#8B5CF6' : '#F2A81D', stroke: '#fff', 'stroke-width': 2.4 * S, 'paint-order': 'stroke', 'text-anchor': 'middle' }) as SVGElement
      el.textContent = type === 'question' ? '?' : type === 'exclaim' ? '!' : '♪'
      add(el, [
        { transform: at(x, y, 0.2), opacity: 0 }, { transform: at(x, y - 8 * S, 1.15), opacity: 1, offset: 0.25 },
        { transform: at(x, y - 14 * S, 1), opacity: 1, offset: 0.75 }, { transform: at(x, y - 26 * S, 0.8), opacity: 0 },
      ], 1400, 'ease-out')
      break
    }
    case 'sweat': {
      const el = mk('path', { d: DROP, fill: '#8CCBF2', stroke: '#fff', 'stroke-width': 0.2 }) as SVGElement
      const x = hcx + side * hw * 0.5, y = hcy - hw * 0.28
      add(el, [
        { transform: at(x, y, 0), opacity: 0 }, { transform: at(x, y, 7 * S), opacity: 1, offset: 0.2 },
        { transform: at(x + side * 3 * S, y + 24 * S, 6 * S), opacity: 0.9, offset: 0.8 }, { transform: at(x + side * 4 * S, y + 34 * S, 5 * S), opacity: 0 },
      ], 1400, 'ease-in')
      break
    }
    case 'confetti': {
      const cols = ['#FF5A87', '#FFD23F', '#3DDC97', '#4DA3FF', '#9B6BFF', '#FF9F43']
      for (let i = 0; i < 18; i++) {
        const el = mk('rect', { x: -2.5 * S, y: -1.5 * S, width: 5 * S, height: 3 * S, fill: cols[i % cols.length], rx: 0.6 }) as SVGElement
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4
        const sp = hw * (0.5 + Math.random() * 0.8)
        const dx = Math.cos(a) * sp, dy = Math.sin(a) * sp
        add(el, [
          { transform: `translate(${hcx}px,${hcy}px) rotate(0deg) scale(0.4)`, opacity: 1 },
          { transform: `translate(${hcx + dx}px,${hcy + dy}px) rotate(${180 + Math.random() * 360}deg) scale(1)`, opacity: 1, offset: 0.45 },
          { transform: `translate(${hcx + dx * 1.3}px,${hcy + dy * 0.6 + hw * 0.9}px) rotate(${360 + Math.random() * 360}deg) scale(0.9)`, opacity: 0 },
        ], 1500 + Math.random() * 500, 'cubic-bezier(.2,.6,.4,1)', Math.random() * 120)
      }
      break
    }
  }
}

