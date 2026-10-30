'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Creates a soft radial glow canvas texture - makes THREE.Points render as
// round glowing stars instead of the default squares.
// Fill the whole texture square with a radial gradient - no arc() clip
// so particles render as soft glowing discs, not donuts.
function makeGlowTex(centerRgba: string, midRgba: string) {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2
  const grd = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx)
  grd.addColorStop(0,    centerRgba)
  grd.addColorStop(0.45, midRgba)
  grd.addColorStop(1,    'rgba(0,0,0,0)')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, size, size)  // soft fade, no hard edge
  return new THREE.CanvasTexture(canvas)
}

export default function ParticleField() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100)
    camera.position.z = 18

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const starTex  = makeGlowTex('rgba(255,255,255,1)', 'rgba(255,212,0,0.5)')
    const bokehTex = makeGlowTex('rgba(255,255,255,1)', 'rgba(255,255,200,0.3)')

    // Main gold star cloud
    const COUNT = 220
    const positions = new Float32Array(COUNT * 3)
    const speeds    = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 32
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
      speeds[i] = 0.15 + Math.random() * 0.35
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const material = new THREE.PointsMaterial({
      map: starTex,
      color: new THREE.Color('#ffd400'),
      size: 0.42,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
    const points = new THREE.Points(geometry, material)
    scene.add(points)

    // Larger soft bokeh glows (white)
    const bokehCount = 28
    const bokehPos = new Float32Array(bokehCount * 3)
    for (let i = 0; i < bokehCount; i++) {
      bokehPos[i * 3]     = (Math.random() - 0.5) * 34
      bokehPos[i * 3 + 1] = (Math.random() - 0.5) * 22
      bokehPos[i * 3 + 2] = (Math.random() - 0.5) * 18
    }
    const bokehGeo = new THREE.BufferGeometry()
    bokehGeo.setAttribute('position', new THREE.BufferAttribute(bokehPos, 3))
    const bokehMat = new THREE.PointsMaterial({
      map: bokehTex,
      color: new THREE.Color('#ffffff'),
      size: 1.2,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
    const bokeh = new THREE.Points(bokehGeo, bokehMat)
    scene.add(bokeh)

    let raf = 0
    const clock = new THREE.Clock()

    function animate() {
      const t = clock.getElapsedTime()
      points.rotation.y = t * 0.02
      points.rotation.x = Math.sin(t * 0.05) * 0.05
      bokeh.rotation.y = -t * 0.015

      const posAttr = geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < COUNT; i++) {
        (posAttr.array as Float32Array)[i * 3 + 1] += Math.sin(t * speeds[i] + i) * 0.0009
      }
      posAttr.needsUpdate = true

      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    function onResize() {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      geometry.dispose(); material.dispose(); starTex.dispose()
      bokehGeo.dispose(); bokehMat.dispose(); bokehTex.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} aria-hidden />
  )
}
