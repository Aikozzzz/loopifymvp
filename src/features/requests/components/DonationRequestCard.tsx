import { HeartHandshake, MapPin, ShieldCheck, UserRound } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { RequestStatusBadge } from '@/features/requests/components/RequestStatusBadge'
import type { DonationRequestWithRelations } from '@/features/requests/types'

const requestDateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

interface DonationRequestCardProps {
  request: DonationRequestWithRelations
  perspective: 'recipient' | 'donor'
  actions?: ReactNode
}

export function DonationRequestCard({
  request,
  perspective,
  actions,
}: DonationRequestCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const item = request.item
  const isAccepted = request.status === 'accepted' || request.status === 'fulfilled'
  const participantName =
    perspective === 'recipient'
      ? item?.donor?.display_name ?? 'Community donor'
      : request.requester?.display_name ?? 'Community member'

  return (
    <Card className="overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {perspective === 'recipient' ? (
            <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-sage">
              {item?.imageUrl && !imageFailed ? (
                <img
                  className="size-full object-cover"
                  src={item.imageUrl}
                  alt=""
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="flex size-full items-center justify-center text-primary">
                  <HeartHandshake className="size-6" aria-hidden="true" />
                </div>
              )}
            </div>
          ) : (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <UserRound className="size-5" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">
                  {perspective === 'recipient'
                    ? item?.title ?? 'Donation no longer available'
                    : participantName}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    {perspective === 'recipient' ? (
                      <>
                        <UserRound className="size-3.5" aria-hidden="true" />
                        {participantName}
                      </>
                    ) : (
                      <>
                        <MapPin className="size-3.5" aria-hidden="true" />
                        {request.requester?.township ?? 'Area not shared'}
                      </>
                    )}
                  </span>
                  <time dateTime={request.created_at}>
                    Requested {requestDateFormatter.format(new Date(request.created_at))}
                  </time>
                </p>
              </div>
              <RequestStatusBadge status={request.status} />
            </div>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap rounded-xl bg-sage/55 px-3.5 py-3 text-sm leading-relaxed text-muted">
          “{request.request_message}”
        </p>

        {isAccepted ? (
          <div className="mt-3 rounded-xl border border-[#cfe4c9] bg-primary-soft/55 px-3.5 py-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
                  Private pickup note
                </p>
                {request.donor_reply ? (
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                    {request.donor_reply}
                  </p>
                ) : (
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    The donor has accepted this request and will share pickup details soon.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : perspective === 'donor' && request.status === 'pending' ? (
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Pickup details stay private and can be added when you accept this request.
          </p>
        ) : null}

        {actions ? <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">{actions}</div> : null}
      </div>
    </Card>
  )
}
