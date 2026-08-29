import { supabase } from '@/lib/supabase'
import { getCurrentUser, requireCurrentUser } from '@/lib/auth'
import type {
  CommunityEvent,
  EventParticipant,
  EventType,
  Profile,
} from '@/types/database'
import { eventFormSchema, type EventFormValues } from './schemas'

export type EventCreator = Pick<Profile, 'id' | 'display_name' | 'township'>

export type EventSummary = CommunityEvent & {
  creator: EventCreator | null
  participantCount: number
}

export type EventDetails = {
  event: EventSummary
  participantCount: number
  isJoined: boolean
  isOrganizer: boolean
}

export type EventFilters = {
  search?: string
  eventType?: EventType | 'all'
}

function throwIfError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message)
  }
}

function escapeSearchTerm(value: string): string {
  return value.replace(/[%,.()\\]/g, ' ').trim()
}

async function getCreators(creatorIds: string[]): Promise<Map<string, EventCreator>> {
  if (creatorIds.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, township')
    .in('id', creatorIds)

  throwIfError(error)

  return new Map((data ?? []).map((creator) => [creator.id, creator]))
}

async function getParticipantRows(eventIds: string[]): Promise<Pick<EventParticipant, 'event_id' | 'user_id'>[]> {
  if (eventIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('event_participants')
    .select('event_id, user_id')
    .in('event_id', eventIds)

  throwIfError(error)
  return data ?? []
}

function toSummaries(
  events: CommunityEvent[],
  creators: Map<string, EventCreator>,
  participants: Pick<EventParticipant, 'event_id' | 'user_id'>[],
): EventSummary[] {
  const participantCounts = new Map<string, number>()

  for (const participant of participants) {
    participantCounts.set(
      participant.event_id,
      (participantCounts.get(participant.event_id) ?? 0) + 1,
    )
  }

  return events
    .map((event) => ({
      ...event,
      creator: creators.get(event.creator_id) ?? null,
      participantCount: participantCounts.get(event.id) ?? 0,
    }))
    .sort((left, right) => {
      if (left.status !== right.status) {
        return left.status === 'upcoming' ? -1 : 1
      }

      return new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime()
    })
}

export async function listEvents(filters: EventFilters = {}): Promise<EventSummary[]> {
  let query = supabase
    .from('events')
    .select('*')
    .neq('status', 'cancelled')
    .order('starts_at', { ascending: true })

  if (filters.eventType && filters.eventType !== 'all') {
    query = query.eq('event_type', filters.eventType)
  }

  const search = filters.search ? escapeSearchTerm(filters.search) : ''

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,location_name.ilike.%${search}%,township.ilike.%${search}%`,
    )
  }

  const { data, error } = await query
  throwIfError(error)

  const events = data ?? []
  const [creators, participants] = await Promise.all([
    getCreators([...new Set(events.map((event) => event.creator_id))]),
    getParticipantRows(events.map((event) => event.id)),
  ])

  return toSummaries(events, creators, participants)
}

export async function getEvent(eventId: string): Promise<EventSummary> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .maybeSingle()

  throwIfError(error)

  if (!data) {
    throw new Error('This event could not be found.')
  }

  const [creators, participants] = await Promise.all([
    getCreators([data.creator_id]),
    getParticipantRows([data.id]),
  ])

  return toSummaries([data], creators, participants)[0]
}

export async function getEventDetails(eventId: string): Promise<EventDetails> {
  const [event, participants, user] = await Promise.all([
    getEvent(eventId),
    getParticipantRows([eventId]),
    getCurrentUser(),
  ])

  return {
    event,
    participantCount: participants.length,
    isJoined: user ? participants.some((participant) => participant.user_id === user.id) : false,
    isOrganizer: user?.id === event.creator_id,
  }
}

export async function createEvent(input: EventFormValues): Promise<CommunityEvent> {
  const user = await requireCurrentUser()
  const values = eventFormSchema.parse(input)

  const { data, error } = await supabase
    .from('events')
    .insert({
      creator_id: user.id,
      title: values.title,
      description: values.description,
      event_type: values.eventType,
      location_name: values.locationName,
      township: values.township,
      starts_at: new Date(values.startsAt).toISOString(),
      ends_at: values.endsAt ? new Date(values.endsAt).toISOString() : null,
    })
    .select('*')
    .single()

  throwIfError(error)

  if (!data) {
    throw new Error('The event could not be created.')
  }

  return data
}

export async function updateEvent(
  eventId: string,
  input: EventFormValues,
): Promise<CommunityEvent> {
  const user = await requireCurrentUser()
  const values = eventFormSchema.parse(input)

  const { data, error } = await supabase
    .from('events')
    .update({
      title: values.title,
      description: values.description,
      event_type: values.eventType,
      location_name: values.locationName,
      township: values.township,
      starts_at: new Date(values.startsAt).toISOString(),
      ends_at: values.endsAt ? new Date(values.endsAt).toISOString() : null,
    })
    .eq('id', eventId)
    .eq('creator_id', user.id)
    .select('*')
    .single()

  throwIfError(error)

  if (!data) {
    throw new Error('The event could not be updated.')
  }

  return data
}

export async function cancelEvent(eventId: string): Promise<void> {
  await requireCurrentUser()
  const { error } = await supabase.rpc('cancel_event', { p_event_id: eventId })
  throwIfError(error)
}

export async function completeEvent(eventId: string): Promise<void> {
  await requireCurrentUser()
  const { error } = await supabase.rpc('complete_event', { p_event_id: eventId })
  throwIfError(error)
}

export async function joinEvent(eventId: string): Promise<void> {
  const user = await requireCurrentUser()
  const { error } = await supabase.from('event_participants').insert({
    event_id: eventId,
    user_id: user.id,
  })

  if (error?.code === '23505') {
    throw new Error('You have already joined this event.')
  }

  throwIfError(error)
}

export async function leaveEvent(eventId: string): Promise<void> {
  const user = await requireCurrentUser()
  const { error } = await supabase
    .from('event_participants')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', user.id)

  throwIfError(error)
}
