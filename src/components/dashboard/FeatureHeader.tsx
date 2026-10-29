import React from 'react'
import CardPattern from '@/components/ui/CardPattern'
import { Sparkles } from 'lucide-react'

interface FeatureHeaderProps {
  title: string
  subtitle: string
  mascot: string
  badgeText?: string
  color?: string
  variant?: 'gold' | 'dark'
  children?: React.ReactNode
}

export default function FeatureHeader({
  title,
  subtitle,
  mascot,
  badgeText,
  color,
  variant,
  children,
}: FeatureHeaderProps) {
  // Use "dark" if specified or if color is indigo/dark, otherwise default to the beloved warm golden honeycomb theme
  const isDark = variant === 'dark' || color === 'dark' || color === 'indigo'

  if (isDark) {
    return (
      <div
        className="rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #07152b 0%, #0a1f40 50%, #122f5c 100%)',
        }}
      >
        {/* Navy Explorer Doodle Pattern from Home Mentor Card */}
        <CardPattern
          type="navy-explorer"
          opacity={0.22}
          style={{ color: '#38bdf8' }}
        />

        <div className="relative z-10 max-w-xl">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-1.5">
            {title}
          </h1>
          <p className="text-sm font-medium leading-relaxed text-slate-200/90 mb-4 max-w-lg">
            {subtitle}
          </p>
          {children && <div className="mt-2 flex flex-wrap gap-2.5">{children}</div>}
        </div>

        {/* Mascot Asset */}
        <div className="relative z-10 flex-shrink-0 animate-float self-end md:self-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mascot}
            alt=""
            className="pointer-events-none filter drop-shadow-2xl select-none"
            style={{ height: 140, width: 'auto' }}
          />
        </div>
      </div>
    )
  }

  // Default: Signature Warm Golden Honeycomb Card (Identical to "Lanjutkan Essay-mu" on Home)
  return (
    <div
      className="rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 shadow-md transition-all"
      style={{
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef08a 40%, #ffd400 100%)',
      }}
    >
      {/* Honeycomb gold pattern overlay */}
      <CardPattern
        type="honeycomb-gold"
        opacity={0.22}
        style={{ color: '#b45309' }}
      />

      {/* Frosted highlight reflection */}
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none opacity-40 blur-3xl"
        style={{ background: 'rgba(255, 255, 255, 0.8)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-xl">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-1.5">
          {title}
        </h1>
        <p className="text-sm font-medium leading-relaxed text-gray-800/85 mb-4 max-w-lg">
          {subtitle}
        </p>
        {children && <div className="mt-2 flex flex-wrap gap-2.5">{children}</div>}
      </div>

      {/* Mascot with gentle float effect */}
      <div className="relative z-10 flex-shrink-0 animate-float self-end md:self-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mascot}
          alt=""
          className="pointer-events-none filter drop-shadow-md select-none"
          style={{ height: 140, width: 'auto' }}
        />
      </div>
    </div>
  )
}
