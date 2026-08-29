import { ArrowUpRight, HeartHandshake, MapPin, UserRound } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  DONATION_CATEGORY_LABELS,
  DONATION_CONDITION_LABELS,
} from '@/features/donations/constants'
import type { Donation } from '@/features/donations/types'
import { DonationStatusBadge } from '@/features/donations/components/DonationStatusBadge'

interface DonationCardProps {
  donation: Donation
  footer?: ReactNode
}

const createdDateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function DonationCard({ donation, footer }: DonationCardProps) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <article className="overflow-hidden rounded-card border border-line bg-paper transition duration-200 hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_16px_36px_rgba(23,59,48,0.08)]">
      <Link
        className="group block"
        to={`/donations/${donation.id}`}
        aria-label={`View donation: ${donation.title}`}
      >
        <div className="relative aspect-[1.35/1] overflow-hidden bg-sage">
          {imageFailed ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-primary">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft">
                <HeartHandshake className="size-7" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold text-muted">Donation photo unavailable</span>
            </div>
          ) : (
            <img
              className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
              src={donation.imageUrl}
              alt=""
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          )}
          <div className="absolute right-4 top-4">
            <DonationStatusBadge status={donation.status} />
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                {DONATION_CATEGORY_LABELS[donation.category]}
              </p>
              <h3 className="mt-2 line-clamp-2 text-lg font-bold tracking-[-0.02em] text-ink">
                {donation.title}
              </h3>
            </div>
            <ArrowUpRight
              className="mt-0.5 size-5 shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
              aria-hidden="true"
            />
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{donation.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden="true" />
              {donation.township}
            </span>
            <span>{DONATION_CONDITION_LABELS[donation.condition]}</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted">
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
              <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{donation.donor?.display_name ?? 'Community member'}</span>
            </span>
            <time dateTime={donation.created_at} className="shrink-0">
              {createdDateFormatter.format(new Date(donation.created_at))}
            </time>
          </div>
        </div>
      </Link>
      {footer ? <div className={cn('border-t border-line px-5 py-4')}>{footer}</div> : null}
    </article>
  )
}
