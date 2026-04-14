'use client'

import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  register?: UseFormRegisterReturn
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  register,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-brand-dark">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        {...register}
        className={cn(
          'w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all',
          'border-brand-gray-2 bg-white placeholder:text-brand-muted',
          'focus:border-brand-black focus:ring-2 focus:ring-brand-black/10',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input
