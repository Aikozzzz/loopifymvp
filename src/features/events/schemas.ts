import { z } from 'zod'

export const eventTypes = [
  'cleanup',
  'food_drive',
  'clothing_drive',
  'recycling',
  'other',
] as const

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(3, 'Use at least 3 characters.').max(120, 'Keep the title under 120 characters.'),
    description: z.string().trim().min(10, 'Use at least 10 characters.').max(2000, 'Keep the plan under 2,000 characters.'),
    eventType: z.enum(eventTypes, { message: 'Choose an event type.' }),
    locationName: z.string().trim().min(2, 'Add a public meeting point.').max(150, 'Keep the location under 150 characters.'),
    township: z.string().trim().min(2, 'Add a township or general area.').max(80, 'Keep the township under 80 characters.'),
    startsAt: z.string().min(1, 'Choose a start time.'),
    endsAt: z.string(),
  })
  .superRefine((event, context) => {
    const startsAt = new Date(event.startsAt)

    if (Number.isNaN(startsAt.getTime())) {
      context.addIssue({
        code: 'custom',
        path: ['startsAt'],
        message: 'Choose a valid start time.',
      })
      return
    }

    if (startsAt <= new Date()) {
      context.addIssue({
        code: 'custom',
        path: ['startsAt'],
        message: 'Events must start in the future.',
      })
    }

    if (!event.endsAt) {
      return
    }

    const endsAt = new Date(event.endsAt)

    if (Number.isNaN(endsAt.getTime())) {
      context.addIssue({
        code: 'custom',
        path: ['endsAt'],
        message: 'Choose a valid end time.',
      })
      return
    }

    if (endsAt <= startsAt) {
      context.addIssue({
        code: 'custom',
        path: ['endsAt'],
        message: 'The end time must be after the start time.',
      })
    }
  })

export type EventFormValues = z.infer<typeof eventFormSchema>

export const emptyEventFormValues: EventFormValues = {
  title: '',
  description: '',
  eventType: 'cleanup',
  locationName: '',
  township: '',
  startsAt: '',
  endsAt: '',
}
