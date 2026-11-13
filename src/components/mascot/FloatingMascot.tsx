'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import OtbeeMascot, { OtbeeAnimation } from './OtbeeMascot'
import { getMascotConfigForPath } from './mascotPageConfig'
import { useOtbeeMascot } from './OtbeeMascotContext'

const PTN_TIPS = [
  'Rasionalisasi nilai rapor semester 1-5 mempertimbangkan tren konsistensi lho! 📈',
  'Di jalur prestasi & mandiri, susun sertifikat dari tingkat tertinggi ke bawah! 🏅',
  'Esai motivasi jangan klise! Pakai metode STAR (Situation, Task, Action, Result) ya! ✍️',
  'Kekuatan akreditasi sekolah & kuota alumni PTN sangat berpengaruh di SNBP! 🏫',
  'Pastikan mata pelajaran pendukung pilihan prodimum nilainya unggul! 🎯',
  'Punya sertifikat OSN/O2SN/FLS2N? Peluang lolos jalur prestasi meningkat drastis! 🌟',
  'Selalu siapkan plan cadangan di pilihan ke-2 dengan passing grade rasional! 💡',
  'Keren banget belajarnya hari ini! Istirahat cukup juga kunci sukses lho! 🐝',
  'Sering latihan kata baku PUEBI di menu Latihan yuk! 📚',
  'Konsultasikan draft esaimu ke Mentor Alumni sebelum submit final ya! 🎓',
]

const CLICK_REACTIONS = [
  { text: 'Mantap! Gaspol! 🔥', pose: 'maskot-jempol-rekomendasi', animation: 'bounce' as OtbeeAnimation },
  { text: 'Keren! Terus maju! ⭐', pose: 'maskot-lolos-ptn-loncat', animation: 'celebrate' as OtbeeAnimation },
  { text: 'Sip! Otw Kampus Impian! 🎓', pose: 'maskot-kedip-centang-oke', animation: 'jump' as OtbeeAnimation },
  { text: 'Aksi tercatat! 🚀', pose: 'maskot-bintang-cemerlang', animation: 'wave' as OtbeeAnimation },
]

export default function FloatingMascot() {
  const pathname = usePathname()
  const { config: contextConfig } = useOtbeeMascot()
  const [mounted, setMounted] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)
  const [sparkles, setSparkles] = useState(false)

  // Current active pose & animation (can be page-default, reaction, or idle)
  const defaultPageCfg = getMascotConfigForPath(pathname)
  const [currentPose, setCurrentPose] = useState(defaultPageCfg.pose)
  const [currentAnim, setCurrentAnim] = useState<OtbeeAnimation>(defaultPageCfg.animation)
  const [speechText, setSpeechText] = useState<string | null>(null)
  const [isReacting, setIsReacting] = useState(false)

  const reactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleStateRef = useRef<number>(0) // 0: active, 1: looking, 2: reading, 3: sleep

  // Hide on essay editor workspace or admin pages to avoid blocking work area
  const isHidden = pathname?.startsWith('/dashboard/essay/') || pathname?.startsWith('/admin')

  // Synchronize on route changes
  useEffect(() => {
    const cfg = getMascotConfigForPath(pathname)
    setCurrentPose(cfg.pose)
    setCurrentAnim(cfg.animation)
    setSpeechText(null)
    setIsReacting(false)
  }, [pathname])

  // Context config override
  useEffect(() => {
    if (contextConfig.pose) setCurrentPose(contextConfig.pose)
    if (contextConfig.animation) setCurrentAnim(contextConfig.animation)
  }, [contextConfig])

  // Mount animation
  useEffect(() => {
    setMounted(true)
    const t = setTimeout(() => setVisible(true), 400)
    return () => clearTimeout(t)
  }, [])

  // Revert back to page defaults
  const resetToPageDefault = useCallback(() => {
    const cfg = getMascotConfigForPath(pathname)
    setCurrentPose(cfg.pose)
    setCurrentAnim(cfg.animation)
    setSpeechText(null)
    setIsReacting(false)
    idleStateRef.current = 0
  }, [pathname])

  // Set temporary reaction
  const triggerReaction = useCallback((pose: string, anim: OtbeeAnimation, text?: string, duration = 2400) => {
    if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current)
    setIsReacting(true)
    setCurrentPose(pose)
    setCurrentAnim(anim)
    if (text) setSpeechText(text)

    reactionTimeoutRef.current = setTimeout(() => {
      resetToPageDefault()
    }, duration)
  }, [resetToPageDefault])

  // Global Interaction Watcher (Task 2)
  useEffect(() => {
    if (!mounted || isHidden) return

    function resetIdleTimer() {
      if (idleStateRef.current > 0 && !isReacting) {
        // User woke up
        resetToPageDefault()
      }

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)

      // Schedule idle stages
      idleTimerRef.current = setTimeout(() => {
        if (!isReacting) {
          idleStateRef.current = 1
          setCurrentPose('maskot-pov-tiga-perempat-3-4')
          setCurrentAnim('idle')
        }

        idleTimerRef.current = setTimeout(() => {
          if (!isReacting) {
            idleStateRef.current = 2
            setCurrentPose('maskot-baca-buku-tumpuk')
            setCurrentAnim('thinking')
            setSpeechText('Sambil nunggu, aku baca materi dulu ya... 📖')
          }

          idleTimerRef.current = setTimeout(() => {
            if (!isReacting) {
              idleStateRef.current = 3
              setCurrentPose('maskot-tidur-lelap-bantal')
              setCurrentAnim('none')
              setSpeechText('Zzz... 💤')
            }
          }, 30000) // 30s after reading -> sleep
        }, 12000) // 12s after looking -> read
      }, 7000) // 7s inactivity -> look around
    }

    // Global Click Handler
    function handleGlobalClick(e: MouseEvent) {
      resetIdleTimer()
      const target = e.target as HTMLElement | null
      if (!target) return

      // Ignore clicks on mascot itself or inside CS widget
      if (target.closest('#otbee-floating-container') || target.closest('#cs-chat-widget')) {
        return
      }

      // Check if clicked element is interactive
      const isInteractive = target.closest('button, a, input[type="submit"], [role="button"]')
      if (isInteractive) {
        const randomReaction = CLICK_REACTIONS[Math.floor(Math.random() * CLICK_REACTIONS.length)]
        triggerReaction(randomReaction.pose, randomReaction.animation, randomReaction.text, 2200)
      }
    }

    // Global Typing Focus Handler
    function handleGlobalFocus(e: FocusEvent) {
      resetIdleTimer()
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        if (!isReacting) {
          triggerReaction('maskot-nulis-essay-meja', 'thinking', 'Lagi fokus ngetik nih... Semangat! ✍️', 3500)
        }
      }
    }

    // Event listeners
    window.addEventListener('click', handleGlobalClick, true)
    window.addEventListener('focusin', handleGlobalFocus, true)
    window.addEventListener('mousemove', resetIdleTimer, { passive: true })
    window.addEventListener('keydown', resetIdleTimer, { passive: true })
    window.addEventListener('scroll', resetIdleTimer, { passive: true })

    resetIdleTimer()

    return () => {
      window.removeEventListener('click', handleGlobalClick, true)
      window.removeEventListener('focusin', handleGlobalFocus, true)
      window.removeEventListener('mousemove', resetIdleTimer)
      window.removeEventListener('keydown', resetIdleTimer)
      window.removeEventListener('scroll', resetIdleTimer)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current)
    }
  }, [mounted, isHidden, isReacting, resetToPageDefault, triggerReaction])

  // Direct click on Mascot: do acrobatic salto + give useful tips!
  const handleMascotDirectClick = () => {
    setSparkles(true)
    setTimeout(() => setSparkles(false), 1200)

    const randomTip = PTN_TIPS[Math.floor(Math.random() * PTN_TIPS.length)]
    triggerReaction('maskot-lompat-pegang-kertas', 'salto', randomTip, 4500)
  }

  if (!mounted || isHidden) return null

  return (
    <>
      <style>{`
        @keyframes otbee-float-enter {
          0% { transform: translateY(100px) scale(0.5); opacity: 0; }
          60% { transform: translateY(-12px) scale(1.06); opacity: 1; }
          80% { transform: translateY(4px) scale(0.97); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes otbee-bubble-pop {
          0% { opacity: 0; transform: translateY(10px) scale(0.85); }
          60% { transform: translateY(-3px) scale(1.03); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes otbee-sparkle-burst {
          0% { opacity: 0; transform: scale(0.4) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.3) rotate(90deg); }
          100% { opacity: 0; transform: scale(1.6) rotate(180deg); }
        }
      `}</style>

      <div
        id="otbee-floating-container"
        className="hidden md:block select-none"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 25,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          opacity: visible ? 1 : 0,
          animation: visible ? 'otbee-float-enter 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) both' : 'none',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Star Sparkles Burst on click */}
        {sparkles && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: '-20px',
              pointerEvents: 'none',
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'otbee-sparkle-burst 0.9s ease-out forwards',
            }}
          >
            <span style={{ position: 'absolute', top: '10%', left: '15%', fontSize: '18px' }}>✨</span>
            <span style={{ position: 'absolute', top: '5%', right: '20%', fontSize: '20px' }}>⭐</span>
            <span style={{ position: 'absolute', bottom: '15%', left: '10%', fontSize: '16px' }}>🌟</span>
            <span style={{ position: 'absolute', bottom: '10%', right: '15%', fontSize: '18px' }}>✨</span>
          </div>
        )}

        {/* Dynamic Speech / Reaction Bubble */}
        {(speechText || hovered) && (
          <div
            role="tooltip"
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #1e1b18 0%, #292520 100%)',
              color: '#fef08a',
              fontSize: '11.5px',
              fontWeight: 700,
              padding: '8px 14px',
              borderRadius: '16px',
              maxWidth: '240px',
              textAlign: 'center',
              lineHeight: 1.4,
              boxShadow: '0 8px 24px -4px rgba(0,0,0,0.4), 0 2px 6px rgba(245,158,11,0.2)',
              border: '1px solid rgba(245,158,11,0.3)',
              animation: 'otbee-bubble-pop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) both',
              pointerEvents: 'none',
              whiteSpace: speechText && speechText.length > 30 ? 'normal' : 'nowrap',
            }}
          >
            {speechText || 'Klik aku untuk salto & tips PTN! 🐝'}
            {/* Arrow */}
            <span
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #292520',
              }}
            />
          </div>
        )}

        {/* Mascot Wrapper with interactive hover & click */}
        <div
          onClick={handleMascotDirectClick}
          title="Klik Otbee untuk aksi salto & rahasia lolos PTN!"
          style={{
            cursor: 'pointer',
            filter: hovered
              ? 'drop-shadow(0 6px 18px rgba(245,158,11,0.55))'
              : 'drop-shadow(0 3px 8px rgba(0,0,0,0.22))',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.22s ease, filter 0.22s ease',
          }}
        >
          <OtbeeMascot
            pose={currentPose}
            animation={currentAnim}
            size={96}
          />
        </div>
      </div>
    </>
  )
}
