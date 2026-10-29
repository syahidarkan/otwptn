'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  sublabel?: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  size?: 'sm' | 'md'
}

export default function Select({ value, onChange, options, placeholder = 'Pilih...', className = '', size = 'md' }: SelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const padY = size === 'sm' ? '0.5rem' : '0.75rem'
  const fontSize = size === 'sm' ? 13 : 14

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-xl text-left"
        style={{
          padding: `${padY} 1rem`,
          border: `1.5px solid ${open ? 'var(--fg)' : 'var(--border)'}`,
          background: 'var(--bg)',
          boxShadow: open ? '0 0 0 3px rgba(17,17,17,0.06)' : '0 1px 2px rgba(0,0,0,0.03)',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        <span style={{ fontSize, color: selected ? 'var(--fg)' : 'var(--muted-2)', fontWeight: selected ? 600 : 400 }} className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={15} style={{ color: 'var(--muted-2)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: '0 12px 32px rgba(0,0,0,0.14)' }}
        >
          <div className="max-h-64 overflow-y-auto py-1.5">
            {options.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false) }}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left transition-colors"
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-alt)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--fg)' }}>{o.label}</p>
                  {o.sublabel && <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{o.sublabel}</p>}
                </div>
                {o.value === value && <Check size={14} className="flex-shrink-0" style={{ color: 'var(--accent-hover)' }} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
