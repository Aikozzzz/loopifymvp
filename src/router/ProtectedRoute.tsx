import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthLoadingState } from '@/features/auth/AuthLoadingState'
import { useAuth } from '@/features/auth/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <AuthLoadingState />
  }

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}${location.hash}`

    return <Navigate to="/login" replace state={{ from }} />
  }

  return children
}
