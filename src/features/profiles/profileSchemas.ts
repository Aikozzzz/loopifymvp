import { z } from 'zod'

export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Use at least 2 characters for your display name.')
    .max(60, 'Display names must be 60 characters or fewer.'),
  township: z
    .string()
    .trim()
    .max(80, 'Townships must be 80 characters or fewer.')
    .refine((value) => value.length === 0 || value.length >= 2, {
      message: 'Use at least 2 characters for a township.',
    }),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
