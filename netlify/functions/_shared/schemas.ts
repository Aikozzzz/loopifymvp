import { z } from 'zod'

export const DONATION_CATEGORIES = [
  'clothes',
  'books',
  'electronics',
  'furniture',
  'sealed_food',
  'household',
  'other',
] as const

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

export const analyzeDonationRequestSchema = z
  .object({
    imageUrl: z.string().url().max(2048),
  })
  .strict()

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

export const donationSuggestionJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    detectedItem: { type: 'string', minLength: 1, maxLength: 100 },
    suggestedTitle: { type: 'string', minLength: 3, maxLength: 100 },
    suggestedDescription: { type: 'string', minLength: 10, maxLength: 1500 },
    suggestedCategory: { type: 'string', enum: [...DONATION_CATEGORIES] },
    safetyFlags: {
      type: 'array',
      items: { type: 'string', enum: [...DONATION_SAFETY_FLAGS] },
      maxItems: DONATION_SAFETY_FLAGS.length,
    },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
  },
  required: [
    'detectedItem',
    'suggestedTitle',
    'suggestedDescription',
    'suggestedCategory',
    'safetyFlags',
    'confidence',
  ],
} as const
