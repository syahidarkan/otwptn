'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import OtbeeMascot from './OtbeeMascot'
import { getMascotConfigForPath } from './mascotPageConfig'

const TOOLTIP_MESSAGES: Record<string, string> = {
  '/': 'Hai! Semangat menuju PTN impianmu! 🐝',
  '/dashboard': 'Selamat datang! Yuk belajar hari ini! 🎉',
  '/dashboard/essay': 'Tulis essay terbaikmu ya! ✍️',
  '/dashboard/kalkulator': 'Hitung peluangmu lolos PTN! 📊',
  '/dashboard/otbee': 'AI siap membantumu belajar! 🤖',
  '/dashboard/mentor': 'Mentor alumni siap memandumu! 🎓',
  '/dashboard/teman': 'Temukan teman belajarmu! 👫',
  '/dashboard/komunitas': 'Bergabung bersama komunitas! 📣',
  '/dashboard/tracking-jalur': 'Pantau jalur masuk PTN-mu! 🗺️',
  '/dashboard/latihan': 'Latihan soal bikin makin jago! 💪',
  '/dashboard/ecourse': 'Video materi lengkap tersedia! 📱',
  '/login': 'Masuk dulu yuk! 🚪',
  '/register': 'Daftar dan mulai perjalananmu! 🚀',
}

const SLIDE_IN_KEYFRAMES = `
@keyframes otbee-float-slide-in {
  0% { transform: translateY(80px) scale(0.6); opacity: 0; }
  60% { transform: translateY(-10px) scale(1.05); opacity: 1; }
  80% { transform: translateY(4px) scale(0.98); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
@keyframes otbee-tooltip-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
`

export default function FloatingMascot() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)
  const prevPathRef = useRef<string>(pathname)

  // Hide on essay paths
  const isHidden = pathname.startsWith('/dashboard/essay')

  // Page config
  const mascotCfg = getMascotConfigForPath(pathname)

  const tooltip = TOOLTIP_MESSAGES[pathname] ?? 'Semangat terus ya! 🐝'

  useEffect(() => {
    setMounted(true)
    // Slide in after 400ms on first load
    const t = setTimeout(() => setVisible(true), 400)
    return () => clearTimeout(t)
  }, [])

  // When path changes, briefly hide then show new pose
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname
      setVisible(false)
      const t = setTimeout(() => setVisible(true), 300)
      return () => clearTimeout(t)
    }
  }, [pathname])

  if (!mounted || isHidden) return null

  return (
    <>
      <style>{SLIDE_IN_KEYFRAMES}</style>
      <div
        className="hidden md:block"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 25,
          transition: 'opacity 0.3s ease',
          opacity: visible ? 1 : 0,
          animation: visible ? 'otbee-float-slide-in 0.7s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Tooltip */}
        {hovered && (
          <div
            role="tooltip"
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '8px',
              background: 'rgba(30,20,0,0.88)',
              color: '#fde68a',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: '999px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              animation: 'otbee-tooltip-fade-in 0.18s ease both',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              letterSpacing: '0.01em',
            }}
          >
            {tooltip}
            <span
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid rgba(30,20,0,0.88)',
              }}
            />
          </div>
        )}

        <OtbeeMascot
          pose={mascotCfg.pose}
          animation={mascotCfg.animation}
          size={90}
          style={{
            filter: hovered ? 'drop-shadow(0 4px 12px rgba(245,158,11,0.5))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))',
            transition: 'filter 0.2s ease, transform 0.2s ease',
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
          }}
        />
      </div>
    </>
  )
}
