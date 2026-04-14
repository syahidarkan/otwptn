'use client'

import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useState, useEffect } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  type: ToastType
  message: string
  onClose: () => void
  duration?: number
}

const configs = {
  success: { icon: CheckCircle, classes: 'bg-green-50 border-green-200 text-green-800' },
  error: { icon: XCircle, classes: 'bg-red-50 border-red-200 text-red-800' },
  info: { icon: Info, classes: 'bg-blue-50 border-blue-200 text-blue-800' },
}

export default function Toast({ type, message, onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(true)
  const { icon: Icon, classes } = configs[type]

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-300 text-sm max-w-sm',
      classes,
      !visible && 'opacity-0 translate-y-2'
    )}>
      <Icon size={18} className="shrink-0" />
      <span className="flex-1 font-medium">{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300) }} className="shrink-0">
        <X size={16} />
      </button>
    </div>
  )
}

// Toast container — place in layout
export function ToastContainer({ toasts }: { toasts: Array<{ id: string; type: ToastType; message: string }> }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id}>{t.message}</div>
      ))}
    </div>
  )
}
