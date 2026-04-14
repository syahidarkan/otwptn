'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'ghost' | 'dark' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  href?: string
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-yellow text-brand-black hover:bg-brand-yellow-d font-bold',
  ghost: 'bg-transparent border border-brand-gray-2 text-brand-black hover:bg-brand-gray',
  dark: 'bg-brand-black text-white hover:bg-brand-dark font-bold',
  danger: 'bg-red-600 text-white hover:bg-red-700 font-bold',
  outline: 'bg-transparent border border-white text-white hover:bg-white/10',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  href,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}, ref) => {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-150 cursor-pointer',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    (disabled || loading) && 'opacity-50 pointer-events-none',
    className
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {loading ? <Spinner size="sm" /> : null}
        {children}
      </Link>
    )
  }

  return (
    <button ref={ref} disabled={disabled || loading} className={classes} {...props}>
      {loading ? <Spinner size="sm" /> : null}
      {children}
    </button>
  )
})

Button.displayName = 'Button'
export default Button

// --- Spinner ---
function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
  return (
    <svg className={cn('animate-spin', s)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

export { Spinner }
