import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address.')
    .email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

export const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Use at least 2 characters for your display name.')
    .max(60, 'Display names must be 60 characters or fewer.'),
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address.')
    .email('Enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Use at least 8 characters for your password.')
    .max(72, 'Passwords must be 72 characters or fewer.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
