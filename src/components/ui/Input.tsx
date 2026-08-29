import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
}

export function Input({ className, icon, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon ? (
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <input
        className={cn(
          'min-h-11 w-full rounded-xl border border-line bg-paper px-3.5 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted/65 focus:border-ink/50 focus:ring-4 focus:ring-lime/35 disabled:cursor-not-allowed disabled:bg-sage',
          icon ? 'pl-10' : null,
          className,
        )}
        {...props}
      />
    </div>
  )
}

interface FieldProps {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}

export function Field({ label, htmlFor, hint, error, required, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-ink" htmlFor={htmlFor}>
        {label}
        {required ? <span className="ml-1 text-danger" aria-hidden="true">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-danger" id={`${htmlFor}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs leading-relaxed text-muted" id={`${htmlFor}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
