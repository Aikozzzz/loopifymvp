import type { HandlerEvent } from '@netlify/functions'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  class MockAuthFailure extends Error {
    constructor(
      readonly code: 'auth_required' | 'server_misconfigured',
      message: string,
    ) {
      super(message)
    }
  }

  class MockAIClientError extends Error {
    constructor(
      readonly code: 'ai_unavailable' | 'invalid_ai_response',
      message: string,
    ) {
      super(message)
    }
  }

  return {
    getAuthenticatedUser: vi.fn(),
    getServerSupabaseUrl: vi.fn(),
    analyzeDonationImage: vi.fn(),
    MockAuthFailure,
    MockAIClientError,
  }
})

const {
  getAuthenticatedUser,
  getServerSupabaseUrl,
  analyzeDonationImage,
  MockAuthFailure,
  MockAIClientError,
} = mocks

vi.mock('../../../../netlify/functions/_shared/auth', () => ({
  AuthFailure: mocks.MockAuthFailure,
  getAuthenticatedUser: mocks.getAuthenticatedUser,
  getServerSupabaseUrl: mocks.getServerSupabaseUrl,
}))

vi.mock('../../../../netlify/functions/_shared/ai-client', () => ({
  AIClientError: mocks.MockAIClientError,
  analyzeDonationImage: mocks.analyzeDonationImage,
}))

import { handler, isOwnedStorageImageUrl } from '../../../../netlify/functions/analyze-donation'

const validSuggestion = {
  detectedItem: 'Children’s storybooks',
  suggestedTitle: 'Box of children’s storybooks',
  suggestedDescription: 'A clean box of children’s storybooks ready for a new home.',
  suggestedCategory: 'books',
  safetyFlags: [],
  confidence: 0.92,
}

function createEvent(overrides: Partial<HandlerEvent> = {}): HandlerEvent {
  return {
    rawUrl: 'https://loopify.example/.netlify/functions/analyze-donation',
    rawQuery: '',
    path: '/.netlify/functions/analyze-donation',
    httpMethod: 'POST',
    headers: { authorization: 'Bearer test-token' },
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    body: JSON.stringify({
      imageUrl: 'https://demo.supabase.co/storage/v1/object/public/item-images/user-1/storybooks.png',
    }),
    isBase64Encoded: false,
    ...overrides,
  }
}

async function readResponse(response: Awaited<ReturnType<typeof handler>>) {
  return {
    statusCode: response?.statusCode,
    body: response?.body ? JSON.parse(response.body) : null,
  }
}

describe('analyze-donation function', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getServerSupabaseUrl.mockReturnValue('https://demo.supabase.co')
    getAuthenticatedUser.mockResolvedValue({ id: 'user-1' })
    analyzeDonationImage.mockResolvedValue(validSuggestion)
  })

  it('rejects unauthenticated requests', async () => {
    getAuthenticatedUser.mockRejectedValue(new MockAuthFailure('auth_required', 'not signed in'))

    const response = await readResponse(await handler(createEvent(), {} as never))

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      error: {
        code: 'auth_required',
        message: 'Please sign in to use the donation assistant.',
      },
    })
    expect(analyzeDonationImage).not.toHaveBeenCalled()
  })

  it('rejects malformed image URLs', async () => {
    const response = await readResponse(
      await handler(
        createEvent({
          body: JSON.stringify({ imageUrl: 'not-a-url' }),
        }),
        {} as never,
      ),
    )

    expect(response.statusCode).toBe(400)
    expect(response.body.error.code).toBe('invalid_request')
    expect(analyzeDonationImage).not.toHaveBeenCalled()
  })

  it('rejects arbitrary external image URLs', async () => {
    const response = await readResponse(
      await handler(
        createEvent({
          body: JSON.stringify({ imageUrl: 'https://external.example/image.png' }),
        }),
        {} as never,
      ),
    )

    expect(response.statusCode).toBe(403)
    expect(response.body.error.code).toBe('image_not_owned')
    expect(analyzeDonationImage).not.toHaveBeenCalled()
  })

  it('rejects images owned by another user', async () => {
    const response = await readResponse(
      await handler(
        createEvent({
          body: JSON.stringify({
            imageUrl: 'https://demo.supabase.co/storage/v1/object/public/item-images/another-user/image.png',
          }),
        }),
        {} as never,
      ),
    )

    expect(response.statusCode).toBe(403)
    expect(response.body.error.code).toBe('image_not_owned')
    expect(analyzeDonationImage).not.toHaveBeenCalled()
  })

  it('rejects invalid AI responses with a controlled error', async () => {
    analyzeDonationImage.mockRejectedValue(
      new MockAIClientError('invalid_ai_response', 'invalid response'),
    )

    const response = await readResponse(await handler(createEvent(), {} as never))

    expect(response.statusCode).toBe(502)
    expect(response.body.error.code).toBe('invalid_ai_response')
    expect(response.body.error.message).toBe(
      'The AI assistant returned an invalid response. Please try again.',
    )
  })

  it('returns a validated suggestion for an owned image', async () => {
    const response = await readResponse(await handler(createEvent(), {} as never))

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ suggestion: validSuggestion })
    expect(analyzeDonationImage).toHaveBeenCalledWith(
      'https://demo.supabase.co/storage/v1/object/public/item-images/user-1/storybooks.png',
    )
  })

  it('accepts only POST requests', async () => {
    const response = await readResponse(
      await handler(createEvent({ httpMethod: 'GET' }), {} as never),
    )

    expect(response.statusCode).toBe(405)
    expect(response.body.error.code).toBe('method_not_allowed')
  })
})

describe('isOwnedStorageImageUrl', () => {
  it('accepts only the authenticated user’s item image path', () => {
    expect(
      isOwnedStorageImageUrl(
        'https://demo.supabase.co/storage/v1/object/public/item-images/user-1/image.png',
        'user-1',
        'https://demo.supabase.co',
      ),
    ).toBe(true)

    expect(
      isOwnedStorageImageUrl(
        'https://images.example/image.png',
        'user-1',
        'https://demo.supabase.co',
      ),
    ).toBe(false)
  })
})
