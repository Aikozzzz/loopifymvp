import { ArrowUpRight, CalendarDays, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { eventStatusLabels, eventTypeLabels, formatEventDate } from '../formatters'
import type { EventSummary } from '../services'

interface EventCardProps {
  event: EventSummary
}

export function EventCard({ event }: EventCardProps) {
  const isUpcoming = event.status === 'upcoming'

  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_16px_30px_rgba(23,59,48,0.08)]">
      <Link className="block p-5 sm:p-6" to={`/events/${event.id}`}>
        <div className="flex items-start justify-between gap-4">
          <Badge tone={isUpcoming ? 'green' : 'blue'} dot>
            {eventStatusLabels[event.status]}
          </Badge>
          <ArrowUpRight
            className="size-5 text-muted/60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
            aria-hidden="true"
          />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-muted">
          {eventTypeLabels[event.event_type]}
        </p>
        <h2 className="mt-2 line-clamp-2 text-xl font-extrabold tracking-[-0.04em] text-ink">
          {event.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
          {event.description}
        </p>
        <div className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm font-semibold text-ink">
          <p className="flex items-start gap-2.5">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>{formatEventDate(event.starts_at)}</span>
          </p>
          <p className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              {event.location_name}
              <span className="font-normal text-muted"> · {event.township}</span>
            </span>
          </p>
          <p className={cn('flex items-center gap-2.5', event.participantCount > 0 ? 'text-ink' : 'text-muted')}>
            <Users className="size-4 shrink-0 text-primary" aria-hidden="true" />
            {event.participantCount} {event.participantCount === 1 ? 'person' : 'people'} joining
          </p>
        </div>
        <p className="mt-5 text-xs font-semibold text-muted">
          Hosted by {event.creator?.display_name ?? 'a community organizer'}
        </p>
      </Link>
    </Card>
  )
}
