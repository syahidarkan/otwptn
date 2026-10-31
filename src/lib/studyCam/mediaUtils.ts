// Utility to acquire user media safely across all devices (Mac, Windows, iOS, Android)
// Bypasses driver constraint incompatibilities (e.g. OverconstrainedError on Windows webcams with facingMode)

export interface SafeMediaResult {
  stream: MediaStream | null
  hasVideo: boolean
  hasAudio: boolean
  errorMessage?: string
}

export async function getSafeMediaStream(): Promise<SafeMediaResult> {
  if (typeof window === 'undefined') {
    return { stream: null, hasVideo: false, hasAudio: false }
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      stream: null,
      hasVideo: false,
      hasAudio: false,
      errorMessage: 'Browser tidak mendukung akses kamera/mikrofon. Gunakan koneksi HTTPS atau browser Chrome/Safari/Edge terbaru.',
    }
  }

  // Tier 1: Relaxed resolution constraints without rigid facingMode (prevents OverconstrainedError on Windows laptops)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 },
        frameRate: { ideal: 24, max: 30 },
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    })
    return {
      stream,
      hasVideo: stream.getVideoTracks().length > 0,
      hasAudio: stream.getAudioTracks().length > 0,
    }
  } catch (err1) {
    console.warn('[StudyCam Media] Tier 1 getUserMedia failed, attempting Tier 2:', err1)
  }

  // Tier 2: Pure boolean constraints (bypasses any driver constraint issues)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    return {
      stream,
      hasVideo: stream.getVideoTracks().length > 0,
      hasAudio: stream.getAudioTracks().length > 0,
    }
  } catch (err2) {
    console.warn('[StudyCam Media] Tier 2 getUserMedia failed, attempting Tier 3 (video only):', err2)
  }

  // Tier 3: Video only (in case microphone is in use by another app or disabled by Windows privacy)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    })
    return {
      stream,
      hasVideo: true,
      hasAudio: false,
    }
  } catch (err3) {
    console.warn('[StudyCam Media] Tier 3 getUserMedia failed, attempting Tier 4 (audio only):', err3)
  }

  // Tier 4: Audio only (in case webcam is in use, blocked, or not present)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    })
    return {
      stream,
      hasVideo: false,
      hasAudio: true,
    }
  } catch (err4) {
    console.error('[StudyCam Media] All getUserMedia tiers failed:', err4)
    return {
      stream: null,
      hasVideo: false,
      hasAudio: false,
      errorMessage: 'Kamera dan mikrofon tidak dapat diakses. Pastikan izin kamera/mic aktif di browser dan pengaturan privasi Windows / macOS kamu.',
    }
  }
}
