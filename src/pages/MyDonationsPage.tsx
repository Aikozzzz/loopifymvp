import { CheckCircle2, CircleCheck, Edit3, HeartHandshake, PackageCheck, ShieldCheck, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { DonationCard } from '@/features/donations/components/DonationCard'
import { DonationInlineError } from '@/features/donations/components/DonationErrorState'
import { DonationSkeleton } from '@/features/donations/components/DonationSkeleton'
import { DonationStatusBadge } from '@/features/donations/components/DonationStatusBadge'
import { DONATION_STATUS_LABELS } from '@/features/donations/constants'
import { useMyDonations } from '@/features/donations/hooks/useDonations'
import { withdrawDonation } from '@/features/donations/services/donationService'
import { useAuth } from '@/features/auth/useAuth'
import { AcceptRequestForm } from '@/features/requests/components/AcceptRequestForm'
import { DonationRequestCard } from '@/features/requests/components/DonationRequestCard'
import { useDonationRequests } from '@/features/requests/hooks/useRequests'
import {
  acceptDonationRequest,
  completeDonation,
  declineDonationRequest,
} from '@/features/requests/services/requestService'
import type { DonorReplyValues } from '@/features/requests/schemas'
import type { DonationRequestWithRelations } from '@/features/requests/types'
import type { ItemStatus } from '@/types/database'
import { queryClient } from '@/lib/queryClient'

type DonationTab = 'all' | ItemStatus

const tabs: Array<{ value: DonationTab; label: string }> = [
  { value: 'all', label: 'All donations' },
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'completed', label: 'Donated' },
  { value: 'withdrawn', label: 'Withdrawn' },
]

export function MyDonationsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const donationQuery = useMyDonations()
  const [activeTab, setActiveTab] = useState<DonationTab>('all')
  const [withdrawTarget, setWithdrawTarget] = useState<string | null>(null)
  const [acceptTargetId, setAcceptTargetId] = useState<string | null>(null)
  const [declineTargetId, setDeclineTargetId] = useState<string | null>(null)
  const [completeTargetId, setCompleteTargetId] = useState<string | null>(null)
  const withdrawMutation = useMutation({
    mutationFn: withdrawDonation,
    onSuccess: () => {
      setWithdrawTarget(null)
      toast.success('Donation withdrawn from the community board.')
      void queryClient.invalidateQueries({ queryKey: ['donations'] })
      void queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Donation could not be withdrawn.')
    },
  })
  const donations = useMemo(() => donationQuery.data ?? [], [donationQuery.data])
  const donationIds = useMemo(() => donations.map((donation) => donation.id), [donations])
  const requestsQuery = useDonationRequests(donationIds, user?.id)
  const requestsByDonation = useMemo(() => {
    const grouped = new Map<string, DonationRequestWithRelations[]>()

    for (const request of requestsQuery.data ?? []) {
      const current = grouped.get(request.item_id) ?? []
      current.push(request)
      grouped.set(request.item_id, current)
    }

    return grouped
  }, [requestsQuery.data])
  const requestRows = requestsQuery.data ?? []
  const acceptTarget = requestRows.find((request) => request.id === acceptTargetId)
  const declineTarget = requestRows.find((request) => request.id === declineTargetId)
  const completeTarget = donations.find((donation) => donation.id === completeTargetId)
  const refreshDonationLifecycle = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['donations'] }),
      queryClient.invalidateQueries({ queryKey: ['requests'] }),
    ])
  }
  const acceptMutation = useMutation({
    mutationFn: ({
      requestId,
      donorReply,
    }: {
      requestId: string
      donorReply: DonorReplyValues['donorReply']
    }) => acceptDonationRequest(requestId, donorReply),
    onSuccess: async () => {
      setAcceptTargetId(null)
      toast.success('Request accepted. The donation is now reserved.')
      await refreshDonationLifecycle()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'This request could not be accepted.')
    },
  })
  const declineMutation = useMutation({
    mutationFn: declineDonationRequest,
    onSuccess: async () => {
      setDeclineTargetId(null)
      toast.success('Request declined.')
      await refreshDonationLifecycle()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'This request could not be declined.')
    },
  })
  const completeMutation = useMutation({
    mutationFn: completeDonation,
    onSuccess: async () => {
      setCompleteTargetId(null)
      toast.success('Handover marked as complete.')
      await refreshDonationLifecycle()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'The handover could not be completed.')
    },
  })
  const visibleDonations = useMemo(
    () => (activeTab === 'all' ? donations : donations.filter((donation) => donation.status === activeTab)),
    [activeTab, donations],
  )
  const targetDonation = donations.find((donation) => donation.id === withdrawTarget)

  const sharedCount = donations.filter((donation) => donation.status !== 'withdrawn').length
  const inProgressCount = donations.filter((donation) => donation.status === 'reserved').length
  const completedCount = donations.filter((donation) => donation.status === 'completed').length

  return (
    <div>
      <PageHeader
        eyebrow="Your giving"
        title="My donations"
        description="Keep track of the useful things you’ve put into motion and the people they’ve reached."
        action={
          <Button variant="secondary" onClick={() => navigate('/donate')}>
            <HeartHandshake className="size-4" aria-hidden="true" />
            Donate an item
          </Button>
        }
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Shared', value: sharedCount, icon: HeartHandshake, tone: 'bg-primary-soft text-primary' },
          { label: 'In progress', value: inProgressCount, icon: ShieldCheck, tone: 'bg-peach text-[#9b6649]' },
          { label: 'Donated', value: completedCount, icon: PackageCheck, tone: 'bg-sky text-[#39727a]' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 pt-5">
              <span className={`flex size-11 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-extrabold tracking-[-0.04em] text-ink">{value}</p>
                <p className="mt-0.5 text-xs font-semibold text-muted">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-sage p-1" role="tablist" aria-label="Donation status">
          {tabs.map((tab) => (
            <button
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition sm:px-4 ${activeTab === tab.value ? 'bg-paper text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.value}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Badge tone="neutral">
          {visibleDonations.length} {visibleDonations.length === 1 ? 'result' : 'results'}
        </Badge>
      </div>

      {donationQuery.isPending ? (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <DonationSkeleton key={index} />
          ))}
        </div>
      ) : donationQuery.isError ? (
        <div className="mt-5">
          <DonationInlineError onRetry={() => void donationQuery.refetch()} />
        </div>
      ) : visibleDonations.length === 0 ? (
        <EmptyState
          className="mt-5"
          title={activeTab === 'completed' ? 'Your completed loops will live here.' : activeTab === 'withdrawn' ? 'No withdrawn donations.' : 'Your first donation is waiting.'}
          description={
            activeTab === 'all'
              ? 'When you share something, this space will show its status and the next step in the handover.'
              : `You do not have any ${DONATION_STATUS_LABELS[activeTab].toLowerCase()} donations yet.`
          }
          icon={<CircleCheck className="size-6" aria-hidden="true" />}
          actionLabel="Share an item"
          onAction={() => navigate('/donate')}
        />
      ) : (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {visibleDonations.map((donation) => (
            <DonationCard
              donation={donation}
              key={donation.id}
              footer={
                <div className="w-full">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <DonationStatusBadge status={donation.status} dot={false} />
                    <div className="flex flex-wrap items-center gap-2">
                      {donation.status === 'available' ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => navigate(`/donations/${donation.id}/edit`)}>
                            <Edit3 className="size-3.5" aria-hidden="true" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setWithdrawTarget(donation.id)}>
                            <Trash2 className="size-3.5" aria-hidden="true" />
                            Withdraw
                          </Button>
                        </>
                      ) : donation.status === 'reserved' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            completeMutation.reset()
                            setCompleteTargetId(donation.id)
                          }}
                        >
                          <CheckCircle2 className="size-3.5" aria-hidden="true" />
                          Mark complete
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-muted">
                          {donation.status === 'completed' ? 'Part of the impact record' : 'No longer public'}
                        </span>
                      )}
                    </div>
                  </div>

                  {requestsQuery.isPending ? (
                    <div className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-xs font-semibold text-muted">
                      <span className="size-3 animate-pulse rounded-full bg-sage" />
                      Loading requests…
                    </div>
                  ) : requestsQuery.isError ? (
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4" role="alert">
                      <p className="text-xs leading-relaxed text-danger">
                        Requests could not be loaded.
                      </p>
                      <Button size="sm" variant="ghost" onClick={() => void requestsQuery.refetch()}>
                        Try again
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4 border-t border-line pt-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                          Requests
                        </p>
                        <Badge tone="neutral">
                          {(requestsByDonation.get(donation.id) ?? []).length}
                        </Badge>
                      </div>
                      {(requestsByDonation.get(donation.id) ?? []).length > 0 ? (
                        <div className="mt-3 space-y-3">
                          {(requestsByDonation.get(donation.id) ?? []).map((request) => (
                            <DonationRequestCard
                              key={request.id}
                              request={request}
                              perspective="donor"
                              actions={
                                request.status === 'pending' ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => {
                                        acceptMutation.reset()
                                        setAcceptTargetId(request.id)
                                      }}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        declineMutation.reset()
                                        setDeclineTargetId(request.id)
                                      }}
                                    >
                                      Decline
                                    </Button>
                                  </>
                                ) : null
                              }
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-muted">No requests yet. We’ll show them here when neighbors respond.</p>
                      )}
                    </div>
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}

      <Card className="mt-6 bg-primary text-white">
        <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-lime" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold">A thoughtful listing makes a safer handover.</p>
              <p className="mt-1.5 text-xs leading-relaxed text-white/65">
                Keep exact addresses and private contact information out of public donation details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(targetDonation)}
        onClose={() => {
          if (!withdrawMutation.isPending) {
            setWithdrawTarget(null)
          }
        }}
        title="Withdraw this donation?"
        description="It will disappear from the public board and pending requests will be closed."
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" disabled={withdrawMutation.isPending} onClick={() => setWithdrawTarget(null)}>
            Keep donation
          </Button>
          <Button
            variant="primary"
            loading={withdrawMutation.isPending}
            onClick={() => {
              if (withdrawTarget) {
                withdrawMutation.mutate(withdrawTarget)
              }
            }}
          >
            Withdraw donation
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(acceptTarget)}
        onClose={() => {
          if (!acceptMutation.isPending) {
            setAcceptTargetId(null)
          }
        }}
        title={`Accept request from ${acceptTarget?.requester?.display_name ?? 'this neighbor'}?`}
        description="Choose this recipient and reserve the donation in one step."
      >
        {acceptMutation.isError ? (
          <p className="mb-5 rounded-xl border border-[#f2c8c1] bg-[#fbe4df] px-3.5 py-3 text-sm text-danger" role="alert">
            {acceptMutation.error instanceof Error
              ? acceptMutation.error.message
              : 'This request could not be accepted. Please try again.'}
          </p>
        ) : null}
        {acceptTarget ? (
          <AcceptRequestForm
            requesterName={acceptTarget.requester?.display_name ?? 'this neighbor'}
            onSubmit={async (values) => {
              await acceptMutation.mutateAsync({
                requestId: acceptTarget.id,
                donorReply: values.donorReply,
              })
            }}
            onCancel={() => {
              if (!acceptMutation.isPending) {
                setAcceptTargetId(null)
              }
            }}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={Boolean(declineTarget)}
        onClose={() => {
          if (!declineMutation.isPending) {
            setDeclineTargetId(null)
          }
        }}
        title="Decline this request?"
        description="The requester will see that this request was declined. The donation will remain available for other requests."
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" disabled={declineMutation.isPending} onClick={() => setDeclineTargetId(null)}>
            Keep reviewing
          </Button>
          <Button
            variant="primary"
            loading={declineMutation.isPending}
            onClick={() => {
              if (declineTarget) {
                declineMutation.mutate(declineTarget.id)
              }
            }}
          >
            Decline request
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(completeTarget)}
        onClose={() => {
          if (!completeMutation.isPending) {
            setCompleteTargetId(null)
          }
        }}
        title="Mark this handover complete?"
        description="This closes the accepted request and records the donation as part of your community impact."
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" disabled={completeMutation.isPending} onClick={() => setCompleteTargetId(null)}>
            Not yet
          </Button>
          <Button
            variant="primary"
            loading={completeMutation.isPending}
            onClick={() => {
              if (completeTarget) {
                completeMutation.mutate(completeTarget.id)
              }
            }}
          >
            Mark complete
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
