'use client'

import { Search, X } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function SearchInput({ value, onChange, placeholder = 'Cari...', className = '' }: SearchInputProps) {
  return (
    <div
      className={`flex items-center gap-2.5 px-4 rounded-full ${className}`}
      style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', height: 46 }}
    >
      <Search size={16} style={{ color: 'var(--muted-2)', flexShrink: 0 }} />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm outline-none min-w-0"
        style={{ color: 'var(--fg)' }}
      />
      {value && (
        <button onClick={() => onChange('')} aria-label="Hapus pencarian" className="flex-shrink-0" style={{ color: 'var(--muted-2)' }}>
          <X size={15} />
        </button>
      )}
    </div>
  )
}
