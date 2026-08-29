import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { HeartHandshake, Users } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { EventForm } from '@/features/events/components/EventForm'
import { EventSafetyGuidance } from '@/features/events/components/EventSafetyGuidance'
import { toDateTimeLocal } from '@/features/events/formatters'
import {
  createEvent,
  getEvent,
  updateEvent,
} from '@/features/events/services'
import { emptyEventFormValues, type EventFormValues } from '@/features/events/schemas'
import { AuthRequiredError } from '@/lib/auth'

interface EventEditorPageProps {
  eventId?: string
}

function eventToFormValues(event: Awaited<ReturnType<typeof getEvent>>): EventFormValues {
  return {
    title: event.title,
    description: event.description,
    eventType: event.event_type,
    locationName: event.location_name,
    township: event.township,
    startsAt: toDateTimeLocal(event.starts_at),
    endsAt: event.ends_at ? toDateTimeLocal(event.ends_at) : '',
  }
}

export function EventEditorPage({ eventId }: EventEditorPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = Boolean(eventId)
  const eventQuery = useQuery({
    queryKey: ['event-editor', eventId],
    queryFn: () => getEvent(eventId as string),
    enabled: isEditing,
  })
  const saveMutation = useMutation({
    mutationFn: (values: EventFormValues) =>
      eventId ? updateEvent(eventId, values) : createEvent(values),
    onSuccess: async (event) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['event', event.id] }),
      ])
      toast.success(isEditing ? 'Your event has been updated.' : 'Your event is live.')
      navigate(`/events/${event.id}`)
    },
    onError: (error: Error) => {
      if (error instanceof AuthRequiredError) {
        navigate('/login', { state: { from: isEditing ? `/events/${eventId}/edit` : '/events/create' } })
        return
      }

      toast.error(error.message || 'We could not save this event.')
    },
  })

  if (isEditing && eventQuery.isPending) {
    return (
      <div className="mx-auto w-full max-w-6xl" aria-label="Loading event editor">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-12 w-2/3" />
        <Skeleton className="mt-3 h-5 w-full max-w-xl" />
        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_20rem]">
          <Skeleton className="h-[42rem] rounded-card" />
          <Skeleton className="h-72 rounded-card" />
        </div>
      </div>
    )
  }

  if (isEditing && (eventQuery.isError || !eventQuery.data)) {
    return (
      <EmptyState
        title="This event cannot be edited."
        description={
          eventQuery.error instanceof Error
            ? eventQuery.error.message
            : 'The event may have been removed or you may not be its organizer.'
        }
        actionLabel="Browse events"
        onAction={() => navigate('/events')}
      />
    )
  }

  const initialValues = isEditing && eventQuery.data
    ? eventToFormValues(eventQuery.data)
    : emptyEventFormValues

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        eyebrow={isEditing ? 'Keep your invitation current' : 'Bring people together'}
        title={isEditing ? 'Edit your community event.' : 'Start a community event.'}
        description="Make it easy for neighbors to understand what’s happening, where to meet, and how they can help."
        action={
          <Link className="text-sm font-semibold text-muted hover:text-ink" to="/events">
            Browse events
          </Link>
        }
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_20rem]">
        <EventForm
          initialValues={initialValues}
          isSubmitting={saveMutation.isPending}
          onSubmit={(values) => saveMutation.mutate(values)}
          submitLabel={isEditing ? 'Save changes' : 'Publish event'}
        />

        <aside className="space-y-4">
          <EventSafetyGuidance />
          <Card className="bg-sky">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-[#39727a]">
                <Users className="size-6" aria-hidden="true" />
                <HeartHandshake className="size-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-ink">Make it welcoming</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                A short plan, public location, and realistic timing give people confidence to join.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

export function CreateEventPage() {
  return <EventEditorPage />
}

export function EditEventPage() {
  const { id } = useParams()
  return <EventEditorPage eventId={id} />
}
