import { createClient, type User } from '@supabase/supabase-js'
import type { HandlerEvent } from '@netlify/functions'

export type AuthFailureCode = 'auth_required' | 'server_misconfigured'

export class AuthFailure extends Error {
  readonly code: AuthFailureCode

  constructor(code: AuthFailureCode, message: string) {
    super(message)
    this.name = 'AuthFailure'
    this.code = code
  }
}

function requiredServerEnv(name: 'SUPABASE_URL' | 'SUPABASE_PUBLISHABLE_KEY'): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new AuthFailure('server_misconfigured', 'The donation assistant is not configured.')
  }

  return value
}

function getAuthorizationHeader(event: HandlerEvent): string | undefined {
  const header = Object.entries(event.headers).find(([name]) => name.toLowerCase() === 'authorization')
  return header?.[1]?.trim()
}

function getBearerToken(event: HandlerEvent): string {
  const authorization = getAuthorizationHeader(event)

  if (!authorization || !/^Bearer\s+\S+$/i.test(authorization)) {
    throw new AuthFailure('auth_required', 'Please sign in to use the donation assistant.')
  }

  return authorization.replace(/^Bearer\s+/i, '').trim()
}

export function getServerSupabaseUrl(): string {
  return requiredServerEnv('SUPABASE_URL').replace(/\/$/, '')
}

export async function getAuthenticatedUser(event: HandlerEvent): Promise<User> {
  const token = getBearerToken(event)
  const supabaseUrl = getServerSupabaseUrl()
  const publishableKey = requiredServerEnv('SUPABASE_PUBLISHABLE_KEY')
  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    throw new AuthFailure('auth_required', 'Please sign in to use the donation assistant.')
  }

  return data.user
}
