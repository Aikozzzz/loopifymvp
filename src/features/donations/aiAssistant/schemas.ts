import { z } from 'zod'

import { DONATION_CATEGORIES } from '@/features/donations/constants'

export const DONATION_SAFETY_FLAGS = [
  'possible_medicine',
  'possible_weapon',
  'possible_alcohol',
  'possible_personal_information',
  'possible_unsafe_food',
  'inappropriate_content',
  'unclear_image',
  'other',
] as const

export const donationSuggestionSchema = z
  .object({
    detectedItem: z.string().trim().min(1).max(100),
    suggestedTitle: z.string().trim().min(3).max(100),
    suggestedDescription: z.string().trim().min(10).max(1500),
    suggestedCategory: z.enum(DONATION_CATEGORIES),
    safetyFlags: z.array(z.enum(DONATION_SAFETY_FLAGS)).max(DONATION_SAFETY_FLAGS.length),
    confidence: z.number().min(0).max(1),
  })
  .strict()

export type DonationSuggestion = z.infer<typeof donationSuggestionSchema>

export const DONATION_SAFETY_FLAG_LABELS: Record<(typeof DONATION_SAFETY_FLAGS)[number], string> = {
  possible_medicine: 'Possible medicine',
  possible_weapon: 'Possible weapon',
  possible_alcohol: 'Possible alcohol',
  possible_personal_information: 'Possible personal information',
  possible_unsafe_food: 'Possible unsafe food',
  inappropriate_content: 'Possible inappropriate content',
  unclear_image: 'Image may be unclear',
  other: 'Other safety concern',
}
