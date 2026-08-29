import { useQuery } from '@tanstack/react-query'
import { getDonation, getMyDonation, listDonations, listMyDonations } from '@/features/donations/services/donationService'
import type { DonationFilters } from '@/features/donations/types'

export function useDonationFeed(filters: DonationFilters) {
  return useQuery({
    queryKey: ['donations', 'feed', filters],
    queryFn: () => listDonations(filters),
  })
}

export function useDonation(id: string | undefined) {
  return useQuery({
    queryKey: ['donations', 'detail', id],
    queryFn: () => getDonation(id as string),
    enabled: Boolean(id),
  })
}

export function useMyDonations() {
  return useQuery({
    queryKey: ['donations', 'mine'],
    queryFn: listMyDonations,
  })
}

export function useMyDonation(id: string | undefined) {
  return useQuery({
    queryKey: ['donations', 'mine', id],
    queryFn: () => getMyDonation(id as string),
    enabled: Boolean(id),
  })
}
