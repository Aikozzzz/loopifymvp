import type { BadgeTone } from '@/components/ui/Badge'
import type { ItemCategory, ItemCondition, ItemStatus } from '@/types/database'

export const DONATION_PAGE_SIZE = 12

export const DONATION_CATEGORIES = [
  'clothes',
  'books',
  'electronics',
  'furniture',
  'sealed_food',
  'household',
  'other',
] as const satisfies readonly ItemCategory[]

export const DONATION_CATEGORY_LABELS: Record<ItemCategory, string> = {
  clothes: 'Clothing',
  books: 'Books',
  electronics: 'Electronics',
  furniture: 'Furniture',
  sealed_food: 'Sealed food',
  household: 'Household',
  other: 'Other',
}

export const DONATION_CONDITIONS = ['new', 'like_new', 'good', 'fair'] as const satisfies readonly ItemCondition[]

export const DONATION_CONDITION_LABELS: Record<ItemCondition, string> = {
  new: 'New',
  like_new: 'Like new',
  good: 'Good',
  fair: 'Fair',
}

export const PUBLIC_DONATION_STATUSES = ['available', 'reserved', 'completed'] as const satisfies readonly ItemStatus[]

export const DONATION_STATUS_LABELS: Record<ItemStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  completed: 'Donated',
  withdrawn: 'Withdrawn',
}

export const DONATION_STATUS_TONES: Record<ItemStatus, BadgeTone> = {
  available: 'green',
  reserved: 'yellow',
  completed: 'blue',
  withdrawn: 'neutral',
}

export const COMMON_TOWNSHIPS = [
  'Bahan',
  'Kamayut',
  'Sanchaung',
  'Hlaing',
  'Mayangone',
  'Yankin',
  'Mingalar Taung Nyunt',
] as const
