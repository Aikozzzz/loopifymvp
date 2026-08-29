import { describe, expect, it } from 'vitest'
import { eventFormSchema } from './schemas'

function futureDateTime(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString().slice(0, 16)
}

const validEvent = {
  title: '  Sunday cleanup  ',
  description: 'We will clean the park entrance and sort the collected waste.',
  eventType: 'cleanup' as const,
  locationName: 'Kandawgyi Park entrance',
  township: 'Mingalar Taung Nyunt',
  startsAt: futureDateTime(24),
  endsAt: futureDateTime(26),
}

describe('event schema', () => {
  it('accepts and trims a future event', () => {
    expect(eventFormSchema.parse(validEvent)).toMatchObject({
      title: 'Sunday cleanup',
      locationName: validEvent.locationName,
    })
  })

  it('requires the event to start in the future', () => {
    const result = eventFormSchema.safeParse({
      ...validEvent,
      startsAt: new Date(Date.now() - 60 * 60 * 1000).toISOString().slice(0, 16),
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['startsAt'],
            message: 'Events must start in the future.',
          }),
        ]),
      )
    }
  })

  it('requires the end time to follow the start time', () => {
    const result = eventFormSchema.safeParse({
      ...validEvent,
      endsAt: validEvent.startsAt,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'The end time must be after the start time.',
      )
    }
  })
})
