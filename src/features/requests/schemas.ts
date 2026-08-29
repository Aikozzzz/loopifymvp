import { z } from 'zod'

export const donationRequestSchema = z.object({
  requestMessage: z
    .string()
    .trim()
    .min(10, 'Tell the donor a little more about why this item would help.')
    .max(500, 'Your request must be 500 characters or fewer.'),
})

export const donorReplySchema = z.object({
  donorReply: z
    .string()
    .trim()
    .max(500, 'Pickup notes must be 500 characters or fewer.'),
})

export type DonationRequestValues = z.infer<typeof donationRequestSchema>
export type DonorReplyValues = z.infer<typeof donorReplySchema>
