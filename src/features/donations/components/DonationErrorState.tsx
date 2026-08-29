import { RefreshCw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

interface DonationErrorStateProps {
  onRetry: () => void
}

export function DonationErrorState({ onRetry }: DonationErrorStateProps) {
  return (
    <EmptyState
      title="The donation board is taking a pause."
      description="We could not load this part of Loopify. Check your connection and try again."
      icon={<TriangleAlert className="size-6" aria-hidden="true" />}
      actionLabel="Try again"
      onAction={onRetry}
    />
  )
}

export function DonationInlineError({ onRetry }: DonationErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-paper px-6 py-12 text-center">
      <TriangleAlert className="size-6 text-danger" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold text-ink">Your donations could not be loaded.</p>
      <p className="mt-1 max-w-sm text-sm text-muted">Please try again in a moment.</p>
      <Button className="mt-5" size="sm" variant="outline" onClick={onRetry}>
        <RefreshCw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  )
}
