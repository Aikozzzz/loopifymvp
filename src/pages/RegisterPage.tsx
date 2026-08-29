import { LockKeyhole, Mail, MailCheck, UserRound } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/common/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import { AuthLoadingState } from '@/features/auth/AuthLoadingState'
import { getAuthErrorMessage, isAuthRateLimitError } from '@/features/auth/authErrorMessage'
import { getSafeRedirectPath } from '@/features/auth/authNavigation'
import { registerSchema, type RegisterFormValues } from '@/features/auth/authSchemas'
import { useAuth } from '@/features/auth/useAuth'

export function RegisterPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, signUp } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null)
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0)
  const redirectPath = getSafeRedirectPath(location.state)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (rateLimitSeconds <= 0) {
      return
    }

    const timer = window.setTimeout(() => {
      setRateLimitSeconds((currentSeconds) => Math.max(0, currentSeconds - 1))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [rateLimitSeconds])

  if (isLoading) {
    return <AuthLoadingState message="Checking your Loopify session…" />
  }

  if (isAuthenticated && !isSubmitting) {
    return <Navigate to="/feed" replace />
  }

  const onSubmit = async (values: RegisterFormValues) => {
    if (rateLimitSeconds > 0) {
      return
    }

    setFormError(null)

    try {
      const result = await signUp(values)

      if (result.session) {
        toast.success('Your Loopify account is ready.')
        navigate(redirectPath, { replace: true })
        return
      }

      setConfirmationEmail(values.email.trim())
      toast.success('Check your inbox to confirm your email.')
    } catch (error) {
      if (isAuthRateLimitError(error)) {
        setRateLimitSeconds(60)
      }

      const message = getAuthErrorMessage(
        error,
        'We could not create your account. Please try again.',
      )
      setFormError(message)
      toast.error(message)
    }
  }

  return (
    <AuthLayout
      eyebrow="Join the loop"
      title="Make room for something good."
      description="Create a free account to share useful items, request donations, and join local events."
      footer={
        <>
          Already have an account?{' '}
          <Link className="font-bold text-ink underline decoration-line underline-offset-4 hover:decoration-ink" to="/login">
            Sign in
          </Link>
        </>
      }
    >
      {confirmationEmail ? (
        <div className="rounded-2xl border border-line bg-sage/60 p-6 text-center" role="status">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <MailCheck className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-xl font-extrabold tracking-[-0.03em] text-ink">Check your inbox</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            We sent a confirmation link to
            <span className="mt-1 block break-all font-bold text-ink">{confirmationEmail}</span>
          </p>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Confirm your email to activate your Loopify account, then come back to sign in.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link className="font-bold text-ink underline decoration-line underline-offset-4 hover:decoration-ink" to="/login">
              Go to sign in
            </Link>
            <Button variant="outline" type="button" onClick={() => setConfirmationEmail(null)}>
              Use a different email
            </Button>
          </div>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          {formError ? (
            <p className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm leading-relaxed text-danger" role="alert">
              {formError}
            </p>
          ) : null}
          <Field
            label="Display name"
            htmlFor="display-name"
            hint="Use a name your neighbors will recognize."
            error={errors.displayName?.message}
            required
          >
            <Input
              id="display-name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              icon={<UserRound className="size-4" />}
              aria-invalid={errors.displayName ? 'true' : 'false'}
              aria-describedby={errors.displayName ? 'display-name-error' : undefined}
              {...register('displayName')}
            />
          </Field>
          <Field label="Email address" htmlFor="register-email" error={errors.email?.message} required>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              icon={<Mail className="size-4" />}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'register-email-error' : undefined}
              {...register('email')}
            />
          </Field>
          <Field
            label="Password"
            htmlFor="register-password"
            hint="Use at least 8 characters."
            error={errors.password?.message}
            required
          >
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              icon={<LockKeyhole className="size-4" />}
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'register-password-error' : undefined}
              {...register('password')}
            />
          </Field>
          <Button
            className="w-full"
            disabled={rateLimitSeconds > 0}
            size="lg"
            type="submit"
            loading={isSubmitting}
          >
            {rateLimitSeconds > 0 ? `Try again in ${rateLimitSeconds}s` : 'Create account'}
          </Button>
          <p className="text-center text-xs leading-relaxed text-muted">
            By creating an account, you agree to keep exchanges respectful and safe.
          </p>
        </form>
      )}
    </AuthLayout>
  )
}
