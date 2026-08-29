import { format } from 'date-fns'
import type { EventStatus, EventType } from '@/types/database'

export const eventTypeLabels: Record<EventType, string> = {
  cleanup: 'Cleanup',
  food_drive: 'Food drive',
  clothing_drive: 'Clothing drive',
  recycling: 'Recycling',
  other: 'Other',
}

export const eventStatusLabels: Record<EventStatus, string> = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function formatEventDate(value: string): string {
  return format(new Date(value), 'EEE, MMM d · h:mm a')
}

export function formatEventDateRange(startsAt: string, endsAt: string | null): string {
  const start = formatEventDate(startsAt)

  if (!endsAt) {
    return start
  }

  return `${start} – ${format(new Date(endsAt), 'h:mm a')}`
}

export function toDateTimeLocal(value: string): string {
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)

  return localDate.toISOString().slice(0, 16)
}

export function getMinimumDateTime(): string {
  return toDateTimeLocal(new Date().toISOString())
}
