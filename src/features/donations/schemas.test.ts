import { describe, expect, it } from 'vitest'
import {
  createDonationSchema,
  donationFormSchema,
  validateDonationImage,
} from './schemas'

function dateOnlyFromNow(days: number): string {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  return date.toISOString().slice(0, 10)
}

function dateTimeFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
}

function createImage(type = 'image/png', contents = 'image'): File {
  return new File([contents], 'donation.png', { type })
}

const validDonation = {
  title: 'A useful desk lamp',
  description: 'A working lamp ready for a new home in the neighborhood.',
  category: 'books' as const,
  condition: 'good' as const,
  township: 'Bahan',
  image: createImage(),
}

describe('donation schemas', () => {
  it('accepts a normal donation without food-only dates', () => {
    expect(donationFormSchema.parse(validDonation)).toMatchObject({
      title: validDonation.title,
      category: 'books',
    })
  })

  it('requires future dates for sealed food', () => {
    const result = donationFormSchema.safeParse({
      ...validDonation,
      category: 'sealed_food',
      foodExpirationDate: dateOnlyFromNow(7),
      pickupDeadline: dateTimeFromNow(24),
    })

    expect(result.success).toBe(true)
  })

  it('reports missing sealed-food dates', () => {
    const result = donationFormSchema.safeParse({
      ...validDonation,
      category: 'sealed_food',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining(['foodExpirationDate', 'pickupDeadline']),
      )
    }
  })

  it('rejects food dates on non-food donations and invalid images', () => {
    const result = donationFormSchema.safeParse({
      ...validDonation,
      foodExpirationDate: dateOnlyFromNow(7),
    })

    expect(result.success).toBe(false)
    expect(validateDonationImage(createImage('image/gif'))).toBe(
      'Use a JPG, PNG, or WebP image.',
    )
    expect(validateDonationImage(createImage('image/png', ''))).toBe(
      'The selected image is empty.',
    )
  })

  it('requires an image when publishing a donation', () => {
    const result = createDonationSchema.safeParse({
      ...validDonation,
      image: undefined,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['image'],
            message: 'Add one clear photo before publishing.',
          }),
        ]),
      )
    }
  })
})
