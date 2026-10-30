// Web Audio API synthesizer for step-transition SFX
// Uses only the AudioContext API - no external dependencies or audio files required.

type SfxType = 'next' | 'select' | 'correct' | 'wrong' | 'complete' | 'hold'

interface NoteConfig {
  freqs: number[]
  gain: number
  dur: number
  wave: OscillatorType
  stagger?: number
}

const CONFIGS: Record<SfxType, NoteConfig> = {
  next:     { freqs: [440, 660],            gain: 0.055, dur: 0.18, wave: 'sine',     stagger: 0.06 },
  select:   { freqs: [360],                 gain: 0.05,  dur: 0.12, wave: 'sine' },
  correct:  { freqs: [523, 659, 784],       gain: 0.07,  dur: 0.45, wave: 'sine',     stagger: 0.09 },
  wrong:    { freqs: [280, 220],            gain: 0.06,  dur: 0.25, wave: 'sawtooth', stagger: 0.05 },
  complete: { freqs: [523, 659, 784, 1047], gain: 0.08,  dur: 0.7,  wave: 'sine',     stagger: 0.1 },
  hold:     { freqs: [220, 330, 440, 550],  gain: 0.05,  dur: 1.1,  wave: 'sine',     stagger: 0.15 },
}

let _ctx: AudioContext | null = null

function getCtx() {
  if (typeof window === 'undefined') return null
  try {
    if (!_ctx || _ctx.state === 'closed') {
      const WC = (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      _ctx = new (AudioContext || WC)()
    }
    return _ctx
  } catch { return null }
}

export function playSfx(type: SfxType): void {
  const ctx = getCtx(); if (!ctx) return
  void ctx.resume().then(() => {
    try {
      const c = CONFIGS[type]
      const stagger = c.stagger ?? 0
      c.freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = c.wave
        osc.frequency.value = freq
        const startAt = ctx.currentTime + i * stagger
        gain.gain.setValueAtTime(c.gain, startAt)
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + c.dur)
        osc.connect(gain); gain.connect(ctx.destination)
        osc.start(startAt); osc.stop(startAt + c.dur + 0.05)
      })
    } catch {}
  })
}

// Full celebratory fanfare for the final completion screen (~5s)
export function playFanfare(): void {
  const ctxMaybe = getCtx(); if (!ctxMaybe) return
  const ctx = ctxMaybe
  void ctx.resume().then(() => { _scheduleFanfare(ctx) })
}

function _scheduleFanfare(ctx: AudioContext): void {
  try {
    const now = ctx.currentTime

    function tone(freq: number, start: number, dur: number, amp: number, wave: OscillatorType = 'sine') {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = wave
      osc.frequency.value = freq
      const t = now + start
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(amp, t + 0.025)
      g.gain.setValueAtTime(amp, t + dur * 0.55)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      osc.connect(g); g.connect(ctx.destination)
      osc.start(t); osc.stop(t + dur + 0.05)
    }

    // Bass punch on chord hits
    function bass(freq: number, start: number) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq * 2, now + start)
      osc.frequency.exponentialRampToValueAtTime(freq, now + start + 0.08)
      g.gain.setValueAtTime(0.14, now + start)
      g.gain.exponentialRampToValueAtTime(0.0001, now + start + 0.3)
      osc.connect(g); g.connect(ctx.destination)
      osc.start(now + start); osc.stop(now + start + 0.35)
    }

    // Phase 1: quick ascending arpeggio (C5→E5→G5→C6)
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.22, 0.065))

    // Phase 2: C major chord hit (0.38s)
    bass(130, 0.36)
    ;[261, 330, 392, 523].forEach(f => tone(f, 0.36, 0.8, 0.06))

    // Phase 3: F major (1.2s)
    bass(174, 1.2)
    ;[174, 220, 349, 440, 523].forEach(f => tone(f, 1.2, 0.7, 0.055))

    // Phase 4: G dominant (1.95s)
    bass(196, 1.94)
    ;[196, 247, 294, 392, 494].forEach(f => tone(f, 1.94, 0.6, 0.055))

    // Phase 5: BIG C major finale - full voiced, long sustain (2.58s)
    bass(130, 2.56)
    ;[130, 165, 196, 261, 330, 392, 523, 659, 784].forEach(f => tone(f, 2.56, 2.1, 0.042))

    // Phase 6: sparkle cascade on top of finale
    ;[1047, 1319, 1568, 2093, 2637].forEach((f, i) => tone(f, 2.56 + i * 0.11, 1.2 - i * 0.18, 0.038))

  } catch {}
}
