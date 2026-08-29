import { z } from 'zod'
import { DONATION_CATEGORIES, DONATION_CONDITIONS } from '@/features/donations/constants'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

function isSupportedImage(value: unknown): value is File {
  return (
    typeof File !== 'undefined' &&
    value instanceof File &&
    SUPPORTED_IMAGE_TYPES.includes(value.type as (typeof SUPPORTED_IMAGE_TYPES)[number]) &&
    value.size > 0 &&
    value.size <= MAX_IMAGE_SIZE
  )
}

const optionalImageSchema = z
  .custom<File | undefined>(
    (value) => value === undefined || isSupportedImage(value),
    'Choose one JPG, PNG, or WebP image up to 5 MB.',
  )
  .optional()

const donationFieldsSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(100, 'Title must be 100 characters or fewer.'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters.')
    .max(1500, 'Description must be 1,500 characters or fewer.'),
  category: z.enum(DONATION_CATEGORIES, { error: 'Choose a donation category.' }),
  condition: z.enum(DONATION_CONDITIONS, { error: 'Choose the item condition.' }),
  township: z.string().trim().min(2, 'Add a township or general area.').max(80, 'Township must be 80 characters or fewer.'),
  foodExpirationDate: z.string().optional(),
  pickupDeadline: z.string().optional(),
  image: optionalImageSchema,
})

function addDateIssue(
  context: z.RefinementCtx,
  path: 'foodExpirationDate' | 'pickupDeadline',
  message: string,
) {
  context.addIssue({
    code: 'custom',
    path: [path],
    message,
  })
}

function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const date = new Date(`${value}T00:00:00`)
  return (
    Number.isFinite(date.getTime()) &&
    date.getFullYear() === Number(value.slice(0, 4)) &&
    date.getMonth() + 1 === Number(value.slice(5, 7)) &&
    date.getDate() === Number(value.slice(8, 10))
  )
}

export const donationFormSchema = donationFieldsSchema.superRefine((values, context) => {
  if (values.category === 'sealed_food') {
    if (!values.foodExpirationDate) {
      addDateIssue(context, 'foodExpirationDate', 'Sealed food needs an expiration date.')
    } else if (!isValidDateInput(values.foodExpirationDate)) {
      addDateIssue(context, 'foodExpirationDate', 'Enter a valid expiration date.')
    } else {
      const today = new Date()
      const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0'),
      ].join('-')

      if (values.foodExpirationDate <= todayString) {
        addDateIssue(context, 'foodExpirationDate', 'Expiration date must be in the future.')
      }
    }

    if (!values.pickupDeadline) {
      addDateIssue(context, 'pickupDeadline', 'Sealed food needs a pickup deadline.')
    } else {
      const pickupTime = new Date(values.pickupDeadline).getTime()

      if (!Number.isFinite(pickupTime) || pickupTime <= Date.now()) {
        addDateIssue(context, 'pickupDeadline', 'Pickup deadline must be in the future.')
      }
    }
  } else if (values.foodExpirationDate || values.pickupDeadline) {
    addDateIssue(context, 'foodExpirationDate', 'Food dates are only needed for sealed food.')
  }
})

export const createDonationSchema = donationFormSchema.superRefine((values, context) => {
  if (!values.image) {
    context.addIssue({
      code: 'custom',
      path: ['image'],
      message: 'Add one clear photo before publishing.',
    })
  }
})

export type DonationFormValues = z.infer<typeof donationFormSchema>
export type CreateDonationValues = z.infer<typeof createDonationSchema>

export function validateDonationImage(file: File | undefined): string | undefined {
  if (!file) {
    return 'Add one clear photo before publishing.'
  }

  if (!SUPPORTED_IMAGE_TYPES.includes(file.type as (typeof SUPPORTED_IMAGE_TYPES)[number])) {
    return 'Use a JPG, PNG, or WebP image.'
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return 'Image must be 5 MB or smaller.'
  }

  if (file.size === 0) {
    return 'The selected image is empty.'
  }

  return undefined
}
