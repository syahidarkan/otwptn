/**
 * The brain that makes Otbee live in the page (pure TS, no React).
 *
 *  - He is positioned in DOCUMENT coordinates (position:absolute), so while he rests he scrolls with the page
 *    natively - perfectly in sync, no chasing.
 *  - While the user is scrolling he does nothing. When scrolling has been quiet for SETTLE_MS he decides:
 *    still comfortably on screen -> stay; scrolled away -> hop down (stepping across surfaces) or fly up.
 *  - Every landing spot is something visible under his feet (see world.ts).
 *  - He spawns in a puff of smoke on first load and after every page change.
 *  - He reacts to what the user points at / holds a finger on, explaining it (see explain.ts).
 */
import type { OtbeeHandle } from './OtbeeAvatar'
import { CLIPS, type ClipName, type FxType, type PlayOpts } from './engine'
import { otbeeBrain } from './brain'
import { scanSurfaces, pickSpot, stepsBetween, anchorOnElement, IGNORE_SELECTOR, type Anchor, type Spot, type Picked } from './world'
import { explain, meaningfulTarget, withName } from './explain'
import { getMascotConfigForPath, type MascotConfig } from '../mascotPageConfig'

export interface Bubble { text: string; below: boolean; shift: number; id: number }

export interface ControllerDeps {
  avatar: () => OtbeeHandle | null
  container: HTMLElement
  tilt: HTMLElement
  pop: HTMLElement
  size: () => number
  name: () => string | null
  setBubble: (b: Bubble | null) => void
  pathname: () => string
}

const SETTLE_MS = 600
const PTN_TIPS = [
  'Rasionalisasi nilai rapor semester 1-5 mempertimbangkan tren konsistensi lho! 📈',
  'Di jalur prestasi & mandiri, susun sertifikat dari tingkat tertinggi ke bawah! 🏅',
  'Esai motivasi jangan klise! Pakai metode STAR (Situation, Task, Action, Result) ya! ✍️',
  'Kekuatan akreditasi sekolah & kuota alumni PTN sangat berpengaruh di SNBP! 🏫',
  'Pastikan mata pelajaran pendukung pilihan prodimu nilainya unggul! 🎯',
  'Punya sertifikat OSN/O2SN/FLS2N? Peluang lolos jalur prestasi meningkat drastis! 🌟',
  'Selalu siapkan plan cadangan di pilihan ke-2 dengan passing grade rasional! 💡',
  'Konsultasikan draft esaimu ke Mentor Alumni sebelum submit final ya! 🎓',
]
const CLICK_LINES = ['Mantap! 🔥', 'Sip! Gaspol! 🚀', 'Keren! ⭐', 'Aksi tercatat! ✅', 'Lanjut terus! 💪']
const DANGER = /hapus|delete|batal|keluar|logout|tolak|nonaktif|reset/i

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
const pickOne = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

export function createController(d: ControllerDeps) {
  type Phase = 'hidden' | 'resting' | 'traveling'
  let phase: Phase = 'hidden'
  let token = 0
  let spawnTok = 0
  let disposed = false
  let anchor: Anchor | null = null
  let pos: Spot = { x: -999, y: -999 }
  let flip = 1
  let raf = 0
  let invalid = 0
  let busyUntil = 0
  let lastDir: 1 | -1 = 1
  let lastScrollY = window.scrollY
  let settleTimer: ReturnType<typeof setTimeout> | null = null
  let retryTimer: ReturnType<typeof setTimeout> | null = null
  let readTimer: ReturnType<typeof setTimeout> | null = null
  let speechTimer: ReturnType<typeof setTimeout> | null = null
  let navStartedAt = 0
  let typing = false
  let bubbleId = 0
  let lastSpeakAt = 0
  let idleStage = 0
  let lastPlan: unknown = null
  let pointerX = 0, pointerY = 0, pointerMoved = false
  let isDragging = false
  const idleTimers: ReturnType<typeof setTimeout>[] = []
  const seen = new WeakMap<Element, number>()
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const scale = () => d.size() / 118
  const topSafe = () => 120 * scale() + 30

  // ============================================================ low level
  const place = (p: Spot) => {
    pos = p
    d.container.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) translate(-50%, calc(-100% + 3px))`
  }
  const setPose = (f: number, tilt: number) => {
    if (f !== flip) d.avatar()?.setFacing(f as 1 | -1)
    flip = f
    d.tilt.style.transform = `rotate(${tilt.toFixed(1)}deg) scaleX(${f})`
  }
  const play = (clip: ClipName, o?: PlayOpts) => d.avatar()?.play(clip, o)
  const fx = (t: FxType) => d.avatar()?.fx(t)

  const say = (text: string, ms?: number) => {
    const vy = pos.y - window.scrollY, vx = pos.x - window.scrollX
    const w = Math.min(d.size() < 100 ? 230 : 280, 44 + text.length * 6.4)
    const left = vx - w / 2
    let shift = 0
    if (left < 8) shift = 8 - left
    else if (left + w > window.innerWidth - 8) shift = window.innerWidth - 8 - (left + w)
    d.setBubble({ text, below: vy < d.size() + 70, shift, id: ++bubbleId })
    if (speechTimer) clearTimeout(speechTimer)
    speechTimer = setTimeout(() => d.setBubble(null), ms ?? clamp(2800 + text.length * 48, 3400, 9000))
  }

  const act = (clip: ClipName, o: { text?: string; force?: boolean; ms?: number } = {}) => {
    const now = performance.now()
    if (phase === 'traveling') { if (o.text) say(o.text, o.ms); return }
    if (!o.force && now < busyUntil) return
    const c = CLIPS[clip] as { dur: number; loop?: boolean }
    busyUntil = now + (c.loop ? 400 : c.dur * 850)
    play(clip)
    if (o.text) say(o.text, o.ms)
  }

  const personal = (t?: string) => t?.replace('{name}', d.name() || 'Pejuang PTN')

  /** resolves true when finished, false if cancelled by a newer token */
  const tween = (ms: number, tok: number, fn: (p: number) => void) =>
    new Promise<boolean>(res => {
      const t0 = performance.now()
      const f = (now: number) => {
        if (tok !== token || disposed) { res(false); return }
        const p = Math.min(1, (now - t0) / ms)
        fn(p)
        if (p < 1) requestAnimationFrame(f)
        else res(true)
      }
      requestAnimationFrame(f)
    })

  const overlayVisible = () => {
    const o = document.querySelector('[data-honey-overlay]')
    return !!o && getComputedStyle(o).visibility === 'visible'
  }

  // ============================================================ resting: ride the anchor
  let lastHoverCheck = 0
  const tick = () => {
    raf = requestAnimationFrame(tick)
    if (phase !== 'resting' || !anchor) return
    const p = anchor.resolve()
    if (!p) { if (++invalid > 14) { invalid = 0; decide(true) } return }
    invalid = 0
    if (Math.abs(p.x - pos.x) > 0.35 || Math.abs(p.y - pos.y) > 0.35) place(p)
    // face whichever side the cursor is on (deadzone so he doesn't flicker near centre)
    if (pointerMoved && !isTouch) {
      const dxFace = pointerX + window.scrollX - pos.x
      const dead = 34 * scale()
      if (Math.abs(dxFace) > dead) {
        const want = dxFace < 0 ? -1 : 1
        if (want !== flip) setPose(want, 0)
      }
    }
    // hover explanations are throttled to ~90ms (not every raw pointermove) to keep scrolling smooth
    if (pointerMoved && !isTouch) {
      const now = performance.now()
      if (now - lastHoverCheck > 90) { lastHoverCheck = now; considerPoint(pointerX, pointerY, 650) }
    }
  }

  // ============================================================ spawn / despawn
  const spawn = (pk: Picked, cfg: MascotConfig | null) => {
    const p = pk.anchor.resolve()
    if (!p) return
    const tok = ++token
    anchor = pk.anchor
    place(p)
    setPose(1, 0)
    d.container.style.pointerEvents = 'auto'
    d.container.style.opacity = '1'
    phase = 'traveling'
    d.pop.animate([
      { transform: 'scale(.12)', opacity: 0 },
      { transform: 'scale(1.2)', opacity: 1, offset: 0.62 },
      { transform: 'scale(1)', opacity: 1 },
    ], { duration: 560, easing: 'cubic-bezier(.3,1.6,.4,1)', fill: 'both' })
    requestAnimationFrame(() => { fx('smoke'); setTimeout(() => fx('smoke'), 90) })
    setTimeout(() => {
      if (tok !== token || disposed) return
      phase = 'resting'
      act(cfg?.clip ?? 'idle', { force: true, text: personal(cfg?.greet), ms: 4200 })
      resetIdle()
    }, 560)
  }

  const despawn = () => {
    token++
    phase = 'hidden'
    anchor = null
    d.setBubble(null)
    d.container.style.pointerEvents = 'none'
    fx('smoke')
    d.pop.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.15)', opacity: 0 }], { duration: 260, easing: 'ease-in', fill: 'forwards' })
  }

  // scanning the whole new page (every element's rect + every text glyph) is the heaviest thing this
  // module does; running it synchronously right after a navigation - exactly when the new page is still
  // settling - was the main cause of the visible freeze/jank on every route change. requestIdleCallback
  // pushes that work to a moment the browser isn't busy painting/compositing (falls back to a timeout on
  // Safari, which has no requestIdleCallback).
  const idle: (fn: () => void) => void = typeof window.requestIdleCallback === 'function'
    ? fn => window.requestIdleCallback(fn, { timeout: 220 })
    : fn => setTimeout(fn, 1)

  const spawnWhenReady = (cfg: MascotConfig | null) => {
    const my = ++spawnTok
    let tries = 0
    let busy = false
    const iv = setInterval(() => {
      if (disposed || my !== spawnTok) { clearInterval(iv); return }
      if (busy || overlayVisible() || document.readyState !== 'complete') return
      if (++tries > 50) { clearInterval(iv); return }
      busy = true
      idle(() => {
        busy = false
        if (disposed || my !== spawnTok) return
        const pk = pickSpot(scanSurfaces({ scale: scale() }), { band: [0.5, 0.8], scale: scale() })
        if (pk) { clearInterval(iv); spawn(pk, cfg) }
      })
    }, 260)
  }

  // ============================================================ moving
  const jumpTo = async (tok: number, from: Spot, to: Spot, drop = false): Promise<boolean> => {
    const sc = scale()
    const dx = to.x - from.x
    if (Math.abs(dx) > 14) setPose(dx < 0 ? -1 : 1, 0)
    if (!drop) {
      play('crouch', { fade: 0.05 })
      await wait(110)
      if (tok !== token) return false
    }
    play('jumpAir', { fade: 0.06 })
    const dist = Math.hypot(dx, to.y - from.y)
    const h = drop ? 0 : clamp(46 * sc + dist * 0.22, 60 * sc, 190 * sc)
    const dur = drop ? clamp(360 + dist * 0.35, 420, 800) : clamp(380 + Math.sqrt(dist) * 12, 460, 800)
    const ok = await tween(dur, tok, p => {
      const yLin = drop ? from.y + (to.y - from.y) * (p * p) : from.y + (to.y - from.y) * p
      place({ x: from.x + dx * p, y: yLin - 4 * h * p * (1 - p) })
      setPose(flip, Math.sign(dx) * Math.min(14, Math.abs(dx) * 0.04) * Math.sin(Math.PI * p))
    })
    if (!ok) return false
    place(to)
    setPose(flip, 0)
    play('land', { fade: 0.03 })
    await wait(170)
    return tok === token
  }

  const relocate = async (dir: 'down' | 'up') => {
    if (phase !== 'resting') return
    const sc = scale(), vh = window.innerHeight, vw = window.innerWidth
    const cur = anchor?.resolve() ?? pos
    const vy = cur.y - window.scrollY, vx = cur.x - window.scrollX
    const cands = scanSurfaces({ scale: sc })
    const nearX = clamp(vx, 70, vw - 70)
    const offscreen = vy < -20 || vy > vh + 20
    const target = pickSpot(cands, { band: dir === 'down' ? [0.48, 0.8] : [0.32, 0.72], nearX, excludeEl: anchor?.el, scale: sc })
    if (!target) {
      if (retryTimer) clearTimeout(retryTimer)
      retryTimer = setTimeout(() => decide(false), 1200)
      return
    }
    const tok = ++token
    phase = 'traveling'
    d.setBubble(null)
    const to = target.anchor.resolve()
    if (!to) { phase = 'resting'; return }
    let start: Spot = cur
    if (offscreen) {
      const sx = clamp(cur.x, window.scrollX + 60, window.scrollX + vw - 60)
      start = dir === 'down'
        ? { x: sx, y: window.scrollY - 70 * sc }
        : { x: sx, y: Math.min(window.scrollY + vh + 70 * sc, document.documentElement.scrollHeight - 6) }
      place(start)
    }
    // he always travels the same way, up or down: hop stone-to-stone (crouch / jumpAir / land), never
    // one big leap - stepsBetween fills in every nearby surface along the way so each hop lands on the
    // next closest thing, not straight to the far target.
    const stops: Picked[] = []
    if (dir === 'down' && (offscreen || vy < topSafe())) {
      // above the screen: drop in from the top onto something in the upper part first
      const first = pickSpot(cands, { band: [0.24, 0.42], nearX, scale: sc })
      if (first && first.anchor.el !== target.anchor.el && first.y < target.y - 60 * sc) stops.push(first)
    } else if (dir === 'up' && offscreen) {
      // below the screen: hop onto something near the bottom edge first, then climb up stone by stone
      const first = pickSpot(cands, { band: [0.62, 0.82], nearX, scale: sc })
      if (first && first.anchor.el !== target.anchor.el && first.y > target.y + 60 * sc) stops.push(first)
    }
    const fromV = { x: start.x - window.scrollX, y: start.y - window.scrollY }
    const lastV = stops.length ? { x: stops[0].x, y: stops[0].y } : fromV
    stops.push(...stepsBetween(cands, lastV, { x: target.x, y: target.y }, sc, dir === 'down' ? 1 : 5).filter(s => !stops.includes(s)))
    stops.push(target)
    lastPlan = stops.map(x => ({ k: x.anchor.kind, tag: x.anchor.el.tagName, x: Math.round(x.x), y: Math.round(x.y) }))
    let ok = true
    let from = start
    for (let i = 0; i < stops.length && ok; i++) {
      const sp = stops[i].anchor.resolve()
      if (!sp) continue
      const dropIn = i === 0 && dir === 'down' && (offscreen || start.y < window.scrollY)
      ok = await jumpTo(tok, from, sp, dropIn)
      if (ok) { anchor = stops[i].anchor; from = sp }
    }
    if (!ok) return
    anchor = target.anchor
    phase = 'resting'
    setPose(1, 0)
    act('idle', { force: true })
    resetIdle()
  }

  /** decide whether he must move after the page came to rest */
  const decide = (forced: boolean) => {
    if (disposed || phase === 'hidden') return
    if (phase === 'traveling') { settleTimer = setTimeout(() => decide(forced), 350); return }
    const p = anchor?.resolve()
    if (!p) { relocate(lastDir > 0 ? 'down' : 'up'); return }
    const vy = p.y - window.scrollY, vx = p.x - window.scrollX
    const top = topSafe(), bottom = window.innerHeight - 24
    const ok = vy >= top && vy <= bottom && vx >= 24 && vx <= window.innerWidth - 24
    if (ok && !forced) return
    relocate(vy < top ? 'down' : vy > bottom ? 'up' : lastDir > 0 ? 'down' : 'up')
  }

  // ============================================================ talking about things
  const speakAbout = (target: Element, prefix = '') => {
    if (disposed || phase !== 'resting' || typing) return
    const now = performance.now()
    if (now - lastSpeakAt < 2200) return
    const last = seen.get(target)
    if (last && now - last < 60000) return
    const ex = explain(target)
    if (!ex) return
    seen.set(target, now)
    lastSpeakAt = now
    const r = target.getBoundingClientRect()
    setPose(r.left + r.width / 2 + window.scrollX < pos.x ? -1 : 1, 0)
    const text = prefix + withName(ex.text, d.name())
    act('talk', { force: true, text })
    setTimeout(() => { if (!disposed && phase === 'resting') play('idle') }, clamp(1800 + text.length * 25, 2400, 5200))
  }

  let hoverEl: Element | null = null
  let hoverTimer: ReturnType<typeof setTimeout> | null = null
  const considerPoint = (x: number, y: number, delay: number, prefix = '') => {
    const target = meaningfulTarget(document.elementFromPoint(x, y))
    if (target === hoverEl) return
    hoverEl = target
    if (hoverTimer) clearTimeout(hoverTimer)
    if (!target) return
    hoverTimer = setTimeout(() => speakAbout(target, prefix), delay)
  }

  const readAssist = () => {
    if (disposed || phase !== 'resting') return
    const vw = window.innerWidth, vh = window.innerHeight
    for (const f of [0.42, 0.55, 0.32, 0.65]) {
      const t = meaningfulTarget(document.elementFromPoint(vw / 2, vh * f))
      if (t && explain(t) && !(seen.get(t) && performance.now() - (seen.get(t) ?? 0) < 60000)) { speakAbout(t, 'Lagi baca ini ya? '); return }
    }
  }

  // ============================================================ idle ladder
  // not just one long stare: every few seconds he does a little flavor move (look around, wink,
  // nod, shake his head...), then eventually dozes off - and the cycle keeps going after that.
  const IDLE_FLAVORS: ClipName[] = ['lookAround', 'wink', 'nod', 'shake']
  const clearIdle = () => { idleTimers.forEach(clearTimeout); idleTimers.length = 0 }
  const resetIdle = () => {
    clearIdle()
    idleStage = 0
    const scheduleNext = (ms: number) => { idleTimers.push(setTimeout(tick_, ms)) }
    const tick_ = () => {
      if (typing || phase !== 'resting') { scheduleNext(4000); return }
      idleStage++
      if (idleStage % 7 === 0) {
        act('sleep', { force: true, text: 'Zzz... 💤', ms: 2600 })
        scheduleNext(10000 + Math.random() * 4000)
      } else if (idleStage % 3 === 0) {
        act('thinking', { force: true, text: 'Hmm, sambil nunggu aku mikir strategi PTN dulu ya... 🤔' })
        scheduleNext(9000 + Math.random() * 5000)
      } else {
        act(pickOne(IDLE_FLAVORS), { force: true })
        scheduleNext(6000 + Math.random() * 4000)
      }
    }
    scheduleNext(5000 + Math.random() * 2000)
  }
  let lastActivity = 0
  const activity = () => {
    const now = performance.now()
    if (now - lastActivity < 350) return
    lastActivity = now
    if (idleStage % 7 === 0 && idleStage > 0 && phase === 'resting') act('surprised', { force: true, text: personal('Eh, {name} balik! 👋') })
    resetIdle()
  }

  // ============================================================ events
  const onScroll = () => {
    const y = window.scrollY
    if (Math.abs(y - lastScrollY) > 0.5) lastDir = y > lastScrollY ? 1 : -1
    lastScrollY = y
    activity()
    if (settleTimer) clearTimeout(settleTimer)
    settleTimer = setTimeout(() => decide(false), SETTLE_MS)
    if (isTouch) { if (readTimer) clearTimeout(readTimer); readTimer = setTimeout(readAssist, 1500) }
  }

  const hopOnto = async (el: Element, clientX: number) => {
    if (phase !== 'resting') return
    const sc = scale()
    const am = anchorOnElement(el, clientX)
    if (!am || am.y < topSafe() || am.y > window.innerHeight - 20) return
    const from = anchor?.resolve() ?? pos
    const fvy = from.y - window.scrollY
    if (fvy < -10 || fvy > window.innerHeight + 10) return
    const to = am.anchor.resolve()
    if (!to) return
    const tok = ++token
    phase = 'traveling'
    d.setBubble(null)
    const ok = await jumpTo(tok, from, to)
    void sc
    if (!ok) return
    anchor = am.anchor
    phase = 'resting'
    setPose(1, 0)
    act('cheer', { force: true, text: pickOne(CLICK_LINES) })
  }

  const onClick = (e: MouseEvent) => {
    activity()
    const t = e.target as Element | null
    if (!t || t.closest(IGNORE_SELECTOR)) return
    const el = t.closest('button, a, [role="button"], input[type="submit"]')
    if (!el) return
    const label = (el.textContent ?? '') + ' ' + (el.getAttribute('aria-label') ?? '')
    if (DANGER.test(label)) { act('surprised', { force: true }); return }
    hopOnto(el, e.clientX)
  }
  const onFocus = (e: FocusEvent) => {
    activity()
    const t = e.target as HTMLElement | null
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) && !t.closest(IGNORE_SELECTOR)) {
      typing = true
      act('typing', { force: true })
    }
  }
  const onBlur = () => {
    if (!typing) return
    typing = false
    setTimeout(() => { if (!typing) act('nod', { force: true }) }, 250)
  }
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    // cheap: just remember where the cursor is. The actual hover-explain / facing-direction
    // work happens once per animation frame inside tick(), not on every raw pointermove event
    // (pointermove can fire far faster than rAF and was the main cause of scroll jank).
    pointerX = e.clientX; pointerY = e.clientY; pointerMoved = true
    activity()
  }
  let holdTimer: ReturnType<typeof setTimeout> | null = null
  let holdStart = { x: 0, y: 0 }
  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0]
    if (!t) return
    activity()
    holdStart = { x: t.clientX, y: t.clientY }
    if (holdTimer) clearTimeout(holdTimer)
    holdTimer = setTimeout(() => considerPoint(holdStart.x, holdStart.y, 0), 520)
    if (readTimer) clearTimeout(readTimer)
  }
  const onTouchMove = (e: TouchEvent) => {
    const t = e.touches[0]
    if (t && Math.hypot(t.clientX - holdStart.x, t.clientY - holdStart.y) > 10 && holdTimer) { clearTimeout(holdTimer); holdTimer = null }
  }
  const onTouchEnd = () => {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null }
    if (isTouch) { if (readTimer) clearTimeout(readTimer); readTimer = setTimeout(readAssist, 1800) }
  }
  const onResize = () => { if (settleTimer) clearTimeout(settleTimer); settleTimer = setTimeout(() => decide(false), SETTLE_MS) }

  const unsub = otbeeBrain.subscribe(e => {
    if (e.type === 'nav-start') { navStartedAt = performance.now(); despawn() }
    else if (e.type === 'nav-end') spawnWhenReady(getMascotConfigForPath(d.pathname()))
    else if (e.type === 'success') act('cheer', { text: e.text ?? 'Berhasil! 🎉', force: true })
    else if (e.type === 'error') act('sad', { text: e.text ?? 'Waduh, ada kendala 😢', force: true, ms: 4200 })
    else if (e.type === 'info') act('nod', { text: e.text, force: true })
    else if (e.type === 'say') say(e.text, e.ms)
    else if (e.type === 'act') act(e.clip, { text: e.text, force: true })
  })

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('click', onClick, true)
  window.addEventListener('focusin', onFocus, true)
  window.addEventListener('focusout', onBlur, true)
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchmove', onTouchMove, { passive: true })
  window.addEventListener('touchend', onTouchEnd, { passive: true })
  window.addEventListener('keydown', activity, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  raf = requestAnimationFrame(tick)

  return {
    start() { setTimeout(() => { if (!disposed) spawnWhenReady(getMascotConfigForPath(d.pathname())) }, 450) },
    onPathChange() {
      // programmatic / back-forward navigation that never went through the honey loader
      if (performance.now() - navStartedAt > 7000) { despawn(); spawnWhenReady(getMascotConfigForPath(d.pathname())) }
      else setTimeout(() => { if (!disposed && phase === 'hidden') spawnWhenReady(getMascotConfigForPath(d.pathname())) }, 5000)
    },
    startDrag(clientX: number, clientY: number) {
      if (disposed) return
      isDragging = true
      phase = 'traveling'
      token++
      anchor = null
      clearIdle()
      if (settleTimer) clearTimeout(settleTimer)
      if (readTimer) clearTimeout(readTimer)
      if (retryTimer) clearTimeout(retryTimer)

      const docX = clientX + window.scrollX
      const docY = clientY + window.scrollY
      place({ x: docX, y: docY })

      play('struggle')
      say('Ih aku mau dibawa kemanaaa!!! 😾', 15000)
      fx('sweat')
    },
    onDragMove(clientX: number, clientY: number) {
      if (!isDragging || disposed) return
      const docX = clientX + window.scrollX
      const docY = clientY + window.scrollY
      place({ x: docX, y: docY })
    },
    async endDrag() {
      if (!isDragging || disposed) return
      isDragging = false
      const curX = pos.x
      const curY = pos.y
      const curY_v = curY - window.scrollY
      const curX_v = curX - window.scrollX

      // Fisika Gravitasi Murni:
      // Garis jatuh adalah vertikal ke bawah pada koordinat curX_v saat dilepas.
      // Hanya permukaan yang horizontal range-nya [xa, xb] MENGECEGAT koordinat curX_v
      // dan berada di bawah (y > curY_v) yang dapat menjadi tatakan pendaratan.
      const cands = scanSurfaces({ scale: scale() })
      const footMargin = 12 * scale()

      // Cari permukaan yang berada persis di jalur vertikal jatuh ke bawah
      const verticalHits = cands
        .filter(c => {
          if (c.y <= curY_v + 12) return false
          // Harus berpotongan dengan posisi horizontal X maskot (tidak boleh melompat ke objek di samping)
          return curX_v >= (c.xa - footMargin) && curX_v <= (c.xb + footMargin)
        })
        .sort((a, b) => a.y - b.y) // Urutkan dari yang paling atas (pertama kali ditabrak benda yang jatuh)

      let targetX = curX
      let targetY = window.scrollY + window.innerHeight - 36 * scale()
      let foundAnchor: Anchor | null = null

      for (const cand of verticalHits) {
        // Clamp sedikit hanya agar posisi kaki tidak offset keluar batas fisik elemen yang ditabrak
        const clampedX_v = clamp(curX_v, cand.xa + 6, cand.xb - 6)
        const validated = cand.make(clampedX_v)
        if (validated) {
          foundAnchor = validated.anchor
          targetX = validated.x + window.scrollX
          targetY = validated.y + window.scrollY
          break
        }
      }

      // Jika tidak ada elemen yang mencegat di jalur vertikal ke bawah,
      // gravitasi menjatuhkan maskot lurus ke bawah di koordinat X yang SAMA PERSIS (tanpa geser ke kiri/kanan!)
      if (!foundAnchor) {
        targetX = curX
        targetY = Math.max(curY + 20, window.scrollY + window.innerHeight - 36 * scale())
        const fixedX = targetX
        const fixedY = targetY
        foundAnchor = {
          kind: 'edge',
          el: document.body,
          resolve: () => ({ x: fixedX, y: fixedY }),
        }
      }

      const fallDist = targetY - curY
      if (fallDist > 12) {
        play('jumpAir')
        const dur = Math.max(240, Math.min(800, Math.sqrt(fallDist / 450) * 480))
        const startX = curX
        const startY = curY
        const currentTok = ++token

        await tween(dur, currentTok, p => {
          // Percepatan gravitasi (kuadratik p*p)
          const y = startY + fallDist * (p * p)
          // X lurus kebawah
          const x = startX + (targetX - startX) * p
          place({ x, y })
        })

        if (disposed || currentTok !== token) return
      } else {
        place({ x: targetX, y: targetY })
      }

      play('land')
      fx('dust')
      if (foundAnchor) {
        anchor = foundAnchor
      }

      const funnyLandQuotes = [
        'Aduhh pusinggg! Tapi selamat mendarat! 😵‍💫',
        'Hufttt, jangan digeser-geser lagi yaaa! 😤',
        'Fiuhhh... Kirain mau dibuang kemana! 😮‍💨',
        'Aduh pantatku sakit! Untung mendarat mulus! 🐝',
      ]
      say(pickOne(funnyLandQuotes), 4500)

      phase = 'resting'
      busyUntil = performance.now() + 600
      resetIdle()
    },
    clickMascot() {
      if (phase !== 'resting') return
      fx('stars')
      act('salto', { text: pickOne(PTN_TIPS), force: true, ms: 5000 })
    },
    debug() { return { phase, pos, anchorKind: anchor?.kind, anchorTag: anchor?.el.tagName, plan: lastPlan } },
    relocateNow(dir: 'down' | 'up') { return relocate(dir) },
    dispose() {
      disposed = true
      token++; spawnTok++
      cancelAnimationFrame(raf)
      unsub()
      clearIdle()
      ;[settleTimer, retryTimer, readTimer, speechTimer, hoverTimer, holdTimer].forEach(t => t && clearTimeout(t))
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('click', onClick, true)
      window.removeEventListener('focusin', onFocus, true)
      window.removeEventListener('focusout', onBlur, true)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', activity)
      window.removeEventListener('resize', onResize)
    },
  }
}

export type Controller = ReturnType<typeof createController>
