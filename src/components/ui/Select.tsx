import { ChevronDown } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'min-h-11 w-full appearance-none rounded-xl border border-line bg-paper px-3.5 pr-10 text-sm text-ink shadow-sm outline-none transition focus:border-ink/50 focus:ring-4 focus:ring-lime/35 disabled:cursor-not-allowed disabled:bg-sage',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
    </div>
  )
}
