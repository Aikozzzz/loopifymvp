import logoUrl from '../../../logo.jpg'
import { cn } from '@/lib/utils'

interface LoopifyLogoProps {
  compact?: boolean
  inverse?: boolean
  className?: string
}

export function LoopifyLogo({ compact = false, inverse = false, className }: LoopifyLogoProps) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      <img
        className={cn(
          'block h-auto rounded-xl object-contain',
          compact ? 'w-16' : inverse ? 'w-40 bg-white p-1' : 'w-36 bg-paper',
        )}
        src={logoUrl}
        alt=""
      />
    </span>
  )
}
