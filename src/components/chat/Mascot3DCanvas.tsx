'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { MascotBee } from './MascotBee'

interface Mascot3DCanvasProps {
  className?: string
  interactive?: boolean
}

export default function Mascot3DCanvas({ className = '', interactive = true }: Mascot3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let animationFrameId: number
    const width = container.clientWidth || 320
    const height = container.clientHeight || 150

    // Scene
    const scene = new THREE.Scene()

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(0, 0.25, 4.2)
    camera.lookAt(0, 0.15, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15

    container.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xfffae5, 2.2)
    mainLight.position.set(3, 4, 3)
    scene.add(mainLight)

    const warmLight = new THREE.PointLight(0xffd400, 1.8, 10)
    warmLight.position.set(-2.5, 2, 2)
    scene.add(warmLight)

    const rimLight = new THREE.DirectionalLight(0x72cef7, 1.5)
    rimLight.position.set(0, 2, -3.5)
    scene.add(rimLight)

    // Mascot 3D
    let bee: any = null
    try {
      bee = new MascotBee()
      bee.group.scale.set(0.68, 0.68, 0.68)
      bee.group.position.set(0, -0.05, 0)
      // Subtle friendly initial 3/4 turn
      bee.group.rotation.y = 0.2
      scene.add(bee.group)
    } catch (err) {
      console.warn('Three.js mascot model failed to initialize:', err)
    }

    // Mouse tracking for subtle glance
    let targetRotY = 0.2
    let targetRotX = 0
    let currentRotY = 0.2
    let currentRotX = 0

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      targetRotY = 0.2 + x * 0.4
      targetRotX = -y * 0.2
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
