'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  sublabel?: string
  badge?: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  size?: 'sm' | 'md'
  searchable?: boolean
  disabled?: boolean
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  className = '',
  size = 'md',
  searchable = true,
  disabled = false,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const selected = options.find(o => o.value === value)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    if (open) {
      document.addEventListener('mousedown', onClickOutside)
      if (searchable && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50)
      }
    }
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open, searchable])

  const filteredOptions = searchable && search.trim()
    ? options.filter(o =>
        o.label.toLowerCase().includes(search.toLowerCase()) ||
        (o.sublabel && o.sublabel.toLowerCase().includes(search.toLowerCase()))
      )
    : options

  const padY = size === 'sm' ? '0.55rem' : '0.75rem'
  const fontSize = size === 'sm' ? 12 : 13

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen(o => !o)
        }}
        className={`w-full flex items-center justify-between gap-2 rounded-xl text-left transition-all cursor-pointer ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200'
            : open
            ? 'border-amber-400 bg-amber-50/20 shadow-[0_0_0_3px_rgba(245,158,11,0.18)]'
            : 'border-gray-200 bg-white hover:border-gray-300 shadow-xs'
        }`}
        style={{
          padding: `${padY} 0.875rem`,
          borderWidth: '1.5px',
          borderStyle: 'solid',
        }}
      >
        <span
          style={{ fontSize }}
          className={`truncate flex-1 font-semibold ${selected ? 'text-gray-900' : 'text-gray-400'}`}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          className={`text-amber-600 flex-shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-xl animate-fade-in"
          style={{ minWidth: '100%' }}
        >
          {searchable && options.length > 5 && (
            <div className="p-2 border-b border-gray-100 bg-gray-50/80">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs">
                <Search size={13} className="text-gray-400 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cari pilihan..."
                  className="w-full bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto py-1 divide-y divide-gray-50">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-center text-xs text-gray-400 font-medium">
                Pilihan tidak ditemukan
              </div>
            ) : (
              filteredOptions.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                    o.value === value
                      ? 'bg-amber-50 text-amber-950 font-bold'
                      : 'hover:bg-amber-50/50 text-gray-800'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate leading-snug">{o.label}</p>
                    {o.sublabel && (
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{o.sublabel}</p>
                    )}
                  </div>
                  {o.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex-shrink-0">
                      {o.badge}
                    </span>
                  )}
                  {o.value === value && (
                    <Check size={14} className="text-amber-600 flex-shrink-0 ml-1" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
