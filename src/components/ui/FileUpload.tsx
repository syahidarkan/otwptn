'use client'

import { cn } from '@/lib/utils'
import { Upload, X, FileText } from 'lucide-react'
import { useState, useRef } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSizeMB?: number
  label?: string
  error?: string
}

export default function FileUpload({
  onFileSelect,
  accept = 'image/jpeg,image/png,application/pdf',
  maxSizeMB = 5,
  label = 'Upload File',
  error,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    setLocalError(null)
    const allowed = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowed.includes(f.type)) {
      setLocalError('Hanya JPG, PNG, atau PDF yang diperbolehkan')
      return
    }
    if (f.size > maxSizeMB * 1024 * 1024) {
      setLocalError(`Ukuran file maksimal ${maxSizeMB}MB`)
      return
    }
    setFile(f)
    onFileSelect(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <p className="text-sm font-semibold text-brand-dark">{label}</p>}

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
            dragging ? 'border-brand-yellow bg-yellow-50' : 'border-brand-gray-2 hover:border-brand-black hover:bg-brand-gray'
          )}
        >
          <Upload size={24} className="text-brand-muted" />
          <p className="text-sm text-brand-muted text-center">
            Drag & drop atau <span className="font-semibold text-brand-black underline">klik untuk pilih file</span>
          </p>
          <p className="text-xs text-brand-muted">JPG, PNG, PDF • Maks {maxSizeMB}MB</p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
          <FileText size={20} className="text-green-600 shrink-0" />
          <span className="text-sm font-medium text-green-800 flex-1 truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = '' }}
            className="p-1 rounded hover:bg-green-200 transition-colors"
          >
            <X size={16} className="text-green-700" />
          </button>
        </div>
      )}

      {(localError || error) && (
        <p className="text-xs text-red-600">{localError ?? error}</p>
      )}
    </div>
  )
}
