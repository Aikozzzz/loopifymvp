import { ArrowRight, CheckCircle2, Clock3, HeartHandshake, Inbox, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/features/auth/useAuth'
import { DonationRequestCard } from '@/features/requests/components/DonationRequestCard'
import { useMyRequests } from '@/features/requests/hooks/useRequests'
import { cancelDonationRequest } from '@/features/requests/services/requestService'

export function MyRequestsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const requestsQuery = useMyRequests(user?.id)
  const [activeTab, setActiveTab] = useState<RequestTab>('all')
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null)
  const cancelTarget = requestsQuery.data?.find((request) => request.id === cancelTargetId)
  const cancelMutation = useMutation({
    mutationFn: cancelDonationRequest,
    onSuccess: () => {
      setCancelTargetId(null)
      toast.success('Your request was cancelled.')
      void requestsQuery.refetch()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Your request could not be cancelled.')
    },
  })
  const requests = useMemo(() => requestsQuery.data ?? [], [requestsQuery.data])
  const visibleRequests = useMemo(
    () =>
      requests.filter((request) => {
        if (activeTab === 'all') {
          return true
        }

        if (activeTab === 'closed') {
          return request.status === 'declined' || request.status === 'cancelled'
        }

        return request.status === activeTab
      }),
    [activeTab, requests],
  )
  const pendingCount = requests.filter((request) => request.status === 'pending').length
  const acceptedCount = requests.filter((request) => request.status === 'accepted').length
  const completedCount = requests.filter((request) => request.status === 'fulfilled').length

  return (
    <div>
      <PageHeader
        eyebrow="Things you’re looking for"
        title="My requests"
        description="Follow the donations you’ve reached out for and keep the next step clear."
        action={
          <Button variant="outline" onClick={() => navigate('/feed')}>
            Explore donations
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        }
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Pending', value: pendingCount, icon: Clock3, tone: 'bg-[#fff2c9] text-[#785c13]' },
          { label: 'Accepted', value: acceptedCount, icon: ShieldCheck, tone: 'bg-primary-soft text-primary' },
          { label: 'Completed', value: completedCount, icon: CheckCircle2, tone: 'bg-sky text-[#39727a]' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <span className={`flex size-10 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-ink">{value}</p>
              <p className="mt-0.5 text-xs font-semibold text-muted">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-sage p-1" role="tablist" aria-label="Request status">
          {requestTabs.map((tab) => (
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
          {visibleRequests.length} {visibleRequests.length === 1 ? 'request' : 'requests'}
        </Badge>
      </div>

      {requestsQuery.isPending ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="h-56 animate-pulse rounded-card border border-line bg-sage" key={index} />
          ))}
        </div>
      ) : requestsQuery.isError ? (
        <Card className="mt-5 border-[#f2c8c1] bg-[#fbe4df]" role="alert">
          <CardContent className="pt-5">
            <p className="font-bold text-ink">Your requests could not be loaded.</p>
            <p className="mt-1 text-sm text-muted">Please try again. Your request history is kept safe.</p>
            <Button className="mt-4" variant="outline" onClick={() => void requestsQuery.refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : visibleRequests.length === 0 ? (
        <EmptyState
          className="mt-5"
          title={activeTab === 'all' ? 'The right thing might be nearby.' : 'Nothing in this view yet.'}
          description={
            activeTab === 'all'
              ? 'When you request a donation, you’ll see the conversation and status here. Pickup details stay private until a donor accepts.'
              : 'Try another status filter or explore the donation board for something useful.'
          }
          icon={<Inbox className="size-6" aria-hidden="true" />}
          actionLabel="Explore donations"
          onAction={() => navigate('/feed')}
        />
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {visibleRequests.map((request) => (
            <DonationRequestCard
              key={request.id}
              request={request}
              perspective="recipient"
              actions={
                <>
                  {request.item ? (
                    <Link
                      className="inline-flex items-center justify-center rounded-full border border-line px-3.5 py-2 text-xs font-bold text-ink transition hover:border-ink/25 hover:bg-sage"
                      to={`/donations/${request.item.id}`}
                    >
                      View donation
                    </Link>
                  ) : null}
                  {request.status === 'pending' ? (
                    <Button size="sm" variant="outline" onClick={() => setCancelTargetId(request.id)}>
                      Cancel request
                    </Button>
                  ) : null}
                </>
              }
            />
          ))}
        </div>
      )}

      <Card className="mt-5 bg-primary text-white">
        <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-lime" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold">A thoughtful request goes a long way.</p>
              <p className="mt-1 text-xs leading-relaxed text-white/65">Share why the item would be useful, without sharing more personal information than needed.</p>
            </div>
          </div>
          <Button className="self-start bg-white/10 text-white hover:bg-white/15 sm:self-center" variant="ghost" onClick={() => navigate('/feed')}>
            Find a loop
            <HeartHandshake className="size-4" aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(cancelTarget)}
        onClose={() => {
          if (!cancelMutation.isPending) {
            setCancelTargetId(null)
          }
        }}
        title="Cancel this request?"
        description="The donor will no longer see it as an active request. You cannot send another request for the same donation."
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" disabled={cancelMutation.isPending} onClick={() => setCancelTargetId(null)}>
            Keep request
          </Button>
          <Button
            variant="primary"
            loading={cancelMutation.isPending}
            onClick={() => {
              if (cancelTarget) {
                cancelMutation.mutate(cancelTarget.id)
              }
            }}
          >
            Cancel request
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

type RequestTab = 'all' | 'pending' | 'accepted' | 'fulfilled' | 'closed'

const requestTabs: Array<{ value: RequestTab; label: string }> = [
  { value: 'all', label: 'All requests' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'fulfilled', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
]
