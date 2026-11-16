'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className={cn(
          'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
          'w-[92vw] max-w-full bg-white dark:bg-[#18191e] border border-gray-150 dark:border-neutral-800 text-gray-900 dark:text-neutral-100 rounded-3xl shadow-2xl p-6 sm:p-7',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          sizeClasses[size]
        )}>
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-neutral-800">
            {title && (
              <Dialog.Title className="text-lg font-black text-gray-900 dark:text-neutral-100 tracking-tight">
                {title}
              </Dialog.Title>
            )}
            <Dialog.Close
              onClick={onClose}
              className="ml-auto p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X size={18} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
