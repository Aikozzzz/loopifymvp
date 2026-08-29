import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full resize-y rounded-xl border border-line bg-paper px-3.5 py-3 text-sm leading-relaxed text-ink shadow-sm outline-none transition placeholder:text-muted/65 focus:border-ink/50 focus:ring-4 focus:ring-lime/35 disabled:cursor-not-allowed disabled:bg-sage',
        className,
      )}
      {...props}
    />
  )
}
