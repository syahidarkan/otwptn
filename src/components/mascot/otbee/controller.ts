/**
 * The brain that makes Otbee live in the page (pure TS, no React).
 *
 * - He is positioned in DOCUMENT coordinates (position:absolute), so while he rests he scrolls with the page
 * natively - perfectly in sync, no chasing.
 * - While the user is scrolling he does nothing. When scrolling has been quiet for SETTLE_MS he decides:
 * still comfortably on screen -> stay; scrolled away -> hop down (stepping across surfaces) or fly up.
 * - Every landing spot is something visible under his feet (see world.ts).
 * - He spawns in a puff of smoke on first load and after every page change.
 * - He reacts to what the user points at / holds a finger on, explaining it (see explain.ts).
 */
import type { OtbeeHandle } from'./OtbeeAvatar'
import { CLIPS, type ClipName, type FxType, type PlayOpts } from'./engine'
import { otbeeBrain } from'./brain'
import { scanSurfaces, pickSpot, stepsBetween, anchorOnElement, IGNORE_SELECTOR, isObstructingContent, type Anchor, type Spot, type Picked } from'./world'
import { explain, meaningfulTarget, withName } from'./explain'
import { getMascotConfigForPath, type MascotConfig } from'../mascotPageConfig'
import { ContextAwareness, getTimeContext } from'./contextAwareness'

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
 onDockChange?: (docked: boolean) => void
}

const SETTLE_MS = 600
const PTN_TIPS = [
'Rasionalisasi nilai rapor semester 1-5 mempertimbangkan tren konsistensi lho!',
'Di jalur prestasi & mandiri, susun sertifikat dari tingkat tertinggi ke bawah!',
'Esai motivasi jangan klise! Pakai metode STAR (Situation, Task, Action, Result) ya! ️',
'Kekuatan akreditasi sekolah & kuota alumni PTN sangat berpengaruh di SNBP!',
'Pastikan mata pelajaran pendukung pilihan prodimu nilainya unggul!',
'Punya sertifikat OSN/O2SN/FLS2N? Peluang lolos jalur prestasi meningkat drastis!',
'Selalu siapkan plan cadangan di pilihan ke-2 dengan passing grade rasional!',
'Konsultasikan draft esaimu ke Mentor Alumni sebelum submit final ya!',
]
const CLICK_LINES = ['Mantap!','Sip! Gaspol!','Keren! ⭐','Aksi tercatat!','Lanjut terus!']
const DIZZY_LINES = [
'Aduhh pusinggg!',
'Waduh, kepalaku muter-muter!',
'Pelan-pelan dong gerakinnya, pusing tau!',
'Waa pusinggg, jangan diacak-acak kursornya!',
]
const PRIVACY_LINES = [
'Aku tutup mata dulu yaaa!',
'Tenang, aku gak ngintip kok!',
'Sssttt rahasia! Aku tutup mata dulu ya',
'Privasi kamu aman! Aku tutup mata kok',
]
const PRIVACY_BLUR_LINES = [
'Udah selesai ya? Aman, gak ngintip kok!',
'Sip, lanjuttt!',
]
const DANGER = /hapus|delete|batal|keluar|logout|tolak|nonaktif|reset/i

function isPrivacyField(el: Element | null): boolean {
 if (!el || !(el instanceof HTMLElement)) return false
 const isInput = el instanceof HTMLInputElement
 const isText = el instanceof HTMLTextAreaElement || el.isContentEditable
 if (!isInput && !isText) return false

 // 1. Password input type
 if (isInput && el.type ==='password') return true

 // 2. Scan attributes (type, name, id, autocomplete, placeholder, aria-label, class)
 const combined = [
 el.getAttribute('type') ||'',
 el.getAttribute('name') ||'',
 el.getAttribute('id') ||'',
 el.getAttribute('autocomplete') ||'',
 el.getAttribute('placeholder') ||'',
 el.getAttribute('aria-label') ||'',
 el.getAttribute('data-field') ||'',
 el.className ||'',
 ].join('').toLowerCase()

 if (/current-password|new-password|one-time-code|cc-number|cc-csc|cc-cvv|cc-exp/.test(combined)) {
 return true
 }

 const SENSITIVE_REGEX = /(password|kata[\s-_]?sandi|sandi|pin|otp|kode[\s-_]?(verifikasi|otp|keamanan|akses)|security[\s-_]?code|cvv|cvc|secret|token)/i
 if (SENSITIVE_REGEX.test(combined)) {
 return true
 }

 // 3. Label text if any
 try {
 const labelEl = el.closest('label') || (el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null)
 if (labelEl && SENSITIVE_REGEX.test(labelEl.textContent ||'')) {
 return true
 }
 } catch {}

 // 4. Data attributes
 if (el.dataset.sensitive ==='true' || el.dataset.privacy ==='true' || el.dataset.private ==='true') {
 return true
 }

 return false
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
const pickOne = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

export function createController(d: ControllerDeps) {
 type Phase ='hidden' |'resting' |'traveling' |'hero-docked' |'returning-to-hero'
 let phase: Phase ='hidden'
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
 let isPrivacy = false
 let currentName: string | null = null
 let bubbleId = 0
 let lastSpeakAt = 0
 let idleStage = 0
 let lastPlan: unknown = null
 let pointerX = 0, pointerY = 0, pointerMoved = false
 let isDragging = false
 let dizzyUntil = 0
 const moveSamples: { x: number; y: number; t: number }[] = []
 const idleTimers: ReturnType<typeof setTimeout>[] = []
 const seen = new WeakMap<Element, number>()
 const isTouch ='ontouchstart' in window || navigator.maxTouchPoints > 0
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
 if (phase ==='traveling') { if (o.text) say(o.text, o.ms); return }
 if (!o.force && now < busyUntil) return
 const c = CLIPS[clip] as { dur: number; loop?: boolean }
 busyUntil = now + (c.loop ? 400 : c.dur * 850)
 play(clip)
 if (o.text) say(o.text, o.ms)
 }

 const personal = (t?: string) => t?.replace('{name}', currentName || d.name() ||'Pejuang PTN')

 const awareness = new ContextAwareness({
 say: (text, ms) => say(text, ms),
 act: (clip, opts) => act(clip, opts),
 setName: (n) => { currentName = n },
 getName: () => currentName || d.name(),
 })

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
 return !!o && getComputedStyle(o).visibility ==='visible'
 }

 // ============================================================ resting: ride the anchor
 let lastHoverCheck = 0
 let lastAnchorCheck = 0
 let cachedAnchorSpot: Spot | null = null

 const tick = () => {
 raf = requestAnimationFrame(tick)
 if ((phase !=='resting' && phase !=='hero-docked') || !anchor) return

 // When docked at hero, position is static in document coordinates; avoid calling getBoundingClientRect 60fps!
 if (phase ==='hero-docked') {
 if (pointerMoved && !isTouch && !isPrivacy) {
 const dxFace = pointerX + window.scrollX - pos.x
 const dead = 34 * scale()
 if (Math.abs(dxFace) > dead) {
 const want = dxFace < 0 ? -1 : 1
 if (want !== flip) setPose(want, 0)
 }
 pointerMoved = false
 }
 return
 }

 const now = performance.now()
 // Resolve anchor position at 60fps every rAF frame so when standing on moving/marquee elements, Otbee tracks buttery smooth
 const p = anchor.resolve()
 if (!p) {
 if (++invalid > 14) { invalid = 0; decide(true) }
 return
 }
 invalid = 0
 if (Math.abs(p.x - pos.x) > 0.05 || Math.abs(p.y - pos.y) > 0.05) place(p)
 // face whichever side the cursor is on (deadzone so he doesn't flicker near centre)
 if (pointerMoved && !isTouch && !isPrivacy) {
 const dxFace = pointerX + window.scrollX - pos.x
 const dead = 34 * scale()
 if (Math.abs(dxFace) > dead) {
 const want = dxFace < 0 ? -1 : 1
 if (want !== flip) setPose(want, 0)
 }
 }
 // hover explanations are throttled to ~100ms (not every raw pointermove) to keep scrolling smooth
 if (pointerMoved && !isTouch && !isPrivacy && phase ==='resting') {
 if (now - lastHoverCheck > 100) { lastHoverCheck = now; considerPoint(pointerX, pointerY, 650) }
 }
 pointerMoved = false
 }

 // ============================================================ hero dock management
 let heroGreetingTimer1: NodeJS.Timeout | null = null
 let heroGreetingTimer2: NodeJS.Timeout | null = null
 let hasGreetedInHero = false

 const triggerHeroGreeting = () => {
 if (hasGreetedInHero) return
 hasGreetedInHero = true
 if (heroGreetingTimer1) clearTimeout(heroGreetingTimer1)
 if (heroGreetingTimer2) clearTimeout(heroGreetingTimer2)

 // Step 1: Salam pembuka saat pertama buka web
 heroGreetingTimer1 = setTimeout(() => {
 if (disposed || phase !=='hero-docked') return
 say('Haloo Pejuang PTN! Kenalin aku otbee', 3500)

 // Step 2: Jeda beberapa ms, lalu sapaan kedua ajakan tonton video
 heroGreetingTimer2 = setTimeout(() => {
 if (disposed || phase !=='hero-docked') return
 say('Klik aku untuk tonton video otwptn!', 8000)
 }, 4000)
 }, 500)
 }

 const dockAtHero = () => {
 token++
 const heroSpot = document.getElementById('hero-mascot-spot')
 if (!heroSpot) return
 const hr = heroSpot.getBoundingClientRect()
 const target: Spot = {
 x: hr.left + hr.width / 2 + window.scrollX,
 y: hr.top + 140 + window.scrollY,
 }
 anchor = {
 resolve: () => {
 const spot = document.getElementById('hero-mascot-spot')
 if (!spot) return null
 const r = spot.getBoundingClientRect()
 return {
 x: r.left + r.width / 2 + window.scrollX,
 y: r.top + 140 + window.scrollY,
 }
 },
 el: heroSpot,
 kind:'control',
 }
 place(target)
 setPose(1, 0)
 d.container.style.pointerEvents ='auto'
 d.container.style.opacity ='1'
 phase ='hero-docked'
 d.onDockChange?.(true)
 triggerHeroGreeting()
 }

 const returnToHero = async () => {
 if (phase ==='hero-docked' || phase ==='returning-to-hero') return
 const heroSpot = document.getElementById('hero-mascot-spot')
 if (!heroSpot) { dockAtHero(); return }

 const hr = heroSpot.getBoundingClientRect()
 const target: Spot = {
 x: hr.left + hr.width / 2 + window.scrollX,
 y: hr.top + 140 + window.scrollY,
 }

 const cur = anchor?.resolve() ?? pos
 const from: Spot = { ...cur }
 const dist = Math.hypot(target.x - from.x, target.y - from.y)

 // If already right at the hero spot
 if (dist < 35) {
 dockAtHero()
 return
 }

 const tok = ++token
 phase ='returning-to-hero'
 d.onDockChange?.(false)
 anchor = null

 // Point on the floor directly underneath the hero head spot:
 const underHero: Spot = {
 x: target.x,
 y: target.y + 120,
 }

 let ok = true
 let pCur: Spot = { ...from }

 // Step A: If mascot is far below the hero section, hop upwards towards hero section first
 if (pCur.y > underHero.y + 240) {
 const midHop: Spot = {
 x: (pCur.x + underHero.x) / 2,
 y: pCur.y - Math.min(320, (pCur.y - underHero.y) * 0.55),
 }
 ok = await jumpTo(tok, pCur, midHop)
 if (!ok || tok !== token) return
 pCur = midHop
 }

 // Step B: Hop onto the floor directly underneath the hero head
 const distToUnder = Math.hypot(underHero.x - pCur.x, underHero.y - pCur.y)
 if (distToUnder > 25) {
 ok = await jumpTo(tok, pCur, underHero)
 if (!ok || tok !== token) return
 }

 // Step C: Stand momentarily on the floor below the hero head position
 setPose(1, 0)
 play('land', { fade: 0.03 })
 await wait(220)
 if (tok !== token) return

 // Step D: Crouch and leap/fly upwards directly into the hero head spot!
 ok = await jumpTo(tok, underHero, target)
 if (!ok || tok !== token) return

 // Step E: Arrive at hero spot and dock!
 dockAtHero()
 }

 const undockFromHero = async () => {
 if (phase !=='hero-docked') return
 const cur = anchor?.resolve() ?? pos
 const from: Spot = { ...cur }
 const tok = ++token
 phase ='traveling'
 d.onDockChange?.(false)
 anchor = null

 // 1. Scan available surfaces in the viewport, ensuring we only land BELOW the video player
 const sc = scale()
 const cands = scanSurfaces({ scale: sc })
 const videoEl = document.getElementById('otwptn-launch-video')
 const heroEl = document.getElementById('hero-section')
 const minDropY = videoEl
 ? (videoEl.getBoundingClientRect().bottom + window.scrollY + 25)
 : (heroEl ? (heroEl.getBoundingClientRect().bottom + window.scrollY - 30) : (from.y + 420))

 const belowVideoCands = cands.filter(c => {
 if (videoEl && videoEl.contains(c.el)) return false
 const docY = c.y + window.scrollY
 return docY >= minDropY
 })

 const target = pickSpot(belowVideoCands, {
 band: [0.55, 0.95],
 nearX: from.x,
 scale: sc,
 })

 const to = target?.anchor.resolve()
 // 2. Obey law of gravity: fall straight down below the video!
 if (target && to && to.y >= minDropY) {
 const ok = await jumpTo(tok, from, to, true) // drop = true: quadratic gravity fall!
 if (ok && tok === token) {
 anchor = target.anchor
 phase ='resting'
 setPose(1, 0)
 say('Nonton dulu yaa! Aku jalan-jalan di bawah!', 4000)
 resetIdle()
 return
 }
 }

 // 3. Fallback: fall naturally towards the visible area below the video
 const fallbackTo: Spot = {
 x: from.x,
 y: Math.max(minDropY + 40, window.scrollY + window.innerHeight * 0.88),
 }
 const ok = await jumpTo(tok, from, fallbackTo, true)
 if (ok && tok === token) {
 phase ='resting'
 setPose(1, 0)
 say('Nonton dulu yaa! Aku jalan-jalan di bawah!', 4000)
 resetIdle()
 }
 }

 // ============================================================ spawn / despawn
 const spawn = async (pk: Picked, cfg: MascotConfig | null) => {
 const p = pk.anchor.resolve()
 if (!p) return
 token++
 anchor = pk.anchor

 place(p)
 setPose(1, 0)
 d.container.style.pointerEvents ='auto'
 d.container.style.opacity ='1'
 phase ='traveling'
 d.pop.animate([
 { transform:'scale(.12)', opacity: 0 },
 { transform:'scale(1.2)', opacity: 1, offset: 0.62 },
 { transform:'scale(1)', opacity: 1 },
 ], { duration: 560, easing:'cubic-bezier(.3,1.6,.4,1)', fill:'both' })
 requestAnimationFrame(() => { fx('smoke'); setTimeout(() => fx('smoke'), 90) })

 phase ='resting'
 if (typeof document !=='undefined' && document.activeElement && isPrivacyField(document.activeElement)) {
 isPrivacy = true
 typing = true
 act('coverEyes', { text: pickOne(PRIVACY_LINES), force: true, ms: 8000 })
 } else {
 const timeCtx = getTimeContext()
 const defaultGreet = (timeCtx.hour >= 23 || timeCtx.hour < 5) ? timeCtx.quote : null
 act(cfg?.clip ??'idle', { force: true, text: personal(cfg?.greet ?? defaultGreet ?? undefined), ms: 4200 })
 }
 resetIdle()
 }

 const despawn = () => {
 token++
 phase ='hidden'
 anchor = null
 d.setBubble(null)
 d.container.style.pointerEvents ='none'
 fx('smoke')
 d.pop.animate([{ transform:'scale(1)', opacity: 1 }, { transform:'scale(.15)', opacity: 0 }], { duration: 260, easing:'ease-in', fill:'forwards' })
 }

 // scanning the whole new page (every element's rect + every text glyph) is the heaviest thing this
 // module does; running it synchronously right after a navigation - exactly when the new page is still
 // settling - was the main cause of the visible freeze/jank on every route change. requestIdleCallback
 // pushes that work to a moment the browser isn't busy painting/compositing (falls back to a timeout on
 // Safari, which has no requestIdleCallback).
 const idle: (fn: () => void) => void = typeof window.requestIdleCallback ==='function'
 ? fn => window.requestIdleCallback(fn, { timeout: 220 })
 : fn => setTimeout(fn, 1)

 const inHeroSection = (path: string): boolean => {
 if (path !=='/') return false
 if (typeof window ==='undefined') return false
 if (typeof document !=='undefined' && document.body.classList.contains('otwptn-hero-video-active')) return false
 return window.scrollY < 260
 }

 const spawnWhenReady = (cfg: MascotConfig | null) => {
 const my = ++spawnTok
 let tries = 0
 let busy = false
 const iv = setInterval(() => {
 if (disposed || my !== spawnTok) { clearInterval(iv); return }
 if (busy || overlayVisible() || document.readyState !=='complete') return
 // User is currently viewing the Hero section on homepage: do not spawn floating mascot!
 if (inHeroSection(d.pathname())) return
 if (++tries > 50) { clearInterval(iv); return }
 busy = true
 idle(() => {
 busy = false
 if (disposed || my !== spawnTok) return
 if (inHeroSection(d.pathname())) return
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

 const relocate = async (dir:'down' |'up') => {
 if (phase !=='resting') return
 if (inHeroSection(d.pathname())) {
 returnToHero()
 return
 }
 const sc = scale(), vh = window.innerHeight, vw = window.innerWidth
 const cur = anchor?.resolve() ?? pos
 const vy = cur.y - window.scrollY, vx = cur.x - window.scrollX
 const cands = scanSurfaces({ scale: sc })
 const nearX = clamp(vx, 70, vw - 70)
 const offscreen = vy < -20 || vy > vh + 20
 const target = pickSpot(cands, { band: dir ==='down' ? [0.48, 0.8] : [0.32, 0.72], nearX, excludeEl: anchor?.el, scale: sc })
 if (!target) {
 if (retryTimer) clearTimeout(retryTimer)
 retryTimer = setTimeout(() => decide(false), 1200)
 return
 }
 const tok = ++token
 phase ='traveling'
 d.setBubble(null)
 const to = target.anchor.resolve()
 if (!to) { phase ='resting'; return }
 let start: Spot = cur
 if (offscreen) {
 const sx = clamp(cur.x, window.scrollX + 60, window.scrollX + vw - 60)
 start = dir ==='down'
 ? { x: sx, y: window.scrollY - 70 * sc }
 : { x: sx, y: Math.min(window.scrollY + vh + 70 * sc, document.documentElement.scrollHeight - 6) }
 place(start)
 }
 // he always travels the same way, up or down: hop stone-to-stone (crouch / jumpAir / land), never
 // one big leap - stepsBetween fills in every nearby surface along the way so each hop lands on the
 // next closest thing, not straight to the far target.
 const stops: Picked[] = []
 if (dir ==='down' && (offscreen || vy < topSafe())) {
 // above the screen: drop in from the top onto something in the upper part first
 const first = pickSpot(cands, { band: [0.24, 0.42], nearX, scale: sc })
 if (first && first.anchor.el !== target.anchor.el && first.y < target.y - 60 * sc) stops.push(first)
 } else if (dir ==='up' && offscreen) {
 // below the screen: hop onto something near the bottom edge first, then climb up stone by stone
 const first = pickSpot(cands, { band: [0.62, 0.82], nearX, scale: sc })
 if (first && first.anchor.el !== target.anchor.el && first.y > target.y + 60 * sc) stops.push(first)
 }
 const fromV = { x: start.x - window.scrollX, y: start.y - window.scrollY }
 const lastV = stops.length ? { x: stops[0].x, y: stops[0].y } : fromV
 stops.push(...stepsBetween(cands, lastV, { x: target.x, y: target.y }, sc, dir ==='down' ? 1 : 5).filter(s => !stops.includes(s)))
 stops.push(target)
 lastPlan = stops.map(x => ({ k: x.anchor.kind, tag: x.anchor.el.tagName, x: Math.round(x.x), y: Math.round(x.y) }))
 let ok = true
 let from = start
 for (let i = 0; i < stops.length && ok; i++) {
 const sp = stops[i].anchor.resolve()
 if (!sp) continue
 const dropIn = i === 0 && dir ==='down' && (offscreen || start.y < window.scrollY)
 ok = await jumpTo(tok, from, sp, dropIn)
 if (ok) { anchor = stops[i].anchor; from = sp }
 }
 if (!ok) return
 anchor = target.anchor
 phase ='resting'
 setPose(1, 0)
 act('idle', { force: true })
 resetIdle()
 }

 /** decide whether he must move after the page came to rest */
 const decide = (forced: boolean) => {
 if (disposed || phase ==='hidden') return
 if (inHeroSection(d.pathname())) {
 if (phase !=='hero-docked' && phase !=='returning-to-hero') {
 returnToHero()
 }
 return
 }
 if (phase ==='traveling') { settleTimer = setTimeout(() => decide(forced), 350); return }
 const p = anchor?.resolve()
 if (!p) { relocate(lastDir > 0 ?'down' :'up'); return }
 const vy = p.y - window.scrollY, vx = p.x - window.scrollX
 const top = topSafe(), bottom = window.innerHeight - 24
 const ok = vy >= top && vy <= bottom && vx >= 24 && vx <= window.innerWidth - 24
 if (ok && !forced) {
 if (isObstructingContent(pos.x, pos.y, scale())) {
 act('fly', { text:'Aku minggir bentar biar gak ngalangin kamu baca ya!', force: true, ms: 2800 })
 setTimeout(() => { if (!disposed && phase ==='resting') relocate(lastDir > 0 ?'down' :'up') }, 500)
 }
 return
 }
 relocate(vy < top ?'down' : vy > bottom ?'up' : lastDir > 0 ?'down' :'up')
 }

 // ============================================================ talking about things
 const speakAbout = (target: Element, prefix ='') => {
 if (disposed || phase !=='resting' || typing) return
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
 setTimeout(() => { if (!disposed && phase ==='resting') play('idle') }, clamp(1800 + text.length * 25, 2400, 5200))
 }

 let hoverEl: Element | null = null
 let hoverTimer: ReturnType<typeof setTimeout> | null = null
 const considerPoint = (x: number, y: number, delay: number, prefix ='') => {
 const target = meaningfulTarget(document.elementFromPoint(x, y))
 if (target === hoverEl) return
 hoverEl = target
 if (hoverTimer) clearTimeout(hoverTimer)
 if (!target) return
 hoverTimer = setTimeout(() => speakAbout(target, prefix), delay)
 }

 const readAssist = () => {
 if (disposed || phase !=='resting') return
 const vw = window.innerWidth, vh = window.innerHeight
 for (const f of [0.42, 0.55, 0.32, 0.65]) {
 const t = meaningfulTarget(document.elementFromPoint(vw / 2, vh * f))
 if (t && explain(t) && !(seen.get(t) && performance.now() - (seen.get(t) ?? 0) < 60000)) { speakAbout(t,'Lagi baca ini ya?'); return }
 }
 }

 // ============================================================ idle ladder
 // not just one long stare: every few seconds he does a little flavor move (look around, wink,
 // nod, shake his head...), then eventually dozes off - and the cycle keeps going after that.
 const IDLE_FLAVORS: ClipName[] = ['lookAround','wink','nod','shake']
 const clearIdle = () => { idleTimers.forEach(clearTimeout); idleTimers.length = 0 }
 const resetIdle = () => {
 clearIdle()
 idleStage = 0
 const scheduleNext = (ms: number) => { idleTimers.push(setTimeout(tick_, ms)) }
 const tick_ = () => {
 if (typing || phase !=='resting') { scheduleNext(4000); return }
 idleStage++
 const envQuote = awareness.getIdleEnvironmentalQuote()
 if (envQuote && idleStage % 2 === 0) {
 act('nod', { force: true, text: envQuote, ms: 5500 })
 scheduleNext(12000 + Math.random() * 6000)
 } else if (idleStage % 7 === 0) {
 act('sleep', { force: true, text:'Zzz...', ms: 2600 })
 scheduleNext(10000 + Math.random() * 4000)
 } else if (idleStage % 3 === 0) {
 act('thinking', { force: true, text:'Hmm, sambil nunggu aku mikir strategi PTN dulu ya...' })
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
 if (idleStage % 7 === 0 && idleStage > 0 && phase ==='resting') act('surprised', { force: true, text: personal('Eh, {name} balik!') })
 resetIdle()
 }

 // ============================================================ events
 const onScroll = () => {
 const y = window.scrollY
 if (Math.abs(y - lastScrollY) > 0.5) lastDir = y > lastScrollY ? 1 : -1
 lastScrollY = y
 activity()

 // Hero section check on homepage: dock in hero if in hero, undock if scrolled past
 if (d.pathname() ==='/') {
 const isHero = inHeroSection(d.pathname())
 if (isHero) {
 if (phase !=='hero-docked' && phase !=='returning-to-hero') {
 returnToHero()
 }
 return
 } else if (phase ==='hero-docked') {
 undockFromHero()
 }
 }

 if (settleTimer) clearTimeout(settleTimer)
 settleTimer = setTimeout(() => decide(false), SETTLE_MS)
 if (isTouch) { if (readTimer) clearTimeout(readTimer); readTimer = setTimeout(readAssist, 1500) }
 }

 const hopOnto = async (el: Element, clientX: number) => {
 if (phase !=='resting') return
 const sc = scale()
 const am = anchorOnElement(el, clientX)
 if (!am || am.y < topSafe() || am.y > window.innerHeight - 20) return
 const from = anchor?.resolve() ?? pos
 const fvy = from.y - window.scrollY
 if (fvy < -10 || fvy > window.innerHeight + 10) return
 const to = am.anchor.resolve()
 if (!to) return
 const tok = ++token
 phase ='traveling'
 d.setBubble(null)
 const ok = await jumpTo(tok, from, to)
 void sc
 if (!ok) return
 anchor = am.anchor
 phase ='resting'
 setPose(1, 0)
 act('cheer', { force: true, text: pickOne(CLICK_LINES) })
 }

 const onClick = (e: MouseEvent) => {
 activity()
 const t = e.target as Element | null
 if (!t || t.closest(IGNORE_SELECTOR)) return
 const el = t.closest('button, a, [role="button"], input[type="submit"]')
 if (!el) return
 const label = (el.textContent ??'') +'' + (el.getAttribute('aria-label') ??'')
 if (DANGER.test(label)) { act('surprised', { force: true }); return }
 hopOnto(el, e.clientX)
 }
 const onFocus = (e: FocusEvent) => {
 activity()
 const t = e.target as HTMLElement | null
 if (t && (t.tagName ==='INPUT' || t.tagName ==='TEXTAREA' || t.isContentEditable) && !t.closest(IGNORE_SELECTOR)) {
 typing = true
 if (isPrivacyField(t)) {
 if (!isPrivacy) {
 isPrivacy = true
 act('coverEyes', { text: pickOne(PRIVACY_LINES), force: true, ms: 8000 })
 }
 } else {
 if (isPrivacy) isPrivacy = false
 act('typing', { force: true })
 }
 }
 }
 const onInput = (e: Event) => {
 activity()
 const t = e.target as HTMLElement | null
 if (t && (t.tagName ==='INPUT' || t.tagName ==='TEXTAREA' || t.isContentEditable) && !t.closest(IGNORE_SELECTOR)) {
 if (!isPrivacyField(t)) {
 awareness.handleFormInput(t,'input')
 }
 }
 }
 const onBlur = (e: FocusEvent) => {
 const t = e.target as HTMLElement | null
 if (t && (t.tagName ==='INPUT' || t.tagName ==='TEXTAREA' || t.isContentEditable) && !t.closest(IGNORE_SELECTOR)) {
 if (!isPrivacyField(t)) {
 awareness.handleFormInput(t,'blur')
 }
 }
 if (isPrivacy) {
 isPrivacy = false
 typing = false
 setTimeout(() => {
 if (!typing && !isPrivacy) {
 act('wink', { text: pickOne(PRIVACY_BLUR_LINES), force: true, ms: 2800 })
 }
 }, 250)
 return
 }
 if (!typing) return
 typing = false
 setTimeout(() => { if (!typing && !isPrivacy) act('nod', { force: true }) }, 250)
 }
 const handleErraticPointer = (now: number) => {
 if (disposed || isDragging || phase ==='traveling' || isPrivacy) return
 if (now < dizzyUntil || now < busyUntil) return
 dizzyUntil = now + 2400
 busyUntil = now + 2400
 moveSamples.length = 0
 act('shake', { text: pickOne(DIZZY_LINES), force: true, ms: 2600 })
 fx('stars')
 setTimeout(() => fx('sweat'), 350)
 }

 let lastMoveSample = 0
 const onMove = (e: PointerEvent) => {
 if (e.pointerType ==='touch') return
 // cheap: just remember where the cursor is. The actual hover-explain / facing-direction
 // work happens once per animation frame inside tick(), not on every raw pointermove event
 // (pointermove can fire far faster than rAF and was the main cause of scroll jank).
 pointerX = e.clientX; pointerY = e.clientY; pointerMoved = true
 activity()

 const now = performance.now()
 if (now < dizzyUntil || now - lastMoveSample < 32) return
 lastMoveSample = now

 moveSamples.push({ x: e.clientX, y: e.clientY, t: now })
 while (moveSamples.length > 0 && now - moveSamples[0].t > 450) {
 moveSamples.shift()
 }

 if (moveSamples.length >= 5) {
 let totalDist = 0
 let angleChanges = 0
 let sharpTurns = 0
 let prevAngle: number | null = null

 for (let i = 1; i < moveSamples.length; i++) {
 const dx = moveSamples[i].x - moveSamples[i - 1].x
 const dy = moveSamples[i].y - moveSamples[i - 1].y
 const dist = Math.hypot(dx, dy)
 totalDist += dist
 if (dist > 5) {
 const angle = Math.atan2(dy, dx)
 if (prevAngle !== null) {
 let diff = Math.abs(angle - prevAngle)
 if (diff > Math.PI) diff = 2 * Math.PI - diff
 angleChanges += diff
 if (diff > Math.PI / 4) sharpTurns++
 }
 prevAngle = angle
 }
 }

 const netDist = Math.hypot(
 moveSamples[moveSamples.length - 1].x - moveSamples[0].x,
 moveSamples[moveSamples.length - 1].y - moveSamples[0].y
 )
 const ratio = netDist / Math.max(1, totalDist)

 if (totalDist > 300 && (sharpTurns >= 3 || angleChanges > 3.0) && ratio < 0.6) {
 handleErraticPointer(now)
 }
 }
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
 if (e.type ==='nav-start') { navStartedAt = performance.now(); despawn() }
 else if (e.type ==='nav-end') spawnWhenReady(getMascotConfigForPath(d.pathname()))
 else if (e.type ==='success') act('cheer', { text: e.text ??'Berhasil!', force: true })
 else if (e.type ==='error') act('sad', { text: e.text ??'Waduh, ada kendala', force: true, ms: 4200 })
 else if (e.type ==='info') act('nod', { text: e.text, force: true })
 else if (e.type ==='say') say(e.text, e.ms)
 else if (e.type ==='act') act(e.clip, { text: e.text, force: true })
 else if (e.type ==='cs-chat-open') {
 setPose(1, 0)
 act('wave', {
 text:'Lagi tanya CS AI kita ya? Tanyain apa aja seputar OtwPTN, nanti dijawab!',
 force: true,
 ms: 5000,
 })
 } else if (e.type ==='cs-chat-close') {
 act('nod', {
 text:'Sip! Kalau butuh info lagi, CS AI kita selalu standby di pojok kanan bawah ya!',
 force: true,
 ms: 4500,
 })
 } else if (e.type ==='cs-chat-user-message') {
 const q = e.text.toLowerCase()
 if (q.includes('snbp') || q.includes('rapor') || q.includes('nilai')) {
 act('thinking', { text:'Pertanyaan tentang SNBP ya? CS AI paham banget analisis nilai rapor lho!', force: true, ms: 5200 })
 } else if (q.includes('esai') || q.includes('essay') || q.includes('surat')) {
 act('thinking', { text:'Soal esai motivasi ya? Struktur STAR di OtwPTN terbukti banyak bantu tembus! ️', force: true, ms: 5200 })
 } else if (q.includes('paket') || q.includes('harga') || q.includes('biaya') || q.includes('bayar') || q.includes('daftar')) {
 act('thinking', { text:'Lagi cek paket & bimbingan ya? Bimbingan mentor alumni top PTN recommended banget!', force: true, ms: 5200 })
 } else if (q.includes('mentor') || q.includes('konsul') || q.includes('alumni')) {
 act('thinking', { text:'Mentor di OtwPTN semuanya mahasiswa & alumni berprestasi dari PTN impianmu!', force: true, ms: 5200 })
 } else if (q.includes('prestasi') || q.includes('sertifikat') || q.includes('lomba')) {
 act('thinking', { text:'Kurasi sertifikat prestasi penting banget biar poin seleksi maksimal!', force: true, ms: 5200 })
 } else {
 act('thinking', { text:'Otbee dengerin juga nih... CS AI lagi siapin jawabannya!', force: true, ms: 4500 })
 }
 } else if (e.type ==='cs-chat-typing') {
 act('thinking', { force: true })
 } else if (e.type ==='cs-chat-bot-reply') {
 fx('stars')
 act('nod', { text:'Nah, udah dijawab sama CS AI! Semoga membantu yaa!', force: true, ms: 4500 })
 }
 })

 const onReturnHero = () => {
 if (d.pathname() ==='/' && !document.body.classList.contains('otwptn-hero-video-active')) {
 returnToHero()
 }
 }
 window.addEventListener('otbee:return-hero', onReturnHero)

 window.addEventListener('scroll', onScroll, { passive: true })
 window.addEventListener('click', onClick, true)
 window.addEventListener('focusin', onFocus, true)
 window.addEventListener('focusout', onBlur, true)
 window.addEventListener('input', onInput, true)
 window.addEventListener('pointermove', onMove, { passive: true })
 window.addEventListener('touchstart', onTouchStart, { passive: true })
 window.addEventListener('touchmove', onTouchMove, { passive: true })
 window.addEventListener('touchend', onTouchEnd, { passive: true })
 window.addEventListener('keydown', activity, { passive: true })
 window.addEventListener('resize', onResize, { passive: true })
 raf = requestAnimationFrame(tick)

 return {
 start() {
 setTimeout(() => {
 if (!disposed) {
 if (d.pathname() ==='/' && inHeroSection(d.pathname())) {
 dockAtHero()
 } else {
 spawnWhenReady(getMascotConfigForPath(d.pathname()))
 }
 }
 }, 150)
 },
 onPathChange() {
 // programmatic / back-forward navigation that never went through the honey loader
 if (performance.now() - navStartedAt > 7000) { despawn(); spawnWhenReady(getMascotConfigForPath(d.pathname())) }
 else setTimeout(() => { if (!disposed && phase ==='hidden') spawnWhenReady(getMascotConfigForPath(d.pathname())) }, 5000)
 },
 undockFromHero() {
 return undockFromHero()
 },
 returnToHero() {
 return returnToHero()
 },
 startDrag(clientX: number, clientY: number) {
 if (disposed) return
 if (phase ==='hero-docked') {
 d.onDockChange?.(false)
 }
 isDragging = true
 phase ='traveling'
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
 say('Ih aku mau dibawa kemanaaa!!!', 15000)
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
 if (validated.air >= 0.72) {
 foundAnchor = validated.anchor
 targetX = validated.x + window.scrollX
 targetY = validated.y + window.scrollY
 break
 } else {
 // Coba geser ke tepi ledge agar tidak menimpa teks/konten di tengah
 const altX = (curX_v - cand.xa < cand.xb - curX_v) ? cand.xa + 16 * scale() : cand.xb - 16 * scale()
 const altVal = cand.make(altX)
 if (altVal && altVal.air >= 0.7) {
 foundAnchor = altVal.anchor
 targetX = altVal.x + window.scrollX
 targetY = altVal.y + window.scrollY
 break
 } else {
 foundAnchor = validated.anchor
 targetX = validated.x + window.scrollX
 targetY = validated.y + window.scrollY
 break
 }
 }
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
 kind:'edge',
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
'Aduhh pusinggg! Tapi selamat mendarat! ‍',
'Hufttt, jangan digeser-geser lagi yaaa!',
'Fiuhhh... Kirain mau dibuang kemana! ‍',
'Aduh pantatku sakit! Untung mendarat mulus!',
 ]
 say(pickOne(funnyLandQuotes), 4500)

 phase ='resting'
 busyUntil = performance.now() + 600
 resetIdle()
 },
 clickMascot() {
 if (phase !=='resting' && phase !=='hero-docked') return
 fx('stars')
 act('salto', { text: pickOne(PTN_TIPS), force: true, ms: 5000 })
 },
 onDizzy() {
 handleErraticPointer(performance.now())
 },
 debug() { return { phase, pos, anchorKind: anchor?.kind, anchorTag: anchor?.el.tagName, plan: lastPlan } },
 relocateNow(dir:'down' |'up') { return relocate(dir) },
 dispose() {
 disposed = true
 token++; spawnTok++
 cancelAnimationFrame(raf)
 unsub()
 clearIdle()
 if (heroGreetingTimer1) clearTimeout(heroGreetingTimer1)
 if (heroGreetingTimer2) clearTimeout(heroGreetingTimer2)
 ;[settleTimer, retryTimer, readTimer, speechTimer, hoverTimer, holdTimer].forEach(t => t && clearTimeout(t))
 window.removeEventListener('scroll', onScroll)
 window.removeEventListener('click', onClick, true)
 window.removeEventListener('focusin', onFocus, true)
 window.removeEventListener('focusout', onBlur, true)
 window.removeEventListener('input', onInput, true)
 window.removeEventListener('pointermove', onMove)
 window.removeEventListener('touchstart', onTouchStart)
 window.removeEventListener('touchmove', onTouchMove)
 window.removeEventListener('touchend', onTouchEnd)
 window.removeEventListener('keydown', activity)
 window.removeEventListener('resize', onResize)
 window.removeEventListener('otbee:return-hero', onReturnHero)
 awareness.dispose()
 },
 }
}

export type Controller = ReturnType<typeof createController>
