import { AppRouter } from '@/router/AppRouter'
import { AuthProvider } from '@/features/auth/AuthProvider'

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
