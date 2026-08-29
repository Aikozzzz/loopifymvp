import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

export interface UpdateProfileInput {
  display_name: string
  township: string | null
}

const profileColumns = 'id, display_name, township, avatar_url, created_at, updated_at'

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(profileColumns)
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(input)
    .eq('id', userId)
    .select(profileColumns)
    .single()

  if (error) {
    throw error
  }

  return data
}
