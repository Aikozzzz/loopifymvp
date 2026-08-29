import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeTone = 'green' | 'neutral' | 'yellow' | 'blue' | 'peach' | 'danger'

const toneClasses: Record<BadgeTone, string> = {
  green: 'bg-primary-soft text-[#286346]',
  neutral: 'bg-sage text-muted',
  yellow: 'bg-[#fff2c9] text-[#785c13]',
  blue: 'bg-sky text-[#2c6570]',
  peach: 'bg-peach text-[#865841]',
  danger: 'bg-[#fbe4df] text-danger',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  dot?: boolean
  children: ReactNode
}

export function Badge({ tone = 'neutral', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {children}
    </span>
  )
}
