import type { Item, ItemCategory, ItemStatus, Profile } from '@/types/database'
import type { DonationFormValues } from '@/features/donations/schemas'

export type Donation = Item & {
  donor: Pick<Profile, 'id' | 'display_name' | 'township' | 'avatar_url'> | null
  imageUrl: string
}

export type DonationFilters = {
  search?: string
  category?: ItemCategory | 'all'
  township?: string
  status?: ItemStatus | 'all'
  page?: number
  pageSize?: number
}

export type DonationPage = {
  items: Donation[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type DonationFormSubmit = DonationFormValues

