import { describe, expect, it } from 'vitest'
import { getSafeRedirectPath } from './authNavigation'

describe('safe auth redirects', () => {
  it('preserves an internal path', () => {
    expect(getSafeRedirectPath({ from: '/donations/item-123?request=1' })).toBe(
      '/donations/item-123?request=1',
    )
  })

  it('rejects external and malformed paths', () => {
    expect(getSafeRedirectPath({ from: '//example.com' })).toBe('/feed')
    expect(getSafeRedirectPath({ from: 'https://example.com' })).toBe('/feed')
    expect(getSafeRedirectPath(null)).toBe('/feed')
  })
})
