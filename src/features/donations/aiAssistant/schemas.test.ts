import { describe, expect, it } from 'vitest'

import { donationSuggestionSchema } from './schemas'

const validSuggestion = {
  detectedItem: 'Children’s storybooks',
  suggestedTitle: 'Box of children’s storybooks',
  suggestedDescription: 'A clean box of children’s storybooks ready for a new home.',
  suggestedCategory: 'books',
  safetyFlags: [],
  confidence: 0.92,
} as const

describe('donationSuggestionSchema', () => {
  it('accepts the supported structured suggestion shape', () => {
    expect(donationSuggestionSchema.parse(validSuggestion)).toEqual(validSuggestion)
  })

  it('rejects unsupported categories and safety flags', () => {
    expect(
      donationSuggestionSchema.safeParse({
        ...validSuggestion,
        suggestedCategory: 'toys',
      }).success,
    ).toBe(false)

    expect(
      donationSuggestionSchema.safeParse({
        ...validSuggestion,
        safetyFlags: ['confirmed_violation'],
      }).success,
    ).toBe(false)
  })

  it('enforces the existing title and description limits', () => {
    expect(
      donationSuggestionSchema.safeParse({
        ...validSuggestion,
        suggestedTitle: 'x'.repeat(101),
      }).success,
    ).toBe(false)

    expect(
      donationSuggestionSchema.safeParse({
        ...validSuggestion,
        suggestedDescription: 'x'.repeat(1501),
      }).success,
    ).toBe(false)
  })

  it('keeps confidence between zero and one', () => {
    expect(
      donationSuggestionSchema.safeParse({
        ...validSuggestion,
        confidence: 1.1,
      }).success,
    ).toBe(false)

    expect(
      donationSuggestionSchema.safeParse({
        ...validSuggestion,
        confidence: -0.1,
      }).success,
    ).toBe(false)
  })
})
