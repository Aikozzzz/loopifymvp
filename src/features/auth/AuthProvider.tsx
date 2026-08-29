import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import type { Session } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'
import {
  signIn as signInWithPassword,
  signOut as signOutUser,
  signUp as registerUser,
} from '@/features/auth/authService'
import { AuthContext } from '@/features/auth/authContext'
import {
  getProfile,
  updateProfile as saveProfile,
  type UpdateProfileInput,
} from '@/features/profiles/profileService'
import type { Profile } from '@/types/database'

interface AuthState {
  session: Session | null
  user: Session['user'] | null
  profile: Profile | null
  isLoading: boolean
}

const initialState: AuthState = {
  session: null,
  user: null,
  profile: null,
  isLoading: true,
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>(initialState)
  const mountedRef = useRef(true)
  const sessionVersionRef = useRef(0)

  const loadProfile = useCallback(async (nextSession: Session, version: number) => {
    let nextProfile: Profile | null = null

    try {
      nextProfile = await getProfile(nextSession.user.id)
    } catch (error) {
      console.error('Loopify could not load the signed-in profile.', error)
    }

    if (!mountedRef.current || sessionVersionRef.current !== version) {
      return
    }

    setState((currentState) => ({
      ...currentState,
      profile: nextProfile,
      isLoading: false,
    }))
  }, [])

  const applySession = useCallback(
    (nextSession: Session | null) => {
      const version = sessionVersionRef.current + 1
      sessionVersionRef.current = version

      setState({
        session: nextSession,
        user: nextSession?.user ?? null,
        profile: null,
        isLoading: Boolean(nextSession),
      })

      if (nextSession) {
        queueMicrotask(() => {
          void loadProfile(nextSession, version)
        })
      }
    },
    [loadProfile],
  )

  useEffect(() => {
    mountedRef.current = true
    let isActive = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isActive) {
        applySession(nextSession)
      }
    })

    const restoreSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (!isActive) {
        return
      }

      if (error) {
        console.error('Loopify could not restore the saved session.', error)
        setState({
          session: null,
          user: null,
          profile: null,
          isLoading: false,
        })
        return
      }

      applySession(data.session)
    }

    void restoreSession()

    return () => {
      isActive = false
      mountedRef.current = false
      sessionVersionRef.current += 1
      subscription.unsubscribe()
    }
  }, [applySession])

  const userId = state.user?.id

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      return null
    }

    const nextProfile = await getProfile(userId)

    if (mountedRef.current) {
      setState((currentState) =>
        currentState.user?.id === userId
          ? { ...currentState, profile: nextProfile }
          : currentState,
      )
    }

    return nextProfile
  }, [userId])

  const updateProfile = useCallback(
    async (input: UpdateProfileInput) => {
      if (!userId) {
        throw new Error('You must be signed in to update your profile.')
      }

      const nextProfile = await saveProfile(userId, input)

      if (mountedRef.current) {
        setState((currentState) =>
          currentState.user?.id === userId
            ? { ...currentState, profile: nextProfile }
            : currentState,
        )
      }

      return nextProfile
    },
    [userId],
  )

  const signIn = useCallback((input: Parameters<typeof signInWithPassword>[0]) => {
    return signInWithPassword(input)
  }, [])

  const signUp = useCallback((input: Parameters<typeof registerUser>[0]) => {
    return registerUser(input)
  }, [])

  const signOut = useCallback(async () => {
    await signOutUser()
    applySession(null)
  }, [applySession])

  const value = useMemo(
    () => ({
      session: state.session,
      user: state.user,
      profile: state.profile,
      isAuthenticated: Boolean(state.session),
      isLoading: state.isLoading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      updateProfile,
    }),
    [refreshProfile, signIn, signOut, signUp, state, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
