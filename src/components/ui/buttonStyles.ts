import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-[0_8px_20px_rgba(23,59,48,0.14)] hover:-translate-y-0.5 hover:bg-[#245342] active:translate-y-0',
  secondary:
    'bg-lime text-ink shadow-[0_8px_20px_rgba(150,210,120,0.18)] hover:-translate-y-0.5 hover:bg-[#a9e97d] active:translate-y-0',
  outline:
    'border border-line bg-paper text-ink hover:border-ink/30 hover:bg-sage active:bg-sage',
  ghost: 'text-muted hover:bg-sage hover:text-ink active:bg-sage',
  danger: 'bg-danger text-white hover:-translate-y-0.5 hover:bg-[#8f3532] active:translate-y-0',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 rounded-full px-3.5 text-sm',
  md: 'min-h-11 rounded-full px-5 text-sm',
  lg: 'min-h-13 rounded-full px-6 text-base',
  icon: 'size-10 rounded-full p-0',
}

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) {
  return cn(
    'inline-flex shrink-0 items-center justify-center gap-2 font-semibold transition duration-200 ease-out disabled:pointer-events-none disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )
}
