import { ArrowLeft, CalendarClock, HeartHandshake, MapPin, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useLocation, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { Card, CardContent } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { useAuth } from '@/features/auth/useAuth'
import { DonationErrorState } from '@/features/donations/components/DonationErrorState'
import { DonationStatusBadge } from '@/features/donations/components/DonationStatusBadge'
import {
  DONATION_CATEGORY_LABELS,
  DONATION_CONDITION_LABELS,
} from '@/features/donations/constants'
import { useDonation } from '@/features/donations/hooks/useDonations'
import { RequestDonationForm } from '@/features/requests/components/RequestDonationForm'
import { RequestStatusBadge } from '@/features/requests/components/RequestStatusBadge'
import { useMyRequestForDonation } from '@/features/requests/hooks/useRequests'
import { createDonationRequest } from '@/features/requests/services/requestService'
import type { DonationRequestValues } from '@/features/requests/schemas'
import { queryClient } from '@/lib/queryClient'

const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

function formatDate(value: string | null): string | null {
  if (!value) {
    return null
  }

  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? dateFormatter.format(date) : null
}

function formatDateTime(value: string | null): string | null {
  if (!value) {
    return null
  }

  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? dateTimeFormatter.format(date) : null
}

export function DonationDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [failedImageId, setFailedImageId] = useState<string | null>(null)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const donationQuery = useDonation(id)
  const requestQuery = useMyRequestForDonation(id, user?.id)
  const requestMutation = useMutation({
    mutationFn: ({
      itemId,
      requestMessage,
    }: {
      itemId: string
      requestMessage: DonationRequestValues['requestMessage']
    }) => createDonationRequest(itemId, requestMessage),
    onSuccess: () => {
      setIsRequestDialogOpen(false)
      toast.success('Your request was sent to the donor.')
      void queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
    onError: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['donations', 'detail', id] }),
        queryClient.invalidateQueries({ queryKey: ['requests'] }),
      ])
    },
  })

  if (donationQuery.isPending) {
    return (
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_0.9fr] lg:px-10">
        <div className="aspect-[4/3] animate-pulse rounded-panel bg-sage" />
        <div className="space-y-4">
          <div className="h-4 w-28 animate-pulse rounded-full bg-sage" />
          <div className="h-12 w-4/5 animate-pulse rounded-xl bg-sage" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-sage" />
          <div className="h-12 w-44 animate-pulse rounded-xl bg-sage" />
        </div>
      </div>
    )
  }

  if (donationQuery.isError || !donationQuery.data) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <Link className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink" to="/feed">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to donations
        </Link>
        <DonationErrorState onRetry={() => void donationQuery.refetch()} />
      </div>
    )
  }

  const donation = donationQuery.data
  const imageFailed = failedImageId === donation.id
  const expirationDate = formatDate(donation.food_expiration_date)
  const pickupDeadline = formatDateTime(donation.pickup_deadline)
  const existingRequest = requestQuery.data
  const requestStatusIsLoading = Boolean(user && requestQuery.isPending)

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
      <Link className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink" to="/feed">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to donations
      </Link>
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div className="overflow-hidden rounded-panel border border-line bg-sage">
          {imageFailed ? (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 text-primary">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-soft">
                <HeartHandshake className="size-8" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-muted">Donation photo unavailable</p>
            </div>
          ) : (
            <img
              className="aspect-[4/3] size-full object-cover"
              src={donation.imageUrl}
              alt={`Photo of ${donation.title}`}
              onError={() => setFailedImageId(donation.id)}
            />
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{DONATION_CATEGORY_LABELS[donation.category]}</Badge>
            <DonationStatusBadge status={donation.status} />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.05em] text-ink sm:text-4xl">{donation.title}</h1>
          <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-muted">{donation.description}</p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Card className="bg-sage">
              <CardContent className="flex items-start gap-3 pt-4">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">General area</p>
                  <p className="mt-1 text-sm font-bold text-ink">{donation.township}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-sage">
              <CardContent className="flex items-start gap-3 pt-4">
                <HeartHandshake className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Condition</p>
                  <p className="mt-1 text-sm font-bold text-ink">{DONATION_CONDITION_LABELS[donation.condition]}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {expirationDate || pickupDeadline ? (
            <div className="mt-3 rounded-card border border-[#eddca8] bg-[#fff8dc] p-4">
              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 size-5 shrink-0 text-[#785c13]" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-ink">Sealed-food dates</p>
                  {expirationDate ? <p className="mt-1 text-sm text-muted">Expires {expirationDate}</p> : null}
                  {pickupDeadline ? <p className="mt-1 text-sm text-muted">Pickup by {pickupDeadline}</p> : null}
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {donation.status === 'available' ? (
              isAuthLoading ? (
                <Button size="md" loading disabled>
                  Checking account…
                </Button>
              ) : !user ? (
                <Link
                  className={buttonStyles({ variant: 'primary', size: 'md' })}
                  to="/login"
                  state={{ from: `${location.pathname}${location.search}` }}
                >
                  <HeartHandshake className="size-4" aria-hidden="true" />
                  Sign in to request
                </Link>
              ) : user.id === donation.donor_id ? (
                <Button size="md" disabled>
                  Your donation
                </Button>
              ) : requestStatusIsLoading ? (
                <Button size="md" loading disabled>
                  Checking your request…
                </Button>
              ) : existingRequest ? (
                <Link
                  className={buttonStyles({ variant: 'secondary', size: 'md' })}
                  to="/my-requests"
                >
                  <RequestStatusBadge status={existingRequest.status} dot={false} />
                  View my request
                </Link>
              ) : (
                <Button
                  size="md"
                  onClick={() => {
                    requestMutation.reset()
                    setIsRequestDialogOpen(true)
                  }}
                >
                  <HeartHandshake className="size-4" aria-hidden="true" />
                  Request donation
                </Button>
              )
            ) : (
              <Link className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink transition hover:border-ink/25 hover:bg-sage" to="/feed">
                Browse available donations
              </Link>
            )}
            <Link className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink transition hover:border-ink/25 hover:bg-sage" to="/feed">
              Keep exploring
            </Link>
          </div>

          {user && requestQuery.isError ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#eddca8] bg-[#fff8dc] px-3.5 py-3 text-sm text-[#785c13]" role="alert">
              <span>We could not check your existing request.</span>
              <Button
                className="px-2 py-1 text-xs"
                variant="ghost"
                size="sm"
                onClick={() => void requestQuery.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : null}

          <div className="mt-8 flex items-start gap-3 border-t border-line pt-6">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#4d8950]" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-muted">
              Pickup notes and direct contact details stay private until a request is accepted. Use a public handover spot whenever possible.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-muted">
            <UserRound className="size-3.5" aria-hidden="true" />
            Shared by {donation.donor?.display_name ?? 'a community member'}
            <span aria-hidden="true">·</span>
            <span>Posted {dateFormatter.format(new Date(donation.created_at))}</span>
          </div>
        </div>
      </div>

      <Dialog
        open={isRequestDialogOpen}
        onClose={() => {
          if (!requestMutation.isPending) {
            setIsRequestDialogOpen(false)
          }
        }}
        title={`Request ${donation.title}`}
        description="Your message helps the donor choose the right recipient."
      >
        {requestMutation.isError ? (
          <p className="mb-5 rounded-xl border border-[#f2c8c1] bg-[#fbe4df] px-3.5 py-3 text-sm text-danger" role="alert">
            {requestMutation.error instanceof Error
              ? requestMutation.error.message
              : 'Your request could not be sent. Please try again.'}
          </p>
        ) : null}
        {donation.status === 'available' ? (
          <RequestDonationForm
            donationTitle={donation.title}
            onSubmit={async (values) => {
              await requestMutation.mutateAsync({
                itemId: donation.id,
                requestMessage: values.requestMessage,
              })
            }}
            onCancel={() => {
              if (!requestMutation.isPending) {
                setIsRequestDialogOpen(false)
              }
            }}
          />
        ) : (
          <p className="rounded-xl border border-[#f2c8c1] bg-[#fbe4df] px-3.5 py-3 text-sm text-danger" role="alert">
            This donation is no longer available for requests. Browse the available donations to find another item.
          </p>
        )}
      </Dialog>
    </div>
  )
}
