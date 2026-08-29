import { createDonationSchema, donationFormSchema, validateDonationImage } from '@/features/donations/schemas'
import {
  DONATION_PAGE_SIZE,
  PUBLIC_DONATION_STATUSES,
} from '@/features/donations/constants'
import type { Donation, DonationFilters, DonationFormSubmit, DonationPage } from '@/features/donations/types'
import { requireCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import type { Item, ItemCategory, ItemCondition, ItemStatus, Profile } from '@/types/database'

const IMAGE_BUCKET = 'item-images'
const DONOR_SELECT = 'id, display_name, township, avatar_url'
const ITEM_SELECT = `*, donor:profiles!items_donor_id_fkey(${DONOR_SELECT})`

type DonationQueryRow = Item & {
  donor: Pick<Profile, 'id' | 'display_name' | 'township' | 'avatar_url'> | Pick<Profile, 'id' | 'display_name' | 'township' | 'avatar_url'>[] | null
}

type OwnedDonationRow = Pick<Item, 'id' | 'donor_id' | 'image_path' | 'status'>

export class DonationServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DonationServiceError'
  }
}

function asServiceError(error: { message?: string } | null, fallback: string): DonationServiceError {
  return new DonationServiceError(error?.message || fallback)
}

function getImageUrl(imagePath: string): string {
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath
  }

  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(imagePath).data.publicUrl
}

function mapDonation(row: DonationQueryRow): Donation {
  const donor = Array.isArray(row.donor) ? row.donor[0] ?? null : row.donor

  return {
    ...row,
    donor,
    imageUrl: getImageUrl(row.image_path),
  }
}

function normalizeSearchValue(value: string): string {
  return value.trim().slice(0, 100).replace(/[\\%_*,()]/g, ' ').trim()
}

function normalizeLikeValue(value: string): string {
  return normalizeSearchValue(value).replace(/\s+/g, ' ')
}

function toPickupDeadline(value: string | undefined): string | null {
  if (!value) {
    return null
  }

  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toISOString() : null
}

function toItemFields(values: DonationFormSubmit) {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category as ItemCategory,
    condition: values.condition as ItemCondition,
    township: values.township.trim(),
    food_expiration_date: values.category === 'sealed_food' ? values.foodExpirationDate || null : null,
    pickup_deadline: values.category === 'sealed_food' ? toPickupDeadline(values.pickupDeadline) : null,
  }
}

async function uploadDonationImage(userId: string, file: File): Promise<string> {
  const validationMessage = validateDonationImage(file)

  if (validationMessage) {
    throw new DonationServiceError(validationMessage)
  }

  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const imagePath = `${userId}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(imagePath, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    throw asServiceError(error, 'The image could not be uploaded. Please try again.')
  }

  return imagePath
}

async function removeDonationImage(userId: string, imagePath: string | null | undefined) {
  if (!imagePath || !imagePath.startsWith(`${userId}/`)) {
    return
  }

  await supabase.storage.from(IMAGE_BUCKET).remove([imagePath])
}

export async function listDonations(filters: DonationFilters = {}): Promise<DonationPage> {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? DONATION_PAGE_SIZE))
  const start = (page - 1) * pageSize

  let query = supabase
    .from('items')
    .select(ITEM_SELECT, { count: 'exact' })
    .neq('status', 'withdrawn' as ItemStatus)
    .order('status', { ascending: true })
    .order('created_at', { ascending: false })

  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }

  if (filters.status && filters.status !== 'all' && PUBLIC_DONATION_STATUSES.includes(filters.status as (typeof PUBLIC_DONATION_STATUSES)[number])) {
    query = query.eq('status', filters.status)
  }

  const township = filters.township ? normalizeLikeValue(filters.township) : ''
  if (township) {
    query = query.ilike('township', `%${township}%`)
  }

  const search = filters.search ? normalizeSearchValue(filters.search) : ''
  if (search) {
    const pattern = `%${search}%`
    query = query.or(`title.ilike.${pattern},description.ilike.${pattern},township.ilike.${pattern}`)
  }

  const { data, error, count } = await query.range(start, start + pageSize - 1)

  if (error) {
    throw asServiceError(error, 'Donations could not be loaded. Please try again.')
  }

  const items = ((data ?? []) as unknown as DonationQueryRow[]).map(mapDonation)
  const total = count ?? items.length

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getDonation(id: string): Promise<Donation> {
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw asServiceError(error, 'Donation details could not be loaded. Please try again.')
  }

  if (!data) {
    throw new DonationServiceError('This donation is no longer available.')
  }

  return mapDonation(data as unknown as DonationQueryRow)
}

export async function listMyDonations(): Promise<Donation[]> {
  const user = await requireCurrentUser()
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_SELECT)
    .eq('donor_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw asServiceError(error, 'Your donations could not be loaded. Please try again.')
  }

  return ((data ?? []) as unknown as DonationQueryRow[]).map(mapDonation)
}

export async function getMyDonation(id: string): Promise<Donation> {
  const user = await requireCurrentUser()
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_SELECT)
    .eq('id', id)
    .eq('donor_id', user.id)
    .maybeSingle()

  if (error) {
    throw asServiceError(error, 'Your donation could not be loaded. Please try again.')
  }

  if (!data) {
    throw new DonationServiceError('Donation not found or you do not have access to it.')
  }

  return mapDonation(data as unknown as DonationQueryRow)
}

export async function createDonation(values: DonationFormSubmit): Promise<Donation> {
  const parsedValues = createDonationSchema.parse(values)
  const user = await requireCurrentUser()
  if (!parsedValues.image) {
    throw new DonationServiceError('Add one clear photo before publishing.')
  }
  const imagePath = await uploadDonationImage(user.id, parsedValues.image)

  const { data, error } = await supabase
    .from('items')
    .insert({
      donor_id: user.id,
      image_path: imagePath,
      ...toItemFields(parsedValues),
    })
    .select(ITEM_SELECT)
    .single()

  if (error) {
    await removeDonationImage(user.id, imagePath)
    throw asServiceError(error, 'Your donation could not be published. Please try again.')
  }

  return mapDonation(data as unknown as DonationQueryRow)
}

export async function updateDonation(id: string, values: DonationFormSubmit): Promise<Donation> {
  const parsedValues = donationFormSchema.parse(values)
  const user = await requireCurrentUser()
  const { data: existing, error: existingError } = await supabase
    .from('items')
    .select('id, donor_id, image_path, status')
    .eq('id', id)
    .eq('donor_id', user.id)
    .maybeSingle()

  if (existingError) {
    throw asServiceError(existingError, 'Your donation could not be loaded. Please try again.')
  }

  if (!existing) {
    throw new DonationServiceError('Donation not found or you do not have access to it.')
  }

  const existingDonation = existing as OwnedDonationRow
  if (existingDonation.status !== 'available') {
    throw new DonationServiceError('Only available donations can be edited.')
  }

  let newImagePath: string | undefined
  if (parsedValues.image) {
    newImagePath = await uploadDonationImage(user.id, parsedValues.image)
  }

  const { data, error } = await supabase
    .from('items')
    .update({
      ...(newImagePath ? { image_path: newImagePath } : {}),
      ...toItemFields(parsedValues),
    })
    .eq('id', id)
    .eq('donor_id', user.id)
    .eq('status', 'available')
    .select(ITEM_SELECT)
    .single()

  if (error) {
    if (newImagePath) {
      await removeDonationImage(user.id, newImagePath)
    }
    throw asServiceError(error, 'Your donation could not be updated. Please try again.')
  }

  if (newImagePath && newImagePath !== existingDonation.image_path) {
    await removeDonationImage(user.id, existingDonation.image_path)
  }

  return mapDonation(data as unknown as DonationQueryRow)
}

export async function withdrawDonation(id: string): Promise<void> {
  const { error } = await supabase.rpc('withdraw_item', { p_item_id: id })

  if (error) {
    throw asServiceError(error, 'This donation could not be withdrawn. Please try again.')
  }
}
