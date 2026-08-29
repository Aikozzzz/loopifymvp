import { CalendarDays, CalendarPlus, Search, SearchX } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { Card, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EventCard } from '@/features/events/components/EventCard'
import { EventListSkeleton } from '@/features/events/components/EventListSkeleton'
import { listEvents } from '@/features/events/services'
import type { EventType } from '@/types/database'

export function EventsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [eventType, setEventType] = useState('all')
  const eventsQuery = useQuery({
    queryKey: ['events', { search, eventType }],
    queryFn: () =>
      listEvents({
        search,
        eventType: eventType as EventType | 'all',
      }),
  })
  const events = eventsQuery.data ?? []
  const upcomingCount = events.filter((event) => event.status === 'upcoming').length
  const hasFilters = Boolean(search.trim()) || eventType !== 'all'

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
      <PageHeader
        eyebrow="Show up together"
        title="Community events with room for you."
        description="Find simple ways to care for a shared place, help a local cause, or start something with your neighbors."
        action={
          <Link className={buttonStyles({ variant: 'secondary', size: 'md' })} to="/events/create">
            <CalendarPlus className="size-4" aria-hidden="true" />
            Start an event
          </Link>
        }
      />

      <Card className="mt-8 p-3 sm:p-4">
        <form className="grid gap-3 sm:grid-cols-[1.4fr_0.8fr]" onSubmit={(event) => event.preventDefault()}>
          <label className="sr-only" htmlFor="event-search">Search events</label>
          <Input id="event-search" icon={<Search className="size-4" />} placeholder="Search events or places" type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
          <label className="sr-only" htmlFor="event-type">Filter by event type</label>
          <Select id="event-type" value={eventType} onChange={(event) => setEventType(event.target.value)}>
            <option value="all">All event types</option>
            <option value="cleanup">Cleanup</option>
            <option value="food_drive">Food drive</option>
            <option value="clothing_drive">Clothing drive</option>
            <option value="recycling">Recycling</option>
          </Select>
        </form>
      </Card>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Badge tone="blue" dot>Upcoming</Badge>
        <span className="text-sm text-muted">
          {upcomingCount} {upcomingCount === 1 ? 'event' : 'events'} in the community calendar
        </span>
      </div>

      <div className="mt-5">
        {eventsQuery.isPending ? <EventListSkeleton /> : null}

        {eventsQuery.isError ? (
          <Card>
            <CardContent className="flex flex-col items-center px-6 py-14 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-peach text-[#9b6649]">
                <SearchX className="size-6" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-lg font-bold text-ink">Events could not load.</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                {eventsQuery.error instanceof Error
                  ? eventsQuery.error.message
                  : 'Please try again in a moment.'}
              </p>
              <Button className="mt-6" variant="outline" onClick={() => eventsQuery.refetch()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {eventsQuery.isSuccess && events.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No events match those filters.' : 'Make the first gathering.'}
            description={
              hasFilters
                ? 'Try a different search or event type, or clear the filters to see every community event.'
                : 'There are no upcoming events yet. Create a small, clear invitation and give your neighbors a reason to show up.'
            }
            icon={<SearchX className="size-6" aria-hidden="true" />}
            actionLabel={hasFilters ? 'Clear filters' : 'Create an event'}
            onAction={() => {
              if (hasFilters) {
                setSearch('')
                setEventType('all')
                return
              }

              navigate('/events/create')
            }}
          />
        ) : null}

        {eventsQuery.isSuccess && events.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard event={event} key={event.id} />
            ))}
          </div>
        ) : null}
      </div>
      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted">
        <CalendarDays className="size-4" aria-hidden="true" />
        <span>Every event includes a clear time, public location, and participant count.</span>
      </div>
    </div>
  )
}
