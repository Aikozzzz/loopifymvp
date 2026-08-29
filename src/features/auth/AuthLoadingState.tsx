import { LoaderCircle } from 'lucide-react'

interface AuthLoadingStateProps {
  message?: string
}

export function AuthLoadingState({
  message = 'Restoring your Loopify session…',
}: AuthLoadingStateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5">
      <div
        className="flex items-center gap-3 rounded-2xl border border-line bg-paper px-5 py-4 text-sm font-semibold text-muted shadow-sm"
        role="status"
        aria-live="polite"
      >
        <LoaderCircle className="size-4 animate-spin text-primary" aria-hidden="true" />
        {message}
      </div>
    </main>
  )
}
