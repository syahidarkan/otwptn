'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, X, Check } from 'lucide-react'

interface OptionItem {
  label: string
  value: string
  sub?: string
}

interface SearchablePickerProps {
  value: string
  onChange: (value: string) => void
  options: (string | OptionItem)[]
  placeholder?: string
  label?: string
  className?: string
}

export default function SearchablePicker({
  value,
  onChange,
  options,
  placeholder = 'Cari...',
  label,
  className = '',
}: SearchablePickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const normalizedOptions: OptionItem[] = useMemo(() => {
    return options.map(opt => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt }
      }
      return opt
    })
  }, [options])

  const filtered = useMemo(() => {
    if (!query.trim()) return normalizedOptions.slice(0, 15)
    const q = query.toLowerCase()
    return normalizedOptions
      .filter(
        opt =>
          opt.label.toLowerCase().includes(q) ||
          opt.value.toLowerCase().includes(q) ||
          opt.sub?.toLowerCase().includes(q)
      )
      .slice(0, 25)
  }, [normalizedOptions, query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedItem = normalizedOptions.find(o => o.value.toLowerCase() === (value || '').toLowerCase())

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="text-xs font-bold text-gray-700 mb-1.5 block">{label}</label>}

      {/* Input / Selector Pill */}
      <div
        onClick={() => setOpen(prev => !prev)}
        className="w-full px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs font-semibold text-gray-900 flex items-center justify-between gap-2 cursor-pointer shadow-xs hover:border-amber-400 transition-colors"
      >
        <span className={`truncate ${value ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
          {selectedItem ? selectedItem.label : value || placeholder}
        </span>
        <div className="flex items-center gap-1.5 text-gray-400">
          {value && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onChange('')
                setQuery('')
              }}
              className="p-0.5 rounded-full hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown
            size={14}
            className={`transition-transform duration-150 ${open ? 'rotate-180 text-amber-600' : ''}`}
          />
        </div>
      </div>

      {/* Flyout Search Dropdown */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-2xl bg-white border border-gray-100 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
          {/* Search Field */}
          <div className="relative mb-1.5">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 outline-none focus:bg-white focus:border-amber-400"
            />
          </div>

          {/* Results List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5 scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="p-3 text-center">
                <p className="text-xs text-gray-500 font-medium">Tidak ada pilihan yang cocok di database.</p>
                {query.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange(query.trim().toUpperCase())
                      setOpen(false)
                      setQuery('')
                    }}
                    className="mt-2 w-full py-2 px-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    + Gunakan &ldquo;{query.trim().toUpperCase()}&rdquo;
                  </button>
                )}
              </div>
            ) : (
              <>
                {filtered.map(opt => {
                  const isSelected = opt.value.toLowerCase() === (value || '').toLowerCase()
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value)
                        setOpen(false)
                        setQuery('')
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-100/80 text-amber-950 font-bold'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-950'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate leading-tight">{opt.label}</p>
                        {opt.sub && (
                          <p className="text-[10px] text-gray-400 truncate mt-0.5 font-normal">{opt.sub}</p>
                        )}
                      </div>
                      {isSelected && <Check size={13} className="text-amber-700 flex-shrink-0" />}
                    </button>
                  )
                })}

                {/* Option to enter custom uppercase text if query does not match any label exactly */}
                {query.trim() && !filtered.some(f => f.label.toLowerCase() === query.trim().toLowerCase()) && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange(query.trim().toUpperCase())
                      setOpen(false)
                      setQuery('')
                    }}
                    className="w-full text-left px-3 py-2 mt-1 rounded-xl text-xs font-bold text-amber-900 bg-amber-50/80 hover:bg-amber-100 border border-amber-200/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>+ Gunakan input kustom:</span>
                    <span className="font-black underline">&ldquo;{query.trim().toUpperCase()}&rdquo;</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

