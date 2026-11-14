'use client'

import { useCallback, useState } from 'react'
import Toast from '@/components/ui/Toast'
import { otbeeBrain } from '@/components/mascot/otbee/brain'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

let nextId = 1

export function useToast() {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setItems(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++
    setItems(prev => [...prev, { id, type, message }])
    otbeeBrain.emit({ type, text: message.length > 70 ? undefined : message })
  }, [])

  const toastHost = (
    <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2" role="status" aria-live="polite">
      {items.map(t => (
        <Toast key={t.id} type={t.type} message={t.message} onClose={() => dismiss(t.id)} />
      ))}
    </div>
  )

  return { showToast, toastHost }
}
