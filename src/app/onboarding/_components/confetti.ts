// Lightweight canvas confetti burst — no external deps.
// Spawns a temporary full-viewport canvas, animates particles with gravity, then cleans itself up.

const COLORS = ['#ffd400', '#f0c700', '#111111', '#ffffff', '#fde68a']

interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number
  color: string
  rotation: number
  vr: number
  life: number
}

export function fireConfetti(originXRatio = 0.5, originYRatio = 0.5, count = 90) {
  if (typeof window === 'undefined') return

  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.inset = '0'
  canvas.style.width = '100vw'
  canvas.style.height = '100vh'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '9999'
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) { canvas.remove(); return }
  ctx.scale(dpr, dpr)

  const originX = window.innerWidth * originXRatio
  const originY = window.innerHeight * originYRatio

  const particles: Particle[] = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 4 + Math.random() * 9
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 5 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      vr: (Math.random() - 0.5) * 20,
      life: 1,
    }
  })

  let raf: number
  const gravity = 0.22
  const drag = 0.985

  function tick() {
    if (!ctx) return
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    let alive = false

    for (const p of particles) {
      if (p.life <= 0) continue
      p.vx *= drag
      p.vy = p.vy * drag + gravity
      p.x += p.vx
      p.y += p.vy
      p.rotation += p.vr
      p.life -= 0.012

      if (p.life > 0) {
        alive = true
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = Math.max(p.life, 0)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        ctx.restore()
      }
    }

    if (alive) {
      raf = requestAnimationFrame(tick)
    } else {
      cancelAnimationFrame(raf)
      canvas.remove()
    }
  }

  raf = requestAnimationFrame(tick)
}
