import { describe, expect, it } from 'vitest'
import { donationRequestSchema, donorReplySchema } from './schemas'

describe('request schemas', () => {
  it('trims a valid request message', () => {
    expect(
      donationRequestSchema.parse({
        requestMessage: '  This would help my family study.  ',
      }),
    ).toEqual({ requestMessage: 'This would help my family study.' })
  })

  it('rejects messages that are too short', () => {
    const result = donationRequestSchema.safeParse({ requestMessage: 'Thanks' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Tell the donor')
    }
  })

  it('allows an empty donor reply but limits long pickup notes', () => {
    expect(donorReplySchema.parse({ donorReply: '' })).toEqual({ donorReply: '' })

    const result = donorReplySchema.safeParse({ donorReply: 'x'.repeat(501) })
    expect(result.success).toBe(false)
  })
})
