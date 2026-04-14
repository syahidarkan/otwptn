import { cn } from '@/lib/utils'

type BadgeVariant = 'essay' | 'prestasi' | 'hybrid' | 'pending' | 'confirmed' | 'rejected' | 'expired' | 'general'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  essay: 'bg-blue-100 text-blue-700',
  prestasi: 'bg-purple-100 text-purple-700',
  hybrid: 'bg-orange-100 text-orange-700',
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-600',
  general: 'bg-brand-gray text-brand-dark',
}

export default function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  )
}
