import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { analyzeDonationImage, AIClientError } from '../../../../netlify/functions/_shared/ai-client'

const originalApiKey = process.env.OPENAI_API_KEY
const originalModel = process.env.OPENAI_MODEL

describe('server AI client', () => {
  beforeEach(() => {
    delete process.env.OPENAI_API_KEY
    delete process.env.OPENAI_MODEL
  })

  afterEach(() => {
    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY
    } else {
      process.env.OPENAI_API_KEY = originalApiKey
    }

    if (originalModel === undefined) {
      delete process.env.OPENAI_MODEL
    } else {
      process.env.OPENAI_MODEL = originalModel
    }
  })

  it('fails closed when the AI assistant is not configured', async () => {
    await expect(
      analyzeDonationImage(
        'https://demo.supabase.co/storage/v1/object/public/item-images/user-1/image.png',
      ),
    ).rejects.toEqual(
      new AIClientError(
        'ai_unavailable',
        'The AI assistant is unavailable right now. You can still complete the listing manually.',
      ),
    )
  })
})
