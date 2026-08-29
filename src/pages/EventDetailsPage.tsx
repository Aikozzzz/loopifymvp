import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Pencil,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { EventParticipationActions } from '@/features/events/components/EventParticipationActions'
import { EventSafetyGuidance } from '@/features/events/components/EventSafetyGuidance'
import {
  eventStatusLabels,
  eventTypeLabels,
  formatEventDateRange,
} from '@/features/events/formatters'
import { cancelEvent, completeEvent, getEventDetails } from '@/features/events/services'
import { ReportDialog } from '@/features/reports/components/ReportDialog'
import { AuthRequiredError } from '@/lib/auth'

export function EventDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  const eventQuery = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventDetails(id as string),
    enabled: Boolean(id),
  })
  const refreshEvents = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['event', id] }),
      queryClient.invalidateQueries({ queryKey: ['events'] }),
    ])
  }
  const cancelMutation = useMutation({
    mutationFn: () => cancelEvent(id as string),
    onSuccess: async () => {
      await refreshEvents()
      setIsCancelDialogOpen(false)
      toast.success('The event has been cancelled.')
    },
    onError: (error: Error) => {
      if (error instanceof AuthRequiredError) {
        navigate('/login', { state: { from: `/events/${id}` } })
        return
      }

      toast.error(error.message || 'We could not cancel this event.')
    },
  })
  const completeMutation = useMutation({
    mutationFn: () => completeEvent(id as string),
    onSuccess: async () => {
      await refreshEvents()
      toast.success('The event is marked complete. Thanks for showing up.')
    },
    onError: (error: Error) => {
      if (error instanceof AuthRequiredError) {
        navigate('/login', { state: { from: `/events/${id}` } })
        return
      }

      toast.error(error.message || 'We could not complete this event.')
    },
  })

  if (!id) {
    return (
      <EmptyState
        className="mx-auto mt-12 max-w-3xl"
        title="This event link is incomplete."
        description="Return to the events calendar and choose an event to view."
        actionLabel="Browse events"
        onAction={() => navigate('/events')}
      />
    )
  }

  if (eventQuery.isPending) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10" aria-label="Loading event">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-8 h-72 rounded-panel" />
        <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_20rem]">
          <Skeleton className="h-48 rounded-card" />
          <Skeleton className="h-72 rounded-card" />
        </div>
      </div>
    )
  }

  if (eventQuery.isError || !eventQuery.data) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink" to="/events">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to events
        </Link>
        <EmptyState
          className="mt-10"
          title="This event is no longer available."
          description={
            eventQuery.error instanceof Error
              ? eventQuery.error.message
              : 'The event may have been removed or the link may be outdated.'
          }
          actionLabel="Browse events"
          onAction={() => navigate('/events')}
        />
      </div>
    )
  }

  const { event, participantCount, isJoined, isOrganizer } = eventQuery.data
  const canComplete =
    isOrganizer &&
    event.status === 'upcoming' &&
    new Date(event.starts_at).getTime() <= now
  const statusTone = event.status === 'upcoming' ? 'green' : 'blue'

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
      <Link className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink" to="/events">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to events
      </Link>
      <div className="rounded-panel bg-primary p-6 text-white sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-white/10 text-lime" tone="green">Community event</Badge>
          <Badge className="bg-white/10 text-white/75" tone={statusTone}>
            {eventStatusLabels[event.status]}
          </Badge>
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-white/55">
          {eventTypeLabels[event.event_type]}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-[-0.05em] sm:text-5xl">
          {event.title}
        </h1>
        <p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-relaxed text-white/70">
          {event.description}
        </p>
        <div className="mt-8 grid gap-4 text-sm font-semibold text-white/75 sm:grid-cols-3">
          <span className="flex items-start gap-2"><CalendarDays className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden="true" />{formatEventDateRange(event.starts_at, event.ends_at)}</span>
          <span className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden="true" />{event.location_name}, {event.township}</span>
          <span className="flex items-start gap-2"><Users className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden="true" />{participantCount} {participantCount === 1 ? 'person' : 'people'} joining</span>
        </div>
      </div>

      <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-5">
              <EventParticipationActions
                eventId={event.id}
                status={event.status}
                startsAt={event.starts_at}
                participantCount={participantCount}
                isJoined={isJoined}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-line">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">The plan</p>
              <h2 className="text-xl font-extrabold tracking-[-0.04em] text-ink">What to expect</h2>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-ink">When</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{formatEventDateRange(event.starts_at, event.ends_at)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-ink">Where</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{event.location_name} in {event.township}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-ink">Who is hosting</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{event.creator?.display_name ?? 'A community organizer'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {isOrganizer ? (
            <Card className="bg-sage">
              <CardContent className="pt-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Organizer controls</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {event.status === 'upcoming' ? (
                    <Link className={buttonStyles({ variant: 'outline', size: 'sm' })} to={`/events/${event.id}/edit`}>
                      <Pencil className="size-4" aria-hidden="true" />
                      Edit event
                    </Link>
                  ) : null}
                  {event.status === 'upcoming' ? (
                    <Button variant="danger" size="sm" onClick={() => setIsCancelDialogOpen(true)}>
                      Cancel event
                    </Button>
                  ) : null}
                  {canComplete ? (
                    <Button
                      loading={completeMutation.isPending}
                      variant="primary"
                      size="sm"
                      onClick={() => completeMutation.mutate()}
                    >
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                      Mark complete
                    </Button>
                  ) : event.status === 'upcoming' ? (
                    <span className="flex items-center text-xs font-semibold text-muted">
                      Completion opens when the event starts.
                    </span>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="space-y-4">
          <EventSafetyGuidance />
          <Card>
            <CardContent className="flex items-start gap-3 pt-5">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-ink">See something concerning?</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  Reports are private and help keep local gatherings welcoming.
                </p>
                <div className="mt-4">
                  <ReportDialog eventId={event.id} />
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Dialog
        open={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        title="Cancel this event?"
        description="People who joined will no longer see it as an upcoming gathering. This cannot be undone from the event page."
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setIsCancelDialogOpen(false)}>
            Keep event
          </Button>
          <Button
            loading={cancelMutation.isPending}
            variant="danger"
            onClick={() => cancelMutation.mutate()}
          >
            Cancel event
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
