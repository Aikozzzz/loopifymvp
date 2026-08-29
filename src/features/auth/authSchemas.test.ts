import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema } from './authSchemas'

describe('auth schemas', () => {
  it('normalizes valid registration fields', () => {
    expect(
      registerSchema.parse({
        displayName: '  May  ',
        email: '  MAY@example.com  ',
        password: 'safe-password',
      }),
    ).toEqual({
      displayName: 'May',
      email: 'MAY@example.com',
      password: 'safe-password',
    })
  })

  it('rejects weak registration passwords and invalid email addresses', () => {
    const result = registerSchema.safeParse({
      displayName: 'M',
      email: 'not-an-email',
      password: 'short',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining(['displayName', 'email', 'password']),
      )
    }
  })

  it('requires both login fields', () => {
    expect(loginSchema.safeParse({ email: '', password: '' }).success).toBe(false)
  })
})
