import type { Session, User } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

export interface SignInInput {
  email: string
  password: string
}

export interface SignUpInput extends SignInInput {
  displayName: string
}

export interface AuthResult {
  user: User | null
  session: Session | null
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function signIn(input: SignInInput): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(input.email),
    password: input.password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email: normalizeEmail(input.email),
    password: input.password,
    options: {
      data: {
        display_name: input.displayName.trim(),
      },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}
