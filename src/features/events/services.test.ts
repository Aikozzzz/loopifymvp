import { beforeEach, describe, expect, it, vi } from 'vitest'
import { joinEvent, listEvents } from './services'

const supabase = vi.hoisted(() => ({
  from: vi.fn(),
}))

const requireCurrentUser = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase', () => ({ supabase }))
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
  requireCurrentUser,
}))

const event = {
  id: 'event-1',
  creator_id: 'organizer-1',
  title: 'Park cleanup',
  description: 'We will clean the park entrance together.',
  event_type: 'cleanup',
  location_name: 'Kandawgyi Park',
  township: 'Bahan',
  starts_at: '2026-09-01T08:00:00.000Z',
  ends_at: null,
  status: 'upcoming',
  created_at: '2026-08-29T06:00:00.000Z',
  updated_at: '2026-08-29T06:00:00.000Z',
}

describe('event services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('filters events and combines creators with participant counts', async () => {
    const eventsQuery = {
      select: vi.fn(),
      neq: vi.fn(),
      order: vi.fn(),
      eq: vi.fn(),
      or: vi.fn(),
    }
    const profilesQuery = { select: vi.fn(), in: vi.fn() }
    const participantsQuery = { select: vi.fn(), in: vi.fn() }

    eventsQuery.select.mockReturnValue(eventsQuery)
    eventsQuery.neq.mockReturnValue(eventsQuery)
    eventsQuery.eq.mockReturnValue(eventsQuery)
    eventsQuery.order.mockReturnValue(eventsQuery)
    eventsQuery.or.mockResolvedValue({ data: [event], error: null })
    profilesQuery.select.mockReturnValue(profilesQuery)
    profilesQuery.in.mockResolvedValue({
      data: [
        {
          id: 'organizer-1',
          display_name: 'Aye Aye',
          township: 'Bahan',
        },
      ],
      error: null,
    })
    participantsQuery.select.mockReturnValue(participantsQuery)
    participantsQuery.in.mockResolvedValue({
      data: [
        { event_id: 'event-1', user_id: 'person-1' },
        { event_id: 'event-1', user_id: 'person-2' },
      ],
      error: null,
    })
    supabase.from.mockImplementation((table: string) => {
      if (table === 'events') {
        return eventsQuery
      }

      if (table === 'profiles') {
        return profilesQuery
      }

      return participantsQuery
    })

    const result = await listEvents({
      search: 'park',
      eventType: 'cleanup',
    })

    expect(eventsQuery.eq).toHaveBeenCalledWith('event_type', 'cleanup')
    expect(eventsQuery.or).toHaveBeenCalledWith(
      'title.ilike.%park%,description.ilike.%park%,location_name.ilike.%park%,township.ilike.%park%',
    )
    expect(result).toEqual([
      expect.objectContaining({
        id: 'event-1',
        creator: expect.objectContaining({ display_name: 'Aye Aye' }),
        participantCount: 2,
      }),
    ])
  })

  it('gives duplicate event participation a friendly error', async () => {
    requireCurrentUser.mockResolvedValue({ id: 'person-1' })
    const participationQuery = {
      insert: vi.fn().mockResolvedValue({
        error: { code: '23505', message: 'duplicate key value' },
      }),
    }
    supabase.from.mockReturnValue(participationQuery)

    await expect(joinEvent('event-1')).rejects.toThrow(
      'You have already joined this event.',
    )
    expect(participationQuery.insert).toHaveBeenCalledWith({
      event_id: 'event-1',
      user_id: 'person-1',
    })
  })
})
