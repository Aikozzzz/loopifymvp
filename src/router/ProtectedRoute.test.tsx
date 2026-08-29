import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ProtectedRoute } from './ProtectedRoute'

const useAuth = vi.hoisted(() => vi.fn())

vi.mock('@/features/auth/useAuth', () => ({
  useAuth,
}))

describe('ProtectedRoute', () => {
  it('redirects signed-out users to login with the original location', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isLoading: false })

    render(
      <MemoryRouter initialEntries={['/donate?draft=1']}>
        <Routes>
          <Route
            path="/donate"
            element={
              <ProtectedRoute>
                <p>Private donation form</p>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<p>Login page</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Private donation form')).not.toBeInTheDocument()
  })

  it('renders the protected content for an authenticated user', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isLoading: false })

    render(
      <MemoryRouter initialEntries={['/donate']}>
        <Routes>
          <Route
            path="/donate"
            element={
              <ProtectedRoute>
                <p>Private donation form</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Private donation form')).toBeInTheDocument()
  })
})
