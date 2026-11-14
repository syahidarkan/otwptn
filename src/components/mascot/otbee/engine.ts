/**
 * Otbee animation engine - pure TypeScript (no React).
 * Pose = continuous rig parameters. Clips = keyframe tracks over a Pose.
 * Mixer = clip playback + crossfade + procedural life (breathing, blinking, wing flutter,
 * eye drift) + damped springs for secondary motion (antennae / satchel / arms follow-through).
 */

export interface Pose {
  // whole figure (x/y in figure-heights, rot in deg about body centre)
  x: number; y: number; rot: number; sx: number; sy: number
  // head
  headRot: number; headX: number; headY: number
  antL: number; antR: number
  // limbs  (arm values are "raise" in degrees, + = up/forward)
  armL: number; armR: number; bag: number
  elbowL: number; elbowR: number; kneeL: number; kneeR: number
  headYaw: number; headPitch: number // -1..1 ; yaw + = turn to screen right, pitch + = look up
  legL: number; legR: number; liftL: number; liftR: number // swing deg (+ forward), lift in figure-heights
  wing: number; wingAmp: number; wingHz: number
  // face
  lookX: number; lookY: number
  blink: number; winkL: number; winkR: number
  eyeScale: number; eyeArc: number // eyeArc: 0..1 happy ^ ^ eyes
  mouthOpen: number; mouthCurve: number; mouthDrawn: number // mouthDrawn 0 = traced art mouth, 1 = procedural
  cheek: number
}
export type PoseKey = keyof Pose

export const DEFAULT_POSE: Pose = {
  x: 0, y: 0, rot: 0, sx: 1, sy: 1,
  headRot: 0, headX: 0, headY: 0, antL: 0, antR: 0,
  armL: 0, armR: 0, bag: 0, elbowL: 0, elbowR: 0, kneeL: 0, kneeR: 0, headYaw: 0, headPitch: 0, legL: 0, legR: 0, liftL: 0, liftR: 0, wing: 0, wingAmp: 9, wingHz: 7,
  lookX: 0, lookY: 0, blink: 0, winkL: 0, winkR: 0, eyeScale: 1, eyeArc: 0,
  mouthOpen: 0, mouthCurve: 1, mouthDrawn: 0, cheek: 1,
}

// ---------------------------------------------------------------- easing
export type Ease = 'l' | 'io' | 'i' | 'o' | 'back' | 'bounce' | 'elastic' | 'hold' | 'sine'
const E: Record<Ease, (t: number) => number> = {
  l: t => t,
  io: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  i: t => t * t * t,
  o: t => 1 - Math.pow(1 - t, 3),
  sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  back: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) },
  bounce: t => {
    const n1 = 7.5625, d1 = 2.75
    if (t < 1 / d1) return n1 * t * t
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  },
  elastic: t => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
  hold: t => (t >= 1 ? 1 : 0),
}

// ---------------------------------------------------------------- clips
/** [time(s), value, ease-of-the-segment-arriving-at-this-key] */
export type Key = [number, number, Ease?]
export type FxType = 'sparkle' | 'zzz' | 'heart' | 'dust' | 'stars' | 'question' | 'exclaim' | 'note' | 'sweat' | 'confetti' | 'bulb' | 'smoke'
export interface Clip {
  dur: number
  loop?: boolean
  tracks: Partial<Record<PoseKey, Key[]>>
  fx?: { t: number; type: FxType; side?: -1 | 1 }[]
  /** 0..1 how much procedural idle life is applied while this clip plays */
  life?: number
}

function sample(keys: Key[], t: number): number {
  if (t <= keys[0][0]) return keys[0][1]
  for (let i = 1; i < keys.length; i++) {
    const k1 = keys[i]
    if (t <= k1[0]) {
      const k0 = keys[i - 1]
      const u = (t - k0[0]) / Math.max(1e-6, k1[0] - k0[0])
      return k0[1] + (k1[1] - k0[1]) * E[k1[2] ?? 'io'](Math.min(1, Math.max(0, u)))
    }
  }
  return keys[keys.length - 1][1]
}
/** oscillation helper: n cycles of  centre ± amp between t0..t1 */
function osc(t0: number, t1: number, centre: number, amp: number, n: number, ease: Ease = 'sine'): Key[] {
  const out: Key[] = [[t0, centre, ease]]
  const step = (t1 - t0) / (n * 2)
  for (let i = 1; i <= n * 2; i++) out.push([t0 + step * i, centre + (i % 2 ? amp : -amp), ease])
  return out
}

export const CLIPS = {
  idle: {
    dur: 5, loop: true,
    tracks: {
      y: [[0, 0], [1.25, -0.012, 'sine'], [2.5, 0, 'sine'], [3.75, -0.012, 'sine'], [5, 0, 'sine']],
      headRot: [[0, 0], [1.2, 2.2, 'sine'], [2.5, -1.2, 'sine'], [3.8, 1.8, 'sine'], [5, 0, 'sine']],
      lookX: [[0, 0], [1.2, 0.25, 'sine'], [2.0, -0.2, 'sine'], [3.6, 0.15, 'sine'], [5, 0, 'sine']],
      armL: [[0, -8], [2.5, -14, 'sine'], [5, -8, 'sine']],
      armR: [[0, -8], [2.5, -14, 'sine'], [5, -8, 'sine']],
      mouthCurve: [[0, 1]],
    },
  },
  wave: {
    dur: 2.4,
    tracks: {
      armR: [[0, -8], [0.35, 105, 'back'], [1.9, 105, 'io'], [2.4, -8, 'io']],
      elbowR: [[0, 0], [0.35, 10, 'o'], ...osc(0.35, 1.9, 10, 38, 4).slice(1), [2.4, 0, 'io']],
      armL: [[0, -8], [0.5, -2, 'io'], [2.4, -8, 'io']],
      headRot: [[0, 0], [0.4, -5, 'io'], [1.9, -5, 'io'], [2.4, 0, 'io']],
      y: [[0, 0], [0.3, 0.012, 'o'], [0.5, -0.02, 'o'], [0.9, 0, 'io'], [2.4, 0, 'io']],
      mouthOpen: [[0, 0], [0.3, 0.55, 'o'], [2.0, 0.55, 'io'], [2.4, 0, 'io']],
      lookX: [[0, 0], [0.4, -0.3, 'io'], [2.4, 0, 'io']],
      eyeArc: [[0, 0], [0.5, 0.0], [2.4, 0]],
    }, fx: [{ t: 0.55, type: 'sparkle', side: 1 }, { t: 1.2, type: 'sparkle', side: 1 }],
  },
  cheer: {
    dur: 1.7,
    tracks: {
      sy: [[0, 1], [0.18, 0.84, 'o'], [0.34, 1.14, 'i'], [0.72, 1.06, 'o'], [0.95, 0.88, 'i'], [1.1, 1.05, 'o'], [1.7, 1, 'io']],
      sx: [[0, 1], [0.18, 1.12, 'o'], [0.34, 0.9, 'i'], [0.72, 0.96, 'o'], [0.95, 1.1, 'i'], [1.1, 0.97, 'o'], [1.7, 1, 'io']],
      y: [[0, 0], [0.18, 0.035, 'o'], [0.34, 0.0, 'i'], [0.7, -0.3, 'o'], [0.95, 0.03, 'i'], [1.1, 0, 'o'], [1.7, 0, 'io']],
      armL: [[0, -8], [0.18, -30, 'o'], [0.4, 112, 'back'], [0.95, 112, 'io'], [1.1, 96, 'o'], [1.7, -8, 'io']],
      armR: [[0, -8], [0.18, -30, 'o'], [0.4, 112, 'back'], [0.95, 112, 'io'], [1.1, 96, 'o'], [1.7, -8, 'io']],
      antL: [[0, 0], [0.4, 14, 'o'], [1.7, 0, 'io']], antR: [[0, 0], [0.4, -14, 'o'], [1.7, 0, 'io']],
      mouthOpen: [[0, 0], [0.34, 0.95, 'o'], [1.2, 0.8, 'io'], [1.7, 0, 'io']],
      eyeArc: [[0, 0], [0.3, 1, 'o'], [1.4, 1, 'io'], [1.7, 0, 'io']],
      cheek: [[0, 1], [0.4, 1.35, 'o'], [1.7, 1, 'io']],
      headRot: [[0, 0], [0.34, -4, 'o'], [0.7, 4, 'io'], [1.1, -3, 'io'], [1.7, 0, 'io']],
    }, fx: [{ t: 0.34, type: 'stars' }, { t: 0.7, type: 'sparkle', side: -1 }, { t: 0.7, type: 'sparkle', side: 1 }, { t: 0.95, type: 'dust' }],
  },
  bounce: {
    dur: 1.1,
    tracks: {
      sy: [[0, 1], [0.12, 0.86, 'o'], [0.3, 1.1, 'i'], [0.55, 1.02, 'io'], [0.72, 0.9, 'i'], [0.84, 1.04, 'o'], [1.1, 1, 'io']],
      sx: [[0, 1], [0.12, 1.1, 'o'], [0.3, 0.94, 'i'], [0.55, 0.99, 'io'], [0.72, 1.08, 'i'], [0.84, 0.98, 'o'], [1.1, 1, 'io']],
      y: [[0, 0], [0.12, 0.03, 'o'], [0.5, -0.14, 'o'], [0.72, 0.026, 'i'], [0.84, 0, 'o'], [1.1, 0, 'io']],
      armL: [[0, -8], [0.5, 30, 'o'], [1.1, -8, 'io']], armR: [[0, -8], [0.5, 30, 'o'], [1.1, -8, 'io']],
      mouthOpen: [[0, 0], [0.4, 0.5, 'o'], [1.1, 0, 'io']],
    }, fx: [{ t: 0.72, type: 'dust' }],
  },
  salto: {
    dur: 1.6,
    tracks: {
      sy: [[0, 1], [0.2, 0.8, 'o'], [0.34, 1.16, 'i'], [0.5, 0.86, 'io'], [0.82, 0.92, 'io'], [1.0, 1.14, 'i'], [1.16, 0.84, 'o'], [1.34, 1.04, 'o'], [1.6, 1, 'io']],
      sx: [[0, 1], [0.2, 1.16, 'o'], [0.34, 0.9, 'i'], [0.5, 1.14, 'io'], [0.82, 1.08, 'io'], [1.0, 0.92, 'i'], [1.16, 1.14, 'o'], [1.34, 0.98, 'o'], [1.6, 1, 'io']],
      y: [[0, 0], [0.2, 0.04, 'o'], [0.78, -0.62, 'o'], [1.14, 0.03, 'i'], [1.34, 0, 'o'], [1.6, 0, 'io']],
      rot: [[0, 0], [0.34, 0, 'io'], [1.0, -360, 'io'], [1.6, -360, 'io']],
      armL: [[0, -8], [0.2, -35, 'o'], [0.36, 100, 'o'], [0.8, 20, 'io'], [1.12, 80, 'o'], [1.6, -8, 'io']],
      armR: [[0, -8], [0.2, -35, 'o'], [0.36, 100, 'o'], [0.8, 20, 'io'], [1.12, 80, 'o'], [1.6, -8, 'io']],
      antL: [[0, 0], [0.4, 30, 'o'], [1.0, 20, 'io'], [1.6, 0, 'io']], antR: [[0, 0], [0.4, -30, 'o'], [1.0, -20, 'io'], [1.6, 0, 'io']],
      mouthOpen: [[0, 0], [0.34, 0.9, 'o'], [1.2, 0.7, 'io'], [1.6, 0, 'io']],
      eyeArc: [[0, 0], [0.34, 1, 'o'], [1.2, 1, 'io'], [1.5, 0, 'io']],
    }, fx: [{ t: 0.34, type: 'dust' }, { t: 0.78, type: 'stars' }, { t: 1.14, type: 'dust' }],
  },
  nod: {
    dur: 1.2,
    tracks: {
      headY: [[0, 0], [0.18, 0.012, 'o'], [0.36, -0.002, 'io'], [0.54, 0.012, 'o'], [0.8, 0, 'io'], [1.2, 0, 'io']],
      headPitch: [[0, 0], [0.18, -0.7, 'o'], [0.36, 0.1, 'io'], [0.54, -0.7, 'o'], [0.8, 0, 'io'], [1.2, 0, 'io']],
      headRot: [[0, 0], [0.18, 4, 'o'], [0.36, -1, 'io'], [0.54, 4, 'o'], [0.8, 0, 'io']],
      mouthCurve: [[0, 1]], mouthOpen: [[0, 0], [0.2, 0.3, 'o'], [1.1, 0, 'io']],
      armR: [[0, -8], [0.3, 60, 'back'], [0.9, 60, 'io'], [1.2, -8, 'io']],
      eyeArc: [[0, 0], [0.2, 0.7, 'o'], [0.9, 0.7, 'io'], [1.2, 0, 'io']],
    }, fx: [{ t: 0.3, type: 'sparkle', side: 1 }],
  },
  shake: {
    dur: 1.1,
    tracks: {
      headRot: [[0, 0], ...osc(0.05, 0.9, 0, 9, 3, 'sine').slice(1), [1.1, 0, 'io']],
      headYaw: [[0, 0], ...osc(0.05, 0.9, 0, 0.8, 3, 'sine').slice(1), [1.1, 0, 'io']],
      mouthCurve: [[0, -0.5], [1.1, -0.5]], mouthOpen: [[0, 0.1], [1.1, 0.1]],
      lookX: [[0, 0], ...osc(0.05, 0.9, 0, 0.5, 3, 'sine').slice(1), [1.1, 0, 'io']],
    },
  },
  thinking: {
    dur: 4, loop: true,
    tracks: {
      headRot: [[0, 4], [2, 8, 'sine'], [4, 4, 'sine']],
      lookX: [[0, -0.55], [2, -0.4, 'sine'], [4, -0.55, 'sine']],
      lookY: [[0, -0.7], [2, -0.55, 'sine'], [4, -0.7, 'sine']],
      headYaw: [[0, -0.5], [2, -0.35, 'sine'], [4, -0.5, 'sine']], headPitch: [[0, 0.55], [2, 0.4, 'sine'], [4, 0.55, 'sine']], elbowR: [[0, 70]],
      armR: [[0, 70], [1.2, 78, 'sine'], [2.4, 66, 'sine'], [4, 70, 'sine']],
      antL: [[0, 8], [2, -4, 'sine'], [4, 8, 'sine']],
      mouthOpen: [[0, 0.12], [2, 0.2, 'sine'], [4, 0.12, 'sine']], mouthCurve: [[0, 0.1]], mouthDrawn: [[0, 1]],
      y: [[0, 0], [2, -0.008, 'sine'], [4, 0, 'sine']],
    }, fx: [{ t: 0.4, type: 'question', side: 1 }, { t: 2.4, type: 'bulb', side: 1 }],
  },
  sleep: {
    dur: 5, loop: true, life: 0.35,
    tracks: {
      blink: [[0, 1]], eyeArc: [[0, 0]],
      headRot: [[0, 12], [2.5, 16, 'sine'], [5, 12, 'sine']], headPitch: [[0, -0.6]],
      headY: [[0, 0.03], [2.5, 0.045, 'sine'], [5, 0.03, 'sine']],
      sy: [[0, 0.985], [2.5, 1.0, 'sine'], [5, 0.985, 'sine']],
      armL: [[0, -22]], armR: [[0, -22]],
      antL: [[0, -18]], antR: [[0, -18]],
      mouthOpen: [[0, 0.08], [2.5, 0.2, 'sine'], [5, 0.08, 'sine']], mouthCurve: [[0, 0.3]], mouthDrawn: [[0, 1]],
      wingAmp: [[0, 1.5]], wingHz: [[0, 2]],
    }, fx: [{ t: 0.2, type: 'zzz', side: 1 }, { t: 2.7, type: 'zzz', side: 1 }],
  },
  surprised: {
    dur: 1.5,
    tracks: {
      sy: [[0, 1], [0.08, 1.14, 'o'], [0.3, 0.97, 'io'], [1.5, 1, 'io']],
      sx: [[0, 1], [0.08, 0.9, 'o'], [0.3, 1.03, 'io'], [1.5, 1, 'io']],
      y: [[0, 0], [0.1, -0.07, 'o'], [0.32, 0, 'i'], [1.5, 0, 'io']],
      eyeScale: [[0, 1], [0.1, 1.28, 'o'], [1.1, 1.2, 'io'], [1.5, 1, 'io']],
      antL: [[0, 0], [0.1, 34, 'o'], [1.5, 0, 'io']], antR: [[0, 0], [0.1, -34, 'o'], [1.5, 0, 'io']],
      armL: [[0, -8], [0.12, 40, 'o'], [1.5, -8, 'io']], armR: [[0, -8], [0.12, 40, 'o'], [1.5, -8, 'io']],
      mouthOpen: [[0, 0], [0.1, 0.85, 'o'], [1.1, 0.7, 'io'], [1.5, 0, 'io']], mouthCurve: [[0, 0]], mouthDrawn: [[0, 1]],
      headRot: [[0, 0], [0.1, -3, 'o'], [1.5, 0, 'io']],
    }, fx: [{ t: 0.1, type: 'exclaim', side: 1 }],
  },
  typing: {
    dur: 1.2, loop: true,
    tracks: {
      lookY: [[0, 0.65]], lookX: [[0, 0], [0.6, 0.25, 'sine'], [1.2, 0, 'sine']],
      headRot: [[0, 3], [0.6, 5, 'sine'], [1.2, 3, 'sine']], headY: [[0, 0.01]],
      armL: [[0, 14], [0.3, 4, 'sine'], [0.6, 18, 'sine'], [0.9, 6, 'sine'], [1.2, 14, 'sine']],
      armR: [[0, 6], [0.3, 18, 'sine'], [0.6, 4, 'sine'], [0.9, 16, 'sine'], [1.2, 6, 'sine']],
      y: [[0, 0], [0.3, -0.006, 'sine'], [0.6, 0, 'sine'], [0.9, -0.006, 'sine'], [1.2, 0, 'sine']],
      mouthOpen: [[0, 0]], mouthCurve: [[0, 0.7]],
    },
  },
  loading: {
    dur: 1.6, loop: true,
    tracks: {
      y: [[0, 0], [0.4, -0.08, 'o'], [0.8, 0, 'i'], [1.2, -0.08, 'o'], [1.6, 0, 'i']],
      sy: [[0, 1], [0.05, 0.93, 'o'], [0.4, 1.06, 'o'], [0.8, 1, 'i'], [0.85, 0.93, 'o'], [1.2, 1.06, 'o'], [1.6, 1, 'i']],
      sx: [[0, 1], [0.05, 1.06, 'o'], [0.4, 0.96, 'o'], [0.8, 1, 'i'], [0.85, 1.06, 'o'], [1.2, 0.96, 'o'], [1.6, 1, 'i']],
      rot: [[0, -4], [0.8, 4, 'sine'], [1.6, -4, 'sine']],
      lookX: [[0, -0.7], [0.8, 0.7, 'sine'], [1.6, -0.7, 'sine']],
      armL: [[0, 20], [0.8, 50, 'sine'], [1.6, 20, 'sine']], armR: [[0, 50], [0.8, 20, 'sine'], [1.6, 50, 'sine']],
      wingAmp: [[0, 22]], wingHz: [[0, 11]],
      mouthOpen: [[0, 0.25], [0.8, 0.1, 'sine'], [1.6, 0.25, 'sine']], mouthCurve: [[0, 0.5]], mouthDrawn: [[0, 1]],
    },
  },
  talk: {
    dur: 1.2, loop: true,
    tracks: {
      mouthOpen: [[0, 0.1], [0.1, 0.65, 'o'], [0.2, 0.2, 'io'], [0.34, 0.8, 'o'], [0.46, 0.15, 'io'], [0.6, 0.55, 'o'], [0.72, 0.1, 'io'], [0.86, 0.7, 'o'], [1.0, 0.25, 'io'], [1.2, 0.1, 'io']],
      mouthCurve: [[0, 0.8]], mouthDrawn: [[0, 1]],
      headRot: [[0, 0], [0.3, 2.5, 'sine'], [0.9, -2, 'sine'], [1.2, 0, 'sine']],
      headY: [[0, 0], [0.15, 0.008, 'o'], [0.4, -0.004, 'io'], [0.8, 0.008, 'o'], [1.2, 0, 'io']],
      armR: [[0, -2], [0.4, 28, 'sine'], [0.8, 8, 'sine'], [1.2, -2, 'sine']],
      armL: [[0, -8], [0.6, 6, 'sine'], [1.2, -8, 'sine']],
    },
  },
  sad: {
    dur: 3, loop: true,
    tracks: {
      headRot: [[0, -7], [1.5, -9, 'sine'], [3, -7, 'sine']], headY: [[0, 0.04]], headPitch: [[0, -0.8]],
      lookY: [[0, 0.7]], lookX: [[0, 0.1], [1.5, -0.2, 'sine'], [3, 0.1, 'sine']],
      antL: [[0, -28]], antR: [[0, -28]], armL: [[0, -30]], armR: [[0, -30]],
      sy: [[0, 0.97], [1.5, 0.985, 'sine'], [3, 0.97, 'sine']],
      mouthCurve: [[0, -1]], mouthOpen: [[0, 0.08]], mouthDrawn: [[0, 1]],
      wingAmp: [[0, 3]], wingHz: [[0, 4]], cheek: [[0, 0.7]],
    }, fx: [{ t: 0.8, type: 'sweat', side: 1 }],
  },
  shy: {
    dur: 3, loop: true,
    tracks: {
      headRot: [[0, -6], [1.5, -3, 'sine'], [3, -6, 'sine']], lookX: [[0, 0.6]], lookY: [[0, 0.5]],
      armL: [[0, 60]], armR: [[0, 60]], cheek: [[0, 1.6]], mouthCurve: [[0, 0.5]], mouthOpen: [[0, 0.05]], mouthDrawn: [[0, 1]],
      sx: [[0, 0.98]], sy: [[0, 0.99]], eyeArc: [[0, 0.5]],
    }, fx: [{ t: 0.6, type: 'heart', side: 1 }],
  },
  dance: {
    dur: 1.2, loop: true,
    tracks: {
      x: [[0, -0.03], [0.3, 0.03, 'sine'], [0.6, -0.03, 'sine'], [0.9, 0.03, 'sine'], [1.2, -0.03, 'sine']],
      y: [[0, 0], [0.15, -0.045, 'o'], [0.3, 0, 'i'], [0.45, -0.045, 'o'], [0.6, 0, 'i'], [0.75, -0.045, 'o'], [0.9, 0, 'i'], [1.05, -0.045, 'o'], [1.2, 0, 'i']],
      rot: [[0, -6], [0.6, 6, 'sine'], [1.2, -6, 'sine']],
      headRot: [[0, 6], [0.6, -6, 'sine'], [1.2, 6, 'sine']],
      armL: [[0, 100], [0.6, 20, 'sine'], [1.2, 100, 'sine']], armR: [[0, 20], [0.6, 100, 'sine'], [1.2, 20, 'sine']],
      sy: [[0, 1], [0.15, 1.04, 'o'], [0.3, 0.96, 'i'], [0.45, 1.04, 'o'], [0.6, 0.96, 'i'], [0.75, 1.04, 'o'], [0.9, 0.96, 'i'], [1.05, 1.04, 'o'], [1.2, 0.96, 'i']],
      mouthOpen: [[0, 0.6]], eyeArc: [[0, 1]], cheek: [[0, 1.3]],
    }, fx: [{ t: 0.1, type: 'note', side: -1 }, { t: 0.7, type: 'note', side: 1 }],
  },
  lookAround: {
    dur: 3.6,
    tracks: {
      lookX: [[0, 0], [0.5, -0.9, 'io'], [1.4, -0.9, 'io'], [1.9, 0.9, 'io'], [2.9, 0.9, 'io'], [3.6, 0, 'io']],
      lookY: [[0, 0], [0.5, -0.2, 'io'], [3.6, 0, 'io']],
      headRot: [[0, 0], [0.5, -6, 'io'], [1.4, -6, 'io'], [1.9, 6, 'io'], [2.9, 6, 'io'], [3.6, 0, 'io']],
      headYaw: [[0, 0], [0.5, -0.9, 'io'], [1.4, -0.9, 'io'], [1.9, 0.9, 'io'], [2.9, 0.9, 'io'], [3.6, 0, 'io']],
      headPitch: [[0, 0], [0.9, 0.2, 'io'], [2.4, -0.2, 'io'], [3.6, 0, 'io']],
    },
  },
  celebrate: {
    dur: 2.4,
    tracks: {
      sy: [[0, 1], [0.15, 0.84, 'o'], [0.3, 1.14, 'i'], [0.65, 1.04, 'o'], [0.85, 0.88, 'i'], [1.0, 1.1, 'o'], [1.3, 1.02, 'io'], [1.5, 0.88, 'i'], [1.65, 1.08, 'o'], [2.4, 1, 'io']],
      sx: [[0, 1], [0.15, 1.12, 'o'], [0.3, 0.9, 'i'], [0.65, 0.97, 'o'], [0.85, 1.1, 'i'], [1.0, 0.94, 'o'], [1.3, 0.99, 'io'], [1.5, 1.1, 'i'], [1.65, 0.95, 'o'], [2.4, 1, 'io']],
      y: [[0, 0], [0.15, 0.03, 'o'], [0.62, -0.3, 'o'], [0.85, 0.03, 'i'], [1.0, 0, 'o'], [1.3, -0.12, 'o'], [1.5, 0.03, 'i'], [1.65, 0, 'o'], [2.4, 0, 'io']],
      armL: [[0, -8], [0.15, -30, 'o'], [0.3, 118, 'back'], [2.0, 112, 'io'], [2.4, -8, 'io']], armR: [[0, -8], [0.15, -30, 'o'], [0.3, 118, 'back'], [2.0, 112, 'io'], [2.4, -8, 'io']],
      mouthOpen: [[0, 0], [0.3, 1, 'o'], [2.0, 0.9, 'io'], [2.4, 0, 'io']], eyeArc: [[0, 0], [0.3, 1, 'o'], [2.0, 1, 'io'], [2.4, 0, 'io']],
      headRot: [[0, 0], [0.3, -5, 'o'], [0.8, 5, 'io'], [1.3, -5, 'io'], [1.9, 3, 'io'], [2.4, 0, 'io']],
      wingAmp: [[0, 22], [2.4, 22]], wingHz: [[0, 12], [2.4, 12]], cheek: [[0, 1.4]],
    }, fx: [{ t: 0.3, type: 'confetti' }, { t: 0.62, type: 'stars' }, { t: 1.3, type: 'confetti' }, { t: 1.8, type: 'sparkle', side: 1 }],
  },
  wink: {
    dur: 1.1,
    tracks: {
      winkR: [[0, 0], [0.18, 1, 'o'], [0.7, 1, 'io'], [0.95, 0, 'io']],
      headRot: [[0, 0], [0.2, 5, 'o'], [0.8, 5, 'io'], [1.1, 0, 'io']],
      mouthOpen: [[0, 0], [0.2, 0.35, 'o'], [0.9, 0.35, 'io'], [1.1, 0, 'io']], mouthCurve: [[0, 1]],
      armL: [[0, -8], [0.3, 50, 'back'], [0.9, 50, 'io'], [1.1, -8, 'io']],
    }, fx: [{ t: 0.25, type: 'sparkle', side: 1 }],
  },
  walk: {
    dur: 0.9, loop: true,
    tracks: {
      legL: [[0, 30], [0.45, -30, 'sine'], [0.9, 30, 'sine']], legR: [[0, -30], [0.45, 30, 'sine'], [0.9, -30, 'sine']],
      kneeL: [[0, 0], [0.225, 40, 'o'], [0.45, 0, 'i'], [0.9, 0, 'io']], kneeR: [[0, 0], [0.45, 0, 'io'], [0.675, 40, 'o'], [0.9, 0, 'i']],
      elbowL: [[0, 20], [0.45, 4, 'sine'], [0.9, 20, 'sine']], elbowR: [[0, 4], [0.45, 20, 'sine'], [0.9, 4, 'sine']],
      liftL: [[0, 0], [0.225, 0.03, 'o'], [0.45, 0, 'i'], [0.9, 0, 'io']], liftR: [[0, 0], [0.45, 0, 'io'], [0.675, 0.03, 'o'], [0.9, 0, 'i']],
      y: [[0, 0], [0.225, -0.012, 'o'], [0.45, 0.004, 'i'], [0.675, -0.012, 'o'], [0.9, 0.004, 'i']],
      rot: [[0, -2.5], [0.45, 2.5, 'sine'], [0.9, -2.5, 'sine']],
      armL: [[0, -18], [0.45, 2, 'sine'], [0.9, -18, 'sine']], armR: [[0, 2], [0.45, -18, 'sine'], [0.9, 2, 'sine']],
      headRot: [[0, 1.5], [0.45, -1.5, 'sine'], [0.9, 1.5, 'sine']],
      mouthOpen: [[0, 0.2]], eyeArc: [[0, 0.15]],
    }, fx: [{ t: 0.2, type: 'dust' }, { t: 0.65, type: 'dust' }],
  },
  run: {
    dur: 0.5, loop: true,
    tracks: {
      legL: [[0, 38], [0.25, -38, 'sine'], [0.5, 38, 'sine']], legR: [[0, -38], [0.25, 38, 'sine'], [0.5, -38, 'sine']],
      kneeL: [[0, 0], [0.125, 70, 'o'], [0.25, 0, 'i'], [0.5, 0, 'io']], kneeR: [[0, 0], [0.25, 0, 'io'], [0.375, 70, 'o'], [0.5, 0, 'i']],
      elbowL: [[0, 70], [0.25, 40, 'sine'], [0.5, 70, 'sine']], elbowR: [[0, 40], [0.25, 70, 'sine'], [0.5, 40, 'sine']],
      liftL: [[0, 0], [0.125, 0.05, 'o'], [0.25, 0, 'i'], [0.5, 0, 'io']], liftR: [[0, 0], [0.25, 0, 'io'], [0.375, 0.05, 'o'], [0.5, 0, 'i']],
      y: [[0, 0], [0.125, -0.03, 'o'], [0.25, 0.005, 'i'], [0.375, -0.03, 'o'], [0.5, 0.005, 'i']],
      rot: [[0, 5], [0.25, 8, 'sine'], [0.5, 5, 'sine']],
      armL: [[0, -40], [0.25, 25, 'sine'], [0.5, -40, 'sine']], armR: [[0, 25], [0.25, -40, 'sine'], [0.5, 25, 'sine']],
      mouthOpen: [[0, 0.5]], eyeArc: [[0, 0.3]], wingAmp: [[0, 20]], wingHz: [[0, 12]],
    }, fx: [{ t: 0.1, type: 'dust' }, { t: 0.35, type: 'dust' }],
  },
  kick: {
    dur: 1.1,
    tracks: {
      rot: [[0, 0], [0.25, -6, 'o'], [0.4, 6, 'i'], [0.9, 0, 'io'], [1.1, 0, 'io']],
      legR: [[0, 0], [0.25, -45, 'o'], [0.4, 80, 'i'], [0.55, 80, 'io'], [0.95, 0, 'io']],
      liftR: [[0, 0], [0.25, 0, 'o'], [0.4, 0.05, 'i'], [0.55, 0.05, 'io'], [0.95, 0, 'io']],
      kneeR: [[0, 0], [0.25, 65, 'o'], [0.4, 0, 'i'], [0.55, 10, 'io'], [0.95, 0, 'io']],
      armL: [[0, -8], [0.4, 70, 'o'], [0.95, -8, 'io']], armR: [[0, -8], [0.4, -30, 'o'], [0.95, -8, 'io']],
      sy: [[0, 1], [0.22, 0.95, 'o'], [0.4, 1.03, 'i'], [0.95, 1, 'io']],
      mouthOpen: [[0, 0], [0.38, 0.8, 'o'], [0.9, 0, 'io']], eyeArc: [[0, 0], [0.4, 0.5, 'o'], [0.9, 0, 'io']],
    }, fx: [{ t: 0.4, type: 'stars' }],
  },
  crouch: {
    dur: 0.2,
    tracks: {
      sy: [[0, 1], [0.2, 0.7, 'o']], sx: [[0, 1], [0.2, 1.2, 'o']], y: [[0, 0], [0.2, 0.05, 'o']],
      armL: [[0, -8], [0.2, -42, 'o']], armR: [[0, -8], [0.2, -42, 'o']],
      antL: [[0, 0], [0.2, -16, 'o']], antR: [[0, 0], [0.2, -16, 'o']],
      headY: [[0, 0], [0.2, 0.014, 'o']], mouthOpen: [[0, 0], [0.2, 0.2, 'o']],
    },
  },
  jumpAir: {
    dur: 1, loop: true, life: 0.3,
    tracks: {
      sy: [[0, 1.14]], sx: [[0, 0.91]],
      armL: [[0, 100]], armR: [[0, 100]], antL: [[0, 30]], antR: [[0, 30]],
      legL: [[0, 12]], legR: [[0, -12]], kneeL: [[0, 55]], kneeR: [[0, 55]],
      mouthOpen: [[0, 0.85]], eyeArc: [[0, 0.5]], wingAmp: [[0, 32]], wingHz: [[0, 14]],
    },
  },
  land: {
    dur: 0.5,
    tracks: {
      sy: [[0, 1.12], [0.09, 0.66, 'o'], [0.26, 1.08, 'io'], [0.5, 1, 'io']],
      sx: [[0, 0.92], [0.09, 1.26, 'o'], [0.26, 0.96, 'io'], [0.5, 1, 'io']],
      y: [[0, 0], [0.09, 0.055, 'o'], [0.26, 0, 'io']],
      armL: [[0, 100], [0.09, -34, 'o'], [0.26, 8, 'io'], [0.5, -8, 'io']],
      armR: [[0, 100], [0.09, -34, 'o'], [0.26, 8, 'io'], [0.5, -8, 'io']],
      antL: [[0, 30], [0.09, -24, 'o'], [0.26, 8, 'io'], [0.5, 0, 'io']],
      antR: [[0, 30], [0.09, -24, 'o'], [0.26, 8, 'io'], [0.5, 0, 'io']],
      mouthOpen: [[0, 0.8], [0.09, 0.2, 'o'], [0.4, 0, 'io']],
      wingAmp: [[0, 32], [0.2, 9, 'o']], wingHz: [[0, 14], [0.2, 7, 'o']],
    }, fx: [{ t: 0.07, type: 'dust' }],
  },
  flyTravel: {
    dur: 0.36, loop: true, life: 0.1,
    tracks: {
      wingAmp: [[0, 74]], wingHz: [[0, 10]],
      y: [[0, 0], [0.18, -0.055, 'sine'], [0.36, 0, 'sine']],
      sy: [[0, 1.12], [0.18, 0.94, 'sine'], [0.36, 1.12, 'sine']],
      sx: [[0, 0.9], [0.18, 1.05, 'sine'], [0.36, 0.9, 'sine']],
      armL: [[0, -60]], armR: [[0, -60]], antL: [[0, -42]], antR: [[0, -42]],
      legL: [[0, 30], [0.18, -30, 'sine'], [0.36, 30, 'sine']], legR: [[0, -30], [0.18, 30, 'sine'], [0.36, -30, 'sine']],
      kneeL: [[0, 54]], kneeR: [[0, 54]], mouthOpen: [[0, 0.5]], eyeArc: [[0, 0.45]], cheek: [[0, 1.2]],
    },
  },
  fly: {
    dur: 1.4, loop: true,
    tracks: {
      y: [[0, 0], [0.35, -0.035, 'sine'], [0.7, 0, 'sine'], [1.05, -0.035, 'sine'], [1.4, 0, 'sine']],
      rot: [[0, 3], [0.7, 6, 'sine'], [1.4, 3, 'sine']],
      armL: [[0, -25]], armR: [[0, -25]], wingAmp: [[0, 26]], wingHz: [[0, 14]],
      mouthOpen: [[0, 0.4]], mouthCurve: [[0, 1]], eyeArc: [[0, 0.3]],
    },
  },
} satisfies Record<string, Clip>
export type ClipName = keyof typeof CLIPS

// ---------------------------------------------------------------- spring
class Spring {
  v = 0; s = 0
  constructor(public k: number, public c: number) {}
  step(dt: number, force: number) {
    // semi-implicit euler, sub-stepped for stability
    const n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n
    for (let i = 0; i < n; i++) { this.v += (-this.k * this.s - this.c * this.v + force) * h; this.s += this.v * h }
    return this.s
  }
}

export interface FxEvent { type: FxType; side: -1 | 1 }
export interface PlayOpts { loop?: boolean; speed?: number; onDone?: () => void; fade?: number }

interface Playing { clip: Clip; t: number; loop: boolean; speed: number; onDone?: () => void; firedUpTo: number; name?: string }

export class Mixer {
  pose: Pose = { ...DEFAULT_POSE }
  private cur: Playing | null = null
  private from: Pose | null = null
  private fade = 0
  private fadeDur = 0.18
  private time = 0
  private nextBlink = 1.5
  private blinkT = -1
  private blinkDouble = false
  private lookTarget = { x: 0, y: 0 }
  private nextLook = 1
  private lookCur = { x: 0, y: 0 }
  private ant = [new Spring(140, 7), new Spring(120, 6)]
  private bagS = new Spring(90, 5.5)
  private armS = [new Spring(110, 8), new Spring(110, 8)]
  private lastX = 0; private lastY = 0; private vx = 0; private vy = 0
  private rotSpring = new Spring(130, 9)
  private lastRot = 0; private rvel = 0
  pointer: { x: number; y: number } | null = null
  onFx?: (e: FxEvent) => void
  setPointer(p: { x: number; y: number } | null) { this.pointer = p }
  setFxHandler(f: ((e: FxEvent) => void) | undefined) { this.onFx = f }
  current(): string | undefined { return this.cur?.name }

  play(name: ClipName | Clip, o: PlayOpts = {}) {
    const clip: Clip = typeof name === 'string' ? (CLIPS[name] as Clip) : name
    this.from = { ...this.pose }
    this.fade = 0
    this.fadeDur = o.fade ?? 0.18
    this.cur = {
      clip, t: 0, loop: o.loop ?? !!clip.loop, speed: o.speed ?? 1, onDone: o.onDone, firedUpTo: -1,
      name: typeof name === 'string' ? name : undefined,
    }
  }

  private evalClip(p: Playing): Pose {
    const out: Pose = { ...DEFAULT_POSE }
    const t = p.loop ? p.t % p.clip.dur : Math.min(p.t, p.clip.dur)
    for (const k in p.clip.tracks) {
      const keys = p.clip.tracks[k as PoseKey]
      if (keys) out[k as PoseKey] = sample(keys, t)
    }
    return out
  }

  update(dt: number): Pose {
    dt = Math.min(dt, 0.05)
    this.time += dt
    const T = this.time
    let base: Pose = { ...DEFAULT_POSE }
    let life = 1
    if (this.cur) {
      const p = this.cur
      const prevT = p.t
      p.t += dt * p.speed
      base = this.evalClip(p)
      life = p.clip.life ?? 1
      // fx events
      if (p.clip.fx && this.onFx) {
        const dur = p.clip.dur
        const a = p.loop ? prevT % dur : prevT, b = p.loop ? (p.t % dur) : Math.min(p.t, dur)
        for (const f of p.clip.fx) {
          const hit = a <= b ? (f.t > a && f.t <= b) : (f.t > a || f.t <= b)
          if (hit) this.onFx({ type: f.type, side: f.side ?? (Math.random() < 0.5 ? -1 : 1) })
        }
      }
      if (!p.loop && p.t >= p.clip.dur) {
        const cb = p.onDone
        this.cur = null
        this.from = { ...this.pose }; this.fade = 0; this.fadeDur = 0.3
        if (cb) cb(); else this.play('idle', { fade: 0.3 })
      }
    }
    // crossfade from the previous pose
    if (this.from) {
      this.fade += dt / this.fadeDur
      if (this.fade >= 1) this.from = null
      else {
        const u = E.sine(this.fade)
        const f = this.from
        for (const k of Object.keys(base) as PoseKey[]) {
          if (k === 'rot') {
            // shortest angular path: a clip that finishes a full 360 spin (e.g. salto) must not
            // visibly spin all the way back around when it crossfades into the next pose's rot=0
            let diff = base.rot - f.rot
            diff = ((diff + 180) % 360 + 360) % 360 - 180
            base.rot = f.rot + diff * u
          } else {
            base[k] = f[k] + (base[k] - f[k]) * u
          }
        }
      }
    }
    // ---------- procedural life (additive)
    const P = base
    P.sy += 0.01 * life * Math.sin(T * 2.4); P.sx -= 0.005 * life * Math.sin(T * 2.4)
    P.y += 0.006 * life * Math.sin(T * 1.7 + 0.6)
    // blink scheduler
    this.nextBlink -= dt
    if (this.blinkT < 0 && this.nextBlink <= 0) { this.blinkT = 0; this.blinkDouble = Math.random() < 0.2 }
    if (this.blinkT >= 0) {
      this.blinkT += dt
      const d = 0.16
      const b = this.blinkT < d ? Math.sin((this.blinkT / d) * Math.PI) : 0
      P.blink = Math.max(P.blink, b)
      if (this.blinkT > d) {
        if (this.blinkDouble) { this.blinkDouble = false; this.blinkT = 0 } else { this.blinkT = -1; this.nextBlink = 2.2 + Math.random() * 3.8 }
      }
    }
    // eye drift
    this.nextLook -= dt
    if (this.nextLook <= 0) { this.lookTarget = { x: (Math.random() - 0.5) * 0.7, y: (Math.random() - 0.5) * 0.4 }; this.nextLook = 1.2 + Math.random() * 2.4 }
    this.lookCur.x += (this.lookTarget.x - this.lookCur.x) * Math.min(1, dt * 7)
    this.lookCur.y += (this.lookTarget.y - this.lookCur.y) * Math.min(1, dt * 7)
    P.lookX += this.lookCur.x * 0.5 * life; P.lookY += this.lookCur.y * 0.5 * life
    if (this.pointer) {
      P.lookX += this.pointer.x * 0.9; P.lookY += this.pointer.y * 0.7
      P.headRot += this.pointer.x * 3; P.headYaw += this.pointer.x * 0.85; P.headPitch -= this.pointer.y * 0.7
    }
    // wing flutter (flapping angle)
    P.wing += P.wingAmp * Math.sin(T * Math.PI * 2 * P.wingHz)
    // ---------- secondary motion (springs driven by figure acceleration)
    const vx = (P.x - this.lastX) / Math.max(dt, 1e-3), vy = (P.y - this.lastY) / Math.max(dt, 1e-3)
    const ax = (vx - this.vx) / Math.max(dt, 1e-3), ay = (vy - this.vy) / Math.max(dt, 1e-3)
    this.vx = vx; this.vy = vy; this.lastX = P.x; this.lastY = P.y
    const rv = (P.rot - this.lastRot) / Math.max(dt, 1e-3); this.lastRot = P.rot
    const ra = (rv - this.rvel) / Math.max(dt, 1e-3); this.rvel = rv
    const clampF = (v: number, m: number) => Math.max(-m, Math.min(m, v))
    const fa = clampF(ay * 30, 5000), fx = clampF(ax * 40, 5000)
    P.antL += this.ant[0].step(dt, fa * 0.5 - fx * 0.4 - clampF(ra * 0.04, 3000)) + 4 * Math.sin(T * 2.3) * life
    P.antR += this.ant[1].step(dt, -fa * 0.5 - fx * 0.4 - clampF(ra * 0.04, 3000)) + 4 * Math.sin(T * 2.3 + 1.2) * life
    P.bag += this.bagS.step(dt, -fx * 0.9 - clampF(ra * 0.05, 3000) + fa * 0.1)
    P.armL += this.armS[0].step(dt, fa * 0.8)
    P.armR += this.armS[1].step(dt, fa * 0.8)
    this.pose = P
    return P
  }
}
