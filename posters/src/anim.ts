export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v))
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u
export const mix = lerp

export type EaseFn = (t: number) => number
export const ease = {
  linear: (t: number) => t,
  inQuad: (t: number) => t * t,
  outQuad: (t: number) => 1 - (1 - t) * (1 - t),
  inCubic: (t: number) => t * t * t,
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  inOutQuart: (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2),
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inExpo: (t: number) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  inOutExpo: (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
  inOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  outBack: (t: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) },
  outBackSoft: (t: number) => { const c1 = 1.1, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) },
  outElastic: (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
}

/** 0..1 progress of t through [a, b], eased */
export const prog = (t: number, a: number, b: number, e: EaseFn = ease.inOutCubic) => e(clamp((t - a) / (b - a)))

/** damped spring step response (0 -> 1) starting at time a */
export function spr(t: number, a: number, freq = 4, damp = 0.5) {
  if (t <= a) return 0
  const x = t - a
  const w = 2 * Math.PI * freq
  return 1 - Math.exp(-damp * w * x) * Math.cos(w * Math.sqrt(1 - damp * damp) * x)
}

/** keyframes [{t, ...values, e?}] -> values at time t (each segment eased with the arriving key's ease) */
export type KF<T extends Record<string, number>> = { t: number; e?: EaseFn } & T
export function kf<T extends Record<string, number>>(keys: KF<T>[], t: number): T {
  if (t <= keys[0].t) return strip(keys[0])
  for (let i = 1; i < keys.length; i++) {
    const b = keys[i]
    if (t <= b.t) {
      const a = keys[i - 1]
      const u = (b.e ?? ease.inOutCubic)(clamp((t - a.t) / Math.max(1e-6, b.t - a.t)))
      const out = {} as Record<string, number>
      for (const k in b) if (k !== 't' && k !== 'e') out[k] = lerp((a as Record<string, number>)[k], (b as Record<string, number>)[k], u)
      return out as T
    }
  }
  return strip(keys[keys.length - 1])
}
function strip<T extends Record<string, number>>(k: KF<T>): T {
  const out = {} as Record<string, number>
  for (const key in k) if (key !== 't' && key !== 'e') out[key] = (k as Record<string, number>)[key]
  return out as T
}

/** in/out envelope: rises over [a, a+inD], holds, falls over [b-outD, b] */
export function env(t: number, a: number, b: number, inD = 0.3, outD = 0.3, e: EaseFn = ease.outCubic) {
  if (t < a || t > b) return 0
  return Math.min(e(clamp((t - a) / inD)), e(clamp((b - t) / outD)))
}

export function rng(seed: number) {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
