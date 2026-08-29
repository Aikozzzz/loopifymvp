import { ArrowLeft, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { buttonStyles } from '@/components/ui/buttonStyles'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Compass className="size-7" aria-hidden="true" />
      </span>
      <Badge className="mt-6" tone="neutral">404 / Not found</Badge>
      <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.06em] text-ink sm:text-6xl">This loop took a wrong turn.</h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
        The page you’re looking for may have moved, or it might not be part of the loop yet.
      </p>
      <Link className={buttonStyles({ variant: 'primary', size: 'md', className: 'mt-8' })} to="/">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to home
      </Link>
    </div>
  )
}
