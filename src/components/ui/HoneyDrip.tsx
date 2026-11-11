'use client'

import { forwardRef, useEffect, useRef } from 'react'

interface HoneyDripProps {
  mode?: 'separator' | 'fullscreen'
  className?: string
  height?: number
}

interface DripDef { cx: number; hw: number; len: number }

const BRIDGE_H = 35

function honeyBottomPath(drips: DripDef[], W = 1200, yOffset = 0): string {
  const sorted = [...drips].sort((a, b) => a.cx - b.cx)
  const parts: string[] = [`M 0 ${yOffset}`]
  for (const { cx, hw, len } of sorted) {
    const nw = hw * 0.38
    const ny = yOffset + len * 0.27
    const bw = hw * 0.92
    const by = yOffset + len * 0.65
    const tr = hw * 0.11
    const tipY = yOffset + len
    parts.push(
      `L ${cx - hw} ${yOffset}`,
      `C ${cx-hw} ${yOffset+len*0.06} ${cx-nw} ${ny-len*0.03} ${cx-nw} ${ny}`,
      `C ${cx-nw} ${ny+(by-ny)*0.55} ${cx-bw} ${by-5} ${cx-bw} ${by}`,
      `C ${cx-bw} ${tipY-(tipY-by)*0.20} ${cx-tr} ${tipY-3} ${cx} ${tipY}`,
      `C ${cx+tr} ${tipY-3} ${cx+bw} ${tipY-(tipY-by)*0.20} ${cx+bw} ${by}`,
      `C ${cx+bw} ${by-5} ${cx+nw} ${ny+(by-ny)*0.55} ${cx+nw} ${ny}`,
      `C ${cx+nw} ${ny-len*0.03} ${cx+hw} ${yOffset+len*0.06} ${cx+hw} ${yOffset}`,
    )
  }
  parts.push(`L ${W} ${yOffset}`, 'Z')
  return parts.join(' ')
}

const SEP_DRIPS: DripDef[] = [
  { cx: 4,  hw: 3.5, len: 50 }, { cx: 13, hw: 2.6, len: 34 },
  { cx: 22, hw: 4.2, len: 65 }, { cx: 32, hw: 3.0, len: 40 },
  { cx: 41, hw: 3.6, len: 58 }, { cx: 50, hw: 4.8, len: 76 },
  { cx: 60, hw: 2.8, len: 32 }, { cx: 69, hw: 4.0, len: 63 },
  { cx: 78, hw: 3.2, len: 44 }, { cx: 87, hw: 3.8, len: 68 },
  { cx: 94, hw: 2.6, len: 38 }, { cx: 98, hw: 3.0, len: 52 },
]
const SEP_BOTTOM_PATH = honeyBottomPath(SEP_DRIPS, 100, 4)

const FULL_DRIPS: DripDef[] = [
  { cx: 54,   hw: 50, len: 128 },
  { cx: 150,  hw: 44, len: 150 },
  { cx: 250,  hw: 52, len: 164 },
  { cx: 352,  hw: 46, len: 136 },
  { cx: 452,  hw: 50, len: 156 },
  { cx: 548,  hw: 44, len: 122 },
  { cx: 648,  hw: 54, len: 168 },
  { cx: 752,  hw: 46, len: 142 },
  { cx: 852,  hw: 50, len: 158 },
  { cx: 950,  hw: 44, len: 126 },
  { cx: 1050, hw: 52, len: 148 },
  { cx: 1150, hw: 48, len: 136 },
]
const FULL_BOTTOM_PATH = honeyBottomPath(FULL_DRIPS, 1200, BRIDGE_H)

export default function HoneyDrip({ mode = 'separator', className = '', height = 90 }: HoneyDripProps) {
  if (mode === 'fullscreen') return null
  return (
    <div className={`relative w-full overflow-hidden pointer-events-none select-none ${className}`} style={{ height }} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"
        style={{ position: 'absolute', inset: 0, display: 'block', animation: 'sep-reveal 1s cubic-bezier(0.4,0,0.2,1) both' }}>
        <defs>
          <style>{`@keyframes sep-reveal{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 0 0)}}`}</style>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#d97706" />
            <stop offset="45%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="4"  fill="#d97706" />
        <rect x="0" y="0" width="100" height="2"  fill="rgba(255,255,255,0.3)" />
        <path d={SEP_BOTTOM_PATH} fill="url(#sg)" />
      </svg>
    </div>
  )
}

export const HONEY_DRIP_H = 170
const HONEY_VB_H = BRIDGE_H + 168

export const HoneyOverlay = forwardRef<
  HTMLDivElement,
  {
    videoRef?: React.Ref<HTMLVideoElement | null>
    onEnded?: () => void
    onTimeUpdate?: (time: number) => void
  }
>(
  function HoneyOverlay({ videoRef, onEnded, onTimeUpdate }, ref) {
    const internalVideoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const onEndedRef = useRef(onEnded)
    const onTimeUpdateRef = useRef(onTimeUpdate)
    onEndedRef.current = onEnded
    onTimeUpdateRef.current = onTimeUpdate

    useEffect(() => {
      const video = internalVideoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return

      let gl: WebGLRenderingContext | null = null
      let program: WebGLProgram | null = null
      let texture: WebGLTexture | null = null
      let buffer: WebGLBuffer | null = null
      let uScaleLoc: WebGLUniformLocation | null = null
      let uOffsetLoc: WebGLUniformLocation | null = null
      let rafId = 0
      let rvfcId = 0
      let isDrawing = false

      try {
        gl = (canvas.getContext('webgl', {
          alpha: true,
          premultipliedAlpha: true,
          antialias: true,
        }) || canvas.getContext('experimental-webgl', {
          alpha: true,
          premultipliedAlpha: true,
        })) as WebGLRenderingContext | null
      } catch {
        gl = null
      }

      if (gl) {
        const vsSource = `
          attribute vec2 a_pos;
          varying vec2 v_uv;
          uniform vec2 u_scale;
          uniform vec2 u_offset;
          void main() {
            gl_Position = vec4(a_pos, 0.0, 1.0);
            vec2 uv = (a_pos + 1.0) * 0.5;
            uv.y = 1.0 - uv.y;
            v_uv = uv * u_scale + u_offset;
          }
        `
        const fsSource = `
          precision mediump float;
          uniform sampler2D u_tex;
          varying vec2 v_uv;
          void main() {
            if (v_uv.x < 0.0 || v_uv.x > 1.0 || v_uv.y < 0.0 || v_uv.y > 1.0) {
              gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
              return;
            }
            vec4 c = texture2D(u_tex, v_uv);
            float minC = min(min(c.r, c.g), c.b);
            float t = clamp((minC - 0.75) / (0.92 - 0.75), 0.0, 1.0);
            float a = 1.0 - (t * t * (3.0 - 2.0 * t));
            if (a <= 0.002) {
              gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
              return;
            }
            vec3 unblended = clamp((c.rgb - vec3(1.0 - a)) / max(a, 0.04), 0.0, 1.0);
            gl_FragColor = vec4(unblended * a, a);
          }
        `

        const createShader = (glCtx: WebGLRenderingContext, type: number, source: string) => {
          const s = glCtx.createShader(type)
          if (!s) return null
          glCtx.shaderSource(s, source)
          glCtx.compileShader(s)
          if (!glCtx.getShaderParameter(s, glCtx.COMPILE_STATUS)) {
            glCtx.deleteShader(s)
            return null
          }
          return s
        }

        const vs = createShader(gl, gl.VERTEX_SHADER, vsSource)
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource)
        if (vs && fs) {
          program = gl.createProgram()
          if (program) {
            gl.attachShader(program, vs)
            gl.attachShader(program, fs)
            gl.linkProgram(program)
            if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
              gl.useProgram(program)
              uScaleLoc = gl.getUniformLocation(program, 'u_scale')
              uOffsetLoc = gl.getUniformLocation(program, 'u_offset')
              const aPosLoc = gl.getAttribLocation(program, 'a_pos')

              buffer = gl.createBuffer()
              gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
              const vertices = new Float32Array([
                -1, -1,
                 1, -1,
                -1,  1,
                 1,  1,
              ])
              gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
              gl.enableVertexAttribArray(aPosLoc)
              gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0)

              texture = gl.createTexture()
              gl.bindTexture(gl.TEXTURE_2D, texture)
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

              gl.enable(gl.BLEND)
              gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
            }
          }
        }
      }

      function drawCurrentFrame() {
        if (!video || !canvas) return
        if (video.readyState < 2) return

        // Fixed internal render buffer (1280x720) to ensure lightning-fast WebGL rendering with zero memory thrashing
        if (canvas.width !== 1280 || canvas.height !== 720) {
          canvas.width = 1280
          canvas.height = 720
        }

        if (gl && program && texture) {
          gl.viewport(0, 0, 1280, 720)
          gl.useProgram(program)

          if (uScaleLoc) gl.uniform2f(uScaleLoc, 1.0, 1.0)
          if (uOffsetLoc) gl.uniform2f(uOffsetLoc, 0.0, 0.0)

          gl.bindTexture(gl.TEXTURE_2D, texture)
          try {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
            gl.clearColor(0, 0, 0, 0)
            gl.clear(gl.COLOR_BUFFER_BIT)
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
          } catch {}
        } else {
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.clearRect(0, 0, 1280, 720)
            ctx.drawImage(video, 0, 0, 1280, 720)
            try {
              const imgData = ctx.getImageData(0, 0, 1280, 720)
              const data = imgData.data
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i]
                const g = data[i + 1]
                const b = data[i + 2]
                const minC = Math.min(r, g, b)
                if (minC > 235) {
                  data[i + 3] = 0
                } else if (minC > 195) {
                  const a = (235 - minC) / 40
                  data[i + 3] = Math.round(data[i + 3] * a)
                }
              }
              ctx.putImageData(imgData, 0, 0)
            } catch {}
          }
        }
      }

      function scheduleNextFrame() {
        if (!isDrawing) return
        if ('requestVideoFrameCallback' in HTMLVideoElement.prototype && video) {
          // Cast to any for requestVideoFrameCallback support
          const v = video as unknown as { requestVideoFrameCallback?: (cb: () => void) => number }
          if (typeof v.requestVideoFrameCallback === 'function') {
            rvfcId = v.requestVideoFrameCallback(() => {
              drawCurrentFrame()
              handleTimeUpdate()
              scheduleNextFrame()
            })
            return
          }
        }
        rafId = requestAnimationFrame(() => {
          drawCurrentFrame()
          handleTimeUpdate()
          scheduleNextFrame()
        })
      }

      function startLoop() {
        if (isDrawing) return
        isDrawing = true
        drawCurrentFrame()
        scheduleNextFrame()
      }

      function stopLoop(clear = false) {
        isDrawing = false
        if (rafId) {
          cancelAnimationFrame(rafId)
          rafId = 0
        }
        if (rvfcId && video) {
          const v = video as unknown as { cancelVideoFrameCallback?: (id: number) => void }
          if (typeof v.cancelVideoFrameCallback === 'function') {
            try { v.cancelVideoFrameCallback(rvfcId) } catch {}
          }
          rvfcId = 0
        }
        if (clear) {
          if (gl) {
            gl.clearColor(0, 0, 0, 0)
            gl.clear(gl.COLOR_BUFFER_BIT)
          } else {
            const ctx = canvas?.getContext('2d')
            if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height)
          }
        }
      }

      function handleTimeUpdate() {
        if (onTimeUpdateRef.current && video) {
          onTimeUpdateRef.current(video.currentTime)
        }
      }

      function handleEnded() {
        if (onEndedRef.current) {
          onEndedRef.current()
        }
      }

      function handleSeeked() {
        if (isDrawing) {
          drawCurrentFrame()
        }
      }

      video.addEventListener('play', startLoop)
      video.addEventListener('playing', startLoop)
      video.addEventListener('canplay', drawCurrentFrame)
      video.addEventListener('loadeddata', drawCurrentFrame)
      video.addEventListener('pause', () => stopLoop(false))
      video.addEventListener('ended', () => stopLoop(false))
      video.addEventListener('ended', handleEnded)
      video.addEventListener('timeupdate', handleTimeUpdate)
      video.addEventListener('seeked', handleSeeked)

      if (!video.paused && !video.ended) {
        startLoop()
      }

      return () => {
        stopLoop(true)
        video.removeEventListener('play', startLoop)
        video.removeEventListener('playing', startLoop)
        video.removeEventListener('canplay', drawCurrentFrame)
        video.removeEventListener('loadeddata', drawCurrentFrame)
        video.removeEventListener('ended', handleEnded)
        video.removeEventListener('timeupdate', handleTimeUpdate)
        video.removeEventListener('seeked', handleSeeked)
        if (gl && buffer) gl.deleteBuffer(buffer)
        if (gl && texture) gl.deleteTexture(texture)
        if (gl && program) gl.deleteProgram(program)
      }
    }, [])

    return (
      <div
        ref={ref}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2147483647,
          pointerEvents: 'none',
          userSelect: 'none',
          visibility: 'hidden',
          opacity: 0,
          transition: 'opacity 220ms cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'transparent',
        }}
      >
        <video
          ref={(node) => {
            internalVideoRef.current = node
            if (!videoRef) return
            if (typeof videoRef === 'function') {
              videoRef(node)
            } else if ('current' in videoRef) {
              ;(videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node
            }
          }}
          src="/honey-fast.mp4"
          playsInline
          muted
          preload="auto"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1px',
            height: '1px',
            opacity: 0.01,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            pointerEvents: 'none',
          }}
        />
      </div>
    )
  }
)
