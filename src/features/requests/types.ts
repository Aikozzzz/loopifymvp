import type {
  DonationRequest,
  Profile,
  RequestStatus,
} from '@/types/database'
import type { Donation } from '@/features/donations/types'

export type RequestParticipant = Pick<Profile, 'id' | 'display_name' | 'township' | 'avatar_url'>

export type DonationRequestWithRelations = DonationRequest & {
  item: Donation | null
  requester: RequestParticipant | null
}

export const REQUEST_STATUSES = [
  'pending',
  'accepted',
  'declined',
  'cancelled',
  'fulfilled',
] as const satisfies readonly RequestStatus[]
