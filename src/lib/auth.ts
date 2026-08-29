import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export const AUTH_REQUIRED_MESSAGE = 'Please sign in to continue.'

export class AuthRequiredError extends Error {
  constructor() {
    super(AUTH_REQUIRED_MESSAGE)
    this.name = 'AuthRequiredError'
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    return null
  }

  return session?.user ?? null
}

export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    throw new AuthRequiredError()
  }

  return user
}
