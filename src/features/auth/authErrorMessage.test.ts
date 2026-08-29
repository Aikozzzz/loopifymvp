import { describe, expect, it } from 'vitest'

import { getAuthErrorMessage, isAuthRateLimitError } from './authErrorMessage'

describe('auth error messages', () => {
  it('recognizes Supabase email and request rate limits', () => {
    expect(isAuthRateLimitError({ status: 429 })).toBe(true)
    expect(isAuthRateLimitError({ code: 'over_email_send_rate_limit' })).toBe(true)
    expect(isAuthRateLimitError(new Error('rate limit exceeded'))).toBe(true)
  })

  it('explains that production signup needs a real SMTP provider', () => {
    expect(
      getAuthErrorMessage(
        { status: 429, code: 'over_email_send_rate_limit' },
        'fallback',
      ),
    ).toBe(
      'Signup emails are temporarily rate-limited. Wait before retrying; production deployments should use custom SMTP.',
    )
  })

  it('does not classify unrelated auth errors as rate limits', () => {
    expect(isAuthRateLimitError(new Error('Invalid login credentials'))).toBe(false)
  })
})
