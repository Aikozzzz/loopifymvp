import { PackageOpen } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-paper px-6 py-16 text-center', className)}>
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        {icon ?? <PackageOpen className="size-6" aria-hidden="true" />}
      </div>
      <h3 className="max-w-md text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
