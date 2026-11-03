'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import * as THREE from 'three'
import gsap from 'gsap'
import {
  Search,
  ArrowRight,
  Sparkles,
  Video,
  CheckCircle2,
  Calendar,
  MessageSquare,
  GraduationCap,
} from 'lucide-react'

const PTN_LOGOS = [
  { name: 'UI', src: '/ptn-logos/ui.png' },
  { name: 'ITB', src: '/ptn-logos/itb.png' },
  { name: 'UGM', src: '/ptn-logos/ugm.png' },
  { name: 'UNAIR', src: '/ptn-logos/unair.png' },
]

export default function CaraKerjaSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [searchQuery, setSearchQuery] = useState('Kedokteran UI')
  const [activeTab, setActiveTab] = useState<'snbp' | 'snbt' | 'mandiri'>('snbp')

  // Animated Search Query cycling
  useEffect(() => {
    const queries = [
      'Kedokteran UI',
      'Teknik Informatika ITB',
      'Ilmu Komunikasi UGM',
      'SBM ITB',
      'Kedokteran UNAIR',
      'Ilmu Komputer UI',
    ]
    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % queries.length
      setSearchQuery(queries[idx])
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  // Three.js Interactive 3D Canvas Background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
    camera.position.z = 24

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfffbeb, 0.9)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xf59e0b, 2.5, 50)
    pointLight.position.set(10, 10, 15)
    scene.add(pointLight)

    const secondaryLight = new THREE.PointLight(0x38bdf8, 1.8, 50)
    secondaryLight.position.set(-10, -10, 15)
    scene.add(secondaryLight)

    // Floating 3D Geometries (Golden Honeycomb Polyhedrons & Stars)
    const objects: THREE.Mesh[] = []
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.3,
      roughness: 0.25,
      transparent: true,
      opacity: 0.75,
    })

    const cyanMaterial = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.2,
      roughness: 0.3,
      transparent: true,
      opacity: 0.65,
    })

    const purpleMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      metalness: 0.3,
      roughness: 0.35,
      transparent: true,
      opacity: 0.65,
    })

    const geometries = [
      new THREE.IcosahedronGeometry(1.4, 0),
      new THREE.OctahedronGeometry(1.2, 0),
      new THREE.TorusGeometry(1.3, 0.45, 12, 24),
      new THREE.TetrahedronGeometry(1.5, 0),
      new THREE.DodecahedronGeometry(1.1, 0),
    ]

    const initialPositions = [
      { x: -14, y: 7, z: -5, mat: goldMaterial, speed: 0.008 },
      { x: 15, y: 6, z: -4, mat: purpleMaterial, speed: 0.006 },
      { x: -16, y: -7, z: -3, mat: cyanMaterial, speed: 0.007 },
      { x: 16, y: -8, z: -5, mat: goldMaterial, speed: 0.009 },
      { x: 0, y: 11, z: -8, mat: cyanMaterial, speed: 0.005 },
    ]

    initialPositions.forEach((pos, i) => {
      const geo = geometries[i % geometries.length]
      const mesh = new THREE.Mesh(geo, pos.mat)
      mesh.position.set(pos.x, pos.y, pos.z)
      scene.add(mesh)
      objects.push(mesh)
    })

    // Particle field
    const particleCount = 60
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 45
      particlePositions[i + 1] = (Math.random() - 0.5) * 30
      particlePositions[i + 2] = (Math.random() - 0.5) * 15
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.22,
      transparent: true,
      opacity: 0.5,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // Mouse parallax tracking
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas?.getBoundingClientRect()
      if (!rect) return
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Resize handler
    function handleResize() {
      if (!canvas) return
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    // Animation Loop
    let animationId: number
    let clock = new THREE.Clock()

    function animate() {
      animationId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      targetX += (mouseX - targetX) * 0.05
      targetY += (mouseY - targetY) * 0.05

      camera.position.x = targetX * 1.5
      camera.position.y = targetY * 1.2
      camera.lookAt(0, 0, 0)

      objects.forEach((obj, idx) => {
        obj.rotation.x += 0.005 + idx * 0.002
        obj.rotation.y += 0.007 + idx * 0.001
        obj.position.y += Math.sin(elapsed * 1.5 + idx) * 0.008
      })

      particles.rotation.y = elapsed * 0.02
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
    }
  }, [])

  // GSAP animations for mascots floating effect
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.mascot-step-1', {
        y: -10,
        rotation: 2,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
      gsap.to('.mascot-step-2', {
        y: -8,
        rotation: -2,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
      gsap.to('.mascot-step-3', {
        y: -12,
        rotation: 3,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30"
    >
      {/* Three.js 3D Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: 0.8 }}
      />

      {/* Campus Landmark Watermark Backdrop (Exact feel like Stanford / UI in screenshot) */}
      <div
        className="absolute inset-0 pointer-events-none select-none opacity-5 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: 'url(/rektorat-ui.jpeg)' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Top Header Badge */}
        <div className="text-center space-y-3 mb-14">
          <div className="inline-block">
            <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white text-gray-800 border border-gray-300 shadow-2xs">
              Cara Kerja
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight leading-tight">
            Masuk Ke Kampus PTN Impian Jadi{' '}
            <span className="inline-block px-3.5 py-0.5 rounded-2xl bg-[#bbf7d0] text-emerald-950 shadow-2xs">
              Lebih Gampang!
            </span>
          </h2>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto font-medium">
            Hanya dalam 3 langkah sederhana, kamu bisa mulai perjalanan menuju kampus impianmu!
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-6 lg:gap-8 items-stretch relative">
          {/* STEP 1: PILIH MENTOR */}
          <div className="flex flex-col items-center">
            {/* Step Number Badge */}
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white font-black text-base flex items-center justify-center shadow-md mb-4 z-10">
              1
            </div>

            {/* Step 1 Card Body */}
            <div className="w-full rounded-3xl p-5 bg-white/95 backdrop-blur-md border border-rose-200/90 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col flex-1 relative group">
              {/* Mascot Floating Beside Step 1 */}
              <div className="absolute -top-12 -right-6 pointer-events-none select-none z-20 mascot-step-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/mascot-hd/map-pointing.png"
                  alt="Otbee Navigator"
                  className="w-16 h-auto drop-shadow-md"
                />
              </div>

              {/* Mock Search Bar */}
              <div className="mb-4">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 shadow-2xs">
                  <Search size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="font-semibold truncate text-gray-900">{searchQuery}</span>
                </div>
              </div>

              {/* Mentor Profile Preview */}
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                    alt="Mentor Chloe Rahmawati"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Alumni UI
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-gray-950">Chloe Rahmawati</h3>
                  <p className="text-xs text-gray-600 font-semibold">
                    Ilmu Komputer · Universitas Indonesia
                  </p>
                </div>

                {/* Achievements Bullet List */}
                <ul className="text-[11px] text-gray-600 space-y-1 list-disc list-inside font-medium leading-relaxed">
                  <li>Medali Emas Puspresnas OSN 2024</li>
                  <li>Parlemen Remaja Nasional 2023</li>
                  <li>Top 1% Skor UTBK SNBT & Lolos SNBP</li>
                </ul>

                {/* Target PTN Tags & Logos */}
                <div className="pt-2 mt-auto space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {['UI', 'ITB', 'UGM', 'UNAIR'].map(p => (
                      <span
                        key={p}
                        className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 text-[10px] font-bold border border-rose-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {PTN_LOGOS.map(logo => (
                      <div
                        key={logo.name}
                        className="w-6 h-6 rounded-full bg-white border border-gray-200 p-0.5 flex items-center justify-center shadow-2xs"
                        title={logo.name}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logo.src} alt={logo.name} className="w-full h-full object-contain" />
                      </div>
                    ))}
                    <span className="text-[10px] text-gray-400 font-bold">+12 PTN</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Label Pill */}
            <div className="mt-4">
              <span className="px-4 py-2 rounded-full bg-white text-xs font-bold text-gray-800 border border-gray-200 shadow-2xs inline-block">
                Pilih mentor yang sesuai dengan kamu
              </span>
            </div>
          </div>

          {/* STEP 2: TULIS CATATAN */}
          <div className="flex flex-col items-center">
            {/* Step Number Badge */}
            <div className="w-10 h-10 rounded-full bg-cyan-500 text-white font-black text-base flex items-center justify-center shadow-md mb-4 z-10">
              2
            </div>

            {/* Step 2 Card Body */}
            <div className="w-full rounded-3xl p-5 bg-white/95 backdrop-blur-md border border-cyan-200/90 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col flex-1 relative group">
              {/* Mascot Floating Beside Step 2 */}
              <div className="absolute -top-12 -right-4 pointer-events-none select-none z-20 mascot-step-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/mascot-hd/glasses-writing-desk.png"
                  alt="Otbee Writing Notes"
                  className="w-16 h-auto drop-shadow-md"
                />
              </div>

              {/* Note Header */}
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
                <span className="text-base">📝</span>
                <span className="text-xs font-black uppercase tracking-wider text-cyan-950">
                  Catatan Target & Kebutuhan Kamu
                </span>
              </div>

              {/* Note Body Text with Lined Pad Styling */}
              <div className="p-4 rounded-2xl bg-cyan-50/40 border border-cyan-100/80 text-xs sm:text-sm text-gray-700 leading-relaxed font-medium space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-justify leading-relaxed">
                  &ldquo;Halo Kak! Aku ingin masuk ke Fasilkom UI atau Teknik Informatika ITB lewat SNBP atau SNBT. Nilai raporku rata-rata 92.5, tapi aku masih bingung menyusun esai motivasi diri dan memilih sertifikat yang punya bobot tertinggi di mata panitia penerimaan kampus. Butuh bimbingan 1-on-1 langsung dari alumni yang pernah lolos.&rdquo;
                </p>

                <div className="pt-3 border-t border-cyan-200/50 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-cyan-900">
                    <span>Target SNBP 2026:</span>
                    <span className="text-emerald-700">Eligible Siswa #3</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-white text-cyan-800 text-[10px] font-bold border border-cyan-200 shadow-2xs">
                      Bedah Esai
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white text-cyan-800 text-[10px] font-bold border border-cyan-200 shadow-2xs">
                      Review Portofolio
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white text-cyan-800 text-[10px] font-bold border border-cyan-200 shadow-2xs">
                      Simulasi Wawancara
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Label Pill */}
            <div className="mt-4">
              <span className="px-4 py-2 rounded-full bg-white text-xs font-bold text-gray-800 border border-gray-200 shadow-2xs inline-block">
                Tulis catatan agar mentor tau tentang kamu
              </span>
            </div>
          </div>

          {/* STEP 3: KETEMU DENGAN MENTOR */}
          <div className="flex flex-col items-center">
            {/* Step Number Badge */}
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-black text-base flex items-center justify-center shadow-md mb-4 z-10">
              3
            </div>

            {/* Step 3 Card Body */}
            <div className="w-full rounded-3xl p-5 bg-white/95 backdrop-blur-md border border-purple-200/90 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col flex-1 relative group">
              {/* Mascot Floating Beside Step 3 */}
              <div className="absolute -top-12 -right-4 pointer-events-none select-none z-20 mascot-step-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/mascot-hd/video-call-match.png"
                  alt="Otbee Live Call"
                  className="w-16 h-auto drop-shadow-md"
                />
              </div>

              {/* Live Video Mockup Container */}
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-purple-300 shadow-md flex-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
                    alt="Live Mentoring Google Meet"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Live Session Badge at top left */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-black text-white flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>Live 1-on-1 Session</span>
                  </div>

                  {/* Student Picture-in-Picture in bottom right corner */}
                  <div className="absolute bottom-2.5 right-2.5 w-20 h-16 rounded-xl overflow-hidden border-2 border-white shadow-lg bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80"
                      alt="Student Waving"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-white font-bold text-center py-0.5">
                      Kamu
                    </div>
                  </div>
                </div>

                {/* Session Features / Highlights */}
                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-950">
                    <Video size={14} className="text-purple-600" />
                    <span>Sesi Interaktif Google Meet 45 Menit</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug">
                    Tanya jawab langsung, koreksi draf esai kalimat per kalimat, dan bedah peluang lolos jurusan pilihanmu.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Label Pill */}
            <div className="mt-4">
              <span className="px-4 py-2 rounded-full bg-white text-xs font-bold text-gray-800 border border-gray-200 shadow-2xs inline-block">
                Ketemu dengan mentor dan dapatkan bimbingan
              </span>
            </div>
          </div>
        </div>

        {/* Bottom CTA Button (Exact purple/dark pill CTA as in screenshot) */}
        <div className="mt-14 text-center">
          <Link
            href="/mentor"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-sm font-black bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span>Lihat Pilihan Mentor Alumni</span>
            <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-gray-500 font-semibold mt-2.5">
            Tersedia mentor resmi dari UI, ITB, UGM, UNAIR, ITS, dan kampus top lainnya.
          </p>
        </div>
      </div>
    </section>
  )
}
