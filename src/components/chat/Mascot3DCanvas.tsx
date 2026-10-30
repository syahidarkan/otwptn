'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { MascotBee } from './MascotBee'

interface Mascot3DCanvasProps {
  className?: string
  interactive?: boolean
  mode?: 'bust' | 'full'
}

export default function Mascot3DCanvas({
  className = '',
  interactive = true,
  mode = 'bust',
}: Mascot3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let animationFrameId: number
    const width = container.clientWidth || 120
    const height = container.clientHeight || 120

    // Scene
    const scene = new THREE.Scene()

    // Camera setup based on view mode
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100)

    if (mode === 'bust') {
      // Focus on upper body, head, goggles, antennae, smile, and wings
      // Head center is y=2.05, goggles at y=2.45, antennae reach y=3.17
      camera.position.set(0, 2.22, 3.25)
      camera.lookAt(0, 2.20, 0)
    } else {
      // Full body view with grounded stage
      // Whole character spans y=0.0 to y=3.17, center is at y=1.58
      camera.position.set(0, 1.58, 5.2)
      camera.lookAt(0, 1.55, 0)
    }

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25

    container.appendChild(renderer.domElement)

    // Soft Stage Shadow Disc (prevents floating in void)
    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = 256
    shadowCanvas.height = 256
    const sCtx = shadowCanvas.getContext('2d') as CanvasRenderingContext2D
    const grad = sCtx.createRadialGradient(128, 128, 0, 128, 128, 120)
    grad.addColorStop(0, 'rgba(30, 20, 10, 0.28)')
    grad.addColorStop(0.5, 'rgba(30, 20, 10, 0.10)')
    grad.addColorStop(1, 'rgba(30, 20, 10, 0)')
    sCtx.fillStyle = grad
    sCtx.fillRect(0, 0, 256, 256)
    const shadowTex = new THREE.CanvasTexture(shadowCanvas)
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 1.8),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    )
    shadowPlane.rotation.x = -Math.PI / 2
    shadowPlane.position.y = 0.02
    scene.add(shadowPlane)

    // Studio Lights - Warm & crisp
    const ambientLight = new THREE.AmbientLight(0xfff8ed, 1.4)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xfffaee, 2.2)
    keyLight.position.set(3, 5, 4)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xffecd0, 1.2)
    fillLight.position.set(-3, 3, 2)
    scene.add(fillLight)

    // Vibrant sky-blue rim light to highlight translucent wings
    const rimLight = new THREE.DirectionalLight(0x72cef7, 1.8)
    rimLight.position.set(0, 3, -4)
    scene.add(rimLight)

    // Mascot 3D Model
    let bee: any = null
    try {
      bee = new MascotBee()
      bee.group.scale.set(1.0, 1.0, 1.0)
      bee.group.position.set(0, 0, 0)
      // Slight friendly 3/4 angle
      bee.group.rotation.y = 0.15
      scene.add(bee.group)
    } catch (err) {
      console.warn('Three.js mascot model failed to initialize:', err)
    }

    // Mouse tracking for subtle responsive glance
    let targetRotY = 0.15
    let targetRotX = 0
    let currentRotY = 0.15
    let currentRotX = 0

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      targetRotY = 0.15 + x * 0.35
      targetRotX = -y * 0.18
    }

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    // Resize handler
    const handleResize = () => {
      if (!container) return
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    // Clock
    const clock = new THREE.Clock()

    // Render loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      if (bee && typeof bee.update === 'function') {
        bee.update(elapsed)
      }

      // Smooth lerp to mouse look
      currentRotY += (targetRotY - currentRotY) * 0.08
      currentRotX += (targetRotX - currentRotX) * 0.08

      if (bee && bee.group) {
        bee.group.rotation.y = currentRotY
        bee.group.rotation.x = currentRotX
      }

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove)
      }
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [interactive])

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full overflow-hidden flex items-center justify-center pointer-events-none select-none ${className}`}
    />
  )
}
