import { createContext } from 'react'
import type { AuthResult, SignInInput, SignUpInput } from '@/features/auth/authService'
import type { UpdateProfileInput } from '@/features/profiles/profileService'
import type { Profile } from '@/types/database'
import type { Session, User } from '@supabase/supabase-js'

export interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (input: SignInInput) => Promise<AuthResult>
  signUp: (input: SignUpInput) => Promise<AuthResult>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<Profile | null>
  updateProfile: (input: UpdateProfileInput) => Promise<Profile>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
