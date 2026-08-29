import { donationRequestSchema, donorReplySchema } from '@/features/requests/schemas'
import type { DonationRequestWithRelations, RequestParticipant } from '@/features/requests/types'
import { requireCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import type {
  DonationRequest,
  Item,
  Profile,
} from '@/types/database'

const IMAGE_BUCKET = 'item-images'
const PROFILE_SELECT = 'id, display_name, township, avatar_url'
const REQUEST_SELECT = `*, item:items!donation_requests_item_id_fkey(*, donor:profiles!items_donor_id_fkey(${PROFILE_SELECT})), requester:profiles!donation_requests_requester_id_fkey(${PROFILE_SELECT})`

type SupabaseError = {
  code?: string
  message?: string
}

type RelatedItem = Item & {
  donor:
    | Pick<Profile, 'id' | 'display_name' | 'township' | 'avatar_url'>
    | Pick<Profile, 'id' | 'display_name' | 'township' | 'avatar_url'>[]
    | null
}

type RequestQueryRow = DonationRequest & {
  item: RelatedItem | RelatedItem[] | null
  requester:
    | RequestParticipant
    | RequestParticipant[]
    | null
}

export class RequestServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RequestServiceError'
  }
}

function getImageUrl(imagePath: string): string {
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath
  }

  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(imagePath).data.publicUrl
}

function getRelatedValue<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value
}

function mapRequest(row: RequestQueryRow): DonationRequestWithRelations {
  const item = getRelatedValue(row.item)
  const donor = item ? getRelatedValue(item.donor) : null
  const requester = getRelatedValue(row.requester)

  return {
    ...row,
    item: item
      ? {
          ...item,
          donor,
          imageUrl: getImageUrl(item.image_path),
        }
      : null,
    requester,
  }
}

function toServiceError(error: SupabaseError | null, fallback: string): RequestServiceError {
  const message = error?.message?.toLowerCase() ?? ''

  if (
    error?.code === '23505' ||
    message.includes('duplicate key') ||
    message.includes('unique constraint')
  ) {
    return new RequestServiceError('You have already requested this donation.')
  }

  if (message.includes('own donation') || message.includes('donors cannot request')) {
    return new RequestServiceError('You cannot request your own donation.')
  }

  if (
    message.includes('not available') ||
    message.includes('no longer available') ||
    message.includes('row-level security')
  ) {
    return new RequestServiceError('This donation is no longer available for requests.')
  }

  if (message.includes('no longer pending')) {
    return new RequestServiceError('This request has already been decided.')
  }

  if (message.includes('permission denied')) {
    return new RequestServiceError('You do not have permission to update this request.')
  }

  if (message.includes('not found')) {
    return new RequestServiceError('This request or donation is no longer available.')
  }

  return new RequestServiceError(fallback)
}

async function getItemForRequest(itemId: string): Promise<Pick<Item, 'id' | 'donor_id' | 'status'>> {
  const { data, error } = await supabase
    .from('items')
    .select('id, donor_id, status')
    .eq('id', itemId)
    .maybeSingle()

  if (error) {
    throw toServiceError(error, 'This donation could not be checked. Please try again.')
  }

  if (!data) {
    throw new RequestServiceError('This donation could not be found.')
  }

  return data
}

export async function listMyRequests(): Promise<DonationRequestWithRelations[]> {
  const user = await requireCurrentUser()
  const { data, error } = await supabase
    .from('donation_requests')
    .select(REQUEST_SELECT)
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw toServiceError(error, 'Your requests could not be loaded. Please try again.')
  }

  return ((data ?? []) as unknown as RequestQueryRow[]).map(mapRequest)
}

export async function getMyRequestForDonation(
  itemId: string,
): Promise<DonationRequestWithRelations | null> {
  const user = await requireCurrentUser()
  const { data, error } = await supabase
    .from('donation_requests')
    .select(REQUEST_SELECT)
    .eq('item_id', itemId)
    .eq('requester_id', user.id)
    .maybeSingle()

  if (error) {
    throw toServiceError(error, 'Your request status could not be loaded. Please try again.')
  }

  return data ? mapRequest(data as unknown as RequestQueryRow) : null
}

export async function listRequestsForDonations(
  itemIds: string[],
): Promise<DonationRequestWithRelations[]> {
  await requireCurrentUser()
  const uniqueItemIds = [...new Set(itemIds)]

  if (uniqueItemIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('donation_requests')
    .select(REQUEST_SELECT)
    .in('item_id', uniqueItemIds)
    .order('created_at', { ascending: true })

  if (error) {
    throw toServiceError(error, 'Donation requests could not be loaded. Please try again.')
  }

  return ((data ?? []) as unknown as RequestQueryRow[]).map(mapRequest)
}

export async function createDonationRequest(
  itemId: string,
  requestMessage: string,
): Promise<DonationRequestWithRelations> {
  const values = donationRequestSchema.parse({ requestMessage })
  const user = await requireCurrentUser()
  const item = await getItemForRequest(itemId)

  if (item.donor_id === user.id) {
    throw new RequestServiceError('You cannot request your own donation.')
  }

  if (item.status !== 'available') {
    throw new RequestServiceError('This donation is no longer available for requests.')
  }

  const { data: existingRequest, error: existingRequestError } = await supabase
    .from('donation_requests')
    .select('id')
    .eq('item_id', itemId)
    .eq('requester_id', user.id)
    .maybeSingle()

  if (existingRequestError) {
    throw toServiceError(existingRequestError, 'Your existing request could not be checked.')
  }

  if (existingRequest) {
    throw new RequestServiceError('You have already requested this donation.')
  }

  const { data, error } = await supabase
    .from('donation_requests')
    .insert({
      item_id: itemId,
      requester_id: user.id,
      request_message: values.requestMessage,
    })
    .select(REQUEST_SELECT)
    .single()

  if (error) {
    throw toServiceError(error, 'Your request could not be sent. Please try again.')
  }

  return mapRequest(data as unknown as RequestQueryRow)
}

export async function acceptDonationRequest(
  requestId: string,
  donorReply = '',
): Promise<void> {
  const values = donorReplySchema.parse({ donorReply })
  await requireCurrentUser()
  const { error } = await supabase.rpc('accept_donation_request', {
    p_request_id: requestId,
    p_donor_reply: values.donorReply || null,
  })

  if (error) {
    throw toServiceError(error, 'This request could not be accepted. Please try again.')
  }
}

export async function declineDonationRequest(requestId: string): Promise<void> {
  await requireCurrentUser()
  const { error } = await supabase.rpc('decline_donation_request', {
    p_request_id: requestId,
  })

  if (error) {
    throw toServiceError(error, 'This request could not be declined. Please try again.')
  }
}

export async function cancelDonationRequest(requestId: string): Promise<void> {
  await requireCurrentUser()
  const { error } = await supabase.rpc('cancel_donation_request', {
    p_request_id: requestId,
  })

  if (error) {
    throw toServiceError(error, 'This request could not be cancelled. Please try again.')
  }
}

export async function completeDonation(itemId: string): Promise<void> {
  await requireCurrentUser()
  const { error } = await supabase.rpc('complete_donation', {
    p_item_id: itemId,
  })

  if (error) {
    throw toServiceError(error, 'The handover could not be marked complete. Please try again.')
  }
}
