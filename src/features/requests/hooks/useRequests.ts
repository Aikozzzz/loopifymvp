import { useQuery } from '@tanstack/react-query'
import {
  getMyRequestForDonation,
  listMyRequests,
  listRequestsForDonations,
} from '@/features/requests/services/requestService'

export function useMyRequests(userId: string | undefined) {
  return useQuery({
    queryKey: ['requests', 'mine', userId],
    queryFn: listMyRequests,
    enabled: Boolean(userId),
  })
}

export function useMyRequestForDonation(itemId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['requests', 'mine', userId, 'item', itemId],
    queryFn: () => getMyRequestForDonation(itemId as string),
    enabled: Boolean(itemId && userId),
  })
}

export function useDonationRequests(itemIds: string[], userId: string | undefined) {
  return useQuery({
    queryKey: ['requests', 'donations', userId, itemIds],
    queryFn: () => listRequestsForDonations(itemIds),
    enabled: itemIds.length > 0 && Boolean(userId),
  })
}
