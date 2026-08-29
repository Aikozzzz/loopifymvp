import { z } from 'zod'

export const reportReasons = [
  'prohibited_item',
  'unsafe_behavior',
  'harassment',
  'spam',
  'other',
] as const

export const reportSchema = z.object({
  reason: z.enum(reportReasons, { message: 'Choose a reason.' }),
  details: z
    .string()
    .trim()
    .max(1000, 'Keep additional details under 1,000 characters.'),
})

export type ReportFormValues = z.infer<typeof reportSchema>
