import { LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/common/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import { AuthLoadingState } from '@/features/auth/AuthLoadingState'
import { getAuthErrorMessage } from '@/features/auth/authErrorMessage'
import { getSafeRedirectPath } from '@/features/auth/authNavigation'
import { loginSchema, type LoginFormValues } from '@/features/auth/authSchemas'
import { useAuth } from '@/features/auth/useAuth'

export function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, signIn } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const redirectPath = getSafeRedirectPath(location.state)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  if (isLoading) {
    return <AuthLoadingState message="Checking your Loopify session…" />
  }

  if (isAuthenticated && !isSubmitting) {
    return <Navigate to="/feed" replace />
  }

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null)

    try {
      await signIn(values)
      toast.success('Welcome back to Loopify.')
      navigate(redirectPath, { replace: true })
    } catch (error) {
      const message = getAuthErrorMessage(
        error,
        'We could not sign you in. Please check your details and try again.',
      )
      setFormError(message)
      toast.error(message)
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Pick up where you left off."
      description="Sign in to keep your donations, requests, and community plans in one place."
      footer={
        <>
          New to Loopify?{' '}
          <Link className="font-bold text-ink underline decoration-line underline-offset-4 hover:decoration-ink" to="/register">
            Create an account
          </Link>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {formError ? (
          <p className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm leading-relaxed text-danger" role="alert">
            {formError}
          </p>
        ) : null}
        <Field label="Email address" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            icon={<Mail className="size-4" />}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message} required>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            icon={<LockKeyhole className="size-4" />}
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
        </Field>
        <div className="flex items-center justify-between gap-4 text-xs">
          <p className="font-semibold text-muted">Your session will be restored on this device.</p>
          <button className="shrink-0 font-bold text-ink underline decoration-line underline-offset-4 hover:decoration-ink" type="button" onClick={() => toast.info('Password reset is coming soon.')}>
            Forgot password?
          </button>
        </div>
        <Button className="w-full" size="lg" type="submit" loading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
