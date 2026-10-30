'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { MascotBee } from './MascotBeeModel'
import { Sparkles, X, MessageSquare, RotateCcw, Volume2, ChevronUp } from 'lucide-react'

const TIPS = [
  'Nilai rapor semester 1-5 kamu adalah aset paling berharga di SNBP! 🐝',
  'Pilihlah sertifikat yang linier dengan jurusan impianmu biar poinnya maksimal! ✨',
  'Esai motivasi jangan pakai klise "sejak kecil saya bercita-cita", ceritakan aksi nyatamu! 📝',
  'Yuk cek peluang kelulusanmu dengan Kalkulator Rapor AI otwptn! 🎯',
  'Butuh bimbingan privat 1-on-1? Ada mentor alumni UI, ITB, & UGM siap bantu! 🎓',
]

interface InteractiveOtbee3DProps {
  mode?: 'floating' | 'embedded'
  height?: number
  className?: string
}

export default function InteractiveOtbee3D({
  mode = 'floating',
  height = 280,
  className = '',
}: InteractiveOtbee3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    if (mode === 'floating' && !isOpen) return

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const width = container.clientWidth || 300
    const h = height || 280

    // Setup Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, h)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25

    // Scene
    const scene = new THREE.Scene()

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / h, 0.1, 50)
    camera.position.set(0, 1.45, 6.2)
    camera.lookAt(0, 1.45, 0)

    // Lighting (Warm Studio)
    const ambientLight = new THREE.AmbientLight(0xfff8ea, 1.1)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xfffaee, 2.2)
    keyLight.position.set(4, 7, 5)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.9)
    fillLight.position.set(-4, 3, -2)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xfef08a, 1.4)
    rimLight.position.set(0, 6, -5)
    scene.add(rimLight)

    // Mascot Instance
    let bee: any = null
    try {
      bee = new MascotBee()
      bee.group.position.set(0, 0, 0)
      scene.add(bee.group)
    } catch (e) {
      console.warn('Failed to initialize 3D mascot:', e)
    }

    // Interaction Variables
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0
    let targetRotY = 0
    let targetRotX = 0
    let curRotY = 0
    let curRotX = 0

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      prevMouseX = clientX
      prevMouseY = clientY
    }

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

      if (isDragging) {
        const deltaX = clientX - prevMouseX
        const deltaY = clientY - prevMouseY
        targetRotY += deltaX * 0.012
        targetRotX += deltaY * 0.008
        // Clamp vertical tilt
        targetRotX = Math.max(-0.4, Math.min(0.4, targetRotX))
        prevMouseX = clientX
        prevMouseY = clientY
      } else {
        // Subtle mouse tracking when not dragging
        const rect = container.getBoundingClientRect()
        const relX = (clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2)
        const relY = (clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2)
        targetRotY = relX * 0.35
        targetRotX = relY * 0.2
      }
    }

    const onPointerUp = () => {
      isDragging = false
    }

    canvas.addEventListener('mousedown', onPointerDown)
    canvas.addEventListener('touchstart', onPointerDown, { passive: true })
    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('touchmove', onPointerMove, { passive: true })
    window.addEventListener('mouseup', onPointerUp)
    window.addEventListener('touchend', onPointerUp)

    // Animation Loop
    let animId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      const elapsed = clock.getElapsedTime()

      if (bee) {
        bee.update(elapsed)
        // Smooth rotation damping
        curRotY += (targetRotY - curRotY) * 0.1
        curRotX += (targetRotX - curRotX) * 0.1
        bee.group.rotation.y = curRotY
        bee.group.rotation.x = curRotX
      }

      renderer.render(scene, camera)
    }

    animate()

    // Resize Observer
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const newW = entry.contentRect.width
        const newH = height || entry.contentRect.height
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH
          camera.updateProjectionMatrix()
          renderer.setSize(newW, newH)
        }
      }
    })
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animId)
      resizeObserver.disconnect()
      canvas.removeEventListener('mousedown', onPointerDown)
      canvas.removeEventListener('touchstart', onPointerDown)
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('touchmove', onPointerMove)
      window.removeEventListener('mouseup', onPointerUp)
      window.removeEventListener('touchend', onPointerUp)
      renderer.dispose()
    }
  }, [isClient, isOpen, mode, height])

  if (!isClient) return null

  // EMBEDDED MODE (e.g. inside Feature Section or Hero)
  if (mode === 'embedded') {
    return (
      <div
        ref={containerRef}
        className={`relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-amber-50/50 to-amber-100/30 border border-amber-200/60 shadow-inner flex flex-col items-center justify-center ${className}`}
        style={{ height }}
      >
        <canvas ref={canvasRef} className="cursor-grab active:cursor-grabbing w-full h-full" />
        <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-amber-900 border border-amber-200/50 shadow-2xs pointer-events-none flex items-center gap-1.5">
          <Sparkles size={12} className="text-amber-500" />
          <span>Interactive 3D Otbee</span>
        </div>
        <div className="absolute bottom-2 text-[10px] font-semibold text-amber-800/60 pointer-events-none">
          Geser / klik untuk memutar Otbee 3D
        </div>
      </div>
    )
  }

  // FLOATING COMPANION MODE (Discreet bottom-right widget)
  return (
    <aside aria-label="Otbee 3D Interactive Companion" className="fixed bottom-5 right-5 z-40 select-none">
      {isOpen ? (
        <div
          ref={containerRef}
          className="relative w-72 sm:w-80 rounded-3xl bg-white/95 backdrop-blur-xl border border-amber-200/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100 flex items-center justify-between border-b border-amber-200">
            <div className="flex items-center gap-2">
              <span className="text-base">🐝</span>
              <span className="text-xs font-black text-amber-950 tracking-wide">
                Otbee 3D Companion
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Tutup Otbee 3D"
              className="w-6 h-6 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-gray-800 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* 3D Canvas Area */}
          <div className="relative w-full h-56 bg-gradient-to-b from-sky-50/40 via-amber-50/20 to-white flex items-center justify-center">
            <canvas ref={canvasRef} className="cursor-grab active:cursor-grabbing w-full h-full" />
            <div className="absolute bottom-1.5 text-[10px] font-medium text-gray-400 pointer-events-none">
              Putar / drag Otbee dengan kursor
            </div>
          </div>

          {/* Speech Bubble / Tips */}
          <div className="p-3.5 bg-white border-t border-gray-100 flex flex-col gap-2.5">
            <div
              onClick={() => setTipIndex((tipIndex + 1) % TIPS.length)}
              className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200/70 text-xs font-semibold text-gray-800 leading-snug cursor-pointer hover:bg-amber-100/70 transition-colors flex items-start gap-2"
            >
              <Sparkles size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{TIPS[tipIndex]}</p>
                <span className="text-[10px] font-bold text-amber-700 block mt-1">
                  Klik untuk tips selanjutnya →
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/dashboard/ai"
                className="flex-1 py-2 px-3 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold text-center transition-all shadow-xs"
              >
                Chat Bareng Otbee
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="py-2 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold transition-all"
              >
                Minimize
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/95 hover:bg-white text-gray-900 shadow-xl border border-amber-300 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-sm shadow-inner group-hover:rotate-12 transition-transform">
            🐝
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-gray-900 leading-tight flex items-center gap-1">
              Otbee 3D Live
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </span>
            <span className="text-[10px] font-semibold text-amber-700 leading-tight">
              Sapa Teman Belajar
            </span>
          </div>
        </button>
      )}
    </aside>
  )
}
